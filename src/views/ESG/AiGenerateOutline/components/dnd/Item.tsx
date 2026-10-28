import { useSortable } from '@dnd-kit/react/sortable';
import styles from './index.module.less';
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers';

export function Item({ id, index, column }) {
  const { ref, isDragging, handleRef } = useSortable({
    id,
    index,
    type: 'item',
    accept: 'item',
    group: column,
    modifiers: [RestrictToVerticalAxis],
  });

  return (
    <button
      type='button'
      className={styles.Item}
      ref={ref}
      data-dragging={isDragging}
    >
      <div ref={handleRef}>sdfafd</div>
      {id}
    </button>
  );
}
