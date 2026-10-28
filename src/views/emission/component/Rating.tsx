/**
 * @file 因子审核状态
 */
import I18N from '@src/lang/I18N';
import { FC, useState, useEffect, useMemo } from 'react';
import { Modal, Form, Table, Input } from 'antd';
import ComStomFrom, {
  ListArrType,
} from '@views/carbonDataManagemen/component/returnFrom';
import { apiSassOperate } from '../organization/service';
// import { apiAuditOrder } from '@/views/base/service';
// import VerifyUtils, { PersonKeys } from '@/';

const Rating: FC = () => {
  const [isModalVisible, changeIsModalVisible] = useState(false);
  const [dataSource, getDataSource] = useState<
    { operateId?: string; opFlag?: string }[]
  >([]);
  const [fromData, getFromData] = useState({});
  const [examForm] = Form.useForm();
  // 审核 - 判断是否是排放因子详情 和排放因子审核
  // const culContent = () => {
  //   return (
  //     <Row justify='end'>
  //       <Button
  //         // className={style.examineBtn}
  //         type='primary'
  //         onClick={() => {
  //           changeIsModalVisible(true);
  //           initValue();
  //         }}
  //       >
  //         审核
  //       </Button>
  //     </Row>
  //   );
  // };
  const culModifyRecords = () => (
    <Form layout='vertical' style={{ marginTop: '20px' }}>
      <h2 style={{ fontSize: '16px' }}>{I18N.emission.explain}</h2>
      <Input.TextArea
        disabled
        style={{ background: '#fff', cursor: 'pointer' }}
        value={Number(dataSource.length) - 1 >= 0 ? dataSource[0]?.opFlag : ''}
        rows={10}
      />
    </Form>
  );
  const columns = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: 'name',
      width: 80,
      render: (t: string, _: any, index: number) => index + 1,
    },
    {
      title: I18N.carbonFootprint3.findingsOfAudit,
      dataIndex: 'status',
      render: (text: string) =>
        ({
          1: I18N.carbonFootprint3.approved,
          2: I18N.emission.reviewRejection,
        }[Number(text)] || '-'),
    },
    {
      title: I18N.emission.rewardType,
      dataIndex: 'awardType',
      render: (text: string) =>
        ({ 1: I18N.emission.cash, 2: I18N.emission.frequency }[Number(text)] ||
        '-'),
    },
    {
      title: I18N.emission.rewardQuantity,
      dataIndex: 'awardDouble',
      render: (text: string, record: { awardType: string; awardNum: string }) =>
        Number(record.awardType) === 1 ? text || '-' : record.awardNum || '-',
    },
    {
      title: I18N.carbonFootprint3.reviewer,
      dataIndex: 'opUserName',
      render: (text: string) => text || '-',
    },
    {
      title: I18N.carbonFootprint3.reviewTime,
      dataIndex: 'opTime',
      render: (text: string) => text || '-',
    },
  ];
  // 查询审核记录的方法
  const apiSassOperateFn = async () => {
    const factorId =
      new URLSearchParams(window.location.search).get('facId') || '';
    await apiSassOperate({ factorId }).then(({ data }) => {
      if (data.code === 200) {
        getDataSource([...data.data]);
      }
    });
  };
  const initValue = () => {
    const shared =
      new URLSearchParams(window.location.search).get('shared') || '';
    const type = new URLSearchParams(window.location.search).get('type') || '';
    examForm.setFieldsValue({
      shared:
        Number(shared) === 1
          ? I18N.emission.notPubliclyAvailable
          : I18N.emission.open,
      awardType: Number(type) === 2 ? 1 : 2, // Number(type) === 2 是小程序来的 默认是现金
      status: 1,
      awardNum: null,
      opFlag: null,
    });
    getFromData({
      shared:
        Number(shared) === 1
          ? I18N.emission.notPubliclyAvailable
          : I18N.emission.open,
      awardType: 1,
      status: 1,
      awardNum: null,
      opFlag: null,
    });
  };
  useEffect(() => {
    apiSassOperateFn();
    initValue();
  }, []);
  const returnArr: ListArrType[] = useMemo(
    () => [
      {
        label: I18N.carbonFootprint3.findingsOfAudit,
        name: 'status',
        className: 'a1',
        rules: [
          { required: true, message: I18N.emission.reviewResultNotApplicable },
        ],
        basetype: 'RadioGroup',
        baseitem: {
          style: { width: '100%' },
          options: [
            {
              label: I18N.carbonFootprint3.approved,
              value: 1,
            },
            {
              label: I18N.emission.reviewRejection,
              value: 2,
            },
          ],
        },
      },
      {
        label: I18N.emission.areYouWillingToGoPublic,
        name: 'shared',
        className: 'a1',
        basetype: 'Input',
        baseitem: {
          style: { width: '100%' },
          disabled: true,
        },
      },
      {
        label: I18N.emission.rewardType,
        name: 'awardType',
        className: 'a1',
        rules: [
          { required: true, message: I18N.emission.rewardTypeNotApplicable },
        ],
        basetype: 'RadioGroup',
        baseitem: {
          disabled: true,
          style: { width: '100%' },
          options: [
            {
              label: I18N.emission.cash,
              value: 1,
            },
            {
              label: I18N.emission.numberOfQueries,
              value: 2,
            },
          ],
          onChange: e => {
            getFromData({
              ...examForm.getFieldsValue(true),
              awardType: e.target.value,
            });
          },
        },
      },
      {
        label: I18N.emission.rewardAmount,
        name: 'awardNum',
        className: 'a1',
        rules: [
          { required: true, message: I18N.emission.productNameNotApplicable },
        ],
        basetype: 'InputNumber',
        baseitem: {
          style: { width: '100%' },
          placeholder: I18N.carbonFootprint.pleaseEnter,
          addonAfter:
            examForm.getFieldValue('awardType') === 1
              ? I18N.components.element
              : I18N.components.second,
          min: 0,
          max: 999,
        },
      },
      {
        label: I18N.emission.explain,
        name: 'opFlag',
        className: 'a1',
        rules: [
          { required: true, message: I18N.emission.productNameNotApplicable },
        ],
        basetype: 'TextArea',
        baseitem: {
          placeholder: I18N.carbonFootprint.pleaseEnter,
        },
      },
    ],
    [fromData, isModalVisible],
  );
  return (
    <div>
      {/* {culContent()} */}
      <Table
        dataSource={[...dataSource]}
        // @ts-ignore
        columns={columns}
        pagination={false}
        scroll={{ y: 600 }}
      />
      {culModifyRecords()}
      <Modal
        title={I18N.emission.evaluationFactorReview}
        open={isModalVisible}
        onOk={async () => {
          await examForm.validateFields().then(
            async () =>
              // const facId =
              // new URLSearchParams(window.location.search).get('id') || '';
              // await apiSassOperateAdd({
              //   // 审核接口
              //   ...value,
              //   facId,
              // }).then(async ({ data }) => {
              //   if (data.code === 200) {
              //     initValue();
              //     changeIsModalVisible(false);
              //     apiSassOperateFn();
              //     // await VerifyUtils.ToastText(data.code as PersonKeys, data.msg);
              //   }
              // });
              '',
          );
        }}
        onCancel={() => {
          changeIsModalVisible(false);
          examForm.resetFields();
        }}
      >
        <ComStomFrom
          form={examForm}
          // layout='horizontal'
          listArr={[...returnArr]}
        />
      </Modal>
    </div>
  );
};

export default Rating;
