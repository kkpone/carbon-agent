/**
 * @file 企业碳 Agent 第三方认证常量，仅服务企业认证业务。
 */
export const ENTERPRISE_CARBON_CERTIFICATION_AUTH_TYPE = '2' as const;

export const ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE = {
  ADD: 'add',
  EDIT: 'edit',
  SHOW: 'show',
} as const;

export const ENTERPRISE_CARBON_CERTIFICATION_EDITABLE_STATUSES = [
  '0',
  '3',
  '4',
  '5',
  '7',
  '8',
] as const;
