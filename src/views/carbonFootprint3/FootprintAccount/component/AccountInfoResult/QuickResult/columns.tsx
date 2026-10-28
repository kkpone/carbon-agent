/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-02 09:45:03
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-26 17:38:04
 */
import I18N from '@src/lang/I18N';
import TextOverflowTable from '@src/views/carbonFootprint3/component/TextOverflowTable';
import TextWidthOverflow from '@src/views/carbonFootprint3/component/TextOverflowTable/byWidth';
import { Button, TableColumnsType } from 'antd';

import { Emission } from './type';
import type { AccountEmissionTaskTarget } from '../type';

const MAX_LENGTH = 20;

const getEmissionSourceId = (record: Emission) =>
  record.id ?? record.emissionSourceId ?? record.sourceId;

export const tableColumns = (
  stageCountMap: Record<string, number>,
  onEmissionTaskCreate?: (target: AccountEmissionTaskTarget) => void,
): TableColumnsType<Emission> => [
  {
    title: I18N.carbonFootprint.lifeCycleStage,
    dataIndex: 'stage',
    className: 'emission-stage-cell',
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
    width: 300,
    fixed: 'left',
    render: text => <TextWidthOverflow value={text || '-'} width={300} />,
  },
  {
    title: I18N.carbonFootprint.type,
    dataIndex: 'type',
  },
  {
    title: I18N.carbonFootprint3.consumptionQuantity,
    dataIndex: 'unitStr',
    render: text => <TextWidthOverflow width={100} value={text} />,
  },
  {
    title: I18N.carbonFootprint.emissionKg,
    dataIndex: 'emissionTotal',
    render: text => <TextOverflowTable value={text} maxLength={MAX_LENGTH} />,
  },
  {
    title: I18N.carbonFootprint.emissionFactors,
    dataIndex: 'factorUnitName',
    render: text => (
      <TextOverflowTable value={text || '-'} maxLength={MAX_LENGTH} />
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
  {
    title: I18N.carbonFootprint3.emissionProportion,
    width: '250',
    dataIndex: 'percentage',
    render: text => text || '-',
  },
  ...(onEmissionTaskCreate
    ? [
        {
          title: I18N.carbonAgent.operation,
          dataIndex: 'operation',
          fixed: 'right' as const,
          width: 108,
          render: (_: unknown, record: Emission) => (
            <Button
              type='link'
              size='small'
              onClick={event => {
                event.stopPropagation();
                onEmissionTaskCreate({
                  emissionSourceId: getEmissionSourceId(record),
                  emissionSourceName: record.name,
                });
              }}
            >
              {I18N.carbonAgent.projectTaskCreateAction}
            </Button>
          ),
        },
      ]
    : []),
];
