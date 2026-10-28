/**
 * @file 存储 当前的 echertOption
 */
import {
  SAVEECARBONECHERTOPTION,
  CLEAR,
  GET_CARBON_ECHERT_OPTION,
} from '../actionTypes';

const carbonDataObj = {
  width: 'auto',
  height: 'auton',
  tooltip: {
    position: 'top',
  },
  legend: {
    data: ['排放量', '排放强度'],
  },
  xAxis: [
    {
      type: 'category',
      data: [],
      axisPointer: {
        type: 'shadow',
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      name: '排放量(tCO2)',
      min: 0,
      max: 250,
      interval: 50,
      axisLabel: {
        // formatter: '{value} tCO2',
        formatter: '{value}',
      },
    },
    {
      type: 'value',
      name: `排放强度`,
      min: 0,
      max: 25,
      interval: 5,
      axisLabel: {
        // formatter: `{value} ${unit}`,
        formatter: `{value}`,
      },
    },
  ],
  series: [
    {
      name: '排放量',
      type: 'bar',
      tooltip: {
        valueFormatter(value: string) {
          return `${value} tCO₂`;
        },
      },
      data: [],
    },
    {
      name: '排放强度',
      type: 'line',
      yAxisIndex: 1,
      tooltip: {
        valueFormatter(value: string) {
          return `${value} °C`;
        },
      },
      data: [],
    },
  ],
};
type CarbonDataObjType = typeof carbonDataObj;
type DefaultStateType = { '1-1'?: CarbonDataObjType; [x: string]: any };
const defaultState: DefaultStateType = {
  '1-1': carbonDataObj,
};

type GlobalModalMsgAction =
  | {
      type: typeof SAVEECARBONECHERTOPTION;
      payload: DefaultStateType;
    }
  | {
      type: typeof CLEAR;
    }
  | {
      type: typeof GET_CARBON_ECHERT_OPTION;
    };

export const globalCarbonDataEchertOption = (
  state: DefaultStateType = defaultState,
  action: GlobalModalMsgAction,
): DefaultStateType => {
  switch (action.type) {
    case SAVEECARBONECHERTOPTION:
      return { ...state, ...action.payload };
    case GET_CARBON_ECHERT_OPTION:
      return { ...defaultState };
    case CLEAR:
      return { ...defaultState };
    default:
      return { ...state };
  }
};
