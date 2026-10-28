import { Input, FormGrid, FormItem, Cascader } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import I18N from '@src/lang/I18N';
import FormilySupplierSelect, {
  supplierFieldEffect,
} from '@src/views/supplyChain/components/FormilySupplierSelect';
import { Modal } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

import { apiCity } from '@/api/api';

import { genSupplierSchema } from '../../schema';
import { getInitialSupplierNumber } from '../../service';
import { SupplierDetails } from '../../type';

const SchemaField = createSchemaField({
  components: {
    FormGrid,
    FormItem,
    Input,
    FormilySupplierSelect,
    Cascader,
  },
});

type ProductSupplierModalProps = {
  visible: boolean;
  productSupplier?: SupplierDetails | null;
  onCancel: () => void;
  onOk: (values: SupplierDetails) => void | Promise<void>;
};

const ProductSupplierModal: FC<ProductSupplierModalProps> = ({
  visible,
  productSupplier,
  onCancel,
  onOk,
}) => {
  const form = useMemo(
    () =>
      createForm({
        initialValues: productSupplier ?? undefined,
        effects: supplierFieldEffect,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible, productSupplier],
  );

  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    const formValues = await form.submit<SupplierDetails>();

    try {
      setLoading(true);
      await onOk({
        ...formValues,
        area: formValues.area ? JSON.stringify(formValues.area) : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productSupplier) {
      getInitialSupplierNumber().then(({ data }) => {
        form.setValues({
          companyNumber: data.data.companyNumber,
        });
      });
    }
  }, [productSupplier, form]);

  useEffect(() => {
    if (visible) {
      apiCity().then(options => {
        form.query('area')?.take()?.setComponentProps({
          options,
        });
      });
    }
  }, [form, visible]);

  return (
    <Modal
      title={
        productSupplier
          ? I18N.supplyChain.editSupplier
          : I18N.router.invitingSuppliers
      }
      open={visible}
      width={688}
      okText={
        productSupplier
          ? I18N.carbonFootprint.preserve
          : I18N.supplyChain.initiateInvitation
      }
      okButtonProps={{
        loading,
      }}
      onCancel={onCancel}
      onOk={onConfirm}
    >
      <FormilyCommon form={form}>
        <SchemaField
          schema={genSupplierSchema({
            columns: 2,
            supplierResult: productSupplier?.inviteStatus,
          })}
        />
      </FormilyCommon>
    </Modal>
  );
};

export default ProductSupplierModal;
