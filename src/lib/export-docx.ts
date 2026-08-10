import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { COMPANY_FIELD_LABELS, type CompanyInfo, type ClosingAnswers } from "./quiz-store";
import {
  CLOSING_OTHER_VALUE,
  Q18_OPTIONS,
  Q18_TITLE,
  Q19_OPTIONS,
  Q19_TITLE,
} from "./closing-questions";
import { DIMENSION_ORDER } from "./scoring/dimensions";
import { LEVEL_COMMENTARY } from "./scoring/commentary";
import {
  QUESTIONS_BY_ID,
  QUESTION_PAGES,
  QUESTION_SUBCODES,
  REPORT_SECTION_TITLES,
} from "./scoring/questions";
import type { Answers, DimensionKey, Question, QuizResult } from "./scoring/types";

const ACCENT = "047857"; // emerald-700，docx 顏色字串不含 #
const ACCENT_SOFT = "ECFDF5"; // emerald-50
const MUTED = "6B7280";

const CHECKED = "☑";
const UNCHECKED = "☐";

const EXTERNAL_RESOURCES = [
  {
    label: "※AI 專家輔導團：由製造業AI化專家進廠提供公司營運痛點與AI導入需求之免費諮詢診斷服務。",
    url: "https://eii.nat.gov.tw/moeai-plus/#apply",
  },
  {
    label: "※AI 工具庫：提供企業申請AI模型應用工具補助資源，加速AI導入速度並降低導入成本。",
    url: "https://eii.nat.gov.tw/moeai-plus/ai-tools",
  },
  {
    label: "※AI 人才培訓：提供AI線上課程、學習券、企業內訓等資源與補助資訊。",
    url: "https://eii.nat.gov.tw/moeai-plus/#class",
  },
];

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, bold: true, color: ACCENT })],
  });
}

function shadedBar(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 150 },
    shading: { fill: ACCENT_SOFT },
    children: [new TextRun({ text, bold: true, size: 26 })],
  });
}

function bodyParagraph(text: string, opts?: { color?: string; size?: number }): Paragraph {
  return new Paragraph({
    spacing: { after: 150 },
    children: [new TextRun({ text, color: opts?.color, size: opts?.size ?? 22 })],
  });
}

function labelValueRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        shading: { fill: ACCENT_SOFT },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
      }),
      new TableCell({
        width: { size: 75, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: value })] })],
      }),
    ],
  });
}

function checkboxLine(checked: boolean, label: string): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: `${checked ? CHECKED : UNCHECKED} ${label}`, size: 20 })],
  });
}

/** Q1 矩陣題：子項 x（低/中/高）三欄的勾選表 */
function matrixAnswerTable(question: Extract<Question, { type: "matrix" }>, answer: Answers[string]): Table {
  const selections = (
    answer && typeof answer === "object" && !Array.isArray(answer) ? answer : {}
  ) as Record<string, string>;

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({ children: [new Paragraph("")] }),
      ...question.subItemOptions.map(
        (opt) =>
          new TableCell({
            shading: { fill: ACCENT_SOFT },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: opt.label, bold: true, size: 18 })],
              }),
            ],
          })
      ),
    ],
  });

  const rows = question.subItems.map(
    (sub) =>
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: sub.label, size: 20 })] })],
          }),
          ...question.subItemOptions.map(
            (opt) =>
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: selections[sub.id] === opt.value ? CHECKED : UNCHECKED }),
                    ],
                  }),
                ],
              })
          ),
        ],
      })
  );

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...rows] });
}

/** 單一題目的完整內容（題號+題目文字+題型標籤+選項勾選狀態），組成表格右欄的內容陣列 */
function questionContent(question: Question, answer: Answers[string], questionNumber: number): (Paragraph | Table)[] {
  const titleParagraph = new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: `${questionNumber}.${question.title}`, bold: true, size: 22 })],
  });

  if (question.type === "matrix") {
    return [titleParagraph, matrixAnswerTable(question, answer)];
  }

  if (question.type === "single") {
    const selected = typeof answer === "string" ? answer : undefined;
    return [
      titleParagraph,
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: "單選", italics: true, color: MUTED, size: 16 })],
      }),
      ...question.options.map((opt) => checkboxLine(opt.value === selected, opt.label)),
    ];
  }

  // multi
  const selected = Array.isArray(answer) ? answer : [];
  const lines = [
    titleParagraph,
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: "複選", italics: true, color: MUTED, size: 16 })],
    }),
    ...question.options.map((opt) => checkboxLine(selected.includes(opt.value), opt.label)),
  ];
  if (question.noneOption) {
    lines.push(checkboxLine(selected.includes(question.noneOption.value), question.noneOption.label));
  }
  return lines;
}

/** 一個構面的完整逐題作答表格（左欄子題號、右欄題目內容） */
function dimensionAnswerTable(dimension: DimensionKey, answers: Answers): Table {
  const questionIds = QUESTION_PAGES.find((p) => p.dimension === dimension)!.questionIds;

  const rows = questionIds.map((id) => {
    const question = QUESTIONS_BY_ID[id];
    const sub = QUESTION_SUBCODES[id];
    const questionNumber = Number(id.replace("Q", ""));

    return new TableRow({
      children: [
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          shading: { fill: ACCENT_SOFT },
          children: [
            new Paragraph({ children: [new TextRun({ text: sub.code, bold: true })] }),
            new Paragraph({ children: [new TextRun({ text: sub.label, size: 18 })] }),
          ],
        }),
        new TableCell({
          width: { size: 85, type: WidthType.PERCENTAGE },
          children: questionContent(question, answers[id], questionNumber),
        }),
      ],
    });
  });

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

function closingQuestionCell(
  index: number,
  title: string,
  options: string[],
  selected: string[],
  otherText: string
): (Paragraph | Table)[] {
  const lines: Paragraph[] = [
    new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: `${index}.${title}`, bold: true, size: 22 })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: "複選", italics: true, color: MUTED, size: 16 })],
    }),
    ...options.map((opt) => checkboxLine(selected.includes(opt), opt)),
    checkboxLine(
      selected.includes(CLOSING_OTHER_VALUE),
      `其他：${selected.includes(CLOSING_OTHER_VALUE) ? otherText : ""}`
    ),
  ];
  return lines;
}

function buildDocument(
  result: QuizResult,
  companyInfo: CompanyInfo,
  answers: Answers,
  closing: ClosingAnswers,
  chartImageBytes: Uint8Array | null
): Document {
  const commentary = LEVEL_COMMENTARY[result.level];
  const dateStamp = new Date().toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // ---- 評量結果框：公司資訊列 + 等級橫幅 + 整體評語 + (雷達圖 | 五大構面百分比) ----
  const summaryHeaderRow = new TableRow({
    children: [
      labelCell("公司名稱", companyInfo.companyName || "—", 34),
      labelCell("統編", companyInfo.taxId || "—", 33),
      labelCell("填答日期", dateStamp, 33),
    ],
  });

  function labelCell(label: string, value: string, widthPct: number): TableCell {
    return new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          children: [new TextRun({ text: `${label}：`, bold: true }), new TextRun({ text: value })],
        }),
      ],
    });
  }

  const dimensionBulletList = DIMENSION_ORDER.map((dim, i) => {
    const score = Math.min(100, Math.round(result.dimensionScores[dim]));
    const label = ["一", "二", "三", "四", "五"][i];
    const title = REPORT_SECTION_TITLES[dim].replace(/^[一二三四五]、/, "");
    return new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: `${label}、${title}：${score}%` })],
    });
  });

  const chartCellContent: (Paragraph)[] = chartImageBytes
    ? [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              type: "png",
              data: chartImageBytes,
              transformation: { width: 320, height: 320 },
            }),
          ],
        }),
      ]
    : [new Paragraph("（雷達圖）")];

  const summaryChartRow = new TableRow({
    children: [
      new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        children: chartCellContent,
      }),
      new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: "五大構面個別成熟度：", bold: true })],
          }),
          ...dimensionBulletList,
        ],
      }),
    ],
  });

  const summaryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [summaryHeaderRow],
  });

  // ---- 五大構面程度說明表格 ----
  const dimensionNotesRows = DIMENSION_ORDER.map((dim, i) => {
    const label = ["一", "二", "三", "四", "五"][i];
    const title = REPORT_SECTION_TITLES[dim].replace(/^[一二三四五]、/, "");
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: ACCENT_SOFT },
          children: [new Paragraph({ children: [new TextRun({ text: `${label}、${title}`, bold: true })] })],
        }),
        new TableCell({
          width: { size: 80, type: WidthType.PERCENTAGE },
          children: [new Paragraph(commentary.dimensionNotes[dim])],
        }),
      ],
    });
  });
  const dimensionNotesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: dimensionNotesRows,
  });

  // ---- 完整逐題作答清單（五大構面） ----
  const answerSheetBlocks = DIMENSION_ORDER.flatMap((dim) => [
    shadedBar(REPORT_SECTION_TITLES[dim]),
    dimensionAnswerTable(dim, answers),
  ]);

  // ---- A. 公司經營目標與痛點（Q18、Q19） ----
  const closingTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: ACCENT_SOFT },
            children: [new Paragraph({ children: [new TextRun({ text: "A-1 公司營運痛點發生場域", size: 18 })] })],
          }),
          new TableCell({
            width: { size: 85, type: WidthType.PERCENTAGE },
            children: closingQuestionCell(18, Q18_TITLE, Q18_OPTIONS, closing.q1, closing.q1Other),
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: ACCENT_SOFT },
            children: [new Paragraph({ children: [new TextRun({ text: "A-2 公司導入AI面臨挑戰", size: 18 })] })],
          }),
          new TableCell({
            width: { size: 85, type: WidthType.PERCENTAGE },
            children: closingQuestionCell(19, Q19_TITLE, Q19_OPTIONS, closing.q2, closing.q2Other),
          }),
        ],
      }),
    ],
  });

  // ---- B. 公司填答部門同仁 ----
  const departments = companyInfo.departments ?? [];
  const departmentText =
    departments.length > 0
      ? departments
          .map((d) => (d === "其他部門" && companyInfo.departmentOther ? `其他部門：${companyInfo.departmentOther}` : d))
          .join("、")
      : "—";

  const companyDetailRows = [
    labelValueRow(COMPANY_FIELD_LABELS.subIndustry, companyInfo.subIndustry || "—"),
    labelValueRow(COMPANY_FIELD_LABELS.city, companyInfo.city || "—"),
    labelValueRow(COMPANY_FIELD_LABELS.address, companyInfo.address || "—"),
    labelValueRow(COMPANY_FIELD_LABELS.employeeScale, companyInfo.employeeScale || "—"),
    labelValueRow(COMPANY_FIELD_LABELS.respondentName, companyInfo.respondentName || "—"),
    labelValueRow(COMPANY_FIELD_LABELS.respondentLevel, companyInfo.respondentLevel || "—"),
    labelValueRow("填答部門", departmentText),
    labelValueRow(COMPANY_FIELD_LABELS.departmentTitle, companyInfo.departmentTitle || "—"),
    labelValueRow(COMPANY_FIELD_LABELS.email, companyInfo.email || "—"),
    labelValueRow(COMPANY_FIELD_LABELS.phone, companyInfo.phone || "—"),
  ];
  const companyDetailTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: companyDetailRows,
  });

  return new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: "經濟部產業競爭力輔導團－製造業AI成熟度量表", bold: true, size: 32 }),
            ],
          }),

          shadedBar("評量結果"),
          summaryTable,
          shadedBar(`AI 成熟度等級：${result.levelName}`),
          bodyParagraph(commentary.overall),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [summaryChartRow] }),

          sectionHeading("五大構面程度說明"),
          dimensionNotesTable,

          sectionHeading("改善建議與推薦政策資源資訊"),
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: `${result.levelName}　AI 導入策略建議`, bold: true })],
          }),
          bodyParagraph(
            "此建議依所屬的成熟度等級提供代表性參考內容；原站會再依五大構面的實際分數組合進一步客製化，因此與您在原站看到的文字可能略有不同。",
            { color: "9CA3AF", size: 16 }
          ),
          bodyParagraph(commentary.strategyAdvice),
          ...EXTERNAL_RESOURCES.flatMap((r) => [
            bodyParagraph(r.label, { size: 18 }),
            bodyParagraph(r.url, { color: "2563EB", size: 18 }),
          ]),

          sectionHeading("完整填答內容"),
          ...answerSheetBlocks,

          shadedBar("A. 公司經營目標與痛點"),
          closingTable,

          shadedBar("B. 公司填答部門同仁"),
          companyDetailTable,

          new Paragraph({
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: "本報告由「AI成熟度量表」線上問卷自動產生，僅供企業自我評估參考。",
                color: "9CA3AF",
                size: 18,
              }),
            ],
          }),
        ],
      },
    ],
  });
}

/** 在瀏覽器端組出診斷結果 Word 檔並觸發下載，純前端、不經過任何伺服器 */
export async function downloadResultDocx(
  result: QuizResult,
  companyInfo: CompanyInfo,
  answers: Answers,
  closing: ClosingAnswers,
  chartImageBytes: Uint8Array | null
): Promise<void> {
  const doc = buildDocument(result, companyInfo, answers, closing, chartImageBytes);
  const blob = await Packer.toBlob(doc);

  const dateStamp = new Date().toISOString().slice(0, 10);
  const companyPart = companyInfo.companyName ? `_${companyInfo.companyName}` : "";
  const filename = `AI成熟度診斷報告${companyPart}_${dateStamp}.docx`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
