import { connect } from '@formily/react';
import MaterialTextField, { TextFieldProps } from '@mui/material/TextField';
import React from 'react';

type ComposedInput = React.FC<
  React.PropsWithChildren<Omit<TextFieldProps, 'variant'>>
>;

// @ts-ignore
const TextField: ComposedInput = connect(
  MaterialTextField,
  // mapReadPretty(PreviewText.Input)
);

// Input.TextArea = connect(AntdInput.TextArea, mapReadPretty(PreviewText.Input))

export default TextField;
