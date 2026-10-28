import I18N from '@src/lang/I18N';
import { Button } from 'antd';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import { CustomDrawer } from '@/components/CustomDrawer';
import { IconAlibabaNew } from '@/components/iconfont';

import avatar from './avatar.svg';
import styles from './index.module.less';

const RecordDrawer: FC<{
  open: boolean;
  title: ReactNode;
  recordList: Record<string, any>[];
  onClose: () => void;
}> = props => {
  const { open, title, recordList, onClose } = props;
  const iconMap = {
    initiate: 'icon-icon-faqi1',
    pending: 'icon-icon-dengdai2',
    success: 'icon-icon-tongguo',
    fail: 'icon-icon-bohui',
  };
  return (
    <CustomDrawer
      width={560}
      title={title}
      open={open}
      footer={
        <div className={styles.footer}>
          <Button onClick={onClose}>{I18N.carbonFootprint3.close}</Button>
        </div>
      }
      onClose={onClose}
    >
      {recordList.map(record => {
        const { type, name, time, operateDesc, remark } = record;
        return (
          <div className={styles.recordItem}>
            <div className={styles.iconContent}>
              <IconAlibabaNew type={iconMap[type as string]} />
            </div>
            <div className={styles.recordItemContent}>
              <div className={styles.infoContent}>
                <div className={styles.infoContentLeft}>
                  <img alt='' src={avatar} />
                  <div className={styles.name}>{name}</div>
                </div>
                <div className={styles.caption}>{time}</div>
              </div>
              <div className={styles.operateContent}>
                <span className={styles.caption}>
                  {I18N.supplyChain.operate}
                </span>
                <span
                  className={classNames(styles.operateDesc, {
                    [styles.initiateDesc]: type === 'initiate',
                    [styles.pendingDesc]: type === 'pending',
                    [styles.failDesc]: type === 'fail',
                    [styles.successDesc]: type === 'success',
                  })}
                >
                  {operateDesc}
                </span>
              </div>
              {remark && <div className={styles.caption}>{remark}</div>}
            </div>
          </div>
        );
      })}
    </CustomDrawer>
  );
};

export default RecordDrawer;
