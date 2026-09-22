import {casePath, caseFile} from './data-paths.mjs';
import {loadCase} from './contract.mjs';
import {existsSync, symlinkSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const [action,id,...args]=process.argv.slice(2);
if(!['build','start'].includes(action)||!id||!/^[\p{L}\p{N}_-]+$/u.test(id)) throw Error('Usage: node tools/motion.mjs build|start <case-id> [Vite flags]');
const cwd=caseFile(loadCase(id).dir,'motion');
for (const output of ['output','dist','src']) caseFile(casePath(id),'motion/'+output);
if (!existsSync(resolve(cwd,'node_modules'))) symlinkSync(resolve(root,'node_modules'),resolve(cwd,'node_modules'),'dir');
function run(bin,argv){const r=spawnSync(process.execPath,[resolve(root,'node_modules',bin),...argv],{cwd,stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status??1);}
if(action==='build'){run('typescript/bin/tsc',['--noEmit']);run('vite/bin/vite.js',['build']);}
else run('vite/bin/vite.js',['--host','127.0.0.1',...args]);
