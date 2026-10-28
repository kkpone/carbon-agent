/**
 * @description 空页面 暂无数据
 */

import I18N from '@src/lang/I18N';
import { Empty } from 'antd';
import { ReactNode } from 'react';

import style from './index.module.less';

export const PageEmpty = ({
  description = I18N.utils.noData,
}: {
  description?: ReactNode;
}) => (
  <div className={style.empty}>
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
  </div>
);
