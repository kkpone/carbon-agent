/*
 * @@description:碳账户-用户管理-活动数据记录
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-09-22 14:15:46
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-20 10:48:43
 */

import I18N from '@src/lang/I18N';
import { Key, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { formPropsInit } from '@src/components/FormUtil/util';
import '../../index.less';
import Permission from '@src/components/Permission';
import { checkPermissions } from '@src/components/Permission/utils';
import SearchFormUtil from '@src/components/SearchForm';
import { TableActions } from '@src/components/Table/components/TableActions';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import { rollbackBatchUsingPOSTDefaultApi } from '@src/sdks/java/carbonAccount';
import { Toast } from '@src/utils/Toast';
import { apiMnumListALLByDictTypeBatch } from '@src/views/emission/Show/service';
import {
  Button,
  Form,
  FormProps,
  Modal,
  Spin,
  Upload,
  Input,
  Alert,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import { UploadChangeParam } from 'antd/es/upload/interface';
import { UploadFile } from 'antd/lib/upload/interface';
import { AxiosResponse } from 'axios';
import classNames from 'classnames';
import { compact } from 'lodash-es';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

import style from './index.module.less';
import {
  carbonAccountActiveDataTableCol,
  carbonAccountActiveDataSearchForm,
} from './model';
import {
  ApiBehaviorExportExcel,
  ApicarbonAccountActiveImportFile,
  ApicarbonAccountRevocation,
  batchCancelRevoke,
  getActivityList,
} from './service';
import {
  ActiveImportFile,
  ActivityRecordSearchParams,
  ApiGetActiveData,
  CarbonAccountActiveDataTable,
} from './type';
import upload from '../../../../assets/icon/sy/upload.svg';
import ExportModel from '../../component/exportModel';
import { ApicarbonSceneManagementEnums } from '../../sceneManagement/srvice';
import { useFlattedOrganizations, useOrganizations } from '../../utils';

const { TextArea } = Input;

const CarbonAccountActiveDataRecording = () => {
  const history = useHistory<{ id: number }>();
  const childRef = useRef<TableRef>();
  const [searchForm] = Form.useForm<ActivityRecordSearchParams>();
  /** 批量导入 */
  const [bulkImportModel, setBulkImportModel] = useState<boolean>(false);
  /** 批量导入后的结果model */
  const [bulkImportEndModel, setBulkImportEndModel] = useState<boolean>(false);
  /** 批量导入后的返回 */
  const [bulkImportEndData, seBulkImportEndData] = useState<ActiveImportFile>();
  /** 模态框的loading */
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  /** 撤销碳币的弹框 */
  const [revocationModel, setRevocationModel] = useState<boolean>(false);
  /** 撤销框当前输入的值 */
  const [revocationInput, setRevocationInput] = useState<string>();
  /** 撤销碳币弹框的点击确认事件loading状态 */
  const [revocationBtnLoading, setRevocationBtnLoading] =
    useState<boolean>(false);
  /** 撤销和查看当前选中的数据 */
  const [editModelItem, setEditModelItem] = useState<number[]>();

  /** 导出弹窗 */
  const [showExport, setShowExport] = useState<boolean>(false);

  const [exportLoading, setExportLoading] = useState(false);

  /** 批量导入 */
  /** 文件上传的状态 */
  const [uploadStatus, setUploadStatus] = useState<
    'noFile' | 'success' | 'error'
  >('noFile');
  /** 文件列表 */
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [backPeriod, setBackPeriod] =
    useState<{ label: string; value: number }[]>();
  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] = useState<
    Partial<ActivityRecordSearchParams>
  >({});
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  /** 组织架构 */
  const organizations = useOrganizations();
  const flattedOrgs = useFlattedOrganizations(organizations);

  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };
  const [tableDataCount, setTableDataCount] = useState(0);
  const returnFetchApi = (back: AxiosResponse<ApiGetActiveData, any>) => {
    const count = back.data.data.total || 0;
    setTableDataCount(count);
    return {
      data: back.data.data.rows,
      count,
    };
  };
  /** 上传文件 */
  const uploadBack = async (file: UploadChangeParam<any>) => {
    setModelLoading(true);
    const fd = new FormData();
    fd.append('file', file.file);
    try {
      const res = await ApicarbonAccountActiveImportFile(fd);
      res.data.data && seBulkImportEndData(res.data.data);
      if (res.data.code === 200) {
        setFileList([file.file]);
        setUploadStatus('success');
        childRef.current?.reset();
      }
    } catch (e: any) {
      const errData: ActiveImportFile = e.data.data;
      errData ? seBulkImportEndData(errData) : Toast('error', e.data.msg);
      setUploadStatus('error');
    }
    setModelLoading(false);
    setBulkImportModel(false);
    setBulkImportEndModel(true);
  };
  /** 搜索回调 */
  const searchSub = () => {
    const res: any = searchForm.getFieldsValue();
    const data = {
      ...res,
      begTime: moment(res?.time[0]).format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment(res?.time[1]).format('YYYY-MM-DD HH:mm:ss'),
    };
    delete data?.time;
    setSearchParamsData(data);
  };

  const resetBack = () => {
    setSearchParamsData({
      begTime: moment().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    setTimeout(() => {
      searchForm.setFieldsValue({
        time: [moment().subtract(1, 'month'), moment()],
      });
    }, 100);
  };

  /** 查看页面 */
  const findClick = (item: CarbonAccountActiveDataTable) => {
    history.push(
      virtualLinkTransform(
        RouteMaps.CarbonAccountActiveDataRecordingDetail,
        [':id'],
        [item.id],
      ),
    );
  };
  /** 撤销页面 */
  const revocationClick = (item: number[]) => {
    setRevocationInput('');
    setEditModelItem(item);
    setRevocationModel(true);
  };
  /** 确认撤销按钮点击 */
  const revocationOk = async () => {
    if (!editModelItem) return;
    setRevocationBtnLoading(true);
    let res: any = null;
    try {
      if (editModelItem.length === 1) {
        res = await ApicarbonAccountRevocation({
          id: editModelItem[0],
          reason: revocationInput,
        });
      } else {
        res = await rollbackBatchUsingPOSTDefaultApi({
          // @ts-ignore
          ids: editModelItem,
          reason: revocationInput,
        });
      }
    } finally {
      setRevocationBtnLoading(false);
      childRef.current?.reset();
    }

    if (res.data?.code === 200) {
      Toast('success', I18N.carbonAccount.revokeCarbonCoins2);
      setEditModelItem([]);
      setSelectedKeys([]);
      setRevocationModel(false);
    }
  };
  /** 活动单位	 */
  const [units, setUnits] = useState<{ label: string; value: string }[]>([]);
  /** 初始化获取活动单位字典值 */
  const activeDictType = async () => {
    const res = await apiMnumListALLByDictTypeBatch({
      dictTypes: `Carbon_account`,
    });
    const backPeriod = await ApicarbonSceneManagementEnums({
      enumName: 'periodType',
    });
    setUnits(
      res.data?.data?.Carbon_account?.map(mp => ({
        label: mp.dictLabel,
        value: mp.dictValue,
      })) || [],
    );

    const backPeriodData = backPeriod.data.data.map(mp => ({
      label: mp.name,
      value: mp.code,
    }));

    setBackPeriod(backPeriodData);
  };

  const cancelRevoke = (ids: number[]) => {
    Modal.confirm({
      className: style.cancelRevokeModal,
      title: '取消撤销',
      content:
        '操作后，本次撤销的碳币和碳排放量将以补偿的方式发放，请确认是否继续？',
      onOk: async () => {
        await batchCancelRevoke({ ids });
        Toast('success', '操作成功');
        setSelectedKeys([]);
        childRef.current?.reset();
      },
    });
  };

  const columns = useMemo(() => {
    const colums: ColumnsType<CarbonAccountActiveDataTable> = [
      ...carbonAccountActiveDataTableCol(units, backPeriod, flattedOrgs),
      {
        title: I18N.carbonFootprint.operation,
        width: 160,
        fixed: 'right',
        dataIndex: 'setting',
        render: (val: string, item: CarbonAccountActiveDataTable) => (
          <TableActions
            menus={compact([
              checkPermissions(
                {
                  label: I18N.carbonFootprint.check,
                  key: I18N.carbonFootprint.check,
                  onClick: () => findClick(item),
                },
                'carbonAccount:behavior:detail',
              ),
              checkPermissions(
                +item.behaviorStatus !== 1 && {
                  label: I18N.carbonAccount.revoke,
                  key: I18N.carbonAccount.revoke,
                  onClick: () => revocationClick([item.id]),
                },
                'carbonAccount:behavior:rollback',
              ),
              checkPermissions(
                +item.behaviorStatus === 1 && {
                  label: '取消撤销',
                  key: '取消撤销',
                  onClick: () => cancelRevoke([item.id]),
                },
                'carbonAccount:behavior:rollback',
              ),
            ])}
          />
        ),
      },
    ];
    return colums;
  }, [flattedOrgs, units, backPeriod]);
  const init = async () => {
    await activeDictType();
  };
  useEffect(() => {
    setSelectedKeys([]);
  }, [searchParamsData]);
  useEffect(() => {
    searchForm.setFieldsValue({
      time: [moment().subtract(1, 'month'), moment()],
    });
    init();
  }, []);
  return (
    <div
      className={classNames(
        { 'border-bottom-global-actions': tableDataCount > 10 },
        style.carbonAccount,
        'autoHeight',
      )}
    >
      <div className='main'>
        <div className={style.searchWrapper}>
          <SearchFormUtil
            antdFormProps={searchFormProps}
            resetBack={resetBack}
            searchSub={searchSub}
            formItems={carbonAccountActiveDataSearchForm({ organizations })}
          />

          <Permission flag='carbonAccount:behavior:excel'>
            <Button
              className={style.exportBtn}
              type='primary'
              onClick={() => setShowExport(true)}
            >
              {I18N.carbonFootprint3.export}
            </Button>
          </Permission>
        </div>
        <div className={style.removeRecord}>
          <div>
            {I18N.components.selected2}{' '}
            <span className={style.removeRecordLength}>
              {selectedKeys.length}
            </span>{' '}
            {I18N.components.pieceOfData}
          </div>
          {checkPermissions(
            <Button
              type='link'
              disabled={!selectedKeys?.length}
              onClick={() => {
                revocationClick(selectedKeys.map(id => +id));
              }}
            >
              {I18N.carbonAccount.batchRevocation}
            </Button>,
            'carbonAccount:behavior:rollbackBatch',
          )}
          {checkPermissions(
            <Button
              type='link'
              disabled={!selectedKeys?.length}
              onClick={() => {
                cancelRevoke(selectedKeys.map(id => Number(id)));
              }}
            >
              批量取消撤销
            </Button>,
            'carbonAccount:behavior:rollbackBatch',
          )}
        </div>
        <div>
          {backPeriod && (
            <CommonTable<
              CarbonAccountActiveDataTable,
              any,
              Partial<ActivityRecordSearchParams>
            >
              bordered={false}
              rowSelection={{
                fixed: 'left',
                columnWidth: 60,
                preserveSelectedRowKeys: true,
                selectedRowKeys: selectedKeys,
                onChange(keys) {
                  setSelectedKeys(keys);
                },
              }}
              scroll={{ x: 1600 }}
              searchParams={searchParamsData}
              cRef={childRef}
              pageSize={10}
              returnFetchApi={returnFetchApi}
              fetchApi={params => {
                let [begTime, endTime] = params.time || [];
                begTime ||= moment().subtract(1, 'month');
                endTime ||= moment();
                return getActivityList({
                  ...params,
                  time: undefined,
                  begTime: moment(begTime).format('YYYY-MM-DD HH:mm:ss'),
                  endTime: moment(endTime).format('YYYY-MM-DD HH:mm:ss'),
                  orgIds: params.orgIds?.join(','),
                });
              }}
              columns={columns}
              rowKey='id'
              pagePosition
            />
          )}
        </div>
      </div>
      <div>
        <Modal
          title={I18N.carbonFootprint.batchImport}
          maskClosable={false}
          className='userListModelClass'
          open={bulkImportEndModel}
          footer={null}
          onCancel={() => setBulkImportEndModel(false)}
        >
          <div style={{ textAlign: 'center', paddingBottom: 30 }}>
            <div>
              {uploadStatus === 'success' ? (
                <CheckCircleFilled style={{ color: '#0CBF9F', fontSize: 30 }} />
              ) : (
                <CloseCircleFilled style={{ color: '#ed5555', fontSize: 30 }} />
              )}
            </div>
            <div style={{ marginTop: 10, fontSize: 16, fontWeight: 500 }}>
              {uploadStatus === 'success'
                ? I18N.carbonFootprint.importSuccessful
                : I18N.carbonFootprint.importFailed}
            </div>
            <div style={{ marginTop: 10 }}>
              {I18N.carbonFootprint3.importData}
              <span>{bulkImportEndData?.totalCount}</span>{' '}
              {I18N.workbench.strip}
              {uploadStatus === 'error' && (
                <span>
                  {I18N.carbonAccount.incorrectData}
                  {bulkImportEndData?.errorCount} {I18N.workbench.strip}
                </span>
              )}
            </div>
            <div style={{ marginTop: 25 }}>
              {uploadStatus === 'success' && (
                <Button onClick={() => setBulkImportEndModel(false)}>
                  {I18N.components.gotIt}
                </Button>
              )}
              {uploadStatus === 'error' && (
                <>
                  <Button
                    onClick={() => {
                      window.open(bulkImportEndData?.failPath, '_blank');
                    }}
                  >
                    {I18N.carbonAccount.numberOfDownloadErrors}
                  </Button>
                  <Button
                    onClick={() => {
                      setBulkImportEndModel(false);
                      setBulkImportModel(true);
                    }}
                    style={{ marginLeft: 10 }}
                    type='primary'
                  >
                    {I18N.carbonAccount.reImport}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      </div>
      <div>
        <Modal
          title={I18N.carbonFootprint.batchImport}
          maskClosable={false}
          className='userListModelClass'
          open={bulkImportModel}
          onCancel={() => setBulkImportModel(false)}
          footer={null}
        >
          <div className='downloadTemplate'>
            <div>{I18N.carbonAccount.downloadExcel}</div>
            <div>
              <Button
                onClick={() => {
                  window.open(
                    'https://file.carbonstop.net/company-pic/user_behavior_template-1000000043858740.xlsx',
                  );
                }}
              >
                {I18N.carbonFootprint.downloadTemplate}
              </Button>
            </div>
          </div>
          <Spin spinning={modelLoading}>
            <div className='uploadFileMain'>
              <div>{I18N.carbonAccount.uploadFileSupport}</div>
              <div className='fileMain'>
                {uploadStatus === 'success' && (
                  <div>
                    <div className='fileTitle'>
                      <div>
                        <CheckCircleFilled
                          style={{ color: '#0CBF9F', marginRight: 10 }}
                        />
                        {I18N.enterpriseCarbonAccount2.uploadSuccessful}
                      </div>
                    </div>
                    <div className='fileName'>{fileList[0].name}</div>
                  </div>
                )}
                {['noFile', 'error'].includes(uploadStatus) && (
                  <Upload.Dragger
                    onChange={uploadBack}
                    maxCount={1}
                    accept=' .xls, .xlsx'
                    fileList={fileList}
                    beforeUpload={() => false}
                  >
                    <>
                      <div style={{ marginBottom: 10 }}>
                        <img src={upload} alt='' />
                      </div>
                      <div>
                        <b style={{ color: '#6C757D' }}>
                          {I18N.components.dragHereOr}
                        </b>
                        <b style={{ color: '#09C199' }}>
                          {I18N.components.clickToUpload}
                        </b>
                      </div>
                    </>
                    {/* {uploadStatus === 'noFile' ? (
                      <>
                        <div style={{ marginBottom: 10 }}>
                          <img src={upload} alt='' />
                        </div>
                        <div>
                          <b style={{ color: '#6C757D' }}>拖拽至此或 </b>
                          <b style={{ color: '#09C199' }}>点击上传</b>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='fileTitle'>
                          <div>
                            <CloseCircleFilled
                              style={{ color: '#ed5555', marginRight: 10 }}
                            />
                            上传失败
                          </div>
                        </div>
                        <div className='fileName'>
                          文件格式错误
                          <span
                            style={{
                              color: '#0CBF9F',
                              cursor: 'pointer',
                              marginLeft: 10,
                            }}
                          >
                            重新上传
                          </span>
                        </div>
                      </>
                    )} */}
                  </Upload.Dragger>
                )}
              </div>
            </div>
          </Spin>
        </Modal>
      </div>
      <div>
        <Modal
          title={I18N.carbonAccount.revokeCarbonCoins}
          open={revocationModel}
          maskClosable={false}
          okButtonProps={{ loading: revocationBtnLoading }}
          onOk={revocationOk}
          onCancel={() => {
            setRevocationInput('');
            setRevocationModel(false);
          }}
        >
          <div>
            <div>{I18N.carbonAccount.afterRevocationThisTime}</div>
            <div style={{ marginTop: 10 }}>
              {I18N.carbonAccount.reasonForRevocation}
            </div>
            <div style={{ marginTop: 10 }}>
              <TextArea
                onChange={val => {
                  setRevocationInput(val.target.value);
                }}
                rows={4}
                placeholder={I18N.carbonAccount.pleaseEnterUndo}
              />
            </div>
          </div>
        </Modal>
      </div>
      <ExportModel
        showModel={showExport}
        title={I18N.carbonAccount.activityDataRecording}
        okButtonProps={{ loading: exportLoading }}
        exportDesc={
          <Alert
            className={style.exportAlert}
            showIcon
            type='info'
            message={I18N.carbonAccount.onlyBeforeExport}
          />
        }
        handelOk={(value: any) => {
          const searchData: any = searchForm.getFieldsValue();
          const data = {
            ...searchData,
            excelName: value?.fileName,
            begTime: moment(searchData?.time[0]).format('YYYY-MM-DD HH:mm:ss'),
            endTime: moment(searchData?.time[1]).format('YYYY-MM-DD HH:mm:ss'),
          };
          // 后端通过 string 接值，需要转换数据类型
          if (data.orgIds) {
            data.orgIds = data.orgIds.join(',');
          }
          delete data.time;
          setExportLoading(true);
          ApiBehaviorExportExcel(data)
            .then(() => {
              history.push(RouteMaps.CarbonAccountDownload);
            })
            .finally(() => {
              setExportLoading(false);
            });
        }}
        handelCancel={() => setShowExport(false)}
      />
    </div>
  );
};

export default CarbonAccountActiveDataRecording;
