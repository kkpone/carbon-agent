/*
 * @Author: 张明尧
 * @Date: 2022-10-16 17:31:58
 */
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/lib/table';

import { OrderRecordList } from '../../../orderRecord/type';

/**
 * 产品服务 - 发票管理 - 申请发票列表页面
 */
export const invoiceManagementApplyForInvoiceSelectCol =
  (): ColumnsType<OrderRecordList> => [
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
      render: (val: string) => (val === '1' ? I18N.carbonNeutral.weChatPayment : ''),
    },
    {
      title: I18N.system.money,
      dataIndex: 'realMoney',
    },
    {
      title: I18N.system.paymentDate,
      dataIndex: 'payTime',
    },
    {
      title: I18N.system.payer,
      dataIndex: 'createBy',
    },
  ];
