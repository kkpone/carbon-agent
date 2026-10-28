import React, { CSSProperties } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { AnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './SortableTreeItem.module.css';

import { TreeItem, Props as TreeItemProps } from './TreeItem';
import { iOS } from '../../utilities';
import classNames from 'classnames';

interface Props extends TreeItemProps {
  id: UniqueIdentifier;
  childrenLength?: number;
}

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true);

export function SortableTreeItem({ id, depth, ...props }: Props) {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  if (depth === 0 && !props.collapsed) {
  }

  return (
    <div
      className={classNames(styles.SortableTreeItem, {
        [styles.isWrapping]: depth === 0 && !props.collapsed,
      })}
    >
      <TreeItem
        ref={setDraggableNodeRef}
        wrapperRef={setDroppableNodeRef}
        style={style}
        depth={depth}
        ghost={isDragging}
        disableSelection={iOS}
        disableInteraction={isSorting}
        handleProps={{
          ...attributes,
          ...listeners,
        }}
        {...props}
      />
      {depth === 0 && !props.collapsed && !isDragging && (
        <div
          className={styles.childrenLength}
          style={{
            height: `${props.childrenLength ? props.childrenLength * 49 : 0}px`,
          }}
        >
          {/* {props.childrenLength ? `Children: ${props.childrenLength}` : 'No children'} */}
        </div>
      )}
    </div>
  );
}
