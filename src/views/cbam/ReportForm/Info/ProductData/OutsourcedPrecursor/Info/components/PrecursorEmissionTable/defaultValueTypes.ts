import { ConfigCNResp } from '@/views/cbam/ReportForm/type';

export type DefaultValueYear = '2026' | '2027' | '2028_PLUS';

export interface DefaultCnSelection extends ConfigCNResp {
  countryCode?: string;
  countryName?: string;
  countryValue?: string;
  defaultValue2026?: string;
  defaultValue2026GrowthRate?: string;
  defaultValue2027?: string;
  defaultValue2027GrowthRate?: string;
  defaultValue2028Onwards?: string;
  defaultValue2028OnwardsGrowthRate?: string;
  directDefaultValue?: string;
  effectiveCountryCode?: string;
  effectiveCountryName?: string;
  effectiveCountryValue?: string;
  indirectDefaultValue?: string;
  productionRoute?: string;
  totalDefaultValue?: string;
}

export interface SelectedDefaultValue {
  cnCode?: string;
  cnName?: string;
  defaultCnId?: number;
  year?: number;
  directEmission?: number;
  indirectEmission?: number;
}

export const getYearValue = (
  record: DefaultCnSelection,
  year: DefaultValueYear,
) => {
  if (year === '2026') return record.defaultValue2026;
  if (year === '2027') return record.defaultValue2027;
  return record.defaultValue2028Onwards;
};

export const getYearGrowthRate = (
  record: DefaultCnSelection,
  year: DefaultValueYear,
) => {
  if (year === '2026') return record.defaultValue2026GrowthRate;
  if (year === '2027') return record.defaultValue2027GrowthRate;
  return record.defaultValue2028OnwardsGrowthRate;
};

export const parseDefaultValue = (value?: string | number) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
};

/** 增长率由后端按存储值格式化为百分比展示，计算时还原为比例。 */
export const parseGrowthRate = (value?: string | number) => {
  if (value === undefined || value === null || value === '') return undefined;
  const normalizedValue = String(value).trim();
  const parsed = Number(normalizedValue.replace('%', ''));
  if (!Number.isFinite(parsed)) return undefined;
  return normalizedValue.includes('%') ? parsed / 100 : parsed;
};

/** 直接、间接排放分别按年份增长率计算，不使用总默认值。 */
export const calculateDefaultEmission = (
  baseValue?: string | number,
  growthRate?: string | number,
) => {
  const baseEmission = parseDefaultValue(baseValue);
  if (baseEmission === undefined) return undefined;
  const rate = parseGrowthRate(growthRate) || 0;
  return Number((baseEmission * (1 + rate)).toFixed(6));
};

export const isSameDefaultValue = (
  left?: string | number,
  right?: string | number,
) => {
  const leftValue = parseDefaultValue(left);
  const rightValue = parseDefaultValue(right);
  return (
    leftValue !== undefined &&
    rightValue !== undefined &&
    leftValue === rightValue
  );
};
