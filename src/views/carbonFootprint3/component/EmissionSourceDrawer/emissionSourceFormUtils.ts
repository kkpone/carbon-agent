import { QuickBusinessAccountingSource } from '../../QuickBusinessAccounting/type';
import { Field, Form } from '@formily/core';
import { CSSProperties } from 'react';
import { getEmissionSoureListData } from '../../discharge/emissionSoureLibrary/service';
import config from '@src/config';
import { MODEL_EMISSION_MATCH_WAY } from '../../BusinessAccountingModel/constant';

const { FACTOR, FACTOR_CREATE, SUPPLIER, MODEL_REFER } =
  MODEL_EMISSION_MATCH_WAY;

export const ACCOUNT_REFER_WAY = {
  /** 引用模型：关联核算更新时使用最新结果 */
  MODEL: 1,
  /** 引用结果：选中后固定当前结果 */
  RESULT: 2,
} as const;

export const openRouteInNewTab = (route: string) => {
  window.open(
    `${window.location.origin}${config.BASENAME || ''}${route}`,
    '_blank',
    'noopener,noreferrer',
  );
};

export type AccountRefer = {
  referWay: number;
  accountId: number;
  accountName?: string;
  productId?: number;
  productName?: string;
  factor?: string;
  factorUnit?: string;
  unitCode?: string;
  /** 核算功能单位名称，用于单位换算比例展示 */
  unitName?: string;
};

/** 解析消耗数量单位展示名（手动选择 cascader 时 label 在 inputValues） */
export const resolveEmissionUnitLabel = (formInstance: Form) => {
  const unitFieldState = formInstance.getFieldState('unitCode');
  const inputLabel = (
    unitFieldState?.inputValues as { label: string }[][] | undefined
  )?.[1]?.[1]?.label;
  const dataLabel = (unitFieldState?.data as { label?: string } | undefined)
    ?.label;
  return inputLabel || dataLabel || '-';
};

/**
 * 发起收数提交时解析单位换算比例：未选供应商碳数据固定为 1；
 * 已选数据但 rate 为空（含 ''）时与编辑保存一致，默认 1。
 */
export const resolveSupplierSubmitRate = (
  supplierObj?: { id?: number | string | null },
  rate?: string | number | null,
) => {
  if (supplierObj?.id == null) {
    return 1;
  }
  if (rate === undefined || rate === null || rate === '') {
    return 1;
  }
  return rate;
};

/** 详情/编辑接口 matchWay 可能是 string，统一转成枚举 number 避免 footer 与表单回显误判 */
export const normalizeEmissionMatchWay = (matchWay: unknown) => {
  const normalized = Number(matchWay);
  if (
    normalized === FACTOR ||
    normalized === FACTOR_CREATE ||
    normalized === SUPPLIER ||
    normalized === MODEL_REFER
  ) {
    return normalized;
  }
  return FACTOR;
};

/** 解析核算引用功能单位展示名 */
export const resolveAccountReferUnitLabel = (accountRefer?: AccountRefer) => {
  if (!accountRefer) {
    return '-';
  }
  if (accountRefer.unitName) {
    return accountRefer.unitName;
  }
  const { factorUnit } = accountRefer;
  if (!factorUnit) {
    return '-';
  }
  if (factorUnit.includes('/')) {
    return factorUnit.split('/').pop() || '-';
  }
  return factorUnit;
};

/** 模型排放源提交体：accountId -> modelId */
export const toModelEmissionSubmitPayload = (
  submitData: QuickBusinessAccountingSource,
  modelId: string,
) => {
  const { accountId: _accountId, ...rest } = submitData;
  return { ...rest, modelId };
};

export const footerStyle: CSSProperties = {
  padding: '0px 24px',
  height: 52,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const useAsyncProductDataSource = () => (field: Field) => {
  field.setState({ loading: true });
  getEmissionSoureListData().then(back => {
    const enumData = back.data.rows;
    field.setState({
      dataSource: enumData.map(data => ({
        label: data.name,
        value: data.name,
      })),
    });
    field.setState({ loading: false });
  });
};
