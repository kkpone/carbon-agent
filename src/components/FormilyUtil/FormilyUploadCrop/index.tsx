/**
 * @description Formily自定义组件支持自动裁剪功能
 */

import { PlusOutlined } from '@ant-design/icons';
import { Field } from '@formily/core';
import { useField } from '@formily/react';
import { JavaUpload, JavaUploadProps } from '@src/components/Upload/JavaUpload';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { AddFileDataAndUid } from '@src/views/carbonFootprint3/type';
import {
  RcFile,
  UploadChangeParam,
  UploadFile,
} from 'antd/es/upload/interface';
import { ImgCropProps } from 'antd-img-crop';
import { cloneDeep } from 'lodash-es';
import { useEffect, useState, type ReactNode } from 'react';

import { AcceptFileFormatString, FormatFileArr } from './constants';
import styles from './index.module.less';

type Props = {
  value?: AddFileDataAndUid[];
  className?: string;
  onChange?: (value: AddFileDataAndUid[]) => void;
  acceptArr?: string;
  formatArr?: string[];
  description?: React.ReactNode;
  disabled?: boolean;
  innerDesc?: string;
  descriptionPosition?: 'before' | 'after';
  uploadIcon?: ReactNode;
  /** 达到数量上限后继续选择文件时，用新文件替换现有文件。 */
  replaceOnExceed?: boolean;
};

type NoChildren = Omit<ImgCropProps, 'children'>;

export const FormilyUploadCrop = ({
  maxCount = 2,
  maxSize = 5,
  acceptArr = AcceptFileFormatString,
  formatArr = FormatFileArr,
  value,
  className,
  onChange,
  cropProps,
  description,
  disabled,
  innerDesc,
  descriptionPosition = 'after',
  uploadIcon,
  replaceOnExceed = false,
}: Props & JavaUploadProps) => {
  const field = useField<Field>();

  /** 上传的文件列表 */
  const [fileListBack, setFileListBack] = useState<AddFileDataAndUid[]>(() => {
    // 设置图片
    if (value && value.length > 0) {
      const filesBack: AddFileDataAndUid[] = value.map(fileData => ({
        name: fileData.name,
        url: fileData.url,
        uid: `${fileData.uid}`,
      }));
      return filesBack;
    }
    return [];
  });

  useEffect(() => {
    if (
      value &&
      value.length > 0 &&
      value.every(item => item.url?.length > 0)
    ) {
      const filesBack: AddFileDataAndUid[] = value.map(fileData => ({
        name: fileData.name,
        url: fileData.url,
        uid: `${fileData.uid}`,
        status: 'done',
      }));
      setFileListBack(filesBack);
    } else {
      setFileListBack([]);
    }
  }, [value]);

  const getCropProps = (): NoChildren => {
    const defaultCropProps: NoChildren = {
      modalTitle: I18N.components.kjNovaClipper,
      modalCancel: I18N.carbonFootprint.cancel,
      modalOk: I18N.carbonFootprint.preserve,
      fillColor: 'transparent',
    };
    if (cropProps) {
      return {
        ...defaultCropProps,
        ...cropProps,
      };
    }

    return defaultCropProps;
  };

  useEffect(() => {
    if (value && value.length > 0) {
      const filesBack: AddFileDataAndUid[] = value.map(fileData => ({
        name: fileData.name,
        url: fileData.url,
        uid: `${fileData.id}`,
      }));
      setFileListBack(filesBack);
    } else {
      setFileListBack([]);
    }
  }, [value]);

  return (
    <div>
      {description && descriptionPosition === 'before' && (
        <div className={styles.descriptionBefore}>{description}</div>
      )}
      <JavaUpload
        crop
        className={className}
        cropProps={getCropProps()}
        useMoreType
        fileList={fileListBack}
        disabled={field?.readPretty || disabled}
        accept={acceptArr}
        listType='picture-card'
        maxSize={maxSize * 1024 * 1024}
        maxCount={maxCount}
        hideUploadWhenMaxCount={!replaceOnExceed}
        onFileCountChange={(flie: RcFile) => {
          const { type } = flie;

          const isNoFormat = !formatArr.includes(type);
          if (isNoFormat) {
            Toast('warn', I18N.carbonFootprint.fileFormatIsIncorrect);
            return true;
          }

          if (!replaceOnExceed && fileListBack.length >= maxCount) {
            Toast(
              'warn',
              I18N.template(I18N.components.upToTheMaximumNumberOfImages, {
                val1: maxCount,
              }),
            );
            return true;
          }
          return false;
        }}
        onChange={(file: UploadChangeParam<UploadFile<any>>) => {
          const nextFileList = replaceOnExceed
            ? file.fileList.slice(-maxCount)
            : file.fileList;
          const newArr = nextFileList.map(item => {
            if (item.status === 'done' && item.originFileObj) {
              if (item.response?.code === 200) {
                return {
                  name: item.name,
                  url: item.response.data || '',
                  uid: item.uid,
                };
              }
            }
            return {
              name: item.name,
              url: item.url || '',
              uid: item.uid,
            };
          });
          setFileListBack([...newArr]);
          if (newArr.every(item => item.url.length > 0)) {
            onChange?.([...newArr]);
          }
        }}
        onRemove={(item: any) => {
          const oldFile = cloneDeep(fileListBack).filter(
            res => res.url !== item.url,
          );
          setFileListBack(oldFile);
          onChange?.([...oldFile]);
        }}
        // eslint-disable-next-line react/no-children-prop
        children={
          <div className={styles.uploadWrapper}>
            {uploadIcon || <PlusOutlined className={styles.addIcon} />}
            <div className={styles.addText}>
              {I18N.carbonFootprint.uploadImages}
            </div>
            {innerDesc && <div className={styles.innerDesc}>{innerDesc}</div>}
          </div>
        }
      />
      {description && descriptionPosition === 'after' && (
        <div className={styles.des}>{description}</div>
      )}
    </div>
  );
};
