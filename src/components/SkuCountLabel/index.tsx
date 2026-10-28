import accountSkuImg from '@src/assets/svg/account_sku.svg';
import accountSkuFullImg from '@src/assets/svg/account_sku_full.svg';
import I18N from '@src/lang/I18N';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';

import { SKU_STATUS } from './constant';
import styles from './index.module.less';
import { SkuCount } from './type';

type SkuCountLabelProps = {
  skuCount: SkuCount;
  productName?: string;
  onBuyBtnClick: () => void;
  isPersonalCompany?: boolean;
};

const SkuCountLabel: FC<SkuCountLabelProps> = ({
  skuCount,
  productName,
  onBuyBtnClick,
  isPersonalCompany = false,
}) => {
  const skuCountNormal = skuCount.status === SKU_STATUS.NORMAL;

  const displayProductName = productName || I18N.carbonFootprint3.product;

  return skuCount.status !== SKU_STATUS.UN_LIMIT ? (
    <div
      className={classNames(styles.skuCount, {
        [styles.skuNormalCount]: skuCountNormal,
      })}
    >
      <img
        className={styles.skuImg}
        src={skuCountNormal ? accountSkuImg : accountSkuFullImg}
        alt=''
      />
      {skuCountNormal ? (
        <>
          <span className={styles.skuUseCount}>
            {I18N.template(I18N.components.displ, { val1: displayProductName })}
          </span>
          <Tooltip
            overlay={I18N.template(I18N.components.createdDi, {
              val1: displayProductName,
              val2: displayProductName,
            })}
          >
            <span className={styles.skuCountNum}>
              <span className={classNames(styles.skuUseCount)}>
                {skuCount.useCount} {I18N.components.individual}
              </span>
              <span className={styles.skuTotalCount}>
                /{skuCount.total} {I18N.components.individual}
              </span>
            </span>
          </Tooltip>
          <div className={styles.purchaseButton} onClick={onBuyBtnClick}>
            {I18N.carbonNeutral.purchaseQuantity}
          </div>
        </>
      ) : (
        <>
          {!isPersonalCompany && (
            <span className={styles.skuFullCaption}>
              {I18N.template(I18N.components.currentDis, {
                val1: displayProductName,
              })}
            </span>
          )}
          <span className={styles.skuFullBuy} onClick={onBuyBtnClick}>
            {isPersonalCompany
              ? I18N.components.upgradeSubscription
              : I18N.carbonFootprint3.buyNow}
          </span>
        </>
      )}
    </div>
  ) : null;
};

export default SkuCountLabel;
