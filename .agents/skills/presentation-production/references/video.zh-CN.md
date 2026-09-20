[繁體中文](video.md) | [简体中文](video.zh-CN.md) | [English](video.en.md)

# Motion Canvas 输出

以下命令皆使用绝对 `PROJECT_ROOT`；`my-talk` 换成案件 ID。

## 准备及预览

美化 HTML 是构图基准。先重建美化 HTML，再截取画布形成视频所用的逐页图片。不要修改图片当成内容来源。

没有参考 WAV 时可做**静音技术预览**：

```bash
node "$PROJECT_ROOT/tools/visual-html/build.mjs" sample
node "$PROJECT_ROOT/tools/prepare-motion.mjs" sample --preview
node "$PROJECT_ROOT/tools/motion.mjs" build sample
node "$PROJECT_ROOT/tools/motion.mjs" start sample --port 9002
```

每页预览秒数来自 `previewSeconds`（默认 3 秒）；不代表正式旁白时间。正式视频使用已确认 WAV 重建时间轴：

```bash
python3 "$PROJECT_ROOT/tools/voice.py" timeline my-talk
node "$PROJECT_ROOT/tools/visual-html/build.mjs" my-talk
node "$PROJECT_ROOT/tools/prepare-motion.mjs" my-talk
node "$PROJECT_ROOT/tools/motion.mjs" build my-talk
node "$PROJECT_ROOT/tools/motion.mjs" start my-talk --port 9002
```

浏览器开启 `http://127.0.0.1:9002/`。端口有占用时换空闲端口。本机预览不是公开部署。

prepare-motion 使用自己启动的短期 HTTP 伺服器与 Chromium，结束即关闭。它只更新生成的截图、prepared.json、工程音轨（motion/timeline.wav，供 Vite 与 FFmpeg exporter 同时读取）及渲染设置，不覆写自订 scene。HTML 宽高与截图像素来自 case.format。

## 动画及构图

默认模板是真正的 Motion Canvas scene，逐页图片直接切换。它不包含物件分层动画。需要动画时依用户指定修改案件 scene，使用原生 Layout/Txt/Img 与 tween；不要宣称整页图片就是分层动画。

- 首帧内容及品牌即须可见；不要以全透明 fade-in 或空白等待初始化。
- 换页前页可见直到下一页接手；不可先全部淡出造成空白。
- 累积动画承接前一页状态，不重播已存在物件。
- 既有 HTML 图片占位、裁切、文字位置、遮罩与留白都保留；不自动加底板、缩放或其他效果。
- 原生文字多行用明确垂直 Layout 或适当换行；lineHeight 数值是像素，比例请用百分比字串。
- 自订场景维持 prepared 中各页 frames 与总长度，不以裁音或删帧掩盖画面问题。

## 渲染

`build` 只完成 TypeScript/Vite 编译。正式 MP4 由 Motion Canvas 编辑器渲染：

1. Exporter 选 `Video (FFmpeg)`。
2. 沿用 prepare-motion 设置的 range（0 至总帧数减 1，exporter 包含结束帧），尺寸、fps 依 case.format，scale 1、audio offset 0。
3. 正式视频启用 Include audio 与 Fast start。静音预览不开音讯，且只以 preview 名称交付。
4. 按 RENDER 等待完成；输出在 `cases/my-talk/motion/output/`，以实际档名为准。

prepare-motion 会写入匹配 case.format 的 project.meta，仍需在 UI 核对设置。source 修改后必须重新 prepare/build/render，不能沿用旧 MP4。

将 exporter 本次输出的视频与已确认字幕封装：

```bash
python3 "$PROJECT_ROOT/tools/finish_video.py" my-talk "$PROJECT_ROOT/cases/my-talk/motion/output/presentation.mp4"
python3 "$PROJECT_ROOT/tools/verify_video.py" my-talk
```

finish_video 强制需要音轨，不会把静音示例包装成 narrated MP4。
若只验证静音技术示例：

```bash
python3 "$PROJECT_ROOT/tools/verify_video.py" sample --preview --file "$PROJECT_ROOT/cases/sample/motion/output/presentation.mp4"
```

verify_video 检查 H.264、尺寸、fps、正式音轨与字幕、长度及完整解码，将结果写入案件 verification/media.json。它不代替观看或抽听。
