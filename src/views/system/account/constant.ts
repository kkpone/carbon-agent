import I18N from '@src/lang/I18N';

export const PRODUCT_TYPE = {
  ACTIVATED: 1,
  TRIAL: 2,
  EXPIRED: 3,
};

export const PRODUCT_TYPE_LABEL = () => ({
  [PRODUCT_TYPE.ACTIVATED]: I18N.system.opened,
  [PRODUCT_TYPE.TRIAL]: I18N.system.trialVersion,
  [PRODUCT_TYPE.EXPIRED]: I18N.system.expired,
});
