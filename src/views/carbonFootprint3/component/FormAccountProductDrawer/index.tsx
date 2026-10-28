import { FormGrid, FormItem, Input, Select, Cascader } from '@formily/antd-v5';
import { createForm, onFieldChange } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import FormilyInputSelect from '@src/components/FormilyUtil/FormilyInputSelect';
import { FormilyUploadCrop } from '@src/components/FormilyUtil/FormilyUploadCrop';
import useFieldSetValueByLabel from '@src/hooks/useFieldSetValueByLabel';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { Button, Drawer } from 'antd';
import classNames from 'classnames';
import { memo, useEffect, useMemo, useState } from 'react';

import {
  FOOTPRINT_ACCOUNT_PRODUCT_LABEL,
  FootprintAccountProductStatus,
} from './constants';
import style from './index.module.less';
import { accountProductSchema } from './shcema';
import {
  FormAccountProductDrawerProps,
  SubAccountProductFormData,
} from './type';
import {
  getAccountProductAddInit,
  getSimpleProductTypeList,
} from '../../FootprintAccount/service';
import FormilyImgUpload from '../FormilyImgUpload';

const { ADD, DETAIL } = FootprintAccountProductStatus;

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    Input,
    Select,
    Cascader,
    FormilyInputSelect,
    FormilyImgUpload,
    FormilyUploadCrop,
  },
});

export const FormAccountProductDrawer = memo(
  ({
    visible,
    status,
    productType,
    onSubClick,
    onCancelClick,
    initValues,
    subFormAndAccount,
  }: FormAccountProductDrawerProps) => {
    /** 是否有保存并进行核算按钮 */
    const isHaveSaveAccount = !!subFormAndAccount;
    const [loading, setLoading] = useState(false);

    const title = FOOTPRINT_ACCOUNT_PRODUCT_LABEL[status];

    const formProduct = useMemo(
      () =>
        createForm({
          readPretty: status === DETAIL,
          initialValues: initValues,
          effects() {
            onFieldChange('accountUnitCode', ['dataSource'], () => {
              const newField = formProduct.getFieldState('accountUnitCode');
              if (newField.dataSource && newField.dataSource.length > 0) {
                const weightUnits = newField.dataSource.find(
                  weight => weight.value === '1',
                );
                formProduct.setFieldState('perUnitCode', {
                  dataSource: weightUnits?.children,
                });
              }
            });
          },
        }),
      [visible],
    );

    const getFormData = async () => {
      const data: SubAccountProductFormData = await formProduct.submit();
      data.accountUnitName =
        (
          formProduct.getFieldState('accountUnitCode').inputValues as {
            label: string;
          }[][]
        )?.[1]?.[1]?.label ||
        formProduct.getFieldState('accountUnitCode')?.data?.label;

      const perUnitCodeInputValues =
        formProduct.getFieldState('perUnitCode').inputValues;
      if (perUnitCodeInputValues && perUnitCodeInputValues.length > 0) {
        data.perUnitName =
          (
            formProduct.getFieldState('perUnitCode').inputValues as {
              label: string;
            }[]
          )?.[1]?.label ||
          formProduct.getFieldState('perUnitCode')?.data?.label;
      }
      if (data.productTypeObj) {
        if (data.productTypeObj.isManualInput) {
          data.productTypeName = data.productTypeObj.name;
          data.productType = undefined;
        } else {
          data.productType = data.productTypeObj.id;
        }
        data.productTypeObj = undefined;
      }

      return data;
    };

    /**
     * 提交表单 - 保存
     */
    const subForm = async () => {
      setLoading(true);
      try {
        const data = await getFormData();
        onSubClick(data);
      } finally {
        setLoading(false);
      }
    };

    /**
     * 提交表单 - 保存并核算
     */
    const subFormAccount = async () => {
      if (isHaveSaveAccount) {
        setLoading(true);
        try {
          const data = await getFormData();
          subFormAndAccount(data);
        } finally {
          setLoading(false);
        }
      }
    };

    /**
     * 初始化 - 新增产品情况下 - 接口生成产品编码F
     */
    const addInitProductCode = async () => {
      const { data } = await getAccountProductAddInit();

      if (data.data && data.data.productCode) {
        formProduct.setValuesIn('productCode', data.data.productCode);
      }
    };

    useEffect(() => {
      if (initValues) {
        formProduct.setFieldState('accountUnitCode', {
          data: {
            label: initValues.accountUnitName,
            value: initValues.accountUnitCode,
          },
        });

        formProduct.setValues({
          productTypeObj: {
            id: initValues.productType,
          },
        });
      }
    }, [initValues]);

    useEffect(() => {
      // 初始化获取产品编码
      if (status === ADD && visible) {
        addInitProductCode();
      }
    }, [status, visible]);

    useEffect(() => {
      if (visible && productType && productType !== 'ALL') {
        formProduct.setValues({ productTypeObj: { id: productType } });
      }
    }, [formProduct, productType, visible]);

    useEffect(() => {
      if (visible) {
        getSimpleProductTypeList().then(({ data }) => {
          formProduct.setFieldState('productTypeObj', {
            dataSource: (data.data || []).map(({ typeCode, typeName }) => ({
              value: typeCode,
              label: typeName,
            })),
          });
        });
      }
    }, [formProduct, visible]);

    return (
      <Drawer
        destroyOnClose
        width={750}
        closable={false}
        title={title}
        placement='right'
        open={visible}
        bodyStyle={{
          padding: 0,
        }}
        footerStyle={{
          boxShadow: '0 -4px 8px 0 rgba(0,0,0,0.04)',
          height: 52,
        }}
        footer={
          <div className={style.drawerFooterMain}>
            <Button
              rootClassName={style.drawerFooterBtn}
              onClick={async () => {
                onCancelClick();
              }}
            >
              {I18N.carbonFootprint.cancel}
            </Button>
            <Button
              loading={loading}
              rootClassName={classNames(style.drawerFooterBtn, 'm-l-20')}
              type='primary'
              onClick={subForm}
            >
              {I18N.carbonFootprint.preserve}
            </Button>
            {isHaveSaveAccount && (
              <Button
                loading={loading}
                rootClassName={`${style.drawerFooterBtn} m-l-20`}
                onClick={subFormAccount}
              >
                {I18N.carbonFootprint3.saveAndProceed}
              </Button>
            )}
          </div>
        }
      >
        <div className={style.paddingMain}>
          <FormilyCommon form={formProduct}>
            <SchemaField
              schema={accountProductSchema()}
              scope={{
                useFieldUnitDictSource,
                useFieldSetValueByLabel,
              }}
            />
          </FormilyCommon>
        </div>
      </Drawer>
    );
  },
);
