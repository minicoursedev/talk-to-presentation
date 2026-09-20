import platform, shutil, sys, subprocess
from common import ROOT, read, catalog
issues=[]
print('Platform:',platform.platform(),platform.machine())
if platform.system()!='Darwin':issues.append('First release supports macOS only')
if sys.version_info[:2]!=(3,12):issues.append('Use Python 3.12 for the documented environment')
for tool in ('node','npm','ffmpeg','ffprobe','sox'):
 path=shutil.which(tool);print(tool,path or 'MISSING')
 if not path:issues.append('Install '+tool)
if platform.machine()!='arm64':issues.append('This lockfile is validated only for macOS Apple Silicon; Intel requires a separately verified dependency set')
if not (ROOT/'node_modules/@motion-canvas/core').is_dir():issues.append('Run npm ci')
brand=read(ROOT/'brand.json')
if not brand.get('name'):issues.append('Set brand.name')
if brand.get('logo') and not (ROOT/brand['logo']).is_file():issues.append('Missing configured logo')
config=read(ROOT/'model.json')
print('Qwen model:', 'present' if (ROOT/config['directory']/'config.json').exists() else 'not downloaded (needed only for new speech)')
print('Reference voices supplied:',sum(p.exists() for p,t in catalog().values()))
for x in issues:print('ERROR:',x)
sys.exit(bool(issues))
