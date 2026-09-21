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
