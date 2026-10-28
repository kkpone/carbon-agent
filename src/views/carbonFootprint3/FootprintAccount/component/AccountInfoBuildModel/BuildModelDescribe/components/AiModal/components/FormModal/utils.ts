import { Field, Form } from '@formily/core';

export const setChanged = (form: Form, field: Field) => {
  const tempListSet = () => field.query('.set').get('value');

  const getSetPath = () => field.query('.set').take()?.path;

  if (tempListSet()?.changed) return;

  const path = getSetPath();
  if (path) {
    form.setValuesIn(path, {
      ...tempListSet(),
      changed: true,
    });
  }
};
