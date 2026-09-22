[繁體中文](DATA_LAYOUT.md) | [简体中文](DATA_LAYOUT.zh-CN.md) | [English](DATA_LAYOUT.en.md)

# Data storage rules

The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

The default is `presentations/` beside the capability repository. Set `PRESENTATION_DATA_ROOT` to another independent absolute path if desired. It cannot be inside or contain the capability repository. Initialize with:

First create `.venv` using [setup](SETUP.en.md). These commands work from any directory. For custom storage, set `PRESENTATION_DATA_ROOT` to the chosen absolute path before running `init_data.py`; otherwise it uses the default location.

```sh
PROJECT_ROOT="/absolute/path/to/talk-to-presentation"
export PRESENTATION_DATA_ROOT="$("$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_data.py")"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_case.py" my-talk
```

All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root.

The repository's `cases/sample/` and root `brand.json` are neutral examples. Production reads cases and branding from the data root. `model.json` is capability configuration; its model directory is still relative to the data root.

```text
<data-root>/
  brand.json
  shared/brand/
  shared/styles/default/
  shared/voice/reference-voice/README.md
  shared/voice/reference-voice/*.wav
  models/
  cases/<id>/content/
  cases/<id>/assets/
  cases/<id>/audio/
  cases/<id>/dist/
  cases/<id>/motion/
  cases/<id>/verification/
```

To replace the core style, copy built-in `shared/styles/default/` into the same relative directory under the data root and edit that copy. New cases snapshot their selected style; existing cases do not change automatically.

Legacy user data inside the capability repository is never moved, deleted or used as fallback automatically. Copy it to the data root and verify completeness before separately handling old files. Ignoring files does not separate data.
