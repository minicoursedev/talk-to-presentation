[繁體中文](workflow.md) | [简体中文](workflow.zh-CN.md) | [English](workflow.en.md)

[数据存放规则](../../../../docs/DATA_LAYOUT.zh-CN.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路径均相对于用户数据根目录；`tools/`、`templates/` 与内置 `shared/styles/default/` 相对于能力根目录。 能力仓库只保存工具、skill、内置模板与中性示例。一般制作不得修改内置风格、示例或参考网站。用户录音、逐字稿、品牌、自定义风格、案例与输出都放在仓库外。

# 案件与工作流程

交接 project 的 README 是执行入口。此 skill 必须保留在 project 的 `.agents/skills/`，以下文件链接才有效。若全域安装 skill，需将文件链接改为用户指定 project 的绝对路径；不要依赖 skill 目录反推另一个 project。

```text
brand.json                  共用品牌名稱、Logo 路徑
model.json                  Qwen repo、固定 revision、本地下載目錄
templates/voice-catalog.md  語氣與逐字稿契約，不附 WAV
cases/<case-id>/
  case.json                 id、format、timing、outputs
  content/draft.md           草稿、使用者確認及局部修改範圍
  content/slides.json        各頁內容的共同來源
  content/timeline.json      從 WAV 重建的時間資料
  content/narration.srt      從分開的主／背景旁白重建
  assets/illustrations/     已確認的插圖
  audio/main/               主旁白 page-<page>.wav
  audio/background/         補背景旁白 page-<page>.wav
  audio/combined/           每頁主／背景合成
  audio/timeline.wav        與幀邊界對齊的總音軌
  motion/src/               此案件可修改的 Canvas Commons 場景
  dist/                     三種交付物
```

`slides.json` 是阵列，依阵列顺序播放。`page` 为唯一正整数，无旧案件固定页码限制。
每页有 `screen`、`narration`、`tone`、`backgroundNarration`、`backgroundTone`、`visual.illustrations`（相对案件路径阵列）、`visual.notes`。可用 `parts: [{text, color, small, size}]` 取代单一画面文字；`parts` 优先显示，旁白仍独立保存。`color` 支援 white/dark/highlight/danger/success/warning；`size: compact`、`layout: stack|light` 为既有 HTML 版面选项。

`case.json.format` 指定 width、height、fps。`timing` 指定 voiceOffsetFrames、tailFrames、backgroundGapSeconds。不能只改视频编辑器尺寸而不改来源。

命令中的 `PROJECT_ROOT` 必须是接手者的绝对路径，可含空格或中文。以下命令可从任意 cwd 执行：

```bash
export PRESENTATION_DATA_ROOT="$("$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_data.py")"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_case.py" my-talk --title "My talk"
node "$PROJECT_ROOT/tools/takahashi-html/build.mjs" my-talk
python3 -m http.server 4173 --bind 127.0.0.1 --directory "$PRESENTATION_DATA_ROOT"
```

在可用浏览器开启 `http://127.0.0.1:4173/cases/my-talk/dist/my-talk.html`。Codex In-app Browser 可用时直接开启；没有时用一般浏览器。重建后重新整理。端口被占用时换空闲端口，不停止别人的服务。

画面内容确认后，依独立的插图／旁白授权继续：

```bash
node "$PROJECT_ROOT/tools/visual-html/build.mjs" my-talk
```

新案件由可执行模板创建，不把既有成品当来源。样例是中性技术示例，不含既有案件内容或人声。它可在缺少 Qwen 与参考 WAV 时完成 HTML、静音视频工程的技术检查；正式 narrated MP4 仍需用户提供声音输入。

## 对话、风格与案件决策

专案入口承接对话，这个能力目录负责制作。从目的、受众、核心讯息与来源形成叙事及逐页内容；以 `content/draft.md` 保存决策、所选风格、授权与进度。模板是记录辅助，不是开始前必填的问卷。

选用共用的[风格参考](../../../../shared/styles/default/style.zh-CN.md)或使用者提供的参考，记录其路径及要延续的特征。跨页与跨主题延续视觉语言，各页的物件、场景及关系依自己的语意规划。风格、内容及制作设定分开保存，让每次制作可重用能力而保有自己的目的。

将整体叙事分配到逐页画面、旁白及视觉说明，生成与修改时以这份共同来源为准。来源文件的主题边界及页码对照亦保留在案件中。美化不改写已确认内容；若需要内容调整，明确提出其影响。

明确要求的输出沿用既有执行授权；只厘清会影响下一步的未决内容。批次工作逐案记录内容、素材、输出与验收进度，依要求接续完成。缺项阻挡哪一阶段就列明哪一阶段，不以建立案件代替完成交付。

## 台词检阅

内容整理或台词修改后，执行 `node "$PROJECT_ROOT/tools/review-script.mjs" <case-id>`，主动提供案例 `dist/script-review.html` 给用户。它从 `slides.json` 生成逐页对照与连续阅读模式，显示画面文字、主台词、补充旁白及语气；缺少主台词时明示，不自行拿画面文字充当旁白。

`slides.json` 是唯一台词来源；检阅 HTML 是可重建的静态快照，不另外维护词稿或修改生成页。用户提出修订后更新来源，再重新生成。配音前提供当前版本供检阅，沿用已确认内容与既有授权，不新增重复确认关卡。检阅页生成不代表台词已确认，也不代替视觉审核。

## 可替换品牌色与文字组成

使用者资料根目录的 `brand.json` 可设定四个用途栏位，颜色不限定特定色系：

```json
{"name":"示范品牌","logo":null,"colors":{"primary":"#963B32","accent":"#2F8A81","surface":"#FFF4E6","text":"#202D36"}}
```

`primary` 是主要品牌色，`accent` 是强调色，`surface` 是浅色底，`text` 是深色文字；均为六码十六进位色码。省略 `colors` 沿用内建配色；提供时须完整设定四项。两种 HTML 使用同一组设定，影片取用美化 HTML。既有 `purple`、`yellow`、`cream`、`darkGreen` 分别相容映射至这四项，新设定采用途名称；同时存在时用途栏位优先。修改配色后必须实际检查对比，栏位合法不保证可读性。

`parts` 的一行可用 `runs: [{text, color}]` 设定行内强调，显示文字依序连接；有 `runs` 时优先于 `text`。可选 `size: tight`，美化版另支援 `layout: art-story|art-cover`。版面是否适合内容仍需逐页看图验收。分段旁白见[配音](voice.zh-CN.md)。
