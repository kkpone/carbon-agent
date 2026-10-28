/* eslint-disable @typescript-eslint/no-unused-vars */
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ISchema } from '@formily/react';
import {
  initFormilyInput,
  initFormilySelect,
  initFormilyInputTextArea,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';

import styles from './index.module.less';
import { GWPinfo } from '../../../listInfo/util';
import { titleTip } from '../../../utils';

/** 核算模型 */
export const baseSchema = () => {
  const data: ISchema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 3,
          columnGap: 46,
        },
        properties: {
          name: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.modelName, true, {
              maxLength: 50,
              className: styles.row1,
            }),
          },

          // gwp: {
          //   type: 'string',
          //   ...initFormilySelect(I18N.enterpriseCarbonAccount2.gwpInformation, true, {
          //     options: GWPinfo,
          //     className: styles.row2,
          //   }),
          //   title: titleTip(
          //     I18N.enterpriseCarbonAccount2.gwpInformation,
          //     I18N.enterpriseCarbonAccount2.gwpRefersTo,
          //     <QuestionCircleOutlined />,
          //   ),
          // },
          quantization: {
            type: 'string',
            ...initFormilySelect(
              I18N.enterpriseCarbonAccount2.quantitativeMethods,
              false,
              {
                options: [
                  {
                    value: '0',
                    label: I18N.enterpriseCarbonAccount2.emissionFactorMethod,
                  },
                ],
                disabled: true,
                className: styles.row1,
              },
            ),
          },
          description: {
            type: 'string',
            ...initFormilyInputTextArea(
              I18N.enterpriseCarbonAccount2.modelIntroduction,
              false,
              {
                rows: 4,
                className: styles.row2,
                maxLength: 200,
              },
            ),
          },
        },
      },
    },
  };
  return data;
};
