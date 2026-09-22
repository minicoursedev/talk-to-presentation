[繁體中文](voice.md) | [简体中文](voice.zh-CN.md) | [English](voice.en.md)

[資料存放規則](../../../../docs/DATA_LAYOUT.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路徑均相對於使用者資料根目錄；`tools/`、`templates/` 與內建 `shared/styles/default/` 相對於能力根目錄。 能力倉庫只保存工具、skill、內建樣板與中性範例。一般製作不得修改內建風格、範例或參考網站。使用者錄音、逐字稿、品牌、自訂風格、案件與輸出都放在倉庫外。

# 配音與時間軸

只有要生成新語音時，才需依[環境建立](../../../../docs/SETUP.md)安裝 `.venv` 並備妥指定 Qwen revision。沿用既有 WAV 重建時間軸不需要載入模型。現行 macOS 流程使用 CPU/float32/eager；生成耗時依機器、文字與模型而異。

參考 WAV 不隨交接包提供。使用者將音檔放入資料根目錄的 `shared/voice/reference-voice/`，檔名、語氣名、逐字稿須與該目錄 `README.md` 表格完全一致。工具固定讀取 `README.md`，不依文件語言切換。接手者可編輯自己的清單，只需備齊案件實際使用的語氣。
本版工具要求單聲道 PCM16 WAV。來源格式不同時另存副本：

```bash
ffmpeg -i "/absolute/path/reference.wav" -ac 1 -c:a pcm_s16le "$PRESENTATION_DATA_ROOT/shared/voice/reference-voice/平靜敘述.wav"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" check my-talk
```

缺少 WAV 或逐字稿時須停止並列出缺項，不使用其他人的聲線替代。本文命令中的 my-talk 是案例 ID。

逐頁確認主旁白、主語氣、補背景旁白、背景語氣，且獲得生成授權後：

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" generate my-talk --kind main
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" generate my-talk --kind background
```

沒有背景旁白時省略第二行。使用 `--pages 2 5` 只生成指定頁；已存在音檔預設拒絕覆寫。只有使用者要求重製時加 `--replace`，並先保留欲替換檔的副本。沒有指定頁的 WAV 不改動。主／背景生成各自獨立，不會合併或改寫文稿。

畫面文字換行不能成為 TTS 停頓指令。工具先將旁白空白折疊成單一空格，再以 OpenCC t2s 轉換給模型；顯示文稿與字幕保留來源文字。每個 WAV 旁的 JSON 以 `ttsText` 記錄折疊空白後、繁簡轉換前的文字，另記語氣、模型 revision、參考音檔雜湊及輸出增益。沿用 WAV 時也保留這些記錄；語音合成不保證逐位元組相同。

逐頁抽聽文字、語氣、停頓和結尾後，重建時間軸，不呼叫 Qwen：

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" timeline my-talk
```

此步使用 Python 標準庫，檢查 mono PCM16、非空且非全靜音、峰值未達 PCM16 上限，以及相同 sample rate。主旁白和背景旁白間隔依案件 timing；每頁長度由實際 WAV 對齊影片幀，尾段補齊到精確頁面邊界，避免跨頁漂移。字幕分別對應主旁白和背景旁白，不用標題代替。

修改旁白、語氣或分段後，依已授權範圍重製受影響頁，再重建 timeline 與影片。僅替換 WAV 或做音量／語速後製時，直接使用處理後音檔重建，不因此再次執行 TTS。prepare-motion 會拒絕來源或 WAV 雜湊與 timeline 不符的狀況；檔案存在或技術檢查通過不代表朗讀已驗收。

文件語言不會改變配音語言。現行生成腳本固定使用 `language="Chinese"`，不因閱讀英文文件就改為英文配音；若需其他配音語言，須另行修改並驗證生成流程。

## 沿用語氣與調整語速

- 每次使用前讀取實際語氣 README，不假設檔名必須是語氣名稱；例如編號 WAV 只要有明確的語氣與逐字稿對照即可。若案件語氣不在表內，先確認是否只是相同語氣的改名；不能自行以其他情緒替換。原始錄音與格式轉換副本分開保存，不覆寫唯一來源。
- 降低音量可避免輸出碰到數值上限，無法修復原始音檔已發生的削波。不得為了通過峰值檢查就稱為音質已修復；仍需抽聽，必要時回報錄音問題。
- 僅要求語速變更時，優先對保留的原速 WAV 做保音高時間伸縮，不重新合成文稿。先備份原速 WAV 與旁邊的 JSON，另記來源 SHA-256、目標倍速及處理方式，避免重跑時在已加速檔上再次加速。沿用 TTS 的文字／語氣 provenance，不把後處理誤標成新模型輸出。
- 依處理後 WAV 重建時間軸、字幕、影片來源與成片；抽聽變速後的停頓與結尾。每頁原有進場／尾段停留未必同步縮短，因此總片長不一定是原片長除以倍速。將倍速記入案件決策，跨主題沿用需有使用者指示。

## 同一頁的分段語氣

需要在一頁內改變語氣時，在 `slides.json` 保留完整 `narration`，並增加 `narrationSegments`。所有段落的 `text` 依序連接必須與 `narration` 完全相同，包含標點與空白；每段 `tone` 都須存在於使用者語氣表。分段時每段語氣優先於頁面 `tone`。

```json
{"page":1,"narration":"先說清楚問題。再說明方法。","narrationSegments":[{"text":"先說清楚問題。","tone":"平靜敘述"},{"text":"再說明方法。","tone":"平靜敘述"}]}
```

這只是欄位示例；使用者可以替換各段語氣。省略 `narrationSegments` 時維持單段 `narration`／`tone`；空陣列或文字不一致會拒絕。`review-script.mjs` 同時呈現完整台詞及每段語氣，不維護第二份詞稿。

- 單段音檔是 `audio/main/page-1.wav`；分段改為 `audio/main/page-1-segment-1.wav`、`page-1-segment-2.wav`，每個 WAV 旁皆有同名 JSON provenance。
- `voice.py check` 檢查所有段落，`generate --kind main --pages 1` 生成第 1 頁的全部段落。已存在時，經授權備份後加 `--replace`；目前重製範圍是頁面，沒有單一段落 CLI 選項。背景旁白仍用 `--kind background` 獨立產生。
- `case.json.timing.narrationGapSeconds` 設定主旁白段落間隔；省略時沿用 `backgroundGapSeconds`。數值為非負秒數。主旁白至補充旁白仍用 `backgroundGapSeconds`。
- `timeline` 依段落順序串接，逐段建立字幕，再追加補充旁白。只引用目前 schema 對應的檔名，切換單段／分段後不會混用舊 WAV；來源 WAV 不被覆寫。
- 修改文字、語氣、分段或間隔後，重建受影響音檔（僅間隔變更不需 TTS）、timeline、檢閱頁、prepare 及影片。輸出前逐段抽聽並核對字幕。
