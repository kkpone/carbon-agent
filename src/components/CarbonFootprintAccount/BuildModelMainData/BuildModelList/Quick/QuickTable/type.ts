import { MenuData } from '@src/components/MenuList/type';
import { SerachCarbonFactorResult } from '@src/components/SearchFactor/type';
import { AccountingInfoData } from '@src/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';
import { FactorPatternType } from '@src/views/emission/utils/index-type';
import { Ref } from 'react';

import { BuildModelVisualChangeType } from '../../../BuildModelVisual/constant';
import { ApiExtraParams, BuildModelMainDataProps } from '../../../type';
import { BuildModelListProps } from '../../type';

export type BuildModelListQuickTableRef = {
  reset: () => void;
};

export type BuildModelVisualRef = {
  updateGraph: () => Promise<any>;
  updateAiGraph: () => Promise<number>;
  updateAiGraphName: (id: string, name: string) => void;
  closeUpdateAiGraph: () => void;
  aiChangeType: (data: BuildModelVisualChangeType) => void;
  renderGraphByAiProcess: (opt?: { moveGraph?: boolean }) => void;
};

export type BuildModelListQuickTableProps = {
  accountInfo: AccountingInfoData;
  apiExtraParams: ApiExtraParams;
  menuInfo: MenuData;
  emissonCallBack: (opt?: { resetMenu?: boolean }) => void;
  isDetail?: boolean;
  /** 子组件ref */
  cRef?: Ref<BuildModelListQuickTableRef | undefined>;
  noSelectEmissionBtn?: BuildModelListProps['noSelectEmissionBtn'];
  noSaveStoreBtn?: BuildModelListProps['noSaveStoreBtn'];
  quickDrawerMatchWayBtns: BuildModelMainDataProps['quickDrawerMatchWayBtns'];
  quickDrawerMatchWayBtnValue?: BuildModelMainDataProps['quickDrawerMatchWayBtnValue'];
  onlyCreateFactor?: boolean;
  isInSupplyChain?: boolean;
  changeEmission?: () => void;
  enableFactorSourceRange?: boolean;
};

export type QuickAccounEmissionParams = {
  accountId: number | string;
  stage: number | string;
  type?: number | string;
  pageNum?: number;
  pageSize?: number;
};

export type QuickAccountEmissionBatchDeleteParams = {
  emissionIds: number[];
  tmpEmissionIds: number[];
  snapFlag: number;
};

interface MatchObject {
  area: string;
  business: string;
  countries: string;
  description: string;
  factor: string;
  factorType: string;
  factorUse: string;
  id: number;
  institution: string;
  name: string;
  sourceLevel: string;
  unit: string;
  year: string;
}

/**
 * @description: 运输相关的数据
 */
export interface TypeExtra {
  way: number;
  /** 运输单位标识 */
  distUnitCode?: string;
  /** 运输单位名称 */
  distUnitName?: string;
  unitCode?: string;
  unitName: string;
  /** 数量、重量、百分比 */
  amount?: string;
  /** 运输公里 */
  distance?: string;
}

/**
 * @description: 排放源列表数据
 */
export interface QuickAccountModelEmissionData {
  factorPattern?: FactorPatternType;
  ecoinventValueVisible?: boolean;
  // 是否是ai临时排放源
  aiFlag?: number;
  id: number;
  companyId: number;
  amount: number;
  modelId: number;
  stage: string;
  name: string;
  type: number;
  unitCode: string;
  unitName: string;
  rate: string;
  matchWay: string;
  matchId: number;
  matchName: string;
  factor: string;
  factorUnit: string;
  institution: string;
  year: string;
  status: number;
  libState: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateTime: string;
  remark: string;
  delFlag: number;
  matchObject: MatchObject;
  factorObj: SerachCarbonFactorResult;
  supplierObj?: Record<string, any>;
  businessId?: number;
  emissionTotal: string;
  emissionRate: number;
  requestState: number;
  typeExtra?: TypeExtra;
  needTrans?: number;
  transTotal?: string;
  stageName?: string;
  stage_name?: string;
  wpsSheetId?: string | number;
  sheetId?: string | number;
  sheetIndex?: number;
}
