# 配音與時間軸

先依 project 的 `docs/SETUP.md` 安裝 `.venv` 與下載指定 Qwen revision。macOS 首版使用 CPU/float32/eager；不假設 CUDA 或 MPS 可用。生成耗時依機器、文字與模型而異，不承諾固定速度。

參考 WAV 不隨交接包提供。使用者將音檔放入 `shared/voice/reference-voice/`，檔名、語氣名、逐字稿須與該目錄 README 表格完全一致。接手者可以修改表格，提供自己的語氣，不限既有清單。只需備齊案件實際使用的語氣。
本版工具要求單聲道 PCM16 WAV。來源格式不同時另存副本：

```bash
ffmpeg -i "/絕對路徑/原始錄音.wav" -ac 1 -c:a pcm_s16le "$PROJECT_ROOT/shared/voice/reference-voice/平靜敘述.wav"
python3 "$PROJECT_ROOT/tools/voice.py" check my-talk
```

缺少 WAV 或逐字稿时須停止並列出缺項，不使用其他人的聲線替代。本文命令中的 my-talk 是案例 ID。

逐頁確認主旁白、主語氣、補背景旁白、背景語氣，且獲得生成授權後：

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" generate my-talk --kind main
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" generate my-talk --kind background
```

沒有背景旁白時省略第二行。使用 `--pages 2 5` 只生成指定頁；已存在音檔預設拒絕覆寫。只有使用者要求重製時加 `--replace`，並先保留欲替換檔的副本。沒有指定頁的 WAV 不改動。主／背景生成各自獨立，不會合併或改寫文稿。

畫面文字換行不能成為 TTS 停頓指令。工具將輸入空白折疊成一個空格，再以 OpenCC t2s 轉換給模型；保留顯示文稿與字幕的繁體中文。每個 WAV 旁的 JSON 記錄實際單行輸入、語氣、模型 revision 與參考音檔雜湊。沿用 WAV 時亦應保存這些記錄；語音合成可能不是逐 byte 可重現。

逐頁抽聽文字、語氣、停頓和結尾後，重建時間軸，不呼叫 Qwen：

```bash
python3 "$PROJECT_ROOT/tools/voice.py" timeline my-talk
```

此步使用 Python 標準庫，驗證 mono PCM16、非靜音、非削波、相同 sample rate。主旁白和背景旁白間隔依案件 timing；每頁長度由實際 WAV 對齊影片幀，尾段補齊到精確頁面邊界，避免跨頁漂移。字幕分別對應主旁白和背景旁白，不用標題代替。

修改旁白、語氣或 WAV 後要重新生成受影響段落，重建 timeline 和影片。prepare-motion 會拒絕來源／WAV 雜湊與 timeline 不符的狀況。音檔存在或技術檢查通過不代表朗讀已驗收。
