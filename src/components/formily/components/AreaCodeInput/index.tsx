import { connect, mapProps } from '@formily/react';
import { AreaCode } from '@src/views/system/login/component/PhoneNumber/AreaCode';
import { Input } from 'antd';
import React from 'react';

interface AreaCodeInputProps {
  // define your props here
  value: {
    areaCode: string;
    phone_number: string;
  };
  onChange: (value: { areaCode: string; phone_number: string }) => void;
  placeholder: string;
  options: { label: string; value: string }[];
  disabled?: boolean;
}

const AreaCodeInput: React.FC<AreaCodeInputProps> = props => {
  const { value, onChange, placeholder, disabled } = props;
  return (
    <div>
      <Input
        value={value?.phone_number}
        disabled={disabled}
        onChange={(e: any) => {
          onChange({
            ...value,
            phone_number: e.target.value,
          });
        }}
        placeholder={placeholder}
        prefix={
          <AreaCode
            value={value?.areaCode}
            options={props.options}
            disabled={disabled}
            onChange={areaCode =>
              onChange({
                ...value,
                areaCode,
              })
            }
          />
        }
      />
    </div>
  );
};

export const FormilyAreaCodeInput = connect(
  AreaCodeInput,
  mapProps({
    dataSource: 'options',
  }),
);
