import type {
  ChoiceOption,
  MatrixQuestion,
  MatrixSubItem,
  MultiChoiceQuestion,
  Question,
  SingleChoiceQuestion,
} from "./types";

/**
 * 題目與選項文字為使用者親自截圖原站問卷後逐字轉錄，2026-08-06。
 *
 * 分數來源標記：
 *   verified: true  → 該題（或該選項組合）分數已透過黑箱測試逐一驗證
 *   verified: false → 目前用「選項等差線性分布」佔位，真實非線性曲線尚未逐一測出
 *     （已知 Q5/Q6/Q7 選項分數確定非線性，但校正後數值未保留在交接文件中）
 */

function linearOptions(labels: string[]): ChoiceOption[] {
  const step = 100 / (labels.length - 1);
  return labels.map((label, i) => ({
    value: String(i + 1),
    label,
    score: Math.round(i * step),
  }));
}

function singleChoice(
  id: string,
  dimension: SingleChoiceQuestion["dimension"],
  weight: number,
  title: string,
  optionLabels: string[],
  verified = false
): SingleChoiceQuestion {
  return {
    id,
    dimension,
    type: "single",
    weight,
    title,
    options: linearOptions(optionLabels),
    verified,
  };
}

function multiChoice(
  id: string,
  dimension: MultiChoiceQuestion["dimension"],
  weight: number,
  title: string,
  optionLabels: string[],
  baselineAtOne: number,
  baselineVerified: boolean,
  noneOptionLabel?: string
): MultiChoiceQuestion {
  return {
    id,
    dimension,
    type: "multi",
    weight,
    title,
    options: optionLabels.map((label, i) => ({ value: String(i + 1), label })),
    noneOption: noneOptionLabel ? { value: "none", label: noneOptionLabel } : undefined,
    baselineAtOne,
    baselineVerified,
  };
}

// ---- 第一部分：數據與基礎設施（Q1-Q4，權重合計 101%，四捨五入誤差，如實保留） ----

const Q1_SUB_ITEM_LABELS = [
  "製造執行管理相關系統(MES)",
  "設備機台管理相關系統(EMS)",
  "製造排程管理相關系統(APS)",
  "原料配方管理相關系統(RMS)",
  "倉儲管理相關系統(WMS)",
  "產品生命週期管理相關系統(PLM)",
  "企業資源客戶管理相關系統(ERP)",
  "供應鏈管理相關系統(SCM)",
  "客戶關係管理相關系統(CRM)",
  "企業商業智慧決策管理相關系統(BI)",
];

const Q1_SUB_ITEMS: MatrixSubItem[] = Q1_SUB_ITEM_LABELS.map((label, i) => ({
  id: String(i + 1),
  label,
}));

const Q1: MatrixQuestion = {
  id: "Q1",
  dimension: "baseData",
  type: "matrix",
  title: "貴公司目前在製造與營運管理上，已導入哪些E化資訊系統？",
  weight: 37,
  subItems: Q1_SUB_ITEMS,
  subItemOptions: [
    { value: "1", label: "尚無導入規劃或評估中" },
    { value: "2", label: "系統尚在建置中" },
    { value: "3", label: "系統已導入使用中" },
  ],
  // 實測：單一子項選最高 → 9%（子項1、子項5皆驗證過，數值一致）
  baselineAtOne: 9,
  baselineVerified: true,
};

const Q2 = singleChoice(
  "Q2",
  "baseData",
  25,
  "貴公司工廠的產線、機台或廠務設備，目前是否可自動將運作數據傳送至電腦或系統（不需人工抄寫），以便公司能從網路上收集機台或設備中的運作狀態數據？",
  [
    "產線或廠務設備大多仍須人工操作，尚未導入自動化與具備數據收集能力。",
    "產線、機台或廠務設備已導入基本自動化控制，但機台數據資料無法自動收集、上傳或整合（機聯網）。",
    "少數關鍵產線、機台或廠務設備已具備自行收集數據資料、上傳與整合功能（機聯網）。",
    "多條關鍵產線、機台或廠務設備已具備自行收集數據資料、上傳與整合功能（機聯網），並可透過系統畫面即時查看機台或產線狀態。",
    "多條關鍵產線機台或廠務設備皆已具備自行收集數據資料、上傳與整合功能（機聯網），並可透過電腦或網路遠端監控並操作設備。",
  ]
);

const Q3 = singleChoice(
  "Q3",
  "baseData",
  31,
  "貴公司各系統所蒐集的數據，目前串接整合與運用程度如何？",
  [
    "公司營運流程，大多尚未採用數位化系統，仍以人工方式紙本記錄資料，未多累積數據資料。",
    "公司已有部份資訊系統，但多數系統獨立運作，數據尚未串接。",
    "公司部份資訊系統已進行數據串接，業務數據可跨系統流通與使用。",
    "公司已有集中管理數據資料的平台，整合公司內外部資料，並有串接外部系統資料（如供應商或合作夥伴），集中彙整各方數據。",
    "公司不只建置集中管理數據資料的平台，且可自動生成圖表或透過資料視覺化工具（如PowerBI）呈現整合後的數據並進行分析。",
  ]
);

const Q4 = singleChoice(
  "Q4",
  "baseData",
  8,
  "貴公司目前主要使用哪些運算資源與架構，來支援AI相關應用？（不含ChatGPT、Gemini等一般生成式AI工具）",
  [
    "未使用任何伺服器或運算資源，來支援AI應用服務（有使用雲端AI服務不在此列）。",
    "僅使用一般AI工具或雲端AI服務，還不需要使用含GPU的高效能伺服器或運算設備（含自建、委外或雲端服務）。",
    "已使用含GPU的高效能伺服器或運算設備（含自建、委外或雲端服務），支援AI資料分析或AI應用服務。",
    "公司已自行擁有含GPU的高效能伺服器或運算設備，進行AI模型訓練與應用於實際業務流程。",
    "除上述外，工廠已導入AI即時運算設備（Edge AI），進行即時判斷與應用。",
  ]
);

// ---- 第二部分：企業AI投入資源（Q5-Q7）----
// 交接文件標註 Q5/Q6/Q7 選項分數「已校正過非線性數值」，但校正後的實際數字
// 未保留在交接文件與測試報告中，目前仍用線性佔位，待補實測數字。
const Q5 = singleChoice(
  "Q5",
  "inputResource",
  65,
  "貴公司因應導入AI做數位轉型，預計年度投入多少預算或資源，進行AI相關發展（包含軟體、硬體、專案、培訓及人力；人力包含新聘或既有員工轉任，亦不限技術職）？",
  [
    "尚未規劃AI相關軟硬體或AI應用發展，亦未聘僱或配置AI應用相關人力（包含新聘或既有轉任之AI應用、規劃等人員，非僅限技術人才）。",
    "已有聘僱或配置AI相關人力（如AI應用或規劃人員）之投入規劃（含培訓），但尚未有相關AI軟硬體或AI應用發展預算之規劃。",
    "已有AI相關軟硬體或AI應用投資規劃，但尚未有聘僱或配置AI相關人力（如AI應用或規劃人員）之投入規劃（含培訓）。",
    "已有聘僱或配置相關人力（如AI應用或規劃人員）、AI軟硬體或AI應用發展相關投資規劃。",
    "已有專責單位與預算投入AI相關人才、AI軟硬體或AI應用投資規劃。",
  ]
);

const Q6 = singleChoice(
  "Q6",
  "inputResource",
  16,
  "貴公司是否建立教育訓練機制，提供員工AI相關教育訓練課程資源？",
  [
    "目前無AI課程培訓需求與相關規劃。",
    "公司尚未提供AI相關培訓資源，唯主管鼓勵員工自主學習AI相關知識與應用。",
    "公司尚未建立內部AI相關培訓資源，但鼓勵員工自主參加外部AI培訓課程，並有提供小額課程補助。",
    "公司初步建立AI相關培訓機制，鼓勵員工參加外部培訓課程，另外並提供內部AI課程培訓，只提供少數重點員工培訓機會。",
    "公司已建立完整AI人才培育機制，定期提供各職類員工內部上課或外部培訓機會。",
  ]
);

const Q7 = singleChoice(
  "Q7",
  "inputResource",
  19,
  "貴公司推動AI導入時，是否聘任或配置AI技術人員（如AI演算法、模型訓練、軟體開發工程師等）？",
  [
    "公司尚未聘任或配置AI技術人員，或未運用既有人員進行AI應用評估或AI系統維運。",
    "公司尚未聘任專責技術人員，但由資訊管理單位或既有人員負責AI應用的評估、開發與維運。",
    "公司在資訊管理單位或相關單位內編制了少量AI技術人員，負責AI應用的評估、開發與維運。",
    "公司已在資訊管理單位內或相關單位設立AI團隊，專責AI應用的評估、開發與維運。",
    "公司已建立獨立於資訊管理單位或相關單位之外的AI技術部門或單位，擁有多位專業人才，負責組織整體AI技術發展、應用推動與系統建置。",
  ]
);

// ---- 第三部分：企業AI策略規劃與管理（Q8-Q11）----
const Q8 = singleChoice(
  "Q8",
  "strategy",
  37,
  "貴公司目前在AI發展策略的規劃情形如何？",
  [
    "公司尚未規劃數位轉型（包含未採用數位化相關工具、僅用人工進行作業等），或不了解AI相關發展或應用。",
    "公司正開始規劃數位轉型相關運作基礎（如數位化作業、導入數位化工具、建置作業系統等），或對AI有基礎認識。",
    "公司已有數位轉型策略或相關運作基礎，或對AI應用於業務流程有一定認識與理解。",
    "公司已於數位轉型策略或相關運作基礎中納入AI應用規劃，並開始明確定義AI於流程或營運中的應用角色與推動方向。",
    "公司已有獨立的AI發展策略方向，並有明確與企業營運策略結合的發展目標。",
  ]
);

const Q9 = singleChoice(
  "Q9",
  "strategy",
  28,
  "貴公司是否設立推動AI數位轉型之專責組織或推動機制？",
  [
    "目前無相關單位或推動機制。",
    "由資訊或特定單位設立AI推動工作小組，彙整各別部門對AI需求與工作進展。",
    "成立跨部門AI工作小組，定期與高階主管匯報AI相關需求與工作進展。",
    "已有以高階主管帶領的AI推動工作小組，制定年度AI工作目標，並定期追蹤進度。",
    "已有以高階主管組成常態專責的AI推動委員會及推動組織，並制定年度工作規劃目標，定期檢視進展。",
  ]
);

// 實測：8選項，門檻4項；1/2/3/4項 = 6%/13%/19%/23%（見 curve.ts 常數）
const Q10 = multiChoice(
  "Q10",
  "strategy",
  23,
  "貴公司針對數位化系統蒐集的數據資料有建立哪些管理機制？【複選，數量不限】",
  [
    "有建立數據管理專責人員或團隊，設定數據維護責任歸屬。",
    "有建立數據索引，以利數據檢索。",
    "有建立數據格式標準，以利數據彙整與互通。",
    "有數據清理、錯誤處理的數據品質監測機制。",
    "有數據存取權限、存取日誌記錄或加密保護等數據資訊安全機制。",
    "有建立個資去識別化、敏感資料保護或符合國際區域如GDPR（歐盟一般資料保護規則）等隱私法規的管理機制。",
    "有建立數據生命週期管理，規範數據存儲與刪除流程。",
    "有建立歷史數據版本控管與恢復追溯機制。",
  ],
  6,
  true,
  "以上皆無。"
);

// 實測：7選項，門檻4項；1項=6%、4項=12%（滿分），中間值未逐一測
const Q11 = multiChoice(
  "Q11",
  "strategy",
  12,
  "貴公司是否有針對AI系統開發與使用層面相關的準則/規範/政策？【複選，數量不限】",
  [
    "透明性-使用者能理解並追蹤AI的決策過程。（公司有規範AI的判斷結果需可解釋或能說明原因）",
    "安全性與韌性-AI必須安全可靠，不易出錯或被攻擊。（公司有規範AI系統需穩定運作，並避免錯誤或被攻擊）",
    "可問責性-確保AI推論行為可追溯團隊負責與錯誤修正等處理。（公司有規範AI出問題時，可追查責任與修正方式）",
    "公平性-確保AI推論中立不歧視、不造成偏見。（公司有規範AI判斷需避免偏見或不公平結果）",
    "隱私與數據保護-確保AI處理的數據符合隱私與保護法規，不濫用個人數據。（公司有規範AI使用的資料需符合隱私與法規，避免資料外洩或濫用）",
    "人類監督-AI不能完全自主決策，需有人類監督，具備緊急介入機制。（公司有規範AI重要決策需有人員確認或人工介入）",
    "社會與環境責任-AI決策應對社會與環境帶來正面影響，而非加劇問題，企業應避免技術濫用。（公司有規範AI使用需避免造成社會或環境負面影響）",
  ],
  6,
  true,
  "以上皆無。"
);

// ---- 第四部分：製造業AI應用與落地（Q12-Q15）----
const Q12 = singleChoice(
  "Q12",
  "application",
  12,
  "貴公司AI應用於業務流程之導入與使用程度為何？",
  [
    "公司尚未投入AI研究或規劃。",
    "部分流程正在探索導入AI可能性，但尚未實際應用。",
    "部分流程開始或曾經進行AI試行或測試專案（例如試用AI工具或小規模測試），但尚未正式導入公司日常業務流程（不含一般AI工具如ChatGPT等通用生成式應用）。",
    "有部分業務流程與場域已導入AI應用，並持續應用於日常營運作業。",
    "多數業務流程與場域均已導入AI應用，並已成為日常營運之重要組成部分。",
  ]
);

// 實測：11選項，門檻6項=39%（滿分）；勾1項分數未逐一測，依 Q10 的 baseline/max 比例（6/23）估算
const Q13 = multiChoice(
  "Q13",
  "application",
  39,
  "貴公司歷年來在哪些業務場域已導入AI試行專案或已實際落地為AI應用？【複選，數量不限】",
  [
    "產品研發設計",
    "生產製程",
    "供應鏈管理",
    "品質檢測",
    "設備維護",
    "廠務管理",
    "工廠碳排能耗",
    "業務客服",
    "營運管理行銷",
    "人力資源",
    "物流倉儲",
  ],
  Math.round(39 * (6 / 23)),
  false,
  "以上皆無"
);

const Q14 = singleChoice(
  "Q14",
  "application",
  34,
  "貴公司導入的AI系統，大多以何種方式取得AI技術支援？",
  [
    "公司尚未應用AI技術與平台服務。",
    "AI系統服務基本上多外購，或委請AI技術服務業者提供整體解決方案。",
    "AI系統服務以外購或委外為主，僅少部分可由公司內部自建或調整。",
    "AI系統服務主要自建，少部分進階AI關鍵技術與AI技術服務業者或外部專家共同研發。",
    "公司已累積深厚AI技術研發能量，AI系統服務基本上皆可內部同仁自行研發。",
  ]
);

const Q15 = singleChoice(
  "Q15",
  "application",
  15,
  "貴公司已導入的AI系統，目前系統的維運與更新狀態如何？",
  [
    "公司尚未有AI系統需要維護。",
    "AI應用系統已上線運作，但主要依賴開發團隊或IT部門臨時維護，缺乏整體AI維運架構。",
    "AI應用系統已上線運作，公司已建立基本的AI維運流程機制（如日常監控、錯誤修正），但尚未進行自動化監控或AI模型持續優化。",
    "AI系統已納入企業IT維運架構，具備AI技術監控與優化機制，並能根據業務需求定期更新AI模型與數據。",
    "AI系統已整合自動化模型監測、異常預測、數據回饋機制，具備AI持續學習、優化自身模型自適應調整能力，無須人工頻繁介入，AI自動化運維已超成熟。",
  ]
);

// ---- 第五部分：企業AI數位轉型營運效益（Q16-Q17）----
const Q16 = singleChoice(
  "Q16",
  "diffusion",
  61,
  "貴公司導入AI系統是否有滿足預期營運效益，達成AI數位轉型業務目標？",
  [
    "尚無導入AI的規劃，或尚未評估AI導入效益。",
    "目前難以評估AI導入效益。",
    "目前初步評估AI導入效益，但效益不如預期，須持續優化。",
    "目前導入的AI試行專案或應用服務，已產生初步營運效益。",
    "目前已明確量化AI導入效益，普遍導入效益高，達成AI數位轉型目標。",
  ]
);

const Q17 = singleChoice(
  "Q17",
  "diffusion",
  39,
  "貴公司投入資金與資源發展AI，是否已達成該專案所設定之投資報酬率（ROI）目標？",
  [
    "尚無導入AI的規劃，或尚未估算投資報酬率。",
    "已開始研究AI投入效益，但該AI專案之投資報酬率仍難以量化評估。",
    "已有投資報酬率估算方法，但該AI專案之投資報酬率不如預期。",
    "已有投資報酬率估算方法，且該AI專案之投資報酬率有達基本預期。",
    "已有投資報酬率估算方法，且該AI專案之投資報酬率已產生明顯效益並優於預期。",
  ]
);

export const QUESTIONS: Question[] = [
  Q1, Q2, Q3, Q4,
  Q5, Q6, Q7,
  Q8, Q9, Q10, Q11,
  Q12, Q13, Q14, Q15,
  Q16, Q17,
];

export const QUESTIONS_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q])
);

/** 問卷分頁分組（比照原站 page1~page5 = 五大構面各一頁） */
export const QUESTION_PAGES: {
  page: string;
  dimension: Question["dimension"];
  /** 原站該部分的正式標題（例：「第一部分：數據與基礎設施」） */
  sectionTitle: string;
  questionIds: string[];
}[] = [
  { page: "page1", dimension: "baseData", sectionTitle: "第一部分：數據與基礎設施", questionIds: ["Q1", "Q2", "Q3", "Q4"] },
  { page: "page2", dimension: "inputResource", sectionTitle: "第二部分：企業AI投入資源", questionIds: ["Q5", "Q6", "Q7"] },
  { page: "page3", dimension: "strategy", sectionTitle: "第三部分：企業AI策略規劃與管理", questionIds: ["Q8", "Q9", "Q10", "Q11"] },
  { page: "page4", dimension: "application", sectionTitle: "第四部分：製造業AI應用與落地", questionIds: ["Q12", "Q13", "Q14", "Q15"] },
  { page: "page5", dimension: "diffusion", sectionTitle: "第五部分：企業AI數位轉型營運效益", questionIds: ["Q16", "Q17"] },
];

/**
 * 官方正式報告（PDF）使用的子題編號與構面中文編號標題，逐字對照自使用者提供的
 * 真實填答結果 PDF 範本，Word 匯出報告的完整逐題作答清單依此呈現。
 */
export const REPORT_SECTION_TITLES: Record<Question["dimension"], string> = {
  baseData: "一、數據與基礎設施",
  inputResource: "二、企業AI投入資源",
  strategy: "三、企業AI策略規劃與管理",
  application: "四、製造業AI應用與落地",
  diffusion: "五、企業AI數位轉型營運效益",
};

export const QUESTION_SUBCODES: Record<string, { code: string; label: string }> = {
  Q1: { code: "1-1", label: "數位化程度" },
  Q2: { code: "1-2", label: "機聯網程度" },
  Q3: { code: "1-3", label: "數據彙整程度" },
  Q4: { code: "1-4", label: "伺服器運算能力" },
  Q5: { code: "2-1", label: "資金投入" },
  Q6: { code: "2-2", label: "人才培訓" },
  Q7: { code: "2-3", label: "AI技術人力" },
  Q8: { code: "3-1", label: "企業AI推動策略" },
  Q9: { code: "3-2", label: "AI推動組織" },
  Q10: { code: "3-3", label: "數據治理制度" },
  Q11: { code: "3-4", label: "可信賴AI管理" },
  Q12: { code: "4-1", label: "AI應用導入深度" },
  Q13: { code: "4-2", label: "AI應用領域落地程度" },
  Q14: { code: "4-3", label: "技術開發管道" },
  Q15: { code: "4-4", label: "AI系統維運更新" },
  Q16: { code: "5-1", label: "AI導入應用效益" },
  Q17: { code: "5-2", label: "導入ROI投報率" },
};
