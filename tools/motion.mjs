import {spawnSync} from 'node:child_process';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const [action,id,...args]=process.argv.slice(2);
if(!['build','start'].includes(action)||!id||!/^[\p{L}\p{N}_-]+$/u.test(id)) throw Error('Usage: node tools/motion.mjs build|start <case-id> [Vite flags]');
const cwd=resolve(root,'cases',id,'motion');
function run(bin,argv){const r=spawnSync(process.execPath,[resolve(root,'node_modules',bin),...argv],{cwd,stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status??1);}
if(action==='build'){run('typescript/bin/tsc',['--noEmit']);run('vite/bin/vite.js',['build']);}
else run('vite/bin/vite.js',['--host','127.0.0.1',...args]);
