from pathlib import Path
import json, re, os
ROOT = Path(__file__).resolve().parents[1]
configured = os.environ.get('PRESENTATION_DATA_ROOT')
if configured and not Path(configured).is_absolute():
    raise ValueError('PRESENTATION_DATA_ROOT must be absolute')
DATA_ROOT = Path(configured or ROOT.parent/'presentations').resolve()
if DATA_ROOT.is_relative_to(ROOT) or ROOT.is_relative_to(DATA_ROOT):
    raise ValueError('Data root must be outside and separate from the capability repository')
def data_path(*parts):
    path = DATA_ROOT.joinpath(*parts).resolve()
    if not path.is_relative_to(DATA_ROOT) or path.is_relative_to(ROOT):
        raise ValueError('Path escapes user data root')
    return path
def case_path(case_id):
    if not re.fullmatch(r'[\w-]+', case_id) or not case_id[0].isalnum():
        raise ValueError('Invalid case id')
    return data_path('cases', case_id)
def case_file(case, name):
    if Path(name).is_absolute(): raise ValueError('Expected case-relative path')
    path = data_path(case.relative_to(DATA_ROOT), name)
    if not path.is_relative_to(case): raise ValueError('Path escapes case directory')
    return path
def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))
def write(path, data):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
def load(case_id):
    if not re.fullmatch(r'[\w-]+', case_id) or case_id.startswith(('.', '-')):
        raise ValueError('Invalid case id')
    case = case_path(case_id)
    meta, slides = read(case/'case.json'), read(case/'content/slides.json')
    pages = [s['page'] for s in slides]
    if not pages or len(set(pages)) != len(pages) or any(not isinstance(p,int) or p < 1 for p in pages):
        raise ValueError('Pages must be unique positive integers; array order controls playback')
    fmt = meta['format']
    if any(not isinstance(fmt[k],int) or fmt[k] <= 0 for k in ('width','height','fps')):
        raise ValueError('format width, height, fps must be positive integers')
    for name in ('audio', 'content', 'dist', 'verification', 'motion/public', 'motion/src'):
        case_file(case, name)
    for output in meta['outputs'].values(): case_file(case, output)
    return case, meta, slides

def catalog(folder=None):
    folder=Path(folder) if folder is not None else data_path('shared/voice/reference-voice')
    rows={}
    if not (folder/'README.md').exists(): return rows
    for line in (folder/'README.md').read_text(encoding='utf-8').splitlines():
        m=re.match(r'^\|\s*\d+\s*\|\s*([^|]+?)\s*\|\s*`([^`]+\.wav)`\s*\|\s*(.*?)\s*\|\s*$',line)
        if m:
            tone,name,text=m.groups()
            if Path(name).name != name: raise ValueError('Reference WAV must be a filename')
            wav=(folder/name).resolve()
            if not wav.is_relative_to(folder.resolve()): raise ValueError('Reference WAV escapes catalog directory')
            rows[tone]=(wav,text)
    return rows
