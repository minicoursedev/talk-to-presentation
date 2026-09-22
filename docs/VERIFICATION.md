[繁體中文](VERIFICATION.md) | [简体中文](VERIFICATION.zh-CN.md) | [English](VERIFICATION.en.md)

[資料存放規則](DATA_LAYOUT.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路徑均相對於使用者資料根目錄；`tools/`、`templates/` 與內建 `shared/styles/default/` 相對於能力根目錄。 能力倉庫只保存工具、skill、內建樣板與中性範例。一般製作不得修改內建風格、範例或參考網站。使用者錄音、逐字稿、品牌、自訂風格、案件與輸出都放在倉庫外。

# 本次交接包驗證

## 2026-09-22：獨立安裝與真實旁白重建

本次驗證使用倉庫外、含中文與空格的獨立目錄，從 /private/tmp 呼叫打包後的工具。測試用兩頁中性內容，第一頁包含兩種語氣的兩個 narrationSegments，第二頁使用單段主旁白；品牌色換成紅／青綠組合。原案件與使用者品牌未修改。

- 在同一台 macOS 26.6.2 Apple Silicon，以現有 Node 26.7.0、Python 3.12.14、FFmpeg 9.0.1、SoX、Chrome 153.0.8010.53 執行完整 setup-macos.sh。npm ci（含安裝腳本）與 Python lockfile 安裝成功，使用新建 node_modules 與 .venv；沒有連結原能力環境。Canvas Commons 與 exporter 維持 0.3.1，exporter 使用 FFmpeg 6.1.1。
- 從已存在的本機模型複製完整目錄，核對 model.json／download-source.json 及 14 個模型檔案 SHA-256；revision 為 fd4b254389122332181a7c3db7f27e918eec64e3。這是模型沿用與離線推論驗證，未重新下載權重。
- 兩份使用者參考聲音只複製到測試資料目錄。立體聲錄音另存 mono PCM16 副本，原錄音不變。voice.py check 通過，獨立 .venv 的 Qwen 以 CPU/float32/eager 實際生成三個新 WAV；每個 WAV 有文字、語氣、revision、參考聲音雜湊記錄。
- 台詞檢閱、兩種 HTML、分段時間軸／三段字幕、prepare、TypeScript/Vite build、命令列 Canvas Commons FFmpeg exporter、封裝及完整解碼通過。
- 最終測試片：1080×1920、30 fps、231 幀、7.700 秒；H.264、AAC、mov_text。首幀、159／160／161 換頁交界及第 230 尾幀實際查看，品牌與文字可見，沒有空白交界。
- AAC 解碼回 24 kHz 後，來源與輸出同為 184800 個取樣，相關係數 0.99832。這驗證音訊傳遞，不等於已抽聽文字與語氣；本次未做人類聽覺驗收。
- 用另一個短案例驗證靜音 preview、音訊模式不符拒絕、場景故意拋出錯誤時非零結束。錯誤測試不改正式案件；新工具不把渲染失敗回報成成功。
- 4 項 Node 測試、三語文件檢查（18 組／54 份）、skill quick_validate 與隔離 smoke test 通過。回歸涵蓋用途色欄位／舊欄位相容、分段語氣和停頓、逐段字幕、原 WAV 不變、過期語氣拒絕、台詞檢閱與資料路徑邊界。台詞檢閱的 macOS 路徑別名問題亦由 smoke test 重現並修正。

最終測試片 SHA-256：`03825c3f300e429474e51d24f6f924305dccd26b28f46a84e1f60b2e222ad8a4`。音檔、模型、MP4、測試日誌與檢查圖保存在外部資料目錄，不放入能力倉庫或來源交接包。重跑方式見[可重建驗證](REPRODUCIBILITY.md)。

範圍：這是同一台 Mac 上的乾淨依賴安裝與實際旁白成片重建，沒有驗證全新實體 Mac、Homebrew 安裝、Intel、其他作業系統、其他 Node 版本或 Playwright 配套 Chromium。系統工具與 Chrome 沿用既有安裝；語音自然度仍需人類抽聽。

## 2026-09-21 歷史驗證

日期：2026-09-21。這是交接工具的技術驗證，不是任何正式簡報的內容或配音驗收。

## Canvas Commons 0.3.1 遷移驗證

目前交接包使用 Canvas Commons 0.3.1（core、2d、editor、Vite plugin、FFmpeg exporter），搭配 Vite 4.5.14、TypeScript 5.2.2 與 Playwright 1.58.2。套件使用 ESM，project 已設定 `type: module`，並補入上游型別宣告所需的 `@types/chroma-js` 3.1.2。

本次在同一台 Apple Silicon Mac、Node 26.7.0 與既有 Chrome 驗證；此歷史紀錄當時尚推薦 Node 22；目前安裝指引已改為沿用符合 >= 20.19.0 的既有版本。Qwen 模型、語音產生腳本、內容來源與兩種 HTML 產生器未變更。

- 新版完整 npm 安裝與 exporter 的 FFmpeg 6.1.1／ffprobe 二進位下載成功。搬移後的鎖定檔檢查使用 `npm ci --ignore-scripts`，另驗證兩種 HTML、Chrome 取圖與 TypeScript/Vite 編譯；搬移目錄不重複下載二進位，因此不把該次檢查列為完整安裝腳本驗證。
- 本次 npm 安裝回報 7 項依賴 audit 結果（2 low、2 moderate、3 high）；未執行強制升級或宣稱安全審查通過。開發伺服器只綁本機。
- 無 WAV 的 sample 亦完成靜音 exporter 渲染：180 幀、6.000 秒；沒有 audio stream，完整解碼通過。
- 兩種 HTML、sample 與新案件的 TypeScript/Vite 編譯、Canvas Commons 編輯器載入通過。
- 實際 FFmpeg exporter 渲染與字幕封裝通過：1080×1920、30fps、126 幀、4.200 秒，H.264、AAC 與 mov_text。完整解碼通過，音軌長度為 4.200 秒。
- 遷移時修正 range：新 exporter 以結束時間減開始時間限制 MP4 時長；沿用舊版的「減一幀」會少一幀。現在使用總幀數／fps。
- 實際查看新影片第 0、65、66、67、125 幀：品牌與內容首幀可見，第 65 幀為第一頁，第 66 幀為第二頁，無空白；文字與原 HTML 構圖一致。
- 使用三段臨時合成音（主／背景分開），解碼後與原時間軸的 PCM 相關係數為 0.99999，兩者皆為 100800 個 24kHz 取樣。這只驗證音訊傳遞，不代表真人朗讀與語氣已抽聽；未呼叫 Qwen。

本次測試 MP4 SHA-256：`ba57fd4a52452bb49b9f62dc8db63b90e18a3b1d270995e3f08b527460e7052e`。測試 WAV 與 MP4 不收入 ZIP。

下方保留遷移前紀錄，歷史 Motion Canvas 成果不作為新引擎的渲染證據。

## 遷移前的歷史驗證（Motion Canvas）

### 實測環境

- macOS 26.6.2（25G83）、Apple Silicon arm64。
- Node 26.7.0；Python 3.12.14 的獨立虛擬環境。
- Motion Canvas 3.17.2、FFmpeg exporter 1.1.1、Vite 4.5.14。
- Playwright 1.58.2 搭配本機 Google Chrome；Chromium 自動下載完成後解壓縮停滯，已停止該安裝程序，改走文件中的 `BROWSER_EXECUTABLE` 方式。沒有把自動下載路徑列為已通過。
- 系統 FFmpeg 9.0.1；exporter 使用 npm 套件帶入的 FFmpeg。

### 已完成

1. 全新 npm 安裝：在交接 project 及 ZIP 解壓後的獨立目錄分別執行 `npm ci`，不連結原案件 node_modules。
2. Python：用交接包的完整 lockfile 建立全新 `.venv` 並安裝 90 個套件；可匯入 Qwen3TTSModel、PyTorch 2.11.0、torchaudio 2.11.0 和 OpenCC，繁簡轉換通過。環境沒有 SoX 系統執行檔，匯入時有警告；SETUP 已列為必要安裝項目。因此未把完整 setup shell 從乾淨 OS 執行列為已通過。
3. 上游模型：確認 `model.json` 的 repo 與 revision 存在，revision 是 `fd4b254389122332181a7c3db7f27e918eec64e3`。未下載全部權重。
4. 可攜性：ZIP 解壓到另一個含中文的絕對路徑，從 `/tmp` 呼叫工具；另以含空格及中文的臨時目錄跑自動 smoke test。兩種 HTML、案件初始化與時間軸皆可獨立執行。
5. 缺檔：未附語氣 WAV，`voice.py check sample` 非零結束且列出確切缺檔；沒有替換聲音。
6. 時間軸：用臨時合成測試音驗證主／背景分開、三段字幕、非連續頁碼、不同片段長度、幀邊界補齊、原 WAV 雜湊不變。測試音不在交接包中。
7. 畫面與品牌：兩頁美化 HTML 經 Chromium 控制介面擷取成功、無缺圖；搬移測試替換 brand.name 與測試 Logo，影片顯示替換後資產。原品牌 Logo 未使用。
8. Motion Canvas：TypeScript/Vite build、實際 FFmpeg exporter render、字幕封裝、ffprobe、完整解碼通過。曾發現並修正 exporter 讀音檔的工程根目錄差異、換頁提早一幀、結束幀多輸出等問題。
9. 最後一次合成音測試影片：1080×1920、30fps、126 幀、4.200 秒，含 H.264 video、AAC audio、mov_text 字幕。video 與 audio 均為 4.200 秒。
10. 實際抽看最後影片第 0、65、66、67、125 幀：首幀內容和測試品牌可見；第 65 幀仍為第一頁，第 66 幀開始第二頁，頁界沒有空白。比對兩頁擷取圖確認構圖與換行。此範例只有直接切頁，不包含需要額外驗收的連續物件動畫。
11. skill 通過 skill-creator 的 quick_validate；文件內部連結與包內檔案清單另外檢查。

最後測試影片 SHA-256：
`40992973f3887dbc0b0d3abba15623c45cbffe2d9b008a2c66c6e8252f1e56d8`

### 尚未驗證／接手者必要輸入

- 不附參考 WAV，未執行真人聲線 Qwen 推論，也未做真人旁白抽聽。需要使用者提供參考 WAV、對應逐字稿與明確生成授權後，依配音流程驗收。
- 品牌 Logo 由使用者提供；中性範例預設只顯示文字品牌。
- Intel Mac、其他 macOS 版本、Node 22 與 Playwright 配套 Chromium 在本次未完成實測。不要將「macOS 首版」理解成所有硬體組合均已驗證。
- 這不是全新實體 Mac 的 OS provisioning 測試；驗證涵蓋獨立依賴安裝與搬移後重建，不包含 Homebrew 本身安裝。
- npm 安裝回報 5 項 dependency audit 結果（1 low、2 moderate、2 high）。沿用固定的 Motion Canvas/Vite 相容組合，未執行強制 major 升級或宣稱安全審查通過；開發伺服器僅供本機使用。

### 重跑

```bash
python3 "$PROJECT_ROOT/tools/smoke_test.py"
```

此測試在臨時目錄自行建立非人聲訊號，結束即移除；不會呼叫 Qwen、改正式案件或加入參考語音。Motion Canvas 的實際渲染與視聽驗收仍依 skill 的影片及驗收文件執行。

2026-09-21 資料分離驗證：通過三語文件與 skill 檢查、隔離打包／兩種 HTML／時間軸測試、倉庫內容雜湊不變檢查，以及倉庫內路徑、越界輸出與符號連結拒絕測試。倉庫外案件完成兩頁靜音截圖及 TypeScript／Vite 建置。本次未生成真人配音或渲染最終 MP4，既有個人資料未搬移。
