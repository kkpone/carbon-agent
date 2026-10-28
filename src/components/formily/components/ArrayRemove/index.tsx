import I18N from '@src/lang/I18N';
import { ArrayItems } from '@formily/antd-v5';
import classNames from 'classnames';
import { FC, PropsWithChildren, useState } from 'react';

import arrowSvg from './arrow.svg';
import styles from './index.module.less';

interface IArrayRemoveProps {
  canMove?: boolean;
}

export const ArrayRemove: FC<PropsWithChildren<IArrayRemoveProps>> = props => {
  const { canMove = true } = props;
  const index = ArrayItems.useIndex();
  const [collapse, setCollapse] = useState(false);
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.left} onClick={() => setCollapse(pre => !pre)}>
          <img
            src={arrowSvg}
            className={classNames({
              [styles.arrow]: true,
              [styles.collapse]: collapse,
            })}
            alt=''
          />
          <div>
            {I18N.components.the}
            {index + 1} {I18N.components.rowData}
          </div>
        </div>
        {canMove && <ArrayItems.Remove />}
      </div>
      {!collapse && <div>{props.children}</div>}
    </div>
  );
};
