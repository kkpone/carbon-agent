/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-07 18:11:58
 * @Date: 2023-01-09 19:32:06
 * @@description:
 */
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/lib/table';

import { MODEL_EMISSION_TYPE_LABEL } from '../constant';
import { BusinessAccountingModelEmissionData } from '../type';

/**
 * 快速核算模型的排放源 - 表格的表头
 */
export const carbonFootprintModelEmissionTableCol =
  (): ColumnsType<BusinessAccountingModelEmissionData> => [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      fixed: 'left',
      dataIndex: 'index',
    },
    {
      title: I18N.carbonFootprint.name,
      width: 200,
      fixed: 'left',
      dataIndex: 'name',
    },
    {
      title: I18N.carbonFootprint3.consumptionQuantity,
      width: 200,
      dataIndex: 'unitName',
      render: (val, item: BusinessAccountingModelEmissionData) => {
        if (item.type === 7) {
          if (item.typeExtra.way === 2) return I18N.carbonFootprint3.kilometre;
          return `${item.typeExtra ? item.typeExtra.unitName : '-'}`;
        }
        return val;
      },
    },
    {
      title: I18N.carbonFootprint.type,
      width: 200,
      dataIndex: 'type',
      render: (VAL: number) => MODEL_EMISSION_TYPE_LABEL[VAL],
    },
    {
      title: I18N.carbonFootprint.emissionFactors,
      width: 200,
      dataIndex: 'matchObject',
      render: (val, item: BusinessAccountingModelEmissionData) =>
        `${item.matchObject.factor ?? '-'}${item.matchObject.unit ?? '-'}`,
    },
  ];
