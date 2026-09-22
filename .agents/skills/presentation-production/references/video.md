[繁體中文](video.md) | [简体中文](video.zh-CN.md) | [English](video.en.md)

[資料存放規則](../../../../docs/DATA_LAYOUT.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路徑均相對於使用者資料根目錄；`tools/`、`templates/` 與內建 `shared/styles/default/` 相對於能力根目錄。 能力倉庫只保存工具、skill、內建樣板與中性範例。一般製作不得修改內建風格、範例或參考網站。使用者錄音、逐字稿、品牌、自訂風格、案件與輸出都放在倉庫外。

# Canvas Commons 輸出

先設定能力目錄的絕對 `PROJECT_ROOT` 與倉庫外的 `PRESENTATION_DATA_ROOT`；`my-talk` 換成案件 ID。以下正式與靜音流程分開執行。

## 正式影片：準備來源

美化 HTML 是構圖基準。時間軸過期時以最終 WAV 重建，再由 HTML 擷取逐頁畫布。新版時間軸可沿用於純畫面、圖片、品牌或畫幅變更；舊版相容及精確重建規則見[操作契約](../../../../docs/OPERATIONS.md)。這些重建不呼叫 TTS。

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" timeline my-talk
node "$PROJECT_ROOT/tools/visual-html/build.mjs" my-talk
node "$PROJECT_ROOT/tools/prepare-motion.mjs" my-talk
node "$PROJECT_ROOT/tools/motion.mjs" build my-talk
```

prepare 使用短期本機 HTTP 服務與 Chromium，完成後關閉。它更新截圖、`prepared.json`、`motion/timeline.wav` 及匹配 case.format 的 `project.meta`，不覆寫案件 scene。`build` 只做 TypeScript/Vite 編譯，不產生最終 MP4。

## 命令列匯出與檢查

```bash
node "$PROJECT_ROOT/tools/render-video.mjs" my-talk
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/finish_video.py" my-talk "$PRESENTATION_DATA_ROOT/cases/my-talk/motion/output/presentation.mp4"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/verify_video.py" my-talk
```

`render-video.mjs` 啟動只綁 `127.0.0.1` 的臨時 Vite 服務，以 Playwright 呼叫 Canvas Commons `Renderer` 與 `Video (FFmpeg)` exporter，執行案件 scene 並沿用 prepare 的尺寸、fps、range 及音軌設定。支援 `BROWSER_EXECUTABLE`；完成或失敗後關閉服務與瀏覽器，失敗以非零狀態回報。

本命令固定產生 `motion/output/presentation.mp4`，重跑會替換此生成檔。finish_video 封裝字幕後，正式交付位置由 `case.json.outputs.video` 決定。verify_video 檢查 H.264、尺寸、fps、影格數、音軌、mov_text 字幕、長度及完整解碼，記錄於 `verification/media.json`；不代替觀看與抽聽。

## 選用編輯器匯出

需要在編輯器預覽或操作時，完成準備後另外執行：

```bash
node "$PROJECT_ROOT/tools/motion.mjs" start my-talk --port 9002
```

瀏覽器開啟 `http://127.0.0.1:9002/`。這是持續執行的本機服務，結束後用 Ctrl+C 關閉；執行其他命令可使用另一個終端。端口被占用時換空閒端口。

1. Exporter 選 `Video (FFmpeg)`。
2. 尺寸與 fps 依 case.format，scale 1、audio offset 0；range 為 0 到總幀數／fps 秒，不減一幀。
3. 正式影片啟用 Include audio 與 Fast start；靜音預覽不開音訊。
4. 按 RENDER 並等候完成，輸出位於案件 `motion/output/`。以編輯器實際產生的檔名傳給 finish_video；靜音影片則只執行 preview 驗證。

編輯器與命令列走同一個渲染器。來源修改後重新執行受影響的準備、建置與匯出，不能沿用舊 MP4。

## 無配音的技術預覽

先依[工作流程](workflow.md)在資料目錄建立 sample；已有案件時不重複初始化。靜音預覽不需要模型或參考 WAV，每頁秒數取自 `previewSeconds`（預設 3 秒）。

```bash
node "$PROJECT_ROOT/tools/visual-html/build.mjs" sample
node "$PROJECT_ROOT/tools/prepare-motion.mjs" sample --preview
node "$PROJECT_ROOT/tools/motion.mjs" build sample
node "$PROJECT_ROOT/tools/render-video.mjs" sample --preview
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/verify_video.py" sample --preview --file "$PRESENTATION_DATA_ROOT/cases/sample/motion/output/preview.mp4"
```

命令列靜音輸出為 `motion/output/preview.mp4`，與正式檔名不同。不要交給要求音軌的 finish_video，也不能稱為配音交付。切換正式／靜音模式時，prepare 與 render 必須使用相同模式。

## 動畫及構圖

預設 scene 以逐頁圖片直接換頁，保持美化 HTML 的構圖。它不包含物件分層動畫；需要動畫時依使用者要求修改案件 scene，使用原生 Layout/Txt/Img 與 tween，保留 prepared 中各頁 frames 與總長度。

- 首幀內容與品牌須可見；換頁前保留前頁直到下一頁接手，避免空白。
- 累積動畫承接已有物件，不重播已完成部分。
- 保留已確認的圖片裁切、文字、遮罩與留白；不自動加底板、縮放或效果。
- 原生文字用垂直 Layout 或換行；lineHeight 數值為像素，比例使用百分比字串。
- 自訂場景依[驗收](acceptance.md)逐頁查看、檢查交界並抽聽，不以刪幀或裁音掩蓋問題。

## 沿用既有 HTML

prepare 支援從 1 開始的 `#progress`／`#progressBar` 滑桿及 `.short-frame`／`.slide.active` 畫布。滑桿 input 事件須切換對應頁，頁序與 `slides.json` 一致；任意 HTML 不保證可直接匯入。擷取前核對實際畫布尺寸與 case.format 一致，並依[驗收](acceptance.md)確認成片構圖。
