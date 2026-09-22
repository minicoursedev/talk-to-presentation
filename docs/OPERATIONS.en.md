[繁體中文](OPERATIONS.md) | [简体中文](OPERATIONS.zh-CN.md) | [English](OPERATIONS.en.md)

# Project operations and rebuild contract

`talk-to-presentation` is a reusable presentation production project. README covers purpose and onboarding, the production skill guides AI execution, and this document defines the unified command interface and status meanings. Case topics, stories, authorization and acceptance decisions remain in `content/draft.md`; generated status does not replace those decisions.

## Unified entry point

`PROJECT_ROOT` is this project's actual absolute path. Cases resolve from the external `PRESENTATION_DATA_ROOT`. These commands work from any directory:

```bash
node "$PROJECT_ROOT/tools/presentation.mjs" validate my-talk
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

## Source contract

[contract.mjs](../tools/contract.mjs) is the shared executable validator. Node production tools call it directly; Python's `common.load` calls the same Node validator, so Python production commands also require Node. No third-party dependency was added.

Validation covers unique positive page IDs, dimensions and fps, nonnegative frame/gap settings, screen text and rich-text parts, narration/tone types, exact segment concatenation, and output/image paths. Errors identify fields such as `slides[0].page`. Unknown fields remain available for custom animation and case records. Field presence is not content approval. Field purposes are documented in the [workflow](../.agents/skills/presentation-production/references/workflow.en.md).

## Changes and rebuilds

- Screen text/images: rebuild affected review or HTML and downstream video; retain timing and narration WAVs.
- Brand/dimensions: rebuild HTML and video; dimensions alone do not regenerate speech or timing.
- Narration/tone/segments: handle affected WAVs within existing authorization first; mismatched provenance stops rebuilding and identifies the affected inputs.
- WAVs/page order/fps/gaps: rebuild timing and video without automatically invoking TTS.
- Custom scenes: rebuild video, preserving the case's `motion/src/`.

New `timeline.json.narrationSource` tracks only inputs affecting narration and timing. Legacy timelines still use their original full-source hash. If old sources change, running `voice.py timeline` once with existing WAVs upgrades that timeline without moving data or regenerating speech.

After successful stages the unified entry writes receipts under the case's `verification/build/`, recording tool/input fingerprints and output SHA-256 hashes. These are derived evidence, not another source. Existing individual commands remain supported but do not write these receipts; directly edited or rebuilt outputs must be reevaluated instead of treating file existence as freshness.


Canvas Commons `.meta` files use a fingerprint of canonical JSON content (prefixed `json:`), ignoring whitespace-only saves while still invalidating changed settings. All other files use raw-byte SHA-256 hashes.

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
