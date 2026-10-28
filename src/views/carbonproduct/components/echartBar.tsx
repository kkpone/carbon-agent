import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
// EChartOption// 被注释掉了

type EchartProp = {
  option: echarts.EChartsCoreOption;
  key?: string;
  style?: {
    width: string;
    height: string;
    display?: string;
  };
  className?: string;
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

const Echart: React.FC<EchartProp> = ({
  option,
  key,
  className,
  style = { width: '100%', height: '100%' },
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const echartsInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    echartsInstance.current = echarts.init(chartRef.current as HTMLDivElement);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      echartsInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // @ts-ignore
    echartsInstance.current?.clear();
    echartsInstance.current?.setOption(option);
  }, [option]);

  return (
    <div
      ref={chartRef}
      {...removeUndefined({ option, key, className, style })}
    />
  );
};

export default Echart;
