import { Form, Input, FormGrid, Select, FormItem } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { isNil } from 'lodash-es';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { getSupplierList } from '../../Management/service';
import { getProductList } from '../../ProductList/service';
import {
  CARBON_DATA_REQ_TYPE,
  CARBON_DATA_REQ_TYPE_LABEL,
  INVITE_STATUS,
  SUPPLIER_STATUS,
} from '../../constant';

const SchemaField = createSchemaField({
  components: {
    Input,
    FormGrid,
    Select,
    FormItem,
  },
});

const InitiateFillModal: FC<{
  open: boolean;
  onConfirm: (val: Record<string, any>) => Promise<void> | void;
  onCancel: () => void;
}> = ({ open, onCancel, onConfirm }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const form = useMemo(() => createForm(), [open]);

  const productListRef = useRef<Record<string, any>[]>([]);
  const supplierList = useRef<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);

  const generateName = () => {
    const { purchaseGoodsSupplierId, supplierIds, reqType } = form.values as {
      supplierIds: number[];
      purchaseGoodsSupplierId: number;
      reqType: number;
    };

    if (!isNil(reqType) && supplierIds && supplierIds.length === 1) {
      const supplierName = supplierList.current.find(
        item => item.supplierId === supplierIds[0],
      )?.companyName;

      if (reqType === CARBON_DATA_REQ_TYPE.ENTERPRISE) {
        form.setValues({
          name: I18N.template(I18N.supplyChain.suppl2, {
            val1: supplierName || '',
          }),
        });
      } else if (
        reqType === CARBON_DATA_REQ_TYPE.FOOTPRINT &&
        purchaseGoodsSupplierId
      ) {
        form.setValues({
          name: `${supplierName || ''}-${
            productListRef.current.find(
              item => item.purchaseGoodsId === purchaseGoodsSupplierId,
            )?.name
          }`,
        });
      }
    }
  };

  const submit = async () => {
    try {
      setLoading(true);
      const val = (await form.submit()) as Record<string, any>;
      await onConfirm(val);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (open) {
      getProductList({ pageNum: 1, pageSize: 100000 }).then(({ data }) => {
        productListRef.current = data.rows;
        form.query('purchaseGoodsSupplierId').take()?.setComponentProps({
          options: data.rows,
        });
      });

      getSupplierList({
        pageNum: 1,
        pageSize: 100000,
        inviteStatus: INVITE_STATUS.COMPLETE,
        status: SUPPLIER_STATUS.ENABLED,
      }).then(({ data }) => {
        supplierList.current = data.rows;
        form.query('supplierIds').take()?.setComponentProps({
          options: data.rows,
        });
      });
    }
  }, [form, open]);

  return (
    <Modal
      title={I18N.esg.initiateTheFillingProcess2}
      width={744}
      open={open}
      okButtonProps={{ loading }}
      onCancel={onCancel}
      onOk={submit}
    >
      <Form form={form} layout='vertical' colon={false}>
        <SchemaField
          schema={{
            type: 'object',
            properties: {
              grid: {
                type: 'void',
                'x-component': 'FormGrid',
                'x-component-props': {
                  maxColumns: 2,
                  columnGap: 24,
                },
                properties: {
                  reqType: {
                    title: I18N.supplyChain.typeOfFilling,
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Select',
                    'x-component-props': {
                      placeholder: I18N.supplyChain.typeOfFilling,
                      options: Object.values(CARBON_DATA_REQ_TYPE).map(
                        value => ({
                          value,
                          label: CARBON_DATA_REQ_TYPE_LABEL[value],
                        }),
                      ),
                      onChange: generateName,
                    },
                  },
                  purchaseGoodsSupplierId: {
                    title: I18N.carbonFootprint3.product,
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Select',
                    'x-component-props': {
                      placeholder: I18N.carbonFootprint3.product,
                      fieldNames: {
                        value: 'purchaseGoodsId',
                        label: 'name',
                      },
                      onChange: (_, opt: { name: string }) => {
                        form.setValues({ productName: opt.name });
                        generateName();
                      },
                    },
                    'x-reactions': {
                      dependencies: ['.reqType'],
                      fulfill: {
                        schema: {
                          'x-visible': `{{$deps[0] == ${CARBON_DATA_REQ_TYPE.FOOTPRINT}}}`,
                        },
                      },
                    },
                  },
                  supplierIds: {
                    title: I18N.carbonFootprint3.supplier,
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Select',
                    'x-component-props': {
                      placeholder: I18N.carbonFootprint3.supplier,
                      mode: 'multiple',
                      fieldNames: {
                        value: 'supplierId',
                        label: 'companyName',
                      },
                      onChange: generateName,
                    },
                  },
                  name: {
                    title: I18N.supplyChain.fillInTheName,
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Input',
                    'x-component-props': {
                      placeholder: I18N.supplyChain.fillInTheName,
                    },
                    'x-reactions': {
                      dependencies: ['.supplierIds'],
                      fulfill: {
                        schema: {
                          'x-visible': `{{($deps[0] || []).length <= 1}}`,
                        },
                      },
                    },
                  },
                },
              },
              descr: {
                title: I18N.supplyChainCarbonManagement.fillingRequirements,
                'x-decorator': 'FormItem',
                'x-component': 'Input.TextArea',
                'x-component-props': {
                  placeholder:
                    I18N.supplyChainCarbonManagement.fillingRequirements,
                },
              },
            },
          }}
        />
      </Form>
    </Modal>
  );
};

export default InitiateFillModal;
