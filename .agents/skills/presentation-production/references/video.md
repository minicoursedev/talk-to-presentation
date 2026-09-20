[繁體中文](video.md) | [简体中文](video.zh-CN.md) | [English](video.en.md)

# Motion Canvas 輸出

以下命令皆使用絕對 `PROJECT_ROOT`；`my-talk` 換成案件 ID。

## 準備及預覽

美化 HTML 是構圖基準。先重建美化 HTML，再截取畫布形成影片所用的逐頁圖片。不要修改圖片當成內容來源。

沒有參考 WAV 時可做**靜音技術預覽**：

```bash
node "$PROJECT_ROOT/tools/visual-html/build.mjs" sample
node "$PROJECT_ROOT/tools/prepare-motion.mjs" sample --preview
node "$PROJECT_ROOT/tools/motion.mjs" build sample
node "$PROJECT_ROOT/tools/motion.mjs" start sample --port 9002
```

每頁預覽秒數來自 `previewSeconds`（預設 3 秒）；不代表正式旁白時間。正式影片使用已確認 WAV 重建時間軸：

```bash
python3 "$PROJECT_ROOT/tools/voice.py" timeline my-talk
node "$PROJECT_ROOT/tools/visual-html/build.mjs" my-talk
node "$PROJECT_ROOT/tools/prepare-motion.mjs" my-talk
node "$PROJECT_ROOT/tools/motion.mjs" build my-talk
node "$PROJECT_ROOT/tools/motion.mjs" start my-talk --port 9002
```

瀏覽器開啟 `http://127.0.0.1:9002/`。端口有占用時換空閒端口。本機預覽不是公開部署。

prepare-motion 使用自己啟動的短期 HTTP 伺服器與 Chromium，結束即關閉。它只更新生成的截圖、prepared.json、工程音軌（motion/timeline.wav，供 Vite 與 FFmpeg exporter 同時讀取）及渲染設定，不覆寫自訂 scene。HTML 寬高與截圖像素來自 case.format。

## 動畫及構圖

預設模板是真正的 Motion Canvas scene，逐頁圖片直接切換。它不包含物件分層動畫。需要動畫時依使用者指定修改案件 scene，使用原生 Layout/Txt/Img 與 tween；不要宣稱整頁圖片就是分層動畫。

- 首幀內容及品牌即須可見；不要以全透明 fade-in 或空白等待初始化。
- 換頁前頁可見直到下一頁接手；不可先全部淡出造成空白。
- 累積動畫承接前一頁狀態，不重播已存在物件。
- 既有 HTML 圖片占位、裁切、文字位置、遮罩與留白都保留；不自動加底板、縮放或其他效果。
- 原生文字多行用明確垂直 Layout 或適當換行；lineHeight 數值是像素，比例請用百分比字串。
- 自訂場景維持 prepared 中各頁 frames 與總長度，不以裁音或刪幀掩蓋畫面問題。

## 渲染

`build` 只完成 TypeScript/Vite 編譯。正式 MP4 由 Motion Canvas 編輯器渲染：

1. Exporter 選 `Video (FFmpeg)`。
2. 沿用 prepare-motion 設定的 range（0 至總幀數減 1，exporter 包含結束幀），尺寸、fps 依 case.format，scale 1、audio offset 0。
3. 正式影片啟用 Include audio 與 Fast start。靜音預覽不開音訊，且只以 preview 名稱交付。
4. 按 RENDER 等待完成；輸出在 `cases/my-talk/motion/output/`，以實際檔名為準。

prepare-motion 會寫入匹配 case.format 的 project.meta，仍需在 UI 核對設定。source 修改後必須重新 prepare/build/render，不能沿用舊 MP4。

將 exporter 本次輸出的影片與已確認字幕封裝：

```bash
python3 "$PROJECT_ROOT/tools/finish_video.py" my-talk "$PROJECT_ROOT/cases/my-talk/motion/output/presentation.mp4"
python3 "$PROJECT_ROOT/tools/verify_video.py" my-talk
```

finish_video 強制需要音軌，不會把靜音範例包裝成 narrated MP4。
若只驗證靜音技術範例：

```bash
python3 "$PROJECT_ROOT/tools/verify_video.py" sample --preview --file "$PROJECT_ROOT/cases/sample/motion/output/presentation.mp4"
```

verify_video 檢查 H.264、尺寸、fps、正式音軌與字幕、長度及完整解碼，將結果寫入案件 verification/media.json。它不代替觀看或抽聽。
