/**
 * 产品服务 - 服务中心
 * @returns
 */
import I18N from '@src/lang/I18N';
import IconFont from '@src/components/iconfont';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import { Modal, Spin } from 'antd';
import { AxiosResponse } from 'axios';
import { useRef, useState } from 'react';
import { checkPermissions } from '@src/components/Permission/utils';
import style from '../index.module.less';
import './defaultAntd.less';
import OrderServiceCenterSelectTime from './components/selectTime';
import { orderServiceCenterTableCol } from './module';
import {
  getProductListDetail,
  getProductServiceOrderServiceCenterList,
  postSubOrder,
} from './service';
import {
  OrderProductListDetail,
  OrderServiceCenterList,
  PriceList,
  SubOrderApiData,
} from './type';
import OrderServiceCenterConfirmOrder from './components/confirmOrder';
import OrderServiceCenterPaySuccess from './components/paySuccess';

const OrderServiceCenter = () => {
  const childRef = useRef<TableRef>();
  /** 弹框是否显示 - 续订的整体弹框 */
  const [showContinueModal, setShowContinueModal] = useState<boolean>(false);
  /** 点击续订按钮 进入加载装填 */
  const [showContinueLoading, setShowContinueLoading] =
    useState<boolean>(false);
  /** 当前续订选中的数据 */
  const [, setClickInfo] = useState<OrderServiceCenterList>();
  /** 当前选中的价格 */
  const [checkPriceList, setCheckPriceList] = useState<PriceList>();
  /** 当前提交订单后的返回值 */
  const [subOrderBack, setSubOrderBack] = useState<SubOrderApiData>();
  /** 当前续订 - 产品的明细 */
  const [continueInfo, setContinueInfo] = useState<OrderProductListDetail>();
  /** 当前处于续订的那个阶段 - 1.选择时长 2.确认订单 3.支付成功 */
  const [continueStage, setContinueStage] = useState<number>(1);
  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<AxiosResponse<OrderServiceCenterList[]>>,
  ) => ({
    data: back.data.data,
    count: 0,
  });
  /**
   * 从接口获取续订产品的明细
   * @param productId 当前产品的id
   */
  const getListInfo = async (productId: string) => {
    const back = await getProductListDetail(productId);
    if (back.data.data) {
      setContinueInfo(back.data.data);
    }
  };
  /** 需要动态判断显示续订要传递的编码 */
  const needCode = [
    {
      productId: 'CarbonFootprint_Flag',
      goodsId: '20221019004',
    },
    {
      productId: 'ecaccounting_model',
      goodsId: '20221019003',
    },
  ];
  const columns = [
    ...orderServiceCenterTableCol(),
    {
      title: I18N.carbonFootprint.operation,
      width: 150,
      dataIndex: 'set',
      render: (val: string, item: OrderServiceCenterList) => {
        const proInfo = needCode.find(cod => cod.productId === item.productId);
        return proInfo ? (
          <div>
            {checkPermissions(
              I18N.system.renewal,
              'orderServiceCenter:Continue',
            ) ? (
              <span
                onClick={async () => {
                  try {
                    setShowContinueLoading(true);
                    setShowContinueModal(true);
                    await getListInfo(proInfo.productId);
                    setShowContinueLoading(false);
                  } catch {
                    setShowContinueModal(false);
                    setShowContinueLoading(false);
                  }
                  setClickInfo(item);
                }}
                className={`${style.primaryColorFont} ${style.cursorPointerFont} m-r-10`}
              >
                {I18N.system.renewal}
              </span>
            ) : (
              '-'
            )}
          </div>
        ) : (
          '-'
        );
      },
    },
  ];

  /**
   * 提交订单 - 获取产品价格
   * @param info 当前选中的产品价格
   */
  const getPrice = async (info: PriceList) => {
    if (info) {
      try {
        setShowContinueLoading(true);
        const back = await postSubOrder({
          goodsId: info.goodsId,
          priceId: info.priceId,
        });
        setCheckPriceList(info);
        setSubOrderBack(back.data.data);
        setContinueStage(2);
        setShowContinueLoading(false);
      } catch {
        setShowContinueLoading(false);
      }
    }
  };
  /** 支付成功的回调 */
  const paySuccess = () => {
    setShowContinueLoading(true);
    setTimeout(() => {
      setContinueStage(3);
      setShowContinueLoading(false);
    }, 500);
  };
  /** 关闭弹框 - 变为初始化状态 */
  const closeOrderServiceCenterModal = () => {
    setCheckPriceList(undefined);
    setSubOrderBack(undefined);
    setContinueInfo(undefined);
    setContinueStage(1);
    /** 刷新列表 */
    childRef.current?.reset();
  };
  return (
    <div className={`${style.homeProductOrder}`}>
      <div className={style.main}>
        <div className={style.mainHeader}>
          <div className={style.productTitle}>{I18N.system.serviceCenter}</div>
        </div>
        <div className='m-t-16'>
          <CommonTable<OrderServiceCenterList, any, any>
            bordered={false}
            searchParams={{}}
            cRef={childRef}
            pageSize={1000}
            fetchApi={getProductServiceOrderServiceCenterList}
            returnFetchApi={returnFetchApi}
            columns={columns}
            rowKey='id'
            pagePosition={false}
            pagination={false}
          />
        </div>
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
              {continueStage === 1 && continueInfo ? (
                <OrderServiceCenterSelectTime
                  continueInfo={continueInfo as OrderProductListDetail}
                  getPrice={getPrice}
                />
              ) : undefined}
              {continueStage === 2 && continueInfo && subOrderBack ? (
                <OrderServiceCenterConfirmOrder
                  productList={continueInfo.productList}
                  subOrderBack={subOrderBack as SubOrderApiData}
                  paySuccess={paySuccess}
                  checkPriceList={checkPriceList}
                />
              ) : undefined}
              {continueStage === 3 && continueInfo ? (
                <OrderServiceCenterPaySuccess
                  productList={continueInfo.productList}
                  subOrderBack={subOrderBack as SubOrderApiData}
                  checkPriceList={checkPriceList}
                />
              ) : undefined}
            </div>
          </Spin>
        </Modal>
      </div>
    </div>
  );
};

export default OrderServiceCenter;
