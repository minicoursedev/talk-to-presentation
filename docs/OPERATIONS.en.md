[繁體中文](OPERATIONS.md) | [简体中文](OPERATIONS.zh-CN.md) | [English](OPERATIONS.en.md)

# Project operations and rebuild contract

`talk-to-presentation` is a reusable presentation production project. README covers purpose and onboarding, the production skill guides AI execution, and this document defines the unified command interface and status meanings. Case topics, stories, authorization and acceptance decisions remain in `content/draft.md`; generated status does not replace those decisions.

## Unified entry point

`PROJECT_ROOT` is this project's actual absolute path. Cases resolve from the external `PRESENTATION_DATA_ROOT`. These commands work from any directory:

```bash
node "$PROJECT_ROOT/tools/presentation.mjs" validate my-talk
node "$PROJECT_ROOT/tools/presentation.mjs" check-layout my-talk
node "$PROJECT_ROOT/tools/presentation.mjs" status my-talk --json
node "$PROJECT_ROOT/tools/presentation.mjs" plan my-talk --target video
node "$PROJECT_ROOT/tools/presentation.mjs" rebuild my-talk --target video
node "$PROJECT_ROOT/tools/presentation.mjs" check
```

- `validate`: check source structure, paths, brand settings and image references. Missing speech does not prevent content work; existing images do not establish visual acceptance.
- `status`: read-only aggregation of build receipts, input/output hashes, and missing or mismatched narration WAVs.
- `plan`: read-only list of stages to rebuild or reuse for the requested target, with blockers.
- `rebuild`: run necessary stages in order, reuse current results and stop on failure. Uses existing WAVs and images; never invokes TTS or image generation.
- `check`: run Node tests, trilingual document checks and the isolated smoke test. Does not install dependencies, render video or establish human acceptance. Also available as `npm test` from the project directory.

| target | Scope |
| --- | --- |
| `review` | Script review |
| `text` | Script review and Takahashi HTML; no images or speech required |
| `html` | Script review, Takahashi and illustrated HTML |
| `timeline` | Timing, combined audio and captions from existing WAVs |
| `preview` | Script review, illustrated HTML, capture, Canvas Commons build/silent export and technical verification |
| `video` | Script review, illustrated HTML, timeline, capture, Canvas Commons build/narrated export, subtitle mux and technical verification |

Python uses the project's `.venv/bin/python` when present, otherwise `python3`; override with `PRESENTATION_PYTHON`. Browser selection retains `BROWSER_EXECUTABLE`. See [SETUP](SETUP.en.md).

## HTML layout measurement

After creating or editing illustrated HTML, run this independent check before video capture:

```bash
node "$PROJECT_ROOT/tools/presentation.mjs" check-layout my-talk
node "$PROJECT_ROOT/tools/presentation.mjs" check-layout my-talk --json
```

The tool waits up to 1.5 seconds for finite page transitions; animations still running are marked as limitations. The tool uses Playwright / `BROWSER_EXECUTABLE` to open existing illustrated HTML over local HTTP at the case dimensions, wait for fonts and images, and measure each page using its slider. It requires `.slide`, exactly one `.slide.active`, and `#progress` or `#progressBar`; the frame is `.short-frame` or the active slide. Page-count or frame-size mismatches, missing images and loading failures are errors. It does not edit HTML, cases or video, take screenshots or call AI. Output goes to stdout; `--json` includes every page, the HTML SHA-256, browser version and check time. This remains an independent step, not an automatic `rebuild` stage or build receipt change.

1. `outside-frame`: text/image bounds exceed the frame; `clipped-content`: a rectangular container clips text/image bounds. Measurements allow 2px tolerance.
2. `possible-overlap`: recognized text blocks, images, branding or counters intersect. These are warnings, not proof of occlusion or design intent. Text collisions require both element boxes and text rectangles to intersect, reducing false positives from font metrics; glyph pixels and ink collisions outside element boxes are not checked. Ancestor/descendant pairs, full-slide illustrations and `.art` are excluded from collision checks.
3. Custom HTML may mark a content block with `data-layout-role="content"`. The `background`, `decoration` and `ignore` roles exclude the element and descendants from measurement. `data-layout-allow-overlap` excludes only collisions for that block; overflow and clipping are still checked. Annotations must reflect design intent, not hide defects.
4. Baked-in text, image interiors, Canvas/SVG/iframe interiors, complex masks, rotated/3D bounds and running animations are reported as coverage limitations. Intentionally hidden text is excluded from visible-content checks; pages with no visible DOM text are explicitly reported. CSS backgrounds, pseudo-elements and arbitrary custom visual components are outside complete coverage.
5. Exit `0` means no geometry errors were found, but warnings and limitations may remain; `2` means overflow/clipping was found; `1` means execution or input failure. Default output lists at most 20 findings; use `--json` for all details. Rerun after source edits. Reports do not confirm agreement with source text or establish visual/video acceptance.

Use the report to fix geometry first, then inspect every page according to [acceptance](../.agents/skills/presentation-production/references/acceptance.en.md). Pages using `textInImage` still need review of text inside images. Screenshots required for video production remain unchanged.

## Source contract

[contract.mjs](../tools/contract.mjs) is the shared executable validator. Node production tools call it directly; Python's `common.load` calls the same Node validator, so Python production commands also require Node. No third-party dependency was added.

Validation covers unique positive page IDs, dimensions and fps, nonnegative frame/gap settings, screen text and rich-text parts, narration/tone types, exact segment concatenation, and output/image paths. Errors identify fields such as `slides[0].page`. Unknown fields remain available for custom animation and case records. Field presence is not content approval. Field purposes are documented in the [workflow](../.agents/skills/presentation-production/references/workflow.en.md).

## Changes and rebuilds

- Screen text/images: rebuild affected review or HTML and downstream video; retain timing and narration WAVs.
- Brand/dimensions: rebuild HTML and video; dimensions alone do not regenerate speech or timing.
- Narration/tone/segments: handle affected WAVs within existing authorization first; mismatched provenance stops rebuilding and identifies the affected inputs.
- WAVs/page order/fps/gaps: rebuild timing and video without automatically invoking TTS.
- Custom scenes: rebuild video, preserving the case's `motion/src/`.

The `narrationSource`, `source`, and audio SHA fields in `timeline.json` remain production records. prepare-motion reads the timeline directly without comparing these SHA values or blocking production on differences.

After successful stages the unified entry writes receipts under the case's `verification/build/`, recording tool/input fingerprints and output SHA-256 hashes. These are derived evidence, not another source. Existing individual commands remain supported but do not write these receipts; directly edited or rebuilt outputs must be reevaluated instead of treating file existence as freshness.


Canvas Commons `.meta` files use a fingerprint of canonical JSON content (prefixed `json:`), ignoring whitespace-only saves while still invalidating changed settings. WAVs are tracked only for existence; SHA comparisons do not invalidate their build state or block production. After replacing or postprocessing WAVs, run `voice.py timeline` directly to update timing, combined audio, and subtitles. Other files use raw-byte SHA-256 hashes.

| Status | Meaning |
| --- | --- |
| `current` | Tracked inputs, tools, outputs and upstream receipts match |
| `stale` | Inputs, tools, outputs or upstream state changed |
| `missing` | Output is missing |
| `untracked` | Output exists without a receipt; correspondence to current sources is unknown |
| `unavailable` | This output is not configured |
| `external` | Explicitly use separately maintained case HTML; its source synchronization needs case review |

`current` describes tracked file consistency, not script approval or visual/listening acceptance. Custom scenes consuming untracked external resources still need case-specific checks. Legacy WAVs without generation provenance may be reused, but their text correspondence and listening quality still require review.

## Protect existing HTML

Imported HTML, existing HTML without a receipt, and HTML edited after generation are not automatically overwritten. Inspect the case's original production method before selecting:

```bash
# Continue video production using separately maintained, reviewed visual HTML.
node "$PROJECT_ROOT/tools/presentation.mjs" rebuild my-talk --target video --use-existing-html
# Explicitly regenerate HTML with the built-in builders, overwriting its layout.
node "$PROJECT_ROOT/tools/presentation.mjs" rebuild my-talk --target html --replace-html
```

These options are mutually exclusive. `--use-existing-html` does not establish synchronization with `slides.json`, content approval or human acceptance. Existing authorization persists; the options express tool behavior rather than adding repeated approval gates.

See [acceptance](../.agents/skills/presentation-production/references/acceptance.en.md) and [reproducibility](REPRODUCIBILITY.en.md).

## Frame uploads

`render-video.mjs` wraps Canvas Commons FFmpeg frame request bodies in Blob by default to reduce browser overhead when uploading pixel arrays. The adapter runs only in the browser page launched by this tool and leaves the installed package intact. FFmpeg still encodes MP4 output. Existing `presentation.mjs` and render-script calls use this default automatically. Recheck the frame upload interface after package upgrades; the tool reports an error if no frames use the adapter.

When invoking the tool directly, use `--frame-upload array` to restore the original transport, or `--frame-upload blob` to explicitly select the default. Use `--output-name <name>` for a separate comparison output. The previously added `--gpu` option enables Vulkan browser flags independently of Blob transport and should not be used for macOS tests. These are options of this tool.
