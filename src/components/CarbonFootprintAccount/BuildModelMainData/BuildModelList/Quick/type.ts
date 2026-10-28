import { AccountingInfoData } from '@src/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';
import { Ref } from 'react';

import { BuildModelListQuickTableRef } from './QuickTable/type';
import { ApiExtraParams, BuildModelMainDataProps } from '../../type';
import { BuildModelListProps } from '../type';

export type QuickBuildModelListProps = {
  accountInfo: AccountingInfoData;
  apiExtraParams: ApiExtraParams;
  updateAccountInfo: () => void;
  editAccount: () => void;
  /** 子组件ref */
  cRef?: Ref<BuildModelListQuickTableRef | undefined>;
  listRef?: Ref<{ updateByAIProcess: () => void } | undefined>;
  isDetail?: boolean;
  quickDrawerMatchWayBtns: BuildModelMainDataProps['quickDrawerMatchWayBtns'];
  quickDrawerMatchWayBtnValue?: BuildModelMainDataProps['quickDrawerMatchWayBtnValue'];
  noSelectEmissionBtn?: BuildModelListProps['noSelectEmissionBtn'];
  noSaveStoreBtn?: BuildModelListProps['noSaveStoreBtn'];
  onlyCreateFactor?: boolean;
  isInSupplyChain?: boolean;
  changeEmission?: () => void;
  reportSnapCode?: string;
  authType?: string;
  enableFactorSourceRange?: boolean;
};
