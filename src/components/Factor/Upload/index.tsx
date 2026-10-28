/**
 * @file 图片上传  card
 */
import I18N from '@src/lang/I18N';
import { Upload, UploadProps } from 'antd';
import IconFont from '@src/components/iconfont';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import style from './index.module.less';

type UploadCardProps<T = any> = UploadProps<T>;

export const UploadCard = <T,>({ onChange, ...props }: UploadCardProps<T>) => {
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
  const onFileChange = (info: UploadChangeParam<UploadFile<T>>) => {
    setFileList(info.fileList);
    onChange?.(info);
  };
  useEffect(() => {
    if (props.fileList) {
      setFileList(props.fileList);
    }
  }, [props.fileList?.length]);
  // 最大上传数
  const { maxCount } = props;
  return (
    <Upload
      {...props}
      className={style.wrapper}
      listType='picture-card'
      onChange={info => {
        onFileChange(info);
      }}
    >
      {typeof maxCount === 'number' && fileList.length >= maxCount ? null : (
        <div className={style.addImgWrapper}>
          <IconFont className={style.icon} type='icon-icon-xinceng-1' />
          <div className={style.cardName}>
            {I18N.carbonFootprint.uploadImages}
          </div>
        </div>
      )}
    </Upload>
  );
};
