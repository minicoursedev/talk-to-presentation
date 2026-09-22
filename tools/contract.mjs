// The executable source contract shared by Node tools and Python's common.load.
import {readFileSync, realpathSync} from 'node:fs';
import {resolve, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {casePath, caseFile} from './data-paths.mjs';

const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const present = x => typeof x === 'string' && x.trim().length > 0;
const integer = x => Number.isSafeInteger(x) && x >= 0;
const seconds = x => typeof x === 'number' && Number.isFinite(x) && x >= 0;
function requireValue(ok, path, message) {
  if (!ok) throw Error(`${path}: ${message}`);
}
function optionalText(value, path) {
  requireValue(value == null || typeof value === 'string', path, 'expected text or null');
}
export function validateSlides(slides) {
  requireValue(Array.isArray(slides) && slides.length > 0, 'slides.json', 'expected a nonempty array');
  const pages = new Set();
  slides.forEach((slide, index) => {
    const path = `slides[${index}]`;
    requireValue(object(slide), path, 'expected an object');
    requireValue(integer(slide.page) && slide.page > 0 && !pages.has(slide.page), `${path}.page`, 'invalid or duplicate page; expected a unique positive integer');
    pages.add(slide.page);
    for (const key of ['screen', 'narration', 'tone', 'backgroundNarration', 'backgroundTone', 'layout']) optionalText(slide[key], `${path}.${key}`);
    if (slide.previewSeconds != null) requireValue(seconds(slide.previewSeconds) && slide.previewSeconds > 0, `${path}.previewSeconds`, 'expected positive seconds');
    if (slide.parts != null) {
      requireValue(Array.isArray(slide.parts), `${path}.parts`, 'expected an array');
      slide.parts.forEach((part, i) => {
        const p = `${path}.parts[${i}]`;
        requireValue(object(part), p, 'expected an object');
        if (part.runs != null) {
          requireValue(Array.isArray(part.runs) && part.runs.every(run => object(run) && typeof run.text === 'string' && (run.color == null || typeof run.color === 'string')), `${p}.runs`, 'expected text runs');
        } else requireValue(typeof part.text === 'string', `${p}.text`, 'expected text');
        optionalText(part.color, `${p}.color`); optionalText(part.size, `${p}.size`);
        requireValue(part.small == null || typeof part.small === 'boolean', `${p}.small`, 'expected a boolean');
      });
    }
    if (slide.narrationSegments != null) {
      const parts = slide.narrationSegments;
      requireValue(Array.isArray(parts) && parts.length > 0 && parts.every(p => object(p) && present(p.text) && present(p.tone)) && parts.map(p => p.text).join('') === slide.narration,
        `${path}.narrationSegments`, 'segments must exactly match narration; each needs text and tone');
    }
    if (slide.visual != null) {
      requireValue(object(slide.visual), `${path}.visual`, 'expected an object');
      optionalText(slide.visual.notes, `${path}.visual.notes`);
      requireValue(slide.visual.illustrations == null || (Array.isArray(slide.visual.illustrations) && slide.visual.illustrations.every(present)), `${path}.visual.illustrations`, 'expected relative image paths');
    }
  });
}
export function validateSources(meta, slides) {
  requireValue(object(meta), 'case.json', 'expected an object');
  optionalText(meta.id, 'case.id'); optionalText(meta.title, 'case.title');
  requireValue(object(meta.format), 'case.format', 'expected width, height and fps');
  for (const key of ['width', 'height', 'fps']) requireValue(integer(meta.format[key]) && meta.format[key] > 0, `case.format.${key}`, 'expected a positive integer');
  requireValue(object(meta.timing), 'case.timing', 'expected timing settings');
  for (const key of ['voiceOffsetFrames', 'tailFrames']) requireValue(integer(meta.timing[key]), `case.timing.${key}`, 'expected a nonnegative integer');
  requireValue(seconds(meta.timing.backgroundGapSeconds), 'case.timing.backgroundGapSeconds', 'expected nonnegative seconds');
  if (meta.timing.narrationGapSeconds != null) requireValue(seconds(meta.timing.narrationGapSeconds), 'case.timing.narrationGapSeconds', 'expected nonnegative seconds');
  requireValue(object(meta.outputs) && Object.keys(meta.outputs).length > 0, 'case.outputs', 'expected output paths');
  const outputs = Object.values(meta.outputs);
  requireValue(outputs.every(x => present(x) && !isAbsolute(x)) && new Set(outputs).size === outputs.length, 'case.outputs', 'expected distinct relative paths');
  if (meta.visual != null) {
    requireValue(object(meta.visual), 'case.visual', 'expected an object');
    requireValue(meta.visual.requireImages == null || typeof meta.visual.requireImages === 'boolean', 'case.visual.requireImages', 'expected a boolean');
  }
  validateSlides(slides);
}
export const digest = value => createHash('sha256').update(value).digest('hex');
export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (object(value)) return Object.fromEntries(Object.keys(value).sort().filter(k => value[k] !== undefined).map(k => [k, canonical(value[k])]));
  return value;
}
export const fingerprint = value => digest(JSON.stringify(canonical(value)));
export function narrationJobs(slides) {
  return slides.flatMap(slide => {
    const jobs = [];
    if (slide.narration) {
      const parts = slide.narrationSegments ?? [{text: slide.narration, tone: slide.tone}];
      parts.forEach((p, i) => jobs.push({page: slide.page, kind: 'main', text: p.text, tone: p.tone ?? null,
        file: `audio/main/page-${slide.page}${slide.narrationSegments ? `-segment-${i + 1}` : ''}.wav`}));
    }
    if (slide.backgroundNarration) jobs.push({page: slide.page, kind: 'background', text: slide.backgroundNarration, tone: slide.backgroundTone ?? null, file: `audio/background/page-${slide.page}.wav`});
    return jobs;
  });
}
export function timelineSource(meta, slides) {
  // Page order, literal captions, tone, gaps and frame timing affect the timeline.
  // Screen text, illustration notes, brand, dimensions and output names do not.
  return fingerprint({version: 2, fps: meta.format.fps, timing: {
    voiceOffsetFrames: meta.timing.voiceOffsetFrames, tailFrames: meta.timing.tailFrames,
    backgroundGapSeconds: meta.timing.backgroundGapSeconds,
    narrationGapSeconds: meta.timing.narrationGapSeconds ?? meta.timing.backgroundGapSeconds,
  }, pages: slides.map(s => s.page), jobs: narrationJobs(slides)});
}
export function loadCase(id) {
  const dir = casePath(id);
  const meta = JSON.parse(readFileSync(caseFile(dir, 'case.json'), 'utf8'));
  const slides = JSON.parse(readFileSync(caseFile(dir, 'content/slides.json'), 'utf8'));
  validateSources(meta, slides);
  for (const name of ['audio', 'content', 'dist', 'verification', 'motion/src', 'motion/public', ...Object.values(meta.outputs)]) {
    requireValue(caseFile(dir, name) !== dir, name, 'expected a path inside the case');
  }
  for (const slide of slides) for (const asset of slide.visual?.illustrations ?? []) caseFile(dir, asset);
  if (meta.style?.snapshot != null) caseFile(dir, meta.style.snapshot);
  return {dir, meta, slides, timelineSource: timelineSource(meta, slides)};
}
export function assertTimeline(context, timeline) {
  const {dir, meta, slides} = context;
  const expected = timeline.narrationSource != null ? timelineSource(meta, slides) :
    digest(Buffer.concat([readFileSync(caseFile(dir, 'content/slides.json')), readFileSync(caseFile(dir, 'case.json'))]));
  if ((timeline.narrationSource ?? timeline.source) !== expected) throw Error('Timeline stale: rebuild with tools/voice.py timeline');
  if (!Array.isArray(timeline.inputs) || !timeline.inputs.length) throw Error('Timeline has no WAV inputs');
  for (const input of timeline.inputs) if (digest(readFileSync(caseFile(dir, input.file))) !== input.sha256) throw Error('WAV changed: rebuild timeline');
}
if (process.argv[1] && realpathSync(resolve(process.argv[1])) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw Error('Usage: node tools/contract.mjs <case-id>');
    console.log(JSON.stringify(loadCase(process.argv[2])));
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
