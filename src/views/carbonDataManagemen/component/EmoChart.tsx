/**
 * @file 碳账户的echert
 * @auth ljh
 *
 */
import { useRef, useEffect, useContext, useMemo } from 'react';
import * as echarts from 'echarts';
import { EchartContext } from '../index';
// import { delay } from 'lodash-es';

type EchartProp = {
  option: echarts.EChartsCoreOption;
  key?: string;
  style?: {
    width: string;
    height: string;
  };
  className?: string;
  ref?: React.RefObject<HTMLDivElement>;
};
const removeUndefined = (obj: object) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if (obj[key as keyof typeof obj] === undefined) {
      delete obj[key as keyof typeof obj];
    }
  }
  return obj;
};

const EmoChart: React.FC<EchartProp> = ({
  option,
  key,
  className,
  style = { width: '100%', height: '80%' },
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const echartsInstance = useRef<echarts.ECharts>();
  const content = useContext(EchartContext);
  useEffect(() => {
    echartsInstance.current = echarts.init(chartRef.current as HTMLDivElement);
    echartsInstance.current?.on('mouseout', () => {
      echartsInstance.current?.dispatchAction(
        {
          type: 'hideTip',
        },
        {
          silent: true,
          flush: true,
        },
      );
    });
    echartsInstance.current?.on('globalout', () => {
      echartsInstance.current?.dispatchAction(
        {
          type: 'hideTip',
        },
        {
          silent: true,
          flush: true,
        },
      );
    });
    window.addEventListener('resize', () => {
      echartsInstance.current?.resize();
    });
    return () => {
      if (echartsInstance.current) {
        echartsInstance.current?.off('click');
        echartsInstance.current?.off('mouseout');
        echartsInstance.current?.off('globalout');
      }
    };
  }, []);

  useMemo(() => {
    echartsInstance.current?.resize();
  }, [content]);
  useEffect(() => {
    echartsInstance.current?.setOption(option);
  }, [option]);

  return (
    <div
      ref={chartRef}
      {...removeUndefined({ key, className, style, option })}
    />
  );
};

export default EmoChart;
