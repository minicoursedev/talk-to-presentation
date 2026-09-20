---
name: presentation-production
description: Create and revise a presentation from human discussion into Takahashi HTML, illustrated HTML, and a narrated Canvas Commons MP4 using the accompanying portable macOS project. Use for content, narration, illustration, animation, rebuilding, and output verification.
---

[繁體中文](SKILL.md) | [简体中文](SKILL.zh-CN.md) | [English](SKILL.en.md)

# Presentation and narrated video production

Use this skill with the accompanying handoff project. It does not assume a brand or speaker. Installing the skill alone does not install Qwen, Canvas Commons, or the project tools.

## Start here

1. Locate `AGENTS.md`, `README.md`, and `brand.json` in the user's chosen project. Set `PROJECT_ROOT` to an absolute path. Reset it after moving the project; do not retain another person's local paths.
2. Read [workflow](references/workflow.en.md) first. If the environment is not ready, read [macOS setup](../../../docs/SETUP.en.md).
3. Read the selected case's `case.json`, `content/draft.md`, and `content/slides.json`. For a new case, use the project's `tools/init_case.py`; do not copy dependencies from an old case manually.

## Core rules

- Develop the topic through conversation. Screen text, main narration, background narration, tones, illustrations, and animation are separate decisions. Change only what the user requests.
- When the topic, page order, or screen text changes, first rebuild Takahashi HTML and show it over local HTTP for human confirmation. Do not generate downstream illustrations, speech, or video before confirmation. Technical testing of the sample does not approve a production case's content.
- Preserve existing confirmations and execution permissions across tasks. Record confirmations in `draft.md`, while following the latest user instructions.
- Approving narration text does not authorize TTS execution. Generate or regenerate speech only when explicitly requested. Reuse existing WAVs for ordinary rebuilds.
- Read the brand name and logo from `brand.json`. If no logo is configured, the neutral sample displays brand text. Production delivery uses the recipient's confirmed brand settings.
- Do not edit `dist/` directly to change HTML or video. Sources are slides, assets, and scenes; illustrated HTML may serve as the visual composition reference for video.
- Invoke scripts using absolute paths formed from `PROJECT_ROOT`; never hard-code an installation location.

## Read for the current task

- New cases, schemas, rebuild commands: [workflow](references/workflow.en.md).
- Text, Qwen, reference voices, WAVs, timing, and subtitles: [voice production](references/voice.en.md).
- Illustrations and image changes: [images](references/images.en.md).
- Canvas Commons, composition, and rendering: [video production](references/video.en.md).
- Before delivery: [acceptance](references/acceptance.en.md).

Voice changes rebuild only affected audio, timing, subtitles, and video. Illustration changes rebuild illustrated HTML and video. Animation changes rebuild only video. Brand changes rebuild both HTML versions and video. Confirmed WAVs for pages outside the requested change must remain unchanged.
