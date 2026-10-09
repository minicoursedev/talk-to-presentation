import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync, readdirSync, lstatSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root = fileURLToPath(new URL('..', import.meta.url));
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
function snapshot(path) {
  const entries = {};
  for (const name of readdirSync(path)) {
    const child = join(path, name), info = lstatSync(child);
    if (info.isSymbolicLink()) continue;
    if (info.isDirectory()) Object.assign(entries, snapshot(child));
    else entries[child] = hash(child);
  }
  return entries;
}
function wav(path) {
  mkdirSync(resolve(path, '..'), {recursive: true});
  const count = 2400, buffer = Buffer.alloc(44 + count * 2);
  buffer.write('RIFF'); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(24000, 24); buffer.writeUInt32LE(48000, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36); buffer.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++) buffer.writeInt16LE(Math.round(2000 * Math.sin(i * .08)), 44 + i * 2);
  writeFileSync(path, buffer);
}

test('unified workflow is read-only for status, protects HTML, and reuses unaffected audio', () => {
  const temp = mkdtempSync(join(tmpdir(), 'project 測試 '));
  const env = {...process.env, PRESENTATION_DATA_ROOT: join(temp, 'user data'), PYTHONDONTWRITEBYTECODE: '1'};
  const run = (binary, args, ok = true) => {
    const result = spawnSync(binary, args, {cwd: tmpdir(), env, encoding: 'utf8'});
    assert.equal(result.status === 0, ok, result.stdout + result.stderr);
    return result;
  };
  const cli = (...args) => run(process.execPath, [join(root, 'tools/presentation.mjs'), ...args]);
  const python = process.env.PRESENTATION_PYTHON || 'python3';
  try {
    run(python, [join(root, 'tools/init_case.py'), 'example']);
    const dir = join(env.PRESENTATION_DATA_ROOT, 'cases/example');
    const slidesFile = join(dir, 'content/slides.json'), metaFile = join(dir, 'case.json');
    let before = snapshot(dir);
    cli('status', 'example', '--json'); cli('plan', 'example', '--target', 'html'); cli('validate', 'example');
    assert.deepEqual(snapshot(dir), before, 'queries must not mutate cases');
    cli('rebuild', 'example', '--target', 'text');
    const textOnly = JSON.parse(cli('status', 'example', '--json').stdout);
    assert.equal(textOnly.stages.find(s => s.stage === 'visual').state, 'missing');
    cli('rebuild', 'example', '--target', 'html');
    const status = () => JSON.parse(cli('status', 'example', '--json').stdout);
    const state = stage => status().stages.find(s => s.stage === stage).state;
    assert.equal(state('visual'), 'current');
    assert.equal(state('text'), 'current');
    before = snapshot(dir);
    const unchanged = cli('rebuild', 'example', '--target', 'html').stdout;
    assert.match(unchanged, /Reuse visual/); assert.match(unchanged, /0 stages rebuilt/);
    assert.deepEqual(snapshot(dir), before, 'no-op rebuild leaves output bytes unchanged');
    const slides = JSON.parse(readFileSync(slidesFile, 'utf8'));
    for (const slide of slides) {
      const file = join(dir, `audio/main/page-${slide.page}.wav`); wav(file);
      writeFileSync(file.replace(/\.wav$/, '.json'), JSON.stringify({ttsText: slide.narration, tone: slide.tone}));
    }
    const originals = snapshot(join(dir, 'audio/main'));
    cli('rebuild', 'example', '--target', 'timeline');
    const timelineBefore = snapshot(join(dir, 'audio'));
    assert.equal(state('timeline'), 'current');
    slides[0].screen = '只改畫面'; slides[0].visual.notes = '圖片文字说明';
    writeFileSync(slidesFile, JSON.stringify(slides));
    const sourceWav = join(dir, 'audio/main/page-1.wav'), wavBytes = readFileSync(sourceWav);
    const changedWav = Buffer.from(wavBytes); changedWav[48] ^= 1; writeFileSync(sourceWav, changedWav);
    assert.equal(state('timeline'), 'current', 'WAV byte changes do not invalidate the timeline');
    writeFileSync(sourceWav, wavBytes);
    for (const name of ['audio/timeline.wav', 'audio/combined/page-1.wav']) {
      const path = join(dir, name), bytes = readFileSync(path), changed = Buffer.from(bytes);
      changed[48] ^= 1; writeFileSync(path, changed);
      assert.equal(state('timeline'), 'current', 'WAV output changes do not invalidate build receipts');
      writeFileSync(path, bytes);
    }
    assert.equal(state('timeline'), 'current'); assert.equal(state('visual'), 'stale');
    cli('rebuild', 'example', '--target', 'html');
    assert.match(cli('rebuild', 'example', '--target', 'timeline').stdout, /Reuse timeline/);
    assert.deepEqual(snapshot(join(dir, 'audio')), timelineBefore);
    const meta = JSON.parse(readFileSync(metaFile, 'utf8')); meta.timing.tailFrames++;
    writeFileSync(metaFile, JSON.stringify(meta));
    assert.equal(state('timeline'), 'stale'); assert.equal(state('visual'), 'current');
    cli('rebuild', 'example', '--target', 'timeline');
    assert.deepEqual(snapshot(join(dir, 'audio/main')), originals);
    slides[0].tone = 'changed'; writeFileSync(slidesFile, JSON.stringify(slides));
    const blocked = JSON.parse(cli('plan', 'example', '--target', 'video', '--json').stdout);
    assert.ok(blocked.blockers.some(s => s.includes('tone changed')));
    run(process.execPath, [join(root, 'tools/presentation.mjs'), 'rebuild', 'example', '--target', 'timeline'], false);
    assert.deepEqual(snapshot(join(dir, 'audio/main')), originals);
    const visual = join(dir, meta.outputs.visualHtml);
    writeFileSync(visual, '<html>Case-specific layout</html>');
    const custom = hash(visual);
    run(process.execPath, [join(root, 'tools/presentation.mjs'), 'rebuild', 'example', '--target', 'html'], false);
    assert.equal(hash(visual), custom);
    const plan = JSON.parse(cli('plan', 'example', '--target', 'preview', '--use-existing-html', '--json').stdout);
    assert.equal(plan.steps.find(s => s.stage === 'visual').action, 'reuse');
    cli('rebuild', 'example', '--target', 'html', '--replace-html');
    assert.notEqual(hash(visual), custom);
    slides[0].page = true; writeFileSync(slidesFile, JSON.stringify(slides));
    const nodeError = run(process.execPath, [join(root, 'tools/presentation.mjs'), 'validate', 'example'], false);
    const pythonError = run(python, [join(root, 'tools/voice.py'), 'timeline', 'example'], false);
    assert.match(nodeError.stderr, /slides\[0\]\.page/); assert.match(pythonError.stderr, /slides\[0\]\.page/);
  } finally {rmSync(temp, {recursive: true, force: true});}
});
