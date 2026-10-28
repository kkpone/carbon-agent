import { PlusOutlined } from '@ant-design/icons';
import { Field } from '@formily/core';
import { connect, mapProps, mapReadPretty, useField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Upload } from 'antd';
import { UploadProps } from 'antd/lib/upload';
import { cloneDeep, isArray } from 'lodash-es';
import { useEffect, useState } from 'react';

import { commonRequestDownloadFile } from '@/api/commonRequest';
import { baseUrl } from '@/api/request';
import { Toast } from '@/utils';
import { UPLOAD_FILES_RANDOM_NAME_URL } from '@/utils/const';
import { getToken } from '@/utils/cookie';

import style from './index.module.less';
import { FormilyUploadFiles } from './type';

const FormilyPictureCardUpload = ({
  value,
  tips,
  fileType,
  maxCount,
  maxSize,
  onChange,
}: {
  /** 文件 */
  value?: FormilyUploadFiles[];
  /** 提示文案 */
  tips?: string;
  /** 支持上传的文件类型 */
  fileType: string;
  /** 允许上传的文件最大数量 */
  maxCount: number;
  /** 允许上传的文件的最大值 */
  maxSize: number;
  /** 文件变化的时候触发 */
  onChange: (value?: FormilyUploadFiles[]) => void;
}) => {
  const field = useField<Field>();

  const isShowUpload = field.value?.length !== maxCount;

  const isReadPretty = field.readPretty;

  /** 文件列表 */
  const [fileListBack, setFileListBack] = useState<any[]>([]);

  useEffect(() => {
    // 设置文件
    if (value && value.length > 0 && isArray(value)) {
      const arr = value.map(item => {
        const { uid, name, url } = item;
        return {
          uid,
          name,
          url,
        };
      });
      setFileListBack([...arr]);
    } else {
      setFileListBack([]);
    }
  }, [value]);

  /** 文件上传的方法 */
  const onImgChange: UploadProps['onChange'] = ({ fileList }) => {
    const newArr = fileList.map(item => {
      const { response, name, uid } = item;
      if (response) {
        return {
          url: response.data.url,
          name,
          uid,
        };
      }
      return {
        ...item,
      };
    });
    setFileListBack([...newArr]);
    if (typeof onChange === 'function') {
      onChange([...newArr] as FormilyUploadFiles[]);
    }
  };

  /** 删除文件 */
  const onRemove: UploadProps['onRemove'] = file => {
    const oldFile = cloneDeep(fileListBack).filter(res => res.uid !== file.uid);
    setFileListBack(oldFile);
    if (typeof onChange === 'function') {
      onChange(oldFile);
    }
  };

  /** 上传文件的参数 */
  const fileProps: UploadProps = {
    listType: 'picture-card',
    showUploadList: true,
    disabled: isReadPretty,
    accept: fileType,
    name: 'file',
    maxCount,
    action: `${baseUrl}${UPLOAD_FILES_RANDOM_NAME_URL}`,
    headers: {
      Authorization: getToken(),
    },
    onChange: onImgChange,
    onRemove,
    beforeUpload: file => {
      const typeFile = file.name.split('.');

      if (!fileType.includes(typeFile[typeFile.length - 1])) {
        Toast(
          'error',
          I18N.template(I18N.carbonFootPrintLCA.pleaseUploadFi, {
            val1: fileType,
          }),
        );
        return false;
      }

      if (file.size > maxSize * 1024 * 1024) {
        Toast(
          'error',
          I18N.template(I18N.carbonFootPrintLCA.maximumSupportM, {
            val1: maxSize,
          }),
        );
        return Upload.LIST_IGNORE;
      }

      if (maxCount !== 1 && fileListBack.length >= maxCount) {
        Toast(
          'error',
          I18N.template(I18N.carbonFootPrintLCA.upToTheMaximumNumberOfImages, {
            val1: maxCount,
          }),
        );
        return false;
      }
      return true;
    },
  };
  return (
    <div className={style.formilyPictureCardUploadWrapper}>
      <Upload
        {...fileProps}
        fileList={fileListBack}
        onPreview={file => {
          commonRequestDownloadFile(
            file.url || '',
            `${file.name}`,
            !isReadPretty,
          );
        }}
      >
        {isShowUpload && <PlusOutlined className={style.uploadIcon} />}
      </Upload>
      {!isReadPretty && (
        <div className={style.tips}>
          {tips || I18N.carbonFootPrintLCA.imageFormatJ2}
        </div>
      )}
    </div>
  );
};

export default connect(
  FormilyPictureCardUpload,
  mapProps(),
  mapReadPretty(FormilyPictureCardUpload),
);
