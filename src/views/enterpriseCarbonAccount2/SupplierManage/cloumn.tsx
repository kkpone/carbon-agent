/*
 * @Author: 李星辰 xingchen@carbonstop.net
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-20 11:38:36
 * @Date: 2022-12-27 10:34:47
 * @@description: 供应商 - 列表
 */
import I18N from '@src/lang/I18N';
import { checkPermissions } from '@src/components/Permission/utils';
import { TableActions } from '@src/components/Table/components/TableActions';
import { RouteMaps } from '@src/router/route-paths';
import { RouterHistory } from '@src/types';
import { statusArr } from '@src/views/supplyChain2/carbonDataManage/cloumn';
import { ColumnsType } from 'antd/lib/table/interface';
import { compact } from 'lodash-es';

import { InnerEnterpriseListTableData } from './type';
/**
 * 供应商管理- 供应商列表
 */
export const supplyChainSupplierManageCloumn = ({
  history,
}: {
  history: RouterHistory;
}): ColumnsType<InnerEnterpriseListTableData> => [
  {
    title: I18N.carbonFootprint3.supplierName,
    dataIndex: 'companyName',
    ellipsis: true,
    width: 200,
    render: (text: string) => {
      const lastFour = text?.substring(text.length - 4, text.length);
      const isCcloud = lastFour === I18N.carbonFootprint3.carbonCloud2;
      if (isCcloud) {
        const sesult = text?.substring(0, text.length - 4);
        return (
          <div className='flex-a-c'>
            <span>{sesult}</span>
            <span className='cCloud'>{I18N.carbonFootprint3.carbonCloud}</span>
          </div>
        );
      }
      return text;
    },
  },
  {
    title: I18N.carbonFootprint3.dataDemandFunction,
    dataIndex: 'demand',
    ellipsis: true,
    width: 180,
    render: (text: number) => text || '-',
  },
  {
    title: I18N.carbonFootprint3.greenhouseGasEmissions,
    dataIndex: 'emissionDesc',
    ellipsis: true,
    width: 208,
    render: (text: number) => text || '-',
  },
  {
    title: I18N.carbonFootprint.state,
    dataIndex: 'status',
    ellipsis: true,
    width: 112,
    render: (text: number) => (
      <div className={statusArr[text].class}>{statusArr[text].value}</div>
    ),
  },
  {
    title: I18N.carbonFootprint3.submissionTime,
    dataIndex: 'submitTime',
    ellipsis: true,
    width: 192,
    render: (text: number) => text || '-',
  },
  {
    title: I18N.carbonFootprint3.reviewer,
    dataIndex: 'auditUser',
    ellipsis: true,
    width: 200,
    render: (text: number) => text || '-',
  },
  {
    title: I18N.carbonFootprint3.reviewTime,
    dataIndex: 'auditTime',
    ellipsis: true,
    width: 200,
    render: (text: number) => text || '-',
  },
  {
    title: I18N.carbonFootprint3.reviewRemarks,
    dataIndex: 'content',
    ellipsis: true,
    width: 200,
    render: (text: number) => text || '-',
  },
  {
    title: I18N.carbonFootprint.operation,
    dataIndex: 'versionCode',
    ellipsis: true,
    fixed: 'right',
    width: 130,
    render: (text: string, record) => {
      const arr = compact([
        checkPermissions(
          {
            key: '1',
            label: I18N.carbonFootprint.check,
            onClick: async () => {
              history.push(
                `${RouteMaps.enterpriseCarbonAccountingSupplierManagDetail}?id=${record.id}`,
              );
            },
          },
          'supplier:data:info',
        ),
      ]);
      if (record.status === 2) {
        arr.unshift(
          // @ts-ignore
          checkPermissions(
            {
              key: '2',
              label: I18N.carbonFootprint3.auditing,
              onClick: async () => {
                history.push(
                  `${RouteMaps.enterpriseCarbonAccountingSupplierManageAudit}?id=${record.id}`,
                );
              },
            },
            'supplier:enterprise:audit',
          ),
        );
      }
      return <TableActions menus={arr} />;
    },
  },
];
