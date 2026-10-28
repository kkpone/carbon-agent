import { FC } from 'react';

import style from './index.module.less';

interface DivsionProps {
  width?: number;
  height?: number;
  color?: string;
}
const Division: FC<DivsionProps> = ({ width, height, color }) => (
  <div
    className={style.division}
    style={{
      width,
      height,
      color,
    }}
  />
);
export default Division;
