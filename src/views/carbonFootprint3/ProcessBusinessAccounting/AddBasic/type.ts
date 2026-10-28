import { Ref } from 'react';
import { QuickBusinessAccountingInfo } from '../../QuickBusinessAccounting/type';

export type ProcessBusinessAccountingAddBasicProps = {
  onSub: (id: number) => void;
  basicInfo?: QuickBusinessAccountingInfo;
  modalDetail?: boolean;
  isCopy: boolean;
  isEdit: boolean;
  changeStepBack: (current: number, backId: number) => void;
  cRef: Ref<{
    goNextStep: (needGoStep: number) => Promise<boolean>;
  }>;
};
