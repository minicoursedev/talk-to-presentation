[繁體中文](VERIFICATION.md) | [简体中文](VERIFICATION.zh-CN.md) | [English](VERIFICATION.en.md)

[数据存放规则](DATA_LAYOUT.zh-CN.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路径均相对于用户数据根目录；`tools/`、`templates/` 与内置 `shared/styles/default/` 相对于能力根目录。 能力仓库只保存工具、skill、内置模板与中性示例。一般制作不得修改内置风格、示例或参考网站。用户录音、逐字稿、品牌、自定义风格、案例与输出都放在仓库外。

# 本次交接包验证

## 2026-09-23：专案操作入口与依赖判断

- 新增共用来源验证器，Python 与 Node 制作工具使用同一套检查。当次工作区可见的八个案件均通过唯读来源及图片引用检查；未改写既有案件或生成个案旁白。
- 统一入口提供 validate、status、plan、rebuild、check。7 项 Node 测试通过，涵盖唯读查询、未知栏位保留、既有 HTML 保护、台词／语气不符拒绝、来源 WAV 不变、新／旧时间轴相容、WAV 变更拒绝，以及不同来源变更的重建范围。
- 三语文件检查（19 组／57 份）、skill 格式验证与隔离封装 smoke test 通过；后者从含空格／中文的路径及无关 cwd 执行，未安装新依赖。
- 另在仓库外临时目录，以既有 Chrome、Node、Python 与 Canvas Commons 依赖，从 /private/tmp 执行完整统一影片流程。使用两段合成测试音，产生 360×640、30 fps、24 帧、0.800 秒 H.264／AAC／mov_text MP4，通过 ffprobe 与完整解码。
- 实际验证首次影片重建、无变更时沿用、只改画面后保留时间轴 WAV 杂凑、静音 preview，以及切回正式音讯模式。Canvas Commons 自动存回 `.meta` 的格式差异不再造成过期误判。

范围：这次验证工具操作与技术输出，未重新安装完整环境、未呼叫 Qwen、未做人类视觉或听觉验收。生成纪录只能证明已追踪档案的一致性；案件决策仍以 `content/draft.md` 为准。操作契约见 [OPERATIONS](OPERATIONS.zh-CN.md)。

## 2026-09-22：独立安装与真实旁白重建

本次验证使用仓库外、含中文与空格的独立目录，从 /private/tmp 呼叫打包后的工具。测试用两页中性内容，第一页包含两种语气的两个 narrationSegments，第二页使用单段主旁白；品牌色换成红／青绿组合。原案件与使用者品牌未修改。

- 在同一台 macOS 26.6.2 Apple Silicon，以现有 Node 26.7.0、Python 3.12.14、FFmpeg 9.0.1、SoX、Chrome 153.0.8010.53 执行完整 setup-macos.sh。npm ci（含安装脚本）与 Python lockfile 安装成功，使用新建 node_modules 与 .venv；没有连结原能力环境。Canvas Commons 与 exporter 维持 0.3.1，exporter 使用 FFmpeg 6.1.1。
- 从已存在的本机模型复制完整目录，核对 model.json／download-source.json 及 14 个模型档案 SHA-256；revision 为 fd4b254389122332181a7c3db7f27e918eec64e3。这是模型沿用与离线推论验证，未重新下载权重。
- 两份使用者参考声音只复制到测试资料目录。立体声录音另存 mono PCM16 副本，原录音不变。voice.py check 通过，独立 .venv 的 Qwen 以 CPU/float32/eager 实际生成三个新 WAV；每个 WAV 有文字、语气、revision、参考声音杂凑记录。
- 台词检阅、两种 HTML、分段时间轴／三段字幕、prepare、TypeScript/Vite build、命令列 Canvas Commons FFmpeg exporter、封装及完整解码通过。
- 最终测试片：1080×1920、30 fps、231 帧、7.700 秒；H.264、AAC、mov_text。首帧、159／160／161 换页交界及第 230 尾帧实际查看，品牌与文字可见，没有空白交界。
- AAC 解码回 24 kHz 后，来源与输出同为 184800 个取样，相关系数 0.99832。这验证音讯传递，不等于已抽听文字与语气；本次未做人类听觉验收。
- 用另一个短案例验证静音 preview、音讯模式不符拒绝、场景故意抛出错误时非零结束。错误测试不改正式案件；新工具不把渲染失败回报成成功。
- 4 项 Node 测试、三语文件检查（18 组／54 份）、skill quick_validate 与隔离 smoke test 通过。回归涵盖用途色栏位／旧栏位相容、分段语气和停顿、逐段字幕、原 WAV 不变、过期语气拒绝、台词检阅与资料路径边界。台词检阅的 macOS 路径别名问题亦由 smoke test 重现并修正。

最终测试片 SHA-256：`03825c3f300e429474e51d24f6f924305dccd26b28f46a84e1f60b2e222ad8a4`。音档、模型、MP4、测试日志与检查图保存在外部资料目录，不放入能力仓库或来源交接包。重跑方式见[可重建验证](REPRODUCIBILITY.zh-CN.md)。

范围：这是同一台 Mac 上的干净依赖安装与实际旁白成片重建，没有验证全新实体 Mac、Homebrew 安装、Intel、其他作业系统、其他 Node 版本或 Playwright 配套 Chromium。系统工具与 Chrome 沿用既有安装；语音自然度仍需人类抽听。

## 2026-09-21 历史验证

日期：2026-09-21。这是交接工具的技术验证，不是任何正式演示文稿的内容或配音验收。

## Canvas Commons 0.3.1 迁移验证

目前交接包使用 Canvas Commons 0.3.1（core、2d、editor、Vite plugin、FFmpeg exporter），搭配 Vite 4.5.14、TypeScript 5.2.2 与 Playwright 1.58.2。套件使用 ESM，project 已设置 `type: module`，并补入上游类型声明所需的 `@types/chroma-js` 3.1.2。

本次在同一台 Apple Silicon Mac、Node 26.7.0 与既有 Chrome 验证；此历史记录当时尚推荐 Node 22；目前安装指引已改为沿用符合 >= 20.19.0 的已有版本。Qwen 模型、语音生成脚本、内容来源与两种 HTML 生成器未变更。

- 新版完整 npm 安装与 exporter 的 FFmpeg 6.1.1／ffprobe 二进制下载成功。迁移后的锁定文件检查使用 `npm ci --ignore-scripts`，另验证两种 HTML、Chrome 截图与 TypeScript/Vite 编译；迁移目录不重复下载二进制，因此不把该次检查列为完整安装脚本验证。
- 本次 npm 安装回报 7 项依赖 audit 结果（2 low、2 moderate、3 high）；未执行强制升级或宣称安全审查通过。开发服务器只绑定本机。
- 无 WAV 的 sample 亦完成静音 exporter 渲染：180 帧、6.000 秒；没有 audio stream，完整解码通过。
- 两种 HTML、sample 与新案件的 TypeScript/Vite 编译、Canvas Commons 编辑器加载通过。
- 实际 FFmpeg exporter 渲染与字幕封装通过：1080×1920、30fps、126 帧、4.200 秒，H.264、AAC 与 mov_text。完整解码通过，音轨长度为 4.200 秒。
- 迁移时修正 range：新 exporter 以结束时间减开始时间限制 MP4 时长；沿用旧版的“减一帧”会少一帧。现在使用总帧数／fps。
- 实际查看新影片第 0、65、66、67、125 帧：品牌与内容首帧可见，第 65 帧为第一页，第 66 帧为第二页，无空白；文字与原 HTML 构图一致。
- 使用三段临时合成音（主／背景分开），解码后与原时间轴的 PCM 相关系数为 0.99999，两者皆为 100800 个 24kHz 采样。这只验证音频传递，不代表真人朗读与语气已试听；未调用 Qwen。

本次测试 MP4 SHA-256：`ba57fd4a52452bb49b9f62dc8db63b90e18a3b1d270995e3f08b527460e7052e`。测试 WAV 与 MP4 不收入 ZIP。

下方保留迁移前记录，历史 Motion Canvas 成果不作为新引擎的渲染证据。

## 迁移前的历史验证（Motion Canvas）

### 实测环境

- macOS 26.6.2（25G83）、Apple Silicon arm64。
- Node 26.7.0；Python 3.12.14 的独立虚拟环境。
- Motion Canvas 3.17.2、FFmpeg exporter 1.1.1、Vite 4.5.14。
- Playwright 1.58.2 搭配本机 Google Chrome；Chromium 自动下载完成后解压缩停滞，已停止该安装程序，改走文件中的 `BROWSER_EXECUTABLE` 方式。没有把自动下载路径列为已通过。
- 系统 FFmpeg 9.0.1；exporter 使用 npm 软件包带入的 FFmpeg。

### 已完成

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

### 尚未验证／接手者必要输入

- 不附参考 WAV，未执行真人声线 Qwen 推论，也未做真人旁白抽听。需要用户提供参考 WAV、对应逐字稿与明确生成授权后，依配音流程验收。
- 品牌 Logo 由用户提供；中性示例默认只显示文字品牌。
- Intel Mac、其他 macOS 版本、Node 22 与 Playwright 配套 Chromium 在本次未完成实测。不要将「macOS 首版」理解成所有硬体组合均已验证。
- 这不是全新实体 Mac 的 OS provisioning 测试；验证涵盖独立依赖安装与搬移后重建，不包含 Homebrew 本身安装。
- npm 安装回报 5 项 dependency audit 结果（1 low、2 moderate、2 high）。沿用固定的 Motion Canvas/Vite 相容组合，未执行强制 major 升级或宣称安全审查通过；开发伺服器仅供本机使用。

### 重跑

```bash
python3 "$PROJECT_ROOT/tools/smoke_test.py"
```

此测试在临时目录自行创建非人声讯号，结束即移除；不会呼叫 Qwen、改正式案件或加入参考语音。Motion Canvas 的实际渲染与视听验收仍依 skill 的视频及验收文件执行。

2026-09-21 数据分离验证：通过三语文档与 skill 检查、隔离打包／两种 HTML／时间轴测试、仓库内容哈希不变检查，以及仓库内路径、越界输出与符号链接拒绝测试。仓库外案例完成两页静音截图及 TypeScript／Vite 构建。本次未生成真人配音或渲染最终 MP4，已有个人数据未搬移。
