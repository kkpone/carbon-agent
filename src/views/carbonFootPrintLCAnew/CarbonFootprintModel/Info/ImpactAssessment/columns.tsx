import type { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { ColumnType } from 'antd/lib/table';
import { compact } from 'lodash-es';

import { formatScientific } from '@/utils';

import { AssessmentDataResp, ImpactAssessmentResp } from '../../type';

/** 生命周期阶段影响评价 */
export const columns = (
  currentUnit: string,
): ProColumns<ImpactAssessmentResp>[] =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.lifeCycleStage,
      dataIndex: 'lifeCycle',
      ellipsis: true,
    },

    {
      title: currentUnit
        ? I18N.template(I18N.carbonFootPrintLCA.numericalCur, {
            val1: currentUnit,
          })
        : I18N.carbonFootPrintLCA.numericalValue,
      dataIndex: 'dataValue',
      ellipsis: true,
      render: (_v, row) => formatScientific(row?.dataValue, true),
    },
    {
      title: `${I18N.carbonFootPrintLCA.percentage}(%)`,
      dataIndex: 'ratio',
      ellipsis: true,
    },
  ]);

/** 整体影响评价结果 */
export const impactResultColumns = (): ColumnType<AssessmentDataResp>[] =>
  compact([
    {
      title: I18N.certificationReviewCenter.evaluatingIndicator,
      dataIndex: 'assessmentTargetName',
      ellipsis: true,
    },

    {
      title: I18N.carbonFootPrintLCA.numericalValue,
      dataIndex: 'dataValue',
      ellipsis: true,
      render: v => formatScientific(v, true),
    },
    {
      title: I18N.Factors.unit,
      dataIndex: 'unit',
      ellipsis: true,
    },
  ]);
