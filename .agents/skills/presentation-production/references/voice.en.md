[繁體中文](voice.md) | [简体中文](voice.zh-CN.md) | [English](voice.en.md)

[Data storage rules](../../../../docs/DATA_LAYOUT.en.md)：All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root. The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

# Voice production and timing

First follow the project's `docs/SETUP.md` to install `.venv` and download the pinned Qwen revision. The macOS first release uses CPU/float32/eager; it does not assume CUDA or MPS availability. Generation time depends on the machine, text, and model; no fixed speed is promised.

Reference WAVs are not included. The user places them in `shared/voice/reference-voice/`. Filenames, tone identifiers, and transcripts must exactly match the table in that directory's canonical `README.md`. Recipients may edit that table to provide their own tones; they are not limited to the existing catalog. Supply only the tones actually used by the case.
The tools require mono PCM16 WAVs. Convert a different source format into a separate file:

```bash
ffmpeg -i "/absolute/path/reference.wav" -ac 1 -c:a pcm_s16le "$PRESENTATION_DATA_ROOT/shared/voice/reference-voice/平靜敘述.wav"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" check my-talk
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
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" timeline my-talk
```

This step uses the Python standard library to check mono PCM16, non-silence, no clipping, and a consistent sample rate. Main/background gaps follow case timing. Page durations are calculated from the actual WAVs and padded to exact video frame boundaries to prevent cross-page drift. Subtitles cover the main and background narration separately; titles do not replace spoken captions.

After changing narration, tones, or WAVs, regenerate the affected segments and rebuild timing and video. prepare-motion rejects sources or WAV hashes that do not match the timeline. File existence or passing technical checks does not mean speech has passed listening acceptance.

Documentation language does not change speech language. The current generator fixes `language="Chinese"`; reading the English documentation does not enable English narration. Other speech languages require a separate implementation change and validation.

## Reuse voice mappings and change speech speed

- Read the actual voice catalog before use. Filenames need not equal tone names; numbered WAVs are valid when tone/transcript mappings are explicit. If a case tone is absent, first check whether it is a rename of the same tone; do not substitute another emotion arbitrarily. Preserve original recordings separately from format-converted copies.
- Lowering volume can keep output below a numerical peak threshold; it cannot repair clipping already present in a source. Do not call audio repaired merely because it passes the peak check. Listen and report recording problems when needed.
- For speed-only requests, prefer pitch-preserving time stretching from retained original-speed WAVs over new synthesis. First preserve original WAVs and sidecar JSON; record source SHA-256, target speed, and processing method separately to prevent cumulative acceleration on reruns. Preserve TTS text/tone provenance and distinguish postprocessing from new model output.
- Rebuild timing, subtitles, video inputs, and the final video from processed WAVs, then listen for pauses and endings. Existing per-page lead/tail pauses may remain unchanged, so total duration need not equal original duration divided by speed. Record the speed as a case decision; carrying it across topics requires user direction.

## Multiple tones on one page

Keep the complete `narration` in `slides.json` and add `narrationSegments` when a page needs multiple tones. Concatenating each segment's `text` in order must exactly reproduce `narration`, including punctuation and whitespace. Each `tone` must exist in the user's voice catalog. Segment tones take precedence over the page-level `tone`.

```json
{"page":1,"narration":"先說清楚問題。再說明方法。","narrationSegments":[{"text":"先說清楚問題。","tone":"平靜敘述"},{"text":"再說明方法。","tone":"平靜敘述"}]}
```

This is a schema example; users can change each tone. Omitting `narrationSegments` retains single-segment `narration`/`tone`. Empty arrays or mismatched text are rejected. `review-script.mjs` displays the full narration and each segment's tone without a separate manuscript.

- Single speech uses `audio/main/page-1.wav`; segmented speech uses `audio/main/page-1-segment-1.wav`, `page-1-segment-2.wav`, etc. Each WAV has an adjacent JSON provenance record.
- `voice.py check` validates all segments. `generate --kind main --pages 1` generates every segment on page 1. For authorized regeneration, back up existing files before adding `--replace`. Regeneration currently selects pages, not individual segments. Background narration remains a separate `--kind background` operation.
- `case.json.timing.narrationGapSeconds` controls pauses between main segments, falling back to `backgroundGapSeconds` when omitted. Values are nonnegative seconds. The pause before background narration uses `backgroundGapSeconds`.
- `timeline` concatenates segments in order, creates one caption per segment, then adds background narration. It only reads filenames corresponding to the current schema, so switching between single and segmented narration does not mix in old WAVs. Source WAVs remain unchanged.
- After changing text, tone, segmentation, or gaps, rebuild affected audio (gap-only changes need no TTS), timeline, review HTML, preparation, and video. Listen to every changed segment and verify captions before delivery.
