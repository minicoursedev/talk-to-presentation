#!/usr/bin/env node

import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const caseId = process.argv[2];
if (!caseId || !/^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u.test(caseId)) {
  throw new Error('Usage: node tools/takahashi-html/build.mjs <case-id>');
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '../..');
const caseDir = resolve(projectRoot, 'cases', caseId);
const metadata = JSON.parse(await readFile(resolve(caseDir, 'case.json'), 'utf8'));
const slides = JSON.parse(await readFile(resolve(caseDir, 'content/slides.json'), 'utf8'));
const brand = JSON.parse(await readFile(resolve(projectRoot, 'brand.json'), 'utf8'));
const outputPath = resolve(caseDir, metadata.outputs.takahashiHtml);
const colours = new Set(['white', 'dark', 'highlight', 'danger', 'success', 'warning']);
const canvasWidth = Number(metadata.format?.width ?? 1080);
const canvasHeight = Number(metadata.format?.height ?? 1920);
if (!Number.isFinite(canvasWidth) || !Number.isFinite(canvasHeight) || canvasWidth <= 0 || canvasHeight <= 0) {
  throw new Error('case.json format.width and format.height must be positive numbers');
}

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const renderText = (value) => escapeHtml(value ?? '').replaceAll(/\r?\n/g, '<br>');

function renderParts(parts) {
  return parts.map((part) => {
    const text = renderText(part.text);
    const colour = colours.has(part.color) ? part.color : 'white';
    return part.small
      ? `<div class="sub-text ${colour}">${text}</div>`
      : `<div class="takahashi-text ${colour}${part.size === 'compact' ? ' compact' : ''}">${text}</div>`;
  }).join('\n');
}

function renderSlide(slide) {
  const content = Array.isArray(slide.parts) && slide.parts.length > 0
    ? renderParts(slide.parts)
    : `<div class="takahashi-text white">${renderText(slide.screen)}</div>`;
  const layout = ['stack', 'light'].includes(slide.layout) ? ` ${slide.layout}` : '';
  return `<section class="slide${layout}" aria-label="第 ${slide.page} 頁">${content}</section>`;
}

const title = escapeHtml(metadata.title || metadata.id);
const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}｜${escapeHtml(brand.name)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { display: grid; width: 100vw; height: 100vh; overflow: hidden; place-items: center; background: #18181b; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif; user-select: none; }
    .short-frame { position: relative; width: min(100vw, calc(100vh * ${canvasWidth} / ${canvasHeight})); aspect-ratio: ${canvasWidth} / ${canvasHeight}; max-height: 100vh; overflow: hidden; container-type: size; background: #000; }
    .slide-container { position: relative; width: 100%; height: 100%; }
    .slide { position: absolute; inset: 0; display: flex; visibility: hidden; flex-direction: column; align-items: center; justify-content: center; gap: clamp(.8rem, 2vh, 1.5rem); padding: 2rem; opacity: 0; text-align: center; }
    .slide.active { visibility: visible; opacity: 1; }
    .takahashi-text { font-size: clamp(3.5rem, min(13cqw, 12cqh), 11rem); font-weight: 900; letter-spacing: -.02em; line-height: 1.15; word-break: break-word; }
    .takahashi-text.compact { font-size: clamp(2rem, min(7cqw, 6cqh), 6rem); }
    .sub-text { font-size: clamp(2rem, min(6cqw, 6cqh), 5rem); font-weight: 700; line-height: 1.3; }
    .white { color: #fff; } .dark { color: #000; } .highlight { color: #38bdf8; } .danger { color: #f43f5e; } .success { color: #22c55e; } .warning { color: #fbbf24; }
    .slide.stack { gap: clamp(.5rem, 1.5cqh, 1.5rem); } .slide.stack .takahashi-text { font-size: clamp(2.25rem, min(10cqw, 9cqh), 7rem); line-height: 1.05; }
    .slide.light { background: #fff; color: #000; } .slide.light .white { color: #000; }
    .brand { position: absolute; z-index: 3; top: 2cqh; left: 3cqw; line-height: 0; }
    .brand span { color: #fff; font: 700 min(4cqw, 3cqh) sans-serif; line-height: 1.2; } .brand img { width: min(27cqw, 18cqh); height: auto; }
    .short-frame:has(.slide.light.active) .brand { padding: .35rem .5rem; border-radius: .35rem; background: rgba(0, 0, 0, .58); }
    .counter { position: absolute; z-index: 3; right: 4cqw; bottom: 4cqh; color: #71717a; font-size: min(4cqw, 3cqh); font-weight: 600; }
    .progress-bar { position: absolute; z-index: 4; bottom: 0; left: 0; width: 100%; height: 24px; appearance: none; -webkit-appearance: none; background: transparent; cursor: ew-resize; }
    .progress-bar::-webkit-slider-runnable-track { height: 6px; background: linear-gradient(to right, #38bdf8 var(--progress), #52525b var(--progress)); }
    .progress-bar::-webkit-slider-thumb { width: 18px; height: 18px; margin-top: -6px; appearance: none; -webkit-appearance: none; border-radius: 50%; background: #38bdf8; }
    .progress-bar::-moz-range-track { height: 6px; background: #52525b; } .progress-bar::-moz-range-progress { height: 6px; background: #38bdf8; } .progress-bar::-moz-range-thumb { width: 18px; height: 18px; border: 0; border-radius: 50%; background: #38bdf8; }
    .progress-bar:focus-visible { outline: 2px solid #38bdf8; outline-offset: -2px; }
  </style>
</head>
<body>
  <div class="short-frame">
    <div class="brand">${brand.logo ? `<img src="../../../${escapeHtml(brand.logo)}" alt="${escapeHtml(brand.name)}">` : `<span>${escapeHtml(brand.name)}</span>`}</div>
    <main class="slide-container">${slides.map(renderSlide).join('\n')}</main>
    <div class="counter" id="counter"></div>
    <input class="progress-bar" id="progressBar" type="range" min="1" max="${slides.length}" value="1" aria-label="簡報頁碼">
  </div>
  <script>
    const slides = [...document.querySelectorAll('.slide')];
    const progressBar = document.querySelector('#progressBar');
    const counter = document.querySelector('#counter');
    function show(page) {
      const index = Math.max(1, Math.min(slides.length, Number(page)));
      slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === index - 1));
      progressBar.value = index;
      progressBar.style.setProperty('--progress', ((index - 1) / Math.max(1, slides.length - 1)) * 100 + '%');
      counter.textContent = index + ' / ' + slides.length;
    }
    progressBar.addEventListener('input', () => show(progressBar.value));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') show(Number(progressBar.value) + 1);
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') show(Number(progressBar.value) - 1);
    });
    show(1);
  </script>
</body>
</html>`;

await mkdir(dirname(outputPath), {recursive: true});
await writeFile(outputPath, html, 'utf8');
console.log(outputPath);
