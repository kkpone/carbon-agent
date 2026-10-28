/**
 * @description 导入组件
 */
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Button, Col, Row, Typography, Upload, UploadProps } from 'antd';
import { UploadChangeParam, UploadFile } from 'antd/lib/upload';
import classNames from 'classnames';
import { useRef, useState } from 'react';

import { baseUrl } from '@/api/request';
import { getDownloadTemplateFile } from '@/api/templateFile/service';
import { FormActions } from '@/components/FormActions';
import { IconFont } from '@/components/LcaIconFont';
import { Toast } from '@/utils';
import { UPLOAD_FILES_RANDOM_NAME_URL } from '@/utils/const';
import { getToken } from '@/utils/cookie';
import { downloadBlobFile } from '@/utils/fileUtil';

import { defaultColumns } from './column';
import style from './index.module.less';
import { getImportLogList } from './service';
import { FileType, ImportLogResp } from './type';

const { Text } = Typography;

interface ImportFileProps {
  /** 导入标题 */
  importTitle?: string;
  /** 下载模版的提示文案 */
  downloadTemplateTips?: string;
  /** 下载模版按钮的文案 */
  downloadButtonText?: string;
  /** 上传文件的提示文案 */
  uploadFileTips?: string;
  /** 模版文件类型 */
  templateType?: number;
  /** 导入类型 */
  importType: string;
  /** 关联数据id */
  dataId?: number;
  /** 表格滚动 */
  scroll?: { x?: number | string; y?: number | string };
  /** 文件格式 */
  acceptFileType?: string;
  /** 上传文件的最大值 */
  maxSize?: number;
  /** 表头信息 */
  columns?: ProColumns<ImportLogResp>[];
  /** 下载模版的方法 */
  onDownloadTemplate?: () => void;
  /** 导入文件的方法 */
  onImportFile: (
    /** 导入的文件 */
    fileParams: FileType,
    /** 成功回调 */
    successCallBack: () => void,
    /** 失败回调 */
    failCallBack: () => void,
  ) => void;
  /** 返回按钮 */
  onBack?: () => void;
}

const ImportFile = ({
  importTitle,
  downloadTemplateTips = I18N.components.downloadDataGuide,
  downloadButtonText = I18N.components.downloadTemplate,
  uploadFileTips,
  templateType,
  importType,
  dataId,
  scroll,
  acceptFileType = '.xlsx,.XLSX',
  maxSize = 10,
  columns,
  onDownloadTemplate,
  onImportFile,
  onBack,
}: ImportFileProps) => {
  const tableRef = useRef<ActionType>();

  /** 上传的文件列表 */
  const [fileParams, setFileParams] = useState<FileType>();

  /** 上传文件的loading */
  const [uploadBtnLoading, setUploadBtnLoading] = useState(false);

  /** 导入文件的loading */
  const [importBtnLoading, setImportBtnLoading] = useState(false);

  /** 文件上传 */
  const changeFileFn = (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file.status === 'done') {
      const { url } = info.file.response.data || {};
      const suffixArr = info.file.name.split('.');
      const data = {
        suffix: suffixArr[suffixArr.length - 1],
        url,
        uid: info.file.uid,
        name: info.file.name,
        fileName: info.file.name,
      };
      setFileParams(data);
      setUploadBtnLoading(false);
    }
  };

  /** 上传文件的参数 */
  const fileProps: UploadProps = {
    showUploadList: false,
    accept: acceptFileType,
    name: 'file',
    onChange: changeFileFn,
    action: `${baseUrl}${UPLOAD_FILES_RANDOM_NAME_URL}`,
    headers: {
      Authorization: `${getToken()}`,
    },
    beforeUpload: file => {
      const { name } = file;
      const typeFile = name.split('.');
      const fileType = ['xlsx', 'XLSX'];
      if (!fileType.includes(typeFile[typeFile.length - 1])) {
        Toast(
          'error',
          I18N.template(I18N.supplyChainCarbonManagement.onlySupportsFi, {
            val1: fileType.join(','),
          }),
        );
      }
      if (file.size > maxSize * 1024 * 1024) {
        Toast('error', I18N.components.theFileIsTooLarge);
        return Upload.LIST_IGNORE;
      }
      setUploadBtnLoading(true);
      return true;
    },
  };

  return (
    <div
      className={classNames(style.importFileWrapper, {
        marginBottomFormActionsHeight: !!onBack,
      })}
    >
      {importTitle && <h4 className={style.title}>{importTitle}</h4>}
      <div className={style.header}>
        <Row gutter={[12, 0]}>
          <Col span={12}>
            <div className={style.section}>
              <p className={style.fileTips}>{downloadTemplateTips}</p>
              <Button
                onClick={async () => {
                  /** 如何传入方法，则调用传入的方法，否则走默认的下载模版 */
                  if (onDownloadTemplate) {
                    onDownloadTemplate();
                    return;
                  }
                  if (templateType) {
                    const res = await getDownloadTemplateFile({ templateType });
                    downloadBlobFile(res?.data, res);
                  }
                }}
              >
                {downloadButtonText}
              </Button>
            </div>
          </Col>

          <Col span={12}>
            <div className={style.section}>
              <p className={style.fileTips}>
                {uploadFileTips ||
                  I18N.template(I18N.components.uploadFileSupport2, {
                    val1: maxSize,
                  })}
              </p>
              {fileParams ? (
                <div className={style.fileListBack}>
                  <div className={style.fileListBackFile}>
                    <IconFont
                      className={style.fileIcon}
                      icon='icon-icon-Excel'
                    />
                    <Text
                      className={style.fileName}
                      ellipsis={{ tooltip: false }}
                    >
                      {fileParams.name}
                    </Text>
                  </div>
                  <div className={style.uploadWrapper}>
                    <Upload className={style.upload} {...fileProps}>
                      <Button loading={uploadBtnLoading}>
                        {I18N.components.reUpload}
                      </Button>
                    </Upload>
                    <Button
                      loading={importBtnLoading}
                      type='primary'
                      onClick={async () => {
                        setImportBtnLoading(true);
                        onImportFile(
                          fileParams,
                          () => {
                            setImportBtnLoading(false);
                            setFileParams(undefined);
                            tableRef.current?.reload();
                          },
                          () => {
                            setImportBtnLoading(false);
                          },
                        );
                      }}
                    >
                      {I18N.components.import}
                    </Button>
                  </div>
                </div>
              ) : (
                <Upload {...fileProps}>
                  <Button loading={uploadBtnLoading}>
                    {I18N.components.uploadFiles}
                  </Button>
                </Upload>
              )}
            </div>
          </Col>
        </Row>
      </div>
      <div className={style.tableWrapper}>
        <div className={style.tabelHeader}>
          <h4 className={style.tableTitle}>{I18N.components.importHistory}</h4>
          <Button type='primary' onClick={() => tableRef.current?.reload()}>
            {I18N.components.refresh}
          </Button>
        </div>
        <ProTable<ImportLogResp>
          columns={columns || defaultColumns()}
          actionRef={tableRef}
          pagination={{
            defaultPageSize: 10,
            size: 'default',
            showTotal: undefined,
          }}
          search={false}
          params={{
            dataId,
            importType,
          }}
          scroll={{ ...scroll }}
          columnsState={{
            persistenceKey: 'ImportFile',
            persistenceType: 'localStorage',
          }}
          toolBarRender={false}
          request={async params => {
            const { current = 1, pageSize = 10, ...rest } = params;
            return getImportLogList({
              ...rest,
              pageNum: current,
              pageSize,
            }).then(({ data }) => data?.data);
          }}
        />
      </div>
      {onBack && (
        <FormActions
          place='center'
          buttons={[
            {
              title: I18N.Factors.return,
              onClick: async () => {
                onBack?.();
              },
            },
          ]}
        />
      )}
    </div>
  );
};
export default ImportFile;
