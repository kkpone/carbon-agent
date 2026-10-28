import { FilterFilled, QuestionCircleOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import {
  Button,
  Input,
  Modal,
  Select,
  Table,
  Tabs,
  Tooltip,
  TreeSelect,
} from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { FilterValue } from 'antd/es/table/interface';
import classNames from 'classnames';
import { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { streamFetch } from '@/api/streamFetch';
import { IconAlibaba } from '@/components/iconfont';
import { tryParseJSON } from '@/utils';
import { ORG_TYPE } from '@/views/enterpriseCarbonAccount2/constant';

import styles from './index.module.less';
import {
  getDisclosureReportDetail,
  getDisclosureReportBoundaryRows,
  getDisclosureReportMajorGhgRows,
  saveDisclosureEvaluate,
  saveDisclosureQuant,
} from '../../service';
import {
  DISCLOSURE_DETAIL_TAB,
  DISCLOSURE_REPORT_STANDARD,
  DisclosureBoundaryRow,
  DisclosureDetailTab,
  DisclosureGhgFactorField,
  DisclosureGhgRow,
  DisclosureQuantifyStatus,
  DisclosureReportDetailData,
  DisclosureReportListItem,
  DisclosureReportStandard,
  Org,
} from '../../type';

type DisclosureReportDetailProps = {
  open?: boolean;
  mode?: 'modal' | 'page';
  year?: string;
  orgList: DisclosureOrg[];
  orgLoading?: boolean;
  initialOrgId?: number;
  currentOrgId?: number;
  onClose: () => void;
};

type DisclosureOrg = Pick<Org, 'id' | 'name' | 'orgType'> &
  Pick<DisclosureReportListItem, 'children'> & {
    [p: string]: any;
  };

type OrgSelectOption = DisclosureOrg & {
  level: number;
};

type OrgTreeNode = {
  title: ReactNode;
  label: string;
  value: number;
  key: number;
  children?: OrgTreeNode[];
};

type DisclosureTableFilters = Record<string, FilterValue | null>;

type DisclosureFilterOption = {
  text: string;
  value: string;
};

type DisclosureDetailRequestParams = Parameters<
  typeof getDisclosureReportDetail
>[0];

const OrgIconMap = {
  [ORG_TYPE.ENTERPRISE]: 'icon-a-icon-qiyebeijing',
  [ORG_TYPE.ORG]: 'icon-icon_hesuanfenzu',
  [ORG_TYPE.MAIN_PART]: 'icon-icon_hesuanzhuti',
} as const;

const TABLE_FILTER_KEY = {
  SCOPE: 'scope',
  CATEGORY: 'category',
  QUANTIFIED: 'quantified',
  MAJOR_INDIRECT_EMISSION: 'majorIndirectEmission',
} as const;

const AI_GHG_FACTOR_CONFIG = [
  {
    field: 'factorA',
    valueKeys: ['intendUse', 'factorA'],
    scoreKeys: ['intendUseScore', 'factorAScore'],
  },
  {
    field: 'factorB',
    valueKeys: ['industryGuide', 'factorB'],
    scoreKeys: ['industryGuideScore', 'factorBScore'],
  },
  {
    field: 'factorC',
    valueKeys: ['dataDifficulty', 'factorC'],
    scoreKeys: ['dataDifficultyScore', 'factorCScore'],
  },
  {
    field: 'factorD',
    valueKeys: ['emissionImpact', 'factorD'],
    scoreKeys: ['emissionImpactScore', 'factorDScore'],
  },
] as const;

const AI_GHG_ROW_LIST_KEYS = [
  'majorGhg',
  'qualityFactor',
  'categoryEmission',
  'categoryEmissionList',
  'categoryEmissions',
  'evaluateList',
  'rows',
  'list',
  'data',
] as const;

const QUANTIFIED_YES_LABEL = '是';
const QUANTIFIED_YES_VALUE = '0';
const BOUNDARY_REMARK_MAX_LENGTH = 500;

const renderScopeCell = (record: { scope: string; scopeRowSpan?: number }) => ({
  children: record.scope,
  props: {
    rowSpan: record.scopeRowSpan ?? 1,
  },
});

const getUniqueFilterOptions = <T,>(
  rows: T[],
  getValue: (row: T) => string | undefined,
  getText: (value: string) => string = value => value,
): DisclosureFilterOption[] => {
  const optionMap = new Map<string, string>();

  rows.forEach(row => {
    const value = getValue(row);

    if (value && !optionMap.has(value)) {
      optionMap.set(value, getText(value));
    }
  });

  return Array.from(optionMap.entries()).map(([value, text]) => ({
    text,
    value,
  }));
};

const getSelectedFilterValues = (
  filters: DisclosureTableFilters,
  filterKey: string,
) => (filters[filterKey] || []).map(value => `${value}`);

const matchesFilter = (
  filters: DisclosureTableFilters,
  filterKey: string,
  value: string,
) => {
  const selectedValues = getSelectedFilterValues(filters, filterKey);

  return selectedValues.length === 0 || selectedValues.includes(value);
};

const recomputeScopeRowSpan = <
  T extends { scope: string; scopeRowSpan?: number },
>(
  rows: T[],
): T[] => {
  const scopeCountMap = new Map<string, number>();
  const renderedScopes = new Set<string>();

  rows.forEach(row => {
    scopeCountMap.set(row.scope, (scopeCountMap.get(row.scope) || 0) + 1);
  });

  return rows.map(row => {
    const isFirstScopeRow = !renderedScopes.has(row.scope);

    renderedScopes.add(row.scope);

    return {
      ...row,
      scopeRowSpan: isFirstScopeRow ? scopeCountMap.get(row.scope) : 0,
    };
  });
};

const flattenOrgTree = (
  orgList: DisclosureOrg[],
  level = 0,
): OrgSelectOption[] =>
  orgList.flatMap(item => [
    {
      ...item,
      level,
    },
    ...flattenOrgTree(item.children || [], level + 1),
  ]);

const getOrgIconType = (orgType: DisclosureOrg['orgType']) =>
  OrgIconMap[orgType] || OrgIconMap[ORG_TYPE.ORG];

const renderOrgIcon = (orgType: DisclosureOrg['orgType']) => (
  <span
    className={classNames(styles.orgIcon, {
      [styles.companyOrgIcon]: orgType === ORG_TYPE.ENTERPRISE,
    })}
  >
    <IconAlibaba
      className={styles.companyOrgImg}
      type={getOrgIconType(orgType)}
    />
  </span>
);

const renderOrgTreeTitle = (org: DisclosureOrg) => (
  <span className={styles.orgTreeNodeTitle} title={org.name}>
    {renderOrgIcon(org.orgType)}
    <span className={styles.orgTreeNodeName}>{org.name}</span>
  </span>
);

const mapOrgTreeNodes = (orgList: DisclosureOrg[]): OrgTreeNode[] =>
  orgList.map(item => ({
    title: renderOrgTreeTitle(item),
    label: item.name,
    value: item.id,
    key: item.id,
    children: mapOrgTreeNodes(item.children || []),
  }));

const toPayloadNumber = (value: string | number) => {
  if (value === '') {
    return undefined;
  }

  const nextValue = Number(value);

  return Number.isFinite(nextValue) ? nextValue : undefined;
};

const isPlainRecord = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isDisclosureFieldEmpty = (value: unknown) =>
  value === undefined || value === null || value === '';

const isAiGhgRowRecord = (value: Record<string, any>) =>
  [
    'intendUse',
    'industryGuide',
    'dataDifficulty',
    'emissionImpact',
    'isoClassify',
    'classifyCode',
    'ghgClassify',
  ].some(key => !isDisclosureFieldEmpty(value[key]));

const collectAiGhgRows = (payload: unknown): Record<string, any>[] => {
  if (Array.isArray(payload)) {
    return payload.flatMap(item => {
      if (!isPlainRecord(item)) {
        return [];
      }

      if (Array.isArray(item.children)) {
        return item.children.filter(isPlainRecord);
      }

      return [item];
    });
  }

  if (isPlainRecord(payload)) {
    if (isAiGhgRowRecord(payload)) {
      return [payload];
    }

    return AI_GHG_ROW_LIST_KEYS.flatMap(key => collectAiGhgRows(payload[key]));
  }

  return [];
};

function collectAiRowsFromParsedPayload(
  parsedPayload: unknown,
): Record<string, any>[] {
  if (
    isPlainRecord(parsedPayload) &&
    parsedPayload.code !== undefined &&
    Number(parsedPayload.code) !== 200
  ) {
    throw new Error(parsedPayload.msg || 'AI fill failed');
  }

  const candidates = isPlainRecord(parsedPayload)
    ? [parsedPayload.data, parsedPayload.responseData, parsedPayload]
    : [parsedPayload];

  return (
    candidates
      .filter(candidate => !isDisclosureFieldEmpty(candidate))
      .map(candidate => {
        if (typeof candidate !== 'string') {
          return collectAiGhgRows(candidate);
        }

        const parsedCandidate = tryParseJSON(candidate.trim());

        return !parsedCandidate
          ? []
          : collectAiRowsFromParsedPayload(parsedCandidate);
      })
      .find(rows => rows.length) || []
  );
}

const getAiFieldValue = (row: Record<string, any>, keys: readonly string[]) => {
  const targetKey = keys.find(key => {
    const value = row[key];

    return (
      (isPlainRecord(value) && 'value' in value) ||
      !isDisclosureFieldEmpty(value)
    );
  });

  if (!targetKey) {
    return undefined;
  }

  const value = row[targetKey];

  return isPlainRecord(value) && 'value' in value ? value.value : value;
};

const getAiFieldNumber = (
  row: Record<string, any>,
  keys: readonly string[],
) => {
  const value = getAiFieldValue(row, keys);
  const nextValue = Number(value);

  return Number.isFinite(nextValue) ? nextValue : undefined;
};

const getGhgRowTotalScore = (
  row: Pick<DisclosureGhgRow, 'factorA' | 'factorB' | 'factorC' | 'factorD'>,
) =>
  row.factorA.score * row.factorB.score * row.factorC.score * row.factorD.score;

const getAiMatchValue = (value: unknown) =>
  isDisclosureFieldEmpty(value) ? undefined : `${value}`;

const getAiRowMergeKey = (row: Record<string, any>, index: number) =>
  [
    row.isoClassify,
    row.classifyCode,
    row.ghgClassify,
    row.id,
    row.classifyName,
    row.category,
  ]
    .map(getAiMatchValue)
    .find(Boolean) || `__index_${index}`;

const mergeAiGhgRows = (
  prevRows: Record<string, any>[],
  nextRows: Record<string, any>[],
) => {
  const rowMap = new Map<string, Record<string, any>>();

  [...prevRows, ...nextRows].forEach((row, index) => {
    rowMap.set(getAiRowMergeKey(row, index), row);
  });

  return Array.from(rowMap.values());
};

const findAiGhgRow = (aiRows: Record<string, any>[], row: DisclosureGhgRow) =>
  aiRows.find(item => {
    const rowClassifyCode = getAiMatchValue(row.classifyCode);
    const aiIsoClassify = getAiMatchValue(item.isoClassify);

    if (aiIsoClassify) {
      return rowClassifyCode === aiIsoClassify;
    }

    return [
      [item.classifyCode, row.classifyCode],
      [item.ghgClassify, row.ghgClassify],
      [item.id, row.id],
      [item.classifyName, row.category],
      [item.category, row.category],
    ].some(([aiValue, rowValue]) => {
      const nextAiValue = getAiMatchValue(aiValue);
      const nextRowValue = getAiMatchValue(rowValue);

      return !!nextAiValue && nextAiValue === nextRowValue;
    });
  });

const getAiGhgSavePayload = (
  row: DisclosureGhgRow,
  aiRow: Record<string, any>,
) => {
  const id = toPayloadNumber(row.id);
  const intendUse =
    getAiFieldNumber(aiRow, ['intendUse', 'factorA']) ??
    toPayloadNumber(row.factorA.value);
  const industryGuide =
    getAiFieldNumber(aiRow, ['industryGuide', 'factorB']) ??
    toPayloadNumber(row.factorB.value);
  const dataDifficulty =
    getAiFieldNumber(aiRow, ['dataDifficulty', 'factorC']) ??
    toPayloadNumber(row.factorC.value);
  const emissionImpact =
    getAiFieldNumber(aiRow, ['emissionImpact', 'factorD']) ??
    toPayloadNumber(row.factorD.value);

  if (
    id === undefined ||
    intendUse === undefined ||
    industryGuide === undefined ||
    dataDifficulty === undefined ||
    emissionImpact === undefined
  ) {
    return undefined;
  }

  return {
    id,
    intendUse,
    industryGuide,
    dataDifficulty,
    emissionImpact,
  };
};

const getDisclosureDetailParamsKey = (params?: DisclosureDetailRequestParams) =>
  params ? `${params.year}_${params.orgId}_${params.standard}` : '';

const renderTableFilterIcon = (filtered: boolean) => (
  <FilterFilled
    className={classNames(styles.filterIcon, {
      [styles.activeFilterIcon]: filtered,
    })}
  />
);

const DisclosureReportDetail: FC<DisclosureReportDetailProps> = ({
  open = false,
  mode = 'modal',
  year,
  orgList,
  orgLoading = false,
  initialOrgId,
  currentOrgId,
  onClose,
}) => {
  const flatOrgList = useMemo(() => flattenOrgTree(orgList), [orgList]);
  const orgOptionMap = useMemo(
    () => new Map(flatOrgList.map(item => [item.id, item])),
    [flatOrgList],
  );
  const firstOrgId = flatOrgList[0]?.id;
  const [selectedOrgId, setSelectedOrgId] = useState<number>();
  const [standard, setStandard] = useState<DisclosureReportStandard>(
    DISCLOSURE_REPORT_STANDARD.ISO,
  );
  const [activeTab, setActiveTab] = useState<DisclosureDetailTab>(
    DISCLOSURE_DETAIL_TAB.REPORT_BOUNDARY,
  );
  const [detail, setDetail] = useState<DisclosureReportDetailData>();
  const [loading, setLoading] = useState(false);
  const [boundaryTableLoading, setBoundaryTableLoading] = useState(false);
  const [ghgTableLoading, setGhgTableLoading] = useState(false);
  const [aiFillMethodOpen, setAiFillMethodOpen] = useState(false);
  const [aiFillPrompt, setAiFillPrompt] = useState('');
  const [aiFillLoading, setAiFillLoading] = useState(false);
  const [boundaryFilters, setBoundaryFilters] =
    useState<DisclosureTableFilters>({});
  const [ghgFilters, setGhgFilters] = useState<DisclosureTableFilters>({});
  const latestDetailParamsKeyRef = useRef('');
  const aiFillAbortCtrlRef = useRef<AbortController>();
  const isPageMode = mode === 'page';
  const visible = isPageMode || open;
  const selectedYear = year;
  const detailParams = useMemo<DisclosureDetailRequestParams | undefined>(
    () =>
      selectedYear && selectedOrgId
        ? {
            year: selectedYear,
            orgId: selectedOrgId,
            standard,
          }
        : undefined,
    [selectedOrgId, selectedYear, standard],
  );
  const detailParamsKey = useMemo(
    () => getDisclosureDetailParamsKey(detailParams),
    [detailParams],
  );

  useEffect(() => {
    latestDetailParamsKeyRef.current = detailParamsKey;
  }, [detailParamsKey]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setActiveTab(DISCLOSURE_DETAIL_TAB.REPORT_BOUNDARY);
    setStandard(DISCLOSURE_REPORT_STANDARD.ISO);
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const nextOrgId =
      (initialOrgId !== undefined && orgOptionMap.has(initialOrgId)
        ? initialOrgId
        : undefined) ??
      (currentOrgId !== undefined && orgOptionMap.has(currentOrgId)
        ? currentOrgId
        : undefined) ??
      firstOrgId;

    setSelectedOrgId(nextOrgId);
  }, [currentOrgId, firstOrgId, initialOrgId, orgOptionMap, visible]);

  useEffect(() => {
    if (!visible || !detailParams) {
      return;
    }

    let cancelled = false;

    setLoading(true);
    getDisclosureReportDetail(detailParams)
      .then(({ data }) => {
        if (!cancelled) {
          setDetail(data.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(undefined);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [detailParams, visible]);

  useEffect(() => {
    setBoundaryFilters({});
    setGhgFilters({});
    setBoundaryTableLoading(false);
    setGhgTableLoading(false);
    setAiFillMethodOpen(false);
    setAiFillPrompt('');
    setAiFillLoading(false);
    aiFillAbortCtrlRef.current?.abort();
  }, [selectedOrgId, selectedYear, standard]);

  const currentOrg = useMemo(
    () =>
      selectedOrgId === undefined ? undefined : orgOptionMap.get(selectedOrgId),
    [orgOptionMap, selectedOrgId],
  );

  const standardOptions = useMemo(
    () => [
      {
        value: DISCLOSURE_REPORT_STANDARD.GHG,
        label: I18N.enterpriseCarbonAccount2.ghgPr2,
      },
      {
        value: DISCLOSURE_REPORT_STANDARD.ISO,
        label: I18N.enterpriseCarbonAccount2.isoStandard3,
      },
    ],
    [],
  );

  const orgTreeData = useMemo(() => mapOrgTreeNodes(orgList), [orgList]);
  const quantifiedYesValue = useMemo(
    () =>
      detail?.quantifyOptions.find(
        option => option.label === QUANTIFIED_YES_LABEL,
      )?.value ?? QUANTIFIED_YES_VALUE,
    [detail?.quantifyOptions],
  );
  const boundaryQuantifyOptions = useMemo(
    () =>
      (detail?.quantifyOptions || []).map(option => ({
        ...option,
        disabled: option.value === quantifiedYesValue,
      })),
    [detail?.quantifyOptions, quantifiedYesValue],
  );
  const isGhgStandard = standard === DISCLOSURE_REPORT_STANDARD.GHG;
  const isBoundaryReadonly = isGhgStandard;
  const isMajorGhgReadonly = isGhgStandard;
  const boundaryRows = useMemo(
    () => detail?.reportBoundary || [],
    [detail?.reportBoundary],
  );
  const ghgRows = useMemo(() => detail?.majorGhg || [], [detail?.majorGhg]);

  const quantifiedLabelMap = useMemo(
    () =>
      new Map(
        (detail?.quantifyOptions || []).map(option => [
          option.value,
          option.label,
        ]),
      ),
    [detail?.quantifyOptions],
  );

  const boundaryScopeFilters = useMemo(
    () => getUniqueFilterOptions(boundaryRows, row => row.scope),
    [boundaryRows],
  );
  const boundaryCategoryFilters = useMemo(
    () => getUniqueFilterOptions(boundaryRows, row => row.category),
    [boundaryRows],
  );
  const boundaryQuantifiedFilters = useMemo(
    () =>
      getUniqueFilterOptions(
        boundaryRows,
        row => row.quantified,
        value => quantifiedLabelMap.get(value) || value,
      ),
    [boundaryRows, quantifiedLabelMap],
  );

  const ghgScopeFilters = useMemo(
    () => getUniqueFilterOptions(ghgRows, row => row.scope),
    [ghgRows],
  );
  const ghgCategoryFilters = useMemo(
    () => getUniqueFilterOptions(ghgRows, row => row.category),
    [ghgRows],
  );
  const ghgMajorEmissionFilters = useMemo(
    () => getUniqueFilterOptions(ghgRows, row => row.majorIndirectEmission),
    [ghgRows],
  );

  const filteredBoundaryRows = useMemo(
    () =>
      recomputeScopeRowSpan(
        boundaryRows.filter(
          row =>
            matchesFilter(boundaryFilters, TABLE_FILTER_KEY.SCOPE, row.scope) &&
            matchesFilter(
              boundaryFilters,
              TABLE_FILTER_KEY.CATEGORY,
              row.category,
            ) &&
            matchesFilter(
              boundaryFilters,
              TABLE_FILTER_KEY.QUANTIFIED,
              row.quantified,
            ),
        ),
      ),
    [boundaryFilters, boundaryRows],
  );

  const filteredGhgRows = useMemo(
    () =>
      recomputeScopeRowSpan(
        ghgRows.filter(
          row =>
            matchesFilter(ghgFilters, TABLE_FILTER_KEY.SCOPE, row.scope) &&
            matchesFilter(
              ghgFilters,
              TABLE_FILTER_KEY.CATEGORY,
              row.category,
            ) &&
            matchesFilter(
              ghgFilters,
              TABLE_FILTER_KEY.MAJOR_INDIRECT_EMISSION,
              row.majorIndirectEmission,
            ),
        ),
      ),
    [ghgFilters, ghgRows],
  );

  const updateBoundaryCell = (
    rowId: string,
    field: 'quantified' | 'remark',
    value: string,
  ) => {
    setDetail(prev =>
      prev
        ? {
            ...prev,
            reportBoundary: prev.reportBoundary.map(row =>
              row.id === rowId ? { ...row, [field]: value } : row,
            ),
          }
        : prev,
    );
  };

  const updateGhgCell = (
    rowId: string,
    field: DisclosureGhgFactorField,
    value: string,
  ) => {
    const score =
      detail?.factorOptions[field]?.find(option => option.value === value)
        ?.score ?? 0;

    setDetail(prev =>
      prev
        ? {
            ...prev,
            majorGhg: prev.majorGhg.map(row => {
              if (row.id !== rowId) {
                return row;
              }

              const nextRow = {
                ...row,
                [field]: {
                  value,
                  score,
                },
              };
              const totalScore =
                nextRow.factorA.score *
                nextRow.factorB.score *
                nextRow.factorC.score *
                nextRow.factorD.score;

              return {
                ...nextRow,
                totalScore,
              };
            }),
          }
        : prev,
    );
  };

  const applyAiGhgRows = (aiRows: Record<string, any>[]) => {
    if (!aiRows.length) {
      return;
    }

    setDetail(prev =>
      prev
        ? {
            ...prev,
            majorGhg: prev.majorGhg.map(row => {
              const aiRow = findAiGhgRow(aiRows, row);

              if (!aiRow) {
                return row;
              }

              const nextRow = AI_GHG_FACTOR_CONFIG.reduce((result, config) => {
                const aiValue = getAiFieldValue(aiRow, config.valueKeys);

                if (isDisclosureFieldEmpty(aiValue)) {
                  return result;
                }

                const value = `${aiValue}`;
                const optionScore = prev.factorOptions[config.field]?.find(
                  option => option.value === value,
                )?.score;
                const aiScore = getAiFieldNumber(aiRow, config.scoreKeys);

                return {
                  ...result,
                  [config.field]: {
                    value,
                    score: aiScore ?? optionScore ?? result[config.field].score,
                  },
                };
              }, row);
              const aiMajorEmission =
                aiRow.majorFlagName ?? aiRow.majorIndirectEmission;
              const totalScore =
                getAiFieldNumber(aiRow, ['totalScore']) ??
                getGhgRowTotalScore(nextRow);
              const important = `${aiRow.majorFlag ?? ''}` === '1';

              return {
                ...nextRow,
                totalScore,
                majorIndirectEmission:
                  isDisclosureFieldEmpty(nextRow.majorIndirectEmission) &&
                  !isDisclosureFieldEmpty(aiMajorEmission)
                    ? `${aiMajorEmission}`
                    : nextRow.majorIndirectEmission,
                important: nextRow.important || important,
              };
            }),
          }
        : prev,
    );
  };

  const refreshBoundaryRows = async (
    requestParams: DisclosureDetailRequestParams | undefined = detailParams,
  ) => {
    if (!requestParams) {
      return;
    }

    const requestKey = getDisclosureDetailParamsKey(requestParams);

    try {
      const rows = await getDisclosureReportBoundaryRows(requestParams);

      if (latestDetailParamsKeyRef.current !== requestKey) {
        return;
      }

      setDetail(prev =>
        prev
          ? {
              ...prev,
              reportBoundary: rows,
            }
          : prev,
      );
    } catch {
      // 保存已成功时不打断用户操作，下一次切换条件会重新拉取列表。
    }
  };

  const refreshMajorGhgRows = async (
    requestParams: DisclosureDetailRequestParams | undefined = detailParams,
  ) => {
    if (!requestParams) {
      return;
    }

    const requestKey = getDisclosureDetailParamsKey(requestParams);

    try {
      const rows = await getDisclosureReportMajorGhgRows(requestParams);

      if (latestDetailParamsKeyRef.current !== requestKey) {
        return;
      }

      setDetail(prev =>
        prev
          ? {
              ...prev,
              majorGhg: rows,
            }
          : prev,
      );
    } catch {
      // 保存已成功时不打断用户操作，下一次切换条件会重新拉取列表。
    }
  };

  const saveBoundaryRow = async (
    row: DisclosureBoundaryRow,
    override?: {
      quantified?: string;
      remark?: string;
    },
  ) => {
    const id = toPayloadNumber(row.id);
    const quantFlag = toPayloadNumber(override?.quantified ?? row.quantified);
    const requestParams = detailParams;
    const requestKey = getDisclosureDetailParamsKey(requestParams);

    if (
      isBoundaryReadonly ||
      !requestParams ||
      id === undefined ||
      quantFlag === undefined
    ) {
      return;
    }

    setBoundaryTableLoading(true);

    try {
      await saveDisclosureQuant({
        id,
        quantFlag,
        quantRemark: override?.remark ?? row.remark,
      });
      await refreshBoundaryRows(requestParams);
    } catch {
      Toast('error', I18N.enterpriseCarbonAccount2.operationFailedPlease);
    } finally {
      if (latestDetailParamsKeyRef.current === requestKey) {
        setBoundaryTableLoading(false);
      }
    }
  };

  const saveGhgRow = async (
    row: DisclosureGhgRow,
    field: DisclosureGhgFactorField,
    value: string,
  ) => {
    const id = toPayloadNumber(row.id);
    const intendUse = toPayloadNumber(
      field === 'factorA' ? value : row.factorA.value,
    );
    const industryGuide = toPayloadNumber(
      field === 'factorB' ? value : row.factorB.value,
    );
    const dataDifficulty = toPayloadNumber(
      field === 'factorC' ? value : row.factorC.value,
    );
    const emissionImpact = toPayloadNumber(
      field === 'factorD' ? value : row.factorD.value,
    );
    const requestParams = detailParams;
    const requestKey = getDisclosureDetailParamsKey(requestParams);

    if (
      !requestParams ||
      id === undefined ||
      intendUse === undefined ||
      industryGuide === undefined ||
      dataDifficulty === undefined ||
      emissionImpact === undefined
    ) {
      return;
    }

    setGhgTableLoading(true);

    try {
      await saveDisclosureEvaluate({
        id,
        intendUse,
        industryGuide,
        dataDifficulty,
        emissionImpact,
      });
      await refreshMajorGhgRows(requestParams);
    } catch {
      Toast('error', I18N.enterpriseCarbonAccount2.operationFailedPlease);
    } finally {
      if (latestDetailParamsKeyRef.current === requestKey) {
        setGhgTableLoading(false);
      }
    }
  };

  const onBoundarySelectChange = (
    row: DisclosureBoundaryRow,
    value: DisclosureQuantifyStatus,
  ) => {
    if (isBoundaryReadonly || value === quantifiedYesValue) {
      return;
    }

    updateBoundaryCell(row.id, 'quantified', value);
    saveBoundaryRow(row, { quantified: value });
  };

  const onRemarkChange = (row: DisclosureBoundaryRow, value: string) => {
    if (isBoundaryReadonly) {
      return;
    }

    updateBoundaryCell(
      row.id,
      'remark',
      value.slice(0, BOUNDARY_REMARK_MAX_LENGTH),
    );
  };

  const onRemarkBlur = (row: DisclosureBoundaryRow, value: string) => {
    if (isBoundaryReadonly) {
      return;
    }

    saveBoundaryRow(row, {
      remark: value.slice(0, BOUNDARY_REMARK_MAX_LENGTH),
    });
  };

  const onGhgSelectChange = (
    row: DisclosureGhgRow,
    field: DisclosureGhgFactorField,
    value: string,
  ) => {
    if (isMajorGhgReadonly) {
      return;
    }

    updateGhgCell(row.id, field, value);
    saveGhgRow(row, field, value);
  };

  const onBoundaryTableChange: TableProps<DisclosureBoundaryRow>['onChange'] = (
    _,
    filters,
  ) => {
    setBoundaryFilters(filters);
  };

  const onGhgTableChange: TableProps<DisclosureGhgRow>['onChange'] = (
    _,
    filters,
  ) => {
    setGhgFilters(filters);
  };

  const onAiFillMethodCancel = () => {
    if (aiFillLoading) {
      return;
    }

    setAiFillMethodOpen(false);
    setAiFillPrompt('');
  };

  const onAiRecognitionFill = async () => {
    const requestParams = detailParams;
    const orgId = requestParams
      ? toPayloadNumber(requestParams.orgId)
      : undefined;
    const aiFillYear = requestParams
      ? toPayloadNumber(requestParams.year) ?? requestParams.year
      : undefined;
    const requestKey = getDisclosureDetailParamsKey(requestParams);

    if (!requestParams || orgId === undefined || aiFillYear === undefined) {
      return;
    }

    const abortCtrl = new AbortController();
    aiFillAbortCtrlRef.current = abortCtrl;
    let streamText = '';
    let accumulatedAiRows: Record<string, any>[] = [];
    const appendAiRows = (rows: Record<string, any>[]) => {
      if (!rows.length) {
        return;
      }

      accumulatedAiRows = mergeAiGhgRows(accumulatedAiRows, rows);

      if (latestDetailParamsKeyRef.current === requestKey) {
        applyAiGhgRows(accumulatedAiRows);
      }
    };

    setAiFillLoading(true);
    setGhgTableLoading(true);

    try {
      const response = await streamFetch({
        url: `${process.env.REACT_APP_API_URL}/enterprise/evaluate/aiCategoryEmissionFill`,
        data: {
          userContent: aiFillPrompt.trim(),
          orgId,
          year: aiFillYear,
        },
        abortCtrl,
        onMessage: (txt: string | { text?: string }) => {
          if (
            typeof txt !== 'string' &&
            !txt?.text &&
            !isDisclosureFieldEmpty(txt)
          ) {
            const parsedRows = collectAiRowsFromParsedPayload(txt);

            appendAiRows(parsedRows);
            return;
          }

          const text = typeof txt === 'string' ? txt : txt?.text || '';

          if (!text) {
            return;
          }

          streamText += text;
          const parsed = tryParseJSON(streamText);

          if (!parsed) {
            return;
          }

          const parsedRows = collectAiRowsFromParsedPayload(parsed);

          appendAiRows(parsedRows);
        },
      });
      const responseRows = collectAiRowsFromParsedPayload(
        response.responseData,
      );
      const aiRows = mergeAiGhgRows(accumulatedAiRows, responseRows);

      if (latestDetailParamsKeyRef.current !== requestKey) {
        return;
      }

      if (!aiRows.length) {
        throw new Error('No AI fill rows');
      }

      applyAiGhgRows(aiRows);

      const savePayloads = (detail?.majorGhg || [])
        .map(row => {
          const aiRow = findAiGhgRow(aiRows, row);

          return aiRow ? getAiGhgSavePayload(row, aiRow) : undefined;
        })
        .filter(
          (
            payload,
          ): payload is Exclude<
            ReturnType<typeof getAiGhgSavePayload>,
            undefined
          > => !!payload,
        );

      if (savePayloads.length) {
        await Promise.all(
          savePayloads.map(payload => saveDisclosureEvaluate(payload)),
        );
      }

      await refreshMajorGhgRows(requestParams);

      if (latestDetailParamsKeyRef.current === requestKey) {
        Toast('success', I18N.enterpriseCarbonAccount2.aiFillSuccess);
        setAiFillMethodOpen(false);
        setAiFillPrompt('');
      }
    } catch {
      if (
        !abortCtrl.signal.aborted &&
        latestDetailParamsKeyRef.current === requestKey
      ) {
        Toast('error', I18N.enterpriseCarbonAccount2.operationFailedPlease);
      }
    } finally {
      if (latestDetailParamsKeyRef.current === requestKey) {
        setAiFillLoading(false);
        setGhgTableLoading(false);
      }

      if (aiFillAbortCtrlRef.current === abortCtrl) {
        aiFillAbortCtrlRef.current = undefined;
      }
    }
  };

  const renderColumnTitle = (title: string, tip?: string) => (
    <span className={styles.columnTitleWithTip}>
      <span>{title}</span>
      {tip ? (
        <Tooltip title={tip}>
          <QuestionCircleOutlined className={styles.columnTitleTipIcon} />
        </Tooltip>
      ) : null}
    </span>
  );

  const renderFactorSelect = (
    row: DisclosureGhgRow,
    field: DisclosureGhgFactorField,
  ) => (
    <Select
      className={styles.inlineSelect}
      value={row[field].value}
      options={detail?.factorOptions[field] || []}
      disabled={isMajorGhgReadonly || ghgTableLoading}
      onChange={value => onGhgSelectChange(row, field, value)}
    />
  );

  const boundaryColumns: ColumnsType<DisclosureBoundaryRow> = [
    {
      title: renderColumnTitle(I18N.enterpriseCarbonAccount2.accountingScope),
      dataIndex: 'scope',
      ellipsis: true,
      width: 240,
      filteredValue: boundaryFilters[TABLE_FILTER_KEY.SCOPE] || null,
      filters: boundaryScopeFilters,
      filterIcon: renderTableFilterIcon,
      onFilter: (value, record) => record.scope === `${value}`,
      render: (_, record) => renderScopeCell(record),
    },
    {
      title: renderColumnTitle(
        I18N.enterpriseCarbonAccount2.accountingCategory,
      ),
      dataIndex: 'category',
      ellipsis: true,
      width: 260,
      filteredValue: boundaryFilters[TABLE_FILTER_KEY.CATEGORY] || null,
      filters: boundaryCategoryFilters,
      filterIcon: renderTableFilterIcon,
      onFilter: (value, record) => record.category === `${value}`,
    },
    {
      title: renderColumnTitle(I18N.enterpriseCarbonAccount2.whetherQuantified),
      dataIndex: 'quantified',
      width: 220,
      filteredValue: boundaryFilters[TABLE_FILTER_KEY.QUANTIFIED] || null,
      filters: boundaryQuantifiedFilters,
      filterIcon: renderTableFilterIcon,
      onFilter: (value, record) => record.quantified === `${value}`,
      render: (_, record) => (
        <Select
          className={styles.inlineSelect}
          value={record.quantified}
          options={boundaryQuantifyOptions}
          disabled={
            isBoundaryReadonly ||
            record.quantified === quantifiedYesValue ||
            boundaryTableLoading
          }
          onChange={value => onBoundarySelectChange(record, value)}
        />
      ),
    },
    {
      title: I18N.carbonFootprint.remarks,
      dataIndex: 'remark',
      ellipsis: true,
      render: (_, record) => (
        <Input
          value={record.remark}
          maxLength={BOUNDARY_REMARK_MAX_LENGTH}
          placeholder={I18N.carbonFootprint.pleaseEnter}
          disabled={isBoundaryReadonly || boundaryTableLoading}
          onChange={event => onRemarkChange(record, event.target.value)}
          onBlur={event => onRemarkBlur(record, event.target.value)}
        />
      ),
    },
  ];

  const ghgColumns: ColumnsType<DisclosureGhgRow> = [
    {
      title: renderColumnTitle(I18N.enterpriseCarbonAccount2.accountingScope),
      dataIndex: 'scope',
      width: 140,
      fixed: 'left',
      filteredValue: ghgFilters[TABLE_FILTER_KEY.SCOPE] || null,
      filters: ghgScopeFilters,
      filterIcon: renderTableFilterIcon,
      onFilter: (value, record) => record.scope === `${value}`,
      render: (_, record) => renderScopeCell(record),
    },
    {
      title: renderColumnTitle(
        I18N.enterpriseCarbonAccount2.accountingCategory,
      ),
      dataIndex: 'category',
      width: 220,
      fixed: 'left',
      filteredValue: ghgFilters[TABLE_FILTER_KEY.CATEGORY] || null,
      filters: ghgCategoryFilters,
      filterIcon: renderTableFilterIcon,
      onFilter: (value, record) => record.category === `${value}`,
      render: (_, record) => (
        <div className={styles.categoryCell}>
          <span>{record.category}</span>
          {(record.important || record.importantLabel) && (
            <span className={styles.majorTag}>
              {I18N.enterpriseCarbonAccount2.majorTag}
            </span>
          )}
        </div>
      ),
    },
    {
      title: I18N.enterpriseCarbonAccount2.evaluationFactorA,
      children: [
        {
          title: I18N.enterpriseCarbonAccount2.expectedUse,
          width: 220,
          render: (_, record) => renderFactorSelect(record, 'factorA'),
        },
        {
          title: I18N.enterpriseCarbonAccount2.score,
          width: 72,
          render: (_, record) => record.factorA.score,
        },
      ],
    },
    {
      title: I18N.enterpriseCarbonAccount2.evaluationFactorB,
      children: [
        {
          title: I18N.enterpriseCarbonAccount2.sectorSpecificGuidance,
          width: 220,
          render: (_, record) => renderFactorSelect(record, 'factorB'),
        },
        {
          title: I18N.enterpriseCarbonAccount2.score,
          width: 72,
          render: (_, record) => record.factorB.score,
        },
      ],
    },
    {
      title: I18N.enterpriseCarbonAccount2.evaluationFactorC,
      children: [
        {
          title: I18N.enterpriseCarbonAccount2.dataAcquisitionDifficulty,
          width: 260,
          render: (_, record) => renderFactorSelect(record, 'factorC'),
        },
        {
          title: I18N.enterpriseCarbonAccount2.score,
          width: 72,
          render: (_, record) => record.factorC.score,
        },
      ],
    },
    {
      title: I18N.enterpriseCarbonAccount2.evaluationFactorD,
      children: [
        {
          title: I18N.enterpriseCarbonAccount2.impactLevel,
          width: 240,
          render: (_, record) => renderFactorSelect(record, 'factorD'),
        },
        {
          title: I18N.enterpriseCarbonAccount2.score,
          width: 72,
          render: (_, record) => record.factorD.score,
        },
      ],
    },
    {
      title: I18N.enterpriseCarbonAccount2.evaluationTotalScore,
      children: [
        {
          title: I18N.enterpriseCarbonAccount2.evaluationTotalScoreFormula,
          dataIndex: 'totalScore',
          width: 130,
        },
      ],
    },
    {
      title: renderColumnTitle(
        I18N.enterpriseCarbonAccount2.whetherMajorIndirectEmission,
        I18N.enterpriseCarbonAccount2.majorIndirectEmissionRuleTip,
      ),
      dataIndex: 'majorIndirectEmission',
      width: 160,
      filteredValue:
        ghgFilters[TABLE_FILTER_KEY.MAJOR_INDIRECT_EMISSION] || null,
      filters: ghgMajorEmissionFilters,
      filterIcon: renderTableFilterIcon,
      onFilter: (value, record) => record.majorIndirectEmission === `${value}`,
    },
  ];

  const detailContent = (
    <div
      className={classNames(styles.detail, {
        [styles.pageDetailContent]: isPageMode,
      })}
    >
      <div className={styles.header}>
        <div className={styles.orgSelector}>
          {currentOrg && renderOrgIcon(currentOrg.orgType)}
          <TreeSelect
            className={styles.orgSelect}
            variant='borderless'
            value={selectedOrgId}
            treeData={orgTreeData}
            popupClassName={styles.orgTreeSelectDropdown}
            popupMatchSelectWidth={260}
            loading={orgLoading}
            disabled={orgLoading}
            listHeight={360}
            virtual={false}
            treeDefaultExpandAll
            treeNodeLabelProp='label'
            onChange={value => setSelectedOrgId(value as number)}
          />
        </div>
        <div className={styles.headerFilters}>
          <div className={styles.yearDisplay}>{selectedYear || '--'}</div>
          <Select
            className={styles.standardSelect}
            value={standard}
            options={standardOptions}
            onChange={setStandard}
          />
        </div>
      </div>
      <div className={styles.content}>
        <Tabs
          className={styles.tabs}
          activeKey={activeTab}
          items={[
            {
              key: DISCLOSURE_DETAIL_TAB.REPORT_BOUNDARY,
              label: I18N.enterpriseCarbonAccount2.reportBoundaries,
            },
            {
              key: DISCLOSURE_DETAIL_TAB.MAJOR_GHG,
              label:
                I18N.enterpriseCarbonAccount2
                  .majorGhgIndirectEmissionIdentification,
            },
          ]}
          tabBarExtraContent={
            activeTab === DISCLOSURE_DETAIL_TAB.MAJOR_GHG &&
            !isMajorGhgReadonly ? (
              <Button
                className={styles.aiFillBtn}
                disabled={loading || ghgTableLoading}
                onClick={() => setAiFillMethodOpen(true)}
              >
                {I18N.enterpriseCarbonAccount2.aiOneClickFill}
              </Button>
            ) : null
          }
          onChange={key => setActiveTab(key as DisclosureDetailTab)}
        />
        {activeTab === DISCLOSURE_DETAIL_TAB.REPORT_BOUNDARY && (
          <div className={styles.tableToolbar}>
            <div className={styles.boundaryTip}>
              {I18N.enterpriseCarbonAccount2.reportBoundaryTip}
            </div>
          </div>
        )}
        {activeTab === DISCLOSURE_DETAIL_TAB.REPORT_BOUNDARY ? (
          <Table
            className={styles.detailTable}
            rowKey='id'
            pagination={false}
            loading={loading || boundaryTableLoading}
            dataSource={filteredBoundaryRows}
            columns={boundaryColumns}
            onChange={onBoundaryTableChange}
          />
        ) : (
          <Table
            className={styles.detailTable}
            rowKey='id'
            pagination={false}
            loading={loading || ghgTableLoading}
            scroll={{ x: 1980 }}
            dataSource={filteredGhgRows}
            columns={ghgColumns}
            onChange={onGhgTableChange}
          />
        )}
      </div>
      <div className={styles.footer}>
        <Button onClick={onClose}>{I18N.carbonFootprint.return}</Button>
      </div>
      <Modal
        centered
        destroyOnClose
        className={styles.aiFillMethodModal}
        open={aiFillMethodOpen}
        title={I18N.enterpriseCarbonAccount2.aiFillMethodTitle}
        width={888}
        footer={
          <>
            <Button disabled={aiFillLoading} onClick={onAiFillMethodCancel}>
              {I18N.carbonFootprint.cancel}
            </Button>
            <Button
              type='primary'
              loading={aiFillLoading}
              onClick={onAiRecognitionFill}
            >
              {I18N.enterpriseCarbonAccount2.aiRecognitionFill}
            </Button>
          </>
        }
        onCancel={onAiFillMethodCancel}
      >
        <Input.TextArea
          className={styles.aiFillMethodTextarea}
          value={aiFillPrompt}
          placeholder={I18N.enterpriseCarbonAccount2.aiFillPromptPlaceholder}
          onChange={event => setAiFillPrompt(event.target.value)}
        />
      </Modal>
    </div>
  );

  if (isPageMode) {
    return <div className={styles.pageDetail}>{detailContent}</div>;
  }

  return (
    <Modal
      centered
      destroyOnClose
      className={styles.detailModal}
      footer={null}
      open={open}
      width='calc(100vw - 96px)'
      onCancel={onClose}
    >
      {detailContent}
    </Modal>
  );
};

export default DisclosureReportDetail;
