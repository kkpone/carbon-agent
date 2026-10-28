/**
 * @file redux 涉及的hook
 */
import { PermissionTree } from '@src/typings';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '..';
import { NavState } from '../module/nav';

/**
 * @description 获取当前选中的产品
 */
export const useCurrentProduct = () => {
  const selector = useSelector<RootState, RootState>(s => s);
  const { productId } = selector.products;
  const products = useMemo(() => {
    const categorys = selector.Nav.reduce(
      (tmp, next) => [...tmp, ...(next.children || [])],
      [] as NavState[],
    );
    return categorys.reduce(
      (tmp, next) => [...tmp, ...(next.children || [])],
      [] as NavState[],
    );
  }, [selector.Nav]);
  const currentProduct = products.find(p => p.id === productId);
  return [currentProduct, products] as const;
};

/** 生成菜单树结构 */
export const usePermissionMenuTree = () => {
  const companyUserInfo = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );
  const menuMap: { [id: string]: PermissionTree } = {};
  companyUserInfo.userInfo?.permissionSet?.forEach(m => {
    if (['M', 'P'].includes(m.type?.toLocaleUpperCase())) {
      menuMap[m.permissionId] = { ...m, children: [] };
      return true;
    }
    return false;
  });
  const childIds: number[] = [];
  Object.entries(menuMap).forEach(([id, menu]) => {
    const parent = menuMap[menu.parentId];
    if (parent) {
      childIds.push(+id);
      parent.children = [...parent.children, menu];
    }
  });

  const flatMenus = Object.values(menuMap);
  const trees = flatMenus.filter(m => !childIds.includes(m.permissionId));
  return {
    trees,
    flatMenus,
  };
};
