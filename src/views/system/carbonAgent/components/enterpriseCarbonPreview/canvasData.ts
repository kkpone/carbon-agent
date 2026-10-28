import I18N from '@/lang/I18N';
import { PageInfoType } from '@/router/type';
import {
  EVersionType,
  type SourceGroup,
  type SourceListElement,
} from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';
import {
  canAssociateProductFootprint,
  isProductCarbonSource,
} from '@/views/enterpriseCarbonAccount2/productFootprintAssociation/condition';

import {
  getCanvasCategoryVisual,
  getCanvasClassifyVisual,
} from './canvasCategoryVisualMap';
import type {
  EnterpriseCarbonCanvasAttachment,
  EnterpriseCarbonCanvasNode,
} from './canvasTypes';
import type {
  EnterpriseCarbonAccountingContext,
  EnterpriseCarbonOrgNode,
} from './types';
import { getAvailableEnterpriseCarbonTaskTypes } from '../EnterpriseCarbonProjectTasks/type';
import type { EnterpriseCarbonTaskAvailabilities } from '../EnterpriseCarbonProjectTasks/type';

type EnterpriseCarbonClassifyNode = {
  count?: number;
  finishCount?: number;
  ghgCategory: string;
  ghgClassify: string;
  groupList?: SourceGroup[];
  name: string;
  nodes?: never;
  sourceList: SourceListElement[];
  totalCount?: number;
  totalEmission?: number | string;
};

type EnterpriseCarbonScopeNode = {
  count?: number;
  finishCount?: number;
  ghgCategory: string;
  name: string;
  nodes: EnterpriseCarbonClassifyNode[];
  rate?: string;
  totalCount?: number;
  totalEmissions?: number | string;
};

export type EnterpriseCarbonSourceData = {
  finishCount?: number;
  orgName?: string;
  rootNodes: EnterpriseCarbonScopeNode[];
  totalCount?: number;
  totalEmissions?: number | string;
  unit?: string;
};

type BuildGraphParams = {
  activeOrg?: EnterpriseCarbonOrgNode;
  accountingContext: EnterpriseCarbonAccountingContext;
  collapsedIds: Set<string>;
  computationId: string;
  computationPeriod?: string;
  isShare?: boolean;
  periodDisplayName?: string;
  readPretty?: boolean;
  selectedTaskSourceIds?: Set<string>;
  sourceData: EnterpriseCarbonSourceData;
  taskSelectionEnabled?: boolean;
  versionType?: EVersionType;
};

const SCOPE_COLORS = ['#0cbf9f', '#048677', '#004541'];
const ORG_NODE_SIZE = { width: 237, height: 86 };
const SCOPE_NODE_SIZE = { width: 221, height: 78 };
const ACTION_NODE_SIZE = { width: 221, height: 78 };
const SOURCE_NODE_SIZE = { width: 221, height: 78 };
const SCOPE_THREE_CODE = '2';
const SCOPE_THREE_PROJECT_TYPE_CATEGORY_CODES = new Set(['10', '11']);

const getOptionalString = (value?: string | number | null) => {
  const text =
    value === undefined || value === null ? '' : String(value).trim();

  return text === 'undefined' || text === 'null' ? '' : text;
};

const getOptionalNumber = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
};

const getScopedColor = (category?: string | number, index = 0) => {
  const parsed = Number(category);
  const colorIndex = Number.isFinite(parsed) ? parsed - 1 : index;

  return SCOPE_COLORS[Math.abs(colorIndex) % SCOPE_COLORS.length];
};

const parseSourceId = (id?: string | number | null) => {
  const idText = getOptionalString(id);

  if (idText.startsWith('item_group_source_')) {
    return idText.replace('item_group_source_', '');
  }

  return idText;
};

const isSourceIncomplete = (source: SourceListElement) => {
  const looseSource = source as unknown as Record<string, unknown>;
  const { activityData } = looseSource;

  return (
    activityData === null ||
    activityData === undefined ||
    activityData === '' ||
    looseSource.lostFactor === true ||
    looseSource.redDot === true ||
    looseSource.status === 'error'
  );
};

const getSourceAttachments = (
  source: SourceListElement,
): EnterpriseCarbonCanvasAttachment[] => {
  const looseSource = source as unknown as {
    supportImg?: {
      id?: number | string;
      name: string;
      supportImgId?: number | string;
      url: string;
    }[];
  };

  return (looseSource.supportImg || []).map(file => ({
    id: file.supportImgId || file.id || '',
    name: file.name,
    url: file.url,
  }));
};

const withCommonNodeFields = (
  node: EnterpriseCarbonCanvasNode,
): EnterpriseCarbonCanvasNode => ({
  ...node,
  collapsed: node.collapsed,
  hasChildren: node.hasChildren ?? Boolean(node.children?.length),
});

const buildSourceNode = ({
  accountingSubjectId,
  classifyCode,
  classifyVersionType,
  color,
  computationId,
  computationPeriod,
  isShare,
  parentId,
  readPretty,
  scopeCode,
  selectedTaskSourceIds,
  source,
  taskSelectionEnabled,
  versionType,
}: {
  accountingSubjectId: string;
  classifyCode?: string;
  classifyVersionType?: EVersionType;
  color: string;
  computationId: string;
  computationPeriod?: string;
  isShare?: boolean;
  parentId: string;
  readPretty?: boolean;
  scopeCode: string;
  selectedTaskSourceIds?: Set<string>;
  source: SourceListElement;
  taskSelectionEnabled?: boolean;
  versionType?: EVersionType;
}): EnterpriseCarbonCanvasNode => {
  const sourceId = parseSourceId(source.id);
  const taskSourceId = getOptionalNumber(sourceId);
  const looseSource = source as unknown as Record<string, unknown>;
  const taskAvailabilities = looseSource.taskAvailabilities as
    | EnterpriseCarbonTaskAvailabilities
    | undefined;
  const accountingFactorCollectionSupported =
    classifyVersionType === EVersionType.ghg &&
    scopeCode === SCOPE_THREE_CODE &&
    Boolean(
      classifyCode && SCOPE_THREE_PROJECT_TYPE_CATEGORY_CODES.has(classifyCode),
    );
  const availableTaskTypes = getAvailableEnterpriseCarbonTaskTypes(
    { taskAvailabilities },
    accountingFactorCollectionSupported,
  );
  const isInFlow = looseSource.isFlow === '1';
  const supportImg = getSourceAttachments(source);

  return withCommonNodeFields({
    actionPayload: {
      computationId,
      computationPeriod,
      id: sourceId,
      isShare,
      pageInfoType: PageInfoType.edit,
      readPretty: readPretty || isInFlow,
      supportImg,
      versionType,
    },
    activityData: looseSource.activityData as string | number | null,
    activityUnitDesc: getOptionalString(
      looseSource.activityUnitDesc as string | number | null,
    ),
    classifyCode,
    classifyVersionType,
    color,
    emissionQuantity: source.emissionQuantity,
    facility: source.facility,
    id: `source_${parentId}_${sourceId}`,
    incomplete: isSourceIncomplete(source),
    label: source.name,
    nodeHeight: SOURCE_NODE_SIZE.height,
    nodeKind: 'source',
    nodeWidth: SOURCE_NODE_SIZE.width,
    isProductCarbon: isProductCarbonSource(source.fdType),
    supportImg,
    taskContext:
      accountingSubjectId &&
      classifyCode &&
      scopeCode &&
      taskSourceId !== undefined
        ? {
            accountingSubjectId,
            availableTaskTypes,
            categoryId: classifyCode,
            emissionSourceId: taskSourceId,
            emissionSourceName: source.name,
            scopeCode,
            taskAvailabilities,
            versionType: classifyVersionType,
          }
        : undefined,
    taskSelectable: Boolean(
      taskSelectionEnabled &&
        accountingSubjectId &&
        classifyCode &&
        scopeCode &&
        taskSourceId !== undefined &&
        availableTaskTypes.length,
    ),
    taskSelected: selectedTaskSourceIds?.has(sourceId),
  });
};

const buildAddSourcePayload = ({
  computationId,
  computationPeriod,
  groupId,
  ghgCategory,
  ghgClassify,
  isShare,
  readPretty,
  versionType,
}: {
  computationId: string;
  computationPeriod?: string;
  ghgCategory: string;
  ghgClassify: string;
  groupId?: number;
  isShare?: boolean;
  readPretty?: boolean;
  versionType?: EVersionType;
}): EnterpriseCarbonCanvasNode['actionPayload'] => ({
  computationId,
  computationPeriod,
  groupId,
  initGhgCategory: ghgCategory,
  initGhgClassify: ghgClassify,
  isShare,
  pageInfoType: PageInfoType.add,
  readPretty,
  title: I18N.carbonAgent.enterpriseCarbonAddEmissionSource,
  versionType,
});

const buildClassifyNode = ({
  accountingSubjectId,
  classifyNode,
  color,
  collapsedIds,
  computationId,
  computationPeriod,
  isShare,
  readPretty,
  selectedTaskSourceIds,
  taskSelectionEnabled,
  versionType,
}: {
  accountingSubjectId: string;
  classifyNode: EnterpriseCarbonClassifyNode;
  color: string;
  collapsedIds: Set<string>;
  computationId: string;
  computationPeriod?: string;
  isShare?: boolean;
  readPretty?: boolean;
  selectedTaskSourceIds?: Set<string>;
  taskSelectionEnabled?: boolean;
  versionType?: EVersionType;
}): EnterpriseCarbonCanvasNode => {
  const classifyVersionType =
    versionType === EVersionType.iso ? EVersionType.iso : EVersionType.ghg;
  const classifyCode = classifyNode.ghgClassify;
  const classifyVisual = getCanvasClassifyVisual(
    classifyVersionType,
    classifyCode,
    classifyNode.name,
  );
  const classifyColor = classifyVisual?.color || color;
  const classifyId = `classify_${classifyVersionType}_${classifyCode}`;
  const children = (classifyNode.sourceList || []).map(source =>
    buildSourceNode({
      accountingSubjectId,
      classifyCode,
      classifyVersionType,
      color: classifyColor,
      computationId,
      computationPeriod,
      isShare,
      parentId: classifyId,
      readPretty,
      scopeCode: classifyNode.ghgCategory,
      selectedTaskSourceIds,
      source,
      taskSelectionEnabled,
      versionType,
    }),
  );

  return withCommonNodeFields({
    actionPayload: buildAddSourcePayload({
      computationId,
      computationPeriod,
      ghgCategory: classifyNode.ghgCategory,
      ghgClassify: classifyNode.ghgClassify,
      isShare,
      readPretty,
      versionType,
    }),
    children,
    classifyCode,
    classifyVersionType,
    collapsed: collapsedIds.has(classifyId),
    color: classifyColor,
    emissionQuantity: classifyNode.totalEmission,
    finishCount: classifyNode.finishCount,
    hasSourceChildren: children.length > 0,
    id: classifyId,
    icon: classifyVisual?.icon,
    iconFlipX: classifyVisual?.iconFlipX,
    label: classifyNode.name,
    nodeHeight: ACTION_NODE_SIZE.height,
    nodeKind: 'classify',
    nodeWidth: ACTION_NODE_SIZE.width,
    productFootprintAssociationEnabled: canAssociateProductFootprint({
      versionType,
      ghgCategory: classifyNode.ghgCategory,
      ghgClassify: classifyNode.ghgClassify,
    }),
    totalCount: classifyNode.totalCount,
  });
};

const buildGroupNode = ({
  accountingSubjectId,
  classifyNode,
  color,
  collapsedIds,
  computationId,
  computationPeriod,
  group,
  isShare,
  readPretty,
  selectedTaskSourceIds,
  taskSelectionEnabled,
  versionType,
}: {
  accountingSubjectId: string;
  classifyNode: EnterpriseCarbonClassifyNode;
  color: string;
  collapsedIds: Set<string>;
  computationId: string;
  computationPeriod?: string;
  group: SourceGroup;
  isShare?: boolean;
  readPretty?: boolean;
  selectedTaskSourceIds?: Set<string>;
  taskSelectionEnabled?: boolean;
  versionType?: EVersionType;
}): EnterpriseCarbonCanvasNode => {
  const classifyVersionType =
    versionType === EVersionType.iso ? EVersionType.iso : EVersionType.ghg;
  const classifyCode = classifyNode.ghgClassify;
  const classifyVisual = getCanvasClassifyVisual(
    classifyVersionType,
    classifyCode,
    classifyNode.name,
  );
  const groupColor = classifyVisual?.color || color;
  const groupId = `group_${classifyVersionType}_${classifyCode}_${group.id}`;
  const children = (group.sourceList || []).map(source =>
    buildSourceNode({
      accountingSubjectId,
      classifyCode,
      classifyVersionType,
      color: groupColor,
      computationId,
      computationPeriod,
      isShare,
      parentId: groupId,
      readPretty,
      scopeCode: classifyNode.ghgCategory,
      selectedTaskSourceIds,
      source,
      taskSelectionEnabled,
      versionType,
    }),
  );

  return withCommonNodeFields({
    actionPayload: buildAddSourcePayload({
      computationId,
      computationPeriod,
      ghgCategory: classifyNode.ghgCategory,
      ghgClassify: classifyNode.ghgClassify,
      groupId: group.id,
      isShare,
      readPretty,
      versionType,
    }),
    children,
    classifyCode,
    classifyVersionType,
    collapsed: collapsedIds.has(groupId),
    color: groupColor,
    emissionQuantity: group.emissionQuantity,
    finishCount: group.finishCount,
    hasSourceChildren: children.length > 0,
    id: groupId,
    icon: classifyVisual?.icon,
    iconFlipX: classifyVisual?.iconFlipX,
    label: group.groupName,
    nodeHeight: ACTION_NODE_SIZE.height,
    nodeKind: 'group',
    nodeWidth: ACTION_NODE_SIZE.width,
    productFootprintAssociationEnabled: canAssociateProductFootprint({
      versionType,
      ghgCategory: classifyNode.ghgCategory,
      ghgClassify: classifyNode.ghgClassify,
    }),
    subtitle: classifyNode.name,
    totalCount: group.totalCount,
  });
};

const getScopeChildren = ({
  accountingSubjectId,
  collapsedIds,
  color,
  computationId,
  computationPeriod,
  isShare,
  readPretty,
  selectedTaskSourceIds,
  scopeNode,
  taskSelectionEnabled,
  versionType,
}: {
  accountingSubjectId: string;
  collapsedIds: Set<string>;
  color: string;
  computationId: string;
  computationPeriod?: string;
  isShare?: boolean;
  readPretty?: boolean;
  selectedTaskSourceIds?: Set<string>;
  scopeNode: EnterpriseCarbonScopeNode;
  taskSelectionEnabled?: boolean;
  versionType?: EVersionType;
}) =>
  (scopeNode.nodes || []).flatMap(classifyNode => [
    buildClassifyNode({
      accountingSubjectId,
      classifyNode,
      collapsedIds,
      color,
      computationId,
      computationPeriod,
      isShare,
      readPretty,
      selectedTaskSourceIds,
      taskSelectionEnabled,
      versionType,
    }),
    ...(classifyNode.groupList || []).map(group =>
      buildGroupNode({
        accountingSubjectId,
        classifyNode,
        collapsedIds,
        color,
        computationId,
        computationPeriod,
        group,
        isShare,
        readPretty,
        selectedTaskSourceIds,
        taskSelectionEnabled,
        versionType,
      }),
    ),
  ]);

const markAggregateIncomplete = (
  node: EnterpriseCarbonCanvasNode,
): EnterpriseCarbonCanvasNode => {
  const children = node.children?.map(markAggregateIncomplete);
  const hasIncompleteChild = Boolean(children?.some(child => child.incomplete));

  return {
    ...node,
    children,
    hasChildren: Boolean(children?.length),
    incomplete: Boolean(node.incomplete || hasIncompleteChild),
  };
};

const applyCollapsedState = (
  node: EnterpriseCarbonCanvasNode,
): EnterpriseCarbonCanvasNode => {
  const children = node.children || [];
  const hasChildren = Boolean(node.hasChildren || children.length);

  return {
    ...node,
    children:
      hasChildren && !node.collapsed
        ? children.map(applyCollapsedState)
        : undefined,
    hasChildren,
  };
};

export const buildEnterpriseCarbonCanvasData = ({
  activeOrg,
  accountingContext,
  collapsedIds,
  computationId,
  computationPeriod,
  isShare,
  periodDisplayName,
  readPretty,
  selectedTaskSourceIds,
  sourceData,
  taskSelectionEnabled,
  versionType,
}: BuildGraphParams) => {
  const { orgId } = accountingContext;
  const orgName =
    getOptionalString(sourceData.orgName) ||
    getOptionalString(activeOrg?.orgName) ||
    getOptionalString(activeOrg?.name) ||
    accountingContext.orgName;
  const rootId = `org_${orgId}`;

  const root = withCommonNodeFields({
    children: (sourceData.rootNodes || []).map((scopeNode, index) => {
      const categoryVersionType =
        versionType === EVersionType.iso ? EVersionType.iso : EVersionType.ghg;
      const categoryVisual = getCanvasCategoryVisual(
        categoryVersionType,
        scopeNode.ghgCategory,
        scopeNode.name,
      );
      const color =
        categoryVisual?.color || getScopedColor(scopeNode.ghgCategory, index);
      const scopeId = `scope_${categoryVersionType}_${scopeNode.ghgCategory}`;

      return withCommonNodeFields({
        children: getScopeChildren({
          accountingSubjectId: orgId,
          collapsedIds,
          color,
          computationId,
          computationPeriod,
          isShare,
          readPretty,
          selectedTaskSourceIds,
          scopeNode,
          taskSelectionEnabled,
          versionType,
        }),
        collapsed: collapsedIds.has(scopeId),
        color,
        categoryCode: scopeNode.ghgCategory,
        categoryVersionType,
        emissionQuantity: scopeNode.totalEmissions,
        finishCount: scopeNode.finishCount,
        id: scopeId,
        icon: categoryVisual?.icon,
        label: scopeNode.name,
        nodeHeight: SCOPE_NODE_SIZE.height,
        nodeKind: 'scope',
        nodeWidth: SCOPE_NODE_SIZE.width,
        rate: scopeNode.rate,
        totalCount: scopeNode.totalCount,
      });
    }),
    color: '#04786f',
    collapsed: collapsedIds.has(rootId),
    emissionQuantity: sourceData.totalEmissions,
    finishCount: getOptionalNumber(sourceData.finishCount),
    id: rootId,
    label: orgName,
    nodeHeight: ORG_NODE_SIZE.height,
    nodeKind: 'org',
    nodeWidth: ORG_NODE_SIZE.width,
    subtitle:
      periodDisplayName ||
      accountingContext.periodName ||
      accountingContext.period ||
      '',
    totalCount: getOptionalNumber(sourceData.totalCount),
  });

  const markedRoot = markAggregateIncomplete(root);

  return applyCollapsedState(markedRoot);
};
