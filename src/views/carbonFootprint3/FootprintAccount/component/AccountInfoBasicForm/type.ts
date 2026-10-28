import { Form } from '@formily/core';
import { Ref } from 'react';

import {
  AccountingInfoData,
  SubAccountBasicFormData,
} from '../../AccountDetail/AccountInfo/type';

export type RefFuncs = {
  subForm: () => Promise<SubAccountBasicFormData>;
  getForm: () => Promise<Form>;
  restProductIdDataSource: () => Promise<any>;
  setFormValue?: (values: Record<string, any>) => void;
};

export type AccountInfoBasicFormProps = {
  cRef: Ref<RefFuncs>;
  accountInfo?: AccountingInfoData;
  isDetail?: boolean;
  /** 是否是分享页面 */
  shareStatus?: boolean;
};
