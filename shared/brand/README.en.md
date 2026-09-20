[繁體中文](README.md) | [简体中文](README.zh-CN.md) | [English](README.en.md)

# Using your own brand

No logo is included. Put your logo in this directory, then edit `brand.json` in the project root:

```json
{"name":"Your brand","logo":"shared/brand/logo.svg"}
```

`logo` is relative to the handoff project; scripts resolve it for execution. Do not enter an absolute path from the original author's machine.
SVG, PNG, and other browser-supported formats are accepted. The user supplies the image. `logo: null` displays the brand name as text, as in the neutral minimal example.
After changing it, rebuild both HTML versions, run prepare-motion, and rebuild video. Do not regenerate speech.
