/*
 * @@description:顶部导航
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:43
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-01-30 14:51:09
 */

import logoWhite from '@assets/icon/lj/login/logo-white.svg';
import './index.less';
import { RouteMaps } from '@src/router/route-paths';
import store, { RootState } from '@src/store';
import { UPDATE_INFO } from '@src/store/actionTypes';
import { CompanyUserInfoAction } from '@src/store/module/user';
import { getUserInfo, logoHref } from '@src/utils';
import { getStatisticsRequest } from '@src/utils/statistics';
import { StatisticProps } from '@src/utils/types';
import { InviteSearch } from '@src/views/becomeSupplierOrPurchasing/utils/common';
import { changeProduct, setCurrentIndex } from '@store/module/currentIndex';
import { Dropdown } from 'antd';
import classNames from 'classnames';
import { useRef, memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import AvatarDropdown from './AvatarDropdown';
import style from './index.module.less';
import { getProductPermission } from './utils';
import { EmptyLoading } from '../EmptyLoading';

export const PRODUCT_NAME = 'SAAS_PRODUCT';
interface HeaderTemType {
  id: number | string;
  name: string;
  web_path: string;
  children?: HeaderTemType[];
  isFloat: string;
}
interface LayoutNavBarProps {
  menu: HeaderTemType[];
  showAvatar?: boolean;
}

function LayoutNavBar({ menu, showAvatar }: LayoutNavBarProps) {
  const history = useHistory();
  const pathName = history.location.pathname;
  const search = new URLSearchParams(window.location.search);
  const selector = useSelector<RootState, RootState>(s => s);
  const { userInfo } = selector.companyUserInfo;
  const NavContent = useRef<HTMLDivElement>(null);
  const [isLoading, changeIsLoading] = useState<boolean>(false);
  const countStatistic = getStatisticsRequest();

  // 获取产品和路由权限
  const getQuList = async (productId: string) => {
    const info = getUserInfo();
    if (!info) return;
    changeProduct(productId);
    changeIsLoading(true);
    // eslint-disable-next-line
    return (
      getProductPermission(productId)
        // eslint-disable-next-line
        .then(([res, info]) => {
          if (info) {
            store.dispatch<CompanyUserInfoAction>({
              type: UPDATE_INFO,
              payload: info,
            });
            // 找到第一个能够跳转的权限地址
            const jumpPath = info?.permissionSet.find(t => !!t.path);
            // 首先找到权限中对应的路由，如果找不到就匹配第一个能够跳转的权限地址
            const matchPath = info?.permissionSet.find(
              t => t.path === pathName,
            );
            if (matchPath) {
              sessionStorage.setItem('productId', productId);
              search.set(PRODUCT_NAME, productId);
              // 根据产品id跳转产品
              history.push(`${matchPath.path}?${search.toString()}`);
            } else if (jumpPath?.path) {
              sessionStorage.setItem('productId', productId);
              search.set(PRODUCT_NAME, productId);
              // 根据产品id跳转产品
              history.push(`${jumpPath.path}?${search.toString()}`);
            } else {
              search.set('type', info.productMsg || productId);
              search.delete(PRODUCT_NAME);
              if (productId === 'CCDB_default') {
                history.push(`${RouteMaps.CCDBHome}`);
              } else {
                history.push(`${RouteMaps.NoOrder}?${search.toString()}`);
              }
            }
          }
        })
        .finally(() => {
          changeIsLoading(false);
        })
    );
  };
  // 主导航下的产品列表
  const renderCurrentTitle = (ite: HeaderTemType, father: HeaderTemType) => (
    <div className={style.titleItem} key={ite.id}>
      <span className={style.titleItemFirst}>{ite.name}</span>
      <div className={style.titleItemTwo}>
        {ite?.children?.map(it => (
          <div
            key={it.id || it.web_path}
            className={style.titleItemTwoText}
            onClick={async () => {
              if (it.id) {
                countStatistic({
                  data: {
                    userId: userInfo.userId,
                    companyId: userInfo.companyId,
                    productType: it.name,
                  } as StatisticProps,
                });
                setCurrentIndex(`${father.id}`);
                await getQuList(`${it.id}`);
              }
            }}
          >
            {it.name}
          </div>
        ))}
      </div>
    </div>
  );
  // 排除无效的触发
  const lastPathName = useRef<string>('');

  const productId = search.get(PRODUCT_NAME);

  useEffect(() => {
    if (menu.length) {
      if (pathName !== lastPathName.current) {
        lastPathName.current = pathName;
        // 首页的产品id
        const homeId = menu?.[0]?.children?.[0]?.children?.[0]?.id;
        if (
          pathName === RouteMaps.workIndex &&
          selector.products.productId !== homeId &&
          homeId
        ) {
          setCurrentIndex(`${menu[0].id}`);
          getQuList(`${homeId}`);
          // 产品id 不一致时，重新请求右侧菜单数据
        } else if (productId && selector.products.productId !== productId) {
          const matchMenu = menu.find(nav =>
            nav?.children?.some(types =>
              types?.children?.some(prods => prods.id === productId),
            ),
          );
          if (matchMenu?.id) {
            getQuList(`${productId}`);
            setCurrentIndex(`${matchMenu.id}`);
          }
        }
        // else {
        // todo 占时不考虑用户直接点击链接进入情况
        // const [keys, match] = caculateCheckedMenu<Routes>(
        //   menuRoutes,
        //   location.pathname,
        // );
        // }
      }
    }
  }, [pathName, menu]);

  /** 为了处理无权限路由只展示顶部导航颜色条 不展示菜单 */
  const isShowMenus = [
    RouteMaps.account,
    RouteMaps.inviteLink,
    RouteMaps.supplierBindTransfer,
  ].some(route => history.location.pathname.includes(route));

  return (
    <div className='layout__navbar'>
      {selector.settings.layout === 'side' && (
        <div className='layout__navbar__nav'>
          <div className='logo'>
            <div
              onClick={() => {
                const path =
                  sessionStorage.getItem(logoHref) || RouteMaps.workIndex;
                if (path) {
                  sessionStorage.removeItem(InviteSearch.COMID);
                  history.push(path);
                }
              }}
            >
              <img src={logoWhite} alt='' className='img-all' />
            </div>
          </div>
        </div>
      )}
      {/* 如果是没有权限的路由，不展示顶部菜单 */}
      {!isShowMenus && (
        <div className='layout__navbar__menu'>
          <div className={style.headerMenus}>
            {menu?.map(item => (
              <div
                key={item.id}
                className={classNames(style.menuTitle, {
                  [style.active]: selector.products.currentNav === `${item.id}`,
                })}
              >
                <Dropdown
                  trigger={['hover']}
                  overlayClassName={style.navDropdowWrapper}
                  getPopupContainer={con => con}
                  overlay={
                    <div
                      className={
                        Number(item?.isFloat) === 1 && item?.children?.length
                          ? style.navContent
                          : ''
                      }
                      ref={NavContent}
                    >
                      {Number(item?.isFloat) === 1
                        ? item.children?.map(ite =>
                            renderCurrentTitle(ite, item),
                          )
                        : ''}
                    </div>
                  }
                >
                  <span
                    onClick={async () => {
                      if (Number(item.isFloat) === 0) {
                        countStatistic({
                          data: {
                            userId: userInfo.userId,
                            companyId: userInfo.companyId,
                            productType: item.name,
                          } as StatisticProps,
                        });

                        setCurrentIndex(`${item.id}`);
                        if (Number(item.isFloat) === 0 && item?.children?.[0]) {
                          const productId = item.children[0]?.children?.[0]?.id;
                          if (productId) await getQuList(String(productId));
                        }
                      }
                    }}
                    key={item.id}
                  >
                    {item.name}
                  </span>
                </Dropdown>
              </div>
            ))}
          </div>
        </div>
      )}
      {(showAvatar || showAvatar === undefined) && (
        <AvatarDropdown
          showActions={!isShowMenus}
          className={classNames(
            'layout__navbar__menu-item',
            `layout__navbar__menu-item--${selector.settings.theme}`,
          )}
        />
      )}
      {isLoading && <EmptyLoading className={style.loading} />}
    </div>
  );
}

export default memo(LayoutNavBar);
