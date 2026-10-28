/**
 * @description 信息标题
 * @description 可左侧边显示border + 文案 + 右侧自定义渲染内容
 */

import classNames from 'classnames';

import styles from './index.module.less';

export const InfoTitle = ({
  title,
  rightRender,
  isFormily = false,
  borderLeft = true,
  ...props
}: {
  /** 标题 */
  title: string;
  /** 右边渲染内容 */
  rightRender?: React.ReactNode;
  /** 是否是Formily表单组件(影响样式) */
  isFormily?: boolean;
  /** 是否显示左边border */
  borderLeft?: boolean;
  className?: string;
}) => (
  <div
    {...props}
    className={classNames(
      styles.titleWrapper,
      {
        [styles.formilyFileTitle]: isFormily,
        [styles.borderLeft]: borderLeft,
      },
      props.className,
    )}
  >
    <div>{title}</div>
    {rightRender}
  </div>
);
