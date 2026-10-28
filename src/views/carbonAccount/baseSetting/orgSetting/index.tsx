/**
 * 组织设置
 * @author qifeng mingyao jiahui
 */
import { checkPermissions } from '@src/components/Permission/utils';
import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { pageUsingGET1DefaultApi } from '@src/sdks/java/carbonAccount';
import { Toast } from '@src/utils/Toast';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Table,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import { isNil, xor } from 'lodash-es';
import { useEffect, useState } from 'react';

import '../../index.less';
import { ApiOrgAdd, ApiOrgDelete, ApiOrgEdit } from '../service';
import { OrganizationModal, Organizations } from '../utils/types';

const OrgSetting = () => {
  const [tableData, setTableData] = useState<Organizations[]>();
  const [visible, setVisible] = useState<OrganizationModal>();

  const [loading, setLoading] = useState(false);

  const [modalForm] = Form.useForm<{
    id: number;
    orgName: string;
    pid: number;
    orderNum: number;
  }>();
  const getOrgListData = () => {
    setLoading(true);
    pageUsingGET1DefaultApi()
      .then(res => {
        const list = res.data.data as Organizations[];

        setTableData(list);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    getOrgListData();
  }, []);
  const columns: ColumnsType<Organizations> = [
    {
      title: I18N.carbonFootprint3.organizationName,
      width: 380,
      dataIndex: 'orgName',
      key: 'orgName',
    },
    {
      title: I18N.carbonAccount.numberOfUsers,
      width: 560,
      dataIndex: 'userNumbers',
      key: 'userNumbers',
    },
    {
      title: I18N.carbonFootprint.operation,
      width: 260,
      dataIndex: 'opra',
      key: 'opra',
      render(_, record) {
        return (
          <>
            {checkPermissions(
              record.level !== 3 && (
                <Button
                  type='link'
                  style={{ paddingLeft: 0 }}
                  onClick={() => {
                    const { id, level, userNumbers } = record;
                    if (userNumbers > 0 && !record.children?.length)
                      Modal.confirm({
                        title: I18N.carbonAccount.takeCare,
                        content: I18N.carbonAccount.currentGroupStorage,
                        onOk() {
                          setVisible({ pid: id, level });
                        },
                      });
                    else setVisible({ pid: id, level });
                  }}
                >
                  {I18N.carbonAccount.addSubordinates}
                </Button>
              ),
              'carbonAccount:org:add',
            )}
            {checkPermissions(
              <Button
                type='link'
                style={{ paddingLeft: 0 }}
                onClick={() => {
                  const { id, orgName, pid, orderNum } = record;
                  modalForm.setFieldsValue({ orgName, orderNum });
                  setVisible({ pid, id });
                }}
              >
                {I18N.carbonFootprint.edit}
              </Button>,
              'carbonAccount:org:edit',
            )}

            {checkPermissions(
              record.pid === 0 ? (
                ''
              ) : (
                <Popconfirm
                  title={I18N.carbonAccount.confirmDeletionOfThis}
                  onConfirm={() => {
                    ApiOrgDelete({ id: record.id }).then(res => {
                      if (res.data.code === 200) {
                        Toast('success', I18N.carbonFootprint.deleteSuccessful);
                        getOrgListData();
                      }
                    });
                  }}
                  okText={I18N.carbonNeutral.yes}
                  cancelText={I18N.carbonNeutral.no}
                >
                  <Button type='link' danger>
                    {I18N.carbonFootprint.delete}
                  </Button>
                </Popconfirm>
              ),
              'carbonAccount:org:delete',
            )}
          </>
        );
      },
    },
  ];
  const modalTitle = () => {
    const isEdit = visible?.id;
    if (isEdit) return I18N.carbonAccount.editGrouping;

    return (
      I18N.carbonFootprint.newAddition +
      (visible?.level === 1
        ? I18N.ModelManagement.secondLevel
        : visible?.level === 2
        ? I18N.ModelManagement.level3
        : '') +
      I18N.dashborad.grouping
    );
  };
  const [expandedKeys, setExpandedKeys] = useState<number[]>([]);
  return (
    <div className='org-setting'>
      {/* 取消多个顶级节点 */}
      {!(Number(tableData?.length) > 0) &&
        checkPermissions(
          <div className='flex'>
            <Button
              type='primary'
              onClick={() => {
                setVisible({});
              }}
            >
              {I18N.carbonFootprint.newAddition}
            </Button>
          </div>,
          'carbonAccount:org:add',
        )}
      <Table
        rowKey='id'
        loading={loading}
        dataSource={tableData}
        columns={columns}
        expandable={{
          expandedRowKeys: expandedKeys,
          // eslint-disable-next-line react/no-unstable-nested-components
          expandIcon: props =>
            props.record.children?.length ? (
              <IconFont
                style={{ marginRight: 13 }}
                onClick={() => {
                  const { id } = props.record;
                  setExpandedKeys(s =>
                    s.includes(id) ? xor(s, [id]) : s.concat([id]),
                  );
                }}
                type={
                  props.expanded
                    ? 'icon-icon-jiantouzhankai'
                    : 'icon-icon-shouqi'
                }
              />
            ) : (
              <span style={{ marginRight: 26 }} />
            ),
        }}
      />
      <Modal
        title={modalTitle()}
        width={420}
        open={!!visible}
        onOk={() => {
          modalForm.validateFields().then(data => {
            const id = visible?.id;
            const api = id ? ApiOrgEdit : ApiOrgAdd;
            const { orgName, orderNum } = data;
            const pid = visible?.pid || 0;
            // @ts-ignore
            api({ orgName, pid, id, orderNum }).then(res => {
              if (res.data.code === 200) {
                Toast('success', I18N.carbonFootprint.operationSuccessful);
                setVisible(undefined);
                modalForm.resetFields();
                getOrgListData();
              }
            });
          });
        }}
        onCancel={() => {
          setVisible(undefined);
          modalForm.resetFields();
        }}
      >
        <Form form={modalForm} labelCol={{ span: 6 }}>
          <Form.Item
            label={I18N.carbonFootprint3.organizationName}
            name='orgName'
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={I18N.carbonFootprint3.sort}
            name='orderNum'
            rules={[
              { required: true },
              {
                validator: (_, value, callback) => {
                  callback(
                    !isNil(value) && value < 0
                      ? I18N.enterpriseCarbonAccount2
                          .pleaseEnterAValueGreaterThan
                      : undefined,
                  );
                },
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              controls={false}
              precision={0}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default OrgSetting;
