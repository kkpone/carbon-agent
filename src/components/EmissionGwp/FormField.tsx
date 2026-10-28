import { Field, useForm, observer } from '@formily/react';
import { useContext } from 'react';

import GwpField from './components/GwpField';
import { GwpRecordContext, GwpScopeContext } from './context';
import { isValidGwpValue } from './types';

export const GwpFormField = observer(() => {
  const form = useForm();
  const explicitScope = useContext(GwpScopeContext);
  const target = useContext(GwpRecordContext);
  if (!explicitScope) return null;

  const recordKey = `${target.recordKey}:${form.values.emissionId ?? ''}`;
  return (
    <>
      <Field name='greenhouseGas' validator={{ max: 100 }} />
      <Field
        name='gwpValue'
        validator={value =>
          value === undefined || value === null || value === ''
            ? '请输入GWP数值'
            : isValidGwpValue(value)
            ? ''
            : 'GWP数值必须大于0，且最多两位小数'
        }
      />
      <GwpField
        key={recordKey}
        readOnly={!!(target.readOnly || form.readPretty)}
        disabled={form.disabled}
      />
    </>
  );
});

// The layout is void; its two child fields are persisted at the form root.
export const gwpFieldSchema = {
  type: 'void',
  'x-component': GwpFormField,
};
