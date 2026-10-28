import { ExclamationCircleOutlined } from '@ant-design/icons';
import { ISchema, SchemaReactions } from '@formily/react';
import I18N from '@src/lang/I18N';
import { isNil } from 'lodash-es';

import styles from './index.module.less';
import { ForecastWay } from './type';
import {
  FORECAST_WAY,
  FORECAST_WAY_DESC,
  FORECAST_WAY_ICON,
  FORECAST_WAY_LABEL,
  HISTORY_DATA_RANGE,
  HISTORY_DATA_RANGE_LABEL,
} from '../constant';

const FormItemProps = {
  colon: false,
  labelStyle: {
    color: '#6C757D',
  },
};

const NumberPickerProps = {
  className: styles.numberInput,
  placeholder: I18N.enterpriseCarbonAccount2.pleaseEnterANumber,
  addonAfter: '%',
  stringMode: true,
  controls: false,
};

const numberValidator = (val: string) => {
  if (isNil(val) || val === '') {
    return '';
  }

  if (!/^(\d+)(.\d{0,2})?$/.test(val)) {
    return I18N.enterpriseCarbonAccount2.pleaseEnterANumber;
  }

  const number = Number(val);
  return number >= 0 && number <= 1000
    ? ''
    : I18N.enterpriseCarbonAccount2.pleaseEnterANumber;
};

export const genForecastSettingSchema: () => ISchema = () => {
  const typeFieldReaction: (type: ForecastWay) => SchemaReactions = type => ({
    dependencies: ['type'],
    fulfill: {
      schema: {
        'x-visible': `{{$deps[0] == ${type}}}`,
      },
    },
  });

  const planning = I18N.enterpriseCarbonAccount2.plannedSalesRevenue;
  const forecast = I18N.enterpriseCarbonAccount2.estimatedSalesRevenue;

  return {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        title: I18N.enterpriseCarbonAccount2.predictionMethod,
        required: true,
        default: FORECAST_WAY.FUTURE,
        'x-component': 'FormilyCardSelect',
        'x-decorator': 'FormItem',
        'x-decorator-props': FormItemProps,
        enum: [
          {
            value: FORECAST_WAY.FUTURE,
            title: FORECAST_WAY_LABEL[FORECAST_WAY.FUTURE],
            desc: FORECAST_WAY_DESC[FORECAST_WAY.FUTURE],
            icon: 'icon-icon_weilaiguihuayuce',
            iconSelect: FORECAST_WAY_ICON[FORECAST_WAY.FUTURE],
          },
          {
            value: FORECAST_WAY.HISTORY,
            title: FORECAST_WAY_LABEL[FORECAST_WAY.HISTORY],
            desc: FORECAST_WAY_DESC[FORECAST_WAY.HISTORY],
            icon: 'icon-icon_lishishujuyuce',
            iconSelect: FORECAST_WAY_ICON[FORECAST_WAY.HISTORY],
          },
        ],
      },
      dataScope: {
        type: 'string',
        title: I18N.enterpriseCarbonAccount2.basedOnHistoricalData,
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Radio.Group',
        'x-decorator-props': {
          ...FormItemProps,
          tooltipIcon: <ExclamationCircleOutlined />,
          tooltip: I18N.enterpriseCarbonAccount2.dataRangeNotAvailable,
        },
        default: HISTORY_DATA_RANGE.RECENT_THREE_YEAR,
        enum: Object.values(HISTORY_DATA_RANGE).map(rangeValue => ({
          value: rangeValue,
          label: HISTORY_DATA_RANGE_LABEL[rangeValue],
        })),
        'x-reactions': typeFieldReaction(FORECAST_WAY.HISTORY),
      },
      marketRatio: {
        type: 'string',
        title: I18N.enterpriseCarbonAccount2.plannedSalesRevenue,
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'NumberPicker',
        'x-decorator-props': FormItemProps,
        'x-component-props': NumberPickerProps,
        'x-reactions': {
          dependencies: ['type'],
          fulfill: {
            schema: {
              title: `{{$deps[0] == ${FORECAST_WAY.FUTURE} ? '${planning}' : '${forecast}'}}`,
            },
          },
        },
        'x-validator': numberValidator,
      },
      productRatio: {
        type: 'string',
        title: I18N.enterpriseCarbonAccount2.planningProductProduction,
        'x-decorator': 'FormItem',
        'x-component': 'NumberPicker',
        'x-decorator-props': FormItemProps,
        'x-component-props': NumberPickerProps,
        'x-reactions': typeFieldReaction(FORECAST_WAY.FUTURE),
        'x-validator': numberValidator,
      },
      employeeRatio: {
        type: 'string',
        title: I18N.enterpriseCarbonAccount2.planEmployees,
        'x-decorator': 'FormItem',
        'x-component': 'NumberPicker',
        'x-decorator-props': FormItemProps,
        'x-component-props': NumberPickerProps,
        'x-reactions': typeFieldReaction(FORECAST_WAY.FUTURE),
        'x-validator': numberValidator,
      },
      placeRatio: {
        type: 'string',
        title: I18N.enterpriseCarbonAccount2.planningSiteGround,
        'x-decorator': 'FormItem',
        'x-component': 'NumberPicker',
        'x-decorator-props': FormItemProps,
        'x-component-props': NumberPickerProps,
        'x-reactions': typeFieldReaction(FORECAST_WAY.FUTURE),
        'x-validator': numberValidator,
      },
    },
  };
};
