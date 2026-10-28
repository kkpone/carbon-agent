import G6, { Graph as IGraph, GraphOptions } from '@antv/g6';

import { graphWheelEvent } from './utils';

class TreeGraph {
  graph: IGraph;

  constructor(option: GraphOptions) {
    const graph = new G6.Graph({
      fitView: true,
      modes: {
        default: ['drag-canvas', 'drag-node'],
      },
      layout: {
        type: 'dagre',
        preventOverlap: true,
      },
      defaultNode: {
        type: 'card-node',
      },
      defaultEdge: {
        type: 'polyline',
        size: 1,
        color: 'orange',
        style: {
          endArrow: {
            path: 'M 0,0 L 8,4 L 8,-4 Z',
            fill: 'orange',
          },
          radius: 20,
        },
      },
      ...option,
    });
    graph.on('wheel', (ev: any) => {
      graphWheelEvent(ev, graph);
    });
    graph.on('edge:mouseenter', (e: any) => {
      graph.setItemState(e?.item, 'active', true);
    });
    graph.on('edge:mouseleave', (e: any) => {
      graph.setItemState(e?.item, 'active', false);
    });
    this.graph = graph;
  }

  setData(data: any) {
    const renderData = data;
    this.graph?.data(renderData);
    this.graph?.render();
    this.graph?.fitView();
  }

  changeData(data: any) {
    const renderData = data;
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

  destroy() {
    this.graph.destroy();
  }
}

export default TreeGraph;
