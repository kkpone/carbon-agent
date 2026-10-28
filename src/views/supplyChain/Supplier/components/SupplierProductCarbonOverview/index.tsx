import { SearchOutlined } from '@ant-design/icons';
import noData from '@src/assets/svg/icon-zanmoneiyong.svg';
import { IconAlibaba, IconAlibabaNew } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { useInfiniteScroll, useRequest } from 'ahooks';
import { Button, Dropdown, Input, Menu, Modal, Spin, Table } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import { sortBy } from 'lodash-es';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { Dicts } from '@/hooks/useFieldUnitDictSource';
import {
  ACCOUNT_SELECT_LIFE_CYCLE_LABEL,
  FootprintAccountLifeCycle,
} from '@/views/carbonFootprint3/FootprintAccount/constant';
import AISuggestion from '@/views/carbonFootprint3/component/AISuggestion';
import { ColumnChart } from '@/views/carbonFootprint3/datas/components/ColumnChart';
import { ColumnEChart } from '@/views/carbonFootprint3/datas/components/ColumnEChart';
import { PieChart } from '@/views/carbonFootprint3/datas/components/Pie';
import { SankeyChart } from '@/views/carbonFootprint3/datas/components/SankeyChart';
import { GET_EMISSION_ICON_BY_CODE } from '@/views/carbonFootprint3/datas/constant';
import { emissionTotalListColumns } from '@/views/carbonFootprint3/datas/TotalView/utils/columns';
import zongliangSvg from '@/views/carbonFootprint3/datas/TotalView/zongliang.svg';
import { getDictList } from '@/views/carbonFootprint3/discharge/process/service';

import styles from './index.module.less';
import {
  getSupplierProductEmissionOverviewAccountNames,
  getSupplierProductEmissionOverviewAiAdvice,
  getSupplierProductEmissionOverviewAccounts,
  getSupplierProductEmissionOverviewDetail,
} from '../../service';
import {
  SupplierProductEmissionOverviewAccount,
  SupplierProductEmissionOverviewAccountName,
  SupplierProductEmissionOverviewDetail,
  SupplierProductEmissionOverviewEmissionRow,
  SupplierProductEmissionOverviewSummary,
  SupplierProductEmissionOverviewType,
} from '../../type';

type SupplierProductCarbonOverviewProps = {
  supplierId: number;
};

type OverviewScrollData = {
  list: SupplierProductEmissionOverviewAccount[];
  currentPage: number;
  isNoMore: boolean;
};

const PAGE_SIZE = 10;

const TYPE_LABEL = {
  [SupplierProductEmissionOverviewType.QUICK]:
    I18N.carbonFootprint3.quickAccounting,
  [SupplierProductEmissionOverviewType.PROCESS]:
    I18N.carbonFootprint3.processAccounting,
  [SupplierProductEmissionOverviewType.MANUAL]: I18N.supplyChain.manuallyFillIn,
};

const FILTERS = [
  { label: I18N.carbonFootprint3.whole, value: undefined },
  {
    label: I18N.carbonFootprint3.quickAccounting,
    value: SupplierProductEmissionOverviewType.QUICK,
  },
  {
    label: I18N.carbonFootprint3.processAccounting,
    value: SupplierProductEmissionOverviewType.PROCESS,
  },
  {
    label: I18N.supplyChain.manuallyFillIn,
    value: SupplierProductEmissionOverviewType.MANUAL,
  },
] as const;

const normalizeRate = (rate?: number | string | null) => {
  const value = Number(rate);
  return Number.isFinite(value) ? value : 0;
};

const formatPlainNumber = (value: BigNumber) =>
  value
    .decimalPlaces(6, BigNumber.ROUND_HALF_UP)
    .toFixed()
    .replace(/(\.\d*?)0+$/, '$1')
    .replace(/\.$/, '');

const formatEmissionTotal = (total?: string | number | null) => {
  const totalNumber = new BigNumber(total ?? '');

  if (!totalNumber.isFinite()) {
    return total ? `${total}` : '-';
  }

  return formatPlainNumber(totalNumber);
};

const calcTotalEmission = (
  unitEmission?: string | number | null,
  amount?: string | number | null,
  shouldMultiply = true,
) => {
  const unitEmissionNumber = new BigNumber(unitEmission ?? '');

  if (!unitEmissionNumber.isFinite()) {
    return unitEmission ? `${unitEmission}` : '-';
  }

  if (!shouldMultiply) {
    return formatPlainNumber(unitEmissionNumber);
  }

  const amountNumber = new BigNumber(amount ?? '');
  if (!amountNumber.isFinite() || amountNumber.isZero()) {
    return formatPlainNumber(unitEmissionNumber);
  }

  return formatPlainNumber(unitEmissionNumber.multipliedBy(amountNumber));
};

const buildUnitLabelMap = (unitDicts: Dicts[] = []) => {
  const map = new Map<string, string>();

  unitDicts.forEach(item => {
    const label = item.dictLabel || item.label;
    const childValue = item.dictValue || item.value;
    const parentValue = item.sourceType;

    if (!label || !childValue) return;

    map.set(`${childValue}`, label);
    if (parentValue) {
      map.set(`${parentValue},${childValue}`, label);
    }
  });

  return map;
};

const normalizeSummary = (item: SupplierProductEmissionOverviewSummary) => ({
  ...item,
  rate: normalizeRate(item.rate),
});

const getTypeLabel = (account?: SupplierProductEmissionOverviewAccount) => {
  if (!account) return '-';
  return account.typeDesc || TYPE_LABEL[account.type] || '-';
};

const getProductTitle = (account?: SupplierProductEmissionOverviewAccount) =>
  [account?.productName, account?.productCode].filter(Boolean).join('&') || '-';

const NoData: FC = () => (
  <div className={styles.noData}>
    <img
      src={noData}
      alt={I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
    />
    <div>{I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}</div>
  </div>
);

const SupplierProductCarbonOverview: FC<SupplierProductCarbonOverviewProps> = ({
  supplierId,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  const [activeFilter, setActiveFilter] =
    useState<SupplierProductEmissionOverviewType>();

  const [inputValue, setInputValue] = useState<string>();

  const [selectedId, setSelectedId] = useState<number>();

  const [selectedAccount, setSelectedAccount] =
    useState<SupplierProductEmissionOverviewAccount>();

  const [accountNameList, setAccountNameList] = useState<
    SupplierProductEmissionOverviewAccountName[]
  >([]);

  const [detail, setDetail] = useState<SupplierProductEmissionOverviewDetail>();

  const [activeStage, setActiveStage] = useState<number>();

  const [rightLoading, setRightLoading] = useState(false);

  const [detailLoading, setDetailLoading] = useState(false);

  const [emissionSortModalVisible, setEmissionSortModalVisible] =
    useState(false);

  const getData = async (pageNum: number) => {
    const { data } = await getSupplierProductEmissionOverviewAccounts({
      supplierId,
      pageNum,
      pageSize: PAGE_SIZE,
      productName: inputValue,
      type: activeFilter,
    });

    const rows = data.data.rows || [];

    if (pageNum === 1) {
      const first = rows[0];
      setSelectedId(first?.id);
      setSelectedAccount(first);
      setActiveStage(undefined);
      setDetail(undefined);
    }

    return {
      list: rows,
      currentPage: pageNum,
      isNoMore: pageNum * PAGE_SIZE >= data.data.total,
    };
  };

  const { data, loading, loadingMore, noMore, mutate } =
    useInfiniteScroll<OverviewScrollData>(
      d => {
        const page = d ? d.currentPage + 1 : 1;
        return getData(page);
      },
      {
        target: listRef,
        isNoMore: d => d?.isNoMore || false,
        reloadDeps: [supplierId, activeFilter, inputValue],
      },
    );

  const { run: runDebounce } = useRequest(
    async (value?: string) => {
      setInputValue(value || undefined);
    },
    {
      debounceWait: 500,
      manual: true,
    },
  );

  const { data: unitDictResponse } = useRequest(() =>
    getDictList({ dictTypes: 'factorUnitM' }),
  );

  const unitLabelMap = useMemo(
    () =>
      buildUnitLabelMap(
        (unitDictResponse?.data?.data?.factorUnitM as Dicts[]) || [],
      ),
    [unitDictResponse?.data?.data?.factorUnitM],
  );

  const getUnitLabel = (value?: string | null) => {
    if (!value) return undefined;
    const rawValue = `${value}`;
    const lastValue = rawValue.split(',').pop() || rawValue;
    return unitLabelMap.get(rawValue) || unitLabelMap.get(lastValue);
  };

  const getDisplayAccountName = (
    account?: SupplierProductEmissionOverviewAccount,
  ) => {
    if (!account) return '-';
    if (account.type === SupplierProductEmissionOverviewType.MANUAL) {
      return getUnitLabel(account.accountName) || account.accountName || '-';
    }
    return account.accountName || '-';
  };

  const getDisplayUnitName = (
    account?: SupplierProductEmissionOverviewAccount,
  ) => {
    if (!account) return undefined;
    return (
      getUnitLabel(account.unitName) ||
      account.unitName ||
      (account.type === SupplierProductEmissionOverviewType.MANUAL
        ? getUnitLabel(account.accountName)
        : undefined)
    );
  };

  const getDisplayAccountGroupName = (
    group?: SupplierProductEmissionOverviewAccountName,
  ) =>
    getDisplayAccountName(group?.accountList?.[0]) || group?.accountName || '-';

  const accountInfo = detail?.account || selectedAccount;

  const isManual =
    accountInfo?.type === SupplierProductEmissionOverviewType.MANUAL;

  const isQuick =
    accountInfo?.type === SupplierProductEmissionOverviewType.QUICK;

  const unitProductEmission = useMemo(
    () => formatEmissionTotal(detail?.card?.emissionTotal),
    [detail?.card?.emissionTotal],
  );

  const totalEmission = useMemo(
    () =>
      calcTotalEmission(
        detail?.card?.emissionTotal,
        accountInfo?.amount,
        !isManual,
      ),
    [accountInfo?.amount, detail?.card?.emissionTotal, isManual],
  );

  const unitProductEmissionLabel = useMemo(
    () =>
      I18N.template(I18N.carbonFootprint.unitProductScheduling3, {
        val1:
          getDisplayUnitName(accountInfo) ||
          I18N.carbonFootprint.accountingUnit,
      }),
    [
      accountInfo?.accountName,
      accountInfo?.type,
      accountInfo?.unitName,
      unitLabelMap,
    ],
  );

  const stageList = useMemo(
    () => (detail?.byStages || []).map(normalizeSummary),
    [detail?.byStages],
  );

  const chartData = useMemo(
    () =>
      detail?.chart
        ? {
            ...detail.chart,
            byTypes: (detail.chart.byTypes || []).map(normalizeSummary),
          }
        : undefined,
    [detail?.chart],
  );

  const topEmissions = useMemo(
    () =>
      (detail?.topEmissions || []).length > 0
        ? (detail?.topEmissions || []).map(normalizeSummary)
        : undefined,
    [detail?.topEmissions],
  );

  const emissionListData = useMemo(
    () =>
      sortBy(
        (detail?.emissionList || []).map(
          (row: SupplierProductEmissionOverviewEmissionRow, index) => ({
            ...row,
            id: row.id ?? index,
          }),
        ),
        ['stage'],
      ),
    [detail?.emissionList],
  );

  const currentAccountGroup = useMemo(
    () =>
      accountNameList.find(group =>
        group.accountList.some(account => account.id === accountInfo?.id),
      ),
    [accountNameList, accountInfo?.id],
  );

  const accountTypeMenus = useMemo<ItemType[]>(
    () =>
      (currentAccountGroup?.accountList || []).map(account => ({
        label: getTypeLabel(account),
        key: account.id,
        disabled: account.id === accountInfo?.id,
      })),
    [currentAccountGroup, accountInfo?.id],
  );

  const changeCard = (account?: SupplierProductEmissionOverviewAccount) => {
    if (account?.id === selectedId) return;
    setSelectedId(account?.id);
    setSelectedAccount(account);
    setActiveStage(undefined);
    setDetail(undefined);
  };

  const changeUnit = (index: number) => {
    const next = accountNameList[index]?.accountList?.[0];
    if (next) {
      changeCard(next);
    }
  };

  const changeType = (id: number) => {
    const next = currentAccountGroup?.accountList.find(
      account => account.id === id,
    );
    if (next) {
      changeCard(next);
    }
  };

  useEffect(() => {
    if (!selectedId) {
      setAccountNameList([]);
      return;
    }

    let ignore = false;
    setRightLoading(true);

    getSupplierProductEmissionOverviewAccountNames({
      supplierId,
      supplierDataId: selectedId,
    })
      .then(({ data: response }) => {
        if (!ignore) {
          setAccountNameList(response.data || []);
        }
      })
      .finally(() => {
        if (!ignore) {
          setRightLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [supplierId, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(undefined);
      return;
    }

    let ignore = false;
    setDetailLoading(true);

    getSupplierProductEmissionOverviewDetail({
      supplierId,
      supplierDataId: selectedId,
      stage: activeStage,
    })
      .then(({ data: response }) => {
        if (!ignore) {
          setDetail(response.data);
          setSelectedAccount(response.data.account);
        }
      })
      .finally(() => {
        if (!ignore) {
          setDetailLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [supplierId, selectedId, activeStage]);

  useEffect(() => {
    if (
      accountInfo &&
      data?.list &&
      !data.list.some(account => account.id === accountInfo.id)
    ) {
      mutate({
        ...data,
        list: [accountInfo, ...data.list],
      });
    }
  }, [accountInfo?.id]);

  return (
    <section className={styles.overview}>
      <div className={styles.header}>{I18N.carbonFootprint.dataOverview}</div>
      <div className={styles.content}>
        <aside className={styles.left}>
          <div className={styles.leftTop}>
            <Input
              allowClear
              className={styles.search}
              prefix={<SearchOutlined className={styles.searchIcon} />}
              placeholder={I18N.carbonFootprint3.pleaseEnterTheProduct2}
              onChange={e => runDebounce(e.target.value)}
            />
            <div className={styles.filters}>
              {FILTERS.map(filter => (
                <button
                  type='button'
                  key={filter.label}
                  className={classNames(styles.filterItem, {
                    [styles.active]: activeFilter === filter.value,
                  })}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.cardList} ref={listRef}>
            {loading ? (
              <div className={styles.listLoading}>
                <Spin />
              </div>
            ) : (
              data?.list.map(account => (
                <button
                  type='button'
                  className={classNames(styles.card, {
                    [styles.cardActive]: selectedId === account.id,
                  })}
                  key={account.id}
                  onClick={() => changeCard(account)}
                >
                  <div className={styles.cardTitle}>
                    <span title={getProductTitle(account)}>
                      {getProductTitle(account)}
                    </span>
                    <span
                      className={classNames(styles.tag, {
                        [styles.tagProcess]:
                          account.type ===
                          SupplierProductEmissionOverviewType.PROCESS,
                        [styles.tagManual]:
                          account.type ===
                          SupplierProductEmissionOverviewType.MANUAL,
                      })}
                    >
                      {getTypeLabel(account)}
                    </span>
                  </div>
                  <div
                    className={styles.cardText}
                    title={getDisplayAccountName(account)}
                  >
                    {getDisplayAccountName(account)}
                  </div>
                  <div className={styles.cardDate}>
                    {account.startTime || '-'}
                    {I18N.carbonFootprint.to}
                    {account.endTime || '-'}
                  </div>
                </button>
              ))
            )}
            {loadingMore && <Spin className={styles.loadingMore} />}
            {noMore && (
              <div className={styles.noMore}>
                {I18N.carbonFootprint3.thereIsCurrentlyNoContentAvailable}
              </div>
            )}
          </div>
        </aside>

        {!selectedId ? (
          <div className={styles.rightEmpty}>
            <NoData />
          </div>
        ) : (
          <div className={styles.right}>
            <Spin spinning={rightLoading || detailLoading}>
              <div className={styles.rightContent}>
                <div>
                  <div className={styles.rightHeader}>
                    <div className={styles.title}>
                      {getProductTitle(accountInfo)}
                    </div>
                    {typeof accountInfo?.scope === 'number' && (
                      <div
                        className={classNames(styles.lifeCycleTag, {
                          [styles.halfLifeCycleTag]:
                            accountInfo.scope ===
                            FootprintAccountLifeCycle.HALF,
                          [styles.customLifeCycleTag]:
                            accountInfo.scope ===
                            FootprintAccountLifeCycle.CUSTOM,
                        })}
                      >
                        {ACCOUNT_SELECT_LIFE_CYCLE_LABEL[accountInfo.scope]}
                      </div>
                    )}
                  </div>
                  <div className={styles.info}>
                    <section>
                      <div className={styles.key}>
                        {I18N.carbonFootprint3.functionalUnits2}
                      </div>
                      <Dropdown
                        overlay={
                          <Menu
                            onClick={e => changeUnit(Number(e.key))}
                            items={accountNameList.map((item, index) => ({
                              label: getDisplayAccountGroupName(item),
                              key: index,
                              disabled:
                                item.accountName ===
                                currentAccountGroup?.accountName,
                            }))}
                          />
                        }
                        trigger={['click']}
                      >
                        <div className={styles.dropdownInner}>
                          <div className={styles.val}>
                            {getDisplayAccountName(accountInfo)}
                          </div>
                          <IconAlibabaNew
                            className={styles.arrowIcon}
                            type='icon-chevron-down'
                          />
                        </div>
                      </Dropdown>
                    </section>
                    <section>
                      <div className={styles.key}>
                        {I18N.carbonFootprint3.accountingType}
                      </div>
                      {accountTypeMenus.length > 1 ? (
                        <Dropdown
                          overlay={
                            <Menu
                              onClick={e => changeType(Number(e.key))}
                              items={accountTypeMenus}
                            />
                          }
                          trigger={['click']}
                        >
                          <div className={styles.dropdownInner}>
                            <div className={styles.val}>
                              {getTypeLabel(accountInfo)}
                            </div>
                            <IconAlibabaNew
                              className={styles.arrowIcon}
                              type='icon-chevron-down'
                            />
                          </div>
                        </Dropdown>
                      ) : (
                        <div className={styles.val}>
                          {getTypeLabel(accountInfo)}
                        </div>
                      )}
                    </section>
                    <section>
                      <div className={styles.key}>
                        {I18N.carbonFootprint.accountingCycle2}
                      </div>
                      <div className={styles.val}>
                        {accountInfo?.startTime || '-'}
                        {I18N.carbonFootprint.to}
                        {accountInfo?.endTime || '-'}
                      </div>
                    </section>
                  </div>
                </div>

                <div className={styles.emissionOut}>
                  <img src={zongliangSvg} alt='' className={styles.icon} />
                  <div className={styles.totalEmission}>
                    <div className={styles.emissionLabel}>
                      {I18N.carbonFootprint3.totalEmissionsK2}
                    </div>
                    <div className={styles.emissionValue} title={totalEmission}>
                      {totalEmission}
                    </div>
                  </div>
                  <div className={styles.split} />
                  <div className={styles.totalEmission}>
                    <div className={styles.emissionLabel}>
                      {unitProductEmissionLabel}
                    </div>
                    <div
                      className={styles.emissionValue}
                      title={unitProductEmission}
                    >
                      {unitProductEmission}
                    </div>
                  </div>
                  <div className={styles.split} />
                  <div className={styles.maxEmission}>
                    <div className={styles.emissionLabel}>
                      {I18N.carbonFootprint3.maximumDischargeRing}
                    </div>
                    <div className={styles.maxEmissionDesc}>
                      <div className={styles.maxEmissionName}>
                        {detail?.card?.stage || '-'}
                      </div>
                      <div
                        className={styles.maxEmissionValue}
                        title={detail?.card?.stageEmissions || '-'}
                      >
                        {detail?.card?.stageEmissions || '-'}
                      </div>
                    </div>
                  </div>
                  {!isManual && (
                    <>
                      <div className={styles.hiddenSplit} />
                      <div className={styles.maxEmission}>
                        <div className={styles.emissionLabel}>
                          {I18N.carbonFootprint3.maximumEmissionsCategory}
                        </div>
                        <div className={styles.maxEmissionDesc}>
                          <div className={styles.maxEmissionName}>
                            {detail?.card?.type || '-'}
                          </div>
                          <div
                            className={styles.maxEmissionValue}
                            title={detail?.card?.typeEmissions || '-'}
                          >
                            {detail?.card?.typeEmissions || '-'}
                          </div>
                        </div>
                      </div>
                      <div className={styles.hiddenSplit} />
                      <div className={styles.maxEmission}>
                        <div className={styles.emissionLabel}>
                          {I18N.carbonFootprint3.maximumEmissionSource}
                        </div>
                        <div className={styles.maxEmissionDesc}>
                          <div className={styles.maxEmissionName}>
                            {detail?.card?.emission || '-'}
                          </div>
                          <div
                            className={styles.maxEmissionValue}
                            title={detail?.card?.emissions || '-'}
                          >
                            {detail?.card?.emissions || '-'}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className={styles.compare}>
                  <div className={styles.sectionTitle}>
                    {I18N.carbonFootprint3.emissionsPerCycle}
                  </div>
                  <div className={styles.compareContent}>
                    <div
                      className={classNames(styles.compareLeft, {
                        [styles.compareLeftManual]: isManual,
                      })}
                    >
                      {stageList.map(item => (
                        <button
                          type='button'
                          className={classNames(styles.emissionItem, {
                            [styles.currEmissionItem]:
                              activeStage === item.code,
                          })}
                          key={item.code}
                          onClick={() =>
                            setActiveStage(
                              activeStage === item.code ? undefined : item.code,
                            )
                          }
                        >
                          <div className={styles.emissionItemLeft}>
                            <IconAlibaba
                              type={GET_EMISSION_ICON_BY_CODE[item.code]}
                              className={styles.stageIcon}
                            />
                            <div className={styles.emissionName}>
                              {item.name}
                            </div>
                          </div>
                          <div className={styles.emissionItemRight}>
                            <div className={styles.emissionCompare}>
                              <div className={styles.compareValue}>
                                {item.total}
                              </div>
                              <div className={styles.comparePercent}>
                                {normalizeRate(item.rate)}%
                              </div>
                            </div>
                            <div className={styles.compareBar}>
                              <div
                                className={styles.compareBarInner}
                                style={{
                                  width: `${normalizeRate(item.rate)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {!isManual && (
                      <div className={styles.compareRight}>
                        {isQuick ? (
                          <PieChart emissionTotalChartData={chartData} />
                        ) : (
                          <ColumnChart
                            emissionTotalChartData={chartData}
                            height={250}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!isManual && isQuick && selectedId && (
                  <AISuggestion
                    accountId={selectedId}
                    autoGenerate={false}
                    readonly
                    getSuggestionService={() =>
                      getSupplierProductEmissionOverviewAiAdvice({
                        supplierId,
                        supplierDataId: selectedId,
                      })
                    }
                  />
                )}

                {!isManual && (
                  <div className={styles.top10}>
                    <div className={styles.sectionTitle}>
                      <span>{I18N.carbonFootprint3.emissionRanking2}</span>
                      {topEmissions && (
                        <Button
                          type='link'
                          onClick={() => setEmissionSortModalVisible(true)}
                        >
                          {I18N.carbonFootprint3.viewDetails}
                        </Button>
                      )}
                    </div>
                    {topEmissions ? (
                      <ColumnEChart
                        top10
                        height={262}
                        chartData={topEmissions}
                      />
                    ) : (
                      <NoData />
                    )}
                  </div>
                )}

                {!isManual && isQuick && detail?.sankey && (
                  <section className={styles.sankeyChartWrapper}>
                    <div className={styles.sectionTitle}>
                      {I18N.carbonFootprint3.carbonFootprintVerification5}
                    </div>
                    <div className={styles.sankeyCate}>
                      <div>{I18N.carbonFootprint.emissions}</div>
                      <div>{I18N.carbonFootprint3.stage}</div>
                      <div>{I18N.carbonFootprint.emissionSourceType}</div>
                      <div>{I18N.carbonFootprint.emissionSources}</div>
                    </div>
                    <SankeyChart sankeyChartData={detail.sankey} height={280} />
                  </section>
                )}
              </div>
            </Spin>
          </div>
        )}
      </div>
      <Modal
        title={I18N.carbonFootprint3.emissionDetails}
        footer={null}
        open={emissionSortModalVisible}
        width={1200}
        onCancel={() => setEmissionSortModalVisible(false)}
        wrapClassName={styles.emissionSortModal}
      >
        <div className={styles.emissionSort}>
          <div className={styles.sectionTitle}>
            {I18N.carbonFootprint3.emissionSourceDischarge}
          </div>
          {topEmissions ? (
            <ColumnEChart top10 height={262} chartData={topEmissions} />
          ) : (
            <NoData />
          )}
          <div className={styles.sectionTitle}>
            {I18N.carbonFootprint3.emissionInventory}
          </div>
          <div className={styles.tableWrapper}>
            <Table
              columns={emissionTotalListColumns({
                data: emissionListData as any,
              })}
              dataSource={emissionListData as any}
              pagination={false}
              rowKey='id'
            />
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default SupplierProductCarbonOverview;
