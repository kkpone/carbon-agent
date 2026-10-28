import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { TableRenderProps } from 'table-render/dist/src/types';

import { CbamProductInfo } from './type';

export const columns = (): TableRenderProps<CbamProductInfo>['columns'] =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.number,
      dataIndex: 'allIndex',
      width: 80,
    },
    {
      title: I18N.cbam.productNameForExternalSale,
      dataIndex: 'productName',
    },
    {
      title: I18N.cbam.reportName,
      dataIndex: 'cbamName',
    },
    {
      title: I18N.Factors.updateTime,
      dataIndex: 'updateTime',
    },
  ]);
