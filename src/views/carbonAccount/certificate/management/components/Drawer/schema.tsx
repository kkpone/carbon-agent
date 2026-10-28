import I18N from '@src/lang/I18N';
import { ISchema } from '@formily/react';
import { initFormilyInput } from '@src/components/FormilyUtil/util';
import { genLengthValidator } from '@src/views/carbonFootprint3/discharge/process/utils';
import { Modal } from 'antd';
import styles from './schema.module.less';

const Renders = ({ text, url, height }) => (
  <div className={styles.tip}>
    {text}
    <span
      onClick={() => {
        Modal.info({
          title: I18N.carbonAccount.exampleImage,
          content: (
            <div>
              <img
                style={{ width: '700px', height: `${height}px` }}
                src={url}
                alt=''
              />
            </div>
          ),
          width: 800,
          okText: I18N.carbonFootprint.confirm,
          cancelText: I18N.carbonFootprint.cancel,
          closable: true,
        });
      }}
      className={styles.example}
    >
      {I18N.carbonAccount.exampleImage}</span>
  </div>
);

/** 产品碳足迹核算 - 产品 */
export const baseSchema = (): ISchema => {
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
          name: {
            type: 'string',
            ...initFormilyInput(I18N.carbonAccount.certificateName, true),
            'x-validator': [genLengthValidator({ max: 8 })],
            'x-decorator-props': {
              gridSpan: 2,
            },
          },
          unlockPic: {
            type: 'string',
            'x-decorator': 'FormItem',
            title: I18N.carbonAccount.medalImage,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-validator': {
              required: true,
            },
            'x-component': 'FormilyUploadCrop',
            description: Renders({
              text: I18N.carbonAccount.suggestedSizeX3,
              url: 'https://carbonstop-saas.oss-cn-beijing.aliyuncs.com/saas-product/saas-assets/locontent.png',
              height: 232,
            }),
          },
          stylePic: {
            type: 'string',
            'x-decorator': 'FormItem',
            title: I18N.carbonAccount.certificateImage,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-validator': {
              required: true,
            },
            'x-component': 'FormilyUploadCrop',
            description: Renders({
              text: I18N.carbonAccount.suggestedSizeX2,
              url: 'https://carbonstop-saas.oss-cn-beijing.aliyuncs.com/saas-product/saas-assets/cercontent.png',
              height: 450,
            }),
            'x-component-props': {
              cropProps: {
                aspect: 975 / 1536,
                modalWidth: 800,
              },
            },
          },
          showType: {
            type: 'number',
            title: I18N.carbonAccount.beforeUnlocking,
            enum: [
              {
                label: I18N.carbonAccount.show,
                value: 0,
              },
              {
                label: I18N.carbonAccount.hide,
                value: 1,
              },
            ],
            'x-decorator': 'FormItem',
            'x-component': 'Radio.Group',
            'x-decorator-props': {
              gridSpan: 2,
            },
          },
          '[periodBegin,periodEnd]': {
            title: I18N.carbonAccount.unlockCycle,
            'x-decorator': 'FormItem',
            'x-component': 'DatePicker.RangePicker',
            'x-component-props': {
              showTime: true,
            },
            type: 'string',
            'x-decorator-props': {
              gridSpan: 2,
            },
          },
          conditionList: {
            type: 'array',
            'x-component': 'ArrayItems',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            title: I18N.carbonAccount.unlockingConditionsComplete,
            required: true,
            items: {
              type: 'object',
              'x-decorator': 'ArrayItems.Item',
              properties: {
                sceneId: {
                  type: 'number',
                  title: '',
                  enum: [
                    { label: I18N.carbonFootprint3.option2, value: 1 },
                    { label: I18N.carbonFootprint3.option, value: 2 },
                  ],
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-decorator-props': {
                    gridSpan: 1,
                  },
                  'x-component-props': {
                    style: {
                      width: 160,
                    },
                  },
                },
                conditionValue: {
                  type: 'string',
                  title: '',
                  'x-decorator': 'FormItem',
                  'x-component': 'NumberPicker',
                  'x-decorator-props': {
                    gridSpan: 1,
                    style: {
                      width: 226,
                    },
                  },
                  'x-reactions': {
                    dependencies: ['.sceneId'],
                    fulfill: {
                      schema: {
                        'x-component-props': {
                          addonAfter: `{{useGetState($deps[0])}}`,
                        },
                      },
                    },
                  },
                },
                remove: {
                  type: 'void',
                  'x-decorator': 'FormItem',
                  'x-component': 'ArrayItems.Remove',
                },
              },
            },
            properties: {
              add: {
                type: 'void',
                title: I18N.carbonAccount.addScene,
                'x-component': 'ArrayItems.Addition',
              },
            },
          },
        },
      },
    },
  };
  return data;
};
