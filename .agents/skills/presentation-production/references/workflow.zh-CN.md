[繁體中文](workflow.md) | [简体中文](workflow.zh-CN.md) | [English](workflow.en.md)

# 案件与工作流程

交接 project 的 README 是执行入口。此 skill 必须保留在 project 的 `.agents/skills/`，以下文件链接才有效。若全域安装 skill，需将文件链接改为用户指定 project 的绝对路径；不要依赖 skill 目录反推另一个 project。

```text
brand.json                  共用品牌名稱、Logo 路徑
model.json                  Qwen repo、固定 revision、本地下載目錄
shared/voice/reference-voice/README.md  語氣與逐字稿契約，不附 WAV
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
  motion/src/               此案件可修改的 Motion Canvas 場景
  dist/                     三種交付物
```

`slides.json` 是阵列，依阵列顺序播放。`page` 为唯一正整数，无旧案件固定页码限制。
每页有 `screen`、`narration`、`tone`、`backgroundNarration`、`backgroundTone`、`visual.illustrations`（相对案件路径阵列）、`visual.notes`。可用 `parts: [{text, color, small, size}]` 取代单一画面文字；`parts` 优先显示，旁白仍独立保存。`color` 支援 white/dark/highlight/danger/success/warning；`size: compact`、`layout: stack|light` 为既有 HTML 版面选项。

`case.json.format` 指定 width、height、fps。`timing` 指定 voiceOffsetFrames、tailFrames、backgroundGapSeconds。不能只改视频编辑器尺寸而不改来源。

命令中的 `PROJECT_ROOT` 必须是接手者的绝对路径，可含空格或中文。以下命令可从任意 cwd 执行：

```bash
python3 "$PROJECT_ROOT/tools/init_case.py" my-talk --title "My talk"
node "$PROJECT_ROOT/tools/takahashi-html/build.mjs" my-talk
python3 -m http.server 4173 --bind 127.0.0.1 --directory "$PROJECT_ROOT"
```

在可用浏览器开启 `http://127.0.0.1:4173/cases/my-talk/dist/my-talk.html`。Codex In-app Browser 可用时直接开启；没有时用一般浏览器。重建后重新整理。端口被占用时换空闲端口，不停止别人的服务。

画面内容确认后，依独立的插图／旁白授权继续：

```bash
node "$PROJECT_ROOT/tools/visual-html/build.mjs" my-talk
```

新案件由可执行模板创建，不把既有成品当来源。样例是中性技术示例，不含既有案件内容或人声。它可在缺少 Qwen 与参考 WAV 时完成 HTML、静音视频工程的技术检查；正式 narrated MP4 仍需用户提供声音输入。
