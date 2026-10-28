/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-22 10:27:08
 * @Date: 2022-11-15 14:46:18
 * @@description: 过程核算 - 输出导入文件
 */

import I18N from '@src/lang/I18N';
import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import { Col, Row, Upload, UploadProps } from 'antd';
import { FormActions } from '@src/components/FormActions';

import { getToken } from '@src/utils/cookie';
import { Toast } from '@src/utils/Toast';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import IconFont from '@src/components/iconfont';
import { saveAs } from 'file-saver';
import { AxiosResponse } from 'axios';
import { filterIcon } from '@src/views/Certification/ProjectDetails/indexjson';
import { listALLByDictTypeBatch } from '@src/api/api';
import { Dicts } from '@src/views/emission/Show/type';
import { AddFileData } from '@src/views/carbonFootprint3/type';
import { useParams } from 'react-router-dom';
import { Button } from '@src/components/Button';
import { importFileInitTableCol } from './model';
import style from './index.module.less';
import {
  ImportFileApiData,
  ProductImportParams,
  ProductImportTableData,
  ProductImportTableList,
} from './type';
import {
  getFileImportProductTemplate,
  getFileProductImportApi,
  postFileImportProcessOutApi,
} from './service';
import { FOOTPRINT3_IMPORT_FILE_KEY } from './constant';

const CarbonFootprint3ImportFile = (props: {
  status: string;
  apiParams?: Partial<ImportFileApiData>;
}) => {
  const { accountId, processId } = useParams<{
    accountId: string;
    processId: string;
  }>();
  const { status, apiParams } = props;
  /** 查询的条件 */
  const [searchParamsData] = useState<ProductImportParams>({
    page: 1,
    size: 10,
    type: 1,
    module: accountId,
  });
  /** 上传文件的loading */
  const [btnLoading, setBtnLoading] = useState<boolean>(false);

  const childRef = useRef<TableRef>();

  /** 上传的文件列表 */
  const [fileListBack, setFileListBack] = useState<AddFileData>();

  /** 显示加载中 */
  const [tableLoading] = useState<boolean>(false);

  /** 下载模版 - 模版地址 */
  const [downLoadTemplateUrl, setDownLoadTemplateUrl] = useState<string>();

  /** 文件change事件 */
  const imgChange = (info: UploadChangeParam<UploadFile<any>>) => {
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
    accept: '.xls, .xlsx, .XLS, .XLSX',
    name: 'file',
    onChange: imgChange,
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
          I18N.template(I18N.carbonFootprint3.onlySupportsFi2, {
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
  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<AxiosResponse<ProductImportTableData>>,
  ) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });
  /** 下载文件 */
  const downloadFile = (url: string, name?: string) => {
    Toast('success', I18N.carbonFootprint.startDownloading);
    saveAs(url, name);
  };
  /** 表头 */
  const columns = [
    ...importFileInitTableCol(),
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'set',
      render: (val: string, item: ProductImportTableList) => (
        <div>
          <span
            onClick={() => {
              downloadFile(item.url, item.name);
            }}
            className={`${style.primaryColorFont} m-r-10`}
          >
            {I18N.carbonFootprint.sourceFile}
          </span>
          <span
            onClick={() => {
              downloadFile(item.urlError, item.name);
            }}
            className={`${style.primaryColorFont}`}
          >
            {I18N.carbonFootprint.abnormalData}
          </span>
        </div>
      ),
    },
  ];

  /**
   * @description: 导入文件
   */
  const importFile = async () => {
    if (fileListBack) {
      const subData: ImportFileApiData = {
        ...apiParams,
        fileUrl: fileListBack.url,
      };

      const back = await postFileImportProcessOutApi(subData, {
        accountId,
        processId,
      });
      if (back.data.code === 200) {
        setFileListBack(undefined);
        // 刷新当前表格
        childRef.current?.reset();
      }
    }
  };

  const init = async () => {
    const dic = await listALLByDictTypeBatch<{
      footprint3_export_template: Dicts[];
    }>({
      dictTypes: 'footprint3_export_template',
    });
    const { footprint3_export_template } = dic.data.data;

    if (status === 'product') {
      const back = await getFileImportProductTemplate();

      if (back.data.data) setDownLoadTemplateUrl(back.data.data);
    } else {
      const getExportData = footprint3_export_template.find(
        ex => ex.dictValue === FOOTPRINT3_IMPORT_FILE_KEY.PROCESS_ACCOUNT_OUT,
      );

      if (getExportData) setDownLoadTemplateUrl(getExportData.relatedValue);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className={`${style.carbonFootprintImportFile} m-b-60`}>
      <div className={classNames(style.header, 'm-t-16')}>
        <Row>
          <Col className='p-r-10' span={12}>
            <div className={classNames(style.headerMain)}>
              <div className={style.secondLevelTitle}>
                {I18N.carbonFootprint3.downloadOutputModule}
              </div>
              <div className='m-t-16'>
                <Button
                  onClick={async () => {
                    if (downLoadTemplateUrl) {
                      downloadFile(
                        downLoadTemplateUrl,
                        I18N.carbonFootprint3.outputTemplate,
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
                        style={{ fontSize: '20px', color: 'rgb(15,193,153)' }}
                        type={filterIcon(fileListBack.suffix)}
                      />
                      <span className='m-l-10'>{fileListBack.name}</span>
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
        <CommonTable<ProductImportTableList, any>
          bordered={false}
          searchParams={searchParamsData}
          cRef={childRef}
          pageSize={10}
          loading={tableLoading}
          fetchApi={params =>
            getFileProductImportApi({
              pageSize: params.size,
              pageNum: params.page,
              ...searchParamsData,
            })
          }
          returnFetchApi={returnFetchApi}
          columns={columns}
          rowKey='id'
        />
      </div>
      <FormActions
        place='center'
        buttons={[
          {
            title: I18N.carbonFootprint.return,
            onClick: async () => {
              history.back();
            },
          },
        ]}
      />
    </div>
  );
};

export default CarbonFootprint3ImportFile;
