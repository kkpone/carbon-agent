import { request } from '@api/request';

// 部门列表
/**
 * 获取用户所有权限
 * @returns
 */
export function postUserAllPermissions() {
  return request({
    method: 'POST',
    url: `/management/permission/getUserAllPermisions`,
    // data,
  });
}

/**
 * 获取用户身份信息
 * @returns
 */
export function getUserIdentity() {
  return request<{
    code: number;
    msg: string;
    data: {
      duration: number;
      demoDataList: Array<{
        productName: string;
        productId: number;
        accountId: number;
        jumpUrl: string;
        residueDay: number;
      }>;
      userDemo: number;
      trialExpired: number;
      productList: any[];
    };
    lang: null;
  }>({
    method: 'GET',
    url: `/management/product/getUserIdentity`,
  });
}

/**
 * 获取用户身份信息
 * @returns
 */
export function getUserCompanyType() {
  return request<{
    code: number;
    msg: string;
    data: {
      // 1 正常版 2 轻量版
      companyType: '1' | '2';
    };
    lang: null;
  }>({
    method: 'GET',
    url: `/management/user/queryUserCompany`,
  });
}
