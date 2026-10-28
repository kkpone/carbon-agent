import { ValueOf } from 'type-fest';

import { HoverGroupIds } from './constant';

/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-02-23 18:20:01
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-24 18:04:04
 */
export type RegisterOptions = {
  graphType: GraphType;
  operatePermission?: boolean;
  eventMap?: {
    [K: string]: (...args: any[]) => void;
  };
};

export type GraphTreeNode = {
  id: number | string;
  name: string;
  img?: string;
  isRoot?: boolean;
  children?: GraphTreeNode[];
  extraData?: Record<string, any>;
  typeName: string;
};

export type GraphTreeClassNode = {
  id: number | string;
  name: string;
  img?: string;
  isRoot?: boolean;
  children: GraphTreeClassNode[];
  extraData?: Record<string, any>;
  typeName: string;
};
/** 快速核算 过程核算 */
export type GraphType = 'quickAccount' | 'processAccount';

export type CustomNodeState =
  | {
      hover?: boolean;
      hoverGroup?: string | null;
    }
  | undefined;

export type HoverGroupIdsType = ValueOf<typeof HoverGroupIds>;
