import argparse, shutil, re
from common import ROOT, write
p=argparse.ArgumentParser();p.add_argument('case_id');p.add_argument('--title',default='新的簡報');args=p.parse_args()
if not re.fullmatch(r'[\w-]+',args.case_id) or not args.case_id[0].isalnum(): p.error('Use letters, numbers, hyphens or underscores')
case=ROOT/'cases'/args.case_id
if case.exists(): p.error('Case already exists; no files changed')
for name in ('content','assets/illustrations','audio','dist'): (case/name).mkdir(parents=True,exist_ok=True)
shutil.copytree(ROOT/'templates/motion',case/'motion')
shutil.copy2(ROOT/'templates/example.svg',case/'assets/illustrations/example.svg')
write(case/'case.json',{'id':args.case_id,'title':args.title,'format':{'width':1080,'height':1920,'fps':30},'timing':{'voiceOffsetFrames':10,'tailFrames':20,'backgroundGapSeconds':0.18},'outputs':{'takahashiHtml':f'dist/{args.case_id}.html','visualHtml':f'dist/{args.case_id}-v.html','video':f'dist/{args.case_id}.mp4'}})
write(case/'content/slides.json',[{'page':1,'screen':'從一個問題\n開始','narration':'從一個問題開始。','tone':'平靜敘述','backgroundNarration':None,'backgroundTone':None,'previewSeconds':3,'visual':{'illustrations':['assets/illustrations/example.svg'],'notes':'中性幾何範例，可替換'}},{'page':2,'screen':'把想法\n說清楚','narration':'把想法說清楚。','tone':'平靜敘述','backgroundNarration':None,'backgroundTone':None,'previewSeconds':3,'visual':{'illustrations':[],'notes':''}}])
for suffix in ('', '.zh-CN', '.en'):
    template = (ROOT / 'templates' / f'draft{suffix}.md').read_text(encoding='utf-8')
    (case / 'content' / f'draft{suffix}.md').write_text(template.replace('{{title}}', args.title), encoding='utf-8')
print(case)
