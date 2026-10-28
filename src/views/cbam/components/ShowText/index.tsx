/**
 * @description 显示文本
 */
import { Tooltip } from 'antd';

import style from './index.module.less';

export const ShowText = ({ text }: { text?: string }) => (
  <div className={style.showText}>
    <Tooltip title={text} placement='topLeft'>
      {text || '-'}
    </Tooltip>
  </div>
);
