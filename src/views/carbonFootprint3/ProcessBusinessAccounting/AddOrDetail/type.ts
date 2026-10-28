import { Key } from 'react';

export type ProcessBusinessAccountingAddOrDetailProps = {
  /** 是否可以编辑 */
  isEdit?: boolean;
  /** id详情 */
  id?: string;
};

export type UrlListTreeData = {
  selectKey: Key[];
  expandedKeys: Key[];
};
