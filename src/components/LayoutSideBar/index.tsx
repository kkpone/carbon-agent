/**
 * @file 菜单
 */
import { ItemType } from '@layout/index';
import { RootState } from '@src/store';
import { Settings } from '@store/module/settings';
import { ConfigProvider, Menu } from 'antd';
import classNames from 'classnames';
import { compact } from 'lodash-es';
import { memo, useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import logoPng from '@/assets/images/logo.png';
import EnLogoPng from '@/assets/images/logo_en.png';
import { LocaleType } from '@/lang/I18N';
import { menuRoutes, Routes } from '@/router/config';
import { RouteMaps } from '@/router/route-paths';
import { caculateCheckedMenu, getFlatedRoutes } from '@/router/utils';
import { usePermissionMenuTree } from '@/store/hooks';

import { UserInfoCard } from './components/UserInfoCard';
import styles from './index.module.less';
import { AppState, updateSideBar } from '../../store/module/app';
import { LocaleContext } from '../LocaleProvider';
import renderMenu, { getPathKey } from '../SideMenu';

interface LayoutNavBarProps extends AppState {
  layout: Settings['layout'];
  theme: Settings['theme'];
  ActionUpdateSideBar: (sidebar: AppState['sidebar']) => void;
  allrouter: ItemType[];
}

type TRouter = {
  path?: string;
  permissionName?: string;
  children?: TRouter[];
};

const MENU_ACTIVE_PATH_MAP: Partial<Record<string, string>> = {
  [RouteMaps.enterpriseCarbonAccountingDisclosureReportEdit]:
    RouteMaps.enterpriseCarbonAccountingcarbonDischarge,
  [RouteMaps.CarbonFootprintCertificationProject]:
    RouteMaps.CertificationProductIndex,
  [RouteMaps.CarbonFootprintCertificationProjectApplay]:
    RouteMaps.CertificationProductIndex,
};

const getActiveMenuPath = (pathname: string) => {
  if (pathname.startsWith(`${RouteMaps.cbamReport}/`)) {
    return RouteMaps.cbamReport;
  }
  return MENU_ACTIVE_PATH_MAP[pathname] || pathname;
};

const LayoutSideBar = ({
  // sidebar,
  layout,
  theme,
  allrouter,
}: // ActionUpdateSideBar,
LayoutNavBarProps) => {
  const collapsed = false;
  const inlineCollapsed: {
    inlineCollapsed?: boolean;
  } = {};

  if (layout === 'side') {
    inlineCollapsed.inlineCollapsed = collapsed;
  }

  const { locale } = useContext(LocaleContext);

  const location = useLocation();

  const { pathname } = location;
  const activeMenuPath = getActiveMenuPath(pathname);

  const [openKeys, setOpenKeys] = useState<string[]>();

  const [keys] = caculateCheckedMenu<Routes>(menuRoutes(), activeMenuPath);
  const flatRoute = getFlatedRoutes<ItemType>(allrouter)?.filter(r => !!r.path);
  const { flatMenus } = usePermissionMenuTree();

  /** 没看懂里面的转换逻辑，先保留 */
  const [parent, child] = useMemo(() => {
    const matchMenu = flatMenus.find(m => m.path === activeMenuPath);
    /** 如果菜单可以匹配上，直接返回 */
    if (matchMenu) {
      const parentPath = flatMenus.find(
        m => m.permissionId === matchMenu.parentId,
      );
      return [parentPath?.path || parentPath?.permissionName, matchMenu.path];
    }

    // 有些特别的路由，算法无法完成处理，需要单独处理
    const dangerRoute: string[] = [
      'national/control-model',
      'national/product-model',
    ];
    const dangerTarget = dangerRoute.find(r => activeMenuPath.includes(r));
    if (dangerTarget) {
      return [
        undefined,
        flatRoute.find(r => r.path?.includes(dangerTarget))?.path,
      ];
    }
    /** 第一层路由 =》下一层路由 =》 。。。 =》 当前路由 */
    const routePath: (Routes | undefined)[] = [];
    keys?.forEach((k, i) => {
      if (i === 0) routePath.push(menuRoutes()[k]);
      // eslint-disable-next-line no-unsafe-optional-chaining
      else routePath.push(routePath?.[routePath?.length - 1]?.children?.[k]);
    });
    /** 和权限点比较，是否和权限点有完全匹配的路由  */
    let len = routePath?.length;
    if (!len || !flatRoute?.length) return [];
    let parent: undefined | ChildRoutes<ItemType>;
    let child: undefined | ChildRoutes<ItemType>;
    while (len--) {
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      const target = flatRoute?.find(t => t.path === routePath[len]?.path);

      if (target) {
        child = target;
        parent = flatRoute?.find(t => t.permissionId === target.parentId);
        len = 0;
      }
    }
    // 如果child 是母菜单（可折叠），再查询子菜单匹配情况
    const childChildrenLength =
      child?.children?.filter(r => !!r.path)?.length || 0;
    if (childChildrenLength) {
      let matchIndex = 0;
      let matches = 0;
      const pathList = activeMenuPath.split('/');
      for (let i = 0; i < childChildrenLength; i++) {
        const targetRoute = child?.children?.[i];
        const routePath = targetRoute?.path?.split('/');
        const matchNum =
          routePath?.filter(r => pathList.includes(r))?.length || 0;
        if (matchNum > matches) {
          matches = matchNum;
          matchIndex = i;
        }
      }
      return [getPathKey(child), child?.children?.[matchIndex]?.path];
    }

    return [getPathKey(parent), child?.path];
  }, [activeMenuPath, keys, menuRoutes(), flatRoute]);

  const defaultOpenKeys = useMemo(() => {
    const result: string[][] = [];

    const dfs = (route: TRouter, parentUrls: string[] = []) => {
      if (!route) {
        return;
      }
      if (route?.path === activeMenuPath) {
        result.push(parentUrls);
      } else {
        route.children?.forEach(childRoute =>
          dfs(childRoute, [...parentUrls, route.path || '']),
        );
      }
    };
    dfs({
      path: '',
      children: allrouter,
    });
    if (result.length === 0) {
      return compact([parent, child]);
    }
    return result.flat();
  }, [activeMenuPath, allrouter, child, parent]);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    const result: string[] = [];

    const dfs = (route: TRouter, parentUrls: string[] = [], depth = 0) => {
      if (!route) {
        return;
      }
      if (route?.path === activeMenuPath) {
        if (depth < 3) {
          result.push(route.path || route.permissionName || '');
        } else {
          result.push(parentUrls[parentUrls.length - 1]);
        }
      } else {
        route.children?.forEach(childRoute =>
          dfs(
            childRoute,
            [...parentUrls, route.path || route.permissionName || ''],
            depth + 1,
          ),
        );
      }
    };
    dfs({
      path: '',
      children: allrouter,
    });
    if (result.length === 0) {
      result.push(compact([child]));
    }
    setSelectedKeys(result.flat());
  }, [activeMenuPath, allrouter, child]);

  const handleOpenChange = (newOpenKeys: string[]) => {
    if ((newOpenKeys || [])?.length > (openKeys || [])?.length) {
      setOpenKeys([newOpenKeys[newOpenKeys.length - 1]]);
    } else {
      setOpenKeys(newOpenKeys);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ExpandWidth, setExpandWidth] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hoverSidebar, setHoverSidebar] = useState(false);

  return (
    <div
      className={classNames(styles.sideBar, {
        [styles.enSideBar]: locale === LocaleType.enUS,
        // [styles.expand]:
        //   locale === LocaleType.enUS && (ExpandWidth || hoverSidebar),
      })}
      onMouseEnter={() => setHoverSidebar(true)}
      onMouseLeave={() => setHoverSidebar(false)}
    >
      <div className={styles.header}>
        <img
          className={classNames(styles.logo, {
            [styles.collapsedLogo]: collapsed,
          })}
          src={locale === LocaleType.enUS ? EnLogoPng : logoPng}
          style={{}}
          alt=''
        />
      </div>
      {/* <div 
        className={styles.collapseTrigger} 
        onClick={() => ActionUpdateSideBar({ opened: !sidebar?.opened })}
      >
        {collapsed ? (
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M16 4L16 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
             <path d="M12 9L15 12L12 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M8 4L8 20" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>
           </svg>
        ) : (
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M8 4L8 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
             <path d="M12 15L9 12L12 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M16 4L16 20" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>
           </svg>
        )}
      </div> */}
      <div className={classNames(styles.menu, 'side-bar-wrapper')}>
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                colorInfoBorder: 'none',
                itemHeight: 38,
                itemMarginBlock: 8,
                itemBg: '#002A23',
                itemColor: '#fff',
                itemHoverColor: '#fff',
                itemHoverBg: 'rgba(255, 255, 255, 0.10)',
                itemSelectedBg: 'rgba(255, 255, 255, 0.10)',
                itemActiveBg: 'rgba(255, 255, 255, 0.10)',
                itemSelectedColor: '#fff',
                itemBorderRadius: 0,
                itemMarginInline: 0,
                itemPaddingInline: 20,
                subMenuItemBg: '#002A23',
                popupBg: '#002A23',
              },
            },
          }}
        >
          <Menu
            key={defaultOpenKeys.toString()}
            defaultSelectedKeys={compact([child])}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            defaultOpenKeys={defaultOpenKeys}
            onOpenChange={e => {
              handleOpenChange(e);
            }}
            onSelect={e => setSelectedKeys(e.selectedKeys)}
            mode={layout === 'side' ? 'inline' : 'horizontal'}
            theme={theme}
            {...inlineCollapsed}
          >
            {allrouter &&
              allrouter?.map(menu =>
                renderMenu(
                  menu,
                  true,
                  0,
                  activeMenuPath,
                  setExpandWidth,
                  () => {
                    setHoverSidebar(false);
                    setExpandWidth(false);
                  },
                ),
              )}
          </Menu>
        </ConfigProvider>
      </div>
      <div
        className={classNames(styles.infoCard, {
          [styles.collapsedInfoCard]: collapsed,
        })}
      >
        <UserInfoCard collapsed={collapsed} />
      </div>
    </div>
  );
};

export default connect(
  ({ app, settings: { layout, theme } }: RootState) => ({
    ...app,
    sidebar: app.sidebar,
    layout,
    theme,
  }),
  {
    ActionUpdateSideBar: updateSideBar,
  },
)(memo(LayoutSideBar));
