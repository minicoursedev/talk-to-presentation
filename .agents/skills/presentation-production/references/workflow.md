[繁體中文](workflow.md) | [简体中文](workflow.zh-CN.md) | [English](workflow.en.md)

# 案件與工作流程

交接 project 的 README 是執行入口。此 skill 必須保留在 project 的 `.agents/skills/`，以下文件連結才有效。若全域安裝 skill，需將文件連結改為使用者指定 project 的絕對路徑；不要依賴 skill 目錄反推另一個 project。

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
  motion/src/               此案件可修改的 Canvas Commons 場景
  dist/                     三種交付物
```

`slides.json` 是陣列，依陣列順序播放。`page` 為唯一正整數，無舊案件固定頁碼限制。
每頁有 `screen`、`narration`、`tone`、`backgroundNarration`、`backgroundTone`、`visual.illustrations`（相對案件路徑陣列）、`visual.notes`。可用 `parts: [{text, color, small, size}]` 取代單一畫面文字；`parts` 優先顯示，旁白仍獨立保存。`color` 支援 white/dark/highlight/danger/success/warning；`size: compact`、`layout: stack|light` 為既有 HTML 版面選項。

`case.json.format` 指定 width、height、fps。`timing` 指定 voiceOffsetFrames、tailFrames、backgroundGapSeconds。不能只改影片編輯器尺寸而不改來源。

命令中的 `PROJECT_ROOT` 必須是接手者的絕對路徑，可含空格或中文。以下命令可從任意 cwd 執行：

```bash
python3 "$PROJECT_ROOT/tools/init_case.py" my-talk --title "My talk"
node "$PROJECT_ROOT/tools/takahashi-html/build.mjs" my-talk
python3 -m http.server 4173 --bind 127.0.0.1 --directory "$PROJECT_ROOT"
```

在可用瀏覽器開啟 `http://127.0.0.1:4173/cases/my-talk/dist/my-talk.html`。Codex In-app Browser 可用時直接開啟；沒有時用一般瀏覽器。重建後重新整理。端口被占用時換空閒端口，不停止別人的服務。

畫面內容確認後，依獨立的插圖／旁白授權繼續：

```bash
node "$PROJECT_ROOT/tools/visual-html/build.mjs" my-talk
```

新案件由可執行模板建立，不把既有成品當來源。樣例是中性技術範例，不含既有案件內容或人聲。它可在缺少 Qwen 與參考 WAV 時完成 HTML、靜音影片工程的技術檢查；正式 narrated MP4 仍需使用者提供聲音輸入。
