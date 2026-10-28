/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-14 14:47:26
 * @Date: 2022-09-22 10:14:27
 * @@description:
 */
/* eslint-disable no-promise-executor-return */
/**
 * todo fix this eslint
 * @file 登录页
 */
import { SwitchoverCompanyData } from '@src/api/types';
import { getProductPermission } from '@src/components/LayoutNavBar/utils';
// import { SUPPLY_LOGIN_IDENTIFIER } from '@src/config';
import { withCurrentLocalePrefix } from '@src/router/localePath';
import { RouteMaps } from '@src/router/route-paths';
import { RouteMapsSupplyChain2 } from '@src/router/route-paths/supplyChain2';
import { SET_COMPANY_USER_INFO, UPDATE_INFO } from '@src/store/actionTypes';
import { CompanyUserInfoAction } from '@src/store/module/user';
import { mapChildren } from '@src/utils';
import { isNil, omit } from 'lodash-es';
import cookie from 'react-cookies';
import I18N from 'src/lang/I18N';

import { apiQuideList, switchoverCompany } from '@/api/api';
import { SUPPLY_TO_TASK } from '@/config';
import { GRT_NAV } from '@/store/module/nav';
import { COMPANY_ID } from '@/utils/consts';

import store from '../../../store';
import VerifyUtils from '../../../utils/verifty';

export const setUserInfo = async (e: SwitchoverCompanyData) => {
  const inFifteenMinutes = new Date(
    new Date().getTime() + 365 * 24 * 3600 * 1000,
  ); // 一天
  VerifyUtils.Toast(200, I18N.system.loginSuccessful);
  if (e.access_token) {
    const { productId, companyId } = e;
    store.dispatch({
      type: SET_COMPANY_USER_INFO,
      payload: omit(e, ['productId', 'companyId']),
    });
    // @ts-ignore
    cookie.save('phone', e.userInfo.username, {
      expires: inFifteenMinutes,
    });

    if (!isNil(productId) && !isNil(companyId)) {
      // 是从供应商邀请邮件进入的登录页面
      try {
        // 切换到对应的组织并获取头部导航
        // 逻辑同切换组织页面 src/views/system/account/component/ManOrganization.tsx
        const res = await switchoverCompany({
          companyId: `${companyId}`,
          userId: e.userInfo.userId,
        });
        const userData = res?.data?.data;
        if (res.data.code === 200 && userData) {
          localStorage.setItem(COMPANY_ID, `${companyId}`);
          store.dispatch<CompanyUserInfoAction>({
            type: SET_COMPANY_USER_INFO,
            payload: userData,
          });
        }

        // 和原先逻辑保持一致，获取头部导航接口延迟执行
        await new Promise(resolve => setTimeout(resolve));
        const { data } = await apiQuideList();
        if (data.code === 200) {
          const newArr = data.data.map(item => ({
            id: item.id,
            name: item.guideName,
            isFloat: `${item.isFloat}`,
            web_path: '',
            children: mapChildren(item?.categoryList || []),
            checkid: item.id,
          }));
          store.dispatch({
            type: GRT_NAV,
            payload: newArr,
          });
        }

        // 获取产品权限，逻辑同 src/components/LayoutNavBar/index.tsx getQuList
        const [, info] = await getProductPermission(productId);
        if (info) {
          store.dispatch<CompanyUserInfoAction>({
            type: UPDATE_INFO,
            payload: info,
          });
        }

        const toTask = new URLSearchParams(location.search).get(SUPPLY_TO_TASK);
        // 跳转供应商客户列表页或任务列表页
        window.location.href = toTask
          ? withCurrentLocalePrefix(
              RouteMapsSupplyChain2.supplyChainCarbonDataTaskList,
            )
          : withCurrentLocalePrefix(
              RouteMapsSupplyChain2.supplyChainClientList,
            );
      } catch (err) {
        const code = new URLSearchParams(location.search).get('code');
        window.location.href = code
          ? `${withCurrentLocalePrefix(
              RouteMaps.account,
            )}?code=${encodeURIComponent(code)}`
          : withCurrentLocalePrefix(RouteMaps.account);
        throw err;
      }
    } else {
      const code = new URLSearchParams(location.search).get('code');
      window.location.href = code
        ? `${withCurrentLocalePrefix(
            RouteMaps.account,
          )}?code=${encodeURIComponent(code)}`
        : withCurrentLocalePrefix(RouteMaps.account);
    }
  }
};
