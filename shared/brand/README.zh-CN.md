[繁體中文](README.md) | [简体中文](README.zh-CN.md) | [English](README.en.md)

# 使用自己的品牌

本包不附 Logo。将你的 Logo 放在此目录，然后修改 project 根目录的 `brand.json`：

```json
{"name":"你的品牌","logo":"shared/brand/logo.svg"}
```

`logo` 是相对交接 project 的路径，脚本解析为执行用路径；不要填原作者机器的绝对路径。
SVG、PNG 等浏览器可加载的格式皆可。图片内容由用户提供。`logo: null` 显示品牌名称文字，适用中性最小示例。
修改后重建两种 HTML、prepare-motion 与视频；不重制声音。
