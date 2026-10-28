/*
 * @@description:
 * @Author: ljh255 jinhai@carbonstop.net
 * @Date: 2023-03-20 10:25:12
 * @LastEditors: ljh255 jinhai@carbonstop.net
 * @LastEditTime: 2023-03-28 16:35:34
 */
// import { Input } from '@formily/antd';
import { connect, mapReadPretty } from '@formily/react';
import { Input as AntdInput } from 'antd';
import { CSSProperties } from 'react';

const Text = function (props: {
  value: string | number | readonly string[] | undefined;
  style: CSSProperties | undefined;
}) {
  return (
    <AntdInput.TextArea
      disabled
      value={props.value || '-'}
      style={{ ...props.style, color: '#333', border: 'none' }}
    />
  );
};
export const TextArea = connect(AntdInput.TextArea, mapReadPretty(Text));
