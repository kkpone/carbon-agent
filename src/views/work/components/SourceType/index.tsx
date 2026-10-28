import I18N from '@src/lang/I18N';
import { useMount, useSize, useThrottle } from 'ahooks';
import EChartsReact from 'echarts-for-react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { TProductData } from '../../service';
import { colorArray } from '../utils';

interface ISourceTypeProps {
  chartData?: TProductData['charType']['byTypes'];
}

export const SourceTypeChart: FC<ISourceTypeProps> = props => {
  const { chartData } = props;

  const [radius, setRadius] = useState<[string, string]>(['35%', '45%']);
  const [center, setCenter] = useState<[string, string]>(['25%', '50%']);
  const [height, setHeight] = useState('200px');

  const throttledRadius = useThrottle(radius, { wait: 500 });
  const throttledCenter = useThrottle(center, { wait: 500 });

  const size = useSize(window.document.body);

  const setRadiusAndCenter = useCallback(() => {
    if (window.innerWidth < 1200) {
      // setRadius
      setRadius(['35%', '45%']);
      setHeight('170px');
      setCenter(['25%', '50%']);
    } else if (window.innerWidth >= 1200 && window.innerWidth < 1400) {
      setRadius(['50%', '60%']);
      setCenter(['25%', '50%']);
      setHeight('200px');
      // setCenter(['35%', '50%'])
    } else if (window.innerWidth >= 1400 && window.innerWidth < 1600) {
      setRadius(['55%', '70%']);
      setCenter(['35%', '50%']);
      setHeight('200px');
    } else if (window.innerWidth >= 1600) {
      setRadius(['55%', '70%']);
      setCenter(['35%', '50%']);
      setHeight('260px');
    }
  }, []);

  useMount(setRadiusAndCenter);

  useEffect(setRadiusAndCenter, [size?.width]);

  const option = useMemo(() => {
    const info = chartData?.map(item => ({
      name: item.name,
      value: item.rate,
    }));
    return {
      grid: {
        left: '0%', // 左边距
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ({d}%)',
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 'right',
        top: 'middle',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          color: '#000',
          fontSize: 12,
        },
        formatter(name: string) {
          const data = info || [];
          const item = data.find(d => d.name === name);
          return `${name.length > 6 ? `${name.slice(0, 6)}...` : name}: ${
            item?.value
          }%`;
        },
        data: info?.map(d => d.name) || [],
      },
      series: [
        {
          name: I18N.carbonFootprint.emissionSourceType,
          type: 'pie',
          radius: throttledRadius,
          center: throttledCenter,
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
          },
          labelLine: {
            show: false,
          },
          data: info?.map((d, index) => ({
            ...d,
            itemStyle: {
              color: colorArray[index % 12],
            },
          })),
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2,
          },
        },
      ],
    };
  }, [chartData, throttledRadius, throttledCenter]);
  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100% - 40px)',
      }}
    >
      <EChartsReact
        option={option}
        style={{
          height,
        }}
      />
    </div>
  );
};
