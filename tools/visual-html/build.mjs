#!/usr/bin/env node

import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const caseId = process.argv[2];
if (!caseId || !/^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u.test(caseId)) {
  throw new Error('Usage: node tools/visual-html/build.mjs <case-id>');
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, '../..');
const caseDir = resolve(root, 'cases', caseId);
const metadata = JSON.parse(await readFile(resolve(caseDir, 'case.json'), 'utf8'));
const slides = JSON.parse(await readFile(resolve(caseDir, 'content/slides.json'), 'utf8'));
const brand = JSON.parse(await readFile(resolve(root, 'brand.json'), 'utf8'));
const outputPath = resolve(caseDir, metadata.outputs.visualHtml);
const width = Number(metadata.format?.width ?? 1080);
const height = Number(metadata.format?.height ?? 1920);
const colours = new Set(['white', 'dark', 'highlight', 'danger', 'success', 'warning']);

if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
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
    const colour = colours.has(part.color) ? part.color : 'white';
    const text = renderText(part.text);
    return part.small
      ? `<div class="sub-text ${colour}">${text}</div>`
      : `<div class="main-text ${colour}${part.size === 'compact' ? ' compact' : ''}">${text}</div>`;
  }).join('\n');
}

function renderSlide(slide) {
  const asset = slide.visual?.illustrations?.[0];
  const parts = Array.isArray(slide.parts) && slide.parts.length > 0
    ? renderParts(slide.parts)
    : `<div class="main-text white">${renderText(slide.screen)}</div>`;
  const classes = ['slide'];
  if (slide.layout === 'light') classes.push('light');
  if (slide.layout === 'stack') classes.push('stack');
  if (asset) classes.push('with-art');
  const art = asset
    ? `<img class="art" src="../${encodeURI(asset)}" alt="${escapeHtml(slide.visual.notes || '')}">`
    : '<div class="abstract-orb"></div>';
  return `<section class="${classes.join(' ')}" aria-label="第 ${slide.page} 頁">${art}<div class="content">${parts}</div></section>`;
}

const html = `<!doctype html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(metadata.title || metadata.id)}｜${escapeHtml(brand.name)} 美化版</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { display: grid; width: 100vw; height: 100vh; place-items: center; overflow: hidden; background: #18181b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif; }
    .short-frame { position: relative; width: min(100vw, calc(100vh * ${width} / ${height})); aspect-ratio: ${width} / ${height}; max-height: 100vh; overflow: hidden; container-type: size; background: #07182e; color: #fff; }
    .slide { position: absolute; inset: 0; display: grid; visibility: hidden; place-items: center; overflow: hidden; opacity: 0; background: radial-gradient(circle at 78% 18%, #174b78 0, transparent 24%), linear-gradient(145deg, #07182e 0%, #0c2945 55%, #10263a 100%); }
    .slide.active { visibility: visible; opacity: 1; }
    .abstract-orb { position: absolute; width: 54cqw; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 34% 32%, #6fd3ff 0, #256d9e 22%, #0f3152 48%, transparent 70%); filter: blur(1px); opacity: .45; transform: translate(28cqw, -28cqh); }
    .content { position: relative; z-index: 2; display: flex; width: 100%; height: 100%; flex-direction: column; align-items: center; justify-content: center; gap: min(2.2cqh, 1.5rem); padding: 16cqh 7cqw 14cqh; text-align: center; }
    .main-text { font-size: clamp(3.2rem, min(13cqw, 11.5cqh), 10rem); font-weight: 900; letter-spacing: -.035em; line-height: 1.12; word-break: break-word; text-shadow: 0 4px 24px rgba(0, 0, 0, .22); }
    .main-text.compact { font-size: clamp(2rem, min(7.4cqw, 6.5cqh), 5.8rem); }
    .sub-text { font-size: clamp(1.7rem, min(6.2cqw, 5.6cqh), 4.6rem); font-weight: 750; line-height: 1.28; text-shadow: 0 3px 18px rgba(0, 0, 0, .25); }
    .white { color: #fff; } .dark { color: #07182e; } .highlight { color: #7dddff; } .danger { color: #ff6b7b; } .success { color: #79efaa; } .warning { color: #ffd46e; }
    .with-art .art { position: absolute; width: 100%; height: 100%; object-fit: cover; object-position: center; }
    .with-art .content { justify-content: flex-start; align-items: flex-start; padding-top: 19cqh; text-align: left; } .with-art .sub-text, .with-art .main-text { max-width: 88cqw; }
    .stack .content { gap: min(1.5cqh, 1rem); } .stack .main-text { font-size: clamp(2.35rem, min(10cqw, 8.8cqh), 6.8rem); }
    .light { background: #f8fafc; color: #07182e; } .light .abstract-orb { background: radial-gradient(circle, #facc15 0, #fb7185 35%, transparent 72%); opacity: .28; } .light .white { color: #07182e; }
    .brand { position: absolute; z-index: 5; top: 2cqh; left: 3cqw; line-height: 0; } .brand span { color: #fff; font: 700 min(4cqw, 3cqh) sans-serif; line-height: 1.2; } .brand img { width: min(27cqw, 18cqh); height: auto; } .short-frame:has(.light.active) .brand { padding: .35rem .5rem; border-radius: .35rem; background: rgba(0, 0, 0, .58); }
    .counter { position: absolute; z-index: 5; right: 4cqw; bottom: 4cqh; color: #cbd5e1; font-size: min(4cqw, 3cqh); font-weight: 750; text-shadow: 0 2px 8px rgba(0,0,0,.5); } .light.active ~ .counter { color: #334155; text-shadow: none; }
    .progress { position: absolute; z-index: 6; bottom: 0; left: 0; width: 100%; height: 24px; appearance: none; -webkit-appearance: none; background: transparent; cursor: ew-resize; } .progress::-webkit-slider-runnable-track { height: 6px; background: linear-gradient(to right, #7dddff var(--progress), rgba(226,232,240,.38) var(--progress)); } .progress::-webkit-slider-thumb { width: 18px; height: 18px; margin-top: -6px; appearance: none; -webkit-appearance: none; border-radius: 50%; background: #7dddff; } .progress::-moz-range-track { height: 6px; background: rgba(226,232,240,.38); } .progress::-moz-range-progress { height: 6px; background: #7dddff; } .progress::-moz-range-thumb { width: 18px; height: 18px; border: 0; border-radius: 50%; background: #7dddff; }
  </style>
</head>
<body>
  <div class="short-frame">
    <div class="brand">${brand.logo ? `<img src="../../../${escapeHtml(brand.logo)}" alt="${escapeHtml(brand.name)}">` : `<span>${escapeHtml(brand.name)}</span>`}</div>
    ${slides.map(renderSlide).join('\n')}
    <div class="counter" id="counter"></div>
    <input class="progress" id="progress" type="range" min="1" max="${slides.length}" value="1" aria-label="簡報頁碼">
  </div>
  <script>
    const slides = [...document.querySelectorAll('.slide')];
    const progress = document.querySelector('#progress');
    const counter = document.querySelector('#counter');
    function show(page) { const current = Math.max(1, Math.min(slides.length, Number(page))); slides.forEach((slide, index) => slide.classList.toggle('active', index === current - 1)); progress.value = current; progress.style.setProperty('--progress', ((current - 1) / Math.max(1, slides.length - 1)) * 100 + '%'); counter.textContent = current + ' / ' + slides.length; }
    progress.addEventListener('input', () => show(progress.value));
    document.addEventListener('keydown', (event) => { if (event.key === 'ArrowRight' || event.key === 'PageDown') show(Number(progress.value) + 1); if (event.key === 'ArrowLeft' || event.key === 'PageUp') show(Number(progress.value) - 1); });
    show(1);
  </script>
</body>
</html>`;

await mkdir(dirname(outputPath), {recursive: true});
await writeFile(outputPath, html, 'utf8');
console.log(outputPath);
