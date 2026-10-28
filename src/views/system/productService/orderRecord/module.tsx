/*
 * @Author: 张明尧
 * @Date: 2022-07-29 10:05:42
 */
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/lib/table';

import { OrderRecordList } from './type';

/**
 * 产品服务 - 订购记录表格的表头
 */
export const orderRecordTableCol = (): ColumnsType<OrderRecordList> => [
  {
    title: I18N.carbonFootprint.number,
    width: 70,
    fixed: 'left',
    dataIndex: 'index',
  },
  {
    title: I18N.system.productServiceName,
    width: 200,
    fixed: 'left',
    dataIndex: 'orderName',
  },
  {
    title: I18N.system.durationQuantity,
    dataIndex: 'period',
  },
  {
    title: I18N.carbonNeutral.orderNumber2,
    dataIndex: 'orderId',
  },
  {
    title: I18N.components.orderTime,
    dataIndex: 'createTime',
  },
  {
    title: I18N.system.paymentMethod,
    dataIndex: 'payWay',
    render: (val: string, item: OrderRecordList) =>
      item.status === '1' ? I18N.carbonNeutral.weChatPayment : '-',
  },
  {
    title: I18N.system.money,
    dataIndex: 'realMoney',
  },
  {
    title: I18N.carbonNeutral.orderStatus,
    width: 90,
    dataIndex: 'status',
    render: (value: '0' | '1' | '2') => {
      const val = Number(value) || 0;
      const arr = [
        {
          color: '#F8A231',
          backColor: 'rgba(248,162,49,0.06)',
          text: I18N.system.unpaid,
        },
        {
          color: '#09C199',
          backColor: 'rgba(9,193,153,0.06)',
          text: I18N.system.paid,
        },
        {
          color: '#6C757D',
          backColor: 'rgba(102,102,102,0.06)',
          text: I18N.components.canceled,
        },
      ];
      return (
        <div
          style={{
            width: 90,
            height: 26,
            textAlign: 'center',
            lineHeight: '26px',
            background: `${arr[val].backColor}`,
            borderRadius: 15,
            color: arr[val].color,
          }}
        >
          {arr[val].text}
        </div>
      );
    },
  },
  {
    title: I18N.system.paymentDate,
    dataIndex: 'payTime',
  },
  {
    title: I18N.system.payer,
    dataIndex: 'createBy',
    render: (val: string, item: OrderRecordList) => {
      if (item.status === '1') {
        return val;
      }
      return '-';
    },
  },
];
