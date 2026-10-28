import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import { Checkbox, Spin } from 'antd';
import { EChartsOption } from 'echarts';
import EChartsReact from 'echarts-for-react';
import { isUndefined } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import iconSvg from './icon.svg';
import styles from './index.module.less';
import { CustomRadio } from '../../components/Radio';
import { getBoardIndustryData, IndustryData } from '../../service';
import Empty from '../Empty';

interface IBenchmarkingProps {
  hideTypeSwitch?: boolean;
  period?: number;
  orgId?: number;
  orgName?: string;
}

const getOption: ({
  max,
  min,
  avg,
  median,
}: {
  max: number;
  min: number;
  avg: number;
  median: number;
  current: number;
}) => EChartsOption = ({ max, min, avg, median }) => ({
  grid: {
    top: '5%',
    left: '3%',
    right: '10%',
    bottom: '3%',
    containLabel: true,
  },
  tooltip: {
    trigger: 'axis',
    formatter: data => {
      const item = data[0];
      return `<div>
        <div>${item.name}</div>
        ${item.marker}
        <span style="margin-left: 8px; font-weight: 500">${item.value}</span>
      </div>`;
    },
  },
  yAxis: {
    type: 'category',
    data: [
      I18N.enterpriseCarbonAccount2.minimum,
      I18N.enterpriseCarbonAccount2.average,
      I18N.enterpriseCarbonAccount2.median,
      I18N.enterpriseCarbonAccount2.highest,
    ],
  },
  xAxis: {
    type: 'log',
    min: 1,
    axisLabel: {
      // 只显示 1, 100, 10000 等特定值
      formatter: value => (Math.log10(value) % 2 === 0 ? `${value}` : ''),
    },
    logBase: 10,
  },
  series: [
    {
      data: [min, avg, median, max],
      type: 'bar',
      color: '#0CBF9F',
      barWidth: 12,
    },
  ],
});

const tagBackGroundMap = {
  A: 'linear-gradient(90deg, rgba(12, 191, 159, 0.08) 0%, rgba(12, 191, 159, 0.00) 100%)',
  B: 'linear-gradient(90deg, rgba(52, 145, 250, 0.08) 0%, rgba(52, 145, 250, 0.00) 100%)',
  C: 'linear-gradient(90deg, rgba(251, 169, 62, 0.08) 0%, rgba(251, 169, 62, 0.00) 100%)',
  D: 'linear-gradient(90deg, rgba(113, 111, 255, 0.08) 0%, rgba(113, 111, 255, 0.00) 100%)',
  E: 'linear-gradient(90deg, rgba(108, 117, 125, 0.08) 0%, rgba(108, 117, 125, 0.00) 100%)',
};

const levelColor = {
  A: '#0CBF9F',
  B: '#3491FA',
  C: '#FBA93E',
  D: '#716FFF',
  E: '#6C757D',
};

const desMap = {
  A: I18N.enterpriseCarbonAccount2.enterpriseEmissionsSituation5,
  B: I18N.enterpriseCarbonAccount2.enterpriseEmissionsSituation4,
  C: I18N.enterpriseCarbonAccount2.enterpriseEmissionsSituation3,
  D: I18N.enterpriseCarbonAccount2.enterpriseEmissionsSituation2,
  E: I18N.enterpriseCarbonAccount2.enterpriseEmissionsSituation,
};

const dataType = {
  /** 总排放量 */
  amount: '1',
  /** 排放强度-营收 */
  intensity: '2',
} as const;

export const Benchmarking: FC<IBenchmarkingProps> = props => {
  const { hideTypeSwitch = false, period, orgId, orgName } = props;
  const [value, setValue] = useState<string>(dataType.amount);

  const [includesScope3, setIncludesScope3] = useState<boolean>(false);

  const {
    data,
    loading: isLoading,
    run,
  } = useRequest(
    async () =>
      getBoardIndustryData({
        period,
        orgId: String(orgId),
        dataType: value,
        scopeType: includesScope3 ? '1' : '0',
      }),
    {
      manual: true,
    },
  );

  useEffect(() => {
    if (!isUndefined(orgId)) {
      run();
    }
  }, [period, orgId, value, includesScope3]);

  const info = useMemo(() => data?.data.data || ({} as IndustryData), [data]);

  const level = info.ratingCompany || 'A';

  const { isShowIndustryData } = info;

  const finalOptions = useMemo(
    () =>
      getOption({
        min: info.minIndustryData || 0,
        max: info.maxIndustryData || 0,
        avg: info.avgIndustryData || 0,
        median: info.medianIndustryData || 0,
        current: info.emissionCompany || 0,
      }),
    [info],
  );

  if (isShowIndustryData === '0') {
    return null;
  }

  const isEmpty = Object.keys(info).length === 0 && !isLoading;

  return (
    <Spin spinning={isLoading}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.title}>
            {I18N.enterpriseCarbonAccount2.latestIndustryNumbers}
          </div>
          <div className={styles.right}>
            <span className={styles.unit}>
              {value === dataType.amount
                ? I18N.enterpriseCarbonAccount2.unitTCo
                : I18N.enterpriseCarbonAccount2.unitTCo6}
            </span>
            {!hideTypeSwitch && (
              <CustomRadio
                value={value}
                onChange={e => setValue(e)}
                items={[
                  {
                    label: I18N.enterpriseCarbonAccount2.totalEmissions,
                    value: dataType.amount,
                  },
                  {
                    label: I18N.enterpriseCarbonAccount2.emissionIntensityCamp,
                    value: dataType.intensity,
                  },
                ]}
              />
            )}
          </div>
        </div>
        {isEmpty && (
          <div className={styles.emptyWrapper}>
            <Empty />
          </div>
        )}{' '}
        {!isEmpty && (
          <div className={styles.content}>
            <div className={styles.left}>
              <div className={styles.header}>
                <div className={styles.headerLeft}>
                  <img src={iconSvg} alt='' />
                  <div className={styles.companyName}>{orgName}</div>
                  <Link
                    to='/enterpriseCarbonAccounting/industryBenchmarking'
                    className={styles.review}
                  >
                    {I18N.enterpriseCarbonAccount2.viewIndustryReviews}
                  </Link>
                </div>
                <div className={styles.headerRight}>
                  <Checkbox
                    checked={includesScope3}
                    onChange={e => setIncludesScope3(e.target.checked)}
                  >
                    {I18N.enterpriseCarbonAccount2.scopeThree}
                  </Checkbox>
                </div>
              </div>
              <EChartsReact option={finalOptions} style={{ height: '140px' }} />
            </div>
            <div className={styles.right}>
              <div
                className={styles.tag}
                style={{
                  background: tagBackGroundMap[level],
                }}
              >
                <div className={styles.tit}>
                  {I18N.enterpriseCarbonAccount2.enterpriseRating}
                </div>
                <div
                  className={styles.level}
                  style={{
                    color: levelColor[level],
                  }}
                >
                  {level}
                </div>
                <div className={styles.des}>{desMap[level]}</div>
              </div>
              <div className={styles.cards}>
                <div className={styles.average}>
                  <div className={styles.title}>
                    {I18N.enterpriseCarbonAccount2.industryAverage}
                  </div>
                  <div className={styles.number}>
                    {info.avgIndustryData || 0}
                  </div>
                  <div>
                    <span className={styles.title}>
                      {Number(info.avgIndustryPercent) > 0
                        ? I18N.enterpriseCarbonAccount2
                            .higherThanIndustryAverage
                        : I18N.enterpriseCarbonAccount2
                            .belowIndustryAverage2}{' '}
                    </span>
                    <span
                      style={{
                        color:
                          Number(info.avgIndustryPercent) > 0
                            ? '#ED5555'
                            : '#0CBF9F',
                      }}
                    >
                      {info.avgIndustryPercent}%
                    </span>
                  </div>
                </div>
                <div className={styles.median}>
                  <div className={styles.title}>
                    {I18N.enterpriseCarbonAccount2.industryMedian}
                  </div>
                  <div className={styles.number}>
                    {info.medianIndustryData || 0}
                  </div>
                  <div>
                    <span className={styles.title}>
                      {Number(info.medianIndustryPercent) > 0
                        ? I18N.enterpriseCarbonAccount2.higherThanInTheIndustry
                        : I18N.enterpriseCarbonAccount2
                            .belowIndustryAverage}{' '}
                    </span>
                    <span
                      style={{
                        color:
                          Number(info.avgIndustryPercent) > 0
                            ? '#ED5555'
                            : '#0CBF9F',
                      }}
                    >
                      {info.medianIndustryPercent}%
                    </span>
                  </div>
                </div>
                <div className={styles.minMax}>
                  <div className={styles.minItem}>
                    <span className={styles.title}>
                      {I18N.enterpriseCarbonAccount2.theLowestInTheIndustry}
                    </span>
                    <span className={styles.number}>
                      {info.minIndustryData}
                    </span>
                  </div>
                  <div className={styles.maxItem}>
                    <span className={styles.title}>
                      {I18N.enterpriseCarbonAccount2.theHighestInTheIndustry}
                    </span>
                    <span className={styles.number}>
                      {info.maxIndustryData}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Spin>
  );
};
