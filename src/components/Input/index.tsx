/**
 * @file 补充 ant input 样式
 */
import { Input as InputAnt, InputProps, Tooltip } from 'antd';
import { TextAreaProps } from 'antd/es/input/TextArea';
import classNames from 'classnames';

import styles from './index.module.less';
import { AntdAddedType } from './type';

export type NewInputProps = InputProps & AntdAddedType;

export const Input = ({
  readonly,
  disabled,
  className,
  withTooltip,
  ...props
}: NewInputProps) => (
  <Tooltip title={withTooltip ? props.value : ''}>
    {/* 为什么多加一个 span https://github.com/react-component/tooltip/issues/18#issuecomment-411476678 */}
    <span>
      <InputAnt
        {...props}
        disabled={readonly || disabled}
        className={classNames(className, {
          [styles.inputDisabled]: disabled,
          [styles.inputReadonly]: readonly,
        })}
      />
    </span>
  </Tooltip>
);

export type NewTextAreaProps = AntdAddedType & TextAreaProps;
export const TextArea = ({
  readonly,
  disabled,
  className,
  ...props
}: NewTextAreaProps) => (
  <InputAnt.TextArea
    {...props}
    disabled={readonly || disabled}
    className={classNames(className, {
      [styles.inputDisabled]: disabled,
      [styles.inputReadonly]: readonly,
    })}
  />
);
