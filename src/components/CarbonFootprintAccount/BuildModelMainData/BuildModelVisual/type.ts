import type { AccountingInfoData } from '@src/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';
import { Ref } from 'react';

import { BuildModelVisualRef } from '../BuildModelList/Quick/QuickTable/type';
import { ApiExtraParams, BuildModelMainDataProps } from '../type';
import type { AccountEmissionTaskTarget } from '@/views/carbonFootprint3/FootprintAccount/component/AccountInfoResult/type';

export type BuildModelVisualProps = {
  agentPreviewLayout?: boolean;
  isDetail?: boolean;
  aiAnimationStatus?: boolean;
  apiExtraParams: ApiExtraParams;
  accountInfo: AccountingInfoData;
  cRef: Ref<BuildModelVisualRef | undefined>;
  changeEmission?: () => void;
  editAccount: () => void;
  noSaveStoreBtn?: boolean;
  noSelectEmissionBtn?: BuildModelMainDataProps['noSelectEmissionBtn'];
  quickDrawerMatchWayBtns?: BuildModelMainDataProps['quickDrawerMatchWayBtns'];
  quickDrawerMatchWayBtnValue?: BuildModelMainDataProps['quickDrawerMatchWayBtnValue'];
  updateAccountInfo: () => void;
  enableFactorSourceRange?: boolean;
  onEmissionTaskCreate?: (target: AccountEmissionTaskTarget) => void;
};
