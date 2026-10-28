/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-04-04 11:51:47
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-04-17 16:23:19
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @file 欢迎页
 */
import { Page } from '@src/components/Page';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { RootState } from '@src/store';
import { getNav } from '@src/store/module/nav';
import { combineClassName } from '@src/utils';
import { SaasOssPath } from '@src/utils/types';
import { Modal, Pagination, Radio, Tabs } from 'antd';
import { ReactElement, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import style from './index.module.less';

const PageBar = ({
  domId,
  pageOptions,
  onChange,
  reset,
}: {
  domId: string;
  pageOptions: {
    pageNum: number;
    pageSize: number;
    total: number;
  };
  onChange;
  reset?: number | string;
}) => {
  // fix: 当跳转到首页没有导航栏时，清空数据，重新登录
  const [positonPageBar, setPositonPageBar] = useState(true);
  const app = useSelector<RootState, RootState['app']>(s => s.app);

  const domAttribute = (podition: boolean) =>
    podition
      ? {
          className: style.pageBarFix,
          style: {
            width: app.sidebar.opened
              ? 'calc(100vw - 300px)'
              : 'calc(100vw - 300px)',
          },
        }
      : {
          className: style.pageBar,
          style: {
            width: app.sidebar.opened
              ? 'calc(100vw - 300px)'
              : 'calc(100vw - 300px)',
          },
        };
  useEffect(() => {
    setTimeout(() => {
      const containerHeight = window.innerHeight - 88;
      const box: Element | JSX.Element | null = document.querySelector(
        `#${domId}`,
      );

      // @ts-ignore
      const boxHeight = box?.offsetHeight;
      setPositonPageBar(boxHeight >= containerHeight);
    }, 500);
  }, [reset, pageOptions]);

  return (
    <div className={style.pageWrapper}>
      <Pagination
        onChange={onChange}
        total={pageOptions.total}
        current={pageOptions.pageNum}
        pageSize={pageOptions.pageSize}
        // eslint-disable-next-line react/no-unstable-nested-components
        showTotal={tot => (
          <span style={{ paddingRight: 8 }}>
            {I18N.workbench.common}
            {tot}
            {I18N.workbench.strip}
          </span>
        )}
        showSizeChanger
      />
    </div>
  );
};

export default PageBar;
