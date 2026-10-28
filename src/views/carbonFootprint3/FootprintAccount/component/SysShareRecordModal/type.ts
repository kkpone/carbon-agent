import { ProductAccountingList } from '../ProductSelectAccount/type';

export type SysShareRecordModalProps = {
  open: boolean;
  account: ProductAccountingList | null;
  onClose: () => void;
  /** 外部触发刷新（如复制链接创建新记录后） */
  refreshKey?: number;
};
