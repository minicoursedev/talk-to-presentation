[繁體中文](VERIFICATION.md) | [简体中文](VERIFICATION.zh-CN.md) | [English](VERIFICATION.en.md)

[Data storage rules](DATA_LAYOUT.en.md)：All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root. The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

# Handoff verification record

## 2026-09-23: Project commands and dependency tracking

- Added one source validator shared by Python and Node production tools. All eight cases visible in the workspace passed read-only source and image-reference checks. Existing cases were not rewritten and no case narration was generated.
- The unified entry provides validate, status, plan, rebuild and check. Seven Node tests passed, covering read-only queries, extension-field preservation, existing HTML protection, narration/tone mismatch rejection, unchanged source WAVs, new/legacy timeline compatibility, changed-WAV rejection and selective rebuild behavior.
- Trilingual documentation checks (19 families / 57 documents), skill format validation and the isolated package smoke test passed. The smoke test uses paths containing spaces/Chinese and an unrelated cwd; no new dependencies were installed.
- A separate temporary directory outside the repository exercised the complete unified video flow from /private/tmp using existing Chrome, Node, Python and Canvas Commons dependencies. Two synthetic audio segments produced a 360×640, 30 fps, 24-frame, 0.800-second H.264/AAC/mov_text MP4, passing ffprobe and full decode.
- Verified initial production, unchanged-output reuse, screen-only edits preserving the timeline WAV hash, silent preview, and switching back to narrated mode. Canvas Commons metadata formatting saves no longer cause false stale results.

Scope: tool behavior and technical output only. No full environment reinstall, Qwen generation or human visual/listening acceptance was performed. Build receipts establish tracked-file consistency; case decisions remain in `content/draft.md`. See [OPERATIONS](OPERATIONS.en.md).

## 2026-09-22: independent installation and actual narrated rebuild

This run used an external directory containing spaces and Chinese characters, invoking packaged tools from /private/tmp. The neutral two-page case used two narrationSegments with different tones on page one and single narration on page two, plus a red/teal brand palette. Production cases and the user's brand were unchanged.

- Full setup-macos.sh passed on the same macOS 26.6.2 Apple Silicon Mac, using existing Node 26.7.0, Python 3.12.14, FFmpeg 9.0.1, SoX, and Chrome 153.0.8010.53. npm ci, including install scripts, and the Python lockfile installation created independent node_modules and .venv directories without links to the original capability environment. Canvas Commons and its exporter remain 0.3.1; the exporter uses FFmpeg 6.1.1.
- A complete existing local model was copied, checking model.json/download-source.json and SHA-256 for 14 model files at revision fd4b254389122332181a7c3db7f27e918eec64e3. This verifies model reuse and offline inference, not a fresh weight download.
- Two user-supplied reference recordings were copied into the test data directory only. A stereo reference was converted to a separate mono PCM16 file without changing the original. voice.py check passed. Qwen in the independent .venv generated three new WAVs using CPU/float32/eager; each has text, tone, revision, and reference-hash provenance.
- Script review, both HTML builders, segmented timeline/three captions, prepare, TypeScript/Vite build, command-line Canvas Commons FFmpeg export, muxing, and full decoding passed.
- Final test video: 1080×1920, 30 fps, 231 frames, 7.700 seconds, H.264/AAC/mov_text. Frames 0, 159/160/161 at the page boundary, and 230 at the end were inspected. Branding and text are visible with no blank boundary.
- Decoding AAC to 24 kHz produced the same 184800 samples as the source, with correlation 0.99832. This checks audio transport, not spoken-text or tone acceptance. Human listening was not performed.
- A separate short case verified silent preview, rejection of mismatched audio mode, and nonzero exit on an intentionally failing scene. Production cases were unchanged; renderer failures are not reported as success.
- Four Node tests, trilingual documentation checks (18 families/54 documents), skill quick_validate, and the isolated smoke test passed. Coverage includes semantic/legacy palettes, segmented tones/gaps/captions, unchanged source WAVs, stale-tone rejection, script review, and data-path boundaries. Smoke testing also reproduced and verified the fix for script review invocation through macOS path aliases.

Final MP4 SHA-256: `03825c3f300e429474e51d24f6f924305dccd26b28f46a84e1f60b2e222ad8a4`. WAVs, models, MP4s, logs, and inspection images remain in external user data, outside the capability repository and source package. See [rebuild verification](REPRODUCIBILITY.en.md) to repeat the workflow.

Scope: clean dependency installation and actual narrated output on the same Mac. This does not test a new physical Mac, Homebrew installation, Intel, other operating systems, other Node versions, or Playwright's bundled Chromium. System tools and Chrome were reused; naturalness still requires human listening.

## Historical verification: 2026-09-21

Date: 2026-09-21. These are technical checks of the handoff tools, not content or narration acceptance for a production presentation.

## Canvas Commons 0.3.1 migration verification

The current handoff uses Canvas Commons 0.3.1 (core, 2d, editor, Vite plugin, and FFmpeg exporter), with Vite 4.5.14, TypeScript 5.2.2, and Playwright 1.58.2. The packages use ESM, so the project sets `type: module` and includes `@types/chroma-js` 3.1.2, required by the upstream type declarations.

This migration was checked on the same Apple Silicon Mac, Node 26.7.0, and installed Chrome. The historical recommendation was Node 22; current setup guidance retains any installed version satisfying >= 20.19.0. The Qwen model, speech generation script, content sources, and both HTML builders are unchanged.

- A full npm installation and the exporter’s FFmpeg 6.1.1/ffprobe binary downloads completed. Relocation checks used `npm ci --ignore-scripts`, followed by both HTML builders, Chrome screenshots, and TypeScript/Vite compilation. The relocated directory did not repeat binary downloads, so that check is not recorded as a full installation-script test.
- npm reported 7 dependency audit findings (2 low, 2 moderate, 3 high). No forced upgrade was applied and no security-review pass is claimed. Development servers bind only to localhost.
- The sample without WAVs also rendered successfully: a silent 180-frame, 6.000-second MP4 with no audio stream; full decoding passed.
- Both HTML builders, TypeScript/Vite builds for the sample and a new case, and the Canvas Commons editor loaded successfully.
- Actual FFmpeg export and subtitle muxing passed: 1080×1920, 30fps, 126 frames, 4.200 seconds, H.264, AAC, and mov_text. Full decoding passed; audio duration is 4.200 seconds.
- Migration required a range correction: the new exporter limits MP4 duration to the end time minus the start time. The old one-frame subtraction truncated a frame; the range now ends at total frames / fps.
- Inspected frames 0, 65, 66, 67, and 125 of the new video: content and branding are visible from the first frame; page 1 remains at frame 65 and page 2 starts at frame 66, with no blank frame. Text and composition match the HTML.
- Three temporary synthetic tones kept main and background segments separate. Decoded audio and the source timeline have a PCM correlation of 0.99999 and both contain 100800 samples at 24kHz. This verifies audio transport, not human narration or tone listening acceptance. Qwen was not invoked.

Test MP4 SHA-256: `ba57fd4a52452bb49b9f62dc8db63b90e18a3b1d270995e3f08b527460e7052e`. Test WAVs and MP4s are excluded from the ZIP.

The pre-migration record below is retained as history. Its Motion Canvas results are not rendering evidence for the new engine.

## Historical verification before migration (Motion Canvas)

### Tested environment

- macOS 26.6.2 (25G83), Apple Silicon arm64.
- Node 26.7.0; a separate Python 3.12.14 virtual environment.
- Motion Canvas 3.17.2, FFmpeg exporter 1.1.1, Vite 4.5.14.
- Playwright 1.58.2 with the installed Google Chrome. The automatic Chromium download finished but extraction stalled. That installer was stopped, and the documented `BROWSER_EXECUTABLE` alternative was used. The automatic browser-installation path is not recorded as passing.
- System FFmpeg 9.0.1; the exporter uses the FFmpeg supplied by its npm dependency.

### Completed checks

1. Fresh npm installation: `npm ci` ran in both the handoff project and a separately extracted ZIP directory, without linking to an old case's node_modules.
2. Python: created a fresh `.venv` and installed 90 packages from the complete handoff lockfile. Qwen3TTSModel, PyTorch 2.11.0, torchaudio 2.11.0, and OpenCC imported successfully; Traditional-to-Simplified conversion worked. The machine lacked the system SoX executable, producing an import warning. SETUP lists it as an installation requirement. A complete setup-shell run from a clean OS is therefore not recorded as passing.
3. Upstream model: verified that the repository and revision in `model.json` exist. The revision is `fd4b254389122332181a7c3db7f27e918eec64e3`. Full weights were not downloaded.
4. Portability: extracted the ZIP to another absolute path containing Chinese characters and invoked tools from `/tmp`. Automated smoke tests also used a temporary directory containing spaces and Chinese characters. Both HTML builders, case initialization, and timeline rebuilding worked independently.
5. Missing inputs: without voice WAVs, `voice.py check sample` exited with a nonzero status and listed exact missing files. No voice was substituted.
6. Timing: temporary synthesized test signals verified separate main/background audio, three subtitle segments, non-contiguous page numbers, unequal segment lengths, frame-boundary padding, and unchanged source WAV hashes. These test signals are excluded from the handoff.
7. Visuals and branding: both illustrated HTML pages were successfully captured through the Chromium-control interface without missing images. The relocation test replaced brand.name and the logo, and the video displayed the replacement assets. The original brand logo was not used.
8. Motion Canvas: TypeScript/Vite build, actual FFmpeg exporter rendering, subtitle muxing, ffprobe, and full decoding passed. Testing found and fixed the exporter's audio working-directory mismatch, a cut occurring one frame early, and an extra end frame.
9. Final synthesized-signal video: 1080×1920, 30fps, 126 frames, 4.200 seconds, containing H.264 video, AAC audio, and mov_text subtitles. Video and audio durations were both 4.200 seconds.
10. Inspected frames 0, 65, 66, 67, and 125 of the final video. The first frame shows content and the test brand. Frame 65 still shows page 1, and frame 66 starts page 2 with no blank gap. Compared the two captured page images for composition and line breaks. This example uses direct cuts, with no continuous object animation requiring additional review.
11. The skill passed skill-creator quick_validate. Internal documentation links and the package file list were checked separately.

Final test video SHA-256:
`40992973f3887dbc0b0d3abba15623c45cbffe2d9b008a2c66c6e8252f1e56d8`

### Unverified items and required inputs

- No reference WAVs are included. Real-voice Qwen inference and human narration listening checks were not performed. Supply reference WAVs, matching transcripts, and explicit permission to generate speech, then follow the voice acceptance workflow.
- The user supplies the logo; the neutral example defaults to text branding.
- Intel Macs, other macOS versions, Node 22, and Playwright's bundled Chromium were not fully tested in this run. A macOS first release does not imply all hardware combinations have passed validation.
- This was not OS provisioning on a fresh physical Mac. Verification covered independent dependency installation and relocation/rebuilding, not Homebrew installation itself.
- npm reported five dependency audit findings: one low, two moderate, and two high. The fixed compatible Motion Canvas/Vite combination was retained; no forced major upgrade or claim of passing a security review was made. Development servers are for local use only.

### Repeat the checks

```bash
python3 "$PROJECT_ROOT/tools/smoke_test.py"
```

The test creates non-human signals in a temporary directory and removes them when finished. It does not call Qwen, change production cases, or add reference voices. Actual Motion Canvas rendering and visual/listening acceptance still follow the skill's video and acceptance documents.

2026-09-21 storage separation: trilingual docs and skill validation passed, along with isolated packaging, both HTML builders, timeline tests, unchanged repository hashes, and rejection of repository-internal roots, escaping outputs and symlinks. An external case completed two silent-preview screenshots and TypeScript/Vite compilation. No voice generation or final MP4 rendering was performed; legacy personal data was not moved.
