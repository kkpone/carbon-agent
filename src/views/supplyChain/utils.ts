import { Dicts } from '@src/hooks/useFieldUnitDictSource';

/**
 * 将后端 computationUnit 转为 Cascader 回显值。
 * 正常格式 "2,67" 直接 split；仅返回子级 "67" 时从 FactorUnitDict 反查父级。
 */
export const parseComputationUnitForCascader = (
  computationUnit: string | string[] | undefined,
): string[] | undefined => {
  if (typeof computationUnit !== 'string') {
    return computationUnit;
  }

  const parts = computationUnit.split(',');
  if (parts.length >= 2) {
    return parts;
  }

  const unitOptionsLocal = localStorage.getItem('FactorUnitDict');
  const unitOptions: Dicts[] = unitOptionsLocal
    ? JSON.parse(unitOptionsLocal)
    : [];
  const child = unitOptions.find(op => op.dictValue === parts[0]);
  const parent = unitOptions.find(op => op.dictValue === child?.sourceType);
  if (parent && child) {
    return [parent.dictValue, child.dictValue];
  }

  return parts;
};

export const transformFilterObj = (
  filterObj: Record<string, (string | number | boolean | bigint)[] | null>,
) => {
  const transformedObj: Record<string, string | null> = {};

  Object.keys(filterObj).forEach(key => {
    if (Object.prototype.hasOwnProperty.call(filterObj, key)) {
      transformedObj[key] =
        filterObj[key] instanceof Array ? filterObj[key]!.join() : null;
    }
  });

  return transformedObj;
};
