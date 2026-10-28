import classNames from 'classnames';

import styles from './index.module.less';

export const TreeTitle = (
  name: string,
  count: number | string,
  indentation?: boolean,
  redDot?: boolean,
) => {
  const names = name.split('：');
  let realName = '';
  let category = '';
  if (names.length > 1) {
    [category, realName] = names;
  } else {
    realName = name;
  }
  return (
    <>
      <div
        className={classNames(styles.treeTitle, {
          [styles.indentation]: indentation,
        })}
      >
        <div
          className={classNames(styles.title, {
            [styles.redDot]: redDot,
          })}
        >
          {realName}
        </div>
        <div className={styles.count}>{count}</div>
      </div>
      <div className={styles.category}>{category}</div>
    </>
  );
};
