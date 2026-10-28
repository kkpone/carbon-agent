import { ISchema, SchemaReactions } from '@formily/react';
import {
  initFormilyCascader,
  initFormilyInput,
  initFormilyInputTextArea,
  initFormilySelect,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';
import { DefaultOptionType } from 'antd/lib/cascader';

import { AMOUNT, MAX_DECIMAL_PLACE } from '../../discharge/process/constant';
import {
  genLengthValidator,
  genRequiredValidator,
} from '../../discharge/process/utils';
import { genNumberValidator } from '../../util';

const { MAX } = AMOUNT;

/** 产品碳足迹核算 - 产品 */
export const accountProductSchema = (): ISchema => {
  const perWeightReaction: SchemaReactions = {
    dependencies: ['perUnitCode'],
    fulfill: {
      schema: {
        required: `{{$deps[0]}}`,
      },
    },
  };
  const perUnitCodeReaction: SchemaReactions = {
    dependencies: ['perWeight'],
    fulfill: {
      schema: {
        required: `{{$deps[0]}}`,
      },
    },
  };
  const data = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          columnGap: 20,
        },
        properties: {
          productName: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.productName, true),
            'x-validator': [
              genRequiredValidator({ title: I18N.carbonFootprint.productName }),
              genLengthValidator({ max: 50 }),
            ],
          },
          productCode: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.productCode, true),
            'x-validator': [
              genRequiredValidator({ title: I18N.carbonFootprint.productCode }),
              genLengthValidator({ max: 50 }),
            ],
          },
          specification: {
            type: 'string',
            ...initFormilyInput(
              I18N.carbonFootprint.specificationAndModel,
              false,
            ),
            'x-validator': [genLengthValidator({ max: 100 })],
          },
          accountUnitCode: {
            type: 'string',
            ...initFormilyCascader(I18N.carbonFootprint.unit, true, {
              displayRender: (labels: string[]) => labels?.[1],
              showSearch: (inputValue: string, path: DefaultOptionType[]) =>
                path.some(
                  option =>
                    (option.label as string)
                      .toLowerCase()
                      .indexOf(inputValue.toLowerCase()) > -1,
                ),
            }),
            'x-reactions': [
              '{{useFieldUnitDictSource ("factorUnitM")}}',
              '{{useFieldSetValueByLabel}}',
            ],
          },
          amountColumn: {
            type: 'void',
            title: I18N.carbonFootprint3.unitProductWeight,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'FormGrid',
            properties: {
              perWeight: {
                type: 'number',
                ...initFormilyInput(I18N.carbonFootprint.quantity, false),
                title: false,
                'x-validator': [
                  genRequiredValidator({
                    title: I18N.carbonFootprint.quantity,
                  }),
                  genNumberValidator({
                    max: MAX,
                    decimalPlace: MAX_DECIMAL_PLACE,
                  }),
                ],
                'x-reactions': [perWeightReaction],
              },
              perUnitCode: {
                type: 'string',
                ...initFormilySelect(I18N.carbonFootprint.unit, false),
                title: false,
                'x-reactions': [perUnitCodeReaction],
              },
            },
          },
          productTypeObj: {
            type: 'string',
            title: I18N.carbonFootprint3.productClassification,
            'x-decorator': 'FormItem',
            'x-component': 'FormilyInputSelect',
            'x-component-props': {
              placeholder: I18N.carbonFootprint3.pleaseSelectAProduct2,
            },
          },
          productPic: {
            type: 'number',
            'x-decorator': 'FormItem',
            title: I18N.carbonFootprint3.productImages,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-validator': {
              required: false,
            },
            'x-component': 'FormilyUploadCrop',
            'x-component-props': {
              description: I18N.carbonFootprint3.supportPng,
            },
          },
          productDesc: {
            type: 'string',
            'x-decorator-props': {
              gridSpan: 2,
            },
            ...initFormilyInputTextArea(
              I18N.carbonFootprint3.productDescription,
              false,
              {
                rows: 4,
              },
            ),
            'x-validator': {
              max: 1000,
            },
          },
          files: {
            type: 'number',
            'x-decorator': 'FormItem',
            title: I18N.carbonFootprint3.productProductionWorker,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-validator': {
              required: false,
            },
            'x-component': 'FormilyImgUpload',
            'x-component-props': {
              noDescribe: true,
              description: I18N.carbonFootprint3.supportPng4,
            },
          },
          techDesc: {
            type: 'string',
            ...initFormilyInputTextArea(
              I18N.carbonFootprint3.productProductionWorker2,
              false,
              {
                rows: 4,
              },
            ),
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-validator': {
              max: 1000,
            },
          },
        },
      },
    },
  };
  return data;
};
