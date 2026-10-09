// Rebuild receipts are derived evidence, not user decisions or acceptance records.
import {existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {capabilityRoot, caseFile, dataPath} from './data-paths.mjs';
import {digest, fingerprint, narrationJobs} from './contract.mjs';

const pick = (value, keys) => Object.fromEntries(keys.filter(k => value[k] !== undefined).map(k => [k, value[k]]));
const fileHash = path => {
  if (!existsSync(path) || !statSync(path).isFile()) return null;
  if (/\.wav$/i.test(path)) return 'present';
  const bytes = readFileSync(path);
  // Canvas Commons rewrites metadata formatting while loading a scene.
  // Track every setting, but do not treat whitespace-only saves as a change.
  return path.endsWith('.meta') ? `json:${fingerprint(JSON.parse(bytes.toString('utf8')))}` : digest(bytes);
};
const files = (base, names) => Object.fromEntries([...new Set(names)].sort().map(name => [name, fileHash(caseFile(base, name))]));
function tree(dir, relative) {
  const path = caseFile(dir, relative);
  if (!existsSync(path)) return [];
  return readdirSync(path, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const name = `${relative}/${entry.name}`;
    if (entry.isSymbolicLink()) throw Error(`Tracked inputs must not be symlinks: ${name}`);
    return entry.isDirectory() ? tree(dir, name) : [name];
  });
}
const stages = {
  review: {tools: ['review-script.mjs'], deps: []},
  text: {tools: ['takahashi-html/build.mjs', 'brand-palette.mjs'], deps: []},
  visual: {tools: ['visual-html/build.mjs', 'brand-palette.mjs', 'check-visuals.mjs'], deps: []},
  timeline: {tools: ['voice.py', 'common.py'], deps: []},
  prepare: {tools: ['prepare-motion.mjs', 'check-visuals.mjs'], deps: ['visual', 'timeline']},
  'prepare-preview': {tools: ['prepare-motion.mjs', 'check-visuals.mjs'], deps: ['visual']},
  render: {tools: ['motion.mjs', 'render-video.mjs'], deps: ['prepare']},
  'render-preview': {tools: ['motion.mjs', 'render-video.mjs'], deps: ['prepare-preview']},
  finish: {tools: ['finish_video.py', 'common.py'], deps: ['render']},
  verify: {tools: ['verify_video.py', 'common.py'], deps: ['finish']},
  'verify-preview': {tools: ['verify_video.py', 'common.py'], deps: ['render-preview']},
};
export const stageNames = Object.keys(stages);
export const targets = {review: ['review'], text: ['review', 'text'], html: ['review', 'text', 'visual'], timeline: ['timeline'],
  preview: ['review', 'visual', 'prepare-preview', 'render-preview', 'verify-preview'],
  video: ['review', 'visual', 'timeline', 'prepare', 'render', 'finish', 'verify']};
export function outputs(context, stage) {
  const {meta, slides} = context;
  switch (stage) {
    case 'review': return ['dist/script-review.html'];
    case 'text': return meta.outputs.takahashiHtml ? [meta.outputs.takahashiHtml] : [];
    case 'visual': return meta.outputs.visualHtml ? [meta.outputs.visualHtml] : [];
    case 'timeline': return ['content/timeline.json', 'content/narration.srt', 'audio/timeline.wav', ...slides.map(s => `audio/combined/page-${s.page}.wav`)];
    case 'prepare': case 'prepare-preview': return ['motion/src/prepared.json', 'motion/src/project.meta', ...slides.map(s => `motion/public/slides/page-${s.page}.png`), ...(stage === 'prepare' ? ['motion/timeline.wav'] : [])];
    case 'render': return ['motion/output/presentation.mp4'];
    case 'render-preview': return ['motion/output/preview.mp4'];
    case 'finish': return meta.outputs.video ? [meta.outputs.video] : [];
    case 'verify': case 'verify-preview': return ['verification/media.json'];
    default: throw Error(`Unknown stage: ${stage}`);
  }
}
export function stageInput(context, stage) {
  const {dir, meta, slides} = context;
  const code = Object.fromEntries(['contract.mjs', 'build-state.mjs', 'data-paths.mjs', ...stages[stage].tools].map(name => [name, fileHash(resolve(capabilityRoot, 'tools', name))]));
  let value;
  const assetNames = slides.flatMap(s => s.visual?.illustrations ?? []);
  const visible = slides.map(s => pick(s, ['page', 'screen', 'parts', 'layout']));
  if (['text', 'visual'].includes(stage)) {
    const brandFile = dataPath('brand.json');
    const brand = existsSync(brandFile) ? JSON.parse(readFileSync(brandFile, 'utf8')) : {name: '示範品牌', logo: null};
    value = {title: meta.title, id: meta.id, width: meta.format.width, height: meta.format.height,
      outputs: outputs(context, stage), slides: visible, brand, logo: brand.logo ? fileHash(dataPath(brand.logo)) : null};
    if (stage === 'visual') Object.assign(value, {visual: meta.visual, illustrations: slides.map(s => s.visual), assets: files(dir, assetNames)});
  } else if (stage === 'review') {
    value = {title: meta.title, id: meta.id, slides: slides.map(s => pick(s, ['page', 'screen', 'parts', 'narration', 'tone', 'narrationSegments', 'backgroundNarration', 'backgroundTone']))};
  } else if (stage === 'timeline') {
    const wavs = narrationJobs(slides).map(job => job.file);
    value = {source: context.timelineSource, inputs: files(dir, [...wavs, ...wavs.map(p => p.replace(/\.wav$/, '.json'))])};
  } else if (stage.startsWith('prepare')) {
    value = {format: meta.format, pages: slides.map(s => ({page: s.page, ...(stage.endsWith('preview') ? {seconds: s.previewSeconds ?? 3} : {})})),
      inputs: files(dir, [...assetNames, ...(meta.outputs.visualHtml ? [meta.outputs.visualHtml] : []), ...(stage === 'prepare' ? ['content/timeline.json', 'audio/timeline.wav'] : [])]),
      brand: fileHash(dataPath('brand.json'))};
    const brand = existsSync(dataPath('brand.json')) ? JSON.parse(readFileSync(dataPath('brand.json'), 'utf8')) : {};
    if (brand.logo) value.logo = fileHash(dataPath(brand.logo));
  } else if (stage.startsWith('render')) {
    value = {inputs: files(dir, [...tree(dir, 'motion/src'), ...tree(dir, 'motion/public'), 'motion/vite.config.ts', 'motion/package.json', 'motion/tsconfig.json', ...(stage === 'render' ? ['motion/timeline.wav'] : [])]), dependencies: fileHash(resolve(capabilityRoot, 'package-lock.json'))};
  } else if (stage === 'finish') {
    value = {output: meta.outputs.video, inputs: files(dir, ['motion/output/presentation.mp4', 'content/narration.srt'])};
  } else {
    value = {format: meta.format, inputs: files(dir, stage === 'verify' ? [meta.outputs.video, 'content/timeline.json'].filter(Boolean) : ['motion/output/preview.mp4', 'motion/src/prepared.json'])};
  }
  return fingerprint({version: 1, stage, code, value});
}
const receiptPath = (context, stage) => caseFile(context.dir, `verification/build/${stage}.json`);
export function recordStage(context, stage, input) {
  if (stageInput(context, stage) !== input) throw Error(`Inputs changed while running ${stage}; no current receipt recorded`);
  const output = files(context.dir, outputs(context, stage));
  if (!Object.keys(output).length || Object.values(output).some(hash => !hash)) throw Error(`Missing ${stage} output`);
  const path = receiptPath(context, stage);
  mkdirSync(dirname(path), {recursive: true});
  writeFileSync(path, JSON.stringify({version: 1, stage, input, outputs: output, generatedAt: new Date().toISOString()}, null, 2) + '\n');
}
export function stageStatus(context, stage, options = {}, cache = new Map()) {
  if (cache.has(stage)) return cache.get(stage);
  const done = (state, reason) => {const result = {stage, state, reason}; cache.set(stage, result); return result;};
  const names = outputs(context, stage);
  if (!names.length) return done('unavailable', 'No configured output');
  if (stage === 'visual' && options.useExistingHtml) {
    return done(fileHash(caseFile(context.dir, names[0])) ? 'external' : 'missing', 'Existing HTML selected explicitly; source synchronization requires case review');
  }
  const output = files(context.dir, names);
  if (Object.values(output).some(hash => !hash)) return done('missing', 'One or more outputs are missing');
  const path = receiptPath(context, stage);
  if (!existsSync(path)) return done('untracked', 'Output exists without a build receipt; freshness is unknown');
  let receipt;
  try {receipt = JSON.parse(readFileSync(path, 'utf8'));} catch {return done('stale', 'Invalid build receipt');}
  if (receipt.version !== 1 || receipt.stage !== stage || receipt.input !== stageInput(context, stage)) return done('stale', 'Inputs or tools changed');
  if (fingerprint(receipt.outputs) !== fingerprint(output)) return done('stale', 'Output changed after generation');
  for (const dep of stages[stage].deps) {
    const result = stageStatus(context, dep, options, cache);
    if (!['current', 'external'].includes(result.state)) return done('stale', `Dependency ${dep}: ${result.state}`);
  }
  return done('current', 'Input and output hashes match; this is not visual or listening acceptance');
}
export function audioIssues(context) {
  const issues = [], jobs = narrationJobs(context.slides);
  for (const slide of context.slides) if (!jobs.some(job => job.page === slide.page)) issues.push(`Page ${slide.page}: missing narration`);
  for (const job of jobs) {
    const path = caseFile(context.dir, job.file);
    if (!fileHash(path)) {issues.push(`Missing WAV: ${job.file}`); continue;}
    const provenance = path.replace(/\.wav$/, '.json');
    if (existsSync(provenance)) {
      try {
        const log = JSON.parse(readFileSync(provenance, 'utf8'));
        if (log.ttsText !== job.text.replace(/\s+/gu, ' ').trim() || (log.tone ?? null) !== job.tone) issues.push(`Page ${job.page} ${job.kind}: narration or tone changed; regenerate only the authorized WAV`);
      } catch {issues.push(`Invalid WAV provenance: ${job.file}`);}
    }
  }
  return issues;
}
export function htmlProtection(context, stage, options) {
  if (!['text', 'visual'].includes(stage) || options.replaceHtml || (stage === 'visual' && options.useExistingHtml)) return null;
  if (stage === 'visual' && context.meta.production?.mode === 'imported-html') return 'Imported HTML: use the case workflow, or explicitly select --use-existing-html';
  const names = outputs(context, stage), path = receiptPath(context, stage);
  if (!names.some(name => existsSync(caseFile(context.dir, name)))) return null;
  // Even a previously generated HTML may have received manual layout edits.
  let receipt;
  try {receipt = JSON.parse(readFileSync(path, 'utf8'));} catch {return 'Existing HTML has no build receipt; inspect its origin before using --replace-html';}
  if (fingerprint(receipt.outputs) !== fingerprint(files(context.dir, names))) return 'HTML changed outside this workflow; preserve case edits or explicitly use --replace-html';
  return null;
}
