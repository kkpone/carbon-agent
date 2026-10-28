import { IG6GraphEvent, IGraph } from '@antv/g6';

import { registerNode } from './register';

export const registerNodeG6 = () => {
  registerNode();
};

export const calcTextWidth = (
  value: string,
  font = 'normal 500 14px sans-serif',
) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.font = font;
  const { width } = context.measureText(value);
  return width;
};

// fixme 目前还是一个简版，后续需要再完善
/** 自动文字省略显示 */
export const textEllipsis = (
  text: string | number,
  maxWidth: number,
  fontSize?: number,
  fonts?: string,
) => {
  const font = fonts ?? `normal 500 ${fontSize ?? 14}px sans-serif`;
  const endSuffix = '...';
  const ellipsisWidth = calcTextWidth(endSuffix, font) || 0;
  // 超出最小长度
  const calcMaxWidth = Math.floor(maxWidth - ellipsisWidth);
  if (calcMaxWidth <= 0) return '';
  let newText = String(text);
  const textWidth = calcTextWidth(newText, font) ?? 0;
  // 小于最大长度，直接返回文字
  if (maxWidth >= textWidth) {
    return text;
  }

  let overSizeWidth = textWidth - calcMaxWidth;
  while (overSizeWidth > 0) {
    const overSizeRate = overSizeWidth / calcMaxWidth;
    const safeRate = 1.1;
    if (overSizeRate > safeRate) {
      newText = newText.slice(
        0,
        -1 *
          Math.floor(
            (newText.length / overSizeRate) * (overSizeRate - safeRate),
          ),
      );
      const newWidth = calcTextWidth(newText, font) ?? 0;
      overSizeWidth = Math.ceil(newWidth - calcMaxWidth);
    } else {
      newText = newText.slice(0, -1);
      const newWidth = calcTextWidth(newText, font) ?? 0;
      overSizeWidth = Math.ceil(newWidth - calcMaxWidth);
    }
  }
  return newText + endSuffix;
};

/** antv wheel 事件处理：双指移动、双指放大 */
export const graphWheelEvent = (ev: IG6GraphEvent, graph: IGraph) => {
  const sensitivity = 0.6;
  const { ctrlKey } = ev;
  if (ctrlKey) {
    // zoom
    const sensitivity = 3;
    const canvas = graph.get('canvas');
    const point = canvas.getPointByClient(ev.clientX, ev.clientY);
    let ratio = graph.getZoom();

    if (ev.wheelDelta > 0) {
      ratio *= 1 + 0.1 * sensitivity;
    } else {
      ratio *= 1 - 0.1 * sensitivity;
    }
    if (ratio < 0.2) {
      ratio = 0.2;
    }
    graph.zoomTo(
      ratio,
      {
        x: point.x,
        y: point.y,
      },
      true,
      {
        duration: 50,
      },
    );
  } else {
    // move
    const safetyNum = (num: any) => Number(num) || 0;

    graph.translate(
      safetyNum(ev.wheelDeltaX) * sensitivity,
      safetyNum(ev.wheelDeltaY) * sensitivity,
    );
  }

  ev.preventDefault();
  ev.stopPropagation();
};
