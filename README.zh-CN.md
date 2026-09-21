[繁體中文](README.md) | [简体中文](README.zh-CN.md) | [English](README.en.md)

[数据存放规则](docs/DATA_LAYOUT.zh-CN.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路径均相对于用户数据根目录；`tools/`、`templates/` 与内置 `shared/styles/default/` 相对于能力根目录。 能力仓库只保存工具、skill、内置模板与中性示例。一般制作不得修改内置风格、示例或参考网站。用户录音、逐字稿、品牌、自定义风格、案例与输出都放在仓库外。

# 演示文稿制作交接包（macOS）

从人与 AI 的对话整理共同内容来源，制作高桥流 HTML、美化 HTML 与旁白 [Canvas Commons](https://github.com/canvas-commons/canvas-commons) MP4。品牌、声音及案件内容可替换，不限定任何活动或组织。

这个目录就是交接 project。整个目录可搬移；不需原工作区、旧案件、原用户帐号或原虚拟环境。`.agents/skills/presentation-production/` 是随项目交付的 skill。在“说说变简报”工作区中，从包含本能力目录的工作区根目录开始对话并调用本目录能力；若单独移动本能力包，也可将本目录开成项目，或依文件操作 scripts。

## 第一次使用：从这里开始

阅读[用户入门指南](docs/GETTING_STARTED.zh-CN.md)，了解 clone 后的环境检查、需要回答的问题、配音素材准备与可直接复制的开始模板。

## 第一次使用

1. 阅读 [macOS 环境创建](docs/SETUP.zh-CN.md)，安装依赖。
2. 设置 `PROJECT_ROOT` 为本目录的实际**绝对路径**。不要照抄他人的 `/Users/...`。所有命令可从任意工作目录执行。
3. 编辑数据根目录的 `brand.json`；`name` 是品牌名称，`logo` 是相对用户数据根目录 的文件路径，例如 `shared/brand/logo.svg`。将自己的 Logo 放到该位置。默认 `null` 只显示中性品牌文字，本包未附特定品牌 Logo。
4. 先试中性最小示例，再用工具创建自己的案件。

```bash
PROJECT_ROOT="/absolute/path/to/public"
export PRESENTATION_DATA_ROOT="$("$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_data.py")"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_case.py" sample
node "$PROJECT_ROOT/tools/takahashi-html/build.mjs" sample
node "$PROJECT_ROOT/tools/visual-html/build.mjs" sample
python3 -m http.server 4173 --bind 127.0.0.1 --directory "$PRESENTATION_DATA_ROOT"
```

浏览器开启：
- `http://127.0.0.1:4173/cases/sample/dist/sample.html`
- `http://127.0.0.1:4173/cases/sample/dist/sample-v.html`

新案件：`"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_case.py" my-talk --title "My talk"`。
完整命令、来源 schema 与确认关卡见 [工作流程](.agents/skills/presentation-production/references/workflow.zh-CN.md)。

## 配音与视频

- [配音](.agents/skills/presentation-production/references/voice.zh-CN.md)：Qwen 模型下载、参考声音、逐页主／背景旁白、局部重制、字幕与时间轴。
- [视频](.agents/skills/presentation-production/references/video.zh-CN.md)：Canvas Commons 静音预览、正式音轨、渲染、封装。
- [验收](.agents/skills/presentation-production/references/acceptance.zh-CN.md)：从 HTML 到最终视频的技术及视听检查。
- [本次验证记录](docs/VERIFICATION.zh-CN.md)：实际完成及未完成的验证范围。

语气参考 WAV **不在交接范围**。保留的 [语气 README](templates/voice-catalog.zh-CN.md) 是可替换的语气／档名／逐字稿契约。用户提供案件所需 WAV 后才能生成旁白。`voice.py check` 会逐项列出缺档，不自动替换声线。

本包包含中性的两页文字与程序绘制 SVG，不含旧案件、原品牌 Logo、人声 WAV、模型权重、node_modules 或虚拟环境。模型以固定 revision 下载；依赖以 lockfile 安装。字体使用 macOS 系统字体，首次验收需记录 macOS 版本；不同 macOS 的字体细节未承诺像素完全一致。

视频模板由美化 HTML 产生逐页图片，再以真正的 Canvas Commons 场景呈现与渲染，让最小示例的构图一致。默认为直接换页，不假装具有物件分层动画。需要物件动画时，修改案件 `motion/src/scenes/Slides.tsx`，依确认设计使用 Canvas Commons 的原生节点与动画；工具不会覆写既有场景。

## 交接边界

只支援 macOS 首版，不提供 Linux、Windows 或 CUDA 安装流程。环境下载需要网路；安装及模型下载完成后，既有素材重建与 Qwen 推论不需依赖原工作区。AI 制图工具不是安装包的一部分，可沿用用户提供的图片；若要新生成图片，需接手者自己的可用工具。

交接包完成不等于任意案件内容已确认或 narrated MP4 已验收。示例无人声；静音预览只能用于画面与工具检查，不能称为配音交付。

## 再次打包

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/package.py" "$PRESENTATION_DATA_ROOT/presentation-handoff.zip"
```

只收录通用工具、skill、文件与 sample 来源，不收录其他案件、语音、模型、环境或生成产物。ZIP 内含 `MANIFEST.sha256`；在解压后的 public 目录可用 `shasum -a 256 -c MANIFEST.sha256` 核对来源文件。

## 文件语言

既有 `.md` 路径提供繁体中文；同目录的 `.zh-CN.md` 与 `.en.md` 分别提供简体中文与英文。每份文件顶端皆可切换语言，内部说明链接会留在同一语言。文件翻译不会改写示范演示文稿内容、语气识别字、档名或录音逐字稿，也不代表 CLI 与第三方编辑器已完成多语系介面。

所有语言的文件一起维护。修改后运行以下检查，核对三语完整性、链接与语气数据契约：

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/check_docs.py"
```
