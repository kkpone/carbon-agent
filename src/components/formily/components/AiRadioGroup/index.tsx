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
import { Input, Radio, Select, Space } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { debounce, omit, uniq } from 'lodash-es';
import { FC, useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import styles from './index.module.less';
import { createReportData } from '../AiTextarea/service';

// const
interface IComponentProps {
  value: string;
  onChange: (params: string) => void;
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
  renderType: string;
}

const RadioGroupComponents: FC<IComponentProps> = props => {
  const {
    onChange,
    title,
    initialValue,
    options,
    value,
    questionCode,
    renderType,
  } = props;

  const [hideOptions, setHideOptions] = useState<string[]>([]);

  // const finalValue = value;

  const [finalValue, setFinalValue] = useState<string>();

  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    try {
      const { radioValue, inputValue: initInputValue } = JSON.parse(value);
      setFinalValue(radioValue);
      setInputValue(initInputValue);
    } catch (error) {
      setFinalValue(value);
    }
  }, [value]);

  const form = useForm();
  const field = useField();

  useEffect(() => {
    options.forEach(option => {
      if (option.logic?.question && option.logic.question?.path.length > 0) {
        form.addEffects(option.logic.question.id, () => {
          onFieldChange(option.logic.question?.path?.join('.') || '', field => {
            const optionsVisible = option.logic.question?.value?.includes(
              (field as any).value,
            );
            if (!optionsVisible) {
              setHideOptions(pre => uniq([...pre, option.value]));
            } else {
              setHideOptions(pre => pre.filter(item => item !== option.value));
            }
          });
        });
      }
    });
  }, [options]);

  const isInnerTable = form?.values?.formDisplay;

  const location = useLocation<{ reportId: string }>();

  const searchParams = new URLSearchParams(location.search);

  const reportId = Number(searchParams.get('reportId') || 0);

  useMount(() => {
    if (initialValue) {
      const { radioValue, inputValue: initInputValue } = JSON.parse(
        initialValue.content,
      );

      (field as any).setInitialValue(radioValue);
      // onChange(radioValue);
      setInputValue(initInputValue);
    }
  });

  const GroupOnchange = (e: RadioChangeEvent) => {
    if (isInnerTable) {
      onChange(e.target.value);
    } else {
      onChange(e.target.value);
      setInputValue('');
      createReportData({
        questionId: field.props.name.toString(),
        questionCode,
        title,
        reportId,
        content: JSON.stringify({
          radioValue: e.target.value,
          inputValue: '',
          radioLabel: options.find(item => item.value === e.target.value)
            ?.label,
        }),
      });
    }
  };

  const selectChange = (e: string) => {
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
          radioValue: e,
          inputValue: '',
          radioLabel: options.find(item => item.value === e)?.label,
        }),
      });
    }
  };

  const OnInputValueChange = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      if (isInnerTable) {
        onChange(
          JSON.stringify({
            radioValue: finalValue,
            inputValue: e.target.value,
          }),
        );
      } else {
        createReportData({
          questionId: field.props.name.toString(),
          questionCode,
          title,
          reportId,
          content: JSON.stringify({
            radioValue: finalValue,
            inputValue: e.target.value,
            radioLabel: options.find(item => item.value === finalValue)?.label,
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

  // const finalValue =

  if (renderType === 'select') {
    return (
      <div className={styles.wrapper}>
        <Select
          {...omit(props, ['options', 'value'])}
          value={finalValue}
          onChange={selectChange}
          options={finalOptions}
          showSearch
          allowClear
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          style={{ minWidth: '180px', width: '100%' }}
        />
        {finalOptions.map(option =>
          finalValue === option.value && option.fill ? (
            <Input
              style={{ width: '100%', marginTop: 6 }}
              defaultValue={inputValue}
              onChange={OnInputValueChange}
            />
          ) : null,
        )}
      </div>
    );
  }

  return (
    <Radio.Group
      {...omit(props, ['options', 'value'])}
      value={finalValue}
      onChange={GroupOnchange}
      style={{ minWidth: '160px', width: '100%' }}
    >
      <Space direction='vertical' size='middle'>
        {finalOptions.map(option => (
          <Radio
            key={option.value}
            value={option.value}
            className={styles.radioItem}
          >
            {option.label}{' '}
            {finalValue === option.value && option.fill ? (
              <Input
                style={{ width: 100, marginLeft: 10, height: 22 }}
                defaultValue={inputValue}
                onChange={OnInputValueChange}
              />
            ) : null}
          </Radio>
        ))}
        {/* <Radio value='more'>
          其他
          {value === 'more' ? (
            <Input
              style={{ width: 100, marginLeft: 10, height: 22 }}
              defaultValue={inputValue}
              onChange={OnInputValueChange}
            />
          ) : null}
        </Radio> */}
      </Space>
    </Radio.Group>
  );
};

export const RadioGroup = connect(
  RadioGroupComponents,
  mapProps({
    dataSource: 'options',
  }),
  mapReadPretty(PreviewText.Select, {
    mode: 'tags',
  }),
);
