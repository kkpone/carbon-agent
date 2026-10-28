/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-09 17:13:03
 * @LastEditTime: 2023-06-08 17:11:44
 * @LastEditTime: 2023-03-26 14:35:04
 * @Date: 2023-01-10 11:32:41
 * @@description: 匹配因子
 */
import { listALLByDictTypeBatch } from '@src/api/api';
import { Button } from '@src/components/Button';
import { FeedBackModal } from '@src/components/Factor/FeedBackModal';
import { FeedBackType } from '@src/components/Factor/utils';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { GetLocalStorageProductId } from '@src/utils/store';
import {
  getFactorDatabaseSourceOptions,
  getGlobalFactorPreferencePlanInfo,
} from '@src/views/carbonFootprint3/FootprintAccount/component/GlobalFactorPreference/service';
import type {
  FactorDatabaseSourceOption,
  FactorSourceId,
} from '@src/views/carbonFootprint3/FootprintAccount/component/GlobalFactorPreference/type';
import { ALL_EMISSION_LABEL } from '@src/views/carbonFootprint3/constant';
import { Dicts } from '@src/views/emission/Show/type';
import { apiCompanyAddCollect } from '@src/views/emission/organization/service';
import { addFactorUse } from '@src/views/emission/utils/service';
import { FactorUse } from '@src/views/utils';
import { Popconfirm } from 'antd';
import { FilterValue, TableRowSelection } from 'antd/es/table/interface';
import Modal from 'antd/lib/modal/Modal';
import { ColumnsType } from 'antd/lib/table';
import axios, { AxiosResponse } from 'axios';
import classNames from 'classnames';
import { isEqual, omit } from 'lodash-es';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { SearchForm } from './SearchForm';
import AiIcon from './ai.svg';
import { withEcoinventColumns } from './ecoinventColumns';
import { EcoinventGeographyContext } from './ecoinventContext';
import SearchFactorDetail from '../FactorDetail';
import style from '../index.module.less';
import { carbonFootprintSearchEmissionCol } from '../model';
import {
  getSerachCarbonFactorTable,
  getEnterpriseSearchCarbonFactorTable,
} from '../service';
import {
  FilterState,
  MatchTypeEnum,
  SearchFactorProps,
  SerachCarbonFactorEmissionParams,
  SerachCarbonFactorResult,
  SerachCarbonFactorResultDataApi,
  Sorts,
} from '../type';

const normalizeFactorPrefId = (value?: number | string) => {
  if (value === undefined || value === null || value === '') return undefined;

  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : undefined;
};

const getAllSourceIds = (sourceOptions: FactorDatabaseSourceOption[]) =>
  sourceOptions.map(option => option.id);

const getValidSourceIds = (
  sourceIds: FactorSourceId[] | undefined,
  sourceOptions: FactorDatabaseSourceOption[],
) => {
  const selectedSourceIds = new Map<string, FactorSourceId>();

  (sourceIds || []).forEach(sourceId => {
    if (sourceId === undefined || sourceId === null || sourceId === '') {
      return;
    }

    const matchedOption = sourceOptions.find(
      option => String(option.id) === String(sourceId),
    );

    if (matchedOption) {
      selectedSourceIds.set(String(matchedOption.id), matchedOption.id);
    }
  });

  return Array.from(selectedSourceIds.values());
};

const resolveDefaultSourceIds = (
  sourceOptions: FactorDatabaseSourceOption[],
  sourceIds?: FactorSourceId[],
) => {
  const allSourceIds = getAllSourceIds(sourceOptions);
  const validSourceIds = getValidSourceIds(sourceIds, sourceOptions);

  return validSourceIds.length > 0 ? validSourceIds : allSourceIds;
};

const normalizeRequestSourceIds = (sourceIds?: FactorSourceId[]) => {
  const uniqueSourceIds = Array.from(
    new Map(
      (sourceIds || []).map(sourceId => [String(sourceId), sourceId]),
    ).values(),
  );

  if (uniqueSourceIds.length === 0) {
    return undefined;
  }

  return uniqueSourceIds;
};

const withRequestSourceIds = <T extends Record<string, any>>(
  params: T,
  sourceIds?: FactorSourceId[],
) => {
  const requestSourceIds = normalizeRequestSourceIds(sourceIds);
  const nextParams = { ...params };

  if (requestSourceIds) {
    nextParams.sourceIds = requestSourceIds;
  } else {
    delete nextParams.sourceIds;
  }

  return nextParams;
};

const SearchModalFactor = (props: SearchFactorProps) => {
  const enableEcoinventGeography = useContext(EcoinventGeographyContext);
  /** TODO import { searchItems, useCacheQueryKey } from './utils';  该因子组件需要同步的方法 */
  // 弹框标题的高度
  const TitleHeight = 55;
  // 搜索栏 + 来源 的高度 16 和 6 是外边距距离
  const SearchHeight = 100 + 30 + 16 + 16;

  // 弹框距离上下方距离 各50
  const ModalTopBottom = 50 + 50;

  // 表头高度
  const TableColumnsHeight = 50 + 16;

  // 底部分页的高度
  const PaginationHeight = 60;

  // 表格内部超出滚动的滚动条
  const TableScrollY =
    window.innerHeight -
    TitleHeight -
    TableColumnsHeight -
    SearchHeight -
    ModalTopBottom -
    PaginationHeight;

  const {
    subClick,
    onCancel,
    isEnterprise,
    factorUnitM,
    factorName,
    tableScrollOptions,
    emissionType,
    emissionId,
    emissionName,
    emissionAmount,
    emissionUnit,
    AdditionalParams,
    sourceType,
    emissionClassify,
    enableFactorSourceRange,
    factorPrefId,
  } = props;

  const stringAdditionalParams: Record<string, string> = {};

  Object.keys(AdditionalParams || {}).forEach(key => {
    if (AdditionalParams?.[key]) {
      stringAdditionalParams[key] = AdditionalParams?.[key]?.toString() || '';
    }
  });

  const initValue = {
    pageNum: 1,
    pageSize: 10,
    page: 1,
    size: 10,
    factorType: '3',
    factorUnitM: ['10000'],
    countries: ['10000'],
    productId: GetLocalStorageProductId(),
    sourceType,
    ...stringAdditionalParams,
    transportType: AdditionalParams?.transportType
      ? AdditionalParams?.transportType?.toString()
      : undefined,
    emissionType: emissionType ? ALL_EMISSION_LABEL()[emissionType] : undefined,
    emissionId,
    emissionName,
    emissionAmount,
    emissionUnit,
  };

  const childRef = useRef<TableRef>();
  const cancelTokenSource = useRef<any[]>([]);

  /** 是否显示因子详情弹框 */
  const [showFactorDetail, setShowFactorDetail] = useState<boolean>(false);

  /** 是否显示因子详情弹框 */
  const [factorData, setFactorData] = useState<SerachCarbonFactorResult>();

  /** 反馈给我们的弹框 */
  const [feedBackModalVisible, setFeedBackModalVisible] = useState(false);

  /** 当前国家的字典值 */
  const [reportCountries, setReportCountries] = useState<Dicts[]>();

  /** 表格选中的数据 */
  const [selectedRowData, setSelectedRowData] =
    useState<SerachCarbonFactorResult>();

  /** 表格选中的数据Key */
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const transportType = (AdditionalParams as any)?.transportType?.toString();

  const [filterState, setFilterState] = useState<FilterState>();

  const [sortedInfo, setSortedInfo] = useState<Sorts>({});

  const [loading, setLoading] = useState(false);

  const [factorDatabaseSourceOptions, setFactorDatabaseSourceOptions] =
    useState<FactorDatabaseSourceOption[]>([]);
  const [defaultFactorSourceIds, setDefaultFactorSourceIds] = useState<
    FactorSourceId[]
  >([]);
  /** 首次打开时，等默认背景数据范围写入搜索条件后再请求列表 */
  const [factorSourceRangeReady, setFactorSourceRangeReady] = useState(
    !enableFactorSourceRange,
  );
  const [initialSourceIdsApplied, setInitialSourceIdsApplied] = useState(
    !enableFactorSourceRange,
  );

  const searchId = useRef<string>();
  const versionId = useRef<string>();

  const prePageParams = useRef<
    SerachCarbonFactorEmissionParams & {
      unit?: string;
      description?: string;
      institutions?: string;
    }
  >({
    page: 1,
    size: 10,
    pageNum: 1,
    pageSize: 10,
    factorType: '3',
    name: factorName,
    factorUnitM,
    productId: GetLocalStorageProductId(),
    ...stringAdditionalParams,
    transportType,
    institution: undefined,
    emissionType: emissionType ? ALL_EMISSION_LABEL()[emissionType] : undefined,
    sourceType,
    matchType: MatchTypeEnum.basic,
    emissionId,
    emissionName,
    emissionAmount,
    emissionUnit,
  });

  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] =
    useState<SerachCarbonFactorEmissionParams>({
      pageNum: 1,
      pageSize: 10,
      factorType: '3',
      name: factorName,
      factorUnitM,
      productId: GetLocalStorageProductId(),
      ...stringAdditionalParams,
      transportType,
      institution: undefined,
      emissionType: emissionType
        ? ALL_EMISSION_LABEL()[emissionType]
        : undefined,
      sourceType,
      matchType: MatchTypeEnum.basic,
      emissionId,
      emissionName,
      emissionAmount,
      emissionUnit,
      emissionClassify: emissionClassify || emissionType,
    });
  const searchParamsDataRef = useRef(searchParamsData);
  searchParamsDataRef.current = searchParamsData;

  const applySearchParamsData = (
    nextOrUpdater:
      | SerachCarbonFactorEmissionParams
      | ((
          pre: SerachCarbonFactorEmissionParams,
        ) => SerachCarbonFactorEmissionParams),
  ) => {
    const nextSearchParams =
      typeof nextOrUpdater === 'function'
        ? nextOrUpdater(searchParamsDataRef.current)
        : nextOrUpdater;

    searchParamsDataRef.current = nextSearchParams;
    setSearchParamsData(nextSearchParams);
    return nextSearchParams;
  };

  useEffect(() => {
    if (!enableFactorSourceRange) {
      setFactorDatabaseSourceOptions([]);
      setDefaultFactorSourceIds([]);
      setFactorSourceRangeReady(true);
      setInitialSourceIdsApplied(true);
      return;
    }

    setFactorSourceRangeReady(false);
    setInitialSourceIdsApplied(false);

    let cancelled = false;
    const loadFactorSourceOptions = async () => {
      try {
        const sourceOptions = await getFactorDatabaseSourceOptions();
        if (cancelled) return;

        setFactorDatabaseSourceOptions(sourceOptions);

        const factorPreferenceId = normalizeFactorPrefId(factorPrefId);
        if (!factorPreferenceId) {
          setDefaultFactorSourceIds(getAllSourceIds(sourceOptions));
          setFactorSourceRangeReady(true);
          return;
        }

        try {
          const planInfo = await getGlobalFactorPreferencePlanInfo(
            factorPreferenceId,
          );
          if (cancelled) return;

          setDefaultFactorSourceIds(
            resolveDefaultSourceIds(sourceOptions, planInfo.sourceIds),
          );
          setFactorSourceRangeReady(true);
        } catch {
          if (cancelled) return;

          setDefaultFactorSourceIds(getAllSourceIds(sourceOptions));
          setFactorSourceRangeReady(true);
        }
      } catch {
        if (cancelled) return;

        setFactorDatabaseSourceOptions([]);
        setDefaultFactorSourceIds([]);
        setFactorSourceRangeReady(true);
      }
    };

    loadFactorSourceOptions();

    return () => {
      cancelled = true;
    };
  }, [factorPrefId, enableFactorSourceRange]);

  useEffect(() => {
    if (!enableFactorSourceRange) {
      setInitialSourceIdsApplied(true);
      return;
    }

    if (!factorSourceRangeReady) return;

    applySearchParamsData(pre => {
      const nextSearchParams = withRequestSourceIds(
        {
          ...pre,
          page: 1,
          pageNum: 1,
        },
        defaultFactorSourceIds,
      );

      return isEqual(pre, nextSearchParams) ? pre : nextSearchParams;
    });
    setInitialSourceIdsApplied(true);
  }, [defaultFactorSourceIds, enableFactorSourceRange, factorSourceRangeReady]);

  // useEffect(() => {
  //   searchId.current = undefined;
  //   versionId.current = undefined;
  // }, [searchParamsData.name]);

  // useEffect(() => {
  //   console.log('reset')
  //   versionId.current = undefined;
  // }, [searchParamsData.description, searchParamsData.year, searchParamsData.factorUnitM, searchParamsData.institution, searchParamsData.countries]);

  /**
   * 搜索参数是初始态，用来给 table 展示不同的空白页面
   */
  const searchParamsWithoutSourceIds = omit(searchParamsData, [
    'sourceIds',
    ...(searchParamsData.ecoinventGeographies?.length
      ? []
      : ['ecoinventGeographies']),
  ]);
  const isDefaultSourceIds = isEqual(
    normalizeRequestSourceIds(searchParamsData.sourceIds),
    normalizeRequestSourceIds(defaultFactorSourceIds),
  );
  const isInitStatus =
    isDefaultSourceIds &&
    (isEqual(searchParamsWithoutSourceIds, {
      page: 1,
      size: 10,
      emissionType: undefined,
      factorType: '3',
      factorUnitM: null,
      institution: undefined,
      name: null,
      pageNum: 1,
      pageSize: 10,
      productId: undefined,
      sourceType: undefined,
      transportType: undefined,
    }) ||
      isEqual(searchParamsWithoutSourceIds, omit(initValue, ['sourceIds'])));

  /** 动态设置表头 */
  const [columns, setColumns] = useState<ColumnsType<SerachCarbonFactorResult>>(
    [],
  );

  /** 重置 */
  const resetBack = (values?: { sourceIds?: FactorSourceId[] }) => {
    const resetSourceIds =
      normalizeRequestSourceIds(values?.sourceIds) || defaultFactorSourceIds;

    applySearchParamsData(
      enableFactorSourceRange
        ? withRequestSourceIds(initValue, resetSourceIds)
        : initValue,
    );
    childRef.current?.reset({
      page: 1,
      size: 10,
    });
    setFilterState(undefined);
    setSortedInfo({});
  };

  /** 确认提交 */
  const subForm = async () => {
    if (selectedRowData) {
      const factor = selectedRowData;
      // 添加因子使用记录
      if (factor?.id && factor?.factorUse) {
        addFactorUse({
          factorSource:
            factor.factorUse === FactorUse.organization
              ? FactorUse.organization
              : FactorUse.carbonstop,
          factorId: factor.id,
          factorName: factor.name || '',
          searchId: searchId.current,
        });
      }

      // 去除掉url 因为url携带特殊字符会阻断JSON
      if (selectedRowData && selectedRowData.url) {
        delete selectedRowData.url;
      }

      await subClick(selectedRowData);
    }
  };

  /**
   * 初始化表头设置国家信息
   * @param arr 表头
   */
  const initColumns = (
    arr: {
      label: string;
      value: string;
    }[],
    filter?: FilterState,
    sorter?: Sorts,
  ) => {
    const columnsDefult = carbonFootprintSearchEmissionCol(arr, filter, sorter);
    /** 表头 */
    const columnsSet: ColumnsType<SerachCarbonFactorResult> = [
      {
        title: I18N.carbonFootprint.operation,
        width: '150px',
        dataIndex: 'set',
        fixed: 'right',
        render: (val: string, item: SerachCarbonFactorResult) => (
          <div>
            <span
              className={classNames(
                style.primaryColorFont,
                style.cursorPointerFont,
                'm-r-10',
                {
                  [style.disabledBtn]: !item.factorShow,
                },
              )}
              onClick={() => {
                if (!item.factorShow) {
                  return;
                }
                setFactorData(item);
                setShowFactorDetail(true);
              }}
            >
              {I18N.carbonFootprint.check}
            </span>
            {['3', '2'].includes(item.factorUse) && (
              <Popconfirm
                title={
                  Number(item.isCollectFactor) === 1
                    ? I18N.carbonFootprint.doYouWantToCancelTheCollection
                    : I18N.carbonFootprint.doYouWantToBookmarkThis
                }
                open={!item.factorShow ? false : undefined}
                onConfirm={() => {
                  apiCompanyAddCollect({
                    factorId: item.id,
                    searchId: searchId.current,
                  }).then(({ data }) => {
                    if (data.code === 200) {
                      Toast(
                        'success',
                        I18N.carbonFootprint.operationSuccessful,
                      );
                      childRef.current?.reset();
                    }
                  });
                }}
                okText={I18N.carbonFootprint.confirm2}
                cancelText={I18N.carbonFootprint.cancel}
              >
                <span
                  className={classNames(
                    style.primaryColorFont,
                    style.cursorPointerFont,
                    {
                      [style.disabledBtn]: !item.factorShow,
                    },
                  )}
                >
                  {item.isCollectFactor === '1'
                    ? I18N.carbonFootprint.cancelFavorite
                    : I18N.carbonFootprint.collection}
                </span>
              </Popconfirm>
            )}
          </div>
        ),
      },
    ];

    setColumns([...columnsDefult, ...columnsSet]);
  };
  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<AxiosResponse<SerachCarbonFactorResultDataApi>>,
  ) => {
    const rowData = isEnterprise
      ? (back.data as unknown as { rows: any[] }).rows
      : back.data.data.rows;
    if (rowData && rowData.length > 0 && !!rowData[0].factorShow) {
      setSelectedRowData(rowData[0]);
      setSelectedRowKeys([rowData[0].id]);
    } else {
      setSelectedRowData(undefined);
      setSelectedRowKeys([]);
    }

    return {
      data: rowData,
      count: isEnterprise
        ? (back.data as unknown as { total: number }).total
        : back.data.data.total,
    };
  };
  /**
   * 当前选中的表格数据
   * @param newSelectedRowKeys 当前选中的key
   */
  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: SerachCarbonFactorResult[],
  ) => {
    setSelectedRowData(selectedRows[0]);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  /** 表格选中 */
  const rowSelection: TableRowSelection<SerachCarbonFactorResult> = {
    selectedRowKeys,
    type: 'radio',
    fixed: true,
    columnWidth: 70,
    getCheckboxProps(record) {
      return { disabled: !record.factorShow };
    },
    onChange: onSelectChange,
  };

  /**
   * 表头筛选项
   * @param pagination 分页参数信息
   * @param filters 筛选值
   */
  const onFilterChange = (
    pagination,
    filters: Record<string, FilterValue | null>,
  ) => {
    setFilterState(filters);

    const keys = Object.keys(filters);
    const filtersNew: Record<string, string | undefined> = {};
    keys.forEach(objKey => {
      if (filters[objKey] && filters[objKey] !== null) {
        filtersNew[objKey] = filters[objKey]?.join(',');
      } else {
        filtersNew[objKey] = undefined;
      }
    });
    applySearchParamsData(pre => ({
      ...pre,
      ...filtersNew,
      page: pagination.current,
      size: pagination.pageSize,
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const onSorterChange = (
    pagination,
    filters: Record<string, FilterValue | null>,
    sorter: {
      field: string;
      order: 'ascend' | 'descend' | undefined;
    },
  ) => {
    applySearchParamsData(pre => ({
      ...pre,
      ...filters,
      institution: pre?.institution,
      page: pagination.current,
      size: pagination.pageSize,
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      sortField: sorter.field,
      sortType: sorter.field
        ? sorter.order === 'ascend'
          ? 'asc'
          : 'desc'
        : undefined,
    }));
    setSortedInfo(sorter as Sorts);
  };
  /**
   * 初始化
   */
  const init = async () => {
    await listALLByDictTypeBatch<{
      reportCountries: Dicts[];
    }>({
      dictTypes: 'reportCountries',
    }).then(async ({ data }) => {
      const arr = data.data.reportCountries.map(dic => ({
        label: dic.dictLabel,
        value: dic.dictValue,
      }));
      setReportCountries(data.data.reportCountries);
      initColumns(arr);
    });
  };
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (reportCountries) {
      const arr = reportCountries.map(dic => ({
        label: dic.dictLabel,
        value: dic.dictValue,
      }));
      initColumns(arr, filterState, sortedInfo);
    }
  }, [filterState, sortedInfo]);

  const [institutionsList, setInstitutionsList] = useState<
    {
      id: string;
      institution: string;
      year: string;
    }[]
  >([]);

  const [selectionSuggestion, setSelectionSuggestion] = useState<
    string | undefined
  >();

  const factorSourceOptions = useMemo(
    () =>
      factorDatabaseSourceOptions.map(option => ({
        label: option.name,
        value: option.id,
      })),
    [factorDatabaseSourceOptions],
  );

  // 获取 URL 参数
  const searchParams = new URLSearchParams(window.location.search);
  const computationId = searchParams.get('computationId') || undefined;
  const accountId = searchParams.get('accountId') || undefined;

  return (
    <div className={style.technologySearchEmission}>
      <div className='m-t-16'>
        <SearchForm
          enableEcoinventGeography={enableEcoinventGeography}
          loading={loading}
          initialValues={{
            name: searchParamsData.name || null,
            factorUnitM: searchParamsData.factorUnitM || null,
            sourceIds: searchParamsData.sourceIds || defaultFactorSourceIds,
          }}
          emissionClassify={emissionClassify || emissionType}
          institutionsList={institutionsList}
          enableFactorSourceRange={enableFactorSourceRange}
          factorSourceOptions={factorSourceOptions}
          defaultFactorSourceIds={defaultFactorSourceIds}
          submit={(value: {
            useAi?: boolean;
            factorType?: string;
            sourceIds?: FactorSourceId[];
            ecoinventGeographies?: string[];
          }) => {
            const requestSourceIds = normalizeRequestSourceIds(value.sourceIds);
            const nextSearchParams = applySearchParamsData(searchParamsData => {
              const nextSearchParams = {
                ...searchParamsData,
                ...omit(value, ['useAi', 'sourceIds']),
                ...(enableEcoinventGeography
                  ? { ecoinventGeographies: value.ecoinventGeographies ?? [] }
                  : {}),
                ...(requestSourceIds ? { sourceIds: requestSourceIds } : {}),
                matchType: value.useAi
                  ? MatchTypeEnum.sortByAi
                  : MatchTypeEnum.basic,
                page: 1,
                size: searchParamsData.size,
                pageNum: 1,
                pageSize: searchParamsData.pageSize,
              };

              if (!requestSourceIds) {
                delete nextSearchParams.sourceIds;
              }

              return nextSearchParams;
            });
            childRef.current?.reset({
              page: 1,
              size: nextSearchParams.size,
            });
          }}
          reset={resetBack}
        />
      </div>
      {selectionSuggestion && (
        <div className={style.selectionSuggestion}>
          <img src={AiIcon} alt='AI' className={style.aiIcon} />
          {I18N.components.aiChoosesToBuild}
          {selectionSuggestion}
        </div>
      )}
      <div className='m-t-16'>
        {initialSourceIdsApplied && (
          <CommonTable<
            SerachCarbonFactorResult,
            any,
            SerachCarbonFactorEmissionParams
          >
            bordered={false}
            loading={{
              spinning: loading,
              tip:
                searchParamsData.matchType === MatchTypeEnum.sortByAi
                  ? I18N.components.thinkingInAi
                  : undefined,
            }}
            resetBeforeSearch
            rowSelection={rowSelection}
            searchParams={searchParamsData}
            cRef={childRef}
            style={{ minHeight: TableScrollY }}
            scroll={{ x: 1200, ...(tableScrollOptions || {}), y: TableScrollY }}
            locale={{
              emptyText: loading ? (
                <div />
              ) : (
                <div className={style.emptyText}>
                  {isInitStatus ? (
                    I18N.components.pleaseEnterTheKey
                  ) : (
                    <div>
                      {I18N.carbonFootprint.noSearchResultsYet}
                      <span
                        style={{ color: '#0CBF9F', cursor: 'pointer' }}
                        aria-label='factor-fallback'
                        onClick={() => setFeedBackModalVisible(true)}
                      >
                        {I18N.carbonFootprint.feedbackToUs}
                      </span>
                    </div>
                  )}
                </div>
              ),
            }}
            pageSize={10}
            fetchApi={async params => {
              const latestSearchParams = searchParamsDataRef.current;
              const latestSearchParamsWithDescription =
                latestSearchParams as SerachCarbonFactorEmissionParams & {
                  description?: string;
                };
              const requestSourceIds = normalizeRequestSourceIds(
                latestSearchParams.sourceIds || params.sourceIds,
              );
              const token = axios.CancelToken.source();
              cancelTokenSource.current.forEach(item => item?.cancel());
              cancelTokenSource.current = [];
              cancelTokenSource.current.push(token);
              /**
               * 搜索词不变，只有切换分页情况下会带着searchId，带着versionId;
               * 搜索词不变，调整搜索条件的，searchId清空不带，带着versionId;
               * 搜索词变化，versionId和searchId都清空不带
               */
              if (
                !isEqual(
                  prePageParams.current.factorType,
                  latestSearchParams.factorType,
                ) ||
                !isEqual(prePageParams.current.name, latestSearchParams.name)
              ) {
                searchId.current = undefined;
                versionId.current = undefined;
              }
              if (
                !isEqual(
                  prePageParams.current.factorType,
                  latestSearchParams.factorType,
                ) ||
                !isEqual(prePageParams.current.name, latestSearchParams.name) ||
                !isEqual(
                  prePageParams.current.matchType,
                  latestSearchParams.matchType,
                )
              ) {
                searchId.current = undefined;
              }
              if (
                !isEqual(
                  prePageParams.current.description,
                  latestSearchParamsWithDescription.description,
                ) ||
                !isEqual(prePageParams.current.year, latestSearchParams.year) ||
                !isEqual(
                  prePageParams.current.unit,
                  latestSearchParams?.factorUnitM?.[1],
                ) ||
                !isEqual(
                  prePageParams.current.institutions,
                  latestSearchParams?.institution,
                ) ||
                !isEqual(
                  prePageParams.current.countries,
                  (latestSearchParams?.countries as unknown as string[])?.[1],
                ) ||
                !isEqual(prePageParams.current.sourceIds, requestSourceIds) ||
                !isEqual(
                  prePageParams.current.ecoinventGeographies,
                  latestSearchParams.ecoinventGeographies,
                )
              ) {
                searchId.current = undefined;
              }
              // if ()
              prePageParams.current = {
                ...latestSearchParams,
                unit: latestSearchParams?.factorUnitM?.[1],
                institutions: latestSearchParams?.institution,
                countries: (
                  latestSearchParams?.countries as unknown as string[]
                )?.[1],
                matchType: latestSearchParams.matchType,
                sourceIds: requestSourceIds,
              };
              const paramData = {
                ...omit(latestSearchParams, [
                  'factorUnitM',
                  'institution',
                  'sourceIds',
                ]),
                countries: (
                  latestSearchParams?.countries as unknown as string[]
                )?.[1],
                institutions: latestSearchParams?.institution,
                unit: latestSearchParams?.factorUnitM?.[1],
                ...(requestSourceIds ? { sourceIds: requestSourceIds } : {}),
                pageNum: params.page || latestSearchParams.pageNum,
                pageSize: params.size || latestSearchParams.pageSize,
                productId: GetLocalStorageProductId(),
                searchId: searchId.current,
                versionId: versionId.current,
                computationId: computationId
                  ? Number(computationId)
                  : undefined,
                accountId: accountId ? Number(accountId) : undefined,
              };
              setLoading(true);
              const tableData = await (isEnterprise
                ? getEnterpriseSearchCarbonFactorTable
                : getSerachCarbonFactorTable)(paramData, token.token).finally(
                () => {
                  setLoading(false);
                },
              );
              setSelectionSuggestion(
                tableData.data?.selectionSuggestion ||
                  tableData.data?.data?.selectionSuggestion ||
                  undefined,
              );
              if (isEnterprise) {
                searchId.current = tableData.data?.searchId;
                versionId.current = tableData.data?.versionId;
                setInstitutionsList(
                  tableData.data?.institutionsList as {
                    id: string;
                    institution: string;
                    year: string;
                  }[],
                );
              } else {
                searchId.current = tableData.data?.data?.searchId;
                versionId.current = tableData.data?.data?.versionId;
                setInstitutionsList(
                  tableData.data?.data?.institutionsList as {
                    id: string;
                    institution: string;
                    year: string;
                  }[],
                );
              }

              return tableData;
            }}
            returnFetchApi={returnFetchApi}
            onChangeInsert={onFilterChange}
            onSorterChange={onSorterChange}
            columns={
              enableEcoinventGeography ? withEcoinventColumns(columns) : columns
            }
            rowKey='id'
            pagePosition={false}
            pagination={{
              position: ['bottomLeft'],
              showTotal: total =>
                I18N.template(I18N.components.totalTota, { val1: total }),
            }}
          />
        )}
      </div>
      <FeedBackModal
        type={FeedBackType.factor}
        visible={feedBackModalVisible}
        onCancel={() => {
          setFeedBackModalVisible(false);
        }}
        onOk={() => {
          setFeedBackModalVisible(false);
        }}
      />
      <Modal
        destroyOnClose
        title={I18N.components.emissionFactorsDetailed}
        width={1200}
        maskClosable={false}
        open={showFactorDetail}
        styles={{
          wrapper: {
            zIndex: 9999,
          },
        }}
        cancelText={I18N.carbonFootprint3.close}
        okButtonProps={{
          style: {
            display: 'none',
          },
        }}
        onCancel={() => setShowFactorDetail(false)}
      >
        {factorData && (
          <SearchFactorDetail id={factorData.id} searchId={searchId.current} />
        )}
      </Modal>
      {selectedRowData && (
        <div className={style.modalFactorFooter}>
          <Button
            onClick={async () => {
              if (onCancel) {
                onCancel();
              }
            }}
          >
            {I18N.carbonFootprint.cancel}
          </Button>
          <Button
            className='m-l-10'
            type='primary'
            disabled={!selectedRowData}
            onClick={async () => {
              await subForm();
            }}
          >
            {I18N.carbonFootprint3.confirmSelection}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchModalFactor;
