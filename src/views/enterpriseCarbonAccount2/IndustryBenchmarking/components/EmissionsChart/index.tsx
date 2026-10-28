import I18N from '@src/lang/I18N';
import { CustomRadio } from '@src/views/enterpriseCarbonAccount2/AnnualReport/components/Radio';
import ReactEcharts from 'echarts-for-react';
import { FC, useMemo } from 'react';

import styles from './index.module.less';

interface IEmissionsChartProps {
  value: string;
  setValue: (value: string) => void;
  chartValue: {
    yAxis: string[];
    scopeOne: number[];
    scopeTwo: number[];
    scopeThree: number[];
  };
}

export const dataType = {
  /** 总排放量 */
  amount: '1',
  /** 排放强度-营收 */
  intensity: '2',
} as const;

const option = ({
  yAxis,
  scopeOne,
  scopeTwo,
  scopeThree,
}: {
  yAxis: string[];
  scopeOne: number[];
  scopeTwo: number[];
  scopeThree: number[];
}) => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  legend: {},
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'value',
  },
  yAxis: {
    type: 'category',
    data: yAxis,
  },
  series: [
    {
      name: I18N.enterpriseCarbonAccount2.scopeOne,
      type: 'bar',
      stack: 'total',
      color: '#0CBF9F',
      // label: {
      //   show: true,
      // },
      data: scopeOne,
    },
    {
      name: I18N.enterpriseCarbonAccount2.scope2,
      type: 'bar',
      stack: 'total',
      color: '#3491FA',
      // label: {
      //   show: true,
      // },
      data: scopeTwo,
    },
    {
      name: I18N.enterpriseCarbonAccount2.fanWeisan,
      type: 'bar',
      stack: 'total',
      color: '#FBA93E',
      // label: {
      //   show: true,
      // },
      data: scopeThree,
    },
  ],
});

export const EmissionsChart: FC<IEmissionsChartProps> = props => {
  const finalOptions = useMemo(
    () =>
      option({
        yAxis: props.chartValue.yAxis,
        scopeOne: props.chartValue.scopeOne,
        scopeTwo: props.chartValue.scopeTwo,
        scopeThree: props.chartValue.scopeThree,
      }),
    [props.chartValue],
  );
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.left}>
          {I18N.enterpriseCarbonAccount2.comparisonOfEmissions}
        </div>
        <div className={styles.right}>
          <div className={styles.unit}>
            {props.value === dataType.amount
              ? I18N.enterpriseCarbonAccount2.unitTCo
              : I18N.enterpriseCarbonAccount2.unitTCo6}
          </div>
          <CustomRadio
            value={props.value}
            onChange={e => props.setValue(e)}
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
        </div>
      </div>
      <ReactEcharts
        option={finalOptions}
        style={{ width: '100%', height: '300px' }}
      />
    </div>
  );
};
