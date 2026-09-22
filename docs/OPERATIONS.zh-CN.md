[繁體中文](OPERATIONS.md) | [简体中文](OPERATIONS.zh-CN.md) | [English](OPERATIONS.en.md)

# 专案操作与重建契约

`talk-to-presentation` 是通用简报制作专案。README 提供定位与入门，制作 skill 指引 AI 的工作方式，本文件定义统一工具入口与状态语意。题材、故事、授权及验收决策仍记在各案 `content/draft.md`；产生的状态报告不取代这些决策。

## 统一入口

`PROJECT_ROOT` 是本专案的实际绝对路径；案件仍由仓库外的 `PRESENTATION_DATA_ROOT` 解析。以下命令可从任意工作目录执行：

```bash
node "$PROJECT_ROOT/tools/presentation.mjs" validate my-talk
node "$PROJECT_ROOT/tools/presentation.mjs" status my-talk --json
node "$PROJECT_ROOT/tools/presentation.mjs" plan my-talk --target video
node "$PROJECT_ROOT/tools/presentation.mjs" rebuild my-talk --target video
node "$PROJECT_ROOT/tools/presentation.mjs" check
```

- `validate`：检查来源格式、路径、品牌设定及图片引用。未提供配音不阻挡内容工作；图片存在不代表视觉验收。
- `status`：唯读汇整各阶段的生成纪录、来源与产物杂凑，以及缺少或与台词不符的 WAV。
- `plan`：唯读列出指定目标需要重建或可沿用的阶段，以及阻挡原因。
- `rebuild`：依序执行必要阶段，沿用仍有效的结果；失败即停止。只使用既有 WAV 与图片，不呼叫 TTS 或制图。
- `check`：执行 Node 测试、三语文件检查与隔离 smoke test；不安装依赖、不渲染影片、不宣称视听验收。也可在专案目录执行 `npm test`。

| target | 执行范围 |
| --- | --- |
| `review` | 台词检阅 |
| `text` | 台词检阅与高桥流 HTML，无需图片或配音 |
| `html` | 台词检阅、高桥流与美化 HTML |
| `timeline` | 既有 WAV 的时间轴、组合音轨与字幕 |
| `preview` | 台词检阅、美化 HTML、撷取、Canvas Commons build／静音汇出、技术验证 |
| `video` | 台词检阅、美化 HTML、时间轴、撷取、Canvas Commons build／含音讯汇出、字幕封装与技术验证 |

Python 优先使用专案 `.venv/bin/python`，没有时使用 `python3`；可用 `PRESENTATION_PYTHON` 指定执行档。浏览器沿用 `BROWSER_EXECUTABLE` 设定。完整安装见 [SETUP](SETUP.zh-CN.md)。

## 来源契约

[contract.mjs](../tools/contract.mjs) 是共用的可执行验证器。Node 制作工具直接呼叫；Python 的 `common.load` 呼叫相同的 Node 验证器，因此 Python 制作指令也需要已安装 Node。没有增加第三方套件。

验证涵盖唯一正整数页码、画幅与 fps、非负的影格与间隔设定、画面文字／文字片段、台词与语气型别、分段台词完整串接、输出与图片路径。栏位错误会指出如 `slides[0].page` 的位置。保留未知栏位，允许案件自订动画与记录；不把栏位存在视为内容确认。各栏位用途见[工作流程](../.agents/skills/presentation-production/references/workflow.zh-CN.md)。

## 变更与重建

- 画面文字／图片修改：影响对应的检阅或 HTML 与下游影片；沿用时间轴与旁白 WAV。
- 品牌／画幅修改：影响 HTML 与影片；不因尺寸改变而重制旁白或时间轴。
- 台词／语气／分段修改：先依既有授权处理受影响 WAV；来源纪录与台词或语气不符时，重建会停止并指出范围。
- WAV／页序／fps／停顿修改：重建时间轴及影片，不自动呼叫 TTS。
- 自订场景修改：重建影片，保留案件 `motion/src/`。

新版 `timeline.json.narrationSource` 只追踪会影响旁白与时间轴的来源。旧时间轴仍支援原始完整来源杂凑；旧来源有变时，用既有 WAV 执行一次 `voice.py timeline` 即可升级，不需搬移或重制声音。

统一入口在成功后将生成证据写入案件 `verification/build/`，记录工具／输入指纹与产物 SHA-256。它可重建，不是第二份来源。原有个别指令仍可使用，但不会补写此纪录；直接修改或重建的结果需要重新判断，不会因档案存在就标成最新。


Canvas Commons 的 `.meta` 文件以排序后的 JSON 内容计算指纹（`json:` 前缀），忽略重新保存造成的空白格式差异；设置值变更仍会失效。其余文件以原始字节 SHA-256 比对。

| 状态 | 意义 |
| --- | --- |
| `current` | 已追踪的输入、工具、产物与上游纪录相符 |
| `stale` | 输入、工具、产物或上游状态改变 |
| `missing` | 缺少产物 |
| `untracked` | 产物存在但没有生成纪录，无法确定是否对应目前来源 |
| `unavailable` | 未设定该输出 |
| `external` | 明确选择使用案件另行维护的 HTML，来源同步由案件流程确认 |

`current` 只描述已追踪档案的一致性，不等于台词已确认、视觉或听觉已验收。自订场景若另读未追踪的外部资源，仍需依案件流程检查。缺少生成来源纪录的旧 WAV 可沿用，其台词对应与听感仍须审核。

## 保护既有 HTML

汇入 HTML、没有生成纪录的既有 HTML，或生成后被另行修改的 HTML，都不会被统一入口直接覆写。先查看案件的原始制作方式，再选择：

```bash
# 沿用另行维护且已核对的美化 HTML，继续制作影片。
node "$PROJECT_ROOT/tools/presentation.mjs" rebuild my-talk --target video --use-existing-html
# 明确选择以内建产生器重建 HTML，会覆写既有版面。
node "$PROJECT_ROOT/tools/presentation.mjs" rebuild my-talk --target html --replace-html
```

这两个选项不能并用。`--use-existing-html` 不宣称 HTML 与 `slides.json` 已同步，也不代表该案件的内容或视听验收完成。使用者既有授权持续有效，选项用来表达工具要采取的操作，不增加重复确认关卡。

实际产出验收见[验收指引](../.agents/skills/presentation-production/references/acceptance.zh-CN.md)，重建测试见[可重建验证](REPRODUCIBILITY.zh-CN.md)。
