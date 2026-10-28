import { FormItem, Input, FormGrid } from '@formily/antd-v5';
import { Field, createForm } from '@formily/core';
import { connect, createSchemaField, mapProps } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { GetComponentProps } from '@src/utils/utilTypes';
import { useCreation } from 'ahooks';
import { Modal, Select } from 'antd';
import { isNil } from 'lodash-es';
import { FC, useEffect } from 'react';

import {
  addProductType,
  checkProductTypeRepeat,
  editProductType,
  getInitProductTypeCode,
  getProductTypeInfo,
  getSimpleProductList,
} from '../service';

type ProductTypeModalProps = {
  visible: boolean;
  id?: number;
  onClose: () => void;
  onSuccess: () => void;
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    Select: connect(
      (props: GetComponentProps<typeof Select>) => {
        const { options, ...rest } = props;
        return (
          <Select {...rest}>
            {(options || []).map(({ value, label, specification }) => (
              <Select.Option value={value} key={value}>
                <>
                  <div>{label}</div>
                  <div>{specification || '-'}</div>
                </>
              </Select.Option>
            ))}
          </Select>
        );
      },
      mapProps({ value: true }, (props, field) => ({
        ...props,
        options: (field as Field).dataSource || props.options,
      })),
    ),
    Input,
  },
});
const ProductTypeModal: FC<ProductTypeModalProps> = ({
  visible,
  id,
  onClose,
  onSuccess,
}) => {
  const form = useCreation(
    () =>
      createForm({
        validateFirst: true,
      }),
    [visible],
  );

  const onConfirm = async () => {
    const values = await form.submit<Parameters<typeof addProductType>[0]>();
    values.productIds = values.productIds || [];

    if (isNil(id)) {
      await addProductType(values);
      Toast('success', I18N.carbonFootprint.successfullyAdded);
    } else {
      await editProductType({ ...values, id });
      Toast('success', I18N.carbonFootprint.editSuccessful);
    }

    onClose();
    onSuccess();
  };

  useEffect(() => {
    if (visible) {
      getSimpleProductList().then(({ data }) => {
        form.setFieldState('productIds', {
          dataSource: (data.data || []).map(
            ({ id: productId, productName, specification }) => ({
              value: productId,
              label: productName,
              specification,
            }),
          ),
        });
      });
      if (isNil(id)) {
        getInitProductTypeCode().then(({ data }) => {
          form.setValues({ typeCode: data.data.typeCode });
        });
      } else {
        form.setFieldState('typeCode', {
          disabled: true,
        });
        getProductTypeInfo({ id }).then(({ data }) => {
          const { typeName, typeCode, remark, productIds } = data.data || {};
          form.setValues({
            typeName,
            typeCode,
            productIds,
            remark,
          });
        });
      }
    }
  }, [visible, id, form]);

  return (
    <Modal
      title={
        isNil(id)
          ? I18N.carbonFootprint3.addProductPoints
          : I18N.carbonFootprint3.editProductScore
      }
      width={704}
      open={visible}
      onCancel={onClose}
      onOk={onConfirm}
    >
      <FormilyCommon form={form}>
        <SchemaField
          schema={{
            type: 'object',
            properties: {
              grid: {
                type: 'void',
                'x-component': 'FormGrid',
                'x-component-props': {
                  maxColumns: 2,
                  columnGap: 16,
                },
                properties: {
                  typeName: {
                    type: 'string',
                    title: I18N.carbonFootprint3.productCategoryName2,
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Input',
                    'x-component-props': {
                      maxLength: 100,
                      placeholder: I18N.carbonFootprint3.pleaseEnterTheProduct,
                    },
                    'x-validator': [
                      {
                        required: true,
                        message: I18N.carbonFootprint3.pleaseEnterTheProduct,
                      },
                      {
                        triggerType: 'onBlur',
                        validator: async (val: string) => {
                          if (!val) {
                            return '';
                          }
                          const { data } = await checkProductTypeRepeat({
                            id,
                            typeName: val,
                          });

                          return data.data
                            ? I18N.carbonFootprint3.productCategoryName
                            : '';
                        },
                      },
                    ],
                  },
                  typeCode: {
                    type: 'string',
                    title: I18N.carbonFootprint3.classificationCoding,
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Input',
                    'x-component-props': {
                      placeholder: I18N.carbonFootprint3.pleaseEnterACategory,
                    },
                    'x-validator': [
                      {
                        required: true,
                        message: I18N.carbonFootprint3.pleaseEnterACategory,
                      },
                      {
                        triggerType: 'onBlur',
                        validator: async (val: string) => {
                          if (!val) {
                            return '';
                          }
                          const { data } = await checkProductTypeRepeat({
                            id,
                            typeCode: val,
                          });

                          return data.data
                            ? I18N.carbonFootprint3.productCategoryName
                            : '';
                        },
                      },
                    ],
                  },
                  productIds: {
                    type: 'string',
                    title: I18N.carbonFootprint.selectProduct,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      gridSpan: 2,
                    },
                    'x-component': 'Select',
                    'x-component-props': {
                      mode: 'multiple',
                      placeholder: I18N.carbonFootprint3.pleaseSelectAProduct,
                      filterOption: (
                        searchValue: string,
                        option: { label: string },
                      ) => (option.label || '').includes(searchValue),
                    },
                  },
                  remark: {
                    type: 'string',
                    title: I18N.carbonFootprint.remarks,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      gridSpan: 2,
                    },
                    'x-component': 'Input.TextArea',
                    'x-component-props': {
                      maxLength: 500,
                      placeholder: I18N.carbonFootprint.remarks,
                    },
                  },
                },
              },
            },
          }}
        />
      </FormilyCommon>
    </Modal>
  );
};

export default ProductTypeModal;
