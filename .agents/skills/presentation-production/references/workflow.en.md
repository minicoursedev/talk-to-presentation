[繁體中文](workflow.md) | [简体中文](workflow.zh-CN.md) | [English](workflow.en.md)

[Data storage rules](../../../../docs/DATA_LAYOUT.en.md): All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root. The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

# Cases and workflow

The project README is the entry point. Shared commands, executable validation and rebuild status are defined in the [operations contract](../../../../docs/OPERATIONS.en.md); this document describes case fields and content workflow. The skill ships under `.agents/skills/`, which its relative documentation links assume.

```text
<capability-root>/
  model.json                  Qwen repo, pinned revision, model location under data root
  templates/voice-catalog.md   Initial voice catalog template; no WAVs
  tools/                      Production and verification tools
<data-root>/
  brand.json                  Active brand name, logo path, and palette
  shared/voice/reference-voice/README.md   Active tone/transcript catalog
  cases/<case-id>/
    case.json                 id, format, timing, outputs, style
    content/draft.md           Decisions, confirmations, and authorization
    content/slides.json        Shared source for screen text and narration
    content/style/             Selected style snapshot
    content/timeline.json      Timing and source hashes rebuilt from WAVs
    content/narration.srt       Captions rebuilt from narration segments
    assets/illustrations/     Illustrations
    audio/main/               Main: page-<page>.wav or page-<page>-segment-<n>.wav
    audio/background/         Background: page-<page>.wav
    audio/combined/           Per-page combined audio
    audio/timeline.wav        Complete frame-aligned audio
    motion/src/               Case-specific Canvas Commons scenes
    dist/                     HTML, script review, and MP4
```

`slides.json` is an array, played in array order. Each `page` is a unique positive integer; there is no fixed page range inherited from an older case.
Each page has `screen`, `narration`, `tone`, `backgroundNarration`, `backgroundTone`, `visual.illustrations` (an array of case-relative paths), and `visual.notes`. Use `parts: [{text, color, small, size}]` instead of a single screen string when needed. `parts` takes display precedence; narration remains separate. Supported colors are white/dark/highlight/danger/success/warning. `size: compact` and `layout: stack|light` are existing HTML layout options.

`case.json.format` defines width, height, and fps. `timing` defines voiceOffsetFrames, tailFrames, and backgroundGapSeconds. Do not change only the editor's dimensions without changing the source settings.

Set `PROJECT_ROOT` to the recipient's absolute path. Spaces and Chinese characters are supported. These commands can run from any working directory:

```bash
export PRESENTATION_DATA_ROOT="$("$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_data.py")"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_case.py" my-talk --title "My talk"
node "$PROJECT_ROOT/tools/takahashi-html/build.mjs" my-talk
python3 -m http.server 4173 --bind 127.0.0.1 --directory "$PRESENTATION_DATA_ROOT"
```

Open `http://127.0.0.1:4173/cases/my-talk/dist/my-talk.html` in an available browser. Use the Codex In-app Browser when available; otherwise use a normal browser. Reload after a rebuild. If the port is occupied, choose another free port without stopping somebody else's service.

Continue within existing content confirmations and production authorization. Clarify only unresolved choices affecting the next step. For example, rebuild illustrated HTML:

```bash
node "$PROJECT_ROOT/tools/visual-html/build.mjs" my-talk
```

New cases come from an executable template, not an existing finished artifact. The sample is a neutral technical example with no old case content or human voice. It can validate HTML and the silent video project without Qwen or reference WAVs. A production narrated MP4 still needs user-supplied voice inputs.

## Conversation, style, and case decisions

The workspace entry point handles conversation; this capability directory handles production. Develop purpose, audience, core message, and sources into narrative and page content. Save decisions, selected style, authorization, and progress in `content/draft.md`. The template supports record keeping rather than acting as a required intake questionnaire.

Choose the shared [style reference](../../../../shared/styles/default/style.en.md) or user-provided references and record their paths and retained traits. Preserve visual language across pages and topics while planning each page's objects, scenes, and relationships from its meaning. Store style, content, and production settings separately so cases reuse capabilities while retaining their own purposes.

Distribute the narrative across screen text, narration, and visual explanations, using that shared source for generation and revision. Preserve source topic boundaries and page mappings in the case. Beautification preserves confirmed content; explicitly describe the impact when content changes are needed.

Preserve existing authorization for requested outputs and clarify only unresolved content that affects the next step. Track content, assets, outputs, and review per case in batch work and continue as requested. Identify which stage a missing input blocks; initializing a case does not establish delivery.

## Script review

After organizing content or changing narration, run `node "$PROJECT_ROOT/tools/review-script.mjs" <case-id>` and provide the case’s `dist/script-review.html`. It reads `slides.json` and offers page comparison and continuous script reading, showing screen text, main narration, background narration and tones. Missing main narration is explicit; never substitute screen text automatically.

`slides.json` is the only script source. Review HTML is a regenerable static snapshot, not a separate editable manuscript. Apply requested changes to the source and regenerate. Provide the current version before speech production, preserving existing confirmations and authorization without redundant approval gates. Generation does not establish user approval or replace visual review.

## Replaceable brand colors and rich text

The user data root's `brand.json` accepts four semantic roles, independent of hue:

```json
{"name":"Example brand","logo":null,"colors":{"primary":"#963B32","accent":"#2F8A81","surface":"#FFF4E6","text":"#202D36"}}
```

`primary` is the main brand color, `accent` highlights content, `surface` is a light background, and `text` is dark text. Values must be six-digit hexadecimal colors. Omit `colors` to use the built-in palette; when supplied, all four roles are required. Both HTML builders use the same palette; video uses the illustrated HTML. Legacy `purple`, `yellow`, `cream`, and `darkGreen` map to these roles for compatibility. Semantic keys take precedence when both exist. Recheck contrast after changing the palette; valid fields do not guarantee readability.

A line in `parts` can use `runs: [{text, color}]` for inline emphasis. Run text is concatenated in order and takes precedence over `text`. Additional colors are `mint` and `rose`, and `size` also accepts `tight`. Illustrated HTML supports `layout: art-story|art-cover`. For artwork that needs dark text, set `case.json.visual.textContrast` to `dark` and verify contrast on every page. See [narration](voice.en.md) for segmented speech.
