"""Check the trilingual document inventory, language links and voice catalog identifiers."""
import re
from pathlib import Path
from common import ROOT, catalog

suffixes = ('', '.zh-CN', '.en')
ignored = {'.git', '.venv', 'node_modules', '__pycache__', 'dist', 'output', 'verification'}
docs = sorted(p for p in ROOT.rglob('*.md') if not ignored.intersection(p.relative_to(ROOT).parts))
def base_stem(p):
    return re.sub(r'\.(zh-CN|en)$', '', p.stem)

families = {p.with_name(base_stem(p) + '.md') for p in docs}
errors = []
for base in sorted(families):
    for suffix in suffixes:
        path = base.with_name(base.stem + suffix + '.md')
        if not path.is_file():
            errors.append(f'Missing translation: {path.relative_to(ROOT)}')
            continue
        text = path.read_text(encoding='utf-8')
        links = re.findall(r'\]\(([^)]+)\)', text)
        expected = {base.stem + s + '.md' for s in suffixes}
        if not expected.issubset(set(links)):
            errors.append(f'Missing language navigation: {path.relative_to(ROOT)}')
        for href in links:
            if '://' in href or href.startswith('#'):
                continue
            target = (path.parent / href.split('#')[0]).resolve()
            if not target.is_file():
                errors.append(f'Broken link in {path.relative_to(ROOT)}: {href}')
            if href in expected:
                continue  # Intentional language switches.
            if target.suffix == '.md' and target.with_name(base_stem(target)+'.md') in families:
                actual = target.stem[len(base_stem(target)):]
                if actual != suffix:
                    errors.append(f'Cross-language body link in {path.relative_to(ROOT)}: {href}')

voice_dir = ROOT / 'shared/voice/reference-voice'
def voice_rows(path):
    return [re.match(r'^\|\s*\d+\s*\|\s*([^|]+?)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|', line).groups()
            for line in path.read_text(encoding='utf-8').splitlines()
            if re.match(r'^\|\s*\d+\s*\|', line)]
reference = voice_rows(voice_dir/'README.md')
for suffix in suffixes:
    if voice_rows(voice_dir/f'README{suffix}.md') != reference:
        errors.append(f'Voice IDs, filenames or recording transcripts changed in README{suffix}.md')
if len(catalog()) != len(reference):
    errors.append('Canonical voice catalog is no longer readable by the runtime parser')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(families)} document families, {len(docs)} documents, language navigation, local links and {len(reference)} unchanged voice entries')
