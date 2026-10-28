import I18N from '@src/lang/I18N';
import { EChartsCoreOption } from 'echarts';
import Echart from '../components/echartBar';

interface Starships {
  product_statistical_data: any;
  product_baseline_data: any;
  system_boundary: any;
}

const LineChart = ({
  system_boundary,
  product_statistical_data,
  product_baseline_data,
}: Starships) => {
  const option: EChartsCoreOption = {
    grid: {
      left: '17%',
      right: '5%',
      top: '20%',
      bottom: '10%',
    },
    xAxis: {
      type: 'category',
      data: system_boundary,
      axisLabel: {
        interval: 0, // X轴信息全部展示
        fontSize: 10,
      },

      axisLine: {
        lineStyle: {
          color: '#999999',
          width: 0.5,
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      name: I18N.carbonFootprint.unitKgC,
      nameTextStyle: {
        color: '#666666',
        fontSize: 12,
        padding: [0, -10, 10, -10],
      },
      type: 'value',
      axisLine: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#999999', // 轴字体
      },
    },
    series: [
      {
        data: [
          (
            Number(product_baseline_data.product_material_sum) -
            Number(product_statistical_data.product_material_sum)
          ).toFixed(2),
          (
            Number(product_baseline_data.product_manufacturing_sum) -
            Number(product_statistical_data.product_manufacturing_sum)
          ).toFixed(2),
          (
            Number(product_baseline_data.product_distribution_sum) -
            Number(product_statistical_data.product_distribution_sum)
          ).toFixed(2),
          (
            Number(product_baseline_data.product_use_energy_sum) -
            Number(product_statistical_data.product_use_energy_sum)
          ).toFixed(2),
          (
            Number(product_baseline_data.product_disposed_waste_sum) -
            Number(product_statistical_data.product_disposed_waste_sum)
          ).toFixed(2),
        ],
        type: 'line',
        symbol: 'circle', // 折点设定为实心点
        symbolSize: 5, // 设定实心点的大小
        itemStyle: {
          normal: {
            color: 'rgba(111, 148, 241, 1)', // 折点颜色
            lineStyle: {
              color: 'rgba(111, 148, 241, 1)', // 折线颜色
              default: 0.5,
            },
            label: {
              show: true,
              position: 'top', // 在上方显示
              textStyle: {
                // 数值样式
                color: '#666666',
                fontSize: 12,
              },
            },
          },
        },
      },
    ],
  };
  return <Echart option={option} style={{ width: '100%', height: '100%' }} />;
};

export default LineChart;
