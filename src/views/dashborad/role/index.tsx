/**
 * @file 角色管理
 */
import BaseTable from '@components/BaseTable';
import TableEditTsx from '@components/TableEditTsx';
import TableTitle from '@components/TableTitle';
import I18N from '@src/lang/I18N';
import style from '@src/styles/global.module.scss';
import { generatePerssionTree } from '@src/utils';
import { COMPANY_ID } from '@src/utils/consts';
import VerifyUtils from '@utils/verifty';
import { Form, Input, Button, Tooltip, Col, Row, Tree } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import classnames from 'classnames';
import { FC, useEffect, useState } from 'react';

import { CustomDrawer } from '@/components/CustomDrawer';

import {
  apiAddRole,
  apiRoleList,
  apiGetRoleInfo,
  apiRoleDele,
  apiRoleEdit,
  apiGetPermissions,
} from './service'; // 获取api
import { Column } from './type';

/** *
 * 操作
 */
const GetActionContentArray = (record: Column) =>
  // 编辑暂时放掉注释掉
  [
    {
      btn_title: I18N.carbonFootprint.check,
      type: 'edit',
      color: style.textGreen,
      is_pop: false,
      flag: 'management:role:info',
    },
    !record.type
      ? {}
      : {
          btn_title: I18N.carbonFootprint.edit,
          type: 'edit',
          color: style.textGreen,
          is_pop: false,
          flag: 'management:role:edit',
        },
    !record.type
      ? {}
      : {
          btn_title: I18N.carbonFootprint.delete,
          type: 'delete',
          color: style.textError,
          is_pop: true,
          pop_title: I18N.components.thisOperationWillForever,
          flag: 'management:role:delete',
        },
  ];
export type Options = {
  label: string;
  value: string | number;
  user?: number;
  [key: string]: any;
}[];
type ModelTextType = {
  [name in number | string]: string;
};
const modelText: ModelTextType = {
  0: I18N.dashborad.addANewRole,
  1: I18N.dashborad.characterDetails,
  2: I18N.dashborad.editRole,
};

const Orgstaff: FC = () => {
  const [staffsFrom] = Form.useForm<{
    roleName: string | null;
    roleInfo: string | null;
    permissionIds: string[] | null;
  }>(); // 新增员工 表单
  const [isLoading, changeIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [size, setPageSize] = useState(10);
  const [pageCount, setCount] = useState(0); // 设置总条数
  const [staffDataSource, getDataSource] = useState([
    {
      id: '12121',
      roleName: 'ces',
      type: false,
      roleInfo: '121212',
      staff_count: '1212',
      is_master: false,
      roleId: '',
    },
  ]); // 列表数据
  /**
   * 查看 功能
   * * */

  const [showContent, changeShowCount] = useState<Column>({
    id: '',
    roleName: '',
    type: false,
    roleInfo: '',
    staff_count: '',
    is_master: false,
    roleId: 0,
  });
  const [currentStatus, changeCurrentStatus] = useState<number>(0); // 0：新增功能 1:查看功能 2:编辑功能
  const [visible, setVisible] = useState(false); // 弹窗显示隐藏
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]); // 全选
  const [halfCheckedKeys, setHalfCheckedKeys] = useState<string[]>([]);
  const [menuDate, getMenuDate] = useState<any[]>([]);

  // 获取角色列表
  const apiRoleListFn = async () => {
    changeIsLoading(true);
    const { data } = await apiRoleList({ page, size });
    if (data.code === 200) {
      setCount(data.data.total);
      getDataSource(data.data.rows);
      changeIsLoading(false);
    }
  };

  // 获取权限列表
  const apiGetPermissionsFn = async () => {
    const { data } = await apiGetPermissions({
      companyId: Number(localStorage.getItem(COMPANY_ID))
        ? Number(localStorage.getItem(COMPANY_ID))
        : 0,
    });
    if (data.code === 200) {
      const arr = generatePerssionTree(data.data || []);
      getMenuDate([...arr]);
    }
  };
  useEffect(() => {
    apiRoleListFn();
    apiGetPermissionsFn();
  }, [page, size]);
  const onCheck = (checked, e): void => {
    if (Array(checked)) {
      setCheckedKeys(checked);
      setHalfCheckedKeys([...e.halfCheckedKeys]);
      // setHalfChecked
      staffsFrom.setFieldsValue({
        ...staffsFrom.getFieldsValue(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        permissionIds: [...checked],
      });
    }
  };
  const dataCode = (data: { code: number; msg: string }) => {
    if (data.code === 200) {
      setVisible(false);
      staffsFrom.resetFields();
      apiRoleListFn();
    }
    if (data.msg) {
      VerifyUtils.Toast(data.code as 200, data.msg);
    }
  };
  const columns: ColumnsType<Column> = [
    {
      title: I18N.dashborad.number,
      key: 'id',
      fixed: 'left',
      dataIndex: 'id',
      width: '10%',
      render: (value, record, index: number) => (
        <span>{(page - 1) * size + index + 1}</span>
      ),
    },
    {
      title: I18N.dashborad.roleName,
      dataIndex: 'roleName',
      key: 'roleName',
      width: '20%',
      ellipsis: true,
      render: (roleName: string) => (
        <Tooltip title={roleName} placement='topLeft'>
          {`${roleName}`}
        </Tooltip>
      ),
    },
    {
      title: I18N.dashborad.characterDescription,
      dataIndex: 'roleInfo',
      key: 'roleInfo',
      width: '20%',
      ellipsis: true,
      render: (roleInfo: string) => (
        <Tooltip title={roleInfo} placement='topLeft'>
          {roleInfo === null || roleInfo === '' ? '-' : roleInfo}
        </Tooltip>
      ),
    },
    {
      title: I18N.dashborad.numberOfAccounts,
      dataIndex: 'count',
      key: 'count',
      width: '20%',
      render: (count: string) => (
        <Tooltip title={count} placement='topLeft'>
          {count === null || count === '' ? '-' : count}
        </Tooltip>
      ),
    },
    {
      title: I18N.carbonFootprint.operation,
      key: 'action',
      width: '280px',
      fixed: 'right',
      render: (record: Column) => (
        <TableEditTsx<Column>
          get_action_data={GetActionContentArray(record)}
          record={record}
          onHandelType={async values => {
            if (
              values.btn_title &&
              [I18N.carbonFootprint.check, I18N.carbonFootprint.edit].indexOf(
                values.btn_title,
              ) >= 0
            ) {
              await apiGetRoleInfo({ id: record.id }).then(({ data }) => {
                changeShowCount(record);
                setVisible(true);
                if (data.code === 200) {
                  staffsFrom.setFieldsValue({
                    ...data.role,
                  });
                }
                if (values.btn_title === I18N.carbonFootprint.check) {
                  changeCurrentStatus(1);
                }
                if (values.btn_title === I18N.carbonFootprint.edit) {
                  changeCurrentStatus(2);
                }
                setCheckedKeys(data.role.permissionIds);
                setHalfCheckedKeys(data.role.half);

                // dataCode(data);
              });
            }
            if (values.btn_title === I18N.carbonFootprint.delete) {
              await apiRoleDele({ id: record.id }).then(({ data }) => {
                changeShowCount(record);
                // setVisible(true);
                dataCode(data);
              });
            }
          }}
        />
      ),
    },
  ];
  /** *
   * 抽屉内容
   */
  // eslint-disable-next-line consistent-return
  const getContent = () => {
    if (currentStatus === 1) {
      return (
        <div>
          <div className={style.marginBottom30}>
            <span className={style.text14}>{I18N.dashborad.roleName2}</span>
            <span className={style.text14}>{showContent.roleName}</span>
          </div>
          <div className={style.marginBottom30}>
            <span className={style.text14}>
              {I18N.dashborad.characterDescription2}
            </span>
            <span className={style.text14}>{showContent.roleInfo}</span>
          </div>
          <div className={style.marginBottom30} style={{ display: 'flex' }}>
            <span className={style.text14}>{I18N.dashborad.authority2}</span>
            <span className={style.text14} style={{ flex: 1 }}>
              <Tree
                fieldNames={{
                  title: 'permissionName',
                  key: 'permissionId',
                }}
                checkable
                height={800}
                disabled
                // autoExpandParent={autoExpandParent} // 是否自动展开父节点
                checkedKeys={{
                  checked: checkedKeys,
                  halfChecked: [],
                }} // 选中复选框的树节点
                treeData={menuDate} // treeNodes 数据
              />
            </span>
          </div>
        </div>
      );
    }
    if ([0, 2].indexOf(currentStatus) >= 0) {
      return (
        <Form form={staffsFrom} validateTrigger='onChange'>
          <Form.Item
            rules={[
              { required: true, message: I18N.dashborad.roleNameNotApplicable },
            ]}
            name='roleName'
            label={I18N.dashborad.roleName}
          >
            <Input
              placeholder={I18N.carbonFootprint.pleaseEnter}
              maxLength={50}
            />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: I18N.dashborad.characterDescriptionIsIncorrect,
              },
            ]}
            name='roleInfo'
            label={I18N.dashborad.characterDescription}
          >
            <Input.TextArea
              placeholder={I18N.dashborad.enterUpTo}
              showCount
              maxLength={100}
              rows={4}
            />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: I18N.dashborad.pleaseSelectPermissions,
              },
            ]}
            name='permissionIds'
            label={I18N.dashborad.authority}
          >
            {
              <Tree
                fieldNames={{
                  title: 'permissionName',
                  key: 'permissionId',
                }}
                height={800}
                style={{ marginTop: '6px' }}
                checkable
                onCheck={onCheck} // 点击复选框触发
                checkedKeys={{
                  checked: checkedKeys,
                  halfChecked: [],
                }} // 选中复选框的树节点
                treeData={menuDate} // treeNodes 数据
              />
            }
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
    apiRoleListFn();
    staffsFrom.resetFields();
    setCheckedKeys([]);
    setHalfCheckedKeys([]);
  };
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
          // loading={state.loading}
          onClick={async () => {
            await staffsFrom.validateFields().then(async value => {
              // 新增
              if (value.roleName && value.roleInfo && value.permissionIds) {
                if (currentStatus === 0) {
                  await apiAddRole({
                    ...value,
                    type: 1,
                    half: halfCheckedKeys,
                  }).then(({ data }) => {
                    if (data.code === 200) {
                      clearStaffsFrom();
                      setVisible(false);
                    }
                    VerifyUtils.Toast(data.code as 200, data.msg);
                  });
                }
                if (currentStatus === 2) {
                  await apiRoleEdit({
                    ...value,
                    type: 1,
                    id: showContent.id,
                    roleId: showContent.roleId,
                    half: halfCheckedKeys,
                  }).then(({ data }) => {
                    if (data.code === 200) {
                      clearStaffsFrom();
                      setVisible(false);
                    }
                    VerifyUtils.Toast(data.code as 200, data.msg);
                  });
                }
              }
            });
          }}
        >
          {I18N.carbonFootprint.confirm}
        </Button>
      </div>
    );
  return (
    <div className='childHeight'>
      <div className={classnames('Dashboard', style.searchBackground)} />
      <div
        className={classnames(
          'Dashboard',
          // style.marginTop,
          style.searchBackground,
        )}
      />
      <TableTitle
        title={I18N.dashborad.roleManagement}
        addNewTitle={I18N.dashborad.role}
        onClickFn={() => {
          changeCurrentStatus(0);
          setVisible(true);
          clearStaffsFrom();
        }}
        flag='management:role:add'
      />
      <Row>
        <Col span={24}>
          <BaseTable<Column>
            columns={columns}
            loading={isLoading}
            // scroll={{ x: 'min-content' }}
            data={{
              list: staffDataSource,
              page: {
                page,
                size,
                dataTotal: pageCount,
              },
            }}
            rowKey='id'
            onChange={pageParams => {
              // current: 2
              // pageSize: 10
              // showSizeChanger: true
              // total: 11
              setPageSize(pageParams.pageSize ? pageParams.pageSize : 10);
              setPage(pageParams.current ? pageParams.current : 1);
            }}
          />
        </Col>
      </Row>

      <CustomDrawer
        open={visible}
        title={modelText[currentStatus]}
        width='460'
        footer={footerConfig()}
        onClose={() => {
          setVisible(false);
          staffsFrom.resetFields();
        }}
      >
        {getContent()}
      </CustomDrawer>
    </div>
  );
};

export default Orgstaff;
