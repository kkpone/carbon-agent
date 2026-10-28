import I18N from '@src/lang/I18N';

export const TAB_TYPE = {
  /** 产品基本信息 */
  BASIC_INFO: '1',
  /** 产品BOM */
  PRODUCT_BOM: '2',
  /** 供应商数据 */
  SUPPLY_DATA: '3',
  /** 生命周期数据 */
  LIFECYCLE_DATA: '4',
} as const;

const { BASIC_INFO, PRODUCT_BOM, LIFECYCLE_DATA } = TAB_TYPE;

export const TAB_OPTIONS = () => [
  {
    key: BASIC_INFO,
    label: I18N.carbonFootPrintLCA.basicProductInformation,
  },
  {
    key: PRODUCT_BOM,
    label: I18N.carbonFootPrintLCA.productBom,
  },
  // {
  //   key: SUPPLY_DATA,
  //   label: I18N.components.supplierData,
  // },
  {
    key: LIFECYCLE_DATA,
    label: I18N.carbonFootPrintLCA.numberOfLifeCycles,
  },
];
