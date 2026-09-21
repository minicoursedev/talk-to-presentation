import {realpathSync, existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {resolve, dirname, basename, isAbsolute, sep, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
export const capabilityRoot = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
function physical(path) {
  path = resolve(path);
  if (existsSync(path)) return realpathSync(path);
  const parent = dirname(path);
  return resolve(physical(parent), basename(path));
}
const within = (parent, child) => {
  const rel = relative(parent, child);
  return rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith('..' + sep));
};
const configured = process.env.PRESENTATION_DATA_ROOT;
if (configured && !isAbsolute(configured)) throw Error('PRESENTATION_DATA_ROOT must be absolute');
export const dataRoot = physical(configured || resolve(capabilityRoot, '../presentations'));
if (within(capabilityRoot, dataRoot) || within(dataRoot, capabilityRoot)) throw Error('Data root must be outside and separate from the capability repository');
export function dataPath(...parts) {
  const result = physical(resolve(dataRoot, ...parts));
  if (!within(dataRoot, result) || within(capabilityRoot, result)) throw Error('Path escapes user data root');
  return result;
}
export function casePath(id) {
  if (!/^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u.test(id)) throw Error('Invalid case id');
  return dataPath('cases', id);
}
export function caseFile(caseDir, path) {
  if (typeof path !== 'string' || isAbsolute(path)) throw Error('Expected case-relative path');
  const result = dataPath(relative(dataRoot, caseDir), path);
  if (!within(caseDir, result)) throw Error('Path escapes case directory');
  return result;
}
export async function readBrand() {
  const path = dataPath('brand.json');
  const brand = existsSync(path) ? JSON.parse(await readFile(path, 'utf8')) : {name: '示範品牌', logo: null};
  if (brand.logo) {
    if (isAbsolute(brand.logo)) throw Error('Brand logo must be data-root relative');
    dataPath(brand.logo);
  }
  return brand;
}
