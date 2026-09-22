[繁體中文](REPRODUCIBILITY.md) | [简体中文](REPRODUCIBILITY.zh-CN.md) | [English](REPRODUCIBILITY.en.md)

# Verify reproducibility and reuse

Separate source checks, clean dependency installation, actual speech/video export, and human visual/listening acceptance. Record this version, commands, tool versions, and results. Historical videos do not validate a new version.

Choose checks for the changed layer: documentation edits need translation, link, and command review; case-template edits also need a newly initialized case; tools need relevant regression checks; dependency or full production-flow changes need the independent installation and end-to-end steps below. Preserve dates and versions of historical results. Documentation updates do not imply a new speech-generation or render run.

## Fast regression checks

```bash
node --test "$PROJECT_ROOT"/tools/*.test.mjs
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/check_docs.py"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/smoke_test.py"
```

The smoke test extracts sources into a temporary directory containing spaces and Chinese characters, uses a separate data root, and invokes tools from an unrelated cwd. It checks both HTML builders, semantic and legacy palettes, script review, segmented audio/captions/gaps, unchanged source WAVs, stale-tone rejection, and path boundaries. It does not run Qwen, install dependencies, or render video.

## Independent installation

Choose a new `REBUILD_ROOT` outside the original capability repository and production cases. First [check existing system tools](SETUP.en.md), retaining compatible Node, Python, FFmpeg, and SoX installations. These commands create independent node_modules and venv directories without links to the original environment.

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

Set your own brand.json in this test data root; see [workflow](../.agents/skills/presentation-production/references/workflow.en.md) for palette fields. To cover segmented speech, edit the test case's slides.json so the first page has narrationSegments. Their concatenated text must equal the complete narration.

## Actual speech through MP4

Supply the test case's required reference WAVs and exact transcripts in this independent data root's `shared/voice/reference-voice/`, following the [voice contract](../.agents/skills/presentation-production/references/voice.en.md). Use download_model.py for the revision pinned in model.json. Alternatively, copy a complete existing models/qwen3-tts directory, including download-source.json, and verify provenance and every file's SHA-256. Record this as reuse of a verified model, not a fresh download test.

The generate command below synthesizes new test speech and requires user authorization. If background narration is present, also run `generate rebuild-proof --kind background`.

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

Inspect the actual first frame, every page boundary, and final frame as specified by [acceptance](../.agents/skills/presentation-production/references/acceptance.en.md). Listen to each segment and compare it with captions. Record installation results, model and voice provenance, frame count, duration, output hash, and what was viewed/heard. Without listening, report technical success only, not accepted narration quality. See [VERIFICATION](VERIFICATION.en.md) for actual results.

## Version delivery

Version source, skill, all three documentation languages, and regression tests together. Keep user data, models, reference recordings, and verification media in the data root. package.py generates a fresh MANIFEST.sha256 for every ZIP. If maintaining the repository's root manifest, synchronize it from this ZIP's public/MANIFEST.sha256 instead of keeping a stale inventory.

State the commit and ZIP hash. For others to obtain the update through git clone, complete the requested push and verify the remote commit; a local change or commit alone does not update the remote. Repeat verification after changing hardware, browser, or dependencies. Byte-identical speech or pixel-identical rendering across machines is not guaranteed.
