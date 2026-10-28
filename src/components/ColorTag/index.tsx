/**
 * @description tag（颜色小球 + 文字）
 */
import styles from './index.module.less';

/** 标签颜色 */
export const COLOR = {
  grey: '#999EA4',
  blue: '#3491FA',
  lightBlue: '#87C7FF',
  yellow: '#FFBF7A',
  orange: '#FF6900',
  green: '#0CBF9F',
  red: '#ED5555',
  pink: '#FFB3AD',
  lightGrey: '#B5B8BB',
};

export const ColorTag = ({
  color,
  text,
}: {
  color: keyof typeof COLOR | string;
  text?: string;
}) => {
  if (!text) {
    return <div>-</div>;
  }

  const backgroundColor =
    color in COLOR
      ? COLOR[color as keyof typeof COLOR]
      : color || COLOR.lightGrey;

  return (
    <div className={styles.colorTagWrapper}>
      <div
        className={styles.cycleWrapper}
        style={{ background: backgroundColor }}
      />
      <span className={styles.textWrapper}>{text}</span>
    </div>
  );
};
