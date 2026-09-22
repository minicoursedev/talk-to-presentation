import {dataRoot, dataPath, casePath, caseFile} from './data-paths.mjs';
import {readFile, writeFile, mkdir, copyFile, stat} from 'node:fs/promises';
import {resolve, dirname, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {checkVisuals} from './check-visuals.mjs';
const root=dataRoot;
const id=process.argv[2], preview=process.argv.includes('--preview');
if(!id || !/^[\p{L}\p{N}_-]+$/u.test(id)) throw Error('Usage: node tools/prepare-motion.mjs <case-id> [--preview]');
const caseDir=casePath(id);
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const meta=await json(resolve(caseDir,'case.json')), slides=await json(resolve(caseDir,'content/slides.json'));
for (const path of Object.values(meta.outputs)) caseFile(caseDir,path);
caseFile(caseDir,'motion/src');
caseFile(caseDir,'motion/timeline.wav');
await checkVisuals(caseDir, meta, slides);
let timeline;
if(!preview){
  timeline=await json(resolve(caseDir,'content/timeline.json'));
  const source=createHash('sha256').update(await readFile(resolve(caseDir,'content/slides.json'))).update(await readFile(resolve(caseDir,'case.json'))).digest('hex');
  if(timeline.source!==source) throw Error('Timeline stale: rebuild with tools/voice.py timeline');
  for(const input of timeline.inputs){
    const hash=createHash('sha256').update(await readFile(caseFile(caseDir,input.file))).digest('hex');
    if(hash!==input.sha256) throw Error('WAV changed: rebuild timeline');
  }
}
const output=caseFile(caseDir,'motion/public');await mkdir(resolve(output,'slides'),{recursive:true});
const errors=[];
const server=createServer(async(req,res)=>{
  try{
    const p=dataPath('.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(!p.startsWith(root+sep)) throw Error('Outside project');
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'})[extname(p)]||'application/octet-stream');
    res.end(await readFile(p));
  }catch{res.statusCode=404;res.end('Not found');}
});
await new Promise((r,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',r);});
let browser;
try{
  browser=await chromium.launch({headless:true, ...(process.env.BROWSER_EXECUTABLE ? {executablePath:process.env.BROWSER_EXECUTABLE} : {})});
  const page=await browser.newPage({viewport:{width:meta.format.width,height:meta.format.height},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('response',r=>{if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`)});
  const port=server.address().port;
  await page.goto(`http://127.0.0.1:${port}/cases/${encodeURIComponent(id)}/${meta.outputs.visualHtml}`,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.addStyleTag({content:'.progress {display:none !important;}'});
  const progress=page.locator('#progress, #progressBar').first();
  const frame=page.locator('.short-frame, .slide.active').first();
  if(await progress.count()===0) throw Error('Visual HTML needs #progress or #progressBar navigation');
  if(await frame.count()===0) throw Error('Visual HTML needs .short-frame or .slide.active frame');
  const pages=[];
  for(let index=0;index<slides.length;index++){
    await progress.evaluate((el,n)=>{el.value=String(n);el.dispatchEvent(new Event('input'));},index+1);
    await page.evaluate(async()=>{await Promise.all([...document.images].map(im=>im.decode()));});
    await frame.screenshot({path:resolve(output,`slides/page-${slides[index].page}.png`)});
    const record=preview ? null : timeline.pages[index];
    if(record && record.page!==slides[index].page) throw Error('Timeline page order mismatch');
    pages.push({page:slides[index].page,frames:record?.frames ?? Math.ceil((slides[index].previewSeconds??3)*meta.format.fps)});
  }
  if(errors.length) throw Error(errors.join('\n'));
  if(!preview) await copyFile(resolve(caseDir,'audio/timeline.wav'),resolve(caseDir,'motion/timeline.wav'));
  await writeFile(resolve(caseDir,'motion/src/prepared.json'),JSON.stringify({...meta.format,audio:!preview,pages},null,2)+'\n');
  await writeFile(resolve(caseDir,'motion/src/project.meta'),JSON.stringify({version:0,shared:{background:null,range:[0,pages.reduce((sum,p)=>sum+p.frames,0)/meta.format.fps],size:{x:meta.format.width,y:meta.format.height},audioOffset:0},preview:{fps:meta.format.fps,resolutionScale:1},rendering:{fps:meta.format.fps,resolutionScale:1,colorSpace:'srgb',exporter:{name:'@canvas-commons/ffmpeg',options:{fastStart:true,includeAudio:!preview}}}},null,2)+'\n');
  console.log(`Prepared ${pages.length} pages (${preview?'SILENT PREVIEW ONLY':'with narration'}).`);
}finally{await browser?.close();await new Promise(r=>server.close(r));}
