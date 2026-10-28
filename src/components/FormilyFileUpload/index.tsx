/**
 * @description formily 文件上传 供应链/lca专用
 */
import { CloudUploadOutlined } from '@ant-design/icons';
import { Field } from '@formily/core';
import { useField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Spin, Typography, Upload } from 'antd';
import { UploadFile, UploadProps } from 'antd/lib/upload';
import classNames from 'classnames';
import { cloneDeep, isArray } from 'lodash-es';
import { useEffect, useState } from 'react';

import { baseUrl } from '@/api/request';
import { IconFont } from '@/components/LcaIconFont';
import { Toast, getSuffix } from '@/utils';
import { UPLOAD_FILES_RANDOM_NAME_URL } from '@/utils/const';
import { getToken } from '@/utils/cookie';

import style from './index.module.less';
import { FileListType } from './type';

const { Text } = Typography;

const fileType =
  '.png,.PNG,.jpg,.JPG,.JPEG,.jpeg,.xls,.xlsx,.XLS,.XLSX,.doc,.DOC,.docx,.DOCX,.pdf,.PDF,.rar,.RAR,.zip,.ZIP';

const defaultMaxCount = 10;

let isPassBeforeUploadLimit = true;

export const FormilyFileUpload = ({
  maxCount,
  value,
  onChange,
}: {
  maxCount?: number;
  value: FileListType[];
  onChange: (value: FileListType[]) => void;
}) => {
  const field = useField<Field>();
  const isReadPretty = field.readPretty || field.disabled;
  const maxCountBack = maxCount || defaultMaxCount;

  /** 文件列表 */
  const [fileListBack, setFileListBack] = useState<FileListType[]>([]);

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
    if (!isPassBeforeUploadLimit) {
      return;
    }
    const newArr = fileList.map(item => {
      const { response, name, uid } = item;
      if (item.status === 'done' && response?.code === 200) {
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
    if (
      newArr.every(item => item?.url?.length > 0) &&
      typeof onChange === 'function'
    ) {
      onChange([...newArr]);
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
    showUploadList: true,
    disabled: isReadPretty,
    accept: fileType,
    name: 'file',
    maxCount: maxCountBack,
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
          I18N.template(I18N.components.fileTypeFormat, { val1: fileType }),
        );
        isPassBeforeUploadLimit = false;
        return false;
      }

      if (maxCountBack > 1 && fileListBack.length >= maxCountBack) {
        Toast(
          'error',
          I18N.template(I18N.components.maxNumberOfFiles, {
            val1: maxCountBack,
          }),
        );
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        Toast('error', I18N.components.fileSizeNotAppropriate);
        return Upload.LIST_IGNORE;
      }

      isPassBeforeUploadLimit = true;
      return true;
    },
  };

  return (
    <div className={style.fileUploadWrapper}>
      {!isReadPretty && (
        <div className={style.tips}>{I18N.components.supportPdf}</div>
      )}
      <Upload
        {...fileProps}
        fileList={[...fileListBack] as UploadFile[]}
        // eslint-disable-next-line react/no-unstable-nested-components
        itemRender={(_, file, __, actions) => {
          const loading = file.status === 'uploading';

          const nameArr = file?.name?.split('.');
          const suffix = nameArr?.[nameArr.length - 1];
          const name = file?.name?.slice(0, file.name.length - suffix.length);
          const fileItem = {
            ...file,
            suffix,
          };
          return (
            <div
              className={classNames(style.fileWrapper, {
                [style.readPrettyWrapper]: isReadPretty,
              })}
            >
              <div className={style.fileContent}>
                <Spin size='small' spinning={loading}>
                  <a href={fileItem.url} target='_blank' rel='noreferrer'>
                    <IconFont
                      className={style.fileIcon}
                      icon={getSuffix(fileItem.suffix)}
                    />
                    <Text
                      className={style.name}
                      ellipsis={{ suffix: fileItem.suffix }}
                    >
                      {name}
                    </Text>
                  </a>
                </Spin>
              </div>
              {!isReadPretty && (
                <div
                  className={style.delBtn}
                  onClick={() => {
                    actions?.remove();
                  }}
                >
                  <IconFont
                    className={style.delIcon}
                    icon='icon-icon-shanchu'
                  />
                </div>
              )}
            </div>
          );
        }}
      >
        <Button disabled={isReadPretty} icon={<CloudUploadOutlined />}>
          {I18N.carbonFootprint.uploadFiles}
        </Button>
      </Upload>
    </div>
  );
};
