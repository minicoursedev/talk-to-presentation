[繁體中文](DATA_LAYOUT.md) | [简体中文](DATA_LAYOUT.zh-CN.md) | [English](DATA_LAYOUT.en.md)

# 数据存放规则

能力仓库只保存工具、skill、内置模板与中性示例。一般制作不得修改内置风格、示例或参考网站。用户录音、逐字稿、品牌、自定义风格、案例与输出都放在仓库外。

默认为能力仓库旁的 `presentations/`；可用 `PRESENTATION_DATA_ROOT` 指定独立的绝对路径。路径不得位于能力仓库内，也不得包含能力仓库。首次使用先执行：

```sh
export PRESENTATION_DATA_ROOT="$(.venv/bin/python tools/init_data.py)"
.venv/bin/python tools/init_case.py my-talk
```

所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路径均相对于用户数据根目录；`tools/`、`templates/` 与内置 `shared/styles/default/` 相对于能力根目录。

```text
<data-root>/
  brand.json
  shared/brand/
  shared/styles/default/
  shared/voice/reference-voice/README.md
  shared/voice/reference-voice/*.wav
  models/
  cases/<id>/content/
  cases/<id>/assets/
  cases/<id>/audio/
  cases/<id>/dist/
  cases/<id>/motion/
  cases/<id>/verification/
```

如要更换核心风格，先复制内置 `shared/styles/default/` 到数据根目录的同名目录，再修改自己的副本。新案例保存模板快照，已有案例不会自动改变。

现存于能力仓库的用户数据不会自动搬移、删除或作为备用输入。迁移时先复制到数据根目录、验证完整性，再另行处理旧文件。仅加入 .gitignore 并不等于数据已分离。
