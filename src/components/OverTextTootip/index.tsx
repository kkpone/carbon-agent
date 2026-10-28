import React, { useRef, useState, useEffect, FC } from 'react';
import { Tooltip } from 'antd';
import style from './index.module.less';
import classNames from 'classnames';

interface EllipsisTooltipProps {
  text: string;
  lines?: number;
  wrapClassName?: string;
  wrapStyle?: React.CSSProperties;
}

const EllipsisTooltip: FC<EllipsisTooltipProps> = ({
  text,
  children,
  lines = 1,
  wrapClassName,
  wrapStyle = {},
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowed, setIsOverflowed] = useState(false);
  useEffect(() => {
    const { current } = textRef;
    if (current) {
      setIsOverflowed(
        current.scrollHeight > current.clientHeight ||
          current.scrollWidth > current.clientWidth,
      );
    }
  }, [children]);

  return (
    <Tooltip title={isOverflowed ? text : ''}>
      <div
        className={classNames(style['ellipsis-tooltip'], {
          [style['ellipsis-tooltip.multiline']]: lines > 1,
          [style['ellipsis-tooltip.oneline']]: lines === 1,
          wrapClassName,
        })}
        ref={textRef}
        style={{ WebkitLineClamp: lines, ...wrapStyle }}
      >
        {children}
      </div>
    </Tooltip>
  );
};

export default EllipsisTooltip;
