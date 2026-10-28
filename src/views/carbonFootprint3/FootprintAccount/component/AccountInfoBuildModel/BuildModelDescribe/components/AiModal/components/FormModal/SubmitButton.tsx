import { ObjectField, onFieldChange } from '@formily/core';
import { connect, mapProps, useField, useForm } from '@formily/react';
import { toJS } from '@formily/reactive';
import I18N from '@src/lang/I18N';
import { Button } from 'antd';
import { cloneDeep } from 'lodash-es';
import { FC, useEffect, useState } from 'react';

import { Toast } from '@/utils';

interface ISubmitButtonProps {
  // showDrawer: (id: number) => void;
  submit: (data: any) => Promise<void>;
  // text: string;
}

const SubmitButtonComponent: FC<ISubmitButtonProps> = props => {
  const field = useField();
  const form = useForm();
  const [changed, setChanged] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.addEffects(`${field.path}.changed`, () => {
      onFieldChange(`${field.path.pop()}.set`, field => {
        setChanged(field.value?.changed);
      });
    });
  }, [form, field]);

  const submit = async () => {
    if (changed) {
      await form.query(`${field.path.pop()}.name`).take()?.validate();
      await form.query(`${field.path.pop()}.amountObj`).take()?.validate();
      await form.query(`${field.path.pop()}.type`).take()?.validate();
      await form.query(`${field.path.pop()}.unit`).take()?.validate();

      await form
        .query(`${field.path.pop()}.accountEmissionTransportList`)
        .take()
        ?.validate();
      const expandFormValue = form
        .query(`${field.path.pop()}.accountEmissionTransportList`)
        .take()?.value;
      const hasEmpty = expandFormValue?.some((item: any) => {
        if (item.transportType === 1 && (item.way === 2 || item.way === 3)) {
          return false;
        }
        return (
          !item.transportType ||
          !item.amount ||
          !item.unitCode ||
          !item.distance
        );
      });
      if (hasEmpty) {
        Toast('error', I18N.carbonFootprint3.pleaseFillInTheFormCompletely);
        return;
      }
      const setValue = field
        .query(field.path.toString()?.replace('submit', 'set'))
        ?.get('value');
      const formValue = toJS(cloneDeep(form.values));
      const submitInfo = formValue.AiDataList.find(
        item => item.key === setValue.id,
      );
      setLoading(true);
      await props.submit(submitInfo).finally(() => {
        setLoading(false);
      });

      const setField = form
        .query(`${field.path.pop()}.set`)
        .take() as ObjectField;
      setTimeout(() => {
        setField?.setValue({
          ...setField.value,
          changed: false,
        });
      }, 300);
    }
  };
  if (!changed) {
    return null;
  }
  return (
    <Button
      type='link'
      loading={loading}
      style={{
        padding: '7px 8px',
      }}
      onClick={() => {
        if (changed) {
          submit();
        }
      }}
    >
      {I18N.carbonFootprint.preserve}
    </Button>
  );
};

export const SubmitButton = connect(
  SubmitButtonComponent,
  mapProps({ value: true }, props => ({
    ...props,
  })),
);
