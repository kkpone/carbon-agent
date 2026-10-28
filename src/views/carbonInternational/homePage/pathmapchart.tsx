import { differenceBy, compact, uniq } from 'lodash-es';
import { EChartsCoreOption } from 'echarts';
import { memo, useMemo } from 'react';
import { sliceNumberEnd } from '@utils/index';
import { Dictionary } from '@src/typings';
import Echart from '../../carbonproduct/components/echartBar';

const PathMapChart = ({ datas }: any) => {
  const colors = [
    '#05C398',
    '#00CFBF',
    '#816BFF',
    '#9F9BFF',
    '#FDAD59',
    '#FFD18B',
    '#FF6061',
    '#FF7E7C',
    '#7BB1FF',
    '#4185FF',
  ];

  const getRandomColor = () => {
    const len = colors.length;
    const index = Math.floor(Math.random() * len);
    return colors[index];
  };
  type Links = {
    props?: { [key: string]: any };
    source: string;
    target: string;
    value: number;
  };
  // 其它排放源
  const middleGasesLessKey: { [key: string]: number } = {};
  // 占比小于 1% 的，合并为others
  const otherGas: Links[] = [];
  const otherGasName = '';
  // const otherGasName = '其它';

  const options: EChartsCoreOption | undefined = useMemo(() => {
    const res: EChartsCoreOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const { data } = params;
          if (data?.name) {
            // 修改其它的 tooltip
            if (data.name === otherGasName) {
              return Object.entries(middleGasesLessKey).reduce(
                (tmp, next) =>
                  `${tmp}${next[0]}: ${sliceNumberEnd(next[1])} <br />`,
                '',
              );
            }
            return `${data.name}: ${sliceNumberEnd(params.value)}`;
          }
          if (data?.source && data?.target) {
            const start = data?.props?.firstLevel
              ? `${data?.props?.firstLevel}--`
              : '';
            return `${start} ${data.source}--${data.target}: ${sliceNumberEnd(
              data.value,
            )}`;
          }
          return '';
        },
      },
      series: [],
    };

    const series: any = {
      type: 'sankey',
      layout: '',
      nodeAlign: 'justify',
      nodeWidth: 10,
      nodeGap: 19,
      bottom: 60,
      left: '8%',
      right: '8%',
      layoutIterations: 0,
      data: [],
      links: [],
      label: {
        fontSize: 14,
        color: '#656565',
      },
      itemStyle: {
        borderWidth: 0,
      },
      lineStyle: {
        color: 'source',
        opacity: 0.25,
      },
    };
    const gasNameMap: Dictionary<any> = {};
    const emissionSourceValueMap: { [key: string]: number } = {};
    const firstLinkMap: { [key: string]: string[] } = {};
    // 最后一级的links
    let baseLink: Links[] = [];
    let totalCount = 0;
    datas?.forEach(
      // @ts-ignore
      ({ emissions_category, emission_source, produce_gas_type_list }) => {
        if (produce_gas_type_list?.length) {
          produce_gas_type_list.forEach(
            // @ts-ignore
            ({ prpduce_gas_name, carbon_emission }) => {
              // 拿到所有的key
              gasNameMap[prpduce_gas_name] = 1;
              // 获取最后一级的links
              baseLink.push({
                props: { firstLevel: emissions_category },
                source: emission_source,
                target: prpduce_gas_name,
                value: carbon_emission,
              });
              totalCount += carbon_emission;
              // 中层 link 数值记录
              const unionKey = emissions_category + emission_source;
              // emissionSourceValueMap[emission_source] = carbon_emission;
              if (emissionSourceValueMap[unionKey]) {
                // eslint-disable-next-line operator-assignment
                emissionSourceValueMap[unionKey] =
                  emissionSourceValueMap[unionKey] + carbon_emission;
              } else {
                emissionSourceValueMap[unionKey] = carbon_emission;
              }
              // 记录第一层和第二层的关联关系
              if (!firstLinkMap[emissions_category]) {
                firstLinkMap[emissions_category] = [emission_source];
              } else {
                firstLinkMap[emissions_category] = uniq([
                  ...firstLinkMap[emissions_category],
                  emission_source,
                ]);
              }
            },
          );
        }
      },
    );

    const names = uniq(
      [...Object.entries(firstLinkMap), ...Object.keys(gasNameMap)].flat(99),
    );

    const secLinks: Links[] = Object.entries(firstLinkMap)
      .map(([key, value]) => {
        if (value.length > 1) {
          return value.map(v => ({
            source: key,
            target: v,
            value: emissionSourceValueMap[key + v],
          }));
        }
        return {
          source: key,
          target: value[0],
          value: emissionSourceValueMap[key + value[0]],
        };
      })
      .flat();

    // 如果第二层占比小于 1% 合并到一处
    let middleGasesLess: Links[] = [];
    let middleGases: Links[] = [];
    secLinks.forEach(item => {
      if (item.value > 0 && item.value / totalCount < 0.01) {
        middleGasesLess.push(item);
      } else {
        middleGases.push(item);
      }
    });
    middleGasesLess = differenceBy(middleGasesLess, middleGases, 'target');

    if (middleGasesLess.length <= 1) {
      middleGases = [...middleGases, ...middleGasesLess];
    } else {
      // 中间层合并到其它
      middleGasesLess.forEach(item => {
        otherGas.push({ ...item, target: otherGasName });
        if (middleGasesLessKey[item.target]) {
          // eslint-disable-next-line operator-assignment
          middleGasesLessKey[item.target] =
            middleGasesLessKey[item.target] + item.value;
        } else middleGasesLessKey[item.target] = item.value;
      });
      // 气体改为其它
      baseLink = baseLink.map(item => {
        if (middleGasesLessKey[item.source]) {
          return { ...item, source: otherGasName };
        }
        return item;
      });
    }
    // @ts-ignore
    series.data = uniq(
      names.map(item => {
        if (middleGasesLessKey[item]) {
          return otherGasName;
        }
        return item;
      }),
    ).map(name => ({
      name,
      itemStyle: {
        color: getRandomColor(),
      },
    }));
    // @ts-ignore
    series.links = compact([...baseLink, ...otherGas, ...middleGases]).map(
      link => ({ ...link, lineStyle: { color: getRandomColor() } }),
    );

    (res?.series as any).push(series);
    return res;
  }, [datas]);

  return <Echart option={options} style={{ width: '100%', height: '100%' }} />;
};
export default memo(PathMapChart);
