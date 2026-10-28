import { Checkbox, Empty, Modal, Spin } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import FileUploadDrawer from '@/components/FileUploadDrawer';
import I18N from '@/lang/I18N';
import { Toast } from '@/utils';
import HistoryDrawer from '@/views/enterpriseCarbonAccount2/accounting/fillData/components/HistoryDrawer';
import {
  EVersionType,
  type SourceListElement,
} from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';
import {
  batchDeleteAttachment,
  batchDownloadAttachment,
  batchUploadAttachment,
} from '@/views/enterpriseCarbonAccount2/carbonDischarge/emissionAccount/service';
import { COMPUTATION_STATUS } from '@/views/enterpriseCarbonAccount2/constant';
import ProductFootprintAccountSelector, {
  ProductFootprintAccountSelection,
} from '@/views/enterpriseCarbonAccount2/components/ProductFootprintAccountSelector';
import type { ScopeTree } from '@/views/enterpriseCarbonAccount2/listInfo/types';
import {
  GHGFirstSelect,
  ISOFirstSelect,
} from '@/views/enterpriseCarbonAccount2/listInfo/util';
import { apiSourceDeleted } from '@/views/enterpriseCarbonAccount2/service';
import { associateProductFootprintSources } from '@/views/enterpriseCarbonAccount2/productFootprintAssociation/service';

import AccountAddEmissionDrawer from './AccountAddEmissionDrawer';
import EnterpriseCarbonCanvasTaskPanel from './EnterpriseCarbonCanvasTaskPanel';
import EnterpriseCarbonMindMap, {
  type EnterpriseCarbonMindMapHandle,
} from './EnterpriseCarbonMindMap';
import categoryArrowIcon from './assets/canvas-icons/category-arrow.svg';
import zoomMinusIcon from './assets/canvas-icons/zoom-minus.svg';
import zoomPlusIcon from './assets/canvas-icons/zoom-plus.svg';
import {
  buildEnterpriseCarbonCanvasData,
  type EnterpriseCarbonSourceData,
} from './canvasData';
import type {
  EnterpriseCarbonCanvasAction,
  EnterpriseCarbonCanvasActionPayload,
  EnterpriseCarbonCanvasAttachment,
  EnterpriseCarbonCanvasTaskContext,
} from './canvasTypes';
import styles from './index.module.less';
import {
  getEnterpriseSourceTree,
  type EnterpriseSourceTreeData,
  type EnterpriseSourceTreeNode,
  type EnterpriseSourceTreeSource,
} from './service';
import type {
  EnterpriseCarbonAccountingContext,
  EnterpriseCarbonOrgNode,
} from './types';
import { enterpriseCarbonTaskService } from '../EnterpriseCarbonProjectTasks/service';

type CanvasViewProps = {
  activeOrg?: EnterpriseCarbonOrgNode;
  accountingContext?: EnterpriseCarbonAccountingContext;
  canCreateTask?: boolean;
  canEditEmissionSource?: boolean;
  periodDisplayName?: string;
  projectId?: string;
  readonly?: boolean;
  sessionId?: string;
  shareId?: string;
  versionType?: EVersionType;
};

type CanvasRequestParams = {
  computationId: string;
  computationPeriod: string;
  ghgCategory?: string;
  isoCategory?: string;
  sessionId?: string;
  shareId?: string;
  unfilled?: string;
  versionType: EVersionType;
};

type SelectedCategoryIdsByVersion = Record<EVersionType, string[]>;

const getOptionalString = (value?: string | number | null) => {
  const text =
    value === undefined || value === null ? '' : String(value).trim();

  return text === 'undefined' || text === 'null' ? '' : text;
};

const getVersionType = (
  accountingContext: EnterpriseCarbonAccountingContext,
) => {
  const rawVersionType = getOptionalString(accountingContext.versionType);

  return rawVersionType === EVersionType.iso
    ? EVersionType.iso
    : EVersionType.ghg;
};

const getCanvasCategoryOptions = (versionType?: EVersionType | string) =>
  versionType === EVersionType.iso ? ISOFirstSelect : GHGFirstSelect;

const getDefaultCategoryIds = (categoryOptions: ScopeTree[]) =>
  categoryOptions.map(category => category.id);

const getCommonTaskTypes = (sources: EnterpriseCarbonCanvasTaskContext[]) => {
  const firstSource = sources[0];

  return firstSource
    ? firstSource.availableTaskTypes.filter(taskType =>
        sources
          .slice(1)
          .every(source => source.availableTaskTypes.includes(taskType)),
      )
    : [];
};

const scrollCategoryLegend = (
  legend: HTMLDivElement | null,
  direction: -1 | 1,
) => {
  if (!legend) {
    return;
  }

  legend.scrollBy({
    behavior: 'smooth',
    left: legend.clientWidth * 0.75 * direction,
  });
};

const getScopeNodeId = (
  versionType: EVersionType,
  categoryId?: string | number | null,
) => `scope_${versionType}_${getOptionalString(categoryId)}`;

const getScopeNodeIds = (
  sourceData: EnterpriseCarbonSourceData | undefined,
  versionType: EVersionType,
) =>
  (sourceData?.rootNodes || []).map(scopeNode =>
    getScopeNodeId(versionType, scopeNode.ghgCategory),
  );

const getDefaultCollapsedScopeIds = (
  sourceData: EnterpriseCarbonSourceData | undefined,
  versionType: EVersionType,
) => new Set(getScopeNodeIds(sourceData, versionType).slice(1));

const getDefaultCollapsedKey = (
  requestParams: CanvasRequestParams,
  sourceData: EnterpriseCarbonSourceData,
) =>
  [
    requestParams.computationId,
    requestParams.computationPeriod,
    requestParams.ghgCategory,
    requestParams.isoCategory,
    ...(requestParams.sessionId
      ? [requestParams.sessionId, requestParams.shareId]
      : []),
    requestParams.versionType,
    getScopeNodeIds(sourceData, requestParams.versionType).join(','),
  ].join('|');

const getTaskSourceId = (value?: string | number | null) => {
  const sourceId = getOptionalString(value);

  return sourceId.startsWith('item_group_source_')
    ? sourceId.replace('item_group_source_', '')
    : sourceId;
};

const getAvailableTaskSourceIds = (sourceData?: EnterpriseCarbonSourceData) =>
  new Set(
    (sourceData?.rootNodes || []).flatMap(scopeNode =>
      (scopeNode.nodes || []).flatMap(classifyNode => [
        ...(classifyNode.sourceList || []).map(source =>
          getTaskSourceId(source.id),
        ),
        ...(classifyNode.groupList || []).flatMap(group =>
          (group.sourceList || []).map(source => getTaskSourceId(source.id)),
        ),
      ]),
    ),
  );

const getCanvasRequestParams = ({
  accountingContext,
  onlyIncomplete,
  selectedCategoryIds,
  versionType,
}: Pick<CanvasViewProps, 'accountingContext' | 'versionType'> & {
  onlyIncomplete: boolean;
  selectedCategoryIds: string[];
}): CanvasRequestParams | undefined => {
  if (!accountingContext?.computationId) {
    return undefined;
  }

  const currentVersionType = versionType || getVersionType(accountingContext);
  const selectedCategoryParam = selectedCategoryIds.length
    ? selectedCategoryIds.join(',')
    : undefined;

  return {
    computationId: accountingContext.computationId,
    computationPeriod: getOptionalString(accountingContext.computationPeriod),
    ghgCategory:
      currentVersionType === EVersionType.ghg
        ? selectedCategoryParam
        : undefined,
    isoCategory:
      currentVersionType === EVersionType.iso
        ? selectedCategoryParam
        : undefined,
    unfilled: onlyIncomplete ? '1' : undefined,
    versionType: currentVersionType,
  };
};

const getProjectCanvasRequestParams = ({
  sessionId,
  shareId,
  ...params
}: Pick<
  CanvasViewProps,
  'accountingContext' | 'sessionId' | 'shareId' | 'versionType'
> & {
  onlyIncomplete: boolean;
  selectedCategoryIds: string[];
}): CanvasRequestParams | undefined => {
  if (!sessionId) {
    return undefined;
  }

  const requestParams = getCanvasRequestParams(params);

  return requestParams
    ? {
        ...requestParams,
        sessionId,
        ...(shareId ? { shareId } : {}),
      }
    : undefined;
};

const getSharedCanvasRequestParams = ({
  shareId,
  ...params
}: Pick<CanvasViewProps, 'accountingContext' | 'shareId' | 'versionType'> & {
  onlyIncomplete: boolean;
  selectedCategoryIds: string[];
}): CanvasRequestParams | undefined => {
  const requestParams = getCanvasRequestParams(params);

  return requestParams && shareId
    ? {
        ...requestParams,
        shareId,
      }
    : requestParams;
};

const normalizeSourceTreeSource = (
  source: EnterpriseSourceTreeSource,
  ghgCategory?: string | number | null,
  ghgClassify?: string | number | null,
): SourceListElement =>
  ({
    ...source,
    activityUnitDesc: source.activityUnit,
    ghgCategory: getOptionalString(ghgCategory),
    ghgClassify: getOptionalString(ghgClassify),
  } as unknown as SourceListElement);

const normalizeSourceTreeClassifyNode = (
  classifyNode: EnterpriseSourceTreeNode,
  ghgCategory?: string | number | null,
) => ({
  finishCount: classifyNode.finishCount,
  ghgCategory: getOptionalString(ghgCategory),
  ghgClassify: getOptionalString(classifyNode.code),
  name: classifyNode.name,
  sourceList: (classifyNode.sourceList || []).map(source =>
    normalizeSourceTreeSource(source, ghgCategory, classifyNode.code),
  ),
  totalCount: classifyNode.totalCount,
  totalEmission: classifyNode.emissionQuantity ?? undefined,
});

const normalizeSourceTreeData = (
  sourceTreeData: EnterpriseSourceTreeData,
): EnterpriseCarbonSourceData => ({
  finishCount: sourceTreeData.finishCount,
  orgName: sourceTreeData.orgName,
  rootNodes: (sourceTreeData.nodeList || []).map(scopeNode => ({
    finishCount: scopeNode.finishCount,
    ghgCategory: getOptionalString(scopeNode.code),
    name: scopeNode.name,
    rate: scopeNode.rate,
    nodes: (scopeNode.children || []).map(classifyNode =>
      normalizeSourceTreeClassifyNode(classifyNode, scopeNode.code),
    ),
    totalCount: scopeNode.totalCount,
    totalEmissions: scopeNode.emissionQuantity ?? undefined,
  })),
  totalCount: sourceTreeData.totalCount,
  totalEmissions: sourceTreeData.emissionQuantity ?? undefined,
  unit: sourceTreeData.unit,
});

const fetchEnterpriseCarbonSourceData = async (
  requestParams: CanvasRequestParams,
) => {
  const data = await getEnterpriseSourceTree(requestParams);

  return normalizeSourceTreeData(data);
};

const CanvasView = ({
  activeOrg,
  accountingContext,
  canCreateTask = true,
  canEditEmissionSource = true,
  periodDisplayName,
  projectId,
  readonly = false,
  sessionId,
  shareId,
  versionType,
}: CanvasViewProps) => {
  const graphRef = useRef<EnterpriseCarbonMindMapHandle>(null);
  const attachmentTriggerRef = useRef<HTMLButtonElement>(null);
  const shouldOpenAttachmentDrawerRef = useRef(false);
  const defaultCollapsedKeyRef = useRef('');
  const [sourceData, setSourceData] = useState<EnterpriseCarbonSourceData>();
  const [loading, setLoading] = useState(false);
  const [onlyIncomplete, setOnlyIncomplete] = useState(false);
  const [reloadSignal, setReloadSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedCategoryIdsByVersion, setSelectedCategoryIdsByVersion] =
    useState<SelectedCategoryIdsByVersion>(() => ({
      [EVersionType.ghg]: getDefaultCategoryIds(
        getCanvasCategoryOptions(EVersionType.ghg),
      ),
      [EVersionType.iso]: getDefaultCategoryIds(
        getCanvasCategoryOptions(EVersionType.iso),
      ),
    }));
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [drawerAction, setDrawerAction] =
    useState<EnterpriseCarbonCanvasAction | null>(null);
  const [productFootprintPayload, setProductFootprintPayload] =
    useState<EnterpriseCarbonCanvasActionPayload | null>(null);
  const [historyDrawerProps, setHistoryDrawerProps] = useState<{
    id?: number;
    visible: boolean;
  }>({ visible: false });
  const [attachmentDrawerState, setAttachmentDrawerState] = useState<{
    payload: EnterpriseCarbonCanvasActionPayload;
  } | null>(null);
  const [selectedTaskSources, setSelectedTaskSources] = useState<
    Map<string, EnterpriseCarbonCanvasTaskContext>
  >(() => new Map());

  const normalizedVersionType =
    versionType ||
    (accountingContext ? getVersionType(accountingContext) : EVersionType.ghg);
  const isAccountingCompleted =
    Number(accountingContext?.status) === COMPUTATION_STATUS.COMPLETE;
  const isCanvasReadOnly =
    readonly || !canEditEmissionSource || isAccountingCompleted;
  const taskSelectionEnabled = Boolean(projectId && !readonly && canCreateTask);
  const taskSelectionContextKey = [
    projectId,
    accountingContext?.orgId,
    accountingContext?.computationId,
    accountingContext?.computationPeriod,
    normalizedVersionType,
  ].join('|');
  const selectedTaskSourceIds = useMemo(
    () => new Set(selectedTaskSources.keys()),
    [selectedTaskSources],
  );
  const selectedTaskSourceList = useMemo(
    () => Array.from(selectedTaskSources.values()),
    [selectedTaskSources],
  );
  const selectedTaskTypeKey = useMemo(
    () => getCommonTaskTypes(selectedTaskSourceList).join('|'),
    [selectedTaskSourceList],
  );
  const categoryOptions = useMemo(
    () => getCanvasCategoryOptions(normalizedVersionType),
    [normalizedVersionType],
  );
  const selectedCategoryIds =
    selectedCategoryIdsByVersion[normalizedVersionType];
  const categoryLegendRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedCategoryIdsByVersion(currentIdsByVersion => ({
      ...currentIdsByVersion,
      [normalizedVersionType]: currentIdsByVersion[normalizedVersionType]
        ?.length
        ? currentIdsByVersion[normalizedVersionType]
        : getDefaultCategoryIds(categoryOptions),
    }));
  }, [categoryOptions, normalizedVersionType]);

  useEffect(() => {
    setSelectedTaskSources(new Map());
  }, [taskSelectionContextKey, taskSelectionEnabled]);

  const requestParams = useMemo(() => {
    const params = {
      accountingContext,
      onlyIncomplete,
      selectedCategoryIds,
      versionType,
    };

    if (projectId) {
      return getProjectCanvasRequestParams({
        ...params,
        sessionId,
        shareId,
      });
    }

    return shareId
      ? getSharedCanvasRequestParams({ ...params, shareId })
      : getCanvasRequestParams(params);
  }, [
    accountingContext,
    onlyIncomplete,
    projectId,
    selectedCategoryIds,
    sessionId,
    shareId,
    versionType,
  ]);

  useEffect(() => {
    defaultCollapsedKeyRef.current = '';
    setCollapsedIds(new Set());
  }, [
    requestParams?.computationId,
    requestParams?.computationPeriod,
    requestParams?.ghgCategory,
    requestParams?.isoCategory,
    requestParams?.sessionId,
    requestParams?.shareId,
    requestParams?.versionType,
  ]);

  useEffect(() => {
    if (!attachmentDrawerState) {
      return;
    }

    if (shouldOpenAttachmentDrawerRef.current) {
      shouldOpenAttachmentDrawerRef.current = false;
      attachmentTriggerRef.current?.click();
    }
  }, [attachmentDrawerState]);

  useEffect(() => {
    if (!requestParams) {
      setSourceData(undefined);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    setLoading(true);

    fetchEnterpriseCarbonSourceData(requestParams)
      .then(data => {
        if (cancelled) {
          return;
        }

        const defaultCollapsedKey = getDefaultCollapsedKey(requestParams, data);

        if (defaultCollapsedKeyRef.current !== defaultCollapsedKey) {
          defaultCollapsedKeyRef.current = defaultCollapsedKey;
          setCollapsedIds(
            getDefaultCollapsedScopeIds(data, requestParams.versionType),
          );
        }
        setSourceData(data);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        graphRef.current?.cancelPendingLayoutPreservation();
        setSourceData(undefined);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestParams, reloadSignal]);

  useEffect(() => {
    if (!sourceData) {
      return;
    }

    const availableSourceIds = getAvailableTaskSourceIds(sourceData);

    setSelectedTaskSources(currentSources => {
      const nextSources = new Map(
        Array.from(currentSources).filter(([sourceId]) =>
          availableSourceIds.has(sourceId),
        ),
      );

      return nextSources.size === currentSources.size
        ? currentSources
        : nextSources;
    });
  }, [sourceData]);

  const graphData = useMemo(() => {
    if (!sourceData || !requestParams || !accountingContext) {
      return undefined;
    }

    // Keep task selection out of graph data so checking a source does not
    // rebuild the graph and change the current node positions or viewport.
    return buildEnterpriseCarbonCanvasData({
      activeOrg,
      accountingContext,
      collapsedIds,
      computationId: requestParams.computationId,
      computationPeriod: requestParams.computationPeriod,
      isShare: readonly,
      periodDisplayName,
      readPretty: isCanvasReadOnly,
      sourceData,
      taskSelectionEnabled,
      versionType: requestParams.versionType,
    });
  }, [
    activeOrg,
    accountingContext,
    collapsedIds,
    isCanvasReadOnly,
    periodDisplayName,
    requestParams,
    readonly,
    sourceData,
    taskSelectionEnabled,
  ]);

  const handleTaskSelectionChange = useCallback(
    (target: EnterpriseCarbonCanvasTaskContext) => {
      if (!taskSelectionEnabled) {
        return;
      }

      setSelectedTaskSources(currentSources => {
        const nextSources = new Map(currentSources);
        const sourceId = getTaskSourceId(target.emissionSourceId);

        if (nextSources.has(sourceId)) {
          nextSources.delete(sourceId);
        } else {
          const commonTaskTypes = getCommonTaskTypes(
            Array.from(currentSources.values()),
          );
          const hasCommonTaskType = commonTaskTypes.some(taskType =>
            target.availableTaskTypes.includes(taskType),
          );

          if (currentSources.size && !hasCommonTaskType) {
            return currentSources;
          }

          nextSources.set(sourceId, target);
        }

        return nextSources;
      });
    },
    [taskSelectionEnabled],
  );

  const handleCollapsedChange = useCallback(
    (id: string, collapsed: boolean) => {
      setCollapsedIds(prevIds => {
        const nextIds = new Set(prevIds);

        if (collapsed) {
          nextIds.add(id);
        } else if (id.startsWith('scope_')) {
          getScopeNodeIds(sourceData, normalizedVersionType).forEach(
            scopeNodeId => {
              if (scopeNodeId !== id) {
                nextIds.add(scopeNodeId);
              }
            },
          );
          nextIds.delete(id);
        } else {
          nextIds.delete(id);
        }

        return nextIds;
      });
    },
    [normalizedVersionType, sourceData],
  );

  const handleDrawerSuccess = useCallback(() => {
    if (
      drawerAction?.type === 'addSource' ||
      drawerAction?.type === 'sourceDetail'
    ) {
      graphRef.current?.preserveLayoutOnNextDataUpdate(drawerAction.nodeId);
    }
    setReloadSignal(current => current + 1);
  }, [drawerAction?.nodeId, drawerAction?.type]);

  const handleGraphAction = useCallback(
    (action: EnterpriseCarbonCanvasAction) => {
      const sourceId = Number(action.payload.id);

      if (action.type === 'sourceHistory') {
        if (Number.isNaN(sourceId)) {
          return;
        }

        setHistoryDrawerProps({ id: sourceId, visible: true });
        return;
      }

      if (action.type === 'sourceDelete') {
        if (isCanvasReadOnly) {
          return;
        }

        if (Number.isNaN(sourceId)) {
          return;
        }

        Modal.confirm({
          icon: null,
          title: I18N.enterpriseCarbonAccount2.confirmDeletion,
          okText: I18N.carbonFootprint.confirm,
          cancelText: I18N.carbonFootprint.cancel,
          okButtonProps: { danger: true },
          onOk: async () => {
            await apiSourceDeleted(sourceId);
            Toast('success', I18N.carbonFootprint.deleteSuccessful);
            setReloadSignal(current => current + 1);
          },
        });
        return;
      }

      if (action.type === 'sourceAttachment') {
        if (Number.isNaN(sourceId)) {
          return;
        }

        shouldOpenAttachmentDrawerRef.current = true;
        setAttachmentDrawerState({
          payload: action.payload,
        });
        return;
      }

      if (action.type === 'associateProductFootprint') {
        if (isCanvasReadOnly) return;
        setProductFootprintPayload(action.payload);
        return;
      }

      if (action.type === 'addSource' && isCanvasReadOnly) {
        return;
      }

      setDrawerAction(action);
    },
    [isCanvasReadOnly],
  );

  const handleAttachmentSuccess = useCallback(
    async (files: Omit<EnterpriseCarbonCanvasAttachment, 'id'>[]) => {
      const payload = attachmentDrawerState?.payload;
      const sourceId = Number(payload?.id);

      if (!payload || Number.isNaN(sourceId) || isCanvasReadOnly) {
        return;
      }

      await batchUploadAttachment({
        sourceIdList: [sourceId],
        supportImg: files,
      });
      Toast('success', I18N.enterpriseCarbonAccount2.uploadSuccessful);
      setAttachmentDrawerState(currentState => {
        if (!currentState) {
          return currentState;
        }

        const nextFiles = files.map(file => ({
          ...file,
          id: file.url || file.name,
        }));

        return {
          ...currentState,
          payload: {
            ...currentState.payload,
            supportImg: [
              ...(currentState.payload.supportImg || []),
              ...nextFiles,
            ],
          },
        };
      });
      setReloadSignal(current => current + 1);
    },
    [attachmentDrawerState?.payload, isCanvasReadOnly],
  );

  const handleAttachmentDelete = useCallback(
    async (files: EnterpriseCarbonCanvasAttachment[]) => {
      if (isCanvasReadOnly) {
        return;
      }
      await batchDeleteAttachment({
        supportImgIds: files.map(file => file.id),
      });
      Toast('success', I18N.carbonFootprint.deleteSuccessful);
      setAttachmentDrawerState(currentState => {
        if (!currentState) {
          return currentState;
        }

        const deleteIdSet = new Set(files.map(file => file.id));

        return {
          ...currentState,
          payload: {
            ...currentState.payload,
            supportImg: (currentState.payload.supportImg || []).filter(
              file => !deleteIdSet.has(file.id),
            ),
          },
        };
      });
      setReloadSignal(current => current + 1);
    },
    [isCanvasReadOnly],
  );

  const handleAttachmentBatchDownload = useCallback(
    async (files: EnterpriseCarbonCanvasAttachment[]) => {
      const { data } = await batchDownloadAttachment({
        supportImgIds: files.map(file => file.id),
      });

      window.open(data.data.url);
    },
    [],
  );

  const handleZoomChange = useCallback((nextZoom: number) => {
    setZoom(nextZoom);
  }, []);

  const handleResetView = useCallback(() => {
    graphRef.current?.fitCenter();
    setResetSignal(current => current + 1);
  }, []);

  return (
    <div className={styles.canvasView}>
      <div className={styles.canvasWorkspace}>
        <div className={styles.canvasControls}>
          <div
            className={`${styles.canvasControlCard} ${styles.canvasIncompleteControl}`}
          >
            <Checkbox
              checked={onlyIncomplete}
              disabled={!sourceData}
              onChange={event => setOnlyIncomplete(event.target.checked)}
            >
              {I18N.carbonAgent.enterpriseCarbonShowUnfilledOnly}
            </Checkbox>
          </div>
          <div
            className={`${styles.canvasControlCard} ${styles.canvasCategoryControl}`}
          >
            {normalizedVersionType === EVersionType.iso && (
              <button
                aria-label={I18N.carbonAgent.prevPage}
                className={`${styles.canvasCategoryArrow} ${styles.canvasCategoryArrowPrev}`}
                onClick={() =>
                  scrollCategoryLegend(categoryLegendRef.current, -1)
                }
                type='button'
              >
                <img alt='' src={categoryArrowIcon} />
              </button>
            )}
            <div
              ref={categoryLegendRef}
              className={`${styles.canvasLegend} ${
                normalizedVersionType === EVersionType.iso
                  ? styles.canvasLegendIso
                  : ''
              }`}
            >
              {categoryOptions.map(category => (
                <Checkbox
                  checked={selectedCategoryIds.includes(category.id)}
                  key={category.id}
                  onChange={event => {
                    setSelectedCategoryIdsByVersion(currentIdsByVersion => {
                      const currentIds =
                        currentIdsByVersion[normalizedVersionType] || [];

                      if (event.target.checked) {
                        return {
                          ...currentIdsByVersion,
                          [normalizedVersionType]: currentIds.includes(
                            category.id,
                          )
                            ? currentIds
                            : currentIds.concat(category.id),
                        };
                      }

                      return {
                        ...currentIdsByVersion,
                        [normalizedVersionType]: currentIds.filter(
                          id => id !== category.id,
                        ),
                      };
                    });
                  }}
                >
                  {category.category}
                </Checkbox>
              ))}
            </div>
            {normalizedVersionType === EVersionType.iso && (
              <button
                aria-label={I18N.carbonAgent.nextPage}
                className={styles.canvasCategoryArrow}
                onClick={() =>
                  scrollCategoryLegend(categoryLegendRef.current, 1)
                }
                type='button'
              >
                <img alt='' src={categoryArrowIcon} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.canvasGraphShell}>
          {graphData ? (
            <EnterpriseCarbonMindMap
              ref={graphRef}
              data={graphData}
              resetSignal={resetSignal}
              onAction={handleGraphAction}
              onCollapsedChange={handleCollapsedChange}
              onTaskSelectionChange={handleTaskSelectionChange}
              onZoomChange={handleZoomChange}
              selectedTaskSourceIds={selectedTaskSourceIds}
              selectedTaskTypeKey={selectedTaskTypeKey}
            />
          ) : null}
        </div>

        {!loading && !graphData ? (
          <div className={styles.canvasState}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={I18N.carbonAgent.noData}
            />
          </div>
        ) : null}

        {loading ? (
          <div className={styles.canvasLoadingMask}>
            <Spin />
          </div>
        ) : null}

        <div className={styles.canvasZoomControls}>
          <button
            type='button'
            className={styles.canvasOriginalViewButton}
            onClick={handleResetView}
          >
            {I18N.carbonAgent.enterpriseCarbonOriginalView}
          </button>
          <div className={styles.canvasZoomGroup}>
            <button
              type='button'
              className={styles.canvasZoomButton}
              onClick={() => graphRef.current?.zoomOut()}
            >
              <img alt='' src={zoomMinusIcon} />
            </button>
            <span className={styles.canvasZoomText}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              type='button'
              className={styles.canvasZoomButton}
              onClick={() => graphRef.current?.zoomIn()}
            >
              <img alt='' src={zoomPlusIcon} />
            </button>
          </div>
        </div>

        {taskSelectionEnabled &&
        projectId &&
        sessionId &&
        selectedTaskSourceList.length ? (
          <EnterpriseCarbonCanvasTaskPanel
            allowed={canCreateTask && !readonly}
            projectId={projectId}
            selectedSources={selectedTaskSourceList}
            service={enterpriseCarbonTaskService}
            sourceSessionId={sessionId}
            onCancel={() => setSelectedTaskSources(new Map())}
            onSuccess={() => setSelectedTaskSources(new Map())}
          />
        ) : null}
      </div>

      {drawerAction ? (
        <AccountAddEmissionDrawer
          {...drawerAction.payload}
          agentPreviewLayout
          enableProductFootprintAssociation
          sessionId={sessionId}
          shareId={shareId}
          open={Boolean(drawerAction)}
          onClose={() => setDrawerAction(null)}
          addSuccess={handleDrawerSuccess}
        />
      ) : null}

      {productFootprintPayload ? (
        <ProductFootprintAccountSelector
          open
          selectionMode='multiple'
          onCancel={() => setProductFootprintPayload(null)}
          onConfirm={async (
            selectedRows: ProductFootprintAccountSelection[],
          ) => {
            await associateProductFootprintSources({
              computationId: productFootprintPayload.computationId,
              ...(productFootprintPayload.computationPeriod &&
              productFootprintPayload.computationPeriod !== '0'
                ? {
                    computationPeriod:
                      productFootprintPayload.computationPeriod,
                  }
                : {}),
              ghgCategory: productFootprintPayload.initGhgCategory || '',
              ghgClassify: productFootprintPayload.initGhgClassify || '',
              list: selectedRows.map(
                ({
                  id,
                  accountName,
                  productName,
                  unitCode,
                  factor,
                  activityData,
                }) => ({
                  id,
                  accountName,
                  productName,
                  unitCode,
                  factor,
                  activityData: activityData ?? null,
                }),
              ),
            });
            setReloadSignal(current => current + 1);
          }}
        />
      ) : null}

      {requestParams ? (
        <HistoryDrawer
          agentPreviewLayout
          visible={historyDrawerProps.visible}
          id={historyDrawerProps.id}
          computationId={requestParams.computationId}
          computationPeriod={requestParams.computationPeriod}
          onClose={() => setHistoryDrawerProps({ visible: false })}
        />
      ) : null}

      {attachmentDrawerState ? (
        <FileUploadDrawer
          files={attachmentDrawerState.payload.supportImg || []}
          disabled={
            isCanvasReadOnly ||
            Boolean(attachmentDrawerState.payload.readPretty)
          }
          footerMode='close'
          isolateDragEvents
          onSuccess={handleAttachmentSuccess}
          onDelete={handleAttachmentDelete}
          onBatchDownload={handleAttachmentBatchDownload}
        >
          <button
            aria-label={I18N.components.uploadAttachments}
            ref={attachmentTriggerRef}
            type='button'
            style={{ display: 'none' }}
          />
        </FileUploadDrawer>
      ) : null}
    </div>
  );
};

export default CanvasView;
