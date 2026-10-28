import { ApiExtraParams } from '@src/components/CarbonFootprintAccount/BuildModelMainData/type';

import { AccountingInfoData } from '../../AccountDetail/AccountInfo/type';

export type AccountEmissionTaskTarget = {
  emissionSourceId?: number | string | null;
  emissionSourceName: string;
  sourceAccountId?: number | string;
};

export type AccountInfoResultProps = {
  /** 核算详情 */
  accountInfo: AccountingInfoData;
  isDetail?: boolean;
  apiExtraParams?: ApiExtraParams;
  showAISuggestion?: boolean;
  /** 是否展示业务前瞻（分享页不传或传 false） */
  showBusinessForesight?: boolean;
  /** 是否隐藏结果页左侧产品概览栏 */
  hideOverviewPanel?: boolean;
  /** AI 减排建议引用回调，仅用于 agent 嵌入预览 */
  onAISuggestionReferenceSelect?: (content: string) => void;
  /** 排放源创建项目任务回调，仅用于 Agent 项目核算预览 */
  onEmissionTaskCreate?: (target: AccountEmissionTaskTarget) => void;
  onQuestionGuideClick?: (question: string) => void;
  onSuggestionReferenceAdd?: (referenceText: string) => void;
};
