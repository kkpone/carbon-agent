import {
  Graph,
  NodeConfig,
  EdgeConfig,
  G6GraphEvent,
  Shape,
  IGroup,
  IG6GraphEvent,
} from '@antv/g6';

import {
  CUSTOME_NODE_STATE,
  GRAPH_NODE_NAME,
  HoverGroupIds,
  SHAPE_GEOMETRY_INFO,
} from './constant';
import { registerQuickAccountNode, registerQuickAccountEvt } from './register';
import {
  CustomNodeState,
  GraphTreeClassNode,
  GraphTreeNode,
  HoverGroupIdsType,
  RegisterOptions,
} from './type';

const {
  RECT_WIDTH,
  ROOT_RECT_HEIGHT,
  NEW_ROOT_RECT_WIDTH,
  CHILD_RECT_HEIGHT: ORIGINAL_CHILD_RECT_HEIGHT,
  ROOT_PATH_LENGTH,
  CHILD_PATH_LENGTH,
} = SHAPE_GEOMETRY_INFO;

const CHILD_RECT_HEIGHT = ORIGINAL_CHILD_RECT_HEIGHT + 40;
/**
 * 处理快速核算的原视图
 * @param nodeList node节点信息
 * @returns
 */
export const transferQuickDefaultTreeNode: (
  nodeList: GraphTreeNode[],
) => Parameters<Graph['data']>[number] = nodeList => {
  const nodes: NodeConfig[] = [];
  const edges: EdgeConfig[] = [];
  const nodeListLength = nodeList.length;
  // 去除掉root 以及线会少一个
  const pathNum = nodeListLength - 1;

  const rootOffsetX =
    (pathNum * RECT_WIDTH + (pathNum - 1) * ROOT_PATH_LENGTH) / 2 -
    NEW_ROOT_RECT_WIDTH / 2;
  // let prevRoot: GraphTreeNode | undefined;
  let rootNodeId: string | undefined;

  nodeList.forEach((node, index) => {
    const baseOffsetX = 0;
    const baseOffsetY = 0;
    const offsetX = baseOffsetX + (index - 1) * (RECT_WIDTH + ROOT_PATH_LENGTH);
    let prevNode: GraphTreeNode | undefined;

    // 如果是根节点的话
    if (node.isRoot) {
      rootNodeId = String(node.id);
      const nodeExtraData = (node.extraData as Record<string, any>) || {};
      const actualRootWidth = nodeExtraData.hideEmissionTotal
        ? SHAPE_GEOMETRY_INFO.ROOT_PADDING + SHAPE_GEOMETRY_INFO.ROOT_IMG_SIZE + 220
        : NEW_ROOT_RECT_WIDTH;
      const rootX = rootOffsetX + (NEW_ROOT_RECT_WIDTH - actualRootWidth) / 2;
      nodes.push({
        id: String(node.id),
        label: node.name,
        typeName: node.typeName,
        type: GRAPH_NODE_NAME.PRODUCT_ROOT_NODE,
        x: rootX,
        y: baseOffsetY - ROOT_RECT_HEIGHT - CHILD_PATH_LENGTH - 20,
        img: node.img,
        extraData: node.extraData,
        anchorPoints: [[0.5, 1]],
      });
    } else {
      nodes.push({
        id: String(node.id),
        label: node.typeName,
        type: GRAPH_NODE_NAME.ROOT_NODE,
        x: offsetX,
        y: baseOffsetY,
        img: node.img,
        extraData: node.extraData,
        anchorPoints: [
          [0, 0.5],
          [0.5, 1],
          [1, 0.5],
          [0.5, 0],
        ],
      });
      edges.push({
        type: 'polyline-self',
        target: rootNodeId,
        source: String(node.id),
        sourceAnchor: 3,
        style: {
          radius: 10,
        },
      });

      node.children?.forEach((childNode, childIndex) => {
        nodes.push({
          id: String(childNode.id),
          label: childNode.name,
          type: GRAPH_NODE_NAME.CHILD_NODE,
          x: offsetX,
          y:
            baseOffsetY +
            ROOT_RECT_HEIGHT +
            childIndex * CHILD_RECT_HEIGHT +
            (childIndex + 1) * CHILD_PATH_LENGTH,
          extraData: childNode.extraData,
          img: childNode.img,
          anchorPoints: [
            [0.5, 0],
            [0.5, 1],
          ],
        });
        // 快速核算操作
        nodes.push({
          id: `${childNode.id}_set`,
          label: childNode.name,
          type: GRAPH_NODE_NAME.CHILD_NODE_SET,
          x: offsetX,
          y:
            baseOffsetY +
            ROOT_RECT_HEIGHT +
            childIndex * CHILD_RECT_HEIGHT +
            (childIndex + 1) * CHILD_PATH_LENGTH,
          extraData: childNode.extraData,
          img: childNode.img,
          anchorPoints: [
            [0.5, 0],
            [0.5, 1],
          ],
        });
        edges.push({
          source: String(childNode.id),
          target: prevNode ? String(prevNode.id) : String(node.id),
          targetAnchor: prevNode ? 0 : 3,
        });
        prevNode = childNode;
      });
    }
  });

  return { nodes, edges };
};

const changeChildNode = (nodes: GraphTreeClassNode[]) => {
  const childNode: any[] = nodes.map(child => ({
    id: String(child.id),
    label: child.name,
    type: GRAPH_NODE_NAME.CHILD_NODE,
    extraData: child.extraData,
    img: child.img,
    anchorPoints: [
      [0.5, 0],
      [0.5, 1],
    ],
    children: changeChildNode(child.children),
  }));
  return childNode;
};

/**
 * 处理生命周期节点
 * @param nodes 生命周期节点数据
 * @returns 生命周期处理好的信息
 */
const changeRootNodeRoot = (nodes: GraphTreeClassNode[]) => {
  const rootNode: any[] = nodes.map(rootChild => ({
    id: String(rootChild.id),
    label: rootChild.typeName,
    type: GRAPH_NODE_NAME.ROOT_NODE,
    img: rootChild.img,
    extraData: rootChild.extraData,
    anchorPoints: [
      [0.5, 0],
      [0.5, 1],
    ],
    children: changeChildNode(rootChild.children),
  }));

  return rootNode;
};

/**
 * 递归处理每个节点数据格式
 * @param node GraphTreeClassNode 根节点信息
 */
const changeNodeProductRoot = (node: GraphTreeClassNode) => {
  // 处理每个节点
  const rootNode: NodeConfig = {
    id: String(node.id),
    label: node.name,
    typeName: node.typeName,
    type: GRAPH_NODE_NAME.PRODUCT_ROOT_NODE,
    img: node.img,
    extraData: node.extraData,
    anchorPoints: [[0.5, 1]],
    children: changeRootNodeRoot(node.children),
  };

  return rootNode;
};

/**
 * 处理类别分类数据
 * @param nodeList 节点信息
 */
export const transferQuickClassTreeNode: (
  nodeList: GraphTreeClassNode[],
) => Parameters<Graph['data']>[number] = nodeList => {
  const nodesInfo: NodeConfig = changeNodeProductRoot(nodeList[0]);
  return nodesInfo;
};

export const registerQuickAccountG6 = (
  options?: RegisterOptions,
  status?: string,
) => {
  registerQuickAccountNode(options?.operatePermission, status);
  registerQuickAccountEvt(options?.eventMap);
};

/** // todo 这个方案不太好实现 递归隐藏所有子节点 */
// export const hideAllChild = (node: INode) => {
//   node.hide();
//   node.getEdges().forEach(edge => {
//     edge.hide();
//   });

//   const children = node.getModel()?.g_children as string[]

// };
/** 找到触发事件 node 的所有顶级group或shape */
export const getAllTopNode = (ev: G6GraphEvent) => {
  const group = ev.item?.getContainer();
  const children = group?.getChildren();
  return children as (Shape | IGroup)[];
};

export const getNodeByName = (
  name: string,
  nodes: (Shape | IGroup)[],
): Shape | IGroup => {
  let node;
  for (let i = 0; i < nodes.length; i++) {
    // @ts-ignore   group 是id ; shape 是 name
    if (nodes[i]?.cfg?.id === name || nodes[i]?.cfg?.name === name) {
      node = nodes[i];
      return node;
    }
  }
  return node;
};

export const calcTextWidth = (value, font = 'normal 500 14px sans-serif') => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.font = font;
  const { width } = context.measureText(value);
  return width;
};
/** 根据字号获取文字的宽度 默认fontsize：14、fontweight：500、fontfamily：sans-serif  */
export const calcTextWidthUseFontSize = (
  str: string,
  opts: { fontSize?: number; font?: string },
) => {
  if (!str) return 0;
  const fonts = opts.font || `normal 500 ${opts.fontSize || 14}px sans-serif`;
  return calcTextWidth(str, fonts);
};

// fixme 目前还是一个简版，后续需要再完善
/** 自动文字省略显示 */
export const textEllipsised = (
  text: string | number,
  maxWidth: number,
  fontSize?: number,
  fonts?: string,
) => {
  const font = fonts ?? `normal 500 ${fontSize ?? 14}px sans-serif`;
  const endSuffix = '...';
  const ellipsisWidth = calcTextWidth(endSuffix, font) || 0;
  // 超出最小长度
  const calcMaxWidth = Math.floor(maxWidth - ellipsisWidth);
  if (calcMaxWidth <= 0) return '';
  let newText = String(text);
  const textWidth = calcTextWidth(newText, font) ?? 0;
  // 小于最大长度，直接返回文字
  if (maxWidth >= textWidth) {
    return text;
  }

  let overSizeWidth = textWidth - calcMaxWidth;
  while (overSizeWidth > 0) {
    const overSizeRate = overSizeWidth / calcMaxWidth;
    const safeRate = 1.1;
    if (overSizeRate > safeRate) {
      newText = newText.slice(
        0,
        -1 *
          Math.floor(
            (newText.length / overSizeRate) * (overSizeRate - safeRate),
          ),
      );
      const newWidth = calcTextWidth(newText, font) ?? 0;
      overSizeWidth = Math.ceil(newWidth - calcMaxWidth);
    } else {
      newText = newText.slice(0, -1);
      const newWidth = calcTextWidth(newText, font) ?? 0;
      overSizeWidth = Math.ceil(newWidth - calcMaxWidth);
    }
  }
  return newText + endSuffix;
};

/** 设置节点的状态 */
export const setHoverState = (
  hoverGroupId: HoverGroupIdsType,
  ev: IG6GraphEvent,
  graph: Graph,
  isEnter?: boolean,
) => {
  const { item } = ev;
  const hasStateIds = Object.values(HoverGroupIds);
  const id = hoverGroupId;
  // 只处理已知的 hover 事件
  if (!item || !hasStateIds.includes(id)) return;

  const customNodeState = ev.item?.getModel()?.[
    CUSTOME_NODE_STATE
  ] as CustomNodeState;

  if (
    // mouseover
    isEnter &&
    customNodeState?.hoverGroup !== id
  ) {
    graph.updateItem(item, {
      [CUSTOME_NODE_STATE]: {
        hoverGroup: id,
        hover: true,
      } as CustomNodeState,
    });
  }
  if (
    // mouseout
    !isEnter &&
    customNodeState?.hoverGroup === id
  ) {
    graph.updateItem(item, {
      [CUSTOME_NODE_STATE]: {
        hoverGroup: null,
        hover: false,
      } as CustomNodeState,
    });
  }
};

const sliceString = (str: string, len: number) =>
  str.length > len ? `${str.slice(0, len)}...` : str;

export const sliceStringByLength = (
  target: string = '-',
  maxLength: number = 0,
) => {
  if (typeof target !== 'string') {
    return {
      exceedTheLimit: false,
      slicedTarget: target,
      originTarget: target,
    };
  }
  const exceedTheLimit = target.length > maxLength;
  const slicedTarget = exceedTheLimit ? sliceString(target, maxLength) : target;
  return {
    exceedTheLimit,
    slicedTarget,
    originTarget: target,
  };
};
