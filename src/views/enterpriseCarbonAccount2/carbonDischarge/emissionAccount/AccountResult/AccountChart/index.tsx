import { FC, useState } from 'react';

import { EVersionType } from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';

import CateChart from './CateChart';
import GaugeChart from './GaugeChart';
import SankeyChart from './SankeyChart';

type AccountChartProps = {
  agentPreviewLayout?: boolean;
  period: string;
  refreshFlag: boolean;
  computationId?: number;
  computationPeriod?: string;
  hideQuantityChart?: boolean;
  orgId?: number | string;
  orgType?: string;
  sessionId?: string;
  shareId?: string;
  versionType?: EVersionType;
};

const AccountChart: FC<AccountChartProps> = ({
  agentPreviewLayout,
  computationId,
  refreshFlag,
  computationPeriod,
  hideQuantityChart,
  orgId,
  period,
  sessionId,
  shareId,
  orgType,
  versionType,
}) => {
  const [foreignId, setForeignId] = useState<number>();

  return (
    <>
      {!hideQuantityChart && (
        <GaugeChart
          refreshFlag={refreshFlag}
          computationId={computationId}
          computationPeriod={computationPeriod}
          orgId={orgId}
          orgType={orgType}
          period={period}
          sessionId={sessionId}
          shareId={shareId}
          foreignId={foreignId}
          setForeignId={setForeignId}
        />
      )}
      <CateChart
        agentPreviewLayout={agentPreviewLayout}
        refreshFlag={refreshFlag}
        orgId={orgId}
        computationId={computationId}
        computationPeriod={computationPeriod}
        period={period}
        sessionId={sessionId}
        shareId={shareId}
        type={Number(versionType || EVersionType.ghg)}
      />
      <SankeyChart
        refreshFlag={refreshFlag}
        orgId={orgId}
        computationId={computationId}
        computationPeriod={computationPeriod}
        period={period}
        sessionId={sessionId}
        shareId={shareId}
        type={Number(versionType || EVersionType.ghg)}
      />
    </>
  );
};

export default AccountChart;
