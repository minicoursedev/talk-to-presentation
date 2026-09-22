import {loadCase} from './contract.mjs';
import {stat, realpath} from 'node:fs/promises';
import {resolve, isAbsolute, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

// Asset coverage is measurable; relevance and readability still need visual review.
export async function checkVisuals(caseDir, metadata, slides, requireImages = false) {
  const policy = metadata.visual?.requireImages;
  if (policy !== undefined && typeof policy !== 'boolean') {
    throw new Error('case.json visual.requireImages must be a boolean');
  }
  const required = requireImages || policy === true;
  if (!Array.isArray(slides) || slides.length === 0) throw new Error('No slides to check');
  const missing = [], errors = [], seen = new Set();
  let illustrated = 0;
  for (const slide of slides) {
    if (!Number.isInteger(slide.page) || slide.page < 1 || seen.has(slide.page)) {
      errors.push(`Invalid or duplicate page: ${slide.page}`);
    }
    seen.add(slide.page);
    const assets = slide.visual?.illustrations ?? [];
    if (!Array.isArray(assets)) {
      errors.push(`Page ${slide.page}: illustrations must be an array`);
      continue;
    }
    if (!assets.length) missing.push(slide.page);
    let firstValid = false;
    for (const [index, asset] of assets.entries()) {
      if (typeof asset !== 'string' || !asset.trim() || isAbsolute(asset) ||
          !resolve(caseDir, asset).startsWith(resolve(caseDir) + sep)) {
        errors.push(`Page ${slide.page}: invalid case-relative image path ${JSON.stringify(asset)}`);
        continue;
      }
      try {
        const actual = await realpath(resolve(caseDir, asset));
        if (!actual.startsWith((await realpath(caseDir)) + sep)) throw new Error('Image escapes case');
        const info = await stat(actual);
        if (!info.isFile() || info.size === 0) throw new Error('not a nonempty file');
        if (index === 0) firstValid = true;
      } catch {
        errors.push(`Page ${slide.page}: missing or empty image ${asset}`);
      }
    }
    // The current HTML renderer displays only illustrations[0].
    if (firstValid) illustrated++;
  }
  if (required && missing.length) errors.push(`Images required on every page; missing pages: ${missing.join(', ')}`);
  if (errors.length) throw new Error(errors.join('\n'));
  return {total: slides.length, illustrated, withoutImages: missing, requireImages: required};
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [id, ...flags] = process.argv.slice(2);
    if (!id || !/^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u.test(id) ||
        flags.some(flag => flag !== '--require-images')) {
      throw new Error('Usage: node tools/check-visuals.mjs <case-id> [--require-images]');
    }
    const {dir: caseDir, meta, slides} = loadCase(id);
    const result = await checkVisuals(caseDir, meta, slides, flags.includes('--require-images'));
    console.log(JSON.stringify(result, null, 2));
    console.log('Asset references checked. Image relevance, decoding and text visibility still require rendered review.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
