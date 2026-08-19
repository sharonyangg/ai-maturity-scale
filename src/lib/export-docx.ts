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
import { encodeAnswers } from "./answer-codec";
import { pretestMarkerLine } from "./docx-code";
import { COMPANY_FIELD_LABELS, type CompanyInfo } from "./quiz-store";
import {
  DEFAULT_LEVEL_RANGES,
  DIMENSION_DESCRIPTIONS,
  DIMENSION_LABELS,
  DIMENSION_ORDER,
  DIMENSION_WEIGHTS,
  LEVEL_NAMES,
  type LevelRange,
} from "./scoring/dimensions";
import { buildWeakestDimensionNote, LEVEL_COMMENTARY } from "./scoring/commentary";
import { compareDimensionScores, computeResult } from "./scoring/engine";
import { QUESTIONS_BY_ID, QUESTION_PAGES, REPORT_SECTION_TITLES } from "./scoring/questions";
import type { Answers, DimensionKey, Level, Question, QuizResult } from "./scoring/types";
import type { PngSnapshot } from "./svg-to-png";

const ACCENT = "3D4E17"; // 深橄欖綠，docx 顏色字串不含 #
const ACCENT_SOFT = "F5EBBD"; // 淺乳黃
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

function calloutParagraph(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 150 },
    shading: { fill: ACCENT_SOFT },
    children: [new TextRun({ text, bold: true, color: ACCENT, size: 22, font: FONT })],
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

function questionContent(
  question: Question,
  answer: Answers[string],
  questionNumber: string,
  title: string
): (Paragraph | Table)[] {
  const titleParagraph = new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: `${questionNumber}.${title}`, bold: true, size: 22, font: FONT })],
  });

  const selected = typeof answer === "string" ? answer : undefined;
  return [titleParagraph, ...question.options.map((opt) => checkboxLine(opt.value === selected, opt.label))];
}

function dimensionAnswerTable(
  dimension: DimensionKey,
  answers: Answers,
  questionTitles: Record<string, string>
): Table {
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
          children: questionContent(question, answers[id], id, questionTitles[id] ?? question.title),
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

export interface DocxExportParams {
  result: QuizResult;
  companyInfo: CompanyInfo;
  answers: Answers;
  chartSnapshot: PngSnapshot | null;
  /** 有值代表這是後測報告，會加上前測後測比較彙總表與比較雷達圖說明 */
  prevAnswers?: Answers;
  /** 後台若有改過題目文字／構面權重／等級分數區間，傳進來覆蓋預設值；沒傳就用 questions.ts / dimensions.ts 的預設值 */
  questionTitles?: Record<string, string>;
  dimensionWeights?: Record<DimensionKey, number>;
  levelRanges?: Record<Level, LevelRange>;
}

/** 純 docx 物件組裝，不碰任何瀏覽器專屬 API，client（下載）與 server（寄信）都能用 */
export function buildResultDocument(params: DocxExportParams): Document {
  const { result, companyInfo, answers, chartSnapshot, prevAnswers } = params;
  const questionTitles = params.questionTitles ?? {};
  const dimensionWeights = params.dimensionWeights ?? DIMENSION_WEIGHTS;
  const levelRanges = params.levelRanges ?? DEFAULT_LEVEL_RANGES;
  const isPost = Boolean(prevAnswers);
  const prevResult = prevAnswers ? computeResult(prevAnswers, dimensionWeights, levelRanges) : null;

  const commentary = LEVEL_COMMENTARY[result.level];
  const weakestNote = buildWeakestDimensionNote(result.dimensionScores);
  const weightSummary = DIMENSION_ORDER.map(
    (dim) => `${DIMENSION_LABELS[dim]} ${Math.round(dimensionWeights[dim] * 100)}%`
  ).join("、");
  const dateStamp = new Date().toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const summaryHeaderRow = new TableRow({
    children: [
      labelCell("公司/機構名稱", companyInfo.companyName || "—", 50),
      labelCell(isPost ? "後測填答日期" : "填答日期", dateStamp, 50),
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
    const deltaText = prevResult
      ? `（前測 ${Math.min(100, Math.round(prevResult.dimensionScores[dim]))}% → 後測 ${score}%）`
      : "";
    return new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: `${label}、${title}：${score}%${deltaText}`, font: FONT })],
    });
  });

  const chartLabel = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [
      new TextRun({
        text: isPost ? "前測 vs 後測對照雷達圖" : "前測（Baseline）",
        bold: true,
        size: 18,
        color: ACCENT,
        font: FONT,
      }),
    ],
  });

  const chartCellContent: Paragraph[] = chartSnapshot
    ? [
        chartLabel,
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
    : [chartLabel, new Paragraph({ children: [new TextRun({ text: "（雷達圖）", font: FONT })] })];

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
          new Paragraph({
            spacing: { before: 100 },
            children: [new TextRun({ text: `各構面權重：${weightSummary}。`, size: 18, color: "6B7280", font: FONT })],
          }),
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
    dimensionAnswerTable(dim, answers, questionTitles),
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

  const comparisonBlocks: (Paragraph | Table)[] = [];
  if (prevResult) {
    const { mostImproved, stillWeak, deltas } = compareDimensionScores(
      prevResult.dimensionScores,
      result.dimensionScores
    );
    const totalDelta = result.weightedScore - prevResult.weightedScore;
    const comparisonRows = [
      labelValueRow("前測加權總分／分級", `${prevResult.weightedScore.toFixed(1)} 分／${LEVEL_NAMES[prevResult.level]}`),
      labelValueRow("後測加權總分／分級", `${result.weightedScore.toFixed(1)} 分／${LEVEL_NAMES[result.level]}`),
      labelValueRow("總分成長幅度", `${totalDelta >= 0 ? "+" : ""}${totalDelta.toFixed(1)} 分`),
      labelValueRow("最大進步構面", `${DIMENSION_LABELS[mostImproved]}（${deltas[mostImproved] >= 0 ? "+" : ""}${deltas[mostImproved].toFixed(1)} 分）`),
      labelValueRow("仍待強化構面", `${DIMENSION_LABELS[stillWeak]}（現為 ${result.dimensionScores[stillWeak].toFixed(1)} 分）`),
    ];
    comparisonBlocks.push(
      sectionHeading("前測後測比較彙總"),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        columnWidths: pctToTwips([25, 75]),
        rows: comparisonRows,
      }),
      calloutParagraph(
        `後續輔導建議：${totalDelta > 0 ? "本次評估已較前測成長" : "本次評估與前測相比尚待提升"}，建議優先針對『${DIMENSION_LABELS[stillWeak]}』安排下一輪輔導資源。`
      )
    );
  }

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
                text: `企業成熟度診斷問卷${isPost ? "（後測）" : "（前測）"}`,
                bold: true,
                size: 32,
                font: FONT,
              }),
            ],
          }),

          shadedBar("評量結果"),
          summaryTable,
          shadedBar(`企業成熟度等級：${result.levelName}`),
          bodyParagraph(`加權分數 ${result.weightedScore.toFixed(1)} / 100`, { color: "6B7280", size: 20 }),
          bodyParagraph(commentary.overall),
          calloutParagraph(weakestNote),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            columnWidths: pctToTwips([50, 50]),
            rows: [summaryChartRow],
          }),

          ...comparisonBlocks,

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
          calloutParagraph(
            "下一步：請依據上述弱項構面，聯繫窗口安排後續一對一輔導，共同擬定包含具體任務、負責人與期限的改善行動計畫。"
          ),

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
          new Paragraph({
            spacing: { before: 100 },
            children: [
              new TextRun({
                text: pretestMarkerLine(encodeAnswers(answers)),
                color: "D1D5DB",
                size: 12,
                font: FONT,
              }),
            ],
          }),
        ],
      },
    ],
  });
}

export function resultDocxFilename(params: Pick<DocxExportParams, "companyInfo" | "prevAnswers">): string {
  const dateStamp = new Date().toISOString().slice(0, 10);
  const namePart = params.companyInfo.companyName ? `${params.companyInfo.companyName}_` : "";
  const roundLabel = params.prevAnswers ? "後測" : "前測";
  return `${namePart}企業成熟度診斷報告_${roundLabel}_${dateStamp}.docx`;
}

/** server 端（API route）用：組出 docx 並打包成 Buffer，供寄信附件使用 */
export async function buildResultDocxBuffer(params: DocxExportParams): Promise<Buffer> {
  const doc = buildResultDocument(params);
  return Packer.toBuffer(doc);
}

export async function downloadResultDocx(params: DocxExportParams): Promise<void> {
  const doc = buildResultDocument(params);
  const blob = await Packer.toBlob(doc);
  const filename = resultDocxFilename(params);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
