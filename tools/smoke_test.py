"""Portable source/timeline tests in an isolated directory. No real voices or TTS."""
import tempfile, subprocess, zipfile, sys, json, wave, math, array, hashlib
from pathlib import Path
from common import ROOT

def run(*args,cwd=None,ok=True):
 r=subprocess.run([str(x) for x in args],cwd=cwd,capture_output=True,text=True)
 if ok and r.returncode:raise RuntimeError(r.stdout+r.stderr)
 if not ok and r.returncode==0:raise RuntimeError('Expected failure')
 return r
with tempfile.TemporaryDirectory(prefix='handoff 測試 ') as temp:
 folder=Path(temp);archive=folder/'package.zip'
 run(sys.executable,ROOT/'tools/package.py',archive)
 with zipfile.ZipFile(archive) as z:z.extractall(folder)
 root=folder/'public';case=root/'cases/sample'
 run('node',root/'tools/takahashi-html/build.mjs','sample',cwd='/tmp')
 run('node',root/'tools/visual-html/build.mjs','sample',cwd='/tmp')
 for p in (case/'dist').glob('*.html'):
  assert '示範品牌' in p.read_text() and str(ROOT) not in p.read_text()
 r=run(sys.executable,root/'tools/voice.py','check','sample',ok=False,cwd='/tmp')
 assert 'missing shared/voice/reference-voice/' in r.stderr
 # Non-contiguous pages, main/background separation, fractional durations and repeated pages.
 slides=json.loads((case/'content/slides.json').read_text());slides[0]['page']=3;slides[0]['backgroundNarration']='背景測試。';slides[0]['backgroundTone']='平靜敘述';slides[1]['page']=8
 (case/'content/slides.json').write_text(json.dumps(slides,ensure_ascii=False))
 originals={}
 for kind,page,count in [('main',3,10317),('background',3,6159),('main',8,16001)]:
  path=case/'audio'/kind/f'page-{page}.wav';path.parent.mkdir(parents=True,exist_ok=True)
  data=array.array('h',(int(2000*math.sin(i*0.08)) for i in range(count)))
  with wave.open(str(path),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000);w.writeframes(data.tobytes())
  originals[path]=hashlib.sha256(path.read_bytes()).hexdigest()
 run(sys.executable,root/'tools/voice.py','timeline','sample',cwd='/tmp')
 timeline=json.loads((case/'content/timeline.json').read_text())
 with wave.open(str(case/'audio/timeline.wav')) as w:
  assert abs(w.getnframes()/w.getframerate()-timeline['durationInFrames']/30)<1/24000
 assert [p['page'] for p in timeline['pages']]==[3,8]
 assert (case/'content/narration.srt').read_text().count('-->')==3
 assert all(hashlib.sha256(p.read_bytes()).hexdigest()==digest for p,digest in originals.items())
 run(sys.executable,root/'tools/init_case.py','新案例',cwd='/tmp')
 assert (root/'cases/新案例/motion/src/scenes/Slides.tsx').exists()
 run(sys.executable,root/'tools/init_case.py','新案例',ok=False,cwd='/tmp')
 print('PASS: relocation, absolute invocation from unrelated cwd, both HTML builders, missing voices, independent new case, non-contiguous pages, separate captions, frame-aligned timing, unchanged source WAVs')
