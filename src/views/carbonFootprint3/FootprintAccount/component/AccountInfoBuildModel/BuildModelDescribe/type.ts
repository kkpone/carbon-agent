import { ApiExtraParams } from '@src/components/CarbonFootprintAccount/BuildModelMainData/type';
import { TypeExtra } from '@src/components/FormilyUtil/FormilyFactor/type';
import { FetchNewPage } from '@src/components/TableUtil/types/util';
import { QuickBusinessAccountingSourceInfo } from '@src/views/carbonFootprint3/QuickBusinessAccounting/type';
import { Emission } from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer/type';
import { Ref } from 'react';

import { StageEnumType } from './const';
import { AccountingInfoData } from '../../../AccountDetail/AccountInfo/type';
import { BuildModelDescribeSet } from '../constant';
import { AccountInfoBuildModelProps } from '../type';

export type BuildModelDescribeProps = {
  aiBuildSuccess?: boolean;
  aiLoading?: boolean;
  updateGaphByAi?: () => void;
  closeAiBuilding?: () => void;
  accountInfo: AccountingInfoData;
  switchMain: BuildModelDescribeSet;
  changeBuildMain: (value: BuildModelDescribeSet) => void;
  onOkImport: () => void;
  isDetail?: boolean;
  apiExtraParams?: ApiExtraParams;
  goModelingBack?: (status: boolean, closeStatus?: boolean) => void;
  updateAccountInfo?: () => void;
  cRefDescribe?: Ref<{ updateTempList: () => void } | undefined>;
  onClose?: (success: boolean) => void;
} & Pick<
  AccountInfoBuildModelProps,
  'changeScope' | 'changeListOrGraph' | 'hideListGraphSwitch'
>;

export type EmissionImportParams = {
  type: 1;
} & FetchNewPage;

/** 导入记录表格每一列数据 */
export interface EmissionImportTableList {
  id: number;
  companyId: number;
  module: number;
  module_name: string;
  name: string;
  totalRows: number;
  normalRows: number;
  errorRows: number;
  url: string;
  urlError: string;
  status: number;
  status_name: string;
  createTime: string;
  createBy: number;
  createByName: string;
  fail: number;
  failUrl: string;
}

/** ai建模临时列表请求参数 */
export type AiDataListApiParams = {
  // 核算id
  accountId: string | number;
  stage: StageEnumType;
} & FetchNewPage;

/** ai建模临时列表返回值 */
export type AiDataListApiData = {
  amount?: string;
  unitCodeArr?: string;
} & QuickBusinessAccountingSourceInfo;

/** AI 建模编辑临时列表 */
export type AiEditDataListApiData = {
  id: string;
  type?: number;
  name?: string;
  unitName?: string;
  unitCode?: string;
  amount?: number;
  unitCodeArr?: string;
  typeExtra?: TypeExtra;
  accountEmissionTransportList?: any[];
};

/** ai建模消耗数量自定义组件 */
export type FormAiDataAmountValue = {
  amount: number;
  unitCode: string;
  unitName: string;
  unitCodeArr: string[];
  type: number;

  distance?: number;
  // 数量必填
  amountRequire: boolean;
  // 单位必填
  unitCodeRequire: boolean;
  // 距离必填
  distanceRequire: boolean;

  transObj?: TypeExtra;
  way?: number;
  transportType?: number;
}[];

/** ai建模开始建模的参数 */
export type AddAiModelData = {
  // 核算id
  accountId: string | number;
  // 建模文案内容
  content?: string;
};

type FormValuesList = {
  key: number;
  name: {
    value: string;
    validReauire: boolean;
  };
  amountObj: FormAiDataAmountValue;
  set: { id: string; editStatus: boolean };
  type: number;
  stage: number;
};

/** 建模表单提交数据 */
export type AiDataFormValues = {
  AiDataList: FormValuesList[];
};

/** 提交建模后 接口返回值 */
export type AiDataSubApiBack = {
  // 是否必填数据未填写
  errorCode: number;
  // 哪一页数据有问题
  // indexs: number[];
  errorList: {
    stage: string;
    indexs: string;
  }[];
};

/**
 * 模型检查
 */
export type CheckModelData = {
  /**
   * 核算id
   */
  accountId: number;
  /**
   * 质量项列表
   */
  massList?: MassItem[];
  /**
   * 模型检查列表
   */
  modelCheckItems?: ModelCheckItem[];
  /**
   * 误差值
   */
  rate: number;
  /**
   * 当前修改rowId
   */
  updatedRowId: string;
  /**
   * AI 模型评价列表
   */
  evaluateList?: string[];
};

export interface MassItem {
  /**
   * 数量
   */
  amount?: number;
  /**
   * 排放源id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 单位重量
   */
  perWeight: string;
  /**
   * 行id
   */

  rowId: string;
  /**
   * 行类型：0产品，1排放源
   */
  rowType: number;
  /**
   * 排放源类型
   */
  type: number;
  /**
   * 单位标识
   */
  unitCode?: string;
  /**
   * 单位名称
   */
  unitName?: string;
  /**
   * 重量
   */
  weight: number;
  /** 质量类型：0非质量，1质量类型 */
  massType: number;
}

export interface ModelCheckItem {
  /**
   * 检查项code
   */
  code: number;
  /**
   * 检查项内容
   */
  data: Emission[];
  /**
   * 检查项提示名称
   */
  name?: string;
}
