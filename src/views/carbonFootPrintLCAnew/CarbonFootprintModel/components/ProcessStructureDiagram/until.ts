import { GraphData } from '@antv/g6';

import { StructureChartResp } from '../../type';

/** 转换流程图数据 */
export const transformData = (initData: StructureChartResp) => {
  if (!initData) return undefined;

  const initNodes = initData?.nodes || [];
  const initEdges = initData?.edges || [];

  if (initNodes?.length === 0) return undefined;

  const nodes = initNodes?.map(node => ({
    id: node.id,
    label: node.label,
    combo: node.lifeCycle,
  }));

  const edges = initEdges?.map((edge, index) => {
    const source = edge?.source?.cell;
    const target = edge?.target?.cell;
    const sourceLabel = initNodes?.find(node => node.id === source)?.label;
    const targetLabel = initNodes?.find(node => node.id === target)?.label;

    return {
      id: `${index}${source}${target}`,
      source,
      target,
      label: `${sourceLabel} --> ${targetLabel}`,
    };
  });

  const combos = Array.from(new Set(initNodes.map(node => node.lifeCycle))).map(
    combo => ({
      id: combo,
      label: combo,
      style: {
        type: 'rect',
      },
    }),
  );

  return {
    nodes,
    edges,
    combos,
  } as GraphData;
};
