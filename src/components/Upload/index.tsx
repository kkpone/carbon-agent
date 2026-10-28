/**
 * @file 图片上传组件 目前只支持单张图片上传
 */

import I18N from '@src/lang/I18N';
import IconFont from '@components/iconfont';
import { FC, memo, ReactNode, useMemo, useState } from 'react';
import { Upload as AntUpload, UploadProps as AntUploadProps } from 'antd';
import { UploadChangeParam, UploadFile } from 'antd/es/upload/interface';
import classNames from 'classnames';
import styles from './index.module.scss';

export type UploadProps = {
  value?: string | File;
  // 图片大小限制提示
  sizeTip?: string | ReactNode;
  className?: string;
  onChange?: (file: File) => void;
} & AntUploadProps;

export const Upload: FC<UploadProps> = memo(
  ({ value, sizeTip, onChange, children, className, accept, ...props }) => {
    const [cover, setCover] = useState<UploadProps['value']>(value);
    const coverUrl = useMemo(() => {
      const img = value ?? cover;
      // File
      if (img instanceof File) return window.URL.createObjectURL(img);
      // base64 & url
      return img;
    }, [cover, value]);
    const onChooseFile = (info: UploadChangeParam<UploadFile<File>>) => {
      const file = info.file as unknown as File;
      setCover(file);
      onChange?.(file);
    };
    const usedSizeTip = sizeTip ?? I18N.components.theImageSizeIs;
    return (
      <div className={classNames(styles.uplodaContainer, className)}>
        {coverUrl && (
          <>
            <div
              className={classNames(
                styles.showUploadWrapper,
                'show-upload-img-wrapper',
              )}
            >
              <img src={coverUrl} alt={I18N.components.coverImage} />
            </div>
            {!props.disabled && (
              <div className={styles.reuploadWrapper}>
                <IconFont type='icon-icon-tongxinshangzhuan-1' />
                <div className={styles.reuploadText}>{I18N.carbonFootprint.reUpload}</div>
              </div>
            )}
          </>
        )}

        <AntUpload
          name='avatar'
          listType='picture-card'
          className={classNames(
            styles['avatar-uploader'],
            coverUrl && styles.opacityUpload,
          )}
          showUploadList={false}
          style={{ width: 400 }}
          accept={accept || 'image/*'}
          beforeUpload={() => false}
          onChange={(info: UploadChangeParam<UploadFile<File>>) =>
            onChooseFile(info)
          }
          {...props}
        >
          {children || (
            <div>
              <p>
                <IconFont type='icon-icon-shangzhuantupian' />
              </p>
              <p className='ant-upload-text'>
                {I18N.components.dragHereOr}<span style={{ color: '#07C160' }}>{I18N.components.clickToUpload}</span>
              </p>
              <p className='ant-upload-hint'>{I18N.components.onlySupportsJp}</p>
              <p className='ant-upload-hint'>{usedSizeTip}</p>
            </div>
          )}
        </AntUpload>
      </div>
    );
  },
);
