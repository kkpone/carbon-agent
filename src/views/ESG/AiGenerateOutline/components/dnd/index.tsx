import React, { useRef, useState } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';
import styles from './index.module.less';

import { Column } from './Column';
import { Item } from './Item';

export function Dnd() {
  const [items, setItems] = useState({
    A: ['A0', 'A1', 'A2'],
    B: ['B0', 'B1'],
    C: [],
  });
  const previousItems = useRef(items);
  const [columnOrder, setColumnOrder] = useState(() => Object.keys(items));

  return (
    <DragDropProvider
      onDragStart={() => {
        previousItems.current = items;
      }}
      onDragOver={event => {
        const { source } = event.operation;

        if (source?.type === 'column') return;

        setItems(items => move(items, event));
      }}
      onDragEnd={event => {
        const { source } = event.operation;

        if (event.canceled) {
          if (source?.type === 'item') {
            setItems(previousItems.current);
          }

          return;
        }

        if (source?.type === 'column') {
          setColumnOrder(columns => move(columns, event));
        }
      }}
    >
      <div className={styles.Root}>
        {columnOrder.map((column, columnIndex) => (
          <Column key={column} id={column} index={columnIndex}>
            {items[column].map((id, index) => (
              <Item key={id} id={id} index={index} column={column} />
            ))}
          </Column>
        ))}
      </div>
      <div
        onClick={() => {
          setItems(items => ({
            ...items,
            E: ['E0', 'E1', 'E2'],
          }));
          setColumnOrder(pre => [...pre, 'E']);
        }}
      >
        add
      </div>
    </DragDropProvider>
  );
}
