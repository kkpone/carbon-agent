import { ProcessApiProduct } from '@src/views/carbonFootprint3/ProcessBusinessAccounting/VisualizationDrawer/type';

export type PostProcessOutsListDataAdd = {
  dataId: string | number;
  parentId: string;
  processOuts: Record<string, any>[];
};

export type AccessoryExportDrawerProps = {
  loading: boolean;
  isOnlyDetail?: boolean;
  /** 功能单位名称 */
  unitName?: string;
  /** 是否是过程库 */
  isProcess?: boolean;
  accountId: number;
  processId: number;
  /** 初始化 - 回显FormValue */
  initValues?: ProcessApiProduct[];
  visible: boolean;
  isEdit: boolean;
  onOk?: (productArr: Record<string, any>[]) => void;
  onCancel?: () => void;
};
