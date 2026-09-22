---
name: presentation-production

description: Create and revise a presentation from human discussion into Takahashi HTML, illustrated HTML, and a narrated Canvas Commons MP4 using the accompanying portable macOS project. Use for content, narration, illustration, animation, rebuilding, and output verification.
---

[Data storage rules](../../../docs/DATA_LAYOUT.en.md)：All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root. The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

[繁體中文](SKILL.md) | [简体中文](SKILL.zh-CN.md) | [English](SKILL.en.md)

# Presentation and narrated video production

Use this skill with the accompanying handoff project. It does not assume a brand or speaker. Installing the skill alone does not install Qwen, Canvas Commons, or the project tools.

## Start here

1. Read `AGENTS.md` and `README.md` in the user's chosen capability directory and set its absolute `PROJECT_ROOT`. Resolve the external `PRESENTATION_DATA_ROOT` according to the storage rules; read the active `brand.json` and cases from there. Reset paths after moving the project; do not retain another person's local paths.
2. Read [workflow](references/workflow.en.md) first. If the environment is not ready, read [macOS setup](../../../docs/SETUP.en.md).
3. Read the selected case's `case.json`, `content/draft.md`, and `content/slides.json`. For a new case, use the project's `tools/init_case.py`; do not copy dependencies from an old case manually.

4. Read the case template snapshot identified by `case.json.style` (usually `content/style/style.en.md`) and follow its narrative, voice, visuals, and pacing. `init_case.py` snapshots the selected template for new cases; see the [core style template](../../../shared/styles/default/style.en.md) for defaults and replacement. Preserve confirmed decisions for older cases without a style record rather than applying a new template automatically.

## Core rules

- Develop the topic through conversation. Screen text, main narration, background narration, tones, illustrations, and animation are separate decisions. Change only what the user requests.
- When the topic, page order, or screen text changes, first rebuild Takahashi HTML and show it over local HTTP for human confirmation. Do not generate downstream illustrations, speech, or video before confirmation. Technical testing of the sample does not approve a production case's content.
- Preserve existing confirmations and execution permissions across tasks. Record confirmations in `draft.md`, while following the latest user instructions.
- Approving narration text does not authorize TTS execution. Generate or regenerate speech only when explicitly requested. Reuse existing WAVs for ordinary rebuilds.
- Read the brand name and logo from `brand.json`. If no logo is configured, the neutral sample displays brand text. Production delivery uses the recipient's confirmed brand settings.
- Do not edit `dist/` directly to change HTML or video. Sources are slides, assets, and scenes; illustrated HTML may serve as the visual composition reference for video.
- Invoke scripts using absolute paths formed from `PROJECT_ROOT`; never hard-code an installation location.

- Image coverage, voice speed, and batch style are case decisions recorded in `draft.md`. When every page needs an image, set `case.json.visual.requireImages`; do not exempt titles, questions, or closing pages. See [images](references/images.en.md) for page planning and checks.
- Beautification and image changes preserve confirmed page order, text, and narration. Data presence does not prove visibility; follow [acceptance](references/acceptance.en.md) before delivery.

## Read for the current task

- New cases, schemas, rebuild commands: [workflow](references/workflow.en.md).
- Text, Qwen, reference voices, WAVs, timing, and subtitles: [voice production](references/voice.en.md).
- Illustrations and image changes: [images](references/images.en.md).
- Canvas Commons, composition, and rendering: [video production](references/video.en.md).
- Before delivery: [acceptance](references/acceptance.en.md).

Voice changes rebuild only affected audio, timing, subtitles, and video. Illustration changes rebuild illustrated HTML and video. Animation changes rebuild only video. Brand changes rebuild both HTML versions and video. Confirmed WAVs for pages outside the requested change must remain unchanged.

- After organizing content or changing narration, run `node "$PROJECT_ROOT/tools/review-script.mjs" <case-id>` and provide the case’s `dist/script-review.html`. It reads `slides.json` and offers page comparison and continuous script reading, showing screen text, main narration, background narration and tones. Missing main narration is explicit; never substitute screen text automatically. `slides.json` is the only script source. Review HTML is a regenerable static snapshot, not a separate editable manuscript. Apply requested changes to the source and regenerate. Provide the current version before speech production, preserving existing confirmations and authorization without redundant approval gates. Generation does not establish user approval or replace visual review.

## Rebuild contracts

- Brand palettes use semantic `primary`/`accent`/`surface`/`text` roles; see [workflow](references/workflow.en.md). Do not turn a case's colors into universal requirements.
- For multiple tones on one page, use `narrationSegments` and the filenames and regeneration scope in [narration](references/voice.en.md).
- `render-video.mjs` drives the Canvas Commons FFmpeg exporter; see [video](references/video.en.md). Muxing, technical checks, and visual/listening acceptance are still required.
- After capability changes, follow [rebuild verification](../../../docs/REPRODUCIBILITY.en.md) for an independent installation and test. Record the tested version and actual unverified stages with the delivery.
