import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolvePalette} from './brand-palette.mjs';
test('arbitrary palettes use semantic roles and retain existing user palettes', () => {
  const colors = {primary:'#d84b29', accent:'#2396ae', surface:'#f7f5ee', text:'#232323'};
  assert.deepEqual(resolvePalette(colors), colors);
  assert.deepEqual(resolvePalette({purple:colors.primary,yellow:colors.accent,cream:colors.surface,darkGreen:colors.text}), colors);
  assert.equal(resolvePalette(undefined), null);
  assert.throws(() => resolvePalette({...colors,primary:'red;display:none'}));
  assert.throws(() => resolvePalette({primary:'#d84b29'}));
});
