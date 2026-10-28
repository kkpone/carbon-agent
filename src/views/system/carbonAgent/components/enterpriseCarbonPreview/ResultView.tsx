import I18N from '@/lang/I18N';
import { Result } from '@/views/enterpriseCarbonAccount2/accounting/Result';
import { EVersionType } from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';

import styles from './index.module.less';
import type { EnterpriseCarbonAccountingContext } from './types';

type ResultViewProps = {
  accountingContext?: EnterpriseCarbonAccountingContext;
  onBack?: () => void;
  sessionId?: string;
  shareId?: string;
  versionType: EVersionType;
};

const getVersionType = (versionType?: string) =>
  versionType === EVersionType.iso ? EVersionType.iso : EVersionType.ghg;

const ResultBackHeader = ({ onBack }: { onBack?: () => void }) =>
  onBack ? (
    <div className={styles.resultHeader}>
      <button type='button' onClick={onBack}>
        {I18N.carbonAgent.back}
      </button>
    </div>
  ) : null;

const ResultView = ({
  accountingContext,
  onBack,
  sessionId,
  shareId,
  versionType,
}: ResultViewProps) => {
  if (!accountingContext?.computationId) {
    return (
      <div className={styles.resultView}>
        <ResultBackHeader onBack={onBack} />
        <div className={styles.resultViewContent}>
          <div className={styles.previewLoading}>
            {I18N.carbonAgent.enterpriseCarbonNoAccountingOrganizations}
          </div>
        </div>
      </div>
    );
  }

  const resultKey = [
    accountingContext.computationId,
    accountingContext.computationPeriod,
    accountingContext.orgId,
    accountingContext.period,
    accountingContext.periodName,
    versionType,
  ]
    .filter(Boolean)
    .join('|');

  return (
    <div className={styles.resultView} key={resultKey}>
      <ResultBackHeader onBack={onBack} />
      <div className={styles.resultViewContent}>
        <Result
          agentPreviewLayout
          computationId={accountingContext.computationId}
          computationPeriod={accountingContext.computationPeriod}
          overviewOnly
          orgId={accountingContext.orgId}
          orgType={accountingContext.orgType}
          period={accountingContext.period}
          refreshFlag
          sessionId={sessionId}
          shareId={shareId}
          versionType={getVersionType(versionType)}
        />
      </div>
    </div>
  );
};

export default ResultView;
