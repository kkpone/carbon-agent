/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-02-24 17:17:43
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-30 14:20:56
 */
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/lib/table';

const auditState = [
  { class: 'gray base', value: I18N.carbonFootprint3.unfilled },
  { class: 'blue base', value: I18N.carbonFootprint3.fillingIn },
  { class: 'off base', value: I18N.carbonFootprint3.pendingReview },
  { class: 'on base', value: I18N.carbonFootprint3.approved },
  { class: 'pass base', value: I18N.carbonFootprint3.reviewFailed2 },
];
/**
 * 供应商列表 - 查看 - 审核记录
 */
export const auditHistoryCloumn = (): ColumnsType<any> => [
  {
    title: I18N.carbonFootprint3.findingsOfAudit,
    dataIndex: 'result',
    fixed: 'left',
    ellipsis: true,
    width: 256,
    render: (text: number) => (
      <div className={auditState[text].class}>{auditState[text].value}</div>
    ),
  },
  {
    title: I18N.carbonFootprint3.reviewer,
    dataIndex: 'createBy',
    ellipsis: true,
    width: 120,
    render: (text: number) => text || '-',
  },
  {
    title: I18N.carbonFootprint3.reviewTime,
    dataIndex: 'createTime',
    ellipsis: true,
    width: 152,
    render: (text: number) => text || '-',
  },

  {
    title: I18N.carbonFootprint3.reviewRemarks,
    dataIndex: 'content',
    ellipsis: true,
    width: 162,
    render: (text: number) => text || '-',
  },
];
