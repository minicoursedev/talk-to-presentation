[繁體中文](README.md) | [简体中文](README.zh-CN.md) | [English](README.en.md)

[資料存放規則](docs/DATA_LAYOUT.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路徑均相對於使用者資料根目錄；`tools/`、`templates/` 與內建 `shared/styles/default/` 相對於能力根目錄。 能力倉庫只保存工具、skill、內建樣板與中性範例。一般製作不得修改內建風格、範例或參考網站。使用者錄音、逐字稿、品牌、自訂風格、案件與輸出都放在倉庫外。

# 說說變簡報（talk-to-presentation）

從人與 AI 的對話整理共同內容來源，製作高橋流 HTML、美化 HTML 與旁白 [Canvas Commons](https://github.com/canvas-commons/canvas-commons) MP4。品牌、聲音及案件內容可替換，不限定任何活動或組織。

這是一個可重用的簡報製作專案，包含製作工具、AI skill、可替換的預設風格、案件範本與操作文件。預設「說書人」以整份故事統整畫面、台詞與節奏；題材、品牌、聲音與風格由每個案件決定。

整個專案可搬移，也可直接 clone 後開啟使用。`.agents/skills/presentation-production/` 是專案提供的 AI 操作入口；各簡報資料保存在倉庫外的 `PRESENTATION_DATA_ROOT`，不依賴外層工作區名稱或某一份既有簡報。

## 第一次使用：從這裡開始

閱讀[使用者入門指南](docs/GETTING_STARTED.md)，了解 clone 後的環境檢查、需要回答的問題、配音素材準備與可直接複製的開始範本。

## 安裝後：建立資料與範例

1. 閱讀[macOS 環境建立](docs/SETUP.md)，先檢查並沿用符合需求的既有工具，再安裝缺少的依賴。
2. 設定 `PROJECT_ROOT` 為能力目錄的實際絕對路徑。以下命令可從任意工作目錄執行；先用 `init_data.py` 建立倉庫外的資料目錄，再建立中性範例。
3. 正式製作前編輯 `$PRESENTATION_DATA_ROOT/brand.json`。`name` 是品牌名稱；`logo` 是相對資料根目錄的路徑，例如 `shared/brand/logo.svg`，預設 `null` 只顯示名稱。使用者 Logo 放在資料目錄，倉庫根目錄的 brand.json 是中性範例。
4. `sample` 已存在時沿用既有案件或改用新的 ID；`init_case.py` 不會覆寫案件。

```bash
PROJECT_ROOT="/absolute/path/to/talk-to-presentation"
export PRESENTATION_DATA_ROOT="$("$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_data.py")"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_case.py" sample
node "$PROJECT_ROOT/tools/presentation.mjs" rebuild sample --target html
python3 -m http.server 4173 --bind 127.0.0.1 --directory "$PRESENTATION_DATA_ROOT"
```

瀏覽器開啟：

- `http://127.0.0.1:4173/cases/sample/dist/sample.html`
- `http://127.0.0.1:4173/cases/sample/dist/sample-v.html`

新案件：`"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_case.py" my-talk --title "My talk"`。
完整命令、來源 schema 與確認關卡見 [工作流程](.agents/skills/presentation-production/references/workflow.md)。

## 專案操作

[操作與重建契約](docs/OPERATIONS.md)定義統一入口、來源驗證、狀態語意及既有 HTML 的保護方式。使用 `presentation.mjs status` 查詢、`plan` 檢視必要步驟，再依已有授權執行 `rebuild`。製作 skill 引用這份工具契約；案件決策仍記在 `content/draft.md`。

```bash
node "$PROJECT_ROOT/tools/presentation.mjs" status my-talk --json
node "$PROJECT_ROOT/tools/presentation.mjs" plan my-talk --target video
node "$PROJECT_ROOT/tools/presentation.mjs" rebuild my-talk --target video
```

## 配音與影片

- [配音](.agents/skills/presentation-production/references/voice.md)：Qwen 模型下載、參考聲音、逐頁主／背景旁白、局部重製、字幕與時間軸。
- [影片](.agents/skills/presentation-production/references/video.md)：Canvas Commons 靜音預覽、正式音軌、渲染、封裝。
- [驗收](.agents/skills/presentation-production/references/acceptance.md)：從 HTML 到最終影片的技術及視聽檢查。
- [本次驗證記錄](docs/VERIFICATION.md)：實際完成及未完成的驗證範圍。

語氣參考 WAV **不在交接範圍**。保留的 [語氣清單模板](templates/voice-catalog.md) 是可替換的語氣／檔名／逐字稿契約。使用者提供案件所需 WAV 後才能生成旁白。`voice.py check` 會逐項列出缺檔，不自動替換聲線。

本包包含中性的兩頁文字與程式繪製 SVG，不含舊案件、原品牌 Logo、人聲 WAV、模型權重、node_modules 或虛擬環境。模型以固定 revision 下載；依賴以 lockfile 安裝。字型使用 macOS 系統字型，首次驗收需記錄 macOS 版本；不同 macOS 的字型細節未承諾像素完全一致。

影片模板由美化 HTML 產生逐頁圖片，再以真正的 Canvas Commons 場景呈現與渲染，讓最小範例的構圖一致。預設為直接換頁，不假裝具有物件分層動畫。需要物件動畫時，修改案件 `motion/src/scenes/Slides.tsx`，依確認設計使用 Canvas Commons 的原生節點與動畫；工具不會覆寫既有場景。

## 交接邊界

只支援 macOS 首版，不提供 Linux、Windows 或 CUDA 安裝流程。環境下載需要網路；安裝及模型下載完成後，既有素材重建與 Qwen 推論不需依賴原工作區。AI 製圖工具不是安裝包的一部分，可沿用使用者提供的圖片；若要新生成圖片，需接手者自己的可用工具。

交接包完成不等於任意案件內容已確認或 narrated MP4 已驗收。範例無人聲；靜音預覽只能用於畫面與工具檢查，不能稱為配音交付。

## 再次打包

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/package.py" "$PRESENTATION_DATA_ROOT/presentation-handoff.zip"
```

只收錄通用工具、skill、文件與 sample 來源，不收錄其他案件、語音、模型、環境或生成產物。ZIP 內含 `MANIFEST.sha256`；在解壓後的 public 目錄可用 `shasum -a 256 -c MANIFEST.sha256` 核對來源檔案。

## 文件語言

既有 `.md` 路徑提供繁體中文；同目錄的 `.zh-CN.md` 與 `.en.md` 分別提供簡體中文與英文。每份文件頂端皆可切換語言，內部說明連結會留在同一語言。文件翻譯不會改寫示範簡報內容、語氣識別字、檔名或錄音逐字稿，也不代表 CLI 與第三方編輯器已完成多語系介面。

所有語言的文件一起維護。修改後執行下列檢查，核對三語完整性、連結與語氣資料契約：

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/check_docs.py"
```

## 台詞檢閱

內容整理或台詞修改後，執行 `node "$PROJECT_ROOT/tools/review-script.mjs" <case-id>`，主動提供案件 `dist/script-review.html` 給使用者。它從 `slides.json` 產生逐頁對照與連續閱讀模式，顯示畫面文字、主台詞、補充旁白及語氣；缺少主台詞時明示，不自行拿畫面文字充當旁白。

`slides.json` 是唯一台詞來源；檢閱 HTML 是可重建的靜態快照，不另外維護詞稿或修改生成頁。使用者提出修訂後更新來源，再重新產生。配音前提供目前版本供檢閱，沿用已確認內容與既有授權，不新增重複確認關卡。檢閱頁生成不代表台詞已確認，也不代替視覺審核。

完整重建與交付前檢查見[可重建驗證](docs/REPRODUCIBILITY.md)，包含獨立安裝、分段旁白及 Canvas Commons 命令列匯出。
