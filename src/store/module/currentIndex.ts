/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-06-01 14:10:23
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-01-30 14:40:43
 */
import store from '..';

interface NavState {
  currentNav: string;
  productId: string;
}

const defaultState: NavState = {
  /* 控制导航栏 激活样式 */
  currentNav: '',
  productId: '',
};

const SET_CURRENT = 'SET_CURRENT';
const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
const PRODUCT_KEY = 'PRODUCT_KEY';

type Actions =
  | {
      type: typeof SET_CURRENT;
      payload: NavState['currentNav'];
    }
  | {
      type: typeof UPDATE_PRODUCT;
      payload: NavState['productId'];
    };

/** 设置当前导航顶部选中产品 */
export const setCurrentIndex = (payload: NavState['currentNav']) => {
  store.dispatch({
    type: SET_CURRENT,
    payload,
  });
};
export const changeProduct = (id: NavState['productId']) => {
  store.dispatch({
    type: UPDATE_PRODUCT,
    payload: id,
  });
};

const CurrentIndexReducer = (
  state = defaultState,
  action: Actions,
): NavState => {
  const { type } = action;
  let result = { ...state };
  switch (type) {
    case SET_CURRENT:
      result = {
        ...state,
        currentNav: action.payload,
      };
      localStorage.setItem(PRODUCT_KEY, JSON.stringify(result));
      return result;
    case UPDATE_PRODUCT:
      result = {
        ...state,
        productId: action.payload,
      };

      localStorage.setItem(PRODUCT_KEY, JSON.stringify(result));
      return result;
    default:
      const s = JSON.parse(localStorage.getItem(PRODUCT_KEY) || '{}');
      return { ...state, ...s };
  }
};

export default CurrentIndexReducer;
