# 企業成熟度診斷問卷

身心障礙社創／社福單位用的組織能力自我評估問卷：20 題（五大構面各 4 題，1～5 分 Likert 量表）＋公司基本資料，依構面加權計分，產出成熟度等級、雷達圖與診斷報告。支援**前測／後測**兩輪施測與比較，並可在測驗完成後自動把報告寄到填答者信箱。

## 功能

- **前測／後測雙入口**：首頁分「開始前測」「開始後測」。後測流程在填完公司資料後多一步「上傳前測 Word 報告」——系統會自動解析該檔案取回前測作答內容，不需要資料庫或帳號登入。
- **問卷填答**：公司基本資料（7 個欄位，目前皆為選填，方便測試）→ 五大構面（組織能力／服務能力／商業模式／數位能力／永續能力）逐頁作答，可上一步修改。
- **成熟度計分**：構面分數＝該構面 4 題換算成 0～100 分後的平均值；加權分數＝五個構面依權重（目前皆為 20%）加總，對應四個等級（萌芽期／發展期／成長期／成熟期）。詳見 [`src/lib/scoring`](src/lib/scoring)。
- **結果頁**：等級橫幅（依等級變色）＋動態評語（自動點名本次分數最低的 1～2 個構面）、雷達圖＋五大構面數據、構面說明、建議行動。後測結果會疊加前測雷達圖、顯示前測後測比較彙總（最大進步構面／仍待強化構面）。
- **評分說明頁**：公開呈現五大構面權重、計分方式與四個等級的分數區間。
- **匯出 Word 報告**：在瀏覽器端組出包含公司資訊、等級、雷達圖、逐題作答清單的 `.docx` 診斷報告；報告最下方會嵌入一行極小的系統比對代碼，供後測上傳時自動比對前測資料用。
- **自動寄送報告**：測驗一送出、結果頁一載入，若公司資料頁有填 email，系統會在伺服器端重新產生同一份報告並透過 SMTP 自動寄出，畫面上會顯示寄送中／已寄送／失敗的狀態（同一份結果連結重整頁面不會重複寄送）。

## 技術棧

- [Next.js](https://nextjs.org) 16（App Router + Turbopack）／React 19／TypeScript
- Tailwind CSS v4
- [Recharts](https://recharts.org)：結果頁雷達圖（支援前測／後測雙系列疊圖）
- [docx](https://www.npmjs.com/package/docx)：組出 Word 報告，前端下載與後端寄信共用同一套產生邏輯
- [jszip](https://www.npmjs.com/package/jszip)：後測上傳前測 `.docx` 時，從檔案裡解析出嵌入的比對代碼
- [nodemailer](https://www.npmjs.com/package/nodemailer)：透過 SMTP 自動寄送報告（`src/app/api/send-report`，唯一的伺服器端邏輯）

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

### 設定自動寄信（選用）

複製 [`.env.local.example`](.env.local.example) 為 `.env.local`，填入 SMTP 帳密：

```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

`SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` 三個沒填的話，系統會安靜略過自動寄信（不影響看結果、下載報告）。部署到正式環境時，要另外在該平台的環境變數設定頁面填一次，`.env.local` 只有本機看得到、也不會被 git 提交。

## 專案結構

```
src/
  app/
    page.tsx                       首頁（前測／後測／評分說明三個入口）
    scoring/page.tsx                評分說明頁
    quiz/[mode]/[step]/page.tsx     問卷各步驟；mode=pre｜post，pre 沒有上傳前測報告那一步
    result/[code]/page.tsx          結果頁（依網址參數 mode=post 判斷是否為後測比較畫面）
    api/send-report/route.ts        唯一的伺服器端 API：組報告 + 寄信
  components/
    quiz/                          問卷相關元件（公司資料表單、題目、前測上傳表單）
    result/                        結果頁相關元件（雷達圖、構面明細、構面說明）
  lib/
    scoring/                       題目定義、計分引擎、等級／構面設定、等級評語
    quiz-store.tsx                 問卷狀態（React Context + sessionStorage 持久化）
    validation.ts                  格式驗證規則（目前必填檢查已關閉，方便測試）
    answer-codec.ts                作答結果編碼進結果頁網址（前測／後測比較用不同編碼）
    export-docx.ts                 組 Word 報告；同時給瀏覽器下載與伺服器寄信用
    docx-code.ts                   從上傳的前測 .docx 解析出比對代碼
    chart-snapshot.ts              把雷達圖 SVG 轉成 PNG，供下載與寄信共用
    mailer.ts                      SMTP 寄信（nodemailer）
    svg-to-png.ts                  SVG → PNG 的底層轉換
```

## 已知限制

- 公司資料表單目前所有欄位皆為選填（方便測試用），正式上線前應視需求恢復必填檢查，做法見 [`src/lib/validation.ts`](src/lib/validation.ts) 註解。
- 五大構面權重目前皆為 20%；若需依官方文件改回不等權重，調整 [`src/lib/scoring/dimensions.ts`](src/lib/scoring/dimensions.ts) 的 `DIMENSION_WEIGHTS` 即可。
- 前後測比對完全靠「解析報告裡嵌入的代碼」達成，沒有資料庫；若使用者刪除或竄改報告最下方那行灰色小字，系統會抓不到前測資料。
