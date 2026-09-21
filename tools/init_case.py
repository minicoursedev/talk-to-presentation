import argparse, shutil, re
from common import ROOT, DATA_ROOT, data_path, case_path, write, read
p=argparse.ArgumentParser();p.add_argument('case_id');p.add_argument('--title',default='新的簡報');p.add_argument('--style',default='default');args=p.parse_args()
if not re.fullmatch(r'[\w-]+',args.case_id) or not args.case_id[0].isalnum(): p.error('Use letters, numbers, hyphens or underscores')
case=case_path(args.case_id)
if case.exists(): p.error('Case already exists; no files changed')
if not re.fullmatch(r'[\w-]+',args.style) or not args.style[0].isalnum(): p.error('Invalid style name')
style=data_path('shared/styles', args.style)
style_origin='user'
if args.style=='default' and not style.exists():
    style=ROOT/'shared/styles/default'
    style_origin='builtin'
if not style.is_dir() or style.is_symlink(): p.error('Style directory missing or symlinked')
if any(path.is_symlink() for path in style.rglob('*')): p.error('Style snapshot must not contain symlinks')
try:
    style_meta=read(style/'style.json')
    if not all(isinstance(style_meta.get(k),str) and style_meta[k].strip() for k in ('id','version')):
        raise ValueError('Style requires nonempty id and version')
    for suffix in ('', '.zh-CN', '.en'):
        if not (style/f'style{suffix}.md').is_file(): raise ValueError('Style requires three language documents')
except (OSError, ValueError, AttributeError) as e: p.error(str(e))
from init_data import initialize
initialize()
for name in ('content','assets/illustrations','audio','dist'): (case/name).mkdir(parents=True,exist_ok=True)
shutil.copytree(ROOT/'templates/motion',case/'motion')
shutil.copy2(ROOT/'templates/example.svg',case/'assets/illustrations/example.svg')
write(case/'case.json',{'id':args.case_id,'title':args.title,'format':{'width':1080,'height':1920,'fps':30},'timing':{'voiceOffsetFrames':10,'tailFrames':20,'backgroundGapSeconds':0.18},'outputs':{'takahashiHtml':f'dist/{args.case_id}.html','visualHtml':f'dist/{args.case_id}-v.html','video':f'dist/{args.case_id}.mp4'}})
shutil.copytree(style,case/'content/style')
meta=read(case/'case.json')
meta['style']={'id':style_meta['id'],'version':style_meta['version'],'source':style_origin+':'+args.style,'snapshot':'content/style'}
write(case/'case.json',meta)
write(case/'content/slides.json',[{'page':1,'screen':'從一個問題\n開始','narration':'從一個問題開始。','tone':'平靜敘述','backgroundNarration':None,'backgroundTone':None,'previewSeconds':3,'visual':{'illustrations':['assets/illustrations/example.svg'],'notes':'中性幾何範例，可替換'}},{'page':2,'screen':'把想法\n說清楚','narration':'把想法說清楚。','tone':'平靜敘述','backgroundNarration':None,'backgroundTone':None,'previewSeconds':3,'visual':{'illustrations':[],'notes':''}}])
for suffix in ('', '.zh-CN', '.en'):
    template = (ROOT / 'templates' / f'draft{suffix}.md').read_text(encoding='utf-8')
    (case / 'content' / f'draft{suffix}.md').write_text(template.replace('{{title}}', args.title), encoding='utf-8')
# Link installed dependencies, never store outputs in the dependency tree.
if (ROOT/'node_modules').exists(): (case/'motion/node_modules').symlink_to(ROOT/'node_modules', target_is_directory=True)
print(case)
