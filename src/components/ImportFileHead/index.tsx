import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { sleep } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { Button, Upload, UploadProps } from 'antd';
import { RcFile } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import { useEffect, useState } from 'react';

import './index.less';
import { Button as LoadingButton } from '../Button';

/*
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-11-14 18:31:57
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-11-14 18:32:25
 * @FilePath: /new_carbon_cloud/src/components/ImportFileHead/index.tsx
 * @Description: 导入文件头部页面
 */
interface ImportFileHeadType {
  upLoadState: 'default' | 'success' | 'error';
  onDownTemplateLoadHandle: () => void;
  onImportSuccessHandle: (fileList) => void;
  importTextOptions?: {
    downText: string;
    upLoadText: string;
  };
  fileOptions?: {
    maxSize: number;
  };
  importBtnText?: string;
  onFileChange?: UploadProps['onChange'];
}

const ImportFileHead = (props: ImportFileHeadType) => {
  const {
    upLoadState,
    importBtnText,
    onDownTemplateLoadHandle,
    onImportSuccessHandle,
    onFileChange,
    importTextOptions = {
      downText: I18N.components.downloadEmissionSources,
      upLoadText: I18N.carbonFootprint.uploadFileSupport,
    },
    fileOptions = { maxSize: 5 * 1024 * 1024 },
  } = props;

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  useEffect(() => {
    if (upLoadState === 'success') {
      setFileList([]);
    }
  }, [upLoadState]);
  return (
    <div className='import-box'>
      <div className='top flex-j-b'>
        <div className='left flex-d-c flex-j-b flex-a-s'>
          <span>{importTextOptions?.downText}</span>
          <Button type='default' onClick={() => onDownTemplateLoadHandle()}>
            {I18N.components.downloadTemplate}
          </Button>
        </div>
        <div className='right flex-d-c flex-j-b'>
          {upLoadState === 'default' ? (
            <span>{importTextOptions?.upLoadText}</span>
          ) : (
            <div>
              {upLoadState === 'success' ? (
                <CheckCircleOutlined
                  style={{
                    color: '#09C199',
                    width: 16,
                    height: 16,
                  }}
                />
              ) : (
                <CloseCircleOutlined
                  style={{
                    color: '#ED5555',
                    width: 16,
                    height: 16,
                  }}
                />
              )}

              <span>
                {I18N.carbonFootprint.import}
                {upLoadState === 'success'
                  ? I18N.components.success
                  : I18N.components.fail}
              </span>
            </div>
          )}
          <div className='flex-a-c upload-btn'>
            <Upload
              maxCount={1}
              fileList={fileList}
              // eslint-disable-next-line react/no-unstable-nested-components
              iconRender={() => (
                <FileExcelOutlined style={{ color: '#09C199' }} />
              )}
              showUploadList={{
                showRemoveIcon: false,
              }}
            />
            <Upload
              maxCount={1}
              showUploadList={false}
              customRequest={() => {}}
              accept='.xls,.xlsx'
              beforeUpload={(flie: RcFile) => {
                const { size } = flie;

                if (size > fileOptions.maxSize) {
                  Toast('warn', I18N.carbonFootprint.theFileIsTooLarge);
                  return Upload.LIST_IGNORE;
                }
                return true;
              }}
              onChange={(file: any) => {
                const newArr = file.fileList.map((item, index) => {
                  if (item.status === 'done' && item.originFileObj) {
                    if (item.response.code === 200) {
                      return { ...item.response.data, uid: index };
                    }
                  }
                  return item;
                });

                setFileList([...newArr]);
                onFileChange?.(file);
              }}
              // eslint-disable-next-line react/no-children-prop
              children={
                <Button type='default'>
                  {fileList.length
                    ? I18N.carbonFootprint.reUpload
                    : I18N.carbonFootprint.uploadFiles}
                </Button>
              }
            />
            <LoadingButton
              style={{ marginLeft: 20 }}
              type='primary'
              disabled={!fileList.length}
              onClick={async () =>
                Promise.all([onImportSuccessHandle(fileList), sleep(500)])
              }
            >
              {importBtnText ?? I18N.carbonFootprint.import}
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportFileHead;
