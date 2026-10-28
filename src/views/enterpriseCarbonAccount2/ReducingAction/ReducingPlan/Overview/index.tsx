import { LoadingOutlined } from '@ant-design/icons';
import emptyImg from '@src/assets/svg/empty.svg';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Button, Radio, Spin, Tag } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import EmissionTable from './EmissionTable';
import EmissionsChart from './EmissionsChart';
import styles from './index.module.less';
import { getOverviewInfo } from './service';
import { YearType, OverviewInfo } from './type';
import ScopeOrgSelect from '../ScopeOrgSelect';
import { YEAR_TYPE, COMPARE_TAG, REDUCING_TAB_KEY } from '../constant';
import { ReducingPlan } from '../type';

const YEAR_CHOOSE = {
  SHOW: '1',
  HIDDEN: '0',
};

type OverviewProps = {
  reducingPlan: ReducingPlan;
  changeTab: (tabKey: string) => void;
};

const Overview: FC<OverviewProps> = ({ reducingPlan, changeTab }) => {
  const [overviewInfo, setOverviewInfo] = useState<OverviewInfo>();

  const [scopeOrgData, setScopeOrgData] = useState<{
    scopeValues: string[][];
    orgValues: string[][];
  }>({ scopeValues: [], orgValues: [] });

  const [loading, setLoading] = useState(false);

  const [yearType, setYearType] = useState<YearType>();

  const history = useHistory();

  const hasYesterYearData = !isNil(overviewInfo?.yesterYearRealityEmissions);

  const hasTargetSetting = !isNil(overviewInfo?.plannedYear);

  const hasForecastSetting = !!overviewInfo?.forecastConfig;

  const getOverview = async ({
    id,
    orgValues,
    scopeValues,
  }: {
    id: number;
    scopeValues: string[][];
    orgValues: string[][];
  }) => {
    try {
      setLoading(true);
      const { data } = await getOverviewInfo({ id, scopeValues, orgValues });
      setOverviewInfo(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setScopeOrgData({ scopeValues: [], orgValues: [] });
  }, [reducingPlan]);

  useEffect(() => {
    getOverview({ id: reducingPlan.id, ...scopeOrgData });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeOrgData]);

  return (
    <div className={styles.overview}>
      <Spin
        wrapperClassName={styles.loadingContainer}
        spinning={loading}
        indicator={<LoadingOutlined />}
      >
        <div className={styles.overviewHeader}>
          <div className={styles.overviewHeaderTop}>
            <div>
              <span className={styles['body-m-b']}>
                {I18N.enterpriseCarbonAccount2.emissionReductionTargets}
              </span>
              <span className={styles['caption-s']}>
                {I18N.enterpriseCarbonAccount2.unitTCo2}
              </span>
            </div>
            <ScopeOrgSelect
              reducingPlan={reducingPlan}
              value={scopeOrgData}
              onChange={setScopeOrgData}
            />
          </div>
          <div className={styles.overviewDetails}>
            <div className={styles.overviewDetailsItem}>
              <div className={styles.targetYearContent}>
                <div>
                  <div className={styles.targetYearValue}>
                    {overviewInfo?.plannedYear ?? '-'}
                  </div>
                  <div className={styles.targetYearLabel}>
                    {I18N.enterpriseCarbonAccount2.targetYear}
                  </div>
                </div>
                <div>
                  <div className={styles.targetYearValue}>
                    {overviewInfo?.plannedCers ?? '-'}
                  </div>
                  <div className={styles.targetYearLabel}>
                    {I18N.enterpriseCarbonAccount2.targetEmissionReduction}
                  </div>
                </div>
              </div>
              <div className={styles.targetProcess}>
                <div className={styles.targetProcessValue}>
                  {I18N.enterpriseCarbonAccount2.completedNb}
                  <span className={styles.targetProcessValueSpan}>
                    {overviewInfo?.completionRate}%
                  </span>
                </div>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressBarBody}
                  style={{ width: `${overviewInfo?.completionRate ?? 0}%` }}
                />
              </div>
            </div>
            <div className={styles.overviewHeaderSplit} />
            <div className={styles.overviewDetailsItem}>
              <div className={styles.overviewEmission}>
                <div className={styles.overviewEmissionTitle}>
                  {overviewInfo?.yesterYear}
                  {I18N.enterpriseCarbonAccount2.targetEmissions}
                </div>
                <div className={styles.overviewEmissionDetails}>
                  <div className={styles.overviewEmissionDetailsItem}>
                    <div className={styles.emissionDetailsLabel}>
                      {I18N.enterpriseCarbonAccount2.targetEmissions}
                    </div>
                    <div className={styles.emissionDetailsValue}>
                      {overviewInfo?.yesterYearPlannedEmissions ?? '-'}
                    </div>
                  </div>
                  <div className={styles.overviewEmissionDetailsItem}>
                    <div className={styles.emissionDetailsLabel}>
                      {I18N.enterpriseCarbonAccount2.actualEmissions}
                    </div>
                    <div className={styles.emissionDetailsValue}>
                      {overviewInfo?.yesterYearRealityEmissions ?? '-'}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.overviewEmissionTip}>
                {(() => {
                  if (!overviewInfo) {
                    return '';
                  }
                  if (isNil(overviewInfo.yesterYearPlannedEmissions)) {
                    return I18N.enterpriseCarbonAccount2
                      .notYetEstablishedForThatYear;
                  }
                  if (
                    overviewInfo.yesterYearTargetType === COMPARE_TAG.GREATER
                  ) {
                    return (
                      <>
                        {
                          I18N.enterpriseCarbonAccount2
                            .exceedingTheEmissionTarget
                        }
                        <span className={styles.warnText}>
                          {overviewInfo.yesterYearTargetEmissions}
                        </span>
                      </>
                    );
                  }
                  return I18N.enterpriseCarbonAccount2.currentEmissionsHaveBeen;
                })()}
              </div>
            </div>
            <div className={styles.overviewDetailsItem}>
              <div
                className={classNames(
                  styles.overviewEmission,
                  styles.overviewEmissionPredict,
                )}
              >
                <div className={styles.overviewEmissionTitle}>
                  {overviewInfo?.currentYear}
                  {I18N.enterpriseCarbonAccount2.predictiveData}
                </div>
                <div className={styles.overviewEmissionDetails}>
                  <div className={styles.overviewEmissionDetailsItem}>
                    <div className={styles.emissionDetailsLabel}>
                      {I18N.enterpriseCarbonAccount2.targetEmissions}
                    </div>
                    <div className={styles.emissionDetailsValue}>
                      {overviewInfo?.currentYearPlannedEmissions ?? '-'}
                    </div>
                  </div>
                  <div className={styles.overviewEmissionDetailsItem}>
                    <div className={styles.emissionDetailsLabel}>
                      {I18N.enterpriseCarbonAccount2.predictingEmissions}
                    </div>
                    <div className={styles.emissionDetailsValue}>
                      {overviewInfo?.currentYearForecastEmissions ?? '-'}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.overviewEmissionTip}>
                {(() => {
                  if (!overviewInfo || !hasForecastSetting) {
                    return '';
                  }
                  if (
                    overviewInfo.currentYearTargetType === COMPARE_TAG.GREATER
                  ) {
                    return (
                      <>
                        <span className={styles['caption-s']}>
                          {I18N.enterpriseCarbonAccount2.toAchieveTheGoal}
                        </span>
                        <span className={styles.warnText}>
                          {overviewInfo.currentYearTargetEmissions}
                        </span>
                      </>
                    );
                  }
                  return I18N.enterpriseCarbonAccount2.expectedNextYear;
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.overviewContent}>
          {hasYesterYearData && hasTargetSetting && hasForecastSetting ? (
            <>
              <div className={styles.emission}>
                <div className={styles.emissionHeader}>
                  <div className={styles.emissionTitle}>
                    <span>{I18N.enterpriseCarbonAccount2.totalEmissions}</span>
                    <span className={styles.emissionDesc}>
                      {I18N.enterpriseCarbonAccount2.thePredictedResultsAreOnly}
                    </span>
                  </div>
                  {overviewInfo?.choose === YEAR_CHOOSE.SHOW && (
                    <Radio.Group
                      value={yearType}
                      defaultValue={YEAR_TYPE.RECENT_TEN_YEAR}
                      onChange={e => setYearType(e.target.value)}
                    >
                      <Radio.Button value={YEAR_TYPE.RECENT_TEN_YEAR}>
                        {I18N.enterpriseCarbonAccount2.tenYears}
                      </Radio.Button>
                      <Radio.Button value={YEAR_TYPE.ALL}>
                        {I18N.carbonFootprint3.whole}
                      </Radio.Button>
                    </Radio.Group>
                  )}
                </div>
                <div className={styles.emissionContent}>
                  <EmissionsChart
                    reducingPlan={reducingPlan}
                    scopeOrgData={scopeOrgData}
                    yearType={yearType}
                  />
                </div>
              </div>
              <EmissionTable reducingPlan={reducingPlan} />
            </>
          ) : (
            <div className={styles.completed}>
              <div className={styles.title}>
                {I18N.enterpriseCarbonAccount2.overviewDetails}
              </div>
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
                        [styles.completedText]: hasTargetSetting,
                      })}
                    >
                      {I18N.enterpriseCarbonAccount2.emissionReductionTargets2}
                    </div>
                    <div
                      className={classNames(styles.completeItemDesc, {
                        [styles.completedText]: hasTargetSetting,
                      })}
                    >
                      {hasTargetSetting
                        ? I18N.enterpriseCarbonAccount2.already
                        : I18N.enterpriseCarbonAccount2.please}
                      {
                        I18N.enterpriseCarbonAccount2
                          .completeEmissionReductionTargets
                      }
                    </div>
                    <div className={styles.completeOperate}>
                      {hasTargetSetting ? (
                        <Tag className={styles.completeTag}>
                          {I18N.components.completed}
                        </Tag>
                      ) : (
                        <Button
                          type='primary'
                          onClick={() => changeTab(REDUCING_TAB_KEY.TARGET)}
                        >
                          {I18N.enterpriseCarbonAccount2.goToConfiguration}
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
        </div>
      </Spin>
    </div>
  );
};

export default Overview;
