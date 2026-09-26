---
name: presentation-production

description: 透過人與 AI 對話整理簡報，使用隨附的可攜 macOS 專案建立或修改高橋流 HTML、美化 HTML 與含旁白的 Canvas Commons MP4。適用於內容、旁白、插圖、動畫、重建與輸出驗證。
---

[資料存放規則](../../../docs/DATA_LAYOUT.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路徑均相對於使用者資料根目錄；`tools/`、`templates/` 與內建 `shared/styles/default/` 相對於能力根目錄。 能力倉庫只保存工具、skill、內建樣板與中性範例。一般製作不得修改內建風格、範例或參考網站。使用者錄音、逐字稿、品牌、自訂風格、案件與輸出都放在倉庫外。

[繁體中文](SKILL.md) | [简体中文](SKILL.zh-CN.md) | [English](SKILL.en.md)

# 簡報與旁白影片製作

本 skill 與能力專案一起使用；不綁定品牌、題材或說話者。單獨複製 skill 不會安裝 Qwen、Canvas Commons 或專案工具。

## 開始

1. 讀取能力目錄的 `AGENTS.md`、`README.md`，將其絕對路徑設為 `PROJECT_ROOT`。依[資料存放規則](../../../docs/DATA_LAYOUT.md)解析倉庫外的 `PRESENTATION_DATA_ROOT`，從資料目錄讀取使用中的 `brand.json` 與案件。
2. 讀[工作流程](references/workflow.md)；首次使用先提供[入門指南](../../../docs/GETTING_STARTED.md)，環境缺項依[安裝說明](../../../docs/SETUP.md)處理，沿用符合需求的既有工具。
3. 既有案件先讀 `case.json`、`content/draft.md` 與 `content/slides.json`；新案件用 `tools/init_case.py` 建立。
4. 依 `case.json.style.snapshot` 讀取案件的風格快照，延續敘事、口吻、視覺及節奏。新案件預設使用可替換的[說書人樣板](../../../shared/styles/default/style.md)；沒有 style 設定的舊案件沿用已確認方向，不自動換風格。

## 製作原則

- 整份簡報有連貫的故事線；逐頁內容、畫面、旁白共同推進理解。題材、品牌、語速與圖片覆蓋範圍是案件決策，記在 `content/draft.md`。
- 畫面文字、主旁白、補充旁白、語氣、插圖與動畫分開保存及修改。`slides.json` 是共同來源，`dist/` 是可重建的輸出。
- 主題、頁序或畫面文字改動後，先重建高橋流 HTML 並提供預覽。依已有確認與授權繼續製作；只有尚未決定且會影響下一步的內容才需釐清，不因更換任務或文件範本重設確認關卡。
- 內容確認與執行授權分別記錄；台詞確認本身不等於授權配音，已有完整製作授權則沿用，依最新使用者指示處理。生成草稿不等於已確認；一般重建沿用已有圖片及 WAV，生成或重製依使用者授權範圍執行。
- 品牌名稱、Logo 與用途配色讀取資料根目錄的 `brand.json`。未選品牌時明示中性預設，不套用其他案件的品牌。
- 每頁需圖時設定 `case.json.visual.requireImages`，含標題、提問及結尾頁；實際看圖驗收不能由檔案存在或建置成功代替。
- 呼叫工具使用由 `PROJECT_ROOT` 組成的絕對路徑。不得寫死使用者安裝位置，也不得把製作資料寫入能力倉庫。
- 影片轉檔開始後等待程序自然結束，不主動輪詢進度；結束後確認輸出結果，失敗時依錯誤訊息處理。

- 查詢現況或重建前，依[操作與重建契約](../../../docs/OPERATIONS.md)使用 `presentation.mjs status`／`plan`；已有授權時執行必要的 `rebuild`。狀態由來源及產物計算，決策仍讀案件紀錄。

- 多語要求只適用於本專案倉庫內的操作文件、skill 與內建範本。使用者的案件底稿、交付說明、自訂風格與聲音清單依其工作語言維護一份；只有明確要求翻譯時才增加語言版本。

## 按任務閱讀

- 新案件、schema、品牌、台詞檢閱：[工作流程](references/workflow.md)。
- Qwen、參考聲音、`narrationSegments`、局部重製、時間軸與字幕：[配音](references/voice.md)。
- 插圖、圖片替換與逐頁覆蓋：[圖片](references/images.md)。
- Canvas Commons 構圖、命令列／編輯器匯出、封裝：[影片](references/video.md)。
- 交付前的技術檢查與視聽審核：[驗收](references/acceptance.md)。

內容整理或台詞修改後，執行 `node "$PROJECT_ROOT/tools/review-script.mjs" <case-id>`，主動提供 `dist/script-review.html`。它顯示逐頁對照、連續台詞及分段語氣；修訂仍回寫 `slides.json` 再生成，不另建可編輯詞稿。生成檢閱頁不代表台詞已確認。

## 修改後重建

- 配音變更：只重製授權範圍內的頁面，再更新時間軸、字幕與影片；其他頁 WAV 保持不變。
- 圖片變更：重建美化 HTML 與影片；動畫變更：重建影片；品牌變更：重建兩種 HTML 與影片。這些操作沿用已確認旁白。
- 時間軸依旁白、語氣、頁序、fps、停頓與 WAV 判斷是否過期；只改畫面、圖片、品牌或畫幅時可沿用。舊版時間軸仍檢查完整來源雜湊，必要時以既有 WAV 更新一次。詳細狀態與重建規則以[操作與重建契約](../../../docs/OPERATIONS.md)為準。
- 修改共用能力後，依[重建驗證](../../../docs/REPRODUCIBILITY.md)選擇受影響的檢查。純文件校稿檢查三語、連結、範例及 skill；依賴或產製流程變更才需對應的獨立安裝／端到端驗證。回報實際通過項目與未驗證階段。
