/*
 * @Author: 张明尧
 * @Date: 2022-10-11 14:40:05
 */
/**
 * 产品服务 - 订购记录
 * @returns
 */
import I18N from '@src/lang/I18N';
import Permission from '@src/components/Permission';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import IconFont from '@src/components/iconfont';
import { RouteMaps } from '@src/router/route-paths';
import { Toast } from '@src/utils/Toast';
import { Button, Modal, Spin } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { AxiosResponse } from 'axios';
import { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import style from '../index.module.less';
import '../orderServiceCenter/defaultAntd.less';
import OrderServiceCenterConfirmOrder from '../orderServiceCenter/components/confirmOrder';
import OrderServiceCenterPaySuccess from '../orderServiceCenter/components/paySuccess';
import { PriceList, SubOrderApiData } from '../orderServiceCenter/type';
import { orderRecordTableCol } from './module';
import {
  getProductServiceOrderListDetail,
  getProductServiceOrderRecordList,
  postCloseOrder,
} from './service';
import {
  OrderRecordList,
  OrderRecordListDetail,
  OrderRecordTableData,
} from './type';

import PurchaseModal from '@src/components/PurchaseModal';

const OrderServiceCenter = () => {
  const [countOrderId, setCountOrderId] = useState<string>();

  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);

  const history = useHistory();
  const childRef = useRef<TableRef>();
  /** 当前处于续订的那个阶段 -  2.确认订单 3.支付成功 */
  const [continueStage, setContinueStage] = useState<number>(2);
  /** 当前提交订单后的返回值 */
  const [subOrderBack, setSubOrderBack] = useState<SubOrderApiData>();
  /** 当前提交订单后的返回值 */
  const [checkPriceList, setCheckPriceList] = useState<PriceList>();
  /** 当前订单详情的选中 */
  const [orderDetail, setOrderDetail] = useState<OrderRecordListDetail>();
  /** 点击续订按钮 进入加载装填 */
  const [showContinueLoading, setShowContinueLoading] =
    useState<boolean>(false);
  /** 显示对话框 - 取消订单弹框 */
  const [showModal, setShowModal] = useState<boolean>(false);
  const [btnLoaidng, setBtnLoaidng] = useState<boolean>(false);

  /** 显示对话框 - 续订弹框 */
  const [showContinueModal, setShowContinueModal] = useState<boolean>(false);
  /** 当前取消订单选中的订单信息 */
  const [listInfo, setListInfo] = useState<OrderRecordList>();
  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<AxiosResponse<OrderRecordTableData>>,
  ) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });
  /** 立即支付 */
  const goPay = async (list: OrderRecordList) => {
    if (list.origin === 'online-SKU') {
      setCountOrderId(list.orderId);
      setPurchaseModalVisible(true);
      return;
    }

    try {
      const back = await getProductServiceOrderListDetail({
        orderId: list.orderId,
      });
      if (back) {
        const backData = back.data.data;
        setSubOrderBack({
          payMoney: `${backData.realMoney}`,
          orderId: backData.orderId,
          code_url: backData.codeUrl,
          orderTime: backData.createTime,
        });
        const getPriceList = backData.orderGoods[0].priceList.find(
          list => list.priceId === backData.orderGoods[0].priceId,
        );
        setCheckPriceList(getPriceList);
        setOrderDetail(backData);
        setShowContinueModal(true);
      }

      // eslint-disable-next-line no-empty
    } catch {}
  };
  const columns: ColumnsType<OrderRecordList> = [
    ...orderRecordTableCol(),
    {
      title: I18N.carbonFootprint.operation,
      width: 200,
      dataIndex: 'set',
      fixed: 'right',
      render: (val: string, record: OrderRecordList) =>
        record.status === '0' ? (
          <div>
            <Permission flag='orderRecor:immediatelyPay'>
              <span
                onClick={async () => {
                  await goPay(record);
                }}
                className={`${style.primaryColorFont} ${style.cursorPointerFont} m-r-10`}
              >
                {I18N.carbonNeutral.payNow}
              </span>
            </Permission>
            <Permission flag='management:orders:closeOrder'>
              <span
                onClick={() => {
                  setListInfo(record);
                  setShowModal(true);
                }}
                className={`${style.primaryColorFont} ${style.cursorPointerFont}`}
              >
                {I18N.system.cancelOrder}
              </span>
            </Permission>
          </div>
        ) : (
          '-'
        ),
    },
  ];
  /** 关闭弹框 - 变为初始化状态 */
  const closeOrderServiceCenterModal = () => {
    setContinueStage(2);
    // 刷新列表
    childRef.current?.reset();
  };
  /** 支付成功的回调 */
  const paySuccess = () => {
    setShowContinueLoading(true);
    setTimeout(() => {
      setContinueStage(3);
      setShowContinueLoading(false);
    }, 500);
  };

  /** 查看订单的回调  */
  const closeModal = () => {
    closeOrderServiceCenterModal();
    setShowContinueModal(false);
  };
  /** 取消订单 */
  const closeOrder = async () => {
    if (listInfo) {
      setBtnLoaidng(true);
      try {
        const formData = new FormData();
        formData.append('orderId', `${listInfo.orderId}`);
        const back = await postCloseOrder(formData);
        if (back.data.code === 200) {
          Toast('success', I18N.system.cancelSuccessful);
          setShowModal(false);
          setListInfo(undefined);
          childRef.current?.reset();
        }
      } catch (error) {
        setBtnLoaidng(false);
      }
      setBtnLoaidng(false);
    }
  };
  return (
    <div className={`${style.homeProductOrder} m-b-60`}>
      <div className={style.main}>
        <div className={style.mainHeader}>
          <div className={style.productTitle}>{I18N.system.orderRecords}</div>
          <Permission flag='management:invoice:add'>
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
            </div>
          </Permission>
        </div>
      </div>
      <div className='m-t-16'>
        <CommonTable<OrderRecordList, any, any>
          bordered={false}
          searchParams={{}}
          cRef={childRef}
          pageSize={10}
          fetchApi={getProductServiceOrderRecordList}
          returnFetchApi={returnFetchApi}
          columns={columns}
          rowKey='id'
          pagePosition
        />
      </div>
      <Modal
        width={400}
        title={I18N.carbonFootprint.prompt}
        wrapClassName='productManagementModal'
        maskClosable={false}
        open={showModal}
        getContainer={false}
        okButtonProps={{
          loading: btnLoaidng,
        }}
        onOk={async () => {
          await closeOrder();
        }}
        onCancel={() => setShowModal(false)}
      >
        <div
          style={{
            height: 30,
            display: 'flex',
            justifyContent: 'left',
            alignItems: 'center',
          }}
        >
          <IconFont
            style={{ fontSize: 20, marginRight: 10 }}
            type='icon-icon-shixing'
          />
          <span>{I18N.system.thisOrderHasNotYetBeenPlaced}</span>
        </div>
      </Modal>
      {/* 续订的弹框 */}
      <Modal
        title=''
        width={780}
        wrapClassName='orderServiceCenterModal'
        maskClosable={false}
        open={showContinueModal}
        getContainer={false}
        footer={null}
        onOk={() => {}}
        closable={false}
        onCancel={() => {
          setShowContinueModal(false);
        }}
      >
        <Spin spinning={showContinueLoading}>
          <div className='orderServiceCenterModalBody'>
            <span className='cursorPointerFont closeIcon'>
              <IconFont
                style={{ fontSize: 18, fontWeight: 500 }}
                onClick={() => {
                  closeOrderServiceCenterModal();
                  setShowContinueModal(false);
                }}
                type='icon-icon-shanshu'
              />
            </span>
            {continueStage === 2 && orderDetail && subOrderBack ? (
              <OrderServiceCenterConfirmOrder
                productList={orderDetail?.orderGoods[0].productList}
                subOrderBack={subOrderBack}
                checkPriceList={checkPriceList}
                paySuccess={paySuccess}
              />
            ) : undefined}
            {continueStage === 3 && orderDetail && subOrderBack ? (
              <OrderServiceCenterPaySuccess
                productList={orderDetail?.orderGoods[0].productList}
                subOrderBack={subOrderBack as SubOrderApiData}
                checkPriceList={checkPriceList}
                closeModal={closeModal}
              />
            ) : undefined}
          </div>
        </Spin>
      </Modal>
      <PurchaseModal
        visible={purchaseModalVisible}
        orderId={countOrderId}
        onCancel={() => setPurchaseModalVisible(false)}
        onCheckOrderClick={() => setPurchaseModalVisible(false)}
      />
    </div>
  );
};

export default OrderServiceCenter;
