# AI成熟度量表

「AI成熟度量表」的前版：一份 19 題的問卷（12 題公司基本資料 + 17 題正式評分題 + 2 題結尾調查），依五大構面加權計分，產出成熟度等級與診斷報告。純前端專案，不需要後端或資料庫，作答資料只存在使用者瀏覽器的 `localStorage`，結果則透過網址參數編碼分享。

> 計分公式是依原站測試結果逆向工程還原的，並非官方公開資料，細節與已知的不確定範圍記錄在 [`src/lib/scoring`](src/lib/scoring) 各檔案的註解中。

## 功能

- **問卷填答**：公司基本資料 → 五大構面（數據與基礎設施／投入資源／策略規劃／應用落地／數位轉型效益）→ 結尾調查，逐頁作答並即時存檔，可上一步修改。
- **必填驗證**：所有欄位／題目皆為必填，未填或格式錯誤（統一編號、E-mail、電話）會即時顯示錯誤訊息。
- **成熟度計分**：依單題 → 構面 → 加權總分計算，對應到四個成熟度等級（Unknowing／Conscious／Ready／Scaling AI）。
- **結果頁**：等級橫幅（依等級變色）、整體評語、雷達圖＋五大構面數據、構面說明、策略建議。
- **評分說明頁**：公開呈現五大構面權重、計分方式與四個等級的分數區間。
- **匯出 Word 報告**：在瀏覽器端組出包含公司資訊、等級、雷達圖、逐題作答清單的 `.docx` 診斷報告（不經過任何伺服器）。

## 技術棧

- [Next.js](https://nextjs.org) 16（App Router + Turbopack）／React 19／TypeScript
- Tailwind CSS v4
- [Recharts](https://recharts.org)：結果頁雷達圖
- [docx](https://www.npmjs.com/package/docx)：瀏覽器端產生 Word 報告

## 開始使用

```bash
npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

其他指令：

```bash
npm run build   # 正式建置（含 TypeScript 型別檢查）
npm run start   # 啟動建置後的正式伺服器
npm run lint    # ESLint
```

## 專案結構

```
src/
  app/
    page.tsx                 首頁
    scoring/page.tsx          評分說明頁
    quiz/[step]/page.tsx      問卷各步驟（0=公司資料，1-5=五大構面，6=結尾兩題）
    result/[code]/page.tsx    結果頁
  components/
    quiz/                     問卷相關元件（表單、題目、驗證錯誤顯示）
    result/                   結果頁相關元件（雷達圖、構面明細、構面說明）
  lib/
    scoring/                  題目定義、計分引擎、等級／構面設定、等級評語
    quiz-store.tsx            問卷狀態（React Context + localStorage 持久化）
    validation.ts             必填／格式驗證規則
    answer-codec.ts           作答結果編碼進結果頁網址
    export-docx.ts            匯出 Word 報告
    svg-to-png.ts             把雷達圖 SVG 轉成 PNG，嵌入 Word 報告
```

## 已知限制

部分題目的選項配分是依測試資料內插估算，尚未逐一實測校正；相關假設都在 [`src/lib/scoring/questions.ts`](src/lib/scoring/questions.ts) 與 [`src/lib/scoring/curve.ts`](src/lib/scoring/curve.ts) 的註解中註明。
