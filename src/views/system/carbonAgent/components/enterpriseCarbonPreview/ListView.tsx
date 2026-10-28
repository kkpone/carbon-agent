import { EcoinventGeographyContext } from '@/components/SearchFactor/ModalFactor/ecoinventContext';
import { RouteMaps } from '@src/router/route-paths';
import { Empty, Spin } from 'antd';
import { lazy, Suspense } from 'react';
import { MemoryRouter } from 'react-router-dom';

import I18N from '@/lang/I18N';
import { EVersionType } from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';
import { StepType } from '@/views/enterpriseCarbonAccount2/accounting/type';

import styles from './index.module.less';
import type { EnterpriseCarbonAccountingContext } from './types';

const AccountingPreview = lazy(
  () => import('@/views/enterpriseCarbonAccount2/accounting'),
);

// Agent 分享只切换入口路由，详情内部的列表/结果/排放源接口继续复用普通链路。
const AGENT_ACCOUNTING_PREVIEW_API_PROPS = {
  useShareApis: false,
} as const;

type ListViewProps = {
  accountingContext?: EnterpriseCarbonAccountingContext;
  interactionReadonly?: boolean;
  readonly?: boolean;
  projectId?: string;
  sessionId?: string;
  shareId?: string;
  stepOverride?: StepType;
  versionType?: EVersionType;
};

const getOptionalString = (value?: string | number | null) => {
  const text =
    value === undefined || value === null ? '' : String(value).trim();

  return text === 'undefined' || text === 'null' ? '' : text;
};

export const getAccountingPreviewUrl = (
  accountingContext: EnterpriseCarbonAccountingContext,
  {
    readonly = false,
    stepOverride,
  }: {
    readonly?: boolean;
    stepOverride?: StepType;
  } = {},
) => {
  const basePath = readonly
    ? RouteMaps.enterpriseCarbonAccountingAccountingShare
    : RouteMaps.enterpriseCarbonAccountingAccounting;
  const period = getOptionalString(accountingContext.period);
  const companyId = getOptionalString(accountingContext.companyId);
  const computationId = getOptionalString(accountingContext.computationId);
  const computationPeriod = getOptionalString(
    accountingContext.computationPeriod,
  );
  const computationStatus = getOptionalString(accountingContext.status);
  const orgName = getOptionalString(accountingContext.orgName);
  const orgType = getOptionalString(accountingContext.orgType);
  const periodName = getOptionalString(accountingContext.periodName);
  const reportId = getOptionalString(accountingContext.reportId);
  const step = getOptionalString(stepOverride ?? accountingContext.step);
  const year = getOptionalString(accountingContext.year);
  const preOrgId = getOptionalString(accountingContext.preOrgId);
  const orgId = getOptionalString(accountingContext.orgId);

  if (computationId) {
    return `${basePath}?computationId=${computationId}&computationPeriod=${
      computationPeriod || ''
    }&orgId=${
      orgId ?? ''
    }&step=${step}&periodName=${periodName}&companyId=${companyId}&reportId=${reportId}&year=${year}&orgName=${orgName}&preOrgId=${preOrgId}`;
  }

  return `${basePath}?orgId=${orgId ?? ''}&computationPeriod=${
    computationPeriod || ''
  }&orgName=${orgName ?? ''}&orgType=${
    orgType ?? ''
  }&computationStatus=${computationStatus}&period=${period}&periodName=${periodName}&companyId=${companyId}&reportId=${reportId}&year=${year}&preOrgId=${preOrgId}`;
};

export const AccountingRoutePreview = ({
  accountingContext,
  interactionReadonly = false,
  readonly = false,
  projectId,
  sessionId,
  shareId,
  stepOverride,
  versionType,
}: ListViewProps) => {
  if (!accountingContext) {
    return (
      <div className={styles.previewLoading}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={I18N.carbonAgent.noData}
        />
      </div>
    );
  }

  const previewUrl = getAccountingPreviewUrl(accountingContext, {
    readonly,
    stepOverride,
  });

  return (
    <div className={styles.listView}>
      <MemoryRouter initialEntries={[previewUrl]} key={previewUrl}>
        <Suspense
          fallback={
            <div className={styles.previewLoading}>
              <Spin />
            </div>
          }
        >
          <AccountingPreview
            agentVersionType={versionType}
            embedded
            forceReadonly={interactionReadonly}
            isShare={readonly}
            previewMode='agent'
            projectId={projectId}
            sessionId={sessionId}
            shareId={shareId}
            {...AGENT_ACCOUNTING_PREVIEW_API_PROPS}
          />
        </Suspense>
      </MemoryRouter>
    </div>
  );
};

const ListView = ({
  accountingContext,
  interactionReadonly = false,
  readonly = false,
  projectId,
  sessionId,
  shareId,
  stepOverride,
  versionType,
}: ListViewProps) => (
  <EcoinventGeographyContext.Provider value>
    <AccountingRoutePreview
      accountingContext={accountingContext}
      interactionReadonly={interactionReadonly}
      readonly={readonly}
      projectId={projectId}
      sessionId={sessionId}
      shareId={shareId}
      stepOverride={stepOverride}
      versionType={versionType}
    />
  </EcoinventGeographyContext.Provider>
);

export default ListView;
