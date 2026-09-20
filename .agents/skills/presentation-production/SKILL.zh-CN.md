---
name: presentation-production
description: 通过人与 AI 对话整理演示文稿，使用随附的可携 macOS 项目创建或修改高桥流 HTML、美化 HTML 与含旁白的 Canvas Commons MP4。适用于内容、旁白、插图、动画、重建与输出验证。
---

[繁體中文](SKILL.md) | [简体中文](SKILL.zh-CN.md) | [English](SKILL.en.md)

# 演示文稿与旁白视频制作

本 skill 与交接 project 一起使用；不绑定品牌或说话者。单独安装 skill 不会安装 Qwen、Canvas Commons 或项目工具。

## 开始

1. 找到用户指定 project 的 `AGENTS.md`、`README.md`、`brand.json`，并以绝对路径设置 `PROJECT_ROOT`。搬移后重新设置，不沿用其他人的本机路径。
2. 先读 [工作流程](references/workflow.zh-CN.md)，环境未创建时读 [macOS 安装](../../../docs/SETUP.zh-CN.md)。
3. 读指定案件的 `case.json`、`content/draft.md`、`content/slides.json`；新案件用 project 的 `tools/init_case.py`，不手动复制旧案件依赖。

## 核心规则

- 对话形成主题；画面文字、主旁白、补背景旁白、语气、插图与动画是分开的决策。只改用户指定项目。
- 修改主题、页序或画面文字时，先重建高桥流 HTML，以本机 HTTP 预览交人确认；确认前不生成下游插图、语音或视频。示例的技术测试不等于正式案件内容确稿。
- 延续已有确认与执行授权，不因换 task 重设全部关卡。记录确认于 `draft.md`，但以最新指示为准。
- 旁白文字确认不等于执行 TTS；只有明确要求生成／重制语音才执行。一般重建使用既有 WAV。
- 品牌名称和 Logo 都由 `brand.json` 决定。Logo 未设置时，中性示例显示品牌文字；正式交付使用接手者确认的品牌设置。
- HTML 与视频不直接修改 `dist/`。来源是 slides、资产和场景；美化 HTML 可作视频构图比对基准。
- 呼叫 scripts 时使用由 `PROJECT_ROOT` 组成的绝对路径，不写死安装位置。

## 按任务阅读

- 新案件、schema、重建命令：[工作流程](references/workflow.zh-CN.md)。
- 文稿、Qwen、参考语音、WAV、时间轴与字幕：[配音](references/voice.zh-CN.md)。
- 插图及图片修改：[图片](references/images.zh-CN.md)。
- Canvas Commons、构图与渲染：[视频](references/video.zh-CN.md)。
- 交付前：[验收](references/acceptance.zh-CN.md)。

改语音只重建相关音频文件、时间轴、字幕及视频；改插图重建美化 HTML 与视频；改动画只重建视频；改品牌重建两种 HTML 与视频。未指定页面的已确认 WAV 不应改变。
