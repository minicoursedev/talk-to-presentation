[繁體中文](README.md) | [简体中文](README.zh-CN.md) | [English](README.en.md)

[資料存放規則](../../docs/DATA_LAYOUT.md)：所有 `cases/`、`shared/voice/`、`models/` 及使用中的 `brand.json` 路徑均相對於使用者資料根目錄；`tools/`、`templates/` 與內建 `shared/styles/default/` 相對於能力根目錄。 能力倉庫只保存工具、skill、內建樣板與中性範例。一般製作不得修改內建風格、範例或參考網站。使用者錄音、逐字稿、品牌、自訂風格、案件與輸出都放在倉庫外。

# 使用自己的品牌

先依[資料存放規則](../../docs/DATA_LAYOUT.md)初始化使用者資料目錄。將 Logo 放到 `$PRESENTATION_DATA_ROOT/shared/brand/`，再編輯 `$PRESENTATION_DATA_ROOT/brand.json`；本文件所在的能力倉庫不存放使用者品牌素材。

```json
{"name":"你的品牌","logo":"shared/brand/logo.svg"}
```

`logo` 相對於使用者資料根目錄，支援 SVG、PNG 等瀏覽器可載入的格式。`logo: null` 顯示品牌名稱文字。配色欄位與相容規則見[工作流程](../../.agents/skills/presentation-production/references/workflow.md)。

修改品牌後重建兩種 HTML、prepare 與影片，沿用既有旁白。
