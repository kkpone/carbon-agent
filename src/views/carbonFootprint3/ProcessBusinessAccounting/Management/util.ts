/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-26 23:18:15
 * @Date: 2023-03-02 10:03:14
 * @@description:
 */
import { ProcessBusinessAccountingMenu } from '../type';

/**
 * @description: 根据接口返回的menus数据转换成菜单需要的类型
 */
export const transformMenuInitInfo = (
  apiData: ProcessBusinessAccountingMenu,
  isProcess?: boolean,
): ProcessBusinessAccountingMenu[] => {
  const { name, id, children } = apiData;

  const dataNode: ProcessBusinessAccountingMenu[] = [
    {
      ...apiData,
      title: name,
      key: id,
      children: [],
    },
  ];

  if (children && children.length > 0) {
    if (isProcess) {
      dataNode[0].children = children.map(child => ({
        ...child,
        title: child.name,
        key: child.id,
        children: child.children?.map(cChild => ({
          ...cChild,
          title: cChild.name,
          key: cChild.id,
          children: [],
        })),
      }));
      return dataNode;
    }
    children.forEach(data => {
      dataNode.push({
        ...data,
        title: data.name,
        key: data.id,
        children: data.children
          ? data.children.map(back => ({
              ...back,
              title: back.name,
              key: back.id,
            }))
          : [],
      });
    });
  }

  return dataNode;
};

/**
 * @description: 通过id找到完整的api接口信息
 * @param {number} id tree的唯一标识
 * @param {ProcessBusinessAccountingMenu[]} treeData 传递完整的树形
 * @return {ProcessBusinessAccountingMenu}
 */
export const getTreeApiInfo = (
  id: string,
  treeData?: ProcessBusinessAccountingMenu[],
): ProcessBusinessAccountingMenu[] => {
  const sessionTreeData = sessionStorage.getItem('processAccountTree');
  const nowTreeData: ProcessBusinessAccountingMenu[] = treeData || [
    JSON.parse(sessionTreeData || ''),
  ];

  let findTreeData: ProcessBusinessAccountingMenu[] = [];

  nowTreeData.every(data => {
    if (data.id === id) {
      findTreeData = [data];
      return false;
    }

    if (findTreeData.length === 0 && data.children) {
      findTreeData = getTreeApiInfo(id, data.children);
    }
    return true;
  });

  return findTreeData;
};

/**
 * @description: 根据指定的id，前往修改父级的子级信息
 * @param {string} id 父级的id
 * @param {ProcessBusinessAccountingMenu} treeData 需要替换的父级children
 * @return {ProcessBusinessAccountingMenu[]} 被替换过子级的树形
 */
export const changeParentChildren = (
  id: string,
  apiTreeData: ProcessBusinessAccountingMenu[],
  treeData: ProcessBusinessAccountingMenu[],
) => {
  treeData.every(data => {
    if (data.id === id) {
      data.children = apiTreeData;
      return false;
    }

    if (data.children) {
      changeParentChildren(id, apiTreeData, data.children);
    }
    return true;
  });

  return treeData;
};
