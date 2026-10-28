import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';
import { ValueOf } from 'type-fest';

/** 查询数据质量 - 评价范围 */
export function getReportScope(params: { accountType: number }) {
  return request<{ data: any }>({
    method: 'get',
    url: `footprint3/report/scope`,
    params,
  });
}

const accountType = {
  quick: 0,
  process: 1,
} as const;

export function getAccountList(params: {
  pageNum: number;
  pageSize: number;
  type: ValueOf<typeof accountType>;
}) {
  return request<AxiosResponse<{ name: string; url: string }>>({
    method: 'get',
    url: `footprint3/account/listAuth`,
    params,
  });
}

// 定义 reportActivityList 和 reportFactoryList 数组中对象的类型
type ActivityOrFactoryType = {
  code: number;
  name: string;
  dataType: number;
  // 注意：以下属性名虽特殊，但按要求保留
  __DO_NOT_USE_THIS_PROPERTY_index__: number;
};

// 定义整体数据类型
export type ReportInfo = {
  type: 0 | 1; //报告类型:0-碳足迹报告;1-产品对比报告
  reportAccountList: [
    {
      accountId: number;
    },
  ];
  reportActivityList?: ActivityOrFactoryType[];
  reportFactoryList?: ActivityOrFactoryType[];
  companyProfile: string; //企业简介
  suppose: string; //产品碳足迹评价的假设
  accountType: ValueOf<typeof accountType>;
};

interface Report {
  accountSnapList: null;
  accountType: null;
  accounttId: null;
  companyId: number;
  companyProfile: string;
  createBy: number;
  createTime: null;
  delFlag: null;
  description: null;
  extra: null;
  fileName: string;
  fileUrl: string;
  id: number;
  loginUser: null;
  productCount: number;
  reportActivityList: any[];
  reportFactoryList: any[];
  reportId: number;
  reportName: string;
  snapCode: string;
  suppose: string;
  type: number;
  updateBy: number;
  updateByName: null;
  updateTime: null;
}

export function postReportAddAuth(data: ReportInfo) {
  return request<AxiosResponse<Report>>({
    method: 'post',
    url: `footprint3/report/addAuth`,
    data,
  });
}
