import I18N from '@src/lang/I18N';
import {
  ACCOUNT_SELECT_LIFE_CYCLE_LABEL,
  AccountLifeCycle,
  FootprintAccountLifeCycle,
  FootprintAccountStatusType,
} from '@src/views/carbonFootprint3/FootprintAccount/constant';
import { QUICK_ACCOUNT_LIFE_CYCLE_LABEL } from '@src/views/carbonFootprint3/constant';

import { ModelSourceEnum } from './type';

/** 模型来源选项 */
export const MODEL_SOURCE_OPTIONS = [
  { label: I18N.carbonFootprint3.systemModel, value: ModelSourceEnum.SYSTEM },
  { label: I18N.carbonFootprint3.customModel, value: ModelSourceEnum.CUSTOM },
];

/** 系统边界选项 */
export const SYSTEM_BOUNDARY_OPTIONS = [
  {
    label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[FootprintAccountLifeCycle.HALF],
    value: FootprintAccountLifeCycle.HALF,
  },
  {
    label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[FootprintAccountLifeCycle.FULL],
    value: FootprintAccountLifeCycle.FULL,
  },
  {
    label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[FootprintAccountLifeCycle.CUSTOM],
    value: FootprintAccountLifeCycle.CUSTOM,
  },
];

/** 核算方式选项 */
export const ACCOUNTING_METHOD_OPTIONS = [
  {
    label: I18N.carbonFootprint3.quickAccounting,
    value: FootprintAccountStatusType.QUICK,
  },
  {
    label: I18N.carbonFootprint3.processAccounting,
    value: FootprintAccountStatusType.PROCESS,
  },
];

/** 生命周期阶段选项 */
export const LIFE_CYCLE_STAGE_OPTIONS = [
  {
    label: QUICK_ACCOUNT_LIFE_CYCLE_LABEL()[AccountLifeCycle.MATERIAL],
    value: AccountLifeCycle.MATERIAL,
  },
  {
    label: QUICK_ACCOUNT_LIFE_CYCLE_LABEL()[AccountLifeCycle.PRODUCT],
    value: AccountLifeCycle.PRODUCT,
  },
  {
    label: QUICK_ACCOUNT_LIFE_CYCLE_LABEL()[AccountLifeCycle.DISTRIBUTION],
    value: AccountLifeCycle.DISTRIBUTION,
  },
  {
    label: QUICK_ACCOUNT_LIFE_CYCLE_LABEL()[AccountLifeCycle.USE],
    value: AccountLifeCycle.USE,
  },
  {
    label: QUICK_ACCOUNT_LIFE_CYCLE_LABEL()[AccountLifeCycle.WASTE_DISPOSAL],
    value: AccountLifeCycle.WASTE_DISPOSAL,
  },
];

/** 系统边界描述 */
export const SYSTEM_BOUNDARY_DESC: Record<number, string> = {
  [FootprintAccountLifeCycle.HALF]:
    I18N.carbonFootprint.fromResourceExtraction2,
  [FootprintAccountLifeCycle.FULL]: I18N.carbonFootprint.fromResourceExtraction,
};
