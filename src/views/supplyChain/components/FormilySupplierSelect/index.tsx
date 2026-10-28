/* eslint-disable no-nested-ternary */
import {
  Field,
  Form,
  onFieldChange,
  onFieldInputValueChange,
} from '@formily/core';
import { connect, mapProps, mapReadPretty } from '@formily/react';
import { GetComponentProps } from '@src/utils/utilTypes';
import { useDebounceEffect } from 'ahooks';
import { Select } from 'antd';
import { omit } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';

import { searchSupplier } from './service';
import { SupplierSelectValue, SupplierSelectOptions } from './type';

type SupplierSelectProps = Omit<GetComponentProps<typeof Select>, 'value'> & {
  value?: SupplierSelectValue;
  options?: SupplierSelectOptions;
  setDataSource: (options: SupplierSelectOptions) => void;
  onInput: (value: SupplierSelectValue) => void;
};

const SupplierSelect = ({
  value,
  options,
  setDataSource,
  onInput,
  ...restProps
}: SupplierSelectProps) => {
  const [searchValue, setSearchValue] = useState<string>('');

  const [loading, setLoading] = useState(false);

  const searchValueRef = useRef('');

  useDebounceEffect(
    () => {
      if (searchValue) {
        setLoading(true);
        searchSupplier({ companyName: searchValue })
          .then(({ data }) => {
            setDataSource(
              (data.data || []).map(option => ({
                ...option,
                companyNameNumber: `${option.companyName}${
                  option.companyNumber ? `（${option.companyNumber}）` : ''
                }`,
              })),
            );
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [searchValue],
    { wait: 500 },
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      searchValueRef.current = searchValue;
    });
    return () => clearInterval(timer);
  }, [searchValue]);

  return (
    <Select
      {...omit(restProps, 'onChange')}
      value={value?.supplyCompanyId}
      fieldNames={{
        value: 'supplyCompanyId',
        label: 'companyNameNumber',
      }}
      showSearch
      loading={loading}
      filterOption={false}
      searchValue={searchValue}
      options={options}
      onSearch={searchText => {
        setSearchValue(searchText.trim());
      }}
      onBlur={() => {
        // onSearch会先于onBlur触发
        // 为了能拿到searchValue的值使用ref
        const inputCompanyName = searchValueRef.current;
        if (inputCompanyName && inputCompanyName !== value?.supplyCompanyId) {
          onInput({
            supplyCompanyId: inputCompanyName,
            companyName: inputCompanyName,
            isManualInput: true,
          });
        }
      }}
      onChange={(_, option) => {
        const selectedOption = option as SupplierSelectOptions[number];

        onInput({
          supplyCompanyId: selectedOption.supplyCompanyId,
          companyName: selectedOption.companyName,
        });
      }}
    />
  );
};

const SupplierSelectReadPretty = (props: { value?: SupplierSelectValue }) => (
  <div className='ant-form-text'>{props.value?.companyName ?? '-'}</div>
);

const FormilySupplierSelect = connect(
  SupplierSelect,
  mapProps({ value: true }, (props, field) => ({
    ...props,
    options: ((field as Field).dataSource as SupplierSelectOptions) || [],
    onInput: (field as Field).onInput,
    setDataSource: (field as Field).setDataSource,
  })),
  mapReadPretty(SupplierSelectReadPretty),
);

export const supplierFieldEffect = (form: Form) => {
  onFieldInputValueChange('supplierIdName', field => {
    const supplierValue = field.value as SupplierSelectValue;

    const contactsField = form.query('contacts').take() as Field | undefined;

    const phoneField = form.query('phone').take() as Field | undefined;

    const emailField = form.query('email').take() as Field | undefined;

    const isManualInput = !!supplierValue.isManualInput;

    // contactsField?.setComponentProps({ disabled: !isManualInput });
    // phoneField?.setComponentProps({ disabled: !isManualInput });
    // emailField?.setComponentProps({ disabled: !isManualInput });

    const selectedOption = (
      (field.dataSource || []) as SupplierSelectOptions
    ).find(option => option.supplyCompanyId === supplierValue.supplyCompanyId);

    form.setValues({
      contacts: isManualInput ? '' : selectedOption?.contacts,
      phone: isManualInput ? '' : selectedOption?.phone,
      email: isManualInput ? '' : selectedOption?.email,
      area: isManualInput
        ? ''
        : selectedOption?.areaCode
        ? JSON.parse(selectedOption.areaCode)
        : undefined,
    });

    // 选择的供应商有邮箱，手机，联系人信息时清空这三个字段的报错信息
    if (!isManualInput && selectedOption) {
      const { contacts, email, phone } = selectedOption;
      if (contacts) {
        contactsField?.setFeedback({});
      }
      if (email) {
        emailField?.setFeedback({});
      }
      if (phone) {
        phoneField?.setFeedback({});
      }
    }
  });

  onFieldChange('supplierIdName', ['initialValue'], field => {
    const initialValue = (field as Field).initialValue as
      | undefined
      | { supplyCompanyId: string; companyName: string };

    if (initialValue) {
      (field as Field).setDataSource([
        {
          supplyCompanyId: initialValue.supplyCompanyId,
          companyName: initialValue.companyName,
          companyNameNumber: initialValue.companyName,
        },
      ]);
    }
  });
};

export default FormilySupplierSelect;
