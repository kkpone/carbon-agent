import { Form } from '@formily/core';
import { OptionsTypesData } from '@src/views/carbonFootprint3/type';

import { AccessoryProductData } from '../ProductDrawer/type';

/**
 * @description: 设置输出的form表单值
 * @param {AccessoryProductData} data 接口返回的值
 * @param {number} arrIndex 自动生成的标识
 */
const setOutFormValues = (
  accountId: number,
  form: Form<any>,
  data: AccessoryProductData,
  arrIndex: number,
  typeData?: { label: string; value: number }[],
) => {
  const formOtherKey = `outArr${arrIndex}`;
  const {
    id,
    name,
    matchWay,
    amount,
    unitCode,
    type,
    rate,
    matchObject,
    processProduct,
    files,
    typeExtra,
  } = data;

  let { factorObj } = data;

  form.setValues({
    processLibId: accountId,
    [formOtherKey]: {
      id,
      name,
      amount,
      type,
      matchWay,
      files,
      typeExtra,
    },
  });

  // 选择输出 - 排放源旧版本中没有factor用的是matchObject 所以要将matchObject赋值过去
  if (!factorObj && matchObject) {
    factorObj = matchObject;
  }

  // 动态设置输出的类型 - 默认为第一个废气
  if (typeData) {
    form.setFieldState([formOtherKey, 'type'], {
      dataSource: typeData,
      value: Number(type) || typeData[0].value,
    });
  }

  form.setFieldState([formOtherKey, 'unitCode'], {
    data: {
      value: unitCode,
    },
  });

  if (factorObj) {
    form.setValues({
      [formOtherKey]: {
        factorObj: {
          id: factorObj.id,
          name: factorObj.name,
          factor: factorObj.factor,
          numeratorUnit: (factorObj.unit || '').split('/')[0] || undefined,
          rate,
          institution: factorObj.institution,
          year: factorObj.year,
          unit: factorObj.unit,
          factorPattern: factorObj.factorPattern,
          ecoinventValueVisible: factorObj.ecoinventValueVisible,
        },
      },
    });
    form.setFieldState([formOtherKey, 'factorObj', 'denominatorUnit'], {
      data: {
        label: (factorObj.unit || '').split('/')[1],
      },
    });
  }

  if (processProduct) {
    form.setValues({
      [formOtherKey]: {
        matchWay,
        processProduct: {
          id: processProduct.id,
          processId: processProduct.processId,
          type: processProduct.type,
          processName: processProduct.processName,
          productName: processProduct.productName,
          rate,
          accountYear: processProduct.accountYear,
          unitName: processProduct.unitName,
        },
      },
    });

    form.setFieldState([formOtherKey, 'processProduct', 'unitCode'], {
      data: {
        value: processProduct.unitCode,
      },
    });
  }
};

/**
 * @description: 初始化 - 获取主产品和副产品
 * @param {AccessoryProductData} data 接口返回的产品list
 */
export const initExportDrawerForm = async (
  accountId: number,
  form: Form<any>,
  typeData: OptionsTypesData[],
  data: AccessoryProductData[],
) => {
  const exportArrs: number[] = [];

  let collapseKeys: number[] = [];

  data.forEach((product, productIndex) => {
    exportArrs.push(productIndex);
    setOutFormValues(accountId, form, product, productIndex, typeData);
    // addFormFieldEffect(form, formStatusRef, `${productIndex}`);
    collapseKeys = [productIndex];
  });

  return { exportArrs, collapseKeys };
};

const subOutPutData = (
  form: Form<any>,
  data: Record<string, any>,
  key: string,
) => {
  const {
    name,
    shareRate,
    amount,
    files,
    factorObj,
    processProduct,
    unitCode,
  } = data;

  const formValues = form.getValuesIn(key);

  let rate: number | string | undefined;

  if (factorObj) {
    // 选择因子or新建因子
    rate = ((factorObj as unknown as { rate: string }) || {}).rate;

    // 新建因子没有unit  所以要单独处理unit
    if (formValues.matchWay === 2) {
      Object.assign(factorObj || {}, {
        ...factorObj,
        unit: `${form.getValuesIn([key, 'factorObj', 'numeratorUnit'])}/${
          (
            form.getFieldState([key, 'factorObj', 'denominatorUnit'])
              .inputValues as {
              label: string;
            }[][]
          )?.[1]?.[1].label
        }`,
        numeratorUnit: undefined,
        denominatorUnit: undefined,
        rate: undefined,
      });
    }
  }

  if (processProduct) {
    // 选择过程库产品
    rate = ((processProduct as unknown as { rate: string }) || {}).rate;
    Object.assign(processProduct || {}, {
      ...processProduct,
      unitCode: (processProduct.unitCode as unknown as string[])?.[1],
      rate: undefined,
    });
  }

  const outData = {
    ...formValues,
    name,
    shareRate,
    amount,
    unitCode: (unitCode as unknown as string[])[1],
    unitName: (
      form.getFieldState([key, 'unitCode']).inputValues as {
        label: string;
      }[][]
    )?.[1]?.[1]?.label,
    rate,
    factorObj,
    processProduct,
    files,
  };

  return outData;
};

/**
 * @description: 提交表单
 * @param {Form<any>} form form实例
 * @param {number[]} otherOutPutArr 副产品的下标集合
 * @param {AccessoryOutPutData} mainOutPut 主产品信息
 * @returns {Record<string, any>[]} 提交和编辑接口要用到的值
 */
export const subForm = async (form: Form<any>, outsArr: number[]) => {
  const data = await form.submit<Record<string, any>>();
  // 拼接完整的其他产品key, 用于下面判断使用
  const getOutPutKey = outsArr.map(key => `outArr${key}`);

  const dataKeys = Object.keys(data);

  const outArr: Record<string, any>[] = [];

  // 输出
  dataKeys.forEach(key => {
    if (getOutPutKey.includes(key)) {
      outArr.push(subOutPutData(form, data[key], key));
    }
  });

  return outArr;
};
