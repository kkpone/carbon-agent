/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-10 15:25:28
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-10 16:04:08
 */

import { FromItemProps } from '@src/components/FormUtil/type';
import I18N from '@src/lang/I18N';

export const formItems = (): FromItemProps<any>[] => [
  {
    label: '',
    name: 'reportName',
    type: 'input',
    rules: false,
    placeholder: I18N.carbonFootprint.reportName,
    props: {
      style: { width: 260 },
      maxLength: 50,
    },
  },
];
