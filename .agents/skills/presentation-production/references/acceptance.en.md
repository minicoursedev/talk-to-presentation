[繁體中文](acceptance.md) | [简体中文](acceptance.zh-CN.md) | [English](acceptance.en.md)

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
