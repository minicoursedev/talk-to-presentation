[繁體中文](README.md) | [简体中文](README.zh-CN.md) | [English](README.en.md)

[Data storage rules](../../docs/DATA_LAYOUT.en.md)：All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root. The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

# Using your own brand

No logo is included. Put your logo in this directory, then edit `brand.json` in the project root:

```json
{"name":"Your brand","logo":"shared/brand/logo.svg"}
```

`logo` is relative to the handoff project; scripts resolve it for execution. Do not enter an absolute path from the original author's machine.
SVG, PNG, and other browser-supported formats are accepted. The user supplies the image. `logo: null` displays the brand name as text, as in the neutral minimal example.
After changing it, rebuild both HTML versions, run prepare-motion, and rebuild video. Do not regenerate speech.
