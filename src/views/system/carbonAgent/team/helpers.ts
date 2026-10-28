import moment from 'moment';

import { teamText } from './i18n';
import type { Audit, FinanceOrder, MemberRow, Quote, TeamOrder } from './types';

export const TEAM_PATH = '/system/carbonAgent/team';
export const AGENT_PATH = '/system/carbonAgent';
export const requestKey = () => crypto.randomUUID();
export const numberText = (value?: number) =>
  value == null ? '—' : value.toLocaleString('zh-CN');
export const money = (value?: number) =>
  value == null ? '—' : `¥${Number(value).toFixed(2)}`;
const beijingTime = (value?: string) => {
  if (!value) return undefined;
  const time = moment.parseZone(
    value.match(/^\d{4}-\d{2}-\d{2}$/) ? `${value}T00:00:00+08:00` : value,
  );
  if (!time.isValid()) return undefined;
  // 后端无时区 Date 文本遵循北京时间，而 ISO 时间戳转换为北京时间。
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(value)) time.utcOffset(480, true);
  else time.utcOffset(480);
  return time;
};
export const paymentSecondsLeft = (expiresAt?: string, now = Date.now()) => {
  const expires = beijingTime(expiresAt);
  return expires
    ? Math.max(0, Math.ceil((expires.valueOf() - now) / 1000))
    : undefined;
};
export const dateTimeText = (value?: string) =>
  beijingTime(value)?.format('YYYY-MM-DD HH:mm:ss') || '—';
export const financePaymentText = (status?: string) =>
  ({
    '0': teamText('pendingPayment'),
    '1': teamText('paid'),
    '2': teamText('cancelled'),
    '3': teamText('refundInProgress'),
    '4': teamText('refunded'),
  }[status || ''] || '—');
/** 退款和取消优先展示交易状态，其余订单展示权益处理进度。 */
export const financeOrderStatus = (order: FinanceOrder) =>
  ['2', '3', '4'].includes(String(order.status))
    ? financePaymentText(order.status)
    : order.entitlementStatus || financePaymentText(order.status);
export const dateText = (value?: string, endExclusive = false) => {
  const time = beijingTime(value);
  if (!time) return '—';
  if (endExclusive) time.subtract(1, 'second');
  return time.format('YYYY-MM-DD');
};
export const today = () => moment().utcOffset(480).format('YYYY-MM-DD');
export const isQuoteValid = (quote?: Quote) => {
  if (!quote) return false;
  const value = quote.expiresAt;
  const time = moment.parseZone(
    /[zZ]|[+-]\d{2}:?\d{2}$/.test(value)
      ? value
      : `${value.replace(' ', 'T')}+08:00`,
  );
  return time.isValid() && time.valueOf() > Date.now();
};
export const limitPayload = (
  rows: MemberRow[],
  mode: 'UNLIMITED' | 'SPECIFIED',
  value?: number,
) => {
  if (
    !rows.length ||
    (mode === 'SPECIFIED' &&
      (!Number.isSafeInteger(value) ||
        value! < 0 ||
        rows.some(row => value! < row.shouldChargePoints)))
  ) {
    throw new Error('AGENT_LIMIT_BELOW_USAGE');
  }
  return {
    membershipIds: rows.map(row => String(row.member.membershipId)),
    limitMode: mode,
    ...(mode === 'SPECIFIED' ? { limitValue: value } : {}),
    versions: Object.fromEntries(
      rows.map(row => [String(row.member.membershipId), row.limitVersion]),
    ),
  };
};
export const csvCell = (value: unknown) => {
  let text = value == null ? '' : String(value);
  if (/^[\s]*[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};
export const downloadCsv = <T>(
  name: string,
  rows: T[],
  columns: { title: string; value: (row: T) => unknown }[],
) => {
  const content = [
    columns.map(column => csvCell(column.title)).join(','),
    ...rows.map(row =>
      columns.map(column => csvCell(column.value(row))).join(','),
    ),
  ].join('\r\n');
  const url = URL.createObjectURL(
    new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
export const safeFileUrl = (value?: string) => {
  if (!value) return undefined;
  try {
    const url = new URL(value, window.location.origin);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
};

/** Count logical CSV records, including quoted multiline fields. Server remains authoritative for validation. */
export const csvRecordCount = (text: string) => {
  let quoted = false;
  let records = 0;
  let hasContent = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') index += 1;
      else quoted = !quoted;
    }
    if ((char === '\n' || char === '\r') && !quoted) {
      if (hasContent) records += 1;
      hasContent = false;
      if (char === '\r' && text[index + 1] === '\n') index += 1;
    } else if (char.trim()) hasContent = true;
  }
  return records + (hasContent ? 1 : 0);
};
export const quoteMatches = (
  quote: Quote | undefined,
  action: string,
  quantity: number,
  name?: string,
) =>
  !!quote &&
  quote.action === action &&
  quote.quantity === quantity &&
  (name === undefined || quote.companyName === name.trim()) &&
  isQuoteValid(quote);
export const shouldPollTeamOrder = (state?: string) =>
  state === 'PENDING' || state === 'PAID';
export const shouldPollPointOrder = (status?: string) => status === 'pending';

export const hasExpired = (value?: string) =>
  !!value && !isQuoteValid({ expiresAt: value } as Quote);

/** Inclusive calendar ranges in Beijing time, including today. */
export const recentDays = (days: number, end = today()) => ({
  start: moment(end)
    .subtract(days - 1, 'days')
    .format('YYYY-MM-DD'),
  end,
});
export const financeInvoiceText = (order: FinanceOrder) => {
  if (order.invoiceStatus === 1) return teamText('invoiced');
  if (order.invoiceStatus === 0) return teamText('invoiceProcessing');
  if (order.invoiceFlag === 1) return teamText('invoiceRequested');
  return order.canInvoice ? teamText('notInvoiced') : teamText('notEligible');
};
export const financeValidityText = (order: FinanceOrder) => {
  if (order.periods?.length)
    return order.periods
      .map(period =>
        teamText('valueToValue', {
          value0: dateText(period.startDate),
          value1: dateText(period.endDateExclusive, true),
        }),
      )
      .join('；');
  if (order.pointValidityDays != null)
    return teamText('valueDaysFromEntitlementActivation', {
      value0: order.pointValidityDays,
    });
  if (order.pointValidityType === 'PERMANENT') return teamText('noExpiry');
  return '—';
};

export const auditActionText = (row: Pick<Audit, 'action' | 'actionName'>) =>
  row.actionName?.trim() || row.action;

/** A lost create response may only recover the order for this exact quote. */
export const createOrRecoverTeamOrder = async (
  quoteId: string,
  api: {
    order: (quoteId: string) => Promise<TeamOrder>;
    pending: () => Promise<TeamOrder | null>;
  },
) => {
  try {
    return await api.order(quoteId);
  } catch (failure) {
    let pending: TeamOrder | null = null;
    try {
      pending = await api.pending();
    } catch {
      /* Keep the original error and quote for retry. */
    }
    if (pending && String(pending.quoteId) === String(quoteId)) return pending;
    throw failure;
  }
};
export const canContinueTeamPayment = (order: FinanceOrder) =>
  ['OPEN', 'RENEW', 'EXPAND'].includes(order.action) &&
  order.entitlementStatus === 'PENDING';
