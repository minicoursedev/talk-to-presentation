import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateSources, timelineSource} from './contract.mjs';

const source = () => ({meta: {id: 'example', format: {width: 1080, height: 1920, fps: 30}, timing: {voiceOffsetFrames: 10, tailFrames: 20, backgroundGapSeconds: .18}, outputs: {visualHtml: 'dist/example.html', video: 'dist/example.mp4'}},
  slides: [{page: 8, screen: '畫面', narration: '先理解。再解決。', narrationSegments: [{text: '先理解。', tone: '平靜'}, {text: '再解決。', tone: '堅定'}]}, {page: 3, narration: '結尾', tone: '平靜'}]});

test('shared contract retains extensions and rejects invalid values before production', () => {
  const {meta, slides} = source();
  meta.production = {mode: 'imported-html'}; slides[0].animation = {custom: true};
  const before = JSON.stringify({meta, slides});
  validateSources(meta, slides);
  assert.equal(JSON.stringify({meta, slides}), before);
  for (const mutate of [
    ({meta}) => meta.format.fps = true,
    ({meta}) => meta.timing.tailFrames = -1,
    ({meta}) => meta.timing.backgroundGapSeconds = Infinity,
    ({meta}) => meta.outputs.video = meta.outputs.visualHtml,
    ({slides}) => slides[1].page = 8,
    ({slides}) => slides[0].narration = '不同台詞',
    ({slides}) => slides[0].parts = [{runs: [{text: 9}]}],
  ]) {
    const values = source(); mutate(values);
    assert.throws(() => validateSources(values.meta, values.slides));
  }
});

test('timeline invalidates only for narration, timing, page order or fps', () => {
  const {meta, slides} = source(), hash = timelineSource(meta, slides);
  meta.title = '新標題'; meta.format.width = 1920; meta.format.height = 1080;
  meta.outputs.video = 'dist/renamed.mp4'; meta.presentation = {status: 'review'};
  slides[0].screen = '修正畫面'; slides[0].visual = {notes: '新圖', illustrations: ['assets/new.png']};
  assert.equal(timelineSource(meta, slides), hash);
  meta.timing.narrationGapSeconds = meta.timing.backgroundGapSeconds;
  assert.equal(timelineSource(meta, slides), hash, 'explicit default and implicit default are equivalent');
  for (const mutate of [
    ({meta}) => meta.format.fps = 60,
    ({meta}) => meta.timing.tailFrames++,
    ({meta}) => meta.timing.narrationGapSeconds = .7,
    ({slides}) => slides.reverse(),
    ({slides}) => slides[0].narrationSegments[0].tone = '熱情',
    ({slides}) => slides[1].narration = '另一個結尾',
    ({slides}) => slides[1].backgroundNarration = '背景',
  ]) {
    const value = structuredClone({meta, slides}); mutate(value);
    assert.notEqual(timelineSource(value.meta, value.slides), hash);
  }
});
