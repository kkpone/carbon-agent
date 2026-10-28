/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-29 17:32:47
 * @Date: 2023-05-11 16:34:52
 * @@description:
 */
import { Form } from '@formily/core';
import { PROCESS_PRODUCT_TYPE } from '@src/views/carbonFootprint3/discharge/process/constant';

import { AccessoryOutPutData } from './type';

const { MAIN } = PROCESS_PRODUCT_TYPE;

/**
 * @description: 设置主产品的form表单值
 * @param {AccessoryOutPutData} data 接口返回的值
 */
const setMainOutPutFormValues = (
  form: Form<any>,
  data: AccessoryOutPutData,
) => {
  const { name, shareRate, amount, files, unitName, useAmount } = data;
  form.setValues({
    name,
    shareRate,
    amount,
    files,
    useAmount,
  });

  form.setFieldState('unitCode', {
    data: {
      label: unitName,
    },
  });
};

/**
 * @description: 设置副产品的form表单值
 * @param {AccessoryOutPutData} data 接口返回的值
 * @param {number} arrIndex 其他产品自动生成的标识
 */
const setOtherOutPutFormValues = (
  form: Form<any>,
  data: AccessoryOutPutData,
  arrIndex: number,
) => {
  const formOtherKey = `otherOutPut${arrIndex}`;

  const {
    id,
    name,
    matchWay,
    amount,
    useAmount,
    unitCode,
    type,
    rate,
    factorObj,
    processOutPut,
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
      useAmount,
    },
  });

  form.setFieldState([formOtherKey, 'unitCode'], {
    data: {
      value: unitCode,
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

    if (processOutPut) {
      form.setValues({
        [formOtherKey]: {
          matchWay,
          processOutPut: {
            id: processOutPut.id,
            processId: processOutPut.processId,
            type: processOutPut.type,
            processName: processOutPut.processName,
            productName: processOutPut.productName,
            rate,
            accountYear: processOutPut.accountYear,
            unitName: processOutPut.unitName,
          },
        },
      });

      form.setFieldState([formOtherKey, 'processOutPut', 'unitCode'], {
        data: {
          value: processOutPut.unitCode,
        },
      });
    }
  } else {
    // 编辑产品类型初始为主，复产品时，则产品类型不显示回用产品选项
    // 3.3.2 新需求要求编辑的时候产出物类型不允许编辑
    form.setFieldState([formOtherKey, 'type'], { readPretty: true });
  }
};

/**
 * @description: 初始化 - 设置产品的formValues
 * @param {Form<any>} form form实例
 * @param {AccessoryOutPutData[]} 接口拿到的产品数据
 * @param {boolean} 是否是只读状态
 * @returns {{AccessoryOutPutData, number[]}} 返回处理完毕的主产品数据，副产品数据
 */
export const initOutPutDrawerFormValues = async (
  form: Form<any>,
  data: AccessoryOutPutData[],
  isOnlyDetail?: boolean,
) => {
  let mainInitOutPut: AccessoryOutPutData | undefined;
  const otherInitOutPut: number[] = [];

  data.forEach((product, productIndex) => {
    if (product.type === MAIN) {
      mainInitOutPut = product;
      setMainOutPutFormValues(form, product);
    } else {
      // 只有不是只读情况下才能将readPretty设置成false
      if (!isOnlyDetail) {
        // 有其他产品后，分配系数将允许更改
        form.setFieldState('shareRate', {
          readPretty: false,
        });
      }

      otherInitOutPut.push(productIndex);
      setOtherOutPutFormValues(form, product, productIndex);
    }
  });

  return {
    mainInitOutPut,
    otherInitOutPut,
  };
};

/**
 * @description: 初始化 - 设置产品的formValues
 * @param {Form<any>} form form实例
 * @param {Record<string, any>} data 每条副产品的返回值
 * @param {string} key 副产品的下标
 * @returns {{AccessoryOutPutData, number[]}} 返回处理完毕的主产品数据，副产品数据
 */
const subOtherOutPutData = (
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
    processOutPut,
    unitCode,
    useAmount,
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

  if (processOutPut) {
    // 选择过程库产品
    rate = ((processOutPut as unknown as { rate: string }) || {}).rate;
    Object.assign(processOutPut || {}, {
      ...processOutPut,
      unitCode: (processOutPut.unitCode as unknown as string[])?.[1],
      rate: undefined,
    });
  }

  const productData = {
    ...formValues,
    name,
    shareRate,
    amount,
    useAmount,
    unitCode: (unitCode as unknown as string[])[1],
    unitName:
      (
        form.getFieldState([key, 'unitCode']).inputValues as {
          label: string;
        }[][]
      )?.[1]?.[1]?.label || form.getFieldState([key, 'unitCode'])?.data?.label,
    rate,
    factorObj,
    processOutPut,
    files,
  };

  return productData;
};

/**
 * @description: 提交表单
 * @param {Form<any>} form form实例
 * @param {number[]} otherOutPutArr 副产品的下标集合
 * @param {AccessoryOutPutData} mainOutPut 主产品信息
 * @returns {Record<string, any>[]} 提交和编辑接口要用到的值
 */
export const subForm = async (
  form: Form<any>,
  otherOutPutArr: number[],
  mainOutPut?: AccessoryOutPutData,
) => {
  const data = await form.submit<Record<string, any>>();
  const { name, shareRate, amount, files, useAmount, unitCode } = data;
  // 拼接完整的其他产品key, 用于下面判断使用
  const getOtehrOutPutKey = otherOutPutArr.map(key => `otherOutPut${key}`);

  const dataKeys = Object.keys(data);

  // 主材料
  const productArr = mainOutPut
    ? [
        {
          ...mainOutPut,
          name,
          shareRate,
          amount,
          files,
          type: MAIN,
          useAmount,
          unitCode: unitCode ? unitCode[1] : undefined,
          unitName: (
            form.getFieldState('unitCode')?.inputValues as {
              label: string;
            }[][]
          )?.[1]?.[1]?.label,
        },
      ]
    : [];

  // 过滤出副材料
  dataKeys.forEach(key => {
    if (getOtehrOutPutKey.includes(key)) {
      productArr.push(subOtherOutPutData(form, data[key], key));
    }
  });
  return productArr;
};
