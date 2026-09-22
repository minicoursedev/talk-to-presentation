"""Validate, generate selected main/background narration, or rebuild existing WAVs."""
import argparse, math, re, wave, array, sys, hashlib
from pathlib import Path
from common import ROOT, DATA_ROOT, data_path, case_file, read, write, load, catalog, source_contract

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

def narration_parts(slide, kind):
    page=slide['page']
    if kind=='background':
        return [(None,slide['backgroundNarration'],slide['backgroundTone'])] if slide.get('backgroundNarration') else []
    text=slide.get('narration')
    if not text: return []
    parts=slide.get('narrationSegments')
    if parts is None: return [(None,text,slide.get('tone'))]
    # common.load validates segments using the shared executable contract.
    return [(i,p['text'],p['tone']) for i,p in enumerate(parts,1)]

def audio_path(case,page,kind,index):
    suffix=f'-segment-{index}' if index is not None else ''
    return case_file(case,f'audio/{kind}/page-{page}{suffix}.wav')

def rebuild(case,meta,slides):
    narration_source=source_contract(case.name)['timelineSource']
    fps=meta['format']['fps'];timing=meta['timing'];rate=None;combined=array.array('h');records=[];captions=[];cursor=0;inputs=[]
    for slide in slides:
        page=slide['page']; segments=[]
        for kind in ('main','background'):
            for index,text,tone in narration_parts(slide,kind):
                path=audio_path(case,page,kind,index)
                r,data=pcm(path)
                provenance=path.with_suffix('.json')
                if provenance.exists():
                    log=read(provenance)
                    expected=re.sub(r'\s+',' ',text).strip()
                    if log.get('ttsText')!=expected or log.get('tone')!=tone:
                        raise ValueError(f'{path}: narration or tone changed; regenerate this segment')
                if rate is None: rate=r
                if rate!=r: raise ValueError(f'Sample rate mismatch: {path}')
                inputs.append({'file':str(path.relative_to(case)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
                segments.append((kind,text,data))
        if not segments: raise ValueError(f'Page {page}: missing narration')
        pageaudio=array.array('h'); local=[]
        for index,(kind,text,data) in enumerate(segments):
            if index:
                gap=timing.get('narrationGapSeconds',timing['backgroundGapSeconds']) if kind=='main' else timing['backgroundGapSeconds']
                if not isinstance(gap,(int,float)) or not math.isfinite(gap) or gap<0: raise ValueError('Narration gaps must be nonnegative seconds')
                pageaudio.extend([0]*round(gap*rate))
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
    write(case/'content/timeline.json',{'fps':fps,'durationInFrames':cursor,'pages':records,'source':hashlib.sha256((case/'content/slides.json').read_bytes()+(case/'case.json').read_bytes()).hexdigest(),'narrationSource':narration_source,'inputs':inputs})
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
            try: parts=narration_parts(s,kind)
            except ValueError as e: errors.append(str(e));continue
            if kind=='main' and not parts: errors.append(f'Page {s["page"]}: missing narration')
            for index,part_text,tone in parts:
                if tone not in refs: errors.append(f'Page {s["page"]}: unknown tone {tone}');continue
                wav,ref_text=refs[tone]
                if not wav.is_file(): errors.append(f'Page {s["page"]}: missing {wav.relative_to(DATA_ROOT)}');continue
                if not ref_text: errors.append(f'Empty reference transcript: {tone}')
                try: pcm(wav)
                except Exception as e: errors.append(str(e))
                tts=re.sub(r'\s+',' ',part_text).strip()
                jobs.append((s,kind,index,tone,tts))
    if errors: raise SystemExit('\n'.join(errors))
    if a.action=='check': print('Voice inputs valid');return
    if not jobs: raise SystemExit('No selected narration to generate')
    # Preflight all targets before loading model or changing audio.
    for s,kind,index,tone,tts in jobs:
        target=audio_path(case,s['page'],kind,index)
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
    for s,kind,index,tone,tts in jobs:
        if tone not in prompts:
            wav,text=refs[tone]
            prompts[tone]=model.create_voice_clone_prompt(ref_audio=str(wav),ref_text=converter.convert(text))
        print(f'Page {s["page"]} {kind}{f" segment {index}" if index is not None else ""} [{tone}]: {tts}',flush=True)
        wavs,rate=model.generate_voice_clone(text=converter.convert(tts),language='Chinese',voice_clone_prompt=prompts[tone],non_streaming_mode=True)
        data=np.asarray(wavs[0]).reshape(-1)
        if not len(data) or not np.isfinite(data).all(): raise RuntimeError('Invalid TTS output')
        peak=float(np.max(np.abs(data)))
        if peak<0.001 or peak>1.2: raise RuntimeError('Silent or excessive TTS peak')
        gain=min(1.0,0.98/peak)
        if gain<1: data=data*gain
        target=audio_path(case,s['page'],kind,index)
        save(target,int(rate),array.array('h',np.rint(data*32767).astype(np.int16)))
        write(target.with_suffix('.json'),{'page':s['page'],'kind':kind,'segment':index,'tone':tone,'ttsText':tts,'model':config,'referenceSha256':hashlib.sha256(refs[tone][0].read_bytes()).hexdigest(),'outputPeakBeforeGain':peak,'outputGain':gain})
    print('Generated selected WAVs only. Listen, then run timeline to rebuild captions and timing.')
if __name__=='__main__': main()
