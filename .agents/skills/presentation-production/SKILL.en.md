---
name: presentation-production

description: Create and revise a presentation from human discussion into Takahashi HTML, illustrated HTML, and a narrated Canvas Commons MP4 using the accompanying portable macOS project. Use for content, narration, illustration, animation, rebuilding, and output verification.
---

[Data storage rules](../../../docs/DATA_LAYOUT.en.md): All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root. The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

[繁體中文](SKILL.md) | [简体中文](SKILL.zh-CN.md) | [English](SKILL.en.md)

# Presentation and narrated video production

Use this skill with the capability project. It assumes no brand, topic, or speaker. Copying the skill alone does not install Qwen, Canvas Commons, or project tools.

## Start here

1. Read the capability directory's `AGENTS.md` and `README.md` and set its absolute `PROJECT_ROOT`. Resolve external `PRESENTATION_DATA_ROOT` using the [storage rules](../../../docs/DATA_LAYOUT.en.md); read active `brand.json` and cases from that data directory.
2. Read [workflow](references/workflow.en.md). For first use, provide the [getting-started guide](../../../docs/GETTING_STARTED.en.md). Address missing prerequisites through [setup](../../../docs/SETUP.en.md), retaining compatible installed tools.
3. For an existing case, read `case.json`, `content/draft.md`, and `content/slides.json`. Create new cases with `tools/init_case.py`.
4. Read the case's style snapshot at `case.json.style.snapshot` and preserve its narrative, voice, visuals, and pacing. New cases default to the replaceable [Storyteller template](../../../shared/styles/default/style.en.md). Preserve confirmed choices in older cases without a style record instead of changing their style automatically.

## Production principles

- Build a connected story across the deck: page content, visuals, and narration jointly advance understanding. Topic, brand, speed, and image coverage are case decisions recorded in `content/draft.md`.
- Store and edit screen text, main narration, background narration, tones, images, and animation separately. `slides.json` is the shared source; `dist/` contains rebuildable outputs.
- After changing topic, page order, or screen text, rebuild Takahashi HTML and provide a preview. Continue under existing confirmations and authorization. Clarify only unresolved choices affecting the next step; changing tasks or using a template does not reset approval gates.
- Record content confirmation and execution authorization separately. Text approval alone does not authorize speech generation; retain existing authorization for full production and follow the latest user instructions. Generated drafts are not approval. Ordinary rebuilds reuse existing images and WAVs; generation and regeneration stay within the user's authorized scope.
- Read the brand name, logo, and semantic palette from the data root's `brand.json`. Explain neutral defaults when branding is undecided; do not inherit another case's brand.
- If every page needs an image, set `case.json.visual.requireImages`, including titles, questions, and closing pages. File presence or compilation cannot replace visual review.
- Invoke tools with absolute paths based on `PROJECT_ROOT`. Do not hard-code installation locations or write production data into the capability repository.

- Before checking progress or rebuilding, use `presentation.mjs status` / `plan` as defined in the [operations contract](../../../docs/OPERATIONS.en.md); execute necessary `rebuild` steps within existing authorization. Status is derived from sources and outputs; decisions remain in case records.

## Read for the current task

- New cases, schemas, branding, script review: [workflow](references/workflow.en.md).
- Qwen, reference voices, `narrationSegments`, selected regeneration, timing, captions: [voice](references/voice.en.md).
- Illustration, image replacement, per-page coverage: [images](references/images.en.md).
- Canvas Commons composition, command-line/editor export, muxing: [video](references/video.en.md).
- Technical checks and audiovisual review before delivery: [acceptance](references/acceptance.en.md).

After organizing content or editing narration, run `node "$PROJECT_ROOT/tools/review-script.mjs" <case-id>` and provide `dist/script-review.html`. It shows page comparison, continuous narration, and segment tones. Apply revisions to `slides.json` and regenerate instead of maintaining a second editable manuscript. Creating the review page does not establish content approval.

## Rebuild after changes

- Speech changes: regenerate only authorized pages, then rebuild timing, captions, and video. Keep other pages' WAVs unchanged.
- Image changes: rebuild illustrated HTML and video. Animation changes: rebuild video. Brand changes: rebuild both HTML versions and video. Reuse confirmed narration for these operations.
- Timeline freshness depends on narration, tone, page order, fps, gaps and WAVs; screen, image, brand or dimension changes alone can reuse it. Legacy timelines still check the full source hash and may need one refresh with existing WAVs. Detailed status and rebuild rules are defined in the [operations contract](../../../docs/OPERATIONS.en.md).
- After shared-capability changes, select relevant checks from [rebuild verification](../../../docs/REPRODUCIBILITY.en.md). Documentation-only proofreading checks translations, links, examples, and the skill. Dependency or production-flow changes need the corresponding independent installation or end-to-end checks. Report actual results and unverified stages.
