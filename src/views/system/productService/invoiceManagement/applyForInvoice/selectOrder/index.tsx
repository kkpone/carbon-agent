/*
 * @Author: 张明尧
 * @Date: 2022-10-16 17:30:51
 */
/**
 * 发票管理 - 申请发票 - 选择开票订单
 * @returns
 */
import I18N from '@src/lang/I18N';
import { Button, Table } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import { useEffect, useState } from 'react';
import { OrderRecordList } from '../../../orderRecord/type';
import { invoiceManagementApplyForInvoiceSelectCol } from './module';
import { getSelectOrderRecordList } from './service';
import '../index.less';
import { InvoiceSelectOrderProps } from '../type';

const InvoiceApplyForInvoiceSelectOrder = (props: InvoiceSelectOrderProps) => {
  const { subSelectOrder } = props;
  /** 表格中的分页信息 */
  const [pageParams] = useState<{ page: number; size: number }>({
    page: 1,
    size: 1000,
  });
  /** 当前的表格数据 */
  const [tableData, setTableData] = useState<OrderRecordList[]>([]);
  /** 开票金额 */
  const [moneyToTal, setMoneyToTal] = useState<number>(0);
  /** 当前的表格数据 */
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  /** 表格选中的数据 */
  const [, setSelectedRowData] = useState<OrderRecordList>();
  /** 表格选中的数据Key */
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  /** 判断数据精度问题 */
  const backNumber = (number?: number) => {
    if (!number || number === 0) return 0;
    const backNum = Math.round(number * 10 ** 6) / 10 ** 6;
    return Number(backNum).toFixed(2);
  };
  /**
   * 当前选中的表格数据
   * @param newSelectedRowKeys 当前选中的key
   */
  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: OrderRecordList[],
  ) => {
    setSelectedRowData(selectedRows[0]);
    setSelectedRowKeys(newSelectedRowKeys);
    let val = 0;
    selectedRows.forEach(res => {
      val += res.realMoney;
    });
    setMoneyToTal(Number(backNumber(val)));
  };
  /** 表格选中 */
  const rowSelection: TableRowSelection<OrderRecordList> = {
    selectedRowKeys,
    type: 'checkbox',
    onChange: onSelectChange,
  };
  /**
   * 初始化 - 获取选择的订单列表
   */
  const initSelectOrderList = async () => {
    try {
      setTableLoading(true);
      const back = await getSelectOrderRecordList(pageParams);
      setTableData(
        back.data.data.rows.map(res => {
          res.key = res.orderId;
          return res;
        }),
      );
      // eslint-disable-next-line no-empty
    } catch {}
    setTableLoading(false);
  };
  const init = () => {
    initSelectOrderList();
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <div>
      <Table<OrderRecordList>
        loading={tableLoading}
        rowSelection={rowSelection}
        columns={invoiceManagementApplyForInvoiceSelectCol()}
        dataSource={tableData}
        pagination={false}
      />
      {moneyToTal > 0 && (
        <div className='orderRecordListFooter'>
          <div className='moneyText'>
            {I18N.system.invoiceAmount}<span
              style={{
                fontSize: '20px',
                color: '#0CBF9F',
                fontWeight: 500,
              }}
            >
              ￥{moneyToTal}
            </span>
          </div>
          <div
            style={{
              textAlign: 'right',
              paddingRight: 44,
              marginTop: 20,
            }}
          >
            <Button
              onClick={() => {
                subSelectOrder(moneyToTal, selectedRowKeys);
              }}
              style={{ height: 40, width: 140, fontSize: 16 }}
              type='primary'
            >
              {I18N.system.applyForInvoicing}</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceApplyForInvoiceSelectOrder;
