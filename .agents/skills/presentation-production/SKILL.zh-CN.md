---
name: presentation-production

description: 通过人与 AI 对话整理演示文稿，使用随附的可携 macOS 项目创建或修改高桥流 HTML、美化 HTML 与含旁白的 Canvas Commons MP4。适用于内容、旁白、插图、动画、重建与输出验证。
---

[数据存放规则](../../../docs/DATA_LAYOUT.zh-CN.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路径均相对于用户数据根目录；`tools/`、`templates/` 与内置 `shared/styles/default/` 相对于能力根目录。 能力仓库只保存工具、skill、内置模板与中性示例。一般制作不得修改内置风格、示例或参考网站。用户录音、逐字稿、品牌、自定义风格、案例与输出都放在仓库外。

[繁體中文](SKILL.md) | [简体中文](SKILL.zh-CN.md) | [English](SKILL.en.md)

# 简报与旁白影片制作

本 skill 与能力专案一起使用；不绑定品牌、题材或说话者。单独复制 skill 不会安装 Qwen、Canvas Commons 或专案工具。

## 开始

1. 读取能力目录的 `AGENTS.md`、`README.md`，将其绝对路径设为 `PROJECT_ROOT`。依[资料存放规则](../../../docs/DATA_LAYOUT.zh-CN.md)解析仓库外的 `PRESENTATION_DATA_ROOT`，从资料目录读取使用中的 `brand.json` 与案件。
2. 读[工作流程](references/workflow.zh-CN.md)；首次使用先提供[入门指南](../../../docs/GETTING_STARTED.zh-CN.md)，环境缺项依[安装说明](../../../docs/SETUP.zh-CN.md)处理，沿用符合需求的既有工具。
3. 既有案件先读 `case.json`、`content/draft.md` 与 `content/slides.json`；新案件用 `tools/init_case.py` 建立。
4. 依 `case.json.style.snapshot` 读取案件的风格快照，延续叙事、口吻、视觉及节奏。新案件预设使用可替换的[说书人样板](../../../shared/styles/default/style.zh-CN.md)；没有 style 设定的旧案件沿用已确认方向，不自动换风格。

## 制作原则

- 整份简报有连贯的故事线；逐页内容、画面、旁白共同推进理解。题材、品牌、语速与图片覆盖范围是案件决策，记在 `content/draft.md`。
- 画面文字、主旁白、补充旁白、语气、插图与动画分开保存及修改。`slides.json` 是共同来源，`dist/` 是可重建的输出。
- 主题、页序或画面文字改动后，先重建高桥流 HTML 并提供预览。依已有确认与授权继续制作；只有尚未决定且会影响下一步的内容才需厘清，不因更换任务或文件范本重设确认关卡。
- 内容确认与执行授权分别记录；台词确认本身不等于授权配音，已有完整制作授权则沿用，依最新用户指示处理。生成草稿不等于已确认；一般重建沿用已有图片及 WAV，生成或重制依使用者授权范围执行。
- 品牌名称、Logo 与用途配色读取资料根目录的 `brand.json`。未选品牌时明示中性预设，不套用其他案件的品牌。
- 每页需图时设定 `case.json.visual.requireImages`，含标题、提问及结尾页；实际看图验收不能由档案存在或建置成功代替。
- 呼叫工具使用由 `PROJECT_ROOT` 组成的绝对路径。不得写死使用者安装位置，也不得把制作资料写入能力仓库。

- 查询现况或重建前，依[操作与重建契约](../../../docs/OPERATIONS.zh-CN.md)使用 `presentation.mjs status`／`plan`；已有授权时执行必要的 `rebuild`。状态由来源及产物计算，决策仍读案例记录。

- 多语要求只适用于本项目仓库内的操作文档、skill 与内置模板。用户的案例底稿、交付说明、自定义风格与声音清单依其工作语言维护一份；只有明确要求翻译时才增加语言版本。

## 按任务阅读

- 新案件、schema、品牌、台词检阅：[工作流程](references/workflow.zh-CN.md)。
- Qwen、参考声音、`narrationSegments`、局部重制、时间轴与字幕：[配音](references/voice.zh-CN.md)。
- 插图、图片替换与逐页覆盖：[图片](references/images.zh-CN.md)。
- Canvas Commons 构图、命令列／编辑器汇出、封装：[影片](references/video.zh-CN.md)。
- 交付前的技术检查与视听审核：[验收](references/acceptance.zh-CN.md)。

内容整理或台词修改后，执行 `node "$PROJECT_ROOT/tools/review-script.mjs" <case-id>`，主动提供 `dist/script-review.html`。它显示逐页对照、连续台词及分段语气；修订仍回写 `slides.json` 再生成，不另建可编辑词稿。生成检阅页不代表台词已确认。

## 修改后重建

- 配音变更：只重制授权范围内的页面，再更新时间轴、字幕与影片；其他页 WAV 保持不变。
- 图片变更：重建美化 HTML 与影片；动画变更：重建影片；品牌变更：重建两种 HTML 与影片。这些操作沿用已确认旁白。
- 时间轴依旁白、语气、页序、fps、停顿与 WAV 判断是否过期；只改画面、图片、品牌或画幅时可沿用。旧版时间轴仍检查完整来源哈希，必要时以既有 WAV 更新一次。详细状态与重建规则以[操作与重建契约](../../../docs/OPERATIONS.zh-CN.md)为准。
- 修改共用能力后，依[重建验证](../../../docs/REPRODUCIBILITY.zh-CN.md)选择受影响的检查。纯文件校稿检查三语、连结、范例及 skill；依赖或产制流程变更才需对应的独立安装／端到端验证。回报实际通过项目与未验证阶段。
