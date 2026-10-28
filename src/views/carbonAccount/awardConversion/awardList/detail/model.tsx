import I18N from '@src/lang/I18N';
import { FromItemProps } from '@src/components/FormUtil/type';
import { formItemInitInput } from '@src/components/FormUtil/util';
import { FormInstance } from 'antd';

import AwardListDetailUpload from './upload';

/** 文件上传label */
const UploadLable = () => (
  <div>
    <span>{I18N.carbonAccount.productTheme}</span>
    <span style={{ color: '#999EA4', fontSize: 12 }}>
      {I18N.carbonAccount.suggestXPixels}</span>
  </div>
);
/**
 * 奖励列表 详情
 * @returns
 */
export const carbonAccountAwardListDetailItem = (
  form: FormInstance<any>,
  isAdd: boolean,
  isEdit: boolean,
  imgUrl?: string,
): FromItemProps<any>[] => {
  const backBoolean = () => true;
  const getFileList = () => {
    if (imgUrl) {
      return [
        {
          uid: '-1',
          name: '',
          url: imgUrl,
        },
      ];
    }
    return [];
  };
  const data: FromItemProps<any>[] = [
    {
      ...formItemInitInput(I18N.carbonNeutral.productName, 'goodsName', backBoolean()),
      col: 12,
      props: {
        maxLength: 50,
      },
    },
    {
      ...formItemInitInput(I18N.carbonFootprint3.sort, 'orderNum', true),
      col: 12,
      props: {
        maxLength: 50,
        type: 'number',
      },
    },
    {
      label: UploadLable(),
      name: 'imgPath',
      type: 'render',
      rules: true,
      render: () => AwardListDetailUpload({ form, fileList: getFileList() }),
      rulesCustom: [
        () => ({
          validator(_: any, validatorVal: string) {
            if (!validatorVal) {
              return Promise.reject(new Error(I18N.carbonAccount.coverImageRequired));
            }
            return Promise.resolve();
          },
        }),
      ],
    },
  ];
  return data.map(item => {
    const back = item;
    back.col = 12;
    return back;
  });
};
