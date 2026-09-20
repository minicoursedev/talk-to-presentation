[繁體中文](voice.md) | [简体中文](voice.zh-CN.md) | [English](voice.en.md)

# 配音与时间轴

先依 project 的 `docs/SETUP.md` 安装 `.venv` 与下载指定 Qwen revision。macOS 首版使用 CPU/float32/eager；不假设 CUDA 或 MPS 可用。生成耗时依机器、文字与模型而异，不承诺固定速度。

参考 WAV 不随交接包提供。用户将音频文件放入 `shared/voice/reference-voice/`，档名、语气名、逐字稿须与该目录 README 表格完全一致。接手者可以修改表格，提供自己的语气，不限既有清单。只需备齐案件实际使用的语气。
本版工具要求单声道 PCM16 WAV。来源格式不同时另存副本：

```bash
ffmpeg -i "/absolute/path/reference.wav" -ac 1 -c:a pcm_s16le "$PROJECT_ROOT/shared/voice/reference-voice/平靜敘述.wav"
python3 "$PROJECT_ROOT/tools/voice.py" check my-talk
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
python3 "$PROJECT_ROOT/tools/voice.py" timeline my-talk
```

此步使用 Python 标准库，验证 mono PCM16、非静音、非削波、相同 sample rate。主旁白和背景旁白间隔依案件 timing；每页长度由实际 WAV 对齐视频帧，尾段补齐到精确页面边界，避免跨页漂移。字幕分别对应主旁白和背景旁白，不用标题代替。

修改旁白、语气或 WAV 后要重新生成受影响段落，重建 timeline 和视频。prepare-motion 会拒绝来源／WAV 杂凑与 timeline 不符的状况。音频文件存在或技术检查通过不代表朗读已验收。

文件语言不会改变配音语言。现行生成脚本固定使用 `language="Chinese"`，不因阅读英文文件就改为英文配音；若需其他配音语言，须另行修改并验证生成流程。
