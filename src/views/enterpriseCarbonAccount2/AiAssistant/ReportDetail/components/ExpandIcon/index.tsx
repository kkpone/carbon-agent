import { CollapseProps } from 'antd';
import classNames from 'classnames';
import React from 'react';

import expand from './expand.png';
import styles from './index.module.less';

type ExpandIconProps = Parameters<NonNullable<CollapseProps['expandIcon']>>[0];

export const ExpandIcon: React.FC<ExpandIconProps> = props => {
  const { isActive } = props;
  return (
    <div className={styles.wrapper}>
      <div
        className={classNames(styles.expand, {
          [styles.fold]: isActive,
        })}
      >
        <img src={expand} alt='' />
      </div>
    </div>
  );
};
