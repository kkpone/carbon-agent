/** 碳足迹核算 - 产品状态 */
import I18N from '@src/lang/I18N';

export enum FootprintAccountProductStatus {
  ADD,
  EDIT,
  DETAIL,
}

export const FOOTPRINT_ACCOUNT_PRODUCT_LABEL = {
  [FootprintAccountProductStatus.ADD]: I18N.carbonFootprint3.newProductsAdded,
  [FootprintAccountProductStatus.EDIT]: I18N.carbonFootprint3.editProduct,
  [FootprintAccountProductStatus.DETAIL]: I18N.carbonFootprint3.productDetails,
} as const;
