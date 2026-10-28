/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-03-03 09:32:44
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-27 18:11:06
 */

/** 选择供应商列表传参 */
export interface InnerEnterpriseListParmas {
  companyName?: string;
  status?: number;
  reqType: number;
}

/** 选择供应商列表返回table数据 */
export interface InnerEnterpriseListTableData {
  id: number;
  status: number;
  message: string;
  base_uri?: string;
  normalized_param_string?: string;
  base_string?: string;
  signing_key?: string;
}

export interface InnerEnterpriseAuditParmas {
  id: number | string;
  result: number;
  content: string;
}
