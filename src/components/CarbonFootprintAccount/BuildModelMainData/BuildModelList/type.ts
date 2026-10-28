import { AccountingInfoData } from '@src/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';
import { Ref } from 'react';

import { BuildModelListQuickTableRef } from './Quick/QuickTable/type';
import {
  ApiExtraParams,
  BuildModelListRefHandle,
  BuildModelMainDataProps,
} from '../type';

export type BuildModelListProps = {
  isDetail?: boolean;
  accountInfo: AccountingInfoData;
  apiExtraParams: ApiExtraParams;
  updateAccountInfo: () => void;
  editAccount: () => void;
  /** 子组件ref */
  cRef?: Ref<BuildModelListQuickTableRef | undefined>;
  listRef?: Ref<BuildModelListRefHandle | undefined>;
  /** 快速核算内层 侧滑抽屉选择因子等按钮 - 优先判断是否有传递的 没有的话默认产品碳足迹快速核算的标准 */
  quickDrawerMatchWayBtns?: BuildModelMainDataProps['quickDrawerMatchWayBtns'];
  /** 快速核算内 抽屉默认选中的按钮 - 选择因子，新建因子和发起收数 */
  quickDrawerMatchWayBtnValue?: BuildModelMainDataProps['quickDrawerMatchWayBtnValue'];
  /** 设置为true 为不显示侧滑抽屉的选择排放源按钮 */
  noSelectEmissionBtn?: boolean;
  /** 设置为true 不显示保存到库 操作按钮 */
  noSaveStoreBtn?: boolean;
  /** 设置为true 只显示新建因子按钮 */
  onlyCreateFactor?: boolean;
  isInSupplyChain?: boolean;
  changeEmission?: () => void;
  reportSnapCode?: string;
  authType?: string;
  enableFactorSourceRange?: boolean;
};
