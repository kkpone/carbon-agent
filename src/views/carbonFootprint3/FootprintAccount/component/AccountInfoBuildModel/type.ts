import { ApiExtraParams } from '@src/components/CarbonFootprintAccount/BuildModelMainData/type';

import { BuildModelDescribeSet } from './constant';
import {
  AccountingInfoData,
  AccountingUpadteScopeParams,
} from '../../AccountDetail/AccountInfo/type';
import type { AccountEmissionTaskTarget } from '../AccountInfoResult/type';

export type AccountInfoBuildModelProps = {
  agentPreviewLayout?: boolean;
  buildLoading: boolean;
  isDetail?: boolean;
  /** 分享链接可编辑排放源（核算基础信息仍只读） */
  isShareEmissionEditable?: boolean;
  /** shareFlag=4/5 且 thirdId 有值：仅核算详情弹框只读，建模区不受影响 */
  accountInfoModalReadonly?: boolean;
  listOrGraph: BuildModelDescribeSet;
  accountInfo: AccountingInfoData;
  changeScope: (data: AccountingUpadteScopeParams) => void;
  changeListOrGraph: (listOrGraph: BuildModelDescribeSet) => void;
  updateAccountInfo: () => void;
  apiExtraParams?: ApiExtraParams;
  reportSnapCode?: string;
  authType?: string;
  hideListGraphSwitch?: boolean;
  noSaveStoreBtn?: boolean;
  /** Agent 项目预览中，从可视化节点创建任务 */
  onEmissionTaskCreate?: (target: AccountEmissionTaskTarget) => void;
};
