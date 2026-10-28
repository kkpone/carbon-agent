import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';
import {
  Alert,
  Button,
  DatePicker,
  Empty,
  Spin,
  Statistic,
  Progress,
  Tag,
  message,
} from 'antd';
import ReactECharts from 'echarts-for-react';
import moment from 'moment';
import momentGenerateConfig from 'rc-picker/lib/generate/moment';
import type { ReactNode } from 'react';

import { errorCode, errorText } from './errors';
import { today, recentDays } from './helpers';
import { teamText } from './i18n';
import style from './team.module.less';
import { TeamManagementDenied } from './workspace';

const MomentDatePicker =
  DatePicker.generatePicker<moment.Moment>(momentGenerateConfig);

export const labels: Record<string, string> = createI18nLabelMap({
  ACTIVE: () => teamText('active'),
  NOT_ENABLED: () => teamText('notActivated'),
  EXPIRED: () => teamText('expired'),
  REVOKED: () => teamText('unavailable'),
  RUNNING: () => teamText('running'),
  WAITING: () => teamText('waitingForInput'),
  SUCCESS: () => teamText('succeeded'),
  FAILED: () => teamText('failed'),
  CANCELLED: () => teamText('cancelled'),
  PENDING: () => teamText('pendingPayment'),
  PAID: () => teamText('applyingEntitlements'),
  APPLIED: () => teamText('activated'),
  REVIEW: () => teamText('requiresReview'),
  CLOSED: () => teamText('closed'),
  pending: () => teamText('pendingPayment'),
  paid: () => teamText('paid'),
  closed: () => teamText('closed'),
  UNKNOWN: () => teamText('unknown'),
  OPEN: () => teamText('activate'),
  EXPAND: () => teamText('addSeats2'),
  RENEW: () => teamText('renew'),
  POINTS: () => teamText('pointsPurchase'),
});
export const Status = ({ value }: { value?: string }) => (
  <Tag
    color={
      ['ACTIVE', 'SUCCESS', 'APPLIED', 'paid'].includes(value || '')
        ? 'cyan'
        : ['FAILED', 'REVOKED', 'EXPIRED'].includes(value || '')
        ? 'error'
        : 'default'
    }
  >
    {labels[value || ''] || value || '—'}
  </Tag>
);
export const PageTitle = ({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) => (
  <div className={style.heading}>
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    <div>{actions}</div>
  </div>
);
export const QueryState = ({
  query,
  children,
}: {
  query: {
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => unknown;
  };
  children: ReactNode;
}) => {
  if (query.isLoading)
    return (
      <div className={style.loading}>
        <Spin />
      </div>
    );
  if (
    query.isError &&
    errorCode(query.error) === 'AGENT_TEAM_MANAGEMENT_FORBIDDEN'
  )
    return <TeamManagementDenied />;
  if (query.isError)
    return (
      <Alert
        showIcon
        type='error'
        message={errorText(query.error)}
        action={
          <Button onClick={() => query.refetch()}>{teamText('retry')}</Button>
        }
      />
    );
  return <div>{children}</div>;
};
export const Metrics = ({
  items,
  variant = 'default',
}: {
  variant?: 'default' | 'inline' | 'tinted';
  items: {
    title: string;
    value?: number | string;
    suffix?: string;
    hint?: string;
    percent?: number;
  }[];
}) => (
  <div className={`${style.metrics} ${style[`metrics_${variant}`] || ''}`}>
    {items.map(item => (
      <section key={item.title}>
        <Statistic
          title={item.title}
          value={item.value ?? '—'}
          suffix={item.suffix}
        />
        {item.percent != null && (
          <Progress
            percent={item.percent}
            showInfo={false}
            strokeColor={{ from: '#57d9b8', to: '#0cbf9f' }}
            size='small'
          />
        )}
        {item.hint && <small>{item.hint}</small>}
      </section>
    ))}
  </div>
);
export const Trend = ({
  title,
  rows,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  rows: { day: string; value: number }[];
}) => (
  <section className={style.card}>
    <div className={style.sectionHeading}>
      <div>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {actions}
    </div>
    {rows.length ? (
      <ReactECharts
        style={{ height: 280 }}
        option={{
          color: ['#0cbf9f'],
          tooltip: { trigger: 'axis' },
          grid: { top: 20, left: 45, right: 20, bottom: 30 },
          xAxis: {
            type: 'category',
            data: rows.map(row => row.day.slice(5)),
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: { color: '#6c757d', fontSize: 12 },
          },
          yAxis: {
            type: 'value',
            minInterval: 1,
            axisLabel: { color: '#6c757d', fontSize: 12 },
            splitLine: { lineStyle: { color: '#f3f4f5' } },
          },
          series: [
            {
              type: 'bar',
              barMaxWidth: 16,
              data: rows.map(row => row.value),
              itemStyle: { borderRadius: [3, 3, 0, 0] },
            },
          ],
        }}
      />
    ) : (
      <Empty description={teamText('noData')} />
    )}
  </section>
);
export const DateFilterInput = ({
  presetDays = [],
  start,
  end,
  onChange,
}: {
  presetDays?: number[];
  start?: string;
  end?: string;
  onChange: (start?: string, end?: string) => void;
}) => (
  <MomentDatePicker.RangePicker
    presets={presetDays.map(days => ({
      label: teamText('lastValueDays', { value0: days }),
      value: () => {
        const range = recentDays(days);
        return [moment(range.start), moment(range.end)];
      },
    }))}
    value={start && end ? [moment(start), moment(end)] : null}
    disabledDate={date => date.isAfter(moment(today()), 'day')}
    onChange={dates => {
      if (!dates?.[0] || !dates?.[1]) {
        onChange(undefined, undefined);
        return;
      }
      if (dates[1].diff(dates[0], 'days') > 89) {
        message.warning(teamText('selectNoMoreThan90CalendarDays'));
        return;
      }
      onChange(dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD'));
    }}
  />
);
