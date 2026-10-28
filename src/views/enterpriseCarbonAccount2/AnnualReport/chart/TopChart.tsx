import I18N from '@src/lang/I18N';
import { Button } from 'antd';
import * as echarts from 'echarts';
import { isNil } from 'lodash-es';
import { FC, memo, useEffect, useRef, useState } from 'react';

import DetailsModal from './DetailsModal';
import Empty from './Empty';
import { Org } from '../../AccountingList/type';
import styles from '../index.module.less';
import { getTopEmission } from '../service';

type TopChartProps = {
  year?: number;
  org?: Org;
};

const TopChart: FC<TopChartProps> = ({ year, org }) => {
  const [emissionList, setEmissionList] = useState<
    { name: string; emissionQuantity: number }[]
  >([]);

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    const chartDom = chartContainerRef.current;
    if (chartDom === null) {
      return () => {};
    }

    chartRef.current = echarts.init(chartDom, undefined, {
      width: 'auto',
      height: 'auto',
    });
    const observer = new ResizeObserver(() => {
      chartRef.current?.resize();
    });
    observer.observe(chartDom);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isNil(year) && !isNil(org)) {
      getTopEmission({ period: year.toString(), orgId: org.id }).then(
        ({ data }) => {
          setEmissionList(data.data);
        },
      );
    } else {
      setEmissionList([]);
    }
  }, [year, org]);

  useEffect(() => {
    const option: echarts.EChartsOption = {
      grid: {
        containLabel: true,
        left: '40px',
        right: '20px',
        bottom: '20px',
      },
      color: '#048677',

      tooltip: {
        trigger: 'axis',
      },
      legend: {
        show: false,
      },
      label: {
        show: true,
        position: 'top',
      },

      xAxis: [
        {
          type: 'category',
          axisTick: { show: false },
          axisLine: { show: false },
          data: emissionList.map(emission => emission.name),
          axisLabel: {
            interval: 0,
            hideOverlap: false,
            formatter: (value: string) =>
              value?.length > 6 ? `${value.slice(0, 5)}...` : value,
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: I18N.enterpriseCarbonAccount2.unitTCo2,
        },
      ],
      series: [
        {
          name: I18N.carbonFootprint.emissions,
          type: 'bar',
          barMaxWidth: 16,
          data: emissionList.map(emission => emission.emissionQuantity),
        },
      ],
    };

    chartRef.current?.setOption(option);
  }, [emissionList]);

  return (
    <div className={styles.columnChart}>
      <div className={styles.columnChartHeader}>
        <div className={styles['title-s-b']}>
          {I18N.enterpriseCarbonAccount2.topEmissions2}
        </div>
        {emissionList.length !== 0 && (
          <Button type='link' onClick={() => setDetailsModalVisible(true)}>
            {I18N.enterpriseCarbonAccount2.viewDetails}
          </Button>
        )}
      </div>
      <div className={styles.columnChartContent}>
        {emissionList.length === 0 && <Empty className={styles.floatEmpty} />}
        <div ref={chartContainerRef} className={styles.columnChartContent} />
      </div>
      <DetailsModal
        visible={detailsModalVisible}
        year={year}
        orgId={org?.id}
        onClose={() => setDetailsModalVisible(false)}
      />
    </div>
  );
};

export default memo(TopChart);
