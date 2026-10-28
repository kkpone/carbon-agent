/**
 * @file 碳盘查国际版 reducer
 */
import {
  CaculationBaseData,
  CompanyUnits,
  ReportInfo,
} from '@api/carbon-national/types';
import {
  ADD_CARBONS_JSON,
  ADD_DOMESTIC_REPORT,
  ADD_FUEL_DATA,
} from '../actionTypes';

const defaultState: CarbonNationalState = {
  // 报告名称、年份
  report: undefined,
  // 添加机组时的基础信息
  fuelDatas: undefined,

  // function_json: undefined, CaculationBaseData[2].dict_value  fuelDatas
  // fuel_data: undefined,   CaculationBaseData[1].dict_value    fuelDatas
  carbon_json: undefined,
};

type CarbonNationalState = {
  report?: ReportInfo;
  fuelDatas?: CaculationBaseData[];
  carbon_json?: CompanyUnits[];
};

type CarbonNationalAction =
  | {
      payload: CaculationBaseData[];
      type: typeof ADD_FUEL_DATA;
    }
  | {
      payload: ReportInfo;
      type: typeof ADD_DOMESTIC_REPORT;
    }
  | {
      type: typeof ADD_CARBONS_JSON;
      payload: CompanyUnits[];
    };

export const carbonNationals = (
  state: CarbonNationalState = defaultState,
  action: CarbonNationalAction,
): CarbonNationalState => {
  switch (action.type) {
    case ADD_FUEL_DATA:
      return { ...state, fuelDatas: action.payload };
    case ADD_DOMESTIC_REPORT:
      return { ...state, report: action.payload };
    case ADD_CARBONS_JSON:
      return { ...state, carbon_json: action.payload };
    default:
      return { ...state };
  }
};
