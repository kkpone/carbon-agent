import { Cascader, Form, FormItem, Input, Select } from '@formily/antd-v5';
import { createForm, Field as FieldType, onFieldChange } from '@formily/core';
import { Field } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Modal } from 'antd';
import { isNil } from 'lodash-es';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { FormilyUploadCrop } from '@/components/FormilyUtil/FormilyUploadCrop';
import useFieldUnitDictSource from '@/hooks/useFieldUnitDictSource';

import styles from './index.module.less';
import {
  getAccountProductAddInit,
  getAccountProductInfo,
  getSimpleProductTypeList,
} from '../../FootprintAccount/service';
import { AMOUNT, MAX_DECIMAL_PLACE } from '../../discharge/process/constant';
import { genNumberValidator } from '../../util';
import FormilyImgUpload from '../FormilyImgUpload';

type ProductModalProps = {
  open: boolean;
  id?: number;
  isCopy?: boolean;
  productType?: string;
  onCancel: () => void;
  onConfirm: (val: Record<string, any>) => Promise<void> | void;
  onConfirmAndCreateAccount?: (
    val: Record<string, any>,
  ) => Promise<void> | void;
};

const ProductModal: FC<ProductModalProps> = ({
  open,
  id,
  isCopy,
  productType,
  onCancel,
  onConfirm,
  onConfirmAndCreateAccount,
}) => {
  const form = useMemo(
    () =>
      createForm({
        effects() {
          onFieldChange('unit', ['dataSource'], field => {
            const unitField = field as FieldType;
            if (unitField.dataSource && unitField.dataSource.length > 0) {
              const weightUnits = unitField.dataSource.find(
                unit => unit.value === '1',
              );
              form.setFieldState('perUnitCode', {
                dataSource: weightUnits?.children,
              });
            }
          });
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );

  const manualProductTypeRef = useRef(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const isAdd = isNil(id);

  const submit = async ({ createAccount }: { createAccount: boolean }) => {
    try {
      setSubmitLoading(true);
      const {
        unit,
        productType: productTypeValue,
        productPic,
        ...data
      } = await form.submit<{
        unit: string[];
        productType: string;
        productPic: { url: string }[];
      }>();
      const [unitType, accountUnitCode] = unit;

      const postData = {
        ...data,
        unitType,
        accountUnitCode,
        id: !isCopy ? id : undefined,
        productPic: productPic?.[0]?.url || '',
        productType: manualProductTypeRef.current
          ? undefined
          : productTypeValue,
        productTypeName: manualProductTypeRef.current
          ? productTypeValue
          : undefined,
      };

      if (createAccount) {
        await onConfirmAndCreateAccount?.(postData);
      } else {
        await onConfirm(postData);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    getSimpleProductTypeList().then(({ data }) => {
      form.setFieldState('productType', {
        dataSource: data.data.map(({ typeCode, typeName }) => ({
          value: typeCode,
          label: typeName,
        })),
      });
    });

    if (isAdd || isCopy) {
      getAccountProductAddInit().then(({ data }) => {
        form.setValues({
          productCode: data.data.productCode,
        });
      });
    }

    if (isAdd) {
      form.setValues({ productType });
    } else {
      getAccountProductInfo({ id }).then(({ data }) => {
        const {
          unitType,
          accountUnitCode,
          productName,
          productPic,
          productCode,
          ...rest
        } = data.data;
        form.setValues({
          ...rest,
          ...(!isCopy ? { productCode } : {}),
          productName: isCopy ? `${productName}-copy` : productName,
          unit: [unitType, accountUnitCode],
          productPic: productPic ? [{ url: productPic }] : undefined,
        });
      });
    }
  }, [open, id, isCopy, productType, isAdd, form]);

  return (
    <Modal
      open={open}
      width={888}
      className={styles.productModal}
      centered
      // eslint-disable-next-line no-nested-ternary
      title={
        isNil(id)
          ? I18N.carbonFootprint3.newProductsAdded
          : isCopy
          ? I18N.router.copyingProducts
          : I18N.carbonFootprint3.editProduct
      }
      footer={
        <>
          <Button onClick={onCancel}>{I18N.carbonFootprint.cancel}</Button>
          <Button
            type='primary'
            loading={submitLoading}
            onClick={() => submit({ createAccount: false })}
          >
            {I18N.carbonFootprint.preserve}
          </Button>
          {onConfirmAndCreateAccount && (
            <Button
              loading={submitLoading}
              onClick={() => submit({ createAccount: true })}
            >
              {I18N.carbonFootprint3.saveAndCreate}
            </Button>
          )}
        </>
      }
      onClose={onCancel}
      onCancel={onCancel}
    >
      <Form
        className={styles.productForm}
        form={form}
        layout='vertical'
        colon={false}
      >
        <div className={styles.productBaseInfoRow}>
          <div className={styles.productPicUploadWrapper}>
            <Field
              name='productPic'
              decorator={[FormItem]}
              component={[
                FormilyUploadCrop,
                {
                  className: styles.productPicUpload,
                  innerDesc: I18N.carbonFootprint3.supportPng9,
                },
              ]}
            />
          </div>
          <div className={styles.productNameWrapper}>
            <Field
              name='productName'
              title={I18N.carbonFootprint.productName}
              required
              decorator={[FormItem]}
              component={[
                Input,
                {
                  maxLength: 50,
                  placeholder: I18N.carbonFootprint.productName,
                },
              ]}
            />
            <Field
              name='productCode'
              title={I18N.carbonFootprint.productCode}
              required
              decorator={[FormItem]}
              component={[
                Input,
                {
                  maxLength: 50,
                  placeholder: I18N.carbonFootprint.productCode,
                },
              ]}
            />
          </div>
        </div>
        <div className={styles.productInfoRow}>
          <Field
            name='specification'
            title={I18N.carbonFootprint.specificationAndModel}
            decorator={[FormItem]}
            component={[
              Input,
              {
                maxLength: 100,
                placeholder: I18N.carbonFootprint.specificationAndModel,
              },
            ]}
          />
          <Field
            name='unit'
            title={I18N.carbonFootprint.unit}
            required
            decorator={[FormItem]}
            component={[
              Cascader,
              {
                placeholder: I18N.carbonFootprint.unit,
                showSearch: {
                  filter: (inputValue: string, path: { label: string }[]) =>
                    path.some(option =>
                      option.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase()),
                    ),
                },
                onChange: (_, opt: { label: string }[]) => {
                  form.setValues({ accountUnitName: opt?.[1]?.label });
                },
              },
            ]}
            reactions={[useFieldUnitDictSource('factorUnitM')]}
          />
        </div>
        <div className={styles.productInfoRow}>
          <div className={styles.perWeightRow}>
            <Field
              name='perWeight'
              title={I18N.carbonFootprint3.unitProductWeight}
              decorator={[FormItem]}
              validator={[
                genNumberValidator({
                  max: AMOUNT.MAX,
                  decimalPlace: MAX_DECIMAL_PLACE,
                }),
              ]}
              component={[
                Input,
                { placeholder: I18N.carbonFootprint3.unitProductWeight },
              ]}
            />
            <Field
              name='perUnitCode'
              title={' '}
              decorator={[FormItem, { asterisk: false }]}
              component={[
                Select,
                {
                  placeholder: I18N.carbonFootprint.unit,
                  allowClear: true,
                  onChange: (_, opt: { label: string }) => {
                    form.setValues({
                      perUnitName: opt.label,
                    });
                  },
                },
              ]}
              reactions={field => {
                const { perWeight } = form.values as { perWeight: string };
                field.setState({ required: !!perWeight });
              }}
            />
          </div>
          <Field
            name='productType'
            title={I18N.carbonFootprint3.productClassification}
            decorator={[FormItem]}
            component={[
              Select,
              {
                placeholder: I18N.carbonFootprint3.pleaseSelectAProduct2,
                showSearch: true,
                optionFilterProp: 'label',
                onBlur: (e: { target: HTMLInputElement }) => {
                  const searchText = e.target.value;
                  if (searchText) {
                    manualProductTypeRef.current = true;
                    form.setValues({
                      productType: searchText,
                    });
                  }
                },
                onChange: () => {
                  manualProductTypeRef.current = false;
                },
              },
            ]}
          />
        </div>
        <Field
          name='productDesc'
          title={I18N.carbonFootprint3.productDescription}
          decorator={[FormItem]}
          component={[
            Input.TextArea,
            {
              placeholder: I18N.carbonFootprint3.productDescription,
              maxLength: 1000,
            },
          ]}
        />
        <Field
          name='files'
          title={
            <div>
              {I18N.carbonFootprint3.productProductionWorker}
              <span>{I18N.carbonFootprint3.supportPng4}</span>
            </div>
          }
          decorator={[FormItem]}
          component={[
            FormilyImgUpload,
            {
              noDescribe: true,
            },
          ]}
        />
        <Field
          name='techDesc'
          title={I18N.carbonFootprint3.productionProcessDescription}
          decorator={[FormItem]}
          component={[
            Input.TextArea,
            {
              placeholder: I18N.carbonFootprint3.productionProcessDescription,
              maxLength: 1000,
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default ProductModal;
