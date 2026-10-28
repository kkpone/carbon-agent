import { BatchFile, ReferTreeNode } from './type';

export const formatDateTime = (date?: string) => {
  if (!date) {
    return undefined;
  }
  return date.length === 10 ? `${date} 00:00:00` : date;
};

export const getFileType = (fileName?: string) =>
  fileName?.split('.').pop()?.toLocaleLowerCase() || '';

export const getFileKey = (file: BatchFile) =>
  `${file.name || ''}_${file.url || ''}`;

export const isSameFile = (left: BatchFile, right: BatchFile) =>
  (!!left.url && left.url === right.url) ||
  (!!left.name && left.name === right.name);

export const uniqueFiles = (files: BatchFile[]) => {
  const map = new Map<string, BatchFile>();
  files.forEach(file => {
    if (file?.url || file?.name) {
      map.set(getFileKey(file), file);
    }
  });
  return [...map.values()];
};

export const isEmissionEmpty = (emissionTotal?: string) => {
  if (
    emissionTotal === undefined ||
    emissionTotal === null ||
    emissionTotal === ''
  ) {
    return true;
  }
  return Number(emissionTotal) === 0;
};

export const formatDate = (date?: string) => {
  if (!date) {
    return '-';
  }
  return date.slice(0, 10).replace(/-/g, '.');
};

export const formatDateRange = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) {
    return '-';
  }
  return `${formatDate(startTime)}-${formatDate(endTime)}`;
};

export const groupFilesByLevel = (files: BatchFile[] = []) => {
  const map = new Map<string, BatchFile[]>();
  files.forEach(file => {
    const level = file.level || '1';
    map.set(level, [...(map.get(level) || []), file]);
  });
  return map;
};

export const getSortedFileLevels = (files: BatchFile[] = []) => {
  const levels = [...groupFilesByLevel(files).keys()];
  return levels.sort((left, right) => Number(left) - Number(right));
};

export const flattenReferTree = (tree: ReferTreeNode[] = []) => {
  const result: ReferTreeNode[] = [];
  const loop = (nodes: ReferTreeNode[]) => {
    nodes.forEach(node => {
      result.push(node);
      if (node.children?.length) {
        loop(node.children);
      }
    });
  };
  loop(tree);
  return result;
};

export const findReferNode = (
  tree: ReferTreeNode[] = [],
  referId?: number,
): ReferTreeNode | undefined => {
  if (!referId) {
    return undefined;
  }
  let matched: ReferTreeNode | undefined;
  tree.find(node => {
    if (node.id === referId || node.referId === referId) {
      matched = node;
      return true;
    }
    const child = findReferNode(node.children, referId);
    if (child) {
      matched = child;
      return true;
    }
    return false;
  });
  return matched;
};

/** 是否为 T2 及以上层级节点（可拖为 T1） */
export const isT2OrAbove = (node: ReferTreeNode) => (node.level ?? 1) > 1;

/** 判断 referId 是否为 ancestorReferId 对应节点的子孙 */
export const isReferDescendantOf = (
  tree: ReferTreeNode[] = [],
  ancestorReferId: number,
  referId: number,
): boolean => {
  const ancestor = findReferNode(tree, ancestorReferId);
  if (!ancestor?.children?.length) {
    return false;
  }
  const walk = (nodes: ReferTreeNode[]): boolean =>
    nodes.some(node => {
      const nodeReferId = node.referId || node.id;
      if (nodeReferId === referId) {
        return true;
      }
      return node.children?.length ? walk(node.children) : false;
    });
  return walk(ancestor.children);
};

/** 查找节点的直接父节点 referId */
export const findReferParentReferId = (
  tree: ReferTreeNode[] = [],
  referId: number,
): number | undefined => {
  let parentReferId: number | undefined;
  const walk = (nodes: ReferTreeNode[], parent?: ReferTreeNode): boolean =>
    nodes.some(node => {
      const nodeReferId = node.referId || node.id;
      if (nodeReferId === referId) {
        parentReferId = parent ? parent.referId || parent.id : undefined;
        return true;
      }
      return node.children?.length ? walk(node.children, node) : false;
    });
  walk(tree);
  return parentReferId;
};

/** move/copy 无效目标：自身、直接父节点（等同未移动）或自身子孙 */
export const isInvalidMoveCopyTarget = (
  tree: ReferTreeNode[] = [],
  sourceReferId: number,
  targetReferId: number,
): boolean => {
  if (sourceReferId === targetReferId) {
    return true;
  }
  const parentReferId = findReferParentReferId(tree, sourceReferId);
  if (parentReferId !== undefined && parentReferId === targetReferId) {
    return true;
  }
  return isReferDescendantOf(tree, sourceReferId, targetReferId);
};

/** 更新树节点展示字段（功能单位、AI 补全标识等） */
export const updateReferTreeNode = (
  tree: ReferTreeNode[] = [],
  match: { tmpId?: number; referId?: number },
  patch: Partial<Pick<ReferTreeNode, 'accountName' | 'aiFill'>>,
): ReferTreeNode[] => {
  const isMatched = (node: ReferTreeNode) => {
    if (match.tmpId !== undefined && node.tmpId === match.tmpId) {
      return true;
    }
    if (match.referId !== undefined) {
      const nodeReferId = node.referId || node.id;
      return nodeReferId === match.referId;
    }
    return false;
  };

  const loop = (nodes: ReferTreeNode[]): ReferTreeNode[] =>
    nodes.map(node => {
      const children = node.children?.length
        ? loop(node.children)
        : node.children;
      return isMatched(node)
        ? { ...node, ...patch, children }
        : { ...node, children };
    });

  return loop(tree);
};
