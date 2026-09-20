[繁體中文](workflow.md) | [简体中文](workflow.zh-CN.md) | [English](workflow.en.md)

# Cases and workflow

The project's README is the execution entry point. Keep this skill under the project's `.agents/skills/` so its documentation links resolve. If installing the skill globally, change its documentation links to absolute paths in the user's selected project; do not infer another project from the global skill directory.

```text
brand.json                  Shared brand name and logo path
model.json                  Qwen repository, pinned revision, local download directory
shared/voice/reference-voice/README.md  Tone/transcript contract; no WAVs included
cases/<case-id>/
  case.json                 id, format, timing, outputs
  content/draft.md           Draft, user confirmations, scope of local changes
  content/slides.json        Shared per-page content source
  content/timeline.json      Timing rebuilt from WAVs
  content/narration.srt      Rebuilt from separate main/background narration
  assets/illustrations/      Confirmed illustrations
  audio/main/               Main narration: page-<page>.wav
  audio/background/         Background narration: page-<page>.wav
  audio/combined/           Per-page main/background combination
  audio/timeline.wav        Complete audio aligned to frame boundaries
  motion/src/               Editable Canvas Commons scene for this case
  dist/                     Three deliverables
```

`slides.json` is an array, played in array order. Each `page` is a unique positive integer; there is no fixed page range inherited from an older case.
Each page has `screen`, `narration`, `tone`, `backgroundNarration`, `backgroundTone`, `visual.illustrations` (an array of case-relative paths), and `visual.notes`. Use `parts: [{text, color, small, size}]` instead of a single screen string when needed. `parts` takes display precedence; narration remains separate. Supported colors are white/dark/highlight/danger/success/warning. `size: compact` and `layout: stack|light` are existing HTML layout options.

`case.json.format` defines width, height, and fps. `timing` defines voiceOffsetFrames, tailFrames, and backgroundGapSeconds. Do not change only the editor's dimensions without changing the source settings.

Set `PROJECT_ROOT` to the recipient's absolute path. Spaces and Chinese characters are supported. These commands can run from any working directory:

```bash
python3 "$PROJECT_ROOT/tools/init_case.py" my-talk --title "My talk"
node "$PROJECT_ROOT/tools/takahashi-html/build.mjs" my-talk
python3 -m http.server 4173 --bind 127.0.0.1 --directory "$PROJECT_ROOT"
```

Open `http://127.0.0.1:4173/cases/my-talk/dist/my-talk.html` in an available browser. Use the Codex In-app Browser when available; otherwise use a normal browser. Reload after a rebuild. If the port is occupied, choose another free port without stopping somebody else's service.

After confirming screen content, continue under the separate illustration and narration permissions:

```bash
node "$PROJECT_ROOT/tools/visual-html/build.mjs" my-talk
```

New cases come from an executable template, not an existing finished artifact. The sample is a neutral technical example with no old case content or human voice. It can validate HTML and the silent video project without Qwen or reference WAVs. A production narrated MP4 still needs user-supplied voice inputs.
