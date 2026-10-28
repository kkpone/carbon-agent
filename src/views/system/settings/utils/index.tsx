import I18N from '@src/lang/I18N';
import { Dicts } from '@src/views/emission/Show/type';
import { ColumnsType } from 'antd/es/table';
import { LogRow } from './type';

type LogColumnTypes = <T = LogRow>(operationModule: Dicts[]) => ColumnsType<T>;

export const logColumn: LogColumnTypes = operationModule => [
  {
    title: I18N.carbonFootprint.number,
    dataIndex: 'index',
    width: 120,
  },
  {
    title: I18N.system.operatorName,
    dataIndex: 'employName',
    width: 100,
  },
  {
    title: I18N.system.operatorAccount,
    width: 150,
    dataIndex: 'userName',
  },
  {
    title: I18N.system.operationModule,
    width: 150,
    dataIndex: 'moduleType',
    render: t => operationModule.find(d => d.dictValue === t)?.dictLabel || '',
  },
  {
    title: I18N.Certification.operationTime,
    width: 200,
    dataIndex: 'createTime',
  },
  {
    title: I18N.system.operationLog,
    dataIndex: 'operValue',
  },
];
