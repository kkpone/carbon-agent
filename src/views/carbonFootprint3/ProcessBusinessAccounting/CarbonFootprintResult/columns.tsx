/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-02 09:45:03
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-25 20:59:33
 */
import I18N from '@src/lang/I18N';
import { TableColumnsType } from 'antd';

import { Emission } from './type';
import TextOverflowTable from '../../component/TextOverflowTable';

const MAX_LENGTH = 20;

export const productColumns: (
  stageCountMap: Record<string, number>,
) => TableColumnsType<Emission> = stageCountMap => [
  {
    title: I18N.carbonFootprint3.functionalUnitOver,
    width: 150,
    dataIndex: 'stage',
    fixed: 'left',
    render: text => (
      <TextOverflowTable
        maxWidth={150}
        value={text || '-'}
        maxLength={MAX_LENGTH}
      />
    ),
    onCell: ({ stage, stageIndex }) => {
      const count = stageCountMap[stage];
      return { rowSpan: stageIndex === 1 ? count : 0 };
    },
  },
  {
    title: I18N.carbonFootprint3.nameOfOutput,
    dataIndex: 'productName',
    fixed: 'left',
    width: 200,
    render: text => (
      <TextOverflowTable
        maxWidth={200}
        value={text || '-'}
        maxLength={MAX_LENGTH}
      />
    ),
  },
  {
    title: I18N.carbonFootprint3.outputType,
    width: 120,
    dataIndex: 'productType',
  },
  {
    title: I18N.carbonFootprint3.actualUsage,
    width: 150,
    dataIndex: 'amount',
    render: (_, { amount, unitName }) => (
      <TextOverflowTable
        maxWidth={150}
        value={amount + unitName}
        maxLength={MAX_LENGTH}
      />
    ),
  },
  {
    title: I18N.carbonFootprint3.partitionCoefficient,
    width: 120,
    dataIndex: 'shareRate',
    render: text => (text ? `${text}%` : '-'),
  },
  {
    width: 150,
    title: I18N.carbonFootprint.emissionKg,
    dataIndex: 'emissionTotal',
    render: text => (
      <TextOverflowTable
        maxWidth={150}
        value={text || '-'}
        maxLength={MAX_LENGTH}
      />
    ),
  },
];

export const inOutColumns: (
  processCountMap: Record<string | number, number>,
) => TableColumnsType<Emission> = processCountMap => [
  {
    title: I18N.carbonFootprint3.processName,
    dataIndex: 'processName',
    width: 200,
    fixed: 'left',
    render: text => (
      <TextOverflowTable value={text || '-'} maxLength={MAX_LENGTH} />
    ),
    onCell: ({ processId, processIndex }) => {
      const count = processCountMap[processId];
      return { rowSpan: processIndex === 1 ? count : 0 };
    },
  },
  {
    title: I18N.carbonFootprint3.inputOutputName,
    dataIndex: 'ioInputName',
    width: 150,
    fixed: 'left',
    render: text => (
      <TextOverflowTable
        maxWidth={150}
        value={text || '-'}
        maxLength={MAX_LENGTH}
      />
    ),
  },
  {
    title: I18N.carbonFootprint3.inputOutputClass,
    dataIndex: 'ioInputType',
    fixed: 'left',
    width: 150,
    render: text => (
      <TextOverflowTable
        maxWidth={150}
        value={text || '-'}
        maxLength={MAX_LENGTH}
      />
    ),
  },
  {
    title: I18N.carbonFootprint.quantity,
    width: 200,
    dataIndex: 'amount',
    render: (_, { amount, unitName }) =>
      amount ? (
        <TextOverflowTable
          maxWidth={200}
          value={amount + unitName}
          maxLength={MAX_LENGTH}
        />
      ) : (
        '-'
      ),
  },
  {
    title: I18N.carbonFootprint.emissionKg,
    width: 200,
    dataIndex: 'emissionTotal',
    render: text => (
      <TextOverflowTable value={text || '-'} maxLength={MAX_LENGTH} />
    ),
  },
];
