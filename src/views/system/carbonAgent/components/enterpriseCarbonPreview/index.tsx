import { Spin } from 'antd';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';

import { checkPermissions } from '@/components/Permission/utils';
import { useUserOrgType } from '@/hooks/useOrgType';
import I18N from '@/lang/I18N';
import { Toast } from '@/utils';
import {
  computationRevokeSubmit,
  getAgentOrgAccountDataByShare,
  getAccountingPeriodList,
  getOrgAccountData,
} from '@/views/enterpriseCarbonAccount2/AccountingList/service';
import type {
  OrgAccount,
  OrgAccountData,
} from '@/views/enterpriseCarbonAccount2/AccountingList/type';
import { EVersionType } from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';
import { submitEnterpriseAccounting } from '@/views/enterpriseCarbonAccount2/accounting/submitAccounting';
import {
  COMPUTATION_STATUS,
  ORG_TYPE,
} from '@/views/enterpriseCarbonAccount2/constant';

import AccountingPreviewHeader from './AccountingPreviewHeader';
import CanvasView from './CanvasView';
import ListView from './ListView';
import OrgTree, { getOrgNodeKey } from './OrgTree';
import ResultView from './ResultView';
import {
  buildAgentAccountingContextFromOrgNode,
  normalizeEnterpriseCarbonOrgNode,
} from './accountingContext';
import styles from './index.module.less';
import {
  formatEnterpriseCarbonAccountingTitle,
  formatEnterpriseCarbonPeriodName,
  getEnterpriseCarbonAccountingYear,
  getEnterpriseCarbonPeriodParamName,
} from './periodText';
import type {
  EnterpriseCarbonAccountingPermissions,
  EnterpriseCarbonAccountingContext,
  EnterpriseCarbonAccountingPreviewTarget,
  EnterpriseCarbonOrgNode,
  EnterpriseCarbonOrgPeriod,
  EnterpriseCarbonPreviewView,
} from './types';

type EnterpriseCarbonPreviewProps = {
  activeView?: EnterpriseCarbonPreviewView;
  open?: boolean;
  permissions?: EnterpriseCarbonAccountingPermissions;
  projectId?: string;
  readonly?: boolean;
  sessionId?: string;
  shareId?: string;
  target: EnterpriseCarbonAccountingPreviewTarget;
  onViewChange?: (view: EnterpriseCarbonPreviewView) => void;
};

type AgentOrgAccountParams = {
  period?: number | string;
  sessionId?: string;
  shareId?: string;
  year: string;
};

const transformAccountingOrgTree = (
  orgList: OrgAccount[] = [],
): EnterpriseCarbonOrgNode[] =>
  orgList.map(org =>
    normalizeEnterpriseCarbonOrgNode({
      ...(org as unknown as Record<string, unknown>),
      children: org.children?.length
        ? transformAccountingOrgTree(org.children)
        : undefined,
      id: String(org.id),
      name: org.name,
      orgId: String(org.id),
      orgName: org.orgName || org.name,
      orgType:
        org.orgType === undefined || org.orgType === null
          ? undefined
          : String(org.orgType),
      status:
        org.status === undefined || org.status === null
          ? undefined
          : String(org.status),
    } as EnterpriseCarbonOrgNode & Record<string, unknown>),
  );

const findOrgNodeByKey = (
  nodes: EnterpriseCarbonOrgNode[] = [],
  key?: string,
): EnterpriseCarbonOrgNode | undefined => {
  if (!key) {
    return undefined;
  }

  return nodes.reduce<EnterpriseCarbonOrgNode | undefined>(
    (matchedNode, node) => {
      if (matchedNode) {
        return matchedNode;
      }

      if (
        getOrgNodeKey(node) === key ||
        node.id === key ||
        node.orgId === key
      ) {
        return node;
      }

      return findOrgNodeByKey(node.children, key);
    },
    undefined,
  );
};

const isMainPartOrgNode = (node?: EnterpriseCarbonOrgNode) =>
  Number(node?.orgType) === ORG_TYPE.MAIN_PART;

const isOrgNodeMatchedPeriod = (
  node?: EnterpriseCarbonOrgNode,
  period?: EnterpriseCarbonOrgPeriod,
) => {
  const periodValue = getPeriodValue(period);

  if (!node || !periodValue) {
    return true;
  }

  const nodePeriod = getOptionalString(node.computationPeriod);

  return !nodePeriod || nodePeriod === periodValue;
};

const findFirstMainPartOrgNode = (
  nodes: EnterpriseCarbonOrgNode[] = [],
): EnterpriseCarbonOrgNode | undefined =>
  nodes.reduce<EnterpriseCarbonOrgNode | undefined>((matchedNode, node) => {
    if (matchedNode) {
      return matchedNode;
    }

    if (isMainPartOrgNode(node)) {
      return node;
    }

    return findFirstMainPartOrgNode(node.children);
  }, undefined);

const getInitialActiveOrgId = (
  organizationTree: EnterpriseCarbonOrgNode[] = [],
) => {
  const firstMainPartNode = findFirstMainPartOrgNode(organizationTree);

  return firstMainPartNode ? getOrgNodeKey(firstMainPartNode) : undefined;
};

const getOptionalString = (value?: string) => {
  const normalizedValue = value?.trim();

  return normalizedValue || undefined;
};

const getTargetAccountingYear = (
  target: EnterpriseCarbonAccountingPreviewTarget,
) => getEnterpriseCarbonAccountingYear(target.year);

const getPeriodValue = (period?: EnterpriseCarbonOrgPeriod) => {
  if (!period) {
    return undefined;
  }

  const value = `${period.value}`.trim();

  return value || undefined;
};

const getExplicitAccountingVersionType = (
  versionType?: EnterpriseCarbonAccountingContext['versionType'],
) => {
  if (versionType === EVersionType.iso || versionType === EVersionType.ghg) {
    return versionType;
  }

  return undefined;
};

const getOrgInfoByPeriod = (
  data?: OrgAccountData,
  period?: EnterpriseCarbonOrgPeriod,
) => {
  const periodValue = getPeriodValue(period);

  if (!data?.orgInfoList?.length) {
    return undefined;
  }

  if (!periodValue) {
    return data.orgInfoList[0];
  }

  return data.orgInfoList.find(
    orgInfo => String(orgInfo.computationPeriod) === periodValue,
  );
};

const getAgentOrgAccountParams = (
  accountingYear?: string,
  activePeriod?: EnterpriseCarbonOrgPeriod,
  readonly = false,
  sessionId?: string,
  shareId?: string,
): AgentOrgAccountParams | undefined => {
  if (!accountingYear || (readonly && !sessionId)) {
    return undefined;
  }

  const params: AgentOrgAccountParams = {
    year: accountingYear,
  };

  if (readonly && sessionId) {
    params.sessionId = sessionId;
  }

  if (shareId) {
    params.shareId = shareId;
  }

  if (activePeriod) {
    params.period = activePeriod.value;
  }

  return params;
};

const getProjectAgentOrgAccountParams = (
  accountingYear?: string,
  activePeriod?: EnterpriseCarbonOrgPeriod,
  sessionId?: string,
  shareId?: string,
): AgentOrgAccountParams | undefined => {
  if (!accountingYear || !sessionId) {
    return undefined;
  }

  return {
    ...(activePeriod ? { period: activePeriod.value } : {}),
    sessionId,
    ...(shareId ? { shareId } : {}),
    year: accountingYear,
  };
};

const getAccountingPeriodParams = (
  accountingYear?: string,
  readonly = false,
  sessionId?: string,
  shareId?: string,
): Parameters<typeof getAccountingPeriodList>[0] | undefined => {
  if (!accountingYear || (readonly && !sessionId)) {
    return undefined;
  }

  return {
    cYear: accountingYear,
    ...(readonly ? { sessionId } : {}),
    ...(shareId ? { shareId } : {}),
  };
};

const getProjectAccountingPeriodParams = (
  accountingYear?: string,
  sessionId?: string,
  shareId?: string,
): Parameters<typeof getAccountingPeriodList>[0] | undefined => {
  if (!accountingYear || !sessionId) {
    return undefined;
  }

  return {
    cYear: accountingYear,
    sessionId,
    ...(shareId ? { shareId } : {}),
  };
};

const getWorkView = (view: EnterpriseCarbonPreviewView) =>
  view === 'list' ? 'list' : 'canvas';

const getOrgAccountRequestPeriod = (period?: number | string) => {
  const periodValue =
    period === undefined || period === null ? '' : `${period}`;

  return periodValue.trim() ? period : undefined;
};

const fetchAgentOrgAccountData = (
  params: AgentOrgAccountParams,
  readonly: boolean,
) => {
  const period = getOrgAccountRequestPeriod(params.period);
  const baseParams = {
    ...(period !== undefined ? { period } : {}),
    year: params.year,
  };

  return readonly
    ? getAgentOrgAccountDataByShare({
        ...baseParams,
        sessionId: params.sessionId || '',
        ...(params.shareId ? { shareId: params.shareId } : {}),
      })
    : getOrgAccountData(baseParams);
};

const fetchProjectAgentOrgAccountData = (
  params: AgentOrgAccountParams,
  readonly: boolean,
) => {
  const period = getOrgAccountRequestPeriod(params.period);
  const baseParams = {
    ...(period !== undefined ? { period } : {}),
    sessionId: params.sessionId,
    ...(params.shareId ? { shareId: params.shareId } : {}),
    year: params.year,
  };

  return readonly
    ? getAgentOrgAccountDataByShare({
        ...baseParams,
        sessionId: params.sessionId || '',
      })
    : getOrgAccountData(baseParams);
};

const EnterpriseCarbonPreview = ({
  activeView = 'canvas',
  onViewChange,
  open = true,
  permissions,
  projectId,
  readonly = false,
  sessionId,
  shareId,
  target,
}: EnterpriseCarbonPreviewProps) => {
  const projectSessionId = projectId ? sessionId : undefined;
  const projectShareId = projectId ? shareId : undefined;
  const canViewAccounting =
    permissions?.canViewAccounting === undefined
      ? true
      : permissions.canViewAccounting;
  const canEditAccounting =
    !readonly &&
    (permissions?.canEditAccounting === undefined
      ? true
      : permissions.canEditAccounting);
  const hasEmissionSourceEditPermission = !!checkPermissions(
    true,
    'enterprise:computation:edit',
  );
  const canEditEmissionSource =
    !readonly &&
    hasEmissionSourceEditPermission &&
    (permissions?.canEditEmissionSource === undefined
      ? true
      : permissions.canEditEmissionSource);
  const canCreateTask =
    !readonly &&
    (permissions?.canCreateTask === undefined
      ? true
      : permissions.canCreateTask);
  const accountingYear = useMemo(
    () => getTargetAccountingYear(target),
    [target],
  );
  const detailYear = useMemo(
    () => getEnterpriseCarbonAccountingYear(target.year) || accountingYear,
    [accountingYear, target.year],
  );
  const userOrgType = useUserOrgType({ isShare: readonly });
  const [periodList, setPeriodList] = useState<EnterpriseCarbonOrgPeriod[]>([]);
  const [periodListLoaded, setPeriodListLoaded] = useState(false);
  const [orgAccountData, setOrgAccountData] = useState<OrgAccountData>();
  const [organizationTree, setOrganizationTree] = useState<
    EnterpriseCarbonOrgNode[]
  >([]);
  const [orgTreeLoading, setOrgTreeLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [orgTreeCollapsed, setOrgTreeCollapsed] = useState(true);
  const [versionType, setVersionType] = useState<EVersionType>(
    () =>
      getExplicitAccountingVersionType(target.versionType) || EVersionType.ghg,
  );
  const [activePeriodValue, setActivePeriodValue] = useState<
    string | undefined
  >();
  const [activeOrgId, setActiveOrgId] = useState<string | undefined>();
  const activeOrg = useMemo(
    () => findOrgNodeByKey(organizationTree, activeOrgId),
    [activeOrgId, organizationTree],
  );
  const activePeriod = useMemo(
    () =>
      periodList.find(period => getPeriodValue(period) === activePeriodValue),
    [periodList, activePeriodValue],
  );
  const orgAccountParams = useMemo(
    () =>
      canViewAccounting
        ? projectId
          ? getProjectAgentOrgAccountParams(
              accountingYear,
              activePeriod,
              sessionId,
              projectShareId,
            )
          : getAgentOrgAccountParams(
              accountingYear,
              activePeriod,
              readonly,
              sessionId,
              shareId,
            )
        : undefined,
    [
      accountingYear,
      activePeriod,
      canViewAccounting,
      projectId,
      projectShareId,
      readonly,
      sessionId,
      shareId,
    ],
  );
  const accountingPeriodParams = useMemo(
    () =>
      canViewAccounting
        ? projectId
          ? getProjectAccountingPeriodParams(
              accountingYear,
              projectSessionId,
              projectShareId,
            )
          : getAccountingPeriodParams(
              accountingYear,
              readonly,
              sessionId,
              shareId,
            )
        : undefined,
    [
      accountingYear,
      canViewAccounting,
      projectId,
      projectSessionId,
      projectShareId,
      readonly,
      sessionId,
      shareId,
    ],
  );
  const [lastWorkView, setLastWorkView] =
    useState<EnterpriseCarbonPreviewView>('canvas');

  useEffect(() => {
    if (!open) {
      setOrgTreeCollapsed(true);
    }
  }, [open]);

  const activeOrgInfo = useMemo(
    () => getOrgInfoByPeriod(orgAccountData, activePeriod),
    [activePeriod, orgAccountData],
  );
  const activePeriodName = useMemo(() => {
    if (!accountingYear) {
      return undefined;
    }

    return getEnterpriseCarbonPeriodParamName({
      accountingYear,
      period: activePeriod,
      periodName: activeOrgInfo?.title,
    });
  }, [accountingYear, activeOrgInfo?.title, activePeriod]);
  const accountingContext = useMemo(() => {
    if (!accountingYear || !isOrgNodeMatchedPeriod(activeOrg, activePeriod)) {
      return undefined;
    }

    return buildAgentAccountingContextFromOrgNode({
      accountingYear,
      activePeriod,
      detailYear,
      orgNode: activeOrg,
      periodName: activePeriodName,
      userOrgType,
    });
  }, [
    accountingYear,
    activeOrg,
    activePeriod,
    activePeriodName,
    detailYear,
    userOrgType,
  ]);
  const periodDisplayName = useMemo(
    () =>
      formatEnterpriseCarbonPeriodName({
        accountingYear,
        period: activePeriod,
        periodName: activePeriodName,
      }),
    [accountingYear, activePeriod, activePeriodName],
  );
  const accountingToolbarTitle = useMemo(
    () => formatEnterpriseCarbonAccountingTitle(accountingYear),
    [accountingYear],
  );
  const isAccountingCompleted =
    Number(accountingContext?.status) === COMPUTATION_STATUS.COMPLETE;

  const refreshOrgAccountData = async () => {
    if (!canViewAccounting || !orgAccountParams) {
      return;
    }

    setOrgTreeLoading(true);

    try {
      const { data } = await (projectId
        ? fetchProjectAgentOrgAccountData(orgAccountParams, readonly)
        : fetchAgentOrgAccountData(orgAccountParams, readonly));
      const nextOrgAccountData = data.data;
      const currentOrgInfo = getOrgInfoByPeriod(
        nextOrgAccountData,
        activePeriod,
      );

      setOrgAccountData(nextOrgAccountData);
      setOrganizationTree(
        transformAccountingOrgTree(currentOrgInfo?.orgList || []),
      );
    } finally {
      setOrgTreeLoading(false);
    }
  };

  useEffect(() => {
    if (!accountingPeriodParams) {
      setPeriodList([]);
      setPeriodListLoaded(false);
      setOrgAccountData(undefined);
      setOrganizationTree([]);
      return undefined;
    }

    let ignore = false;

    setOrgTreeLoading(true);
    setPeriodListLoaded(false);
    getAccountingPeriodList(accountingPeriodParams)
      .then(({ data }) => {
        if (ignore) {
          return;
        }

        const nextPeriods = data.data || [];

        setPeriodList(nextPeriods);
        setPeriodListLoaded(true);
        setActivePeriodValue(currentValue => {
          if (
            currentValue &&
            nextPeriods.some(period => getPeriodValue(period) === currentValue)
          ) {
            return currentValue;
          }

          return getPeriodValue(nextPeriods[0]);
        });
      })
      .catch(() => {
        if (!ignore) {
          setPeriodList([]);
          setPeriodListLoaded(false);
          setOrganizationTree([]);
        }
      })
      .finally(() => {
        if (!ignore) {
          setOrgTreeLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [accountingPeriodParams]);

  useEffect(() => {
    if (!accountingYear) {
      setOrgAccountData(undefined);
      setOrganizationTree([]);
      return undefined;
    }

    if (!periodListLoaded) {
      setOrgAccountData(undefined);
      setOrganizationTree([]);
      return undefined;
    }

    if (periodList.length > 0 && !activePeriod) {
      setOrgAccountData(undefined);
      setOrganizationTree([]);
      return undefined;
    }

    if (!orgAccountParams) {
      setOrgAccountData(undefined);
      setOrganizationTree([]);
      setActiveOrgId(undefined);
      return undefined;
    }

    let ignore = false;
    setOrgTreeLoading(true);
    (projectId
      ? fetchProjectAgentOrgAccountData(orgAccountParams, readonly)
      : fetchAgentOrgAccountData(orgAccountParams, readonly)
    )
      .then(({ data }) => {
        if (ignore) {
          return;
        }

        const nextOrgAccountData = data.data;
        const currentOrgInfo = getOrgInfoByPeriod(
          nextOrgAccountData,
          activePeriod,
        );

        setOrgAccountData(nextOrgAccountData);
        setOrganizationTree(
          transformAccountingOrgTree(currentOrgInfo?.orgList || []),
        );
      })
      .catch(() => {
        if (!ignore) {
          setOrgAccountData(undefined);
          setOrganizationTree([]);
        }
      })
      .finally(() => {
        if (!ignore) {
          setOrgTreeLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [
    accountingYear,
    activePeriod,
    orgAccountParams,
    periodList.length,
    periodListLoaded,
    projectId,
    readonly,
  ]);

  useEffect(() => {
    setActiveOrgId(currentOrgId => {
      if (isMainPartOrgNode(findOrgNodeByKey(organizationTree, currentOrgId))) {
        return currentOrgId;
      }

      return getInitialActiveOrgId(organizationTree);
    });
  }, [organizationTree]);

  useEffect(() => {
    const explicitVersionType =
      getExplicitAccountingVersionType(accountingContext?.versionType) ||
      getExplicitAccountingVersionType(target.versionType);

    if (explicitVersionType) {
      setVersionType(explicitVersionType);
    }
  }, [accountingContext?.versionType, target.versionType]);

  useEffect(() => {
    if (activeView === 'canvas' || activeView === 'list') {
      setLastWorkView(activeView);
    }
  }, [activeView]);

  const showAccountingToolbar =
    activeView === 'canvas' || activeView === 'list';
  const showOrgPanel = activeView !== 'result';
  const showPeriodTabs = periodList.length > 0;
  const canOpenResultView = Boolean(accountingContext?.computationId);
  const accountingActionDisabled =
    !canEditAccounting || !accountingContext?.computationId;

  const openResultView = () => {
    if (!canViewAccounting || !accountingContext?.computationId) {
      return;
    }

    setLastWorkView(getWorkView(activeView));
    onViewChange?.('result');
  };

  const handleCompleteAccounting = async () => {
    if (
      !canEditAccounting ||
      !accountingContext?.computationId ||
      completeLoading
    ) {
      return;
    }

    setCompleteLoading(true);

    try {
      await submitEnterpriseAccounting({
        computationId: accountingContext.computationId,
        computationPeriod: accountingContext.computationPeriod,
        refreshComputationInfo: refreshOrgAccountData,
        showSuccessToast: false,
        skipConfirm: true,
        onSuccess: openResultView,
        onValidationFailed: () => {
          Toast('error', I18N.carbonFootprint3.pleaseImproveTheAccounting);
        },
      });
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleEditAccounting = async () => {
    if (
      !canEditAccounting ||
      !accountingContext?.computationId ||
      revokeLoading
    ) {
      return;
    }

    setRevokeLoading(true);

    try {
      await computationRevokeSubmit({
        computationId: accountingContext.computationId as unknown as number,
        computationPeriod:
          accountingContext.computationPeriod as unknown as number,
      });
      await refreshOrgAccountData();
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleResultBack = () => {
    onViewChange?.(getWorkView(lastWorkView));
  };

  const renderAccountingActions = () => {
    if (!canEditAccounting) {
      return isAccountingCompleted ? (
        <div className={styles.accountingActions}>
          <button
            type='button'
            className={styles.accountingActionSecondary}
            disabled={!canOpenResultView}
            onClick={openResultView}
          >
            {I18N.carbonAgent.enterpriseCarbonViewResults}
          </button>
        </div>
      ) : null;
    }

    if (isAccountingCompleted) {
      return (
        <div className={styles.accountingActions}>
          <button
            type='button'
            className={styles.accountingActionSecondary}
            disabled={accountingActionDisabled}
            onClick={openResultView}
          >
            {I18N.carbonAgent.enterpriseCarbonViewResults}
          </button>
          <button
            type='button'
            className={styles.accountingActionPrimary}
            disabled={accountingActionDisabled || revokeLoading}
            onClick={handleEditAccounting}
          >
            {I18N.carbonAgent.enterpriseCarbonEditAccounting}
          </button>
        </div>
      );
    }

    return (
      <div className={styles.accountingActions}>
        <button
          type='button'
          className={styles.accountingActionPrimary}
          aria-busy={completeLoading}
          disabled={accountingActionDisabled || completeLoading}
          onClick={handleCompleteAccounting}
        >
          {completeLoading ? <Spin size='small' /> : null}
          {I18N.carbonAgent.enterpriseCarbonCompleteAccounting}
        </button>
      </div>
    );
  };

  if (!canViewAccounting) {
    return (
      <div className={styles.enterpriseCarbonPreview}>
        <div className={styles.previewLoading} role='status'>
          {I18N.carbonAgent.enterpriseCarbonAccountingViewUnauthorized}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.enterpriseCarbonPreview}>
      {showAccountingToolbar ? (
        <div className={styles.accountingToolbar}>
          <h2>{accountingToolbarTitle}</h2>
          {showPeriodTabs ? (
            <div className={styles.accountingPeriodTabs}>
              {periodList.map((period, index) => {
                const value = getPeriodValue(period);
                const disabled =
                  Number(period.status) === COMPUTATION_STATUS.NOT_START;

                return (
                  <button
                    type='button'
                    className={classNames(styles.accountingPeriodTab, {
                      [styles.accountingPeriodTabActive]:
                        value === activePeriodValue,
                    })}
                    disabled={disabled}
                    key={value || period.name || index}
                    onClick={() => {
                      if (value && value !== activePeriodValue) {
                        setActivePeriodValue(value);
                      }
                    }}
                  >
                    {period.name}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
      <div
        className={classNames(
          showOrgPanel ? styles.previewBody : styles.previewBodyFull,
          {
            [styles.previewBodyOrgCollapsed]: showOrgPanel && orgTreeCollapsed,
          },
        )}
      >
        {showOrgPanel ? (
          <aside
            className={classNames(styles.orgPanel, {
              [styles.orgPanelCollapsed]: orgTreeCollapsed,
            })}
          >
            <Spin spinning={orgTreeLoading}>
              <OrgTree
                activeOrgId={activeOrgId}
                collapsed={orgTreeCollapsed}
                treeData={organizationTree}
                onCollapsedChange={setOrgTreeCollapsed}
                onSelect={node => {
                  if (isMainPartOrgNode(node)) {
                    setActiveOrgId(getOrgNodeKey(node));
                  }
                }}
              />
            </Spin>
          </aside>
        ) : null}
        <main className={styles.viewPanel}>
          {showAccountingToolbar ? (
            <AccountingPreviewHeader
              actions={renderAccountingActions()}
              computationStatus={accountingContext?.status}
              onVersionTypeChange={setVersionType}
              organizationName={activeOrg?.orgName || activeOrg?.name}
              periodName={periodDisplayName}
              versionType={versionType}
            />
          ) : null}
          <div className={styles.viewContent}>
            {activeView === 'canvas' ? (
              <CanvasView
                activeOrg={activeOrg}
                accountingContext={accountingContext}
                canCreateTask={canCreateTask}
                canEditEmissionSource={canEditEmissionSource}
                periodDisplayName={periodDisplayName}
                projectId={projectId}
                readonly={readonly}
                sessionId={projectSessionId}
                shareId={shareId}
                versionType={versionType}
              />
            ) : null}
            {activeView === 'list' ? (
              <ListView
                accountingContext={accountingContext}
                readonly={readonly}
                interactionReadonly={!canEditEmissionSource}
                projectId={projectId}
                sessionId={projectSessionId}
                shareId={shareId}
                versionType={versionType}
              />
            ) : null}
            {activeView === 'result' ? (
              <ResultView
                accountingContext={accountingContext}
                onBack={handleResultBack}
                sessionId={projectSessionId}
                shareId={shareId}
                versionType={versionType}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnterpriseCarbonPreview;
