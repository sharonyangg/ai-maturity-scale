import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { COMPANY_FIELD_LABELS, type CompanyInfo } from "./quiz-store";
import {
  DIMENSION_LABELS,
  DIMENSION_ORDER,
  DIMENSION_WEIGHTS,
  LEVEL_DESCRIPTIONS,
} from "./scoring/dimensions";
import { LEVEL_COMMENTARY } from "./scoring/commentary";
import type { QuizResult } from "./scoring/types";

const ACCENT = "047857"; // emerald-700，docx 顏色字串不含 #
const ACCENT_SOFT = "F0FDF4"; // emerald-50

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, bold: true, color: ACCENT })],
  });
}

function bodyParagraph(text: string, opts?: { color?: string; size?: number }): Paragraph {
  return new Paragraph({
    spacing: { after: 150 },
    children: [new TextRun({ text, color: opts?.color, size: opts?.size ?? 22 })],
  });
}

function subHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 150, after: 60 },
    children: [new TextRun({ text, bold: true })],
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

function buildDocument(result: QuizResult, companyInfo: CompanyInfo): Document {
  const commentary = LEVEL_COMMENTARY[result.level];

  const companyRows = (Object.keys(COMPANY_FIELD_LABELS) as (keyof CompanyInfo)[])
    .filter((key) => companyInfo[key])
    .map((key) => labelValueRow(COMPANY_FIELD_LABELS[key], companyInfo[key] as string));

  const dimensionHeaderRow = new TableRow({
    tableHeader: true,
    children: ["構面", "構面分數", "加權占比"].map(
      (text) =>
        new TableCell({
          shading: { fill: ACCENT },
          children: [
            new Paragraph({
              children: [new TextRun({ text, bold: true, color: "FFFFFF" })],
            }),
          ],
        })
    ),
  });

  const dimensionRows = DIMENSION_ORDER.map((dim) => {
    const score = Math.min(100, Math.round(result.dimensionScores[dim]));
    return new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(DIMENSION_LABELS[dim])] }),
        new TableCell({ children: [new Paragraph(`${score}%`)] }),
        new TableCell({ children: [new Paragraph(`${DIMENSION_WEIGHTS[dim] * 100}%`)] }),
      ],
    });
  });

  return new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [new TextRun({ text: "製造業AI成熟度量表 診斷報告", bold: true, size: 36 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `產生日期：${new Date().toLocaleDateString("zh-TW")}`,
                color: "6B7280",
                size: 20,
              }),
            ],
          }),

          ...(companyRows.length > 0
            ? [
                sectionHeading("公司基本資料"),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: companyRows,
                }),
              ]
            : []),

          sectionHeading("AI成熟度等級"),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: result.levelName, bold: true, size: 32, color: ACCENT }),
              new TextRun({ text: `　${LEVEL_DESCRIPTIONS[result.level]}`, size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: `加權分數：${result.weightedScore.toFixed(1)} / 100` }),
            ],
          }),

          sectionHeading("整體評語"),
          bodyParagraph(commentary.overall),

          sectionHeading("五大構面明細"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [dimensionHeaderRow, ...dimensionRows],
          }),

          sectionHeading("五大構面說明"),
          ...DIMENSION_ORDER.flatMap((dim) => [
            subHeading(DIMENSION_LABELS[dim]),
            bodyParagraph(commentary.dimensionNotes[dim]),
          ]),

          sectionHeading("AI 導入策略建議"),
          bodyParagraph(
            "此建議依所屬的成熟度等級提供代表性參考內容；原站會再依五大構面的實際分數組合進一步客製化，因此與您在原站看到的文字可能略有不同。",
            { color: "9CA3AF", size: 16 }
          ),
          bodyParagraph(commentary.strategyAdvice),

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
  companyInfo: CompanyInfo
): Promise<void> {
  const doc = buildDocument(result, companyInfo);
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
