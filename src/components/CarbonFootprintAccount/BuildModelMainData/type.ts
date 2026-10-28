import { AccountingInfoData } from '@src/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';
import { BuildModelDescribeSet } from '@src/views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/constant';
import { Ref } from 'react';

import {
  BuildModelListQuickTableRef,
  BuildModelVisualRef,
} from './BuildModelList/Quick/QuickTable/type';
import type { AccountEmissionTaskTarget } from '@/views/carbonFootprint3/FootprintAccount/component/AccountInfoResult/type';

/** 接口的标识属性 - 主要是针对跨产品的场景 - 目前是供应链要用到产品碳足迹的核算列表 - 但是由于过程核算抽离过于繁琐 */
export type ApiExtraParams = Record<string, any>;

export type BuildModelListRefHandle = {
  updateByAIProcess: () => void;
  refreshMenuAndEmissionTableAfterAiUpdate?: () => Promise<void>;
};

export type BuildModelMainDataProps = {
  enableTransportReuse?: boolean;
  agentPreviewLayout?: boolean;
  isDetail?: boolean;
  aiAnimationStatus?: boolean;
  accountInfo: AccountingInfoData;
  switchMain: BuildModelDescribeSet;
  updateAccountInfo: () => void;
  /** 子组件ref */
  cRef?: Ref<BuildModelListQuickTableRef | undefined>;
  listRef?: Ref<BuildModelListRefHandle | undefined>;

  cRefVisual: Ref<BuildModelVisualRef | undefined>;
  /** 快速核算内层 侧滑抽屉选择因子等按钮 - 优先判断是否有传递的 没有的话默认产品碳足迹快速核算的标准 */
  quickDrawerMatchWayBtns?: { value: number; label: string }[];
  /** 快速核算内 抽屉默认选中的按钮 - 选择因子，新建因子和发起收数 */
  quickDrawerMatchWayBtnValue?: number;
  /** 设置为true 为不显示侧滑抽屉的选择排放源按钮 */
  noSelectEmissionBtn?: boolean;
  /** 设置为true 不显示保存到库 操作按钮 */
  noSaveStoreBtn?: boolean;
  apiExtraParams?: ApiExtraParams;
  changeEmission?: () => void;
  editAccount: () => void;
  reportSnapCode?: string;
  enableFactorSourceRange?: boolean;
  authType?: string;
  /** Agent 项目预览中，从可视化节点创建任务 */
  onEmissionTaskCreate?: (target: AccountEmissionTaskTarget) => void;
};
