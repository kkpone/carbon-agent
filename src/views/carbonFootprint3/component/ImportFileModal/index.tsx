/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-23 14:35:29
 * @Date: 2023-05-09 16:48:20
 * @@description: 弹框显示导入文件页面
 */
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { getToken } from '@src/utils/cookie';
import { filterIcon } from '@src/views/Certification/ProjectDetails/indexjson';
import { Button, Col, Modal, Row, Upload, UploadProps } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import { AxiosResponse } from 'axios';
import classNames from 'classnames';
import saveAs from 'file-saver';
import { memo, useRef, useState } from 'react';

import { importFileModalTableCol } from './colums';
import style from './index.module.less';
import { ImportFileModelProps } from './type';
import { AddFileData } from '../../type';
import TextOverflowTable from '../TextOverflowTable';

interface TableItem {
  name: string;
  // 正确数据源地址
  url: string;
  // 异常数据源地址
  urlError: string;
}

/** 导入记录表格数据 - 接口返回 */
interface ImportTableData<TableItemData> {
  rows: TableItemData[];
  total: number;
}

const ImportFileModal = memo(
  <TableList extends TableItem, TableSearch>({
    visible,
    title,
    downLoadTemplateUrl,
    downLoadTemplateName,
    acceptFileType,
    searchParamsData,
    getFileListRequest,
    importFileRequestBack,
    onCancelBack,
    onOkImport,
  }: ImportFileModelProps<TableList, TableSearch>) => {
    const childRef = useRef<TableRef>();

    /** 上传文件的类型限制 */
    const accept = acceptFileType || '.xls, .xlsx, .XLS, .XLSX';

    /** 上传的文件列表 */
    const [fileListBack, setFileListBack] = useState<AddFileData>();

    /** 上传文件的loading */
    const [btnLoading, setBtnLoading] = useState<boolean>(false);

    /** 导入按钮loading */
    const [importBtnLoading, setImportBtnLoading] = useState<boolean>(false);

    const downloadFile = (url: string, name?: string) => {
      Toast('success', I18N.carbonFootprint.startDownloading);
      saveAs(url, name);
    };

    /** 文件change事件 */
    const fileChange = (info: UploadChangeParam<UploadFile<any>>) => {
      if (info.file.status === 'done') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const url = info.file.response.data;
        const nameArr = info.file.name.split('.');
        const data = {
          suffix: nameArr[nameArr.length - 1],
          name: info.file.name,
          url,
          uid: info.file.uid,
        };
        setFileListBack(data);
        setBtnLoading(false);
      }
    };

    /** 上传文件的参数 */
    const fileProps: UploadProps = {
      showUploadList: false,
      accept,
      name: 'file',
      onChange: fileChange,
      action: `${
        process.env.REACT_APP_API_URL || ''
      }/footprint3/sysImportRecord/upload`,
      headers: {
        Authorization: getToken(),
      },
      beforeUpload: file => {
        const { name } = file;
        const typeFile = name.split('.');
        const fileType = ['xls', 'xlsx', 'XLS', 'XLSX'];
        if (!fileType.includes(typeFile[typeFile.length - 1])) {
          Toast(
            'error',
            I18N.template(I18N.carbonFootprint3.onlySupportsFi4, {
              val1: fileType.join(','),
            }),
          );
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          Toast('error', I18N.carbonFootprint.theFileIsTooLarge);
          return Upload.LIST_IGNORE;
        }
        setBtnLoading(true);
        return true;
      },
    };

    /**
     * @description: 导入文件
     */
    const importFile = async () => {
      if (fileListBack) {
        try {
          setImportBtnLoading(true);
          // 调用导入后的回调方法
          const back = await importFileRequestBack(
            fileListBack.url,
            fileListBack.name,
          );
          if (back.code === 200) {
            setImportBtnLoading(false);
            setFileListBack(undefined);
            // 刷新当前表格
            childRef.current?.reset();
            // 成功回调
            if (onOkImport) {
              onOkImport(back.data);
            }
          }
        } catch (error) {
          setImportBtnLoading(false);
        }
      }
    };

    /** 表头 */
    const columns: ColumnsType<TableList> = [
      ...importFileModalTableCol<TableList>(),
      {
        title: I18N.carbonFootprint.operation,
        fixed: 'right',
        width: 160,
        dataIndex: 'set',
        render: (val: string, item: TableList) => (
          <div>
            <span
              onClick={() => {
                if (item.url) {
                  downloadFile(item.url, item.name);
                }
              }}
              className={`${style.primaryColorFont} m-r-10`}
            >
              {I18N.carbonFootprint.sourceFile}
            </span>
            <span
              onClick={() => {
                if (item.urlError) {
                  downloadFile(item.urlError, item.name);
                }
              }}
              className={`${style.primaryColorFont}`}
            >
              {I18N.carbonFootprint.abnormalData}
            </span>
          </div>
        ),
      },
    ];

    /**  格式化接口返回的地址  */
    const returnFetchApi = (
      back: AxiosResponse<AxiosResponse<ImportTableData<TableList>>>,
    ) => ({
      data: back.data.data.rows,
      count: back.data.data.total,
    });

    return (
      <Modal
        title={title}
        width={1240}
        centered
        maskClosable={false}
        open={visible}
        footer={null}
        bodyStyle={{
          paddingBottom: 0,
          paddingTop: 0,
        }}
        onCancel={() => onCancelBack()}
      >
        <div className={style.carbonFootprintImportFile}>
          <div className={classNames(style.header, 'm-t-16')}>
            <Row>
              <Col className='p-r-10' span={12}>
                <div className={classNames(style.headerMain)}>
                  <div className={style.secondLevelTitle}>
                    {I18N.carbonFootprint3.downloadTemplateRoot}
                  </div>
                  <div className='m-t-16'>
                    <Button
                      onClick={async () => {
                        if (downLoadTemplateUrl) {
                          downloadFile(
                            downLoadTemplateUrl,
                            downLoadTemplateName ||
                              I18N.carbonFootprint3.importTemplate,
                          );
                        }
                      }}
                    >
                      {I18N.carbonFootprint.downloadTemplate}
                    </Button>
                  </div>
                </div>
              </Col>
              <Col className='p-l-10' span={12}>
                <div className={classNames(style.headerMain)}>
                  <div className={style.secondLevelTitle}>
                    {I18N.carbonFootprint.uploadFileSupport}
                  </div>
                  <div className='m-t-10'>
                    {fileListBack ? (
                      <div className={style.fileListBack}>
                        <div className={style.fileListBackFile}>
                          <IconFont
                            style={{
                              fontSize: '20px',
                              color: 'rgb(15,193,153)',
                            }}
                            type={filterIcon(fileListBack.suffix)}
                          />
                          <span className='m-l-10'>
                            <TextOverflowTable
                              value={fileListBack.name}
                              maxWidth={200}
                              maxLength={10}
                            />
                          </span>
                        </div>
                        <div className='m-l-20'>
                          <Upload {...fileProps}>
                            <Button
                              loading={btnLoading}
                              icon={
                                <IconFont
                                  type='icon-icon-shangzhuan-3'
                                  style={{ fontSize: '16px' }}
                                />
                              }
                            >
                              {I18N.carbonFootprint.reUpload}
                            </Button>
                          </Upload>
                          <Button
                            loading={importBtnLoading}
                            onClick={importFile}
                            type='primary'
                            className='m-l-16'
                          >
                            {I18N.carbonFootprint.import}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Upload {...fileProps}>
                        <Button
                          loading={btnLoading}
                          icon={
                            <IconFont
                              type='icon-icon-shangzhuan-3'
                              style={{ fontSize: '16px' }}
                            />
                          }
                        >
                          {I18N.carbonFootprint.uploadFiles}
                        </Button>
                      </Upload>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <div
            style={{ fontWeight: 400 }}
            className={classNames(style.productTitle, 'm-t-20')}
          >
            {I18N.carbonFootprint.importHistory}
          </div>
          <div className='m-t-10'>
            <CommonTable<TableList, any>
              bordered={false}
              searchParams={searchParamsData}
              cRef={childRef}
              pageSize={10}
              fetchApi={params =>
                getFileListRequest({
                  ...searchParamsData,
                  pageSize: params.size,
                  pageNum: params.page,
                })
              }
              scroll={{ x: 1000, y: 500 }}
              returnFetchApi={returnFetchApi}
              columns={columns}
              rowKey='id'
            />
          </div>
        </div>
      </Modal>
    );
  },
);

export default ImportFileModal as <TableList, TableSearch>(
  props: ImportFileModelProps<TableList, TableSearch>,
) => JSX.Element;
