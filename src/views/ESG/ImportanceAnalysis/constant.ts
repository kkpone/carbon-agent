import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';

export const IMPORTANCE_ANALYSIS_STATUS = {
  UN_PUBLISHED: 0,
  PUBLISHED: 1,
  CLOSED: 2,
  PUBLISHED_OR_CLOSED: 5,
};

export const IMPORTANCE_ANALYSIS_STATUS_LABEL = createI18nLabelMap({
  [IMPORTANCE_ANALYSIS_STATUS.UN_PUBLISHED]: () =>
    I18N.supplyChainCarbonManagement.unpublished,
  [IMPORTANCE_ANALYSIS_STATUS.PUBLISHED]: () =>
    I18N.supplyChainCarbonManagement.published,
  [IMPORTANCE_ANALYSIS_STATUS.CLOSED]: () => I18N.cbam.closed,
});
