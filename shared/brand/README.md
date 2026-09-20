[繁體中文](README.md) | [简体中文](README.zh-CN.md) | [English](README.en.md)

# 使用自己的品牌

本包不附 Logo。將你的 Logo 放在此目錄，然後修改 project 根目錄的 `brand.json`：

```json
{"name":"你的品牌","logo":"shared/brand/logo.svg"}
```

`logo` 是相對交接 project 的路徑，腳本解析為執行用路徑；不要填原作者機器的絕對路徑。
SVG、PNG 等瀏覽器可載入的格式皆可。圖片內容由使用者提供。`logo: null` 顯示品牌名稱文字，適用中性最小範例。
修改後重建兩種 HTML、prepare-motion 與影片；不重製聲音。
