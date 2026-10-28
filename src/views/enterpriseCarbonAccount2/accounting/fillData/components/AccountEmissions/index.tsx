/* eslint-disable no-restricted-syntax */
import {
  DeleteOutlined,
  ExclamationCircleFilled,
  InfoCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { ComputationStatus } from '@src/views/enterpriseCarbonAccount2/accounting/type';
import ProductFootprintAccountSelector, {
  ProductFootprintAccountSelection,
} from '@src/views/enterpriseCarbonAccount2/components/ProductFootprintAccountSelector';
import {
  canAssociateProductFootprint,
  isProductCarbonSource,
} from '@src/views/enterpriseCarbonAccount2/productFootprintAssociation/condition';
import { associateProductFootprintSources } from '@src/views/enterpriseCarbonAccount2/productFootprintAssociation/service';
import {
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Select,
  Table,
  TableColumnsType,
  Tooltip,
} from 'antd';
import classNames from 'classnames';
import { debounce, isNil, omit } from 'lodash-es';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import ExpandIcon from '@/components/ExpandIcon';
import FileUploadDrawer from '@/components/FileUploadDrawer';
import NumberInputTableCell from '@/components/NumberInputTableCell';
import { checkPermissions } from '@/components/Permission/utils';
import TableCascaderFilter from '@/components/TableCascaderFilter';
import { TableTransferApp } from '@/components/TableTransfer';
import { IconAlibabaNew } from '@/components/iconfont';
import { useGHGList } from '@/hooks/useScope';
import { useTableScrollHeight } from '@/hooks/useTableScrollHeight';
import { PageInfoType } from '@/router/type';
import { downloadFile, Toast } from '@/utils';
import { ECOINVENT_TEXT } from '@/views/carbonFootprint3/constant';
import {
  NEED_DEFAULT,
  PARAM_TYPE,
  USER_SIDE_DISPLAY,
} from '@/views/enterpriseCarbonAccount2/FormulaSetting/constant';
import { ACTIVITY_TYPE } from '@/views/enterpriseCarbonAccount2/carbonDischarge/components/AccountAddEmission/constant';
import {
  batchUploadAttachment,
  batchDeleteAttachment,
  batchDownloadAttachment,
} from '@/views/enterpriseCarbonAccount2/carbonDischarge/emissionAccount/service';
import {
  apiEditActivityData,
  apiSourceDeleted,
  asyncToDict,
  UpdateFlag,
} from '@/views/enterpriseCarbonAccount2/service';

import GroupNameCell from './GroupNameCell';
import styles from './index.module.less';
import {
  addEmissionGroup,
  batchChangeEmissionGroup,
  deleteEmissionGroup,
  batchDeleteEmissionAttachments,
  batchDeleteEmissionSource,
  batchDownloadEmissionAttachments,
  batchExportEmissionSource,
} from './service';
import {
  EVersionType,
  getSourceChooseList,
  getSourceUnselectedList,
  saveSelectSource,
  type SourceGroup,
} from '../../service';
import CommuteImport from '../CommuteImport';
import ProgressBoard from '../ProgressBoard';
import { AddSource } from '../addSource';

type AccountEmissionsType = {
  agentPreviewLayout?: boolean;
  emissionList: Record<string, any>[];
  computationId: string;
  scopeEmissionInfo?: Record<string, any>;
  searchParams?: Record<string, any>;
  computationPeriod?: string;
  loading?: boolean;
  isShare?: boolean;
  useShareApis?: boolean;
  sessionId?: string;
  shareId?: string;
  projectId?: string;
  readPretty?: boolean;
  computationStatus?: ComputationStatus;
  setSearchParams: (search: Record<string, any>) => void;
  openHistoryDrawer: (id: number) => void;
  refreshList: (params?: Record<string, any>) => void;
  onTravelImport: () => void;
};

/** 有排放源的分组需展开，并带上可见所需的分类 / 维度行 key */
function collectExpandedKeysForGroupsWithSources(
  nodes: Record<string, any>[] | undefined,
  out: Set<string>,
): void {
  if (!nodes?.length) return;
  for (const node of nodes) {
    const id = `${node.id}`;
    const children = node.children as Record<string, any>[] | undefined;
    if (id.startsWith('group_') && children?.length) {
      out.add(id);
      if (node.ghgClassify != null && `${node.ghgClassify}` !== '') {
        out.add(`ghgClassify_${node.ghgClassify}`);
      }
      if (node.ghgCategory != null && `${node.ghgCategory}` !== '') {
        out.add(`ghgCategory_${node.ghgCategory}`);
      }
    }
    collectExpandedKeysForGroupsWithSources(children, out);
  }
}

/** 表格排放量列：null / undefined / '' 展示为「-」，数值 0 照常 */
function formatEmissionQuantityCell(v: unknown): ReactNode {
  if (v === null || v === undefined || v === '') return '-';
  return v as ReactNode;
}

/** 公式参数：用户侧隐藏（show===0）的不在填报表格展示 */
function visibleParamItems<T extends { show?: number }>(
  items: T[] | undefined,
): T[] {
  return (items ?? []).filter(p => p.show !== USER_SIDE_DISPLAY.HIDE);
}

const AccountEmissions = forwardRef<
  {
    setSelectedEmissions: (
      s:
        | Record<string, any>[]
        | ((s: Record<string, any>[]) => Record<string, any>[]),
    ) => void;
    setExpandedRowKeys: (val: string[]) => void;
  },
  AccountEmissionsType
>((props, ref) => {
  const {
    emissionList,
    computationId,
    computationPeriod,
    scopeEmissionInfo,
    searchParams = {},
    readPretty,
    isShare,
    useShareApis,
    sessionId,
    shareId,
    loading,
    computationStatus,
    setSearchParams,
    refreshList,
    openHistoryDrawer,
    onTravelImport,
    agentPreviewLayout,
  } = props;

  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    const out = new Set<string>();
    collectExpandedKeysForGroupsWithSources(emissionList, out);
    const autoKeys = [...out];
    if (autoKeys.length === 0) return;
    setExpandedRowKeys(prev => {
      const prevSet = new Set(prev);
      const toAdd = autoKeys.filter(k => !prevSet.has(k));
      if (toAdd.length === 0) return prev;
      return [...prev, ...toAdd];
    });
  }, [emissionList]);

  const [selectedEmissions, setSelectedEmissions] = useState<
    Record<string, any>[]
  >([]);

  const [changeGroupModal, setChangeGroupModal] = useState<{
    sourceIds: (number | undefined)[];
    ghgClassify: string;
  } | null>(null);
  const [changeGroupTargetGroupId, setChangeGroupTargetGroupId] = useState<
    number | null
  >(null);

  const [addGroupModal, setAddGroupModal] = useState<{
    visible: boolean;
    ghgClassify: number | null;
    groupName: string;
  }>({ visible: false, ghgClassify: null, groupName: '' });

  const [addingGroup, setAddingGroup] = useState(false);

  const [productFootprintTarget, setProductFootprintTarget] = useState<{
    ghgCategory: string;
    ghgClassify: string;
    groupId?: string;
  }>();

  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const tableScrollHeight = useTableScrollHeight({
    containerRef: tableWrapperRef,
    minHeight: 200,
    deps: [emissionList, expandedRowKeys],
  });

  const GHGList = useGHGList();
  const shouldUseShareApis = useShareApis ?? isShare;

  const {
    emissionQuantity,
    scopeOneRate,
    emissionScopeOne,
    scopeTwoRate,
    emissionScopeTwo,
    scopeThreeRate,
    emissionScopeThree,
  } = scopeEmissionInfo || {};

  const isEmission = (record: Record<string, any>) => {
    const { id } = record;
    return (
      !`${id}`.startsWith('ghgCategory') &&
      !`${id}`.startsWith('ghgClassify') &&
      !`${id}`.startsWith('group_')
    );
  };

  const parseRowId = (id: string | number): string | undefined => {
    const str = `${id}`;
    if (str.startsWith('group_')) return str.replace('group_', '');
    if (str.startsWith('item_group_source_'))
      return str.replace('item_group_source_', '');
    return str || undefined;
  };

  const selectedEmissionsId = selectedEmissions
    .filter(isEmission)
    .map(emission => emission.id);

  const selectedGhgClassifySet = useMemo(
    () =>
      new Set(
        selectedEmissions
          .filter(isEmission)
          .map(e => e.ghgClassify as string)
          .filter(Boolean),
      ),
    [selectedEmissions],
  );

  const classifyGroupInfo = useMemo<{
    ghgClassify: string;
    ghgClassifyName: string;
    ghgCategoryName: string;
    groupList: SourceGroup[];
  } | null>(() => {
    if (selectedGhgClassifySet.size !== 1) return null;
    const ghgClassify = Array.from(selectedGhgClassifySet)[0];
    for (const categoryNode of emissionList) {
      for (const classifyNode of (categoryNode.children || []) as Record<
        string,
        any
      >[]) {
        if (classifyNode.ghgClassify === ghgClassify) {
          return {
            ghgClassify,
            ghgClassifyName: classifyNode.name as string,
            ghgCategoryName: classifyNode.ghgCategoryName as string,
            groupList: (classifyNode.groupList || []) as SourceGroup[],
          };
        }
      }
    }
    return null;
  }, [selectedGhgClassifySet, emissionList]);

  const batchChangeGroupTooltip = useMemo(() => {
    if (selectedGhgClassifySet.size > 1) {
      return I18N.enterpriseCarbonAccount2.batchChangeGroupOnlySameCategory;
    }
    if (
      selectedGhgClassifySet.size === 1 &&
      (classifyGroupInfo?.groupList.length ?? 0) <= 0
    ) {
      return I18N.enterpriseCarbonAccount2.noChangableGroupInCategory;
    }
    return undefined;
  }, [selectedGhgClassifySet, classifyGroupInfo]);

  const changeGroupClassifyInfo = useMemo<{
    ghgCategoryName: string;
    ghgClassifyName: string;
    groupList: SourceGroup[];
  } | null>(() => {
    if (!changeGroupModal) return null;
    for (const categoryNode of emissionList) {
      for (const classifyNode of (categoryNode.children || []) as Record<
        string,
        any
      >[]) {
        if (classifyNode.ghgClassify === changeGroupModal.ghgClassify) {
          return {
            ghgCategoryName: (classifyNode.ghgCategoryName ||
              categoryNode.name) as string,
            ghgClassifyName: classifyNode.name as string,
            groupList: (classifyNode.groupList || []) as SourceGroup[],
          };
        }
      }
    }
    return null;
  }, [changeGroupModal, emissionList]);

  const emissionInfoPermission = !!checkPermissions(
    true,
    'enterprise:computation:info',
  );

  const onSearchNameInputChange = useMemo(
    () =>
      debounce((name: string) => {
        setSearchParams({
          ...searchParams,
          name,
        });
      }, 500),
    [searchParams, setSearchParams],
  );

  const ghgFilterValue = useMemo(() => {
    const { versionType, ghgClassifyList, isoClassifyList } = searchParams as {
      versionType: EVersionType;
      ghgClassifyList: string;
      isoClassifyList: string;
    };

    return (
      versionType === EVersionType.ghg ? ghgClassifyList : isoClassifyList
    )?.split(',');
  }, [searchParams]);

  const operationColumnWidth = (() => {
    if (agentPreviewLayout) return 148;
    if (isShare) return 98;
    return 348;
  })();

  const columns: TableColumnsType<Record<string, any>> = [
    {
      title: I18N.carbonFootprint3.emissionSourceName,
      dataIndex: 'ghg',
      className: styles.tableNameColumn,
      width: 248,
      fixed: 'left',
      ellipsis: true,
      filteredValue: ghgFilterValue,
      // eslint-disable-next-line react/no-unstable-nested-components
      filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, close }) => (
        <TableCascaderFilter
          selectedKeys={selectedKeys}
          options={GHGList}
          setSelectedKeys={setSelectedKeys}
          close={close}
          confirm={confirm}
        />
      ),
      render: (_, record) => {
        const {
          id,
          name,
          changed,
          finishCount,
          totalCount,
          facility,
          ghgCategory,
        } = record;
        const expanded = expandedRowKeys.includes(id);

        const isCategory = `${id}`.startsWith('ghgCategory');
        const isClassify = `${id}`.startsWith('ghgClassify');
        const isGroup = `${id}`.startsWith('group_');
        const isGroupSource = `${id}`.startsWith('item_group_source_');

        const borderColor = {
          0: '#36aa63',
          1: '#f0d45b',
          2: '#6e9fda',
        };
        return (
          <div className={styles.emissionNameContent}>
            {!isCategory && (
              <div className={styles.tableLineContent}>
                {Array.from({
                  // eslint-disable-next-line no-nested-ternary
                  length: isClassify ? 1 : isGroupSource ? 3 : 2,
                }).map((_item, i) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    className={styles.tableLine}
                    style={{ borderColor: borderColor[ghgCategory % 3] }}
                  />
                ))}
              </div>
            )}
            {(isCategory || isClassify || isGroup) && (
              <ExpandIcon
                expanded={expanded}
                onClick={() =>
                  setExpandedRowKeys(
                    !expanded
                      ? [...expandedRowKeys, id]
                      : expandedRowKeys.filter(key => key !== id),
                  )
                }
              />
            )}
            <div className={styles.groupNameContainer}>
              {changed && (
                <div className={styles.methodUpdateTag}>
                  {I18N.enterpriseCarbonAccount2.calculationMethodRequired}
                </div>
              )}
              <div className={styles.groupNameRow}>
                {isGroup ? (
                  <GroupNameCell
                    name={name}
                    computationId={computationId}
                    categoryId={Number(record.ghgClassify)}
                    groupId={Number(parseRowId(id))}
                    readPretty={readPretty}
                    onSaveSuccess={refreshList}
                    finishCount={finishCount}
                    totalCount={totalCount}
                  />
                ) : (
                  <>
                    <div
                      className={classNames(styles.groupName, {
                        [styles.emissionName]: !isCategory && !isClassify,
                      })}
                      title={name}
                    >
                      {name}
                    </div>
                    {!isCategory &&
                      !isClassify &&
                      isProductCarbonSource(record.fdType) && (
                        <span
                          className={styles.productFootprintTag}
                          title={I18N.enterpriseCarbonAccount2.productCarbon}
                        >
                          <span className={styles.productFootprintTagText}>
                            {I18N.enterpriseCarbonAccount2.productCarbon}
                          </span>
                        </span>
                      )}
                    {isCategory || isClassify ? (
                      <div className={styles.count}>
                        {finishCount}/{totalCount}
                      </div>
                    ) : (
                      <div className={styles.facility} title={facility}>
                        {facility || '-'}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: I18N.greenMeeting.activityType,
      dataIndex: 'activityType',
      width: 148,
      render: (_, record) => {
        if (!isEmission(record)) {
          return null;
        }
        const { activityType, methodObj } = record as {
          activityType: number;
          methodObj: {
            paramItem: { name: string; id: number; show?: number }[];
          };
        };
        if (activityType === ACTIVITY_TYPE.FORMULA) {
          return (
            <div className={styles.paramCell}>
              {visibleParamItems(methodObj?.paramItem).map(param => (
                <div
                  key={param.id}
                  className={styles.paramText}
                  title={param.name}
                >
                  {param.name}
                </div>
              ))}
            </div>
          );
        }
        return I18N.enterpriseCarbonAccount2.numberOfActivities;
      },
    },
    {
      title: I18N.carbonFootprint3.activityData,
      dataIndex: 'activityData',
      width: 148,
      ellipsis: true,
      render: (_, record) => {
        if (!isEmission(record)) {
          return null;
        }
        /** 在审批流中 */
        const isInFlow = record.isFlow === '1';

        const { methodObj, activityType } = record as {
          submitterAssignStatus: number;
          activityType: number;
          methodObj: {
            paramItem: {
              name: string;
              id: number;
              show?: number;
              hasValue: number;
              defaultValue: number | string;
            }[];
          };
        };
        const inputDisabled = readPretty;

        if (activityType === ACTIVITY_TYPE.FORMULA) {
          return (
            <div className={styles.paramCell}>
              {visibleParamItems(methodObj?.paramItem).map(param => {
                const paramDisabled =
                  inputDisabled ||
                  param.hasValue === NEED_DEFAULT.NEED ||
                  isInFlow;
                const paramRaw = param.defaultValue;
                const paramValueNorm =
                  isNil(paramRaw) || paramRaw === '' ? undefined : paramRaw;

                return (
                  <NumberInputTableCell
                    key={param.id}
                    className={styles.dataInput}
                    value={paramValueNorm}
                    disabled={paramDisabled}
                    controls={false}
                    min={0}
                    stringMode
                    maxDecimals={10}
                    maxIntegerDigits={agentPreviewLayout ? 9 : undefined}
                    digitLimitMode={agentPreviewLayout ? 'validate' : undefined}
                    digitLimitMessage={
                      agentPreviewLayout
                        ? I18N.carbonAgent
                            .enterpriseCarbonActivityDataDigitLimit
                        : undefined
                    }
                    placeholder={I18N.carbonFootprint3.activityData}
                    onBlur={
                      paramDisabled
                        ? undefined
                        : async val => {
                            const prevEmpty =
                              param.defaultValue == null ||
                              param.defaultValue === '';
                            const nextEmpty = val === null || val === '';
                            if (prevEmpty && nextEmpty) return;
                            if (
                              !prevEmpty &&
                              !nextEmpty &&
                              Number(val) === Number(param.defaultValue)
                            ) {
                              return;
                            }

                            await apiEditActivityData({
                              activityData:
                                val === null || val === '' ? '' : val,
                              id: parseRowId(record.id),
                              paramId: parseRowId(param.id),
                            });

                            refreshList();
                          }
                    }
                  />
                );
              })}
            </div>
          );
        }
        const cellDisabled = inputDisabled || isInFlow;
        const activityRaw = record.activityData;
        const activityValueNorm =
          isNil(activityRaw) || activityRaw === '' ? undefined : activityRaw;

        return (
          <NumberInputTableCell
            className={styles.dataInput}
            value={activityValueNorm}
            disabled={cellDisabled}
            controls={false}
            min={0}
            stringMode
            maxDecimals={10}
            maxIntegerDigits={agentPreviewLayout ? 9 : undefined}
            digitLimitMode={agentPreviewLayout ? 'validate' : undefined}
            digitLimitMessage={
              agentPreviewLayout
                ? I18N.carbonAgent.enterpriseCarbonActivityDataDigitLimit
                : undefined
            }
            placeholder={I18N.carbonFootprint3.activityData}
            onBlur={
              cellDisabled
                ? undefined
                : async val => {
                    const prevEmpty =
                      record.activityData == null || record.activityData === '';
                    const nextEmpty = val === null || val === '';
                    if (prevEmpty && nextEmpty) return;
                    if (
                      !prevEmpty &&
                      !nextEmpty &&
                      Number(val) === Number(record.activityData)
                    ) {
                      return;
                    }

                    await apiEditActivityData({
                      activityData: val === null || val === '' ? '' : val,
                      id: parseRowId(record.id) || record.id,
                    });

                    refreshList();
                  }
            }
          />
        );
      },
    },
    {
      title: I18N.carbonFootprint.unit,
      dataIndex: 'activityUnitDesc',
      width: 87,
      ellipsis: true,
      render: (text, record) => {
        if (!isEmission(record)) {
          return null;
        }

        const { activityType, methodObj } = record as {
          activityType: number;
          methodObj: {
            paramItem: {
              name: string;
              id: number;
              show?: number;
              paramType: number;
              unitName: string;
            }[];
          };
        };

        if (activityType === ACTIVITY_TYPE.FORMULA) {
          return (
            <div className={styles.paramCell}>
              {visibleParamItems(methodObj?.paramItem).map(param => {
                const { paramType, unitName } = param;
                const unitText =
                  (paramType === PARAM_TYPE.PERCENT ? '%' : unitName) || '-';

                return (
                  <div
                    key={param.id}
                    className={styles.paramText}
                    title={unitText}
                  >
                    {unitText}
                  </div>
                );
              })}
            </div>
          );
        }
        return <div className={styles.tableEllipsisText}>{text}</div>;
      },
    },
    {
      title: I18N.esg.lastYearsSamePeriodValue,
      width: 122,
      dataIndex: 'prev',
      ellipsis: true,
      render: (_, record) => {
        if (!isEmission(record)) {
          return null;
        }

        const { preActivityData, preActivityUnitDesc } = record;
        return preActivityData ? (
          <div
            className={styles.compareLastYear}
            title={`${preActivityData}${preActivityUnitDesc}`}
          >
            <span>{preActivityData}</span>
            <span>{preActivityUnitDesc}</span>
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      title: I18N.enterpriseCarbonAccount2.factorCoefficient,
      width: 177,
      dataIndex: 'factorValue',
      ellipsis: true,
      render: (_, record) => {
        const { factorValue, factorUnit, factorUnitM } = record;
        if (!isEmission(record)) {
          return null;
        }

        if (shouldHideEcoinventValue(record)) {
          return ECOINVENT_TEXT;
        }

        return factorValue ? (
          <div
            className={styles.tableEllipsisText}
          >{`${factorValue} ${factorUnit}/${factorUnitM}`}</div>
        ) : (
          '-'
        );
      },
    },
    {
      title: I18N.carbonData.emissionsTC,
      width: 160,
      dataIndex: 'emissionQuantity',
      ellipsis: true,
      render: (text, record) => {
        const display = formatEmissionQuantityCell(text);
        return (
          <span
            className={classNames(styles.emissionValue, {
              [styles.groupEmissionValue]: !isEmission(record),
            })}
            title={text}
          >
            {display}
          </span>
        );
      },
    },
    {
      title: (
        <div className={styles.columnTitle}>
          {I18N.components.attachment}
          <Tooltip overlay={I18N.enterpriseCarbonAccount2.supportPdf2}>
            <InfoCircleOutlined className={styles.columnTitleIcon} />
          </Tooltip>
        </div>
      ),
      width: 229,
      dataIndex: 'supportImg',
      render: (_, record) => {
        if (!isEmission(record)) {
          return null;
        }
        /** 在审批流中 */
        const isInFlow = record.isFlow === '1';
        const id = parseRowId(record.id);

        const attachments =
          (
            record as {
              supportImg: { name: string; url: string; supportImgId: number }[];
            }
          ).supportImg || [];

        const uploadDisabled = readPretty || isInFlow;
        const [firstAttachment, ...restAttachments] = attachments;

        const attachmentNameArr = firstAttachment
          ? firstAttachment.name.split('.')
          : [];
        const attachmentType = `.${attachmentNameArr.pop()}`;
        const attachmentName = attachmentNameArr.join('.');

        return (
          <FileUploadDrawer
            files={attachments.map(file => ({
              ...file,
              id: file.supportImgId,
            }))}
            disabled={uploadDisabled}
            footerMode={agentPreviewLayout ? 'close' : 'default'}
            isolateDragEvents={agentPreviewLayout}
            onSuccess={async files => {
              await batchUploadAttachment({
                sourceIdList: [id],
                supportImg: files,
              });
              Toast('success', I18N.enterpriseCarbonAccount2.uploadSuccessful);
              refreshList();
            }}
            onDelete={async files => {
              await batchDeleteAttachment({
                supportImgIds: files.map(file => file.id),
              });
              Toast('success', I18N.carbonFootprint.deleteSuccessful);
              refreshList();
            }}
            onBatchDownload={async files => {
              const { data } = await batchDownloadAttachment({
                supportImgIds: files.map(file => file.id),
              });
              window.open(data.data.url);
            }}
          >
            <div className={classNames(styles.tagContainer)}>
              <IconAlibabaNew
                className={classNames(styles.addIcon)}
                type='icon-icon-xinzeng-saas'
              />
              {firstAttachment ? (
                <div className={classNames(styles.tagContent)}>
                  <div className={styles.tag}>
                    <div
                      className={styles.fileName}
                      title={firstAttachment.name}
                    >
                      <span className={styles.tagName}>{attachmentName}</span>
                      <span>{attachmentType}</span>
                    </div>
                    {!uploadDisabled && (
                      <IconAlibabaNew
                        className={styles.closeIcon}
                        type='icon-icon-guanbi'
                        onClick={async e => {
                          e.stopPropagation();
                          await batchDeleteAttachment({
                            supportImgIds: [firstAttachment.supportImgId],
                          });
                          Toast(
                            'success',
                            I18N.carbonFootprint.deleteSuccessful,
                          );
                          refreshList();
                        }}
                      />
                    )}
                  </div>
                  {restAttachments.length > 0 && (
                    <div className={styles.tag}>+{restAttachments.length}</div>
                  )}
                </div>
              ) : (
                <div className={styles.emptyTagText}>
                  {I18N.components.uploadAttachments}
                </div>
              )}
            </div>
          </FileUploadDrawer>
        );
      },
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: operationColumnWidth,
      fixed: 'right',
      render: (_, record) => {
        const {
          id,
          ghgCategory,
          ghgClassify,
          isoClassify,
          ghgClassifyName,
          ghgCategoryName,
          name,
          allowSync,
          dictSourceId,
        } = record;

        /** 在审批流中 */
        const isInFlow = record.isFlow === '1';

        const isCategory = `${id}`.startsWith('ghgCategory');
        const isClassify = `${id}`.startsWith('ghgClassify');
        const isGroup = `${id}`.startsWith('group_');

        const saveToLibPermission = !!checkPermissions(
          true,
          'enterprise:dictSource:add',
        );

        if (isCategory) {
          return null;
        }

        if (isClassify || isGroup) {
          const { versionType } = searchParams;
          const isTravel =
            (versionType === EVersionType.ghg && ghgClassify === '15') ||
            (versionType === EVersionType.iso && ghgClassify === '10');

          const isCommuting =
            (versionType === EVersionType.ghg && ghgClassify === '16') ||
            (versionType === EVersionType.iso && ghgClassify === '11');

          const showProductFootprintAssociation = canAssociateProductFootprint({
            versionType,
            ghgCategory,
            ghgClassify,
          });

          const addSourceNode = (
            <AddSource
              title={I18N.carbonFootprint.newEmissionSourcesAdded}
              computationId={computationId}
              groupId={parseRowId(id)}
              computationPeriod={computationPeriod}
              versionType={versionType}
              initGhgClassify={ghgClassify}
              initGhgCategory={ghgCategory}
              agentPreviewLayout={agentPreviewLayout}
              enableProductFootprintAssociation={agentPreviewLayout}
              sessionId={sessionId}
              shareId={shareId}
              addSuccess={() => {
                refreshList();
                setSelectedEmissions(emissions => emissions.filter(isEmission));
              }}
              pageInfoType={PageInfoType.add}
            >
              {agentPreviewLayout ? (
                <Button
                  className={`${styles.addEmissionBtn} ${
                    showProductFootprintAssociation
                      ? styles.addCustomEmissionSourceMenuButton
                      : ''
                  }`}
                  type='link'
                >
                  {showProductFootprintAssociation
                    ? I18N.enterpriseCarbonAccount2.addCustomEmissionSource
                    : I18N.carbonFootprint.newEmissionSourcesAdded}
                </Button>
              ) : (
                <div>{I18N.carbonFootprint.newEmissionSourcesAdded}</div>
              )}
            </AddSource>
          );

          return (
            !readPretty && (
              <div className={styles.operateColumn}>
                {agentPreviewLayout ? (
                  showProductFootprintAssociation ? (
                    <Dropdown
                      trigger={['click']}
                      menu={{
                        items: [
                          {
                            label: addSourceNode,
                            key: 'addCustomEmissionSource',
                          },
                          {
                            label:
                              I18N.enterpriseCarbonAccount2
                                .associateProductFootprint,
                            key: 'associateProductFootprint',
                            onClick: () => {
                              setProductFootprintTarget({
                                ghgCategory: String(ghgCategory),
                                ghgClassify: String(ghgClassify),
                                groupId: isGroup ? parseRowId(id) : undefined,
                              });
                            },
                          },
                        ],
                      }}
                    >
                      <Button
                        className={styles.addEmissionBtn}
                        type='link'
                        icon={<PlusCircleOutlined />}
                      >
                        {I18N.carbonFootprint.newAddition}
                      </Button>
                    </Dropdown>
                  ) : (
                    addSourceNode
                  )
                ) : (
                  <Dropdown
                    trigger={['click']}
                    menu={{
                      items: [
                        {
                          label: (
                            <TableTransferApp
                              groupId={parseRowId(id)}
                              getSourceChooseList={async () => {
                                const data = await getSourceChooseList({
                                  computationId,
                                  ghgClassify,
                                  isoClassify,
                                  computationPeriod,
                                });
                                return data.data.data;
                              }}
                              getSourceUnselectedList={params =>
                                getSourceUnselectedList({
                                  ...params,
                                  computationId,
                                  computationPeriod,
                                  ghgClassify,
                                  isoClassify,
                                })
                              }
                              stringTitle={`${
                                ghgCategoryName || ghgClassifyName
                              }/${name}`}
                              saveSelectSource={async params => {
                                await saveSelectSource({
                                  ...params,
                                  computationId: Number(computationId),
                                  computationPeriod,
                                });
                              }}
                              {...record}
                              addSuccess={() => {
                                refreshList();
                                setSelectedEmissions(emissions =>
                                  emissions.filter(isEmission),
                                );
                              }}
                            >
                              <div>
                                {
                                  I18N.enterpriseCarbonAccount2
                                    .fromEmissionSourceRepository2
                                }
                              </div>
                            </TableTransferApp>
                          ),
                          key: 'select',
                        },
                        {
                          label: addSourceNode,
                          key: 'add',
                        },
                        isGroup
                          ? null
                          : {
                              label: (
                                <div>
                                  {I18N.enterpriseCarbonAccount2.addGroup}
                                </div>
                              ),
                              key: 'addGroup',
                              onClick: () => {
                                setAddGroupModal({
                                  visible: true,
                                  ghgClassify: Number(ghgClassify),
                                  groupName: '',
                                });
                              },
                            },
                      ],
                    }}
                  >
                    <Button
                      className={styles.addEmissionBtn}
                      type='link'
                      icon={<PlusCircleOutlined />}
                    >
                      {I18N.carbonFootprint.newAddition}
                    </Button>
                  </Dropdown>
                )}
                {!agentPreviewLayout && isTravel && (
                  <Button
                    type='link'
                    icon={<IconAlibabaNew type='icon-icon-shangchuan' />}
                    onClick={onTravelImport}
                  >
                    {
                      I18N.enterpriseCarbonAccount2
                        .importTheNumberOfBusinessTrips
                    }
                  </Button>
                )}
                {!agentPreviewLayout && isCommuting && (
                  <CommuteImport
                    computationId={computationId}
                    computationPeriod={computationPeriod}
                    onImportSuccess={refreshList}
                  >
                    <Button
                      type='link'
                      icon={<IconAlibabaNew type='icon-tongqin' />}
                    >
                      {I18N.questionnaire.employeeCommutingQuestions}
                    </Button>
                  </CommuteImport>
                )}
                {!agentPreviewLayout && isGroup && (
                  <Button
                    type='link'
                    danger
                    onClick={() => {
                      const groupNumericId = parseRowId(id);
                      const hasChildren = (record.children ?? []).length > 0;

                      const doDelete = async () => {
                        await deleteEmissionGroup({ id: groupNumericId });
                        Toast(
                          'success',
                          I18N.carbonFootprint.operationSuccessful,
                        );
                        refreshList();
                      };

                      if (!hasChildren) {
                        doDelete();
                        return;
                      }

                      const confirmTitle = I18N.template(
                        I18N.enterpriseCarbonAccount2.deleteGroupConfirmTitle,
                        { val1: name },
                      );
                      const titleParts = confirmTitle.split(name);

                      Modal.confirm({
                        icon: null,
                        closable: true,
                        title: (
                          <div className={styles.deleteConfirmTitle}>
                            {titleParts.map((part, index, array) => (
                              <>
                                {part}
                                {index < array.length - 1 && (
                                  <span className={styles.highlightName}>
                                    {name}
                                  </span>
                                )}
                              </>
                            ))}
                          </div>
                        ),
                        content: (
                          <div className={styles.deleteConfirmContent}>
                            <ExclamationCircleFilled
                              className={styles.deleteConfirmIcon}
                            />
                            {I18N.template(
                              I18N.enterpriseCarbonAccount2
                                .deleteGroupConfirmContent,
                              { val1: name },
                            )}
                          </div>
                        ),
                        okText: I18N.carbonFootprint.confirm,
                        cancelText: I18N.carbonFootprint.cancel,
                        onOk: doDelete,
                      });
                    }}
                  >
                    {I18N.enterpriseCarbonAccount2.deleteGroup}
                  </Button>
                )}
              </div>
            )
          );
        }

        return (
          <div className={styles.operateColumn}>
            {(isShare || emissionInfoPermission) && (
              <AddSource
                id={parseRowId(id)}
                isShare={shouldUseShareApis}
                computationId={computationId}
                computationPeriod={computationPeriod}
                versionType={searchParams.versionType}
                enableProductFootprintAssociation={
                  agentPreviewLayout || Boolean(isShare)
                }
                pageInfoType={PageInfoType.edit}
                readPretty={readPretty || isInFlow}
                addSuccess={refreshList}
                agentPreviewLayout={agentPreviewLayout}
                sessionId={sessionId}
                shareId={shareId}
              >
                <Button type='link'>{I18N.carbonFootprint3.details}</Button>
              </AddSource>
            )}
            {!agentPreviewLayout &&
              !isShare &&
              saveToLibPermission &&
              !!allowSync && (
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      ...(dictSourceId
                        ? [
                            {
                              label: (
                                <div
                                  onClick={async () => {
                                    await asyncToDict({
                                      sourceId: Number(parseRowId(id)),
                                      updateFlag: UpdateFlag.update,
                                    });
                                    refreshList();
                                  }}
                                >
                                  {
                                    I18N.enterpriseCarbonAccount2
                                      .replaceExistingRow
                                  }
                                </div>
                              ),
                              key: 'update',
                            },
                          ]
                        : []),
                      {
                        label: (
                          <div
                            onClick={async () => {
                              await asyncToDict({
                                sourceId: parseRowId(id),
                                updateFlag: UpdateFlag.add,
                              });
                              refreshList();
                            }}
                          >
                            {I18N.enterpriseCarbonAccount2.saveAsNewArrangement}
                          </div>
                        ),
                        key: 'saveAsNew',
                      },
                    ],
                  }}
                >
                  <Button type='link'>
                    {I18N.enterpriseCarbonAccount2.saveToEmissions}
                  </Button>
                </Dropdown>
              )}
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  {
                    key: 'history',
                    label: <div>{I18N.enterpriseCarbonAccount2.history}</div>,
                    onClick: () => openHistoryDrawer(Number(parseRowId(id))),
                  },
                  !agentPreviewLayout && !readPretty
                    ? {
                        key: 'changeGroup',
                        label: (
                          <div>{I18N.enterpriseCarbonAccount2.changeGroup}</div>
                        ),
                        onClick: () => {
                          setChangeGroupTargetGroupId(null);
                          setChangeGroupModal({
                            sourceIds: [parseRowId(id)],
                            ghgClassify,
                          });
                        },
                      }
                    : null,
                  !readPretty
                    ? {
                        key: 'delete',
                        label: (
                          <div style={{ color: '#ff4d4f' }}>
                            {I18N.carbonFootprint.delete}
                          </div>
                        ),
                        onClick: () => {
                          Modal.confirm({
                            icon: null,
                            title:
                              I18N.enterpriseCarbonAccount2.confirmDeletion,
                            okText: I18N.carbonFootprint.confirm,
                            cancelText: I18N.carbonFootprint.cancel,
                            okButtonProps: { danger: true },
                            onOk: async () => {
                              await apiSourceDeleted(parseRowId(id));
                              Toast(
                                'success',
                                I18N.carbonFootprint.deleteSuccessful,
                              );
                              refreshList();
                              setSelectedEmissions(
                                selectedEmissions.filter(
                                  emission => emission.id !== id,
                                ),
                              );
                            },
                          });
                        },
                      }
                    : null,
                ],
              }}
            >
              <Button type='link'>{I18N.enterpriseCarbonAccount2.more}</Button>
            </Dropdown>
          </div>
        );
      },
    },
  ];

  const visibleColumns = agentPreviewLayout
    ? columns.filter(column => {
        const dataIndex = 'dataIndex' in column ? column.dataIndex : undefined;
        const normalizedDataIndex = Array.isArray(dataIndex)
          ? dataIndex.join('.')
          : dataIndex;
        return !['prev'].includes(String(normalizedDataIndex));
      })
    : columns;

  const handleBatchDelete = () => {
    Modal.confirm({
      icon: null,
      title: I18N.components.batchDeletion,
      content: (
        <div>
          {I18N.components.selected}
          {selectedEmissionsId.length}
          {I18N.enterpriseCarbonAccount2.isThereAnyData}
        </div>
      ),
      onOk: async () => {
        await batchDeleteEmissionSource({
          computationId,
          sourceIdList: selectedEmissionsId.map(parseRowId),
        });
        Toast('success', I18N.carbonFootprint.operationSuccessful);
        setSelectedEmissions([]);
        refreshList();
      },
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      setSelectedEmissions,
      setExpandedRowKeys,
    }),
    [],
  );
  return (
    <div
      className={classNames(styles.accountEmissions, {
        [styles.accountEmissionsAgentPreview]: agentPreviewLayout,
      })}
    >
      <Modal
        open={addGroupModal.visible}
        title={I18N.enterpriseCarbonAccount2.addGroup}
        okButtonProps={{ disabled: !addGroupModal.groupName.trim() }}
        confirmLoading={addingGroup}
        onCancel={() =>
          setAddGroupModal({ visible: false, ghgClassify: null, groupName: '' })
        }
        onOk={async () => {
          setAddingGroup(true);
          try {
            await addEmissionGroup({
              computationId: Number(computationId),
              ghgClassify: addGroupModal.ghgClassify!,
              groupName: addGroupModal.groupName.trim(),
            });
            Toast('success', I18N.carbonFootprint.operationSuccessful);
            setAddGroupModal({
              visible: false,
              ghgClassify: null,
              groupName: '',
            });
            await refreshList({ resetCollapseKeys: true });
          } finally {
            setAddingGroup(false);
          }
        }}
      >
        <Form layout='vertical'>
          <Form.Item label={I18N.enterpriseCarbonAccount2.groupName} required>
            <Input
              value={addGroupModal.groupName}
              placeholder={I18N.enterpriseCarbonAccount2.pleaseEnterGroupName}
              maxLength={50}
              showCount
              onChange={e =>
                setAddGroupModal(prev => ({
                  ...prev,
                  groupName: e.target.value,
                }))
              }
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={!!changeGroupModal}
        title={I18N.enterpriseCarbonAccount2.changeGroup}
        okButtonProps={{ disabled: changeGroupTargetGroupId === null }}
        onCancel={() => {
          setChangeGroupModal(null);
          setChangeGroupTargetGroupId(null);
        }}
        onOk={async () => {
          if (!changeGroupModal || changeGroupTargetGroupId === null) return;
          const targetGroup = changeGroupClassifyInfo?.groupList.find(
            g => g.id === changeGroupTargetGroupId,
          );
          await batchChangeEmissionGroup({
            actionType: 'EXECUTE',
            sourceIds: changeGroupModal.sourceIds,
            targetGroupId: String(changeGroupTargetGroupId),
          });
          Toast(
            'success',
            I18N.template(
              I18N.enterpriseCarbonAccount2.batchChangeGroupSuccess,
              {
                val1: changeGroupModal.sourceIds.length,
                val2: targetGroup?.groupName ?? '',
              },
            ),
          );
          setChangeGroupModal(null);
          setChangeGroupTargetGroupId(null);
          refreshList();
        }}
      >
        <div className={styles.changeGroupCount}>
          {I18N.components.selected}
          <span className={styles.selectCount}>
            {changeGroupModal?.sourceIds.length ?? 0}
          </span>
          {I18N.enterpriseCarbonAccount2.emissionSources}
        </div>
        <Form layout='vertical'>
          <Form.Item label={I18N.enterpriseCarbonAccount2.ghgClassification2}>
            <div className={styles.ghgClassifyNameBox}>
              {changeGroupClassifyInfo?.ghgCategoryName}
              {changeGroupClassifyInfo?.ghgCategoryName &&
              changeGroupClassifyInfo?.ghgClassifyName
                ? '/'
                : ''}
              {changeGroupClassifyInfo?.ghgClassifyName}
            </div>
          </Form.Item>
          <Form.Item
            label={I18N.enterpriseCarbonAccount2.customGrouping}
            required
          >
            <Select
              value={changeGroupTargetGroupId}
              onChange={setChangeGroupTargetGroupId}
              placeholder={I18N.enterpriseCarbonAccount2.pleaseSelectGroup}
              options={(changeGroupClassifyInfo?.groupList ?? []).map(g => ({
                value: g.id,
                label: g.groupName,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
      <div className={styles.header}>
        <div className={styles.headerTotalCard}>
          <div className={styles.headerTotalTitleRow}>
            <IconAlibabaNew
              className={styles.headerTotalIcon}
              type='icon-icon-zongpaifangliang'
            />
            <div className={styles.headerTotalLabels}>
              <span className={styles.headerTotalLabel}>
                {I18N.enterpriseCarbonAccount2.totalEmissions}
              </span>
              <span className={styles.headerTotalUnit}>（tCO₂e）</span>
            </div>
          </div>
          <div className={styles.totalEmissionValue}>{emissionQuantity}</div>
        </div>
        <div className={classNames(styles.scopeCard, styles.scopeCardScopeOne)}>
          <div className={styles.scopeCardLabel}>
            {`${I18N.eca.scopeOne}：${scopeOneRate ?? '-'}%`}
          </div>
          <div className={styles.scopeCardValue}>{emissionScopeOne}</div>
        </div>
        <div className={classNames(styles.scopeCard, styles.scopeCardScopeTwo)}>
          <div className={styles.scopeCardLabel}>
            {`${I18N.eca.scope2}：${scopeTwoRate ?? '-'}%`}
          </div>
          <div className={styles.scopeCardValue}>{emissionScopeTwo}</div>
        </div>
        <div
          className={classNames(styles.scopeCard, styles.scopeCardScopeThree)}
        >
          <div className={styles.scopeCardLabel}>
            {`${I18N.eca.fanWeisan}：${scopeThreeRate ?? '-'}%`}
          </div>
          <div className={styles.scopeCardValue}>{emissionScopeThree}</div>
        </div>
      </div>
      {!agentPreviewLayout &&
        !isShare &&
        computationStatus !== ComputationStatus.COMPLETE && (
          <ProgressBoard
            emissionList={emissionList}
            computationId={computationId}
            computationPeriod={computationPeriod}
          />
        )}
      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <div className={styles.batchContent}>
            <div>
              {I18N.components.selected}
              <span className={styles.selectCount}>
                {selectedEmissionsId.length}
              </span>
              {I18N.enterpriseCarbonAccount2.emissionSources}
            </div>
            {!isShare && (
              <>
                {!agentPreviewLayout && !readPretty && (
                  <Button
                    icon={<DeleteOutlined />}
                    disabled={selectedEmissionsId.length === 0}
                    onClick={handleBatchDelete}
                  >
                    {I18N.components.batchDeletion}
                  </Button>
                )}
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      agentPreviewLayout && !readPretty
                        ? {
                            key: 'batchDelete',
                            label: <div>{I18N.components.batchDeletion}</div>,
                            onClick: handleBatchDelete,
                          }
                        : null,
                      !readPretty
                        ? {
                            key: 'batchUploadAttachment',
                            label: (
                              <FileUploadDrawer
                                batch={false}
                                footerMode={
                                  agentPreviewLayout ? 'close' : 'default'
                                }
                                isolateDragEvents={agentPreviewLayout}
                                onSuccess={async files => {
                                  await batchUploadAttachment({
                                    sourceIdList: selectedEmissionsId.map(id =>
                                      parseRowId(id),
                                    ),
                                    supportImg: files,
                                  });
                                  Toast(
                                    'success',
                                    I18N.enterpriseCarbonAccount2
                                      .uploadSuccessful,
                                  );
                                  refreshList();
                                }}
                              >
                                <div>
                                  {
                                    I18N.enterpriseCarbonAccount2
                                      .batchUploadWithAttachments
                                  }
                                </div>
                              </FileUploadDrawer>
                            ),
                          }
                        : null,
                      {
                        key: 'batchDownloadAttachment',
                        label: (
                          <div>
                            {
                              I18N.enterpriseCarbonAccount2
                                .batchDownloadAttachment
                            }
                          </div>
                        ),
                        onClick: async () => {
                          const { data } =
                            await batchDownloadEmissionAttachments({
                              computationId,
                              sourceIdList: selectedEmissionsId.map(id =>
                                parseRowId(id),
                              ),
                            });
                          downloadFile(data.data.url);
                        },
                      },
                      !readPretty
                        ? {
                            key: 'batchClearAttachment',
                            label: (
                              <div>
                                {
                                  I18N.enterpriseCarbonAccount2
                                    .batchClearingAttached
                                }
                              </div>
                            ),
                            onClick: async () => {
                              await batchDeleteEmissionAttachments({
                                computationId,
                                sourceIdList: selectedEmissionsId.map(id =>
                                  parseRowId(id),
                                ),
                              });
                              Toast(
                                'success',
                                I18N.carbonFootprint.operationSuccessful,
                              );
                              refreshList();
                            },
                          }
                        : null,
                      {
                        key: 'batchExport',
                        label: (
                          <div>
                            {I18N.enterpriseCarbonAccount2.batchExportQuantity}
                          </div>
                        ),
                        onClick: async () => {
                          const { data } = await batchExportEmissionSource({
                            computationId,
                            sourceIdList: selectedEmissionsId.map(id =>
                              parseRowId(id),
                            ),
                          });
                          downloadFile(data.data.path);
                        },
                      },
                      !agentPreviewLayout && !readPretty
                        ? {
                            key: 'batchChangeGroup',
                            label: (
                              <Tooltip
                                title={batchChangeGroupTooltip}
                                placement='right'
                              >
                                <div
                                  style={{
                                    color: batchChangeGroupTooltip
                                      ? 'rgba(0,0,0,0.25)'
                                      : undefined,
                                    cursor: batchChangeGroupTooltip
                                      ? 'not-allowed'
                                      : undefined,
                                  }}
                                >
                                  {
                                    I18N.enterpriseCarbonAccount2
                                      .batchChangeGroup
                                  }
                                </div>
                              </Tooltip>
                            ),
                            onClick: batchChangeGroupTooltip
                              ? undefined
                              : () => {
                                  setChangeGroupTargetGroupId(null);
                                  setChangeGroupModal({
                                    sourceIds: selectedEmissionsId.map(id =>
                                      parseRowId(id),
                                    ),
                                    ghgClassify: Array.from(
                                      selectedGhgClassifySet,
                                    )[0],
                                  });
                                },
                          }
                        : null,
                    ],
                  }}
                >
                  <Button
                    className={classNames({
                      [styles.moreBatchOperationsButton]: agentPreviewLayout,
                    })}
                    iconPosition='end'
                    icon={<IconAlibabaNew type='icon-chevron-down' />}
                    disabled={selectedEmissionsId.length === 0}
                  >
                    {I18N.enterpriseCarbonAccount2.moreBatchOperations}
                  </Button>
                </Dropdown>
              </>
            )}
          </div>
          <div>
            <Input
              className={styles.searchNameInput}
              prefix={
                <IconAlibabaNew
                  className={styles.searchNameInputIcon}
                  type='icon-icon-sousuo-saas'
                />
              }
              defaultValue={searchParams.name}
              placeholder={
                I18N.enterpriseCarbonAccount2.searchForEmissionSources
              }
              onChange={e => onSearchNameInputChange(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.tableWrapper} ref={tableWrapperRef}>
          <Table
            className={styles.table}
            rowKey='id'
            columns={visibleColumns}
            pagination={false}
            dataSource={emissionList}
            loading={loading}
            scroll={{ x: 1400, y: tableScrollHeight }}
            virtual
            sticky={{
              offsetScroll: 0,
            }}
            expandable={{
              expandedRowKeys,
              indentSize: 0,
              expandIcon: () => null,
            }}
            rowSelection={{
              columnWidth: 32,
              selectedRowKeys: selectedEmissions.map(emission => emission.id),
              checkStrictly: false,
              onChange: (_, selected) => {
                setSelectedEmissions(selected);
              },
            }}
            onChange={(_, filter) => {
              setSearchParams({
                ...omit(searchParams, ['ghgClassifyList', 'isoClassifyList']),
                [searchParams.versionType === EVersionType.ghg
                  ? 'ghgClassifyList'
                  : 'isoClassifyList']: filter.ghg?.join(),
              });
            }}
          />
        </div>
      </div>
      <ProductFootprintAccountSelector
        open={Boolean(productFootprintTarget)}
        selectionMode='multiple'
        onCancel={() => setProductFootprintTarget(undefined)}
        onConfirm={async (selectedRows: ProductFootprintAccountSelection[]) => {
          if (!productFootprintTarget) return;
          await associateProductFootprintSources({
            computationId,
            ...(computationPeriod && computationPeriod !== '0'
              ? { computationPeriod }
              : {}),
            ghgCategory: productFootprintTarget.ghgCategory,
            ghgClassify: productFootprintTarget.ghgClassify,
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
          refreshList();
        }}
      />
    </div>
  );
});

export default AccountEmissions;
