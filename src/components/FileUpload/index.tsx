import {
  DeleteOutlined,
  DownloadOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Upload } from 'antd';
import { FC } from 'react';

import { Toast } from '@/utils';
import { getToken } from '@/utils/cookie';

import styles from './index.module.less';
import { IconAlibabaNew } from '../iconfont';

const FileUpload: FC<{
  fileList?: { name: string; uid: string; url: string }[];
  fileSize?: number;
  fileCount?: number;
  fileTypeList?: string[];
  disabled?: boolean;
  onChange: (val: { name: string; uid: string; url: string }[]) => void;
}> = ({
  fileList,
  fileSize = 50,
  fileCount = 10,
  fileTypeList = [
    'xls',
    'xlsx',
    'pdf',
    'jpg',
    'jpeg',
    'png',
    'doc',
    'docx',
    'rar',
    'zip',
  ],
  disabled,
  onChange,
}) => (
  <>
    <Upload<{ data: string }>
      accept='.xls, .xlsx, .pdf, .jpg, .png, .doc, .docx, .rar, .zip, .XLS, .XLSX, .PDF, .JPG, .PNG, .DOC,.DOCX, .RAR, .ZIP'
      action={`${process.env.REACT_APP_API_URL || ''}/file/file/uploadImg`}
      headers={{
        Authorization: getToken(),
      }}
      name='file'
      fileList={fileList}
      showUploadList={false}
      beforeUpload={file => {
        const { name } = file;
        const fileType = name.split('.').pop();

        if (!fileTypeList.includes((fileType ?? '').toLowerCase())) {
          Toast(
            'error',
            I18N.template(I18N.supplyChain.onlySupportsFi, {
              val1: fileTypeList.join(','),
            }),
          );
          return Upload.LIST_IGNORE;
        }

        if (file.size > fileSize * 1024 * 1024) {
          Toast('error', I18N.carbonFootprint3.fileMaximumNot);
          return Upload.LIST_IGNORE;
        }

        if (fileList && fileList.length >= fileCount) {
          Toast('error', I18N.supplyChain.uploadUpTo);
          return Upload.LIST_IGNORE;
        }

        return true;
      }}
      onChange={e => {
        onChange(
          (e.fileList || []).map(file => ({
            ...file,
            url: file.url || file.response?.data || '',
          })),
        );
      }}
    >
      {!disabled && (
        <Button
          icon={
            <IconAlibabaNew
              className={styles.uploadIcon}
              type='icon-icon-shangchuan'
            />
          }
        >
          {I18N.emission.uploadSourceFiles}
        </Button>
      )}
    </Upload>
    {fileList && fileList.length > 0 && (
      <div className={styles.fileContent}>
        {(fileList || []).map(file => (
          <div className={styles.fileItem}>
            <div className={styles.fileName} title={file.name}>
              {file.name}
            </div>
            <div className={styles.operate}>
              {(file as unknown as { status: string }).status ===
              'uploading' ? (
                <LoadingOutlined />
              ) : (
                <>
                  <DownloadOutlined
                    className={styles.operateIcon}
                    onClick={() => window.open(file.url)}
                  />
                  {!disabled && (
                    <DeleteOutlined
                      className={styles.operateIcon}
                      onClick={() =>
                        onChange(
                          (fileList || []).filter(
                            item => item.url !== file.url,
                          ),
                        )
                      }
                    />
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </>
);

export default FileUpload;
