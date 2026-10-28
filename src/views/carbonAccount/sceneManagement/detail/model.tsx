/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:44
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-16 18:44:01
 */
import { FromItemProps } from '@src/components/FormUtil/type';
import {
  formItemInitInput,
  formItemInitType,
  formItemInputSchema,
} from '@src/components/FormUtil/util';
import I18N from '@src/lang/I18N';
import { Options } from '@src/typings/utils';
import { FormInstance } from 'antd';

import { FormilyUploadCrop } from '@/components/FormilyUtil/FormilyUploadCrop';

/**
 * 场景管理的 基础信息
 * @returns
 */
export const carbonAccountSceneManagementBasicsDetailItem = (
  isDefault: boolean,
  isEdit: boolean,
  isFind: boolean,
  form: FormInstance<any>,
  showPicTripConfigField: boolean,
  defaultIconUrl?: string,
  sceneClassify?: Options,
): FromItemProps<any>[] => {
  const backBoolean = () => !isDefault;

  const data: FromItemProps<any>[] = [
    {
      ...formItemInitInput(
        I18N.carbonAccount.sceneEncoding,
        'sceneCode',
        isEdit ? false : backBoolean(),
      ),
      props: {
        disabled: isDefault || isEdit,
        prefix: isDefault || isEdit || isFind ? '' : 'U-',
      },
    },
    {
      ...formItemInitType(
        isDefault ? 'select' : 'input',
        I18N.carbonAccount.sceneName,
        'sceneName',
        true,
      ),
      props: {
        maxLength: 10,
        disabled: !isEdit,
      },
    },
    {
      ...formItemInitInput(
        I18N.carbonAccount.carbonReductionCoefficient,
        'rate',
        isEdit ? false : backBoolean(),
      ),
      props: {
        disabled: isDefault || isEdit,
        suffix: 'gCO₂e',
      },
    },
    formItemInitInput(I18N.carbonFootprint.number, 'orderNum', true),
    {
      ...formItemInitType(
        'select',
        I18N.carbonAccount.classification,
        'sceneClassify',
        isEdit,
        {
          props: {
            options: sceneClassify,
          },
        },
      ),
    },
    ...(showPicTripConfigField
      ? [
          {
            name: 'picTripConfig',
            label: '照片来源方式',
            type: 'checkbox' as const,
            rules: true,
            props: {
              options: [
                { label: '拍照', value: '0', disabled: true },
                { label: '相册选择', value: '1' },
              ],
            },
          },
        ]
      : []),
    {
      name: 'sceneIcon',
      label: (
        <div>
          <span>场景Icon</span>
          {isEdit && (
            <span
              style={{ marginLeft: 8, cursor: 'pointer', color: '#0cbf9f' }}
              onClick={() => {
                if (defaultIconUrl) {
                  form.setFieldValue('sceneIcon', [
                    { uid: '-1', name: '', url: defaultIconUrl },
                  ]);
                  form.validateFields(['sceneIcon']);
                }
              }}
            >
              使用默认Icon
            </span>
          )}
        </div>
      ),
      type: 'render',
      rules: false,
      rulesCustom: [{ required: true, message: '请上传Icon图片' }],
      render: () => <FormilyUploadCrop maxCount={1} disabled={!isEdit} />,
    },
  ];
  return data.map(item => {
    const back = item;
    back.col = 8;
    if (isFind) {
      back.props = { ...back.props, disabled: true };
    }
    return back;
  });
};

/**
 * 场景管理的 基础信息
 * @returns
 */
export const carbonAccountSceneManagementIntegralDetailItem = (
  isDisableUnit: boolean,
  isFind: boolean,
  activeSceneUnit?: { label: string; value: number }[],
  activeScenePeriodType?: { label: string; value: string }[],
  showFloorField?: boolean,
): FromItemProps<any>[] => {
  const backBoolean = () => true;
  const data: FromItemProps<any>[] = [
    formItemInputSchema({
      label: I18N.carbonAccount.unitActivityCarbon,
      name: 'unitScore',
      rules: backBoolean(),
    }),
    {
      ...formItemInitType(
        'select',
        I18N.carbonAccount.activityUnit,
        'sceneUnit',
        true,
      ),
      props: {
        // 9.21 富城说占时不让修改
        disabled: true || isDisableUnit,
        options: activeScenePeriodType,
      },
    },
    {
      ...formItemInitType(
        'select',
        I18N.carbonAccount.activityCycle,
        'periodType',
        true,
      ),
      props: {
        options: activeSceneUnit,
      },
    },
    ...(showFloorField
      ? [
          formItemInitType(
            'inputNumber',
            '楼层间隔时间（秒）',
            'intervals',
            true,
            {
              props: { max: 1000, min: 0, controls: false },
            },
          ),
          formItemInitType(
            'inputNumber',
            '开始结束最大间隔时间（秒）',
            'maxSecond',
            true,
            {
              props: { max: 6000, min: 0, controls: false },
            },
          ),
        ]
      : []),
  ];
  return data.map(item => {
    const back = item;
    back.col = 8;
    if (isFind) {
      back.props = { ...back.props, disabled: true };
    }
    return back;
  });
};
