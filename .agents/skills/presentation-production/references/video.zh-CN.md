[繁體中文](video.md) | [简体中文](video.zh-CN.md) | [English](video.en.md)

[数据存放规则](../../../../docs/DATA_LAYOUT.zh-CN.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路径均相对于用户数据根目录；`tools/`、`templates/` 与内置 `shared/styles/default/` 相对于能力根目录。 能力仓库只保存工具、skill、内置模板与中性示例。一般制作不得修改内置风格、示例或参考网站。用户录音、逐字稿、品牌、自定义风格、案例与输出都放在仓库外。

# Canvas Commons 输出

先设定能力目录的绝对 `PROJECT_ROOT` 与仓库外的 `PRESENTATION_DATA_ROOT`；`my-talk` 换成案件 ID。以下正式与静音流程分开执行。

## 正式影片：准备来源

美化 HTML 是构图基准。使用最终 WAV 重建时间轴，再由 HTML 撷取逐页画布。若 `slides.json` 或 `case.json` 变更，即使只改图片引用，也须重跑 timeline 更新来源杂凑；不因此重制旁白。

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" timeline my-talk
node "$PROJECT_ROOT/tools/visual-html/build.mjs" my-talk
node "$PROJECT_ROOT/tools/prepare-motion.mjs" my-talk
node "$PROJECT_ROOT/tools/motion.mjs" build my-talk
```

prepare 使用短期本机 HTTP 服务与 Chromium，完成后关闭。它更新截图、`prepared.json`、`motion/timeline.wav` 及匹配 case.format 的 `project.meta`，不覆写案件 scene。`build` 只做 TypeScript/Vite 编译，不产生最终 MP4。

## 命令列汇出与检查

```bash
node "$PROJECT_ROOT/tools/render-video.mjs" my-talk
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/finish_video.py" my-talk "$PRESENTATION_DATA_ROOT/cases/my-talk/motion/output/presentation.mp4"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/verify_video.py" my-talk
```

`render-video.mjs` 启动只绑 `127.0.0.1` 的临时 Vite 服务，以 Playwright 呼叫 Canvas Commons `Renderer` 与 `Video (FFmpeg)` exporter，执行案件 scene 并沿用 prepare 的尺寸、fps、range 及音轨设定。支援 `BROWSER_EXECUTABLE`；完成或失败后关闭服务与浏览器，失败以非零状态回报。

本命令固定产生 `motion/output/presentation.mp4`，重跑会替换此生成档。finish_video 封装字幕后，正式交付位置由 `case.json.outputs.video` 决定。verify_video 检查 H.264、尺寸、fps、影格数、音轨、mov_text 字幕、长度及完整解码，记录于 `verification/media.json`；不代替观看与抽听。

## 选用编辑器汇出

需要在编辑器预览或操作时，完成准备后另外执行：

```bash
node "$PROJECT_ROOT/tools/motion.mjs" start my-talk --port 9002
```

浏览器开启 `http://127.0.0.1:9002/`。这是持续执行的本机服务，结束后用 Ctrl+C 关闭；执行其他命令可使用另一个终端。端口被占用时换空闲端口。

1. Exporter 选 `Video (FFmpeg)`。
2. 尺寸与 fps 依 case.format，scale 1、audio offset 0；range 为 0 到总帧数／fps 秒，不减一帧。
3. 正式影片启用 Include audio 与 Fast start；静音预览不开音讯。
4. 按 RENDER 并等候完成，输出位于案件 `motion/output/`。以编辑器实际产生的档名传给 finish_video；静音影片则只执行 preview 验证。

编辑器与命令列走同一个渲染器。来源修改后重新执行受影响的准备、建置与汇出，不能沿用旧 MP4。

## 无配音的技术预览

先依[工作流程](workflow.zh-CN.md)在资料目录建立 sample；已有案件时不重复初始化。静音预览不需要模型或参考 WAV，每页秒数取自 `previewSeconds`（预设 3 秒）。

```bash
node "$PROJECT_ROOT/tools/visual-html/build.mjs" sample
node "$PROJECT_ROOT/tools/prepare-motion.mjs" sample --preview
node "$PROJECT_ROOT/tools/motion.mjs" build sample
node "$PROJECT_ROOT/tools/render-video.mjs" sample --preview
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/verify_video.py" sample --preview --file "$PRESENTATION_DATA_ROOT/cases/sample/motion/output/preview.mp4"
```

命令列静音输出为 `motion/output/preview.mp4`，与正式档名不同。不要交给要求音轨的 finish_video，也不能称为配音交付。切换正式／静音模式时，prepare 与 render 必须使用相同模式。

## 动画及构图

预设 scene 以逐页图片直接换页，保持美化 HTML 的构图。它不包含物件分层动画；需要动画时依使用者要求修改案件 scene，使用原生 Layout/Txt/Img 与 tween，保留 prepared 中各页 frames 与总长度。

- 首帧内容与品牌须可见；换页前保留前页直到下一页接手，避免空白。
- 累积动画承接已有物件，不重播已完成部分。
- 保留已确认的图片裁切、文字、遮罩与留白；不自动加底板、缩放或效果。
- 原生文字用垂直 Layout 或换行；lineHeight 数值为像素，比例使用百分比字串。
- 自订场景依[验收](acceptance.zh-CN.md)逐页查看、检查交界并抽听，不以删帧或裁音掩盖问题。

## 沿用既有 HTML

prepare 支援从 1 开始的 `#progress`／`#progressBar` 滑杆及 `.short-frame`／`.slide.active` 画布。滑杆 input 事件须切换对应页，页序与 `slides.json` 一致；任意 HTML 不保证可直接汇入。撷取前核对实际画布尺寸与 case.format 一致，并依[验收](acceptance.zh-CN.md)确认成片构图。
