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
import { COMPANY_FIELD_LABELS, type CompanyInfo } from "./quiz-store";
import { DIMENSION_DESCRIPTIONS, DIMENSION_ORDER } from "./scoring/dimensions";
import { LEVEL_COMMENTARY } from "./scoring/commentary";
import { QUESTIONS_BY_ID, QUESTION_PAGES, REPORT_SECTION_TITLES } from "./scoring/questions";
import type { Answers, DimensionKey, Question, QuizResult } from "./scoring/types";
import type { PngSnapshot } from "./svg-to-png";

const ACCENT = "047857"; // emerald-700，docx 顏色字串不含 #
const ACCENT_SOFT = "ECFDF5"; // emerald-50
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

function questionContent(question: Question, answer: Answers[string], questionNumber: string): (Paragraph | Table)[] {
  const titleParagraph = new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${questionNumber}.${question.title}`, bold: true, size: 22, font: FONT }),
    ],
  });

  const selected = typeof answer === "string" ? answer : undefined;
  return [titleParagraph, ...question.options.map((opt) => checkboxLine(opt.value === selected, opt.label))];
}

function dimensionAnswerTable(dimension: DimensionKey, answers: Answers): Table {
  const questionIds = QUESTION_PAGES.find((p) => p.dimension === dimension)!.questionIds;

  const rows = questionIds.map((id) => {
    const question = QUESTIONS_BY_ID[id];

    return new TableRow({
      children: [
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          shading: { fill: ACCENT_SOFT },
          children: [
            new Paragraph({ children: [new TextRun({ text: id, bold: true, font: FONT })] }),
          ],
        }),
        new TableCell({
          width: { size: 85, type: WidthType.PERCENTAGE },
          children: questionContent(question, answers[id], id),
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
      labelCell("公司/機構名稱", companyInfo.companyName || "—", 50),
      labelCell("填答日期", dateStamp, 50),
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

  const chartCellContent: Paragraph[] = chartSnapshot
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
    columnWidths: pctToTwips([50, 50]),
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
            new Paragraph({ children: [new TextRun({ text: DIMENSION_DESCRIPTIONS[dim], font: FONT })] }),
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

  const companyDetailRows = [
    labelValueRow(COMPANY_FIELD_LABELS.city, companyInfo.city || "—"),
    labelValueRow(COMPANY_FIELD_LABELS.employeeScale, companyInfo.employeeScale || "—"),
    labelValueRow(COMPANY_FIELD_LABELS.respondentName, companyInfo.respondentName || "—"),
    labelValueRow(COMPANY_FIELD_LABELS.respondentTitle, companyInfo.respondentTitle || "—"),
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
                text: "企業成熟度診斷問卷",
                bold: true,
                size: 32,
                font: FONT,
              }),
            ],
          }),

          shadedBar("評量結果"),
          summaryTable,
          shadedBar(`企業成熟度等級：${result.levelName}`),
          bodyParagraph(commentary.overall),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            columnWidths: pctToTwips([50, 50]),
            rows: [summaryChartRow],
          }),

          sectionHeading("五大構面程度說明"),
          dimensionNotesTable,

          sectionHeading("建議行動"),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: `${result.levelName}　建議行動`, bold: true, font: FONT }),
            ],
          }),
          bodyParagraph(commentary.strategyAdvice),

          sectionHeading("完整填答內容"),
          ...answerSheetBlocks,

          shadedBar("公司個人資料"),
          companyDetailTable,

          new Paragraph({
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: "本報告由「企業成熟度診斷問卷」線上問卷自動產生，僅供組織自我評估參考。",
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
  chartSnapshot: PngSnapshot | null
): Promise<void> {
  const doc = buildDocument(result, companyInfo, answers, chartSnapshot);
  const blob = await Packer.toBlob(doc);

  const dateStamp = new Date().toISOString().slice(0, 10);
  const namePart = companyInfo.companyName ? `${companyInfo.companyName}_` : "";
  const filename = `${namePart}企業成熟度診斷報告_${dateStamp}.docx`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
