[繁體中文](style.md) | [简体中文](style.zh-CN.md) | [English](style.en.md)

Data storage rules (`$PROJECT_ROOT/docs/DATA_LAYOUT.en.md`): All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root. The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

# Default style reference

This reference provides a starting visual language for Talk to Presentation. A new case may reuse or replace it; it does not establish approval for every case.

Open [reference.html](reference.html) beside this file to compare title, statement, relationship, and question compositions. It is a viewable style reference using neutral geometric shapes, not case artwork or a finished four-page deck for arbitrary content.

## Core template: Storyteller (storyteller 1.0.0)

A presentation is a connected narrative. We act as storytellers, taking the audience from their starting understanding to a new understanding. This is the project's replaceable default template, not the skill's only permitted mode of expression.

- **Narrative**: identify the audience's starting point, central question, and intended takeaway, then arrange setup, development, turns, and resolution. Adapt order and length to the material rather than requiring fixed chapter counts. Never invent facts for drama.
- **Voice**: address the audience directly and introduce concepts through concrete situations. Narration connects to the screen and advances understanding instead of merely reading titles.
- **Page progression**: record each page's narrative role, connection to the previous page, and direction toward the next. Text, imagery, narration, and animation jointly serve that role and preserve a single story across transitions.
- **Visual language**: use the guidance and reference pages below for consistency while deriving subjects and relationships from each page's meaning.
- **Pacing**: allow time to understand key points and pauses for questions, turns, and resolution. Choose speed, transitions, and duration for the context rather than a fixed acceleration factor.
- **Whole-story review**: watch continuously to assess why one page leads to the next, how each advances the message, and whether the ending answers the opening. Asset completeness and technical checks cover only part of acceptance.

## Edit, replace, and preserve versions

First copy this directory to `shared/styles/default/` under the user data root. In that copy, edit the three language versions of `style.md`, `reference.html`, and other reference assets in this directory, and update `version` in `style.json`. The template covers narrative, voice, visuals, and pacing, not just colors or layout.

To keep multiple styles, copy the directory under the user data root at `shared/styles/my-style/`, update its content and `style.json` id/version, and select it when creating a case. Omitting `--style` selects `default`:

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_case.py" my-talk --style my-style
```

New cases copy the entire template to `content/style/` and record its id, version, source, and snapshot location in `case.json.style`. Production uses that snapshot, so shared-template updates do not alter existing cases. Keep custom reference assets inside the template directory with relative links; external linked content is not part of the snapshot.

For existing cases without a template record, retain current outputs and decisions instead of automatically applying the default. Migrate only on user request: preserve the old snapshot, create the new snapshot, update case records, and review affected scripts, images, narration, and layouts. No command automatically upgrades existing cases.

## Shared visual guidance

- The current baseline is portrait 1080 × 1920; cases may choose another format.
- Deep blue backgrounds, bright primary text, pale secondary text, and cyan emphasis. Size, position, and color jointly express hierarchy; recheck contrast on light pages.
- System sans-serif typography with bold primary messages. Preserve meaningful secondary text and speaker labels.
- One main visual focus per page. Compose text and imagery together with clear text space; do not bake titles or subtitles into illustrations.
- The reference demonstrates simple geometry, rounded forms, limited colors, and clear object relationships. When choosing another illustration language, save representative references and use it consistently within the case.
- Consistency comes from stable palette, typography, lines/materials, and composition logic. Scenes and layouts can vary. Per-page image coverage is a production decision.

## Use in production

Record reference paths, retained traits, requested changes, and accepted representative pages in the case's `draft.md`. Combine the style reference with each page's content plan when producing images, and inspect accepted images from the same case when continuing. For a new style, save its written specification and actual reference assets for reuse by later tasks.

This template guides agent-led image production and layout. HTML tools read `brand.json` palettes while retaining built-in layouts; `style.md`/`style.json` are not automatically converted into CSS or scenes. If the selected style exceeds those layouts, update layout sources and preview the results. Record speed, voice identity, subtitles, and transitions separately as case settings.

## Connected narrative example

A neutral example: “Too much to say” introduces the problem → “The audience remembers fragments” reveals its effect → “Choose one central question” provides a turn → “Leave with a clear understanding” answers the opening. This demonstrates one connected story rather than requiring a four-page formula.

Plan each page’s screen focus, added understanding in narration, visual relationships, and connection to adjacent pages together. They advance the story without needing to repeat identical words.
