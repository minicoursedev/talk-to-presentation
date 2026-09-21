"""Validate, generate selected main/background narration, or rebuild existing WAVs."""
import argparse, math, re, wave, array, sys, hashlib
from pathlib import Path
from common import ROOT, DATA_ROOT, data_path, case_file, read, write, load, catalog

def pcm(path):
    with wave.open(str(path),'rb') as w:
        if w.getsampwidth()!=2 or w.getnchannels()!=1 or w.getcomptype()!='NONE':
            raise ValueError(f'{path}: expected mono PCM16 WAV')
        rate=w.getframerate(); data=array.array('h',w.readframes(w.getnframes()))
    if sys.byteorder!='little': data.byteswap()
    if not data or not any(data): raise ValueError(f'{path}: empty or silent audio')
    if max(abs(x) for x in data)>=32767: raise ValueError(f'{path}: clipping')
    return rate,data

def save(path,rate,data):
    path=data_path(path)
    path.parent.mkdir(parents=True,exist_ok=True)
    out=array.array('h',data)
    if sys.byteorder!='little': out.byteswap()
    with wave.open(str(path),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(out.tobytes())

def stamp(t):
    ms=round(t*1000)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'

def rebuild(case,meta,slides):
    fps=meta['format']['fps'];timing=meta['timing'];rate=None;combined=array.array('h');records=[];captions=[];cursor=0;inputs=[]
    for slide in slides:
        page=slide['page']; segments=[]
        for kind,field in [('main','narration'),('background','backgroundNarration')]:
            if not slide.get(field): continue
            path=case_file(case,f'audio/{kind}/page-{page}.wav')
            r,data=pcm(path)
            provenance=path.with_suffix('.json')
            if provenance.exists():
                log=read(provenance)
                expected=re.sub(r'\s+',' ',slide[field]).strip()
                tone=slide['tone' if kind=='main' else 'backgroundTone']
                if log.get('ttsText')!=expected or log.get('tone')!=tone:
                    raise ValueError(f'{path}: narration or tone changed; regenerate this segment')
            if rate is None: rate=r
            if rate!=r: raise ValueError(f'Sample rate mismatch: {path}')
            inputs.append({'file':str(path.relative_to(case)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
            segments.append((kind,slide[field],data))
        if not segments: raise ValueError(f'Page {page}: missing narration')
        pageaudio=array.array('h'); local=[]
        for index,(kind,text,data) in enumerate(segments):
            if index: pageaudio.extend([0]*round(timing['backgroundGapSeconds']*rate))
            local.append((text,len(pageaudio),len(data)))
            pageaudio.extend(data)
        frames=timing['voiceOffsetFrames']+math.ceil(len(pageaudio)*fps/rate)+timing['tailFrames']
        # Quantize absolute boundaries, avoiding per-page rounding accumulation.
        start=round(cursor*rate/fps);end=round((cursor+frames)*rate/fps)
        voice=round((cursor+timing['voiceOffsetFrames'])*rate/fps)
        combined.extend([0]*(voice-len(combined)));combined.extend(pageaudio);combined.extend([0]*(end-len(combined)))
        save(case/'audio/combined'/f'page-{page}.wav',rate,pageaudio)
        for text,offset,count in local:
            captions.append(f'{len(captions)+1}\n{stamp((voice+offset)/rate)} --> {stamp((voice+offset+count)/rate)}\n{text}\n')
        records.append({'page':page,'startFrame':cursor,'frames':frames,'voiceStartFrame':cursor+timing['voiceOffsetFrames']})
        cursor+=frames
    save(case/'audio/timeline.wav',rate,combined)
    write(case/'content/timeline.json',{'fps':fps,'durationInFrames':cursor,'pages':records,'source':hashlib.sha256((case/'content/slides.json').read_bytes()+(case/'case.json').read_bytes()).hexdigest(),'inputs':inputs})
    (case/'content/narration.srt').write_text('\n'.join(captions),encoding='utf-8')
    print(f'Rebuilt {len(records)} pages, {cursor} frames, {len(combined)/rate:.3f}s; no TTS called')

def main():
    p=argparse.ArgumentParser();p.add_argument('action',choices=['check','generate','timeline']);p.add_argument('case_id');p.add_argument('--kind',choices=['main','background'],default='main');p.add_argument('--pages',nargs='+',type=int);p.add_argument('--replace',action='store_true');a=p.parse_args()
    case,meta,slides=load(a.case_id)
    if a.action=='timeline': rebuild(case,meta,slides);return
    selected=[s for s in slides if not a.pages or s['page'] in a.pages]
    if a.pages and set(a.pages)-{s['page'] for s in slides}: p.error('Unknown page number')
    refs=catalog();errors=[];jobs=[]
    kinds=['main','background'] if a.action=='check' else [a.kind]
    for s in selected:
        for kind in kinds:
            field,tonefield=('narration','tone') if kind=='main' else ('backgroundNarration','backgroundTone')
            if not s.get(field):
                if kind=='main': errors.append(f'Page {s["page"]}: missing narration')
                continue
            tone=s.get(tonefield)
            if tone not in refs: errors.append(f'Page {s["page"]}: unknown tone {tone}');continue
            wav,text=refs[tone]
            if not wav.is_file(): errors.append(f'Page {s["page"]}: missing {wav.relative_to(DATA_ROOT)}');continue
            if not text: errors.append(f'Empty reference transcript: {tone}')
            try: pcm(wav)
            except Exception as e: errors.append(str(e))
            tts=re.sub(r'\s+',' ',s[field]).strip()
            jobs.append((s,kind,tone,tts))
    if errors: raise SystemExit('\n'.join(errors))
    if a.action=='check': print('Voice inputs valid');return
    if not jobs: raise SystemExit('No selected narration to generate')
    # Preflight all targets before loading model or changing audio.
    for s,kind,tone,tts in jobs:
        target=case_file(case,f'audio/{kind}/page-{s["page"]}.wav')
        if target.exists() and not a.replace: raise SystemExit(f'{target}: exists; use --replace only for authorized regeneration')
    config=read(ROOT/'model.json'); modeldir=data_path(config['directory'])
    if not (modeldir/'download-source.json').exists() or read(modeldir/'download-source.json') != config:
        raise SystemExit('Model provenance missing or changed. Run tools/download_model.py for the configured revision')
    if not (modeldir/'config.json').exists(): raise SystemExit('Model missing. Run: .venv/bin/python tools/download_model.py')
    import os
    os.environ['HF_HUB_OFFLINE']='1'
    import numpy as np
    import torch
    from opencc import OpenCC
    from qwen_tts import Qwen3TTSModel
    torch.manual_seed(42);converter=OpenCC('t2s')
    model=Qwen3TTSModel.from_pretrained(str(modeldir),device_map='cpu',dtype=torch.float32,attn_implementation='eager')
    prompts={}
    for s,kind,tone,tts in jobs:
        if tone not in prompts:
            wav,text=refs[tone]
            prompts[tone]=model.create_voice_clone_prompt(ref_audio=str(wav),ref_text=converter.convert(text))
        print(f'Page {s["page"]} {kind} [{tone}]: {tts}',flush=True)
        wavs,rate=model.generate_voice_clone(text=converter.convert(tts),language='Chinese',voice_clone_prompt=prompts[tone],non_streaming_mode=True)
        data=np.asarray(wavs[0]).reshape(-1)
        if not len(data) or not np.isfinite(data).all() or np.max(np.abs(data))<0.001 or np.max(np.abs(data))>=1: raise RuntimeError('Invalid/silent/clipped TTS output')
        target=case_file(case,f'audio/{kind}/page-{s["page"]}.wav')
        save(target,int(rate),array.array('h',np.rint(data*32767).astype(np.int16)))
        write(target.with_suffix('.json'),{'page':s['page'],'kind':kind,'tone':tone,'ttsText':tts,'model':config,'referenceSha256':hashlib.sha256(refs[tone][0].read_bytes()).hexdigest()})
    print('Generated selected WAVs only. Listen, then run timeline to rebuild captions and timing.')
if __name__=='__main__': main()
