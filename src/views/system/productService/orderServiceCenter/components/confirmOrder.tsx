/*
 * @@description:服务中心 - 续订 - 确认订单
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:44
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-20 11:51:40
 */

import I18N from '@src/lang/I18N';
import { UserInfo } from '@src/api/types';
import store from '@src/store';
import { timestampToTimeSecond } from '@src/utils/date';
import { toCanvas } from 'qrcode';
import { useEffect, useState } from 'react';

import { OrderServiceCenterConfirmOrderProps } from './type';
import './common.less';
import CountDownHours from '../../components/countDownHours';
import { getOrderServiceCenterPayStatus } from '../service';

const OrderServiceCenterConfirmOrder = (
  props: OrderServiceCenterConfirmOrderProps,
) => {
  /** 本地存储的信息 */
  const storeState: UserInfo = store.getState().companyUserInfo.userInfo;
  const companyInfo =
    storeState.companyVoList &&
    storeState.companyVoList.find(
      list => list.companyId === storeState.companyId,
    );
  /** 当前接口返回的续订详情信息 */
  const { productList, checkPriceList, subOrderBack, paySuccess } = props;
  const [timePayStatus, setTimePayStatus] = useState<
    NodeJS.Timeout | undefined
  >(() =>
    setInterval(async () => {
      const back = await getOrderServiceCenterPayStatus({
        orderId: subOrderBack.orderId,
      });
      if (['1'].includes(back.data.data.status)) {
        if (timePayStatus) clearInterval(timePayStatus);
        setTimePayStatus(undefined);
        // 调用支付成功的回调
        paySuccess();
      }
    }, 5000),
  );

  useEffect(() => {
    /** 绘制微信二维码 */
    const canvasCom = code_url => {
      const canvas = document.getElementById('ConfirmOrderCanvas');
      toCanvas(canvas, code_url, {
        // @ts-ignore
        width: 120,
      })
        .then(() => {})
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error(err, 'err=');
        });
    };
    canvasCom(subOrderBack.code_url);
    return () => {
      if (timePayStatus) {
        clearInterval(timePayStatus);
        setTimePayStatus(undefined);
      }
    };
  }, []);
  return (
    <div className='orderServiceCenterModalCommon'>
      <div className='modalTitle'>{I18N.system.confirmOrder}</div>
      <div className='confirmOrderMain'>
        <div className='secondTitle m-t-20'>
          {I18N.system.orderDetails}<div className='colorLeftTitle' />
        </div>
        <div className='orderDetail'>
          <div className='detailCompany'>
            {storeState.companyName || companyInfo?.companyName}
          </div>
          <div className='detailTime'>
            <span>
              {I18N.system.orderTime}{timestampToTimeSecond(subOrderBack.orderTime)}
            </span>
            <span className='m-l-30'>{I18N.system.orderNumber}{subOrderBack.orderId}</span>
          </div>
        </div>
        <div className='orderDetailProduct'>
          <div className='orderDetailProductLeft'>
            <div className='productList'>
              <span>{I18N.components.productList}</span>
              {productList.map(list => (
                <div className='list'>{list.productName}</div>
              ))}
            </div>
            <div className='m-t-20'>
              <span style={{ color: '#6C757D' }}>{I18N.system.purchaseDuration}</span>
              <span style={{ marginLeft: 10 }}>
                {checkPriceList?.value}
                {checkPriceList?.priceType}
              </span>
            </div>
          </div>
          <div className='orderDetailProductRight'>
            <div className='m-t-20 m-l-20'>
              <span style={{ color: '#6C757D' }}>{I18N.system.totalOrderAmount}</span>
              <span style={{ marginLeft: 10 }}>
                ￥{checkPriceList?.realPrice}
              </span>
            </div>
          </div>
        </div>
        <div className='secondTitle m-t-20'>
          {I18N.components.scanCodePayment}<div className='colorLeftTitle' />
        </div>
        <div className='payMain m-b-20'>
          <div className='payMainTitle'>{I18N.carbonNeutral.weChatPayment}</div>
          <div className='payMainWeixin'>
            <div className='payMainLeft'>
              <canvas id='ConfirmOrderCanvas' />
            </div>
            <div className='payMainRight'>
              <div>
                <span>{I18N.system.payableAmount}</span>
                <span
                  style={{
                    fontSize: '26px',
                    color: '#0CBF9F',
                    fontWeight: 500,
                  }}
                >
                  ￥{subOrderBack.payMoney}
                </span>
              </div>
              <div className='m-t-10'>
                <span style={{ color: '#6C757D' }}>{I18N.system.pleaseUseWeChat}</span>
              </div>
              <div className='m-t-10' style={{ fontSize: 12 }}>
                <span>{I18N.system.atTheTimeOfRemainingPayment}</span>
                <span style={{ color: '#0CBF9F' }}>
                  <CountDownHours
                    startTime={new Date(subOrderBack.orderTime)}
                  />
                </span>
                <span>{I18N.system.otherwiseTheOrderWill}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderServiceCenterConfirmOrder;
