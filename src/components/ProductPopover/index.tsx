import customerServiceImg from '@assets/svg/customer_service_white.svg';
import I18N from '@src/lang/I18N';
import { GetComponentProps } from '@src/utils/utilTypes';
import { Popover } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';

import styles from './index.module.less';
import CustomerServicePopover from '../CustomerServicePopover';

type ProductPopoverProps = {
  tipText?: string;
  productList?: {
    productId: string | number;
    productName: string;
    createTime: string;
    expireTime: string;
  }[];
};

const ProductPopover: FC<
  ProductPopoverProps & Omit<GetComponentProps<typeof Popover>, 'content'>
> = props => {
  const { children, productList, tipText, ...restProps } = props;
  return (
    <Popover
      {...restProps}
      overlayClassName={classNames(styles.popover, restProps.overlayClassName)}
      overlayInnerStyle={{
        padding: 0,
      }}
      content={
        <div
          className={styles.productContent}
          onClick={e => e.stopPropagation()}
        >
          <div className={styles.title}>{I18N.components.versionDetails}</div>
          <div className={styles.productList}>
            {(productList || []).map(
              ({ productId, productName, createTime, expireTime }) => (
                <div className={styles.product} key={productId}>
                  <div
                    className={styles.productName}
                    title={productName || '-'}
                  >
                    {productName || '-'}
                  </div>
                  <div className={styles.productTime}>
                    {createTime}-{expireTime}
                  </div>
                </div>
              ),
            )}
          </div>
          {!!tipText && <div className={styles.tip}>{tipText}</div>}
          <CustomerServicePopover placement='bottom'>
            <div className={styles.customerServiceBtn}>
              <img
                className={styles.customerServiceImg}
                alt=''
                src={customerServiceImg}
              />
              {I18N.carbonFootprint3.contactCustomerService}
            </div>
          </CustomerServicePopover>
        </div>
      }
    >
      {children}
    </Popover>
  );
};

export default ProductPopover;
