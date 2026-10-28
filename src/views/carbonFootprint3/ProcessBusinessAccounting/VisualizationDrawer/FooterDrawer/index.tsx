/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-26 16:22:36
 * @Date: 2023-02-24 16:33:55
 * @@description: 抽屉右侧侧滑页脚
 */

import I18N from '@src/lang/I18N';
import { Button } from '@src/components/Button';
import { VFC, useState } from 'react';

import styles from './index.module.less';
import { ProcessVisualizationFooterDrawerProps } from './type';

const ProcessVisualizationFooterDrawer: VFC<
  ProcessVisualizationFooterDrawerProps
> = props => {
  const { onSubClick, onCancelClick, okText, isOnlyDetail, loading } = props;
  const [loadingBtn, setLoading] = useState(false);
  return (
    <div className={styles.drawerFooterMain}>
      <Button
        className={styles.drawerFooterBtn}
        onClick={async () => {
          onCancelClick();
        }}
      >
        {isOnlyDetail
          ? I18N.carbonFootprint3.close
          : I18N.carbonFootprint.cancel}
      </Button>
      {!isOnlyDetail && (
        <Button
          loading={loading || loadingBtn}
          className={`${styles.drawerFooterBtn} m-l-20`}
          type='primary'
          onClick={async () => {
            setLoading(true);
            await onSubClick().finally(() => {
              setTimeout(() => {
                setLoading(false);
              }, 1000);
            });
          }}
        >
          {okText || I18N.carbonFootprint.preserve}
        </Button>
      )}
    </div>
  );
};

export default ProcessVisualizationFooterDrawer;
