/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-02 09:45:03
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-26 17:38:04
 */
import I18N from '@src/lang/I18N';
import { TableColumnsType } from 'antd';

import { Emission } from './type';
import TextOverflowTable from '../../component/TextOverflowTable';

const MAX_LENGTH = 20;

export const tableColumns: (
  stageCountMap: Record<string, number>,
) => TableColumnsType<Emission> = stageCountMap => [
  {
    title: I18N.carbonFootprint.lifeCycleStage,
    dataIndex: 'stage',
    fixed: 'left',
    render: text => (
      <TextOverflowTable value={text || '-'} maxLength={MAX_LENGTH} />
    ),
    onCell: ({ stage, stageIndex }) => {
      const count = stageCountMap[stage];
      return { rowSpan: stageIndex === 1 ? count : 0 };
    },
  },
  {
    title: I18N.carbonFootprint3.emissionSourceName,
    dataIndex: 'name',
    fixed: 'left',
    render: text => (
      <TextOverflowTable value={text || '-'} maxLength={MAX_LENGTH} />
    ),
  },
  {
    title: I18N.carbonFootprint.type,
    dataIndex: 'type',
  },
  {
    title: I18N.carbonFootprint3.consumptionQuantity,
    dataIndex: 'amount',
    render: (_, { amount, unitName }) => (
      <TextOverflowTable
        maxWidth={200}
        value={amount + unitName}
        maxLength={MAX_LENGTH}
      />
    ),
  },
  {
    title: I18N.carbonFootprint.emissionKg,
    dataIndex: 'emissionTotal',
    render: text => <TextOverflowTable value={text} maxLength={MAX_LENGTH} />,
  },
  {
    title: I18N.carbonFootprint3.emissionProportion,
    width: '160',
    dataIndex: 'percentage',
    render: text => text || '-',
  },
  {
    title: I18N.carbonFootprint.emissionFactors,
    dataIndex: 'factorUnitName',
    render: text => (
      <TextOverflowTable value={text || '-'} maxLength={MAX_LENGTH} />
    ),
  },
];
