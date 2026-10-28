import { checkPermissions } from '@src/components/Permission/utils';
import I18N from '@src/lang/I18N';
import { apiComputationInfo } from '@src/views/enterpriseCarbonAccount2/accounting/baseInfo/service';
import { Spin, Tabs } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { VFC, useEffect, useState } from 'react';

import { EVersionType } from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';

import AccountChart from './AccountChart';
import styles from './index.module.less';
import AccountReport from '../report';

const { TabPane } = Tabs;

const TAB_KEYS = {
  OVERVIEW: 'OVERVIEW',
  DETAILS: 'DETAILS',
};

type AccountResultProps = {
  agentPreviewLayout?: boolean;
  refreshFlag: boolean;
  computationId?: number | string;
  computationPeriod?: string;
  overviewOnly?: boolean;
  orgId?: number | string;
  orgType?: string;
  period?: string;
  sessionId?: string;
  shareId?: string;
  versionType?: EVersionType;
};

const AccountResult: VFC<AccountResultProps> = ({
  agentPreviewLayout,
  computationId,
  computationPeriod,
  overviewOnly = false,
  orgId,
  period,
  sessionId,
  shareId,
  orgType,
  versionType,
  refreshFlag,
}) => {
  const [accountInfo, setAccountInfo] = useState<{
    timeType: number;
    period: string;
    name: string;
  }>();

  const [loading, setLoading] = useState(false);

  const [tabKey, setTabKey] = useState<string>(TAB_KEYS.OVERVIEW);

  useEffect(() => {
    let ignore = false;

    if (isNil(computationId)) {
      setAccountInfo(undefined);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setAccountInfo(undefined);
    apiComputationInfo({ computationId, computationPeriod })
      .then(({ data }) => {
        if (!ignore) {
          setAccountInfo(data.data);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [computationId, computationPeriod]);

  useEffect(() => {
    setTabKey(TAB_KEYS.OVERVIEW);
  }, [refreshFlag]);

  const chartComputationId = isNil(computationId)
    ? undefined
    : Number(computationId);
  const canRenderResultContent = isNil(computationId)
    ? !isNil(orgId)
    : Boolean(accountInfo);
  const resultPeriod = accountInfo ? accountInfo.period : period ?? '';

  return (
    <div
      className={classNames(styles.accountResult, {
        [styles.accountResultOverviewOnly]: overviewOnly,
      })}
    >
      <Spin spinning={loading}>
        {!overviewOnly && (
          <Tabs
            className={styles.accountResultTab}
            activeKey={tabKey}
            onChange={setTabKey}
          >
            <TabPane
              key={TAB_KEYS.OVERVIEW}
              tab={I18N.carbonFootprint.dataOverview}
              disabled={!accountInfo && !orgId}
            />
            {checkPermissions(
              <TabPane
                key={TAB_KEYS.DETAILS}
                tab={I18N.enterpriseCarbonAccount2.dataDetails}
                disabled={!accountInfo && !orgId}
              />,
              'enterprise:computation:table',
            )}
          </Tabs>
        )}
        {canRenderResultContent &&
          (overviewOnly || tabKey === TAB_KEYS.OVERVIEW) && (
            <AccountChart
              agentPreviewLayout={agentPreviewLayout}
              refreshFlag={refreshFlag}
              hideQuantityChart
              orgId={orgId}
              orgType={orgType}
              versionType={versionType}
              computationId={chartComputationId}
              computationPeriod={computationPeriod}
              period={resultPeriod}
              sessionId={sessionId}
              shareId={shareId}
            />
          )}
        {!overviewOnly &&
          canRenderResultContent &&
          tabKey === TAB_KEYS.DETAILS && (
            <div className={styles.accountDataDetails}>
              <AccountReport
                computationId={computationId ? `${computationId}` : undefined}
                computationPeriod={computationPeriod}
                orgId={orgId}
                orgType={orgType}
                versionType={versionType}
                name={
                  accountInfo?.name ||
                  I18N.template(I18N.enterpriseCarbonAccount2.newUr, {
                    val1:
                      new URLSearchParams(location.search).get('orgName') ?? '',
                    val2: period ?? '',
                  })
                }
                period={resultPeriod}
                isPage={false}
              />
            </div>
          )}
      </Spin>
    </div>
  );
};

export default AccountResult;
