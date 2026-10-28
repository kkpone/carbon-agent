/**
 * @description 支撑材料上传选中实时保存
 */

import I18N from '@src/lang/I18N';
import { Button, Upload, UploadFile, UploadProps } from 'antd';
import classNames from 'classnames';
import { cloneDeep } from 'lodash-es';
import { useState } from 'react';

import { baseUrl } from '@/api/request';
import { Toast } from '@/utils';
import { UPLOAD_FILES_RANDOM_NAME_URL } from '@/utils/const';
import { getToken } from '@/utils/cookie';

import style from './index.module.less';

const fileType =
  '.png,.PNG,.jpg,.JPG,.JPEG,.jpeg,.xls,.xlsx,.XLS,.XLSX,.doc,.DOC,.docx,.DOCX,.pdf,.PDF,.rar,.RAR,.zip,.ZIP';

let count = 0;

interface SupportFilesUploadProps<RecordType extends object> {
  buttonType?: 'link' | 'text' | 'default' | 'ghost' | 'primary' | 'dashed';
  /** 上传文件的最大值 */
  maxSize?: number;
  /** 超过最大值的错误提示 */
  errorTipsForSize?: string;
  /** 允许传入的最大数量 */
  maxCount?: number;
  /** 是否允许多选 */
  multiple?: boolean;
  /** 列表中存在的文件 */
  fileList: RecordType[];
  /** 是否禁用 */
  disabled?: boolean;
  /** 文件上传的方法 */
  onChange: (fileList: RecordType[], selectedFileList: UploadFile[]) => void;
}
export const SupportFilesUpload = <RecordType extends object = any>({
  buttonType,
  maxSize = 10 * 1024 * 1024,
  errorTipsForSize = I18N.components.fileSizeNotAppropriate,
  maxCount = 10,
  multiple = false,
  fileList = [],
  disabled,
  onChange,
}: SupportFilesUploadProps<RecordType>) => {
  const fileListBack = cloneDeep(fileList);

  /** 选择的文件个数 */
  const [selectedFileList, setSelectedFileList] = useState<UploadFile[]>([]);

  /** 文件上传的方法 */
  const onImgChange: UploadProps['onChange'] = async ({
    fileList: newFileList,
  }) => {
    const newArr = newFileList.map(file => {
      const { response, name, uid } = file;

      return {
        url: response?.data?.url,
        name,
        uid,
      };
    });

    if (typeof onChange === 'function') {
      onChange([...(newArr as RecordType[])], selectedFileList);
    }
  };

  /** 上传文件的参数 */
  const props: UploadProps = {
    disabled,
    showUploadList: false,
    accept: fileType,
    name: 'file',
    action: `${baseUrl}${UPLOAD_FILES_RANDOM_NAME_URL}`,
    headers: {
      Authorization: getToken(),
    },
    multiple,
    onChange: onImgChange,
    beforeUpload: (file, newFileList) => {
      count += 1;
      setSelectedFileList(newFileList);
      const typeFile = file.name.split('.');
      const fileType = typeFile[typeFile.length - 1];

      if (
        fileListBack.length >= maxCount ||
        [...newFileList, ...fileListBack].length > maxCount
      ) {
        if (count === newFileList.length) {
          count = 0;
          Toast(
            'error',
            I18N.template(I18N.components.maxNumberOfFiles, { val1: maxCount }),
          );
          return false;
        }
        return false;
      }

      if (!fileType.includes(fileType)) {
        if (count === newFileList.length) {
          count = 0;
          Toast(
            'error',
            I18N.template(I18N.components.fileTypeFormat, { val1: fileType }),
          );
          return false;
        }
        return false;
      }

      const sizeFlag = newFileList.some(v => v.size > maxSize);
      if (sizeFlag) {
        if (count === newFileList.length) {
          count = 0;
          Toast('error', errorTipsForSize);
          return false;
        }
        return false;
      }
      count = 0;
      return true;
    },
  };
  return (
    <Upload {...props}>
      <Button
        className={classNames(style.btn, {
          [style.linkUploadBtn]: buttonType === 'link',
        })}
        disabled={disabled}
        type={buttonType}
      >
        {I18N.carbonFootprint.uploadFiles}
      </Button>
    </Upload>
  );
};
