import { Field, Form, FormPathPattern } from '@formily/core';
import { MODEL_EMISSION_REQUEST_STATE } from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { MATCH_WAY } from '@src/views/carbonFootprint3/discharge/process/constant';

import { getUnitRate } from './service';

/** 供应商发起收数场景下的底部按钮模式 */
export type SupplierSaveFooterMode =
  | 'default'
  | 'dualSave'
  | 'singleSave'
  | 'readOnly';

/**
 * MatchWay=5（发起收数）时的保存按钮模式：
 * - id 为空且 requestState=0：仅保存 + 保存并获取
 * - id 为空且 requestState≠0：只读详情
 * - id 不为空：通用保存
 */
export const getSupplierSaveFooterMode = (params: {
  matchWay?: number | null;
  supplierObjId?: number | null;
  requestState?: number | null;
}): SupplierSaveFooterMode => {
  if (Number(params.matchWay) !== MATCH_WAY.SUPPLIER) {
    return 'default';
  }

  const hasSupplierCarbonData =
    params.supplierObjId !== undefined && params.supplierObjId !== null;

  if (hasSupplierCarbonData) {
    return 'singleSave';
  }

  if (
    params.requestState !== undefined &&
    params.requestState !== null &&
    params.requestState !== MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT
  ) {
    return 'readOnly';
  }

  return 'dualSave';
};

export const isSupplierRequestReadOnly = (params: {
  matchWay?: number | null;
  supplierObjId?: number | null;
  requestState?: number | null;
}) => getSupplierSaveFooterMode(params) === 'readOnly';

/** 从表单读取消耗数量单位 code（兼容 cascader value 与 field.data 回显） */
export const getEmissionUnitCodeFromForm = (form: Form) => {
  const unitField = form.query('unitCode').take() as Field | undefined;
  const unitCodeValue = unitField?.value ?? form.getValuesIn('unitCode');

  if (Array.isArray(unitCodeValue)) {
    return unitCodeValue[1] ? String(unitCodeValue[1]) : undefined;
  }
  if (unitCodeValue) {
    return String(unitCodeValue);
  }

  const fieldDataValue = (
    unitField?.data as { value?: string | number } | undefined
  )?.value;
  return fieldDataValue ? String(fieldDataValue) : undefined;
};

/** 解析供应商结果数据的功能单位 code（computeUnit / denominatorUnit） */
export const parseSupplierResultUnitCode = (
  supplierObj?: Record<string, any>,
  computeUnit?: string,
) => {
  const denominatorUnit = supplierObj?.denominatorUnit;
  if (Array.isArray(denominatorUnit) && denominatorUnit.length > 0) {
    const child = denominatorUnit[denominatorUnit.length - 1];
    return child !== undefined && child !== null && child !== ''
      ? String(child)
      : undefined;
  }
  const parts = (computeUnit || '').split(',').filter(Boolean);
  const child = parts[parts.length - 1];
  return child ? String(child) : undefined;
};

/**
 * 供应商匹配方式专用：计算消耗数量单位 -> 结果数据单位的换算比例。
 * 算不出来时默认 1（仅用于发起收数/已选供应商碳数据场景）。
 */
export const calcSupplierResultUnitRate = async (
  consumptionUnitCode?: string,
  resultUnitCode?: string,
): Promise<string> => {
  if (!consumptionUnitCode || !resultUnitCode) {
    return '1';
  }
  if (consumptionUnitCode === resultUnitCode) {
    return '1';
  }
  try {
    const {
      data: {
        data: { unitValue },
      },
    } = await getUnitRate({
      unitOne: consumptionUnitCode,
      unitTwo: resultUnitCode,
    });
    if (!unitValue) {
      return '1';
    }
    return unitValue;
  } catch {
    return '1';
  }
};

export const calcUnitRate = async (options: {
  form: Form;
  baseUnitFieldPath: FormPathPattern;
  unitFieldPath: FormPathPattern;
  rateFieldPath: FormPathPattern;
}) => {
  const { form, baseUnitFieldPath, unitFieldPath, rateFieldPath } = options;

  const baseUnitValue = (
    (form.query(baseUnitFieldPath).take() as Field)?.value as string[]
  )?.[1];
  const unitValue = (
    (form.query(unitFieldPath).take() as Field)?.value as string[]
  )?.[1];

  if (baseUnitValue && unitValue) {
    try {
      const resp = await getUnitRate({
        unitOne: baseUnitValue,
        unitTwo: unitValue,
      });
      form.setValuesIn(rateFieldPath, resp.data.data.unitValue);
    } catch (e) {
      form.setValuesIn(rateFieldPath, '');
      throw e;
    }
  }
};
