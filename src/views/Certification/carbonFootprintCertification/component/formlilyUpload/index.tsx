import I18N from '@src/lang/I18N';
import { CloudUploadOutlined } from '@ant-design/icons';
import { Field } from '@formily/core';
import { useField } from '@formily/react';
import { Toast } from '@src/utils/Toast';
import { Button, Upload, UploadProps } from 'antd';
import { UploadChangeParam } from 'antd/es/upload';
import { FC } from 'react';

import style from './index.module.less';
import { isUndefined } from 'lodash-es';

interface FormlilyUploadProps extends UploadProps {
  maxSize: number;
}

const FormlilyUpload: FC<FormlilyUploadProps> = ({
  maxSize,
  maxCount = 1,
  ...rest
}) => {
  const field = useField<Field>();

  const onChange = (info: UploadChangeParam<any>) => {
    const newArr = info?.fileList?.map(item => {
      const { name } = item;
      if (item.status === 'done' && item.originFileObj) {
        if (item.response?.code === 200) {
          const url = item.response.data;
          return {
            name,
            url,
          };
        }
      }
      return {
        ...item,
      };
    });

    field.setValue([...newArr]);
  };

  const showUploadList = {
    downloadIcon: <>下载</>,
  };

  const showUpload = !(maxCount === field?.value?.length || field.readPretty);

  return (
    <div className={style.formlilyUpload}>
      <div className={style.uploadWrap}>
        <Upload
          {...rest}
          multiple
          name='file'
          action={`${process.env.REACT_APP_API_URL || ''}/file/file/uploadImg`}
          fileList={field.value || []}
          {...field.componentProps}
          beforeUpload={uploadFile => {
            if (uploadFile.size > maxSize * 1024 * 1024) {
              Toast(
                'error',
                I18N.template(I18N.Certification.fileSizeNotAppropriate, {
                  val1: maxSize,
                }),
              );
              return Upload.LIST_IGNORE;
            }
            return true;
          }}
          showUploadList={
            isUndefined(rest.showUploadList)
              ? showUploadList
              : rest.showUploadList
          }
          onChange={onChange}
        >
          {showUpload && (
            <Button className={style.uploadBtn} icon={<CloudUploadOutlined />}>
              {I18N.carbonFootprint.uploadFiles}
            </Button>
          )}
        </Upload>
      </div>
      {!field.readPretty && (
        <span className={style.des}>{I18N.Certification.supportPdf}</span>
      )}
    </div>
  );
};

export default FormlilyUpload;
