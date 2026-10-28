/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-10 19:32:17
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-25 17:25:47
 */
import { Field, onFieldChange } from '@formily/core';
import { useForm } from '@formily/react';

const useFieldSetValueByLabel = (field: Field) => {
  const form = useForm();

  const fieldPath = field.address.toString();

  const effectId = `${fieldPath}_${Date.now()}`;

  field.onMount = () => {
    form.addEffects(effectId, () => {
      onFieldChange(fieldPath, ['dataSource', 'data'], () => {
        const { dataSource, data } = field;
        const unitDicts = dataSource;

        const { value, label } =
          (data as { label: string | number; value: string | number }) || {};
        if (unitDicts?.length > 0 && (value || label)) {
          for (const dict of unitDicts) {
            for (const childDict of dict.children || []) {
              if (childDict.value === value || childDict.label === label) {
                // field.onInput(
                //   [dict.value, childDict.value],
                //   [
                //     { value: dict.value, label: dict.label },
                //     { value: childDict.value, label: childDict.label },
                //   ],
                // );
                field.setValue([dict.value, childDict.value]);

                // form.modified = false;
                return;
              }
            }
          }
        }
      });
      onFieldChange(fieldPath, ['dataSource', 'value'], () => {
        const { dataSource, value } = field;
        const unitDicts = dataSource;

        if (value?.length === 1) {
          if (unitDicts?.length > 0 && value) {
            for (const dict of unitDicts) {
              for (const childDict of dict.children || []) {
                if (childDict.value === value?.[0]) {
                  field.setValue([dict.value, childDict.value]);
                  return;
                }
              }
            }
          }
        }
      });
    });
  };
  field.onUnmount = () => {
    form.removeEffects(effectId);
  };
};

export default useFieldSetValueByLabel;
