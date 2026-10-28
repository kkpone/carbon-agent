/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-30 20:44:28
 * @Date: 2023-02-24 16:33:55
 * @@description: 抽屉右侧侧滑页脚
 */

import I18N from '@src/lang/I18N';
import { Button } from '@src/components/Button';
import { VFC, useState } from 'react';

import styles from './index.module.less';
import { ProcessVisualizationFooterDrawerProps } from './type';

const AccessoryFooterDrawer: VFC<
  ProcessVisualizationFooterDrawerProps
> = props => {
  const { onSubClick, onCancelClick, okText, isOnlyDetail } = props;

  const [saveLaoding, setSaveLoaidng] = useState(false);

  return (
    <div className={styles.drawerFooterMain}>
      <Button
        className={styles.drawerFooterBtn}
        onClick={async () => {
          onCancelClick();
        }}
      >
        {I18N.carbonFootprint.cancel}
      </Button>
      {!isOnlyDetail && (
        <Button
          loading={saveLaoding}
          className={`${styles.drawerFooterBtn} m-l-20`}
          type='primary'
          onClick={async () => {
            setSaveLoaidng(true);
            onSubClick().finally(() => {
              setSaveLoaidng(false);
            });
          }}
        >
          {okText || I18N.carbonFootprint.preserve}
        </Button>
      )}
    </div>
  );
};

export default AccessoryFooterDrawer;
