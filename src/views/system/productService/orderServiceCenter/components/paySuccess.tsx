/*
 * @Author: 张明尧
 * @Date: 2022-10-15 11:22:30
 */
/**
 * 服务中心 - 续订 - 支付成功
 * @returns
 */
import I18N from '@src/lang/I18N';
import { UserInfo } from '@src/api/types';
import IconFont from '@src/components/iconfont';
import store from '@src/store';
import { RouteMaps } from '@src/router/route-paths';
import { timestampToTimeSecond } from '@src/utils/date';
import { Button } from 'antd';
import { useHistory } from 'react-router-dom';
import './common.less';
import { OrderServiceCenterPaySuccessProps } from './type';

const OrderServiceCenterPaySuccess = (
  props: OrderServiceCenterPaySuccessProps,
) => {
  /** 本地存储的信息 */
  const storeState: UserInfo = store.getState().companyUserInfo.userInfo;
  const companyInfo =
    storeState.companyVoList &&
    storeState.companyVoList.find(
      list => list.companyId === storeState.companyId,
    );
  const history = useHistory();
  /** 当前接口返回的续订详情信息 */
  const {
    productList,
    checkPriceList,
    subOrderBack,
    findOrder,
    findInvoice,
    closeModal,
  } = props;

  return (
    <div className='orderServiceCenterModalCommon'>
      <div className='modalTitle'>{I18N.system.paymentSuccessful2}</div>
      <div className='paySuccessMain'>
        <div className='successIcon'>
          <IconFont style={{ fontSize: 90 }} type='icon-icon-chenggong-3' />
        </div>
        <div
          className='m-b-10'
          style={{ fontSize: 26, fontWeight: 500, color: '#0CBF9F' }}
        >
          ￥{checkPriceList?.realPrice}
        </div>
        <div className='m-b-10'>{I18N.system.paymentSuccessful}</div>
        <div className='successBtns'>
          <Button
            onClick={() => {
              if (findOrder) {
                findOrder();
              } else if (closeModal) {
                closeModal();
              } else {
                history.push(RouteMaps.homeProductOrderRecord);
              }
            }}
          >
            {I18N.components.viewOrders}</Button>
          <Button
            onClick={() => {
              if (findInvoice) {
                findInvoice();
              } else {
                history.push(RouteMaps.homeInvoiceManagementApplyForInvoice);
              }
            }}
            className='m-l-20'
            type='primary'
          >
            {I18N.system.applyForInvoicing}</Button>
        </div>
      </div>
      <div className='paySuccessFooter'>
        <div className='secondTitle m-t-20'>
          {I18N.system.orderDetails}<div className='colorLeftTitle' />
        </div>
        <div className='orderDetail'>
          <div className='detailCompany'>
            {storeState.companyName || companyInfo?.companyName}
          </div>
          <div className='detailTime'>
            <span>
              {I18N.system.orderTime2}{timestampToTimeSecond(subOrderBack.orderTime)}
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
      </div>
    </div>
  );
};

export default OrderServiceCenterPaySuccess;
