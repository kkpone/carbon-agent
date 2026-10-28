import { ProductAccountingList } from '../ProductSelectAccount/type';

export type ModelShareRecordModalProps = {
  open: boolean;
  account?: ProductAccountingList | null;
  onClose: () => void;
};
