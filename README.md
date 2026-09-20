# 簡報製作交接包（macOS）

從人與 AI 的對話整理共同內容來源，製作高橋流 HTML、美化 HTML 與旁白 Motion Canvas MP4。品牌、聲音及案件內容可替換，不限定任何活動或組織。

這個目錄就是交接 project。整個目錄可搬移；不需原工作區、舊案件、原使用者帳號或原虛擬環境。`.agents/skills/presentation-production/` 是隨專案交付的 skill。使用 Codex 時將這個目錄開成專案；也可以照文件手動操作 scripts。

## 第一次使用

1. 閱讀 [macOS 環境建立](docs/SETUP.md)，安裝依賴。
2. 設定 `PROJECT_ROOT` 為本目錄的實際**絕對路徑**。不要照抄他人的 `/Users/...`。所有命令可從任意工作目錄執行。
3. 編輯 `brand.json`；`name` 是品牌名稱，`logo` 是相對本 project 的檔案路徑，例如 `shared/brand/logo.svg`。將自己的 Logo 放到該位置。預設 `null` 只顯示中性品牌文字，本包未附特定品牌 Logo。
4. 先試中性最小範例，再用工具建立自己的案件。

```bash
PROJECT_ROOT="/你的實際路徑/public"
node "$PROJECT_ROOT/tools/takahashi-html/build.mjs" sample
node "$PROJECT_ROOT/tools/visual-html/build.mjs" sample
python3 -m http.server 4173 --bind 127.0.0.1 --directory "$PROJECT_ROOT"
```

瀏覽器開啟：
- `http://127.0.0.1:4173/cases/sample/dist/sample.html`
- `http://127.0.0.1:4173/cases/sample/dist/sample-v.html`

新案件：`python3 "$PROJECT_ROOT/tools/init_case.py" my-talk --title "我的講題"`。
完整命令、來源 schema 與確認關卡見 [工作流程](.agents/skills/presentation-production/references/workflow.md)。

## 配音與影片

- [配音](.agents/skills/presentation-production/references/voice.md)：Qwen 模型下載、參考聲音、逐頁主／背景旁白、局部重製、字幕與時間軸。
- [影片](.agents/skills/presentation-production/references/video.md)：Motion Canvas 靜音預覽、正式音軌、渲染、封裝。
- [驗收](.agents/skills/presentation-production/references/acceptance.md)：從 HTML 到最終影片的技術及視聽檢查。
- [本次驗證記錄](docs/VERIFICATION.md)：實際完成及未完成的驗證範圍。

語氣參考 WAV **不在交接範圍**。保留的 [語氣 README](shared/voice/reference-voice/README.md) 是可替換的語氣／檔名／逐字稿契約。使用者提供案件所需 WAV 後才能生成旁白。`voice.py check` 會逐項列出缺檔，不自動替換聲線。

本包包含中性的兩頁文字與程式繪製 SVG，不含舊案件、原品牌 Logo、人聲 WAV、模型權重、node_modules 或虛擬環境。模型以固定 revision 下載；依賴以 lockfile 安裝。字型使用 macOS 系統字型，首次驗收需記錄 macOS 版本；不同 macOS 的字型細節未承諾像素完全一致。

影片模板由美化 HTML 產生逐頁圖片，再以真正的 Motion Canvas 場景呈現與渲染，讓最小範例的構圖一致。預設為直接換頁，不假裝具有物件分層動畫。需要物件動畫時，修改案件 `motion/src/scenes/Slides.tsx`，依確認設計使用 Motion Canvas 的原生節點與動畫；工具不會覆寫既有場景。

## 交接邊界

只支援 macOS 首版，不提供 Linux、Windows 或 CUDA 安裝流程。環境下載需要網路；安裝及模型下載完成後，既有素材重建與 Qwen 推論不需依赖原工作區。AI 製圖工具不是安裝包的一部分，可沿用使用者提供的圖片；若要新生成圖片，需接手者自己的可用工具。

交接包完成不等於任意案件內容已確認或 narrated MP4 已驗收。範例無人聲；靜音預覽只能用於畫面與工具檢查，不能稱為配音交付。

## 再次打包

```bash
python3 "$PROJECT_ROOT/tools/package.py" "$PROJECT_ROOT/presentation-handoff.zip"
```

只收錄通用工具、skill、文件與 sample 來源，不收錄其他案件、語音、模型、環境或生成產物。ZIP 內含 `MANIFEST.sha256`；在解壓後的 public 目錄可用 `shasum -a 256 -c MANIFEST.sha256` 核對來源檔案。
