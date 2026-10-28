/*
 * @Author: 张明尧
 * @Date: 2022-07-29 10:05:42
 */
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/lib/table';
import { InvoiceManagementList } from './type';

/**
 * 产品服务 - 发票管理页面
 */
export const invoiceManagementTableCol =
  (): ColumnsType<InvoiceManagementList> => [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      fixed: 'left',
      dataIndex: 'index',
    },
    {
      title: I18N.system.applicationTime,
      width: 200,
      dataIndex: 'createTime',
    },
    {
      title: I18N.system.invoiceAmount2,
      dataIndex: 'money',
    },
    {
      title: I18N.system.applicant,
      dataIndex: 'createBy',
    },
    {
      title: I18N.system.invoiceStatus,
      dataIndex: 'status',
      render: (val: number) => {
        const arr = [
          {
            color: '#F8A231',
            backColor: 'rgba(248,162,49,0.06)',
            text: I18N.system.inInvoicing,
          },
          {
            color: '#09C199',
            backColor: 'rgba(9,193,153,0.06)',
            text: I18N.system.invoiced,
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
  ];
