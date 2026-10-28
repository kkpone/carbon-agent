import { observer, useForm } from '@formily/react';

import style from '../index.module.less';
import type { ApplicationValues } from '../types';

/** 单位排放量完全来自核算接口，使用与标签类型一致的只读样式。 */
export const EmissionInput = observer(({ value = '' }: { value?: string }) => {
  const form = useForm<ApplicationValues>();
  const emissionUnit = form.values.perEmissionUnit?.trim();
  const productUnit = form.values.productUnitName?.trim();
  const unit =
    emissionUnit && productUnit
      ? `${emissionUnit}/${productUnit}`
      : emissionUnit || '';

  return (
    <div className={style.fixedValue} aria-readonly='true'>
      {value || '-'}
      {unit ? ` ${unit}` : ''}
    </div>
  );
});
