[繁體中文](acceptance.md) | [简体中文](acceptance.zh-CN.md) | [English](acceptance.en.md)

[資料存放規則](../../../../docs/DATA_LAYOUT.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路徑均相對於使用者資料根目錄；`tools/`、`templates/` 與內建 `shared/styles/default/` 相對於能力根目錄。 能力倉庫只保存工具、skill、內建樣板與中性範例。一般製作不得修改內建風格、範例或參考網站。使用者錄音、逐字稿、品牌、自訂風格、案件與輸出都放在倉庫外。

# 驗收

技術測試與人類內容確認分開；每份記錄標明來源、輸出 SHA-256 和實際檢查時間，不沿用舊版驗收。

## HTML

- HTML 修版後先執行 `presentation.mjs check-layout <case-id>`，處理越界／裁切並審核疑似重疊；保留圖片內文字與其他未檢查範圍的標示。量測通過不能取代下列逐頁視覺檢查。

- 兩種 HTML 頁序與文字皆對應 slides.json；鍵盤、頁碼滑桿可操作。
- 在本機 HTTP 預覽實際查看所有頁面，檢查換行、溢出、圖片裁切、品牌、頁碼。
- 修改品牌名稱與 Logo 時三種輸出共用 brand.json，正式 Logo 由使用者提供。

## 語音、時間與影片

- 缺少參考 WAV 時停止 TTS 並列缺項；不使用替代人聲。
- 主／背景音檔分開，指定重製頁以外的音檔 SHA-256 保持不變。
- 每個重製頁抽聽文字、語氣、句中停頓和結尾。RMS、非靜音或解碼通過都不等於已聽過。
- timeline 和字幕由最終 WAV 重建，依幀邊界對齊；字幕完整包含確認的主／背景旁白。
- Canvas Commons build、FFmpeg exporter render、字幕封裝、ffprobe 和完整解碼皆通過，尺寸/fps/長度一致。
- 正式 MP4 第 0 幀、每頁交界前一幀／交界幀／下一幀、最後一頁及修改頁均實際查看。轉場需播放完整區間，不能只截停留後畫面。
- 對照美化 HTML 確認裁切、文字、遮罩、品牌一致，自訂動畫不偷改構圖。
- 音訊開頭、中段、結尾及修改頁實際抽聽，不能用字幕當音訊證據。

## 交接包本身

- 在另一個目錄（含空格及中文）從任意 cwd 執行 tools，不能引用原專案路徑、其他案件 node_modules 或原 venv。
- npm ci 與 Python lock 安裝可重建依賴；模型取得命令有固定 revision。
- 包內有 `templates/voice-catalog.md`，初始化後資料目錄才有實際 `shared/voice/reference-voice/README.md`。包內不含參考 WAV、使用者品牌、使用者案件或私有絕對路徑。
- 中性範例可建置兩種 HTML 與靜音 Canvas Commons 工程。未提供聲音時不宣稱完整 Qwen/narrated MP4 驗收。
- 交付列出實際通過命令、未驗證項目與接手者必要輸入。

## 逐頁交付檢查

- 執行 `node "$PROJECT_ROOT/tools/check-visuals.mjs" my-talk`；需要每頁有圖時使用案件設定或 `--require-images`。檢查通過只證明引用完整，不證明切題。
- 把原始來源、`slides.json`、實際畫面分開核對。`parts` 的次標、說話者標示、強調句同樣是內容；不能因 JSON 還有字，就認定使用者所見沒有遺失。
- 在文字版、美化版與影片分別檢查可見性，特別是深色／淺色背景、有圖頁、次要文字與文字留白。使用者指出的頁面必須實際重看；若改共用樣式，同時看所有受影響的版面類型。
- 每頁圖片是否符合論點與案例、是否保留文字、是否達到約定覆蓋率，都在輸出前核對。僅抽查首尾或通過 H.264／解碼檢查，不能代替逐頁視覺驗收。
- 回報實際完成數／要求總數、已重建輸出與尚未驗收階段。未達要求時直接說明差額、原因及下一步。
