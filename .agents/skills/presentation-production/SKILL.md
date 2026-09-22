---
name: presentation-production

description: 透過人與 AI 對話整理簡報，使用隨附的可攜 macOS 專案建立或修改高橋流 HTML、美化 HTML 與含旁白的 Canvas Commons MP4。適用於內容、旁白、插圖、動畫、重建與輸出驗證。
---

[資料存放規則](../../../docs/DATA_LAYOUT.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路徑均相對於使用者資料根目錄；`tools/`、`templates/` 與內建 `shared/styles/default/` 相對於能力根目錄。 能力倉庫只保存工具、skill、內建樣板與中性範例。一般製作不得修改內建風格、範例或參考網站。使用者錄音、逐字稿、品牌、自訂風格、案件與輸出都放在倉庫外。

[繁體中文](SKILL.md) | [简体中文](SKILL.zh-CN.md) | [English](SKILL.en.md)

# 簡報與旁白影片製作

本 skill 與交接 project 一起使用；不綁定品牌或說話者。單獨安裝 skill 不會安裝 Qwen、Canvas Commons 或專案工具。

## 開始

1. 讀取使用者指定能力目錄的 `AGENTS.md`、`README.md`，以絕對路徑設置 `PROJECT_ROOT`；再依資料存放規則解析倉庫外的 `PRESENTATION_DATA_ROOT`，從那裡讀取使用中的 `brand.json` 與案件。搬移後重新設定，不沿用其他人的本機路徑。
2. 先讀 [工作流程](references/workflow.md)，環境未建立時讀 [macOS 安裝](../../../docs/SETUP.md)。
3. 讀指定案件的 `case.json`、`content/draft.md`、`content/slides.json`；新案件用 project 的 `tools/init_case.py`，不手動複製舊案件依賴。

4. 讀取 `case.json.style` 指定的案件樣板快照（通常為 `content/style/style.md`），依其敘事、口吻、視覺與節奏製作。新案件由 `init_case.py` 保存選定樣板；預設與替換方式見[核心風格樣板](../../../shared/styles/default/style.md)。既有案件未設定時先沿用其已確認決策，不自動套用新樣板。

## 核心規則

- 對話形成主題；畫面文字、主旁白、補背景旁白、語氣、插圖與動畫是分開的決策。只改使用者指定項目。
- 修改主題、頁序或畫面文字時，先重建高橋流 HTML，以本機 HTTP 預覽交人確認；確認前不生成下游插圖、語音或影片。範例的技術測試不等於正式案件內容確稿。
- 延續已有確認與執行授權，不因換 task 重設全部關卡。記錄確認於 `draft.md`，但以最新指示為準。
- 旁白文字確認不等於執行 TTS；只有明確要求生成／重製語音才執行。一般重建使用既有 WAV。
- 品牌名稱和 Logo 都由 `brand.json` 決定。Logo 未設定時，中性範例顯示品牌文字；正式交付使用接手者確認的品牌設定。
- HTML 與影片不直接修改 `dist/`。來源是 slides、資產和場景；美化 HTML 可作影片構圖比對基準。
- 呼叫 scripts 時使用由 `PROJECT_ROOT` 組成的絕對路徑，不寫死安裝位置。

- 圖片覆蓋範圍、語速與批次風格是案件決策，記在 `draft.md`；每頁需圖時設定 `case.json.visual.requireImages`，不可自行排除標題、提問或結尾頁。逐頁規劃與檢查見 [圖片](references/images.md)。
- 美化與換圖保留已確認頁序、文字與旁白；資料仍在不等於畫面可見，交付前依 [驗收](references/acceptance.md) 核對。

## 按任務閱讀

- 新案件、schema、重建命令：[工作流程](references/workflow.md)。
- 文稿、Qwen、參考語音、WAV、時間軸與字幕：[配音](references/voice.md)。
- 插圖及圖片修改：[圖片](references/images.md)。
- Canvas Commons、構圖與渲染：[影片](references/video.md)。
- 交付前：[驗收](references/acceptance.md)。

改語音只重建相關音檔、時間軸、字幕及影片；改插圖重建美化 HTML 與影片；改動畫只重建影片；改品牌重建兩種 HTML 與影片。未指定頁面的已確認 WAV 不應改變。

- 內容整理或台詞修改後，執行 `node "$PROJECT_ROOT/tools/review-script.mjs" <case-id>`，主動提供案件 `dist/script-review.html` 給使用者。它從 `slides.json` 產生逐頁對照與連續閱讀模式，顯示畫面文字、主台詞、補充旁白及語氣；缺少主台詞時明示，不自行拿畫面文字充當旁白。 `slides.json` 是唯一台詞來源；檢閱 HTML 是可重建的靜態快照，不另外維護詞稿或修改生成頁。使用者提出修訂後更新來源，再重新產生。配音前提供目前版本供檢閱，沿用已確認內容與既有授權，不新增重複確認關卡。檢閱頁生成不代表台詞已確認，也不代替視覺審核。

## 可重建流程的契約

- 品牌色使用 `primary`／`accent`／`surface`／`text` 等用途欄位，見[工作流程](references/workflow.md)；不得將案件品牌色系寫成通用必要條件。
- 同一頁需要不同語氣時使用 `narrationSegments`，依[配音](references/voice.md)的檔名與重製範圍執行。
- 完整影片可使用 `render-video.mjs` 呼叫 Canvas Commons FFmpeg exporter，見[影片](references/video.md)；交付前仍要封裝、技術檢查及視聽驗收。
- 能力修改後依[重建驗證](../../../docs/REPRODUCIBILITY.md)在獨立目錄安裝及測試；將通過版本與實際未驗證項目記錄在交付中。
