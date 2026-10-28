/** 抽屉类型 */
import I18N from '@src/lang/I18N';

export type DrawerType = 'flow' | 'PFC' | 'emission';

/** 排放种类 */
export const EMISSION_TYPE = {
  /** 源流 */
  FLOW: 1,
  /** PFC */
  PFC: 2,
  /** 排放源排放 */
  EMISSION: 3,
};
const { FLOW, PFC, EMISSION } = EMISSION_TYPE;

/** 排放种类对应的排放信息前缀 */
export const EMISSION_TYPE_PREFIX = {
  [FLOW]: I18N.cbam.emissionMethod,
  [PFC]: I18N.cbam.computingMethod,
  [EMISSION]: I18N.cbam.gasType,
};

/** 排放种类对应的抽屉类型 */
export const EMISSION_DRAWER_TYPE = {
  [FLOW]: 'flow',
  [PFC]: 'PFC',
  [EMISSION]: 'emission',
};
