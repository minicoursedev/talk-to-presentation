[繁體中文](REPRODUCIBILITY.md) | [简体中文](REPRODUCIBILITY.zh-CN.md) | [English](REPRODUCIBILITY.en.md)

# 验证可重建与可重用

每次能力交付要区分来源检查、干净依赖安装、实际配音汇出与人类视听验收。保留本次版本、命令、工具版本及结果；历史影片不算新版本的验证。

依修改范围选择验证：纯文件校稿检查三语、连结与命令；案件模板变更另以新案件检查复制后内容；工具变更跑对应回归；依赖或完整产制流程变更再做下方独立安装与端到端验证。历史实测保留原日期与版本，文件更新不等于重新执行配音或渲染。

## 快速回归

```bash
node "$PROJECT_ROOT/tools/presentation.mjs" check
```
统一入口包含 Node 测试、三语文档检查与隔离 smoke test。来源验证、精确重建与既有 HTML 保护的回归一并执行；用法见[操作契约](OPERATIONS.zh-CN.md)。


smoke test 在含空格及中文的临时目录解压原始码，使用另一个资料根目录，从无关 cwd 执行工具。它检查两种 HTML、用途品牌色与旧栏位相容、台词检阅、分段音讯／字幕／间隔、来源音档不变、过期语气拒绝及路径边界；不呼叫 Qwen，不安装依赖，不渲染影片。

## 独立安装

`REBUILD_ROOT` 是自行选择的全新验证目录，位于原能力仓库外；不要使用正式案件目录。先[检查既有系统工具](SETUP.zh-CN.md)，沿用符合范围的 Node、Python、FFmpeg、SoX。以下命令会安装新的 node_modules 与 venv，不沿用原能力目录的连结。

```bash
REBUILD_ROOT="/absolute/path/to/rebuild 测试"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/package.py" "$REBUILD_ROOT/source.zip"
python3 -m zipfile -e "$REBUILD_ROOT/source.zip" "$REBUILD_ROOT"
PROJECT_ROOT="$REBUILD_ROOT/public"
export PRESENTATION_DATA_ROOT="$REBUILD_ROOT/user data"
# If using an existing Chrome, also set BROWSER_EXECUTABLE as described in SETUP.
bash "$PROJECT_ROOT/tools/setup-macos.sh"
(cd "$PROJECT_ROOT" && shasum -a 256 -c MANIFEST.sha256)
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/init_case.py" rebuild-proof --title "Rebuild proof"
```

在测试资料目录设定自己的 brand.json；配色契约见[工作流程](../.agents/skills/presentation-production/references/workflow.zh-CN.md)。可先修改测试案件的 slides.json，使第一页使用分段语气，以涵盖多段流程；确保完整 narration 等于每段文字的连接。

## 真实旁白至 MP4

先提供测试案件所需的参考 WAV 与逐字稿，放在这份独立资料目录的 `shared/voice/reference-voice/`；档案须符合[配音契约](../.agents/skills/presentation-production/references/voice.zh-CN.md)。模型用 `download_model.py` 取得 model.json 指定 revision。若已有同版本模型，可复制完整 models/qwen3-tts（含 download-source.json），核对 provenance 与逐档 SHA-256，记录为「沿用已验证模型」，不宣称测试了重新下载。

下列 generate 会实际合成新的测试旁白，须有使用者授权；补充旁白存在时另外执行 `generate rebuild-proof --kind background`。

```bash
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" check rebuild-proof
node "$PROJECT_ROOT/tools/review-script.mjs" rebuild-proof
node "$PROJECT_ROOT/tools/takahashi-html/build.mjs" rebuild-proof
node "$PROJECT_ROOT/tools/visual-html/build.mjs" rebuild-proof
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" generate rebuild-proof --kind main
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/voice.py" timeline rebuild-proof
node "$PROJECT_ROOT/tools/prepare-motion.mjs" rebuild-proof
node "$PROJECT_ROOT/tools/motion.mjs" build rebuild-proof
node "$PROJECT_ROOT/tools/render-video.mjs" rebuild-proof
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/finish_video.py" rebuild-proof "$PRESENTATION_DATA_ROOT/cases/rebuild-proof/motion/output/presentation.mp4"
"$PROJECT_ROOT/.venv/bin/python" "$PROJECT_ROOT/tools/verify_video.py" rebuild-proof
```

在[验收](../.agents/skills/presentation-production/references/acceptance.zh-CN.md)要求的首帧、每个换页交界与尾帧查看实际成片；抽听各段与字幕核对。记录独立安装是否成功、模型与参考声音来源、影格与时长、输出杂凑、已看／已听范围。未抽听时只回报技术通过，不能写成配音品质已验收。实测记录见[VERIFICATION](VERIFICATION.zh-CN.md)。

## 版本交付

来源、skill、三语文件与回归测试一起纳入版本；使用者资料、模型、参考录音及验证媒体保留在资料目录。package.py 每次打包都重新产生 MANIFEST.sha256。若维护仓库根目录的 manifest，从本次 ZIP 的 public/MANIFEST.sha256 同步，避免沿用旧清单。

交付注明 commit 及 ZIP 杂凑。要让其他人 git clone 取得更新，还须完成要求的 push 并核对远端 commit；本机修改或本机 commit 不等于远端已更新。更换硬体、浏览器或依赖版本后应重跑相同验证，不承诺语音逐 byte 或跨机器画面逐像素相同。
