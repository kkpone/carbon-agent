/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-09-29 11:15:11
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-06 20:56:29
 */
import { Breadcrumb } from 'antd';
import { memo, useState, useEffect, CSSProperties, FC } from 'react';
import { useHistory } from 'react-router-dom';

import { Routes } from '../../router/config';
import './index.less';
import { getBreadcrumbs, getRouteTitle } from '../../router/utils';

const Breadcrumbs: FC<{ style?: CSSProperties }> = ({ style }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Routes[]>([]);

  const history = useHistory();

  useEffect(() => {
    setBreadcrumbs(getBreadcrumbs());

    const unListen = history.listen(() => {
      setBreadcrumbs(getBreadcrumbs());
    });

    return () => {
      unListen();
    };
  }, []);

  const returnBreadCrumb = () =>
    breadcrumbs.map((route: Routes, index) =>
      route.path.includes('greenMeeting') ? (
        breadcrumbs.length > 2 && (
          <Breadcrumb.Item
            key={route.path}
            onClick={() => {
              history.push(route.path);
            }}
          >
            {/*  eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a type='link'> {getRouteTitle(route)}</a>
          </Breadcrumb.Item>
        )
      ) : (
        <Breadcrumb.Item
          key={route.path}
          onClick={() => {
            if (index !== 0) {
              history.push(route.path);
            }
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a type='link'> {getRouteTitle(route)}</a>
        </Breadcrumb.Item>
      ),
    );
  return (
    <div className='breadcrumb-container' style={{ ...style }}>
      <Breadcrumb>{returnBreadCrumb()}</Breadcrumb>
    </div>
  );
};

export default memo(Breadcrumbs);
