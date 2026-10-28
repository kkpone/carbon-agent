/*
 * @@description:带面包屑的基础页面
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:43
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:18:07
 */

import { RouteMapsType } from '@src/router/route-paths';
import { Breadcrumb, Button, Space } from 'antd';
import classNames from 'classnames';
import { FC, MouseEventHandler, PropsWithChildren, ReactNode } from 'react';

import style from './index.module.less';

type Breadcrumbs = {
  /** 展示的文字 */
  title: ReactNode;
  /** react 需要的字段 唯一 React.Keys */
  key: string | number;
  /** 跳转的路径 */
  href?: string | RouteMapsType;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLSpanElement>;
};

type PageProps = {
  breadCrumbs?: Breadcrumbs[];
  wrapperClassName?: string;
  breadcrumbClass?: string;
  styles?: React.CSSProperties;
  /** Backward-compatible list-page header API used by migrated modules. */
  title?: ReactNode;
  actionBtnChild?: ReactNode;
  actionBtnChildArr?: Array<{
    button: ReactNode;
    click?: () => Promise<void> | void;
  }>;
  wrapperClass?: string;
  rightRender?: ReactNode;
  onBtnClick?: () => Promise<void> | void;
};

export const Page: FC<PropsWithChildren<PageProps>> = ({
  children,
  wrapperClassName,
  breadcrumbClass,
  breadCrumbs,
  styles,
  title,
  actionBtnChild,
  actionBtnChildArr,
  wrapperClass,
  rightRender,
  onBtnClick,
}) => (
  <div
    className={classNames(
      { [style.pageWrapper]: breadCrumbs?.length },
      wrapperClassName,
      wrapperClass,
      'barTag',
    )}
    style={styles}
  >
    {title && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        <Space>
          {actionBtnChildArr?.map(item => (
            <Button key={String(item.button)} onClick={item.click}>
              {item.button}
            </Button>
          ))}
          {actionBtnChild && (
            <Button type='primary' onClick={onBtnClick}>
              {actionBtnChild}
            </Button>
          )}
          {rightRender}
        </Space>
      </div>
    )}
    <Breadcrumb
      className={classNames(style.breadcrumb, breadcrumbClass)}
      style={styles}
    >
      {breadCrumbs?.map(b => (
        <Breadcrumb.Item
          key={`${b.key}`}
          aria-label={b.key}
          onClick={b?.onClick}
        >
          {b.href ? <a href={b.href}>{b.title}</a> : b.title}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
    {children}
  </div>
);
