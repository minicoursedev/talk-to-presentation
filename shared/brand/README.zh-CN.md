[繁體中文](README.md) | [简体中文](README.zh-CN.md) | [English](README.en.md)

[数据存放规则](../../docs/DATA_LAYOUT.zh-CN.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路径均相对于用户数据根目录；`tools/`、`templates/` 与内置 `shared/styles/default/` 相对于能力根目录。 能力仓库只保存工具、skill、内置模板与中性示例。一般制作不得修改内置风格、示例或参考网站。用户录音、逐字稿、品牌、自定义风格、案例与输出都放在仓库外。

# 使用自己的品牌

先依[资料存放规则](../../docs/DATA_LAYOUT.zh-CN.md)初始化使用者资料目录。将 Logo 放到 `$PRESENTATION_DATA_ROOT/shared/brand/`，再编辑 `$PRESENTATION_DATA_ROOT/brand.json`；本文件所在的能力仓库不存放使用者品牌素材。

```json
{"name":"你的品牌","logo":"shared/brand/logo.svg"}
```

`logo` 相对于使用者资料根目录，支援 SVG、PNG 等浏览器可载入的格式。`logo: null` 显示品牌名称文字。配色栏位与相容规则见[工作流程](../../.agents/skills/presentation-production/references/workflow.zh-CN.md)。

修改品牌后重建两种 HTML、prepare 与影片，沿用既有旁白。
