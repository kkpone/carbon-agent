import type { ApplicationInfo } from './ProductCarbonLabelApply/types';

/** 碳标签仅属于登录用户的桌面 Agent，不进入分享或移动端预览。 */
export type CarbonLabelTargetFields = {
  carbonLabelKey?: string;
  carbonLabelApplicationId?: string;
  carbonLabelApplyNum?: string;
  carbonLabelForceNew?: boolean;
  carbonLabelPreparedApplication?: ApplicationInfo;
  carbonLabelStatus?: number;
  messageId?: string;
};

export const canDisplayCarbonLabel = (
  readonly: boolean,
  shareId: string | undefined,
  viewportWidth: number,
) => !readonly && !shareId && viewportWidth >= 768;

export const getCarbonLabelTabKey = (
  target: CarbonLabelTargetFields,
): `carbonLabel:${string}` =>
  `carbonLabel:${
    target.carbonLabelKey || target.carbonLabelApplicationId || ''
  }`;
