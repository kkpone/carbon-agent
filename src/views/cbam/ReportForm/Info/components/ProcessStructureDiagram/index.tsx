/**
 * @description 连接图
 */

import G6 from '@antv/g6';
import { useEffect, useMemo } from 'react';

import style from './index.module.less';
import TreeGraph from './treeGraph';
import { registerNodeG6 } from './utils';
import { EdgeResultDTO } from '../../../type';

const ProcessStructureDiagram = ({ data }: { data?: EdgeResultDTO }) => {
  const graphRef: { instance: any } = useMemo(() => ({ instance: null }), []);

  const tooltip = new G6.Tooltip({
    offsetX: 10,
    offsetY: 10,
    fixToNode: [1, 0.5],
    // the types of items that allow the tooltip show up
    // 允许出现 tooltip 的 item 类型
    itemTypes: ['node', 'edge'],
    // custom the tooltip's content
    // 自定义 tooltip 内容
    getContent: (e: any) => {
      const outDiv = document.createElement('div');
      outDiv.style.width = 'fit-content';
      outDiv.style.height = 'fit-content';
      const model = e.item?.getModel();
      if (e.item?.getType() === 'node') {
        outDiv.innerHTML = `${model?.label || '-'}`;
      } else {
        const source = e.item.getSource();
        const target = e.item.getTarget();
        outDiv.innerHTML = `${source?.getModel?.()?.label || '-'} ---> ${
          target?.getModel?.()?.label || '-'
        }`;
      }
      return outDiv;
    },
  });

  registerNodeG6();

  useEffect(() => {
    if (!graphRef.instance && data) {
      graphRef.instance = new TreeGraph({
        container: 'processStructureDiagram',
        plugins: [tooltip],
      });

      graphRef.instance!.setData(data);
    }
  }, [data]);

  return (
    <div className={style.graphBoxMain}>
      <div className={style.graphBox} id='processStructureDiagram' />
    </div>
  );
};

export default ProcessStructureDiagram;
