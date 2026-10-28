/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-24 10:41:04
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-13 15:02:49
 */
import { Sankey, SankeyConfig } from '@ant-design/charts';
import I18N from '@src/lang/I18N';
import { memo } from 'react';

import { BAR_COLORS } from '@/views/carbonFootprint3/FootprintAccount/constant';

import { SankeyChartData, SankeyChartList } from '../../TotalView/type';

type SankeyData = {
  source: string;
  target: string;
  value: number;
};

export const SankeyChart = memo(
  ({
    height,
    sankeyChartData,
  }: {
    height?: number;
    sankeyChartData?: SankeyChartData;
  }) => {
    /**
     * @description: 递归处理数据层级
     * @param {string} source 数据源
     * @param {SankeyChartList} arr 目标数组
     *
     * FLT 增加标识 因为后面的名称展示需要该表示进行切割
     */
    const setSourceAndTarget = (source: string, arr: SankeyChartList[]) => {
      let newArr: SankeyData[] = [];
      arr.forEach(list => {
        newArr.push({
          source,
          target: `${list.sankeyTarget}FLT${list.name}`,
          value: Number(list.total),
        });
        if (list.typeList || list.emissionList) {
          const backArr = setSourceAndTarget(
            `${list.sankeyTarget}FLT${list.name}`,
            list.typeList || list.emissionList,
          );
          newArr = [...newArr, ...backArr];
        }
      });
      return newArr;
    };

    /**
     * @description: 格式化接口数据
     */
    const formatSankeyChartData = () => {
      if (sankeyChartData) {
        const data = setSourceAndTarget(
          'kgCO₂eFLTkgCO₂e',
          sankeyChartData.stageList,
        );
        return data;
      }

      return [];
    };

    const data = formatSankeyChartData();

    const config = {
      data,
      align: true,
      height,
      categories: ['111', '222'],
      sourceField: 'source',
      targetField: 'target',
      weightField: 'value',
      color: BAR_COLORS,
      edgeStyle: {
        fillOpacity: 0.15,
      },
      label: {
        formatter: ({ name }) => {
          const newNameArr = name
            ? name.split('FLT')
            : I18N.carbonFootprint.unknown;
          return newNameArr !== I18N.carbonFootprint.unknown
            ? newNameArr[1]
            : newNameArr;
        },
      },
      tooltip: {
        formatter: tip => {
          const sourceNameArr = tip.source ? tip.source.split('FLT') : [];
          const sourceName = sourceNameArr
            ? sourceNameArr[1]
            : I18N.carbonFootprint.unknown;

          const targetNameArr = tip.target ? tip.target.split('FLT') : [];
          const targetName = targetNameArr
            ? targetNameArr[1]
            : I18N.carbonFootprint.unknown;
          const tipName = `${sourceName} --> ${targetName}`;
          return {
            name: tipName,
            value: tip.value,
          };
        },
      },
      nodeDraggable: false,
    } as SankeyConfig;

    return <Sankey {...config} />;
  },
);
