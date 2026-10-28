/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-07 09:46:41
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-06 17:25:34
 */
import G6, { Tooltip } from '@antv/g6';

import styles from './index.module.less';
import './index.less';

export const tooltip = (
  cfg?: ReturnType<(typeof Tooltip)['prototype']['getDefaultCfgs']>,
) =>
  new G6.Tooltip({
    // offsetX: 10,
    offsetY: 20,
    getContent(e) {
      if (!e || !e.target) {
        return '';
      }
      const outDiv = document.createElement('div');
      outDiv.className = styles.tooltip;
      outDiv.innerHTML = e.target.cfg.attrs.tooltipText;
      return outDiv;
    },
    itemTypes: ['node'],
    shouldBegin(evt) {
      if (!evt || !evt.target) {
        return false;
      }

      return !!evt.target.cfg.attrs.showTooltip;
    },
    ...cfg,
  });
