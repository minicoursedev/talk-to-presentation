#!/bin/bash
set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ "$(uname -s)" != Darwin ]; then echo 'This release targets macOS.' >&2; exit 1; fi
for command in node npm python3.12 ffmpeg ffprobe sox; do
  command -v "$command" >/dev/null || { echo "Missing $command. Read docs/SETUP.md." >&2; exit 1; }
done
node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major < 20 || (major === 20 && minor < 19)) { console.error("Canvas Commons requires Node >= 20.19.0; install Node 22 LTS."); process.exit(1); }'
cd "$PROJECT_ROOT"
npm ci
if [ -n "${BROWSER_EXECUTABLE:-}" ]; then
  test -x "$BROWSER_EXECUTABLE" || { echo "Invalid BROWSER_EXECUTABLE" >&2; exit 1; }
else
  "$PROJECT_ROOT/node_modules/.bin/playwright" install chromium
fi
python3.12 -m venv "$PROJECT_ROOT/.venv"
"$PROJECT_ROOT/.venv/bin/python" -m pip install --upgrade pip
"$PROJECT_ROOT/.venv/bin/python" -m pip install -r "$PROJECT_ROOT/requirements-macos.lock.txt"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/doctor.py"
echo 'Environment installed. Model download and reference WAVs are separate explicit steps.'
