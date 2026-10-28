/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-10 14:44:46
 * @Date: 2023-02-09 16:18:31
 * @@description:
 */
import I18N from '@src/lang/I18N';
import { FromItemProps } from '@src/components/FormUtil/type';
import { formItemInitInput } from '@src/components/FormUtil/util';
import { ColumnsType } from 'antd/lib/table';
import TextOverflowTable from '../../component/TextOverflowTable';
import { ProductLibraryTableData } from '../type';

/**
 * 碳足迹核算3.0 - 产品库的搜索表单
 */
export const carbonFootprintProductLibrarySearchForm =
  (): FromItemProps<any>[] => {
    const data: FromItemProps<any>[] = [
      {
        ...formItemInitInput('', 'productName', false),
        props: {
          placeholder: I18N.carbonFootprint.productName,
        },
      },
      {
        ...formItemInitInput('', 'productCode', false),
        props: {
          placeholder: I18N.carbonFootprint.productCode,
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
 * 产品库 - 表格的表头
 */
export const carbonFootprintProductLibraryTableCol =
  (): ColumnsType<ProductLibraryTableData> => [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      fixed: 'left',
      dataIndex: 'index',
    },
    {
      title: I18N.carbonFootprint.productName,
      width: 200,
      fixed: 'left',
      dataIndex: 'productName',
      render: (val: string) => {
        if (val) {
          return <TextOverflowTable value={val} maxLength={20} />;
        }
        return '-';
      },
    },
    {
      title: I18N.carbonFootprint.productCode,
      width: 200,
      dataIndex: 'productCode',
      render: (val: string) => {
        if (val) {
          return <TextOverflowTable value={val} maxLength={20} />;
        }
        return '-';
      },
    },
    {
      title: I18N.carbonFootprint.specificationAndModel,
      width: 200,
      dataIndex: 'specification',
      render: (val: string) => {
        if (val) {
          return <TextOverflowTable value={val} maxLength={20} />;
        }
        return '-';
      },
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
