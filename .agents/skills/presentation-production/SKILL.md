---
name: presentation-production
description: Create and revise a presentation from human discussion into Takahashi HTML, illustrated HTML, and a narrated Motion Canvas MP4 using the accompanying portable macOS project. Use for content, narration, illustration, animation, rebuilding, and output verification.
---

# 簡報與旁白影片製作

本 skill 與交接 project 一起使用；不綁定品牌或說話者。單獨安裝 skill 不會安裝 Qwen、Motion Canvas 或專案工具。

## 開始

1. 找到使用者指定 project 的 `AGENTS.md`、`README.md`、`brand.json`，並以絕對路徑設置 `PROJECT_ROOT`。搬移後重新設定，不沿用其他人的本機路徑。
2. 先讀 [工作流程](references/workflow.md)，環境未建立時讀 [macOS 安裝](../../../docs/SETUP.md)。
3. 讀指定案件的 `case.json`、`content/draft.md`、`content/slides.json`；新案件用 project 的 `tools/init_case.py`，不手動複製舊案件依賴。

## 核心規則

- 對話形成主題；畫面文字、主旁白、補背景旁白、語氣、插圖與動畫是分開的決策。只改使用者指定項目。
- 修改主題、頁序或畫面文字時，先重建高橋流 HTML，以本機 HTTP 預覽交人確認；確認前不生成下游插圖、語音或影片。範例的技術測試不等於正式案件內容確稿。
- 延續已有確認與執行授權，不因換 task 重設全部關卡。記錄確認於 `draft.md`，但以最新指示為準。
- 旁白文字確認不等於執行 TTS；只有明確要求生成／重製語音才執行。一般重建使用既有 WAV。
- 品牌名稱和 Logo 都由 `brand.json` 決定。Logo 未設定時，中性範例顯示品牌文字；正式交付使用接手者確認的品牌設定。
- HTML 與影片不直接修改 `dist/`。來源是 slides、資產和場景；美化 HTML 可作影片構圖比對基準。
- 呼叫 scripts 時使用由 `PROJECT_ROOT` 組成的絕對路徑，不寫死安裝位置。

## 按任務閱讀

- 新案件、schema、重建命令：[工作流程](references/workflow.md)。
- 文稿、Qwen、參考語音、WAV、時間軸與字幕：[配音](references/voice.md)。
- 插圖及圖片修改：[圖片](references/images.md)。
- Motion Canvas、構圖與渲染：[影片](references/video.md)。
- 交付前：[驗收](references/acceptance.md)。

改語音只重建相關音檔、時間軸、字幕及影片；改插圖重建美化 HTML 與影片；改動畫只重建影片；改品牌重建兩種 HTML 與影片。未指定頁面的已確認 WAV 不應改變。
