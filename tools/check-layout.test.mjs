import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {chromium} from 'playwright';
import {measureLayout} from './layout-measure.mjs';

const shell = promisify(execFile);
const fixture = body => `<style>*{box-sizing:border-box}body{margin:0;font:20px Arial}.short-frame{position:relative;width:800px;height:600px;overflow:hidden}.slide{position:absolute;inset:0;visibility:hidden}.slide.active{visibility:visible}p{margin:0} .main-text{position:absolute}</style><div class="short-frame"><section class="slide active">${body}</section></div>`;

test('rendered geometry distinguishes overflow, clipping, collisions and unmeasured content', async t => {
  const browser = await chromium.launch({headless: true, ...(process.env.BROWSER_EXECUTABLE ? {executablePath: process.env.BROWSER_EXECUTABLE} : {})});
  try {
    const page = await browser.newPage({viewport: {width: 800, height: 600}});
    const inspect = async html => {await page.setContent(fixture(html)); return page.evaluate(measureLayout);};
    await t.test('inline runs and multiline text do not collide with themselves', async () => {
      const report = await inspect('<p style="width:160px">First <strong>bold</strong> line<br>Second line</p><p style="margin-top:40px">Other text</p>');
      assert.equal(report.measured.textBlocks, 2);
      assert.deepEqual(report.issues, []);
    });
    await t.test('detects text beyond the frame, including span content', async () => {
      const report = await inspect('<div id="title" class="main-text" style="left:790px;top:60px;white-space:nowrap"><span>Overflowing title</span></div>');
      const issue = report.issues.find(x => x.code === 'outside-frame');
      assert.equal(issue.element, '#title');
      assert.ok(issue.pixels.right > 20);
    });
    await t.test('detects text clipped inside a container while still inside the frame', async () => {
      const report = await inspect('<div id="clip" style="position:absolute;left:50px;top:50px;width:80px;height:24px;overflow:hidden"><p id="body" style="white-space:nowrap">A long line clipped by the container</p></div>');
      assert.equal(report.issues.some(x => x.code === 'outside-frame'), false);
      assert.ok(report.issues.some(x => x.code === 'clipped-content' && x.container === '#clip' && x.pixels.right > 50));
    });
    await t.test('reports non-parent overlaps but honors intentional overlays and decorations', async () => {
      const report = await inspect('<p id="a" class="main-text" style="left:40px;top:60px">Collision</p><p id="b" class="main-text" style="left:40px;top:60px">Collision</p><p data-layout-allow-overlap class="main-text" style="left:40px;top:60px">Allowed</p><p data-layout-role="decoration" style="position:absolute;left:900px">Decoration</p>');
      assert.equal(report.issues.length, 1);
      assert.equal(report.issues[0].code, 'possible-overlap');
      assert.equal(report.issues[0].severity, 'warning');
    });
    await t.test('tight line metrics alone do not produce collisions between separate blocks', async () => {
      const report = await inspect('<div style="padding-top:40px"><p style="font-size:100px;line-height:80px">Large</p><p style="font-size:30px;line-height:30px;margin-top:2px">Caption</p></div>');
      assert.deepEqual(report.issues, []);
    });
    await t.test('explicit content roles measure non-text objects', async () => {
      const report = await inspect('<div id="shape" data-layout-role="content" style="position:absolute;left:780px;top:60px;width:60px;height:60px;background:red"></div>');
      assert.equal(report.measured.annotatedBlocks, 1);
      assert.ok(report.issues.some(i => i.code === 'outside-frame' && i.element === '#shape' && i.pixels.right === 40));
    });
    await t.test('excludes hidden pages and accessible text; flags baked-in text', async () => {
      await page.setContent(fixture('<div class="content" style="clip-path:inset(50%);width:1px;height:1px;overflow:hidden">Hidden source text</div>').replace('slide active', 'slide active text-in-image').replace('</section>', '</section><section class="slide"><p style="position:absolute;left:1000px">Inactive</p></section>'));
      const report = await page.evaluate(measureLayout, {textInImage: true});
      assert.deepEqual(report.issues, []);
      assert.equal(report.measured.textBlocks, 0);
      assert.ok(report.limitations.includes('text-in-image'));
      assert.ok(report.limitations.includes('no-visible-dom-text'));
    });
    await t.test('includes global brand collisions but allows a full-slide illustration', async () => {
      const art = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
      await page.setContent(fixture(`<img class="art" src="${art}" style="position:absolute;width:100%;height:100%"><p id="heading">Overlapping brand</p>`).replace('</section>', '</section><div class="brand" style="position:absolute;top:0;left:0">Brand</div>'));
      const report = await page.evaluate(measureLayout);
      assert.equal(report.issues.filter(x => x.code === 'possible-overlap').length, 1);
      assert.ok(report.limitations.includes('image-interiors'));
    });
    await t.test('flags canvas, complex clipping and running animations as limited coverage', async () => {
      const report = await inspect('<style>@keyframes drift{to{transform:translateX(10px)}}</style><canvas></canvas><p style="background-image:linear-gradient(red,blue);clip-path:circle(50%);animation:drift 10s infinite">Animated</p>');
      for (const limitation of ['canvas-svg-or-iframe-interiors', 'complex-clips-or-masks', 'active-animation', 'css-backgrounds-or-pseudo-elements']) assert.ok(report.limitations.includes(limitation), limitation);
    });
  } finally {await browser.close();}
});

test('CLI checks every page over HTTP, preserves files, returns errors and rejects broken inputs', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'layout 檢查 '));
  const dir = join(temp, 'cases/example');
  const cli = fileURLToPath(new URL('./presentation.mjs', import.meta.url));
  try {
    await mkdir(join(dir, 'content'), {recursive: true});
    await mkdir(join(dir, 'dist'));
    const meta = {format: {width: 800, height: 600, fps: 30}, timing: {voiceOffsetFrames: 0, tailFrames: 0, backgroundGapSeconds: 0}, outputs: {visualHtml: 'dist/deck.html'}};
    const slides = [{page: 3}, {page: 8, visual: {textInImage: true}}];
    const html = fixture('<p style="position:absolute;left:790px;white-space:nowrap">Too far</p>').replace('</section>', '</section><section class="slide text-in-image"><div class="content" style="clip-path:inset(50%)">Baked text</div></section><input id="progress" class="progress" type="range" min="1" max="2" value="1">') + '<style>.slide{transition:opacity .1s;opacity:0}.slide.active{opacity:1}</style><script>progress.oninput=()=>document.querySelectorAll(".slide").forEach((s,i)=>s.classList.toggle("active",i===Number(progress.value)-1))</script>';
    const files = new Map([['case.json', JSON.stringify(meta)], ['content/slides.json', JSON.stringify(slides)], ['dist/deck.html', html]]);
    for (const [name, data] of files) await writeFile(join(dir, name), data);
    const run = async () => {
      try {return {...await shell(process.execPath, [cli, 'check-layout', 'example', '--json'], {cwd: tmpdir(), env: {...process.env, PRESENTATION_DATA_ROOT: temp}}), code: 0};}
      catch (error) {return error;}
    };
    const result = await run();
    assert.equal(result.code, 2, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.deepEqual(report.pages.map(x => x.page), [3, 8]);
    assert.ok(report.pages[1].limitations.includes('text-in-image'));
    assert.equal(report.summary.pages, 2);
    assert.ok(report.pages.every(p => !p.limitations.includes('active-animation')), 'wait for finite transitions before measuring');
    assert.match(report.htmlSha256, /^[a-f0-9]{64}$/);
    for (const [name, data] of files) assert.equal(await readFile(join(dir, name), 'utf8'), data);
    await writeFile(join(dir, 'dist/deck.html'), html.replace('left:790px', 'left:40px'));
    const clean = await run();
    assert.equal(clean.code, 0, clean.stderr);
    assert.ok(JSON.parse(clean.stdout).summary.pagesWithLimitations > 0, 'zero exit is not visual acceptance');
    await writeFile(join(dir, 'dist/deck.html'), html.replace('<p ', '<img src="missing.png"><p '));
    const missing = await run();
    assert.equal(missing.code, 1);
    assert.equal(missing.stdout, '', 'failed checks must not emit a success report');
    await writeFile(join(dir, 'dist/deck.html'), fixture('<p>Only one page</p><input id="progress">'));
    const count = await run();
    assert.equal(count.code, 1);
    assert.match(count.stderr, /slide count differs/);
  } finally {await rm(temp, {recursive: true, force: true});}
});
