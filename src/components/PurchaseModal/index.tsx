import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import paySuccess from '@src/assets/svg/pay_success.svg';
import wxPay from '@src/assets/svg/wx_pay.svg';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Toast } from '@src/utils/Toast';
import { ProductIdentification } from '@src/utils/consts';
import { Button, Checkbox, InputNumber, Modal, Spin } from 'antd';
import axios from 'axios';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import moment from 'moment';
import 'moment-precise-range-plugin';
import { toCanvas } from 'qrcode';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { ECompanyType } from '@/api/types';
import { getUserInfo } from '@/utils';

import { GOODS_MODE, GOODS_ONLINE, GOODS_STATUS, PAY_STATUS } from './constant';
import styles from './index.module.less';
import {
  getGoodsDetails,
  getGoodsList,
  getOrderDetails,
  getOrderPayStatus,
  submitOrder,
} from './service';
import { Goods, GoodsDetails, OrderDetails, OrderPayStatus } from './type';

const { clearInterval, setInterval } = window;

type PurchaseModalProps = {
  visible: boolean;
  orderId?: string;
  onCancel: (orderPaySuccess?: boolean) => void;
  onCheckOrderClick?: () => void;
  onApplyInvoiceClick?: () => void;
  onPaySuccess: (paySuccess?: boolean) => void;
};

const Purchase: FC<Omit<PurchaseModalProps, 'visible' | 'onCancel'>> = ({
  orderId: orderIdFromProps,
  onCheckOrderClick,
  onApplyInvoiceClick,
  onPaySuccess,
}) => {
  const [submitOrderId, setSubmitOrderId] = useState<string | null>(null);

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  const [orderSubmitLoading, setOrderSubmitLoading] = useState(false);

  const [restPayTime, setRestPayTime] = useState('');

  const [orderPayStatus, setOrderPayStatus] = useState<OrderPayStatus | null>(
    null,
  );

  const [goodsList, setGoodsList] = useState<Goods[]>([]);

  const [selectedGoodsId, setSelectedGoodsId] = useState<string | null>(null);

  const [goodsDetails, setGoodsDetails] = useState<GoodsDetails | null>(null);

  const [priceIndex, setPriceIndex] = useState(0);

  const [userAgreement, setUserAgreement] = useState(false);

  const [purchaseModalContentLoading, setPurchaseModalContentLoading] =
    useState(false);

  const qrCodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const history = useHistory();

  const currentPrice = goodsDetails?.priceList[priceIndex];

  const currentOrderId = useMemo(
    () => orderIdFromProps ?? submitOrderId,
    [orderIdFromProps, submitOrderId],
  );

  const orderGoods = orderDetails?.orderGoods?.[0];
  const orderPrice = orderGoods?.priceObj;

  // 选择商品的不同价格
  const changeGoodsPrice = (index: number) => {
    if (
      (!isNil(goodsDetails) &&
        index >= 0 &&
        index <= goodsDetails?.priceList?.length) ||
      0 - 1
    ) {
      setPriceIndex(index);
    }
  };

  // 提交订单
  const orderSubmit = async () => {
    if (!userAgreement) {
      Toast('warn', I18N.components.pleaseReadAnd);
      return;
    }

    if (currentPrice) {
      try {
        setOrderSubmitLoading(true);
        const { goodsId, priceId } = currentPrice;
        const {
          data: { data },
        } = await submitOrder({
          orderGoods: [{ goodsId, priceId }],
        });
        setSubmitOrderId(data.orderId);
      } finally {
        setOrderSubmitLoading(false);
      }
    }
  };

  // 获取商品列表，订单详情
  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    let timer: number | undefined;

    setPurchaseModalContentLoading(true);

    if (isNil(currentOrderId)) {
      getGoodsList({
        page: 1,
        size: 1000,
        mode: GOODS_MODE.COUNT,
        online: GOODS_ONLINE.ONLINE,
        status: GOODS_STATUS.ENABLED,
      })
        .then(({ data }) => {
          setGoodsList(data.data.rows);
          setSelectedGoodsId(data.data.rows[0].goodsId);
        })
        .finally(() => setPurchaseModalContentLoading(false));
    } else {
      const queryOrderDetails = async () => {
        try {
          const { data } = await getOrderDetails({ orderId: currentOrderId });
          setOrderDetails(data.data);
        } finally {
          setPurchaseModalContentLoading(false);
        }
      };

      const queryOrderPayStatus = async (firstLoop: boolean) => {
        const { data } = await getOrderPayStatus(
          { orderId: currentOrderId },
          cancelTokenSource.token,
        );
        setOrderPayStatus(data.data);

        if (data.data.status === PAY_STATUS.SUCCESS) {
          onPaySuccess?.();
        }

        // 调用orders/payQuery接口后端会刷新orderDetails状态
        // 第一次确保查询orderDetails在查询payStatus后进行
        if (firstLoop) {
          queryOrderDetails();
        }

        if (data.data.status !== PAY_STATUS.WAIT_PAY) {
          clearInterval(timer);
          cancelTokenSource.cancel();

          if (!firstLoop) {
            // 在轮询payStatus时支付状态不为“未支付”时update orderDetails
            queryOrderDetails();
          }
        } else if (isNil(timer)) {
          timer = setInterval(() => queryOrderPayStatus(false), 1000);
        }
      };

      queryOrderPayStatus(true);
    }

    return () => {
      clearInterval(timer);
      cancelTokenSource.cancel();
    };
  }, [currentOrderId]);

  // 根据当前选择的商品获取商品详情
  useEffect(() => {
    if (!isNil(selectedGoodsId)) {
      getGoodsDetails({ goodsId: selectedGoodsId }).then(({ data }) =>
        setGoodsDetails(data.data),
      );
    }
  }, [selectedGoodsId]);

  // 切换商品时自动选中该商品的第一个价格
  useEffect(() => {
    if (!isNil(goodsDetails)) {
      setPriceIndex(0);
    }
  }, [goodsDetails]);

  // 绘制支付二维码
  useEffect(() => {
    if (orderDetails?.codeUrl && qrCodeCanvasRef.current) {
      toCanvas(qrCodeCanvasRef.current, orderDetails.codeUrl, { width: 136 });
    }
  }, [orderDetails]);

  // 刷新订单剩余支付时间
  useEffect(() => {
    let timer: number | undefined;

    if (
      orderDetails?.createTime &&
      orderPayStatus?.status === PAY_STATUS.WAIT_PAY
    ) {
      const orderExpireTime = moment(orderDetails.createTime).add(2, 'hours');

      const refreshRestPayTime = () => {
        const currentTime = moment();

        if (currentTime.isSameOrAfter(orderExpireTime)) {
          setRestPayTime(I18N.components.hoursMinutesAndSeconds);
          clearInterval(timer);
        } else {
          const { hours, minutes, seconds } = moment.preciseDiff(
            orderExpireTime,
            currentTime,
            true,
          );
          setRestPayTime(
            I18N.template(I18N.components.hours, {
              val1: hours,
              val2: minutes,
              val3: seconds,
            }),
          );

          if (isNil(timer)) {
            timer = setInterval(refreshRestPayTime, 1000);
          }
        }
      };

      refreshRestPayTime();
    } else {
      setRestPayTime('');
    }

    return () => clearInterval(timer);
  }, [orderDetails?.createTime, orderPayStatus?.status]);

  const isLiteCompany =
    getUserInfo()?.userInfo?.companyType === ECompanyType.lite;

  return (
    <Spin
      wrapperClassName={styles.orderSpin}
      spinning={purchaseModalContentLoading}
    >
      {isNil(currentOrderId) ? (
        <>
          <div className={styles.goodsList}>
            <div className={classNames(styles.title, styles.goodsTitle)}>
              {I18N.components.selectProduct}
            </div>
            <div className={styles.goodsListContent}>
              {goodsList.map(goods => (
                <div
                  className={classNames(styles.goodsCard, {
                    [styles.selectedGoodsCard]:
                      goods.goodsId === selectedGoodsId,
                  })}
                  key={goods.goodsId}
                  onClick={() => setSelectedGoodsId(goods.goodsId)}
                >
                  <div className={styles.goodsName}>{goods.goodsName}</div>
                  <div className={styles.goodsPrice}>
                    <span className={styles.goodsRealPrice}>
                      ¥{goods.priceList[0]?.realPrice}
                    </span>
                    <span className={styles.goodsOriginPrice}>
                      {I18N.components.originalPrice}{' '}
                      {goods.priceList[0]?.standPrice}{' '}
                      {I18N.components.element2}
                      {goods.priceList[0]?.priceType}
                    </span>
                  </div>
                  <div className={styles.goodsInfo}>{goods.goodsInfo}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.goodsDetails}>
            <div className={styles.goodsInfoContent}>
              <div className={styles.title}>
                {I18N.components.productDetails}
              </div>
              <div className={styles['caption-s']}>
                {I18N.components.productInformation}
              </div>
              <div className={styles.goodsDetailsName}>
                {goodsDetails?.goodsName}
              </div>
              <div className={styles.goodsDetailsInfo}>
                {goodsDetails?.goodsInfo}
              </div>
              <div className={styles['caption-s']}>
                {I18N.components.includeContent}
              </div>
              <div className={styles.goodsSkuList}>
                {goodsDetails?.skuList?.map(
                  ({ skuLabel, skuCount, skuLimit, id }) => (
                    <div className={styles.goodsSku} key={id}>
                      {skuLimit
                        ? I18N.components.unlimited
                        : I18N.template(I18N.components.numbe3, {
                            val1: Number(skuCount),
                          })}
                      {skuLabel}
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className={styles.goodsPayContent}>
              <div className={styles.goodsCountCaption}>
                {I18N.carbonNeutral.purchaseQuantity}
              </div>
              <div className={styles.inputBox}>
                <Button
                  className={styles.minusButton}
                  icon={<MinusOutlined />}
                  disabled={priceIndex === 0}
                  onClick={() => changeGoodsPrice(priceIndex - 1)}
                />
                <InputNumber
                  className={styles.countInput}
                  disabled
                  controls={false}
                  value={currentPrice?.value}
                />
                <Button
                  className={styles.addButton}
                  icon={<PlusOutlined />}
                  disabled={
                    !!goodsDetails &&
                    priceIndex === (goodsDetails.priceList || []).length - 1
                  }
                  onClick={() => changeGoodsPrice(priceIndex + 1)}
                />
              </div>
              <div className={styles.goodsPriceContent}>
                <div className={styles.goodsPriceContentLeft}>
                  <div className={styles.goodsSkuCaption}>
                    {I18N.components.purchaseContent}
                  </div>
                  <div className={styles.goodsDetailsSku}>
                    {goodsDetails &&
                      currentPrice &&
                      goodsDetails.skuList
                        ?.map(
                          ({ skuLabel, skuCount, skuLimit }) =>
                            (skuLimit
                              ? I18N.components.unlimited
                              : I18N.template(I18N.components.numbe2, {
                                  val1: Number(skuCount) * currentPrice.value,
                                })) + skuLabel,
                        )
                        .join('；')}
                  </div>
                </div>
                <div className={styles.goodsPriceContentRight}>
                  <div>
                    <span className={styles.orderPriceTip}>
                      {I18N.components.orderAmount}
                    </span>
                  </div>
                  <div className={styles.orderPriceBlock}>
                    <span className={styles.orderPrice}>
                      {currentPrice?.realPrice}{' '}
                    </span>
                    <span className={styles.orderPriceUnit}>
                      {I18N.components.element}
                    </span>
                  </div>
                  <div className={styles.orderOriginPrice}>
                    {I18N.components.originalPrice} {currentPrice?.standPrice}{' '}
                    {I18N.components.element}
                  </div>
                </div>
              </div>
              <div className={styles.orderSubmit}>
                <div>
                  <Checkbox
                    checked={userAgreement}
                    onChange={e => setUserAgreement(e.target.checked)}
                  >
                    <span className={styles.userAgreement}>
                      {I18N.carbonNeutral.iHaveReadAnd}
                      <a
                        className={styles.agreement}
                        href='/agreement?service'
                        target='_blank'
                      >
                        {I18N.components.userAgreement}
                      </a>
                    </span>
                  </Checkbox>
                </div>
                <Button
                  className={styles.submitOrderButton}
                  type='primary'
                  loading={orderSubmitLoading}
                  onClick={orderSubmit}
                >
                  {I18N.components.placeOrder}
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.orderDetails}>
            <div className={styles.orderTitle}>
              {I18N.carbonNeutral.confirmOrder}
            </div>
            <div className={styles['body-l-b']}>
              {orderDetails?.companyName}
            </div>
            <div className={styles.orderGoods}>
              <div className={styles['caption-s']}>
                {I18N.components.productInformation}
              </div>
              <div className={styles.orderGoodsTitle}>
                {orderGoods?.goodsName}
              </div>
              <div className={styles['caption-s']}>{orderGoods?.goodsInfo}</div>
            </div>
            <div className={styles.orderItem}>
              <div className={styles['caption-s']}>
                {I18N.components.orderAmount}
              </div>
              <div className={styles.orderItemPrice}>
                <div className={styles.orderItemRealPrice}>
                  {orderPrice?.realPrice}
                  {I18N.components.element}
                </div>
                <div className={styles.orderItemOriginPrice}>
                  {I18N.components.originalPrice} {orderPrice?.standPrice}{' '}
                  {I18N.components.element}
                </div>
              </div>
            </div>
            <div className={styles.orderItem}>
              <div className={styles['caption-s']}>
                {I18N.carbonNeutral.purchaseQuantity}
              </div>
              <div className={styles['body-m-b']}>
                {orderPrice?.value}&nbsp;{orderPrice?.priceType}
              </div>
            </div>
            <div className={styles.orderItem}>
              <div className={styles['caption-s']}>
                {I18N.components.purchaseContent}
              </div>
              <div className={styles.goodsSkuList}>
                {orderGoods?.skuList?.map(
                  ({ skuCount, skuLabel, skuLimit, id }) => (
                    <div className={styles.goodsSku} key={id}>
                      {skuLimit
                        ? I18N.components.unlimited
                        : I18N.template(I18N.components.numbe, {
                            val1: Number(skuCount) * Number(orderPrice?.value),
                          })}
                      {skuLabel}
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className={styles.orderItem}>
              <div className={styles['caption-s']}>
                {I18N.components.orderTime}
              </div>
              <div className={styles['body-m']}>{orderDetails?.createTime}</div>
            </div>
            <div className={styles.orderItem}>
              <div className={styles['caption-s']}>
                {I18N.carbonNeutral.orderNumber2}
              </div>
              <div className={styles['body-m']}>{orderDetails?.orderId}</div>
            </div>
          </div>
          <div className={styles.payDetails}>
            {(orderPayStatus?.status === PAY_STATUS.WAIT_PAY ||
              orderPayStatus?.status === PAY_STATUS.CANCEL) && (
              <>
                <div className={styles.orderTitle}>
                  {I18N.components.scanCodePayment}
                </div>
                <div className={styles.orderPayContent}>
                  <div className={styles['body-m-b']}>
                    {I18N.carbonNeutral.payableAmount}
                  </div>
                  <div className={styles.orderPayMoney}>
                    <span className={styles.orderPayMoneyValue}>
                      {orderPrice?.realPrice}
                    </span>
                    <span>{I18N.components.element}</span>
                  </div>
                  <div className={styles.restPayTime}>
                    {orderPayStatus.status === PAY_STATUS.WAIT_PAY ? (
                      <>
                        {I18N.components.pleaseProvideInformationOn}
                        <span className={styles.time}>{restPayTime}</span>
                        {I18N.components.internalPaymentCompleted}
                      </>
                    ) : (
                      I18N.components.orderHasTimedOut2
                    )}
                  </div>
                  <div className={styles.wxPay}>
                    <img className={styles.wxPayImg} src={wxPay} alt='' />
                    <span>{I18N.carbonNeutral.weChatPayment}</span>
                  </div>
                  <div className={styles.qrCodeContent}>
                    {orderPayStatus.status === PAY_STATUS.CANCEL && (
                      <div className={styles.qrCodeExpire}>
                        <span>{I18N.components.orderHasTimedOut}</span>
                        <span>{I18N.components.pleasePlaceANewOrder}</span>
                      </div>
                    )}
                    <canvas id='canvas' ref={qrCodeCanvasRef} />
                  </div>
                  <div className={styles.payResultCaption}>
                    <div>{I18N.components.pleaseUseYourPhone}</div>
                    <div>{I18N.components.afterSuccessfulPayment}</div>
                  </div>
                </div>
              </>
            )}
            {orderPayStatus?.status === PAY_STATUS.SUCCESS && (
              <>
                <div className={styles.orderTitle}>
                  {I18N.components.paymentCompleted}
                </div>
                <div className={styles.orderPayContent}>
                  <img
                    className={styles.paySuccessImg}
                    src={paySuccess}
                    alt=''
                  />
                  <div className={styles['title-s-b']}>
                    {I18N.carbonNeutral.paymentSuccessful2}
                  </div>
                  <div className={styles.orderPayMoney}>
                    <span className={styles.orderPayMoneyValue}>
                      {orderPrice?.realPrice}
                    </span>
                    <span>{I18N.components.element}</span>
                  </div>
                  <div className={styles['caption-s']}>
                    {I18N.components.paymentTime}
                    {orderDetails?.payTime}
                  </div>
                  {!isLiteCompany && (
                    <div className={styles.orderOperation}>
                      <Button
                        onClick={
                          typeof onApplyInvoiceClick === 'function'
                            ? onApplyInvoiceClick
                            : () => {
                                history.push({
                                  pathname: RouteMaps.homeInvoiceManagement,
                                  search: `${ProductIdentification.SAAS_PRODUCT_NAME}=${ProductIdentification.SAAS_HOME}`,
                                });
                              }
                        }
                      >
                        {I18N.components.applyForInvoice}
                      </Button>
                      <Button
                        className={styles.orderMenuBtn}
                        type='primary'
                        onClick={
                          typeof onCheckOrderClick === 'function'
                            ? onCheckOrderClick
                            : () => {
                                history.push({
                                  pathname: RouteMaps.homeProductOrderRecord,
                                  search: `${ProductIdentification.SAAS_PRODUCT_NAME}=${ProductIdentification.SAAS_HOME}`,
                                });
                              }
                        }
                      >
                        {I18N.components.viewOrders}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </Spin>
  );
};

const PurchaseModal: FC<PurchaseModalProps> = ({
  visible,
  orderId,
  onCancel,
  onApplyInvoiceClick,
  onCheckOrderClick,
  onPaySuccess,
}) => {
  const [orderPaySuccess, setOrderPaySuccess] = useState(false);
  return (
    <Modal
      className={styles.purchaseModal}
      open={visible}
      width={896}
      destroyOnClose
      title={null}
      footer={null}
      styles={{
        content: {
          padding: 0,
        },
      }}
      onCancel={() => {
        onCancel(orderPaySuccess);
        onPaySuccess?.(orderPaySuccess);
      }}
    >
      <div className={styles.purchaseModalContent}>
        <Purchase
          orderId={orderId}
          onCheckOrderClick={onCheckOrderClick}
          onApplyInvoiceClick={onApplyInvoiceClick}
          onPaySuccess={() => setOrderPaySuccess(true)}
        />
      </div>
    </Modal>
  );
};

export default PurchaseModal;
