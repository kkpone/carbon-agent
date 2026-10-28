import { LoadingOutlined } from '@ant-design/icons';
import { PreviewText } from '@formily/antd-v5';
import { connect, mapProps, mapReadPretty } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Input as AntdInput } from 'antd';
import type { InputProps, TextAreaProps } from 'antd/lib/input';
import React from 'react';

type ComposedInput = React.FC<React.PropsWithChildren<InputProps>> & {
  TextArea?: React.FC<React.PropsWithChildren<TextAreaProps>>;
};

type CustomInputProps = InputProps & {
  hideValue?: boolean;
  customHidePlaceholder?: string;
};

const CustomInputComponent = (props: CustomInputProps) => {
  const {
    customHidePlaceholder = I18N.carbonFootprint3.notDisplayedTemporarily,
    hideValue,
    ...otherProps
  } = props;
  if (hideValue) {
    return <AntdInput disabled value={customHidePlaceholder} />;
  }
  return <AntdInput {...otherProps} />;
};

// @ts-ignore
export const CustomInput: ComposedInput = connect(
  CustomInputComponent,
  mapProps((props, field) => ({
    ...props,
    suffix: (
      <span>
        {/* @ts-ignore */}
        {field?.loading || field?.validating ? (
          <LoadingOutlined />
        ) : (
          props.suffix
        )}
      </span>
    ),
  })),
  mapReadPretty((props: CustomInputProps) => {
    const {
      customHidePlaceholder = I18N.carbonFootprint3.notDisplayedTemporarily,
      hideValue,
      value,
    } = props;
    if (hideValue) {
      return <PreviewText.Input value={customHidePlaceholder} />;
    }
    return <PreviewText.Input value={value} />;
  }),
);

CustomInput.TextArea = connect(
  AntdInput.TextArea,
  mapReadPretty(PreviewText.Input),
);
