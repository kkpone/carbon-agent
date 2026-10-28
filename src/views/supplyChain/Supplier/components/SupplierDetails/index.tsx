import { Input, FormGrid, FormItem, Cascader } from '@formily/antd-v5';
import { Form, createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import FormilySupplierSelect, {
  supplierFieldEffect,
} from '@src/views/supplyChain/components/FormilySupplierSelect';
import { genSupplierSchema } from '@src/views/supplyChain/schema';
import { getInitialSupplierNumber } from '@src/views/supplyChain/service';
import { SupplierDetails as SupplierDetailsType } from '@src/views/supplyChain/type';
import {
  ForwardRefRenderFunction,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';

import { apiCity } from '@/api/api';

const SchemaField = createSchemaField({
  components: {
    FormGrid,
    FormItem,
    Input,
    FormilySupplierSelect,
    Cascader,
  },
});

type SupplierDetailsProps = {
  isAdd: boolean;
  supplierDetails?: SupplierDetailsType;
  readPretty?: boolean;
};

const SupplierDetails: ForwardRefRenderFunction<Form, SupplierDetailsProps> = (
  { isAdd, readPretty, supplierDetails },
  ref,
) => {
  const form = useMemo(
    () =>
      createForm({
        initialValues: supplierDetails,
        validateFirst: true,
        readPretty,
        effects: supplierFieldEffect,
      }),

    [supplierDetails, readPretty],
  );

  useImperativeHandle(ref, () => form, [form]);

  useEffect(() => {
    if (isAdd) {
      getInitialSupplierNumber().then(({ data }) => {
        form.setValues({
          companyNumber: data.data.companyNumber,
        });
      });
    }
  }, [isAdd, form]);

  useEffect(() => {
    apiCity().then(options => {
      form.query('area')?.take()?.setComponentProps({
        options,
      });
    });
  }, [form]);
  return (
    <FormilyCommon form={form}>
      <SchemaField
        schema={genSupplierSchema({
          supplierResult: supplierDetails?.inviteStatus,
        })}
      />
    </FormilyCommon>
  );
};

export default forwardRef(SupplierDetails);
