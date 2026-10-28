/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-02 09:45:03
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-25 20:59:33
 */
import I18N from '@src/lang/I18N';
import TextOverflowTable from '@src/views/carbonFootprint3/component/TextOverflowTable';
import { Button, TableColumnsType } from 'antd';

import TextWidthOverflow from '@/views/subModules/CarbonFootprintModel/components/byWidth';

import { Emission } from './type';
import type { AccountEmissionTaskTarget } from '../type';

const MAX_LENGTH = 20;

const getEmissionSourceId = (record: Emission) =>
  record.id ?? record.emissionSourceId ?? record.sourceId;

export const productColumns = (
  stageCountMap: Record<string, number>,
  onEmissionTaskCreate?: (target: AccountEmissionTaskTarget) => void,
): TableColumnsType<Emission> => [
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
                  emissionSourceName: record.productName || record.name || '-',
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

export const inOutColumns = (
  processCountMap: Record<string | number, number>,
  onEmissionTaskCreate?: (target: AccountEmissionTaskTarget) => void,
): TableColumnsType<Emission> => [
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
    title: I18N.carbonFootprint3.enterName,
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
    title: I18N.carbonFootprint3.inputType,
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
    title: I18N.carbonFootprint3.consumptionQuantity,
    width: 200,
    dataIndex: 'unitStr',
    render: text => <TextWidthOverflow width={100} value={text} />,
  },
  {
    title: I18N.carbonFootprint.emissionKg,
    width: 200,
    dataIndex: 'emissionTotal',
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
                  emissionSourceName: record.ioInputName || record.name || '-',
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
