import type { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { compact, includes } from 'lodash-es';

import { ContributionAnalysisNode } from '@/views/carbonFootPrintLCA/CarbonFootprintModel/type';

import { ContributionProgress } from './ContributionProgress';
import { AssessmentTargetOption, ContributionAnalysisProp } from './type';

/** 贡献度分析 */
export const contributionAnalysisColumns = ({
  currentAssessmentTargetKeys,
  assessmentTargetOptions,
  showPercent,
}: {
  currentAssessmentTargetKeys: string[];
  assessmentTargetOptions: AssessmentTargetOption[];
  showPercent: boolean;
}): ProColumns<ContributionAnalysisProp>[] => {
  /** 全部的表头 */
  const allColumns = assessmentTargetOptions?.map(item => {
    const unit = item?.unit ? `（${item?.unit}）` : '';
    return {
      title: item.label + unit,
      dataIndex: item.value,
      key: item.value,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (valueList: any, index: any) => {
        const info = valueList as ContributionAnalysisNode;
        return (
          <ContributionProgress
            key={`${item.value + index}`}
            percent={info?.ratio}
            value={info?.dataValue}
            showPercent={showPercent}
          />
        );
      },
    };
  });

  /** 展示的表头 */
  const showCol = allColumns?.filter(item =>
    includes(currentAssessmentTargetKeys, item.dataIndex),
  );

  return compact([
    {
      title: I18N.carbonFootPrintLCA.process,
      dataIndex: 'processName',
      key: 'processName',
      width: 220,
      ellipsis: true,
      fixed: 'left',
    },
    ...showCol,
  ]);
};
