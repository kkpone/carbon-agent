/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-14 09:59:37
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-24 10:04:37
 */
import { FlowAnalysisGraphConfig } from '@ant-design/charts';
import {
  EMISSION_CARD_ICON,
  GRAPH_SHAPE_NAME,
} from '@src/views/carbonFootprint3/graph/constant';
import { ValueOf } from 'type-fest';

import { TypeExtra } from '../../../type';

export type TagName = ValueOf<typeof GRAPH_SHAPE_NAME>;

export type TreeData = {
  nodes: NodeData[];
  edges: FlowAnalysisGraphConfig['data']['edges'];
};

type NodeDataProduct = {
  emissionTotal: string;
  name: string;
};

/** 可视化节点类型 */
export type NodeData = {
  id: string | number;
  value: {
    title: string;
    nodeIcon: keyof typeof EMISSION_CARD_ICON;
    gasStatus: string;
    gasName: string;
    matchType: number;
    children: NodeData[];
    requestState?: number;
    transTotal?: number;
  } & ViewDatas;
} & FlowAnalysisGraphConfig['data']['nodes'][number];

export type ViewDatas = {
  amount: number;
  unitName: string;
  matchType: number;
  id: string;
  dataId: number;
  processId: number | null;
  productPic?: string;
  name: string;
  type: number;
  typeName: string;
  emissionTotal: string | null;
  parentId: string;
  processType: number | null;
  status: number;
  libState: number;
  orderNum: number;
  /** 发起收数的供应商名称 */
  matchName?: string;
  /** 当前节点是否有子集 0 无   1 有 */
  hasChild: number;
  children?: ViewDatas[];
  typeExtra?: TypeExtra;
  products: NodeDataProduct[];
};
