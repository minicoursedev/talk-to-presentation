[繁體中文](SETUP.md) | [简体中文](SETUP.zh-CN.md) | [English](SETUP.en.md)

# macOS 從零建立環境

## 系統工具

本版以 macOS Apple Silicon、Python 3.12、Node 22 LTS 為安裝目標。macOS Intel 未實機驗證，且近期 PyTorch 的 macOS wheels 可能不支援 Intel；不可把 Apple Silicon 的 lockfile 當成已驗證 Intel 環境。若接手者使用 Intel，需另行解決並驗證相容依賴，不得靜默替換模型。

先安裝 Apple Command Line Tools（若尚未安裝）：

```bash
xcode-select --install
```

使用者自行安裝 [Homebrew](https://brew.sh/) 後：

```bash
brew install node@22 python@3.12 ffmpeg sox
export PATH="$(brew --prefix node@22)/bin:$(brew --prefix python@3.12)/bin:$PATH"
node --version
python3.12 --version
ffmpeg -version
sox --version
```

不寫死 `/opt/homebrew`，以 `brew --prefix` 找到實際位置。FFmpeg 與 macOS 字型版本未由 npm/pip 鎖定，驗收記錄必須保留版本。此包不安裝或改動系統字型。

## 安裝交接 project

把交接目錄放在任意可寫位置，定義其絕對路徑（下例需替換）：

```bash
PROJECT_ROOT="/absolute/path/to/public"
bash "$PROJECT_ROOT/tools/setup-macos.sh"
```

腳本會在包內建立 `.venv`，執行 `npm ci`、安裝 Playwright Chromium，再從 `requirements-macos.lock.txt` 安裝 Python 套件。不會安裝 Qwen 權重，也不會生成語音。
Playwright 將瀏覽器下載至使用者標準快取；這是可由安裝命令重建的依賴，不沿用原作者私有路徑。

如果分步安裝，npm 的 `--prefix` 使用絕對 project 路徑：

```bash
npm --prefix "$PROJECT_ROOT" ci
"$PROJECT_ROOT/node_modules/.bin/playwright" install chromium
python3.12 -m venv "$PROJECT_ROOT/.venv"
"$PROJECT_ROOT/.venv/bin/python" -m pip install -r "$PROJECT_ROOT/requirements-macos.lock.txt"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/doctor.py"
```

首次下載模型（只在要生成新語音時必要）：

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/download_model.py"
```

`model.json` 固定 Hugging Face repo 與 revision，下載到包內 `models/qwen3-tts`。網路失敗可重跑下載命令；不能把不完整下載當成可用模型。模型檔案及第三方依賴遵守各自授權，本包不重新授權它們。
生成腳本只讀該目錄，不到上層 `.hf-cache` 或原使用者環境找檔案。CPU 推論需要足夠 RAM 與磁碟空間；實際需求依執行長度與依賴而定，執行前確認可用資源。

## 版本維護

Node dependencies 固定在 `package-lock.json`；Canvas Commons core、2d、editor、Vite plugin 與 FFmpeg exporter 均固定為 0.3.1。套件要求 Node >= 20.19.0；本包安裝目標仍為 Node 22 LTS。不要用 `npm audit fix --force` 直接改到不相容 major。開發伺服器只綁 `127.0.0.1`。

Python 直接依賴在 `requirements.in`；完整依賴解析保存在 `requirements-macos.lock.txt`，針對 Python 3.12 / Apple Silicon。只有刻意升級時才用 uv 重新解析：

```bash
uv pip compile "$PROJECT_ROOT/requirements.in" --python-version 3.12 --python-platform aarch64-apple-darwin --no-header -o "$PROJECT_ROOT/requirements-macos.lock.txt"
```

升級後需重新跑安裝、輸入驗證、時間軸、Canvas Commons build/render 與視聽驗收。

## 常見問題

- `ModuleNotFoundError`：確認使用 `$PROJECT_ROOT/.venv/bin/python`，不要使用其他專案的 venv。
- Chromium 缺失：執行上面的 Playwright install。
- Missing reference WAV：依語氣 README 自行提供，並讓逐字稿符合實際聲音。
- 模型缺失：執行 download_model；不要手動改成其他模型。
- `npm ci` 失敗：保留錯誤，核對 package.json 與 lockfile；不要借用其他案件的 node_modules。
- 搬移後命令失效：重設 PROJECT_ROOT；不要搬移既有 venv，刪除該包內舊 venv 後重新安裝。
- 視覺不同：記錄 macOS 與字型版本，重新確認 HTML 和影片，而不是只看編譯成功。

## 使用既有 Chrome

若已安裝 Chrome，也可明確指定瀏覽器的絕對執行檔路徑：

```bash
export BROWSER_EXECUTABLE="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
bash "$PROJECT_ROOT/tools/setup-macos.sh"
```

安裝腳本會跳過 Chromium 下載；prepare-motion 會使用指定瀏覽器。之後每次執行需保留此環境變數。這條路徑只是一個常見的範例，腳本本身沒有寫死它。使用非 Playwright 配套版本時，需重新確認畫面並記錄實際瀏覽器版本。

## SoX 依賴的範圍

`qwen-tts` 會安裝 Python 的 `sox` 包裝套件，不會因此安裝系統的 SoX 執行檔。目前 setup 與 doctor 仍將系統 SoX 列為必要條件；這描述的是現行腳本行為。已查到直接使用 SoX 的程式在 Qwen 的 25Hz tokenizer，尚未驗證本包 12Hz 流程是否必須依賴系統 SoX，不能僅因匯入警告就判定它必須安裝。此文件翻譯未變更安裝腳本。
