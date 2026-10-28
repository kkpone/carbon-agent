/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-12-06 09:57:41
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-08 11:51:34
 */
/**
 * @file 下载管理
 */
// import './carbon-download.scss';
import Permission from '@src/components/Permission';
import I18N from '@src/lang/I18N';
import { addLogUsingPOSTSysOperationLogControllerApi } from '@src/sdks/java/management';
import { Toast } from '@src/utils/Toast';
import useSyncCallback from '@src/utils/useSyncCallback';
import { apiReportFileList } from '@src/views/dashborad/downloadManage/service';
import { Button, Modal, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { noop } from 'lodash-es';
import { createContext, FC, useEffect, useState } from 'react';

// RouteMaps.NoOnline;
export const AppContact: any = createContext({});
const CarbonAccountDownLoad: FC = () => {
  const [pramas, setPramas] = useState({
    page: 1,
    size: 10,
    module: 'carbon-account',
  });
  const [tableList, setTableList] = useState([]);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [downInfo, setdownInfo] = useState({ title: '', path: '' });
  //   const [product, setProduct] = useState([{ value: '', label: '' }]);
  const [showLoading, setshowLoading] = useState(true);
  const getlist = async () => {
    const res: any = await apiReportFileList(pramas);
    if (res.data.data) {
      setTableList(res.data.data.rows);
      setTotal(res.data.data.total);
      setshowLoading(false);
    }
  };
  const syncRequest = useSyncCallback(getlist);
  useEffect(() => {
    // apiMnumListALLByDictTypeBatch({ dictTypes: 'downloadModule' }).then(res => {
    //   const list = res.data.data.downloadModule;
    //   setProduct(
    //     list?.map(item => ({
    //       value: item.dictValue,
    //       label: item.dictLabel,
    //     })),
    //   );
    // });
    getlist();
  }, []);

  //   const onSearch = () => {
  //     const module = form.getFieldValue('module');
  //     setPramas({ ...pramas, module, page: 1 });
  //     syncRequest();
  //   };
  //   const reset = () => {
  //     form.resetFields();
  //     setPramas({ ...pramas, page: 1 });
  //     onSearch();
  //   };
  //   const [form] = Form.useForm();

  const columns: ColumnsType<any> = [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      render: (text, record, index: number) => index + 1,
    },
    {
      title: I18N.carbonFootprint.fileName,
      dataIndex: 'fileName',
      width: 400,
    },
    {
      title: I18N.dashborad.productModules2,
      dataIndex: 'moduleDesc',
      width: 100,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: I18N.carbonFootprint.fileStatus,
      dataIndex: 'status',
      width: 110,
      render: (text: string) => (
        <div>
          {/*  eslint-disable-next-line no-nested-ternary */}
          {text === '0'
            ? I18N.carbonFootprint.generating
            : // eslint-disable-next-line no-nested-ternary
            text === '1'
            ? I18N.carbonFootprint.generated
            : text === '2'
            ? I18N.dashborad.generationFailed
            : '--'}
        </div>
      ),
    },
    {
      title: I18N.carbonFootprint.operator2,
      dataIndex: 'createBy',
      width: 100,
      render: (text: string) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.carbonFootprint.creationTime,
      dataIndex: 'createTime',
      width: 180,
      render: (text: string) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'accessTime',
      fixed: 'right',
      width: 80,
      render: (text: string, record: any) => (
        <Permission flag='management:report:download'>
          {record.status === '1' ? (
            <Button
              type='link'
              style={{ paddingLeft: 0 }}
              onClick={() => {
                if (record.path) {
                  // 记录下载日志
                  addLogUsingPOSTSysOperationLogControllerApi({
                    module: I18N.dashborad.downloadFiles,
                    moduleType: '4',
                    operValue: I18N.template(
                      I18N.carbonAccount.downloadFileText2,
                      { val1: record.fileName },
                    ),
                  }).catch(noop);
                  const downloadElement = document.createElement('a');
                  downloadElement.style.display = 'none';
                  downloadElement.href = record.path;
                  downloadElement.download = record.fileName; // 下载后文件名
                  document.body.appendChild(downloadElement);
                  downloadElement.click(); // 点击下载
                  document.body.removeChild(downloadElement);
                  setTimeout(() => {
                    setdownInfo({
                      path: record.path,
                      title: record.fileName,
                    });
                    setVisible(true);
                  }, 1000);
                } else {
                  Toast('warn', I18N.dashborad.currentlyUnavailableForDownload);
                }
              }}
            >
              {I18N.carbonFootprint.download}
            </Button>
          ) : (
            '--'
          )}
        </Permission>
      ),
    },
  ];
  return (
    <div>
      <div className='search'>
        <Row className='title'>
          <h2 className='tip'>{I18N.carbonFootprint.downloadManagement}</h2>
        </Row>
      </div>
      <Table
        scroll={{ x: 900 }}
        bordered
        expandIconColumnIndex={-1}
        className='SearchTable'
        dataSource={tableList}
        loading={showLoading}
        columns={columns}
        pagination={{
          pageSize: pramas?.size,
          current: pramas?.page,
          total,
        }}
        onChange={e => {
          setPramas({ ...pramas, page: e.current || 0, size: e.pageSize || 0 });
          syncRequest();
        }}
      />
      <Modal
        title={I18N.carbonFootprint.prompt}
        open={visible}
        onOk={() => {
          setVisible(false);
        }}
        onCancel={() => {
          setdownInfo({ title: '', path: '' });
          setVisible(false);
        }}
      >
        <div className='cur-po' style={{ marginBottom: '10px' }}>
          <span>
            {I18N.dashborad.forExample}
            <a
              href={downInfo.path}
              target='_blank'
              download={downInfo.title || I18N.carbonFootprint.download}
              rel='noreferrer'
              onClick={() => {
                addLogUsingPOSTSysOperationLogControllerApi({
                  module: I18N.dashborad.downloadFiles,
                  moduleType: '4',
                  operValue: I18N.template(
                    I18N.carbonAccount.downloadFileText,
                    { val1: downInfo.title || I18N.carbonFootprint.download },
                  ),
                }).catch(noop);
              }}
            >
              {I18N.dashborad.downloadHere}
            </a>
          </span>
        </div>
      </Modal>
    </div>
  );
};

export default CarbonAccountDownLoad;
