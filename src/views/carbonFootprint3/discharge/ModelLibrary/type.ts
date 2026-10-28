import I18N from '@src/lang/I18N';
import {
  AccountLifeCycle,
  FootprintAccountLifeCycle,
  FootprintAccountStatusType,
} from '@src/views/carbonFootprint3/FootprintAccount/constant';

import { createI18nLabelMap } from '@/lang/createI18nLabelMap';

/** 模型来源枚举 */
export enum ModelSourceEnum {
  /** 系统模型 */
  SYSTEM = 0,
  /** 自定义模型 */
  CUSTOM = 1,
}

export const MODEL_SOURCE_LABEL = createI18nLabelMap({
  [ModelSourceEnum.SYSTEM]: () => I18N.carbonFootprint3.systemModel,
  [ModelSourceEnum.CUSTOM]: () => I18N.carbonFootprint3.customModel,
});

export {
  /** 系统边界（半/全/自定义生命周期） */
  FootprintAccountLifeCycle as SystemBoundaryEnum,
  /** 核算方式（快速核算/过程核算） */
  FootprintAccountStatusType as AccountingMethodEnum,
  /** 生命周期阶段 */
  AccountLifeCycle as LifeCycleStageEnum,
};

/** 模型列表项 */
export interface ModelItem {
  id: number;
  modelName: string;
  /** 模型来源：1-系统模型 2-自定义模型 */
  source: ModelSourceEnum;
  sourceName: string;
  /** 行业类别 */
  industry: string;
  /** 列表接口返回的行业展示名 */
  industryNames?: string;
  /** 列表接口返回的更新时间 */
  updateTime?: string;
  /** 核算方式展示名（卡片等） */
  accountingMethodName?: string;
  /** 核算方式 */
  /** 系统边界 */
  scope: number;
  scopeValue: string;
  /** 备注 */
  intro: string;
  type: number;
}

/** 行业类别 */
export interface IndustryCategory {
  id: number;
  /** 行业类别名称 */
  name: string;
  /** 分类编码 */
  code: string;
  /** 备注 */
  remark: string;
  /** 0-系统行业类别 1-自定义行业类别 */
  type: number;
}

/** 模型列表查询参数 */
export interface ModelListParams {
  pageNum: number;
  pageSize: number;
  /** 模型名称 */
  modelName?: string;
  /** 模型来源 */
  source?: ModelSourceEnum;
  /** 系统边界 */
  scope?: FootprintAccountLifeCycle;
  /** 行业类别ID */
  industry?: string;
}

/** 新增/编辑模型表单 */
export interface ModelForm {
  /** 模型名称 */
  modelName: string;
  /** 行业类别 */
  industry: string;
  /** 备注 */
  intro?: string;
  /** 核算方式 */
  accountingMethod: FootprintAccountStatusType;
  /** 系统边界 */
  scope: number;
  scopeValue: number[];
}

/** 新增核算表单 */
export interface CreateAccountingForm {
  /** 产品名称/ID */
  productId: number;
  /** 核算数量 */
  quantity: number;
  /** 核算数量单位 */
  unitCode: string;
  /** 功能单位 */
  functionalUnit: string;
  /** 核算周期-开始 */
  startDate: string;
  /** 核算周期-结束 */
  endDate: string;
  /** 流程图文件 */
  flowChartFiles?: string[];
}

/** 行业类别表单 */
export interface IndustryCategoryForm {
  name: string;
  code?: string;
  remark?: string;
}
