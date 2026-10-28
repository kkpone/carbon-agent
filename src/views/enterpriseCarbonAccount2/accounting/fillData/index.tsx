import useUrlState from '@ahooksjs/use-url-state';
import AIStarImg from '@src/assets/svg/aiStar.svg';
import { checkPermissions } from '@src/components/Permission/utils';
import type { TreeCollapseDataNode } from '@src/components/TreeCollapse';
import { TreeTitle } from '@src/components/TreeTitle';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { useMount, useUnmount } from 'ahooks';
import { Button, Tooltip } from 'antd';
import { AxiosResponse } from 'axios';
import classNames from 'classnames';
import { isNil, isNull, omit, pick } from 'lodash-es';
import {
  FC,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';

import { useSubscriptionServiceModal } from '@/components/SubscriptionServiceModal';
import { IconAlibaba, IconAlibabaNew } from '@/components/iconfont';
import { RootState } from '@/store';
import {
  CompanyType,
  ProductSource,
} from '@/views/system/login/component/Login';

import AccountEmissions from './components/AccountEmissions';
import AccountModel from './components/AccountModel';
import CommuteImport from './components/CommuteImport';
import HistoryDrawer from './components/HistoryDrawer';
import { ImportSource } from './components/ImportSource';
import styles from './index.module.less';
import {
  EVersionType,
  getFeatureSet,
  getSourceList,
  getSourceListByShare,
  type SourceGroup,
} from './service';
import AiImport from '../../AiImport';
import { AI_IMPORT_TYPE, IMPORT_STATUS } from '../../AiImport/constant';
import { getImportStatus, getTravelImportStatus } from '../../AiImport/service';
import { uniqueIdWithSource } from '../../carbonDischarge/components/FillActiveData/columns';
import { ComputationStatus } from '../type';

type FillDataType = {
  agentPreviewLayout?: boolean;
  computationId: string;
  computationPeriod?: string;
  computationStatus?: ComputationStatus;
  orgId: string;
  versionType?: EVersionType;
  emptySourceIds?: number[];
  lostFactorSourceIds?: number[];
  setEmptySourceIds?: (emptySourceIds: number[]) => void;
  setLostFactorSourceIds?: (ids: number[]) => void;
  refreshResult: () => void;
  updateComputationInfo: () => void;
  setEmissionCount: (arg: { totalCount: number; finishCount: number }) => void;
  isShare?: boolean;
  useShareApis?: boolean;
  companyId?: string;
  forceReadonly?: boolean;
  projectId?: string;
  sessionId?: string;
  shareId?: string;
};

type NormalSourceListRequestParams = Parameters<typeof getSourceList>[0] &
  Record<string, unknown>;
type ShareSourceListExtraParams = Pick<
  Parameters<typeof getSourceListByShare>[0],
  'companyId' | 'orgId'
>;

const fetchAccountingSourceList = (
  params: NormalSourceListRequestParams,
  shareExtraParams?: ShareSourceListExtraParams,
) => {
  if (shareExtraParams) {
    return getSourceListByShare({
      ...params,
      ...shareExtraParams,
    });
  }

  return getSourceList(params);
};

const CollapsePanelTitle = (
  name: string,
  totalEmission: number,
  bold: boolean,
) => (
  <div>
    <span
      className={classNames(styles.panelName, {
        [styles.bold]: bold,
      })}
    >
      {name}
    </span>
    <span className={styles.panelTotal}>{totalEmission}</span>
    <span className={styles.panelUnit}>tCO₂e</span>
  </div>
);

export const FillData: FC<FillDataType> = props => {
  const emissionTableRef = useRef<{
    setSelectedEmissions: (
      val:
        | Record<string, any>[]
        | ((s: Record<string, any>[]) => Record<string, any>[]),
    ) => void;
    setExpandedRowKeys: (val: string[]) => void;
  }>(null);

  const AiImportRef = useRef<{
    onImportTypeClick: (params: {
      computationId: string;
      computationPeriod: string;
      type: string;
    }) => void;
  }>(null);

  const {
    computationId,
    computationPeriod,
    computationStatus,
    versionType,
    emptySourceIds,
    orgId,
    setEmptySourceIds,
    lostFactorSourceIds,
    setLostFactorSourceIds,
    refreshResult,
    updateComputationInfo,
    setEmissionCount,
    isShare,
    useShareApis,
    companyId,
    agentPreviewLayout,
    forceReadonly = false,
    projectId,
    sessionId,
    shareId,
  } = props;
  const shouldUseShareApis = useShareApis ?? isShare;

  const [historyDrawerProps, setHistoryDrawerProps] = useState<{
    visible: boolean;
    id?: number;
  }>({ visible: false });

  const [lightFeatureSet, setLightFeatureSet] = useState<
    Record<string, number>
  >({});

  const companyUserInfo = useSelector(
    (state: RootState) => state.companyUserInfo,
  );

  const {
    userInfo: { companyType },
  } = companyUserInfo;

  const isLightUser = companyType === CompanyType.person;

  const { openSubscriptionModal } = useSubscriptionServiceModal();

  const openSubscription = () => {
    openSubscriptionModal({
      productSource: ProductSource.enterprise,
      onSuccess: () => {
        window.location.reload();
      },
    });
  };

  const [{ AIModelType }, setUrlState] = useUrlState();

  const [AIProcessLoading, setAIProcessLoading] = useState(false);

  const processTimerRef = useRef<NodeJS.Timeout>();

  const [treeData, setTreeData] = useState<TreeCollapseDataNode[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useState<Record<string, any>>({
    versionType,
  });

  const [scopeEmissionInfo, setScopeEmissionInfo] =
    useState<Record<string, any>>();

  const refreshSourceList = async (
    params: { withCheck?: boolean; resetCollapseKeys?: boolean } = {
      withCheck: false,
      resetCollapseKeys: false,
    },
  ) => {
    const { withCheck, resetCollapseKeys } = params;
    const lostFactorSource: number[] = [];
    setLoading(true);
    try {
      const sourceListParams = {
        computationId,
        computationPeriod,
        ...searchParams,
      };
      const sourceList =
        sessionId || shareId
          ? await fetchAccountingSourceList(
              {
                ...sourceListParams,
                ...(sessionId ? { sessionId } : {}),
                ...(shareId ? { shareId } : {}),
              },
              shouldUseShareApis ? { companyId, orgId } : undefined,
            )
          : await fetchAccountingSourceList(
              sourceListParams,
              shouldUseShareApis ? { companyId, orgId } : undefined,
            );
      const newTreeData = sourceList.rootNodes.map(item => ({
        ...item,
        id: `ghgCategory_${item.ghgCategory}`,
        title: TreeTitle(item.name, `${item.finishCount}/${item.totalCount}`),
        collapseTitle: CollapsePanelTitle(
          item.name,
          item.totalEmissions,
          false,
        ),
        key: item.name,
        computationId,
        icon: null,
        children: item.nodes.map(childrenItem => ({
          ...childrenItem,
          id: `ghgClassify_${childrenItem.ghgClassify}`,
          title: TreeTitle(
            childrenItem.name,
            `${childrenItem.finishCount}/${childrenItem.totalCount}`,
            true,
            childrenItem.sourceList.some(
              source => (source as unknown as { redDot: boolean }).redDot,
            ) ||
              (childrenItem.groupList || []).some(group =>
                group.sourceList.some(
                  source => (source as unknown as { redDot: boolean }).redDot,
                ),
              ),
          ),
          key: childrenItem.name,
          collapseTitle: CollapsePanelTitle(
            childrenItem.name,
            childrenItem.totalEmission,
            true,
          ),
          ghgCategoryName: item.name,
          computationId,
          icon: null,
          children: [
            ...childrenItem.sourceList.map(source => {
              // 因子丢失
              const isLostFactor = withCheck && source.lostFactor;
              // 未填写活动数据
              const isEmptySource = withCheck && isNull(source.activityData);
              if (isLostFactor && withCheck) {
                lostFactorSource.push(source.id);
              }
              return {
                ...source,
                status: isEmptySource ? 'error' : '',
                computationId,
              };
            }),
            ...(childrenItem.groupList || []).map((group: SourceGroup) => ({
              ...group,
              id: `group_${group.id}`,
              name: group.groupName,
              ghgCategory: childrenItem.ghgCategory,
              ghgClassify: childrenItem.ghgClassify,
              ghgClassifyName: childrenItem.name,
              computationId,
              children: group.sourceList.map(source => {
                const isLostFactor = withCheck && source.lostFactor;
                const isEmptySource = withCheck && isNull(source.activityData);
                if (isLostFactor && withCheck) {
                  lostFactorSource.push(source.id);
                }
                return {
                  ...source,
                  id: `item_group_source_${source.id}`,
                  status: isEmptySource ? 'error' : '',
                  computationId,
                };
              }),
            })),
          ],
        })),
      }));
      setTreeData(newTreeData as unknown as TreeCollapseDataNode[]);

      setScopeEmissionInfo(omit(sourceList, 'rootNodes'));
      setEmissionCount(
        pick(sourceList, 'totalCount', 'finishCount') as unknown as {
          totalCount: number;
          finishCount: number;
        },
      );
      if (resetCollapseKeys) {
        emissionTableRef.current?.setExpandedRowKeys(
          sourceList.rootNodes.reduce(
            (prev: string[], curr) => [
              ...prev,
              `ghgCategory_${curr.ghgCategory}`,
              ...curr.nodes.flatMap(node => [
                `ghgClassify_${node.ghgClassify}`,
                ...(node.groupList || []).map(group => `group_${group.id}`),
              ]),
            ],
            [],
          ),
        );
      }
    } finally {
      setLoading(false);
    }
    return lostFactorSource;
  };

  useEffect(() => {
    if (versionType !== searchParams.versionType) {
      setSearchParams({
        ...omit(searchParams, ['ghgClassifyList', 'isoClassifyList']),
        versionType,
      });
    }
  }, [versionType]);

  useEffect(() => {
    refreshSourceList({
      withCheck: Boolean(emptySourceIds?.length),
      resetCollapseKeys: true,
    });
  }, [searchParams, sessionId, shareId]);

  useLayoutEffect(() => {
    if (emptySourceIds?.length || lostFactorSourceIds?.length) {
      document
        .getElementById(
          uniqueIdWithSource(
            emptySourceIds?.[0] || lostFactorSourceIds?.[0] || 0,
          ),
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      Toast(
        'info',
        emptySourceIds?.length === 0
          ? I18N.enterpriseCarbonAccount2.pleaseRefineTheFactors
          : I18N.enterpriseCarbonAccount2.pleaseSendTheActivityFirst,
      );
      setEmptySourceIds?.([]);
      setLostFactorSourceIds?.([]);
      setTimeout(() => {
        refreshSourceList({ withCheck: true });
      });
    }
  }, [emptySourceIds, lostFactorSourceIds]);

  const hasEditPermission = !!checkPermissions(
    true,
    'enterprise:computation:edit',
  );

  const readPretty = useMemo(
    () =>
      isShare ||
      forceReadonly ||
      isNil(computationStatus) ||
      !hasEditPermission ||
      computationStatus === ComputationStatus.COMPLETE,
    [computationStatus, forceReadonly, hasEditPermission, isShare],
  );

  const onImportSuccess = () => {
    refreshSourceList();
    updateComputationInfo();
    emissionTableRef.current?.setSelectedEmissions(emissions =>
      emissions.filter(emission => !Number.isNaN(Number(emission.id))),
    );
  };

  useEffect(() => {
    if (!shouldUseShareApis && isLightUser) {
      getFeatureSet().then(res => {
        setLightFeatureSet(res.data.data);
      });
    }
  }, [isLightUser, shouldUseShareApis]);

  useMount(() => {
    if (!AIModelType || !computationPeriod) {
      return;
    }

    let getStatusApi:
      | ((params: {
          computationId: string;
          computationPeriod: string;
        }) => Promise<AxiosResponse<{ data: number }>>)
      | null = null;

    if (AIModelType === AI_IMPORT_TYPE.COMMON) {
      getStatusApi = getImportStatus;
    } else if (AIModelType === AI_IMPORT_TYPE.TRAVEL) {
      getStatusApi = getTravelImportStatus;
    }

    if (!getStatusApi) {
      return;
    }

    const loopAIProcess = async () => {
      clearInterval(processTimerRef.current);
      const { data } = await getStatusApi({
        computationId,
        computationPeriod,
      });
      const isPending = data.data === IMPORT_STATUS.PENDING;

      setAIProcessLoading(isPending);

      if (isPending) {
        processTimerRef.current = setTimeout(loopAIProcess, 1000);
      } else {
        setUrlState({ AIModelType: undefined });
        refreshResult();
        refreshSourceList();
        updateComputationInfo();
      }
    };

    loopAIProcess();
  });

  useUnmount(() => {
    clearInterval(processTimerRef.current);
  });
  return (
    <div className={styles.fillData}>
      <HistoryDrawer
        {...historyDrawerProps}
        computationId={computationId}
        computationPeriod={computationPeriod}
        onClose={() => setHistoryDrawerProps({ visible: false })}
      />
      {AIProcessLoading && (
        <div className={styles.AIProcessMask}>
          <div className={styles.AIProcess}>
            <img
              className={styles.AIProcessIcon}
              src={AIStarImg}
              alt='AIStar'
            />
            <div className={styles.AIProcessText}>
              {I18N.enterpriseCarbonAccount2.aiAnalysisInProgress2}
            </div>
          </div>
        </div>
      )}
      {!agentPreviewLayout && (
        <div className={styles.headerOperate}>
          {!isShare && (
            <Tooltip title={I18N.Certification.operationRecords}>
              <Button
                icon={<IconAlibaba type='icon-icon_record' />}
                onClick={() => setHistoryDrawerProps({ visible: true })}
              />
            </Tooltip>
          )}
          {!readPretty && (
            <AccountModel
              orgId={orgId}
              computationId={computationId}
              computationPeriod={computationPeriod}
              computationStatus={computationStatus}
              isLightUser={isLightUser}
              lightFeatureSet={lightFeatureSet}
              openSubscription={openSubscription}
              onSuccess={() => {
                refreshResult();
                refreshSourceList();
                updateComputationInfo();
              }}
            >
              <Tooltip title={I18N.components.usingModels}>
                <Button
                  icon={<IconAlibaba type='icon-gongyingshangshoushu' />}
                />
              </Tooltip>
            </AccountModel>
          )}
          {/* {!isShare && (
            <Tooltip title={I18N.enterpriseCarbonAccount2.dataExport}>
              <Button
                icon={<IconAlibabaNew type='icon-icon-daochu' />}
                onClick={() => {
                  apiExportTemplate({
                    computationId,
                    computationPeriod,
                    type: 1,
                  }).then(res => {
                    downloadFile(
                      I18N.enterpriseCarbonAccount2.emissionSourceTemplate,
                      res.data.data.path,
                    );
                  });
                }}
              />
            </Tooltip>
          )} */}
          {!readPretty && (
            <ImportSource
              computationId={computationId}
              computationPeriod={computationPeriod}
              onImportSuccess={onImportSuccess}
            >
              <Tooltip title={I18N.enterpriseCarbonAccount2.dataImport}>
                <Button icon={<IconAlibabaNew type='icon-icon-daoru' />} />
              </Tooltip>
            </ImportSource>
          )}
          {!readPretty && (
            <CommuteImport
              computationId={computationId}
              computationPeriod={computationPeriod}
              onImportSuccess={onImportSuccess}
            >
              <Button
                className={styles.commuteBtn}
                icon={<IconAlibabaNew type='icon-tongqin' />}
              >
                {I18N.questionnaire.employeeCommutingQuestions}
              </Button>
            </CommuteImport>
          )}
          {!readPretty &&
            !!checkPermissions(true, 'enterprise:computation:createModel') && (
              <AiImport
                ref={AiImportRef}
                computationId={computationId}
                computationPeriod={computationPeriod as string}
                onImportSuccess={onImportSuccess}
              />
            )}
        </div>
      )}
      <div className={styles.wrapper}>
        <div className={styles.treeCollapseWrapper}>
          <AccountEmissions
            ref={emissionTableRef}
            searchParams={searchParams}
            computationId={computationId}
            computationPeriod={computationPeriod}
            scopeEmissionInfo={scopeEmissionInfo}
            emissionList={treeData}
            loading={loading}
            isShare={isShare}
            useShareApis={shouldUseShareApis}
            sessionId={sessionId}
            shareId={shareId}
            agentPreviewLayout={agentPreviewLayout}
            projectId={projectId}
            readPretty={readPretty}
            computationStatus={computationStatus}
            setSearchParams={setSearchParams}
            refreshList={refreshSourceList}
            openHistoryDrawer={id => {
              setHistoryDrawerProps({
                visible: true,
                id,
              });
            }}
            onTravelImport={() => {
              AiImportRef.current?.onImportTypeClick({
                type: AI_IMPORT_TYPE.TRAVEL,
                computationId,
                computationPeriod: computationPeriod!,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
