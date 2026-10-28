import I18N from '@src/lang/I18N';
import { FromItemProps } from '@src/components/FormUtil/type';
import {
  formItemInitInput,
  formItemInitType,
} from '@src/components/FormUtil/util';
import { ColumnsType } from 'antd/es/table';
import { CarbonAccountInventoryRecordTable } from './type';

/**
 * 表格的表头
 * @returns
 */

export const carbonAccountInventoryRecordTableCol =
  (): ColumnsType<CarbonAccountInventoryRecordTable> => [
    {
      title: I18N.carbonAccount.prizeName,
      dataIndex: 'goodsName',
    },
    {
      title: I18N.carbonAccount.changePerson,
      dataIndex: 'createBy',
    },
    {
      title: I18N.carbonAccount.changeType,
      dataIndex: 'changeType',
      render: (val: number) => {
        const arrText = ['', I18N.carbonAccount.warehousing, I18N.carbonAccount.outbound, I18N.carbonAccount.productExchange];
        return (
          <div>
            <span>{arrText[val]}</span>
          </div>
        );
      },
    },
    {
      title: I18N.carbonAccount.inventoryChanges,
      dataIndex: 'changeCount',
      render: (val: number, item: CarbonAccountInventoryRecordTable) => (
        <div>
          <span>
            {item.changeType === 1 ? '+' : ''}
            {val}
          </span>
        </div>
      ),
    },
    {
      title: I18N.carbonAccount.remainingInventory,
      dataIndex: 'amount',
    },
    {
      title: I18N.carbonNeutral.orderNumber2,
      dataIndex: 'orderNo',
    },
    {
      title: I18N.carbonAccount.changeTime,
      dataIndex: 'createTime',
    },
  ];

/**
 * 用户列表的搜索
 */
export const carbonAccountInventoryRecordSearchForm =
  (): FromItemProps<any>[] => {
    const data: FromItemProps<any>[] = [
      formItemInitInput(I18N.carbonAccount.prizeName, 'goodsName', false),
      // formItemInitInput('变更人', 'createBy', false),
      {
        ...formItemInitType('select', I18N.carbonAccount.changeType, 'changeType', true),
        props: {
          options: [
            {
              label: I18N.carbonAccount.warehousing,
              value: 1,
            },
            {
              label: I18N.carbonAccount.outbound,
              value: 2,
            },
            {
              label: I18N.carbonAccount.productExchange,
              value: 3,
            },
          ],
        },
      },
    ];
    return data.map(item => {
      const back = item;
      back.props = {
        ...back.props,
        style: { width: '200px' },
      };
      return back;
    });
  };
