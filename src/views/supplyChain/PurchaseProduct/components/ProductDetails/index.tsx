import {
  Input,
  Cascader,
  FormGrid,
  FormItem,
  NumberPicker,
} from '@formily/antd-v5';
import { Form, createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import { isNil } from 'lodash-es';
import {
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useMemo,
  useEffect,
} from 'react';

import { parseComputationUnitForCascader } from '../../../utils';
import { genPurchaseProductSchema } from '../../../schema';
import { getPurchaseProductDetails } from '../../service';

const SchemaField = createSchemaField({
  components: {
    FormGrid,
    FormItem,
    Input,
    Cascader,
    NumberPicker,
  },
});

type ProductDetailsProps = {
  id?: number;
  readPretty?: boolean;
};

const ProductDetails: ForwardRefRenderFunction<Form, ProductDetailsProps> = (
  { id, readPretty },
  ref,
) => {
  const form = useMemo(() => createForm({ readPretty }), [readPretty]);

  useImperativeHandle(ref, () => form, [form]);

  useEffect(() => {
    if (!isNil(id)) {
      getPurchaseProductDetails({ purchaseGoodsId: id }).then(({ data }) => {
        const productDetails = data.data;
        form.setValues({
          ...productDetails,
          computationUnit: parseComputationUnitForCascader(
            productDetails.computationUnit,
          ),
        });
      });
    }
  }, [id, form]);

  return (
    <FormilyCommon form={form}>
      <SchemaField
        schema={genPurchaseProductSchema({ showPriceField: false })}
        scope={{ useFieldUnitDictSource }}
      />
    </FormilyCommon>
  );
};
export default forwardRef(ProductDetails);
