[繁體中文](images.md) | [简体中文](images.zh-CN.md) | [English](images.en.md)

# Creating and updating images

This workflow covers new illustrations, edits, and replacements. Preserve content confirmations and image-generation permissions from the existing conversation; do not add duplicate approval gates.

## Determine the scope first

- New image: follow the confirmed topic, selected pages, and illustration requirements.
- Image content edit: inspect the original, identify the objects, composition, or style to change, and modify only that part while preserving other confirmed elements.
- Wrong position, crop, full-bleed coverage, mask, or layering: fix the HTML/Canvas Commons layout source and reuse the image. Do not regenerate artwork to fix display problems.
- Ordinary rebuilds reuse existing images. Generate or edit image content only when the user asks for it.

## Produce images

1. Read the selected page's `slides.json` and `visual.notes`. Inspect existing images and rendered layouts for style, aspect ratio, subject placement, text space, and crop focus. Preserve unspecified visual details rather than changing the entire style.
2. Use an available ImageGen tool for new or edited raster illustrations, following the applicable imagegen skill. Supply the original image for edits. Edit SVG or programmatically drawn assets in their native source instead of turning them into generated raster artwork.
3. Base prompts on confirmed content and specify the aspect ratio, subject, and text-area placement. Unless the user asks for text inside the image, render titles, subtitles, page numbers, and branding as HTML/video layers so they remain independently editable.
4. Inspect the result and preview its crop on the target canvas. Check requested content, style, complete subjects, and usable text space. Object-level animation needs actual separate layers/assets; cropping a finished image into pieces does not establish proper layered artwork.

## Save and synchronize

- Store images in the case's `assets/illustrations/`. Keep the original when replacing an image and save the new version under a distinguishable filename so comparisons remain possible.
- Update affected `slides.json[].visual.illustrations` references and relevant `visual.notes`. Record selected pages, requested changes, asset paths, and confirmation status in `content/draft.md`. Successful generation does not mean user approval.
- HTML and video must use the same updated asset references. Rebuild only affected illustrated HTML and video. Image-only changes do not regenerate narration or change timing or Takahashi text.
- If illustrated HTML is correct and only video is wrong, fix and rebuild only the video.

## Verify

- Inspect the image itself and its appearance in illustrated HTML and the final video. Check that the new version is used, coverage/crop and text placement agree, and no extra mask or obscured brand has been introduced.
- Check every changed page, including pages identified by the user. Follow the video workflow to validate a local render before rendering the full video.
- Report changed pages, image paths, rebuilt outputs, and outstanding confirmations. Image generation alone does not establish that HTML and video have been updated and verified.
