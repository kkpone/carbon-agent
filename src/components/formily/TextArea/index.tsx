/**
 * @description formily TextArea
 */
import { connect, mapReadPretty } from '@formily/react';
import { Input as AntdInput } from 'antd';
import { CSSProperties } from 'react';

const Text = (props: {
  value?: string;
  style?: CSSProperties;
  rows?: number;
}) => (
  <AntdInput.TextArea
    disabled
    {...props}
    value={props.value || '-'}
    style={{ ...props.style, color: '#333', border: 'none' }}
  />
);

export const TextArea = connect(AntdInput.TextArea, mapReadPretty(Text));
