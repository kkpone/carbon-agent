/*
 * @@description:
 * @Author: ljh255 jinhai@carbonstop.net
 * @Date: 2023-03-20 10:25:12
 * @LastEditors: ljh255 jinhai@carbonstop.net
 * @LastEditTime: 2023-03-28 16:35:34
 */
// import { Input } from '@formily/antd';
import { Checkbox, PreviewText, Radio } from '@formily/antd';
import { connect, mapReadPretty } from '@formily/react';
import {
  Input as AntdInput,
  Input,
  Radio as AntdRadio,
  Checkbox as AntdCheckBox,
} from 'antd';
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

export const InputText = (props: { initialValue: string }) => (
  <Input
    value={props.initialValue}
    disabled
    style={{ border: 'none', color: '#333' }}
  />
);
export const CousInputText = connect(
  InputText,
  mapReadPretty(PreviewText.Input),
);

const RadioPrew = function (props: {
  value: string | number | readonly string[] | undefined;
  style: CSSProperties | undefined;
  options: { label: string; value: string }[];
}) {
  return (
    <AntdRadio.Group
      disabled
      options={props.options}
      value={props.value}
      style={{ ...props.style, color: '#333', border: 'none' }}
    />
  );
};
export const CousRadio = connect(
  Radio?.Group || Radio,
  mapReadPretty(RadioPrew),
);

const CheckBosPrew = function (props: {
  value: string[] | number[] | readonly string[] | undefined[];
  style: CSSProperties | undefined;
  options: { label: string; value: string }[];
}) {
  return (
    <AntdCheckBox.Group
      disabled
      options={props.options}
      // @ts-ignore
      value={props.value}
      style={{ ...props.style, color: '#333', border: 'none' }}
    />
  );
};
export const CousCheckBox = connect(
  Checkbox?.Group || Radio,
  mapReadPretty(CheckBosPrew),
);
