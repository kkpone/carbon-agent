import classNames from 'classnames';
import { FC } from 'react';

import styles from './index.module.less';
import AccountResult from '../../carbonDischarge/emissionAccount/AccountResult';
import { DataComputationBackData } from '../baseInfo/service';
import { EVersionType } from '../fillData/service';

type AccountResultProps = {
  agentPreviewLayout?: boolean;
  computationId?: number | string;
  computationInfo?: DataComputationBackData | null;
  computationPeriod?: string;
  overviewOnly?: boolean;
  orgId?: number | string;
  orgType?: string;
  period?: string;
  sessionId?: string;
  shareId?: string;
  versionType: EVersionType;
  refreshFlag: boolean;
};

export const Result: FC<AccountResultProps> = props => {
  const {
    agentPreviewLayout,
    orgId,
    orgType,
    period,
    sessionId,
    shareId,
    computationId: computationIdProp,
    computationInfo,
    computationPeriod,
    overviewOnly,
    versionType,
    refreshFlag,
  } = props;

  const computationId = computationIdProp ?? computationInfo?.computationId;

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.wrapperOverviewOnly]: overviewOnly,
        [styles.wrapperAgentPreview]: agentPreviewLayout && overviewOnly,
      })}
    >
      <AccountResult
        agentPreviewLayout={agentPreviewLayout}
        refreshFlag={refreshFlag}
        computationId={computationId}
        computationPeriod={computationPeriod}
        overviewOnly={overviewOnly}
        orgId={orgId}
        orgType={orgType}
        period={period}
        sessionId={sessionId}
        shareId={shareId}
        versionType={versionType}
      />
    </div>
  );
};
