import platform, shutil, sys, subprocess
from common import ROOT, DATA_ROOT, data_path, read, catalog
issues=[]
print('Platform:',platform.platform(),platform.machine())
if platform.system()!='Darwin':issues.append('First release supports macOS only')
if sys.version_info[:2]!=(3,12):issues.append('Use Python 3.12 for the documented environment')
for tool in ('node','npm','ffmpeg','ffprobe','sox'):
 path=shutil.which(tool);print(tool,path or 'MISSING')
 if not path:issues.append('Install '+tool)
if shutil.which('node'):
 version=tuple(map(int,subprocess.check_output(['node','-p','process.versions.node'],text=True).strip().split('.')[:2]))
 if version<(20,19):issues.append('Canvas Commons requires Node >= 20.19.0; keep an existing compatible Node installation')
if platform.machine()!='arm64':issues.append('This lockfile is validated only for macOS Apple Silicon; Intel requires a separately verified dependency set')
if not (ROOT/'node_modules/@canvas-commons/core').is_dir():issues.append('Run npm ci')
print('User data:', DATA_ROOT)
brand=read(data_path('brand.json')) if data_path('brand.json').exists() else {'name':'示範品牌','logo':None}
if not brand.get('name'):issues.append('Set brand.name')
if brand.get('logo') and not data_path(brand['logo']).is_file():issues.append('Missing configured logo')
config=read(ROOT/'model.json')
print('Qwen model:', 'present' if (data_path(config['directory'])/'config.json').exists() else 'not downloaded (needed only for new speech)')
print('Reference voices supplied:',sum(p.exists() for p,t in catalog().values()))
for x in issues:print('ERROR:',x)
sys.exit(bool(issues))
