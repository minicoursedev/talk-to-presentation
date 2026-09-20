"""Create a source-only ZIP; never include reference WAVs, environments or model weights."""
import argparse, zipfile, hashlib
from pathlib import Path
from common import ROOT
p=argparse.ArgumentParser();p.add_argument('output',type=Path);args=p.parse_args()
if not args.output.is_absolute():p.error('Output ZIP must be an absolute path')
allowed={'.agents','docs','tools','templates','shared','cases'}
rootfiles={'README.md','README.zh-CN.md','README.en.md','AGENTS.md','AGENTS.zh-CN.md','AGENTS.en.md','.gitignore','brand.json','model.json','package.json','package-lock.json','requirements.in','requirements-macos.lock.txt'}
files=[]
candidates=[p for name in allowed for p in (ROOT/name).rglob('*')] + [ROOT/name for name in rootfiles]
for path in candidates:
 if not path.is_file():continue
 rel=path.relative_to(ROOT)
 if rel.parts[0] not in allowed and str(rel) not in rootfiles:continue
 if any(x in {'__pycache__','node_modules','output','verification','public'} for x in rel.parts):continue
 if rel.parts[0]=='cases' and len(rel.parts)>1 and rel.parts[1]!='sample':continue
 if rel.parts[0]=='cases' and ('audio' in rel.parts or 'dist' in rel.parts or path.name in {'prepared.json','project.meta'}):continue
 if path.suffix.lower() in {'.wav','.mp3','.mp4','.pyc'}:continue
 if path.is_symlink():raise SystemExit(f'Symlink not allowed in handoff: {rel}')
 files.append((path,rel))
args.output.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(args.output,'w',zipfile.ZIP_DEFLATED) as archive:
 for path,rel in sorted(files):archive.write(path,Path('public')/rel)
 manifest=''.join(hashlib.sha256(path.read_bytes()).hexdigest()+'  '+str(rel)+'\n' for path,rel in sorted(files))
 archive.writestr('public/MANIFEST.sha256',manifest)
 (ROOT/'MANIFEST.sha256').write_text(manifest,encoding='utf-8')
print(f'{args.output}: {len(files)} files, SHA-256 {hashlib.sha256(args.output.read_bytes()).hexdigest()}')
