[繁體中文](AGENTS.md) | [简体中文](AGENTS.zh-CN.md) | [English](AGENTS.en.md)

[数据存放规则](docs/DATA_LAYOUT.zh-CN.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路径均相对于用户数据根目录；`tools/`、`templates/` 与内置 `shared/styles/default/` 相对于能力根目录。 能力仓库只保存工具、skill、内置模板与中性示例。一般制作不得修改内置风格、示例或参考网站。用户录音、逐字稿、品牌、自定义风格、案例与输出都放在仓库外。

# 演示文稿制作

- 演示文稿工作使用 `.agents/skills/presentation-production/SKILL.md`。
- 已完成视频的 YouTube 上传或更新使用 `.agents/skills/youtube-upload/SKILL.zh-CN.md`。
- 已完成视频上传至台南AI爽 Facebook 粉丝专页使用 `.agents/skills/facebook-upload/SKILL.zh-CN.md`。
- 延续跨任务的用户决策与既有授权。不得将生成的草稿视为已确认内容。
- 画面文字、主旁白、补背景旁白与语气分开保存。
- 只改指定来源及受影响的输出；默认沿用已确认的图片与音讯。
- 三种最终输出：高桥流 HTML、美化 HTML、含旁白的 Canvas Commons MP4。
- 品牌来自 `brand.json`；不得假设特定组织或说话者。
- 来源放在 `cases/`；`dist/` 与准备好的截图都是可重建的产物。
- 配音合成后的逐字稿查漏可派 Luna 子代理；其他情况未明确要求时不使用子代理，不扩大成平台或服务架构。
- 交接包不含参考语音 WAV。缺少输入时回报，不得替换。
- 从脚本位置或明确指定的项目绝对路径解析文件位置，不假设工作目录或开发者的 home 路径。
- 建置成功不代表视觉或听觉验收通过。明确列出未测试阶段。

- 项目文档维护繁体中文、简体中文与英文版本及同语言链接；程序标识符、文件路径与录音逐字稿保留实际执行值。
- 多语要求只适用于本项目仓库内的操作文档、skill 与内置模板。用户的案例底稿、交付说明、自定义风格与声音清单依其工作语言维护一份；只有明确要求翻译时才增加语言版本。

- 第一次使用时主动提供[入门指南](docs/GETTING_STARTED.zh-CN.md)与可复制的开始模板，先读取已有信息并检查环境，再询问尚缺且影响下一步的问题；在配音或大量制作前说明必要输入，不等失败后才要求补充。
