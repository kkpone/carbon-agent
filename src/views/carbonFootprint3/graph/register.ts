/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-param-reassign */

import G6, { IG6GraphEvent } from '@antv/g6';
import aiImg from '@src/assets/svg/carbonFootprint/graph/ai.svg';
import dateImg from '@src/assets/svg/carbonFootprint/graph/date.svg';
import editImg from '@src/assets/svg/carbonFootprint/graph/edit.svg';
import editHoverImg from '@src/assets/svg/carbonFootprint/graph/editHover.svg';
import addActiveImg from '@src/assets/svg/carbonFootprint/graph/graph_set_add_active_emission.svg';
import addImg from '@src/assets/svg/carbonFootprint/graph/graph_set_add_emission.svg';
import setMore from '@src/assets/svg/carbonFootprint/graph/graph_set_more.svg';
import quickImg from '@src/assets/svg/carbonFootprint/graph/quick.svg';
import IconFoldIn from '@src/assets/svg/icon_chevron_down.svg';
import IconFoldOut from '@src/assets/svg/icon_chevron_up.svg';
import excelImg from '@src/assets/svg/carbonFootprint/excel.svg';
import transportSvg from '@src/assets/svg/transport.svg';
import warnImg from '@src/assets/svg/warn.svg';
import I18N from '@src/lang/I18N';
import { isNull } from 'lodash-es';

import {
  CUSTOME_NODE_STATE,
  EMISSION_COLOR,
  GRAPH_NODE_NAME,
  GRAPH_SHAPE_NAME,
  HoverGroupIds,
  PROCESS_ACCOUNT_NODE_INFO,
  SHAPE_GEOMETRY_INFO,
  TEXT_COLOR,
  TEXT_SHAPE_MAX_LENGTH,
} from './constant';
import { CustomNodeState, RegisterOptions } from './type';
import {
  calcTextWidthUseFontSize,
  sliceStringByLength,
  textEllipsised,
} from './utils';
import { registerPolyline } from '../BusinessAccountingModel/addBasic/components/Graph/utils/registNodes';
import { MODEL_EMISSION_REQUEST_STATE } from '../BusinessAccountingModel/constant';
import {
  ACCOUNT_SELECT_LIFE_CYCLE_LABEL,
  FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL,
} from '../FootprintAccount/constant';
import {
  ALL_EMISSION,
  LIFE_CYCLE_ROOT_INFO,
  QUICK_ACCOUNT_EMISSION_INFO_MAP,
} from '../constant';

const sliceString = (str: string, len: number) =>
  str.length > len ? `${str.slice(0, len)}...` : str;

const {
  NEW_ROOT_RECT_WIDTH,
  NEW_ROOT_RECT_HEIGHT,
  NEW_ROOT_RECT_BG,
  RECT_WIDTH,
  ROOT_RECT_HEIGHT,
  CHILD_RECT_HEIGHT,
  RECT_RADIUS,
  RECT_SMALL_RADIUS,
  RECT_BACKGROUND_COLOR,
  ROOT_PADDING,
  INFO_RECT_BACKGROUND_COLOR,
  CHILD_INFO_RECT_WIDTH,
  ROOT_INFO_RECT_HEIGHT,
  CHILD_INFO_RECT_HEIGHT,
  CHILD_IMG_SIZE,
  CHILD_MORE_RECT_WIDTH,
  CHILD_MORE_RECT_HEIGHT,
  IMG_SIZE,
  ROOT_IMG_SIZE,
  OPERATE_IMG_SIZE,
  SET_MORE_IMG,
  WARN_IMG_SIZE,
  WARN_MAIN_HEIGHT,
  WARN_MAIN_BACKGROUND,
} = SHAPE_GEOMETRY_INFO;

const editImage = new Image();
editImage.src = editImg;
const editHoverImage = new Image();
editHoverImage.src = editHoverImg;

export const registerQuickAccountNode = (
  operatePermission?: boolean,
  status?: string,
) => {
  // 判断是否是树形类型， 只有树形才会传递status
  const isTreeGraph = !!status;

  registerPolyline();
  // 根节点root
  G6.registerNode(GRAPH_NODE_NAME.PRODUCT_ROOT_NODE, {
    draw(cfg, group) {
      cfg = cfg!;
      group = group!;
      const extraData = (cfg.extraData as Record<string, any>) || {};
      const rootTitleText = textEllipsised(cfg.label as string, 180);

      const rootWidth = extraData.hideEmissionTotal
        ? ROOT_PADDING + ROOT_IMG_SIZE + 220
        : NEW_ROOT_RECT_WIDTH;
      const rootHeight = extraData.hidePeriod
        ? NEW_ROOT_RECT_HEIGHT - 4
        : NEW_ROOT_RECT_HEIGHT;
      const contentOffsetY = extraData.hidePeriod ? 13 : 0;

      const shape = group.addShape('rect', {
        name: `${GRAPH_SHAPE_NAME.BASE_ROOT_RECT}_background`,
        attrs: {
          x: 0,
          y: 0,
          fill: NEW_ROOT_RECT_BG,
          width: rootWidth,
          height: rootHeight,
          radius: [RECT_RADIUS],
          shadowType: 'inner',
          shadowColor: '#fff',
          shadowOffsetY: 0,
          shadowOffsetX: 0,
          shadowBlur: 0,
          lineWidth: 0,
        },
      });

      const baseRootGroup = group.addGroup({ id: 'base-root-group' });

      baseRootGroup.addShape('rect', {
        name: GRAPH_SHAPE_NAME.BASE_ROOT_RECT,
        attrs: {
          x: 0,
          y: 4,
          fill: '#fff',
          width: rootWidth,
          height: rootHeight - 4,
          radius: [RECT_RADIUS],
          lineWidth: 0,
        },
      });

      // 根节点图标组合 - 背景色和icon
      setTimeout(() => {
        const image = new Image();
        image.onload = () => {
          baseRootGroup.addShape('image', {
            name: 'product_img',
            attrs: {
              x: ROOT_PADDING,
              y: ROOT_PADDING,
              width: ROOT_IMG_SIZE,
              height: ROOT_IMG_SIZE,
              img: image,
            },
          });
        };
        image.src = cfg.img as string;
      });

      // root-功能单位标题
      baseRootGroup.addShape('text', {
        name: GRAPH_SHAPE_NAME.NAME_TEXT,
        attrs: {
          x: ROOT_PADDING + ROOT_IMG_SIZE + 8,
          y: ROOT_PADDING + contentOffsetY,
          fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
          fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
          fontWeight: SHAPE_GEOMETRY_INFO.TEXT_WEIGHT,
          text: rootTitleText,
          textBaseline: 'top',
        },
      });

      // editIcon - 编辑图标
      baseRootGroup.addShape('image', {
        name: GRAPH_SHAPE_NAME.ACCOUNT_EDIT_ICON,
        attrs: {
          x: ROOT_PADDING + ROOT_IMG_SIZE + 186,
          y: ROOT_PADDING + contentOffsetY,
          cursor: 'pointer',
          img: cfg?.customNodeState?.hover ? editHoverImage : editImage,
        },
      });

      // 核算类型
      baseRootGroup.addShape('rect', {
        name: 'account_type',
        attrs: {
          x: ROOT_PADDING + ROOT_IMG_SIZE + 8,
          y: ROOT_PADDING + 30 + contentOffsetY,
          width: 84,
          height: 22,
          fill: '#DDF4F2',
          radius: 4,
        },
      });
      const quickImage = new Image();
      quickImage.src = quickImg;
      baseRootGroup.addShape('image', {
        name: 'account_type_img',
        attrs: {
          x: ROOT_PADDING + ROOT_IMG_SIZE + 16,
          y: ROOT_PADDING + 34 + contentOffsetY,
          img: quickImage,
        },
      });
      baseRootGroup.addShape('text', {
        name: 'account_type_text',
        attrs: {
          x: ROOT_PADDING + ROOT_IMG_SIZE + 36,
          y: ROOT_PADDING + 35 + contentOffsetY,
          fill: '#0CBF9F',
          fontSize: 12,
          text: FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL[extraData.type],
          textBaseline: 'top',
        },
      });
      // 核算生命周期
      baseRootGroup.addShape('rect', {
        name: 'scope_type',
        attrs: {
          x: ROOT_PADDING + ROOT_IMG_SIZE + 100,
          y: ROOT_PADDING + 30 + contentOffsetY,
          width:
            (calcTextWidthUseFontSize(
              ACCOUNT_SELECT_LIFE_CYCLE_LABEL[extraData.scope],
              { fontSize: 12 },
            ) || 0) + 16,
          height: 22,
          fill: '#F0F9FF',
          radius: 4,
        },
      });
      baseRootGroup.addShape('text', {
        name: 'account_type_text',
        attrs: {
          x: ROOT_PADDING + ROOT_IMG_SIZE + 108,
          y: ROOT_PADDING + 35 + contentOffsetY,
          fill: '#3491FA',
          fontSize: 12,
          text: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[extraData.scope],
          textBaseline: 'top',
        },
      });
      // 核算周期
      if (!extraData.hidePeriod) {
        const periodImage = new Image();
        periodImage.src = dateImg;
        baseRootGroup.addShape('image', {
          name: 'account_period_img',
          attrs: {
            x: ROOT_PADDING + ROOT_IMG_SIZE + 8,
            y: ROOT_PADDING + 60,
            img: periodImage,
          },
        });

        baseRootGroup.addShape('text', {
          name: 'account_period_text',
          attrs: {
            x: ROOT_PADDING + ROOT_IMG_SIZE + 28,
            y: ROOT_PADDING + 62,
            fill: '#6C757D',
            fontSize: 12,
            text: `${extraData.startTime} ~ ${extraData.endTime}`,
            textBaseline: 'top',
          },
        });
      }

      if (!extraData.hideEmissionTotal) {
        // 分割线
        baseRootGroup.addShape('rect', {
          name: 'split_line',
          attrs: {
            x: ROOT_PADDING + ROOT_IMG_SIZE + 220,
            y: ROOT_PADDING,
            width: 1,
            height: NEW_ROOT_RECT_HEIGHT - ROOT_PADDING * 2,
            fill: '#EBEDF0',
          },
        });
        // 总排放量标题
        baseRootGroup.addShape('text', {
          name: 'emission_total_title_text',
          attrs: {
            x: ROOT_PADDING + ROOT_IMG_SIZE + 238,
            y: ROOT_PADDING + 8,
            fill: '#04252B',
            fontSize: 12,
            text: I18N.carbonFootprint3.totalEmissions,
            textBaseline: 'top',
          },
        });
        baseRootGroup.addShape('text', {
          name: 'emission_total_unit_text',
          attrs: {
            x:
              ROOT_PADDING +
              ROOT_IMG_SIZE +
              238 +
              (calcTextWidthUseFontSize(I18N.carbonFootprint3.totalEmissions, {
                fontSize: 12,
              }) || 0),
            y: ROOT_PADDING + 10,
            fill: '#999EA4',
            fontSize: 12,
            text: '（kgCO₂e）',
            textBaseline: 'top',
          },
        });
        // 排放量
        let infoText = '-';
        if (!isNull(extraData.total)) {
          if (extraData.total.length === 0) {
            infoText = '-';
          } else {
            infoText = extraData.total;
          }
        }
        const infoTextLen = TEXT_SHAPE_MAX_LENGTH.BASE_ROOT_EMISSION_TEXT;
        const infoTextSlice =
          infoText.length > infoTextLen
            ? sliceString(infoText, infoTextLen)
            : infoText;
        const baseRootEmissionTotalTextWidth = calcTextWidthUseFontSize(
          infoTextSlice,
          { fontSize: 20 },
        ) as number;
        baseRootGroup.addShape('text', {
          name: GRAPH_SHAPE_NAME.INFO_TEXT,
          attrs: {
            x: ROOT_PADDING + ROOT_IMG_SIZE + 238,
            y: ROOT_PADDING + 40,
            fill: '#026961',
            fontSize: 26,
            fontWeight: SHAPE_GEOMETRY_INFO.TEXT_WEIGHT,
            text: infoTextSlice || '-',
            tooltipText: extraData.total,
            showTooltip: extraData.total.length > infoTextLen,
            textBaseline: 'top',
          },
        });
      }

      return shape;
    },
  });

  G6.registerNode(GRAPH_NODE_NAME.ROOT_NODE, {
    draw(cfg, group) {
      cfg = cfg!;
      group = group!;
      const customNodeState = cfg[CUSTOME_NODE_STATE] as CustomNodeState;
      const extraData = (cfg.extraData as Record<string, any>) || {};
      const isHover = customNodeState?.hoverGroup === HoverGroupIds.rootNode;
      const shape = group.addShape('rect', {
        name: `${GRAPH_SHAPE_NAME.BASE_RECT}_background`,
        attrs: {
          x: 0,
          y: 0,
          fill: NEW_ROOT_RECT_BG,
          width: RECT_WIDTH,
          height: ROOT_RECT_HEIGHT,
          radius: [RECT_RADIUS],
          shadowColor: '#0000000a',
          shadowOffsetY: 12,
          shadowOffsetX: 4,
          shadowBlur: 50,
          lineWidth: isHover ? 2 : 0,
          stroke: NEW_ROOT_RECT_BG,
        },
      });

      const rootGroup = group.addGroup({ id: 'root-group' });
      const nameGroup = group.addGroup({ id: 'name-group' });
      const infoGroup = group.addGroup({ id: 'root-info-group' });
      const operateGroup = group.addGroup({ id: 'root-operate-group' });
      const collapseGroup = group.addGroup({
        id: 'collapse-group',
        visible: isTreeGraph && extraData.hasChild,
      });

      // 增加展开收起
      collapseGroup.addShape('image', {
        name: GRAPH_SHAPE_NAME.COLLAPSE_ICON_IMG,
        attrs: {
          x: RECT_WIDTH / 2 - 8,
          y: ROOT_RECT_HEIGHT + 8,
          width: IMG_SIZE,
          height: IMG_SIZE,
          img: extraData.status ? IconFoldIn : IconFoldOut,
          cursor: 'pointer',
        },
      });

      rootGroup.addShape('rect', {
        name: GRAPH_SHAPE_NAME.BASE_RECT,
        attrs: {
          x: 0,
          y: 4,
          width: RECT_WIDTH,
          height: ROOT_RECT_HEIGHT - 4,
          fill: '#fff',
          radius: [RECT_RADIUS],
        },
      });
      nameGroup.addShape('image', {
        name: GRAPH_SHAPE_NAME.ICON_IMG,
        attrs: {
          x: 8,
          y: 12,
          width: IMG_SIZE,
          height: IMG_SIZE,
          img: cfg.img,
        },
      });

      const { slicedTarget, exceedTheLimit, originTarget } =
        sliceStringByLength(
          cfg.label as string,
          TEXT_SHAPE_MAX_LENGTH.ROOT_NAME_TEXT,
        );
      nameGroup.addShape('text', {
        name: GRAPH_SHAPE_NAME.NAME_TEXT,
        attrs: {
          x: IMG_SIZE + 16,
          y: 13,
          fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
          fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
          fontWeight: SHAPE_GEOMETRY_INFO.TEXT_WEIGHT,
          textBaseline: 'top',
          text: slicedTarget,
          tooltipText: originTarget,
          showTooltip: exceedTheLimit,
        },
      });
      if (!extraData.showLifecycleEmissionSourceCount) {
        nameGroup.addShape('text', {
          name: GRAPH_SHAPE_NAME.NAME_TEXT,
          attrs: {
            x: 196,
            y: 13,
            fill: SHAPE_GEOMETRY_INFO.LOW_TEXT_COLOR,
            fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
            fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
            text: `${extraData.rate || '0.00'}%`,
            textBaseline: 'top',
          },
        });
      }
      infoGroup.addShape('rect', {
        name: GRAPH_SHAPE_NAME.INFO_RECT,
        attrs: {
          x: 4,
          y: 36,
          width: RECT_WIDTH,
          height: ROOT_INFO_RECT_HEIGHT,
          radius: [0, 0, RECT_RADIUS, RECT_RADIUS],
          cursor: 'pointer',
        },
      });
      let infoText = '-';
      if (extraData.showLifecycleEmissionSourceCount) {
        infoText = `${I18N.carbonFootprint3.emissionSourceCountOnCard}${
          extraData.emissionSourceCount ?? 0
        }`;
      } else if (!isNull(extraData.total)) {
        if (extraData.total.length === 0) {
          infoText = '-';
        } else {
          infoText = extraData.total;
        }
      }
      const infoTextLen = extraData.showLifecycleEmissionSourceCount
        ? 40
        : TEXT_SHAPE_MAX_LENGTH[GRAPH_SHAPE_NAME.INFO_TEXT];
      const infoTextSlice =
        infoText.length > infoTextLen
          ? sliceString(infoText, infoTextLen)
          : infoText;
      const rootEmissionTotalTextWidth = calcTextWidthUseFontSize(
        infoTextSlice,
        { fontSize: 16 },
      ) as number;
      const infoTooltipText = extraData.showLifecycleEmissionSourceCount
        ? infoText
        : extraData.total;
      const infoShowTooltip = extraData.showLifecycleEmissionSourceCount
        ? infoText.length > infoTextLen
        : String(extraData.total ?? '').length > infoTextLen;
      infoGroup.addShape('text', {
        name: GRAPH_SHAPE_NAME.INFO_TEXT,
        attrs: {
          x: 20,
          y: 50,
          fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
          fontSize: SHAPE_GEOMETRY_INFO.EMISSION_TOTAL_TEXT,
          fontWeight: SHAPE_GEOMETRY_INFO.TEXT_WEIGHT,
          text: infoTextSlice,
          tooltipText: infoTooltipText,
          showTooltip: infoShowTooltip,
          textBaseline: 'top',
        },
      });

      if (!extraData.showLifecycleEmissionSourceCount) {
        infoGroup.addShape('text', {
          name: GRAPH_SHAPE_NAME.INFO_TEXT,
          attrs: {
            x: rootEmissionTotalTextWidth + 25,
            y: 50 + 2,
            fill: SHAPE_GEOMETRY_INFO.LOW_TEXT_COLOR,
            fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
            fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
            text: 'kgCO₂e',
            textBaseline: 'top',
          },
        });
      }

      if (operatePermission) {
        operateGroup.addShape('image', {
          name: GRAPH_SHAPE_NAME.ADD_IMG,
          attrs: {
            x: 76,
            y: 85,
            width: OPERATE_IMG_SIZE,
            height: OPERATE_IMG_SIZE,
            img: isHover ? addActiveImg : addImg,
            cursor: 'pointer',
          },
        });
        operateGroup.addShape('text', {
          name: GRAPH_SHAPE_NAME.ADD_TEXT,
          attrs: {
            x: RECT_WIDTH / 2 - 30,
            y: 85 + 1,
            fill: isHover
              ? TEXT_COLOR.PRIMARY_COLOR
              : SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
            fontSize: 12,
            fontWeight: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_WEIGHT,
            text: I18N.carbonFootprint3.newEmissionSourcesAdded,
            textBaseline: 'top',
            cursor: 'pointer',
          },
        });
        // 底部的点击区域放大
        operateGroup.addShape('rect', {
          name: GRAPH_SHAPE_NAME.ADD_TEXT,
          attrs: {
            x: 0,
            y: 78,
            width: RECT_WIDTH,
            height: 32,
            fill: 'transparent',
            cursor: 'pointer',
          },
        });
      }
      return shape;
    },
  });

  G6.registerNode(GRAPH_NODE_NAME.CHILD_NODE, {
    draw(cfg, group) {
      cfg = cfg!;
      group = group!;

      const customNodeState = cfg[CUSTOME_NODE_STATE] as CustomNodeState;
      /**
       * 节点因为供应商高度不一致
       * @param isCompleted 是否排放量不为null
       * @param isSupplierData 是否是供应商数据
       * @param isWaitSupplierReply 是否等待供应商回复
       * @returns
       */
      const getChildHeight = (extraData: Record<string, any>) => {
        let height = CHILD_RECT_HEIGHT;
        if (
          (!extraData.isCompleted ||
            (extraData?.needTrans && !extraData.transTotal)) &&
          !extraData.isSupplierData &&
          !extraData.isAccountReferenceData &&
          !extraData.hideIncompleteEmissionWarn
        ) {
          height += WARN_MAIN_HEIGHT;
        }
        if (extraData.aiFlag) {
          // height += 16;
        }
        // 供应商
        if (extraData.isSupplierData) {
          height += extraData.isWaitSupplierReply ? 8 : 30;
        }
        // 核算引用需要展示被引用核算名称和标签，卡片高度参考供应商数据。
        if (extraData.isAccountReferenceData) {
          height += 40;
        }
        // 运输数据
        if (
          (extraData.transTotal > 0 || extraData.needTrans) &&
          extraData.type !== 7
        ) {
          height += 16;
          if (extraData.isAccountReferenceData) {
            height += 6;
          }
        }
        return height;
      };

      const extraData = (cfg.extraData as Record<string, any>) || {};

      // 是否已经保存到库
      const { isSaved } = extraData;

      const visibleShow = extraData?.aiStatus !== 1;

      const visibleOpacity = visibleShow ? 1 : 0.1;

      const isNeedTrans = cfg?.extraData?.needTrans;
      const height = getChildHeight(extraData || {});
      const isHover = customNodeState?.hover;
      const hasWpsSheetId = !!extraData?.wpsSheetId;
      const hasSheetIndex =
        extraData?.sheetIndex !== null && extraData?.sheetIndex !== undefined;
      const hasSheetLocation = hasWpsSheetId || hasSheetIndex;

      // 扩大节点热区：覆盖左侧（负 x）按钮区域，避免 hover 时移到按钮触发 mouseleave
      const leftHitWidth = 28;
      const shape = group.addShape('rect', {
        name: `${GRAPH_SHAPE_NAME.BASE_RECT}_hit`,
        attrs: {
          x: -leftHitWidth,
          y: 0,
          fill: 'transparent',
          width: RECT_WIDTH + leftHitWidth,
          height,
          radius: [RECT_RADIUS],
          cursor: 'pointer',
          opacity: 0,
        },
      });

      group.addShape('rect', {
        name: `${GRAPH_SHAPE_NAME.BASE_RECT}_background`,
        attrs: {
          x: 0,
          y: 0,
          fill: EMISSION_COLOR[extraData.type],
          width: RECT_WIDTH,
          height,
          radius: [RECT_RADIUS],
          cursor: 'pointer',
          shadowColor: '#0000000a',
          shadowOffsetY: 12,
          shadowOffsetX: 4,
          shadowBlur: 50,
          opacity: visibleOpacity,
          lineWidth: isHover ? 2 : 0,
          stroke: EMISSION_COLOR[extraData.type],
        },
      });

      const childGroup = group.addGroup({
        id: 'child-group',
        attrs: {
          opacity: visibleOpacity,
        },
      });
      const nameGroup = group.addGroup({
        id: 'name-group',
        attrs: {
          opacity: visibleOpacity,
        },
      });
      const aiGroup = group.addGroup({
        id: 'ai-group',
        attrs: {
          opacity: visibleOpacity,
        },
      });
      // const closeGroup = group.addGroup({ id: 'close-group', visible: false });
      const setGroup = group.addGroup({
        id: 'set-more-group',
        visible: operatePermission,
        attrs: {
          opacity: visibleOpacity,
        },
      });
      const infoGroup = group.addGroup({
        id: 'info-group',
        attrs: {
          opacity: visibleOpacity,
        },
      });

      if (
        (cfg?.extraData?.transTotal > 0 || isNeedTrans) &&
        cfg?.extraData?.type !== 7
      ) {
        // TODO: sunguangbiao 可视化模块改动内容
        const transportGroup = group.addGroup({
          id: 'transport-group',
          attrs: {
            opacity: visibleOpacity,
          },
        });

        const isSupplier = extraData.isSupplierData;
        const isWait = extraData.isWaitSupplierReply;
        const hasReferenceInfo = extraData.isAccountReferenceData;
        const transportOffsetY = hasReferenceInfo
          ? 132
          : isSupplier
          ? isWait
            ? 100
            : 116
          : 86;
        transportGroup.translate(10, transportOffsetY);

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
            text: I18N.carbonFootprint3.includingTransportationEmissions,
            textBaseline: 'top',
            cursor: 'pointer',
          },
        });

        if (!extraData.hideTransportEmissionAmount) {
          const preTextWidth = calcTextWidthUseFontSize(
            I18N.carbonFootprint3.includingTransportationEmissions,
            {
              fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
            },
          ) as number;
          transportGroup.addShape('text', {
            name: 'transport-number',
            attrs: {
              x: preTextWidth + 26,
              y: 10,
              fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
              fontWeight: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_WEIGHT,
              text: cfg.extraData.transTotal || '-',
              textBaseline: 'top',
              cursor: 'pointer',
            },
          });

          const TextWidth = calcTextWidthUseFontSize(
            cfg.extraData.transTotal || '-',
            {
              fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
            },
          ) as number;

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
      }

      const isSupplier = extraData.isSupplierData;
      const shouldHideSaveStore = isSupplier || extraData.hideSaveStore;
      const showTaskAction = Boolean(extraData.showTaskAction);
      const menuItemCount =
        2 + (shouldHideSaveStore ? 0 : 1) + (showTaskAction ? 1 : 0);
      const getSetGroupHeight = 20 + menuItemCount * 24;

      // 树形结构下 需要将group放到child-node中，因为树形没有多余node设置
      if (isTreeGraph) {
        setGroup.addShape('rect', {
          name: GRAPH_SHAPE_NAME.SET_MORE_IMG,
          attrs: {
            x: RECT_WIDTH - 34,
            y: 6,
            fill:
              customNodeState?.hoverGroup === HoverGroupIds.childSetNode
                ? '#fff'
                : 'transparent',
            width: 24,
            height: 24,
            radius: [RECT_SMALL_RADIUS],
            cursor: 'pointer',
          },
        });
        // 操作聚集按钮
        setGroup.addShape('image', {
          name: GRAPH_SHAPE_NAME.SET_MORE_IMG,
          attrs: {
            x: RECT_WIDTH - 30,
            y: 10,
            width: SET_MORE_IMG,
            height: SET_MORE_IMG,
            img: setMore,
            cursor: 'pointer',
          },
        });

        const setChildGroup = group.addGroup({
          id: 'set-more-group',
          visible:
            customNodeState?.hoverGroup === HoverGroupIds.childSetNode &&
            operatePermission,
        });
        const SetBtnsOffsetX = RECT_WIDTH - 35;

        setChildGroup.addShape('rect', {
          name: GRAPH_SHAPE_NAME.SET_MORE_IMG,
          attrs: {
            x: SetBtnsOffsetX,
            y: 30,
            width: CHILD_MORE_RECT_WIDTH,
            height: getSetGroupHeight,
            fill: 'transparent',
          },
        });
        setChildGroup.addShape('rect', {
          name: GRAPH_SHAPE_NAME.SET_MORE_IMG,
          attrs: {
            x: SetBtnsOffsetX,
            y: 30 + 4,
            width: CHILD_MORE_RECT_WIDTH,
            height: getSetGroupHeight,
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
            y: 30 + 4 + 8 + 8,
            fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
            fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
            fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
            text: I18N.carbonFootprint.copy,
            cursor: 'pointer',
            textBaseline: 'top',
          },
        });

        if (!shouldHideSaveStore) {
          setChildGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.SAVE_STORE_TEXT,
            attrs: {
              x: SetBtnsOffsetX + 8 + 8,
              y: 30 + 4 + 4 + 8 + 32,
              fill: isSaved
                ? SHAPE_GEOMETRY_INFO.DISABLED_TEXT_COLOR
                : SHAPE_GEOMETRY_INFO.TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
              fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
              text: isSaved
                ? I18N.carbonFootprint3.savedToLibrary
                : I18N.carbonFootprint3.saveToLibrary,
              cursor: isSaved ? 'not-allowed' : 'pointer',
              textBaseline: 'top',
            },
          });
        }

        if (showTaskAction) {
          setChildGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.CREATE_TASK_TEXT,
            attrs: {
              x: SetBtnsOffsetX + 8 + 8,
              y: shouldHideSaveStore
                ? 30 + 4 + 4 + 8 + 32
                : 30 + 4 + 8 + 32 + 32,
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
          name: GRAPH_SHAPE_NAME.DELETE_IMG,
          attrs: {
            x: SetBtnsOffsetX + 8 + 8,
            y:
              (shouldHideSaveStore
                ? 30 + 4 + 4 + 8 + 32
                : 30 + 4 + 8 + 32 + 32) + (showTaskAction ? 24 : 0),
            fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
            fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
            fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
            text: I18N.carbonFootprint.delete,
            cursor: 'pointer',
            textBaseline: 'top',
          },
        });
      }

      childGroup.addShape('rect', {
        name: GRAPH_SHAPE_NAME.BASE_RECT,
        attrs: {
          x: 0,
          y: 4,
          width: RECT_WIDTH,
          height: height - 4,
          fill: '#fff',
          radius: [RECT_RADIUS],
        },
      });

      const nameText = extraData.name ?? '-';
      const nameTextLen = extraData.aiFlag ? 6 : 8;
      const nameTextSlice =
        nameText.length > nameTextLen
          ? sliceString(nameText, nameTextLen)
          : nameText;
      /** 与头部「明细数据」一致：无 account Excel 地址时仍可在 hover / 有 sheet 定位时展示入口，由点击侧 init + 刷新 */
      const shouldShowEmissionDetailExcelIcon = hasSheetLocation || isHover;
      const addEmissionDetailExcelIcon = (y: number) => {
        if (!shouldShowEmissionDetailExcelIcon) {
          return;
        }
        const btnSize = 20;
        const iconSize = 16;
        const btnX = RECT_WIDTH - 20 - btnSize;
        const btnY = y - 4;
        infoGroup.addShape('rect', {
          name: GRAPH_SHAPE_NAME.EMISSION_DETAIL_EXCEL_ICON,
          attrs: {
            x: btnX,
            y: btnY,
            width: btnSize,
            height: btnSize,
            radius: [4],
            fill: '#fff',
            stroke: '#EBEDF0',
            cursor: 'pointer',
            shadowColor: '#0000000a',
            shadowOffsetY: 2,
            shadowBlur: 6,
          },
        });
        infoGroup.addShape('image', {
          name: GRAPH_SHAPE_NAME.EMISSION_DETAIL_EXCEL_ICON,
          attrs: {
            x: btnX + (btnSize - iconSize) / 2,
            y: btnY + (btnSize - iconSize) / 2,
            width: iconSize,
            height: iconSize,
            img: excelImg,
            cursor: 'pointer',
          },
        });
      };

      if (extraData?.aiFlag) {
        const aiImage = new Image();
        aiImage.onload = () => {
          nameGroup.addShape('image', {
            name: 'ai_img',
            attrs: {
              x:
                38 +
                (calcTextWidthUseFontSize(nameTextSlice, {
                  fontSize: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_SIZE,
                }) || 0),
              y: 8,
              img: aiImage,
            },
          });
        };
        aiImage.src = aiImg;
      }

      nameGroup.addShape('image', {
        name: 'emission_icon_image',
        attrs: {
          x: 8,
          y: 8,
          width: CHILD_IMG_SIZE,
          height: CHILD_IMG_SIZE,
          img: cfg.img,
          showTooltip: true,
          tooltipText: cfg.label,
        },
      });
      nameGroup.addShape('text', {
        name: GRAPH_SHAPE_NAME.NAME_TEXT,
        attrs: {
          // x: extraData?.aiFlag ? 8 + 120 + 4 : 36,
          x: 36,
          y: 13,
          width: RECT_WIDTH,
          height: WARN_MAIN_HEIGHT,
          fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
          fontSize: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_SIZE,
          fontWeight: SHAPE_GEOMETRY_INFO.TEXT_WEIGHT,
          text: nameTextSlice,
          tooltipText: extraData.name,
          showTooltip: extraData.name.length > nameTextLen,
          textBaseline: 'top',
          cursor: 'pointer',
        },
      });
      nameGroup.addShape('text', {
        name: GRAPH_SHAPE_NAME.NAME_TEXT,
        attrs: {
          x: RECT_WIDTH - 30 - 50,
          y: 13,
          fill: SHAPE_GEOMETRY_INFO.LOW_TEXT_COLOR,
          fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
          fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
          text: `${extraData.rate || '0.00'}%`,
          textBaseline: 'top',
        },
      });
      if (
        (!extraData.isCompleted || (isNeedTrans && !extraData.transTotal)) &&
        !extraData.isSupplierData &&
        !extraData.isAccountReferenceData &&
        !extraData.hideIncompleteEmissionWarn
      ) {
        const warnRectY = height - WARN_MAIN_HEIGHT;
        // 底部填写信息提示
        nameGroup.addShape('rect', {
          name: GRAPH_SHAPE_NAME.INFO_RECT,
          attrs: {
            x: 0,
            y: warnRectY,
            width: RECT_WIDTH,
            height: WARN_MAIN_HEIGHT,
            fill: isHover
              ? EMISSION_COLOR[extraData.type]
              : EMISSION_COLOR[ALL_EMISSION.OTHER],
            opacity: 0.1,
            cursor: 'pointer',
            radius: [0, 0, RECT_RADIUS, RECT_RADIUS],
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
            y: warnRectY + 5,
            width: WARN_IMG_SIZE,
            height: WARN_IMG_SIZE,
            img: warnImg,
          },
        });
        infoGroup.addShape('text', {
          name: GRAPH_SHAPE_NAME.INFO_TEXT,
          attrs: {
            x: 24,
            y: warnRectY + 6,
            fill: '#FBA93E',
            fontSize: 12,
            text: I18N.carbonFootprint3.thisEmissionSourceInformation,
            textBaseline: 'top',
            cursor: 'pointer',
          },
        });
        if (!extraData.isShare) {
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: 168,
              y: warnRectY + 5,
              fill: '#FBA93E',
              fontSize: 12,
              fontWeight: 600,
              text: I18N.carbonFootprint3.goFillInTheForm,
              textBaseline: 'top',
              cursor: 'pointer',
            },
          });
        }
      }

      // 供应商
      if (extraData.isSupplierData) {
        const supplierReplyText = extraData.matchObject.computeCompanyName;
        const supplierReplyTextLen = 15;

        // 等待供应商回复
        if (extraData?.isWaitSupplierReply) {
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: 20,
              y: 44,
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
              x: 20,
              y: 64,
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
        // 仅保存 发起收数数据
        if (
          extraData.requestState === MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT
        ) {
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: 20,
              y: 44,
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
              x: 40,
              y: 44,
              fill: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
              fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
              text: 'kgCO₂e',
              textBaseline: 'top',
              cursor: 'pointer',
            },
          });
          // 消耗数量
          const consumption = I18N.template(
            I18N.carbonFootprint3.consumptionQuantityE,
            { val1: extraData.consumption },
          );

          const consumptionLen = 20;
          const consumptionTextSlice =
            consumption.length > consumptionLen
              ? sliceString(consumption, consumptionLen)
              : consumption;
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: 20,
              y: 64,
              fill: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
              fontSize: 12,
              fontWeight: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_WEIGHT,
              text: consumptionTextSlice,
              tooltipText: consumption,
              showTooltip: consumption?.length > consumptionLen,
              textBaseline: 'top',
            },
          });
          addEmissionDetailExcelIcon(64);

          // 供应商
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: 20,
              y: 80,
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
        // 已经审核通过了
        if (extraData.requestState === MODEL_EMISSION_REQUEST_STATE.AUDITED) {
          const infoText = extraData.total;
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
              x: 20,
              y: 44,
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
              x: totalTextWidth + 28,
              y: 44,
              fill: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
              fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
              text: 'kgCO₂e',
              textBaseline: 'top',
              cursor: 'pointer',
            },
          });
          // 消耗数量
          const consumption = I18N.template(
            I18N.carbonFootprint3.consumptionQuantityE,
            { val1: extraData.consumption },
          );
          const consumptionLen = 20;
          const consumptionTextSlice =
            consumption.length > consumptionLen
              ? sliceString(consumption, consumptionLen)
              : consumption;
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: 20,
              y: 64,
              fill: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
              fontSize: 12,
              fontWeight: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_WEIGHT,
              text: consumptionTextSlice,
              tooltipText: consumption,
              showTooltip: consumption?.length > consumptionLen,
              textBaseline: 'top',
            },
          });
          addEmissionDetailExcelIcon(64);
          // 供应商
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: 20,
              y: 80,
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

        // 是否上等待供应商回复  - 因为距离上方高度不一致
        const waitSupplierReplyHeight = 84;
        const supplierReplyTagHeight = extraData.isWaitSupplierReply
          ? waitSupplierReplyHeight
          : waitSupplierReplyHeight + 16;
        const waitSupplierReplyTextHeight = 88;
        const supplierReplyTagTextHeight = extraData.isWaitSupplierReply
          ? waitSupplierReplyTextHeight
          : waitSupplierReplyTextHeight + 16;
        // 供应商的标签
        infoGroup.addShape('rect', {
          name: `${GRAPH_SHAPE_NAME.INFO_TEXT}_supplierReply_tag`,
          attrs: {
            x: 20,
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
            x: 32,
            y: supplierReplyTagTextHeight,
            width: 80,
            height: 20,
            fill: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_TAGS_FONT_COLOR,
            fontSize: 12,
            text: I18N.carbonFootprint3.supplierData,
            textBaseline: 'top',
            stroke: PROCESS_ACCOUNT_NODE_INFO.NEW_BASE_ROOT_TAGS_FILL_COLOR,
          },
        });
      } else {
        // 排放量和消耗数量（模型库等场景可隐藏排放量行，改为展示因子名称）
        const hideCardEmissionTotal = !!extraData.hideCardEmissionTotal;
        const addAccountReferenceInfo = () => {
          if (!extraData.isAccountReferenceData) {
            return;
          }

          const accountName = String(extraData.accountReferenceName || '-');
          const accountNameLen = 20;
          const accountNameText =
            accountName.length > accountNameLen
              ? sliceString(accountName, accountNameLen)
              : accountName;

          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: 20,
              y: 88,
              fill: TEXT_COLOR.THIRED_TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
              fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
              text: accountNameText,
              tooltipText: accountName,
              showTooltip: accountName.length > accountNameLen,
              textBaseline: 'top',
              cursor: 'pointer',
            },
          });

          infoGroup.addShape('rect', {
            name: `${GRAPH_SHAPE_NAME.INFO_TEXT}_account_reference_tag`,
            attrs: {
              x: 20,
              y: 112,
              fill: '#FFF5EC',
              width: 60,
              height: 20,
              stroke: '#FFD2A5',
              lineDash: [],
              radius: [4],
            },
          });
          infoGroup.addShape('text', {
            name: `${GRAPH_SHAPE_NAME.BASE_ROOT_RECT}_account_reference_tag_text`,
            attrs: {
              x: 50,
              y: 122,
              fill: '#F3983E',
              fontSize: 12,
              text: I18N.carbonFootprint3.accountingReference,
              textAlign: 'center',
              textBaseline: 'middle',
              stroke: '#FFF5EC',
            },
          });
        };

        if (!hideCardEmissionTotal) {
          let infoText = '-';
          if (!isNull(extraData.total) && extraData.isCompleted) {
            if (extraData.total.length === 0) {
              infoText = '-';
            } else {
              infoText = extraData.total;
            }
          }
          const infoTextLen = TEXT_SHAPE_MAX_LENGTH.CHILD_EMISSION_TEXT;
          const infoTextSlice =
            infoText.length > infoTextLen
              ? sliceString(infoText, infoTextLen)
              : infoText;
          const childEmissionTotalTextWidth = calcTextWidthUseFontSize(
            infoTextSlice,
            { fontSize: 14 },
          ) as number;

          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: 20,
              y: 44,
              fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
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
              x: childEmissionTotalTextWidth + 28,
              y: 44,
              fill: SHAPE_GEOMETRY_INFO.LOW_TEXT_COLOR,
              fontSize: SHAPE_GEOMETRY_INFO.LOW_TEXT_SIZE,
              fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
              text: 'kgCO₂e',
              textBaseline: 'top',
              cursor: 'pointer',
            },
          });
        }

        // 消耗数量
        let consumption = I18N.template(
          I18N.carbonFootprint3.consumptionQuantityE,
          { val1: extraData.consumption },
        );

        if (extraData.type === ALL_EMISSION.TRANS) {
          consumption = I18N.template(
            I18N.carbonFootprint3.consumptionQuantityE,
            { val1: extraData.unitStr || '-' },
          );
        }

        const consumptionLen = 20;
        const consumptionY = hideCardEmissionTotal ? 44 : 70;
        const consumptionTextSlice =
          consumption.length > consumptionLen
            ? sliceString(consumption, consumptionLen)
            : consumption;
        infoGroup.addShape('text', {
          name: GRAPH_SHAPE_NAME.NAME_TEXT,
          attrs: {
            x: 20,
            y: consumptionY,
            fill: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
            fontSize: 12,
            fontWeight: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_WEIGHT,
            text: consumptionTextSlice,
            tooltipText: consumption,
            showTooltip: consumption?.length > consumptionLen,
            textBaseline: 'top',
          },
        });
        addEmissionDetailExcelIcon(consumptionY);

        if (hideCardEmissionTotal) {
          const factorLine = `${I18N.carbonFootprint.factorName}：${
            extraData.factorDisplayName ?? '-'
          }`;
          const factorLen = 22;
          infoGroup.addShape('text', {
            name: GRAPH_SHAPE_NAME.INFO_TEXT,
            attrs: {
              x: 20,
              y: 70,
              fill: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_COLOR,
              fontSize: 12,
              fontWeight: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_WEIGHT,
              text:
                factorLine.length > factorLen
                  ? sliceString(factorLine, factorLen)
                  : factorLine,
              tooltipText: factorLine,
              showTooltip: factorLine.length > factorLen,
              textBaseline: 'top',
            },
          });
        }
        addAccountReferenceInfo();
      }

      return shape;
    },
    afterDraw(cfg, group) {
      cfg = cfg!;
      group = group!;
      const extraData = (cfg.extraData as Record<string, any>) || {};

      const shapes = group.get('children');
      if (extraData?.aiStatus === 1) {
        shapes.forEach(shape => {
          shape.animate({ opacity: 1 }, { duration: 2000, repeat: false });
        });
      }
    },
  });

  G6.registerNode(GRAPH_NODE_NAME.CHILD_NODE_SET, {
    draw(cfg, group) {
      cfg = cfg!;
      group = group!;
      const extraData = (cfg.extraData as Record<string, any>) || {};
      // 是否已经保存到库
      const { isSaved } = extraData;

      const customNodeState = cfg[CUSTOME_NODE_STATE] as CustomNodeState;
      const shape = group.addShape('rect', {
        name: GRAPH_SHAPE_NAME.SET_MORE_RECT,
        attrs: {
          x: RECT_WIDTH - 34,
          y: 6,
          fill:
            customNodeState?.hoverGroup === HoverGroupIds.childSetNode &&
            operatePermission
              ? '#fff'
              : 'transparent',
          width: 24,
          height: 24,
          radius: [RECT_SMALL_RADIUS],
          cursor: 'pointer',
        },
      });
      const setGroup = group.addGroup({
        id: 'set-more-group',
        visible: operatePermission,
      });
      const setChildGroup = group.addGroup({
        id: 'set-more-group',
        visible:
          customNodeState?.hoverGroup === HoverGroupIds.childSetNode &&
          operatePermission,
      });
      const SetBtnsOffsetX = RECT_WIDTH - 35;
      const isSupplier = extraData.isSupplierData;
      const shouldHideSaveStore = isSupplier || extraData.hideSaveStore;
      const showTaskAction = Boolean(extraData.showTaskAction);

      const menuItemCount =
        2 + (shouldHideSaveStore ? 0 : 1) + (showTaskAction ? 1 : 0);
      const getSetGroupHeight = 20 + menuItemCount * 24;

      // 操作聚集按钮
      setGroup.addShape('image', {
        name: GRAPH_SHAPE_NAME.SET_MORE_IMG,
        attrs: {
          x: RECT_WIDTH - 30,
          y: 10,
          width: SET_MORE_IMG,
          height: SET_MORE_IMG,
          img: setMore,
          cursor: 'pointer',
        },
      });

      setChildGroup.addShape('rect', {
        name: GRAPH_SHAPE_NAME.SET_MORE_BTNS_RECT,
        attrs: {
          x: SetBtnsOffsetX,
          y: 20,
          width: CHILD_MORE_RECT_WIDTH,
          height: getSetGroupHeight,
          fill: 'transparent',
        },
      });
      setChildGroup.addShape('rect', {
        name: GRAPH_SHAPE_NAME.SET_MORE_BTNS_RECT,
        attrs: {
          x: SetBtnsOffsetX,
          y: 30 + 4,
          width: CHILD_MORE_RECT_WIDTH,
          height: getSetGroupHeight,
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
          y: 30 + 4 + 8 + 8,
          fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
          fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
          fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
          text: I18N.carbonFootprint.copy,
          cursor: 'pointer',
          textBaseline: 'top',
        },
      });

      // 不是供应商且未设置隐藏 才允许保存到库
      if (!shouldHideSaveStore) {
        setChildGroup.addShape('text', {
          name: GRAPH_SHAPE_NAME.SAVE_STORE_TEXT,
          attrs: {
            x: SetBtnsOffsetX + 8 + 8,
            y: 30 + 4 + 4 + 8 + 32,
            fill: isSaved
              ? SHAPE_GEOMETRY_INFO.DISABLED_TEXT_COLOR
              : SHAPE_GEOMETRY_INFO.TEXT_COLOR,
            fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
            fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
            text: isSaved
              ? I18N.carbonFootprint3.savedToLibrary
              : I18N.carbonFootprint3.saveToLibrary,
            cursor: isSaved ? 'not-allowed' : 'pointer',
            textBaseline: 'top',
          },
        });
      }

      if (showTaskAction) {
        setChildGroup.addShape('text', {
          name: GRAPH_SHAPE_NAME.CREATE_TASK_TEXT,
          attrs: {
            x: SetBtnsOffsetX + 8 + 8,
            y: shouldHideSaveStore ? 30 + 4 + 4 + 8 + 32 : 30 + 4 + 8 + 32 + 32,
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
        name: GRAPH_SHAPE_NAME.DELETE_IMG,
        attrs: {
          x: SetBtnsOffsetX + 8 + 8,
          y:
            (shouldHideSaveStore ? 30 + 4 + 4 + 8 + 32 : 30 + 4 + 8 + 32 + 32) +
            (showTaskAction ? 24 : 0),
          fill: SHAPE_GEOMETRY_INFO.TEXT_COLOR,
          fontSize: SHAPE_GEOMETRY_INFO.TEXT_SIZE,
          fontWeight: SHAPE_GEOMETRY_INFO.LOW_TEXT_WEIGHT,
          text: I18N.carbonFootprint.delete,
          cursor: 'pointer',
          textBaseline: 'top',
        },
      });

      return shape;
    },
  });
};

export const registerQuickAccountEvt = (
  eventMap?: RegisterOptions['eventMap'],
) => {
  G6.registerBehavior('custom-click', {
    getEvents() {
      return {
        'node:click': 'onClick',
      };
    },
    onClick(evt: IG6GraphEvent) {
      const shapeName = evt.target.cfg.name;
      const nodeType = evt.item?.getModel().type;
      const customShapeEvent = eventMap?.[`${shapeName}-click`];
      const customNodeEvent = eventMap?.[`${nodeType}-click`];
      if (typeof customShapeEvent === 'function') {
        customShapeEvent(evt.target, evt.item);
      } else if (typeof customNodeEvent === 'function') {
        customNodeEvent(evt.target, evt.item);
      }
    },
  });
};
