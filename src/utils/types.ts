/** oss 路径 */
export enum SaasOssPath {
  'consulting-service' = 'consulting-service',
  'saas-authentication' = 'saas-authentication',
  'saas-mp4' = 'saas-mp4',
  'saas-product' = 'saas-product',
  'saas-supplychain' = 'saas-supplychain',
  'webset' = 'webset',
}

/** 数据统计接口字段 */
export type StatisticProps = {
  companyId: string | number;
  userId: string | number;
  productType: string | number;
  element: string | number;
  pageName: string | number;
  [k: string]: string | number;
};

export enum PageShowType {
  'show' = 'show',
  'add' = 'add',
  'edit' = 'edit',
}
