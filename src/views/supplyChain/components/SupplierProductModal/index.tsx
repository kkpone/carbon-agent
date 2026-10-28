import I18N from '@src/lang/I18N';
import {
  Input,
  Cascader,
  FormGrid,
  FormItem,
  NumberPicker,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import { Modal } from 'antd';
import { FC, useMemo, useState } from 'react';

import { genPurchaseProductSchema } from '../../schema';
import { SupplierProduct } from '../../type';
import { parseComputationUnitForCascader } from '../../utils';

const SchemaField = createSchemaField({
  components: {
    FormGrid,
    FormItem,
    Input,
    Cascader,
    NumberPicker,
  },
});

type SupplierProductModalProps = {
  visible: boolean;
  supplierProduct?: SupplierProduct | null;
  onCancel: () => void;
  onOk: (values: SupplierProduct) => void | Promise<void>;
};

const SupplierProductModal: FC<SupplierProductModalProps> = ({
  visible,
  supplierProduct,
  onCancel,
  onOk,
}) => {
  const form = useMemo(
    () =>
      createForm({
        initialValues: supplierProduct
          ? {
              ...supplierProduct,
              computationUnit: parseComputationUnitForCascader(
                supplierProduct.computationUnit,
              ),
            }
          : undefined,
        validateFirst: true,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible, supplierProduct],
  );

  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    const formValues = await form.submit<
      Omit<SupplierProduct, 'computationUnit'> & { computationUnit: string[] }
    >();
    try {
      setLoading(true);
      await onOk({
        ...formValues,
        computationUnit: formValues.computationUnit.join(','),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        supplierProduct
          ? I18N.carbonFootprint3.editProduct
          : I18N.carbonFootprint3.addProduct
      }
      open={visible}
      width={688}
      okButtonProps={{
        loading,
      }}
      onCancel={onCancel}
      onOk={onConfirm}
    >
      <FormilyCommon form={form}>
        <SchemaField
          schema={genPurchaseProductSchema({
            columns: 2,
            columnGap: 16,
            showUnitPriceField: true,
          })}
          scope={{ useFieldUnitDictSource }}
        />
      </FormilyCommon>
    </Modal>
  );
};

export default SupplierProductModal;
