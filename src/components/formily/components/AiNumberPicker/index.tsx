import { connect, useField, useForm } from '@formily/react';
import { useMount } from 'ahooks';
import { InputNumber } from 'antd';
import { FC } from 'react';

import { createReportData } from '../AiTextarea/service';
import { useLocation } from 'react-router-dom';

// const
interface IComponentProps {
  value: string | null;
  onChange: (params: string | null) => void;
  options: any[];
  title: string;
  initialValue?: { content: string };
  questionCode: string;
}

const NumberPickerComponents: FC<IComponentProps> = props => {
  const { onChange, title, initialValue, questionCode } = props;
  const form = useForm();
  const field = useField();
  const isInnerTable = form?.values?.formDisplay;

  const location = useLocation<{ reportId: string }>();

  const searchParams = new URLSearchParams(location.search);

  const reportId = Number(searchParams.get('reportId') || 0);

  useMount(() => {
    if (initialValue) {
      (field as any).setInitialValue(JSON.parse(initialValue?.content || '""'));
      // onChange(JSON.parse(initialValue?.content || '""'));
    }
  });

  const GroupOnchange = (e: string | null) => {
    if (isInnerTable) {
      onChange(e);
    } else {
      onChange(e);
      createReportData({
        questionId: field.props.name.toString(),
        questionCode,
        title,
        reportId,
        content: JSON.stringify(e),
      });
    }
  };

  return (
    <InputNumber
      style={{ minWidth: '100px', width: '100%' }}
      {...props}
      onChange={GroupOnchange}
    />
  );
};

export const AiNumberPicker = connect(NumberPickerComponents);
