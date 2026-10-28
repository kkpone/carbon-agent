import I18N from '@src/lang/I18N';
import { ISchema } from '@formily/react';
import {
  initFormilyInputTextArea,
  initFormilyRadio,
} from '@src/components/FormilyUtil/util';

export const baseSchema = () => {
  const data: ISchema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 1,
          columnGap: 46,
        },
        properties: {
          suType: {
            type: 'string',
            ...initFormilyRadio(I18N.enterpriseCarbonAccount2.problemType, false, {
              options: [
                { value: '1', label: I18N.enterpriseCarbonAccount2.missingAnswer },
                { value: '2', label: I18N.enterpriseCarbonAccount2.theAnswerIsNotAccurate },
                { value: '3', label: I18N.enterpriseCarbonAccount2.theAnswerIsNotHelpful },
                { value: '4', label: I18N.carbonFootprint3.other },
              ],
            }),
            default: '0',
            'x-decorator-props': {
              gridSpan: 1,
            },
          },
          content: {
            type: 'string',
            ...initFormilyInputTextArea(I18N.enterpriseCarbonAccount2.problemDescription, true, {
              rows: 4,
              placeholder: I18N.enterpriseCarbonAccount2.pleaseEnterTheQuestion,
            }),
          },
          suggestionFiles: {
            type: 'number',
            'x-decorator': 'FormItem',
            description: I18N.enterpriseCarbonAccount2.onlyHoldJpg,
            title: I18N.enterpriseCarbonAccount2.screenshotOfTheProblem,
            'x-decorator-props': {
              gridSpan: 1,
            },
            'x-validator': {
              required: false,
            },
            'x-component': 'FormilyImgUpload',
            'x-component-props': {
              noDescribe: true,
            },
          },
        },
      },
    },
  };
  return data;
};
