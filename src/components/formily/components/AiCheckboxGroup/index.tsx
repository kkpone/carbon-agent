import { PreviewText } from '@formily/antd-v5';
import { onFieldChange } from '@formily/core';
import {
  connect,
  mapProps,
  mapReadPretty,
  useField,
  useForm,
} from '@formily/react';
import { useMount } from 'ahooks';
import { Checkbox, Input, Space, Select } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { debounce, omit, uniq } from 'lodash-es';
import { FC, useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { createReportData } from '../AiTextarea/service';

// const
interface IComponentProps {
  value?: CheckboxValueType[] | string;
  onChange: (params: CheckboxValueType[] | string) => void;
  options: {
    label: string;
    value: string;
    fill: boolean;
    logic: {
      question?: {
        id: string;
        path: string[];
        value: string[];
        options: any[];
      };
    };
  }[];
  title: string;
  initialValue?: { content: string };
  questionCode: string;
  renderType: 'select' | 'display';
}

const CheckboxGroupComponents: FC<IComponentProps> = props => {
  const {
    onChange,
    title,
    initialValue,
    questionCode,
    options,
    value,
    renderType,
  } = props;
  const form = useForm();
  const field = useField();
  const isInnerTable = form?.values?.formDisplay;
  const [inputValue, setInputValue] = useState<{}>({});

  const location = useLocation<{ reportId: string }>();

  const searchParams = new URLSearchParams(location.search);

  const reportId = Number(searchParams.get('reportId') || 0);

  const [hideOptions, setHideOptions] = useState<string[]>([]);

  const [finalValue, setFinalValue] = useState<string[]>([]);

  useEffect(() => {
    try {
      if (typeof value === 'string') {
        const { checkboxValue, inputValue: initInputValue } = JSON.parse(value);
        setFinalValue(checkboxValue);
        setInputValue(initInputValue);
      } else if (Array.isArray(value)) {
        setFinalValue([...value]);
      }
    } catch (error) {
      if (typeof value !== 'string') {
        setFinalValue([...value]);
      }
    }
  }, [value]);

  useEffect(() => {
    options.forEach(option => {
      if (option.logic?.question && option.logic.question?.path.length > 0) {
        form.addEffects(option.logic.question.id, () => {
          onFieldChange(
            option.logic.question?.path?.join('.') || '',
            (field: any) => {
              let optionsVisible: boolean | undefined = true;
              if (Array.isArray(field.value)) {
                optionsVisible = [...field.value].some(item =>
                  option.logic.question?.value?.includes(item),
                );
              } else {
                optionsVisible = option.logic.question?.value?.includes(
                  (field as any).value,
                );
              }

              if (!optionsVisible) {
                setHideOptions(pre => uniq([...pre, option.value]));
              } else {
                setHideOptions(pre =>
                  pre.filter(item => item !== option.value),
                );
              }
            },
          );
        });
      }
    });
  }, [options]);

  useMount(() => {
    if (initialValue) {
      const { checkboxValue, inputValue: initInputValue } = JSON.parse(
        initialValue.content,
      );
      (field as any).setInitialValue(checkboxValue);
      setInputValue(initInputValue);
    }
  });

  const GroupOnchange = (e: CheckboxValueType[]) => {
    const nextInputValue = {};
    Object.keys(inputValue).forEach(inputV => {
      if (e.includes(inputV)) {
        nextInputValue[inputV] = inputValue[inputV];
      }
    });
    setInputValue(nextInputValue);
    if (isInnerTable) {
      onChange(e);
    } else {
      onChange(e);
      createReportData({
        questionId: field.props.name.toString(),
        questionCode,
        title,
        reportId,
        content: JSON.stringify({
          checkboxValue: e,
          inputValue: nextInputValue,
        }),
      });
    }
  };

  const OnInputValueChange = debounce(
    (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
      setInputValue(pre => ({
        ...pre,
        [key]: e.target.value,
      }));
      if (isInnerTable) {
        onChange(
          JSON.stringify({
            checkboxValue: finalValue,
            inputValue: {
              ...inputValue,
              [key]: e.target.value,
            },
          }),
        );
      } else {
        createReportData({
          questionId: field.props.name.toString(),
          questionCode,
          title,
          reportId,
          content: JSON.stringify({
            checkboxValue: finalValue,
            inputValue: {
              ...inputValue,
              [key]: e.target.value,
            },
          }),
        });
      }
    },
    500,
  );

  const finalOptions = useMemo(
    () => options.filter(option => !hideOptions.includes(option.value)),
    [options, hideOptions],
  );

  if (renderType === 'select') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Select
          mode='multiple'
          allowClear
          {...omit(props, ['value'])}
          value={finalValue}
          onChange={GroupOnchange}
          style={{ minWidth: '180px', width: '100%' }}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={finalOptions}
        />
        {finalOptions.map(option =>
          finalValue?.includes(option.value) && option.fill ? (
            <Input
              style={{ width: '100%', marginTop: 6 }}
              defaultValue={inputValue[option.value]}
              onChange={e => OnInputValueChange(e, option.value)}
            />
          ) : null,
        )}
      </div>
    );
  }

  return (
    <Checkbox.Group
      {...omit(props, ['options', 'value'])}
      value={finalValue}
      onChange={GroupOnchange}
      style={{ minWidth: '180px', width: '100%' }}
    >
      <Space direction='vertical' size='middle'>
        {finalOptions.map(option => (
          <Checkbox key={option.value} value={option.value}>
            {option.label}{' '}
            {finalValue?.includes(option.value) && option.fill ? (
              <Input
                style={{ width: 100, marginLeft: 10, height: 22 }}
                defaultValue={inputValue[option.value]}
                onChange={e => OnInputValueChange(e, option.value)}
              />
            ) : null}
          </Checkbox>
        ))}
      </Space>
    </Checkbox.Group>
  );
};

export const CheckboxGroup = connect(
  CheckboxGroupComponents,
  mapProps({
    dataSource: 'options',
  }),
  mapReadPretty(PreviewText.Select, {
    mode: 'tags',
  }),
);
