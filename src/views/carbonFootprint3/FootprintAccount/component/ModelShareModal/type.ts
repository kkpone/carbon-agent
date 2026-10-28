import { ProductAccountingList } from '../ProductSelectAccount/type';

export type ModelShareModalProps = {
  open: boolean;
  account?: ProductAccountingList | null;
  onClose: () => void;
  onSuccess: () => void;
  onOpenLinkShare: (account: ProductAccountingList) => void;
};

export type ModelShareSearchParams = {
  /** 供应商名称/编码，前端模糊搜索 */
  keyword?: string;
  /** 地区选项 code，用于 Select 反显 */
  regionCode?: string;
};
