/**
 * @file 路由权限
 */
import { RouteMaps } from '@src/router/route-paths';
import React, { memo } from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';

import { Routes, routeWhiteList } from '../router/config';
import { businessRouteList } from '../router/utils';
import { getToken } from '../utils/cookie';

interface AuthProps extends RouteComponentProps {
  route: Routes;
  children: React.ReactNode;
}

function checkAuth(location: RouteComponentProps['location']): boolean {
  // redux 中的 routes 同时负责渲染 sidebar

  // 判断当前访问路由是否在系统路由中, 不存在直接走最后默认的 404 路由
  const route = businessRouteList.find(
    child => child.path === location.pathname,
  );

  if (!route) {
    return true;
  }

  if (route.redirect) {
    return true;
  }

  if (route.auth === false) {
    return true;
  }

  // 路由存在于系统中，查看该用户是否有此路由权限
  // if (!flattenRoutes.find(child => child.path === location.pathname)) {
  //   return false;
  // }

  return true;
}

function Auth(props: AuthProps) {
  // 未登录
  if (
    !getToken() &&
    routeWhiteList.every(whiteRouteId => whiteRouteId !== props.route.id)
  ) {
    return (
      <Redirect
        to={`/system/login?redirectURL=${encodeURIComponent(
          window.location.href,
        )}`}
      />
    );
  }

  // 检查授权
  if (!checkAuth(props.location)) {
    return <Redirect to={RouteMaps.notPermission} push />;
  }

  if (props.route.redirect) {
    return <Redirect to={props.route.redirect} push />;
  }

  return props.children;
}

// @ts-ignore
export default memo(Auth);
