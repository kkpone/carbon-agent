/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-07 20:42:25
 * @Date: 2023-03-07 19:51:32
 * @@description: formily上传图片文件
 */
import { PlusOutlined } from '@ant-design/icons';
import { Field } from '@formily/core';
import { useField } from '@formily/react';
import { JavaUpload } from '@src/components/Upload/JavaUpload';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import { cloneDeep } from 'lodash-es';
import { useEffect, useState } from 'react';

import styleCarbonFootprint3 from '../../index.module.less';
import { AddFileDataAndUid } from '../../type';

type FormilyImgUploadProps = {
  value: AddFileDataAndUid[];
  onChange: (value: AddFileDataAndUid[]) => void;
  noDescribe?: boolean;
  description?: string;
};
export default ({
  value,
  onChange,
  noDescribe,
  description,
}: FormilyImgUploadProps) => {
  const field = useField<Field>();
  /** 上传的文件列表 */
  const [fileListBack, setFileListBack] = useState<AddFileDataAndUid[]>(() => {
    // 设置图片
    if (value && value.length > 0) {
      const filesBack: AddFileDataAndUid[] = value.map(fileData => ({
        name: fileData.name,
        url: fileData.url,
        uid: `${fileData.id}`,
      }));
      return filesBack;
    }
    return [];
  });

  useEffect(() => {
    if (value && fileListBack.length === 0) {
      const filesBack: AddFileDataAndUid[] = value.map(fileData => ({
        name: fileData.name,
        url: fileData.url,
        uid: `${fileData.id}`,
      }));
      setFileListBack(filesBack);
    }
  }, [value]);

  return (
    <div className={styleCarbonFootprint3.uploadMain}>
      {!noDescribe && (
        <div className={styleCarbonFootprint3.uploadDescribe}>
          {I18N.carbonFootprint3.supportPng8}
        </div>
      )}

      <div className='m-t-10'>
        <JavaUpload
          useMoreType
          fileList={fileListBack}
          disabled={field.readPretty || field.disabled}
          accept='.png, .PNG, .jpg, .JPG,.jpeg, .JPEG'
          listType='picture-card'
          maxSize={5 * 1024 * 1024}
          onFileCountChange={(flie: RcFile) => {
            const { type } = flie;
            const isFormat = ['image/jpeg', 'image/png', 'image/jpg'].includes(
              type,
            );
            if (!isFormat) {
              Toast('warn', I18N.carbonFootprint.fileFormatIsIncorrect);
              return true;
            }

            if (fileListBack.length >= 5) {
              Toast('warn', I18N.carbonFootprint.maximumNumberOfFiles);
              return true;
            }
            return false;
          }}
          onChange={(
            file: UploadChangeParam<UploadFile<{ code: number; data: any }>>,
          ) => {
            const newArr = file.fileList
              .map((item, index) => {
                if (item.status === 'done' && item.originFileObj) {
                  if (item.response?.code === 200) {
                    return {
                      url: item.response.data,
                      uid: index,
                      name: 'gag',
                    };
                  }
                }

                if (item.status === 'error') {
                  return undefined;
                }
                return item;
              })
              .filter(haveFile => haveFile && haveFile !== undefined);
            setFileListBack(
              newArr as {
                url: any;
                uid: string;
                name: string;
              }[],
            );
            onChange(
              newArr as {
                url: any;
                uid: string;
                name: string;
              }[],
            );
          }}
          onRemove={(item: any) => {
            const oldFile = cloneDeep(fileListBack).filter(
              res => res.url !== item.url,
            );
            setFileListBack(oldFile);
          }}
          // eslint-disable-next-line react/no-children-prop
          children={
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>
                {I18N.carbonFootprint.uploadImages}
              </div>
            </div>
          }
        />
      </div>
      {description && (
        <div className={styleCarbonFootprint3.uploadDescribe}>
          {description}
        </div>
      )}
    </div>
  );
};
