import I18N from '@src/lang/I18N';
import type { ColumnsType } from 'antd/lib/table';

import TextWidthOverflow from '@/views/carbonFootprint3/component/TextOverflowTable/byWidth';

import type { SerachCarbonFactorResult } from '../type';
import FactorNameCell from './components/FactorNameCell';

/** 仅供当前共用弹窗使用，不改变旧版页面的公共列配置。 */
export const withEcoinventColumns = (
  columns: ColumnsType<SerachCarbonFactorResult>,
): ColumnsType<SerachCarbonFactorResult> => {
  const displayColumns = columns.map(column =>
    'dataIndex' in column && column.dataIndex === 'name'
      ? {
          ...column,
          width: 360,
          render: (_: string | undefined, record: SerachCarbonFactorResult) => (
            <FactorNameCell factor={record} />
          ),
        }
      : column,
  );
  const insertAt =
    displayColumns.findIndex(
      column => 'dataIndex' in column && column.dataIndex === 'unit',
    ) + 1;
  return [
    ...displayColumns.slice(0, insertAt),
    {
      title: I18N.components.geographicLocation,
      key: 'ecoinventGeography',
      dataIndex: 'ecoinventGeography',
      width: 180,
      render: (_, record) => (
        <TextWidthOverflow
          value={record.ecoinventGeography || '-'}
          width={150}
        />
      ),
    },
    ...displayColumns.slice(insertAt),
  ];
};
