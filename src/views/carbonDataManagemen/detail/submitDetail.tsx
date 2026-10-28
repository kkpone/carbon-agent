import { RightOutlined, DownOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Descriptions, Table, Button, Modal, Form } from 'antd';
import { FC, useState, useEffect, useMemo } from 'react';
import './style.less';
import { useHistory } from 'react-router-dom';
import Breadcrumb from '@src/components/Breadcrumb';

import ComstomFrom, { ListArrType } from '../component/returnFrom';
import {
  ApisubmissionData,
  SubmitDataObjType,
  ApioperatList,
  ApioperatListObjType,
  Apioperating,
} from '../service';

const SubmitDetail: FC = () => {
  const history = useHistory();

  const [SubmitData, getSubmitData] = useState<Partial<SubmitDataObjType>>({});
  const [tableData, getTableData] = useState<
    {
      key: string;
      scopeData: number;
      standbyData: number;
      letType: number;
    }[]
  >([
    {
      key: I18N.enterpriseCarbonAccount2.scopeOne,
      scopeData: 1,
      standbyData: 1,
      letType: 1,
    },
    {
      key: I18N.enterpriseCarbonAccount2.scope2,
      scopeData: 1,
      standbyData: 1,
      letType: 2,
    },
    {
      key: I18N.enterpriseCarbonAccount2.fanWeisan,
      scopeData: 1,
      standbyData: 1,
      letType: 3,
    },
  ]);
  const [form] = Form.useForm();
  const [saveFromData, changeSaveFromData] = useState({});
  // 存储审核记录 详情
  const [auditData, getAuditData] = useState<ApioperatListObjType[]>([]);
  const expandedRowRender = record => {
    const columns = [
      {
        title: I18N.carbonInternational.emissionSubcategories,
        dataIndex: 'emissionSource',
        key: 'emissionSource',
      },
      {
        title: I18N.carbonFootprint3.activityData,
        dataIndex: 'activity',
        key: 'activity',
        render: (text, record) => `${text}${record.activityUnit}`,
      },
      {
        title: I18N.enterpriseCarbonAccount2.emissionsTC2,
        dataIndex: 'discharge',
        key: 'discharge',
      },
      {
        title: I18N.carbonInternational.proportion,
        dataIndex: 'percentage',
        key: 'percentage',
        render: text => (text ? Number(text).toFixed(4) : 0),
      },
      //   { title: '附件', dataIndex: 'upgradeNum', key: 'upgradeNum' },
    ];
    return (
      <Table
        columns={columns}
        dataSource={record.recordList}
        pagination={false}
        rowKey='rowKey'
        style={{ marginLeft: '0px' }}
      />
    );
  };
  // 控制数据审核弹窗
  const [isShowauditData, changeIsauditData] = useState(false);
  // 获取 报送详情数据
  const ApisubmissionDataFn = async () => {
    await ApisubmissionData(
      new URLSearchParams(window.location.search).get('submissionId') || '',
    ).then(({ data }) => {
      getSubmitData({
        ...data.data,
      });
      const arr = tableData?.map((item, index) => {
        const dataArr = [];
        data.data.recordList.forEach((it, key) => {
          if (item.key === it.letType) {
            // @ts-ignore
            dataArr.push({ ...it, rowKey: `${index}-${key}` });
          }
        });
        return {
          ...item,
          // 排放量
          scopeData:
            index === 0
              ? data.data.scopeOne
              : index === 1
              ? data.data.scopeTwo
              : data.data.scopeThree || 0,
          // 占比
          standbyData:
            index === 0
              ? data.data.percentOne
                ? Number(data.data.percentOne).toFixed(4)
                : 0
              : index === 1
              ? data.data.percentTwo
                ? Number(data.data.percentTwo).toFixed(4)
                : 0
              : data.data.percentThree
              ? Number(data.data.percentThree).toFixed(4)
              : 0,
          letType: index + 1, // 作为查找子类别的数据,
          recordList: [...dataArr],
        };
      });
      // @ts-ignore
      getTableData([...arr]);
    });
  };
  // 获取审核记录
  const ApioperatListFn = async () => {
    await ApioperatList({
      submissionId:
        new URLSearchParams(window.location.search).get('submissionId') || '',
      pageNum: '1',
      pageSize: '5000',
    }).then(({ data }) => {
      getAuditData(data.rows);
    });
  };
  useEffect(() => {
    ApisubmissionDataFn();
    ApioperatListFn();
  }, []);
  const renderDescriptionArr = () =>
    [
      { label: I18N.carbonInternational.dataName, key: 'subName' },
      {
        label: I18N.enterpriseCarbonAccount2.totalEmissionsT2,
        key: 'discharge',
      },
      { label: I18N.carbonDataManagemen.reportedBy, key: 'userName' },
      { label: I18N.carbonDataManagemen.submissionTime, key: 'createTime' },
      { label: I18N.carbonInternational.period, key: 'circle' },
      { label: I18N.carbonDataManagemen.exactDate, key: 'beginTime' },
    ].map(item => (
      <Descriptions.Item label={item.label} key={item.label} span={2}>
        {item.key === 'beginTime'
          ? `${SubmitData[item.key]}~${SubmitData.endTime}`
          : SubmitData[item.key]}
      </Descriptions.Item>
    ));
  const returnFromArr: ListArrType[] = useMemo(
    () => [
      {
        label: I18N.carbonDataManagemen.reviewComments,
        name: 'subStatus',
        basetype: 'RadioGroup',
        style: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'baseline',
        },
        rules: [
          {
            required: true,
            message: I18N.carbonDataManagemen.reviewCommentsAreNotValid,
          },
        ],
        labelCol: { span: 4 },
        baseitem: {
          options: [
            {
              value: 1,
              label: I18N.carbonFootprint3.approved,
            },
            {
              value: 2,
              label: I18N.emission.reviewRejection,
            },
          ],
          onChange: e => {
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              subStatus: e.target.value,
            });
            changeSaveFromData({
              ...form.getFieldsValue(true),
              subStatus: e,
            });
            form.validateFields();
          },
        },
      },
      {
        label: I18N.Certification.auditDescription,
        name: 'flag',
        rules:
          form.getFieldValue('subStatus') === 2
            ? [
                {
                  required: true,
                  message: I18N.carbonDataManagemen.reviewCommentsAreNotValid,
                },
              ]
            : [],
        basetype: 'TextArea',
        baseitem: {
          placeholder: I18N.carbonFootprint.pleaseEnter,
          onChange: e => {
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              flag: e.target.value,
            });
            changeSaveFromData({
              ...form.getFieldsValue(true),
              flag: e,
            });
          },
        },
      },
    ],
    [saveFromData],
  );
  const returnFrom = useMemo(
    () => <ComstomFrom form={form} listArr={[...returnFromArr]} />,
    [saveFromData],
  );
  return (
    <>
      <section style={{ marginBottom: '10px' }}>
        <Breadcrumb />
      </section>
      <main className='submitDataDetail' style={{ marginBottom: '10px' }}>
        <Descriptions title={I18N.carbonFootprint.dataOverview} bordered>
          {renderDescriptionArr()}
        </Descriptions>
        <h5 className='detail_title'>{I18N.carbonproduct.detailedData}</h5>
        <Table
          className='components-table-demo-nested'
          columns={[
            {
              title: I18N.enterpriseCarbonAccount2.emissionCategories,
              dataIndex: 'key',
              key: 'key',
            },
            {
              title: I18N.enterpriseCarbonAccount2.emissionsTC2,
              dataIndex: 'scopeData',
              key: 'scopeData',
            },
            {
              title: I18N.carbonInternational.proportion,
              dataIndex: 'standbyData',
              key: 'standbyData',
              render: text => Number(text).toFixed(2),
            },
          ]}
          expandable={{
            expandedRowRender,
            // eslint-disable-next-line react/no-unstable-nested-components
            expandIcon: ({ expanded, onExpand, record }) =>
              expanded ? (
                <DownOutlined
                  onClick={e => onExpand(record, e)}
                  style={{ color: '#999EA4' }}
                />
              ) : (
                <RightOutlined
                  onClick={e => onExpand(record, e)}
                  style={{ color: '#999EA4' }}
                />
              ),
          }}
          dataSource={tableData}
          rowKey='key'
          // eslint-disable-next-line react/no-unstable-nested-components
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className='comstomTableSummary'>
                <Table.Summary.Cell index={0} colSpan={2}>
                  {I18N.carbonFootprint.total}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  {SubmitData.discharge}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>100%</Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
          pagination={false}
        />
      </main>
      <main className='submitDataDetail' style={{ marginBottom: '60' }}>
        <h3>{I18N.carbonFootprint3.auditRecords}</h3>
        <Table
          dataSource={auditData}
          columns={[
            {
              title: I18N.carbonFootprint.number,
              dataIndex: 'id',
              key: 'id',
              render: (text, record, index) => index + 1,
            },
            {
              title: I18N.carbonFootprint3.reviewTime,
              dataIndex: 'createTime',
              key: 'createTime',
            },
            {
              title: I18N.carbonFootprint3.findingsOfAudit,
              dataIndex: 'subStatus',
              key: 'subStatus',
              render: text =>
                Number(text) === 1
                  ? I18N.carbonFootprint3.approved
                  : I18N.emission.reviewRejection,
            },
            {
              title: I18N.carbonDataManagemen.reviewComments,
              dataIndex: 'flag',
              key: 'flag',
            },
            {
              title: I18N.carbonFootprint3.reviewer,
              dataIndex: 'userName',
              key: 'userName',
            },
            // { title: '备注', dataIndex: 'remark', key: 'remark' },
          ]}
        />
      </main>
      <div className='bottom-box' style={{ justifyContent: 'center' }}>
        <Button
          onClick={() => {
            history.go(-1);
          }}
        >
          {history.location.pathname.indexOf('show') >= 0
            ? I18N.carbonFootprint.return
            : I18N.carbonFootprint.cancel}
        </Button>
        {!(history.location.pathname.indexOf('show') >= 0) && (
          <Button
            type='primary'
            onClick={() => {
              changeIsauditData(true);
            }}
          >
            {I18N.carbonFootprint3.auditing}
          </Button>
        )}
      </div>
      <Modal
        title={I18N.notOrder.dataReview}
        open={isShowauditData}
        onOk={() => {
          form.validateFields().then(async value => {
            await Apioperating({
              ...value,
              submissionId:
                new URLSearchParams(window.location.search).get(
                  'submissionId',
                ) || '',
            }).then(({ data }) => {
              if (data.code === 200) {
                history.go(-1);
              }
            });
          });
        }}
        onCancel={() => {
          changeIsauditData(false);
        }}
      >
        {returnFrom}
      </Modal>
    </>
  );
};
export default SubmitDetail;
