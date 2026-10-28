/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2022-12-27 10:38:57
 * @Date: 2022-12-27 10:34:47
 * @@description: 核算模型 - 列表
 */
import { FromItemProps } from '@src/components/FormUtil/type';
import {
  formItemInitInput,
  formItemInitType,
} from '@src/components/FormUtil/util';
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/lib/table';

import { BusinessAccountingModelTableData } from './type';

// export const scopeBusinessAccounting = ['半生命周期', '全生命周期', '自定义'];
/**
 * 碳足迹核算3.0 - 核算模型
 */
export const BusinessAccountingModelSearchForm = (): FromItemProps<any>[] => {
  const data: FromItemProps<any>[] = [
    {
      ...formItemInitInput('', 'modelName', false),
      props: {
        placeholder: I18N.carbonFootprint.modelName,
      },
    },
    {
      ...formItemInitType('select', '', 'type', true),
      props: {
        placeholder: I18N.carbonFootprint3.accountingMethod,
        options: [
          {
            label: I18N.carbonFootprint3.quickAccounting,
            value: 0,
          },
          {
            label: I18N.carbonFootprint3.processAccounting,
            value: 1,
          },
        ],
      },
    },
    {
      ...formItemInitType('select', '', 'scope', true),
      props: {
        placeholder: I18N.carbonFootprint.systemBoundary,
        options: [
          {
            label: I18N.carbonFootprint3.halfLifeCycle,
            value: 0,
          },
          {
            label: I18N.carbonFootprint3.fullLifecycle,
            value: 1,
          },
        ],
      },
    },
  ];
  return data.map(item => {
    const back = item;
    back.props = {
      style: { width: '200px' },
      ...back.props,
    };
    return back;
  });
};

/**
 * 核算模型 - 表格的表头
 */
export const carbonFootprintProductAttributeAddEnumTableCol =
  (): ColumnsType<BusinessAccountingModelTableData> => [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      fixed: 'left',
      dataIndex: 'index',
    },
    {
      title: I18N.carbonFootprint.modelName,
      width: 200,
      fixed: 'left',
      dataIndex: 'modelName',
    },
    {
      title: I18N.carbonFootprint3.functionalUnits,
      width: 200,
      dataIndex: 'accountName',
    },
    {
      title: I18N.carbonFootprint3.accountingMethod,
      width: 200,
      dataIndex: 'type',
      render: (val: 0 | 1) =>
        val === 0
          ? I18N.carbonFootprint3.quickAccounting
          : I18N.carbonFootprint3.processAccounting,
    },
    {
      title: I18N.carbonFootprint.systemBoundary,
      width: 200,
      dataIndex: 'scope',
      render: (val: 0 | 1) =>
        val === 0
          ? I18N.carbonFootprint3.halfLifeCycle
          : I18N.carbonFootprint3.fullLifecycle,
    },
    {
      title: I18N.carbonFootprint.updatedBy,
      width: 100,
      dataIndex: 'updateByName',
    },
    {
      title: I18N.carbonFootprint.updateTime,
      width: 200,
      dataIndex: 'updateTime',
    },
  ];
