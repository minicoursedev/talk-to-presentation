[繁體中文](DATA_LAYOUT.md) | [简体中文](DATA_LAYOUT.zh-CN.md) | [English](DATA_LAYOUT.en.md)

# 資料存放規則

能力倉庫只保存工具、skill、內建樣板與中性範例。一般製作不得修改內建風格、範例或參考網站。使用者錄音、逐字稿、品牌、自訂風格、案件與輸出都放在倉庫外。

預設為能力倉庫旁的 `presentations/`；可用 `PRESENTATION_DATA_ROOT` 指定任何獨立的絕對路徑。路徑不得位於能力倉庫內，也不得包含能力倉庫。首次使用先執行：

```sh
export PRESENTATION_DATA_ROOT="$(.venv/bin/python tools/init_data.py)"
.venv/bin/python tools/init_case.py my-talk
```

所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路徑均相對於使用者資料根目錄；`tools/`、`templates/` 與內建 `shared/styles/default/` 相對於能力根目錄。

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

如要更換核心風格，先複製內建 `shared/styles/default/` 到資料根目錄的同名目錄，再修改自己的副本。新案件保存樣板快照，既有案件不會自動改變。

現存於能力倉庫的使用者資料不會自動搬移、刪除或當成備援輸入。遷移時先複製到資料根目錄、驗證完整性，再另行處理舊檔。僅加入 .gitignore 並不等於資料已分離。
