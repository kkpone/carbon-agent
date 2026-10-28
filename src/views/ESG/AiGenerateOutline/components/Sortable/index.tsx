/* eslint-disable */
import I18N from '@src/lang/I18N';
import React, { useEffect, useRef, useState } from 'react';
import Sortable from 'sortablejs';
import { parseMarkdownToTree } from './parseMarkdownToTree';
import { convertTreeToMarkdown } from './convertTreeToMarkdown';
import styles from './index.module.less';
import classNames from 'classnames';
import handleSvg from './image/handle.svg';
import { Input, Spin } from 'antd';
import {
  DeleteOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { uuid } from '@/utils';
import { postEditOutline } from '../../service';

interface TreeNode {
  id: string;
  title: string;
  description?: string;
  children?: TreeNode[];
}

let preScrollTop = 0;

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function findAndRemoveNode(tree: TreeNode[], id: string): TreeNode | null {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.id === id) {
      tree.splice(i, 1);
      return node;
    }
    if (node.children) {
      const result = findAndRemoveNode(node.children, id);
      if (result) return result;
    }
  }
  return null;
}

function findNodeByPath(tree: TreeNode[], path: string[]): TreeNode | null {
  let current: TreeNode | undefined;
  let nodes = tree;
  for (const id of path) {
    current = nodes.find(n => n.id === id);
    if (!current) return null;
    nodes = current.children || [];
  }
  return current || null;
}

function removeNodeById(tree: TreeNode[], id: string): boolean {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === id) {
      tree.splice(i, 1);
      return true;
    }
    if (tree[i].children && removeNodeById(tree[i].children!, id)) {
      return true;
    }
  }
  return false;
}

function editNodeTitleById(
  tree: TreeNode[],
  id: string,
  newTitle: string,
): boolean {
  for (const node of tree) {
    if (node.id === id) {
      node.title = newTitle;
      return true;
    }
    if (node.children && editNodeTitleById(node.children, id, newTitle)) {
      return true;
    }
  }
  return false;
}

function editNodeDescriptionById(
  tree: TreeNode[],
  id: string,
  newDescription: string,
): boolean {
  for (const node of tree) {
    if (node.id === id) {
      node.description = newDescription;
      return true;
    }
    if (
      node.children &&
      editNodeDescriptionById(node.children, id, newDescription)
    ) {
      return true;
    }
  }
  return false;
}

const TreeNodeItem: React.FC<{
  node: TreeNode;
  path: string[];
  onAdd: (path: string[]) => void;
  onDelete: (id: string) => void;
  onEditTitle?: (id: string, newTitle: string) => void;
  onEditDescription?: (id: string, newDescription: string) => void;
  onMove: (draggedId: string, newIndex: number, targetPath: string[]) => void;
  depth?: number;
}> = ({
  node,
  path,
  onAdd,
  onDelete,
  onMove,
  depth,
  onEditTitle,
  onEditDescription,
}) => {
  const containerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sortable = Sortable.create(containerRef.current, {
      group: 'nested',
      animation: 150,
      fallbackOnBody: true,
      swapThreshold: 0.65,
      handle: '.handle', // 只允许handle区域拖拽
      onAdd: evt => {
        const draggedId = evt.item.dataset.id!;
        onMove(draggedId, evt.newIndex!, path);

        // 手动还原DOM，防止React报错
        evt.from.insertBefore(evt.item, evt.from.children[evt.oldIndex!]);
      },
    });

    return () => sortable.destroy();
  }, [path]);

  const [titleFocus, setTitleFocus] = useState(false);
  const [descriptionFocus, setDescriptionFocus] = useState(false);

  const [description, setDescription] = useState(node.description || '');

  return (
    <li
      data-id={node.id}
      className={classNames(styles.treeNode, {
        [styles.wrapperBox]: depth === 0, // 根节点使用不同样式
        [styles.nestedNode]: depth !== 0, // 嵌套节点使用不同样式
      })}
    >
      <div
        style={{
          display: 'flex',
          gap: 4,
          alignItems: 'flex-start',
          // border: '1px solid #ccc',
          width: '100%',
          padding: '4px 0',
          borderRadius: 4,
          // marginBottom: 4,
        }}
      >
        <div
          className='handle'
          style={{
            width: 20,
            height: 20,
            // backgroundColor: '#888',
            cursor: 'grab',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={I18N.esg.dragTheHandle}
        >
          <img
            src={handleSvg}
            alt={I18N.esg.drag}
            style={{ width: 20, height: 20, cursor: 'grab' }}
          />
        </div>
        <div
          className={classNames(styles.nodeContent, {
            [styles.focus]: titleFocus || descriptionFocus,
          })}
        >
          {/* <span>{node.title}</span> */}
          <div className={styles.inputsWrapper}>
            <Input
              defaultValue={node.title}
              className={styles.titleInput}
              variant='borderless'
              onFocus={() => setTitleFocus(true)}
              onBlur={e => {
                setTimeout(() => {
                  setTitleFocus(false);
                }, 32);
                onEditTitle?.(node.id, e.target.value);
                if (
                  !e.target.value.trim() &&
                  !node.description?.length &&
                  !node.children?.length
                ) {
                  onDelete(node.id); // 如果标题和描述为空，直接删除
                }
              }}
            />
            {(!!node?.description?.length ||
              titleFocus ||
              descriptionFocus) && (
              <div
                className={classNames({
                  [styles.descriptionWrapper]:
                    description?.length === 0 &&
                    (descriptionFocus || titleFocus),
                })}
              >
                <Input.TextArea
                  autoSize={{ minRows: 1, maxRows: 10 }}
                  className={styles.descriptionInput}
                  style={{
                    resize: 'none',
                    fontSize: '12px',
                    lineHeight: '14px',
                    boxSizing: 'border-box',
                  }}
                  placeholder={I18N.esg.describeWithinThisParagraph}
                  onFocus={() => setDescriptionFocus(true)}
                  onBlur={e => {
                    setTimeout(() => {
                      setDescriptionFocus(false);
                    }, 32);
                    onEditDescription?.(node.id, e.target.value);
                    if (
                      !e.target.value.trim() &&
                      !node.title?.length &&
                      !node.children?.length
                    ) {
                      onDelete(node.id); // 如果标题和描述为空，直接删除
                    }
                  }}
                  onChange={e => setDescription(e.target.value)}
                  defaultValue={node.description}
                  variant='borderless'
                />
              </div>
            )}
          </div>
          <div className={styles.actions}>
            <span className={styles.action} onClick={() => onDelete(node.id)}>
              <DeleteOutlined />
            </span>
            <span className={styles.action} onClick={() => onAdd(path)}>
              <PlusOutlined />
            </span>
          </div>
        </div>
      </div>
      {!!node.children?.length && (
        <ul
          ref={containerRef}
          style={{
            paddingLeft: 20,
            width: '100%',
            // borderLeft: '1px dashed #ccc',
            minHeight: 10,
          }}
        >
          {node.children?.map(child => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={(depth || 0) + 1}
              path={[...path, child.id]}
              onAdd={onAdd}
              onEditTitle={onEditTitle}
              onEditDescription={onEditDescription}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const NestedTree: React.FC<{
  outline: string;
  id: number;
  loading: boolean;
  disabled: boolean;
  stopAutoScroll?: () => void;
}> = props => {
  const { outline, id, loading, disabled, stopAutoScroll } = props;
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [reportName, setReportName] = useState('');
  const [modified, setModified] = useState(false);

  useEffect(() => {
    if (loading) {
      setModified(false);
    }
  }, [loading]);

  useEffect(() => {
    const parsedTree = parseMarkdownToTree(outline);
    setTreeData(parsedTree[0]?.children || []);
    setReportName(parsedTree[0]?.title);
  }, [outline]);

  useEffect(() => {
    if (modified) {
      postEditOutline({
        id,
        outline: convertTreeToMarkdown([
          {
            id: uuid(),
            title: reportName,
            children: treeData,
          },
        ]),
      });
    }
  }, [treeData, reportName, modified]);

  const rootRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const sortable = Sortable.create(rootRef.current, {
      group: 'nested',
      animation: 150,
      fallbackOnBody: true,
      swapThreshold: 0.65,
      handle: '.handle', // 只允许handle区域拖拽
      onAdd: evt => {
        const draggedId = evt.item.dataset.id!;
        onMove(draggedId, evt.newIndex!, []);
        evt.from.insertBefore(evt.item, evt.from.children[evt.oldIndex!]);
      },
    });
    return () => sortable.destroy();
  }, []);

  const onAdd = (path: string[]) => {
    setTreeData(prev => {
      const newTree = structuredClone(prev);
      const parent = findNodeByPath(newTree, path);
      const list = parent ? (parent.children = parent.children || []) : newTree;
      list.push({
        id: generateId(),
        title: I18N.esg.newNode,
        children: [],
      });
      return newTree;
    });
  };

  const onDelete = (id: string) => {
    setTreeData(prev => {
      const newTree = structuredClone(prev);
      removeNodeById(newTree, id);
      return newTree;
    });
    setModified(true);
  };

  const onMove = (
    draggedId: string,
    newIndex: number,
    targetPath: string[],
  ) => {
    setTreeData(prev => {
      const newTree = structuredClone(prev);
      const draggedNode = findAndRemoveNode(newTree, draggedId);
      if (!draggedNode) return prev;
      const target = findNodeByPath(newTree, targetPath);
      const list = target ? (target.children = target.children || []) : newTree;
      list.splice(newIndex, 0, draggedNode);
      return newTree;
    });
  };

  const onEditTitle = (id: string, newTitle: string) => {
    setTreeData(prev => {
      const newTree = structuredClone(prev);
      editNodeTitleById(newTree, id, newTitle);
      return newTree;
    });
    setModified(true);
  };

  const onEditDescription = (id: string, newDescription: string) => {
    setTreeData(prev => {
      const newTree = structuredClone(prev);
      editNodeDescriptionById(newTree, id, newDescription);
      return newTree;
    });
    setModified(true);
  };

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.loading]: loading || disabled,
      })}
    >
      <div className={styles.tip}>{I18N.esg.wellDoItForYouFirst}</div>
      <Spin spinning={loading}>
        <div className={styles.titleWrapper}>
          <div className={styles.label}>{I18N.esg.title}</div>
          <Input
            variant='borderless'
            value={reportName}
            onChange={e => setReportName(e.target.value)}
            onFocus={() => setModified(false)}
            onBlur={() => setModified(true)}
            style={{
              fontSize: 16,
              color: '#04252B',
            }}
          ></Input>
        </div>
      </Spin>
      <ul
        ref={rootRef}
        className={styles.tree}
        onScroll={e => {
          const target = e.target as HTMLElement;
          if (preScrollTop && target.scrollTop < preScrollTop) {
            stopAutoScroll?.();
          }
          preScrollTop = target.scrollTop;
        }}
      >
        {treeData.map(node => (
          <TreeNodeItem
            key={node.id}
            node={node}
            depth={0}
            path={[node.id]}
            onAdd={onAdd}
            onEditTitle={onEditTitle}
            onEditDescription={onEditDescription}
            onDelete={onDelete}
            onMove={onMove}
          />
        ))}
      </ul>
      {!loading && (
        <div className={styles.addChapter} onClick={() => onAdd([])}>
          <PlusCircleOutlined />
          {I18N.esg.addChapter}
        </div>
      )}
      {/* <pre style={{ background: '#f6f6f6', padding: 12, marginTop: 20 }}>
        {JSON.stringify(treeData, null, 2)}
      </pre> */}
    </div>
  );
};

export default NestedTree;
