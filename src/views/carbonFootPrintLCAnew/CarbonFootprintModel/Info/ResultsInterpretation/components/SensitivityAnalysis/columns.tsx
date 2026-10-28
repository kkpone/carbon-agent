import type { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';

import { SensibilityAnalysisListResp } from '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/type';

/** 敏感性分析 */
export const sensitivityAnalysisColumns =
  (): ProColumns<SensibilityAnalysisListResp>[] =>
    compact([
      {
        title: I18N.carbonFootPrintLCA.lifeCycleStage,
        dataIndex: 'lifeCycle',
        ellipsis: true,
      },
      {
        title: I18N.carbonFootPrintLCA.processName,
        dataIndex: 'processName',
        ellipsis: true,
      },
      {
        title: I18N.carbonFootPrintLCA.dataClassification,
        dataIndex: 'linkCategory_name',
        ellipsis: true,
      },
      {
        title: I18N.carbonFootPrintLCA.streamName,
        dataIndex: 'ioName',
        ellipsis: true,
      },
      {
        title: I18N.carbonFootPrintLCA.susceptibility,
        dataIndex: 'dataValue',
        ellipsis: true,
      },
    ]);
