import { FormItem, FormLayout, Input } from '@formily/antd-v5';
import type { Form } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { FormilyUploadCrop } from '@src/components/FormilyUtil/FormilyUploadCrop';
import I18N from '@src/lang/I18N';
import FormilyClassRadios from '@src/views/carbonFootprint3/CarbonLabel/component/FormilyClassRadios';
import { useMemo } from 'react';

import { ApplicationPeriod } from './ApplicationPeriod';
import { EmissionInput } from './EmissionInput';
import { createApplicationSchema } from '../schema';
import type { ApplicationValues } from '../types';
import style from '../index.module.less';

const LabelType = () => (
  <div className={style.fixedValue}>
    {I18N.carbonAgent.labelApplication.labelType}
  </div>
);

const SchemaField = createSchemaField({
  components: {
    ApplicationPeriod,
    EmissionInput,
    FormItem,
    Input,
    FormilyUploadCrop,
    FormilyClassRadios,
    LabelType,
  },
});

export function ApplicationForm({
  form,
  disabled,
}: {
  form: Form<ApplicationValues>;
  disabled: boolean;
}) {
  const schema = useMemo(() => createApplicationSchema(form), [form]);
  return (
    <fieldset disabled={disabled} className={style.fieldset}>
      <FormilyCommon form={form} colon={false}>
        <FormLayout layout='vertical'>
          <SchemaField schema={schema} />
        </FormLayout>
      </FormilyCommon>
    </fieldset>
  );
}
