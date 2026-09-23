[繁體中文](AGENTS.md) | [简体中文](AGENTS.zh-CN.md) | [English](AGENTS.en.md)

[Data storage rules](docs/DATA_LAYOUT.en.md)：All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root. The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

# Presentation production

- Use `.agents/skills/presentation-production/SKILL.md` for presentation work.
- Preserve user decisions and existing approvals across tasks. Never treat generated draft content as approved.
- Keep screen text, main narration, background narration and tones separate.
- Change only requested sources and their affected outputs; reuse confirmed images and audio by default.
- Three final outputs: Takahashi HTML, illustrated HTML, narrated Canvas Commons MP4.
- Brand comes from `brand.json`; never assume a particular organization or speaker.
- Sources live in `cases/`; `dist/` and prepared screenshots are rebuildable outputs.
- No subagents unless explicitly requested. No platform or service architecture.
- Package contains no reference voice WAVs. Missing inputs must be reported, not substituted.
- Resolve paths from script location or explicit absolute project root, never from an assumed current directory or developer home.
- Build success is not visual/listening acceptance. Report untested stages explicitly.

- Maintain Traditional Chinese, Simplified Chinese and English project documentation with same-language links. Preserve executable identifiers, paths and recording transcripts.
- Multilingual maintenance applies only to this repository's project documentation, skill and built-in templates. User case drafts, delivery notes, custom styles and voice catalogs use one working-language document; add translations only when explicitly requested.

- At first use, proactively present the [getting-started guide](docs/GETTING_STARTED.en.md) and copyable starter. Read available information and inspect the environment, then ask only consequential unanswered questions. Surface required inputs before narration or bulk production rather than after a failed attempt.
