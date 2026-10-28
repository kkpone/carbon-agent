import { DatePicker } from '@formily/antd-v5';
import I18N from '@src/lang/I18N';
import type { ComponentProps, ComponentType } from 'react';

import calendarIcon from '../assets/calendar.svg';
import style from '../index.module.less';

// Formily 的声明误将部分 DOM 属性标为必填，仍使用其原有字符串日期适配。
const PeriodDatePicker = DatePicker as ComponentType<
  Partial<ComponentProps<typeof DatePicker>>
>;

export function ApplicationPeriod({
  value = [],
  onChange,
  disabled,
}: {
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
}) {
  return (
    <div className={style.period}>
      <PeriodDatePicker
        aria-label={I18N.carbonAgent.labelApplication.startDate}
        format='YYYY-MM-DD'
        value={value[0]}
        disabled={disabled}
        suffixIcon={<img src={calendarIcon} width={16} height={16} alt='' />}
        disabledDate={date =>
          Boolean(value[1] && date.format('YYYY-MM-DD') > value[1])
        }
        onChange={date =>
          onChange?.([typeof date === 'string' ? date : '', value[1] || ''])
        }
      />
      <span>{I18N.carbonAgent.labelApplication.to}</span>
      <PeriodDatePicker
        aria-label={I18N.carbonAgent.labelApplication.endDate}
        format='YYYY-MM-DD'
        value={value[1]}
        disabled={disabled}
        suffixIcon={<img src={calendarIcon} width={16} height={16} alt='' />}
        disabledDate={date =>
          Boolean(value[0] && date.format('YYYY-MM-DD') < value[0])
        }
        onChange={date =>
          onChange?.([value[0] || '', typeof date === 'string' ? date : ''])
        }
      />
    </div>
  );
}
