[繁體中文](video.md) | [简体中文](video.zh-CN.md) | [English](video.en.md)

[Data storage rules](../../../../docs/DATA_LAYOUT.en.md)：All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root. The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

# Canvas Commons output

Commands use an absolute `PROJECT_ROOT`. Replace `my-talk` with the case ID.

## Preparation and preview

Illustrated HTML is the composition reference. Rebuild it first, then capture the canvas as the page images used by the video. Do not edit these images as if they were content sources.

Without reference WAVs, run a **silent technical preview**:

```bash
node "$PROJECT_ROOT/tools/visual-html/build.mjs" sample
node "$PROJECT_ROOT/tools/prepare-motion.mjs" sample --preview
node "$PROJECT_ROOT/tools/motion.mjs" build sample
node "$PROJECT_ROOT/tools/motion.mjs" start sample --port 9002
```

Preview duration comes from each page's `previewSeconds` (default: 3 seconds), not production narration timing. For production video, build timing from confirmed WAVs:

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" timeline my-talk
node "$PROJECT_ROOT/tools/visual-html/build.mjs" my-talk
node "$PROJECT_ROOT/tools/prepare-motion.mjs" my-talk
node "$PROJECT_ROOT/tools/motion.mjs" build my-talk
node "$PROJECT_ROOT/tools/motion.mjs" start my-talk --port 9002
```

Open `http://127.0.0.1:9002/` in a browser. Choose another free port if needed. This local preview is not a public deployment.

prepare-motion starts its own temporary HTTP server and Chromium instance and closes them when done. It updates only generated screenshots, prepared.json, the project audio (`motion/timeline.wav`, readable by both Vite and the FFmpeg exporter), and rendering settings. It does not overwrite custom scenes. HTML dimensions and screenshot pixels follow case.format.

## Animation and composition

The default template is a real Canvas Commons scene with direct cuts between page images. It does not provide object-level animation. When requested, edit the case's scene using native Layout/Txt/Img nodes and tweening. Do not describe whole-page images as layered object animation.

- Content and branding must be visible on the first frame. Do not initialize with a fully transparent fade-in or an empty wait.
- Keep the outgoing page visible until the next page takes over; do not fade everything out and leave a gap.
- Accumulating animations preserve the preceding page's state rather than replaying existing objects.
- Preserve the HTML's image placement, crop, text positions, masks, and spacing. Do not automatically add panels, zooms, or other effects.
- Native multiline text needs an explicit vertical Layout or appropriate line handling. Numeric lineHeight values are pixels; use percentage strings for proportions.
- Custom scenes must preserve prepared page frame counts and total duration. Do not trim audio or delete frames to hide visual problems.

## Rendering

`build` only performs TypeScript/Vite compilation. Render production MP4 files in the Canvas Commons editor:

1. Select `Video (FFmpeg)` as the exporter.
2. Keep the range set by prepare-motion: 0 through total frames / fps seconds. The new exporter limits MP4 duration to this difference; do not subtract one frame. Follow case.format for dimensions and fps, with scale 1 and audio offset 0.
3. Enable Include audio and Fast start for production video. Silent previews have no audio and must be delivered only as previews.
4. Press RENDER and wait for completion. Output is under `cases/my-talk/motion/output/`; use the actual filename.

prepare-motion writes project.meta to match case.format, but still check the settings in the UI. After source changes, prepare/build/render again; do not reuse an old MP4.

Mux the newly exported video with confirmed subtitles:

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/finish_video.py" my-talk "$PRESENTATION_DATA_ROOT/cases/my-talk/motion/output/presentation.mp4"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/verify_video.py" my-talk
```

finish_video requires an audio stream; it will not turn a silent example into a purported narrated MP4.
To verify only the silent technical example:

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/verify_video.py" sample --preview --file "$PRESENTATION_DATA_ROOT/cases/sample/motion/output/presentation.mp4"
```

verify_video checks H.264, dimensions, fps, required audio/subtitle streams, duration, and complete decoding, and writes the result to the case's verification/media.json. It does not replace watching or listening.

## Repeatable command-line export

After timeline, HTML, preparation, and build, run:

```bash
node "$PROJECT_ROOT/tools/render-video.mjs" my-talk
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/finish_video.py" my-talk "$PRESENTATION_DATA_ROOT/cases/my-talk/motion/output/presentation.mp4"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/verify_video.py" my-talk
```

`render-video.mjs` starts a temporary Vite server bound to `127.0.0.1` and uses Playwright to call the Canvas Commons `Renderer` with the `Video (FFmpeg)` exporter. It uses the dimensions, fps, range, and audio settings written by prepare. This is the editor's renderer and executes the case's scene. Failures return a nonzero status; the server and browser close on completion. `BROWSER_EXECUTABLE` is supported. Output is always `motion/output/presentation.mp4`; reruns replace this generated file.

For silent testing, run `prepare-motion.mjs sample --preview`, then `render-video.mjs sample --preview`, producing `motion/output/preview.mp4`. Check it with `verify_video.py sample --preview --file <absolute-file-path>`. Do not pass silent output to finish_video, which requires narration. Rendering neither invokes TTS nor replaces visual/listening acceptance.

For existing illustrated HTML, prepare supports a one-based `#progress` or `#progressBar` slider and a `.short-frame` or `.slide.active` frame. The slider's input event must select the corresponding slide, with order matching `slides.json`. Arbitrary HTML is not automatically importable.
