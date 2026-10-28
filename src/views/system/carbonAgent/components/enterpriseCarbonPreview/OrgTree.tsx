import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';

import I18N from '@/lang/I18N';
import { ORG_TYPE } from '@/views/enterpriseCarbonAccount2/constant';

import orgGroupIcon from './assets/org-group-icon.svg';
import orgMainIcon from './assets/org-main-icon.svg';
import orgPanelCollapseIcon from './assets/org-panel-collapse.svg';
import orgRootIcon from './assets/org-root-icon.svg';
import orgToggleArrowIcon from './assets/org-toggle-arrow.svg';
import styles from './index.module.less';
import type { EnterpriseCarbonOrgNode } from './types';

type OrgTreeProps = {
  activeOrgId?: string;
  collapsed?: boolean;
  treeData?: EnterpriseCarbonOrgNode[];
  onCollapsedChange?: (collapsed: boolean) => void;
  onSelect: (node: EnterpriseCarbonOrgNode) => void;
};

const getOrgNodeKey = (node: EnterpriseCarbonOrgNode) => node.orgId || node.id;

const isMainPartOrgNode = (node: EnterpriseCarbonOrgNode) =>
  Number(node.orgType) === ORG_TYPE.MAIN_PART;

const getExpandableOrgNodeKeys = (nodes: EnterpriseCarbonOrgNode[] = []) =>
  nodes.reduce<string[]>((keys, node) => {
    if (node.children?.length) {
      keys.push(getOrgNodeKey(node));
      keys.push(...getExpandableOrgNodeKeys(node.children));
    }

    return keys;
  }, []);

const getNodeIndent = (depth: number, hasChildren: boolean) => {
  if (depth === 0) {
    return 0;
  }

  if (hasChildren) {
    return 12;
  }

  return 8;
};

const getOrgNodeIcon = ({
  isGroup,
  isRoot,
}: {
  isGroup: boolean;
  isRoot: boolean;
}) => {
  if (isRoot) {
    return orgRootIcon;
  }

  if (isGroup) {
    return orgGroupIcon;
  }

  return orgMainIcon;
};

const OrgTreeNode = ({
  activeOrgId,
  depth,
  expandedKeys,
  node,
  onCollapsedChange,
  onSelect,
  onToggle,
}: {
  activeOrgId?: string;
  depth: number;
  expandedKeys: Set<string>;
  node: EnterpriseCarbonOrgNode;
  onCollapsedChange?: (collapsed: boolean) => void;
  onSelect: (node: EnterpriseCarbonOrgNode) => void;
  onToggle: (key: string) => void;
}) => {
  const nodeKey = getOrgNodeKey(node);
  const hasChildren = Boolean(node.children?.length);
  const expanded = expandedKeys.has(nodeKey);
  const selected = activeOrgId === nodeKey || activeOrgId === node.orgId;
  const isRoot = depth === 0;
  const isGroup = !isRoot && hasChildren;
  const isLeaf = !hasChildren && !isRoot;
  const selectable = isMainPartOrgNode(node);
  const orgName = node.orgName || node.name;

  return (
    <div
      className={classNames(styles.orgTreeNode, {
        [styles.orgTreeNodeRoot]: isRoot,
      })}
    >
      <div
        className={classNames(styles.orgTreeItem, {
          [styles.orgTreeItemRoot]: isRoot,
          [styles.orgTreeItemGroup]: isGroup,
          [styles.orgTreeItemLeaf]: isLeaf,
          [styles.orgTreeItemActive]: selected,
        })}
        style={
          {
            '--org-tree-indent': `${getNodeIndent(depth, hasChildren)}px`,
          } as CSSProperties
        }
      >
        {hasChildren && !isRoot ? (
          <button
            className={styles.orgTreeToggle}
            aria-label={
              expanded
                ? I18N.carbonAgent.enterpriseCarbonCollapseOrganizationNode
                : I18N.carbonAgent.enterpriseCarbonExpandOrganizationNode
            }
            type='button'
            onClick={() => onToggle(nodeKey)}
          >
            <span
              className={classNames(styles.orgTreeToggleIcon, {
                [styles.orgTreeToggleIconExpanded]: expanded,
              })}
            >
              <img alt='' src={orgToggleArrowIcon} />
            </span>
          </button>
        ) : null}
        <button
          className={classNames(styles.orgTreeSelectButton, {
            [styles.orgTreeSelectButtonRoot]: isRoot,
            [styles.orgTreeSelectButtonDisabled]: !selectable,
          })}
          aria-disabled={!selectable}
          tabIndex={selectable ? undefined : -1}
          title={orgName}
          type='button'
          onClick={() => {
            if (selectable) {
              onSelect(node);
            }
          }}
        >
          <span className={styles.orgTreeIcon}>
            <img alt='' src={getOrgNodeIcon({ isGroup, isRoot })} />
          </span>
          <span
            className={classNames(styles.orgTreeName, {
              [styles.orgTreeNameRoot]: isRoot,
              [styles.orgTreeNameGroup]: isGroup,
            })}
          >
            {orgName}
          </span>
        </button>
        {isRoot && onCollapsedChange ? (
          <button
            className={styles.orgTreeRootToggle}
            aria-label={
              I18N.carbonAgent.enterpriseCarbonCollapseOrganizationTree
            }
            type='button'
            onClick={() => onCollapsedChange(true)}
          >
            <img alt='' src={orgPanelCollapseIcon} />
          </button>
        ) : null}
      </div>
      {hasChildren && expanded ? (
        <div className={styles.orgTreeChildren}>
          {node.children?.map(child => (
            <OrgTreeNode
              activeOrgId={activeOrgId}
              depth={depth + 1}
              expandedKeys={expandedKeys}
              key={getOrgNodeKey(child)}
              node={child}
              onCollapsedChange={onCollapsedChange}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const OrgTree = ({
  activeOrgId,
  collapsed = false,
  treeData = [],
  onCollapsedChange,
  onSelect,
}: OrgTreeProps) => {
  const initialExpandedKeys = useMemo(
    () => getExpandableOrgNodeKeys(treeData),
    [treeData],
  );
  const [expandedKeys, setExpandedKeys] = useState(
    () => new Set(initialExpandedKeys),
  );

  useEffect(() => {
    setExpandedKeys(new Set(initialExpandedKeys));
  }, [initialExpandedKeys]);

  const handleToggle = (key: string) => {
    setExpandedKeys(prevKeys => {
      const nextKeys = new Set(prevKeys);

      if (nextKeys.has(key)) {
        nextKeys.delete(key);
      } else {
        nextKeys.add(key);
      }

      return nextKeys;
    });
  };

  if (!treeData.length) {
    return (
      <div className={styles.orgTreeEmpty}>
        {I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
      </div>
    );
  }

  if (collapsed) {
    const [rootNode] = treeData;
    const rootName = rootNode ? rootNode.orgName || rootNode.name : '';

    return (
      <button
        className={styles.orgTreeCollapsedButton}
        aria-label={I18N.carbonAgent.enterpriseCarbonExpandOrganizationTree}
        title={rootName}
        type='button'
        onClick={() => onCollapsedChange?.(false)}
      >
        <img alt='' src={orgRootIcon} />
      </button>
    );
  }

  return (
    <div className={styles.orgTree}>
      {treeData.map(node => (
        <OrgTreeNode
          activeOrgId={activeOrgId}
          depth={0}
          expandedKeys={expandedKeys}
          key={getOrgNodeKey(node)}
          node={node}
          onCollapsedChange={onCollapsedChange}
          onSelect={onSelect}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
};

export { getOrgNodeKey };
export default OrgTree;
