[繁體中文](draft.md) | [简体中文](draft.zh-CN.md) | [English](draft.en.md)

[Data storage rules](../docs/DATA_LAYOUT.en.md)：All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root. The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

# {{title}}

## Whole-story plan

- Following the selected core template, record the audience’s starting point, central question, narrative development, and intended takeaway: to develop.
- Record page roles and connections in `slides.json[].visual.notes`, planning them alongside screen text and narration.
- See `case.json.style` for the selected id/version and use the snapshot in `content/style/`. Shared-template updates do not apply automatically.

## Purpose and content

- Audience, context, and core message: to develop.
- Sources and scope: to record.
- Narrative order and page sources: see `slides.json`; initialized content is a replaceable sample.

## Style and production settings

- Reference paths, retained traits, and representative pages: to select.
- Branding, dimensions, image coverage, voice/tone, speed, subtitles, and transitions: record case requirements and identify existing defaults used when unspecified.

## Decisions and execution

- Confirmed content and authorized production scope: to record; generated drafts are not approval.
- Open questions or missing inputs: list only those affecting subsequent work.
- Output progress, verified checks, and next actions: to record.

Update through conversation rather than requiring the user to fill out this document before starting. Preserve authorization and update only affected decisions when revising.
