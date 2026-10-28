/**
 * 服务中心 - 续订 - 选择时长
 * @returns
 */
import I18N from '@src/lang/I18N';
import { CheckOutlined } from '@ant-design/icons';
import store from '@src/store';
import VerifyUtils from '@src/utils/verifty';
import { Button, Checkbox } from 'antd';
import { useState } from 'react';
import { PriceList } from '../type';
import './common.less';
import { OrderServiceCenterSelectTimeProps } from './type';

const OrderServiceCenterSelectTime = (
  props: OrderServiceCenterSelectTimeProps,
) => {
  /** 当前接口返回的续订详情信息 */
  const { continueInfo, getPrice } = props;
  /** 获取当前的组织名称 */
  const { companyId, companyVoList, companyName } =
    store.getState().companyUserInfo.userInfo;
  let companyName2 = '';
  const findCompanyInfo =
    companyVoList &&
    companyVoList.length > 0 &&
    companyVoList.find(list => list.companyId === companyId);
  if (findCompanyInfo) {
    companyName2 = findCompanyInfo.companyName;
  }
  /** 产品的列表 */
  let { productList } = continueInfo;
  /** 价格列表 */
  const { priceList } = continueInfo;
  if (productList.length > 4) {
    productList = productList.filter((list, _list) => _list < 3);
  }
  /** 当前选中的价格下标，默认选中第一条 */
  const [priceIndex, setPriceIndex] = useState<number>(0);
  /** 当前选中的价格信息 */
  const [priceInfo, setPriceInfo] = useState<PriceList>(priceList[priceIndex]);
  /** 是否勾选服务协议 */
  const [checkAgreement, setCheckAgreement] = useState<boolean>(false);

  /** 提交订单 */
  const subOrder = () => {
    if (!checkAgreement) {
      VerifyUtils.Toast(400, I18N.system.pleaseReadAndAgreeWith2);
    } else {
      /** 回调当前选中的产品价格 */
      getPrice(priceInfo);
    }
  };
  return (
    <div className='orderServiceCenterModalCommon'>
      <div className='modalTitle'>{I18N.system.selectDuration2}</div>
      <div className='bodyMain'>
        <div className='bodyMainLeft'>
          {/* <div className='secondTitle'>
            碳管理产品
            <div className='colorLeftTitle' />
          </div> */}
          <div className='productMain'>
            <div className='describeTitle'>{continueInfo.goodsName}</div>
            <div className='describe'>{continueInfo.goodsInfo}</div>
          </div>
          <div className='secondTitle m-t-20'>
            {I18N.system.selectDuration}<div className='colorLeftTitle' />
          </div>
          <div className='priceMain'>
            {priceList.map((price, _price) => (
              <div
                onClick={() => {
                  setPriceInfo(price);
                  setPriceIndex(_price);
                }}
                className={`priceMainList ${
                  _price > 0 ? 'priceMainListLeft' : ''
                }`}
                style={priceIndex === _price ? { borderColor: '#0CBF9F' } : {}}
              >
                <div className='priceMonth'>
                  {price.value}
                  {price.priceType}
                </div>
                <div className='priceMoney'>
                  <span className='priceMoneyDW'>￥</span>
                  <span className='priceMoneyText'>{price.realPrice}</span>
                </div>
                <div className='priceOldMoney'>￥{price.standPrice}</div>
                {priceIndex === _price ? (
                  <>
                    <div className='priceMainListActiveMainText'>
                      <CheckOutlined style={{ color: '#fff' }} />
                    </div>
                    <div className='priceMainListActiveMain' />
                  </>
                ) : undefined}
              </div>
            ))}
          </div>
        </div>
        <div className='bodyMainRight'>
          <div className='font14Title m-b-16'>
            {companyName || companyName2}
          </div>
          <div
            className='font14Titl'
            style={{ fontWeight: 400, marginBottom: 6 }}
          >
            {I18N.components.productList}</div>
          <div className='productList'>
            {productList.map((list, _list) => (
              <div
                className='list'
                style={[0, 2].includes(_list) ? { marginLeft: 0 } : {}}
              >
                {list.productName}
              </div>
            ))}
            {continueInfo.productList.length > 4 ? (
              <div className='list'>...</div>
            ) : undefined}
          </div>
          <div className='payTime'>
            <span>{I18N.system.purchaseDuration}</span>
            <span>
              {priceInfo.value}
              {priceInfo.priceType}
            </span>
          </div>
          <div className='payAll'>
            <span>{I18N.system.totalOrderAmount}</span>
            <span>￥{priceInfo.realPrice}</span>
          </div>
        </div>
      </div>
      <div className='bodyMainFooter'>
        <div className='bodyMainFooterMain'>
          <span className='moneyText'>{I18N.system.payableAmount}</span>
          <span className='moneyNumber'>¥{priceInfo.realPrice}</span>
        </div>
      </div>
      <div className='modalFooter'>
        <Checkbox
          value={checkAgreement}
          onChange={checkedValue => {
            setCheckAgreement(checkedValue.target.checked);
          }}
        >
          {I18N.carbonNeutral.iHaveReadAnd}<a
            style={{ color: '#09C199' }}
            href='/agreement?service'
            target='_blank'
          >
            {I18N.system.serviceAgreement2}</a>
        </Checkbox>
        <Button onClick={subOrder} type='primary' className='subBtn'>
          {I18N.components.placeOrder}</Button>
      </div>
    </div>
  );
};

export default OrderServiceCenterSelectTime;
