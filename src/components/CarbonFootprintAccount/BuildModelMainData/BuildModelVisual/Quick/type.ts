import type { AccountingInfoData } from '@src/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';
import { Ref } from 'react';

import {
  BuildModelVisualRef,
  TypeExtra,
} from '../../BuildModelList/Quick/QuickTable/type';
import { ApiExtraParams, BuildModelMainDataProps } from '../../type';
import type { AccountEmissionTaskTarget } from '@/views/carbonFootprint3/FootprintAccount/component/AccountInfoResult/type';

export type QuickBuildVisualProps = {
  agentPreviewLayout?: boolean;
  aiAnimationStatus?: boolean;
  accountInfo: AccountingInfoData;
  cRef: Ref<BuildModelVisualRef | undefined>;
  isDetail?: boolean;
  apiExtraParams?: ApiExtraParams;
  changeEmission?: () => void;
  editAccount: () => void;
  noSaveStoreBtn?: boolean;
  noSelectEmissionBtn?: BuildModelMainDataProps['noSelectEmissionBtn'];
  quickDrawerMatchWayBtns?: BuildModelMainDataProps['quickDrawerMatchWayBtns'];
  quickDrawerMatchWayBtnValue?: BuildModelMainDataProps['quickDrawerMatchWayBtnValue'];
  updateAccountInfo: () => void;
  enableFactorSourceRange?: boolean;
  onEmissionTaskCreate?: (target: AccountEmissionTaskTarget) => void;
};

export type GraphEmissionSource = {
  id: number;
  // ai建模如果是1 代表ai建模显示数据
  aiFlag?: number;
  accountId: number;
  amount: number;
  unitName: string;
  name: string;
  typeName: string;
  stage: number;
  type: number;
  emissionTotal: string;
  status: number;
  libState: number;
  matchWay: number;
  requestState: number;
  rate: number;
  emissionRate: number;
  matchObject: Record<string, any>;
  accountRefer?: Record<string, any>;
  /** 明细 Excel 中 sheet 定位（accountView 可能挂在根节点，与 matchObject 一并写入画布 extraData） */
  wpsSheetId?: string | number;
  sheetId?: string | number;
  sheetIndex?: number;
  typeExtra?: TypeExtra;
  transTotal?: string;
  unitStr?: string;
  accountEmissionTransportList?: unknown[];
  needTrans?: number;
};

/** 生命周期的返回值 */
export type GraphAccountLifeCycleData = {
  code: number;
  name: string;
  total: string;
  typeName: string;
  rate: number;
  emissionList: GraphEmissionSource[][];
  startTime: string;
  endTime: string;
  type: string;
  scope: string;
  children?: GraphAccountLifeCycleData[];
};
