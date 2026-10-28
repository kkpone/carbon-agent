/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-19 10:27:52
 * @Date: 2023-05-16 10:45:22
 * @@description:
 */
import { Form } from '@formily/core';
import { PROCESS_PRODUCT_TYPE } from '@src/views/carbonFootprint3/discharge/process/constant';

import { AccessoryProductData } from './type';

const { MAIN } = PROCESS_PRODUCT_TYPE;

/**
 * @description: 设置主产品的form表单值
 * @param {AccessoryProductData} data 接口返回的值
 */
const setMainProductFormValues = (
  form: Form<any>,
  data: AccessoryProductData,
) => {
  const { name, shareRate, amount, files, unitName } = data;
  form.setValues({
    name,
    shareRate,
    amount,
    files,
  });

  form.setFieldState('unitCode', {
    data: {
      label: unitName,
    },
  });
};

/**
 * @description: 设置副产品的form表单值
 * @param {AccessoryProductData} data 接口返回的值
 * @param {number} arrIndex 其他产品自动生成的标识
 */
const setOtherProductFormValues = (
  form: Form<any>,
  data: AccessoryProductData,
  arrIndex: number,
) => {
  const formOtherKey = `otherProduct${arrIndex}`;
  const {
    id,
    name,
    matchWay,
    amount,
    unitCode,
    unitName,
    type,
    rate,
    factorObj,
    processProduct,
    files,
    shareRate,
  } = data;

  form.setValues({
    [formOtherKey]: {
      id,
      name,
      amount,
      type,
      files,
      shareRate,
    },
  });

  form.setFieldState([formOtherKey, 'unitCode'], {
    data: {
      value: unitCode,
      label: unitName,
    },
  });

  if (type === PROCESS_PRODUCT_TYPE.RECYCLED) {
    // 编辑产品类型初始为回用产品时，则产品类型不能变更
    form.setFieldState([formOtherKey, 'type'], { readPretty: true });
    if (factorObj) {
      form.setValues({
        [formOtherKey]: {
          matchWay,
          factorObj: {
            id: factorObj.id,
            name: factorObj.name,
            factor: factorObj.factor,
            numeratorUnit: (factorObj.unit || '').split('/')[0] || undefined,
            denominatorUnit: (factorObj.unit || '').split('/')[1] || undefined,
            rate,
            matchWay,
            institution: factorObj.institution,
            year: factorObj.year,
            unit: factorObj.unit,
            factorPattern: factorObj.factorPattern,
            ecoinventValueVisible: factorObj.ecoinventValueVisible,
          },
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
  } else {
    // 编辑产品类型初始为主，复产品时，则产品类型不显示回用产品选项
    form.setFieldState([formOtherKey, 'type'], {
      readPretty: true,
    });
  }
};

/**
 * @description: 初始化 - 设置产品的formValues
 * @param {Form<any>} form form实例
 * @param {AccessoryProductData[]} 接口拿到的产品数据
 * @returns {{AccessoryProductData, number[]}} 返回处理完毕的主产品数据，副产品数据
 */
export const initProductDrawerFormValues = async (
  form: Form<any>,
  data: AccessoryProductData[],
) => {
  let mainInitProduct: AccessoryProductData | undefined;
  const otherInitProduct: number[] = [];

  data.forEach((product, productIndex) => {
    if (product.type === MAIN) {
      mainInitProduct = product;
      setMainProductFormValues(form, product);
    } else {
      // 有其他产品后，分配系数将允许更改
      form.setFieldState('shareRate', {
        readPretty: false,
      });
      otherInitProduct.push(productIndex);
      setOtherProductFormValues(form, product, productIndex);
    }
  });

  return {
    mainInitProduct,
    otherInitProduct,
  };
};

/**
 * @description: 初始化 - 设置产品的formValues
 * @param {Form<any>} form form实例
 * @param {Record<string, any>} data 每条副产品的返回值
 * @param {string} key 副产品的下标
 * @returns {{AccessoryProductData, number[]}} 返回处理完毕的主产品数据，副产品数据
 */
const subOtherProductData = (
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

  const productData = {
    ...formValues,
    name,
    shareRate,
    amount,
    unitCode: (unitCode as unknown as string[])[1],
    unitName:
      (
        form.getFieldState([key, 'unitCode']).inputValues as {
          label: string;
        }[][]
      )?.[1]?.[1]?.label || form.getFieldState([key, 'unitCode'])?.data?.label,
    rate,
    factorObj,
    processProduct,
    files,
  };

  return productData;
};

/**
 * @description: 提交表单
 * @param {Form<any>} form form实例
 * @param {number[]} otherProductArr 副产品的下标集合
 * @param {AccessoryProductData} mainProduct 主产品信息
 * @returns {Record<string, any>[]} 提交和编辑接口要用到的值
 */
export const subForm = async (
  form: Form<any>,
  otherProductArr: number[],
  mainProduct?: AccessoryProductData,
) => {
  const data = await form.submit<Record<string, any>>();
  const { name, shareRate, amount, files, unitName } = data;
  // 拼接完整的其他产品key, 用于下面判断使用
  const getOtehrProductKey = otherProductArr.map(key => `otherProduct${key}`);

  const dataKeys = Object.keys(data);

  // 主材料
  const productArr = mainProduct
    ? [{ ...mainProduct, name, shareRate, amount, files, unitName, type: MAIN }]
    : [];

  // 过滤出副材料
  dataKeys.forEach(key => {
    if (getOtehrProductKey.includes(key)) {
      productArr.push(subOtherProductData(form, data[key], key));
    }
  });
  return productArr;
};
