import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { TableRenderProps } from 'table-render/dist/src/types';

import { ApplyRefDto } from './type';

export const columns = (): TableRenderProps<ApplyRefDto>['columns'] =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.number,
      dataIndex: 'allIndex',
      width: 58,
    },
    {
      title: I18N.supplyChainCarbonManagement.supplierData,
      dataIndex: 'dataCode',
      width: 160,
    },
    {
      title: I18N.carbonFootprint.supplierName,
      dataIndex: 'supplierName',
      width: 150,
    },
    {
      title: I18N.supplyChainCarbonManagement.purchaseProductName,
      dataIndex: 'productName',
      width: 150,
    },
    {
      title: I18N.certificationReviewCenter.evaluationMethods,
      dataIndex: 'assessmentMethodName',
      width: 150,
    },
    {
      title: I18N.certificationReviewCenter.evaluatingIndicator,
      dataIndex: 'assessmentTargetNames',
    },
  ]);
