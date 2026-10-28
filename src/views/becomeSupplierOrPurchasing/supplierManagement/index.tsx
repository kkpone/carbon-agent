/**
 * @file 供应商-供应商介绍耶
 * @author wangjiahui
 */

import I18N from '@src/lang/I18N';
import { CarbonAccountHomeTabs } from '@src/views/carbonAccount/home/type';
import {
  purchasImg1,
  purchasImg2,
  purchasImg4,
  purchasImg5,
  purchasImg6,
} from '../utils/common';
import style from '../purchasingManagement/index.module.less';
import { OrderView } from '../utils/supplyChainNoOrder/supplyOrder';

/** 供应商首页 */
const SupplierPage = (props: { noOrder: boolean }) => {
  const { noOrder } = props;
  /** 供应商tab切换  */
  const tabInfoList: CarbonAccountHomeTabs[] = [
    {
      label: I18N.becomeSupplierOrPurchasing.productManagement,
      cont: I18N.becomeSupplierOrPurchasing.focusOnProductCarbon,
      imgPath: purchasImg4,
      value: '1',
    },
    {
      label: I18N.becomeSupplierOrPurchasing.diversifiedReporting,
      cont: I18N.becomeSupplierOrPurchasing.multipleReportingMethods,
      imgPath: purchasImg5,
      value: '2',
    },
  ];
  return (
    <div className={style.purchas_content} aria-label='purchas_content'>
      <div className={style.introduce} aria-label='purchas_content_introduce'>
        <div
          className={style.center_content}
          aria-label='purchas_content_center_content'
        >
          <div
            className={style.top_banner}
            aria-label='purchas_content_top_banner'
          >
            <img
              aria-label='purchas_content_top_banner_img1'
              alt=''
              src={purchasImg2}
              className={style.left_img}
            />
            <img
              aria-label='purchas_content_top_banner_img2'
              alt=''
              src={purchasImg2}
              className={style.left_img1}
            />
            <img
              aria-label='purchas_content_top_banner_img3'
              alt=''
              src={purchasImg1}
              className={style.left_img2}
            />
            <img
              aria-label='purchas_content_top_banner_img4'
              alt=''
              src={purchasImg1}
              className={style.left_img3}
            />
            <img
              aria-label='purchas_content_top_banner_img5'
              alt=''
              src={purchasImg1}
              className={style.left_img4}
            />
            <div
              className={style.purchas_word}
              aria-label='purchas_content_top_purchas_word'
            >
              <div
                className={style.purchas_word_title}
                aria-label='purchas_content_top_word_title'
              >
                {I18N.carbonFootprint3.supplier}</div>
              <div
                className={style.purchas_word_des}
                aria-label='purchas_content_top_word_des'
              >
                {I18N.becomeSupplierOrPurchasing.provideEfficientCarbon2}</div>
            </div>
            <div
              className={style.purchas_img}
              aria-label='purchas_content_purchas_img'
            >
              <img
                src={purchasImg6}
                alt=''
                aria-label='purchas_content_purchas_img1'
              />
            </div>
          </div>
          {/* 欢迎合作 */}
          <OrderView tabInfoList={tabInfoList} noOrder={noOrder} />
        </div>
      </div>
    </div>
  );
};
export default SupplierPage;
