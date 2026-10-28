import type { Form, ObjectField } from '@formily/core';

/** 标识当前排放源及运输行，阻止复用详情写回已经切换的表单。 */
export function getSavedFactorTarget(form: Form, field: ObjectField): string {
  return JSON.stringify([
    form.id,
    String(field.address),
    form.getValuesIn('id'),
    form.getValuesIn('emissionId'),
    form.getValuesIn('accountId'),
    form.getValuesIn('dataId'),
    field.parent?.path ? form.getValuesIn(`${field.parent.path}.id`) : null,
  ]);
}
