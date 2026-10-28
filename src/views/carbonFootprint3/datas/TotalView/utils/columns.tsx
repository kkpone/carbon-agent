/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-24 14:26:48
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-13 10:34:00
 */
import { Columns } from '@carbonstop/ui/dist/Table/types';
import I18N from '@src/lang/I18N';
import TextOverflowTable from '@src/views/carbonFootprint3/component/TextOverflowTable';
import TextWidthOverflow from '@src/views/carbonFootprint3/component/TextOverflowTable/byWidth';

import { calcRowSpan } from '.';
import { EmissionTotalListData } from '../type';

export const emissionTotalListColumns = ({
  data,
}: {
  data: EmissionTotalListData[];
}): Columns[] => [
  {
    dataIndex: 'stage',
    title: I18N.carbonFootprint.lifeCycleStage,
    width: 150,
    onCell: (da, ind) => {
      const v = calcRowSpan<EmissionTotalListData>({
        data,
        key: 'stage',
        currentIndex: ind ?? 0,
        row: da,
      });
      return v;
    },
  },
  {
    dataIndex: 'name',
    title: I18N.carbonFootprint3.emissionSourceName,
    width: 200,
    render: text => (
      <TextOverflowTable value={text || '-'} maxLength={15} maxWidth={180} />
    ),
  },
  {
    dataIndex: 'type',
    title: I18N.carbonFootprint.type,
    width: 120,
  },
  {
    dataIndex: 'amountUnit',
    title: I18N.carbonFootprint.quantity,
    width: 180,
    render: (val: string) => (
      <TextOverflowTable value={val || '-'} maxLength={16} maxWidth={180} />
    ),
  },
  {
    dataIndex: 'emissionTotal',
    title: I18N.carbonFootprint3.emissionKg,
    width: 150,
    render: text => (
      <TextOverflowTable value={text || '-'} maxLength={15} maxWidth={150} />
    ),
  },
  {
    dataIndex: 'factorUnitName',
    title: I18N.carbonFootprint.emissionFactors,
    width: 150,
    render: (val: string) => (
      <TextOverflowTable value={val || '-'} maxLength={15} maxWidth={150} />
    ),
  },
  {
    title: I18N.carbonFootprint3.transportationEmissionsK,
    dataIndex: 'transTotal',
    width: 250,
    render: text => {
      if (text === '0') {
        return '-';
      }
      return <TextWidthOverflow width={200} value={text} />;
    },
  },
];
