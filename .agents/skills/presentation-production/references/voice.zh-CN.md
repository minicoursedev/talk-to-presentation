[繁體中文](voice.md) | [简体中文](voice.zh-CN.md) | [English](voice.en.md)

[数据存放规则](../../../../docs/DATA_LAYOUT.zh-CN.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路径均相对于用户数据根目录；`tools/`、`templates/` 与内置 `shared/styles/default/` 相对于能力根目录。 能力仓库只保存工具、skill、内置模板与中性示例。一般制作不得修改内置风格、示例或参考网站。用户录音、逐字稿、品牌、自定义风格、案例与输出都放在仓库外。

# 配音与时间轴

先依 project 的 `docs/SETUP.md` 安装 `.venv` 与下载指定 Qwen revision。macOS 首版使用 CPU/float32/eager；不假设 CUDA 或 MPS 可用。生成耗时依机器、文字与模型而异，不承诺固定速度。

参考 WAV 不随交接包提供。用户将音频文件放入 `shared/voice/reference-voice/`，档名、语气名、逐字稿须与该目录 README 表格完全一致。接手者可以修改表格，提供自己的语气，不限既有清单。只需备齐案件实际使用的语气。
本版工具要求单声道 PCM16 WAV。来源格式不同时另存副本：

```bash
ffmpeg -i "/absolute/path/reference.wav" -ac 1 -c:a pcm_s16le "$PRESENTATION_DATA_ROOT/shared/voice/reference-voice/平靜敘述.wav"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" check my-talk
```

缺少 WAV 或逐字稿时须停止并列出缺项，不使用其他人的声线替代。本文命令中的 my-talk 是案例 ID。

逐页确认主旁白、主语气、补背景旁白、背景语气，且获得生成授权后：

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" generate my-talk --kind main
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" generate my-talk --kind background
```

没有背景旁白时省略第二行。使用 `--pages 2 5` 只生成指定页；已存在音频文件默认拒绝覆写。只有用户要求重制时加 `--replace`，并先保留欲替换档的副本。没有指定页的 WAV 不改动。主／背景生成各自独立，不会合并或改写文稿。

画面文字换行不能成为 TTS 停顿指令。工具将输入空白折叠成一个空格，再以 OpenCC t2s 转换给模型；保留显示文稿与字幕的繁体中文。每个 WAV 旁的 JSON 记录实际单行输入、语气、模型 revision 与参考音频文件杂凑。沿用 WAV 时亦应保存这些记录；语音合成可能不是逐 byte 可重现。

逐页抽听文字、语气、停顿和结尾后，重建时间轴，不呼叫 Qwen：

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" timeline my-talk
```

此步使用 Python 标准库，验证 mono PCM16、非静音、非削波、相同 sample rate。主旁白和背景旁白间隔依案件 timing；每页长度由实际 WAV 对齐视频帧，尾段补齐到精确页面边界，避免跨页漂移。字幕分别对应主旁白和背景旁白，不用标题代替。

修改旁白、语气或 WAV 后要重新生成受影响段落，重建 timeline 和视频。prepare-motion 会拒绝来源／WAV 杂凑与 timeline 不符的状况。音频文件存在或技术检查通过不代表朗读已验收。

文件语言不会改变配音语言。现行生成脚本固定使用 `language="Chinese"`，不因阅读英文文件就改为英文配音；若需其他配音语言，须另行修改并验证生成流程。

## 沿用语气与调整语速

- 每次使用前读取实际语气 README，不假设档名必须是语气名称；例如编号 WAV 只要有明确的语气与逐字稿对照即可。若案件语气不在表内，先确认是否只是相同语气的改名；不能自行以其他情绪替换。原始录音与格式转换副本分开保存，不覆写唯一来源。
- 降低音量可避免输出碰到数值上限，无法修复原始音档已发生的削波。不得为了通过峰值检查就称为音质已修复；仍需抽听，必要时回报录音问题。
- 仅要求语速变更时，优先对保留的原速 WAV 做保音高时间伸缩，不重新合成文稿。先备份原速 WAV 与旁边的 JSON，另记来源 SHA-256、目标倍速及处理方式，避免重跑时在已加速档上再次加速。沿用 TTS 的文字／语气 provenance，不把后处理误标成新模型输出。
- 依处理后 WAV 重建时间轴、字幕、影片来源与成片；抽听变速后的停顿与结尾。每页原有进场／尾段停留未必同步缩短，因此总片长不一定是原片长除以倍速。将倍速记入案件决策，跨主题沿用需有使用者指示。

## 同一页的分段语气

需要在一页内改变语气时，在 `slides.json` 保留完整 `narration`，并增加 `narrationSegments`。所有段落的 `text` 依序连接必须与 `narration` 完全相同，包含标点与空白；每段 `tone` 都须存在于使用者语气表。分段时每段语气优先于页面 `tone`。

```json
{"page":1,"narration":"先说清楚问题。再说明方法。","narrationSegments":[{"text":"先说清楚问题。","tone":"平靜敘述"},{"text":"再说明方法。","tone":"平靜敘述"}]}
```

这只是栏位示例；使用者可以替换各段语气。省略 `narrationSegments` 时维持单段 `narration`／`tone`；空阵列或文字不一致会拒绝。`review-script.mjs` 同时呈现完整台词及每段语气，不维护第二份词稿。

- 单段音档是 `audio/main/page-1.wav`；分段改为 `audio/main/page-1-segment-1.wav`、`page-1-segment-2.wav`，每个 WAV 旁皆有同名 JSON provenance。
- `voice.py check` 检查所有段落，`generate --kind main --pages 1` 生成第 1 页的全部段落。已存在时，经授权备份后加 `--replace`；目前重制范围是页面，没有单一段落 CLI 选项。背景旁白仍用 `--kind background` 独立产生。
- `case.json.timing.narrationGapSeconds` 设定主旁白段落间隔；省略时沿用 `backgroundGapSeconds`。数值为非负秒数。主旁白至补充旁白仍用 `backgroundGapSeconds`。
- `timeline` 依段落顺序串接，逐段建立字幕，再追加补充旁白。只引用目前 schema 对应的档名，切换单段／分段后不会混用旧 WAV；来源 WAV 不被覆写。
- 修改文字、语气、分段或间隔后，重建受影响音档（仅间隔变更不需 TTS）、timeline、检阅页、prepare 及影片。输出前逐段抽听并核对字幕。
