[繁體中文](SETUP.md) | [简体中文](SETUP.zh-CN.md) | [English](SETUP.en.md)

# Setting up macOS from scratch

## System tools

The installation target is macOS on Apple Silicon, Python 3.12, and Node 22 LTS. Intel Macs have not been tested on hardware, and recent macOS PyTorch wheels may not support Intel. The Apple Silicon lockfile is not evidence of a verified Intel environment. Intel recipients must resolve and verify a compatible dependency set separately; do not silently substitute another model.

Install Apple Command Line Tools if they are not already installed:

```bash
xcode-select --install
```

After installing [Homebrew](https://brew.sh/):

```bash
brew install node@22 python@3.12 ffmpeg sox
export PATH="$(brew --prefix node@22)/bin:$(brew --prefix python@3.12)/bin:$PATH"
node --version
python3.12 --version
ffmpeg -version
sox --version
```

Use `brew --prefix` to discover the actual installation location rather than hard-coding `/opt/homebrew`. FFmpeg and macOS font versions are not locked by npm or pip; record them during acceptance. This package does not install or modify system fonts.

## Installing the handoff project

Place the directory anywhere writable and set its absolute path. Replace the example below:

```bash
PROJECT_ROOT="/absolute/path/to/public"
bash "$PROJECT_ROOT/tools/setup-macos.sh"
```

The script creates `.venv` inside the project, runs `npm ci`, installs Playwright Chromium, and installs Python packages from `requirements-macos.lock.txt`. It does not install Qwen weights or generate speech.
Playwright downloads its browser into the standard user cache. This is a dependency that the documented install command can recreate, not a private path belonging to the original author.

For individual installation steps, pass npm an absolute project path using `--prefix`:

```bash
npm --prefix "$PROJECT_ROOT" ci
"$PROJECT_ROOT/node_modules/.bin/playwright" install chromium
python3.12 -m venv "$PROJECT_ROOT/.venv"
"$PROJECT_ROOT/.venv/bin/python" -m pip install -r "$PROJECT_ROOT/requirements-macos.lock.txt"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/doctor.py"
```

Download the model once, only when new speech generation is needed:

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/download_model.py"
```

`model.json` pins the Hugging Face repository and revision. Files are downloaded into `models/qwen3-tts` inside the project. Retry the download command after a network failure; an incomplete download is not a usable model. Model files and third-party dependencies retain their own licenses; this package does not relicense them.
The generation script reads only that directory. It does not search a parent `.hf-cache` or the original user's environment. CPU inference requires sufficient RAM and disk space; actual requirements depend on the workload and dependencies. Check available resources before running it.

## Maintaining versions

Node dependencies are locked in `package-lock.json`. Canvas Commons core, 2d, editor, Vite plugin, and FFmpeg exporter are pinned to 0.3.1. These packages require Node >= 20.19.0; the installation target remains Node 22 LTS. Do not use `npm audit fix --force` to introduce incompatible major versions. Development servers bind only to `127.0.0.1`.

Direct Python dependencies are in `requirements.in`; the complete resolution is in `requirements-macos.lock.txt`, targeting Python 3.12 on Apple Silicon. Re-resolve with uv only when deliberately upgrading:

```bash
uv pip compile "$PROJECT_ROOT/requirements.in" --python-version 3.12 --python-platform aarch64-apple-darwin --no-header -o "$PROJECT_ROOT/requirements-macos.lock.txt"
```

After an upgrade, repeat installation, input validation, timeline construction, Canvas Commons build/render, and visual/listening acceptance.

## Troubleshooting

- `ModuleNotFoundError`: use `$PROJECT_ROOT/.venv/bin/python`, not another project's environment.
- Missing Chromium: run the Playwright installation command above.
- Missing reference WAV: supply the file described by the voice catalog and ensure its transcript matches the recording.
- Missing model: run download_model; do not manually switch models.
- `npm ci` failure: preserve the error and compare package.json with the lockfile. Do not borrow another case's node_modules.
- Commands fail after moving the project: reset PROJECT_ROOT. Do not move an existing venv; remove the old project-local venv and reinstall it.
- Different appearance: record the macOS and font versions, then recheck HTML and video rather than relying on compilation success.

## Using an existing Chrome installation

If Chrome is installed, you can explicitly specify the browser executable's absolute path:

```bash
export BROWSER_EXECUTABLE="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
bash "$PROJECT_ROOT/tools/setup-macos.sh"
```

The setup script skips the Chromium download, and prepare-motion uses that browser. Keep the environment variable set for subsequent runs. This is a common example path, not a hard-coded script setting. When using a browser version other than the one bundled with Playwright, recheck the visuals and record the actual browser version.

## Scope of the SoX dependency

`qwen-tts` installs the Python `sox` wrapper package, not the system SoX executable. The current setup and doctor scripts still require system SoX; this describes their current behavior. Direct SoX usage was found in Qwen's 25Hz tokenizer. Whether this package's 12Hz workflow actually requires system SoX has not been verified; an import warning alone does not establish that requirement. This documentation update does not change the installation scripts.
