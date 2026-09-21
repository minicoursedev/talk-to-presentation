---
name: presentation-production

description: 通过人与 AI 对话整理演示文稿，使用随附的可携 macOS 项目创建或修改高桥流 HTML、美化 HTML 与含旁白的 Canvas Commons MP4。适用于内容、旁白、插图、动画、重建与输出验证。
---

[数据存放规则](../../../docs/DATA_LAYOUT.zh-CN.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路径均相对于用户数据根目录；`tools/`、`templates/` 与内置 `shared/styles/default/` 相对于能力根目录。 能力仓库只保存工具、skill、内置模板与中性示例。一般制作不得修改内置风格、示例或参考网站。用户录音、逐字稿、品牌、自定义风格、案例与输出都放在仓库外。

[繁體中文](SKILL.md) | [简体中文](SKILL.zh-CN.md) | [English](SKILL.en.md)

# 演示文稿与旁白视频制作

本 skill 与交接 project 一起使用；不绑定品牌或说话者。单独安装 skill 不会安装 Qwen、Canvas Commons 或项目工具。

## 开始

1. 找到用户指定 project 的 `AGENTS.md`、`README.md`、`brand.json`，并以绝对路径设置 `PROJECT_ROOT`。搬移后重新设置，不沿用其他人的本机路径。
2. 先读 [工作流程](references/workflow.zh-CN.md)，环境未创建时读 [macOS 安装](../../../docs/SETUP.zh-CN.md)。
3. 读指定案件的 `case.json`、`content/draft.md`、`content/slides.json`；新案件用 project 的 `tools/init_case.py`，不手动复制旧案件依赖。

4. 读取 `case.json.style` 指定的案件模板快照（通常为 `content/style/style.zh-CN.md`），依其叙事、口吻、视觉与节奏制作。新案件由 `init_case.py` 保存选定模板；默认与替换方式见[核心风格模板](../../../shared/styles/default/style.zh-CN.md)。既有案件未设置时先沿用其已确认决策，不自动套用新模板。

## 核心规则

- 对话形成主题；画面文字、主旁白、补背景旁白、语气、插图与动画是分开的决策。只改用户指定项目。
- 修改主题、页序或画面文字时，先重建高桥流 HTML，以本机 HTTP 预览交人确认；确认前不生成下游插图、语音或视频。示例的技术测试不等于正式案件内容确稿。
- 延续已有确认与执行授权，不因换 task 重设全部关卡。记录确认于 `draft.md`，但以最新指示为准。
- 旁白文字确认不等于执行 TTS；只有明确要求生成／重制语音才执行。一般重建使用既有 WAV。
- 品牌名称和 Logo 都由 `brand.json` 决定。Logo 未设置时，中性示例显示品牌文字；正式交付使用接手者确认的品牌设置。
- HTML 与视频不直接修改 `dist/`。来源是 slides、资产和场景；美化 HTML 可作视频构图比对基准。
- 呼叫 scripts 时使用由 `PROJECT_ROOT` 组成的绝对路径，不写死安装位置。

- 图片覆盖范围、语速与批次风格是案件决策，记在 `draft.md`；每页需图时设定 `case.json.visual.requireImages`，不可自行排除标题、提问或结尾页。逐页规划与检查见 [图片](references/images.zh-CN.md)。
- 美化与换图保留已确认页序、文字与旁白；资料仍在不等于画面可见，交付前依 [验收](references/acceptance.zh-CN.md) 核对。

## 按任务阅读

- 新案件、schema、重建命令：[工作流程](references/workflow.zh-CN.md)。
- 文稿、Qwen、参考语音、WAV、时间轴与字幕：[配音](references/voice.zh-CN.md)。
- 插图及图片修改：[图片](references/images.zh-CN.md)。
- Canvas Commons、构图与渲染：[视频](references/video.zh-CN.md)。
- 交付前：[验收](references/acceptance.zh-CN.md)。

改语音只重建相关音频文件、时间轴、字幕及视频；改插图重建美化 HTML 与视频；改动画只重建视频；改品牌重建两种 HTML 与视频。未指定页面的已确认 WAV 不应改变。
