import {readFile} from 'node:fs/promises';
import {relative, extname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {dataRoot, dataPath, caseFile} from './data-paths.mjs';
import {loadCase, digest} from './contract.mjs';
import {measureLayout} from './layout-measure.mjs';

export async function checkLayout(id) {
  const {dir, meta, slides} = loadCase(id);
  if (!meta.outputs.visualHtml) throw Error('case.outputs.visualHtml is required');
  const htmlPath = caseFile(dir, meta.outputs.visualHtml);
  const source = await readFile(htmlPath);
  const {chromium} = await import('playwright');
  const server = createServer(async (req, res) => {
    try {
      const path = dataPath('.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
      const bytes = await readFile(path);
      res.setHeader('Content-Type', ({'.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.css': 'text/css', '.js': 'text/javascript'})[extname(path)] || 'application/octet-stream');
      res.end(bytes);
    } catch {res.statusCode = 404; res.end('Not found');}
  });
  await new Promise((ok, fail) => {server.once('error', fail); server.listen(0, '127.0.0.1', ok);});
  let browser;
  try {
    browser = await chromium.launch({headless: true, ...(process.env.BROWSER_EXECUTABLE ? {executablePath: process.env.BROWSER_EXECUTABLE} : {})});
    const page = await browser.newPage({viewport: {width: meta.format.width, height: meta.format.height}, deviceScaleFactor: 1});
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('response', r => {if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);});
    page.on('requestfailed', r => errors.push(`${r.failure()?.errorText} ${r.url()}`));
    const path = relative(dataRoot, htmlPath).split('/').map(encodeURIComponent).join('/');
    await page.goto(`http://127.0.0.1:${server.address().port}/${path}`, {waitUntil: 'networkidle'});
    await page.waitForFunction(() => document.fonts.status === 'loaded');
    await page.addStyleTag({content: '.progress {display:none !important;}'});
    const navigation = page.locator('#progress, #progressBar').first();
    if (!await navigation.count()) throw Error('Visual HTML needs #progress or #progressBar navigation');
    if (await page.locator('.slide').count() !== slides.length) throw Error('HTML slide count differs from slides.json');
    const pages = [];
    for (const [index, slide] of slides.entries()) {
      await navigation.evaluate((e, n) => {e.value = String(n); e.dispatchEvent(new Event('input'));}, index + 1);
      await page.waitForFunction(index => {
        const slides = [...document.querySelectorAll('.slide')];
        return slides[index]?.classList.contains('active') && document.querySelectorAll('.slide.active').length === 1;
      }, index, {timeout: 3000});
      await page.evaluate(async () => {
        const ready = Promise.all([document.fonts.ready, ...[...document.images].map(im => {im.loading = 'eager'; return im.decode();})]);
        let timer;
        try {await Promise.race([ready, new Promise((_, reject) => {timer = setTimeout(() => reject(Error('Font/image readiness timed out')), 10000);})]);}
        finally {clearTimeout(timer);}
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        // Measure the settled slide, not an intermediate opacity/position transition.
        // Long or infinite animation remains explicitly outside complete coverage.
        const slide = document.querySelector('.slide.active');
        const frame = slide.closest('.short-frame') || slide;
        const animations = frame.getAnimations({subtree: true}).filter(a =>
          Number.isFinite(a.effect?.getComputedTiming().endTime));
        let settleTimer;
        try {await Promise.race([Promise.all(animations.map(a => a.finished.catch(() => {}))), new Promise(r => {settleTimer = setTimeout(r, 1500);})]);}
        finally {clearTimeout(settleTimer);}
        await new Promise(r => requestAnimationFrame(r));
      });
      const result = await page.evaluate(measureLayout, {textInImage: !!slide.visual?.textInImage});
      if (Math.abs(result.frame.width - meta.format.width) > 2 || Math.abs(result.frame.height - meta.format.height) > 2) throw Error(`Page ${slide.page}: rendered frame differs from case.format`);
      pages.push({page: slide.page, ...result});
    }
    if (errors.length) throw Error([...new Set(errors)].join('\n'));
    return {case: id, checkedAt: new Date().toISOString(), html: meta.outputs.visualHtml, htmlSha256: digest(source),
      browser: browser.version(), viewport: {width: meta.format.width, height: meta.format.height}, tolerancePx: 2,
      summary: {pages: pages.length, errors: pages.flatMap(p => p.issues).filter(i => i.severity === 'error').length,
        warnings: pages.flatMap(p => p.issues).filter(i => i.severity === 'warning').length,
        pagesWithLimitations: pages.filter(p => p.limitations.length).length}, pages,
      acceptance: 'Geometry only; image interiors, visual quality, source-text agreement and video animation require separate review.'};
  } finally {
    try {await browser?.close();} finally {await new Promise(r => server.close(r));}
  }
}

export function formatLayoutReport(report) {
  const {summary: s} = report;
  const lines = [`${report.case}: ${s.pages} pages; ${s.errors} geometry errors; ${s.warnings} possible overlaps; ${s.pagesWithLimitations} pages with limitations.`];
  const findings = report.pages.flatMap(p => p.issues.map(i => `Page ${p.page}: ${i.code} ${i.element}${i.other ? ` / ${i.other}` : ''}${i.container ? ` in ${i.container}` : ''} ${JSON.stringify(i.pixels)}px`));
  lines.push(...findings.slice(0, 20));
  if (findings.length > 20) lines.push(`${findings.length - 20} more findings; use --json for all details.`);
  const limitations = new Map();
  for (const p of report.pages) for (const reason of p.limitations) {
    if (!limitations.has(reason)) limitations.set(reason, []);
    limitations.get(reason).push(p.page);
  }
  for (const [reason, pages] of limitations) lines.push(`Not fully checked: ${reason} (pages ${pages.join(', ')}).`);
  lines.push(report.acceptance);
  return lines.join('\n');
}

export async function layoutCommand(args) {
  const [id, ...flags] = args;
  if (!id || flags.some(f => f !== '--json') || flags.length > 1) throw Error('Usage: check-layout <case-id> [--json]');
  const report = await checkLayout(id);
  console.log(flags.includes('--json') ? JSON.stringify(report, null, 2) : formatLayoutReport(report));
  // Warnings and limitations are advisory, not visual acceptance. 1 means execution failed.
  return report.summary.errors ? 2 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {process.exitCode = await layoutCommand(process.argv.slice(2));}
  catch (error) {console.error(error.message); process.exitCode = 1;}
}
