---
name: youtube-upload
description: Upload or update a finished video in YouTube Studio, set its title, description, playlist, captions, and visibility, then verify the saved publication state. Use for YouTube upload or publication requests; use presentation-production to make the video itself.
---

[繁體中文](SKILL.md) | [简体中文](SKILL.zh-CN.md) | [English](SKILL.en.md)

# YouTube video upload

This skill delivers a finished video through YouTube Studio. Use the [presentation production skill](../presentation-production/SKILL.en.md) if the visuals, narration, or MP4 need to be made or revised. Keep case and account decisions in the case or current task, not in this shared skill.

## Before upload

- Confirm that the user has authorized uploading or editing this video. Read the channel, title, description, playlist, caption languages, and visibility chosen for this task. Carry forward choices already made in the conversation; clarify only a missing choice that changes the publication result. Do not reuse a previous video's private or public setting as a default.
- Locate the actual MP4, SRT files, optional thumbnail, and content sources in the case. Check that files exist and the duration meets the request. Do not report visual, listening, or factual review that has not happened. When asked to change an existing video, edit its existing video ID instead of uploading a duplicate.
- Verify the active channel and target playlist in Studio. Select the name the user specified; if similar names make the target uncertain, ask instead of creating a possible duplicate.

## Studio workflow

1. Upload the MP4 and confirm the displayed filename and generated video link. Enter the task's title, description, and verifiable sources. Set the chosen playlist, audience, and other applicable fields. Answer paid promotion and synthetic content disclosures from the actual media, not a fixed template. Upload a thumbnail only when suitable material exists and the task needs it.
2. When switchable captions are needed, upload a timed SRT for each language. Wait for caption text and timings to load, then finish or publish the track. Embedded MP4 captions do not establish that YouTube has a caption track. For Traditional to Simplified conversion, change only caption text; preserve cue numbers and timestamps and compare their counts and timings before upload. Store the new SRT in the case data directory.
3. For web file uploads, arm the browser's file chooser wait before clicking the visible Select files or Upload file control, then set the absolute file path. When the tool supports `waitForEvent('filechooser')` and `chooser.setFiles(...)`, complete selection directly rather than asking the user to pick files.
4. Review the platform's preliminary checks. Explicitly select the authorized visibility—public, unlisted, private, or scheduled—and save or publish. A temporary private label or upload progress message does not establish final visibility.

## Completion

- Verify the title, video ID, duration, and final visibility in the Studio video list or edit page. Verify that the video appears on the target playlist's video page.
- Verify that each requested caption track shows as published on the language page. Opening an editor or selecting a file is not completion. Check viewer playback when caption presentation or placement is part of the request; ordinary SRT does not guarantee a fixed screen position.
- Report the video and playlist links, actual visibility, published caption languages, and any human viewing or listening review that remains undone. Report only observed states.
