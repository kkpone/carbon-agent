import { AccountingInfoData } from '@src/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';
import { DataNode } from 'antd/lib/tree';
import { Key } from 'react';

import { ApiExtraParams } from '../../type';

export type ProcessBuildListProps = {
  accountInfo: AccountingInfoData;
  apiExtraParams: ApiExtraParams;
  isDetail?: boolean;
  updateAccountInfo: () => void;
  editAccount: () => void;
  enableFactorSourceRange?: boolean;
};

export type ProcessListMenuProps = {
  accountInfo: AccountingInfoData;
  currentWidth: number;
  changeCurrentWidth: (changeWidth: number) => void;
  selectKey: Key[];
  defaultExpandedKeys: Key[];
  treeMenus: ProcessAccounMenu[];
  treeLoading: boolean;
  selectTreeNode: (info: ProcessAccounMenu) => void;
  recursionExpandedKeysChilds: (keys: Key[], info: ProcessAccounMenu) => Key[];
  updateTreeNode: (info: ProcessAccounMenu) => void;
  editAccount: () => void;
};

/**
 * @description: 菜单初始化返回值
 */
export interface ProcessAccounMenu extends DataNode {
  /** 匹配类型：0因子，1过程 */
  matchType: number;
  /** 核算id */
  id: string;
  /** 真实Id */
  dataId: number;
  /** 真实Id */
  processId: number;
  key: string;
  /** 菜单名称 */
  name: string;
  title: string;
  parentId: string;
  /** 过程类型：1输入，2输出 */
  processType: number | null;
  /** 排序 */
  orderNum: number;
  children?: ProcessAccounMenu[];
}
