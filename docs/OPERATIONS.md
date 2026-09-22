[繁體中文](OPERATIONS.md) | [简体中文](OPERATIONS.zh-CN.md) | [English](OPERATIONS.en.md)

# 專案操作與重建契約

`talk-to-presentation` 是通用簡報製作專案。README 提供定位與入門，製作 skill 指引 AI 的工作方式，本文件定義統一工具入口與狀態語意。題材、故事、授權及驗收決策仍記在各案 `content/draft.md`；產生的狀態報告不取代這些決策。

## 統一入口

`PROJECT_ROOT` 是本專案的實際絕對路徑；案件仍由倉庫外的 `PRESENTATION_DATA_ROOT` 解析。以下命令可從任意工作目錄執行：

```bash
node "$PROJECT_ROOT/tools/presentation.mjs" validate my-talk
node "$PROJECT_ROOT/tools/presentation.mjs" status my-talk --json
node "$PROJECT_ROOT/tools/presentation.mjs" plan my-talk --target video
node "$PROJECT_ROOT/tools/presentation.mjs" rebuild my-talk --target video
node "$PROJECT_ROOT/tools/presentation.mjs" check
```

- `validate`：檢查來源格式、路徑、品牌設定及圖片引用。未提供配音不阻擋內容工作；圖片存在不代表視覺驗收。
- `status`：唯讀彙整各階段的生成紀錄、來源與產物雜湊，以及缺少或與台詞不符的 WAV。
- `plan`：唯讀列出指定目標需要重建或可沿用的階段，以及阻擋原因。
- `rebuild`：依序執行必要階段，沿用仍有效的結果；失敗即停止。只使用既有 WAV 與圖片，不呼叫 TTS 或製圖。
- `check`：執行 Node 測試、三語文件檢查與隔離 smoke test；不安裝依賴、不渲染影片、不宣稱視聽驗收。也可在專案目錄執行 `npm test`。

| target | 執行範圍 |
| --- | --- |
| `review` | 台詞檢閱 |
| `text` | 台詞檢閱與高橋流 HTML，無需圖片或配音 |
| `html` | 台詞檢閱、高橋流與美化 HTML |
| `timeline` | 既有 WAV 的時間軸、組合音軌與字幕 |
| `preview` | 台詞檢閱、美化 HTML、擷取、Canvas Commons build／靜音匯出、技術驗證 |
| `video` | 台詞檢閱、美化 HTML、時間軸、擷取、Canvas Commons build／含音訊匯出、字幕封裝與技術驗證 |

Python 優先使用專案 `.venv/bin/python`，沒有時使用 `python3`；可用 `PRESENTATION_PYTHON` 指定執行檔。瀏覽器沿用 `BROWSER_EXECUTABLE` 設定。完整安裝見 [SETUP](SETUP.md)。

## 來源契約

[contract.mjs](../tools/contract.mjs) 是共用的可執行驗證器。Node 製作工具直接呼叫；Python 的 `common.load` 呼叫相同的 Node 驗證器，因此 Python 製作指令也需要已安裝 Node。沒有增加第三方套件。

驗證涵蓋唯一正整數頁碼、畫幅與 fps、非負的影格與間隔設定、畫面文字／文字片段、台詞與語氣型別、分段台詞完整串接、輸出與圖片路徑。欄位錯誤會指出如 `slides[0].page` 的位置。保留未知欄位，允許案件自訂動畫與記錄；不把欄位存在視為內容確認。各欄位用途見[工作流程](../.agents/skills/presentation-production/references/workflow.md)。

## 變更與重建

- 畫面文字／圖片修改：影響對應的檢閱或 HTML 與下游影片；沿用時間軸與旁白 WAV。
- 品牌／畫幅修改：影響 HTML 與影片；不因尺寸改變而重製旁白或時間軸。
- 台詞／語氣／分段修改：先依既有授權處理受影響 WAV；來源紀錄與台詞或語氣不符時，重建會停止並指出範圍。
- WAV／頁序／fps／停頓修改：重建時間軸及影片，不自動呼叫 TTS。
- 自訂場景修改：重建影片，保留案件 `motion/src/`。

新版 `timeline.json.narrationSource` 只追蹤會影響旁白與時間軸的來源。舊時間軸仍支援原始完整來源雜湊；舊來源有變時，用既有 WAV 執行一次 `voice.py timeline` 即可升級，不需搬移或重製聲音。

統一入口在成功後將生成證據寫入案件 `verification/build/`，記錄工具／輸入指紋與產物 SHA-256。它可重建，不是第二份來源。原有個別指令仍可使用，但不會補寫此紀錄；直接修改或重建的結果需要重新判斷，不會因檔案存在就標成最新。


Canvas Commons 的 `.meta` 檔案以排序後的 JSON 內容計算指紋（`json:` 前綴），忽略重新存檔造成的空白格式差異；設定值變更仍會失效。其餘檔案以原始位元組 SHA-256 比對。

| 狀態 | 意義 |
| --- | --- |
| `current` | 已追蹤的輸入、工具、產物與上游紀錄相符 |
| `stale` | 輸入、工具、產物或上游狀態改變 |
| `missing` | 缺少產物 |
| `untracked` | 產物存在但沒有生成紀錄，無法確定是否對應目前來源 |
| `unavailable` | 未設定該輸出 |
| `external` | 明確選擇使用案件另行維護的 HTML，來源同步由案件流程確認 |

`current` 只描述已追蹤檔案的一致性，不等於台詞已確認、視覺或聽覺已驗收。自訂場景若另讀未追蹤的外部資源，仍需依案件流程檢查。缺少生成來源紀錄的舊 WAV 可沿用，其台詞對應與聽感仍須審核。

## 保護既有 HTML

匯入 HTML、沒有生成紀錄的既有 HTML，或生成後被另行修改的 HTML，都不會被統一入口直接覆寫。先查看案件的原始製作方式，再選擇：

```bash
# 沿用另行維護且已核對的美化 HTML，繼續製作影片。
node "$PROJECT_ROOT/tools/presentation.mjs" rebuild my-talk --target video --use-existing-html
# 明確選擇以內建產生器重建 HTML，會覆寫既有版面。
node "$PROJECT_ROOT/tools/presentation.mjs" rebuild my-talk --target html --replace-html
```

這兩個選項不能並用。`--use-existing-html` 不宣稱 HTML 與 `slides.json` 已同步，也不代表該案件的內容或視聽驗收完成。使用者既有授權持續有效，選項用來表達工具要採取的操作，不增加重複確認關卡。

實際產出驗收見[驗收指引](../.agents/skills/presentation-production/references/acceptance.md)，重建測試見[可重建驗證](REPRODUCIBILITY.md)。
