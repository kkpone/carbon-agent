import I18N from '@src/lang/I18N';
import EChartsReact from 'echarts-for-react';
import { FC, useMemo } from 'react';

import { EmissionData } from '../../service';

interface ICompanyExportChartProps {
  orgComparisonData?: EmissionData['orgComparisonData'];
}

export const CompanyExportChart: FC<ICompanyExportChartProps> = props => {
  const { orgComparisonData } = props;

  const options = useMemo(() => {
    const data = orgComparisonData?.map(item => item.orgName);
    const scopeOneData = orgComparisonData?.map(
      item => item.categoryData[0].emissionQuantity,
    );
    const scopeTwoData = orgComparisonData?.map(
      item => item.categoryData[1].emissionQuantity,
    );
    const scopeThreeData = orgComparisonData?.map(
      item => item.categoryData[2].emissionQuantity,
    );
    return {
      title: {
        text: '',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: [
          I18N.enterpriseCarbonAccount2.scopeOne,
          I18N.enterpriseCarbonAccount2.scope2,
          I18N.enterpriseCarbonAccount2.fanWeisan,
        ],
        top: 0,
        itemHeight: 12,
        itemWidth: 12,
      },
      grid: {
        left: '10%',
        right: '0',
        top: '14%',
        bottom:
          orgComparisonData && orgComparisonData?.length > 20 ? '20%' : '0',
        containLabel: true,
      },
      dataZoom:
        orgComparisonData && orgComparisonData?.length > 20
          ? [
              {
                type: 'slider', // 滑动条
                show: true,
                xAxisIndex: 0, // 应用于第一个 x 轴
                start: 0, // 数据窗口范围的起始百分比
                end: 50, // 数据窗口范围的结束百分比
              },
              {
                type: 'inside', // 内部滚动
                xAxisIndex: 0, // 应用于第一个 x 轴
                start: 0,
                end: 50,
              },
            ]
          : [],
      xAxis: {
        type: 'category',
        data,
        barMaxWidth: 60, // 最大宽度
        axisLabel: {
          rotate: 0,
        },
        axisTick: {
          show: false, // 隐藏刻度线
        },
        axisLine: {
          show: false, // 隐藏轴线
        },
        // axisLine: false
      },
      yAxis: {
        type: 'value',
        name: I18N.work.carbonEmissionsOfVariousCategories,
        nameLocation: 'middle',
        position: 'left',
        nameTextStyle: {
          padding: 90,
        },
      },
      series: [
        {
          name: I18N.enterpriseCarbonAccount2.scopeOne,
          type: 'bar',
          stack: I18N.carbonInternational.total,
          data: scopeOneData,
          itemStyle: {
            color: '#04252B',
            // borderRadius: [2],
            // barCategoryGap: 6,
          },
          barMaxWidth: 60, // 最大宽度
          barGap: '10%',
        },
        {
          name: I18N.enterpriseCarbonAccount2.scope2,
          type: 'bar',
          stack: I18N.carbonInternational.total,
          data: scopeTwoData,
          itemStyle: {
            color: '#004541',
            // borderRadius: [2],
            // barCategoryGap: 6,
          },
          barMaxWidth: 60, // 最大宽度
          barGap: '10%',
        },
        {
          name: I18N.enterpriseCarbonAccount2.fanWeisan,
          type: 'bar',
          stack: I18N.carbonInternational.total,
          data: scopeThreeData,
          itemStyle: {
            color: '#0CBF9F',
            // borderRadius: [2],
            // barCategoryGap: 6,
          },
          barMaxWidth: 60, // 最大宽度
          barGap: '10%',
        },
      ],
    };
  }, [orgComparisonData]);
  return (
    <div>
      <EChartsReact option={options} />
    </div>
  );
};
