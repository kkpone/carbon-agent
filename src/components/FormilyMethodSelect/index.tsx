import { NumberPicker, Select, Cascader } from '@formily/antd-v5';
import { Field } from '@formily/core';
import { observer, useField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Table } from 'antd';
import { cloneDeep, isNil } from 'lodash-es';
import { useEffect } from 'react';

import { useUnit } from '@/hooks/useScope';
import {
  NEED_DEFAULT,
  PARAM_TYPE,
} from '@/views/enterpriseCarbonAccount2/FormulaSetting/constant';

import styles from './index.module.less';

type Method = {
  id: number;
  name: string;
  formula: { type: number; value: string; label: string }[];
  paramItem: {
    id: number;
    name: string;
    paramType: number;
    hasValue: number;
    defaultValue: number;
    hasUnit: number;
    defaultUnit: string[];
  }[];
};

const FormilyMethodSelect = observer<{
  disabled: boolean;
  placeholder?: string;
  fieldNames?: { label: string; value: string };
  options?: Method[];
  paramDisabled?: boolean;
}>(({ disabled, placeholder, fieldNames, options, paramDisabled }) => {
  const field = useField() as Field<any, any, any, Method | undefined>;

  const { value, onInput, setValue } = field;

  const unitDict = useUnit();

  useEffect(() => {
    if (value && (isNil(value.formula) || isNil(value.paramItem))) {
      const selectedMethod = options?.find(item => item.id === value.id);
      if (
        selectedMethod &&
        selectedMethod.formula &&
        selectedMethod.paramItem
      ) {
        setValue(cloneDeep(selectedMethod));
      }
    }
  }, [value, options, setValue]);

  return (
    <div>
      <Select
        value={value ? { value: value.id, label: value.name } : undefined}
        labelInValue
        allowClear
        placeholder={placeholder}
        disabled={disabled}
        options={options}
        fieldNames={fieldNames}
        onChange={(_, method) => {
          onInput(cloneDeep(method));
        }}
      />
      {value?.formula && (
        <div className={styles.formulaDesc}>
          {I18N.components.carbonEmissions}
          {value.formula.map(formulaItem => formulaItem.label).join(' ')}
        </div>
      )}
      {value?.paramItem && (
        <Table
          dataSource={value.paramItem}
          pagination={false}
          size='small'
          columns={[
            {
              title: I18N.greenMeeting.activityType,
              dataIndex: 'name',
              ellipsis: true,
            },
            {
              title: I18N.carbonFootprint3.activityData,
              dataIndex: 'defaultValue',
              render: (_, record) => {
                const { hasValue, defaultValue } = record;
                return (
                  <NumberPicker
                    value={defaultValue}
                    placeholder={I18N.supplyChain2.pleaseEnterTheActivity}
                    controls={false}
                    disabled={
                      paramDisabled ||
                      disabled ||
                      hasValue === NEED_DEFAULT.NEED
                    }
                    onChange={val => {
                      Object.assign(record, { defaultValue: val });
                      onInput({ ...value });
                    }}
                  />
                );
              },
            },
            {
              title: I18N.carbonFootprint.unit,
              dataIndex: 'defaultUnit',
              render: (_, record) => {
                const { paramType, hasUnit, defaultUnit } = record;

                if (paramType === PARAM_TYPE.PERCENT) {
                  return '%';
                }

                return (
                  // @ts-ignore
                  <Cascader
                    placeholder={I18N.carbonFootprint.pleaseSelectAUnit}
                    options={unitDict}
                    value={defaultUnit}
                    disabled={
                      paramDisabled || disabled || hasUnit === NEED_DEFAULT.NEED
                    }
                    onChange={val => {
                      Object.assign(record, { defaultUnit: val });
                      onInput({ ...value });
                    }}
                  />
                );
              },
            },
          ]}
        />
      )}
    </div>
  );
});

export default FormilyMethodSelect;
