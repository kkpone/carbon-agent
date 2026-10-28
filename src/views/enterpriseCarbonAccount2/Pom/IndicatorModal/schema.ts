import { ISchema } from '@formily/react';
import {
  initFormilyInput,
  initFormilyCascader,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';

export const genIndicatorSchema: () => ISchema = () => ({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      ...initFormilyInput(I18N.enterpriseCarbonAccount2.indicatorName, true),
      'x-validator': [
        {
          required: true,
          message: I18N.enterpriseCarbonAccount2.pleaseFillInTheIndicators,
        },
        { maxLength: 50 },
      ],
    },
    unit: {
      type: 'string',
      ...initFormilyCascader(I18N.carbonFootprint.unit, true, {
        showSearch: true,
      }),
      'x-reactions': ['{{useFiledUnitDictSource("factorUnitM")}}'],
    },
  },
});
