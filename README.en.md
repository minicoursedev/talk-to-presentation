[繁體中文](README.md) | [简体中文](README.zh-CN.md) | [English](README.en.md)

# Presentation production handoff (macOS)

Turn a conversation between a person and AI into shared presentation sources, then produce Takahashi-style HTML, illustrated HTML, and a narrated [Canvas Commons](https://github.com/canvas-commons/canvas-commons) MP4. The brand, voice, and case content are replaceable; no particular event or organization is required.

This directory is the handoff project. Move it as a whole without relying on the original workspace, older cases, the original user account, or a pre-existing virtual environment. The bundled skill is in `.agents/skills/presentation-production/`. Open this directory as a project in Codex, or follow the documentation to run the scripts manually.

## Getting started

1. Read [macOS setup](docs/SETUP.en.md) and install the dependencies.
2. Set `PROJECT_ROOT` to this directory's actual **absolute path**. Do not copy somebody else's `/Users/...` path. Commands can run from any working directory.
3. Edit `brand.json`: `name` is your brand name, and `logo` is a path relative to this project, such as `shared/brand/logo.svg`. Put your own logo there. The default `null` displays neutral brand text only; no organization-specific logo is included.
4. Try the neutral minimal example before creating your own case.

```bash
PROJECT_ROOT="/absolute/path/to/public"
node "$PROJECT_ROOT/tools/takahashi-html/build.mjs" sample
node "$PROJECT_ROOT/tools/visual-html/build.mjs" sample
python3 -m http.server 4173 --bind 127.0.0.1 --directory "$PROJECT_ROOT"
```

Open these addresses in a browser:

- `http://127.0.0.1:4173/cases/sample/dist/sample.html`
- `http://127.0.0.1:4173/cases/sample/dist/sample-v.html`

Create a case with `python3 "$PROJECT_ROOT/tools/init_case.py" my-talk --title "My talk"`.
See [workflow](.agents/skills/presentation-production/references/workflow.en.md) for commands, source schemas, and confirmation steps.

## Voice and video

- [Voice production](.agents/skills/presentation-production/references/voice.en.md): Qwen model download, reference voices, per-page main and background narration, selected-page regeneration, subtitles, and timing.
- [Video production](.agents/skills/presentation-production/references/video.en.md): silent Canvas Commons previews, production audio, rendering, and muxing.
- [Acceptance](.agents/skills/presentation-production/references/acceptance.en.md): technical, visual, and listening checks from HTML through the final video.
- [Verification record](docs/VERIFICATION.en.md): what was and was not actually verified.

Reference voice WAV files are **excluded from the handoff**. The [voice catalog README](shared/voice/reference-voice/README.en.md) defines a replaceable contract for tone identifiers, filenames, and transcripts. Users must supply the required WAV files before generating narration. `voice.py check` lists missing files individually and does not substitute a different voice.

The package contains two neutral example pages and a programmatically drawn SVG. It excludes old cases, the original brand logo, human voice WAVs, model weights, node_modules, and virtual environments. Models are downloaded at a fixed revision; dependencies are installed from lockfiles. Fonts use the macOS system fonts: record the macOS version during acceptance. Pixel-identical typography across macOS versions is not guaranteed.

The video template captures each illustrated HTML page as an image, then presents and renders those images in a real Canvas Commons scene to preserve the minimal example's composition. Its default behavior is direct page cuts, not object-level animation. For object animation, edit the case's `motion/src/scenes/Slides.tsx` and use native Canvas Commons nodes and animation according to the approved design. The tools do not overwrite existing scenes.

## Handoff boundaries

The first release targets macOS only; there are no Linux, Windows, or CUDA setup instructions. Downloads need an internet connection. After installing dependencies and downloading the model, rebuilding existing assets and running Qwen do not depend on the original workspace. AI image-generation tools are not part of the installation package. Existing user-supplied images can be reused; generating new images requires the recipient's own available tool.

A completed handoff package does not mean a case's content is approved or its narrated MP4 has passed acceptance. The example contains no human voice. A silent preview checks visuals and tooling; it is not a narrated deliverable.

## Repackaging

```bash
python3 "$PROJECT_ROOT/tools/package.py" "$PROJECT_ROOT/presentation-handoff.zip"
```

The archive includes reusable tools, the skill, documentation, and sample sources. It excludes other cases, voices, models, environments, and generated output. The ZIP includes `MANIFEST.sha256`; run `shasum -a 256 -c MANIFEST.sha256` from the extracted public directory to verify the source files.

## Documentation languages

Existing `.md` paths contain Traditional Chinese. Sibling `.zh-CN.md` and `.en.md` files contain Simplified Chinese and English. Each document has language links at the top, and internal explanatory links stay in the selected language. Translating documentation does not rewrite example slides, tone identifiers, filenames, or recording transcripts, and does not imply a localized CLI or third-party editor UI.

Maintain all document languages together. After changes, run this check for translation coverage, links, and the voice-data contract:

```bash
python3 "$PROJECT_ROOT/tools/check_docs.py"
```
