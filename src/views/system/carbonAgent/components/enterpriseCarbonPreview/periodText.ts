import I18N from '@/lang/I18N';

import type { EnterpriseCarbonOrgPeriod } from './types';

type PeriodTextParams = {
  accountingYear?: string;
  period?: EnterpriseCarbonOrgPeriod;
  periodName?: string;
};

const getOptionalString = (value?: string | number | null) => {
  const text =
    value === undefined || value === null ? '' : String(value).trim();

  return text === 'undefined' || text === 'null' ? '' : text;
};

const getPeriodValue = (period?: EnterpriseCarbonOrgPeriod) =>
  getOptionalString(period?.value);

const isAnnualPeriod = (name: string, value: string) =>
  value === '0' || /^(全部|all)$/i.test(name);

const getQuarter = (text: string, value: string) => {
  const matchedQuarter =
    text.match(/(?:Q|季度|第?\s*季)\s*[-:]?\s*(\d+)/i)?.[1] ||
    text.match(/(\d+)\s*(?:季度|季)/i)?.[1];

  return (
    matchedQuarter || (/(?:季度|季|quarter|\bQ\b)/i.test(text) ? value : '')
  );
};

const getMonth = (text: string, value: string) => {
  const matchedMonth =
    text.match(/(\d+)\s*(?:月|month)/i)?.[1] ||
    text.match(/(?:月|month)\s*[-:]?\s*(\d+)/i)?.[1];

  return matchedMonth || (/(?:月|month)/i.test(text) ? value : '');
};

export const getEnterpriseCarbonAccountingYear = (value?: string) => {
  const text = getOptionalString(value);

  if (!text) {
    return undefined;
  }

  return text.match(/\d{4}/)?.[0] || text.replace(/年/g, '');
};

export const getEnterpriseCarbonPeriodParamName = ({
  accountingYear,
  period,
  periodName,
}: PeriodTextParams) => {
  const name = getOptionalString(period?.name);
  const value = getPeriodValue(period);

  if (periodName) {
    return periodName;
  }

  if (!name && !value) {
    return undefined;
  }

  if (isAnnualPeriod(name, value)) {
    return accountingYear ? `${accountingYear}年` : name;
  }

  const quarter = getQuarter(name, value);
  if (quarter) {
    return accountingYear ? `${accountingYear}年-Q${quarter}` : name;
  }

  const month = getMonth(name, value);
  if (month) {
    return accountingYear ? `${accountingYear}年-${month}月` : name;
  }

  return accountingYear && name ? `${accountingYear}年-${name}` : name;
};

export const formatEnterpriseCarbonPeriodName = ({
  accountingYear,
  period,
  periodName,
}: PeriodTextParams) => {
  const year = getOptionalString(accountingYear);
  const name = getOptionalString(period?.name);
  const value = getPeriodValue(period);
  const sourceText = [name, getOptionalString(periodName)]
    .filter(Boolean)
    .join(' ');

  if (!year) {
    return getOptionalString(periodName) || name || value;
  }

  if ((!name && !value && !periodName) || isAnnualPeriod(name, value)) {
    return I18N.template(I18N.carbonAgent.enterpriseCarbonYearPeriod, {
      val1: year,
    });
  }

  const quarter = getQuarter(sourceText, value);
  if (quarter) {
    return I18N.template(I18N.carbonAgent.enterpriseCarbonQuarterPeriod, {
      val1: year,
      val2: quarter,
    });
  }

  const month = getMonth(sourceText, value);
  if (month) {
    return I18N.template(I18N.carbonAgent.enterpriseCarbonMonthPeriod, {
      val1: year,
      val2: month,
    });
  }

  const normalizedPeriodName = getOptionalString(periodName);
  if (normalizedPeriodName && /^\d{4}年?$/.test(normalizedPeriodName)) {
    return I18N.template(I18N.carbonAgent.enterpriseCarbonYearPeriod, {
      val1: year,
    });
  }

  const namedPeriod =
    name || normalizedPeriodName.replace(new RegExp(`^${year}年?-?`), '');

  return namedPeriod
    ? I18N.template(I18N.carbonAgent.enterpriseCarbonNamedPeriod, {
        val1: year,
        val2: namedPeriod,
      })
    : I18N.template(I18N.carbonAgent.enterpriseCarbonYearPeriod, {
        val1: year,
      });
};

export const formatEnterpriseCarbonAccountingTitle = (
  accountingYear?: string,
) => {
  const year = getOptionalString(accountingYear);

  return year
    ? I18N.template(I18N.carbonAgent.enterpriseCarbonAccountingYearTitle, {
        val1: year,
      })
    : I18N.carbonAgent.enterpriseCarbon;
};
