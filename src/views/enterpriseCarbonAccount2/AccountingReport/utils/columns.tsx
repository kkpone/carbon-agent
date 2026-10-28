/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-10 15:14:20
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-17 15:52:51
 */
import { checkPermissions } from '@src/components/Permission/utils';
import { TableActions } from '@src/components/Table/components/TableActions';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { ColumnsType } from 'antd/es/table';
import { compact } from 'lodash-es';
import { useHistory } from 'react-router-dom';

import { recordReportDownload } from './service';

// 1:报告摘要GHG版 / 2: 完整报告GHG版 / 3:清册文件GHG版本/ 4: 报告摘要ISO版 / 5: 完整报告ISO版 / 6: 清册文件ISO版本
const reportVersion = [
  null,
  I18N.enterpriseCarbonAccount2.reportSummaryG,
  I18N.enterpriseCarbonAccount2.completeReportG,
  I18N.enterpriseCarbonAccount2.inventoryFileG,
  I18N.enterpriseCarbonAccount2.reportSummaryI,
  I18N.enterpriseCarbonAccount2.completeReportI,
  I18N.enterpriseCarbonAccount2.inventoryFileI,
];

// 0生成中 1成功 2失败
const reportStatus = {
  pending: 0,
  success: 1,
  fail: 2,
} as const;

const ReportStatusText = {
  [reportStatus.pending]: I18N.carbonFootprint.generating,
  [reportStatus.success]: I18N.carbonFootprint3.successfullyGenerated,
  [reportStatus.fail]: I18N.enterpriseCarbonAccount2.generationFailed,
};

type ColumnsTypes = <T = any>(props: {
  history: ReturnType<typeof useHistory>;
  accountReport: (type: string, row: T) => any;
  reGenerateReport: ({
    reportFileRecordId,
  }: {
    reportFileRecordId: string;
  }) => void;
}) => ColumnsType<T>;

export const columns: ColumnsTypes = ({
  history,
  accountReport,
  reGenerateReport,
}) => [
  // 核算报告列表
  {
    title: I18N.carbonFootprint.number,
    dataIndex: 'index',
    width: 80,
    fixed: 'left',
  },
  {
    title: I18N.carbonFootprint.reportName,
    dataIndex: 'reportName',
    ellipsis: true,
    fixed: 'left',
    width: 200,
    render: (text: number) => text || '-',
  },
  {
    title: I18N.enterpriseCarbonAccount2.reportVersion,
    dataIndex: 'versionType',
    ellipsis: true,
    fixed: 'left',
    width: 200,
    render: (text: number) => reportVersion[text] || '-',
  },
  {
    title: I18N.carbonFootprint.accountingCycle,
    dataIndex: 'period',
    ellipsis: true,
    width: 160,
    render: (text: number) => text || '-',
  },
  {
    title: I18N.enterpriseCarbonAccount2.totalEmissionsT2,
    dataIndex: 'totalQuantity',
    ellipsis: true,
    width: 210,
    render: (text: number) => text || '-',
  },
  {
    title: I18N.enterpriseCarbonAccount2.creator,
    dataIndex: 'createBy',
    ellipsis: true,
    width: 120,
    render: (text: number) => text || '-',
  },
  {
    title: I18N.carbonFootprint.creationTime,
    dataIndex: 'createTime',
    ellipsis: true,
    width: 190,
    render: (text: number) => text || '-',
  },
  {
    title: I18N.enterpriseCarbonAccount2.generateStatus,
    dataIndex: 'status',
    ellipsis: true,
    width: 210,
    render: (text: number) => ReportStatusText[text] || '-',
  },
  {
    title: I18N.carbonFootprint.operation,
    dataIndex: 'supplyQuantity',
    fixed: 'right',
    width: 268,
    render: (text, record: any) => (
      <TableActions
        showActionNum={4}
        menus={compact([
          checkPermissions(
            {
              label: I18N.carbonFootprint3.details,
              key: I18N.carbonFootprint3.details,
              onClick: async () =>
                history.push(
                  `${RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportDetail}?id=${record.reportId}`,
                ),
            },
            'enterprise:report:info',
          ),
          record.status === reportStatus.success && {
            label: I18N.carbonFootprint.download,
            key: I18N.carbonFootprint.download,
            onClick: async () => {
              await recordReportDownload({
                reportFileRecordId: record.reportFileRecordId,
              });

              const downloadElement = document.createElement('a');
              downloadElement.style.display = 'none';
              downloadElement.href = record.path;
              downloadElement.download = record.fileName; // 下载后文件名
              document.body.appendChild(downloadElement);
              downloadElement.click(); // 点击下载
              document.body.removeChild(downloadElement);
            },
          },
          record.status === reportStatus.fail && {
            label: I18N.enterpriseCarbonAccount2.regenerate,
            key: I18N.enterpriseCarbonAccount2.regenerate,
            onClick: async () =>
              reGenerateReport({
                reportFileRecordId: record.reportFileRecordId,
              }),
          },
          checkPermissions(
            {
              label: I18N.carbonFootprint.delete,
              key: I18N.carbonFootprint.delete,
              onClick: async () => accountReport('delete', record),
            },
            'enterprise:report:delete',
          ),
        ])}
      />
    ),
  },
];
