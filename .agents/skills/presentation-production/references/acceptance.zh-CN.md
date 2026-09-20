[繁體中文](acceptance.md) | [简体中文](acceptance.zh-CN.md) | [English](acceptance.en.md)

# 验收

技术测试与人类内容确认分开；每份记录标明来源、输出 SHA-256 和实际检查时间，不沿用旧版验收。

## HTML

- 两种 HTML 页序与文字皆对应 slides.json；键盘、页码滑杆可操作。
- 在本机 HTTP 预览实际查看所有页面，检查换行、溢出、图片裁切、品牌、页码。
- 修改品牌名称与 Logo 时三种输出共用 brand.json，正式 Logo 由用户提供。

## 语音、时间与视频

- 缺少参考 WAV 时停止 TTS 并列缺项；不使用替代人声。
- 主／背景音频文件分开，指定重制页以外的音频文件 SHA-256 保持不变。
- 每个重制页抽听文字、语气、句中停顿和结尾。RMS、非静音或解码通过都不等于已听过。
- timeline 和字幕由最终 WAV 重建，依帧边界对齐；字幕完整包含确认的主／背景旁白。
- Canvas Commons build、FFmpeg exporter render、字幕封装、ffprobe 和完整解码皆通过，尺寸/fps/长度一致。
- 正式 MP4 第 0 帧、每页交界前一帧／交界帧／下一帧、最后一页及修改页均实际查看。转场需播放完整区间，不能只截停留后画面。
- 对照美化 HTML 确认裁切、文字、遮罩、品牌一致，自订动画不偷改构图。
- 音讯开头、中段、结尾及修改页实际抽听，不能用字幕当音讯证据。

## 交接包本身

- 在另一个目录（含空格及中文）从任意 cwd 执行 tools，不能引用原项目路径、其他案件 node_modules 或原 venv。
- npm ci 与 Python lock 安装可重建依赖；模型取得命令有固定 revision。
- 语气 README 存在，没有参考 WAV；没有原品牌 Logo、原案件或原用户绝对路径。
- 中性示例可建置两种 HTML 与静音 Canvas Commons 工程。未提供声音时不宣称完整 Qwen/narrated MP4 验收。
- 交付列出实际通过命令、未验证项目与接手者必要输入。
