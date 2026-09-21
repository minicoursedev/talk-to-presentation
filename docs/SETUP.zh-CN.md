[繁體中文](SETUP.md) | [简体中文](SETUP.zh-CN.md) | [English](SETUP.en.md)

[数据存放规则](DATA_LAYOUT.zh-CN.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路径均相对于用户数据根目录；`tools/`、`templates/` 与内置 `shared/styles/default/` 相对于能力根目录。 能力仓库只保存工具、skill、内置模板与中性示例。一般制作不得修改内置风格、示例或参考网站。用户录音、逐字稿、品牌、自定义风格、案例与输出都放在仓库外。

# macOS 从零创建环境

## 系统工具

本版以 macOS Apple Silicon、Python 3.12、Node 22 LTS 为安装目标。macOS Intel 未实机验证，且近期 PyTorch 的 macOS wheels 可能不支援 Intel；不可把 Apple Silicon 的 lockfile 当成已验证 Intel 环境。若接手者使用 Intel，需另行解决并验证相容依赖，不得静默替换模型。

先安装 Apple Command Line Tools（若尚未安装）：

```bash
xcode-select --install
```

用户自行安装 [Homebrew](https://brew.sh/) 后：

```bash
brew install node@22 python@3.12 ffmpeg sox
export PATH="$(brew --prefix node@22)/bin:$(brew --prefix python@3.12)/bin:$PATH"
node --version
python3.12 --version
ffmpeg -version
sox --version
```

不写死 `/opt/homebrew`，以 `brew --prefix` 找到实际位置。FFmpeg 与 macOS 字体版本未由 npm/pip 锁定，验收记录必须保留版本。此包不安装或改动系统字体。

## 安装交接 project

把交接目录放在任意可写位置，定义其绝对路径（下例需替换）：

```bash
PROJECT_ROOT="/absolute/path/to/public"
bash "$PROJECT_ROOT/tools/setup-macos.sh"
```

脚本会在包内创建 `.venv`，执行 `npm ci`、安装 Playwright Chromium，再从 `requirements-macos.lock.txt` 安装 Python 软件包。不会安装 Qwen 权重，也不会生成语音。
Playwright 将浏览器下载至用户标准快取；这是可由安装命令重建的依赖，不沿用原作者私有路径。

如果分步安装，npm 的 `--prefix` 使用绝对 project 路径：

```bash
npm --prefix "$PROJECT_ROOT" ci
"$PROJECT_ROOT/node_modules/.bin/playwright" install chromium
python3.12 -m venv "$PROJECT_ROOT/.venv"
"$PROJECT_ROOT/.venv/bin/python" -m pip install -r "$PROJECT_ROOT/requirements-macos.lock.txt"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/doctor.py"
```

首次下载模型（只在要生成新语音时必要）：

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/download_model.py"
```

`model.json` 固定 Hugging Face repo 与 revision，下载到用户数据根目录的 `models/qwen3-tts`。网路失败可重跑下载命令；不能把不完整下载当成可用模型。模型文件及第三方依赖遵守各自授权，本包不重新授权它们。
生成脚本只读该目录，不到上层 `.hf-cache` 或原用户环境找文件。CPU 推论需要足够 RAM 与磁碟空间；实际需求依执行长度与依赖而定，执行前确认可用资源。

## 版本维护

Node dependencies 固定在 `package-lock.json`；Canvas Commons core、2d、editor、Vite plugin 与 FFmpeg exporter 均固定为 0.3.1。套件要求 Node >= 20.19.0；本包安装目标仍为 Node 22 LTS。不要用 `npm audit fix --force` 直接改到不相容 major。开发伺服器只绑 `127.0.0.1`。

Python 直接依赖在 `requirements.in`；完整依赖解析保存在 `requirements-macos.lock.txt`，针对 Python 3.12 / Apple Silicon。只有刻意升级时才用 uv 重新解析：

```bash
uv pip compile "$PROJECT_ROOT/requirements.in" --python-version 3.12 --python-platform aarch64-apple-darwin --no-header -o "$PROJECT_ROOT/requirements-macos.lock.txt"
```

升级后需重新跑安装、输入验证、时间轴、Canvas Commons build/render 与视听验收。

## 常见问题

- `ModuleNotFoundError`：确认使用 `$PROJECT_ROOT/.venv/bin/python`，不要使用其他项目的 venv。
- Chromium 缺失：执行上面的 Playwright install。
- Missing reference WAV：依语气 README 自行提供，并让逐字稿符合实际声音。
- 模型缺失：执行 download_model；不要手动改成其他模型。
- `npm ci` 失败：保留错误，核对 package.json 与 lockfile；不要借用其他案件的 node_modules。
- 搬移后命令失效：重设 PROJECT_ROOT；不要搬移既有 venv，删除该包内旧 venv 后重新安装。
- 视觉不同：记录 macOS 与字体版本，重新确认 HTML 和视频，而不是只看编译成功。

## 使用既有 Chrome

若已安装 Chrome，也可明确指定浏览器的绝对可执行文件路径：

```bash
export BROWSER_EXECUTABLE="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
bash "$PROJECT_ROOT/tools/setup-macos.sh"
```

安装脚本会跳过 Chromium 下载；prepare-motion 会使用指定浏览器。之后每次执行需保留此环境变数。这条路径只是一个常见的示例，脚本本身没有写死它。使用非 Playwright 配套版本时，需重新确认画面并记录实际浏览器版本。

## SoX 依赖的范围

`qwen-tts` 会安装 Python 的 `sox` 包装软件包，不会因此安装系统的 SoX 可执行文件。目前 setup 与 doctor 仍将系统 SoX 列为必要条件；这描述的是现行脚本行为。已查到直接使用 SoX 的程序在 Qwen 的 25Hz tokenizer，尚未验证本包 12Hz 流程是否必须依赖系统 SoX，不能仅因导入警告就判定它必须安装。此文件翻译未变更安装脚本。
