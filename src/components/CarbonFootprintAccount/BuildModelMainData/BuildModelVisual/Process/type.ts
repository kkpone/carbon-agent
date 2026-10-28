import type { AccountingInfoData } from '@src/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';

import { ApiExtraParams } from '../../type';
import type { AccountEmissionTaskTarget } from '@/views/carbonFootprint3/FootprintAccount/component/AccountInfoResult/type';

export type ProcessBuildVisualProps = {
  accountInfo: AccountingInfoData;
  isDetail?: boolean;
  apiExtraParams?: ApiExtraParams;
  editAccount: () => void;
  enableFactorSourceRange?: boolean;
  onEmissionTaskCreate?: (target: AccountEmissionTaskTarget) => void;
};
