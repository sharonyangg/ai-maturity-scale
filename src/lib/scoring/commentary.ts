import { DIMENSION_LABELS } from "./dimensions";
import { getWeakestDimensions } from "./engine";
import type { DimensionKey, Level } from "./types";

export interface LevelCommentary {
  overall: string;
  strategyAdvice: string;
}

/**
 * 依實際作答動態產生「最弱構面」提醒，取代靜態範本裡籠統的「最弱構面」字樣。
 * 對應 SOP 要求：後續輔導須針對評估結果的最弱構面安排資源。
 */
export function buildWeakestDimensionNote(dimensionScores: Record<DimensionKey, number>): string {
  const weakest = getWeakestDimensions(dimensionScores);
  if (weakest.length === 0) {
    return "本次評估五大構面發展相對均衡，尚無明顯落後之單一構面。";
  }
  const names = weakest.map((d) => `『${DIMENSION_LABELS[d]}』`).join("與");
  return `資料顯示貴單位目前在${names}尚有成長空間，建議後續優先針對此弱項安排輔導資源。`;
}

/**
 * 暫定簡短版建議行動文案，待正式文案確認後再替換。
 * 五大構面說明為固定文字，見 DIMENSION_DESCRIPTIONS（dimensions.ts）。
 */
export const LEVEL_COMMENTARY: Record<Level, LevelCommentary> = {
  1: {
    overall:
      "經本系統綜合評估，貴單位之企業成熟度現屬『Level 1：萌芽期』。檢視現有營運架構，尚處於初期發展階段。為有效提升營運體質，本基地建議現階段應導入『高密度輔導』機制，並將資源優先聚焦於『組織基礎建置』與『核心服務流程』之確立。後續輔導頻率建議原則為『每2週1次』，期透過專家顧問之密集協作，協助貴單位落實內部管理規章與標準作業流程（SOP），以奠定後續永續經營之良好基礎。",
    strategyAdvice:
      "建議先盤點組織現況，優先建立決策分工、基本財務報表與服務流程等基礎制度，再逐步規劃數位化與永續發展方向。",
  },
  2: {
    overall:
      "經本系統綜合評估，貴單位之企業成熟度評定為『Level 2：發展期』。評估結果顯示，貴單位之營運架構及核心服務『已具雛型』。為進一步突破營運瓶頸並擴大發展效益，建議後續輔導策略應針對評估結果之『最弱構面』，專案安排『3至5次之專家輔導』。期盼透過針對性之資源挹注，協助貴單位具體『強化商業模式與服務品質』，俾利達成穩健成長與提升整體服務量能之目標。",
    strategyAdvice:
      "建議挑選 1～2 個優先構面深化推動，並建立定期檢視機制，逐步將初步作為轉化為可持續的標準流程。",
  },
  3: {
    overall:
      "經本系統綜合評估，貴單位之企業成熟度已達『Level 3：成長期』。評估結果顯示，貴單位整體營運『體質穩健』，已具備一定之市場基礎與服務能量。為協助貴單位持續擴大社會影響力，後續輔導重點建議聚焦於『數位轉型』、『通路拓展』及『規模化』等核心議題。考量貴單位已具備高度自主營運能力，後續輔導頻率可適度調整降為『每月1次』，透過策略性之顧問諮詢，協助對接跨界資源，加速組織升級。",
    strategyAdvice:
      "建議強化跨構面的資料串接與制度整合，並建立量化指標追蹤各項能力對整體績效的貢獻，逐步邁向規模化。",
  },
  4: {
    overall:
      "經本系統綜合評估，貴單位之企業成熟度屬最高級別『Level 4：成熟期』。各項指標均顯示貴單位在組織治理、服務交付及商業模式等構面發展均衡且成效卓著。針對此階段，本基地建議貴單位可朝『轉型為標竿團隊』之方向邁進。後續基地將積極為貴單位安排『經驗分享』與『異業合作媒合』等專案活動，以擴展產業影響力；同時，亦將把貴單位之優良營運模式『列入基地成果案例』中，作為其他進駐團隊之觀摩典範。",
    strategyAdvice:
      "建議將成熟的做法制度化並對外分享經驗，同時持續優化各構面間的協同效益，強化組織因應風險的韌性。",
  },
};
