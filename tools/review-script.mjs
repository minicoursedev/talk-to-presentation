#!/usr/bin/env node
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {casePath, caseFile} from './data-paths.mjs';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const present = value => typeof value === 'string' && value.trim().length > 0;
export function renderReview(meta, slides, hash, generatedAt) {
  const seen = new Set();
  if (!Array.isArray(slides) || !slides.length) throw Error('No slides to review');
  for (const slide of slides) {
    if (!Number.isInteger(slide.page) || slide.page < 1 || seen.has(slide.page)) throw Error('Invalid or duplicate page');
    seen.add(slide.page);
    for (const field of ['screen','narration','backgroundNarration','tone','backgroundTone']) {
      if (slide[field] != null && typeof slide[field] !== 'string') throw Error(`Page ${slide.page}: invalid ${field}`);
    }
    if (slide.parts != null && (!Array.isArray(slide.parts) || slide.parts.some(p => !p || typeof p.text !== 'string'))) throw Error('Invalid screen parts');
  }
  const field = (label, value, fallback, cls='') => `<div class="field ${cls}"><h3>${label}</h3><div class="text${present(value)?'':' missing'}">${escape(present(value)?value:fallback)}</div></div>`;
  const cards = slides.map(s => {
    const screen = s.parts?.length ? s.parts.map(p => p.text).join('\n') : s.screen;
    return `<article id="page-${s.page}"><h2>第 ${s.page} 頁</h2><div class="columns">${field('畫面文字',screen,'尚未填寫','screen')}<div class="spoken">${field('主台詞',s.narration,'尚未填寫')}<p class="tone">主台詞語氣：${escape(present(s.tone)?s.tone:'未指定')}</p>${field('補充旁白',s.backgroundNarration,'未提供')}<p class="tone">補充旁白語氣：${escape(present(s.backgroundTone)?s.backgroundTone:'未指定')}</p></div></div></article>`;
  }).join('\n');
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(meta.title || meta.id)}｜台詞檢閱</title><style>
*{box-sizing:border-box}body{margin:0;background:#f5f4ef;color:#252b31;font:18px/1.8 system-ui,sans-serif}header,main{max-width:1120px;margin:auto;padding:28px}h1{font-size:1.8rem;line-height:1.4}h2{font-size:1.2rem}h3{font-size:.9rem;color:#59646a;margin:0 0 8px}p{margin:8px 0}.meta,.tone{font-size:.85rem;color:#59646a}.notice{border-left:3px solid #99742b;padding-left:14px}nav{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0}button,select{font:inherit;padding:8px 14px;border:1px solid #bac3c4;border-radius:8px;background:white;color:inherit}button[aria-pressed=true]{background:#234e52;color:white}button{cursor:pointer}article{background:white;border:1px solid #ddd;border-radius:12px;padding:24px;margin-bottom:24px;scroll-margin-top:20px}.columns{display:grid;grid-template-columns:1fr 1.4fr;gap:32px}.field{margin-bottom:14px}.text{white-space:pre-wrap;overflow-wrap:anywhere}.missing{color:#89672b}.tone{margin:0 0 24px}.continuous .screen{display:none}.continuous .columns{display:block}.continuous main{max-width:820px}details{font-size:.8rem;overflow-wrap:anywhere}a{color:#234e52}@media(max-width:700px){header,main{padding:16px}.columns{display:block}article{padding:18px}.screen{border-bottom:1px solid #ddd;padding-bottom:16px}}@media print{nav,details{display:none}body{background:white}article{break-inside:avoid;border:0;border-bottom:1px solid #ccc}}
</style></head><body><header><h1>${escape(meta.title || meta.id)} · 台詞檢閱</h1><p class="meta">${slides.length} 頁 · ${slides.filter(s=>!present(s.narration)).length} 頁尚未填寫主台詞</p><p class="notice">這是來源資料的閱讀版本，不代表台詞已確認，也不代替簡報畫面的視覺審核。修改請回到來源，再重新產生本頁。</p><nav aria-label="閱讀模式"><button type="button" id="compare" aria-pressed="true">逐頁對照</button><button type="button" id="continuous" aria-pressed="false">連續閱讀台詞</button><label>跳至頁面 <select id="jump"><option value="">選擇頁碼</option>${slides.map(s=>`<option value="page-${s.page}">${s.page}</option>`).join('')}</select></label></nav><details><summary>來源與產生時間</summary><p>來源：content/slides.json；產生時間：${escape(generatedAt)}</p><p>來源 SHA-256：${escape(hash)}</p><p>本頁為靜態快照，不會自動取得後續修改。</p></details></header><main>${cards}</main><script>
const compare=document.getElementById('compare'), continuous=document.getElementById('continuous');
function mode(on){document.body.classList.toggle('continuous',on);compare.setAttribute('aria-pressed',String(!on));continuous.setAttribute('aria-pressed',String(on));}
compare.addEventListener('click',()=>mode(false));continuous.addEventListener('click',()=>mode(true));document.getElementById('jump').addEventListener('change',e=>{if(e.target.value)document.getElementById(e.target.value).scrollIntoView();});
</script></body></html>`;
}
export async function buildReview(id) {
  const dir=casePath(id);
  const raw=await readFile(caseFile(dir,'content/slides.json'));
  const meta=JSON.parse(await readFile(caseFile(dir,'case.json'),'utf8'));
  const result=renderReview(meta,JSON.parse(raw),createHash('sha256').update(raw).digest('hex'),new Date().toISOString());
  const output=caseFile(dir,'dist/script-review.html');
  await mkdir(caseFile(dir,'dist'),{recursive:true});
  await writeFile(output,result);
  return output;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {if(process.argv.length!==3)throw Error('Usage: node tools/review-script.mjs <case-id>');console.log(await buildReview(process.argv[2]));}
  catch(error){console.error(error.message);process.exitCode=1;}
}
