import Accessories from '@src/assets/svg/assistant.svg';
import lifeCycleMaterial from '@src/assets/svg/carbonFootprint/graph/graph_lifeCycle_material.svg';
import DistributionAndStorage from '@src/assets/svg/distribution.svg';
import Using from '@src/assets/svg/emission_use.svg';
import EmissionWasteDisposal from '@src/assets/svg/emission_waste_disposal.svg';
import EnergyConsumption from '@src/assets/svg/energy.svg';
import MainMaterial from '@src/assets/svg/main.svg';
import Packaging from '@src/assets/svg/packaging.svg';
import Manufacturing from '@src/assets/svg/product.svg';
import DistributionStorage from '@src/assets/svg/recycle.svg';
import Transport from '@src/assets/svg/trans.svg';
import LifeUsing from '@src/assets/svg/use.svg';
import WasteDisposal from '@src/assets/svg/waste_disposal.svg';
import WaterConsumption from '@src/assets/svg/water_energy.svg';

import { ALL_EMISSION } from '../constant';

export const GRAPH_NODE_NAME = {
  PRODUCT_ROOT_NODE: 'product-root-node',
  ROOT_NODE: 'root-node',
  CHILD_NODE: 'child-node',
  CHILD_NODE_SET: 'child-set-node',
} as const;

/**
 * G6 自定义shape的name，必须唯一
 */
export const GRAPH_SHAPE_NAME = {
  ACCOUNT_EDIT_ICON: 'account-edit-icon',
  BASE_TOP_BACKGROUND_RECT: 'base-top-background-rect',
  BASE_RECT: 'base-rect',
  BASE_ROOT_RECT: 'base-root-rect',
  INFO_RECT: 'info-rect',
  INFO_TEXT: 'info-text',
  // 产出物循环
  INFO_PRODUCT_ELEMENT: 'info-product-element',
  COLLAPSE_ICON_IMG: 'collapse-icon-img',

  AI_TEXT: 'ai-text',
  NAME_TEXT: 'name-text',
  // 排放源明细 excel
  EMISSION_DETAIL_EXCEL_ICON: 'emission-detail-excel-icon',
  ADD_TEXT: 'add-text',
  COPY_TEXT: 'copy-text',
  ADD_IMG: 'add-img',
  DELETE_IMG: 'delete-img',

  // 快速核算 保存到库和删除
  SET_MORE_RECT: 'set-more-rect',
  SET_MORE_IMG: 'set-more-img',
  SET_MORE_BTNS_RECT: 'set-more-btns-rect',
  SET_MORE_BTNS_SAVE: 'set-more-btns-save',
  SET_MORE_BTNS_DELETE: 'set-more-btns-delete',
  CREATE_TASK_TEXT: 'create-task-text',

  SAVE_STORE_TEXT: 'save-store-text',
  // 过程核算补充，上面也会复用
  EMISSION_NAME: 'emission-name',
  // 产品
  PRODUCT_INFO: 'product-info',
  // 产出物
  OUTPUT_INFO: 'output-info',
  // 输出
  EXPORT_INFO: 'export-info',
  EXPORT_INFO_BR: 'export-info-br',
  // 新增输入 - 多个选项
  ADD_EXPORT_SET: 'add-export-set',
  ICON_CLOSE: 'icon-close',
  HOVER_GROUP: 'hover-group',
  HOVER_GROUP_TITLE: 'hover-group-title',
  ADD_EMISSION_TEXT: 'add-emission-text',
  ADD_UNIT_TEXT: 'add-unit-text',
  ADD_SUPPLY_TEXT: 'add-supply-text',
  FOLD_ICON: 'fold-icon',
  TOOLTIP_ICON: 'tooltip-icon',
} as const;

/** 快速核算节点数据 */
export const SHAPE_GEOMETRY_INFO = {
  NEW_ROOT_RECT_WIDTH: 536,
  NEW_ROOT_RECT_HEIGHT: 114,
  NEW_ROOT_RECT_BG: '#026961',
  ROOT_PADDING: 16,
  RECT_WIDTH: 242,
  ROOT_RECT_HEIGHT: 110,
  ROOT_INFO_RECT_HEIGHT: 40,

  CHILD_RECT_WIDTH: 266,
  CHILD_RECT_HEIGHT: 106,
  CHILD_INFO_RECT_WIDTH: 242,
  CHILD_INFO_RECT_HEIGHT: 40,
  CHILD_IMG_SIZE: 25,

  CHILD_MORE_RECT_WIDTH: 128,
  // CHILD_MORE_RECT_HEIGHT: 80, 没加复制功能的时候高度
  CHILD_MORE_RECT_HEIGHT: 100,

  RECT_RADIUS: 8,
  RECT_SMALL_RADIUS: 4,
  RECT_BACKGROUND_COLOR: 'l(90) 0:#F7F8F9 1:#FFF',
  INFO_RECT_BACKGROUND_COLOR: '#fff',
  ROOT_PATH_LENGTH: 80,
  CHILD_PATH_LENGTH: 40,

  TEXT_COLOR: '#343A40',
  TEXT_SIZE: 14,
  TEXT_WEIGHT: 500,
  LOW_TEXT_SIZE: 12,
  LOW_TEXT_COLOR: '#B5B8BB',
  LOW_TEXT_WEIGHT: 400,

  EMISSION_TOTAL_TEXT: 16,

  WAIT_SUPPLIER_REPLY_TEXT_COLOR: '#B5B8BB',
  WAIT_SUPPLIER_REPLY_TEXT: 16,
  WAIT_SUPPLIER_REPLY_TEXT_WEIGHT: 400,

  SECONDARY_TEXT_COLOR: '#999EA4',
  SECONDARY_TEXT_SIZE: 14,
  SECONDARY_TEXT_WEIGHT: 400,
  DISABLED_TEXT_COLOR: '#D2D6DA',
  ROOT_IMG_SIZE: 78,
  IMG_SIZE: 16,

  SET_MORE_IMG: 16,

  PROCESS_IMG_SIZE: 16,
  PROCESS_EMISSION_IMG_SIZE: 24,
  WARN_IMG_SIZE: 14,
  WARN_MAIN_HEIGHT: 24,
  WARN_MAIN_BACKGROUND: '#FFFBF0',
  OPERATE_IMG_SIZE: 14,
  DELETE_IMG_SIZE: 14,
} as const;

export const TEXT_SHAPE_MAX_LENGTH = {
  [GRAPH_SHAPE_NAME.NAME_TEXT]: 12,
  [GRAPH_SHAPE_NAME.INFO_TEXT]: 15,
  CHILD_EMISSION_TEXT: 16,
  BASE_ROOT_EMISSION_TEXT: 12,
  ROOT_NAME_TEXT: 20,
} as const;

export const TEXT_COLOR = {
  TEXT_COLOR: '#343A40',
  SECONDARY_TEXT_COLOR: '#999EA4',
  THIRED_TEXT_COLOR: '#6C757D',
  PRIMARY_COLOR: '#026961',
} as const;

const TEXT_FONT_WEIGHT = {
  normal: 400,
  bolder: 600,
  bold: 900,
};

const HOVER_GROUP_ICON_SIZE = {
  width: 16,
  height: 16,
};

const nodeWidth = {
  big: 208,
  normal: 184,
};

const footerTextY = 97 + 3;

/** 过程核算节点数据 */
export const PROCESS_ACCOUNT_NODE_INFO = {
  ...SHAPE_GEOMETRY_INFO,
  // 3.3.1新版过程核算根节点样式
  NEW_BASE_ROOT_WIDTH: 270,
  NEW_BASE_ROOT_HEIGHT: 112,
  NEW_BASE_ROOT_ICON_SIZE: 16,
  NEW_BASE_ROOT_ICON_BACKGROUND: 32,
  NEW_BASE_ROOT_ICON_COLOR: '#F0F9FF',
  NEW_BASE_ROOT_TAGS_BORDER: 80,
  NEW_BASE_ROOT_TAGS_FILL_COLOR: '#f0f9ffff',
  NEW_BASE_ROOT_TAGS_FONT_COLOR: '#3491FA',
  NEW_LIFE_RECT_WIDTH: 256,

  // 排放源信息框的内容
  EMISSION_CHILD_RECT_HEIGHT: 80,

  RECT_WIDTH: nodeWidth.big,
  ROOT_RECT_HEIGHT: 124,
  /** // 没有产品和输出按钮，高度为100px */
  NO_FOOTER_ROOT_RECT_HEIGHT: 92,
  SUB_RECT_WIDTH: nodeWidth.normal,
  ROOT_INFO_RECT_HEIGHT: 62,
  THIRED_TEXT_COLOR: '#6C757D',
  BORDER_COLOR: 'transparent',
  RADIUS: 4,
  CLOSE_ICON_SIZE: 16,
  PRODUCT_INFO: {
    root: {
      rect: { x: 10, y: 97, width: 94, height: 24 },
      text: { x: nodeWidth.big / 4 + 2, y: footerTextY },
    },
    // 顶级节点
    top: {
      rect: { x: 10, y: 97, width: nodeWidth.big - 20, height: 24 },
      text: { x: nodeWidth.big / 2, y: footerTextY },
    },
    sub: {
      rect: { x: 10, y: 97, width: 78, height: 24 },
      text: { x: nodeWidth.normal / 4 + 2, y: footerTextY },
    },
  },
  EXPORT_INFO: {
    root: {
      rect: { x: 112, y: 97, width: 94, height: 24 },
      text: { x: (nodeWidth.big / 4) * 3 - 2, y: footerTextY },
    },
    sub: {
      rect: { x: 96, y: 97, width: 78, height: 24 },
      text: { x: (nodeWidth.big / 4) * 3 - 2, y: footerTextY },
    },
  },
  HOVER_GROUP: (baseRectWidth?: number) => ({
    x: (baseRectWidth ?? nodeWidth.big) + 10,
    y: 0,
    width: 120,
    height: 130,
    fill: '#fff',
  }),
  HOVER_GROUP_TITLE: (baseRectWidth?: number) => ({
    x: (baseRectWidth ?? nodeWidth.big) + 8 + 10,
    y: 4 + 3,
    fill: TEXT_COLOR.THIRED_TEXT_COLOR,
    textBaseline: 'top' as const,
    fontSize: SHAPE_GEOMETRY_INFO.SECONDARY_TEXT_SIZE,
  }),
  ADD_EMISSION_IMG: (baseRectWidth?: number) => ({
    x: (baseRectWidth ?? nodeWidth.big) + 8 + 10,
    y: 39.4,
    ...HOVER_GROUP_ICON_SIZE,
  }),
  ADD_EMISSION_TEXT: (baseRectWidth?: number, active?: boolean) => ({
    x: (baseRectWidth ?? nodeWidth.big) + 10 + 28,
    y: 39.4,
    fill: active ? TEXT_COLOR.PRIMARY_COLOR : TEXT_COLOR.THIRED_TEXT_COLOR,
    fontSize: 14,
    textBaseline: 'top' as const,
    fontWeight: TEXT_FONT_WEIGHT.normal,
  }),
  ADD_UNIT_IMG: (baseRectWidth?: number) => ({
    x: (baseRectWidth ?? nodeWidth.big) + 8 + 10,
    y: 68,
    ...HOVER_GROUP_ICON_SIZE,
  }),
  ADD_UNIT_TEXT: (baseRectWidth?: number, active?: boolean) => ({
    x: (baseRectWidth ?? nodeWidth.big) + 10 + 28,
    y: 68,
    fill: active ? TEXT_COLOR.PRIMARY_COLOR : TEXT_COLOR.THIRED_TEXT_COLOR,
    fontSize: 14,
    textBaseline: 'top' as const,
    fontWeight: TEXT_FONT_WEIGHT.normal,
  }),
  ADD_SUPPLY_IMG: (baseRectWidth?: number) => ({
    x: (baseRectWidth ?? nodeWidth.big) + 8 + 10,
    y: 100,
    ...HOVER_GROUP_ICON_SIZE,
  }),
  ADD_SUPPLY_TEXT: (baseRectWidth?: number, active?: boolean) => ({
    x: (baseRectWidth ?? nodeWidth.big) + 10 + 28,
    y: 100,
    fill: active ? TEXT_COLOR.PRIMARY_COLOR : TEXT_COLOR.THIRED_TEXT_COLOR,
    fontSize: 14,
    textBaseline: 'top' as const,
    fontWeight: TEXT_FONT_WEIGHT.normal,
  }),
} as const;

/** 有状态变化的group */
export const HoverGroupIds = {
  addEmission: 'add-emission',
  addUnit: 'add-unit',
  addSupply: 'add-supply',
  addExportGroup: 'add-export-group',
  rootInfoGroup: 'root-info-group',
  rootNode: 'root-node',
  rootOperateGroup: 'root-operate-group',
  childSetNode: 'child-set-node',
  childNode: 'child-node',
  productNode: 'product-root-node',
} as const;

/** 过程核算 group name,目前只记录用到的group */
export const PROCESS_MODEL_GROUP_NAMES = {
  hoverGroup: 'hover-group',
};
/** 自定义节点状态 */
export const CUSTOME_NODE_STATE = 'customNodeState';

export const EMISSION_CARD_ICON = {
  // 原材料获取
  lifeCycleMaterial,
  // 分销和存储
  DistributionAndStorage,
  // 生产制造
  Manufacturing,
  LifeUsing,
  // 废弃处置
  WasteDisposal,
  // 主料
  MainMaterial,
  // 包装材料
  Packaging,
  Transport,
  // 排放源 使用
  Using,
  // 辅料
  Accessories,
  // 水耗
  WaterConsumption,
  // 能耗
  EnergyConsumption,
  // 分销存储
  DistributionStorage,
  // 排放源 废弃处置
  EmissionWasteDisposal,
} as const;
const {
  MAIN,
  ASSISTANT,
  PACKAGING,
  RECYCLE,
  ENERGY,
  WATER_ENERGY,
  TRANS,
  GAS_WASTE,
  WATER_WASTE,
  SOLID_WASTE,
  RECYCLED_WASTE,
  OTHER,
} = ALL_EMISSION;

export const EMISSION_COLOR = {
  [MAIN]: '#0167DB',
  [ASSISTANT]: '#646FEA',
  [PACKAGING]: '#FEC732',
  [RECYCLE]: '#0CBF9F',
  [ENERGY]: '#E14656',
  [WATER_ENERGY]: '#19A6D2',
  [TRANS]: '#FA734A',
  [GAS_WASTE]: '#89A0AC',
  [WATER_WASTE]: '#89A0AC',
  [SOLID_WASTE]: '#89A0AC',
  [RECYCLED_WASTE]: '#89A0AC',
  [OTHER]: '#89A0AC',
};
