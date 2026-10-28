import { ValueOf } from 'type-fest';

import { FORECAST_WAY, HISTORY_DATA_RANGE } from '../constant';

export type ReducingForecastData = {
  yesterYear: string;
  yesterYearEmissions: string | null;
  forecastYear: string;
  forecastYearEmissions: string | null;
  forecastChangeRatio: string;
  chartDataList: {
    year: string;
    emission: number;
    realityEmission: number;
    beforeFlag: boolean;
  }[];
};

export type ReducingForecastSetting = {
  type: ForecastWay;
  marketRatio: string;
  productRatio: string;
  employeeRatio: string;
  placeRatio: string;
  dataScope: HistoryDataRange;
};

type HistoryDataRange = ValueOf<typeof HISTORY_DATA_RANGE>;

export type ForecastWay = ValueOf<typeof FORECAST_WAY>;
