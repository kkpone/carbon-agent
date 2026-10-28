import useUrlState from '@ahooksjs/use-url-state';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import emptyImg from '@src/assets/svg/empty.svg';
import I18N from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { Button, Cascader, Input, Popconfirm, Select, Spin, Tag } from 'antd';
import classNames from 'classnames';
import { debounce, isNil } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { checkPermissions } from '@/components/Permission/utils';
import { IconAlibaba } from '@/components/iconfont';
import { useScope } from '@/hooks/useScope';
import { RouteMaps } from '@/router/route-paths';
import { Toast } from '@/utils/Toast';
import { ACCOUNT_WAY } from '@/views/enterpriseCarbonAccount2/AccountingSetting/constant';

import MeasuresFillDrawer from './MeasuresFillDrawer';
import MeasuresListModal from './MeasuresListModal';
import {
  COST_EARN_UNIT,
  FEASIBILITY,
  FEASIBILITY_LABEL,
  MEASURES_CHANNEL_TYPE,
  MEASURES_TYPE,
  MEASURES_TYPE_LABEL,
} from './constant';
import styles from './index.module.less';
import {
  deleteMeasures,
  editMeasures,
  getApplyMeasuresList,
  getFinancialYearList,
  getMeasuresOverviewDta,
} from './service';
import { MeasuresType, AccountSetting } from './type';
import EmissionChart from '../Overview/EmissionsChart';
import { getOverviewInfo } from '../Overview/service';
import { OverviewInfo } from '../Overview/type';
import ScopeOrgSelect from '../ScopeOrgSelect';
import { REDUCING_TAB_KEY } from '../constant';
import { ReducingPlan } from '../type';

type ReductionMeasuresProps = {
  reducingPlan: ReducingPlan;
  changeTab: (key: string) => void;
};

const chartOption = {
  grid: {
    top: 54,
    right: 160,
    bottom: 50,
    left: 80,
  },
  legend: {
    right: 'right' as const,
    orient: 'vertical' as const,
  },
};
const ReductionMeasures: FC<ReductionMeasuresProps> = ({
  reducingPlan,
  changeTab,
}) => {
  const [urlParams] = useUrlState<{ open?: string }>();

  const [overviewInfo, setOverviewInfo] = useState<OverviewInfo>();

  const [loading, setLoading] = useState(true);

  const [measuresListModalOpen, setMeasuresListModalOpen] = useState(false);

  const [scopeOrgData, setScopeOrgData] = useState<{
    scopeValues: string[][];
  }>({ scopeValues: [] });

  const [measuresList, setMeasuresList] = useState<MeasuresType[]>([]);

  const [searchParams, setSearchParams] = useState<
    Partial<{
      type: number;
      name: string;
      feasibility: number;
      scopeValues: string[][];
    }>
  >({});

  const [currMeasures, setCurrMeasures] = useState<MeasuresType | null>(null);

  const [overviewData, setOverviewData] = useState<
    Partial<{
      measureCount: string;
      predictReduce: string;
      predictCost: string;
      predictEarnings: string;
      investYear: string;
    }>
  >({});

  const [accountSetting, setAccountSetting] = useState<AccountSetting>({
    accountWay: ACCOUNT_WAY.CALENDAR_YEAR,
    yearList: [],
  });

  const history = useHistory();

  const scopeDict = useScope();

  const targetId = reducingPlan.id;

  const hasYesterYearData = !isNil(overviewInfo?.yesterYearRealityEmissions);

  const hasForecastSetting = !!overviewInfo?.forecastConfig;

  const getOverview = async ({
    id,
    orgValues,
    scopeValues,
  }: {
    id: number;
    scopeValues: string[][];
    orgValues?: string[][];
  }) => {
    try {
      setLoading(true);
      const { data } = await getOverviewInfo({ id, scopeValues, orgValues });
      setOverviewInfo(data.data);
    } finally {
      setLoading(false);
    }
  };

  const getApplyMeasures = async data => {
    const resp = await getApplyMeasuresList({
      ...data,
      channelType: MEASURES_CHANNEL_TYPE.APPLY,
    });
    setMeasuresList(resp.data.data || []);
  };

  const getOverviewData = async data => {
    const resp = await getMeasuresOverviewDta(data);
    setOverviewData(resp.data.data);
  };

  const onMeasuresEdit = async data => {
    await editMeasures(data);
    Toast('success', I18N.carbonFootprint.operationSuccessful);
    getApplyMeasures({ targetId, ...searchParams });
    setCurrMeasures(null);
    setScopeOrgData({ ...scopeOrgData });
  };

  const onMeasuresDelete = async (measures: MeasuresType) => {
    await deleteMeasures({ id: measures.id });
    Toast('success', I18N.carbonFootprint.deleteSuccessful);
    getApplyMeasures({ targetId, ...searchParams });
    setScopeOrgData({ ...scopeOrgData });
  };

  const onMeasuresNameChange = useMemo(
    () =>
      debounce((name: string) => {
        setSearchParams({
          ...searchParams,
          name,
        });
      }, 300),
    [searchParams],
  );

  const editPermission = checkPermissions(true, 'enterprise:measure:edit');

  useEffect(() => {
    setScopeOrgData({ scopeValues: [] });
  }, [reducingPlan]);

  useEffect(() => {
    getOverview({ id: targetId, ...scopeOrgData });
    getOverviewData({ targetId, scopeValues: scopeOrgData.scopeValues });
  }, [scopeOrgData, targetId]);

  useEffect(() => {
    getApplyMeasures({ targetId: reducingPlan.id, ...searchParams });
  }, [reducingPlan, searchParams]);

  useEffect(() => {
    getFinancialYearList().then(({ data }) => {
      setAccountSetting({
        accountWay: data.data.accountWay,
        yearList: (data.data.yearList || []).map(year => ({
          value: year,
          label: year,
        })),
      });
    });
  }, []);

  useMount(() => {
    setMeasuresListModalOpen(!!urlParams.open);
  });
  return (
    <Spin
      wrapperClassName={styles.spin}
      spinning={loading}
      indicator={<LoadingOutlined />}
    >
      {hasYesterYearData && hasForecastSetting ? (
        <div className={styles.content}>
          <MeasuresListModal
            open={measuresListModalOpen}
            accountSetting={accountSetting}
            targetId={targetId}
            onSuccess={() => {
              setMeasuresListModalOpen(false);
              getApplyMeasures({ targetId, ...searchParams });
              setScopeOrgData({ ...scopeOrgData });
            }}
            onCancel={() => setMeasuresListModalOpen(false)}
          />
          <MeasuresFillDrawer
            readPretty={!editPermission}
            accountSetting={accountSetting}
            id={currMeasures?.id}
            confirmText={I18N.carbonFootprint.preserve}
            onConfirm={onMeasuresEdit}
            onCancel={() => setCurrMeasures(null)}
          />

          <div className={styles.resultOverview}>
            <div className={styles.resultOverviewHeader}>
              <div className={styles.headerTitle}>
                {
                  I18N.enterpriseCarbonAccount2
                    .overviewOfEmissionReductionMeasures
                }
              </div>
              <ScopeOrgSelect
                reducingPlan={reducingPlan}
                value={scopeOrgData}
                onChange={setScopeOrgData}
              />
            </div>
            <div className={styles.resultOverviewContent}>
              <div className={styles.resultContent}>
                <div className={styles.resultTop}>
                  <div className={styles.resultItem}>
                    <IconAlibaba type='icon-icon_book' />
                    <div>
                      <div className={styles.resultLabel}>
                        {I18N.enterpriseCarbonAccount2.numberOfMeasures}
                      </div>
                      <div className={styles.resultValue}>
                        {overviewData.measureCount || '-'}
                      </div>
                    </div>
                  </div>
                  <div className={styles.resultItem}>
                    <IconAlibaba type='icon-icon_columnar' />
                    <div>
                      <div className={styles.resultLabel}>
                        {I18N.enterpriseCarbonAccount2.expectedReturnPeriod}
                      </div>
                      <div className={styles.resultValue}>
                        {overviewData.investYear || '-'}
                        <div className={styles['caption-s']}>
                          {I18N.DomesticVersion.year}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.resultBody}>
                  <div className={styles.resultBodyItem}>
                    <IconAlibaba type='icon-icon_trend' />
                    <div>
                      <div className={styles.resultLabel}>
                        {
                          I18N.enterpriseCarbonAccount2
                            .expectedEmissionReduction
                        }
                      </div>
                      <div className={styles.resultValue}>
                        {overviewData.predictReduce || '-'}
                        <div className={styles['caption-s']}>tCO₂e</div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.resultBodyItem}>
                    <IconAlibaba type='icon-icon_statistics' />
                    <div>
                      <div className={styles.resultLabel}>
                        {I18N.enterpriseCarbonAccount2.estimatedCost}
                      </div>
                      <div className={styles.resultValue}>
                        {overviewData.predictCost || '-'}
                        <div className={styles['caption-s']}>
                          {COST_EARN_UNIT.COST}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.resultBodyItem}>
                    <IconAlibaba type='icon-icon_income' />
                    <div>
                      <div className={styles.resultLabel}>
                        {I18N.enterpriseCarbonAccount2.expectedRevenue}
                      </div>
                      <div className={styles.resultValue}>
                        {overviewData.predictEarnings || '-'}
                        <div className={styles['caption-s']}>
                          {COST_EARN_UNIT.EARN}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.chartContent}>
                <div className={styles.chartHeader}>
                  <span className={styles.title}>
                    {I18N.enterpriseCarbonAccount2.totalEmissions}
                  </span>
                  <span className={styles.titleTip}>
                    {I18N.enterpriseCarbonAccount2.thePredictedResultsAreOnly}
                  </span>
                </div>
                <div className={styles.chartBox}>
                  <EmissionChart
                    reducingPlan={reducingPlan}
                    scopeOrgData={scopeOrgData}
                    chartOption={chartOption}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.measuresList}>
            <div className={styles.measuresListHeader}>
              <div className={styles.header}>
                <div className={styles.headerTitle}>
                  {I18N.enterpriseCarbonAccount2.emissionReductionMeasures}
                </div>
                {editPermission && (
                  <Button
                    type='primary'
                    onClick={() => setMeasuresListModalOpen(true)}
                  >
                    <PlusOutlined />
                    {I18N.enterpriseCarbonAccount2.addMeasures}
                  </Button>
                )}
              </div>
              <div className={styles.measuresFilter}>
                <Select
                  className={styles.filterInputSelect}
                  placeholder={
                    I18N.enterpriseCarbonAccount2.classificationOfMeasures
                  }
                  options={Object.values(MEASURES_TYPE).map(measuresType => ({
                    value: measuresType,
                    label: MEASURES_TYPE_LABEL[measuresType],
                  }))}
                  allowClear
                  onChange={type => {
                    setSearchParams({ ...searchParams, type });
                  }}
                />
                <Input
                  className={styles.filterInputSelect}
                  placeholder={I18N.enterpriseCarbonAccount2.measureName}
                  onChange={e => onMeasuresNameChange(e.target.value)}
                />
                <Select
                  className={styles.filterInputSelect}
                  placeholder={I18N.enterpriseCarbonAccount2.feasibility}
                  options={Object.values(FEASIBILITY).map(value => ({
                    value,
                    label: FEASIBILITY_LABEL[value],
                  }))}
                  allowClear
                  onChange={feasibility => {
                    setSearchParams({ ...searchParams, feasibility });
                  }}
                />
                <Cascader
                  className={styles.filterInputSelect}
                  maxTagCount='responsive'
                  multiple
                  placeholder={
                    I18N.enterpriseCarbonAccount2.emissionReductionEffect
                  }
                  popupClassName={styles.cascaderPopup}
                  options={scopeDict}
                  fieldNames={{ label: 'name', children: 'classifyList' }}
                  onChange={scopeValues => {
                    setSearchParams({ ...searchParams, scopeValues });
                  }}
                />
              </div>
            </div>
            <div className={styles.listContent}>
              {measuresList.map(measures => {
                const {
                  id,
                  name,
                  type,
                  measureDesc,
                  predictReduce,
                  predictCost,
                  predictEarnings,
                  feasibility,
                } = measures;
                return (
                  <div className={styles.measures} key={id}>
                    <div className={styles.measuresBasicInfo}>
                      <div className={styles.measuresName}>
                        <div className={styles.typeTag}>
                          {MEASURES_TYPE_LABEL[type]}
                        </div>
                        {name}
                      </div>
                      <div className={styles.measuresDesc} title={measureDesc}>
                        {measureDesc}
                      </div>
                    </div>
                    <div className={styles.measuresInfo}>
                      <div className={styles.measuresInfoLabel}>
                        {
                          I18N.enterpriseCarbonAccount2
                            .expectedEmissionReduction
                        }
                        <span className={styles.measuresInfoLabelUnit}>
                          tCO₂e
                        </span>
                      </div>
                      <div className={styles.measuresInfoValue}>
                        {predictReduce}
                      </div>
                    </div>
                    <div className={styles.measuresInfo}>
                      <div className={styles.measuresInfoLabel}>
                        {I18N.enterpriseCarbonAccount2.estimatedCost}
                        <span className={styles.measuresInfoLabelUnit}>
                          {COST_EARN_UNIT.COST}
                        </span>
                      </div>
                      <div className={styles.measuresInfoValue}>
                        {predictCost || '-'}
                      </div>
                    </div>
                    <div className={styles.measuresInfo}>
                      <div className={styles.measuresInfoLabel}>
                        {I18N.enterpriseCarbonAccount2.expectedAnnualRevenue}
                        <span className={styles.measuresInfoLabelUnit}>
                          {COST_EARN_UNIT.EARN}
                        </span>
                      </div>
                      <div className={styles.measuresInfoValue}>
                        {predictEarnings || '-'}
                      </div>
                    </div>
                    <div className={styles.measuresInfo}>
                      <div className={styles.measuresInfoLabel}>
                        {I18N.enterpriseCarbonAccount2.feasibility}
                      </div>
                      <div className={styles.measuresInfoValue}>
                        {FEASIBILITY_LABEL[feasibility]}
                      </div>
                    </div>
                    <div className={styles.measuresOperate}>
                      <div
                        className={styles.operateBtn}
                        onClick={() => setCurrMeasures(measures)}
                      >
                        <IconAlibaba type='icon-a-icon_edit' />
                      </div>
                      {editPermission && (
                        <Popconfirm
                          title={I18N.carbonFootprint.confirm}
                          description={
                            I18N.enterpriseCarbonAccount2.doYouWantToDeleteIt2
                          }
                          onConfirm={() => onMeasuresDelete(measures)}
                        >
                          <div className={styles.operateBtn}>
                            <IconAlibaba type='icon-icon_delete' />
                          </div>
                        </Popconfirm>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.completed}>
          <div className={styles.completedContent}>
            <img className={styles.emptyImg} src={emptyImg} alt='' />
            <div className={styles.completeDesc}>
              {I18N.enterpriseCarbonAccount2.pleaseFollowTheInstructions}
            </div>
            <div className={styles.completeBlock}>
              <div className={styles.completeItem}>
                <div
                  className={classNames(styles.completeItemLabel, {
                    [styles.completedText]: hasYesterYearData,
                  })}
                >
                  {I18N.enterpriseCarbonAccount2.carbonEmissionAccounting2}
                </div>
                <div
                  className={classNames(styles.completeItemDesc, {
                    [styles.completedText]: hasYesterYearData,
                  })}
                >
                  {hasYesterYearData
                    ? I18N.enterpriseCarbonAccount2.already
                    : I18N.enterpriseCarbonAccount2.please}
                  {I18N.enterpriseCarbonAccount2.complete}
                  {overviewInfo?.yesterYear || ''}
                  {I18N.enterpriseCarbonAccount2.annualCorporateCarbonCore}
                </div>
                <div className={styles.completeOperate}>
                  {hasYesterYearData ? (
                    <Tag className={styles.completeTag}>
                      {I18N.components.completed}
                    </Tag>
                  ) : (
                    <Button
                      type='primary'
                      onClick={() =>
                        history.push(
                          RouteMaps.enterpriseCarbonAccountingcarbonDischarge,
                        )
                      }
                    >
                      {I18N.enterpriseCarbonAccount2.goToAccounting}
                    </Button>
                  )}
                </div>
              </div>
              <div className={styles.completeItem}>
                <div
                  className={classNames(styles.completeItemLabel, {
                    [styles.completedText]: hasForecastSetting,
                  })}
                >
                  {I18N.enterpriseCarbonAccount2.emissionPrediction}
                </div>
                <div
                  className={classNames(styles.completeItemDesc, {
                    [styles.completedText]: hasForecastSetting,
                  })}
                >
                  {hasForecastSetting
                    ? I18N.enterpriseCarbonAccount2.already
                    : I18N.enterpriseCarbonAccount2.please}
                  {I18N.enterpriseCarbonAccount2.completeEmissionPrediction}
                </div>
                <div className={styles.completeOperate}>
                  {hasForecastSetting ? (
                    <Tag className={styles.completeTag}>
                      {I18N.components.completed}
                    </Tag>
                  ) : (
                    <Button
                      type='primary'
                      onClick={() => changeTab(REDUCING_TAB_KEY.FORECAST)}
                    >
                      {I18N.enterpriseCarbonAccount2.goToConfiguration}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Spin>
  );
};

export default ReductionMeasures;
