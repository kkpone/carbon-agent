/**
 * @file 员工管理
 */

import { PlusOutlined } from '@ant-design/icons';
import BaseTable from '@components/BaseTable';
import DrawerCom from '@components/DrawerCom';
import TableEditTsx from '@components/TableEditTsx';
import Permission, { usePermission } from '@src/components/Permission';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { RootState } from '@src/store';
import style from '@src/styles/global.module.scss';
import { COMPANY_ID } from '@src/utils/consts';
import { useOrgTreeData } from '@src/views/dashborad/organization/components/hooks';
import { useIndexColumn } from '@src/views/emission/utils';
import VerifyUtils from '@utils/verifty';
import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Tooltip,
  Col,
  Row,
  Space,
  TreeSelect,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import classnames from 'classnames';
import { FC, Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { UserDrawer } from './components/UserDrawer';
import styles from './index.module.less';
import {
  apiQueryByPageType,
  apiRoleList,
  apiDepartmentPageType,
  AddUserType,
  apiAddUser,
  apiEditUser,
  apiBanUserFlag,
  apiEmployInfo,
} from './service';
import { EnterPriseStaffType } from './type';
import { checkList } from '../../../typings/utils';

const CheckboxGroup = Checkbox.Group;
const { Option } = Select;
const labelCol = {
  labelCol: { span: 7 },
};

export type SearchStaffsFromType = {
  search?: string;
  page: number;
  page_size: number;
  pk?: null | string;
  user_name?: null | string;
  name?: null | string;
  userName?: null | string;
  employPhone?: null | string;
  roles_list?: null | string;
  ucType?: null | string;
  orgId?: number;
};
export interface Column {
  companyId: null | string | number;
  delflag: number;
  depId: null | number;
  departmentId: number;
  departmentName: string;
  id: number;
  page: number;
  password: string;
  permissionSet: null | number;
  permissions: null | number;
  roleId: null | number;
  roleIds: null | number;
  roleName: null | number;
  roles: {
    id: null | string;
    roleId: number;
    roleName: string;
    roleInfo: null | string;
  }[];
  salt: null;
  sex: null;
  size: number;
  sort: null;
  status: number;
  ucStatus: number;
  userId: number;
  userName: string;
  ucType: number | string;
  employPhone?: null | string | number;
  employName?: null | string | number;
  udId: null | string;
  employPhoneCode: string;
}
/** *
 * 操作
 */
const GetActionContentArray = (record: Column) =>
  // 编辑暂时放掉注释掉
  [
    // {
    //   btn_title: '查看',
    //   type: 'edit',
    //   color: style.textGreen,
    //   is_pop: false,
    //   flag: 'management:user:list',
    // },
    // {
    //   btn_title: '编辑',
    //   type: 'edit',
    //   color: style.textGreen,
    //   is_pop: false,
    //   flag: 'management:user:edit',
    // },
    Number(record.ucType)
      ? {}
      : {
          btn_title: I18N.carbonFootprint.disabled,
          type: 'edit',
          color: style.textGreen,
          is_pop: false,
          is_switch: true,
          flag: 'management:user:status',
        },
    Number(record.ucType)
      ? {}
      : {
          btn_title: I18N.carbonFootprint.delete,
          type: 'delete',
          color: style.textError,
          is_pop: true,
          pop_title: I18N.components.thisOperationWillForever,
          flag: 'management:user:delete',
        },
  ];
export type Options = {
  label: string;
  value: string | number;
  user?: number;
  [key: string]: any;
}[];
type CvalidateStatus =
  | ''
  | 'success'
  | 'warning'
  | 'error'
  | 'validating'
  | undefined;
type ModelTextType = {
  [name: number | string]: string;
};
const modelText: ModelTextType = {
  0: I18N.dashborad.addNewEmployees,
  1: I18N.dashborad.employeeDetails,
  2: I18N.dashborad.editEmployee,
};

const Orgstaff: FC = () => {
  const selector = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );
  const canEdit = usePermission('management:user:edit');
  const [staffsFrom] = Form.useForm<AddUserType>(); // 新增员工 表单
  const [isLoading, changeIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [size, setPageSize] = useState<number>(10);
  const [pageCount, setCount] = useState(0); // 设置总条数
  const [staffDataSource, getDataSource] = useState<Column[]>([]); // 列表数据
  const [RoleSource, getRoleSource] = useState<
    { label: string; value: string | number; disabled?: boolean }[]
  >([]); // 获取角色数据
  const [searchForm] = Form.useForm<SearchStaffsFromType>(); //  搜索from实例
  const [currentStatus, changeCurrentStatus] = useState<number>(0); // 0：新增功能 1:查看功能 2:编辑功能
  const [showValue, getShowValue] = useState<EnterPriseStaffType>({
    userName: '',
    roles_list: [],
    roles: [],
    usStatus: null,
    employName: null,
    employPhone: null,
    email: '',
    departmentName: '',
  });
  const [visible, setVisible] = useState(false); // 弹窗显示隐藏
  const [validateStatus, changeValidateStatus] =
    useState<CvalidateStatus>('success');
  const [departmentData, getDepartmentData] = useState<
    { id: string; departmentId: string }[]
  >([]);
  const [isMaster, changeIsMaster] = useState<number | string>(1);
  const [udId, changeUdId] = useState<number | string | null>(null);
  const history = useHistory();

  sessionStorage.setItem('url', window.location.pathname);
  const showAndEdit = async (btn_title: string, data) => {
    await apiEmployInfo({ id: data.id }).then(res => {
      if (btn_title === I18N.carbonFootprint.check) {
        changeCurrentStatus(1);
        getShowValue({
          ...data,
          employPhone: res.data.data.employPhone,
          userName: res.data.data.userName,
        });
        setVisible(true);
        // getShowValue({ ...data, roles: dataArr });
      } else {
        changeCurrentStatus(2);
        setVisible(true);
        getShowValue({
          ...data,
          employPhone: res.data.data.employPhone,
          userName: res.data.data.userName,
        });
        // getSaveId(pk); // 存储 当前项的ID
        staffsFrom.setFieldsValue({
          ...data,
          departmentId: data.departmentId ? Number(data.departmentId) : null,
          employPhone: res.data.data.employPhone,
          userName: res.data.data.userName,
        });
      }
    });
  };

  const [treeData] = useOrgTreeData();

  // 定义 搜索面板 相关搜索项
  const renderSearchFormDate = [
    {
      // label: '碳账号',
      name: 'searchName',
      type: 'input',
      placeholder: I18N.dashborad.nameEmailHand,
      required: true,
      tableType: 'number',
      controls: false,
    },
    {
      name: 'roleId',
      type: 'select',
      placeholder: I18N.dashborad.role,
      select_data: RoleSource,
    },
    {
      name: 'orgId',
      type: 'treeSelect',
      placeholder: I18N.dashborad.affiliatedOrganization,
      dataSource: treeData,
    },
    {
      name: 'ucStatus',
      type: 'select',
      placeholder: I18N.carbonFootprint.state,
      select_data: [
        { label: I18N.carbonFootprint.enable, value: '0' },
        { label: I18N.carbonFootprint.disabled, value: '1' },
      ],
    },
  ];
  const returnSelectOption = (data: Options) => {
    const arr = data?.map(it => (
      <Fragment key={it.value}>
        <Option value={it.value}>{it.label}</Option>
      </Fragment>
    ));
    return arr;
  };
  const renderSearchForm = () => {
    const arr = renderSearchFormDate?.map(item => {
      if (item?.type === 'input') {
        return (
          <Col
            xxl={4}
            md={6}
            xl={6}
            key={`${item.name}Search`}
            style={{
              paddingRight: '0',
              paddingBottom: '20px',
            }}
          >
            <Form.Item key={`${item.name}SearchItem`} name={item.name}>
              <Input
                placeholder={item.placeholder}
                style={{ minWidth: '120px' }}
              />
            </Form.Item>
          </Col>
        );
      }
      if (item.type === 'select') {
        return (
          <Col
            xxl={4}
            md={6}
            xl={6}
            lg={6}
            key={`${item.name}Search`}
            style={{
              paddingRight: '0',
              // paddingLeft: index === 0 ? '15px' : '30px',
              paddingBottom: '20px',
            }}
          >
            <Form.Item key={`${item.name}Search`} name={item.name}>
              <Select
                placeholder={item.placeholder}
                style={{ minWidth: '120px' }}
              >
                {returnSelectOption(checkList(item?.select_data) ?? [])}
              </Select>
            </Form.Item>
          </Col>
        );
      }
      if (item.type === 'treeSelect') {
        return (
          <Col
            xxl={4}
            md={6}
            xl={6}
            key={`${item.name}Search`}
            style={{
              paddingRight: '0',
              paddingBottom: '20px',
            }}
          >
            <Form.Item key={`${item.name}SearchItem`} name={item.name}>
              <TreeSelect
                dropdownStyle={{
                  overflow: 'auto',
                  minWidth: 500,
                }}
                placeholder={item.placeholder}
                allowClear
                treeDefaultExpandAll
                treeData={item.dataSource}
              />
            </Form.Item>
          </Col>
        );
      }
      return [];
    });
    return arr;
  };
  /** *
   * 抽屉内容
   */
  // eslint-disable-next-line consistent-return
  const getContent = () => {
    if (currentStatus === 1) {
      return (
        <div>
          <div className={style.marginBottom30} style={{ display: 'flex' }}>
            <span className={style.text14}>
              {I18N.dashborad.employeeCarbonCloudAccount2}
            </span>
            <div>
              <span className={style.text14}>{showValue.userName}</span>
              <span
                className={classnames(style.text14)}
                style={{ display: 'block', color: '#999999' }}
              >
                {I18N.dashborad.employeesUseThis}
              </span>
            </div>
          </div>
          <div className={style.marginBottom30}>
            <span className={style.text14}>{I18N.dashborad.employeeName2}</span>
            <span className={style.text14}>{showValue.employName}</span>
          </div>
          <div className={style.marginBottom30}>
            <span className={style.text14}>
              {I18N.dashborad.employeeContactParty2}
            </span>
            <span className={style.text14}>{showValue.employPhone}</span>
          </div>
          <div className={style.marginBottom30}>
            <span className={style.text14}>{I18N.dashborad.department3}</span>
            <span className={style.text14}>{showValue.departmentName}</span>
          </div>
          <div className={style.marginBottom30}>
            <span className={style.text14}>
              {I18N.dashborad.organizationalAngle2}
            </span>
            <span className={style.text14}>
              {showValue.roles?.map((item, index) =>
                index ===
                // elint-disable-next-line
                (showValue.roles?.length && showValue.roles.length - 1) ? (
                  // elint-disable-next-line
                  <span key={item.roleId}>{`${item?.roleName}`}</span>
                ) : (
                  <span key={item.roleId}>{`${item?.roleName}、`}</span>
                ),
              )}
            </span>
          </div>
        </div>
      );
    }
    if ([0, 2].indexOf(currentStatus) >= 0) {
      return (
        <Form
          form={staffsFrom}
          validateTrigger='onChange'
          style={{ width: '100%' }}
        >
          <Form.Item
            {...labelCol}
            rules={[
              { required: true, message: I18N.dashborad.accountCannotBe },
              {
                pattern: /^1[3456789]\d{9}$/,
                message: I18N.dashborad.enterTheCorrectHand2,
              },
            ]}
            name='userName'
            label={I18N.dashborad.employeeCarbonCloudAccount}
            validateStatus={validateStatus}
            extra={I18N.dashborad.employeesUseThis}
          >
            <Input
              id='phone'
              placeholder={I18N.carbonFootprint.pleaseEnter}
              // type='number'
              disabled={currentStatus === 2}
              onChange={e => {
                const val = e.target.value;
                if (!/^1[3456789]\d{9}$/.test(val)) {
                  changeValidateStatus('error');
                } else {
                  changeValidateStatus('success');
                }
                staffsFrom.setFieldsValue({
                  userName: e.target.value,
                });
              }}
            />
          </Form.Item>
          <Form.Item
            {...labelCol}
            rules={[
              {
                required: true,
                message: I18N.dashborad.employeeNameNotAvailable,
              },
            ]}
            name='employName'
            label={I18N.dashborad.employeeName}
          >
            <Input placeholder={I18N.carbonFootprint.pleaseEnter} />
          </Form.Item>
          <Form.Item
            {...labelCol}
            rules={[
              { required: true, message: I18N.dashborad.employeeContactParty },
              {
                pattern: /^((0\d{2,3}-\d{7,8})|(1[3679584]\d{9}))$/,
                message: I18N.dashborad.enterTheCorrectHand,
              },
            ]}
            name='employPhone'
            label={I18N.dashborad.employeeContactParty}
          >
            <Input
              placeholder={I18N.carbonFootprint.pleaseEnter}
              name='employPhone'
            />
          </Form.Item>
          <Form.Item
            // {...labelCol}
            style={{
              display: 'grid',
              gridTemplateColumns: '120px minmax(100px, 1fr)',
            }}
            label={I18N.dashborad.department2}
            rules={[
              {
                required: true,
                message: I18N.dashborad.pleaseSelectTheAffiliation3,
              },
            ]}
            name='departmentId'
          >
            <TreeSelect
              placeholder={I18N.carbonFootprint.pleaseSelect}
              treeData={departmentData}
              fieldNames={{ label: 'departmentName', value: 'departmentId' }}
            />
          </Form.Item>
          <Form.Item
            label={I18N.dashborad.organizationalAngle}
            name='roleIds'
            rules={[
              { message: I18N.dashborad.pleaseSelectAtLeast, required: true },
            ]}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(120px,0fr) 1fr',
            }}
          >
            <CheckboxGroup
              className={style.all_checked}
              options={RoleSource}
              style={{ paddingTop: '6px' }}
            />
          </Form.Item>
        </Form>
      );
    }
  };
  /** *
   * 清空 抽屉表单 数据
   *
   */
  const clearStaffsFrom = () => {
    staffsFrom.setFieldsValue({
      userName: null,
      employPhone: null,
      roleIds: [],
      employName: null,
      departmentId: null,
    });
    changeIsMaster(2);
    // changetIsMaster({ is_master: false });
  };

  const apiQueryByPageTypeFn = async (value?) => {
    changeIsLoading(true);
    const { data } = await apiQueryByPageType({ page, size, ...value });
    if (data.code === 200) {
      getDataSource(data.data.rows);
      setCount(data.data.total);
      changeIsLoading(false);
    }
  };
  const apiRoleListFn = async () => {
    const { data } = await apiRoleList({ size: 100000, page: 1 });
    if (data.code === 200) {
      const newDataArr = data?.data.rows?.map(
        (item: {
          roleName: string;
          roleId: number;
          type: number | string;
        }) => ({
          label: item.roleName,
          value: `${item.roleId}`,
          disabled: !!(Number(item.type) === 0 && Number(isMaster) === 1),
        }),
      );
      getRoleSource(newDataArr);
    }
  };

  const apiDepartmentPageTypeFn = async () => {
    const { data } = await apiDepartmentPageType({
      companyId: Number(localStorage.getItem(COMPANY_ID))
        ? Number(localStorage.getItem(COMPANY_ID))
        : 0,
    });
    if (data.code === 200) {
      getDepartmentData(data.data);
    }
  };
  const indexColumn = useIndexColumn<Column>((page - 1) * size);
  const columns: ColumnsType<Column> = [
    ...indexColumn,
    {
      title: I18N.dashborad.employeeName,
      dataIndex: 'employName',
      key: 'employName',
      width: 180,
    },
    {
      title: I18N.dashborad.affiliatedOrganization,
      dataIndex: 'orgName',
      key: 'orgName',
      width: 180,
    },
    {
      title: I18N.dashborad.mobilePhoneNumber,
      dataIndex: 'employPhone',
      key: 'employPhone',
      width: 180,
      render: (employPhone: string, record) => (
        <span>
          {record.employPhoneCode?.match(/\(\+\d+\)/)?.[0]}
          {employPhone}
        </span>
      ),
    },
    {
      title: I18N.carbonFootprint.mailbox,
      dataIndex: 'employEmail',
      key: 'employEmail',
      width: 180,
    },
    {
      title: I18N.dashborad.role,
      dataIndex: 'roles',
      key: 'roles',
      width: 240,
      ellipsis: true,
      render: (roles: { roleName: string }[]): React.ReactNode => (
        <Tooltip
          placement='top'
          title={
            roles &&
            roles?.map((item: { roleName: string }, index) =>
              index === roles.length - 1 ? (
                <span key={item.roleName}>{`${item.roleName}`}</span>
              ) : (
                <span key={item.roleName}>{`${item.roleName}、`}</span>
              ),
            )
          }
        >
          {roles &&
            roles?.map((item: { roleName: string }, index) =>
              index === roles.length - 1 ? (
                <span key={item.roleName}>{`${item.roleName}`}</span>
              ) : (
                <span key={item.roleName}>{`${item.roleName}、`}</span>
              ),
            )}
        </Tooltip>
      ),
    },
    {
      title: I18N.enterpriseCarbonAccount2.dataApprovalNegative,
      dataIndex: 'superApproval',
      width: 160,
      ellipsis: true,
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.state,
      dataIndex: 'status',
      width: 100,
      render: (status: boolean) =>
        status ? I18N.carbonFootprint.disabled : I18N.carbonFootprint.enable,
    },
    {
      title: I18N.carbonFootprint.operation,
      key: 'action',
      width: '280px',
      fixed: 'right',
      render: (record: Column) => (
        <div className={styles.flexBox}>
          <Permission flag='management:user:list'>
            <UserDrawer
              type='edit'
              initValue={record}
              readPretty={!canEdit}
              refresh={() => apiQueryByPageTypeFn()}
            >
              <span className={styles.detail}>
                {I18N.carbonFootprint3.details}
              </span>
            </UserDrawer>
          </Permission>

          <TableEditTsx<Column>
            get_action_data={GetActionContentArray(record)}
            record={record}
            onHandelType={async values => {
              const username = selector?.userInfo.username;
              if (username) {
                if (
                  values.btn_title &&
                  [
                    I18N.carbonFootprint.check,
                    I18N.carbonFootprint.edit,
                  ].indexOf(values.btn_title) >= 0
                ) {
                  showAndEdit(values.btn_title, record);
                  changeIsMaster(record.ucType);
                  changeUdId(record.udId);
                }
                if (values.btn_title === I18N.carbonFootprint.disabled) {
                  const { data } = await apiBanUserFlag({
                    userId: record.userId,
                    useType: 1,
                  });
                  if (data.code === 200) {
                    // apiRoleListFn();
                    VerifyUtils.Toast(data.code, data.msg);
                    apiQueryByPageTypeFn();
                  }
                }
                if (values.btn_title === I18N.carbonFootprint.delete) {
                  const { data } = await apiBanUserFlag({
                    userId: record.userId,
                    useType: 2,
                  });
                  if (data.code === 200) {
                    VerifyUtils.Toast(data.code, data.msg);
                    await apiQueryByPageTypeFn();
                    const name = selector?.userInfo.username;

                    if (String(name) === String(record?.userName)) {
                      history.push(RouteMaps.account);
                    }
                  }
                }
              }
            }}
          />
        </div>
      ),
    },
  ];
  const footerConfig = () =>
    [0, 2].indexOf(currentStatus) >= 0 && (
      <div style={{ textAlign: 'right' }}>
        <Button
          style={{ marginRight: 8 }}
          onClick={() => {
            setVisible(false);
            clearStaffsFrom();
          }}
        >
          {I18N.carbonFootprint.cancel}
        </Button>
        <Button
          type='primary'
          onClick={async () => {
            const username = selector?.userInfo.username;
            if (username) {
              if (currentStatus === 0) {
                await staffsFrom.validateFields().then(async value => {
                  const { data } = await apiAddUser({
                    ...value,
                    updateUser: username,
                  });
                  if (data.code === 200) {
                    setVisible(false);
                    clearStaffsFrom();
                    apiQueryByPageTypeFn();
                    if (data.msg) {
                      VerifyUtils.Toast(data.code, data.msg);
                    }
                  }
                });
              } else {
                await staffsFrom.validateFields().then(async value => {
                  const { data } = await apiEditUser({
                    ...value,
                    id: showValue.id ? showValue.id : '',
                    userId: showValue.userId ? showValue.userId : '',
                    udId: udId || null,
                    updateUser: username,
                    type: isMaster,
                  });
                  if (data.code === 200) {
                    setVisible(false);
                    clearStaffsFrom();
                    apiQueryByPageTypeFn();
                    if (data.msg) {
                      VerifyUtils.Toast(data.code, data.msg);
                    }
                  }
                });
              }
            }
          }}
        >
          {I18N.carbonFootprint.confirm}
        </Button>
      </div>
    );
  useEffect(() => {
    apiQueryByPageTypeFn();
    apiRoleListFn();
    apiDepartmentPageTypeFn();
  }, []);
  useEffect(() => {
    apiRoleListFn();
  }, [visible]);
  return (
    <div className={styles.userManagementList}>
      <div className={classnames('Dashboard', style.searchBackground)}>
        {/* <TableTitle
          iconType='icon-icon-xincengyungong'
          title='员工管理'
          addNewTitle='员工'
          onClickFn={() => {
            changeCurrentStatus(0);
            setVisible(true);
            clearStaffsFrom();
          }}
          flag='management:user:add'
        /> */}
        <div className={styles.headerWrapper}>
          <div className={styles.title}>
            {I18N.dashborad.employeeManagement}
          </div>
          <Permission flag='management:user:add'>
            <UserDrawer
              readPretty={false}
              refresh={() => apiQueryByPageTypeFn()}
            >
              <Button type='primary' icon={<PlusOutlined />}>
                {I18N.dashborad.addNewEmployees}
              </Button>
            </UserDrawer>
          </Permission>
        </div>

        <Row
          // className={style.padding}
          gutter={{ xs: 8, sm: 16, md: 24 }}
          style={{ width: '100%', paddingBottom: '0' }}
        >
          <Form
            form={searchForm}
            validateTrigger='onChange'
            layout='inline'
            onFinish={async (value: SearchStaffsFromType) => {
              await apiQueryByPageTypeFn({
                ...value,
                page: 1,
                size,
                orgId: value.orgId?.toString(),
              });
              setPage(1);
            }}
            style={{ width: '100%' }}
          >
            {renderSearchForm()}
            <Col
              style={{
                paddingLeft: '30px',
                paddingRight: '0',
              }}
            >
              <Space>
                <Button htmlType='submit' type='primary'>
                  {I18N.carbonNeutral.query}
                </Button>
                <Button
                  onClick={async () => {
                    searchForm.resetFields();
                    setPage(1);
                    await apiQueryByPageTypeFn({
                      page: 1,
                      size,
                    });
                  }}
                >
                  {I18N.carbonFootprint3.reset}
                </Button>
              </Space>
            </Col>
          </Form>
        </Row>
      </div>
      <Row>
        <Col span={24}>
          <BaseTable<Column>
            columns={columns}
            loading={isLoading}
            scroll={{ x: '1400px' }}
            data={{
              list: staffDataSource,
              page: {
                page,
                size,
                dataTotal: pageCount,
              },
            }}
            rowKey='pk'
            onChange={async pageParams => {
              // getIsSearch(false);
              setPageSize(pageParams.pageSize ? pageParams.pageSize : 10);
              setPage(pageParams.current ? pageParams.current : 1);
              await apiQueryByPageTypeFn({
                ...searchForm.getFieldsValue(true),
                page: pageParams.current ? pageParams.current : 1,
                size: pageParams.pageSize ? pageParams.pageSize : 10,
              });
            }}
          />
        </Col>
      </Row>
      <DrawerCom
        childrenData={getContent()}
        visible={visible}
        title={modelText[currentStatus]}
        width='460'
        footer={footerConfig()}
        onClose={() => {
          setVisible(false);
          changeIsMaster(2);
        }}
      />
    </div>
  );
};

export default Orgstaff;
