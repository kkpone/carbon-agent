/**
 * @file 碳足迹
 */
import { ProductList } from '@src/api/foot-print/api-types';
import { REPORT_INITIAL, REPORT_INITIALVALUE } from '../actionTypes';

const defaultState: CarbonStepState = {
  initialData: [],
  initialValue: undefined,
};

type CarbonStepState = {
  initialData?: ProductList[];
  initialValue?: string | number;
};

type CarbonStepAction =
  | {
      type: typeof REPORT_INITIAL;
      payload?: CarbonStepState['initialData'];
    }
  | {
      type: typeof REPORT_INITIALVALUE;
      payload: CarbonStepState['initialValue'];
    };

export const carbonStep = (
  state: CarbonStepState = defaultState,
  action: CarbonStepAction,
): CarbonStepState => {
  switch (action.type) {
    case REPORT_INITIAL:
      return { ...state, initialData: action.payload || [] };
    case REPORT_INITIALVALUE:
      return { ...state, initialValue: action.payload };
    default:
      return { ...state };
  }
};
