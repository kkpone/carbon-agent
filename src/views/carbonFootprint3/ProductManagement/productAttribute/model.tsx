/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-14 14:39:01
 * @Date: 2023-01-03 15:33:59
 * @@description:
 */
import I18N from '@src/lang/I18N';
import { FromItemProps, FromItemTypeBack } from '@src/components/FormUtil/type';
import {
  formItemInitInput,
  formItemInitType,
} from '@src/components/FormUtil/util';
import { REGEXP_MORE_ZERO_INTEGER } from '@src/utils/regs';
import { ColumnsType } from 'antd/lib/table';
import TextOverflowTable from '../../component/TextOverflowTable';
import { styleBtnStatus } from '../../util';
import {
  ProductAttributeEnumTableData,
  ProductAttributeTableData,
} from '../type';

/**
 * 碳足迹核算3.0 - 产品属性
 */
export const carbonFootprintProductAttributeSearchForm =
  (): FromItemProps<any>[] => {
    const data: FromItemProps<any>[] = [
      {
        ...formItemInitInput('', 'name', false),
        props: {
          placeholder: I18N.carbonFootprint.attributeName,
        },
      },
      {
        ...formItemInitType('select', '', 'status', true),
        props: {
          placeholder: I18N.carbonFootprint.state,
          options: [
            {
              label: I18N.carbonFootprint.enable,
              value: 0,
            },
            {
              label: I18N.carbonFootprint.disabled,
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
 * 产品属性 - 表格的表头
 */
export const carbonFootprintProductAttributeTableCol = (
  enumManagementCallback: (item: ProductAttributeTableData) => void,
): ColumnsType<ProductAttributeTableData> => [
  {
    title: I18N.carbonFootprint.number,
    width: 70,
    fixed: 'left',
    dataIndex: 'index',
  },
  {
    title: I18N.carbonFootprint.attributeName,
    width: 200,
    fixed: 'left',
    dataIndex: 'name',
    render: (val: string) => {
      if (val) {
        return <TextOverflowTable value={val} maxLength={20} />;
      }
      return '-';
    },
  },
  {
    title: I18N.carbonFootprint.type,
    width: 100,
    dataIndex: 'type',
    render(val, item: ProductAttributeTableData) {
      return item.type === 0
        ? I18N.carbonFootprint3.inputType2
        : I18N.carbonFootprint3.selective;
    },
  },
  {
    title: I18N.carbonFootprint3.selectionRestrictions,
    width: 100,
    dataIndex: 'required',
    render(val, item: ProductAttributeTableData) {
      return item.type === 0
        ? I18N.carbonFootprint3.required
        : I18N.carbonFootprint3.notMandatory;
    },
  },
  {
    title: I18N.carbonFootprint3.sort,
    width: 70,
    dataIndex: 'orderNum',
  },
  {
    title: I18N.carbonFootprint.enum,
    width: 100,
    dataIndex: 'mjz',
    render(val, item: ProductAttributeTableData) {
      if (item.type === 0) {
        return '-';
      }
      return (
        <span
          onClick={() => {
            enumManagementCallback(item);
          }}
          style={{ color: '#0CBF9F', cursor: 'pointer' }}
        >
          {I18N.carbonFootprint.administration}
        </span>
      );
    },
  },
  {
    title: I18N.carbonFootprint.state,
    width: 90,
    dataIndex: 'status',
    render: (val: 0 | 1) =>
      val === 0 ? (
        <div
          style={{
            ...styleBtnStatus,
            background: 'rgba(12, 191, 159, 0.06)',
            color: '#09C199',
          }}
        >
          {I18N.carbonFootprint.enabling}
        </div>
      ) : (
        <div
          style={{
            ...styleBtnStatus,
            background: '#FFF9F3',
            color: '#F8A231',
          }}
        >
          {I18N.carbonFootprint3.disabled}
        </div>
      ),
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

/**
 * 产品属性 - 枚举值 - 表格的表头
 */
export const carbonFootprintProductAttributeAddEnumTableCol =
  (): ColumnsType<ProductAttributeEnumTableData> => [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      fixed: 'left',
      dataIndex: 'index',
    },
    {
      title: I18N.carbonFootprint3.enumNames,
      width: 200,
      fixed: 'left',
      dataIndex: 'name',
      render: (val: string) => {
        if (val) {
          return <TextOverflowTable value={val} maxLength={20} />;
        }
        return '-';
      },
    },
    {
      title: I18N.carbonFootprint3.sort,
      width: 70,
      dataIndex: 'orderNum',
    },
    {
      title: I18N.carbonFootprint.state,
      width: 90,
      dataIndex: 'status',
      render: (val: 0 | 1) =>
        val === 0 ? (
          <div
            style={{
              ...styleBtnStatus,
              background: 'rgba(12, 191, 159, 0.06)',
              color: '#09C199',
            }}
          >
            {I18N.carbonFootprint.enabling}
          </div>
        ) : (
          <div
            style={{
              ...styleBtnStatus,
              background: '#FFF9F3',
              color: '#F8A231',
            }}
          >
            {I18N.carbonFootprint3.disabled}
          </div>
        ),
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

/**
 * 新增枚举值弹框表单
 */
export const productAttributeAddEnumFormItem = (): FromItemProps<
  keyof FromItemTypeBack
>[] => {
  const data: FromItemProps<keyof FromItemTypeBack>[] = [
    {
      ...formItemInitInput(
        I18N.carbonFootprint3.enumerationValueName,
        'name',
        true,
      ),
      placeholder: I18N.carbonFootprint3.pleaseEnterAnEnumeration,
      props: {
        maxLength: 50,
      },
    },
    {
      ...formItemInitInput(I18N.carbonFootprint3.sort, 'orderNum', true),
      placeholder: I18N.carbonFootprint3.pleaseEnterSorting,
      props: {
        maxLength: 4,
      },
      rulesCustom: [
        {
          required: true,
          message: I18N.carbonFootprint3.pleaseFillInTheSorting,
        },
        {
          pattern: REGEXP_MORE_ZERO_INTEGER,
          message: I18N.carbonFootprint3.pleaseEnterTheWholeNumber,
        },
      ],
    },
    {
      ...formItemInitType('radio', I18N.carbonFootprint.state, 'status', true),
      props: {
        options: [
          {
            label: I18N.carbonFootprint.enable,
            value: 0,
          },
          {
            label: I18N.carbonFootprint.disabled,
            value: 1,
          },
        ],
      },
    },
  ];
  return data.map(item => {
    const back = item;
    back.props = {
      ...back.props,
    };
    back.col = 24;
    return back;
  });
};
