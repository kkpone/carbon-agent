/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-24 16:58:26
 * @Date: 2023-02-24 16:33:55
 * @@description: 抽屉右侧侧滑页脚
 */

import I18N from '@src/lang/I18N';
import { Button } from '@src/components/Button';
import React, { VFC } from 'react';

import styles from './index.module.less';
import { DrawerProductFooterProps } from './type';

const DrawerProductFooter: VFC<DrawerProductFooterProps> = props => {
  const { isEdit, extraBtn, okText, onSubClick, onCancelClick } = props;

  return (
    <div className={styles.drawerFooterMain}>
      <Button
        className={styles.drawerFooterBtn}
        onClick={async () => {
          onCancelClick();
        }}
      >
        {isEdit ? I18N.carbonFootprint.cancel : I18N.carbonFootprint3.close}
      </Button>
      {isEdit && (
        <>
          <Button
            className={`${styles.drawerFooterBtn} m-l-20`}
            type={!extraBtn ? 'primary' : undefined}
            onClick={onSubClick}
          >
            {okText ?? I18N.carbonFootprint.confirm2}
          </Button>
          {Array.isArray(extraBtn)
            ? extraBtn.map((Btn, index) =>
                React.cloneElement(Btn, {
                  // eslint-disable-next-line react/no-array-index-key
                  key: index,
                  className: `${styles.drawerFooterBtn} m-l-20`,
                }),
              )
            : extraBtn &&
              React.cloneElement(extraBtn, {
                className: `${styles.drawerFooterBtn} m-l-20`,
              })}
        </>
      )}
    </div>
  );
};

export default DrawerProductFooter;
