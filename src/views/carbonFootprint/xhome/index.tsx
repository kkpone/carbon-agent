/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-06 19:55:36
 * @Date: 2022-10-29 20:23:17
 * @@description:
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 碳账户-首页欢迎页
 * @returns
 */
import I18N from '@src/lang/I18N';
import IconFont from '@src/components/iconfont';
import { RouteMaps } from '@src/router/route-paths';
import { ProductIdentification } from '@src/utils/consts';
import OrderServiceCenterConfirmOrder from '@src/views/system/productService/orderServiceCenter/components/confirmOrder';
import OrderServiceCenterPaySuccess from '@src/views/system/productService/orderServiceCenter/components/paySuccess';
import OrderServiceCenterSelectTime from '@src/views/system/productService/orderServiceCenter/components/selectTime';
import {
  getProductListDetail,
  postSubOrder,
} from '@src/views/system/productService/orderServiceCenter/service';
import {
  OrderProductListDetail,
  PriceList,
  SubOrderApiData,
} from '@src/views/system/productService/orderServiceCenter/type';
import { Tabs, Image, Button, Modal, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import './index.less';
import CarbonAccountNoOrder from './noOrder';
import { carbonAccountHomeInit } from './service';
import { CarbonAccountHomeTabs } from './type';

const carbonAccountC1 = `${process.env.REACT_APP_API_URL_OSS}/saas-product/carbonFootprintHomeC1.png`;
const carbonAccountT1 = `${process.env.REACT_APP_API_URL_OSS}/saas-product/carbonFootprintHomeT11.svg`;
const carbonAccountT2 = `${process.env.REACT_APP_API_URL_OSS}/saas-product/carbonFootprintHomeT12.svg`;
const carbonAccountT3 = `${process.env.REACT_APP_API_URL_OSS}/saas-product/carbonFootprintHomeT13.svg`;

const { TabPane } = Tabs;

const CarbonFootprintFlag = (props: { noOrder: boolean }) => {
  const { noOrder } = props;
  const history = useHistory();
  const [tabActive, setTabActive] = useState<string>('1');
  /** 弹框是否显示 - 续订的整体弹框 */
  const [showContinueModal, setShowContinueModal] = useState<boolean>(false);
  /** 点击续订按钮 进入加载装填 */
  const [showContinueLoading, setShowContinueLoading] =
    useState<boolean>(false);
  /** 当前选中的价格 */
  const [checkPriceList, setCheckPriceList] = useState<PriceList>();
  /** 当前提交订单后的返回值 */
  const [subOrderBack, setSubOrderBack] = useState<SubOrderApiData>();
  /** 当前续订 - 产品的明细 */
  const [continueInfo, setContinueInfo] = useState<OrderProductListDetail>();
  /** 当前处于续订的那个阶段 - 1.选择时长 2.确认订单 3.支付成功 */
  const [continueStage, setContinueStage] = useState<number>(1);
  const tabs: CarbonAccountHomeTabs[] = [
    {
      label: I18N.carbonFootprint.dataOverview,
      cont: I18N.carbonFootprint.carbonFootprintVerification3,
      imgPath: carbonAccountT1,
      value: '1',
    },
    {
      label: I18N.carbonFootprint.industryBenchmarking,
      cont: I18N.carbonFootprint.sameTypeOfProduct,
      imgPath: carbonAccountT2,
      value: '2',
    },
    {
      label: I18N.carbonFootprint.generateReport,
      cont: I18N.carbonFootprint.oneClickAutomaticGeneration,
      imgPath: carbonAccountT3,
      value: '3',
    },
  ];
  const changeTabActive = (activeKey: string) => {
    setTabActive(activeKey);
  };
  /** 初始化-生成秘钥 */
  const init = async () => {
    !noOrder && (await carbonAccountHomeInit());
  };
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
    setContinueStage(1);
    setCheckPriceList(undefined);
    setSubOrderBack(undefined);
    setContinueInfo(undefined);
  };
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
  useEffect(() => {
    init();
  }, []);
  return (
    <div
      style={{ padding: '0 20px 0 0', marginBottom: 0 }}
      className='carbonAccount'
    >
      <div className='home'>
        <div className='homeTitle'>
          <div className='homeTitleMain'>
            <div style={{ paddingTop: 40 }}>
              <div className='homeTitleText'>
                {I18N.carbonFootprint.carbonFootprintVerification2}
              </div>
              <div className='homeTitleTextDetail mt20'>
                {I18N.carbonFootprint.carbonFootprintVerification}
              </div>
              <div style={{ marginTop: 30 }}>
                <Button
                  onClick={async () => {
                    try {
                      setShowContinueLoading(true);
                      setShowContinueModal(true);
                      await getListInfo('CarbonFootprint_Flag');
                      setShowContinueLoading(false);
                    } catch {
                      setShowContinueModal(false);
                      setShowContinueLoading(false);
                    }
                  }}
                  style={{ width: 140 }}
                  type='primary'
                >
                  {I18N.carbonFootprint.activateNow}
                </Button>
              </div>
            </div>
            <div className='homeTitleIllustration'>
              <img src={carbonAccountC1} alt='' />
            </div>
          </div>
        </div>

        {noOrder && (
          <div>
            <CarbonAccountNoOrder />
          </div>
        )}

        <div className='homeTab' style={{ marginBottom: 40 }}>
          <div className='tabTitle'>
            {I18N.carbonFootprint.functionIntroduction}
          </div>
          <div className='tabMain'>
            <Tabs activeKey={tabActive} onChange={changeTabActive}>
              {tabs.map((item: CarbonAccountHomeTabs) => (
                <TabPane tab={item.label} key={item.value}>
                  <div className='tabMainItem'>
                    <div style={{ margin: '20px 0' }}>{item.cont}</div>
                    <Image height={380} preview={false} src={item.imgPath} />
                  </div>
                </TabPane>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
      <div style={{ color: '#6C757D' }} className='account-footer'>
        <span>
          {I18N.carbonFootprint.customerConsultantConsultation}
          <IconFont
            style={{ margin: '0 10px 0 10px' }}
            type='icon-icon-dianhua'
          />
          010-50973498
        </span>
        <span style={{ marginLeft: 30 }}>
          <IconFont style={{ marginRight: 10 }} type='icon-icon-youxiang' />
          mail@carbonstop.com
        </span>
      </div>
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
                findOrder={() => {
                  history.push(
                    `${RouteMaps.homeProductOrderRecord}?${ProductIdentification.SAAS_PRODUCT_NAME}=${ProductIdentification.SAAS_HOME}`,
                  );
                }}
                findInvoice={() => {
                  history.push(
                    `${RouteMaps.homeInvoiceManagement}?${ProductIdentification.SAAS_PRODUCT_NAME}=${ProductIdentification.SAAS_HOME}`,
                  );
                }}
                productList={continueInfo.productList}
                subOrderBack={subOrderBack as SubOrderApiData}
                checkPriceList={checkPriceList}
              />
            ) : undefined}
          </div>
        </Spin>
      </Modal>
    </div>
  );
};

export default CarbonFootprintFlag;
