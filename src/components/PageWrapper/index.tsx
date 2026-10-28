import { Breadcrumb, BreadcrumbProps } from 'antd';
import { FC, PropsWithChildren } from 'react';

import styles from './index.module.less';

interface IPageWrapperProps {
  breadCrumbProps?: BreadcrumbProps;
  title?: React.ReactNode;
}

/**
 *  临时兼容加一个 padding，后续所有页面应该内部使用 page 组件来处理通用的 padding、title、面包屑。
 * @param props
 * @returns
 */
export const PageWrapper: FC<PropsWithChildren<IPageWrapperProps>> = props => {
  const { title } = props;
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.breadcrumb}>
        <Breadcrumb {...props.breadCrumbProps} />
      </div>
      <div className={styles.title}>{title}</div>
      {props.children}
    </div>
  );
};
