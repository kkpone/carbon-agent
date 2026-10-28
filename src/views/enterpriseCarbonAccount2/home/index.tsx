/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-10-29 11:09:55
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-03-31 15:13:38
 */
/**
 * 碳账户-首页欢迎页
 * @returns
 */
import IconFont from '@src/components/iconfont';
import I18N, { LocaleType } from '@src/lang/I18N';
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
import { Tabs, Image, Button, Spin, Modal } from 'antd';
import { useContext, useEffect, useState } from 'react';
import './index.less';
import '@src/views/system/productService/orderServiceCenter/defaultAntd.less';
import { useHistory } from 'react-router-dom';

import CarbonAccountNoOrder from './noOrder';
import { carbonAccountHomeInit } from './service';
import { CarbonAccountHomeTabs } from './type';
import { LocaleContext } from '@/components/LocaleProvider';

const carbonAccountC1 = `${process.env.REACT_APP_API_URL_OSS}/saas-product/Enterprise_Carbon_Accounting-img.svg`;

const { TabPane } = Tabs;

const CarbonAccountHome = (props: { noOrder: boolean; noButton?: boolean }) => {
  const history = useHistory();
  const { noOrder, noButton } = props;
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

  const getImgPath = (fileName: string) =>
    `${process.env.REACT_APP_API_URL_OSS}/saas-product/enterpriseCarbon/homePage/${fileName}.png`;

  const tabs: CarbonAccountHomeTabs[] = [
    {
      label: I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
      cont: I18N.enterpriseCarbonAccount2.basedOnAccountingModel,
      imgPath: getImgPath('0'),
      enImgPath: getImgPath('0-en'),
      value: '1',
    },
    {
      label: I18N.enterpriseCarbonAccount2.carbonEmissionReport,
      cont: I18N.enterpriseCarbonAccount2.canBeQuicklyGenerated,
      imgPath: getImgPath('1'),
      enImgPath: getImgPath('1-en'),
      value: '2',
    },
  ];
  const changeTabActive = (activeKey: string) => {
    setTabActive(activeKey);
  };
  /** 初始化-生成秘钥 */
  const init = async () => {
    !noOrder && (await carbonAccountHomeInit());
  };

  const { locale } = useContext(LocaleContext);
  const isEn = locale === LocaleType.enUS;

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
    <div style={{ marginBottom: 0 }} className='carbonAccount'>
      <div className='home'>
        <div className='homeTitle'>
          <div className='homeTitleMain'>
            <div style={{ paddingTop: 40 }}>
              <div className='homeTitleText'>
                {I18N.carbonFootprint3.enterpriseCarbonAccounting}
              </div>
              <div className='homeTitleTextDetail mt20'>
                {I18N.enterpriseCarbonAccount2.accordingToGhg2}
              </div>
              {/* <div style={{ marginTop: 30 }}>
                {!noButton && (
                  <Button
                    onClick={async () => {
                      try {
                        setShowContinueLoading(true);
                        setShowContinueModal(true);
                        await getListInfo('ecaccounting_model');
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
                )}
              </div> */}
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
                    <Image
                      height={380}
                      preview={false}
                      src={isEn ? item.enImgPath : item.imgPath}
                    />
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

export default CarbonAccountHome;
