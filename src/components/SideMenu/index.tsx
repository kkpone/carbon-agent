/*
 * @@description:渲染菜单
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-09-29 11:15:11
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-13 14:57:40
 */

import { ItemType } from '@layout/index';
import { Menu, Tooltip } from 'antd';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import './index.css';

import { EPermissionType } from './const';
import styles from './index.module.less';
import { PRODUCT_NAME } from '../LayoutNavBar';
import { IconAlibabaNew } from '../iconfont';

function renderTitle(meta: ItemType) {
  return (
    <span className='menu-item-inner'>
      {meta.icon.length > 10 && (
        <IconAlibabaNew className={styles.menuIcon} type={meta.icon} />
      )}
      <span className={classNames('menu-title', styles.menuTitle)}>
        {meta.permissionName}
      </span>
    </span>
  );
}

/** 路由跳转后的路径参数需要剔除的 */
// const removeSearchKeys = [
//   'pageNum',
//   'keywords',
//   'pageSize',
//   'pageData',
//   'search',
//   'name',
// ];
const keepSearchKeys = [PRODUCT_NAME];

/** 生成 menu 的 key */
export const getPathKey = (menu?: ItemType) =>
  menu?.path || menu?.permissionName || '';
function renderMenuRoute(menu: ItemType, pathname: string) {
  const pathKey = getPathKey(menu);
  const nowPath = pathname;
  const oldSearch = new URLSearchParams(window.location.search);
  const newSearch = new URLSearchParams();

  keepSearchKeys.forEach(k => {
    const searchVal = oldSearch.get(k);
    if (searchVal) {
      newSearch.set(k, searchVal);
    }
  });
  const jump = (path?: string) => {
    if (path && path !== '#') {
      return `${path}?${newSearch.toString()}`;
    }
    return `${nowPath}?${newSearch.toString()}`;
  };
  return (
    <Menu.Item key={pathKey}>
      <Link to={jump(menu?.path)}>{renderTitle(menu)}</Link>
    </Menu.Item>
  );
}

function renderToolTipRoute(
  menu: ItemType,
  pathname: string,
  setExpandWidth?: (expand: boolean) => void,
  shrinkWidth?: () => void,
) {
  const pathKey = getPathKey(menu);

  const nowPath = pathname;
  const oldSearch = new URLSearchParams(window.location.search);
  const newSearch = new URLSearchParams();

  keepSearchKeys.forEach(k => {
    const searchVal = oldSearch.get(k);
    if (searchVal) {
      newSearch.set(k, searchVal);
    }
  });
  const jump = (path?: string) => {
    if (path && path !== '#') {
      return `${path}?${newSearch.toString()}`;
    }
    return `${nowPath}?${newSearch.toString()}`;
  };
  return (
    <Menu.Item key={pathKey}>
      <Tooltip
        placement='rightTop'
        key={pathname}
        overlayInnerStyle={{
          padding: 4,
        }}
        onOpenChange={visible => setExpandWidth?.(visible)}
        color='#002A23'
        title={
          <div className={styles.popoverWrapper}>
            {menu.children
              ?.filter(item => item.type === EPermissionType.MENU)
              .map(item => (
                <Link to={jump(item.path)} onClick={() => shrinkWidth?.()}>
                  <div
                    className={classNames(styles.item, {
                      [styles.active]: pathname === item.path,
                    })}
                  >
                    {item.permissionName}
                  </div>
                </Link>
              ))}
          </div>
        }
        arrow={false}
      >
        <div className={styles.toolTipItem}>
          <div className={styles.menuTitleWrapper}>
            {menu.icon.length > 10 && (
              <IconAlibabaNew className={styles.icon} type={menu.icon} />
            )}
            <span className={classNames('menu-title', styles.menuTitle)}>
              {menu.permissionName}
            </span>
          </div>
          <div className={styles.arrowIcon}>
            <IconAlibabaNew
              className={styles.icon}
              type='icon-icon_arrow_rioght'
            />
          </div>
        </div>
      </Tooltip>
    </Menu.Item>
  );
}

function renderSubMenu(
  menu: ItemType,
  sidebar: boolean,
  depth: number,
  pathname: string,
  setExpandWidth?: (expand: boolean) => void,
  shrinkWidth?: () => void,
) {
  if (menu.type === EPermissionType.BUTTON) return;
  const pathKey = getPathKey(menu);
  // eslint-disable-next-line
  return (
    <Menu.SubMenu title={renderTitle(menu)} key={pathKey}>
      {/*  eslint-disable-next-line array-callback-return */}
      {menu?.children?.map(item => {
        if (
          item.children?.some(item => item.type === EPermissionType.MENU) &&
          depth === 0
        ) {
          return renderToolTipRoute(
            item,
            pathname,
            setExpandWidth,
            shrinkWidth,
          );
        }
        if (item.type === 'P') {
          return renderMenu(item, sidebar, depth + 1, pathname);
        }
        if (item.type === '') {
          return renderMenuRoute(item, pathname);
        }
        if (item.type === 'C') {
          return renderMenuRoute(item, pathname);
        }
        if (item.type === 'M') {
          return renderMenuRoute(item, pathname);
        }
        return null;
      })}
    </Menu.SubMenu>
  );
}
const culChildenType = data =>
  data.some(item => item.type === EPermissionType.MENU);
function renderMenu(
  menu: ItemType,
  sidebar: boolean,
  depth: number,
  pathname: string,
  setExpandWidth?: (expand: boolean) => void,
  shrinkWidth?: () => void,
) {
  if (menu.type === EPermissionType.BUTTON) return null;
  if (
    menu?.children &&
    menu?.children?.length > 0 &&
    ['C', 'P'].indexOf(`${menu.type}`) >= 0
  ) {
    return renderSubMenu(
      menu,
      sidebar,
      depth,
      pathname,
      setExpandWidth,
      shrinkWidth,
    );
  }
  if (culChildenType(menu.children)) {
    return renderSubMenu(menu, sidebar, depth, pathname);
  }

  return renderMenuRoute(menu, pathname);
}

export default renderMenu;
