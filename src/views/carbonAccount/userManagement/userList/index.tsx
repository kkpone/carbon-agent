/*
 * @@description: 碳账户用户列表
 */
import I18N from '@src/lang/I18N';
import { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import '../../index.less';
import { FromItemProps } from '@src/components/FormUtil/type';
import { formPropsInit } from '@src/components/FormUtil/util';
// import auditIcon from '@assets/icon/audit-icon.png';
import Permission from '@src/components/Permission';
import { checkPermissions } from '@src/components/Permission/utils';
import SearchFormUtil from '@src/components/SearchForm';
import { TableActions } from '@src/components/Table/components/TableActions';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import { RouteMaps } from '@src/router/route-paths';
import { Robject, User } from '@src/sdks/java/carbonAccount';
import { Toast } from '@src/utils/Toast';
import { Alert, Button, Form, FormProps, Modal, Upload } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { UploadChangeParam } from 'antd/es/upload/interface';
import { UploadFile } from 'antd/lib/upload/interface';
import classNames from 'classnames';
import { compact } from 'lodash-es';

import styles from './index.module.less';
import {
  ApicarbonAccountUserAudit,
  ApicarbonAccountUserAuditBatch,
  ApicarbonAccountUserListAdd,
  ApicarbonAccountUserListBlackList,
  ApicarbonAccountUserListEdit,
  ApicarbonAccountUserListImportFile,
  apiExportuserList,
  getUserList,
} from './service';
import {
  carbonAccountUserListAddUser,
  carbonAccountUserListSearchForm,
  carbonAccountUserLitsTableCol,
} from './tableModel';
import {
  UserListAddUser,
  UserListImportFile,
  UserListItemDetailLoaction,
  UsersSearchParams,
} from './type';
import upload from '../../../../assets/icon/sy/upload.svg';
import { organizationFormItems } from '../../awardConversion/awardList/model';
import ExportModel from '../../component/exportModel';
import { changeOrganizationsTree, useOrganizations } from '../../utils';
/**
 * 碳账户-用户管理-用户列表
 * @returns
 */
const CarbonAccountUserList = () => {
  const childRef = useRef<TableRef>();
  const history = useHistory<UserListItemDetailLoaction>();
  const [searchForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [auditForm] = Form.useForm();
  // 新增用户管理
  const [addModel, setAddModel] = useState<boolean>(false);
  /** 新增用户的编辑 */
  const [addIsEdit, setAddIsEdit] = useState<boolean>(false);
  /** 导出弹窗 */
  const [showExport, setShowExport] = useState<boolean>(false);

  const [exportLoading, setExportLoading] = useState(false);

  /** 用户编辑和新增loading */
  const [addOrEditBtn, setAddOrEditBtn] = useState<boolean>(false);
  /** 拉入黑名单弹框 */
  const [blacklistModel, setBlacklistModel] = useState<boolean>(false);
  /** 批量导入 */
  const [bulkImportModel, setBulkImportModel] = useState<boolean>(false);
  /** 批量导入后的返回 */
  const [bulkImportEndData, seBulkImportEndData] =
    useState<UserListImportFile>();
  /** 批量导入后的结果model */
  const [bulkImportEndModel, setBulkImportEndModel] = useState<boolean>(false);
  /** 审核弹窗 */
  const [showAudit, setShowAudit] = useState<boolean>(false);
  /** 审核分组 */
  // const [groupList, setGroupList] = useState<any[]>([]);
  /** 审核是否同意 */
  const [isPass, setIsPass] = useState<string>('1');
  const [isBatch, setIsBatch] = useState<Boolean>(false);

  /** 批量审核 */
  const [userIds, setUserIds] = useState<{ id: string }[]>([]);
  /** 文件上传的状态 */
  const [uploadStatus, setUploadStatus] = useState<
    'noFile' | 'success' | 'error'
  >('noFile');
  /** 文件列表 */
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] = useState<
    Partial<UsersSearchParams>
  >({});
  /** 被编辑的数据 */
  const [editUserInfo, setEditUserInfo] = useState<User>();
  /** 组织架构 */
  const organizations = useOrganizations();
  const editOrganizations = changeOrganizationsTree(organizations);
  // const [userCount, setUserCount] = useState(0);
  /** 编辑信息 */
  const editClick = (item: User) => {
    setAddIsEdit(true);
    setEditUserInfo(item);
    addForm.setFieldsValue({
      // 三方用户id
      thirdId: item.thirdId,
      // 用户姓名
      realName: item.realName,
      // 手机号码
      mobile: item.mobile,
      /** 组织 */
      orgId: item.orgId,
      /** 员工编号 */
      jobNumber: item.jobNumber,
    });
    setAddModel(true);
  };
  /** 移入黑名单和移除名单 0是移除黑名单 -1是移入黑名单 */
  const [blacklist, setBlacklist] = useState<0 | -1>(0);
  /** 黑名单弹框按钮loading */
  const [blacklistBtn, setBlacklistBtn] = useState<boolean>(false);

  /** 查看用户 */
  const goDetail = (id: number) => {
    history.push(RouteMaps.CarbonAccountUserListDetail, {
      id,
    });
  };
  /** 审核用户 */
  const auditUser = ({ id = 0, orgId = 0 }) => {
    setShowAudit(true);
    setIsBatch(false);
    auditForm.resetFields();
    setIsPass('1');
    auditForm.setFieldsValue({ id, userStatus: '1', orgId });
    // setGroupList([
    //   { label: '通过', value: '0' },
    //   { label: '驳回', value: '1' },
    // ]);
  };

  /**
   * 审核表单
   */
  const auditFormItems: FromItemProps<any>[] = [
    {
      label: I18N.carbonDataManagemen.reviewComments,
      name: 'userStatus',
      type: 'radio',
      rules: true,
      col: 24,
      props: {
        style: { width: 360 },
        // value: '1',
        // defaultValue: '1',
        options: [
          { label: I18N.carbonAccount.adopt, value: '1' },
          { label: I18N.carbonAccount.reject, value: '2' },
        ],
        onChange(e) {
          const { value } = e.target;
          setIsPass(value);
        },
      },
    },
    isPass === '1'
      ? {
          ...organizationFormItems({
            organizations: editOrganizations,
            placeholder: I18N.carbonAccount.groupToWhichItBelongs,
            label: I18N.carbonAccount.groupToWhichItBelongs,
            name: 'orgId',
            props: {
              treeCheckable: false,
              style: { width: 360 },
            },
          }),
          rules: true,
        }
      : {
          label: I18N.carbonAccount.reasonForRejection,
          name: 'refuse',
          type: 'textArea',
          placeholder: I18N.carbonAccount.pleaseEnterRejection,
          rules: false,
          col: 24,
          props: {
            style: { width: 260 },
            maxLength: 50,
            options: [
              { label: I18N.carbonAccount.adopt, value: '0' },
              { lable: I18N.carbonAccount.reject, value: '1' },
            ],
          },
        },
  ];
  /** 表头 */
  const columns: ColumnsType<User> = [
    ...carbonAccountUserLitsTableCol(),
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'set',
      fixed: 'right',
      width: 240,
      render: (val, item) => (
        <TableActions
          menus={compact([
            checkPermissions(
              {
                label: I18N.carbonFootprint.check,
                key: I18N.carbonFootprint.check,
                onClick: () => item.id && goDetail(item.id),
              },
              'carbonAccount:user:info',
            ),
            checkPermissions(
              item.userStatus === 1 && {
                label: I18N.carbonFootprint3.auditing,
                key: I18N.carbonFootprint3.auditing,
                onClick: () => item.id && auditUser(item),
              },
              'carbonAccount:user:audit',
            ),
            checkPermissions(
              {
                label: I18N.carbonFootprint.edit,
                key: I18N.carbonFootprint.edit,
                onClick: () => editClick(item),
              },
              'carbonAccount:user:edit',
            ),
            checkPermissions(
              item.userStatus === 0 && {
                label: I18N.carbonAccount.blacklisted2,
                key: I18N.carbonAccount.blacklisted2,
                onClick: () => {
                  setEditUserInfo(item);
                  setBlacklist(-1);
                  setBlacklistModel(true);
                },
              },
              'carbonAccount:user:updateStatus',
            ),
            checkPermissions(
              item.userStatus === -1 && {
                label: I18N.carbonAccount.removeBlacklist2,
                key: I18N.carbonAccount.removeBlacklist2,
                onClick: () => {
                  setBlacklist(0);
                  setEditUserInfo(item);
                  setBlacklistModel(true);
                },
              },
              'carbonAccount:user:updateStatus',
            ),
          ])}
        />
      ),
    },
  ];

  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };
  /** 新增弹框的form */
  const addFormProps: FormProps = {
    ...formPropsInit(),
    form: addForm,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  /** 审核的form */
  const auditFormProps: FormProps = {
    ...formPropsInit(),
    form: auditForm,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  /** 搜索回调 */
  const searchSub = () => {
    const res = searchForm.getFieldsValue();
    setSearchParamsData(res);
  };
  /** 重置搜索条件 */
  const resetBack = () => {
    setSearchParamsData({});
  };
  /** 上传文件 */
  const uploadBack = async (file: UploadChangeParam<any>) => {
    const fd = new FormData();
    fd.append('file', file.file);
    try {
      const res = await ApicarbonAccountUserListImportFile(fd);
      res.data.data && seBulkImportEndData(res.data.data);
      if (res.data.code === 200) {
        setFileList([file.file]);
        setUploadStatus('success');
        childRef.current?.reset();
      }
    } catch (e: any) {
      const errData: UserListImportFile = e.data.data;
      errData ? seBulkImportEndData(errData) : Toast('error', e.data.msg);
      setUploadStatus('error');
    }
    setBulkImportModel(false);
    setBulkImportEndModel(true);
  };
  /** 新增用户的确认 */
  const addUserOk = () => {
    addForm.validateFields().then(() => {
      setAddOrEditBtn(true);
      const formVal: UserListAddUser = addForm.getFieldsValue();
      ApicarbonAccountUserListAdd(formVal)
        .then(res => {
          if (res.data.code === 200) {
            childRef.current?.reset();
            Toast('success', I18N.carbonAccount.newUsersAdded);
            addForm.resetFields(); // 清空表单
            setAddOrEditBtn(false);
            setAddModel(false);
          } else {
            Toast('error', res.data.msg);
          }
        })
        .finally(() => {
          setAddOrEditBtn(false);
        });
    });
  };
  /** 编辑用户的确认 */
  const editUserOk = () => {
    if (!editUserInfo) return;
    addForm.validateFields().then(async () => {
      setAddOrEditBtn(true);

      const formVal: UserListAddUser = addForm.getFieldsValue();
      if (!editUserInfo?.id) return;
      try {
        const res = await ApicarbonAccountUserListEdit({
          ...formVal,
          id: editUserInfo?.id,
        });
        if (res.data.code === 200) {
          childRef.current?.reset();
          Toast('success', I18N.carbonAccount.editUserAs);
          addForm.resetFields(); // 清空表单
          setAddOrEditBtn(false);
          setAddModel(false);
        } else {
          Toast('error', res.data.msg);
        }
        setAddOrEditBtn(false);
      } catch (error) {
        setAddOrEditBtn(false);
      }
    });
  };
  /** 移除和移入黑名单 */
  const blacklistClick = async () => {
    setBlacklistBtn(true);
    if (!editUserInfo?.id) return;
    const res = await ApicarbonAccountUserListBlackList({
      id: editUserInfo.id,
      userStatus: blacklist,
    });
    if (res.data.code === 200) {
      childRef.current?.reset();
      Toast(
        'success',
        blacklist === 0
          ? I18N.carbonAccount.userRemoveBlack
          : I18N.carbonAccount.userPulledInBlack,
      );
      setBlacklistModel(false);
    } else {
      Toast('error', res.data.msg);
    }
    setBlacklistBtn(false);
  };
  /** 下载模板 */
  const downLoadTemplate = async () => {
    // const res = await ApicarbonAccountUserListDownloadFile();
    // downloadBlobFile(res.data.data);
    window.open(
      'https://file.carbonstop.net/company-pic/tpl_user-1000001372600730.xlsx',
      '_blank',
    );
  };
  return (
    <div className={classNames('autoHeight')}>
      <div className='main'>
        <div className='top-box'>
          <span className='tit'>{I18N.carbonAccount.userList}</span>
          <div className='btn-box'>
            <Permission flag='carbonAccount:user:excel'>
              <Button
                className={styles.exportBtn}
                type='primary'
                onClick={() => setShowExport(true)}
              >
                {I18N.carbonFootprint3.export}
              </Button>
            </Permission>
          </div>
        </div>
        <div>
          <SearchFormUtil
            antdFormProps={searchFormProps}
            searchSub={searchSub}
            resetBack={resetBack}
            formItems={carbonAccountUserListSearchForm({ organizations })}
          />
        </div>
        {/* <div className='setButton'>
           <Button onClick={() => setBulkImportModel(true)} className='mr20'>
             导入
           </Button>
           <Button
             onClick={() => {
               setAddIsEdit(false);
               setAddModel(true);
             }}
             type='primary'
           >
             新增
           </Button>
         </div> */}

        <div style={{ marginTop: 20 }}>
          <CommonTable<User, Robject, Partial<UsersSearchParams>>
            scroll={{ y: 'calc(100vh - 305px)' }}
            bordered={false}
            cRef={childRef}
            rowKey={item => `${item.id}`}
            rowSelection={{
              type: 'checkbox',
              onChange(selectedRowKeys: any[]) {
                const userId = selectedRowKeys.map(id => ({ id }));
                setUserIds(userId);
              },
              getCheckboxProps(record) {
                return {
                  disabled: record.userStatus !== 1,
                };
              },
              columnWidth: 40,
            }}
            searchParams={searchParamsData}
            pagination={{
              current: searchParamsData.page ?? 1,
              pageSize: searchParamsData.size ?? 10,
            }}
            fetchApi={params =>
              getUserList({
                ...params,
                page: searchParamsData.page ?? 1,
                size: searchParamsData.size ?? 10,
                orgIds: params.orgIds?.join(','),
              })
            }
            returnFetchApi={({ data }) => {
              // @ts-ignore
              const count = (data?.data?.total as unknown as number) || 0;
              // setUserCount(count);
              return {
                // @ts-ignore
                data: data?.data?.rows as unknown as User[],
                count,
              };
            }}
            columns={columns}
            pagePosition
            onChange={(pager, _, sorter, { action }) => {
              const { current, pageSize } = pager;
              if (action === 'paginate') {
                setSearchParamsData(pre => ({
                  ...pre,
                  page: current,
                  size: pageSize,
                }));
              }
              if (action === 'sort' && !(sorter instanceof Array)) {
                const { order } = sorter;
                let sortOrderBy: string | undefined;
                if (order === 'ascend') {
                  sortOrderBy = 'asc';
                } else if (order === 'descend') {
                  sortOrderBy = 'desc';
                }
                setSearchParamsData(pre => ({
                  ...pre,
                  sortKey: sortOrderBy ? (sorter.field as string) : undefined,
                  sortOrderBy,
                }));
              }
            }}
          />
        </div>
        <div>
          <Modal
            title={
              addIsEdit
                ? I18N.carbonAccount.editUsers
                : I18N.carbonAccount.newUsers
            }
            open={addModel}
            maskClosable={false}
            okButtonProps={{ loading: addOrEditBtn }}
            onOk={() => {
              addIsEdit ? editUserOk() : addUserOk();
            }}
            onCancel={() => {
              addForm.resetFields(); // 清空表单
              setAddModel(false);
            }}
          >
            <div>
              <FormItemUtil
                antdFormProps={addFormProps}
                formItems={carbonAccountUserListAddUser(
                  addIsEdit,
                  editOrganizations,
                )}
              />
            </div>
          </Modal>
        </div>
        <div>
          <Modal
            title={I18N.carbonFootprint.prompt}
            maskClosable={false}
            className='userListModelClass'
            open={blacklistModel}
            okButtonProps={{ loading: blacklistBtn }}
            onOk={() => {
              blacklistClick();
            }}
            onCancel={() => setBlacklistModel(false)}
          >
            <div>
              {I18N.carbonAccount.pleaseConfirmIf}
              <span style={{ color: '#0CBF9F', fontWeight: 500 }}>
                {editUserInfo?.realName}
              </span>{' '}
              {blacklist === 0
                ? I18N.carbonAccount.removeBlacklist
                : I18N.carbonAccount.blacklisted}
            </div>
          </Modal>
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
                  <CheckCircleFilled
                    style={{ color: '#0CBF9F', fontSize: 30 }}
                  />
                ) : (
                  <CloseCircleFilled
                    style={{ color: '#ed5555', fontSize: 30 }}
                  />
                )}
              </div>
              <div style={{ marginTop: 10, fontSize: 16, fontWeight: 500 }}>
                {uploadStatus === 'success'
                  ? I18N.carbonFootprint.importSuccessful
                  : I18N.carbonFootprint.importFailed}
              </div>
              <div style={{ marginTop: 10 }}>
                {I18N.carbonFootprint3.importData}
                <span>{bulkImportEndData?.total}</span> {I18N.workbench.strip}
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
                        window.open(bulkImportEndData?.path, '_blank');
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
                <Button onClick={downLoadTemplate}>
                  {I18N.carbonFootprint.downloadTemplate}
                </Button>
              </div>
            </div>
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
          </Modal>
        </div>
        {/* 用户审核 */}
        <Modal
          title={I18N.carbonFootprint3.auditing}
          maskClosable={false}
          className='userAuditClass'
          open={showAudit}
          onOk={() => {
            auditForm.validateFields().then(() => {
              const value = auditForm.getFieldsValue(true);
              const { userStatus, orgId, refuse } = value;

              if (isBatch) {
                // 批量
                const data = {
                  userStatus,
                  orgId,
                  refuse,
                  userList: userIds,
                };
                ApicarbonAccountUserAuditBatch({ ...data }).then((res: any) => {
                  if (res.data.code === 200) {
                    childRef.current?.reset();
                    Toast('success', I18N.carbonFootprint.operationSuccessful);
                    setShowAudit(false);
                  } else {
                    Toast('warn', res.data.msg);
                  }
                });
              } else {
                // 单条
                ApicarbonAccountUserAudit(value).then((res: any) => {
                  if (res.data.code === 200) {
                    childRef.current?.reset();
                    Toast('success', I18N.carbonFootprint.operationSuccessful);
                    setShowAudit(false);
                  } else {
                    Toast('warn', res.data.msg);
                  }
                });
              }
            });
          }}
          onCancel={() => setShowAudit(false)}
        >
          <FormItemUtil
            antdFormProps={auditFormProps}
            formItems={auditFormItems}
            paddRight={1}
          />
        </Modal>
      </div>
      <ExportModel
        showModel={showExport}
        title={I18N.carbonAccount.userInformationGuide}
        okButtonProps={{ loading: exportLoading }}
        exportDesc={
          <Alert
            className={styles.exportAlert}
            showIcon
            type='info'
            message={I18N.carbonAccount.onlyBeforeExport}
          />
        }
        handelOk={(value: any) => {
          const searchData = searchForm.getFieldsValue(true);
          const { realName, mobile, userStatus, orgIds } = searchData;
          const data: any = {
            excelName: value?.fileName,
            realName,
            mobile,
            userStatus,
            orgIds,
          };
          orgIds?.length && (data.orgIds = searchData?.orgIds?.map(t => t));
          setExportLoading(true);
          apiExportuserList(data)
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

export default CarbonAccountUserList;
