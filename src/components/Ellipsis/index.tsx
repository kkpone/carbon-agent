/*
 * @@description: 自动省了插件
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-29 09:43:31
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-06 21:01:27
 */
import { Tooltip } from 'antd';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';

import styles from './index.module.less';
import { Props } from './types';

export const Ellipsis = ({ text, className, maxWidth }: Props) => {
  const ele = useRef<HTMLDivElement>(null);
  const [isElliplsis, setIsElliplsis] = useState(false);
  useEffect(() => {
    if (ele.current && ele.current.scrollWidth > ele.current.offsetWidth) {
      setIsElliplsis(true);
    }
  }, []);
  return (
    <Tooltip title={isElliplsis ? text : undefined}>
      <div
        className={classNames(styles.wrapper, className, {
          [styles.ellipsis]: isElliplsis,
        })}
        style={{ maxWidth }}
        ref={ele}
      >
        {text || ''}
      </div>
    </Tooltip>
  );
};
