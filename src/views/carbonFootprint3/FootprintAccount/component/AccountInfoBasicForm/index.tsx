/**
 * 测试文件名称
 * @returns
 */
import useUrlState from '@ahooksjs/use-url-state';
import {
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Cascader,
  DatePicker,
  Select,
} from '@formily/antd-v5';
import {
  Field,
  Form,
  createForm,
  onFieldInputValueChange,
} from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { FormilyAccountTypeRadio } from '@src/views/carbonFootprint3/component/FormilyAccountTypeRadio';
import FormilyImgUpload from '@src/views/carbonFootprint3/component/FormilyImgUpload';
import FormilySystemBoundaryRadio from '@src/views/carbonFootprint3/component/FormilySystemBoundaryRadio';
import { Dicts } from '@src/views/emission/Show/type';
import classNames from 'classnames';
import { throttle } from 'lodash-es';
import { useImperativeHandle, useMemo, useRef } from 'react';

import style from './index.module.less';
import { FootprintAccountingBasicSchema } from './schema';
import { AccountInfoBasicFormProps } from './type';
import {
  SubAccountBasicFormData,
  UrlStateProps,
} from '../../AccountDetail/AccountInfo/type';
import { getSelectModelInfo } from '../../SelectModel/service';
import { getAccountProductData } from '../../service';
import { AccountProductData } from '../../type';

// 创建一个 SchemaField 组件用于解析JSON-Schema动态渲染表单的组件
const SchemaField = createSchemaField({
  // 组件列表
  components: {
    FormLayout,
    FormGrid,
    FormItem,
    Select,
    Input,
    DatePicker,
    Cascader,
    FormilyImgUpload,
    FormilySystemBoundaryRadio,
    FormilyAccountTypeRadio,
  },
});

export const AccountInfoBasicForm = ({
  cRef,
  isDetail,
  shareStatus,
}: AccountInfoBasicFormProps) => {
  // 核算产品输入值不存在的时候显示输入值
  const productSearchRef = useRef<{
    productSearchValue: string;
  }>({ productSearchValue: '' });
  /** 页面存储参数 */
  const [urlState, setUrlState] = useUrlState<UrlStateProps>();

  /**
   * 获取unitData数组形式
   * @param unitCode 接口的unit
   */
  const getUnitData = async (unitCode: string) => {
    const unitOptionsLocal = localStorage.getItem('FactorUnitDict');
    const unitOptions: Dicts[] = unitOptionsLocal
      ? JSON.parse(unitOptionsLocal)
      : undefined;
    if (unitOptions) {
      // 获取数量单位的code
      const child = unitOptions.find(op => op.dictValue === unitCode);
      const parent = unitOptions.find(op => op.dictValue === child?.sourceType);
      const unitData =
        parent && child ? [parent.dictValue, child.dictValue] : undefined;

      return unitData;
    }

    return undefined;
  };

  // 用来创建表单核心领域模型，它是作为MVVM设计模式的标准 ViewModel
  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
        effects() {
          // 核算单位报错已经存在
          onFieldInputValueChange('type', (field, newForm) => {
            newForm.setFieldState('accountName', {
              validateStatus: 'success',
              selfErrors: [],
            });
          });
          onFieldInputValueChange('accountName', (field, newForm) => {
            newForm.setFieldState('accountName', {
              validateStatus: 'success',
              selfErrors: [],
            });
          });
          // 核算产品更改
          onFieldInputValueChange('productId', async (field, newForm) => {
            const val = field.value;
            // 获取当前产品的核算数量单位进行回显
            const getInfoByCode = field.dataSource?.find(
              source => source.value === val,
            );
            if (getInfoByCode) {
              const unitData = await getUnitData(getInfoByCode.unitCode);
              const productInfo = getInfoByCode.info as AccountProductData;
              if (unitData) {
                newForm.setValuesIn('unitData', unitData);
                newForm.setValuesIn('unitName', productInfo.accountUnitName);
              }
              // 更改产品下拉
              setUrlState({
                ...urlState,
                productId: getInfoByCode.isCustom ? undefined : val,
              });
            }
          });
        },
      }),
    [isDetail],
  );

  /**
   * @description: 被节流的函数
   */
  const throttleFunc = throttle(
    async (newForm: Form<any>) => {
      if (
        newForm.getFieldState('amount') &&
        newForm.getFieldState('unitData') &&
        newForm.getFieldState('productId')
      ) {
        const amountVal = newForm.getFieldState('amount').value;
        const unitDataVal = newForm.getFieldState('unitData').value;
        const productNameVal = newForm.getFieldState('productName').value;
        const accountNameVal = newForm.getFieldState('accountName').value;

        // 不存在功能单位的情况下才会自动生成 - 最低标准是必须存在核算数量的值
        if (!accountNameVal && unitDataVal && amountVal && productNameVal) {
          // 功能单位的名称
          let accountName = '';
          if (amountVal) {
            accountName = amountVal;
          }

          const unitDataInputValues =
            newForm.getFieldState('unitData').inputValues;

          const unitNameValue = newForm.getFieldState('unitName').value;
          const getUnitName =
            unitDataInputValues && unitDataInputValues.length > 0
              ? (unitDataInputValues as Dicts[])[1][1].dictLabel
              : unitNameValue;

          // 获取单位信息和产品信息
          if (getUnitName) {
            accountName = `${accountName}${getUnitName}`;
          }

          // 获取核算产品名称
          if (productNameVal) {
            accountName = `${accountName}${productNameVal}`;
          }

          newForm.setFieldState('accountName', {
            value: accountName,
          });
        }
      }
    },
    1000,
    {
      leading: true,
      trailing: true,
    },
  );

  /**
   * 复制模型
   * @param modelId 模型id
   */
  const initModelForm = async (
    modelId: string,
    productInfo?: AccountProductData,
  ) => {
    const { data } = await getSelectModelInfo({ id: Number(modelId) });
    form.setValues({
      amount: data.data.amount,
      type: data.data.type,
      scope: data.data.scope,
      scopeValue: data.data.scopeValue,
      specification: data.data.specification,
    });
    form.setValuesIn(
      'accountName',
      `${data.data.amount}${productInfo?.accountUnitName}${productInfo?.productName}`,
    );
    // 核算方式不允许更改
    form.setFieldState('type', {
      readPretty: true,
    });
  };

  /**
   * @description: 异步获取产品数据源
   * @param {Field} field
   */
  const useAsyncProductDataSource = () => (field: Field) => {
    if (shareStatus) return;
    field.loading = true;
    getAccountProductData({ pageNum: 1, pageSize: 10000 }).then(back => {
      const enumData = back.data.data.rows;

      field.dataSource = enumData.map(data => ({
        label: data.productName,
        value: data.id,
        unitCode: data.accountUnitCode,
        isCustom: false,
        info: data,
      }));
      field.loading = false;

      const productInfo = enumData.find(
        pros => String(pros.id) === urlState?.productId,
      );

      if (urlState?.modelId) {
        initModelForm(urlState?.modelId, productInfo);
      }
    });
  };

  /** 提交表单 */
  const subForm = async () => {
    const data: SubAccountBasicFormData = await form.submit();
    // 判断当前下拉的值
    const productIdField = form.getFieldState('productId');
    const fieldDataSource = productIdField.dataSource;
    const productIdValue = productIdField.value;
    if (fieldDataSource) {
      // 判断当前下拉产品是否是输入的汉字
      const getInfoById = fieldDataSource.find(
        source => source.value === productIdValue,
      );
      // isCustom存在说明是输入的汉字, 需要清空productId
      if (getInfoById && getInfoById.isCustom) {
        data.productName = productIdValue;
        data.productId = undefined;
      }
    }

    return data;
  };

  /** 设置表单的值 */
  const setFormValue = (values: Record<string, any>) => {
    form.setValues(values);
  };

  /** 获取表单 */
  const getForm = async () => form;

  /**
   * 主动刷新产品的下拉列表
   */
  const restProductIdDataSource = async () => {
    getAccountProductData({ pageNum: 1, pageSize: 10000 }).then(back => {
      const enumData = back.data.data.rows;
      form.setFieldState('productId', {
        dataSource: enumData.map(data => ({
          label: data.productName,
          value: data.id,
          unitCode: data.accountUnitCode,
          isCustom: false,
        })),
      });
    });
  };

  /**
   * 主动触发子组件 - 表单提交
   */
  useImperativeHandle(cRef, () => ({
    subForm,
    setFormValue,
    getForm,
    restProductIdDataSource,
  }));

  return (
    <div
      className={classNames(style.firstStep, {
        [style.firstStepDetail]: isDetail,
      })}
    >
      <div className={style.firstStepTitle}>
        <div className='m-b-20'>
          {I18N.carbonFootprint.accountingInformation}
        </div>
      </div>
      <FormilyCommon form={form}>
        <SchemaField
          schema={FootprintAccountingBasicSchema(
            productSearchRef,
            form,
            throttleFunc,
          )}
          scope={{ useAsyncProductDataSource, useFieldUnitDictSource }}
        />
      </FormilyCommon>
    </div>
  );
};
