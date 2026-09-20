[繁體中文](VERIFICATION.md) | [简体中文](VERIFICATION.zh-CN.md) | [English](VERIFICATION.en.md)

# 本次交接包驗證

日期：2026-09-21。這是交接工具的技術驗證，不是任何正式簡報的內容或配音驗收。

## 實測環境

- macOS 26.6.2（25G83）、Apple Silicon arm64。
- Node 26.7.0；Python 3.12.14 的獨立虛擬環境。
- Motion Canvas 3.17.2、FFmpeg exporter 1.1.1、Vite 4.5.14。
- Playwright 1.58.2 搭配本機 Google Chrome；Chromium 自動下載完成後解壓縮停滯，已停止該安裝程序，改走文件中的 `BROWSER_EXECUTABLE` 方式。沒有把自動下載路徑列為已通過。
- 系統 FFmpeg 9.0.1；exporter 使用 npm 套件帶入的 FFmpeg。

## 已完成

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

## 尚未驗證／接手者必要輸入

- 不附參考 WAV，未執行真人聲線 Qwen 推論，也未做真人旁白抽聽。需要使用者提供參考 WAV、對應逐字稿與明確生成授權後，依配音流程驗收。
- 品牌 Logo 由使用者提供；中性範例預設只顯示文字品牌。
- Intel Mac、其他 macOS 版本、Node 22 與 Playwright 配套 Chromium 在本次未完成實測。不要將「macOS 首版」理解成所有硬體組合均已驗證。
- 這不是全新實體 Mac 的 OS provisioning 測試；驗證涵蓋獨立依賴安裝與搬移後重建，不包含 Homebrew 本身安裝。
- npm 安裝回報 5 項 dependency audit 結果（1 low、2 moderate、2 high）。沿用固定的 Motion Canvas/Vite 相容組合，未執行強制 major 升級或宣稱安全審查通過；開發伺服器僅供本機使用。

## 重跑

```bash
python3 "$PROJECT_ROOT/tools/smoke_test.py"
```

此測試在臨時目錄自行建立非人聲訊號，結束即移除；不會呼叫 Qwen、改正式案件或加入參考語音。Motion Canvas 的實際渲染與視聽驗收仍依 skill 的影片及驗收文件執行。
