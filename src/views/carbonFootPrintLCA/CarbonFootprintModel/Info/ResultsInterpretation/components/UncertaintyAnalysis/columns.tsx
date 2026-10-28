import type { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';

import { AssessmentUncertaintyListResp } from '@/views/carbonFootPrintLCA/CarbonFootprintModel/type';

/** 不确定性分析 */
export const uncertaintyAnalysisColumns =
  (): ProColumns<AssessmentUncertaintyListResp>[] =>
    compact([
      {
        title: I18N.carbonFootPrintLCA.impactAssessmentRefersTo,
        dataIndex: 'assessmentTargetName',
        ellipsis: true,
      },
      {
        title: I18N.carbonFootPrintLCA.averageValue,
        dataIndex: 'avgValue',
        ellipsis: true,
      },
      {
        title: I18N.carbonFootPrintLCA.medianValue,
        dataIndex: 'medianValue',
        ellipsis: true,
      },
      {
        title: I18N.carbonFootPrintLCA.standardDeviation,
        dataIndex: 'deviationValue',
        ellipsis: true,
      },
      {
        title: I18N.carbonFootPrintLCA.change,
        dataIndex: 'changeValue',
        ellipsis: true,
      },
      {
        title: I18N.carbonFootPrintLCA.lowerLimit,
        dataIndex: 'floorValue',
        ellipsis: true,
      },
      {
        title: I18N.carbonFootPrintLCA.goLive,
        dataIndex: 'upperValue',
        ellipsis: true,
      },
    ]);
