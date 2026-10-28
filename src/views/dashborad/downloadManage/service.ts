import { request } from '../../../api/request';

// 下载列表
export function apiReportFileList(params) {
  return request({
    method: 'GET',
    url: `/management/reportFile/list`,
    params,
  });
}
