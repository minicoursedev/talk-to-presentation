[繁體中文](acceptance.md) | [简体中文](acceptance.zh-CN.md) | [English](acceptance.en.md)

# 驗收

技術測試與人類內容確認分開；每份記錄標明來源、輸出 SHA-256 和實際檢查時間，不沿用舊版驗收。

## HTML

- 兩種 HTML 頁序與文字皆對應 slides.json；鍵盤、頁碼滑桿可操作。
- 在本機 HTTP 預覽實際查看所有頁面，檢查換行、溢出、圖片裁切、品牌、頁碼。
- 修改品牌名稱與 Logo 時三種輸出共用 brand.json，正式 Logo 由使用者提供。

## 語音、時間與影片

- 缺少參考 WAV 時停止 TTS 並列缺項；不使用替代人聲。
- 主／背景音檔分開，指定重製頁以外的音檔 SHA-256 保持不變。
- 每個重製頁抽聽文字、語氣、句中停頓和結尾。RMS、非靜音或解碼通過都不等於已聽過。
- timeline 和字幕由最終 WAV 重建，依幀邊界對齊；字幕完整包含確認的主／背景旁白。
- Motion Canvas build、FFmpeg exporter render、字幕封裝、ffprobe 和完整解碼皆通過，尺寸/fps/長度一致。
- 正式 MP4 第 0 幀、每頁交界前一幀／交界幀／下一幀、最後一頁及修改頁均實際查看。轉場需播放完整區間，不能只截停留後畫面。
- 對照美化 HTML 確認裁切、文字、遮罩、品牌一致，自訂動畫不偷改構圖。
- 音訊開頭、中段、結尾及修改頁實際抽聽，不能用字幕當音訊證據。

## 交接包本身

- 在另一個目錄（含空格及中文）從任意 cwd 執行 tools，不能引用原專案路徑、其他案件 node_modules 或原 venv。
- npm ci 與 Python lock 安裝可重建依賴；模型取得命令有固定 revision。
- 語氣 README 存在，沒有參考 WAV；沒有原品牌 Logo、原案件或原使用者絕對路徑。
- 中性範例可建置兩種 HTML 與靜音 Motion Canvas 工程。未提供聲音時不宣稱完整 Qwen/narrated MP4 驗收。
- 交付列出實際通過命令、未驗證項目與接手者必要輸入。
