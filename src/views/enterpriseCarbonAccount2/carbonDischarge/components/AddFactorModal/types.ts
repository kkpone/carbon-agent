/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-04-28 16:43:32
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-04 20:20:18
 */
import { Form } from '@formily/core';
import { ColUmsType } from '@src/views/emission/Show/service';
import { ModalProps } from 'antd';

import { ManualFactorData } from '../AddEmission/types';

export type AddFactorModalProps = {
  defaultFactorName?: string;
  onOk: (props: { form: Form<any>; tableData: ColUmsType[] }) => any;
  isShow?: boolean;
  factorData?: ManualFactorData;
} & Omit<ModalProps, 'onOk'>;
