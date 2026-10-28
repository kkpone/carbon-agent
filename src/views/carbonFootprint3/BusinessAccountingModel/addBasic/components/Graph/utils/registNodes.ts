/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-01 20:39:47
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-29 19:12:35
 */
import { G6 } from '@ant-design/charts';
import { Graph, IG6GraphEvent, IGroup, Util } from '@antv/g6';
import defaultImg from '@src/assets/svg/accountProductImg.svg';
import editImg from '@src/assets/svg/carbonFootprint/graph/edit.svg';
import addActiveImg from '@src/assets/svg/carbonFootprint/graph/graph_set_add_active_emission.svg';
import addImg from '@src/assets/svg/carbonFootprint/graph/graph_set_add_emission.svg';
import setMore from '@src/assets/svg/carbonFootprint/graph/graph_set_more.svg';
import IconFoldIn from '@src/assets/svg/icon_chevron_down.svg';
import IconFoldOut from '@src/assets/svg/icon_chevron_up.svg';
import transportSvg from '@src/assets/svg/transport.svg';
import warnImg from '@src/assets/svg/warn.svg';
import I18N from '@src/lang/I18N';
import {
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_REQUEST_STATE,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import {
  ALL_EMISSION,
  ALL_EMISSIONS_ICON_MAP,
  PROCESS_ACCOUNT_LIFE_CYCLE_ICON_MAP,
} from '@src/views/carbonFootprint3/constant';
import {
  CUSTOME_NODE_STATE,
  GRAPH_NODE_NAME,
  GRAPH_SHAPE_NAME,
  HoverGroupIds,
  PROCESS_ACCOUNT_NODE_INFO,
  PROCESS_MODEL_GROUP_NAMES,
  SHAPE_GEOMETRY_INFO,
  TEXT_COLOR,
} from '@src/views/carbonFootprint3/graph/constant';
import {
  calcTextWidthUseFontSize,
  textEllipsised,
} from '@src/views/carbonFootprint3/graph/utils';
import {
  isFold,
  isTopNode,
} from '@views/carbonFootprint3/BusinessAccountingModel/addBasic/components/Graph/utils';
import { slice } from 'lodash';

import {
  getPathWithBorderRadiusByPolyline,
  getPolylinePoints2,
  pathFinder,
  removeRedundantPoint,
} from './polyline-util';
import { NodeData } from '../types';

const {
  RECT_RADIUS,
  RECT_SMALL_RADIUS,
  RECT_BACKGROUND_COLOR,
  PROCESS_IMG_SIZE,
  PROCESS_EMISSION_IMG_SIZE,
  WARN_IMG_SIZE,
  WARN_MAIN_HEIGHT,
  WARN_MAIN_BACKGROUND,
  CHILD_MORE_RECT_WIDTH,
  CHILD_MORE_RECT_HEIGHT,
} = SHAPE_GEOMETRY_INFO;

const amount = I18N.carbonFootprint3.consumptionQuantity;

const tipText = I18N.carbonFootprint3.addInput2;

const { supplierData } = I18N.carbonFootprint3;

const warningText = I18N.carbonFootprint.emissionSources;

const { copy } = I18N.carbonFootprint;

const del = I18N.carbonFootprint.delete;

const getText = (isSave: boolean) =>
  isSave
    ? I18N.carbonFootprint3.savedToLibrary
    : I18N.carbonFootprint3.saveToLibrary;

const goInput = I18N.carbonFootprint3.goFillInTheForm;

const notInputText = (text: string) =>
  I18N.template(I18N.carbonFootprint3.thisText, { val1: text });

const kilometer = I18N.carbonFootprint3.kilometre;

const addNodeProcess = I18N.carbonFootprint3.addUnitOver;

const hasTransText = I18N.carbonFootprint3.includingTransportationEmissions;

export type CustomNodeState =
  | {
      hover?: boolean;
      hoverGroup?: string | null;
    }
  | undefined;

const addValue2Shape = <T = any, Value = any>(shapeCfg: T, value: Value) => ({
  ...shapeCfg,
  value,
});

const sliceString = (str: string, len: number) =>
  str.length > len ? `${str.slice(0, len)}...` : str;

export const setHoverState = (
  ev: IG6GraphEvent,
  graph: Graph,
  isEnter?: boolean,
) => {
  const { item } = ev;
  const parent = ev.target.cfg.parent as IGroup;
  const hasStateIds = Object.values(HoverGroupIds);

  const id = parent.cfg?.id;
  // 只处理已知的 hover 事件
  if (!item || !hasStateIds.includes(id)) return;
  // todo 目前无法找到item 实例，无法通过状态控制样式
  // children.forEach(shape => {
  //   // @ts-ignore
  //   // shape.attr.fill = isEnter
  //   //   ? TEXT_COLOR.PRIMARY_COLOR
  //   //   : TEXT_COLOR.THIRED_TEXT_COLOR;
  //   debugger;
  //   // graph.setItemState(shape, 'active', isEnter);

  // });

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
    // 过程核算弹出框特殊处理，离开添加内部的排放源和单元过程需要继续保持hover状态
    if (
      [
        HoverGroupIds.addEmission,
        HoverGroupIds.addUnit,
        HoverGroupIds.addSupply,
      ].includes(id)
    ) {
      graph.updateItem(item, {
        [CUSTOME_NODE_STATE]: {
          hoverGroup: HoverGroupIds.addExportGroup,
          hover: true,
        } as CustomNodeState,
      });
    } else {
      graph.updateItem(item, {
        [CUSTOME_NODE_STATE]: {
          hoverGroup: null,
          hover: true,
        } as CustomNodeState,
      });
    }
  }
};
/** 清除当前节点的hover状态 */
export const removeHoverState = (ev: IG6GraphEvent, graph: Graph) => {
  const { item } = ev;
  if (!item) return;
  graph.updateItem(item, {
    [CUSTOME_NODE_STATE]: {
      hoverGroup: null,
      hover: false,
    } as CustomNodeState,
  });
};
/** 顶级节点和生命周期节点  // NOTE 需求变动，以后所有的节点都是同样大小，这个函数始终返回false */
const testBigNode = (value: NodeData['value']) => value.orderNum === 1;
/** 返回卡片的宽度 */
const getNodeWidth = (value: NodeData['value']) => {
  // 单元过程要宽一点
  if (value.matchType === 1) {
    return PROCESS_ACCOUNT_NODE_INFO.NEW_LIFE_RECT_WIDTH;
  }
  return testBigNode(value)
    ? PROCESS_ACCOUNT_NODE_INFO.RECT_WIDTH
    : PROCESS_ACCOUNT_NODE_INFO.RECT_WIDTH;
};

/**
 * 获取信息框的高度，单元过程需要显示产出物，所以要动态计算产出物高度
 * @param value node节点信息
 * @param isOnlyDetail 是否是查看详情
 * @returns 计算后的高度
 */
const getInfoHeight = (value: NodeData['value'], isOnlyDetail?: boolean) => {
  const isShowFooter = value.matchType === 1;
  const hasTransportInfo = value.transTotal > 0 && value.type !== 7;
  const transportInfoHeight = hasTransportInfo ? 40 : 0;
  const isSupplier = value.matchType === MODEL_EMISSION_MATCH_WAY.SUPPLIER;
  const supplierHeight = isSupplier ? 30 : 0;
  const productNum = value.products ?? [];
  // 是否大于三个产出物
  const moreStatus = productNum.length > 3;
  // 产出物只展示三个
  const products = slice(productNum, 0, 3);
  const productNumHeight = products.length * 28;
  // 增加一个更多的展示高度
  const getEndProductHeight = moreStatus
    ? productNumHeight + 28
    : productNumHeight;

  return isShowFooter
    ? PROCESS_ACCOUNT_NODE_INFO.ROOT_RECT_HEIGHT +
        getEndProductHeight -
        (isOnlyDetail ? 30 : 0) +
        transportInfoHeight +
        supplierHeight
    : PROCESS_ACCOUNT_NODE_INFO.NO_FOOTER_ROOT_RECT_HEIGHT +
        8 +
        transportInfoHeight +
        supplierHeight;
};

// /** 排放源信息添加省略号 */
// export const getEmissionText = (
//   value: NodeData['value'],
//   type?: 'emissionNumber' | 'emissionName',
// ) =>
//   type === 'emissionName'
//     ? `${textEllipsised(value.name ?? '-', getNodeWidth(value) - 16 * 2)}`
//     : `${textEllipsised(
//         value.emissionTotal ?? '-',
//         getNodeWidth(value) -
//           16 * 2 -
//           (calcTextWidthUseFontSize('kgCO₂e', { fontSize: 16 }) || 88),
//       )} kgCO₂e`;

export const registerPolyline = () => {
  // 注册自定义边 折线
  G6.registerEdge(
    'polyline-self',
    {
      getPath: function getPath(
        points,
        source,
        target,
        radius,
        routeCfg,
        auto,
      ) {
        const { offset } = routeCfg;
        const { obstacles } = routeCfg;
        let { simple } = routeCfg;

        // 指定了控制点
        if (!offset || points.length > 2 || auto === false) {
          if (radius) {
            return getPathWithBorderRadiusByPolyline(points, radius);
          }
          const pathArray_1 = [];
          points.forEach((point, index) => {
            if (index === 0) {
              // @ts-ignore  // fixme copy from antv g6
              pathArray_1.push(['M', point.x, point.y]);
            } else {
              // @ts-ignore  // fixme copy from antv g6
              pathArray_1.push(['L', point.x, point.y]);
            }
          });
          return pathArray_1;
        }
        // 未指定控制点
        if (
          simple !== false &&
          !(obstacles === null || obstacles === undefined
            ? undefined
            : obstacles.length)
        )
          simple = true;

        let polylinePoints = simple
          ? getPolylinePoints2(
              points[points.length - 1],
              points[0],
              target,
              source,
              offset,
            )
          : pathFinder(
              points[0],
              points[points.length - 1],
              source,
              target,
              routeCfg,
            );

        if (!polylinePoints || !polylinePoints.length) return 'M0 0, L0 0';
        if (radius) {
          const res_1 = getPathWithBorderRadiusByPolyline(
            polylinePoints,
            radius,
          );
          return res_1;
        }
        // 去除连续同 x 不同 y 的中间点；去除连续同 y 不同 x 的中间点
        polylinePoints = removeRedundantPoint(polylinePoints);
        const res = Util.pointsToPolygon(polylinePoints);
        return res;
      },
    },
    'polyline',
  );
};

/**
 * 目前情况会出现多个鼠标移入grop状态，只要满足鼠标在这几个状态中，都是激活装填
 * @param hoverId 当前输入表移入的grop
 * @returns
 */
const activeByHoverIds = (hoverId?: string | null) => {
  if (!hoverId) return false;
  const ids: string[] = [
    HoverGroupIds.addEmission,
    HoverGroupIds.addExportGroup,
    HoverGroupIds.addUnit,
    HoverGroupIds.addSupply,
  ];
  if (ids.includes(hoverId)) return true;
  return false;
};

export const registerProcessAccountNode = (options?: {
  isProcess?: boolean;
  isOnlyDetail?: boolean;
  showTaskAction?: boolean;
}) => {
  registerPolyline();
  G6.registerNode(GRAPH_NODE_NAME.ROOT_NODE, {
    options: {
      visible: true,
    },
    setState(name, value, item) {
      if (
        !name ||
        ![
          ...Object.values(PROCESS_MODEL_GROUP_NAMES),
          ...Object.values(HoverGroupIds),
        ].includes(name)
      )
        return;
      const group = item?.getContainer();
      const children = group?.getChildren();
      // 查找当前操作的group
      const targetGroup = children?.find(g => g.get('id') === name);

      if (!targetGroup) return;

      if (name === PROCESS_MODEL_GROUP_NAMES.hoverGroup) {
        targetGroup.show();
      }

      // const foldIconEle = (targetGroup as IGroup)
      //   ?.getChildren()
      //   ?.find(e => e.cfg.name === GRAPH_SHAPE_NAME.FOLD_ICON);
      // if (foldIconEle) {
      //   foldIconEle.attr('img', !value ? IconFoldIn : IconFoldOut);
      // }
    },
    draw(cfg, group) {
      cfg = cfg!;
      group = group!;
      const { BASE_TOP_BACKGROUND_RECT } = GRAPH_SHAPE_NAME;

      const value = cfg.value as NodeData['value'];
      const customNodeState = cfg[CUSTOME_NODE_STATE] as CustomNodeState;
      /** 顶级节点和生命周期节点 */
      const isRootNode = isTopNode(value) && !options?.isProcess;
      const nodeSize = isRootNode
        ? PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH
        : getNodeWidth(value);
      // "matchType": 1, //匹配类型：0因子,1过程,2供应商
      // && !isTopNode(value);
      const isShowFooter = value.matchType === 1;

      // 数据是否填写完整
      const dataNotCompleted = !value.emissionTotal;

      // const wrapper = group.addShape(
      //   'rect',
      //   addValue2Shape(
      //     {
      //       name: GRAPH_SHAPE_NAME.BASE_RECT,
      //       value,
      //       attrs: {
      //         x: 0,
      //         y: 0,
      //         fill: RECT_BACKGROUND_COLOR,
      //         width: nodeSize,
      //         height: isRootNode
      //           ? PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_HEIGHT
      //           : footerHeight,
      //         radius: dataNotCompleted
      //           ? [RECT_RADIUS, RECT_RADIUS, 0, 0]
      //           : [RECT_RADIUS],
      //         shadowColor: '#0000000a',
      //         shadowOffsetY: 12,
      //         shadowOffsetX: 4,
      //         shadowBlur: 50,
      //       },
      //     },
      //     value,
      //   ),
      // );

      const wrapper = group.addShape(
        'rect',
        addValue2Shape(
          {
            name: GRAPH_SHAPE_NAME.BASE_RECT,
            value,
            attrs: {
              x: 0,
              y: 0,
              fill: '#FFF',
              width: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH,
              height: isRootNode
                ? PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_HEIGHT
                : getInfoHeight(value, options?.isOnlyDetail),
              radius: [RECT_RADIUS],
              shadowColor: '#0000000a',
              shadowOffsetY: 12,
              shadowOffsetX: 4,
              shadowBlur: 50,
            },
          },
          value,
        ),
      );

      const baseRootGroup = group.addGroup(
        addValue2Shape({ id: 'base-root-group' }, value),
      );
      const nameGroup = group.addGroup(
        addValue2Shape({ id: 'name-group' }, value),
      );
      const infoGroup = group.addGroup(
        addValue2Shape({ id: 'info-group' }, value),
      );

      if (cfg.value?.transTotal > 0 && cfg.value?.type !== 7) {
        // TODO: sunguangbiao 可视化模块改动内容
        const transportGroup = group.addGroup({
          id: 'transport-group',
          attrs: {
            opacity: 1,
          },
        });

        const isSupplier =
          value.matchType === MODEL_EMISSION_MATCH_WAY.SUPPLIER;
        transportGroup.translate(0, isSupplier ? 134 : 104);

        transportGroup.addShape('image', {
          name: 'transport-img',
          attrs: {
            x: 8,
            y: 8,
            width: 16,
            height: 16,
            img: transportSvg,
            cursor: 'pointer',
          },
        });

        transportGroup.addShape('text', {
          name: 'transport-text',
          attrs: {
            x: 26,
            y: 10,
            fill: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
            fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
            fontWeight: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_WEIGHT,
            text: hasTransText,
            textBaseline: 'top',
            cursor: 'pointer',
          },
        });

        const preTextWidth = calcTextWidthUseFontSize(hasTransText, {
          fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
        }) as number;
        transportGroup.addShape('text', {
          name: 'transport-number',
          attrs: {
            x: preTextWidth + 26,
            y: 10,
            fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
            fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
            fontWeight: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_WEIGHT,
            text: cfg.value.transTotal,
            textBaseline: 'top',
            cursor: 'pointer',
          },
        });

        const TextWidth = calcTextWidthUseFontSize(cfg.value.transTotal, {
          fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
        }) as number;

        transportGroup.addShape('text', {
          name: 'transport-unit',
          attrs: {
            x: TextWidth + preTextWidth + 26 + 4,
            y: 10,
            fill: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
            fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
            fontWeight: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_WEIGHT,
            text: 'kgCO₂e',
            textBaseline: 'top',
            cursor: 'pointer',
          },
        });
      }
      // const productGroup = group.addGroup(
      //   addValue2Shape({ id: 'product-group' }, value),
      // );
      const addExportGroup = group.addGroup(
        addValue2Shape(
          { id: 'add-export-group', visible: !options?.isOnlyDetail },
          value,
        ),
      );
      // const closeGroup = group.addGroup(
      //   addValue2Shape({ id: 'close-group' }, value),
      // );
      const foldGroup = group.addGroup(
        addValue2Shape({ id: GRAPH_SHAPE_NAME.FOLD_ICON }, value),
      );
      const hoverBorderGroup = group.addGroup(
        addValue2Shape(
          {
            id: 'border-group',

            visible: !!customNodeState?.hover,
          },
          value,
        ),
      );

      const hoverGroup = group.addGroup(
        addValue2Shape(
          {
            id: PROCESS_MODEL_GROUP_NAMES.hoverGroup,

            visible: activeByHoverIds(customNodeState?.hoverGroup),
          },
          value,
        ),
      );

      // const closeGroup = group.addGroup(
      //   addValue2Shape(
      //     {
      //       id: 'close-group',

      //       visible: !!customNodeState?.hover,
      //     },
      //     value,
      //   ),
      // );

      const setGroup = group.addGroup(
        addValue2Shape(
          {
            id: HoverGroupIds.childSetNode,

            visible: !!customNodeState?.hover,
          },
          value,
        ),
      );

      let consumption = `${amount}：${value.amount ?? '-'}${
        value.unitName || '-'
      }`;
      const { typeExtra } = value;

      // 运输消耗数量需要拼接里程
      if (
        value.type === ALL_EMISSION.TRANS &&
        typeExtra &&
        typeExtra.way !== 3
      ) {
        consumption = `${consumption} ${typeExtra.distance}${
          typeExtra.distUnitName || kilometer
        }`;
      }

      if (value.type === ALL_EMISSION.TRANS) {
        consumption = `${amount}: ${value.unitStr || '-'}`;
      }

      // 根节点root 单独样式
      if (isRootNode) {
        const rootTitleText = textEllipsised(value.name, 180);

        baseRootGroup.addShape('rect', {
          name: BASE_TOP_BACKGROUND_RECT,
          attrs: {
            x: 0,
            y: 4,
            width: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH,
            height: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_HEIGHT - 4,
            fill: RECT_BACKGROUND_COLOR,
            radius: [RECT_RADIUS],
          },
        });

        // 根节点图标组合 - 背景色和icon

        const image = new Image();
        image.src = value.productPic || defaultImg;
        baseRootGroup.addShape('image', {
          name: GRAPH_SHAPE_NAME.ICON_IMG,
          attrs: {
            x: 16,
            y: 16,
            width: 32,
            height: 32,
            img: image,
          },
        });

        // editIcon - 编辑图标
        const editImage = new Image();
        editImage.src = editImg;
        group.addShape('image', {
          id: GRAPH_SHAPE_NAME.ACCOUNT_EDIT_ICON,
          name: GRAPH_SHAPE_NAME.ACCOUNT_EDIT_ICON,
          attrs: {
            x: 240,
            y: 16,
            cursor: 'pointer',
            img: editImage,
          },
        });
        // image.onload = () => {
        //   baseRootGroup.addShape('image', {
        //     name: GRAPH_SHAPE_NAME.ICON_IMG,
        //     attrs: {
        //       x: 16,
        //       y: 16,
        //       width: ROOT_IMG_SIZE,
        //       height: ROOT_IMG_SIZE,
        //       img: image,
        //     },
        //   });
        // };

        // root - 信息框
        baseRootGroup.addShape('rect', {
          name: GRAPH_SHAPE_NAME.INFO_RECT,
          attrs: {
            x: 4,
            y: 10,
            fill: 'transparent',
            cursor: 'pointer',
            width: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH,
            height: 78,
          },
        });

        // root-功能单位标题
        nameGroup.addShape('text', {
          name: GRAPH_SHAPE_NAME.NAME_TEXT,
          attrs: {
            x: 16 + 40 + 8,
            y: 30,
            fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
            fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
            fontWeight: SHAPE_GEOMETRY_INFO.TEXT_WEIGHT,
            text: rootTitleText,
            textBaseline: 'top',
          },
        });

        // root - 排放量
        const baseRootIEmissionTotalText = value.emissionTotal ?? '-';
        const baseRootEmissionTotalTextWidth = calcTextWidthUseFontSize(
          baseRootIEmissionTotalText,
          { fontSize: 20 },
        ) as number;
        infoGroup.addShape('text', {
          name: GRAPH_SHAPE_NAME.INFO_TEXT,
          attrs: {
            x: 16,
            y: 50 + 15,
            cursor: 'pointer',
            fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
            fontSize: 20,
            fontWeight: SHAPE_GEOMETRY_INFO.TEXT_WEIGHT,
            text: textEllipsised(baseRootIEmissionTotalText, 180),
            textBaseline: 'top',
          },
        });

        baseRootGroup.addShape('text', {
          name: GRAPH_SHAPE_NAME.INFO_TEXT,
          attrs: {
            x: baseRootEmissionTotalTextWidth + 20,
            y: 50 + 15 + 4,
            fill: SHAPE_GEOMETRY_INFO.LOW_TEXT_COLOR,
            fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
            fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
            text: 'kgCO₂e',
            textBaseline: 'top',
            cursor: 'pointer',
          },
        });

        // root - 产出物按钮
        // productGroup.addShape('rect', {
        //   name: GRAPH_SHAPE_NAME.PRODUCT_INFO,
        //   attrs: {
        //     x: 0,
        //     y: 76,
        //     width: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH,
        //     height: 30,
        //     fill: PROCESS_ACCOUNT_NODE_INFO.BORDER_COLOR,
        //     cursor: 'pointer',
        //   },
        // });
        // 产品先注释掉
        // productGroup.addShape('text', {
        //   name: GRAPH_SHAPE_NAME.PRODUCT_INFO,
        //   attrs: {
        //     x: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH / 2,
        //     y: 80,
        //     width: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH,
        //     height: 30,
        //     fill: PROCESS_ACCOUNT_NODE_INFO.SECONDARY_TEXT_COLOR,
        //     fontSize: PROCESS_ACCOUNT_NODE_INFO.SECONDARY_TEXT_SIZE,
        //     fontWeight: PROCESS_ACCOUNT_NODE_INFO.SECONDARY_TEXT_WEIGHT,
        //     text: '产品',
        //     cursor: 'pointer',
        //     textBaseline: 'top',
        //     textAlign: 'center',
        //   },
        // });
      } else {
        // 是单元过程
        if (value.matchType === 1) {
          // 信息框
          infoGroup.addShape('rect', {
            name: GRAPH_SHAPE_NAME.INFO_RECT,
            attrs: {
              x: 0,
              y: 4,
              fill: RECT_BACKGROUND_COLOR,
              cursor: 'pointer',
              width: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH,
              height: getInfoHeight(value, options?.isOnlyDetail) - 4,
              radius: [RECT_RADIUS],
            },
          });
          // 生命周期图标
          infoGroup.addShape('image', {
            name: GRAPH_SHAPE_NAME.TOOLTIP_ICON,
            attrs: {
              x: 8,
              y: 10,
              width: 14,
              height: 14,
              img: PROCESS_ACCOUNT_LIFE_CYCLE_ICON_MAP[value.type],
            },
          });

          // 生命周期标题
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.NAME_TEXT,
            attrs: {
              x: 8 + PROCESS_IMG_SIZE + 8,
              y: 10,
              fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
              fontWeight: SHAPE_GEOMETRY_INFO.TEXT_WEIGHT,
              text: textEllipsised(value.name, 180),
              textBaseline: 'top',
            },
          });
          // 生命周期 - 排放量
          const lifeCycleEmissionTotalText = value.emissionTotal ?? '-';
          const lifeCycleEmissionTotalTextWidth = calcTextWidthUseFontSize(
            lifeCycleEmissionTotalText,
            { fontSize: 16 },
          ) as number;
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: 20,
              y: 40,
              cursor: 'pointer',
              fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.EMISSION_TOTAL_TEXT,
              fontWeight: SHAPE_GEOMETRY_INFO.TEXT_WEIGHT,
              text: textEllipsised(lifeCycleEmissionTotalText, 180),
              textBaseline: 'top',
            },
          });
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: lifeCycleEmissionTotalTextWidth + 24,
              y: 40 + 1,
              fill: SHAPE_GEOMETRY_INFO.LOW_TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
              fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
              text: 'kgCO₂e',
              textBaseline: 'top',
              cursor: 'pointer',
            },
          });

          // 产出物信息循环展示出来
          if (value.products && value.products.length > 0) {
            // 是否大于三个产出物
            const moreStatus = value.products.length > 3;
            // 产出物只展示三个
            const products = slice(value.products, 0, 3);

            products.forEach((product, productIndex) => {
              const productEmissionTotalText = product.emissionTotal ?? '-';
              const productEmissionTotalTextWidth = calcTextWidthUseFontSize(
                productEmissionTotalText,
                { fontSize: 12 },
              ) as number;
              const everyHeight = 80 + productIndex * 30;
              infoGroup.addShape('rect', {
                name: GRAPH_SHAPE_NAME.INFO_RECT,
                attrs: {
                  x: 20,
                  y: everyHeight,
                  width: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH - 30,
                  height: 30,
                  fill: 'transparent',
                  cursor: 'pointer',
                },
              });
              infoGroup.addShape('text', {
                name: GRAPH_SHAPE_NAME.INFO_RECT,
                attrs: {
                  x: 20,
                  y: everyHeight,
                  fill: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
                  fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
                  fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
                  text: textEllipsised(product.name, 110),
                  textBaseline: 'top',
                  cursor: 'pointer',
                },
              });
              infoGroup.addShape('text', {
                name: GRAPH_SHAPE_NAME.INFO_RECT,
                attrs: {
                  x: 110,
                  y: everyHeight,
                  fill: TEXT_COLOR.TEXT_COLOR,
                  fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
                  fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
                  text: textEllipsised(productEmissionTotalText, 90),
                  textBaseline: 'top',
                  cursor: 'pointer',
                },
              });
              infoGroup.addShape('text', {
                name: GRAPH_SHAPE_NAME.INFO_RECT,
                attrs: {
                  x: 110 + productEmissionTotalTextWidth + 4,
                  y: everyHeight,
                  fill: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
                  fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
                  fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
                  text: 'kgCO₂e',
                  textBaseline: 'top',
                  cursor: 'pointer',
                },
              });
            });

            // 产出物如果有更多
            if (moreStatus) {
              infoGroup.addShape('text', {
                name: GRAPH_SHAPE_NAME.INFO_RECT,
                attrs: {
                  x: 100,
                  y: 80 + products.length * 30,
                  fill: TEXT_COLOR.SECONDARY_TEXT_COLOR,
                  fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
                  fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
                  text: I18N.carbonFootprint3.moreOutput,
                  textBaseline: 'top',
                  cursor: 'pointer',
                },
              });
            }
          }
        } else if (value.matchType === MODEL_EMISSION_MATCH_WAY.SUPPLIER) {
          // 发起收数
          const getSupplierHeight = () => {
            // 等待供应商回复
            if (value.requestState === MODEL_EMISSION_REQUEST_STATE.WAITING) {
              return PROCESS_ACCOUNT_NODE_INFO.EMISSION_CHILD_RECT_HEIGHT + 10;
            }

            return (
              PROCESS_ACCOUNT_NODE_INFO.EMISSION_CHILD_RECT_HEIGHT + 10 + 24
            );
          };
          const supplierReplyText = value.matchName || '-';
          const supplierReplyTextLen = 15;

          const consumptionLen = 20;
          // 信息框
          infoGroup.addShape('rect', {
            name: GRAPH_SHAPE_NAME.INFO_RECT,
            attrs: {
              x: 0,
              y: 4,
              fill: (
                ALL_EMISSIONS_ICON_MAP[value.type] as {
                  ICON: string;
                  FILL: string;
                }
              ).FILL,
              cursor: 'pointer',
              width: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH,
              height:
                value.requestState === MODEL_EMISSION_REQUEST_STATE.WAITING
                  ? PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_HEIGHT + 10
                  : PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_HEIGHT + 30,
              radius: [RECT_RADIUS],
            },
          });
          infoGroup.addShape('rect', {
            name: GRAPH_SHAPE_NAME.INFO_RECT,
            attrs: {
              x: 8,
              y: 30,
              fill: '#fff',
              width: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH - 16,
              height: getSupplierHeight(),
              radius: [RECT_RADIUS],
              cursor: 'pointer',
            },
          });
          // 发起收数标题
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.NAME_TEXT,
            attrs: {
              x: 8,
              y: 9,
              fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
              fontWeight: SHAPE_GEOMETRY_INFO.TEXT_WEIGHT,
              text: textEllipsised(value.name, 180),
              textBaseline: 'top',
            },
          });

          // 排放源相关图标
          infoGroup.addShape('image', {
            name: GRAPH_SHAPE_NAME.TOOLTIP_ICON,
            attrs: {
              x: 16,
              y: 60,
              width: PROCESS_EMISSION_IMG_SIZE,
              height: PROCESS_EMISSION_IMG_SIZE,
              img: (
                ALL_EMISSIONS_ICON_MAP[value.type] as {
                  ICON: string;
                  FILL: string;
                }
              ).ICON,
            },
          });

          // 仅保存
          if (value.requestState === MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT) {
            infoGroup.addShape('text', {
              name: GRAPH_SHAPE_NAME.INFO_TEXT,
              attrs: {
                x: 50 + 8,
                y: 46,
                fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
                fontSize: SHAPE_GEOMETRY_INFO.WAIT_SUPPLIER_REPLY_TEXT,
                fontWeight: SHAPE_GEOMETRY_INFO.TEXT_WEIGHT,
                text: '-',
                textBaseline: 'top',
                cursor: 'pointer',
              },
            });
            infoGroup.addShape('text', {
              name: GRAPH_SHAPE_NAME.INFO_TEXT,
              attrs: {
                x: 14 + 50 + 8 + 5,
                y: 48,
                fill: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
                fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
                fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
                text: 'kgCO₂e',
                textBaseline: 'top',
                cursor: 'pointer',
              },
            });

            infoGroup.addShape('text', {
              name: GRAPH_SHAPE_NAME.INFO_TEXT,
              attrs: {
                x: 50 + 8,
                y: 70,
                fill: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
                fontSize: 12,
                fontWeight: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_WEIGHT,
                text:
                  consumption.length > consumptionLen
                    ? sliceString(consumption, consumptionLen)
                    : consumption,
                tooltipText: consumption,
                showTooltip: consumption?.length > consumptionLen,
                textBaseline: 'top',
              },
            });

            // 供应商
            infoGroup.addShape('text', {
              name: GRAPH_SHAPE_NAME.INFO_TEXT,
              attrs: {
                x: 50 + 8,
                y: 70 + 24,
                fill: TEXT_COLOR.THIRED_TEXT_COLOR,
                fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
                fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
                text:
                  supplierReplyText.length > supplierReplyTextLen
                    ? sliceString(supplierReplyText, supplierReplyTextLen)
                    : supplierReplyText,
                tooltipText: supplierReplyText,
                showTooltip: supplierReplyText.length > supplierReplyTextLen,
                textBaseline: 'top',
                cursor: 'pointer',
              },
            });
          }

          // 等待供应商回复
          if (value.requestState === MODEL_EMISSION_REQUEST_STATE.WAITING) {
            infoGroup.addShape('text', {
              name: GRAPH_SHAPE_NAME.INFO_TEXT,
              attrs: {
                x: 50 + 8,
                y: 46,
                fill: SHAPE_GEOMETRY_INFO.WAIT_SUPPLIER_REPLY_TEXT_COLOR,
                fontSize: SHAPE_GEOMETRY_INFO.WAIT_SUPPLIER_REPLY_TEXT,
                fontWeight: SHAPE_GEOMETRY_INFO.WAIT_SUPPLIER_REPLY_TEXT_WEIGHT,
                text: I18N.carbonFootprint3.waitingForSuppliers,
                textBaseline: 'top',
                cursor: 'pointer',
              },
            });

            infoGroup.addShape('text', {
              name: GRAPH_SHAPE_NAME.INFO_TEXT,
              attrs: {
                x: 50 + 8,
                y: 46 + 16 + 8,
                fill: TEXT_COLOR.THIRED_TEXT_COLOR,
                fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
                fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
                text:
                  supplierReplyText.length > supplierReplyTextLen
                    ? sliceString(supplierReplyText, supplierReplyTextLen)
                    : supplierReplyText,
                tooltipText: supplierReplyText,
                showTooltip: supplierReplyText.length > supplierReplyTextLen,
                textBaseline: 'top',
                cursor: 'pointer',
              },
            });
          }

          // 审核完成
          if (value.requestState === MODEL_EMISSION_REQUEST_STATE.AUDITED) {
            const infoText = value.emissionTotal || '-';
            const infoTextLen = 13;
            const infoTextSlice =
              infoText.length > infoTextLen
                ? sliceString(infoText, infoTextLen)
                : infoText;
            const totalTextWidth = calcTextWidthUseFontSize(infoTextSlice, {
              fontSize: SHAPE_GEOMETRY_INFO.WAIT_SUPPLIER_REPLY_TEXT,
            }) as number;
            infoGroup.addShape('text', {
              name: GRAPH_SHAPE_NAME.INFO_TEXT,
              attrs: {
                x: 50 + 8,
                y: 46,
                fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
                fontSize: SHAPE_GEOMETRY_INFO.WAIT_SUPPLIER_REPLY_TEXT,
                fontWeight: SHAPE_GEOMETRY_INFO.TEXT_WEIGHT,
                text: infoTextSlice,
                tooltipText: infoText,
                showTooltip: infoText.length > infoTextLen,
                textBaseline: 'top',
                cursor: 'pointer',
              },
            });
            infoGroup.addShape('text', {
              name: GRAPH_SHAPE_NAME.INFO_TEXT,
              attrs: {
                x: totalTextWidth + 50 + 8 + 5,
                y: 48,
                fill: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
                fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
                fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
                text: 'kgCO₂e',
                textBaseline: 'top',
                cursor: 'pointer',
              },
            });
            // 消耗数量
            infoGroup.addShape('text', {
              name: GRAPH_SHAPE_NAME.INFO_TEXT,
              attrs: {
                x: 50 + 8,
                y: 70,
                fill: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
                fontSize: 12,
                fontWeight: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_WEIGHT,
                text:
                  consumption.length > consumptionLen
                    ? sliceString(consumption, consumptionLen)
                    : consumption,
                tooltipText: consumption,
                showTooltip: consumption?.length > consumptionLen,
                textBaseline: 'top',
              },
            });
            // 供应商
            infoGroup.addShape('text', {
              name: GRAPH_SHAPE_NAME.INFO_TEXT,
              attrs: {
                x: 50 + 8,
                y: 70 + 24,
                fill: TEXT_COLOR.THIRED_TEXT_COLOR,
                fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
                fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
                text:
                  supplierReplyText.length > supplierReplyTextLen
                    ? sliceString(supplierReplyText, supplierReplyTextLen)
                    : supplierReplyText,
                tooltipText: supplierReplyText,
                showTooltip: supplierReplyText.length > supplierReplyTextLen,
                textBaseline: 'top',
                cursor: 'pointer',
              },
            });
          }
          const supplierReplyTagHeight =
            value.requestState === MODEL_EMISSION_REQUEST_STATE.WAITING
              ? 70 + 24
              : 70 + 24 + 24;
          const supplierReplyTagTextHeight =
            value.requestState === MODEL_EMISSION_REQUEST_STATE.WAITING
              ? 70 + 24 + 4
              : 70 + 24 + 4 + 24;

          infoGroup.addShape('rect', {
            name: `${GRAPH_SHAPE_NAME.INFO_TEXT}_supplierReply_tag`,
            attrs: {
              x: 50 + 8,
              y: supplierReplyTagHeight,
              fill: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_TAGS_FILL_COLOR,
              width: 86,
              height: 20,
              stroke: '#b0ddffff',
              lineDash: [],
              radius: [4],
            },
          });
          infoGroup.addShape('text', {
            name: `${GRAPH_SHAPE_NAME.BASE_ROOT_RECT}_title_tag_text`,
            attrs: {
              x: 50 + 8 + 4,
              y: supplierReplyTagTextHeight,
              width: 60,
              height: 20,
              fill: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_TAGS_FONT_COLOR,
              fontSize: 12,
              text: supplierData,
              textBaseline: 'top',
              stroke: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_TAGS_FILL_COLOR,
            },
          });
        } else {
          // 信息框
          infoGroup.addShape('rect', {
            name: GRAPH_SHAPE_NAME.INFO_RECT,
            attrs: {
              x: 0,
              y: 4,
              fill: (
                ALL_EMISSIONS_ICON_MAP[value.type] as {
                  ICON: string;
                  FILL: string;
                }
              ).FILL,
              cursor: 'pointer',
              width: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH,
              height: PROCESS_ACCOUNT_NODE_INFO.ROOT_RECT_HEIGHT,
              radius: [RECT_RADIUS],
            },
          });
          infoGroup.addShape('rect', {
            name: GRAPH_SHAPE_NAME.INFO_RECT,
            attrs: {
              x: 8,
              y: 30,
              fill: '#fff',
              width: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH - 16,
              height: PROCESS_ACCOUNT_NODE_INFO.EMISSION_CHILD_RECT_HEIGHT,
              radius: [RECT_RADIUS],
              cursor: 'pointer',
            },
          });

          // 排放源标题
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.NAME_TEXT,
            attrs: {
              x: 8,
              y: 9,
              fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
              fontWeight: SHAPE_GEOMETRY_INFO.TEXT_WEIGHT,
              text: textEllipsised(value.name, 180),
              textBaseline: 'top',
            },
          });

          // 排放源相关图标
          infoGroup.addShape('image', {
            name: GRAPH_SHAPE_NAME.TOOLTIP_ICON,
            attrs: {
              x: 16,
              y: 60,
              width: PROCESS_EMISSION_IMG_SIZE,
              height: PROCESS_EMISSION_IMG_SIZE,
              img: (
                ALL_EMISSIONS_ICON_MAP[value.type] as {
                  ICON: string;
                  FILL: string;
                }
              ).ICON,
            },
          });
          const emissionText = value.emissionTotal ?? '-';
          const EmissionTotalTextWidth = calcTextWidthUseFontSize(
            emissionText,
            { fontSize: 16 },
          ) as number;
          // 排放量
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: 16 + 20 + 16,
              y: 50,
              cursor: 'pointer',
              fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.EMISSION_TOTAL_TEXT,
              fontWeight: SHAPE_GEOMETRY_INFO.TEXT_WEIGHT,
              text: textEllipsised(emissionText, 150),
              textBaseline: 'top',
            },
          });
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: EmissionTotalTextWidth + 16 + 20 + 16 + 4,
              y: 50,
              fill: SHAPE_GEOMETRY_INFO.LOW_TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
              fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
              text: 'kgCO₂e',
              textBaseline: 'top',
              cursor: 'pointer',
            },
          });
          // 名称
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.EMISSION_NAME,
            attrs: {
              x: 16 + 20 + 16,
              y: 60 + 20,
              cursor: 'pointer',
              fill: '#999EA4',
              fontSize: 12,
              fontWeight: PROCESS_ACCOUNT_NODE_INFO.SECONDARY_TEXT_WEIGHT,
              text: textEllipsised(consumption, 150),
              textBaseline: 'top',
            },
          });
        }

        // 单元过程没有黄色警告文字提示
        if (
          dataNotCompleted &&
          value.matchType !== MODEL_EMISSION_MATCH_WAY.SUPPLIER &&
          !options?.isProcess &&
          !value.processId
        ) {
          // nameGroup.addShape('image', {
          //   name: GRAPH_SHAPE_NAME.TOOLTIP_ICON,
          //   attrs: {
          //     x:
          //       textPositionX +
          //       Number(
          //         calcTextWidthUseFontSize(
          //           value.matchType === 1 ? '单元过程' : value.title,
          //           {
          //             fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
          //           },
          //         ),
          //       ) +
          //       10,
          //     y: 11,
          //     width: PROCESS_ACCOUNT_NODE_INFO.WARN_IMG_SIZE,
          //     height: PROCESS_ACCOUNT_NODE_INFO.WARN_IMG_SIZE,
          //     img: warnImg,
          //   },
          // });
          // 底部填写信息提示
          nameGroup.addShape('rect', {
            name: GRAPH_SHAPE_NAME.INFO_RECT,
            attrs: {
              x: 0,
              y: getInfoHeight(value),
              width: nodeSize,
              height: WARN_MAIN_HEIGHT,
              fill: WARN_MAIN_BACKGROUND,
              cursor: 'pointer',
              radius: [0, 0, 4, 4],
              shadowColor: '#0000000a',
              shadowOffsetY: 12,
              shadowOffsetX: 4,
              shadowBlur: 50,
            },
          });
          nameGroup.addShape('image', {
            name: GRAPH_SHAPE_NAME.ICON_IMG,
            attrs: {
              x: 5,
              y: getInfoHeight(value) + 5,
              width: WARN_IMG_SIZE,
              height: WARN_IMG_SIZE,
              img: warnImg,
            },
          });
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: 24,
              y: getInfoHeight(value) + 5,
              fill: '#fba93eff',
              fontSize: 12,
              text: notInputText(warningText),
              textBaseline: 'top',
              cursor: 'pointer',
            },
          });
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: 148,
              y: getInfoHeight(value) + 5,
              fill: '#fba93eff',
              fontSize: 12,
              fontWeight: 600,
              text: goInput,
              textBaseline: 'top',
              cursor: 'pointer',
            },
          });
        }

        // orderNum : 1 顶级节点，0 非顶级
        if (value.orderNum !== 1 && !options?.isOnlyDetail) {
          //  右上角删除按钮
          // closeGroup.addShape('image', {
          //   name: GRAPH_SHAPE_NAME.ICON_CLOSE,
          //   attrs: {
          //     x: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH - 20 - 8,
          //     y: 10,
          //     width: PROCESS_ACCOUNT_NODE_INFO.CLOSE_ICON_SIZE,
          //     height: PROCESS_ACCOUNT_NODE_INFO.CLOSE_ICON_SIZE,
          //     img: closeIcon,
          //     cursor: 'pointer',
          //     description: 'xass ',
          //   },
          // });

          setGroup.addShape('rect', {
            name: GRAPH_SHAPE_NAME.SET_MORE_RECT,
            attrs: {
              x: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH - 30,
              y: 6,
              fill:
                customNodeState?.hoverGroup === HoverGroupIds.childSetNode
                  ? '#fff'
                  : 'transparent',
              width: 20,
              height: 20,
              radius: [RECT_SMALL_RADIUS],
              cursor: 'pointer',
            },
          });

          // 操作聚集按钮
          setGroup.addShape('image', {
            name: GRAPH_SHAPE_NAME.SET_MORE_IMG,
            attrs: {
              x: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH - 20 - 8,
              y: 8,
              width: PROCESS_ACCOUNT_NODE_INFO.CLOSE_ICON_SIZE,
              height: PROCESS_ACCOUNT_NODE_INFO.CLOSE_ICON_SIZE,
              img: setMore,
              cursor: 'pointer',
            },
          });

          // console.log(customNodeState?.hoverGroup, HoverGroupIds.childSetNode);

          const setChildGroup = group.addGroup({
            id: 'set-more-group',
            visible: customNodeState?.hoverGroup === HoverGroupIds.childSetNode,
          });
          // 过程库 不需要保存到库
          const isProcessLib = options?.isProcess;
          // 发起收数不需要保存到库
          const isSupplier =
            value.matchType === MODEL_EMISSION_MATCH_WAY.SUPPLIER;
          const noSaveStore = isSupplier || isProcessLib;
          const showTaskAction = Boolean(options?.showTaskAction);

          // 发起收数隐藏保存到库功能
          const getSetGroupHeight = noSaveStore
            ? CHILD_MORE_RECT_HEIGHT - 40
            : CHILD_MORE_RECT_HEIGHT + 10;

          // 过程库的高度要单独处理
          const changeTypeHeight = isProcessLib
            ? getSetGroupHeight + 20
            : CHILD_MORE_RECT_WIDTH;

          const SetBtnsOffsetX =
            PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH - 25;

          setChildGroup.addShape('rect', {
            name: GRAPH_SHAPE_NAME.SET_MORE_IMG,
            attrs: {
              x: SetBtnsOffsetX - 5,
              y: 10,
              width: CHILD_MORE_RECT_WIDTH + 10,
              height: noSaveStore
                ? CHILD_MORE_RECT_WIDTH - 20 + (showTaskAction ? 32 : 0)
                : changeTypeHeight + 10 + (showTaskAction ? 32 : 0),
              fill: 'transparent',
            },
          });
          setChildGroup.addShape('rect', {
            name: GRAPH_SHAPE_NAME.SET_MORE_IMG,
            attrs: {
              x: SetBtnsOffsetX,
              y: 24 + 4,
              width: CHILD_MORE_RECT_WIDTH,
              height: noSaveStore
                ? CHILD_MORE_RECT_WIDTH - 20 + (showTaskAction ? 32 : 0)
                : changeTypeHeight + 10 + (showTaskAction ? 32 : 0),
              fill: '#fff',
              radius: [RECT_SMALL_RADIUS],
              shadowColor: '#0000000a',
              shadowOffsetY: 12,
              shadowOffsetX: 4,
              shadowBlur: 50,
            },
          });

          setChildGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.COPY_TEXT,
            attrs: {
              x: SetBtnsOffsetX + 8 + 8,
              y: 24 + 4 + 8 + 8,
              fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
              fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
              text: copy,
              cursor: 'pointer',
              textBaseline: 'top',
            },
          });

          // 不是供应商 才允许保存到库
          if (!noSaveStore) {
            // 是否保存到库
            const isSave = value.libState === 1;
            setChildGroup.addShape('text', {
              name: GRAPH_SHAPE_NAME.SAVE_STORE_TEXT,
              attrs: {
                x: SetBtnsOffsetX + 8 + 8,
                y: 24 + 4 + 8 + 40,
                fill: isSave
                  ? SHAPE_GEOMETRY_INFO.DISABLED_TEXT_COLOR
                  : SHAPE_GEOMETRY_INFO.TEXT_COLOR,
                fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
                fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
                text: getText(isSave),
                cursor: isSave ? 'not-allowed' : 'pointer',
                textBaseline: 'top',
              },
            });
          }

          if (showTaskAction) {
            setChildGroup.addShape('text', {
              name: GRAPH_SHAPE_NAME.CREATE_TASK_TEXT,
              attrs: {
                x: SetBtnsOffsetX + 8 + 8,
                y: noSaveStore ? 24 + 4 + 8 + 40 : 24 + 4 + 8 + 40 + 32,
                fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
                fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
                fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
                text: I18N.carbonAgent.projectTaskCreateAction,
                cursor: 'pointer',
                textBaseline: 'top',
              },
            });
          }

          setChildGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.ICON_CLOSE,
            attrs: {
              x: SetBtnsOffsetX + 8 + 8,
              y:
                (noSaveStore ? 24 + 4 + 8 + 40 : 24 + 4 + 8 + 40 + 32) +
                (showTaskAction ? 32 : 0),
              fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
              fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
              text: del,
              cursor: 'pointer',
              textBaseline: 'top',
            },
          });
        }

        // 添加没有填写排放源信息导致的边框计算问题
        const greenBorderHeight = isShowFooter
          ? getInfoHeight(value) + 4
          : PROCESS_ACCOUNT_NODE_INFO.NO_FOOTER_ROOT_RECT_HEIGHT + 4;
        const dataNotCompletedBorder = WARN_MAIN_HEIGHT + greenBorderHeight;

        if (isShowFooter) {
          // 顶级节点不展示添加排放源等
          if (!isRootNode && !options?.isOnlyDetail) {
            // 悬浮增加绿色的边框
            hoverBorderGroup.addShape('rect', {
              name: 'hover-group-gap-base-rect',
              attrs: {
                value,
                x: -2,
                y: -2,
                width: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH + 4,
                height:
                  dataNotCompleted &&
                  !options?.isProcess &&
                  value.matchType !== MODEL_EMISSION_MATCH_WAY.SUPPLIER
                    ? dataNotCompletedBorder
                    : greenBorderHeight,
                radius: [RECT_RADIUS],
                stroke: '#0CBF9F',
                lineDash: [],
                lineWidth: 2,
              },
            });

            // 悬浮功能框 - 透明
            hoverGroup.addShape('rect', {
              name: 'hover-group-gap',
              attrs: {
                x: nodeSize / 2 + 20,
                y: getInfoHeight(value) - 10,
                // 宽一点  防止误触闪烁
                width: 180,
                height: 100,
                fill: 'transparent',
              },
            });

            hoverGroup.addShape('rect', {
              name: 'hover-group-gap-main',
              attrs: {
                x: nodeSize / 2 + 40,
                y: getInfoHeight(value) - 5,
                width: 160,
                height: 70,
                fill: '#fff',
                radius: [4],
                shadowColor: '#0000000a',
                shadowOffsetY: -10,
                shadowOffsetX: 4,
                shadowBlur: 100,
              },
            });

            const addEmissionGroup = hoverGroup.addGroup({
              id: HoverGroupIds.addEmission,
            });
            const addUnitGroup = hoverGroup.addGroup({
              id: HoverGroupIds.addUnit,
            });
            // const supplyGroup = hoverGroup.addGroup({
            //   id: HoverGroupIds.addSupply,
            // });
            addEmissionGroup.addShape('text', {
              name: GRAPH_SHAPE_NAME.ADD_EMISSION_TEXT,
              attrs: {
                x: nodeSize / 2 + 40 + 8,
                y: getInfoHeight(value) + 8,
                fill:
                  customNodeState?.hoverGroup === HoverGroupIds.addEmission
                    ? TEXT_COLOR.PRIMARY_COLOR
                    : TEXT_COLOR.TEXT_COLOR,
                fontSize: 14,
                textBaseline: 'top' as const,
                fontWeight: 400,
                cursor: 'pointer',
                text: I18N.carbonFootprint.addEmissionSources,
              },
            });
            addUnitGroup.addShape('text', {
              name: GRAPH_SHAPE_NAME.ADD_UNIT_TEXT,
              attrs: {
                x: nodeSize / 2 + 40 + 8,
                y: getInfoHeight(value) + 8 + 28,
                fill:
                  customNodeState?.hoverGroup === HoverGroupIds.addUnit
                    ? TEXT_COLOR.PRIMARY_COLOR
                    : TEXT_COLOR.TEXT_COLOR,
                fontSize: 14,
                textBaseline: 'top' as const,
                fontWeight: 400,
                cursor: 'pointer',
                text: addNodeProcess,
              },
            });
            if (!options?.isProcess) {
              // 供应商数据
              // supplyGroup.addShape('text', {
              //   name: GRAPH_SHAPE_NAME.ADD_SUPPLY_TEXT,
              //   attrs: {
              //     x: nodeSize / 2 + 10 + 8,
              //     y: getInfoHeight(value) + 8 + 28 + 28,
              //     fill:
              //       customNodeState?.hoverGroup === HoverGroupIds.addSupply
              //         ? TEXT_COLOR.PRIMARY_COLOR
              //         : TEXT_COLOR.TEXT_COLOR,
              //     fontSize: 14,
              //     textBaseline: 'top' as const,
              //     fontWeight: 400,
              //     cursor: 'pointer',
              //     text: '发起收数',
              //   },
              // });
            }
          }

          // productGroup.addShape('rect', {
          //   name: GRAPH_SHAPE_NAME.OUTPUT_INFO,
          //   attrs: {
          //     width: nodeSize / 2,
          //     height: 24,
          //     x: 16,
          //     y: getInfoHeight(value) - 30,
          //     stroke: PROCESS_ACCOUNT_NODE_INFO.BORDER_COLOR,
          //     fill: PROCESS_ACCOUNT_NODE_INFO.BORDER_COLOR,
          //     cursor: 'pointer',
          //   },
          // });
          // productGroup.addShape('text', {
          //   name: GRAPH_SHAPE_NAME.OUTPUT_INFO,
          //   attrs: {
          //     width: nodeSize,
          //     height: 24,
          //     x: nodeSize / 2 - 12,
          //     y: getInfoHeight(value) - 30,
          //     fill: PROCESS_ACCOUNT_NODE_INFO.SECONDARY_TEXT_COLOR,
          //     fontSize: PROCESS_ACCOUNT_NODE_INFO.SECONDARY_TEXT_SIZE,
          //     fontWeight: PROCESS_ACCOUNT_NODE_INFO.SECONDARY_TEXT_WEIGHT,
          //     text: '产出物',
          //     cursor: 'pointer',
          //     textBaseline: 'top',
          //   },
          // });
          addExportGroup.addShape('rect', {
            name: GRAPH_SHAPE_NAME.ADD_EXPORT_SET,
            attrs: {
              x: 8,
              y: getInfoHeight(value) - 30,
              width: nodeSize,
              height: 40,
              cursor: 'pointer',
              fill: 'transparent',
              radius: [4],
            },
          });

          addExportGroup.addShape('image', {
            name: GRAPH_SHAPE_NAME.ADD_EXPORT_SET,
            attrs: {
              x: nodeSize / 2 - 22 - 20,
              y: getInfoHeight(value) - 25,
              width: 16,
              height: 16,
              img: activeByHoverIds(customNodeState?.hoverGroup)
                ? addActiveImg
                : addImg,
              cursor: 'pointer',
            },
          });
          addExportGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.ADD_EXPORT_SET,
            attrs: {
              width: nodeSize,
              height: 24,
              x: nodeSize / 2 - 20,
              y: getInfoHeight(value) - 24,
              fill: activeByHoverIds(customNodeState?.hoverGroup)
                ? TEXT_COLOR.PRIMARY_COLOR
                : PROCESS_ACCOUNT_NODE_INFO.SECONDARY_TEXT_COLOR,
              fontSize: PROCESS_ACCOUNT_NODE_INFO.SECONDARY_TEXT_SIZE,
              fontWeight: PROCESS_ACCOUNT_NODE_INFO.SECONDARY_TEXT_WEIGHT,
              text: tipText,
              cursor: 'pointer',
              textBaseline: 'top',
            },
          });
        }
      }

      // 顶级不折叠
      if (value.parentId !== '0' && value.hasChild === 1) {
        foldGroup.addShape('image', {
          name: GRAPH_SHAPE_NAME.FOLD_ICON,
          attrs: {
            x: (PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_WIDTH - 20) / 2,
            y: getInfoHeight(value, options?.isOnlyDetail),
            width: 20,
            height: 20,
            cursor: 'pointer',

            img: isFold(value) ? IconFoldIn : IconFoldOut,
          },
        });
      }

      return wrapper;
    },
  });
};
