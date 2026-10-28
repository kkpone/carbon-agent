/**
 * 产品服务 - 发票管理
 * @returns
 */
import I18N from '@src/lang/I18N';
import { checkPermissions } from '@src/components/Permission/utils';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import { RouteMaps } from '@src/router/route-paths';
import { Toast } from '@src/utils/Toast';
import { Button } from 'antd';
import { AxiosResponse } from 'axios';
import saveAs from 'file-saver';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import style from '../index.module.less';
import './defaultAntd.less';
import { invoiceManagementTableCol } from './module';
import {
  getProductServiceInvoiceList,
  getProductServiceInvoiceTotal,
} from './service';
import { InvoiceManagementList, InvoiceManagementTableData } from './type';
import classNames from 'classnames';

const OrderServiceCenterInvoiceManagement = () => {
  const history = useHistory();
  const childRef = useRef<TableRef>();
  /** 填写发票 - 区分个人还是企业 */
  const [totalMoney, setTotalMoney] = useState<number>(0);
  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<AxiosResponse<InvoiceManagementTableData>>,
  ) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });
  const downloadFile = (url: string, name?: string) => {
    Toast('success', I18N.carbonFootprint.startDownloading);
    saveAs(url, name);
  };
  const columns = [
    ...invoiceManagementTableCol(),
    {
      title: I18N.carbonFootprint.operation,
      width: 150,
      dataIndex: 'set',
      render: (val: string, item: InvoiceManagementList) =>
        item.status === 1 && item.filePath ? (
          <div>
            {checkPermissions(
              I18N.carbonFootprint.download,
              'invoiceManagement:download',
            ) ? (
              <span
                onClick={async () => {
                  const fileData: { url: string; name: string } = item.filePath
                    ? JSON.parse(item.filePath)
                    : undefined;
                  if (fileData) {
                    downloadFile(fileData.url, fileData.name);
                  }
                }}
                className={`${style.primaryColorFont} ${style.cursorPointerFont} m-r-10`}
              >
                {I18N.carbonFootprint.download}
              </span>
            ) : (
              '-'
            )}
          </div>
        ) : (
          '-'
        ),
    },
  ];
  /** 获取总额 */
  const initTotal = async () => {
    const back = await getProductServiceInvoiceTotal();
    if (back.data.data) {
      setTotalMoney(back.data.data);
    }
  };
  useEffect(() => {
    initTotal();
  }, []);

  return (
    <div className={`${style.homeProductOrder}`}>
      <div className={style.main}>
        <div className={style.mainHeader}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '95%',
              paddingRight: checkPermissions(
                I18N.components.applyForInvoice,
                'management:invoice:add',
              )
                ? 120
                : 5,
              height: 32,
            }}
            className={style.productTitle}
          >
            <div>{I18N.system.controlOverInvoices}</div>
            <div style={{ fontWeight: 400, fontSize: 14 }}>
              <span>
                {I18N.system.invoicableAmount}
                {totalMoney}
              </span>
              <span
                onClick={() => {
                  history.push(RouteMaps.homeInvoiceManagementNotice);
                }}
                style={{ color: '#0CBF9F', cursor: 'pointer' }}
                className={classNames('m-l-10', 'm-r-10')}
              >
                {I18N.system.invoicingNotice}
              </span>
            </div>
          </div>
          {checkPermissions(
            <div className={style.setBtn}>
              <Button
                onClick={() => {
                  history.push(RouteMaps.homeInvoiceManagementApplyForInvoice);
                }}
                className={`${style.btn}`}
                type='primary'
              >
                {I18N.components.applyForInvoice}
              </Button>
            </div>,
            'management:invoice:add',
          )}
        </div>
      </div>
      <div className='m-t-16'>
        <CommonTable<InvoiceManagementList, any, any>
          bordered={false}
          searchParams={{}}
          cRef={childRef}
          pageSize={10}
          fetchApi={getProductServiceInvoiceList}
          returnFetchApi={returnFetchApi}
          columns={columns}
          rowKey='id'
          pagePosition
        />
      </div>
    </div>
  );
};

export default OrderServiceCenterInvoiceManagement;
