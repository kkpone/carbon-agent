/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-21 11:25:56
 * @Date: 2023-02-10 14:39:58
 * @@description: 表格文字过多溢出隐藏
 */
import { Tooltip } from 'antd';

import { calcTextWidthUseFontSize } from './utill';

const TextWidthOverflow = (props: {
  value?: string | number;
  width: number;
  /** 自动适应属性 - 优先级要大于width */
  autoWidth?: string;
  fontSize?: number;
  className?: string;
  onClick?: () => void;
}) => {
  const {
    value,
    className,
    width,
    autoWidth,
    fontSize,
    onClick = () => {},
  } = props;

  const getValue = value || Number(value || 0) !== 0 ? `${value}` : '-';

  // 计算文字的宽度
  const textWidth = calcTextWidthUseFontSize(getValue, { fontSize });

  return (
    <div>
      {textWidth && textWidth > width ? (
        <Tooltip title={getValue}>
          <div
            className={className}
            style={{
              width: autoWidth || width,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              lineHeight: '20px',
            }}
            onClick={onClick}
          >
            {getValue}
          </div>
        </Tooltip>
      ) : (
        <div className={className} onClick={onClick}>
          {getValue}
        </div>
      )}
    </div>
  );
};

export default TextWidthOverflow;
