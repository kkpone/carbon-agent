import { request } from '@api/request';

interface IReport {
  questionId: string; // 问题id
  questionCode: string; // 问题编码
  title: string; // 问题标题
  reportId: number; // 用户报告id
  content: string; // 内容
}

export function createReportData(data: IReport) {
  return request({
    method: 'POST',
    url: `/enterprise/cdp/reportData/create`,
    data,
  });
}
