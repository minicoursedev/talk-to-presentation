[繁體中文](VERIFICATION.md) | [简体中文](VERIFICATION.zh-CN.md) | [English](VERIFICATION.en.md)

# 本次交接包验证

日期：2026-09-21。这是交接工具的技术验证，不是任何正式演示文稿的内容或配音验收。

## 实测环境

- macOS 26.6.2（25G83）、Apple Silicon arm64。
- Node 26.7.0；Python 3.12.14 的独立虚拟环境。
- Motion Canvas 3.17.2、FFmpeg exporter 1.1.1、Vite 4.5.14。
- Playwright 1.58.2 搭配本机 Google Chrome；Chromium 自动下载完成后解压缩停滞，已停止该安装程序，改走文件中的 `BROWSER_EXECUTABLE` 方式。没有把自动下载路径列为已通过。
- 系统 FFmpeg 9.0.1；exporter 使用 npm 软件包带入的 FFmpeg。

## 已完成

1. 全新 npm 安装：在交接 project 及 ZIP 解压后的独立目录分别执行 `npm ci`，不链接原案件 node_modules。
2. Python：用交接包的完整 lockfile 创建全新 `.venv` 并安装 90 个软件包；可导入 Qwen3TTSModel、PyTorch 2.11.0、torchaudio 2.11.0 和 OpenCC，繁简转换通过。环境没有 SoX 系统可执行文件，导入时有警告；SETUP 已列为必要安装项目。因此未把完整 setup shell 从干净 OS 执行列为已通过。
3. 上游模型：确认 `model.json` 的 repo 与 revision 存在，revision 是 `fd4b254389122332181a7c3db7f27e918eec64e3`。未下载全部权重。
4. 可携性：ZIP 解压到另一个含中文的绝对路径，从 `/tmp` 呼叫工具；另以含空格及中文的临时目录跑自动 smoke test。两种 HTML、案件初始化与时间轴皆可独立执行。
5. 缺档：未附语气 WAV，`voice.py check sample` 非零结束且列出确切缺档；没有替换声音。
6. 时间轴：用临时合成测试音验证主／背景分开、三段字幕、非连续页码、不同片段长度、帧边界补齐、原 WAV 杂凑不变。测试音不在交接包中。
7. 画面与品牌：两页美化 HTML 经 Chromium 控制介面撷取成功、无缺图；搬移测试替换 brand.name 与测试 Logo，视频显示替换后资产。原品牌 Logo 未使用。
8. Motion Canvas：TypeScript/Vite build、实际 FFmpeg exporter render、字幕封装、ffprobe、完整解码通过。曾发现并修正 exporter 读音频文件的工程根目录差异、换页提早一帧、结束帧多输出等问题。
9. 最后一次合成音测试视频：1080×1920、30fps、126 帧、4.200 秒，含 H.264 video、AAC audio、mov_text 字幕。video 与 audio 均为 4.200 秒。
10. 实际抽看最后视频第 0、65、66、67、125 帧：首帧内容和测试品牌可见；第 65 帧仍为第一页，第 66 帧开始第二页，页界没有空白。比对两页撷取图确认构图与换行。此示例只有直接切页，不包含需要额外验收的连续物件动画。
11. skill 通过 skill-creator 的 quick_validate；文件内部链接与包内文件清单另外检查。

最后测试视频 SHA-256：
`40992973f3887dbc0b0d3abba15623c45cbffe2d9b008a2c66c6e8252f1e56d8`

## 尚未验证／接手者必要输入

- 不附参考 WAV，未执行真人声线 Qwen 推论，也未做真人旁白抽听。需要用户提供参考 WAV、对应逐字稿与明确生成授权后，依配音流程验收。
- 品牌 Logo 由用户提供；中性示例默认只显示文字品牌。
- Intel Mac、其他 macOS 版本、Node 22 与 Playwright 配套 Chromium 在本次未完成实测。不要将「macOS 首版」理解成所有硬体组合均已验证。
- 这不是全新实体 Mac 的 OS provisioning 测试；验证涵盖独立依赖安装与搬移后重建，不包含 Homebrew 本身安装。
- npm 安装回报 5 项 dependency audit 结果（1 low、2 moderate、2 high）。沿用固定的 Motion Canvas/Vite 相容组合，未执行强制 major 升级或宣称安全审查通过；开发伺服器仅供本机使用。

## 重跑

```bash
python3 "$PROJECT_ROOT/tools/smoke_test.py"
```

此测试在临时目录自行创建非人声讯号，结束即移除；不会呼叫 Qwen、改正式案件或加入参考语音。Motion Canvas 的实际渲染与视听验收仍依 skill 的视频及验收文件执行。
