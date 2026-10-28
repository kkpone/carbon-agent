/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-21 11:25:56
 * @Date: 2023-02-10 14:39:58
 * @@description: 表格文字过多溢出隐藏
 */
import { Tooltip } from 'antd';

const TextOverflowTable = (props: {
  value: string;
  maxLength: number;
  maxWidth?: number;
  className?: string;
  onClick?: () => void;
}) => {
  const { maxLength, className, maxWidth, onClick = () => {} } = props;

  const value = `${props.value}`;
  return (
    <div>
      {value.length > maxLength ? (
        <Tooltip title={value}>
          <div
            className={className}
            style={{
              width: maxWidth || '100%',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
            onClick={onClick}
          >
            {value}
          </div>
        </Tooltip>
      ) : (
        <div className={className} onClick={onClick}>
          {value}
        </div>
      )}
    </div>
  );
};

export default TextOverflowTable;
