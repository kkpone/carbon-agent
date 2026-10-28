import { Dictionary } from '@typings/index';
import { ADD_LIFECYCLE_INFO } from '../actionTypes';

type Actions = {
  type: typeof ADD_LIFECYCLE_INFO;
  payload: any;
};

type NationalState = {
  units: string[];
} & Dictionary<any>;

const defaultState: NationalState = {
  units: [],
};

export const carbonproductReducer = (
  state: NationalState = defaultState,
  actions: Actions,
): NationalState => {
  switch (actions.type) {
    case ADD_LIFECYCLE_INFO:
      return { ...state, life_cycle_json: actions.payload };
    default:
      return { carbonProductInfo: {}, ...state };
  }
};
