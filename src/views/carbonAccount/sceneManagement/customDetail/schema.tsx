import { ISchema } from '@formily/react';
import {
  initFormilyInput,
  initFormilyInputTextArea,
  initFormilySelect,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';
import { genLengthValidator } from '@src/views/carbonFootprint3/discharge/process/utils';

/** 产品碳足迹核算 - 产品 */
export const baseSchema = ({
  isEdit,
  onRegenerate,
}: {
  isEdit: boolean;
  onRegenerate?: () => void;
}): ISchema => {
  const data = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 3,
          columnGap: 20,
        },
        properties: {
          customType: {
            type: 'number',
            title: I18N.carbonAccount.completionMethod,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'CustomTypeRadio',
            'x-component-props': {
              options: [
                {
                  label: I18N.carbonAccount.photograph,
                  value: 0,
                },
                {
                  label: I18N.carbonAccount.scanCode,
                  value: 1,
                },
              ],
              onRegenerate,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          },
          noData1: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': '',
            'x-decorator-props': {
              gridSpan: 2,
            },
          },
          sceneCode: {
            type: 'string',
            ...initFormilyInput(I18N.carbonAccount.sceneEncoding, true, {
              disabled: isEdit,
            }),
            'x-validator': [genLengthValidator({ max: 50 })],
            'x-hidden': !isEdit,
          },
          sceneName: {
            type: 'string',
            ...initFormilyInput(I18N.carbonAccount.sceneName, true),
            'x-validator': [genLengthValidator({ max: 9 })],
          },
          red: {
            type: 'string',
            ...initFormilyInput(
              I18N.carbonAccount.carbonReductionCoefficient,
              false,
              {
                disabled: isEdit,
                placeholder: '0',
                addonAfter: 'gCO₂e',
                value: 0,
              },
            ),
            'x-validator': [genLengthValidator({ max: 50 })],
            'x-hidden': !isEdit,
          },
          orderNum: {
            type: 'string',
            title: I18N.carbonFootprint.number,
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker',
            required: true,
            'x-decorator-props': {
              gridSpan: 1,
            },
            'x-component-props': {
              min: 0,
              precision: 0,
            },
            // ...initFormilyInput('序号', true, {}),
            // 'x-validator': [
            //   genRequiredValidator({ title: '产品编码' }),
            //   genLengthValidator({ max: 50 }),
            // ],
          },
          sceneClassify: {
            type: 'string',
            ...initFormilySelect(I18N.carbonAccount.sceneClassification, true, {
              options: [],
            }),
          },
          picTripConfig: {
            type: 'string',
            'x-decorator': 'FormItem',
            title: '照片来源方式',
            'x-validator': {
              required: true,
            },
            'x-component': 'Checkbox.Group',
            'x-component-props': {
              options: [
                { label: '拍照', value: '0', disabled: true },
                { label: '相册选择', value: '1' },
              ],
            },
            'x-reactions': [
              {
                dependencies: ['.customType'],
                fulfill: {
                  state: {
                    visible: `{{$deps[0] === 0}}`,
                  },
                },
              },
            ],
          },
          sceneIcon: {
            type: 'string',
            'x-decorator': 'FormItem',
            title: I18N.carbonAccount.scenarioIco,
            // 'x-decorator-props': {
            //   gridSpan: 2,
            // },
            'x-validator': {
              required: true,
            },
            'x-component': 'FormilyUploadCrop',
            'x-component-props': {
              noDescribe: true,
            },
          },
          examplePicList: {
            type: 'Array',
            'x-decorator': 'FormItem',
            title: I18N.carbonAccount.uploadSampleImages,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-validator': {
              required: false,
            },
            'x-component': 'FormilyUploadCrop',
            'x-component-props': {
              noDescribe: true,
              maxCount: 5,
              cropProps: {
                aspect: 0.5,
              },
            },
            'x-reactions': [
              {
                dependencies: ['.customType'],
                fulfill: {
                  state: {
                    visible: `{{$deps[0] === 0}}`,
                  },
                },
              },
            ],
          },
        },
      },
    },
  };
  return data;
};

/** 产品碳足迹核算 - 产品 */
export const activeSchema = (): ISchema => {
  const data = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 3,
          columnGap: 20,
        },
        properties: {
          unitScore: {
            type: 'number',
            title: I18N.carbonAccount.unitActivityCarbon,
            'x-decorator': 'FormItem',
            required: true,

            'x-component': 'NumberPicker',
            'x-component-props': {
              min: 0,
              max: 10000,
              precision: 4,
            },
            'x-validator': {
              min: 0,
              max: 10000,
            },
          },
          sceneUnit: {
            type: 'number',
            ...initFormilySelect(I18N.carbonAccount.activityUnit, true, {
              options: [
                {
                  label: I18N.carbonAccount.unrestricted,
                  value: 0,
                },
                {
                  label: I18N.carbonAccount.limitScore,
                  value: 1,
                },
                {
                  label: I18N.components.second,
                  value: 2,
                },
                {
                  label: I18N.carbonAccount.limitScoresAnd,
                  value: '3',
                },
              ],
              value: '2',
              disabled: true,
            }),
          },
          periodType: {
            type: 'number',
            ...initFormilySelect(I18N.carbonAccount.activityCycle, true, {
              options: [
                {
                  label: I18N.carbonAccount.day,
                  value: '1',
                },
                {
                  label: I18N.carbonAccount.week,
                  value: '2',
                },
                {
                  label: I18N.DomesticVersion.month2,
                  value: '3',
                },
                {
                  label: I18N.DomesticVersion.year,
                  value: '4',
                },
              ],
            }),
          },
          remark: {
            type: 'string',
            'x-decorator-props': {
              gridSpan: 2,
            },
            ...initFormilyInputTextArea(
              I18N.carbonAccount.activityRules,
              false,
              {
                rows: 4,
                placeholder: I18N.carbonAccount.everyCompletedActivity,
              },
            ),
            'x-validator': {
              max: 1000,
            },
          },
          noData: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': '',
            'x-decorator-props': {
              gridSpan: 1,
            },
          },
          limit: {
            type: 'object',
            'x-decorator': 'FormItem',
            title: I18N.carbonAccount.carbonCoinRestrictions,
            'x-component': 'CheckInput',
            'x-decorator-props': {
              gridSpan: 2,
            },
          },
        },
      },
    },
  };
  return data;
};
