[繁體中文](GETTING_STARTED.md) | [简体中文](GETTING_STARTED.zh-CN.md) | [English](GETTING_STARTED.en.md)

[Data storage rules](DATA_LAYOUT.en.md)：All `cases/`, `shared/voice/`, `models/` and active `brand.json` paths are relative to the user data root. `tools/`, `templates/` and built-in `shared/styles/default/` are relative to the capability root. The capability repository contains tools, skills, built-in templates and neutral examples only. Production must not edit built-in styles, examples or reference websites. User recordings, transcripts, brands, custom styles, cases and outputs belong outside this repository.

# First use of Talk to Presentation

This guide lists the decisions needed at first use and for each production. Copy the starter below to begin. Write “help me decide” for open questions rather than waiting until every field is resolved.

The default core template is Storyteller: the whole presentation’s narrative guides page visuals, narration, and pacing. Users can edit or replace the template. New cases retain a snapshot of the selected version; shared-template changes do not alter existing cases.

## 1. After cloning: check the environment

Place the project in a directory of your choice; its name is unrestricted. Open the directory containing the workspace instructions. If you obtained only the production capability package, you may open that package directly. The capability root contains `tools/`, `brand.json`, and `.agents/skills/presentation-production/`; do not copy another user's local paths.

Start by telling the assistant:

> Check and set up the production environment according to the project documentation. Reuse existing tools that meet requirements, then report passing checks and remaining inputs.

The assistant should inspect the operating system, actual paths, installed tools, and dependency requirements. You need not supply facts available through local inspection; a recommended version is not necessarily the only supported version. See [environment setup](SETUP.en.md) for current platform targets and limitations. Dependency installation requires network access; model weights and reference recordings are additional prerequisites for narration.

## 2. Start the content with three questions

| Question | What you can provide | If undecided |
| --- | --- | --- |
| What do you want to say? | An idea, question, document, URL, or existing deck; specify a subset if relevant | Share what you have and ask for help shaping the topic |
| Who is it for, and what should they understand? | Audience background and what they should understand, remember, or do | Ask for help clarifying audience and purpose |
| Where will it be used? | A live talk, independent reading, a course, or social video; add duration, page, or format constraints | Describe the context and ask for suitable options |

When documents already contain answers, the assistant should read them instead of asking you to enter the same information again.

## 3. Before production: choose outputs and presentation

| Choice | What to decide | If unspecified |
| --- | --- | --- |
| Outputs | Takahashi text HTML, illustrated HTML, narrated MP4, or all; draft first or complete production | Develop content and recommend outputs without assuming authorization for every generation step |
| Visual style | Reuse or adjust the [style reference](../shared/styles/default/style.en.md), or supply your own | The assistant presents available references and explains defaults and adjustable aspects |
| Images | Whether every page needs an image and whether specific images or charts are required | Propose a page-by-page plan before image generation and clarify consequential choices |
| Branding | Name and logo, or neutral presentation | Explain the current sample branding rather than treating it as the production brand |
| Narration and speed | If needed, choose voice identity, tone, and speed | Inspect available voice resources and ask only for missing choices; do not inherit unrelated case settings |

Decide through conversation. Do not repeat answered questions or add approval gates for work already explicitly authorized.

## 4. Prepare reference recordings only when narration is needed

Place recordings under `shared/voice/reference-voice/` relative to the user data root. Record tones, filenames, and exact transcripts in the [voice catalog](../templates/voice-catalog.en.md). Supply only tones used by the case and reuse existing mapped resources when available.

The assistant should check recordings and the model before narration, report missing inputs early, and preserve originals during format conversion. See [voice production](../.agents/skills/presentation-production/references/voice.en.md) for formats and commands. Missing recordings need not block content development or unaffected authorized work.

## Copy this starter

```text
I want to create a presentation with Talk to Presentation.

Topic / idea / sources:
Source scope, if relevant:
Audience and intended message:
Use context:
Duration, page, or format constraints (or none):

Requested outputs (or recommend):
Visual style (reuse reference / my reference / help me choose):
Images (every page / propose a plan / other):
Branding (name and logo / neutral / decide later):
Narration (yes / no / decide later):
Available reference recordings and tone mappings, if relevant:
Voice speed, if relevant (or recommend):

Develop and preview first, or complete these production steps:
Help me resolve open questions using the available information.
```

## What happens next

The assistant summarizes its understanding, current choices, and consequential missing inputs, then provides page drafts and a style preview and proceeds within the authorized scope. Request changes by page or content without restating the entire brief.

Once production begins, decisions, reference paths, authorization, and progress are saved in the case's `content/draft.md`. Delivery reports outputs, technical checks, and actual audiovisual review separately, identifying remaining work. For later cases, specify which preferences to reuse; the assistant should make that scope explicit.
