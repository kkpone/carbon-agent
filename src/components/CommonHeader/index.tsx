/*
 * @@description: 头部展示的信息
 */
import { Tooltip } from 'antd';
import classNames from 'classnames';

import style from './index.module.less';

function CommonHeader({
  wrapperClass,
  basicInfo,
}: {
  wrapperClass?: string;
  basicInfo?: { label: string; value: string | number | undefined }[];
}) {
  return (
    <main className={classNames(style.commonHeaderWrapper, wrapperClass)}>
      {basicInfo &&
        basicInfo.map(item => (
          <p className={style.contentItem} key={item.label}>
            <span className={style.label}>{item.label}: </span>
            <Tooltip title={item.value} placement='topLeft'>
              <span className={style.text}>{item.value || '-'}</span>
            </Tooltip>
          </p>
        ))}
    </main>
  );
}
export default CommonHeader;
