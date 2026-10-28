import G6 from '@antv/g6';

import { textEllipsis } from './utils';

const ERROR_COLOR = '#F5222D';

/** 节点类型 */
const NODE_TYPE = {
  /** 工序 */
  PROCESS: 0,
  /** 前体 */
  PRECURSOR: 1,
};
const { PRECURSOR } = NODE_TYPE;

const getNodeConfig = (node: { label?: string | number; isProcess?: any }) => {
  /** 前体节点 */
  if (node.isProcess === PRECURSOR) {
    return {
      basicColor: ERROR_COLOR,
      fontColor: '#FFF',
      borderColor: ERROR_COLOR,
      bgColor: '#E66A6C',
      radius: 20,
    };
  }
  const config = {
    basicColor: '#5B8FF9',
    fontColor: '#5B8FF9',
    borderColor: '#5B8FF9',
    bgColor: '#C6E5FF',
    radius: 2,
  };
  return config;
};

const nodeBasicMethod = {
  createNodeBox: (group: any, config: any, w: number, h: number) => {
    /* 最外面的大矩形 */
    const container = group.addShape('rect', {
      attrs: {
        x: 0,
        y: 0,
        width: w,
        height: h,
      },
      name: 'big-rect-shape',
    });
    /* 矩形 */
    group.addShape('rect', {
      attrs: {
        x: 3,
        y: 0,
        width: w - 19,
        height: h,
        fill: config.bgColor,
        stroke: config.borderColor,
        radius: config.radius,
        cursor: 'pointer',
      },
      name: 'rect-shape',
    });
    return container;
  },
};

export const registerNode = () => {
  G6.registerNode('card-node', {
    draw: (cfg: any, group: any) => {
      const config = getNodeConfig(cfg);
      /* the biggest rect */
      const container = nodeBasicMethod.createNodeBox(group, config, 92, 40);

      /* 节点类型名称 暂时不展示 */
      // group.addShape('text', {
      //   attrs: {
      //     text: isPre?''前体':'工序',
      //     x: 3,
      //     y: -10,
      //     fontSize: 12,
      //     textAlign: 'left',
      //     textBaseline: 'middle',
      //     fill: 'rgba(0,0,0,0.65)',
      //   },
      //   name: 'type-text-shape',
      // });

      /* 名称 */
      group.addShape('text', {
        attrs: {
          text: textEllipsis(cfg.label, 90),
          x: 19,
          y: 19,
          fontSize: 8,
          fontWeight: 700,
          textAlign: 'left',
          textBaseline: 'middle',
          fill: config.fontColor,
          cursor: 'pointer',
        },
        name: 'name-text-shape',
      });

      return container;
    },
  });
};
