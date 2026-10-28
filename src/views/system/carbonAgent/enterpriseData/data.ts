import { jsonrepair } from 'jsonrepair';

import type {
  CarbonData,
  Company,
  EnterpriseConfirmation,
  EnterpriseFollow,
  EnterpriseReport,
  Metric,
  MetricKey,
} from './types';

export const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const optionalStrings = (item: Record<string, unknown>, keys: string[]) =>
  keys.every(key => item[key] == null || typeof item[key] === 'string');
const stringArray = (value: unknown) =>
  Array.isArray(value) && value.every(item => typeof item === 'string');

// 部分来源用中文标点拼接对象；仅转换对象外的分隔符，保留名称里的标点。
const normalizeFormerNameSeparators = (text: string) => {
  let quote = '';
  let escaped = false;
  let depth = 0;
  return Array.from(text, character => {
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = '';
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '{' || character === '[') {
      depth += 1;
    } else if (character === '}' || character === ']') {
      depth -= 1;
    } else if (depth === 0 && /[、，；]/.test(character)) {
      return ',';
    }
    return character;
  }).join('');
};

// 来源数据可能是名称、对象/数组，或使用单引号序列化的 formerName 对象。
export const formatFormerNames = (value: unknown): string => {
  const names = (input: unknown, depth = 0): string[] => {
    if (depth > 5 || input == null) return [];
    if (Array.isArray(input)) {
      return input.flatMap(item => names(item, depth + 1));
    }
    if (typeof input === 'object') {
      return names(record(input).formerName, depth + 1);
    }
    if (typeof input !== 'string') return [];
    const text = input.trim();
    if (!text) return [];
    if (text.startsWith('{') || text.startsWith('[')) {
      try {
        return names(
          JSON.parse(jsonrepair(normalizeFormerNameSeparators(text))),
          depth + 1,
        );
      } catch {
        // 不向用户展示无法识别的原始对象内容。
        return [];
      }
    }
    return [text];
  };
  return [...new Set(names(value))].join(' / ') || '—';
};

export const isCompany = (value: unknown): value is Company => {
  const item = record(value);
  return (
    typeof item.companyId === 'string' &&
    Boolean(item.companyId) &&
    typeof item.name === 'string' &&
    optionalStrings(item, [
      'unifiedSocialCreditCode',
      'industryCategory',
      'legalRepresentative',
      'companyState',
      'foundationDate',
      'registeredCapital',
      'registeredCapitalUnit',
      'companyType',
      'registeredAddress',
      'businessScope',
    ]) &&
    (item.labels == null || stringArray(item.labels)) &&
    (item.securities == null ||
      (Array.isArray(item.securities) &&
        item.securities.every(security => {
          const row = record(security);
          return (
            typeof row.code === 'string' &&
            optionalStrings(row, ['marketCode', 'name'])
          );
        })))
  );
};

export const isReport = (value: unknown): value is EnterpriseReport => {
  const item = record(value);
  return (
    typeof item.reportId === 'string' &&
    Boolean(item.reportId) &&
    optionalStrings(item, [
      'title',
      'reportType',
      'disclosureDate',
      'source',
      'linkUrl',
      'linkExpiresAt',
    ])
  );
};

export const isCarbonData = (value: unknown): value is CarbonData => {
  const item = record(value);
  return (
    isCompany(item.company) &&
    stringArray(item.years) &&
    (item.availableYears == null || stringArray(item.availableYears)) &&
    Array.isArray(item.metrics) &&
    item.metrics.every(metric => {
      const row = record(metric);
      return (
        typeof row.indicatorCode === 'string' &&
        typeof row.name === 'string' &&
        typeof row.statisticalPeriod === 'string' &&
        optionalStrings(row, [
          'valueNumeric',
          'valueText',
          'marketCode',
          'unit',
          'currency',
          'categoryCode',
          'categoryName',
        ]) &&
        (row.path == null || stringArray(row.path))
      );
    }) &&
    Array.isArray(item.sources) &&
    item.sources.every(isReport)
  );
};

// 原始单位参与行键，展示单位不参与匹配，避免合并不同来源口径。
export const metricKey = (metric: MetricKey) =>
  JSON.stringify([
    metric.indicatorCode,
    metric.marketCode ?? '',
    metric.unit ?? '',
    metric.currency ?? '',
  ]);

export const formatDecimal = (value: string): string => {
  const match = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(value.trim());
  if (!match) return value;
  const integer = match[2].replace(/^0+(?=\d)/, '');
  const fraction = (match[3] || '').replace(/0+$/, '');
  const sign = integer === '0' && !fraction ? '' : match[1];
  return `${sign}${integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${
    fraction ? `.${fraction}` : ''
  }`;
};

export const metricValue = (
  metric?: Pick<Metric, 'valueNumeric' | 'valueText'>,
) => {
  if (metric?.valueNumeric != null && metric.valueNumeric.trim() !== '') {
    return formatDecimal(metric.valueNumeric);
  }
  const text = metric?.valueText?.trim();
  return text && text !== '查看' ? text : '—';
};

export const displayUnit = (value?: string | null) =>
  value?.replace(/吨CO2e|tCO2e/g, 'tCO₂e') || '—';

export const hasUndisclosedScopeTwoBasis = (metric: Metric) => {
  const sourceLabel = [metric.name, ...(metric.path || [])].join(' ');
  return (
    /范围[二2]|範圍[二2]|scope\s*2/i.test(sourceLabel) &&
    !/市场|市場|位置|地点|地點|market|location/i.test(sourceLabel)
  );
};

export const metricRows = (groups: Metric[][]) => {
  const rows = new Map<string, Metric>();
  groups.flat().forEach(metric => {
    const key = metricKey(metric);
    if (!rows.has(key)) rows.set(key, metric);
  });
  return [...rows.values()];
};

export const comparisonYears = (companies: CarbonData[]) => {
  const lists = companies.map(company =>
    (company.availableYears || []).filter(year => /^[12]\d{3}$/.test(year)),
  );
  const years = [...new Set(lists.flat())].sort().reverse();
  const common = years.filter(year => lists.every(list => list.includes(year)));
  return { years, defaultYear: common[0] || years[0] || '' };
};

export const safeReportUrl = (value?: string | null) => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
};

export const isEnterpriseSection = (section: string) =>
  ['enterpriseFollows', 'enterpriseDetail', 'enterpriseCompare'].includes(
    section,
  );

export const clearEnterpriseNavigationParams = (search: URLSearchParams) => {
  search.delete('companyId');
  search.delete('resultId');
};

export const enterpriseSearch = (
  currentSearch: string,
  section: string,
  params: { companyId?: string; resultId?: string } = {},
) => {
  const search = new URLSearchParams(currentSearch);
  ['sessionId', 'projectId', 'companyId', 'resultId', 'shareAuth'].forEach(
    key => search.delete(key),
  );
  // 业务预览参数属于原会话，不携带到独立数据页。
  [...search.keys()]
    .filter(key => key.startsWith('preview'))
    .forEach(key => search.delete(key));
  search.set('section', section);
  if (params.companyId) search.set('companyId', params.companyId);
  if (params.resultId) search.set('resultId', params.resultId);
  return `?${search.toString()}`;
};

export const normalizeEnterpriseCardPayload = (
  value: unknown,
):
  | (Record<string, unknown> & { card: Record<string, unknown> })
  | undefined => {
  const root = record(value);
  const wrapper = Object.keys(record(root.safePayload)).length
    ? { ...record(root.safePayload), ...root }
    : root;
  const card = Object.keys(record(wrapper.card)).length
    ? record(wrapper.card)
    : wrapper;
  if (
    !['enterprise_candidates', 'enterprise_carbon_data'].includes(
      String(card.cardType),
    )
  ) {
    return undefined;
  }
  // 实时事件和最终响应统一保留一层 card，合并时整份替换最新快照。
  return { ...wrapper, card };
};

export const getEnterpriseCard = (value: unknown) => {
  const wrapper = normalizeEnterpriseCardPayload(value);
  if (!wrapper) return undefined;
  const { card } = wrapper;
  const data = record(card.data ?? card.snapshot);
  const resultId =
    typeof data.resultId === 'string'
      ? data.resultId
      : String(record(card.bizRef).resultId || '');
  return {
    type: card.cardType,
    data,
    resultId,
    blockId: String(
      wrapper.blockId || (resultId ? `enterprise_data_${resultId}` : ''),
    ),
    sessionId: typeof wrapper.sessionId === 'string' ? wrapper.sessionId : '',
  };
};

export const confirmationPayload = (
  confirmation: EnterpriseConfirmation,
  message: string,
  lang: string,
) => ({
  message,
  lang,
  formData: {
    enterpriseCompanyId: confirmation.company.companyId,
    enterpriseResultId: confirmation.resultId,
  },
});

/** 至少两家才可对比，最大数量由当前服务端权益决定。 */
export const isComparisonCountAllowed = (count: number, limit: number) =>
  Number.isInteger(limit) && count >= 2 && count <= limit;

/** 保留仍可参与对比的关注项，取消关注或套餐降级后同步清理选择。 */
export const retainSelectedCompanies = (
  selected: string[],
  follows: EnterpriseFollow[],
  limit: number,
) => {
  const valid = selected
    .filter(id =>
      follows.some(item => item.enterpriseId === id && item.company),
    )
    .slice(0, limit);
  return valid.length === selected.length &&
    valid.every((id, index) => id === selected[index])
    ? selected
    : valid;
};

export type GroupedMetricRow = {
  key: string;
  kind: 'group' | 'metric';
  group: string;
  title: string;
  metric?: Metric;
};
const scopeOrder = (metric: Metric) => {
  const label = [metric.name, ...(metric.path || [])].join(' ');
  const scope = /(?:范围|範圍|scope)\s*([一二三123、，,及和\s]+)/i
    .exec(label)?.[1]
    ?.replace(/\s|、|，|,|及|和/g, '')
    .replace(/一/g, '1')
    .replace(/二/g, '2')
    .replace(/三/g, '3');
  const order = ['1', '2', '3', '12', '23', '123'].indexOf(scope || '');
  return order < 0 ? 6 : order;
};
// 只组织展示顺序，不修改完整指标键、不合并市场法/位置法或不同单位。
export const groupedMetricRows = (metrics: Metric[][]): GroupedMetricRow[] => {
  const groups = new Map<string, { title: string; metrics: Metric[] }>();
  metricRows(metrics).forEach(metric => {
    const label = [metric.categoryName, ...(metric.path || []), metric.name]
      .filter(Boolean)
      .join(' ');
    const group = /强度|強度|intensity|单位营收|單位營收/i.test(label)
      ? 'intensity'
      : /碳排放量|排放总量|排放總量|emissions?/i.test(label)
      ? 'emissions'
      : `other:${
          metric.categoryCode ||
          metric.categoryName ||
          metric.path?.slice(0, -1).join('/') ||
          ''
        }`;
    const item = groups.get(group) || {
      title: metric.categoryName || metric.path?.slice(0, -1).join(' / ') || '',
      metrics: [],
    };
    item.metrics.push(metric);
    groups.set(group, item);
  });
  const order = [...groups.keys()].sort(
    (a, b) =>
      (a === 'emissions' ? 0 : a === 'intensity' ? 1 : 2) -
      (b === 'emissions' ? 0 : b === 'intensity' ? 1 : 2),
  );
  return order.flatMap(group => {
    const item = groups.get(group)!;
    return [
      ...(item.title || group === 'emissions' || group === 'intensity'
        ? [
            {
              key: `group:${group}`,
              kind: 'group' as const,
              group,
              title: item.title,
            },
          ]
        : []),
      ...item.metrics
        .sort((a, b) => scopeOrder(a) - scopeOrder(b))
        .map(metric => ({
          key: metricKey(metric),
          kind: 'metric' as const,
          group,
          title: metric.name,
          metric,
        })),
    ];
  });
};
