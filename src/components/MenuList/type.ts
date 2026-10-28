import { QuickAccountLifeCycleStage } from '@src/views/carbonFootprint3/type';
import { DataNode } from 'antd/lib/tree';

import { AccountingInfoData } from '@/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';

type MenuListProduct = {
  productPic: string;
  accountName: string;
  emission: number;
  // 排放量的单位，默认是kgCO₂e
  unit?: string;
};

export type MenuListProps = {
  accountInfo: AccountingInfoData;
  menuValue?: string[];
  productInfo: MenuListProduct;
  treeMenus: MenuData[];
  treeLoading?: boolean;
  onSelectMenu: (data?: MenuData) => void;
  editAccount: () => void;
  reportSnapCode?: string;
  authType?: string;
  /** 为 true 时隐藏侧栏核算周期与排放量（模型库等，不影响核算页） */
  hideAccountPeriodAndEmission?: boolean;
};

/**
 * @description: 菜单初始化返回值
 */
export interface MenuData extends DataNode {
  id: string;
  stage: QuickAccountLifeCycleStage;
  type?: number | string;
  code: number;
  name: string;
  parentCode?: number;
  count: number;
  orderNum: number;
  children?: MenuData[];
}
