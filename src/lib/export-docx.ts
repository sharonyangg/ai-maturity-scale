import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
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
import type { PngSnapshot } from "./svg-to-png";

const ACCENT = "047857"; // emerald-700，docx 顏色字串不含 #
const ACCENT_SOFT = "ECFDF5"; // emerald-50
const MUTED = "6B7280";
const FONT = "標楷體";

const CHECKED = "☑";
const UNCHECKED = "☐";

/**
 * A4 版面扣掉左右各 1440 twips（1 吋）邊界的可用內容寬度。
 * 只靠 TableCell 的百分比寬度、不搭配 layout:FIXED + 明確的 columnWidths 時，
 * 部分手機上的文件檢視器（例如 iOS 內建的 QuickLook 預覽）不會照百分比分配欄寬，
 * 而是把每欄擠成極窄的寬度，導致中文字被迫一字一行、整個表格跑版。
 * 明確指定以 twips 為單位的欄寬可以讓各種檢視器都照同一份數字算，行為才會一致。
 */
const CONTENT_WIDTH_TWIPS = 9026;

/** 把百分比陣列（總和需為 100）換算成 twips 陣列，最後一欄吸收四捨五入的誤差 */
function pctToTwips(percentages: number[]): number[] {
  const widths = percentages.map((p) => Math.round((p / 100) * CONTENT_WIDTH_TWIPS));
  const diff = CONTENT_WIDTH_TWIPS - widths.reduce((a, b) => a + b, 0);
  widths[widths.length - 1] += diff;
  return widths;
}

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
    children: [new TextRun({ text, bold: true, color: ACCENT, font: FONT })],
  });
}

function shadedBar(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 150 },
    shading: { fill: ACCENT_SOFT },
    children: [new TextRun({ text, bold: true, size: 26, font: FONT })],
  });
}

function bodyParagraph(text: string, opts?: { color?: string; size?: number }): Paragraph {
  return new Paragraph({
    spacing: { after: 150 },
    children: [new TextRun({ text, color: opts?.color, size: opts?.size ?? 22, font: FONT })],
  });
}

function labelValueRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        shading: { fill: ACCENT_SOFT },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, font: FONT })] })],
      }),
      new TableCell({
        width: { size: 75, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: value, font: FONT })] })],
      }),
    ],
  });
}

function checkboxLine(checked: boolean, label: string): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: `${checked ? CHECKED : UNCHECKED} ${label}`, size: 20, font: FONT })],
  });
}

function matrixAnswerTable(question: Extract<Question, { type: "matrix" }>, answer: Answers[string]): Table {
  const selections = (
    answer && typeof answer === "object" && !Array.isArray(answer) ? answer : {}
  ) as Record<string, string>;

  const labelPct = 30;
  const optionPct = (100 - labelPct) / question.subItemOptions.length;
  const columnWidths = pctToTwips([labelPct, ...question.subItemOptions.map(() => optionPct)]);

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({ width: { size: labelPct, type: WidthType.PERCENTAGE }, children: [new Paragraph("")] }),
      ...question.subItemOptions.map(
        (opt) =>
          new TableCell({
            width: { size: optionPct, type: WidthType.PERCENTAGE },
            shading: { fill: ACCENT_SOFT },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: opt.label, bold: true, size: 18, font: FONT })],
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
            width: { size: labelPct, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: sub.label, size: 20, font: FONT })] })],
          }),
          ...question.subItemOptions.map(
            (opt) =>
              new TableCell({
                width: { size: optionPct, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: selections[sub.id] === opt.value ? CHECKED : UNCHECKED,
                        font: FONT,
                      }),
                    ],
                  }),
                ],
              })
          ),
        ],
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths,
    rows: [headerRow, ...rows],
  });
}

function questionContent(question: Question, answer: Answers[string], questionNumber: number): (Paragraph | Table)[] {
  const titleParagraph = new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${questionNumber}.${question.title}`, bold: true, size: 22, font: FONT }),
    ],
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
        children: [new TextRun({ text: "單選", italics: true, color: MUTED, size: 16, font: FONT })],
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
      children: [new TextRun({ text: "複選", italics: true, color: MUTED, size: 16, font: FONT })],
    }),
    ...question.options.map((opt) => checkboxLine(selected.includes(opt.value), opt.label)),
  ];
  if (question.noneOption) {
    lines.push(checkboxLine(selected.includes(question.noneOption.value), question.noneOption.label));
  }
  return lines;
}

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
            new Paragraph({ children: [new TextRun({ text: sub.code, bold: true, font: FONT })] }),
            new Paragraph({ children: [new TextRun({ text: sub.label, size: 18, font: FONT })] }),
          ],
        }),
        new TableCell({
          width: { size: 85, type: WidthType.PERCENTAGE },
          children: questionContent(question, answers[id], questionNumber),
        }),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: pctToTwips([15, 85]),
    rows,
  });
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
      children: [new TextRun({ text: `${index}.${title}`, bold: true, size: 22, font: FONT })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: "複選", italics: true, color: MUTED, size: 16, font: FONT })],
    }),
    ...options.map((opt) => checkboxLine(selected.includes(opt), opt)),
    checkboxLine(
      selected.includes(CLOSING_OTHER_VALUE),
      `其他：${selected.includes(CLOSING_OTHER_VALUE) ? otherText : ""}`
    ),
  ];
  return lines;
}

function fitWithinBox(
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight, 1);
  return { width: Math.round(sourceWidth * scale), height: Math.round(sourceHeight * scale) };
}

function buildDocument(
  result: QuizResult,
  companyInfo: CompanyInfo,
  answers: Answers,
  closing: ClosingAnswers,
  chartSnapshot: PngSnapshot | null
): Document {
  const commentary = LEVEL_COMMENTARY[result.level];
  const dateStamp = new Date().toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

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
          children: [
            new TextRun({ text: `${label}：`, bold: true, font: FONT }),
            new TextRun({ text: value, font: FONT }),
          ],
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
      children: [new TextRun({ text: `${label}、${title}：${score}%`, font: FONT })],
    });
  });

  const chartCellContent: (Paragraph)[] = chartSnapshot
    ? [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              type: "png",
              data: chartSnapshot.bytes,
              transformation: fitWithinBox(chartSnapshot.width, chartSnapshot.height, 280, 280),
            }),
          ],
        }),
      ]
    : [new Paragraph({ children: [new TextRun({ text: "（雷達圖）", font: FONT })] })];

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
            children: [new TextRun({ text: "五大構面個別成熟度：", bold: true, font: FONT })],
          }),
          ...dimensionBulletList,
        ],
      }),
    ],
  });

  const summaryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: pctToTwips([34, 33, 33]),
    rows: [summaryHeaderRow],
  });

  const dimensionNotesRows = DIMENSION_ORDER.map((dim, i) => {
    const label = ["一", "二", "三", "四", "五"][i];
    const title = REPORT_SECTION_TITLES[dim].replace(/^[一二三四五]、/, "");
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: ACCENT_SOFT },
          children: [
            new Paragraph({
              children: [new TextRun({ text: `${label}、${title}`, bold: true, font: FONT })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 80, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({ children: [new TextRun({ text: commentary.dimensionNotes[dim], font: FONT })] }),
          ],
        }),
      ],
    });
  });
  const dimensionNotesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: pctToTwips([20, 80]),
    rows: dimensionNotesRows,
  });

  const answerSheetBlocks = DIMENSION_ORDER.flatMap((dim) => [
    shadedBar(REPORT_SECTION_TITLES[dim]),
    dimensionAnswerTable(dim, answers),
  ]);

  const closingTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: pctToTwips([15, 85]),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: ACCENT_SOFT },
            children: [
              new Paragraph({ children: [new TextRun({ text: "A-1 公司營運痛點發生場域", size: 18, font: FONT })] }),
            ],
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
            children: [
              new Paragraph({ children: [new TextRun({ text: "A-2 公司導入AI面臨挑戰", size: 18, font: FONT })] }),
            ],
          }),
          new TableCell({
            width: { size: 85, type: WidthType.PERCENTAGE },
            children: closingQuestionCell(19, Q19_TITLE, Q19_OPTIONS, closing.q2, closing.q2Other),
          }),
        ],
      }),
    ],
  });

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
    layout: TableLayoutType.FIXED,
    columnWidths: pctToTwips([25, 75]),
    rows: companyDetailRows,
  });

  return new Document({
    styles: {
      default: {
        document: { run: { font: FONT } },
        heading1: { run: { font: FONT } },
        heading2: { run: { font: FONT } },
        heading3: { run: { font: FONT } },
      },
    },
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "經濟部產業競爭力輔導團－製造業AI成熟度量表",
                bold: true,
                size: 32,
                font: FONT,
              }),
            ],
          }),

          shadedBar("評量結果"),
          summaryTable,
          shadedBar(`AI 成熟度等級：${result.levelName}`),
          bodyParagraph(commentary.overall),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            columnWidths: pctToTwips([50, 50]),
            rows: [summaryChartRow],
          }),

          sectionHeading("五大構面程度說明"),
          dimensionNotesTable,

          sectionHeading("改善建議與推薦政策資源資訊"),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: `${result.levelName}　AI 導入策略建議`, bold: true, font: FONT }),
            ],
          }),
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
                font: FONT,
              }),
            ],
          }),
        ],
      },
    ],
  });
}

export async function downloadResultDocx(
  result: QuizResult,
  companyInfo: CompanyInfo,
  answers: Answers,
  closing: ClosingAnswers,
  chartSnapshot: PngSnapshot | null
): Promise<void> {
  const doc = buildDocument(result, companyInfo, answers, closing, chartSnapshot);
  const blob = await Packer.toBlob(doc);

  const dateStamp = new Date().toISOString().slice(0, 10);
  const namePart = companyInfo.companyName ? `${companyInfo.companyName}_` : "";
  const filename = `${namePart}AI成熟度診斷報告_${dateStamp}.docx`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
