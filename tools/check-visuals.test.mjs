import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checkVisuals} from './check-visuals.mjs';

test('coverage respects the case contract, actual files and stable page identifiers', async () => {
  const root = await mkdtemp(join(tmpdir(), 'visual 檢查 '));
  try {
    await writeFile(join(root, 'image.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
    const slides = [{page: 3, visual: {illustrations: ['image.svg']}}, {page: 8}];
    assert.deepEqual(await checkVisuals(root, {}, slides), {
      total: 2, illustrated: 1, withoutImages: [8], requireImages: false,
    });
    await assert.rejects(checkVisuals(root, {visual: {requireImages: true}}, slides), /missing pages: 8/);
    await assert.rejects(checkVisuals(root, {}, slides, true), /missing pages: 8/);
    // Reuse can be intentional; it is not a coverage failure.
    slides[1].visual = {illustrations: ['image.svg']};
    assert.equal((await checkVisuals(root, {visual: {requireImages: true}}, slides)).illustrated, 2);
    slides[1].visual.illustrations = ['absent.png', 'image.svg'];
    await assert.rejects(checkVisuals(root, {}, slides), /Page 8: missing or empty image absent.png/);
    await writeFile(join(root, 'empty.png'), '');
    slides[1].visual.illustrations = ['empty.png'];
    await assert.rejects(checkVisuals(root, {}, slides), /empty image/);
    slides[1].visual.illustrations = ['../outside.png'];
    await assert.rejects(checkVisuals(root, {}, slides), /invalid case-relative/);
    slides[1].visual.illustrations = [];
    slides[1].page = 3;
    await assert.rejects(checkVisuals(root, {}, slides), /duplicate page/);
    await assert.rejects(checkVisuals(root, {visual: {requireImages: 'true'}}, slides), /must be a boolean/);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});
