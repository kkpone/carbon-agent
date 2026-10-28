import qrCodeImg from '@assets/svg/service_qr_code.png';
import I18N from '@src/lang/I18N';
import { GetComponentProps } from '@src/utils/utilTypes';
import { Popover } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';

import styles from './index.module.less';

const CustomerServicePopover: FC<
  Omit<GetComponentProps<typeof Popover>, 'content'>
> = props => {
  const { children, ...restProps } = props;
  return (
    <Popover
      {...restProps}
      overlayClassName={classNames(
        styles.csPopover,
        restProps.overlayClassName,
      )}
      overlayInnerStyle={{
        padding: 0,
      }}
      content={
        <div className={styles.csContent}>
          <div className={styles.csTitle}>
            {I18N.carbonFootprint3.contactExclusiveCustomers}
          </div>
          <img
            alt=''
            style={{
              width: '140px',
            }}
            src={qrCodeImg}
          />
        </div>
      }
    >
      {children}
    </Popover>
  );
};

export default CustomerServicePopover;
