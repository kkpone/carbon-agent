/*
 * @@description:数据概览
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-23 09:34:25
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-15 16:25:41
 */

import noData from '@src/assets/svg/icon-zanmoneiyong.svg';
import { IconAlibaba, IconAlibabaNew } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Button, Dropdown, Menu, Modal, Spin, Table } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import classNames from 'classnames';
import { sortBy } from 'lodash-es';
import { useEffect, useState } from 'react';

import Permission from '@/components/Permission';

import style from './index.module.less';
import {
  getAccountCardInfo,
  getAccountNameList,
  getEmissionTotalComparison,
  getEmissionTotalComparisonChart,
  getEmissionTotalList,
  getEmissionTotalRankingChart,
  getSankeyChartData,
} from './service';
import {
  AccountMaxCardTotal,
  AccountNameListData,
  EmissionTotalComparisonChartData,
  EmissionTotalComparisonData,
  EmissionTotalListData,
  EmissionTotalRankingChartData,
  SankeyChartData,
} from './type';
import { emissionTotalListColumns } from './utils/columns';
import zongliangSvg from './zongliang.svg';
import {
  ACCOUNT_SELECT_LIFE_CYCLE_LABEL,
  FootprintAccountLifeCycle,
} from '../../FootprintAccount/constant';
import AISuggestion from '../../component/AISuggestion';
import { Cards } from '../components/Cards';
import { ColumnChart } from '../components/ColumnChart';
import { ColumnEChart } from '../components/ColumnEChart';
import { PieChart } from '../components/Pie';
import { SankeyChart } from '../components/SankeyChart';
import {
  DATAS_TYPE_LABEL,
  DatasTypeValue,
  GET_EMISSION_ICON_BY_CODE,
} from '../constant';
import { DatasFiltrateListData } from '../type';

const TotalView = () => {
  /** 核算的id */
  const [accountId, setAccountId] = useState<number>();

  /** 功能单位列表数据 */
  const [accountNameList, setAccountNameList] =
    useState<AccountNameListData[]>();

  /** 选中功能单位下拉列表的详细信息 */
  const [accountListInfo, setAccountListInfo] =
    useState<DatasFiltrateListData>();

  /** 核算类型的下拉菜单 */
  const [accountTypeMenus, setAccountTypeMenus] = useState<ItemType[]>([]);

  /** 右侧内容loading */
  const [rightLoading, setRightLoading] = useState(false);
  /** 排放量card的loading */
  const [emissionTotalLoading, setEmissionTotalLoading] = useState(false);

  /** 最大排放量信息 */
  const [maximumData, setMaximumData] = useState<AccountMaxCardTotal>();

  /** 生命周期排放量分布比例 */
  const [emissionTotalComparison, setEmissionTotalComparison] =
    useState<EmissionTotalComparisonData[]>();
  /** 生命周期排放量当前选中的 */
  const [activeComparisonCode, setActiveComparisonCode] = useState<number>();
  /** 排放量card的loading */
  const [emissionTotalComparisonLoading, setEmissionTotalComparisonLoading] =
    useState(false);

  /** 根据左侧生命周期环比 获取的右侧的数据 */
  const [emissionTotalChartData, setEmissionTotalChartData] =
    useState<EmissionTotalComparisonChartData>();
  const [emissionTotalChartDataLoaidng, setEmissionTotalChartDataLoading] =
    useState(false);

  /** 排放量排名loading */
  const [, setEmissionTotalRankingChartDataLoading] = useState(false);
  const [emissionTotalRankingChartData, setEmissionTotalRankingChartData] =
    useState<EmissionTotalRankingChartData[]>();

  /** 排放量详情弹框 - 表格列表数据 */
  const [emissionTotalListData, setEmissionTotalListData] = useState<
    EmissionTotalListData[]
  >([]);

  /** 桑葚图接口值 */
  const [sankeyChartData, setSankeyChartData] = useState<SankeyChartData>();
  const [sankeyChartDataLoading, setSankeyChartDataLoading] = useState(false);

  const [emissionSortModalVisible, setEmissionSortModalVisible] =
    useState(false);

  /**
   * @description: 选中左侧card的id
   * @param {number} id 核算id值
   */
  const clickCard = (id?: number) => {
    if (id !== accountId) {
      setAccountId(id);
      setEmissionTotalChartData(undefined);
    }
  };

  /**
   * @description: 根据核算的id找到对应的核算信息
   * @param {AccountNameListData} list 功能单位下拉列表
   * @param {number} id 左侧选中的核算card
   */
  const getAccountIfnoById = async (
    list: AccountNameListData[],
    id: number,
  ) => {
    let infoData: DatasFiltrateListData | undefined;
    let menus: ItemType[] | undefined;

    // 循环每条数据 生成核算的信息
    list.forEach(ll => {
      infoData = ll.accountList.find(everyList => everyList.id === id);

      if (infoData) {
        menus = ll.accountList.map(everyList => ({
          label: DATAS_TYPE_LABEL[everyList.type],
          key: everyList.id,
        }));

        setAccountListInfo(infoData);
      }
    });

    setAccountTypeMenus(menus || []);
  };

  /**
   * @description: 获取功能单位列表
   * @param {number} id 核算id
   */
  const getAccountNameListData = async (id: number) => {
    setRightLoading(true);
    const { data } = await getAccountNameList({ accountId: id });
    setAccountNameList(data.data);

    await getAccountIfnoById(data.data, id);
    setRightLoading(false);
  };

  /**
   * @description: 功能单位菜单下拉选中效果
   * @param {number} arrIndex 功能单位下拉选中的下标
   */
  const menuAccountDropdownClick = async (arrIndex: number) => {
    if (accountNameList) {
      const getAccountListData = accountNameList[arrIndex];

      const info = getAccountListData.accountList[0];
      // 如果当前选择和已经选择的一致 将不做任何处理
      if (info.id === accountListInfo?.id) return;

      const menus = getAccountListData.accountList.map(everyList => ({
        label: DATAS_TYPE_LABEL[everyList.type],
        key: everyList.id,
      }));
      setAccountTypeMenus(menus);
      // setAccountListInfo(info);
      setAccountId(info.id);
    }
  };

  /**
   * @description: 只切换核算类型
   * @param {number} id 核算id
   */
  const menuAccountTypeDropdownClick = async (id: number) => {
    // 如果当前选择和已经选择的一致 将不做任何处理
    if (id === accountListInfo?.id) return;

    // 去核算列表中找到切换后的信息  覆盖到info上
    accountNameList?.forEach(ll => {
      const infoData = ll.accountList.find(everyList => everyList.id === id);

      if (infoData) {
        // setAccountListInfo(infoData);
        setAccountId(infoData.id);
      }
    });
  };

  /**
   * @description: 根据accountId获取最大排放量信息
   * @param {number} id 核算id
   */
  const getMaximumData = async (id: number) => {
    setEmissionTotalLoading(true);
    const { data } = await getAccountCardInfo({ accountId: id });
    setMaximumData(data.data);
    setEmissionTotalLoading(false);
  };

  /**
   * @description: 根据accountId获取生命周期阶段的分布比例
   * @param {number} id 核算id
   */
  const getEmissionTotalComparisonData = async (id: number) => {
    setEmissionTotalComparisonLoading(true);
    const { data } = await getEmissionTotalComparison({ accountId: id });
    setEmissionTotalComparison(data.data);

    // 默认选中第一个生命周期数据
    // setActiveComparisonCode(data.data[0].code);

    setEmissionTotalComparisonLoading(false);
  };

  /**
   * @description: 切换生命周期环节分布对比
   * @param {EmissionTotalComparisonData} data 鼠标点击的生命周期数据
   */
  const changeComparisonActive = async (data: EmissionTotalComparisonData) => {
    const { code } = data;
    if (activeComparisonCode === code) {
      setActiveComparisonCode(undefined);
      return;
    }

    setActiveComparisonCode(code);
  };

  useEffect(() => {
    setActiveComparisonCode(undefined);
  }, [accountId]);

  /**
   * @description: 获取右侧chart图表
   * @param {number} id 核算id
   * @param {number} stage 选中的生命周期
   */
  const getEmissionTotalComparisonChartData = async (
    id: number,
    stage?: number,
  ) => {
    setEmissionTotalChartDataLoading(true);
    const { data } = await getEmissionTotalComparisonChart({
      accountId: id,
      stage,
    });

    setEmissionTotalChartData(data.data);
    setEmissionTotalChartDataLoading(false);
  };

  /**
   * @description: 获取排放量TOP排名
   * @param {number} id 核算id
   */
  const getEmissionTotalRankingChartData = async (id: number) => {
    setEmissionTotalRankingChartDataLoading(true);
    const { data } = await getEmissionTotalRankingChart({
      accountId: id,
    });
    const getData = data.data.length > 0 ? data.data : undefined;
    setEmissionTotalRankingChartData(getData);
    setEmissionTotalRankingChartDataLoading(false);
  };

  /**
   * @description: 获取排放量的列表所有数据
   * @param {number} id 核算id
   */
  const getEmissionTotalListData = async (id: number) => {
    const { data } = await getEmissionTotalList({ accountId: id });
    // 根据数据类型进行排序, 方便后面合并表格的单元格
    const sortByArr = sortBy(data.data, ['stage']);
    setEmissionTotalListData(sortByArr);
  };

  /**
   * @description: 获取
   * @param {number} id 核算id
   */
  const getApiSankeyChartData = async (id: number) => {
    setSankeyChartDataLoading(true);
    const { data } = await getSankeyChartData({ accountId: id });
    setSankeyChartDataLoading(false);
    setSankeyChartData(data.data);
  };

  // 只要id改变就要重新更新该功能单位列表
  useEffect(() => {
    if (accountId) {
      getAccountNameListData(accountId);
    }
  }, [accountId]);

  useEffect(() => {
    if (accountListInfo) {
      const { id, type } = accountListInfo;
      getMaximumData(id);
      getEmissionTotalComparisonData(id);
      getEmissionTotalRankingChartData(id);
      getEmissionTotalListData(id);

      // 只有快速核算才有桑葚图
      if (type === DatasTypeValue.QUICK) {
        getApiSankeyChartData(id);
      }
    }
  }, [accountListInfo]);

  useEffect(() => {
    // 选择不同的排放量分布对比
    if (accountListInfo) {
      getEmissionTotalComparisonChartData(
        accountListInfo?.id,
        activeComparisonCode,
      );
    }
  }, [activeComparisonCode, accountListInfo]);

  return (
    <div className={style.wrapper}>
      <div className={style.header}>{I18N.carbonFootprint.dataOverview}</div>
      <main>
        <div className={style.left}>
          <Cards
            info={accountListInfo}
            accountId={accountId}
            clickCard={clickCard}
          />
        </div>
        {!accountId ? (
          <div className={style.rightNoData}>
            <img
              src={noData}
              alt={I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
            />
            <div className={style.noDataText}>
              {I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
            </div>
          </div>
        ) : (
          <div className={style.right}>
            <Spin spinning={rightLoading}>
              <div className={style.rightContent}>
                <div>
                  <div className={style.rightHeader}>
                    <div className={style.title}>
                      {accountListInfo?.productName || '-'}
                    </div>
                    {accountListInfo && (
                      <div
                        className={classNames(style.lifeCycleTag, {
                          [style.halfLifeCycleTag]:
                            accountListInfo.scope ===
                            FootprintAccountLifeCycle.HALF,
                          [style.customLifeCycleTag]:
                            accountListInfo.scope ===
                            FootprintAccountLifeCycle.CUSTOM,
                        })}
                      >
                        {ACCOUNT_SELECT_LIFE_CYCLE_LABEL[accountListInfo.scope]}
                      </div>
                    )}
                  </div>
                  <div className={style.info}>
                    <section className={style.unit}>
                      <div className={style.key}>
                        {I18N.carbonFootprint3.functionalUnits2}
                      </div>
                      <Dropdown
                        overlay={
                          <Menu
                            onClick={e => {
                              menuAccountDropdownClick(Number(e.key));
                            }}
                            items={accountNameList?.map((ll, llIndex) => ({
                              label: ll.accountName,
                              key: llIndex,
                              disabled:
                                accountListInfo?.accountName === ll.accountName,
                            }))}
                          />
                        }
                        trigger={['click']}
                      >
                        <div className={style.dropdownInner}>
                          <div className={style.val}>
                            {accountListInfo?.accountName}
                          </div>
                          <IconAlibabaNew
                            className={style.arrowIcon}
                            type='icon-chevron-down'
                          />
                        </div>
                      </Dropdown>
                    </section>
                    <section className={style.unit}>
                      <div className={style.key}>
                        {I18N.carbonFootprint3.accountingType}
                      </div>
                      {accountTypeMenus && accountTypeMenus.length > 1 ? (
                        <Dropdown
                          overlay={
                            <Menu
                              onClick={e => {
                                menuAccountTypeDropdownClick(Number(e.key));
                              }}
                              items={accountTypeMenus}
                            />
                          }
                          trigger={['click']}
                        >
                          <div className={style.dropdownInner}>
                            <div className={style.val}>
                              {accountListInfo
                                ? DATAS_TYPE_LABEL[accountListInfo.type]
                                : '-'}
                            </div>
                            <IconAlibabaNew
                              className={style.arrowIcon}
                              type='icon-chevron-down'
                            />
                          </div>
                        </Dropdown>
                      ) : (
                        <div className={style.val}>
                          {accountListInfo
                            ? DATAS_TYPE_LABEL[accountListInfo.type]
                            : '-'}
                        </div>
                      )}
                    </section>
                    <section className={style.unit}>
                      <div className={style.key}>
                        {I18N.carbonFootprint.accountingCycle2}
                      </div>
                      <div className={style.val}>
                        {accountListInfo?.startTime as unknown as string}
                        {I18N.carbonFootprint.to}
                        {accountListInfo?.endTime as unknown as string}
                      </div>
                    </section>
                  </div>
                </div>

                <Spin spinning={emissionTotalLoading}>
                  <div className={style.emissionOut}>
                    <img
                      src={zongliangSvg}
                      alt=''
                      className={classNames(style.section, style.icon)}
                    />
                    <div className={style.totalEmission}>
                      <div className={style.emissionLabel}>
                        {I18N.carbonFootprint3.totalEmissionsK2}
                      </div>
                      <div
                        className={style.emissionValue}
                        title={maximumData?.emissionTotal || '-'}
                      >
                        {maximumData?.emissionTotal || '-'}
                      </div>
                    </div>
                    <div className={style.split} />
                    <div className={style.maxEmission}>
                      <div className={style.emissionLabel}>
                        {I18N.carbonFootprint3.maximumDischargeRing}
                      </div>
                      <div className={style.maxEmissionDesc}>
                        <div className={style.maxEmissionName}>
                          {maximumData?.stage || '-'}
                        </div>
                        <div
                          className={style.maxEmissionValue}
                          title={maximumData?.stageEmissions || '-'}
                        >
                          {maximumData?.stageEmissions || '-'}
                        </div>
                      </div>
                    </div>
                    <div className={style.hiddenSplit} />
                    <div className={style.maxEmission}>
                      <div className={style.emissionLabel}>
                        {I18N.carbonFootprint3.maximumEmissionsCategory}
                      </div>
                      <div className={style.maxEmissionDesc}>
                        <div className={style.maxEmissionName}>
                          {maximumData?.type || '-'}
                        </div>
                        <div
                          className={style.maxEmissionValue}
                          title={maximumData?.typeEmissions || '-'}
                        >
                          {maximumData?.typeEmissions || '-'}
                        </div>
                      </div>
                    </div>
                    <div className={style.hiddenSplit} />
                    <div className={style.maxEmission}>
                      <div className={style.emissionLabel}>
                        {I18N.carbonFootprint3.maximumEmissionSource}
                      </div>
                      <div className={style.maxEmissionDesc}>
                        <div className={style.maxEmissionName}>
                          {maximumData?.emission || '-'}
                        </div>
                        <div
                          className={style.maxEmissionValue}
                          title={maximumData?.emissions || '-'}
                        >
                          {maximumData?.emissions || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Spin>

                <div className={style.compare}>
                  <div className={style.title}>
                    {I18N.carbonFootprint3.emissionsPerCycle}
                  </div>
                  <div className={style.compareContent}>
                    <div className={style.compareLeft}>
                      <Spin spinning={emissionTotalComparisonLoading}>
                        {(emissionTotalComparison || []).map(item => {
                          const { code } = item;
                          return (
                            <div
                              className={classNames(style.emissionItem, {
                                [style.currEmissionItem]:
                                  activeComparisonCode === code,
                              })}
                              key={code}
                              onClick={() => changeComparisonActive(item)}
                            >
                              <div className={style.emissionItemLeft}>
                                <IconAlibaba
                                  type={GET_EMISSION_ICON_BY_CODE[code]}
                                  className={style.icon}
                                />
                                <div className={style.emissionName}>
                                  {item.name}
                                </div>
                              </div>
                              <div className={style.emissionItemRight}>
                                <div className={style.emissionCompare}>
                                  <div className={style.compareValue}>
                                    {item.total}
                                  </div>
                                  <div className={style.comparePercent}>
                                    {item.rate ?? 0}%
                                  </div>
                                </div>
                                <div className={style.compareBar}>
                                  <div
                                    className={style.compareBarInner}
                                    style={{ width: `${item.rate ?? 0}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </Spin>
                    </div>
                    <div
                      className={classNames(style.compareRight, {
                        [style.rightNoData]:
                          emissionTotalChartData &&
                          emissionTotalChartData.byTypes.length === 0,
                      })}
                    >
                      <Spin spinning={emissionTotalChartDataLoaidng}>
                        {accountListInfo?.type === DatasTypeValue.QUICK ? (
                          <PieChart
                            emissionTotalChartData={emissionTotalChartData}
                          />
                        ) : (
                          <ColumnChart
                            emissionTotalChartData={emissionTotalChartData}
                            height={250}
                          />
                        )}
                      </Spin>
                    </div>
                  </div>
                </div>

                {accountListInfo?.type === DatasTypeValue.QUICK && (
                  <Permission flag='footprint3:account:aiEmissionAnalysis'>
                    <AISuggestion accountId={accountId} />
                  </Permission>
                )}

                <div className={style.top10}>
                  <div className={style.title}>
                    {I18N.carbonFootprint3.emissionRanking2}
                    {emissionTotalRankingChartData && (
                      <Button
                        type='link'
                        onClick={() => setEmissionSortModalVisible(true)}
                      >
                        {I18N.carbonFootprint3.viewDetails}
                      </Button>
                    )}
                  </div>
                  {emissionTotalRankingChartData ? (
                    <ColumnEChart
                      top10
                      height={278 - 16}
                      chartData={emissionTotalRankingChartData}
                    />
                  ) : (
                    <div className={style.rightNoData}>
                      <img
                        src={noData}
                        alt={
                          I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable
                        }
                      />
                      <div className={style.noDataText}>
                        {I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
                      </div>
                    </div>
                  )}
                </div>

                {accountListInfo?.type === DatasTypeValue.QUICK && (
                  <Spin spinning={sankeyChartDataLoading}>
                    <section className={style.sankeyChartWrapper}>
                      <div className={style.title}>
                        {I18N.carbonFootprint3.carbonFootprintVerification5}
                      </div>
                      <div className={style.sankeyCate}>
                        <div>{I18N.carbonFootprint.emissions}</div>
                        <div>{I18N.carbonFootprint3.stage}</div>
                        <div>{I18N.carbonFootprint.emissionSourceType}</div>
                        <div>{I18N.carbonFootprint.emissionSources}</div>
                      </div>
                      <SankeyChart
                        sankeyChartData={sankeyChartData}
                        height={280}
                      />
                    </section>
                  </Spin>
                )}
              </div>
            </Spin>
          </div>
        )}
      </main>
      <Modal
        title={I18N.carbonFootprint3.emissionDetails}
        footer={null}
        open={emissionSortModalVisible}
        width={1200}
        onCancel={() => setEmissionSortModalVisible(false)}
        wrapClassName={style.emissionSortModal}
      >
        <div className={style.emissionSort}>
          <div className={style.title}>
            {I18N.carbonFootprint3.emissionSourceDischarge}
          </div>
          {emissionTotalRankingChartData ? (
            <ColumnEChart
              top10
              height={262}
              chartData={emissionTotalRankingChartData}
            />
          ) : (
            <div className={style.rightNoData}>
              <img
                src={noData}
                alt={I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
              />
              <div className={style.noDataText}>
                {I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
              </div>
            </div>
          )}

          <div className={style.title}>
            {I18N.carbonFootprint3.emissionInventory}
          </div>
          <div className={style.tableWrapper}>
            <Table
              columns={emissionTotalListColumns({
                data: emissionTotalListData,
              })}
              dataSource={emissionTotalListData}
              pagination={false}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TotalView;
