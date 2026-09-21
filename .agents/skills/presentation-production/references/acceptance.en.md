[繁體中文](acceptance.md) | [简体中文](acceptance.zh-CN.md) | [English](acceptance.en.md)

[Data storage rules](../../../../docs/DATA_LAYOUT.en.md)：All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root. The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

# Acceptance

Keep technical testing separate from human content approval. Record sources, output SHA-256, and actual inspection time for each check; do not carry an older version's acceptance forward.

## HTML

- Both HTML versions match slides.json in page order and text; keyboard and page-slider navigation work.
- Inspect every page over local HTTP for line breaks, overflow, image crops, branding, and page numbers.
- When the brand name or logo changes, all three outputs use brand.json. The user supplies the production logo.

## Voice, timing, and video

- Missing reference WAVs stop TTS and produce a list of missing inputs; do not substitute another human voice.
- Main/background files remain separate. WAV SHA-256 values outside the selected regeneration pages remain unchanged.
- Listen to every regenerated page for text, tone, internal pauses, and endings. RMS, non-silence, and successful decoding do not prove listening acceptance.
- Rebuild timing and subtitles from the final WAVs and align them to frame boundaries. Subtitles include the confirmed main and background narration.
- Canvas Commons build, FFmpeg exporter render, subtitle muxing, ffprobe, and full decoding all pass, with matching dimensions, fps, and duration.
- Inspect frame 0, the frame before/at/after every page boundary, the last page, and changed pages in the final MP4. Play complete transitions; a screenshot after settling is insufficient.
- Compare coverage, crop, text, masks, and branding with illustrated HTML. Custom animation must not silently change composition.
- Listen to the opening, middle, ending, and changed pages. Subtitles are not evidence that audio is correct.

## The handoff package

- Run tools from another directory containing spaces and Chinese characters, with an unrelated current working directory. They must not refer to the original project, another case's node_modules, or the original venv.
- npm ci and the Python lockfile can recreate dependencies; the model download command uses a fixed revision.
- The voice catalog README exists and reference WAVs do not. There is no original brand logo, old case, or original user's absolute path.
- The neutral example can build both HTML versions and a silent Canvas Commons project. Without voice inputs, do not claim full Qwen/narrated MP4 acceptance.
- List actual passing commands, unverified items, and required recipient inputs at delivery.

## Per-page delivery checks

- Run `node "$PROJECT_ROOT/tools/check-visuals.mjs" my-talk`; use the case setting or `--require-images` for full coverage. Passing proves reference completeness, not relevance.
- Compare the original source, `slides.json`, and rendered output separately. Subtitles, speaker labels, and emphasis in `parts` are content too. Text remaining in JSON does not prove that it is visible to the user.
- Check visibility separately in Takahashi HTML, illustrated HTML, and video, including dark/light backgrounds, illustrated pages, secondary text, and text space. Actually revisit user-reported pages; shared CSS changes also require checking every affected layout type.
- Before output, check every image's relationship to the argument and example, text preservation, and agreed coverage. Opening/ending spot checks and H.264/decoding checks cannot replace per-page visual review.
- Report completed/required counts, rebuilt outputs, and unverified stages. State the shortfall, reason, and next action directly when requirements are unmet.
