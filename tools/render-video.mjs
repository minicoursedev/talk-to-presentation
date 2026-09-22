#!/usr/bin/env node
// Drive the same Canvas Commons Renderer and FFmpeg exporter used by the editor.
import {createServer} from 'vite';
import {chromium} from 'playwright';
import {existsSync, symlinkSync} from 'node:fs';
import {readFile, stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {capabilityRoot, casePath, caseFile} from './data-paths.mjs';

const [id, ...flags] = process.argv.slice(2);
if (!id || flags.some(f => f !== '--preview')) throw Error('Usage: node tools/render-video.mjs <case-id> [--preview]');
const dir = casePath(id), motion = caseFile(dir, 'motion');
const prepared = JSON.parse(await readFile(caseFile(dir, 'motion/src/prepared.json'), 'utf8'));
const preview = flags.includes('--preview');
if (prepared.audio === preview) throw Error('Prepared audio mode differs: run prepare-motion with the same --preview setting');
const name = preview ? 'preview' : 'presentation';
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
export async function render() {
  const renderer = new Renderer(project);
  let result;
  renderer.onFinished.subscribe(value => {result = value;});
  const settings = project.meta.getFullRenderingSettings();
  if (settings.exporter.name !== '@canvas-commons/ffmpeg') throw Error('Expected Video (FFmpeg) exporter');
  await renderer.render({...settings, name: ${JSON.stringify(name)}});
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
  browser = await chromium.launch({headless: true, ...(process.env.BROWSER_EXECUTABLE ? {executablePath: process.env.BROWSER_EXECUTABLE} : {})});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {if (message.type() === 'error') console.error(message.text());});
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
