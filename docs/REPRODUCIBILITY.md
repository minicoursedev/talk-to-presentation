[繁體中文](REPRODUCIBILITY.md) | [简体中文](REPRODUCIBILITY.zh-CN.md) | [English](REPRODUCIBILITY.en.md)

# 驗證可重建與可重用

每次能力交付要區分來源檢查、乾淨依賴安裝、實際配音匯出與人類視聽驗收。保留本次版本、命令、工具版本及結果；歷史影片不算新版本的驗證。

## 快速回歸

```bash
node --test "$PROJECT_ROOT"/tools/*.test.mjs
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/check_docs.py"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/smoke_test.py"
```

smoke test 在含空格及中文的臨時目錄解壓原始碼，使用另一個資料根目錄，從無關 cwd 執行工具。它檢查兩種 HTML、用途品牌色與舊欄位相容、台詞檢閱、分段音訊／字幕／間隔、來源音檔不變、過期語氣拒絕及路徑邊界；不呼叫 Qwen，不安裝依賴，不渲染影片。

## 獨立安裝

`REBUILD_ROOT` 是自行選擇的全新驗證目錄，位於原能力倉庫外；不要使用正式案件目錄。先[檢查既有系統工具](SETUP.md)，沿用符合範圍的 Node、Python、FFmpeg、SoX。以下命令會安裝新的 node_modules 與 venv，不沿用原能力目錄的連結。

```bash
REBUILD_ROOT="/absolute/path/to/rebuild 測試"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/package.py" "$REBUILD_ROOT/source.zip"
python3 -m zipfile -e "$REBUILD_ROOT/source.zip" "$REBUILD_ROOT"
PROJECT_ROOT="$REBUILD_ROOT/public"
export PRESENTATION_DATA_ROOT="$REBUILD_ROOT/user data"
# If using an existing Chrome, also set BROWSER_EXECUTABLE as described in SETUP.
bash "$PROJECT_ROOT/tools/setup-macos.sh"
(cd "$PROJECT_ROOT" && shasum -a 256 -c MANIFEST.sha256)
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_case.py" rebuild-proof --title "Rebuild proof"
```

在測試資料目錄設定自己的 brand.json；配色契約見[工作流程](../.agents/skills/presentation-production/references/workflow.md)。可先修改測試案件的 slides.json，使第一頁使用分段語氣，以涵蓋多段流程；確保完整 narration 等於每段文字的連接。

## 真實旁白至 MP4

先提供測試案件所需的參考 WAV 與逐字稿，放在這份獨立資料目錄的 `shared/voice/reference-voice/`；檔案須符合[配音契約](../.agents/skills/presentation-production/references/voice.md)。模型用 `download_model.py` 取得 model.json 指定 revision。若已有同版本模型，可複製完整 models/qwen3-tts（含 download-source.json），核對 provenance 與逐檔 SHA-256，記錄為「沿用已驗證模型」，不宣稱測試了重新下載。

下列 generate 會實際合成新的測試旁白，須有使用者授權；補充旁白存在時另外執行 `generate rebuild-proof --kind background`。

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" check rebuild-proof
node "$PROJECT_ROOT/tools/review-script.mjs" rebuild-proof
node "$PROJECT_ROOT/tools/takahashi-html/build.mjs" rebuild-proof
node "$PROJECT_ROOT/tools/visual-html/build.mjs" rebuild-proof
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" generate rebuild-proof --kind main
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" timeline rebuild-proof
node "$PROJECT_ROOT/tools/prepare-motion.mjs" rebuild-proof
node "$PROJECT_ROOT/tools/motion.mjs" build rebuild-proof
node "$PROJECT_ROOT/tools/render-video.mjs" rebuild-proof
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/finish_video.py" rebuild-proof "$PRESENTATION_DATA_ROOT/cases/rebuild-proof/motion/output/presentation.mp4"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/verify_video.py" rebuild-proof
```

在[驗收](../.agents/skills/presentation-production/references/acceptance.md)要求的首幀、每個換頁交界與尾幀查看實際成片；抽聽各段與字幕核對。記錄獨立安裝是否成功、模型與參考聲音來源、影格與時長、輸出雜湊、已看／已聽範圍。未抽聽時只回報技術通過，不能寫成配音品質已驗收。實測記錄見[VERIFICATION](VERIFICATION.md)。

## 版本交付

來源、skill、三語文件與回歸測試一起納入版本；使用者資料、模型、參考錄音及驗證媒體保留在資料目錄。package.py 每次打包都重新產生 MANIFEST.sha256。若維護倉庫根目錄的 manifest，從本次 ZIP 的 public/MANIFEST.sha256 同步，避免沿用舊清單。

交付註明 commit 及 ZIP 雜湊。要讓其他人 git clone 取得更新，還須完成要求的 push 並核對遠端 commit；本機修改或本機 commit 不等於遠端已更新。更換硬體、瀏覽器或依賴版本後應重跑相同驗證，不承諾語音逐 byte 或跨機器畫面逐像素相同。
