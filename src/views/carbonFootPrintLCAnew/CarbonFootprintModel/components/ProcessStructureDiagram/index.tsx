/**
 * @description 过程结构图
 */
import { Graph, GraphData } from 'g6-5';
import { useEffect, useRef } from 'react';

import styles from './index.module.less';

const ProcessStructureDiagram = ({
  diagramData,
}: {
  diagramData: GraphData;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !diagramData) return;

    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    const graph = new Graph({
      container: containerRef.current,
      width,
      height,
      autoFit: 'view',
      data: diagramData,
      background: '#f7f8f9',
      node: {
        type: 'rect',
        style: {
          labelText: d => d?.label as string,
          labelPlacement: 'center',
          labelFontSize: 8,
          labelWordWrap: true,
          labelMaxWidth: '90%',
          labelMaxLines: 2,
          labelTextOverflow: 'ellipsis',
          labelLeading: -3,
          size: [80, 40],
          radius: 8,
          port: true,
          ports: [
            {
              key: 'top',
              placement: [0.55, 0],
              // r: 3,
              // stroke: '#31d0c6',
              // fill: '#fff',
            },
            {
              key: 'bottom',
              placement: [0.55, 1],
              // r: 3,
              // stroke: '#31d0c6',
              // fill: '#fff',
            },
          ],
        },
        palette: {
          field: d => d.combo as any,
        },
      },
      edge: {
        type: 'cubic-horizontal',
        style: {
          sourcePort: 'bottom',
          targetPort: 'top',
          endArrow: true,
        },
      },
      combo: {
        type: 'rect',
        style: {
          radius: 8,
          padding: 15,
          labelText: d => d.id,
          labelFontSize: 8,
          labelWordWrap: true,
          labelMaxWidth: '100%',
          labelMaxLines: 6,
          labelTextOverflow: 'ellipsis',
          labelOffsetY: 2,
        },
      },
      layout: {
        type: 'antv-dagre',
        ranksep: 60,
        nodesep: 40,
        sortByCombo: true,
        preventOverlap: true,
      },
      plugins: [
        {
          type: 'minimap',
        },
        {
          type: 'tooltip',
          getContent: (_e: any, items: { label: string }[]) => {
            let result = ``;
            items.forEach(item => {
              result += `<p>${item.label || '-'}</p>`;
            });
            return result;
          },
        },
      ],
      behaviors: [
        'drag-element',
        'drag-canvas',
        'zoom-canvas',
        'hover-activate',
        {
          type: 'hover-activate',
          degree: 1,
        },
      ],
    });

    graph.render();
  }, []);

  return (
    <div className={styles.viewBox}>
      <div ref={containerRef} className={styles.contain} />
    </div>
  );
};

export default ProcessStructureDiagram;
