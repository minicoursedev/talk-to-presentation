# Presentation production

- Use `.agents/skills/presentation-production/SKILL.md` for presentation work.
- Preserve user decisions and existing approvals across tasks. Never treat generated draft content as approved.
- Keep screen text, main narration, background narration and tones separate.
- Change only requested sources and their affected outputs; reuse confirmed images and audio by default.
- Three final outputs: Takahashi HTML, illustrated HTML, narrated Motion Canvas MP4.
- Brand comes from `brand.json`; never assume a particular organization or speaker.
- Sources live in `cases/`; `dist/` and prepared screenshots are rebuildable outputs.
- No subagents unless explicitly requested. No platform or service architecture.
- Package contains no reference voice WAVs. Missing inputs must be reported, not substituted.
- Resolve paths from script location or explicit absolute project root, never from an assumed current directory or developer home.
- Build success is not visual/listening acceptance. Report untested stages explicitly.
