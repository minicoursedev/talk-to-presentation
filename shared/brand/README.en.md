[繁體中文](README.md) | [简体中文](README.zh-CN.md) | [English](README.en.md)

[Data storage rules](../../docs/DATA_LAYOUT.en.md): All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root. The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

# Using your own brand

Initialize user storage following the [data layout](../../docs/DATA_LAYOUT.en.md). Put the logo in `$PRESENTATION_DATA_ROOT/shared/brand/`, then edit `$PRESENTATION_DATA_ROOT/brand.json`. The capability repository containing this document is not a destination for user branding assets.

```json
{"name":"Your brand","logo":"shared/brand/logo.svg"}
```

`logo` is relative to the user data root. SVG, PNG, and other browser-supported formats are accepted. `logo: null` displays the brand name as text. See [workflow](../../.agents/skills/presentation-production/references/workflow.en.md) for palette fields and compatibility.

After brand changes, rebuild both HTML versions, preparation, and video while reusing existing narration.
