import argparse, subprocess, shutil
from common import load, case_file
p=argparse.ArgumentParser();p.add_argument('case_id');p.add_argument('exporter_mp4');a=p.parse_args()
case,meta,slides=load(a.case_id)
out=case_file(case,meta['outputs']['video']);out.parent.mkdir(parents=True,exist_ok=True)
subprocess.run(['ffmpeg','-y','-i',a.exporter_mp4,'-i',str(case/'content/narration.srt'),'-map','0:v:0','-map','0:a:0','-map','1:0','-c:v','copy','-c:a','copy','-c:s','mov_text','-metadata:s:s:0','language=zho','-movflags','+faststart',str(out)],check=True)
print(out)
