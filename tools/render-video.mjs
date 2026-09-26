#!/usr/bin/env node
// Drive the same Canvas Commons Renderer and FFmpeg exporter used by the editor.
import {createServer} from 'vite';
import {chromium} from 'playwright';
import {existsSync, symlinkSync} from 'node:fs';
import {readFile, stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {capabilityRoot, caseFile} from './data-paths.mjs';
import {loadCase} from './contract.mjs';

const [id, ...flags] = process.argv.slice(2);
const usage = 'Usage: node tools/render-video.mjs <case-id> [--preview] [--gpu] [--output-name <name>] [--frame-upload array|blob]';
if (!id) throw Error(usage);
let preview = false, gpu = false, outputName, frameUpload = 'blob', frameUploadSpecified = false;
for (let index = 0; index < flags.length; index++) {
  const flag = flags[index];
  if (flag === '--preview' && !preview) preview = true;
  else if (flag === '--gpu' && !gpu) gpu = true;
  else if (flag === '--output-name' && outputName === undefined) outputName = flags[++index];
  else if (flag === '--frame-upload' && !frameUploadSpecified) {frameUpload = flags[++index]; frameUploadSpecified = true;}
  else throw Error(usage);
}
if (outputName !== undefined && !/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(outputName)) throw Error('Invalid output name');
if (frameUpload !== 'array' && frameUpload !== 'blob') throw Error(usage);
const {dir} = loadCase(id), motion = caseFile(dir, 'motion');
const prepared = JSON.parse(await readFile(caseFile(dir, 'motion/src/prepared.json'), 'utf8'));
if (prepared.audio === preview) throw Error('Prepared audio mode differs: run prepare-motion with the same --preview setting');
const name = outputName ?? (preview ? 'preview' : 'presentation');
const browserArgs = gpu ? ['--enable-gpu', '--use-angle=vulkan', '--enable-features=Vulkan', '--disable-vulkan-surface'] : [];
const output = caseFile(dir, `motion/output/${name}.mp4`);
caseFile(dir, 'motion/src/project.meta');
if (!existsSync(resolve(motion, 'node_modules'))) symlinkSync(resolve(capabilityRoot, 'node_modules'), resolve(motion, 'node_modules'), 'dir');
// The upstream Vite plugin resolves project paths against cwd.
process.chdir(motion);
const entry = 'virtual:t2p-render';
const moduleSource = `
// Register the editor entry with Vite before Canvas Commons dynamically imports it.
import '@canvas-commons/2d/editor';
import project from '/src/project.ts?project';
import {Renderer, RendererResult, LogLevel} from '@canvas-commons/core';
const frameUpload = ${JSON.stringify(frameUpload)};
export async function render() {
  let blobFrames = 0;
  // Adapt only FFmpeg frame uploads in this page; leave the installed exporter intact.
  if (frameUpload === 'blob') {
    const originalFetch = globalThis.fetch.bind(globalThis);
    globalThis.fetch = (url, options) => {
      if (url === '/ffmpeg/handleFrame' && options?.body instanceof Uint8ClampedArray) {
        blobFrames++;
        return originalFetch(url, {...options, body: new Blob([options.body])});
      }
      return originalFetch(url, options);
    };
  }
  const renderer = new Renderer(project);
  let result;
  renderer.onFinished.subscribe(value => {result = value;});
  const settings = project.meta.getFullRenderingSettings();
  if (settings.exporter.name !== '@canvas-commons/ffmpeg') throw Error('Expected Video (FFmpeg) exporter');
  await renderer.render({...settings, name: ${JSON.stringify(name)}});
  if (frameUpload === 'blob' && blobFrames === 0) throw Error('Blob frame upload was not used');
  if (frameUpload === 'blob') console.log('BLOB_FRAMES ' + blobFrames);
  if (result !== RendererResult.Success) throw Error('Canvas Commons render failed: ' + result);
  const failures = project.logger.history.filter(log => log.level === LogLevel.Error);
  if (failures.length) throw Error(failures.map(log => log.message).join('\\n'));
}
`;
let server, browser;
try {
  server = await createServer({root: motion, configFile: resolve(motion, 'vite.config.ts'), server: {host: '127.0.0.1', port: 0, open: false}, plugins: [{
    name: 't2p-render-command', enforce: 'pre',
    resolveId(id) {if (id === entry) return '\0' + entry;},
    load(id) {if (id === '\0' + entry) return moduleSource;},
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/__t2p-render.html') return next();
        res.setHeader('Content-Type', 'text/html');
        res.end('<!doctype html><html><head><link rel="icon" href="data:,"><title>Presentation render</title></head><body></body></html>');
      });
    },
  }]});
  await server.listen();
  browser = await chromium.launch({headless: true, args: browserArgs, ...(process.env.BROWSER_EXECUTABLE ? {executablePath: process.env.BROWSER_EXECUTABLE} : {})});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {if (message.type() === 'error') console.error(message.text()); else if (message.text().startsWith('BLOB_FRAMES ')) console.log(message.text());});
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/__t2p-render.html`);
  console.log(`Rendering ${name} with Canvas Commons Video (FFmpeg)…`);
  await page.evaluate(async () => {
    const {render} = await import('/@id/virtual:t2p-render');
    await render();
  });
  if (errors.length) throw Error(errors.join('\n'));
  if (!(await stat(output)).size) throw Error('Exporter produced an empty file');
  console.log(output);
} finally {
  await browser?.close();
  await server?.close();
}
