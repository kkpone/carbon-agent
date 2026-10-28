import { AccountingInfoData } from '@src/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';
import { Key } from 'react';

import { ApiExtraParams } from '../../../type';
import { ProcessAccounMenu } from '../type';

export type BuildModelListProcessTableProps = {
  currentWidth: number;
  menuInfo: ProcessAccounMenu;
  apiExtraParams: ApiExtraParams;
  accountInfo: AccountingInfoData;
  processTabUrlKey: string;
  isEdit: boolean;
  parentMenuInfo?: ProcessAccounMenu;
  expandedKeys?: Key[];
  selectKey?: Key[];
  isOnlyDetail?: boolean;
  enableFactorSourceRange?: boolean;
  // 更新菜单回调
  onUpdateMenuClickBack: () => void;
  updateTreeNode?: (info: ProcessAccounMenu) => void;
};
