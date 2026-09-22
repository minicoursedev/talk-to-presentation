[繁體中文](workflow.md) | [简体中文](workflow.zh-CN.md) | [English](workflow.en.md)

[資料存放規則](../../../../docs/DATA_LAYOUT.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路徑均相對於使用者資料根目錄；`tools/`、`templates/` 與內建 `shared/styles/default/` 相對於能力根目錄。 能力倉庫只保存工具、skill、內建樣板與中性範例。一般製作不得修改內建風格、範例或參考網站。使用者錄音、逐字稿、品牌、自訂風格、案件與輸出都放在倉庫外。

# 案件與工作流程

交接 project 的 README 是執行入口。此 skill 必須保留在 project 的 `.agents/skills/`，以下文件連結才有效。若全域安裝 skill，需將文件連結改為使用者指定 project 的絕對路徑；不要依賴 skill 目錄反推另一個 project。

```text
<capability-root>/
  model.json                  Qwen repo、固定 revision、資料根目錄下的模型位置
  templates/voice-catalog.md   初始化使用的語氣清單模板，不附 WAV
  tools/                      製作與驗證工具
<data-root>/
  brand.json                  使用中的品牌名稱、Logo 路徑與配色
  shared/voice/reference-voice/README.md   工具讀取的語氣與逐字稿清單
  cases/<case-id>/
    case.json                 id、format、timing、outputs、style
    content/draft.md           決策、確認與授權
    content/slides.json        畫面與台詞的共同來源
    content/style/             選定風格的快照
    content/timeline.json      從 WAV 重建的時間資料與來源雜湊
    content/narration.srt       從旁白段落重建的字幕
    assets/illustrations/     插圖
    audio/main/               主旁白：page-<page>.wav 或 page-<page>-segment-<n>.wav
    audio/background/         補充旁白：page-<page>.wav
    audio/combined/           每頁組合音軌
    audio/timeline.wav        對齊影片幀的總音軌
    motion/src/               此案件的 Canvas Commons 場景
    dist/                     HTML、台詞檢閱與 MP4
```

`slides.json` 是陣列，依陣列順序播放。`page` 為唯一正整數，無舊案件固定頁碼限制。
每頁有 `screen`、`narration`、`tone`、`backgroundNarration`、`backgroundTone`、`visual.illustrations`（相對案件路徑陣列）、`visual.notes`。可用 `parts: [{text, color, small, size}]` 取代單一畫面文字；`parts` 優先顯示，旁白仍獨立保存。`color` 支援 white/dark/highlight/danger/success/warning；`size: compact`、`layout: stack|light` 為既有 HTML 版面選項。

`case.json.format` 指定 width、height、fps。`timing` 指定 voiceOffsetFrames、tailFrames、backgroundGapSeconds。不能只改影片編輯器尺寸而不改來源。

命令中的 `PROJECT_ROOT` 必須是接手者的絕對路徑，可含空格或中文。以下命令可從任意 cwd 執行：

```bash
export PRESENTATION_DATA_ROOT="$("$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_data.py")"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_case.py" my-talk --title "My talk"
node "$PROJECT_ROOT/tools/takahashi-html/build.mjs" my-talk
python3 -m http.server 4173 --bind 127.0.0.1 --directory "$PRESENTATION_DATA_ROOT"
```

在可用瀏覽器開啟 `http://127.0.0.1:4173/cases/my-talk/dist/my-talk.html`。Codex In-app Browser 可用時直接開啟；沒有時用一般瀏覽器。重建後重新整理。端口被占用時換空閒端口，不停止別人的服務。

畫面內容已有確認、製作已有授權時，依該範圍繼續；只釐清尚未決定且影響下一步的項目。例如重建美化 HTML：

```bash
node "$PROJECT_ROOT/tools/visual-html/build.mjs" my-talk
```

新案件由可執行模板建立，不把既有成品當來源。樣例是中性技術範例，不含既有案件內容或人聲。它可在缺少 Qwen 與參考 WAV 時完成 HTML、靜音影片工程的技術檢查；正式 narrated MP4 仍需使用者提供聲音輸入。

## 對話、風格與案件決策

專案入口承接對話，這個能力目錄負責製作。從目的、受眾、核心訊息與來源形成敘事及逐頁內容；以 `content/draft.md` 保存決策、所選風格、授權與進度。模板是記錄輔助，不是開始前必填的問卷。

選用共用的[風格參考](../../../../shared/styles/default/style.md)或使用者提供的參考，記錄其路徑及要延續的特徵。跨頁與跨主題延續視覺語言，各頁的物件、場景及關係依自己的語意規劃。風格、內容及製作設定分開保存，讓每次製作可重用能力而保有自己的目的。

將整體敘事分配到逐頁畫面、旁白及視覺說明，生成與修改時以這份共同來源為準。來源文件的主題邊界及頁碼對照亦保留在案件中。美化不改寫已確認內容；若需要內容調整，明確提出其影響。

明確要求的輸出沿用既有執行授權；只釐清會影響下一步的未決內容。批次工作逐案記錄內容、素材、輸出與驗收進度，依要求接續完成。缺項阻擋哪一階段就列明哪一階段，不以建立案件代替完成交付。

## 台詞檢閱

內容整理或台詞修改後，執行 `node "$PROJECT_ROOT/tools/review-script.mjs" <case-id>`，主動提供案件 `dist/script-review.html` 給使用者。它從 `slides.json` 產生逐頁對照與連續閱讀模式，顯示畫面文字、主台詞、補充旁白及語氣；缺少主台詞時明示，不自行拿畫面文字充當旁白。

`slides.json` 是唯一台詞來源；檢閱 HTML 是可重建的靜態快照，不另外維護詞稿或修改生成頁。使用者提出修訂後更新來源，再重新產生。配音前提供目前版本供檢閱，沿用已確認內容與既有授權，不新增重複確認關卡。檢閱頁生成不代表台詞已確認，也不代替視覺審核。

## 可替換品牌色與文字組成

使用者資料根目錄的 `brand.json` 可設定四個用途欄位，顏色不限定特定色系：

```json
{"name":"示範品牌","logo":null,"colors":{"primary":"#963B32","accent":"#2F8A81","surface":"#FFF4E6","text":"#202D36"}}
```

`primary` 是主要品牌色，`accent` 是強調色，`surface` 是淺色底，`text` 是深色文字；均為六碼十六進位色碼。省略 `colors` 沿用內建配色；提供時須完整設定四項。兩種 HTML 使用同一組設定，影片取用美化 HTML。既有 `purple`、`yellow`、`cream`、`darkGreen` 分別相容映射至這四項，新設定採用途名稱；同時存在時用途欄位優先。修改配色後必須實際檢查對比，欄位合法不保證可讀性。

`parts` 的一行可用 `runs: [{text, color}]` 設定行內強調，顯示文字依序連接；有 `runs` 時優先於 `text`。`color` 另支援 `mint`、`rose`，`size` 另支援 `tight`；美化版另支援 `layout: art-story|art-cover`。插圖背景適合深色文字時，設定 `case.json.visual.textContrast` 為 `dark`，仍需逐頁檢查對比。分段旁白見[配音](voice.md)。
