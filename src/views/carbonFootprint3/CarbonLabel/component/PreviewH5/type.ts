import type { ReactNode } from 'react';

import { CarbonLabelSubApiData } from '../../AddOrDetail/type';
import { AccountObj } from '../../type';

export type PreviewH5Props = {
  info?: InfoData;
  /** agent-version 只复用 Agent 外观，保留原历史版本的排放单位展示。 */
  variant?: 'legacy' | 'agent' | 'agent-version';
  labelPreview?: ReactNode;
};

/**
 * change 1 代表修改 undefined 代表未修改
 */
type InfoData = {
  account?: Pick<CarbonLabelSubApiData, 'startTime' | 'endTime' | 'unitName'>;
  accountObj?: AccountObj;
  /** 品牌名称修改 */
  brandChange?: number;
  /** 碳排放类别修改 */
  contrastChange?: number;
  /** 按足迹排放量修改 */
  perEmissionChange?: number;
  /** 核算周期：0隐藏，1显示，2修改核算周期 */
  accountPeriodChange?: number;
  /** 产品修改 */
  productChange?: number;
  /** 产品图片修改 */
  productPicChange?: number;
  /** 规格型号修改 0隐藏，1显示，2修改 */
  specsChange?: number;
  /** 碳排放分布：1修改碳排放分布，2数据变化 */
  stageChange?: number;
  specification?: string;
} & Partial<CarbonLabelSubApiData>;
