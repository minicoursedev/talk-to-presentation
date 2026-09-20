from pathlib import Path
import json, re
ROOT = Path(__file__).resolve().parents[1]
def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))
def write(path, data):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
def load(case_id):
    if not re.fullmatch(r'[\w-]+', case_id) or case_id.startswith(('.', '-')):
        raise ValueError('Invalid case id')
    case = ROOT/'cases'/case_id
    meta, slides = read(case/'case.json'), read(case/'content/slides.json')
    pages = [s['page'] for s in slides]
    if not pages or len(set(pages)) != len(pages) or any(not isinstance(p,int) or p < 1 for p in pages):
        raise ValueError('Pages must be unique positive integers; array order controls playback')
    fmt = meta['format']
    if any(not isinstance(fmt[k],int) or fmt[k] <= 0 for k in ('width','height','fps')):
        raise ValueError('format width, height, fps must be positive integers')
    return case, meta, slides

def catalog():
    folder=ROOT/'shared/voice/reference-voice'
    rows={}
    for line in (folder/'README.md').read_text(encoding='utf-8').splitlines():
        m=re.match(r'^\|\s*\d+\s*\|\s*([^|]+?)\s*\|\s*`([^`]+\.wav)`\s*\|\s*(.*?)\s*\|\s*$',line)
        if m:
            tone,name,text=m.groups()
            if Path(name).name != name: raise ValueError('Reference WAV must be a filename')
            rows[tone]=(folder/name,text)
    return rows
