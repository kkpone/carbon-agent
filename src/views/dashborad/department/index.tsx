/*
 * @@description:首页 部门管理
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-09-29 11:15:11
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-01-08 18:12:11
 */

import I18N from '@src/lang/I18N';
import { FC, useEffect, useState } from 'react';
import classnames from 'classnames';
import { ColumnsType } from 'antd/lib/table';
import style from '@src/styles/global.module.scss';
import { Form, Input, Col, Row, TreeSelect, Button } from 'antd';
import BaseTable from '@components/BaseTable';
import TableEditTsx from '@components/TableEditTsx';
import TableTitle from '@components/TableTitle';
import Modal from 'antd/lib/modal/Modal';
import VerifyUtils from '@utils/verifty';
import { COMPANY_ID } from '@src/utils/consts';
import { useSelector } from 'react-redux';
import { RootState } from '@src/store';
import {
  apiQueryByPageType,
  ChildrenItem,
  apiDepartmentAdd,
  apiDepartmentDele,
  apiDepartmentEdit,
  apiSetTop,
} from './service';

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
  phone_number?: null | string;
  contact_info?: null | string;
  roles_list?: null | string;
  is_active?: null | string;
};
export interface Column {
  departmentName: string;
}
/** *
 * 操作
 */
const GetActionContentArray = record =>
  // 编辑暂时放掉注释掉
  [
    {
      btn_title: I18N.dashborad.addSubDepartments,
      type: 'add',
      color: style.textGreen,
      is_pop: false,
      flag: 'management:department:addchildren',
    },
    {
      btn_title: I18N.dashborad.modify,
      type: 'edit',
      color: style.textGreen,
      is_pop: false,
      flag: 'management:department:delete',
    },
    record.parentId
      ? {
          btn_title: I18N.dashborad.topping,
          type: 'up',
          color: style.textGreen,
          is_pop: false,
          flag: 'management:department:sort',
        }
      : {
          btn_title: I18N.dashborad.topping,
          type: 'up',
          color: style.textGreen,
          is_pop: false,
          flag: 'management:department:sort',
        },
    record?.children?.length > 0
      ? {}
      : {
          btn_title: I18N.carbonFootprint.delete,
          type: 'delete',
          color: style.textError,
          is_pop: true,
          pop_title: I18N.components.thisOperationWillForever,
          flag: 'management:department:edit',
        },
  ];
export type Options = {
  label: string;
  value: string | number;
  user?: number;
  [key: string]: any;
}[];
type ModelTextType = {
  [name: number | string]: string;
};
const modelText: ModelTextType = {
  0: I18N.dashborad.newDepartmentAdded,
  1: I18N.dashborad.departmentDetails,
  2: I18N.dashborad.modifyDepartment,
  3: I18N.dashborad.addSubDepartments,
};

const Orgstaff: FC = () => {
  const [staffsFrom] = Form.useForm<{
    parentId: number | string | null;
    departmentName: string | null;
  }>(); // 新增员工 表单
  const [isLoading, changeIsLoading] = useState<boolean>(false);
  const [staffDataSource, getDataSource] = useState<ChildrenItem[]>([]); // 列表数据
  const [currentStatus, changeCurrentStatus] = useState<number>(0); // 0：新增功能 1:查看功能 2:编辑功能 3:新增子部门
  const [visible, setVisible] = useState<boolean>(false); // 弹窗显示隐藏
  const [TreeSelectValue, changeTreeSelectValue] = useState<string | number>(
    '',
  );
  const [departmentId, getDepartmentId] = useState<number | string>(0);
  const [isUpdate, changeIsUpdate] = useState<boolean>(true);
  const [editData, getEditData] = useState<ChildrenItem[]>([]); // 修改数据
  const selector = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );

  const queryByPageTypeFn = async () => {
    changeIsLoading(true);
    await apiQueryByPageType({
      companyId: Number(localStorage.getItem(COMPANY_ID))
        ? Number(localStorage.getItem(COMPANY_ID))
        : 0,
    }).then(({ data }) => {
      if (data.code === 200) {
        const parentSource = [
          {
            departmentId: '0',
            departmentName: selector.userInfo?.companyName || '-',
            id: 0,
            parentId: 0,
            children: [...data.data],
          },
        ];
        getDataSource([...data.data]);
        getEditData([...parentSource]);
      }
      changeIsLoading(false);
    });
  };
  const dataCode = (data: { code: number; msg: string }) => {
    if (data.code === 200) {
      setVisible(false);
      staffsFrom.resetFields();
      queryByPageTypeFn();
    }
    if (data.msg) {
      VerifyUtils.Toast(data.code as 200, data.msg);
    }
  };
  const columns: ColumnsType<ChildrenItem> = [
    {
      title: I18N.dashborad.departmentName,
      dataIndex: 'departmentName',
      key: 'departmentName',
    },
    {
      title: I18N.carbonFootprint.operation,
      key: 'action',
      fixed: 'right',
      render: (text, record: ChildrenItem) => (
        <TableEditTsx<ChildrenItem>
          get_action_data={GetActionContentArray(record)}
          record={record}
          onHandelType={async values => {
            if (values.btn_title === I18N.dashborad.addSubDepartments) {
              setVisible(true);
              changeTreeSelectValue(record.id);
              staffsFrom.setFieldsValue({
                parentId: record.departmentId,
                // departmentName: record.departmentName,
              });
              changeCurrentStatus(3);
              changeIsUpdate(true);
            }
            if (values.btn_title === I18N.dashborad.modify) {
              if (record?.departmentId) {
                changeTreeSelectValue(record.id);
                getDepartmentId(record.departmentId);
                staffsFrom.setFieldsValue({
                  parentId: record.parentId ? record.parentId : '0',
                  departmentName: record.departmentName,
                });
                changeCurrentStatus(2);
              }

              setVisible(true);
              changeIsUpdate(false);
            }
            if (values.btn_title === I18N.dashborad.topping) {
              // elint-disable-next-line
              await apiSetTop({ id: record.id }).then(({ data }) => {
                dataCode(data);
              });
            }
            if (values.btn_title === I18N.carbonFootprint.delete) {
              if (record.departmentId) {
                await apiDepartmentDele({
                  departmentId: record.departmentId,
                }).then(({ data }) => {
                  dataCode(data);
                });
              }
            }
          }}
        />
      ),
    },
  ];
  // 获取部门列表

  const confirm = async () => {
    if (currentStatus === 2) {
      // 编辑功能
      // staffsFrom.
      await staffsFrom.validateFields().then(async value => {
        if (value.departmentName !== null && value.parentId !== null) {
          await apiDepartmentEdit({
            departmentName: value.departmentName,
            parentId: value.parentId,
            id: TreeSelectValue,
            departmentId,
          }).then(({ data }) => {
            dataCode(data);
          });
        }
      });
    }
    if ([0, 3].indexOf(currentStatus) >= 0) {
      await staffsFrom.validateFields().then(async value => {
        if (value.departmentName) {
          const { data } = await apiDepartmentAdd({
            departmentName: value.departmentName,
            parentId: value.parentId ? `${value.parentId}` : 0,
          });
          dataCode(data);
        }
      });
    }
  };

  useEffect(() => {
    queryByPageTypeFn();
  }, []);

  /** *
   * 清空 抽屉表单 数据
   *
   */
  const clearStaffsFrom = () => {
    staffsFrom.setFieldsValue({
      departmentName: null,
      parentId: null,
    });
  };
  return (
    <div className='childHeight'>
      <div className={classnames('Dashboard', style.searchBackground)} />
      <TableTitle
        title={I18N.dashborad.departmentManagement}
        addNewTitle={I18N.dashborad.department}
        onClickFn={() => {
          changeCurrentStatus(0);
          setVisible(true);
          clearStaffsFrom();
          changeIsUpdate(true);
        }}
        flag='management:department:add'
      />
      <Row>
        <Col span={24}>
          <BaseTable<ChildrenItem>
            columns={columns}
            loading={isLoading}
            scroll={{ x: 'min-content' }}
            data={{
              list: staffDataSource,
            }}
            rowKey='departmentId'
            onChange={() => {}}
          />
        </Col>
      </Row>

      <Modal
        title={modelText[currentStatus]}
        visible={visible}
        maskClosable={false}
        width={450}
        onCancel={() => {
          setVisible(false);
        }}
        footer={null}
      >
        <Form
          form={staffsFrom}
          validateTrigger='onChange'
          style={{ width: '100%' }}
        >
          <Form.Item
            {...labelCol}
            rules={[{ required: true, message: I18N.dashborad.departmentNameNotApplicable }]}
            name='departmentName'
            label={I18N.dashborad.departmentName}
          >
            <Input placeholder={I18N.carbonFootprint.pleaseEnter} maxLength={50} />
          </Form.Item>
          <Form.Item
            {...labelCol}
            rules={
              currentStatus !== 0
                ? [{ required: true, message: I18N.dashborad.pleaseSelectASuperior }]
                : []
            }
            name='parentId'
            label={I18N.dashborad.superiorDepartment}
          >
            <TreeSelect
              disabled={isUpdate}
              style={{ width: '100%' }}
              value={TreeSelectValue}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder={
                isUpdate ? selector.userInfo.companyName || '-' : I18N.carbonFootprint.pleaseSelect
              }
              treeData={editData}
              fieldNames={{
                label: 'departmentName',
                value: 'departmentId',
                children: 'children',
              }}
            />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => {
                setVisible(false);
                clearStaffsFrom();
              }}
            >
              {I18N.carbonFootprint.cancel}</Button>
            <Button
              type='primary'
              // loading={state.loading}
              onClick={async () => {
                await confirm();
              }}
            >
              {I18N.carbonFootprint.confirm}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Orgstaff;
