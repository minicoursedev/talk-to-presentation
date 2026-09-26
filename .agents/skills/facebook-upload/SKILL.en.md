---
name: facebook-upload
description: Upload a finished video to the Tainan AI Buffet Facebook Page. Switch to and verify the Page identity before upload, then verify the published Reel or post. Use for Facebook video uploads to this Page.
---

[繁體中文](SKILL.md) | [简体中文](SKILL.zh-CN.md) | [English](SKILL.en.md)

# Tainan AI Buffet Facebook video upload

This skill delivers a finished video to Facebook. Use the [presentation production skill](../presentation-production/SKILL.en.md) to make or revise the video. The target is the [台南AI爽 Page](https://www.facebook.com/profile.php?id=61594422884007). The user must specify any other Page.

## Before upload

- Confirm authorization for this upload or edit. Locate the case's actual MP4 and the current title, description, and optional captions or cover. Carry forward choices already made in the conversation.
- **Switch to the 台南AI爽 Page identity before opening the upload flow.** Verify the Page name and URL ID `61594422884007`, and confirm that the active identity can manage the Page. If switching or verification fails, stop publication and report the concrete blocker. Never post from a personal profile or a different Page instead.
- Check the Page or content library for an existing copy. If asked to update an existing post, edit that post where possible rather than publishing a duplicate.

## Publish

1. Choose Reel or a regular video post according to the video and user's request. Upload the actual MP4 through the file chooser. If supported, arm `filechooser` before clicking the upload control, then use `chooser.setFiles(...)` with the absolute path; do not ask the user to select the file.
2. Enter the current copy and review the preview, audience, scheduling, and required platform labels. Do not carry over a prior video's copy or visibility. Decide AI content labeling from the actual media and platform requirements.
3. Wait for upload and initial checks before publishing under the current authorization. A publishing progress message is not completion; check again if the platform is still processing.

## Completion

- Find the new Reel or post on the 台南AI爽 Page, open its permalink, and verify the Page identity, copy, and actual audience. If processing continues, report that state without claiming the video is viewable.
- Report the verified Facebook link and audience. Report caption, cover, and playback state only when observed.
