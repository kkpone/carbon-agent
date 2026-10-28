import { connect, useField, useForm } from '@formily/react';
// import { useMount } from 'ahooks';
import { DatePicker } from 'antd';
// import { RangePickerProps } from 'antd/lib/date-picker';
import { omit } from 'lodash-es';
import moment, { Moment } from 'moment';
import { FC, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { createReportData } from '../AiTextarea/service';

// const
interface IComponentProps {
  value: Moment | null;
  onChange: (params?: string) => void;
  options: any[];
  title: string;
  initialValue?: { content: string };
  questionCode: string;
  startTime?: string;
  endTime?: string;
}

const DatePickerComponents: FC<IComponentProps> = props => {
  const { onChange, title, questionCode } = props;
  const form = useForm();
  const field = useField();
  const isInnerTable = form?.values?.formDisplay;

  const momentValue = useMemo(
    () => (props.value ? moment(props.value) : props.value),
    [props.value],
  );

  const location = useLocation<{ reportId: string }>();

  const searchParams = new URLSearchParams(location.search);

  const reportId = Number(searchParams.get('reportId') || 0);

  // const disabledDate: RangePickerProps['disabledDate'] = (current: Moment) =>
  //   current &&
  //   (current < moment(props.startTime) ||
  //     current > moment(props.endTime).add(1, 'day'));
  // useMount(() => {
  //   if (initialValue && initialValue?.content.length > 6) {
  //     (field as any).setInitialValue(
  //       moment(JSON.parse(initialValue?.content || '""')),
  //     );
  //   }
  // });

  const GroupOnchange = (value: Moment | null, dateString: string) => {
    if (isInnerTable) {
      onChange(value?.format());
    } else {
      onChange(value?.format());
      createReportData({
        questionId: field.props.name.toString(),
        questionCode,
        title,
        reportId,
        content: JSON.stringify(dateString),
      });
    }
  };

  return (
    <div style={{ minWidth: '120px', width: '100%' }}>
      <DatePicker
        style={{ minWidth: '120px', width: '100%' }}
        {...omit(props, 'value')}
        value={momentValue}
        // disabledDate={disabledDate}
        onChange={GroupOnchange}
      />
    </div>
  );
};

export const AiDatePicker = connect(DatePickerComponents);
