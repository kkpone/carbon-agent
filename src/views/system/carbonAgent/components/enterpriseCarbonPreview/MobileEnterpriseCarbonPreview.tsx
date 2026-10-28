/**
 * @file 企业碳 Agent 移动核算预览；展示组织核算列表、核算详情及专家复核冻结核算详情。
 */
import { Dropdown, Spin } from 'antd';
import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { useUserOrgType } from '@/hooks/useOrgType';
import I18N from '@/lang/I18N';
import {
  getAgentOrgAccountDataByShare,
  getAccountingPeriodList,
  getOrgAccountData,
  getOrgAccountDataByShare,
} from '@/views/enterpriseCarbonAccount2/AccountingList/service';
import type {
  OrgAccount,
  OrgAccountData,
} from '@/views/enterpriseCarbonAccount2/AccountingList/type';
import {
  EVersionType,
  getSourceList,
  getSourceListByShare,
  type RootNode,
  type SourceGroup,
  type SourceListElement,
} from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';
import {
  COMPUTATION_STATUS,
  COMPUTATION_STATUS_LABEL,
  ORG_TYPE,
} from '@/views/enterpriseCarbonAccount2/constant';

import aiAssistantIcon from '../../../../../assets/images/carbonAgent/ai-assistant.svg';
import {
  buildAgentAccountingContextFromOrgNode,
  normalizeEnterpriseCarbonOrgNode,
} from './accountingContext';
import {
  getCanvasCategoryVisual,
  getCanvasClassifyVisual,
} from './canvasCategoryVisualMap';
import {
  formatEnterpriseCarbonAccountingTitle,
  formatEnterpriseCarbonPeriodName,
  getEnterpriseCarbonAccountingYear,
  getEnterpriseCarbonPeriodParamName,
} from './periodText';
import canvasOrgIcon from './assets/canvas-icons/org.svg';
import orgGroupIcon from './assets/org-group-icon.svg';
import orgMainIcon from './assets/org-main-icon.svg';
import orgRootIcon from './assets/org-root-icon.svg';
import styles from './index.module.less';
import type {
  EnterpriseCarbonAccountingContext,
  EnterpriseCarbonAccountingPreviewTarget,
  EnterpriseCarbonOrgNode,
  EnterpriseCarbonOrgPeriod,
} from './types';

export type EnterpriseCarbonMobileView = 'detail' | 'orgList';

type MobileEnterpriseCarbonPreviewProps = {
  projectId?: string;
  readonly?: boolean;
  sessionId?: string;
  shareId?: string;
  snapshotContext?: EnterpriseCarbonAccountingContext;
  target: EnterpriseCarbonAccountingPreviewTarget;
  view: EnterpriseCarbonMobileView;
  onViewChange: (view: EnterpriseCarbonMobileView) => void;
};

type AgentOrgAccountParams = {
  companyId?: string;
  orgId?: number | string;
  period?: number | string;
  reportId?: string;
  requestType: 'agentShare' | 'normal' | 'snapshotShare';
  sessionId?: string;
  shareId?: string;
  year: string;
};

type MobileSourceListParams = {
  companyId?: string;
  computationId: string;
  computationPeriod?: string;
  orgId?: string;
  requestType: 'normal' | 'snapshotShare';
  sessionId?: string;
  shareId?: string;
  versionType: EVersionType;
};

type StatusTone = 'completed' | 'default' | 'filling' | 'pending';

type MobileSourceListData = Awaited<ReturnType<typeof getSourceList>> & {
  emissionQuantity?: string | number | null;
  finishCount?: number;
  scopeOneRate?: string | number | null;
  scopeThreeRate?: string | number | null;
  scopeTwoRate?: string | number | null;
  totalCount?: number;
};

type MobileSourceRow = {
  classifyCode?: string | number | null;
  classifyName: string;
  emissionQuantity?: string | number | null;
  id: string;
  name: string;
  source: SourceListElement;
};

const getOptionalString = (value?: string | number | null) => {
  const text = value === undefined || value === null ? '' : `${value}`.trim();

  return text === 'undefined' || text === 'null' ? '' : text;
};

const getTargetAccountingYear = (
  target: EnterpriseCarbonAccountingPreviewTarget,
) => getEnterpriseCarbonAccountingYear(target.year);

const getPeriodValue = (period?: EnterpriseCarbonOrgPeriod) =>
  period ? getOptionalString(period.value) || undefined : undefined;

const getExplicitAccountingVersionType = (
  versionType?: string,
): EVersionType | undefined => {
  if (versionType === EVersionType.iso || versionType === EVersionType.ghg) {
    return versionType;
  }

  return undefined;
};

const getVersionLabel = (versionType?: EVersionType | string) =>
  versionType === EVersionType.iso
    ? I18N.enterpriseCarbonAccount2.isoStandard3
    : I18N.enterpriseCarbonAccount2.ghgPr2;

const getMobileStatusTone = (status?: number | string): StatusTone => {
  const statusValue = Number(status);

  if (statusValue === COMPUTATION_STATUS.COMPLETE) {
    return 'completed';
  }

  if (statusValue === COMPUTATION_STATUS.FILLING) {
    return 'filling';
  }

  if (
    statusValue === COMPUTATION_STATUS.BE_FILLED ||
    statusValue === COMPUTATION_STATUS.BE_SUBMITTED
  ) {
    return 'pending';
  }

  return 'default';
};

const getStatusLabel = (status?: number | string, fallback?: string) => {
  const statusValue = Number(status) as keyof typeof COMPUTATION_STATUS_LABEL;

  return COMPUTATION_STATUS_LABEL[statusValue] || fallback || '-';
};

const getStatusClassName = (status?: number | string) => {
  const tone = getMobileStatusTone(status);

  if (tone === 'completed') {
    return styles.mobileEnterpriseStatusCompleted;
  }

  if (tone === 'filling') {
    return styles.mobileEnterpriseStatusFilling;
  }

  if (tone === 'pending') {
    return styles.mobileEnterpriseStatusPending;
  }

  return styles.mobileEnterpriseStatusDefault;
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

const getOrgNodeKey = (node: EnterpriseCarbonOrgNode) => node.orgId || node.id;

const findOrgNodeByKey = (
  nodes: EnterpriseCarbonOrgNode[] = [],
  key?: string,
): EnterpriseCarbonOrgNode | undefined => {
  if (!key) {
    return undefined;
  }

  return nodes.reduce<EnterpriseCarbonOrgNode | undefined>((matched, node) => {
    if (matched) {
      return matched;
    }

    if (getOrgNodeKey(node) === key || node.id === key || node.orgId === key) {
      return node;
    }

    return findOrgNodeByKey(node.children, key);
  }, undefined);
};

const isMainPartOrgNode = (node?: EnterpriseCarbonOrgNode) =>
  Number(node?.orgType) === ORG_TYPE.MAIN_PART;

const findFirstMainPartOrgNode = (
  nodes: EnterpriseCarbonOrgNode[] = [],
): EnterpriseCarbonOrgNode | undefined =>
  nodes.reduce<EnterpriseCarbonOrgNode | undefined>((matched, node) => {
    if (matched) {
      return matched;
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

const getOrgInfoByPeriod = (
  data?: OrgAccountData,
  period?: EnterpriseCarbonOrgPeriod,
) => {
  const periodValue = getPeriodValue(period);

  if (!data?.orgInfoList?.length) {
    return undefined;
  }

  return (
    data.orgInfoList.find(
      orgInfo => String(orgInfo.computationPeriod) === periodValue,
    ) || data.orgInfoList[0]
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
    requestType: 'normal',
    year: accountingYear,
  };

  if (readonly && sessionId) {
    params.requestType = 'agentShare';
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
  readonly = false,
  sessionId?: string,
  shareId?: string,
): AgentOrgAccountParams | undefined => {
  if (!accountingYear || !sessionId) {
    return undefined;
  }

  return {
    ...(activePeriod ? { period: activePeriod.value } : {}),
    requestType: readonly ? 'agentShare' : 'normal',
    sessionId,
    ...(shareId ? { shareId } : {}),
    year: accountingYear,
  };
};

const getSnapshotOrgAccountParams = (
  accountingYear?: string,
  snapshotContext?: EnterpriseCarbonAccountingContext,
): AgentOrgAccountParams | undefined => {
  if (!accountingYear || !snapshotContext?.reportId) {
    return undefined;
  }

  return {
    companyId: snapshotContext.companyId,
    orgId: snapshotContext.orgId,
    reportId: snapshotContext.reportId,
    requestType: 'snapshotShare',
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

const fetchMobileSourceList = (params: MobileSourceListParams) => {
  const {
    companyId,
    computationId,
    computationPeriod,
    orgId,
    requestType,
    shareId,
    versionType,
  } = params;

  if (requestType === 'snapshotShare') {
    return getSourceListByShare({
      companyId,
      computationId,
      computationPeriod,
      orgId,
      versionType,
    });
  }

  return getSourceList({
    computationId,
    computationPeriod,
    ...(shareId ? { shareId } : {}),
    versionType,
  });
};

const fetchProjectMobileSourceList = (params: MobileSourceListParams) => {
  if (params.requestType === 'snapshotShare') {
    return fetchMobileSourceList(params);
  }

  return getSourceList({
    computationId: params.computationId,
    computationPeriod: params.computationPeriod,
    sessionId: params.sessionId,
    ...(params.shareId ? { shareId: params.shareId } : {}),
    versionType: params.versionType,
  });
};

const fetchMobileOrgAccountData = (params: AgentOrgAccountParams) => {
  if (params.requestType === 'snapshotShare') {
    return getOrgAccountDataByShare({
      companyId: params.companyId,
      orgId: params.orgId,
      reportId: params.reportId,
      year: params.year,
    });
  }

  if (params.requestType === 'agentShare') {
    return getAgentOrgAccountDataByShare({
      orgId: params.orgId,
      period: params.period,
      sessionId: params.sessionId || '',
      ...(params.shareId ? { shareId: params.shareId } : {}),
      year: params.year,
    });
  }

  return getOrgAccountData({
    orgId: params.orgId,
    period: params.period,
    year: params.year,
  });
};

const fetchProjectMobileOrgAccountData = (params: AgentOrgAccountParams) => {
  if (params.requestType === 'snapshotShare') {
    return fetchMobileOrgAccountData(params);
  }

  if (params.requestType === 'agentShare') {
    return getAgentOrgAccountDataByShare({
      orgId: params.orgId,
      period: params.period,
      sessionId: params.sessionId || '',
      ...(params.shareId ? { shareId: params.shareId } : {}),
      year: params.year,
    });
  }

  return getOrgAccountData({
    orgId: params.orgId,
    period: params.period,
    sessionId: params.sessionId,
    ...(params.shareId ? { shareId: params.shareId } : {}),
    year: params.year,
  });
};

const formatEmission = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return String(value);
  }

  return numberValue.toLocaleString('zh-CN', {
    maximumFractionDigits: 6,
  });
};

const MOBILE_ENTERPRISE_LIST_UNIT = 'tCO₂e';

const formatPercent = (rate?: string | number | null) => {
  const rateText = getOptionalString(rate);

  if (rateText) {
    const rateNumber = Number(rateText.replace('%', ''));

    if (Number.isFinite(rateNumber)) {
      return `${rateNumber.toLocaleString('zh-CN', {
        maximumFractionDigits: 2,
      })}%`;
    }

    return rateText;
  }

  return '-';
};

const MOBILE_SCOPE_RATE_FIELD_MAP = {
  '0': 'scopeOneRate',
  '1': 'scopeTwoRate',
  '2': 'scopeThreeRate',
} as const;

const getMobileScopeRate = (
  sourceListData: MobileSourceListData | undefined,
  node: RootNode,
) => {
  const rateField =
    MOBILE_SCOPE_RATE_FIELD_MAP[
      getOptionalString(
        node.ghgCategory,
      ) as keyof typeof MOBILE_SCOPE_RATE_FIELD_MAP
    ];

  return rateField ? sourceListData?.[rateField] : undefined;
};

const getSourceListTotalEmission = (
  sourceListData?: MobileSourceListData,
  activeOrg?: EnterpriseCarbonOrgNode,
  orgAccountData?: OrgAccountData,
) =>
  getOptionalString(sourceListData?.emissionQuantity) ||
  getOptionalString(sourceListData?.totalEmissions) ||
  getOptionalString(activeOrg?.totalEmission) ||
  getOptionalString(orgAccountData?.totalEmission);

const getGroupSourceRows = (
  classifyNode: RootNode['nodes'][number],
  group: SourceGroup,
) =>
  (group.sourceList || []).map(source => ({
    classifyCode: classifyNode.ghgClassify,
    classifyName: classifyNode.name,
    emissionQuantity: source.emissionQuantity,
    id: `${classifyNode.ghgClassify || classifyNode.name}-group-${group.id}-${
      source.id
    }`,
    name: source.name,
    source,
  }));

const getSourceRows = (scopeNode: RootNode) =>
  (scopeNode.nodes || []).flatMap(classifyNode => [
    ...(classifyNode.sourceList || []).map(source => ({
      classifyCode: classifyNode.ghgClassify,
      classifyName: classifyNode.name,
      emissionQuantity: source.emissionQuantity,
      id: `${classifyNode.ghgClassify || classifyNode.name}-${source.id}`,
      name: source.name,
      source,
    })),
    ...(classifyNode.groupList || []).flatMap(group =>
      getGroupSourceRows(classifyNode, group),
    ),
  ]);

const getRootOrgName = (organizationTree: EnterpriseCarbonOrgNode[]) => {
  const [rootNode] = organizationTree;

  return rootNode?.orgName || rootNode?.name || '-';
};

const getNodeStatusDesc = (node: EnterpriseCarbonOrgNode) => {
  const nodeRecord = node as unknown as Record<string, unknown>;

  return getOptionalString(nodeRecord.statusDesc as string | number | null);
};

const MobileOrgGroup = ({
  node,
  onSelectOrg,
}: {
  node: EnterpriseCarbonOrgNode;
  onSelectOrg: (node: EnterpriseCarbonOrgNode) => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  const orgName = node.orgName || node.name;
  const children = node.children || [];

  if (isMainPartOrgNode(node)) {
    return (
      <button
        className={styles.mobileEnterpriseOrgItem}
        type='button'
        onClick={() => onSelectOrg(node)}
      >
        <span className={styles.mobileEnterpriseOrgItemName}>
          <img alt='' src={orgMainIcon} />
          <span>{orgName}</span>
        </span>
        <span
          className={classNames(
            styles.mobileEnterpriseStatus,
            getStatusClassName(node.status),
          )}
        >
          {getStatusLabel(node.status, getNodeStatusDesc(node))}
        </span>
      </button>
    );
  }

  return (
    <section className={styles.mobileEnterpriseOrgGroup}>
      <button
        className={styles.mobileEnterpriseOrgGroupHeader}
        type='button'
        onClick={() => setExpanded(current => !current)}
      >
        <span className={styles.mobileEnterpriseOrgGroupTitle}>
          <img alt='' src={orgGroupIcon} />
          <span>{orgName}</span>
        </span>
        <span
          className={classNames(styles.mobileEnterpriseOrgGroupArrow, {
            [styles.mobileEnterpriseOrgGroupArrowExpanded]: expanded,
          })}
        />
      </button>
      {expanded ? (
        <div className={styles.mobileEnterpriseOrgChildren}>
          {children.map(child => (
            <MobileOrgGroup
              key={getOrgNodeKey(child)}
              node={child}
              onSelectOrg={onSelectOrg}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};

const MobileScopeCard = ({
  expanded,
  node,
  rate,
  unit,
  versionType,
  onToggle,
}: {
  expanded: boolean;
  node: RootNode;
  rate?: string | number | null;
  unit: string;
  versionType: EVersionType;
  onToggle: () => void;
}) => {
  const visual = getCanvasCategoryVisual(
    versionType,
    node.ghgCategory,
    node.name,
  );
  const rows = getSourceRows(node);
  const progressText =
    node.finishCount !== undefined && node.totalCount !== undefined
      ? `${node.finishCount}/${node.totalCount}`
      : '';

  return (
    <article
      className={classNames(styles.mobileEnterpriseScopeCard, {
        [styles.mobileEnterpriseScopeCardExpanded]: expanded,
      })}
      style={
        {
          '--mobile-enterprise-scope-color': visual?.color || '#0cbf9f',
        } as CSSProperties
      }
    >
      <button
        className={styles.mobileEnterpriseScopeHeader}
        type='button'
        onClick={onToggle}
      >
        <span className={styles.mobileEnterpriseScopeTitle}>
          {visual?.icon ? (
            <img
              alt=''
              className={classNames({
                [styles.mobileEnterpriseIconFlipX]: visual.iconFlipX,
              })}
              src={visual.icon}
            />
          ) : null}
          <span>{node.name}</span>
          {progressText ? <em>{progressText}</em> : null}
        </span>
        <span className={styles.mobileEnterpriseScopeMeta}>
          {versionType === EVersionType.ghg ? (
            <strong>{formatPercent(rate)}</strong>
          ) : null}
          <i />
        </span>
      </button>
      {expanded ? (
        <div className={styles.mobileEnterpriseSourceTable}>
          <div className={styles.mobileEnterpriseSourceTableHead}>
            <span>{I18N.carbonAgent.emissionSource}</span>
            <span>{I18N.carbonAgent.type}</span>
            <span>
              {I18N.template(
                I18N.carbonAgent.enterpriseCarbonEmissionWithUnit,
                { val1: unit },
              )}
            </span>
          </div>
          {rows.length ? (
            rows.map(row => (
              <MobileSourceTableRow
                key={row.id}
                row={row}
                versionType={versionType}
              />
            ))
          ) : (
            <div className={styles.mobileEnterpriseSourceEmpty}>
              {I18N.carbonAgent.enterpriseCarbonNoEmissionSourceData}
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
};

const MobileSourceTableRow = ({
  row,
  versionType,
}: {
  row: MobileSourceRow;
  versionType: EVersionType;
}) => {
  const visual = getCanvasClassifyVisual(
    versionType,
    row.classifyCode,
    row.classifyName,
  );

  return (
    <div className={styles.mobileEnterpriseSourceRow}>
      <span>{row.name || '-'}</span>
      <span className={styles.mobileEnterpriseSourceType}>
        {visual?.icon ? (
          <img
            alt=''
            className={classNames({
              [styles.mobileEnterpriseIconFlipX]: visual.iconFlipX,
            })}
            src={visual.icon}
          />
        ) : null}
        <span>{row.classifyName || '-'}</span>
      </span>
      <strong>{formatEmission(row.emissionQuantity)}</strong>
    </div>
  );
};

const MobileEnterpriseCarbonPreview = ({
  projectId,
  readonly = false,
  sessionId,
  shareId,
  snapshotContext,
  target,
  view,
  onViewChange,
}: MobileEnterpriseCarbonPreviewProps) => {
  const projectSessionId = projectId ? sessionId : undefined;
  const projectShareId = projectId ? shareId : undefined;
  const accountingYear = useMemo(() => {
    const snapshotYear = getEnterpriseCarbonAccountingYear(
      snapshotContext?.year,
    );

    if (snapshotYear) {
      return snapshotYear;
    }

    return getTargetAccountingYear(target);
  }, [snapshotContext?.year, target]);
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
  const [activePeriodValue, setActivePeriodValue] = useState<
    string | undefined
  >();
  const [activeOrgId, setActiveOrgId] = useState<string | undefined>();
  const [versionType, setVersionType] = useState<EVersionType>(
    () =>
      getExplicitAccountingVersionType(target.versionType) || EVersionType.ghg,
  );
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState('');
  const [sourceListData, setSourceListData] = useState<MobileSourceListData>();
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState('');
  const [expandedScopeKey, setExpandedScopeKey] = useState<string | null>('');

  const activePeriod = useMemo(
    () =>
      periodList.find(period => getPeriodValue(period) === activePeriodValue),
    [activePeriodValue, periodList],
  );
  const activeOrg = useMemo(
    () => findOrgNodeByKey(organizationTree, activeOrgId),
    [activeOrgId, organizationTree],
  );
  const orgAccountParams = useMemo(() => {
    if (snapshotContext) {
      return getSnapshotOrgAccountParams(accountingYear, snapshotContext);
    }

    return projectId
      ? getProjectAgentOrgAccountParams(
          accountingYear,
          activePeriod,
          readonly,
          sessionId,
          projectShareId,
        )
      : getAgentOrgAccountParams(
          accountingYear,
          activePeriod,
          readonly,
          sessionId,
          shareId,
        );
  }, [
    accountingYear,
    activePeriod,
    projectId,
    projectShareId,
    readonly,
    sessionId,
    shareId,
    snapshotContext,
  ]);
  const accountingPeriodParams = useMemo(() => {
    if (snapshotContext) {
      return undefined;
    }

    return projectId
      ? getProjectAccountingPeriodParams(
          accountingYear,
          projectSessionId,
          projectShareId,
        )
      : getAccountingPeriodParams(accountingYear, readonly, sessionId, shareId);
  }, [
    accountingYear,
    projectId,
    projectSessionId,
    projectShareId,
    readonly,
    sessionId,
    shareId,
    snapshotContext,
  ]);
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
  const periodDisplayName = useMemo(
    () =>
      formatEnterpriseCarbonPeriodName({
        accountingYear,
        period: activePeriod,
        periodName: activePeriodName,
      }),
    [accountingYear, activePeriod, activePeriodName],
  );
  const accountingContext = useMemo(() => {
    if (!accountingYear) {
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
  const sourceTotalEmission = useMemo(
    () => getSourceListTotalEmission(sourceListData, activeOrg, orgAccountData),
    [activeOrg, orgAccountData, sourceListData],
  );
  const sourceDisplayUnit = MOBILE_ENTERPRISE_LIST_UNIT;
  const firstScopeKey = useMemo(() => {
    const firstScope = sourceListData?.rootNodes?.[0];

    return firstScope
      ? getOptionalString(firstScope.ghgCategory) || firstScope.name
      : '';
  }, [sourceListData?.rootNodes]);
  const activeExpandedScopeKey =
    expandedScopeKey === null ? '' : expandedScopeKey || firstScopeKey || '';
  const shouldFillPeriodScroller =
    periodList.length > 0 && periodList.length <= 4;
  const sourceRequestParams = useMemo(() => {
    if (view !== 'detail' || !accountingContext?.computationId) {
      return undefined;
    }

    let requestType: MobileSourceListParams['requestType'] = 'normal';

    if (snapshotContext) {
      requestType = 'snapshotShare';
    }

    const params: MobileSourceListParams = {
      companyId: snapshotContext?.companyId,
      computationId: accountingContext.computationId,
      computationPeriod: getOptionalString(accountingContext.computationPeriod),
      orgId: accountingContext.orgId,
      requestType,
      versionType,
    };

    if (projectId) {
      return {
        ...params,
        sessionId: projectSessionId,
        ...(projectShareId ? { shareId: projectShareId } : {}),
      };
    }

    return shareId
      ? {
          ...params,
          shareId,
        }
      : params;
  }, [
    accountingContext?.computationId,
    accountingContext?.computationPeriod,
    accountingContext?.orgId,
    projectId,
    projectSessionId,
    projectShareId,
    snapshotContext,
    shareId,
    versionType,
    view,
  ]);

  useEffect(() => {
    if (snapshotContext) {
      setPeriodList([]);
      setPeriodListLoaded(true);
      setActivePeriodValue(undefined);
      return undefined;
    }

    if (!accountingPeriodParams) {
      setPeriodList([]);
      setPeriodListLoaded(false);
      setOrganizationTree([]);
      setOrgAccountData(undefined);
      setOrgError('');
      return undefined;
    }

    let cancelled = false;

    setOrgLoading(true);
    setPeriodListLoaded(false);
    setOrgError('');
    getAccountingPeriodList(accountingPeriodParams)
      .then(({ data }) => {
        if (cancelled) {
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
        if (!cancelled) {
          setPeriodList([]);
          setPeriodListLoaded(false);
          setOrganizationTree([]);
          setOrgAccountData(undefined);
          setOrgError(I18N.carbonAgent.enterpriseCarbonPeriodDataLoadFailed);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setOrgLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accountingPeriodParams, snapshotContext]);

  useEffect(() => {
    if (!accountingYear || !periodListLoaded || !orgAccountParams) {
      setOrgAccountData(undefined);
      setOrganizationTree([]);
      return undefined;
    }

    if (periodList.length > 0 && !activePeriod) {
      setOrgAccountData(undefined);
      setOrganizationTree([]);
      return undefined;
    }

    let cancelled = false;

    setOrgLoading(true);
    setOrgError('');
    (projectId
      ? fetchProjectMobileOrgAccountData(orgAccountParams)
      : fetchMobileOrgAccountData(orgAccountParams)
    )
      .then(({ data }) => {
        if (cancelled) {
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
        if (!cancelled) {
          setOrgAccountData(undefined);
          setOrganizationTree([]);
          setOrgError(
            I18N.carbonAgent.enterpriseCarbonOrganizationDataLoadFailed,
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setOrgLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    accountingYear,
    activePeriod,
    orgAccountParams,
    periodList.length,
    periodListLoaded,
    projectId,
  ]);

  useEffect(() => {
    setActiveOrgId(currentOrgId => {
      if (isMainPartOrgNode(findOrgNodeByKey(organizationTree, currentOrgId))) {
        return currentOrgId;
      }

      return view === 'detail'
        ? getInitialActiveOrgId(organizationTree)
        : undefined;
    });
  }, [organizationTree, view]);

  useEffect(() => {
    const explicitVersionType =
      getExplicitAccountingVersionType(accountingContext?.versionType) ||
      getExplicitAccountingVersionType(target.versionType);

    if (explicitVersionType) {
      setVersionType(explicitVersionType);
    }
  }, [accountingContext?.versionType, target.versionType]);

  useEffect(() => {
    if (!sourceRequestParams) {
      setSourceListData(undefined);
      setSourceError('');
      setSourceLoading(false);
      return undefined;
    }

    let cancelled = false;

    setSourceLoading(true);
    setSourceError('');
    (projectId
      ? fetchProjectMobileSourceList(sourceRequestParams)
      : fetchMobileSourceList(sourceRequestParams)
    )
      .then(data => {
        if (cancelled) {
          return;
        }

        setSourceListData(data);
      })
      .catch(() => {
        if (!cancelled) {
          setSourceListData(undefined);
          setSourceError(
            I18N.carbonAgent.enterpriseCarbonEmissionSourceDataLoadFailed,
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSourceLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, sourceRequestParams]);

  useEffect(() => {
    setExpandedScopeKey('');
  }, [
    sourceListData?.rootNodes,
    sourceRequestParams?.computationId,
    sourceRequestParams?.computationPeriod,
    sourceRequestParams?.versionType,
  ]);

  const handleSelectOrg = (node: EnterpriseCarbonOrgNode) => {
    setActiveOrgId(getOrgNodeKey(node));
    onViewChange('detail');
  };

  const handlePeriodChange = (period: EnterpriseCarbonOrgPeriod) => {
    const value = getPeriodValue(period);

    if (!value || Number(period.status) === COMPUTATION_STATUS.NOT_START) {
      return;
    }

    setActivePeriodValue(value);
  };

  const renderPeriodScroller = () =>
    periodList.length ? (
      <div className={styles.mobileEnterprisePeriodSection}>
        <div
          className={classNames(styles.mobileEnterprisePeriodScroller, {
            [styles.mobileEnterprisePeriodScrollerFill]:
              shouldFillPeriodScroller,
          })}
        >
          {periodList.map(period => {
            const value = getPeriodValue(period);
            const disabled =
              Number(period.status) === COMPUTATION_STATUS.NOT_START;
            const active = value === activePeriodValue;

            return (
              <button
                className={classNames(styles.mobileEnterprisePeriodCard, {
                  [styles.mobileEnterprisePeriodCardActive]: active,
                })}
                disabled={disabled}
                key={value || period.name}
                type='button'
                onClick={() => handlePeriodChange(period)}
              >
                <strong>{period.name}</strong>
                {value !== '0' ? (
                  <span>{getStatusLabel(period.status)}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    ) : null;

  const renderOrgList = () => (
    <div className={styles.mobileEnterpriseOrgPage}>
      {renderPeriodScroller()}
      <div className={styles.mobileEnterpriseOrgContent}>
        <div className={styles.mobileEnterpriseRootInfo}>
          <img alt='' src={orgRootIcon} />
          <strong>{getRootOrgName(organizationTree)}</strong>
        </div>
        {orgError ? (
          <div className={styles.mobileEnterpriseState}>{orgError}</div>
        ) : null}
        {!orgError && orgLoading && !organizationTree.length ? (
          <div className={styles.mobileEnterpriseState}>
            <Spin />
          </div>
        ) : null}
        {!orgError && !orgLoading && !organizationTree.length ? (
          <div className={styles.mobileEnterpriseState}>
            {I18N.carbonAgent.enterpriseCarbonNoAccountingOrganizations}
          </div>
        ) : null}
        {!orgError
          ? organizationTree.map(rootNode =>
              (rootNode.children?.length ? rootNode.children : [rootNode]).map(
                node => (
                  <MobileOrgGroup
                    key={getOrgNodeKey(node)}
                    node={node}
                    onSelectOrg={handleSelectOrg}
                  />
                ),
              ),
            )
          : null}
      </div>
    </div>
  );

  const renderDetail = () => (
    <div className={styles.mobileEnterpriseDetail}>
      <section className={styles.mobileEnterpriseSummary}>
        <div className={styles.mobileEnterpriseSummaryHead}>
          <span className={styles.mobileEnterpriseSummaryOrg}>
            <img alt='' src={canvasOrgIcon} />
            <strong>{activeOrg?.orgName || activeOrg?.name || '-'}</strong>
          </span>
          <Dropdown
            trigger={['click']}
            menu={{
              selectedKeys: [versionType],
              onClick: ({ key }) => {
                if (key === EVersionType.ghg || key === EVersionType.iso) {
                  setVersionType(key);
                }
              },
              items: [
                {
                  key: EVersionType.ghg,
                  label: I18N.enterpriseCarbonAccount2.ghgPr2,
                },
                {
                  key: EVersionType.iso,
                  label: I18N.enterpriseCarbonAccount2.isoStandard3,
                },
              ],
            }}
          >
            <button
              className={styles.mobileEnterpriseVersionTrigger}
              type='button'
            >
              <span>{getVersionLabel(versionType)}</span>
              <i aria-hidden='true' />
            </button>
          </Dropdown>
        </div>
        <div className={styles.mobileEnterpriseTotalEmission}>
          <span>
            {I18N.carbonAgent.enterpriseCarbonTotalEmissions}
            <em>（{sourceDisplayUnit}）</em>
          </span>
          <strong>{formatEmission(sourceTotalEmission)}</strong>
        </div>
      </section>
      <section className={styles.mobileEnterpriseSourceSection}>
        <div className={styles.mobileEnterpriseSourceList}>
          {sourceError ? (
            <div className={styles.mobileEnterpriseState}>{sourceError}</div>
          ) : null}
          {!sourceError && sourceLoading ? (
            <div className={styles.mobileEnterpriseState}>
              <Spin />
            </div>
          ) : null}
          {!sourceError &&
          !sourceLoading &&
          !sourceListData?.rootNodes?.length ? (
            <div className={styles.mobileEnterpriseState}>
              {I18N.carbonAgent.enterpriseCarbonNoEmissionSourceData}
            </div>
          ) : null}
          {!sourceError && sourceListData?.rootNodes?.length
            ? sourceListData.rootNodes.map(node => {
                const nodeKey =
                  getOptionalString(node.ghgCategory) || node.name;
                const expanded = activeExpandedScopeKey === nodeKey;

                return (
                  <MobileScopeCard
                    expanded={expanded}
                    key={nodeKey}
                    node={node}
                    rate={getMobileScopeRate(sourceListData, node)}
                    unit={sourceDisplayUnit}
                    versionType={versionType}
                    onToggle={() =>
                      setExpandedScopeKey(expanded ? null : nodeKey)
                    }
                  />
                );
              })
            : null}
        </div>
        <div className={styles.mobileEnterpriseDesktopHint}>
          <div>
            <img alt='' src={aiAssistantIcon} />
            <strong>
              {I18N.carbonAgent.enterpriseCarbonMobileViewMoreOrEdit}
            </strong>
          </div>
          <p>{I18N.carbonAgent.enterpriseCarbonMobileDesktopHint}</p>
        </div>
      </section>
    </div>
  );

  return (
    <div className={styles.mobileEnterprisePreview}>
      {view === 'detail' ? renderDetail() : renderOrgList()}
      <span className={styles.mobileEnterpriseHiddenTitle}>
        {formatEnterpriseCarbonAccountingTitle(accountingYear)}
        {periodDisplayName ? ` ${periodDisplayName}` : ''}
        {getVersionLabel(versionType)}
      </span>
    </div>
  );
};

export default MobileEnterpriseCarbonPreview;
