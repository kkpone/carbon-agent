/**
 * @file 采购商首页
 * @author wangjiahui
 */

import I18N from '@src/lang/I18N';
import { CarbonAccountHomeTabs } from '@src/views/carbonAccount/home/type';
import {
  purchasImg1,
  purchasImg2,
  purchasImg3,
  purchasImg4,
  purchasImg5,
} from '../utils/common';
import { OrderView } from '../utils/supplyChainNoOrder/supplyOrder';
import style from './index.module.less';

/** 采购商首页 */

const PurchasPage = (props: { noOrder: boolean }) => {
  const { noOrder } = props;
  /** tab切换内容 */
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
    <div className={style.purchas_content} aria-label='purchas_content_main'>
      <div className={style.introduce} aria-label='purchas_content_introduce'>
        <div
          className={style.center_content}
          aria-label='purchas_content_center_introduce'
        >
          <img
            aria-label='purchas_content_center_introduce_img1'
            src={purchasImg2}
            alt=''
            className={style.left_img}
          />
          <img
            aria-label='purchas_content_center_introduce_img2'
            src={purchasImg2}
            alt=''
            className={style.left_img1}
          />
          <img
            aria-label='purchas_content_center_introduce_img3'
            src={purchasImg1}
            alt=''
            className={style.left_img2}
          />
          <img
            aria-label='purchas_content_center_introduce_img4'
            src={purchasImg1}
            alt=''
            className={style.left_img3}
          />
          <img
            aria-label='purchas_content_center_introduce_img5'
            src={purchasImg1}
            alt=''
            className={style.left_img4}
          />
          <div
            className={style.purchas_word}
            aria-label='purchas_content_center_introduce_purchas_word'
          >
            <div
              aria-label='purchas_content_center_introduce_purchas_word_title'
              className={style.purchas_word_title}
            >
              {I18N.becomeSupplierOrPurchasing.buyer}</div>
            <div
              className={style.purchas_word_des}
              aria-label='purchas_content_center_introduce_purchas_word_des'
            >
              {I18N.becomeSupplierOrPurchasing.provideEfficientCarbon}</div>
          </div>
          <div
            className={style.purchas_img}
            aria-label='purchas_content_center_introduce_purchas_img'
          >
            <img
              src={purchasImg3}
              alt=''
              aria-label='purchas_content_center_introduce_purchas_img_img3'
            />
          </div>
          <OrderView tabInfoList={tabInfoList} noOrder={noOrder} />
        </div>
      </div>
    </div>
  );
};
export default PurchasPage;
