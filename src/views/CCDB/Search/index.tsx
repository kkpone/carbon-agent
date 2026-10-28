import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import type { GetProp, TableProps } from 'antd';
import { Button, Empty, Table } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import { md5 } from 'js-md5';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { listALLByDictTypeBatch } from '@/api/api';
import { IconAlibaba } from '@/components/iconfont';
import { Dicts } from '@/hooks/useFieldUnitDictSource';
import { apiListALLByDictTypeData } from '@/views/emission/Show/service';

import styles from './index.module.less';
import { getColumns } from '../components/Columns';
import { CooperationInformation } from '../components/CooperationInformation';
import { Feedback, TFormType } from '../components/Feedback';
import { FilterCard } from '../components/FilterCard';
import { FullPageDetail } from '../components/FullPageDetail';
import { SearchInput } from '../components/SearchInput';
import backSvg from '../image/back.svg';
import collectSvg from '../image/collect.svg';
import { factorCcdbListSearch, postSuggestion, Row } from '../service';

type ColumnsType<T> = TableProps<T>['columns'];
type TablePaginationConfig = Exclude<
  GetProp<TableProps, 'pagination'>,
  boolean
>;

interface DataType extends Row {
  id: string;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult<any>['field'];
  sortOrder?: SorterResult<any>['order'];
  filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

export interface ISearchProps {}

export const Search: FC<ISearchProps> = () => {
  const location = useLocation<{ name: string }>();

  const searchParams = new URLSearchParams(location.search);

  const name = searchParams.get('name') || '';

  const type = searchParams.get('type') || '';

  const isPermissionDenied = type === 'permission_denied';
  // const
  const [factorUnitM, setFactorUnitM] = useState<(string | number)[][]>([]);
  const [reportCountries, setReportCountries] = useState<(string | number)[]>(
    [],
  );
  const [year, setYear] = useState<(string | number)[]>([]);
  const [institutions, setInstitutions] = useState<(string | number)[]>([]);
  const [selectedFactorId, setSelectedFactorId] = useState('');
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const searchId = useRef<string>();
  const versionId = useRef<string>();
  const preSearchName = useRef<string>();
  const preFactorUnitM = useRef<(string | number)[][]>([]);
  const preReportCountries = useRef<(string | number)[]>([]);
  const preInstitutions = useRef<(string | number)[]>([]);
  const preYear = useRef<(string | number)[]>([]);

  const { data: factorUnitMData } = useRequest(async () =>
    apiListALLByDictTypeData({
      dictType: 'factorUnitM',
    }),
  );

  const [searchName, setSearchName] = useState(name);

  const { data: reportCountriesData } = useRequest(async () =>
    listALLByDictTypeBatch<{
      reportCountries: Dicts[];
    }>({
      dictTypes: 'reportCountries',
    }),
  );

  const { data: factorYearData } = useRequest(async () =>
    listALLByDictTypeBatch<{
      factor_year: Dicts[];
    }>({
      dictTypes: 'factor_year',
    }),
  );

  const queryFactorUnitM = useMemo(() => {
    const InnerQueryFactorUnitM: (string | number)[] = [];
    // console.log(factorUnitM)
    factorUnitM.forEach(item => {
      if (item.length === 2) {
        InnerQueryFactorUnitM.push(item[1]);
      } else {
        const childResult = factorUnitMData?.data.data.find(
          e => e.dictValue === item[0],
        );
        childResult?.enumList?.forEach(innerItem => {
          InnerQueryFactorUnitM.push(innerItem.dictValue);
        });
      }
    });

    return InnerQueryFactorUnitM;
  }, [factorUnitM, factorUnitMData?.data.data]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    data: requestData,
    loading,
    run,
  } = useRequest(
    async () => {
      const now = Date.now();
      const salt = 'cdb@spyai#2030pt';
      let sortInfo: {
        sortField?: string;
        sortType?: 'asc' | 'desc';
      } = {};
      if (tableParams.sortOrder) {
        sortInfo = {
          sortField: tableParams.sortField as string,
          sortType: tableParams.sortOrder === 'ascend' ? 'asc' : 'desc',
        };
      }
      if (searchName !== preSearchName.current) {
        searchId.current = undefined;
        versionId.current = undefined;
      }
      if (
        factorUnitM !== preFactorUnitM.current ||
        reportCountries !== preReportCountries.current ||
        institutions !== preInstitutions.current ||
        year !== preYear.current
      ) {
        searchId.current = undefined;
      }
      preSearchName.current = searchName;
      preFactorUnitM.current = factorUnitM;
      preReportCountries.current = reportCountries;
      preInstitutions.current = institutions;
      preYear.current = year;

      return factorCcdbListSearch({
        pageNum: tableParams.pagination?.current,
        pageSize: tableParams.pagination?.pageSize,
        name: searchName,
        factorUnitM: queryFactorUnitM.join(','), // 分母单位
        // "year": "", // 发布年份
        year: year.join(','),
        institution: institutions.join(','),
        countries: reportCountries.join(','), // 发布国家
        timestamp: `${now}`,
        sign: md5(`${searchName}${now}${salt}`),
        ...sortInfo,
        searchId: searchId.current,
        versionId: versionId.current,
      });
    },
    {
      refreshDeps: [
        searchName,
        factorUnitM,
        reportCountries,
        tableParams.pagination?.current,
        tableParams.pagination?.pageSize,
        tableParams?.sortOrder,
        tableParams?.sortField,
        institutions,
        year,
      ],
      ready: searchName.length > 0 && !isPermissionDenied,
    },
  );
  useEffect(() => {
    searchId.current = requestData?.data.searchId;
    versionId.current = requestData?.data.versionId;
  }, [requestData]);

  const institutionsList = requestData?.data.institutionsList;

  useEffect(
    () =>
      setTableParams(pre => ({
        ...pre,
        pagination: {
          ...pre.pagination,
          total: requestData?.data.total,
        },
      })),
    [requestData],
  );

  const handleTableChange: TableProps['onChange'] = (
    pagination,
    filters,
    sorter,
  ) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });
  };
  const resetFilter = () => {
    setFactorUnitM([]);
    setInstitutions([]);
    setYear([]);
    setReportCountries([]);
  };
  const history = useHistory();

  const resetTableParams = () => {
    setTableParams({
      pagination: {
        current: 1,
        pageSize: 10,
      },
      sortOrder: undefined,
      sortField: undefined,
    });
  };

  const search = (value: string) => {
    if (isPermissionDenied) {
      return;
    }
    if (value === searchName) {
      return;
    }
    if (value.length === 0) {
      history.push(
        `/CCDB/Home${isPermissionDenied ? '?type=permission_denied' : ''}`,
      );
    }
    resetFilter();
    resetTableParams();
    setSearchName(value);
  };
  const [open, setOpen] = useState(false);

  const columns: ColumnsType<DataType> = getColumns(
    () => {},
    () => {},
    tableParams,
    requestData?.data.rows.some(item => item.productPermissions === '1'),
  );

  const submitFeedback = async (value: TFormType) => {
    await postSuggestion({
      content: value.remark,
      type: 1,
      clientName: value.clientName,
      orgName: value.orgName,
      mobile: value.phonenumber.phone_number,
      email: value.email,
      productType: 'CCDB',
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div
            className={styles.item}
            onClick={() =>
              history.push(
                `/CCDB/Home${
                  isPermissionDenied ? '?type=permission_denied' : ''
                }`,
              )
            }
          >
            <img className={styles.icon} src={backSvg} alt='' />
            {I18N.ccdb.searchResult}
          </div>
          <div
            className={styles.collect}
            onClick={() => {
              history.push(
                `/CCDB/Collect${
                  isPermissionDenied ? '?type=permission_denied' : ''
                }`,
              );
            }}
          >
            <img className={styles.icon} src={collectSvg} alt='' />
            {I18N.ccdb.myCollection}
          </div>
        </div>
        <div className={styles.searchInput}>
          <SearchInput
            initValue={name}
            search={search}
            showTips={!isPermissionDenied}
          />
        </div>
        <div className={styles.filterCards}>
          <FilterCard<'checkbox'>
            title={I18N.ccdb.publishingInstitutionOr}
            showFilter
            type='checkbox'
            value={institutions}
            showCount
            onChange={e => {
              resetTableParams();
              setInstitutions(e);
            }}
            options={
              institutionsList?.map(item => ({
                dictLabel: item.institution,
                dictValue: item.id?.toString(),
                dictType: item.counts.toString(),
              })) || []
            }
          />
          <FilterCard<'checkbox'>
            title={I18N.carbonFootprint.yearOfPublication}
            showFilter={false}
            type='checkbox'
            value={year}
            onChange={e => {
              resetTableParams();
              setYear(e);
            }}
            options={factorYearData?.data.data.factor_year || []}
          />
          <FilterCard<'checkbox'>
            title={I18N.ccdb.publishCountryOr}
            showFilter
            type='checkbox'
            value={reportCountries}
            onChange={e => {
              resetTableParams();
              setReportCountries(e);
            }}
            options={reportCountriesData?.data.data.reportCountries || []}
          />
          <FilterCard<'cascader'>
            title={I18N.components.factorDenominatorSingle2}
            showFilter
            type='cascader'
            value={factorUnitM}
            options={factorUnitMData?.data.data || []}
            onChange={e => {
              resetTableParams();
              setFactorUnitM(e);
            }}
          />
        </div>
        <div className={styles.tableTitle}>
          {requestData?.data.total} {I18N.ccdb.stripFactor}
        </div>
        <div className={styles.wrapper}>
          <Table<DataType>
            columns={columns}
            rowKey={(record: { id: string }) => record.id}
            dataSource={requestData?.data.rows}
            pagination={tableParams.pagination}
            loading={loading}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span>
                      {I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
                    </span>
                  }
                >
                  <Feedback
                    title={I18N.ccdb.factorDemandReversal}
                    onSubmit={submitFeedback}
                  >
                    <Button type='default'>{I18N.ccdb.feedback}</Button>
                  </Feedback>
                </Empty>
              ),
            }}
            onChange={handleTableChange}
            onRow={record => ({
              onClick: () => {
                setSelectedFactorId(record.id);
                setOpen(true);
              },
            })}
          />
          {requestData?.data.rows.length !== 0 && (
            <div className={styles.feedback}>
              <IconAlibaba type='icon-icon_info' />{' '}
              {I18N.ccdb.ifYouAreNotSatisfied}
              <Feedback
                type='feedback'
                title={I18N.ccdb.factorDemandReversal}
                onSubmit={submitFeedback}
              >
                <span className={styles.feedbackBtn}>
                  {I18N.carbonDataManagemen.clickOnFeedback}
                </span>
              </Feedback>
            </div>
          )}
        </div>
        {open && (
          <FullPageDetail
            open={open}
            onClose={() => {
              setOpen(false);
              run();
            }}
            initFactorId={selectedFactorId}
            searchParams={{
              name: searchName,
              searchId: searchId.current,
              factorUnitM: queryFactorUnitM.join(','),
              countries: reportCountries.join(','),
              institution: institutions.join(','),
            }}
          />
        )}
      </div>
      {isPermissionDenied && (
        <div className={styles.subInfo}>
          <CooperationInformation />
        </div>
      )}
    </div>
  );
};

export default Search;
