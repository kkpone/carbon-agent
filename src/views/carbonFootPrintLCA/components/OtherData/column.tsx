/**
 * @description 评价指标数据表头
 */

import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/lib/table';

import { FactorDtoOther } from './type';

export const indicatorColumn = (): ColumnsType<FactorDtoOther> => [
  {
    title: I18N.certificationReviewCenter.evaluationMethods,
    dataIndex: 'assessmentMethodName',
  },
  {
    title: I18N.certificationReviewCenter.evaluatingIndicator,
    dataIndex: 'assessmentTargetName',
  },
  {
    title: I18N.carbonFootPrintLCA.numericalValue,
    dataIndex: 'dataValue',
  },
  {
    title: I18N.Factors.unit,
    dataIndex: 'unit',
  },
];
