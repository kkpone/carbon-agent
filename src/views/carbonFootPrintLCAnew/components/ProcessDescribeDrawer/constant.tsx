import I18N from '@src/lang/I18N';

import { PageTypeInfo } from '@/router/utils/enums';

const { add, edit, copy, show } = PageTypeInfo;

/** 抽屉标题 */
export const DRAWER_TITLE = {
  [add]: I18N.carbonFootPrintLCA.newAdditionProcess,
  [edit]: I18N.carbonFootPrintLCA.editingProcess,
  [copy]: I18N.carbonFootPrintLCA.copyProcess,
  [show]: I18N.carbonFootPrintLCA.detailedProcessDescription,
};

/** 数据类型 */
export const DATA_TYPE = {
  /** 实景数据 */
  REALISTIC_DATA: 1,
  /** 背景数据 */
  BACKGROUND_DATA: 2,
};

/** 报告披露 */
export const REPORT_DISCLOSURE = {
  /** 是 */
  YES: true,
  /** 否 */
  NO: false,
};
