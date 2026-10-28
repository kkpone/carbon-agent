/*
 * @Author: 张明尧
 * @Date: 2022-07-29 10:05:42
 */
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/lib/table';
import { OrderServiceCenterList } from './type';

/**
 * 产品服务 - 服务中心表格的表头
 */
export const orderServiceCenterTableCol =
  (): ColumnsType<OrderServiceCenterList> => [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      fixed: 'left',
      dataIndex: 'index',
    },
    {
      title: I18N.system.productServiceName,
      dataIndex: 'productName',
    },
    {
      title: I18N.system.effectiveDate,
      dataIndex: 'createTime',
    },
    {
      title: I18N.system.expirationDate,
      dataIndex: 'expireTime',
    },
    {
      title: I18N.system.remainingAvailable,
      dataIndex: 'leftDays',
      render: (val: string) =>
        I18N.template(I18N.system.valDays, { val1: val }),
    },
    {
      title: I18N.carbonFootprint.state,
      width: 90,
      dataIndex: 'status',
      render: (val: 0 | 1, record: OrderServiceCenterList) =>
        record.leftDays > 0 ? (
          <div
            style={{
              width: 90,
              height: 26,
              textAlign: 'center',
              lineHeight: '26px',
              background: 'rgba(248,162,49,0.06)',
              borderRadius: 15,
              color: '#F8A231',
            }}
          >
            {I18N.system.inEffect}
          </div>
        ) : (
          <div
            style={{
              width: 90,
              height: 26,
              textAlign: 'center',
              lineHeight: '26px',
              background: 'rgba(102,102,102,0.06)',
              borderRadius: 15,
              color: '#6C757D',
            }}
          >
            {I18N.components.canceled}
          </div>
        ),
    },
  ];
