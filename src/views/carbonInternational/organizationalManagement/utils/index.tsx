/**
 * @file utils
 */

import I18N from '@src/lang/I18N';
import {
  EmissionList,
  ExhaustGasIntListSerializers,
} from '@api/carbon-international/types';
import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { Cascader } from '../components/Cascader';
import { RenderCheckboxGroup } from '../components/CheckboxGroup';
import { SelectAndCascader } from '../components/SelectAndCascader';
import { RenderInput } from '../components/Input';
import { SelectAndMsgBox } from '../components/SelectAndMsgBox';
import { RenderSelect } from '../components/Selector';
import {
  Children,
  EmissionFormType,
  SelectOptions,
  UnitCascaderOptions,
} from '../types';

// 由于后端要的选项中的文字，所以把label和value统一为文字

// @ts-ignore

// 新建排放数据 组件渲染
export const renderChildren = (children: Children) => {
  switch (children.type) {
    case EmissionFormType.select:
      return (
        <RenderSelect
          {...{
            placeholder: I18N.carbonFootprint.pleaseSelect,
            ...children.props,
          }}
        />
      );
    case EmissionFormType.input:
      return <RenderInput {...children.props} />;
    case EmissionFormType.checkboxGroup:
      return <RenderCheckboxGroup {...children.props} />;
    case EmissionFormType.cascader:
      return <Cascader {...children.props} />;
    case EmissionFormType.selectAndCascader:
      return <SelectAndCascader {...children.props} />;
    case EmissionFormType.selectAndMsgBox:
      return <SelectAndMsgBox {...children.props} />;
    default:
      return <div />;
  }
};
// 时间转换
export const transformTimestamp = (timestamp: any) => {
  const a = new Date(timestamp).getTime();
  const date = new Date(a);
  const Y = `${date.getFullYear()}-`;
  const M = `${
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
  }-`;
  const D = `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}  `;
  const h = `${
    date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
  }:`;
  const m =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  const dateString = Y + M + D + h + m;
  return dateString;
};
// 判断两个对象键值是否相等
// 获取2015-当前年份
export const getYear = () => {
  const myDate = new Date();
  let thisyear = myDate.getFullYear();
  const a = thisyear - 2015;
  const arr: any = [];
  for (let i = 0; i <= a; i++) {
    arr.push({ value: thisyear-- });
  }
  return arr;
};

export const translateGas = (gases: string[], zh2En?: boolean) => {
  if (zh2En) {
    return gases.map(t => {
      if (t === I18N.carbonInternational.total) return CO2E;
      return t;
    });
  }
  return gases.map(g => {
    if (g === CO2E) return I18N.carbonInternational.total;
    return g;
  });
};

export const CO2E = 'CO₂e';
/** 有子集温室气体的气体分类 */
export const hasChildGases = ['HFCs', 'PFCs'];
const gases = [CO2E, 'CO₂', 'CH₄', 'N₂O', ...hasChildGases, 'SF₆', 'NF₃'];
/** 气体类型选项 */
export const gasesOptions = gases.map(value => ({
  label: translateGas([value])[0],
  value,
}));

// 保留四位和两位小数
export const twoDecimal = (num?: string | number | null) => {
  if (!num) return '';
  return parseFloat(Number(num).toFixed(2));
};

type GenerateOrganizationOptions = {
  id: number;
  organization_id: number;
  [key: string]: any;
};
type ArrayChildType<T> = T extends (infer K)[] ? K : never;
type OriginOptions = ({
  organization_id: number;
} & ArrayChildType<SelectOptions>)[];
/** organization_id 转 user  */
export const addUserToOptions = <T extends OriginOptions>(data: T) =>
  data.map(d => ({
    ...d,
    user: d.organization_id > 0 ? d.organization_id : undefined,
  }));

/** 生成 排放源、设施活动列表 */
export const generateOrganizationOptions = <
  T extends GenerateOrganizationOptions,
  K extends keyof T,
>(
  key: K,
  options?: T[],
) =>
  options?.map(it => ({
    ...it,
    value: it.id,
    label: it[key],
    // 组织是碳阻迹创建的话为0，其他情况下可以删除
    user: it.organization_id === 0 ? undefined : it.id,
  }));

// 排放源录入枚举
export enum EmissionDataEnum {
  emissions_category = 'emission_category',
  emissions_subcategory = 'emission_subcategory',
  emission_source = 'emission_source',
  facility = 'facility_int',
  unit = 'unit',
  active_data_record_mode = 'active_data_record_mode',
  active_data = 'active_data',
  active_data_type = 'active_data_type',
  active_data_grade = 'active_data_grade',
  department = 'department',
  gas_type = 'gas_type',
  emission_factor = 'emission_factor',
  emission_factor_grade = 'emission_factor_grade',
  emission_factor_source = 'emission_factor_source',
  unit_conversion_ratio = 'unit_conversion_ratio',
}

/**
 * 转换单位参数为cascade可用的options
 */
export const useUnitOptions = (
  options?: EmissionList[],
  isGasDisabled?: boolean,
  checkedGas?: ExhaustGasIntListSerializers[],
) => {
  const parentMap: Record<string, UnitCascaderOptions> = {};
  return useMemo(() => {
    let originOptions = options;
    if (isGasDisabled && checkedGas) {
      const ids = checkedGas.map(g => String(g.activity_data_unit));
      originOptions = options?.filter(g => ids.includes(`${g.value}`));
    }

    const res = originOptions?.reduce((tmp, next) => {
      if (parentMap[next.label_two]) {
        const newVal = {
          ...next,
          value: String(next.value),
        } as UnitCascaderOptions;
        parentMap[next.label_two].children = [
          ...parentMap[next.label_two].children,
          newVal,
        ];
        return tmp;
      }
      parentMap[next.label_two] = {
        ...next,
        label: next.label_two,
        value: next.label_two,
        children: [
          { ...next, value: String(next.value) } as UnitCascaderOptions,
        ],
      };
      return [...tmp, parentMap[next.label_two]];
    }, [] as UnitCascaderOptions[]);

    return res;
  }, [options, isGasDisabled, checkedGas]);
};

export enum ReportDataType {
  'annualData' = 1,
  'monthlyData' = 2,
}

export const getReportTimerOptions = () =>
  Object.keys(ReportDataType)
    .filter(k => +k > 0)
    .map(value => ({
      label: ReportDataType[value],
      value: +value,
    }));

/**
 * 日期格式转换
 * "2022年05月01日" =》 "2022-05-01"
 */
export const transformDate = (date: string) => {
  const res = date.replace(/[年|月]/g, '-');
  return res.replace(/日/g, '');
};

/** 单位换算比例（活动数据单位/排放因子分母单位）最大值 */
export const maxUnitRatio = new BigNumber('99999999999.9999999999');

export const minUnitRatioString = '0.0000000001';

export const minUnitRatio = new BigNumber(minUnitRatioString);

export const unitRatioFixedLength = maxUnitRatio.decimalPlaces();
