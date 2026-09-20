import argparse, json, subprocess, hashlib
from common import load, read, write
p=argparse.ArgumentParser();p.add_argument('case_id');p.add_argument('--file');p.add_argument('--preview',action='store_true');a=p.parse_args()
case,meta,slides=load(a.case_id)
from pathlib import Path
video=Path(a.file) if a.file else case/meta['outputs']['video']
def run(args):return subprocess.run(args,check=True,capture_output=True,text=True).stdout
info=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)]))
v=next(s for s in info['streams'] if s['codec_type']=='video');fmt=meta['format'];num,den=map(int,v['r_frame_rate'].split('/'))
assert (v['width'],v['height'])==(fmt['width'],fmt['height']),'Wrong dimensions'
assert abs(num/den-fmt['fps'])<0.001,'Wrong fps'
assert v['codec_name']=='h264','Expected H.264'
if a.preview:
 prepared=read(case/'motion/src/prepared.json');expected=sum(p['frames'] for p in prepared['pages'])/prepared['fps']
 assert abs(float(info['format']['duration'])-expected)<2/fmt['fps']+0.1,'Preview duration mismatch'
if not a.preview:
 assert any(s['codec_type']=='audio' for s in info['streams']),'Missing narration stream'
 assert any(s['codec_type']=='subtitle' and s['codec_name']=='mov_text' for s in info['streams']),'Missing subtitles'
 timeline=read(case/'content/timeline.json');expected=timeline['durationInFrames']/fmt['fps']
 assert int(v['nb_frames'])==timeline['durationInFrames'],'Video frame count mismatch'
 assert abs(float(info['format']['duration'])-expected)<2/fmt['fps']+0.1,'Timeline duration mismatch'
run(['ffmpeg','-v','error','-i',str(video),'-f','null','-'])
record={'file':video.name,'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'streams':info['streams'],'decoded':True,'mode':'silent-preview' if a.preview else 'narrated','visualReview':'not performed by this script','listeningReview':'not performed by this script'}
write(case/'verification/media.json',record)
print('Technical checks passed; visual/listening review still required.')
