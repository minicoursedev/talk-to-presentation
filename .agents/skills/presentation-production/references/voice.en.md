[繁體中文](voice.md) | [简体中文](voice.zh-CN.md) | [English](voice.en.md)

# Voice production and timing

First follow the project's `docs/SETUP.md` to install `.venv` and download the pinned Qwen revision. The macOS first release uses CPU/float32/eager; it does not assume CUDA or MPS availability. Generation time depends on the machine, text, and model; no fixed speed is promised.

Reference WAVs are not included. The user places them in `shared/voice/reference-voice/`. Filenames, tone identifiers, and transcripts must exactly match the table in that directory's canonical `README.md`. Recipients may edit that table to provide their own tones; they are not limited to the existing catalog. Supply only the tones actually used by the case.
The tools require mono PCM16 WAVs. Convert a different source format into a separate file:

```bash
ffmpeg -i "/absolute/path/reference.wav" -ac 1 -c:a pcm_s16le "$PROJECT_ROOT/shared/voice/reference-voice/平靜敘述.wav"
python3 "$PROJECT_ROOT/tools/voice.py" check my-talk
```

If a WAV or transcript is missing, stop and list what is missing; do not substitute someone else's voice. Replace my-talk in these commands with the case ID.

After confirming each page's main narration, main tone, background narration, and background tone, and obtaining permission to generate speech:

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" generate my-talk --kind main
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" generate my-talk --kind background
```

Omit the second command when there is no background narration. Use `--pages 2 5` to generate only selected pages. Existing audio is protected from overwriting by default. Add `--replace` only for user-requested regeneration, and retain a copy of the files being replaced first. WAVs outside the selected pages remain unchanged. Main and background generation are independent; they do not merge or rewrite the text.

Visual line breaks must not become TTS pause instructions. The tool collapses whitespace into single spaces, then applies OpenCC t2s to model input while preserving Traditional Chinese display text and subtitles. The JSON beside each WAV records the actual single-line text, tone, model revision, and reference-audio hash. Keep these records when reusing WAVs. Speech synthesis is not guaranteed to be byte-for-byte reproducible.

Listen to each page for text, tone, pauses, and endings. Then rebuild timing without calling Qwen:

```bash
python3 "$PROJECT_ROOT/tools/voice.py" timeline my-talk
```

This step uses the Python standard library to check mono PCM16, non-silence, no clipping, and a consistent sample rate. Main/background gaps follow case timing. Page durations are calculated from the actual WAVs and padded to exact video frame boundaries to prevent cross-page drift. Subtitles cover the main and background narration separately; titles do not replace spoken captions.

After changing narration, tones, or WAVs, regenerate the affected segments and rebuild timing and video. prepare-motion rejects sources or WAV hashes that do not match the timeline. File existence or passing technical checks does not mean speech has passed listening acceptance.

Documentation language does not change speech language. The current generator fixes `language="Chinese"`; reading the English documentation does not enable English narration. Other speech languages require a separate implementation change and validation.
