import I18N from '@src/lang/I18N';
import { TabsProps } from 'antd';

export const TAB_TYPE = {
  /** 贡献度分析 */
  CONTRIBUTION_ANALYSIS: '1',
  /** 敏感性分析 */
  SENSITIVITY_ANALYSIS: '2',
  /** 不确定性分析 */
  UNCERTAINTY_ANALYSIS: '3',
  /** 数据质量评价 */
  DATA_QUALITY_EVALUATION: '4',
} as const;

const {
  CONTRIBUTION_ANALYSIS,
  SENSITIVITY_ANALYSIS,
  UNCERTAINTY_ANALYSIS,
  DATA_QUALITY_EVALUATION,
} = TAB_TYPE;

export const TAB_OPTIONS: TabsProps['items'] = [
  {
    key: CONTRIBUTION_ANALYSIS,
    label: I18N.carbonFootPrintLCA.contributionAnalysis,
  },
  {
    key: SENSITIVITY_ANALYSIS,
    label: I18N.carbonFootPrintLCA.sensitivityAnalysis,
  },
  {
    key: UNCERTAINTY_ANALYSIS,
    label: I18N.carbonFootPrintLCA.uncertaintyScore2,
  },
  {
    key: DATA_QUALITY_EVALUATION,
    label: I18N.carbonFootPrintLCA.dataQualityAssessment3,
  },
];
