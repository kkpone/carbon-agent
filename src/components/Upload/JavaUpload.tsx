/*
 * @@description: java 文件上传
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2022-11-29 10:20:27
 */

import I18N from '@src/lang/I18N';
import { javaFileUpload, javaFileUploadMore } from '@src/api/api';
import { UploadImgResponse } from '@src/api/types';
import { Toast } from '@src/utils/Toast';
import { Button, Upload, UploadProps } from 'antd';
import { RcFile } from 'antd/es/upload/interface';
import ImgCrop, { ImgCropProps } from 'antd-img-crop';
import classNames from 'classnames';
import { FC, memo } from 'react';

import style from './javaUpload.module.less';
import IconFont from '../iconfont';

type NoChildren = Omit<ImgCropProps, 'children'>;

export type JavaUploadProps = UploadProps<UploadImgResponse> & {
  maxSize?: number;
  onFileCountChange?: (file: RcFile) => boolean;
  uploadSuccess?: (data) => void;
  useMoreType?: boolean;
  crop?: boolean;
  cropProps?: NoChildren;
  /** 达到数量上限后是否隐藏上传入口，默认保持原行为。 */
  hideUploadWhenMaxCount?: boolean;
};

export const JavaUpload: FC<JavaUploadProps> = memo(
  ({
    children,
    maxSize,
    onFileCountChange,
    uploadSuccess,
    useMoreType = false,
    maxCount,
    fileList,
    className,
    crop,
    cropProps,
    hideUploadWhenMaxCount = true,
    ...props
  }) => {
    const uploadNode = (
      <Upload
        {...props}
        fileList={fileList}
        className={classNames(className, {
          // 图片上传数量超出上限后，隐藏上传图片框
          [style.uploadHidden]:
            hideUploadWhenMaxCount &&
            Number.isSafeInteger(maxCount) &&
            maxCount &&
            fileList &&
            fileList.length >= maxCount,
        })}
        maxCount={maxCount}
        aria-label='java-upload'
        customRequest={({ onError, onSuccess, file }) => {
          const uploadApi = useMoreType ? javaFileUploadMore : javaFileUpload;
          uploadApi(file as File)
            .then(({ data }) => {
              uploadSuccess?.(data);
              onSuccess?.({ ...data });
            })
            .catch(() => {
              onError?.({ name: 'error', message: 'error', status: 500 });
            });
        }}
        beforeUpload={file => {
          if (onFileCountChange?.(file)) {
            return Upload.LIST_IGNORE;
          }
          if (maxSize && file.size > maxSize) {
            Toast('error', I18N.carbonFootprint.theFileIsTooLarge);
            return Upload.LIST_IGNORE;
          }
          return true;
        }}
        itemRender={(node, f, files, action) => {
          if (f?.error) {
            action.remove();
            return null;
          }

          return node;
        }}
      >
        {children || (
          <Button icon={<IconFont type='icon-icon-shangzhuan-1' />}>
            {I18N.components.uploadAttachments}
          </Button>
        )}
      </Upload>
    );
    return crop ? (
      <ImgCrop rotationSlider {...cropProps}>
        {uploadNode}
      </ImgCrop>
    ) : (
      uploadNode
    );
  },
);
