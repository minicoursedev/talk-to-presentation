[繁體中文](video.md) | [简体中文](video.zh-CN.md) | [English](video.en.md)

[Data storage rules](../../../../docs/DATA_LAYOUT.en.md): All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root. The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

# Canvas Commons output

Set absolute `PROJECT_ROOT` for the capability and external `PRESENTATION_DATA_ROOT`. Replace `my-talk` with the case ID. Run narrated and silent workflows separately.

## Prepare narrated video sources

Illustrated HTML is the composition reference. Rebuild timing from final WAVs, then capture page frames from HTML. Any `slides.json` or `case.json` change, including image references alone, requires rerunning timeline to refresh source hashes. This does not regenerate speech.

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" timeline my-talk
node "$PROJECT_ROOT/tools/visual-html/build.mjs" my-talk
node "$PROJECT_ROOT/tools/prepare-motion.mjs" my-talk
node "$PROJECT_ROOT/tools/motion.mjs" build my-talk
```

Prepare uses a temporary local HTTP server and Chromium, closing both afterward. It updates screenshots, `prepared.json`, `motion/timeline.wav`, and `project.meta` settings matching case.format without overwriting the case's scene. `build` performs TypeScript/Vite compilation only; it does not produce the final MP4.

## Command-line export and checks

```bash
node "$PROJECT_ROOT/tools/render-video.mjs" my-talk
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/finish_video.py" my-talk "$PRESENTATION_DATA_ROOT/cases/my-talk/motion/output/presentation.mp4"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/verify_video.py" my-talk
```

`render-video.mjs` starts a temporary Vite server bound to `127.0.0.1` and uses Playwright to call the Canvas Commons `Renderer` and `Video (FFmpeg)` exporter. It executes the case scene using prepared dimensions, fps, range, and audio settings. `BROWSER_EXECUTABLE` is supported. The server and browser close afterward; failures return a nonzero status.

This command writes `motion/output/presentation.mp4`, replacing that generated file on reruns. finish_video muxes captions into the deliverable at `case.json.outputs.video`. verify_video checks H.264, dimensions, fps, frame count, audio, mov_text captions, duration, and full decoding, recording results in `verification/media.json`. It does not replace viewing or listening.

## Optional editor export

To preview or operate the editor, prepare sources first, then run:

```bash
node "$PROJECT_ROOT/tools/motion.mjs" start my-talk --port 9002
```

Open `http://127.0.0.1:9002/`. This local server stays running; stop it with Ctrl+C when finished. Use another terminal for other commands. Choose a free port if occupied.

1. Select `Video (FFmpeg)` as the exporter.
2. Use case.format dimensions and fps, scale 1, audio offset 0, and a range from 0 to total frames/fps seconds without subtracting a frame.
3. Enable Include audio and Fast start for narrated output. Disable audio for silent previews.
4. Click RENDER and wait. Output is under the case's `motion/output/`. Pass the editor's actual filename to finish_video; use preview verification alone for silent video.

The editor and command-line workflow use the same renderer. After source changes, repeat affected preparation, build, and export steps instead of reusing an old MP4.

## Silent technical preview

Create sample in user data according to [workflow](workflow.en.md); do not initialize an existing case again. Silent previews need no model or reference WAVs. Page duration comes from `previewSeconds`, defaulting to three seconds.

```bash
node "$PROJECT_ROOT/tools/visual-html/build.mjs" sample
node "$PROJECT_ROOT/tools/prepare-motion.mjs" sample --preview
node "$PROJECT_ROOT/tools/motion.mjs" build sample
node "$PROJECT_ROOT/tools/render-video.mjs" sample --preview
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/verify_video.py" sample --preview --file "$PRESENTATION_DATA_ROOT/cases/sample/motion/output/preview.mp4"
```

Command-line silent output is `motion/output/preview.mp4`, distinct from the narrated filename. Do not pass it to finish_video, which requires audio, or describe it as narrated delivery. Prepare and render must use the same mode when switching between narrated and silent output.

## Animation and composition

The default scene switches between page images, preserving illustrated-HTML composition. It contains no layered object animation. For requested animation, edit the case scene with native Layout/Txt/Img nodes and tween while preserving prepared page frame counts and total duration.

- Show content and branding on the first frame. Keep the previous page visible until the next takes over, avoiding blank boundaries.
- Cumulative animation retains existing objects instead of replaying completed parts.
- Preserve confirmed cropping, text, masks, and whitespace. Do not add panels, scaling, or effects without direction.
- Use vertical Layout or explicit line breaks for native text. Numeric lineHeight values are pixels; use percentage strings for ratios.
- Follow [acceptance](acceptance.en.md) for every page, transition, and audio review. Do not hide issues by dropping frames or trimming speech.

## Reuse existing HTML

Prepare supports one-based `#progress`/`#progressBar` sliders and `.short-frame`/`.slide.active` frames. The slider's input event must select the matching page in `slides.json` order. Arbitrary HTML is not automatically importable. Check that the actual frame dimensions match case.format before capture, then review final composition through [acceptance](acceptance.en.md).
