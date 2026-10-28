import { isNil } from 'lodash-es';

import { FORMULA_TOKEN_TYPE } from '@/components/FormulaInput';

export type FormulaListToken = {
  type: number;
  value: string;
  label?: string;
};

/** 括号内文案仅由匹配到的 `paramItem.defaultValue` 与 `paramItem.unitName`（字符串）拼接，无其它字段兜底。 */
function formatParamParenInner(param?: Record<string, any>): string {
  if (!param) return '';
  const chunks: string[] = [];

  if (!isNil(param.defaultValue)) {
    chunks.push(String(param.defaultValue));
  }

  if (param.unitName != null) {
    chunks.push(String(param.unitName));
  }

  return chunks.join('');
}

/**
 * Hover 公式详情：运算符/常量照旧；PARAM 使用 `formula` 片段的 `value` 与 `paramItem[].id` 匹配，
 * 括号内数值、单位分别仅来自该项的 `defaultValue`、`unitName`。
 */
export function buildFormulaHoverDetail(
  formula?: FormulaListToken[],
  paramItem?: Record<string, any>[],
): string {
  if (!formula?.length) {
    return '';
  }

  const paramMap = new Map<string, Record<string, any>>();
  (paramItem ?? []).forEach(p => {
    paramMap.set(String(p.id), p);
  });

  const segments: string[] = [];
  formula.forEach(item => {
    const t = Number(item.type);
    if (t === FORMULA_TOKEN_TYPE.OPERATOR) {
      const raw = String(item.label ?? item.value ?? '').trim();
      if (raw) {
        segments.push(raw);
      }
    } else if (t === FORMULA_TOKEN_TYPE.CONSTANT) {
      const raw = String(item.label ?? item.value ?? '').trim();
      if (raw) {
        segments.push(raw);
      }
    } else if (t === FORMULA_TOKEN_TYPE.PARAM) {
      const param = paramMap.get(String(item.value));
      const name = String(param?.name ?? item.label ?? '').trim();
      const inner = formatParamParenInner(param);
      let seg = '';
      if (inner && name) {
        seg = `${name}（${inner}）`;
      } else if (inner && !name) {
        seg = `（${inner}）`;
      } else if (name) {
        seg = name;
      }
      if (seg) {
        segments.push(seg);
      }
    }
  });

  return segments.join(' ');
}
