/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-22 19:43:39
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-25 16:47:47
 */

import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';

import { NodeData, TreeData, ViewDatas } from '../types';

export const MatchTypeNameMap = {
  0: I18N.carbonFootprint.emissionSources,
  1: I18N.carbonFootprint3.process,
  2: I18N.carbonFootprint3.supplier,
  5: I18N.carbonFootprint.emissionSources,
};

export const transformViewDatas = (viewData?: ViewDatas[]): TreeData => {
  const nodes = transformNodesDatas(compact(viewData));

  const data = {
    nodes,
    edges: compact(
      nodes.map(node => {
        // 0 为顶级节点
        if (node.value.parentId && node.id && node.value.parentId !== '0')
          return { source: node.value.parentId, target: node.id };
        return null;
      }),
    ),
  } as TreeData;

  return data;
};

const transformNodesDatas = (viewData?: ViewDatas[]): TreeData['nodes'] => {
  let nodes = [] as TreeData['nodes'];

  viewData?.forEach(item => {
    const node: any = getNodesFromViewData(item);
    if (node) nodes.push(node);
    // if (node.value.parentId && node.id && node.value.parentId !== '0') {
    // node.x = 0;
    // node.y = 0;
    // }
    // 折叠不显示子集
    if (!isFold(item as NodeData['value']))
      nodes = nodes.concat(transformNodesDatas(item.children));
  });

  return nodes;
};

/** 转换节点数据 */
const getNodesFromViewData = (viewData?: ViewDatas) =>
  ({
    id: viewData?.id,
    value: {
      ...viewData,
      title: viewData?.typeName || '',
    },
  } as TreeData['nodes'][number]);

/** 状态：0折叠 true，1展开 false */
export const isFold = (value: NodeData['value']) => value?.status === 0;

/** 是不是顶级节点 */
export const isTopNode = (value: ViewDatas) => value.parentId === '0';

/** 获取要移除的节点id */
export const getRemoveNodeId = (
  parentIds: string[],
  edges?: TreeData['edges'],
) => {
  let ids: string[] = [];
  // 下一级需要移除节点的ID，通过这个父节点id再向下找子节点
  let newIds: string[] = [];
  // 剩余 edge 数据
  let notRemoveEdges: TreeData['edges'] = [];
  if (!parentIds?.length || !edges?.length) {
    return { ids, edges: notRemoveEdges } as const;
  }

  ids = ids.concat(
    edges
      .filter(e => {
        if (parentIds.includes(e.source)) {
          newIds = newIds.concat(e.target);
          return true;
        }
        notRemoveEdges = notRemoveEdges.concat(e);
        return false;
      })
      .map(e => e.target),
  );
  if (newIds?.length) {
    // 查找下一级需要移除的子节点
    const { ids: newRemoveIds, edges: restEdges } = getRemoveNodeId(
      newIds,
      notRemoveEdges,
    );
    notRemoveEdges = restEdges;
    ids = ids.concat(newRemoveIds);
  }
  return { ids, edges: notRemoveEdges } as const;
};
