import qrCodeImg from '@assets/svg/service_qr_code.png';
import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Button, Checkbox, Radio, Spin } from 'antd';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { isNil } from 'lodash-es';
import moment from 'moment';
import 'moment-precise-range-plugin';
import { useEffect, useState } from 'react';

import { getUserInfo } from '@/utils';
import { ProductSource } from '@/views/system/login/component/Login';

import { PaymentModal } from './PaymentModal';
import { SpinnerInputNumber } from './SpinnerInputNumber';
import styles from './index.module.less';
import {
  getGoodsPersonal,
  getOrderDetailsPersonal,
  getOrderPayStatusPersonal,
  submitOrderPersonal,
} from './service';
import {
  GoodsItem,
  GoodsPersonalResponse,
  OrderDetailsPersonal,
  OrderPayStatusPersonal,
  PriceItem,
  SelectedCount,
  SelectedFactor,
  SelectedPlan,
  SelectedSupport,
} from './type';

const { clearInterval, setInterval } = window;

const PAY_STATUS = {
  WAIT_PAY: '0',
  SUCCESS: '1',
  CANCEL: '2',
} as const;

/**
 * 根据数量从 priceList 中获取对应的价格信息
 */
const getPriceByQuantity = (
  priceList: PriceItem[],
  quantity: number,
): PriceItem | null => {
  if (!priceList || priceList.length === 0) return null;
  // 找到数量匹配的价格，优先找完全匹配的，否则找最接近且小于等于的
  const matched = priceList.find(p => p.value === quantity);
  if (matched) return matched;
  // 找小于等于数量的最大价格
  const sorted = [...priceList].sort((a, b) => b.value - a.value);
  return sorted.find(p => p.value <= quantity) || sorted[sorted.length - 1];
};

/**
 * 解析 goodsInfo 字符串为功能列表
 */
const parseGoodsInfo = (goodsInfo: string): string[] => {
  if (!goodsInfo) return [];
  return goodsInfo.split('\n').filter(item => item.trim());
};

interface PlanCardProps {
  title: string;
  price: string;
  priceUnit?: string;
  description: string;
  features: string[];
  isSelected?: boolean;
  isCurrent?: boolean;
  isPremium?: boolean;
  onClick?: () => void;
  goodsItem?: GoodsItem;
  selectedPriceId?: number;
  disabled?: boolean;
}

const PlanCard = ({
  title,
  price,
  priceUnit,
  description,
  features,
  isSelected = false,
  isCurrent = false,
  isPremium = false,
  onClick,
  goodsItem,
  selectedPriceId,
  disabled = false,
}: PlanCardProps) => {
  // 如果有 goodsItem，使用接口返回的价格
  const displayPrice =
    goodsItem && selectedPriceId
      ? goodsItem.priceList
          ?.find(p => p.priceId === selectedPriceId)
          ?.realPrice.toLocaleString() || price
      : price;

  const [showQRCode, setShowQRCode] = useState(false);

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  // 计算卡片样式
  const getCardStyle = () => {
    if (disabled) {
      return { cursor: 'not-allowed' };
    }
    if (isSelected) {
      return {
        border: '1px solid transparent',
        background:
          'linear-gradient(#fff, #fff) padding-box, linear-gradient(to bottom, #49ED92 0%, #33E9C4 28%, #52CABE 45%, #1BD3BA 100%) border-box',
      };
    }
    return undefined;
  };

  return (
    <div
      className={`${styles.planCard} ${isSelected ? styles.selected : ''} ${
        isPremium ? styles.premium : ''
      } ${disabled ? styles.disabled : ''}`}
      onClick={handleClick}
      style={getCardStyle()}
    >
      <div className={styles.planCardContent}>
        <div className={styles.planHeader}>
          <div className={styles.planTitleRow}>
            <div className={styles.planTitleLeft}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 16 16'
                fill='none'
              >
                <path
                  d='M7.57356 2.41327C7.69356 1.9866 8.30689 1.9866 8.42689 2.41327L9.01356 4.51994C9.34689 5.7066 10.2802 6.63994 11.4802 6.97327L13.5869 7.57327C14.0136 7.69327 14.0136 8.3066 13.5869 8.4266L11.4802 9.01327C10.2802 9.35994 9.34689 10.2799 9.01356 11.4799L8.42689 13.5866C8.30689 14.0133 7.69356 14.0133 7.57356 13.5866L6.97356 11.4799C6.64022 10.2933 5.70689 9.35994 4.52022 9.01327L2.41356 8.4266C2.31854 8.40266 2.23423 8.34769 2.174 8.2704C2.11376 8.19311 2.08105 8.09793 2.08105 7.99994C2.08105 7.90195 2.11376 7.80676 2.174 7.72947C2.23423 7.65218 2.31854 7.59721 2.41356 7.57327L4.52022 6.97327C5.70689 6.63994 6.64022 5.7066 6.97356 4.51994L7.57356 2.41327ZM13.2002 0.453271C13.2402 0.319938 13.4136 0.319938 13.4536 0.453271L13.6936 1.27994C13.8269 1.77327 14.2136 2.15994 14.7069 2.29327L15.5336 2.53327C15.6669 2.57327 15.6669 2.7466 15.5336 2.7866L14.7069 3.0266C14.2136 3.15994 13.8269 3.5466 13.6936 4.03994L13.4536 4.8666C13.4136 4.99994 13.2402 4.99994 13.2002 4.8666L12.9602 4.03994C12.8269 3.5466 12.4402 3.15994 11.9469 3.0266L11.1202 2.7866C10.9869 2.7466 10.9869 2.57327 11.1202 2.53327L11.9469 2.29327C12.4402 2.15994 12.8269 1.77327 12.9602 1.27994L13.2002 0.453271Z'
                  fill='#04252B'
                />
              </svg>
              <span className={styles.planTitle}>{title}</span>
            </div>
            {isCurrent && (
              <div className={styles.currentTag}>{I18N.components.current}</div>
            )}
            {!isCurrent && !isPremium && (
              <div className={styles.radioWrapper}>
                {isSelected ? (
                  <IconFont
                    type='icon-icon-xuanzhong'
                    style={{ fontSize: 16 }}
                  />
                ) : (
                  <IconFont
                    type='icon-icon-weixuanzhong'
                    style={{ fontSize: 16 }}
                  />
                )}
              </div>
            )}
          </div>
          {!isPremium && (
            <div className={styles.priceSection}>
              <div className={styles.price}>
                <span className={styles.currency}>¥</span>
                <span className={styles.priceValue}>{displayPrice}</span>
              </div>
              {priceUnit && (
                <span className={styles.priceUnit}>{priceUnit}</span>
              )}
            </div>
          )}
          <p
            className={
              isPremium ? styles.premiumDescription : styles.description
            }
          >
            {description}
          </p>
        </div>
        <div className={styles.featuresList}>
          {isPremium && showQRCode ? (
            <div className={styles.qrCodeContent}>
              <div className={styles.qrCodeTitle}>
                {I18N.carbonFootprint3.contactExclusiveCustomers}
              </div>
              <img
                src={qrCodeImg}
                alt={I18N.components.consultationQrCode}
                className={styles.qrCodeImage}
              />
            </div>
          ) : (
            features.map(feature => (
              <div key={`${title}-${feature}`} className={styles.featureItem}>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='none'
                >
                  <path
                    d='M12.5498 5.87695L7.55957 10.8672C7.44312 10.9838 7.2876 11.0531 7.12305 11.0615C6.95852 11.07 6.79671 11.0171 6.66895 10.9131L6.61914 10.8672L3.625 7.87305L4.56445 6.93262L7.08887 9.45605L11.6084 4.9375L12.5498 5.87695Z'
                    fill='#04252B'
                  />
                </svg>
                <span
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(feature),
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
      {isPremium && (
        <div className={styles.premiumButton}>
          <Button
            type='default'
            className={styles.consultButton}
            onMouseEnter={() => setShowQRCode(true)}
            onMouseLeave={() => setShowQRCode(false)}
          >
            {I18N.components.consultNow}
          </Button>
        </div>
      )}
    </div>
  );
};

interface ServiceCardProps {
  title: string;
  price: string;
  priceUnit: string;
  description: string;
  quantity: number;
  onQuantityChange: (value: number, priceId: number, price: number) => void;
  goodsItem?: GoodsItem;
  selectedPriceId?: number;
}

const ServiceCard = ({
  title,
  price,
  priceUnit,
  description,
  quantity,
  onQuantityChange,
  goodsItem,
  selectedPriceId,
}: ServiceCardProps) => {
  // 根据数量获取价格
  let currentPrice: PriceItem | null = null;
  if (goodsItem?.priceList) {
    if (selectedPriceId) {
      currentPrice =
        goodsItem.priceList.find(p => p.priceId === selectedPriceId) ||
        getPriceByQuantity(goodsItem.priceList, quantity);
    } else {
      currentPrice = getPriceByQuantity(goodsItem.priceList, quantity);
    }
  }
  const displayPrice = currentPrice
    ? currentPrice.realPrice.toLocaleString()
    : price;

  const handleQuantityChange = (value: number | null) => {
    const numValue = value || 0;
    const priceInfo = goodsItem?.priceList
      ? getPriceByQuantity(goodsItem.priceList, numValue)
      : null;
    if (priceInfo) {
      onQuantityChange(numValue, priceInfo.priceId, priceInfo.realPrice);
    } else {
      onQuantityChange(numValue, 0, 0);
    }
  };

  // 获取最大可购买数量
  const maxQuantity = goodsItem?.priceList
    ? Math.max(...goodsItem.priceList.map(p => p.value))
    : undefined;

  // 计算 allowedValues 和 step（与产品数量逻辑一致）
  const priceList = goodsItem?.priceList || [];
  const priceValues = priceList.map(p => p.value);
  // 在 allowedValues 中添加 0 和 1（如果它们不在 priceList 中）
  const allowedValues = new Set([0, 1, ...priceValues]);
  const sortedAllowedValues = Array.from(allowedValues).sort((a, b) => a - b);

  // 计算最小差值作为 step（用于输入框的 step 属性）
  const sortedPriceValues = [...priceValues].sort((a, b) => a - b);
  let minStep = 1;
  if (sortedPriceValues.length > 1) {
    const steps: number[] = [];
    for (let i = 1; i < sortedPriceValues.length; i++) {
      steps.push(sortedPriceValues[i] - sortedPriceValues[i - 1]);
    }
    minStep = Math.min(...steps);
  }

  // 计算卡片样式（根据数量是否大于 0 显示选中边框）
  const getCardStyle = () => {
    if (quantity > 0) {
      return {
        border: '1px solid transparent',
        background:
          'linear-gradient(#fff, #fff) padding-box, linear-gradient(to bottom, #49ED92 0%, #33E9C4 28%, #52CABE 45%, #1BD3BA 100%) border-box',
      };
    }
    return undefined;
  };

  return (
    <div className={styles.serviceCard} style={getCardStyle()}>
      <div className={styles.serviceHeader}>
        <div className={styles.serviceTitleRow}>
          <span className={styles.serviceTitle}>{title}</span>
        </div>
        <div className={styles.priceSection}>
          <div className={styles.price}>
            <span className={styles.serCurrency}>¥</span>
            <span className={styles.serPriceValue}>{displayPrice}</span>
            <span className={styles.serPriceUnit}>{priceUnit}</span>
          </div>
        </div>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.serviceFooter}>
        <span className={styles.quantityLabel}>
          {I18N.carbonNeutral.purchaseQuantity}
        </span>
        <SpinnerInputNumber
          value={quantity}
          min={0}
          max={maxQuantity}
          step={minStep}
          allowedValues={sortedAllowedValues}
          onChange={handleQuantityChange}
          width={120}
        />
      </div>
    </div>
  );
};

interface SubscriptionContentProps {
  productSource: ProductSource;
  onSuccess?: () => void;
  /** 打开后默认勾选专业服务：goodsName 包含该关键字的首条 */
  preselectProfessionalSupportKeyword?: string;
}

export const SubscriptionContent = ({
  productSource,
  onSuccess,
  preselectProfessionalSupportKeyword,
}: SubscriptionContentProps) => {
  const [loading, setLoading] = useState(false);
  const [goodsData, setGoodsData] = useState<{
    goodsId?: string;
    factorBuyStatus?: string;
    goodserviceList: GoodsItem[];
    goodFactorList: GoodsItem[];
    goodCountsList: GoodsItem[];
    goodSupportList: GoodsItem[];
  } | null>(null);

  // 选中的方案（基础版、高级版）
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  // 选中的因子库
  const [selectedFactor, setSelectedFactor] = useState<SelectedFactor | null>(
    null,
  );
  // 选中的产品数量
  const [selectedCount, setSelectedCount] = useState<SelectedCount | null>(
    null,
  );
  // 选中的专业服务
  const [selectedSupports, setSelectedSupports] = useState<
    Record<string, SelectedSupport>
  >({});

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // 订单相关状态
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetailsPersonal | null>(
    null,
  );
  const [orderPayStatus, setOrderPayStatus] =
    useState<OrderPayStatusPersonal | null>(null);
  const [orderSubmitLoading, setOrderSubmitLoading] = useState(false);
  const [restPayTime, setRestPayTime] = useState('');
  // 用户当前已购买的方案 goodsId
  const [currentGoodsId, setCurrentGoodsId] = useState<string | null>(null);
  // 用户是否已购买因子库
  const [isFactorPurchased, setIsFactorPurchased] = useState(false);

  const TrialVersionText = {
    [ProductSource.product]: {
      productCountTitle: I18N.carbonFootprint3.productQuantity,
      title: I18N.system.trialVersion,
      price: '0',
      description: I18N.components.freeTrialOfTian,
      features: [
        I18N.components.skuProducts,
        I18N.components.basicCarbonFootprint,
        I18N.components.aiIntelligentConstruction,
      ],
    },
    [ProductSource.enterprise]: {
      productCountTitle: I18N.components.numberOfEntities,
      title: I18N.system.trialVersion,
      price: '0',
      description: I18N.components.freeTrialOfTian2,
      features: [
        I18N.components.individualAccountingEntity,
        I18N.components.basicCarbonEmissions,
        I18N.components.unrestrictedAi,
      ],
    },
  };
  /**
   * 获取商品信息
   */
  const fetchGoodsInfo = async () => {
    try {
      setLoading(true);
      const response = await getGoodsPersonal({ productSource });
      if (response.data.code === 200) {
        const responseData = response.data
          .data as GoodsPersonalResponse['data'] & {
          goodsId?: string;
          factorBuyStatus?: string;
        };
        setGoodsData(responseData);
        // 保存用户当前已购买的 goodsId
        const { goodsId, factorBuyStatus } = responseData as {
          goodsId?: string;
          factorBuyStatus?: string;
        };
        if (goodsId) {
          setCurrentGoodsId(goodsId);
        }
        // 保存用户因子库购买状态
        if (factorBuyStatus === '1') {
          setIsFactorPurchased(true);
        }
        // 根据 goodsId 设置当前选中的方案
        if (
          responseData.goodserviceList &&
          responseData.goodserviceList.length > 0
        ) {
          let targetPlan: GoodsItem | null = null;
          // 如果存在 goodsId，则选中对应的方案
          if (goodsId) {
            targetPlan =
              responseData.goodserviceList.find(
                plan => plan.goodsId === goodsId,
              ) || null;
          }
          // 如果没找到对应的方案，则默认选中第一个
          if (!targetPlan && responseData.goodserviceList.length > 0) {
            [targetPlan] = responseData.goodserviceList;
          }
          if (targetPlan) {
            const firstPrice = targetPlan.priceList?.[0];
            if (firstPrice) {
              setSelectedPlan({
                goodsId: targetPlan.goodsId,
                priceId: firstPrice.priceId,
                quantity: firstPrice.value,
                price: firstPrice.realPrice,
                buyCountStatus: targetPlan.buyCountStatus,
                productSkuCounts: targetPlan.productSkuCounts,
              });
            }
          }
        }
        // 设置因子库（如果已购买，自动选中第一个高级因子库）
        if (factorBuyStatus === '1' && responseData.goodFactorList.length > 0) {
          const factorItem = responseData.goodFactorList[0];
          const firstPrice = factorItem.priceList?.[0];
          if (firstPrice) {
            setSelectedFactor({
              goodsId: factorItem.goodsId,
              priceId: firstPrice.priceId,
              price: firstPrice.realPrice,
            });
          }
        }
        // 设置默认产品数量为 0
        if (
          responseData.goodCountsList &&
          responseData.goodCountsList.length > 0
        ) {
          const countItem = responseData.goodCountsList[0];
          setSelectedCount({
            goodsId: countItem.goodsId,
            priceId: 0,
            quantity: 0,
            price: 0,
          });
        }
        // 初始化专业服务
        if (responseData.goodSupportList) {
          const supports: Record<string, SelectedSupport> = {};
          responseData.goodSupportList.forEach(item => {
            const firstPrice = item.priceList?.[0];
            if (firstPrice) {
              supports[item.goodsId] = {
                goodsId: item.goodsId,
                priceId: firstPrice.priceId,
                quantity: 0,
                price: 0,
                checked: false,
              };
            }
          });
          const kw = preselectProfessionalSupportKeyword?.trim();
          if (kw) {
            const match = responseData.goodSupportList.find(g =>
              g.goodsName?.includes(kw),
            );
            if (match && supports[match.goodsId]) {
              const fp = getPriceByQuantity(match.priceList || [], 1);
              if (fp) {
                supports[match.goodsId] = {
                  goodsId: match.goodsId,
                  priceId: fp.priceId,
                  quantity: fp.value,
                  price: fp.realPrice,
                  checked: true,
                };
              }
            }
          }
          setSelectedSupports(supports);
        }
      }
    } catch {
      // 获取商品信息失败，使用默认数据
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoodsInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchGoodsInfo 依赖 props，整函数在 mount / 关键 props 变化时重新拉取
  }, [productSource, preselectProfessionalSupportKeyword]);

  // 提交订单
  const handleSubmitOrder = async () => {
    if (!agreedToTerms) {
      Toast('warn', I18N.components.pleaseReadFirstAnd);
      return;
    }

    if (!selectedPlan) {
      Toast('warn', I18N.components.pleaseSelectTheFoundation);
      return;
    }

    try {
      setOrderSubmitLoading(true);
      const userInfo = getUserInfo();
      const companyId = userInfo?.userInfo?.companyId;

      if (!companyId) {
        Toast('error', I18N.components.obtainCompanyLetter);
        return;
      }

      // 构建订单商品列表
      const orderGoods: {
        goodsId: string;
        priceId: number;
        goodsType: string;
      }[] = [];

      // 1. 基础方案
      // 如果用户已购买 footprint_p_basic 或 footprint_p_all 且没有变动，则从订单中移除
      if (selectedPlan) {
        const isCurrentPlanUnchanged =
          currentGoodsId && selectedPlan.goodsId === currentGoodsId;
        if (!isCurrentPlanUnchanged) {
          orderGoods.push({
            goodsId: selectedPlan.goodsId,
            priceId: selectedPlan.priceId,
            goodsType: '1',
          });
        }
      }

      // 2. 因子库（如果已购买，则不提交）
      if (selectedFactor && !isFactorPurchased) {
        orderGoods.push({
          goodsId: selectedFactor.goodsId,
          priceId: selectedFactor.priceId,
          goodsType: '2',
        });
      }

      // 3. 产品数量（如果数量为 0，则不提交）
      if (selectedCount && selectedCount.quantity > 0) {
        orderGoods.push({
          goodsId: selectedCount.goodsId,
          priceId: selectedCount.priceId,
          goodsType: '3',
        });
      }

      // 4. 专业服务（只添加数量大于 0 的）
      Object.values(selectedSupports).forEach(support => {
        if (support.quantity > 0) {
          orderGoods.push({
            goodsId: support.goodsId,
            priceId: support.priceId,
            goodsType: '4',
          });
        }
      });

      if (orderGoods.length === 0) {
        Toast('warn', I18N.components.pleaseChooseAtLeast);
        return;
      }

      const {
        data: { data },
      } = await submitOrderPersonal({
        orderGoods,
        companyId: Number(companyId),
      });

      if (data.orderId) {
        setOrderId(data.orderId);
      }
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { msg?: string } } })?.response?.data
          ?.msg || I18N.components.orderSubmissionLost;
      Toast('error', errorMessage);
    } finally {
      setOrderSubmitLoading(false);
    }
  };

  // 获取订单详情和支付状态
  useEffect(() => {
    if (!orderId) {
      return () => {
        // 清理函数
      };
    }

    const cancelTokenSource = axios.CancelToken.source();
    let timer: number | undefined;

    const queryOrderDetails = async () => {
      try {
        const { data } = await getOrderDetailsPersonal(
          { orderId },
          cancelTokenSource.token,
        );
        setOrderDetails(data.data);
      } catch {
        // 获取订单详情失败
      }
    };

    const queryOrderPayStatus = async (firstLoop: boolean) => {
      try {
        const { data } = await getOrderPayStatusPersonal(
          { orderId },
          cancelTokenSource.token,
        );
        setOrderPayStatus(data.data);

        if (data.data.status === PAY_STATUS.SUCCESS) {
          Toast('success', I18N.carbonNeutral.paymentSuccessful2);
          setTimeout(() => {
            setOrderSubmitLoading(false);
            // 关闭支付 Modal
            setOrderId(null);
            setOrderDetails(null);
            setOrderPayStatus(null);
            // 调用成功回调
            if (onSuccess) {
              onSuccess();
            }
          }, 3000);
        }

        // 第一次确保查询orderDetails在查询payStatus后进行
        if (firstLoop) {
          queryOrderDetails();
        }

        if (data.data.status !== PAY_STATUS.WAIT_PAY) {
          clearInterval(timer);
          cancelTokenSource.cancel();

          if (!firstLoop) {
            // 在轮询payStatus时支付状态不为"未支付"时update orderDetails
            queryOrderDetails();
          }
        } else if (isNil(timer)) {
          timer = setInterval(() => queryOrderPayStatus(false), 1000);
        }
      } catch {
        // 获取支付状态失败
      }
    };

    queryOrderPayStatus(true);

    return () => {
      if (timer !== undefined) {
        clearInterval(timer);
      }
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const productTrialVersionText = TrialVersionText[productSource];

  const currentGoodsIndex =
    goodsData?.goodserviceList.findIndex(
      item => item.goodsId === currentGoodsId,
    ) ?? -1;

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
          setRestPayTime('00:00:00');
          clearInterval(timer);
        } else {
          const { hours, minutes, seconds } = moment.preciseDiff(
            orderExpireTime,
            currentTime,
            true,
          );
          setRestPayTime(
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
              2,
              '0',
            )}:${String(seconds).padStart(2, '0')}`,
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

  // 处理方案选择
  const handlePlanSelect = (goodsItem: GoodsItem, goodsIndex: number) => {
    // 如果用户当前已购买 footprint_p_all，不能降级到 footprint_p_basic
    if (goodsIndex < currentGoodsIndex) {
      Toast('warn', I18N.components.youHavePurchasedHigh2);
      return;
    }
    const firstPrice = goodsItem.priceList?.[0];
    if (firstPrice) {
      setSelectedPlan({
        goodsId: goodsItem.goodsId,
        priceId: firstPrice.priceId,
        quantity: firstPrice.value,
        price: firstPrice.realPrice,
        buyCountStatus: goodsItem.buyCountStatus,
        productSkuCounts: goodsItem.productSkuCounts,
      });
    }
  };

  // 处理因子库选择
  const handleFactorSelect = (goodsId: string) => {
    if (!goodsData) return;
    // 如果已购买因子库，不允许取消选择
    if (isFactorPurchased && goodsId === 'basic') {
      Toast('warn', I18N.components.youHavePurchasedHigh);
      return;
    }
    if (goodsId === 'basic') {
      // 基础数据库免费
      setSelectedFactor(null);
    } else {
      // 高级数据库
      const factorItem = goodsData.goodFactorList.find(
        item => item.goodsId === goodsId,
      );
      if (factorItem) {
        const firstPrice = factorItem.priceList?.[0];
        if (firstPrice) {
          setSelectedFactor({
            goodsId: factorItem.goodsId,
            priceId: firstPrice.priceId,
            price: firstPrice.realPrice,
          });
        }
      }
    }
  };

  // 处理产品数量变化
  const handleCountChange = (value: number | null) => {
    if (!goodsData?.goodCountsList?.[0]) return;
    const numValue = value ?? 0;
    const countItem = goodsData.goodCountsList[0];
    // 如果数量为 0，设置价格为 0
    if (numValue === 0) {
      setSelectedCount({
        goodsId: countItem.goodsId,
        priceId: 0,
        quantity: 0,
        price: 0,
      });
      return;
    }
    const priceInfo = getPriceByQuantity(countItem.priceList, numValue);
    if (priceInfo) {
      setSelectedCount({
        goodsId: countItem.goodsId,
        priceId: priceInfo.priceId,
        quantity: numValue,
        price: priceInfo.realPrice,
      });
    }
  };

  // 处理专业服务数量变化（选中状态由 quantity > 0 决定）
  const handleSupportQuantityChange = (
    goodsId: string,
    quantity: number,
    priceId: number,
    price: number,
  ) => {
    setSelectedSupports(prev => ({
      ...prev,
      [goodsId]: {
        ...prev[goodsId],
        goodsId,
        priceId,
        quantity,
        price,
        checked: quantity > 0,
      },
    }));
  };

  // 计算订单金额
  const calculateTotal = () => {
    let total = 0;
    // 1. 基础方案 - 如果用户已购买且没有变动，则不计算价格
    if (selectedPlan) {
      const isCurrentPlanUnchanged =
        currentGoodsId && selectedPlan.goodsId === currentGoodsId;
      if (!isCurrentPlanUnchanged) {
        total += selectedPlan.price;
      }
    }
    // 2. 因子库（如果已购买，则不计算价格）
    if (selectedFactor && !isFactorPurchased) {
      total += selectedFactor.price;
    }
    // 3. 产品数量（如果数量为 0，则不计算价格）
    if (selectedCount && selectedCount.quantity > 0) {
      total += selectedCount.price;
    }
    // 4. 专业服务（数量大于 0 的计入）
    Object.values(selectedSupports).forEach(support => {
      if (support.quantity > 0) {
        total += support.price;
      }
    });
    return total;
  };

  const totalAmount = calculateTotal();

  const canByCount = selectedPlan?.buyCountStatus === '1';

  const selectedPlanSkuCount = selectedPlan?.productSkuCounts;
  const isCurrentPlanUnchanged =
    currentGoodsId && selectedPlan?.goodsId === currentGoodsId;

  useEffect(() => {
    if (!canByCount) {
      setSelectedCount(null);
    }
  }, [canByCount]);

  if (!goodsData) {
    return (
      <Spin spinning={loading}>
        <div className={styles.subscriptionContent}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              {I18N.components.subscriptionService}
            </h2>
          </div>
        </div>
      </Spin>
    );
  }

  return (
    <Spin spinning={loading}>
      <div className={styles.subscriptionContent}>
        {/* 标题栏 */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {I18N.components.subscriptionService}
          </h2>
        </div>

        <div className={styles.content}>
          {/* 基础方案 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{I18N.components.basicPlan}</h3>
            <div className={styles.plansGrid}>
              {/* 试用版 - 固定显示 */}
              <PlanCard
                title={productTrialVersionText.title}
                price={productTrialVersionText.price}
                description={productTrialVersionText.description}
                features={productTrialVersionText.features}
                isCurrent={!currentGoodsId}
              />
              {/* 从接口获取的方案 */}
              {goodsData.goodserviceList.map((item, index) => {
                const features = parseGoodsInfo(item.goodsInfo);
                const firstPrice = item.priceList?.[0];
                const isSelected = selectedPlan?.goodsId === item.goodsId;
                const priceUnit = firstPrice?.priceType
                  ? `/${firstPrice.priceType}`
                  : I18N.components.year4;
                // 如果用户当前已购买 footprint_p_all，则禁用 footprint_p_basic
                const isDisabled = index < currentGoodsIndex;
                // 如果当前方案是用户已购买的方案，显示"当前"标签
                const isCurrent = currentGoodsId === item.goodsId;

                return (
                  <PlanCard
                    key={item.goodsId}
                    title={item.goodsName}
                    price={
                      firstPrice ? firstPrice.realPrice.toLocaleString() : '0'
                    }
                    priceUnit={priceUnit}
                    description={
                      item.goodsInfo.split('\n')[0] || item.goodsName
                    }
                    features={features}
                    isSelected={isSelected}
                    isCurrent={isCurrent}
                    onClick={() => handlePlanSelect(item, index)}
                    goodsItem={item}
                    selectedPriceId={selectedPlan?.priceId}
                    disabled={isDisabled}
                  />
                );
              })}
              {/* 尊享版 - 固定显示 */}
              <PlanCard
                title={I18N.components.premiumEdition}
                description={I18N.components.forEnterprisesReally}
                price=''
                features={[]}
                isPremium
              />
            </div>
          </div>

          {/* 因子库 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              {I18N.components.factorLibrary}
            </h3>
            <Radio.Group
              value={selectedFactor?.goodsId || 'basic'}
              onChange={e => handleFactorSelect(e.target.value)}
              className={styles.radioGroup}
            >
              <Radio value='basic' disabled={isFactorPurchased}>
                {I18N.components.basicDatabase}
              </Radio>
              {goodsData.goodFactorList.map(item => (
                <Radio key={item.goodsId} value={item.goodsId}>
                  {item.goodsInfo || item.goodsName}
                </Radio>
              ))}
            </Radio.Group>
          </div>

          {/* 产品数量 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              {productSource === ProductSource.enterprise
                ? I18N.components.additionalAccountingMaster
                : I18N.components.numberOfAdditionalProducts}
            </h3>
            {goodsData.goodCountsList.length > 0 &&
              (() => {
                const priceList = goodsData.goodCountsList[0].priceList || [];
                // 获取 priceList 中的所有 value
                const priceValues = priceList.map(p => p.value);
                // 在 allowedValues 中添加 0 和 1（如果它们不在 priceList 中）
                // 这样从 0 点击 + 会先变成 1，然后按 priceList 的步进
                const allowedValues = new Set([0, 1, ...priceValues]);
                const sortedAllowedValues = Array.from(allowedValues).sort(
                  (a, b) => a - b,
                );

                // 计算最小差值作为 step（用于输入框的 step 属性）
                const sortedPriceValues = [...priceValues].sort(
                  (a, b) => a - b,
                );
                let minStep = 1;
                if (sortedPriceValues.length > 1) {
                  const steps: number[] = [];
                  for (let i = 1; i < sortedPriceValues.length; i++) {
                    steps.push(sortedPriceValues[i] - sortedPriceValues[i - 1]);
                  }
                  minStep = Math.min(...steps);
                }

                return (
                  <div className={styles.countContainer}>
                    <SpinnerInputNumber
                      value={selectedCount?.quantity ?? 0}
                      min={0}
                      max={
                        sortedPriceValues.length > 0
                          ? Math.max(...sortedPriceValues)
                          : undefined
                      }
                      step={minStep}
                      disabled={!canByCount}
                      allowedValues={sortedAllowedValues}
                      onChange={handleCountChange}
                      width={120}
                    />
                    <span>
                      {I18N.components.thisSubscriptionWill}{' '}
                      <span>
                        {(isCurrentPlanUnchanged
                          ? 0
                          : selectedPlanSkuCount ?? 0) +
                          (selectedCount?.quantity ?? 0)}
                      </span>{' '}
                      {I18N.components.individual}
                      {productSource === ProductSource.enterprise
                        ? I18N.dashborad.accountingEntity
                        : I18N.components.productSku}
                      {I18N.components.quota}
                    </span>
                  </div>
                );
              })()}
          </div>

          {/* 专业服务支持 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              {I18N.components.professionalServiceSupport}
            </h3>
            <div className={styles.servicesGrid}>
              {goodsData.goodSupportList.map(item => {
                const support = selectedSupports[item.goodsId];
                const firstPrice = item.priceList?.[0];
                const priceUnit = firstPrice?.priceType
                  ? `/${firstPrice.priceType}`
                  : I18N.Certification.second;

                return (
                  <ServiceCard
                    key={item.goodsId}
                    title={item.goodsName}
                    price={
                      firstPrice ? firstPrice.realPrice.toLocaleString() : '0'
                    }
                    priceUnit={priceUnit}
                    description={item.goodsInfo || item.goodsName}
                    quantity={support?.quantity ?? 0}
                    onQuantityChange={(q, pid, p) =>
                      handleSupportQuantityChange(item.goodsId, q, pid, p)
                    }
                    goodsItem={item}
                    selectedPriceId={support?.priceId}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* 底部订单金额和支付按钮 */}
        <div className={styles.footer}>
          <div className={styles.orderAmount}>
            <span className={styles.orderAmountLabel}>
              {I18N.components.orderAmount}
            </span>
            <span className={styles.orderAmountValue}>
              <span className={styles.currency}>¥</span>
              <span
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontSize: '32px',
                  lineHeight: '32px',
                }}
              >
                {totalAmount.toLocaleString()}
              </span>
            </span>
          </div>
          <div className={styles.footerActions}>
            <div className={styles.termsCheckbox}>
              <Checkbox
                checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
              >
                {I18N.carbonNeutral.iHaveReadAnd}
                <a
                  className={styles.agreement}
                  href='/agreement?service'
                  target='_blank'
                >
                  {I18N.components.userAgreement}
                </a>
              </Checkbox>
            </div>
            <Button
              type='primary'
              className={styles.payButton}
              disabled={!agreedToTerms}
              loading={orderSubmitLoading}
              onClick={handleSubmitOrder}
            >
              {I18N.components.placeOrder}
            </Button>
          </div>
        </div>
      </div>

      {/* 支付 Modal */}
      <PaymentModal
        open={!!(orderId && orderDetails)}
        onClose={() => {
          setOrderId(null);
          setOrderDetails(null);
          setOrderPayStatus(null);
        }}
        orderDetails={orderDetails}
        orderPayStatus={orderPayStatus}
        totalAmount={totalAmount}
        restPayTime={restPayTime}
      />
    </Spin>
  );
};
