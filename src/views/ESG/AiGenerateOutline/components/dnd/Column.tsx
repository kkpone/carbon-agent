import { CollisionPriority } from '@dnd-kit/abstract';
import { useSortable } from '@dnd-kit/react/sortable';
import styles from './index.module.less';
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers';

export function Column({ children, id, index }) {
  const { ref, handleRef } = useSortable({
    id,
    index,
    type: 'column',
    collisionPriority: CollisionPriority.Low,
    accept: ['item', 'column'],
    modifiers: [RestrictToVerticalAxis],
  });

  return (
    <div className={styles.Column} ref={ref}>
      <div ref={handleRef} className={styles.Handle}>
        handle
      </div>
      {children}
    </div>
  );
}
