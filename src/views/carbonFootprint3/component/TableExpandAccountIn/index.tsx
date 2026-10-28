/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-23 20:41:00
 * @Date: 2023-05-15 11:12:39
 * @@description:
 */
import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import { Table, TableColumnsType } from 'antd';

import { TableExpandAccountInProps } from './type';
import { ALL_EMISSION_LABEL } from '../../constant';
import {
  getAccountProcessInExpand,
  getProcessInExpand,
} from '../../discharge/process/service';
import TextOverflowTable from '../TextOverflowTable';

const TableExpandAccountIn = <DataItem extends { matchTypeId: number }>({
  record,
  isProcess,
  apiExtraParams,
}: TableExpandAccountInProps<DataItem>) => {
  const getApiExtraParams = apiExtraParams || {};
  const { matchTypeId } = record;

  const { loading, data: dataSource } = useRequest(
    () =>
      isProcess
        ? getProcessInExpand({ ...getApiExtraParams, matchTypeId })
        : getAccountProcessInExpand({
            ...getApiExtraParams,
            matchTypeId,
          }),
    {
      refreshDeps: [],
      loadingDelay: 100,
    },
  );

  /** 输入 - 过程展开表格 */
  const genInProcessTableColumns = (): TableColumnsType<any> => {
    const data: TableColumnsType<any> = [
      {
        title: I18N.carbonFootprint3.nameOfOutput,
        dataIndex: 'name',
        width: 200,
        render: text => (
          <TextOverflowTable maxWidth={200} value={text || ''} maxLength={10} />
        ),
      },
      {
        title: I18N.carbonFootprint3.outputType,
        dataIndex: 'type',
        width: 150,
        render: type => ALL_EMISSION_LABEL()[type] || '-',
      },
      {
        title: I18N.carbonFootprint3.actualUsage,
        dataIndex: 'useAmount',
        width: 150,
        render: (text, record) => (text ? `${text}${record.unitName}` : '-'),
      },
      {
        title: I18N.carbonFootprint.emissions,
        dataIndex: 'emissionTotal',
        width: 200,
        render: text => (text ? `${text}kgCO₂e` : '-'),
      },
    ];
    return data;
  };

  return (
    <Table
      loading={loading}
      rowKey='id'
      columns={genInProcessTableColumns()}
      dataSource={dataSource?.data.data || []}
      pagination={false}
    />
  );
};

export default TableExpandAccountIn as <
  DataItem extends { matchTypeId: number },
>(
  record: TableExpandAccountInProps<DataItem>,
) => JSX.Element;
