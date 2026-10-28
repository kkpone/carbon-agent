/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-02-22 09:45:20
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-27 11:17:24
 */
import G6, { Graph as IGraph, GraphOptions, GraphData, IGroup } from '@antv/g6';

import {
  GRAPH_SHAPE_NAME,
  GRAPH_NODE_NAME,
  HoverGroupIds,
  SHAPE_GEOMETRY_INFO,
} from './constant';
import { tooltip } from './plugin';
import { RegisterOptions, GraphType, GraphTreeClassNode } from './type';
import {
  registerQuickAccountG6,
  getNodeByName,
  setHoverState,
  transferQuickClassTreeNode,
} from './utils';
import { graphWheelEvent } from '../util';
// 添加一个开关  防止频繁触发进入离开
let inOrOut = true;

class TreeGraph {
  graph: IGraph;

  graphType: GraphType;

  static getGraphShapeNameMap() {
    return GRAPH_SHAPE_NAME;
  }

  static getGraphNodeNameMap() {
    return GRAPH_NODE_NAME;
  }

  constructor(option: GraphOptions, registerOption: RegisterOptions) {
    if (registerOption.graphType === 'quickAccount') {
      registerQuickAccountG6(registerOption, 'treeGraph');
    }
    const graph = new G6.TreeGraph({
      modes: {
        default: ['drag-canvas', 'custom-click'],
      },
      layout: {
        type: 'compactBox',
        direction: 'TB',
        getHeight: () => SHAPE_GEOMETRY_INFO.NEW_ROOT_RECT_HEIGHT,
        getWidth: () => SHAPE_GEOMETRY_INFO.NEW_ROOT_RECT_WIDTH,
        getVGap: () => 40,
      },
      defaultEdge: {
        type: 'polyline-self',
        style: {
          // edge 圆角
          radius: 20,
          stroke: '#EBEDF0',
          lineWidth: 2,
        },
        endArrow: false,
        edgeStateStyles: {
          hover: {
            stroke: '#0CBF9F',
          },
        },
      },
      animate: true,
      animateCfg: {
        duration: 150,
        easing: 'easeLinear',
      },
      plugins: [tooltip()],
      ...option,
    });
    graph.on('wheel', ev => {
      graphWheelEvent(ev, graph);
    });
    graph.on('node:mouseover', ev => {
      // eslint-disable-next-line no-underscore-dangle
      const targetName = ev.item?._cfg?.currentShape;
      const groupData = ev.item?.getContainer();
      const groupDataChilds = groupData?.getChildren();
      // 获取当前group
      const groupName = ev.target.cfg.name;
      if (
        ['save-store-text', 'set-more-img', 'delete-img', 'copy-text'].includes(
          groupName,
        )
      ) {
        inOrOut = true;
        setHoverState(HoverGroupIds.childSetNode, ev, graph, true);
      }

      // 快速核算 生命周期节点
      if (targetName === GRAPH_NODE_NAME.ROOT_NODE) {
        setHoverState(HoverGroupIds.rootNode, ev, graph, true);
      }

      if (targetName === 'child-node') {
        setHoverState(GRAPH_NODE_NAME.CHILD_NODE, ev, graph, true);
        const node = getNodeByName(
          'close-group',
          groupDataChilds as any,
        ) as IGroup;
        node?.show();
      }

      // 排放源中的操作按钮
      if (targetName === GRAPH_NODE_NAME.CHILD_NODE_SET && ev.item) {
        setHoverState(HoverGroupIds.childSetNode, ev, graph, true);
        // graph.setItemState(ev.item, 'hover', true);
      }
      // 移动到折叠按钮上取消右侧显示
      // if (targetName === GRAPH_SHAPE_NAME.FOLD_ICON) return;
      // const node1 = getNodeByName(
      //   PROCESS_MODEL_GROUP_NAMES.hoverGroup,
      //   getAllTopNode(ev),
      // ) as IGroup;
      // const node2 = getNodeByName('close-group', getAllTopNode(ev)) as IGroup;
      // node1.show();
      // node2.show();
    });

    graph.on('node:mouseout', ev => {
      // eslint-disable-next-line no-underscore-dangle
      const targetName = ev.item?._cfg?.currentShape;
      const groupData = ev.item?.getContainer();
      const groupDataChilds = groupData?.getChildren();
      // 获取当前group
      const groupName = ev.target.cfg.name;

      if (groupName === 'set-more-img' && inOrOut) {
        inOrOut = false;
        // 延迟500毫秒后触发离开事件
        setTimeout(() => {
          if (!inOrOut) {
            setHoverState(HoverGroupIds.childSetNode, ev, graph, false);
          }
        }, 200);
      }

      if (targetName === 'child-node') {
        const node = getNodeByName(
          'close-group',
          groupDataChilds as any,
        ) as IGroup;
        node?.hide();
      }

      // 快速核算 生命周期节点
      if (targetName === GRAPH_NODE_NAME.ROOT_NODE) {
        setHoverState(HoverGroupIds.rootNode, ev, graph, false);
      }

      if (targetName === GRAPH_NODE_NAME.CHILD_NODE) {
        setHoverState(HoverGroupIds.childNode, ev, graph, false);
      }

      // 排放源中的操作按钮
      if (targetName === GRAPH_NODE_NAME.CHILD_NODE_SET && ev.item) {
        setHoverState(HoverGroupIds.childSetNode, ev, graph, false);
      }
    });

    graph.on('afterrender', () => {
      const group = graph.getGroup();
      graph.zoomTo(0.6, undefined);
      graph.fitCenter();
      setTimeout(() => {
        const getBoxWidth = group.getBBox()?.width
          ? group.getBBox().width / 2
          : 0;
        const boxWidth = group.cfg?.cacheCanvasBBox?.x || getBoxWidth || 0;
        graph.moveTo(boxWidth, 0);
      }, 100);
    });

    this.graph = graph;
    this.graphType = registerOption.graphType;
  }

  setData(data: GraphTreeClassNode[]) {
    const renderData: GraphData | undefined = transferQuickClassTreeNode(data);

    this.graph.data(renderData);
    this.graph.render();
  }

  changeData(data: GraphTreeClassNode[]) {
    const renderData: GraphData | undefined = transferQuickClassTreeNode(data);
    this.graph.changeData(renderData);
  }

  /**
   * @description: 放大缩小按钮
   * @param {number} num 放大缩小倍数
   * @return {*}
   */
  changeZoom(num: number) {
    const width = this.graph.getWidth();
    const height = this.graph.getHeight();

    this.graph.zoomTo(num, { x: width / 2, y: height / 2 }, true, {
      duration: 150,
    });
  }
}

export default TreeGraph;
