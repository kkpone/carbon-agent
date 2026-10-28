import moment from 'moment';
import I18N from '@src/lang/I18N';
import '@views/carbonDataManagemen/detail/style.less';
import { RightOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
// import ComstomCascaderOption from '@views/carbonDataManagemen/component/ComstonCascaderOption/index';
import IconFont from '@components/iconfont';
import Breadcrumb from '@src/components/Breadcrumb';
import { Toast } from '@src/utils/Toast';
import { COMPANY_ID } from '@src/utils/consts';
import Assistant from '@views/carbonDataManagemen/component/Assistant/index';
import {
  ComstomInputNumber,
  ComstomInput,
} from '@views/carbonDataManagemen/component/Basic';
import DepartMentOption, {
  DataType,
} from '@views/carbonDataManagemen/component/DeparementOption';
import ReturnFrom, {
  ListArrType,
} from '@views/carbonDataManagemen/component/returnFrom';
import { apiQueryByPageType } from '@views/dashborad/department/service';
import { apiQueryByPageType as apiQueryByPageUser } from '@views/dashborad/orgstaff/service';
import { Form, Button, Row, Space, Modal, Tag, Radio } from 'antd';
import { FC, useEffect, useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import {
  // APiQueryDepartmentTree,
  ApiTargetInfo,
  ApiTargetEdit,
  ApiTargetAdd,
  ApiExecutelist,
  ApiGetUserCompanyByDeptId,
  UserObjType,
  ApiExecuteAdd,
  ApiExecuteEdit,
  APiQueryDepartmentTree,
} from '../service';

// import { ApiTargetInfo } from '../service';
export const exStatusObj = {
  0: I18N.carbonDataManagemen.toBeConfirmed,
  1: I18N.components.inProgress,
  2: I18N.carbonDataManagemen.rejected,
  3: I18N.carbonDataManagemen.archived,
  4: I18N.carbonDataManagemen.reviewed,
};
export const exStatusObjColor = {
  0: 'cyan',
  1: 'orange',
  2: 'red',
  3: 'blue',
};
export const sublevelArr = [
  {
    label: I18N.carbonDataManagemen.year,
    value: '1',
  },
  {
    label: I18N.carbonDataManagemen.quarter,
    value: '2',
    children: [
      {
        label: I18N.carbonDataManagemen.q1,
        value: '2-1',
      },
      {
        label: I18N.carbonDataManagemen.q2,
        value: '2-2',
      },
      {
        label: I18N.carbonDataManagemen.thirdQuarter,
        value: '2-3',
      },
      {
        label: I18N.carbonDataManagemen.fourthQuarter,
        value: '2-4',
      },
    ],
  },
  {
    label: I18N.carbonDataManagemen.monthly,
    value: '3',
    children: [
      {
        label: I18N.carbonDataManagemen.january,
        value: '3-1',
      },
      {
        label: I18N.carbonDataManagemen.february,
        value: '3-2',
      },
      {
        label: I18N.carbonDataManagemen.march,
        value: '3-3',
      },
      {
        label: I18N.carbonDataManagemen.april,
        value: '3-4',
      },
      {
        label: I18N.carbonDataManagemen.may,
        value: '3-5',
      },
      {
        label: I18N.carbonDataManagemen.june,
        value: '3-6',
      },
      {
        label: I18N.carbonDataManagemen.july,
        value: '3-7',
      },
      {
        label: I18N.carbonDataManagemen.august,
        value: '3-8',
      },
      {
        label: I18N.carbonDataManagemen.september,
        value: '3-9',
      },
      {
        label: I18N.carbonDataManagemen.october,
        value: '3-10',
      },
      {
        label: I18N.carbonDataManagemen.november,
        value: '3-11',
      },
      {
        label: I18N.carbonDataManagemen.december,
        value: '3-12',
      },
    ],
  },
];
const AddActivity: FC = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  // const [fromData, changeFromData] = useState({});
  // 是否展示弹窗助手
  const [isShowAssistant, changeIsShowAssistant] = useState(false);
  // 控制添加负责人弹窗
  const [isModalVisible, changeIsisModalVisible] = useState(false);
  // 表格数据
  const [tableData, changeTableData] = useState<
    {
      key: string | null;
      userName: string | null;
      exStatus: string | null;
      allotDischarge: number | string | null;
      userId?: string;
      isEdit?: boolean;
    }[]
  >([]);
  const [formData, changeFormData] = useState<{ [key: string]: any }>({});
  // 组织部门数据
  const [departmentData, getDepartmentData] = useState<DataType[]>([]);
  // 部门下的员工
  const [departUser, getDepartUser] = useState<UserObjType[]>([]);
  // 存储添加执行关系 数据
  const [executeAddData, getExecuteAddData] = useState<Partial<UserObjType>>(
    {},
  );
  const [isChoose, changeIsChoose] = useState(false);
  const [executeAddIndex, getExecuteAddIndex] = useState(0);
  const [deptId, getDeptId] = useState('');
  const isCulDisabled = () =>
    ['show'].some(item => history.location.pathname.indexOf(item) >= 0);
  // 获取 详情
  const ApiTargetInfoFn = async () => {
    const targetId =
      new URLSearchParams(window.location.search).get('targetId') || '';
    await ApiTargetInfo(targetId).then(({ data }) => {
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        ...data.data,
        sublevel: Number(data.data.sublevel)
          ? [
              `${data.data.subtype}`,
              `${data.data.subtype}-${data.data.sublevel}`,
            ]
          : [`${data.data.subtype}`],
      });
      changeFormData({
        ...data.data,
        sublevel: Number(data.data.sublevel)
          ? [
              `${data.data.subtype}`,
              `${data.data.subtype}-${data.data.sublevel}`,
            ]
          : [`${data.data.subtype}`],
      });
    });
  };
  // 获取分配关系表
  const ApiExecutelistFn = () => {
    ApiExecutelist({
      pageNum: '1',
      pageSize: '5000',
      targetId:
        new URLSearchParams(window.location.search).get('targetId') || '',
    }).then(({ data }) => {
      if (data.code === 200) {
        if (data.rows.length > 0) {
          changeTableData([...data.rows]);
        } else if (history.location.pathname.indexOf('show') === -1) {
          changeTableData([
            {
              userName: '',
              exStatus: '',
              key: '',
              allotDischarge: '',
              isEdit: true,
            },
          ]);
        }
      }
    });
  };
  useEffect(() => {
    ApiExecutelistFn();
  }, []);
  // 获取组织部门数据
  const apiDepartmentPageTypeFn = async () => {
    const { data } = await apiQueryByPageType({
      companyId: Number(localStorage.getItem(COMPANY_ID))
        ? Number(localStorage.getItem(COMPANY_ID))
        : 0,
    });
    if (data.code === 200) {
      // @ts-ignore
      getDepartmentData(data.data);
    }
  };
  useEffect(() => {
    apiDepartmentPageTypeFn();

    if (
      ['edit', 'show'].some(
        item => history.location.pathname.indexOf(item) >= 0,
      )
    ) {
      ApiTargetInfoFn();
    }
    // 新增 添加默认参数
    if (
      history.location.pathname.indexOf(
        '/carbonDataManagemen/goalSetting/add',
      ) >= 0
    ) {
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        validity: moment().format('YYYY'),
      });
    }
    return () => {};
  }, []);
  const getOptionYear = () => {
    const yearArr: { label: string; value: string }[] = [];
    for (let i = 2000; i <= 2060; i++) {
      yearArr.push({ label: `${i}`, value: `${i}` });
    }
    return yearArr;
  };
  // const SetArr: ListArrType[] = ;
  const memoizedValue: ListArrType[] = useMemo(
    () => [
      {
        label: I18N.carbonDataManagemen.targetName,
        name: 'targetName',
        className: 'a1',
        rules: isCulDisabled()
          ? []
          : [
              {
                required: true,
                message: I18N.carbonDataManagemen.targetNameNotAvailable,
              },
            ],
        basetype: 'Input',
        baseitem: {
          placeholder: !false ? I18N.carbonFootprint.pleaseEnter : '',
          disabled: isCulDisabled(),
          style: { width: '60%' },
          value: form.getFieldValue('targetName'),
          maxLength: 50,
          onChange: e => {
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              targetName: `${e.target.value}`.trim(),
            });
            changeFormData({
              ...formData,
              targetName: `${e.target.value}`.trim(),
            });
          },
        },
      },
      {
        label: I18N.carbonDataManagemen.contentDescription,
        name: 'flag',
        className: 'a1',
        rules: [],
        basetype: 'TextArea',
        style: { width: '100%' },
        baseitem: {
          disabled: isCulDisabled(),
          placeholder: isCulDisabled() ? '' : I18N.carbonFootprint.pleaseEnter,
          value: form.getFieldValue('flag'),
          maxLength: 500,
          onChange: e => {
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              flag: e.target.value,
            });
            changeFormData({
              ...formData,
              flag: e.target.value,
            });
          },
        },
      },
      {
        label: I18N.carbonDataManagemen.targetValue,
        name: 'discharge',
        className: 'a1',
        rules: isCulDisabled()
          ? []
          : [
              {
                required: true,
                message: I18N.carbonDataManagemen.targetValueNotAvailable,
              },
              {
                pattern: /^\d+(\.\d{0,4})?$/,
                message: I18N.carbonNeutral.inputPositiveDefiniteNumber,
              },
            ],
        basetype: 'InputNumber',
        style: { width: '50%', float: 'left' },
        baseitem: {
          disabled: isCulDisabled(),
          placeholder: !false ? I18N.carbonFootprint.pleaseEnter : '',
          addonAfter: 'tCO₂e',
          style: { width: '100%' },
          min: 0,
          max: 999999999,
          value: form.getFieldValue('discharge'),
          onChange: e => {
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              discharge: e,
            });
            changeFormData({
              ...formData,
              discharge: e,
            });
            form.validateFields();
          },
        },
      },
      {
        label: I18N.carbonDataManagemen.targetValidityPeriod,
        name: 'validity',
        className: 'a1',
        rules: isCulDisabled()
          ? []
          : [
              {
                required: true,
                message: I18N.carbonDataManagemen.targetValidityPeriod2,
              },
            ],
        basetype: 'Select',
        style: { width: '50%', paddingLeft: '30px' },
        baseitem: {
          disabled: isCulDisabled(),
          placeholder: !false ? I18N.carbonFootprint.pleaseSelect : '',
          value: form.getFieldValue('validity'),
          style: { width: '100%' },
          options: [...getOptionYear()],
          onChange: e => {
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              validity: e,
            });
            changeFormData({
              ...formData,
              validity: e,
            });
          },
        },
      },
      {
        label: I18N.carbonDataManagemen.targetTimeClass2,
        name: 'sublevel',
        className: 'a1',
        rules: isCulDisabled()
          ? []
          : [
              {
                required: true,
                message: I18N.carbonDataManagemen.targetTimeClass,
              },
              {
                validator: (rule, value, callback) => {
                  if (`${value}` === '2' || `${value}` === '3') {
                    callback(I18N.carbonDataManagemen.pleaseSelectASubset);
                  } else {
                    callback();
                  }
                },
              },
            ],
        basetype: 'Cascader',
        style: { width: '50%' },

        baseitem: {
          disabled: isCulDisabled(),
          placeholder: !false ? I18N.carbonFootprint.pleaseSelect : '',
          options: sublevelArr,
          style: { width: '100%' },

          dropdownClassName: 'costomCascader',
          dropdownMatchSelectWidth: true,
          value: form.getFieldValue('sublevel'),
          onChange: e => {
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              sublevel: e,
            });
            changeFormData({
              ...form.getFieldsValue(true),
              sublevel: e,
            });
          },
        },
      },
      {
        label: I18N.carbonDataManagemen.riskManagement,
        name: '',
        className: 'a1',
        basetype: 'InputNumber',
        baseitem: {},
        style: { fontSize: '16px' },
        childrenArr: [
          {
            label: I18N.carbonDataManagemen.upperThresholdLimit,
            name: 'thresholdUp',
            basetype: 'InputNumber',
            style: { width: '50%', float: 'left' },
            rules: [
              {
                pattern: /^\d+(\.\d{0,2})?$/,
                message: I18N.carbonNeutral.inputPositiveDefiniteNumber,
              },
            ],
            baseitem: {
              disabled: isCulDisabled(),

              min: 0,
              max: 9999,
              style: { width: '100%' },
              placeholder: !false ? I18N.carbonFootprint.pleaseEnter : '',
              onChange: e => {
                form.setFieldsValue({
                  ...form.getFieldsValue(true),
                  thresholdUpValue: e,
                });
                changeFormData({
                  ...form.getFieldsValue(true),
                  thresholdUpValue: e,
                });
              },
            },
          },
          {
            label: I18N.carbonDataManagemen.lowerThreshold,
            name: 'thresholdDown',
            basetype: 'InputNumber',
            style: { width: '50%', paddingLeft: '30px' },
            rules: [
              {
                pattern: /^\d+(\.\d{0,2})?$/,
                message: I18N.carbonNeutral.inputPositiveDefiniteNumber,
              },
            ],
            baseitem: {
              min: 0,
              max: 100,
              style: { width: '100%' },
              disabled: isCulDisabled(),
              placeholder: !false ? I18N.carbonFootprint.pleaseEnter : '',
              onChange: e => {
                form.setFieldsValue({
                  ...form.getFieldsValue(true),
                  thresholdDownValue: e,
                });
                changeFormData({
                  ...form.getFieldsValue(true),
                  thresholdDownValue: e,
                });
              },
            },
          },
        ],
      },
    ],
    [formData, form.getFieldsValue(true)],
  );
  const AllocationArr: ListArrType[] = useMemo(
    () => [
      {
        label: I18N.carbonDataManagemen.targetName,
        name: 'targetName',
        className: 'a1',
        rules: [],
        basetype: 'Input',
        baseitem: {
          disabled: true,
          value: form.getFieldValue('targetName'),
          placeholder: '',
          style: { width: '50%' },
          maxLength: 50,
        },
      },
      {
        label: I18N.carbonDataManagemen.contentDescription,
        name: 'flag',
        className: 'a1',
        rules: [],
        basetype: 'TextArea',
        baseitem: {
          disabled: true,
          value: form.getFieldValue('flag'),
          placeholder: '',
          style: { width: '50%' },
          maxLength: 500,
        },
      },
      {
        label: (
          <Row justify='space-between' align='middle'>
            <span> {I18N.carbonDataManagemen.taskAllocation}</span>
          </Row>
        ),
        name: 'itemPrice',
        rules: [],
        basetype: 'Table',
        className: 'fromTable',
        baseitem: {
          style: { width: '100%' },
          columns: [
            {
              title: I18N.carbonFootprint.number,
              dataIndex: 'name',
              key: 'name',
              render: (text, record, index: number) => index + 1,
            },
            {
              title: I18N.carbonDataManagemen.responsiblePerson,
              dataIndex: 'userName',
              key: 'userName',
              render: (text: string, record, index: number) =>
                text ? (
                  record.isEdit !== true ? (
                    text
                  ) : (
                    <Button
                      type='link'
                      onClick={async () => {
                        changeIsisModalVisible(true);
                        getExecuteAddIndex(index);
                        getDepartUser([]);
                        await apiDepartmentPageTypeFn();
                        //
                        changeIsChoose(false);
                      }}
                      style={{ padding: '0' }}
                    >
                      {text || I18N.carbonFootprint.add}
                    </Button>
                  )
                ) : (
                  <Button
                    type='link'
                    onClick={async () => {
                      changeIsisModalVisible(true);
                      getExecuteAddIndex(index);
                      getDepartUser([]);
                      await apiDepartmentPageTypeFn();
                      changeIsChoose(false);
                    }}
                    style={{ padding: '0' }}
                  >
                    {I18N.carbonFootprint.add}
                  </Button>
                ),
            },
            {
              title: I18N.carbonDataManagemen.allocationAmountTC,
              dataIndex: 'allotDischarge',
              key: 'allotDischarge',
              render: (text: string, record, index: number) =>
                record.isEdit ? (
                  <ComstomInputNumber
                    value={text}
                    placeholder={I18N.carbonFootprint.pleaseEnter}
                    onChange={e => {
                      if (!/^\d+(\.\d{0,4})?$/.test(`${e}`) && e) {
                        Toast('error', I18N.carbonNeutral.dataFormatError);
                        return;
                      }
                      tableData[index].allotDischarge = e;
                      changeTableData([...tableData]);
                    }}
                    style={{ width: '100%' }}
                    min={0}
                    max={99999999}
                  />
                ) : (
                  text
                ),
            },
            {
              title: I18N.carbonDataManagemen.targetStatus,
              dataIndex: 'exStatus',
              key: 'exStatus',
              width: '200px',
              render: (text: number) => (
                <Tag className='customTag' color={exStatusObjColor[text]}>
                  {exStatusObj[text] || '-'}
                </Tag>
              ),
            },
            history.location.pathname.indexOf('show') === -1
              ? {
                  title: I18N.carbonFootprint.operation,
                  dataIndex: 'do',
                  key: 'do',
                  render: (text: string, record, index: number) => (
                    <Space>
                      {Number(record.exStatus) === 0 &&
                        record.isEdit !== true &&
                        history.location.pathname.indexOf('show') === -1 && (
                          <Button
                            type='link'
                            onClick={() => {
                              tableData[index].isEdit = true;
                              changeTableData([...tableData]);
                              getExecuteAddData({
                                ...record,
                              });
                              getDeptId(record.deptId);
                            }}
                          >
                            {I18N.carbonFootprint.edit}
                          </Button>
                        )}
                      {record.isEdit === true && (
                        <Button
                          type='link'
                          style={{ color: '#0CBF9F' }}
                          // eslint-disable-next-line consistent-return
                          onClick={async () => {
                            if (!executeAddData.userId)
                              return Toast(
                                'error',
                                I18N.carbonDataManagemen
                                  .thePersonInChargeCannot2,
                              );
                            if (!record.allotDischarge)
                              return Toast(
                                'error',
                                I18N.carbonDataManagemen
                                  .allocationAmountCannotBeAllocated,
                              );
                            const targetId =
                              new URLSearchParams(window.location.search).get(
                                'targetId',
                              ) || '';
                            const excuteObj = {
                              targetId,
                              userId: executeAddData.userId || '',
                              deptId,
                              allotDischarge: record.allotDischarge,
                            };
                            if (record.executeId) {
                              await ApiExecuteEdit({
                                ...excuteObj,
                                executeId: record.executeId,
                              }).then(({ data }) => {
                                if (data.code === 200) {
                                  tableData[index].isEdit = false;
                                  changeTableData([...tableData]);
                                  // 请求分配列表
                                  ApiExecutelistFn();
                                }
                              });
                              // eslint-disable-next-line consistent-return
                              return;
                            }
                            await ApiExecuteAdd({
                              ...excuteObj,
                            }).then(({ data }) => {
                              if (data.code === 200) {
                                tableData[index].isEdit = false;
                                changeTableData([...tableData]);
                                // 请求分配列表
                                ApiExecutelistFn();
                                getExecuteAddData({});
                              }
                            });
                          }}
                        >
                          {I18N.DomesticVersion.complete}
                        </Button>
                      )}
                      {exStatusObj[record.exStatus] ? (
                        ''
                      ) : tableData.length === 1 ? (
                        ''
                      ) : (
                        <Button
                          type='link'
                          style={{ color: '#ED5555' }}
                          onClick={() => {
                            tableData.splice(index, 1);
                            changeTableData([...tableData]);
                            getExecuteAddData({});
                          }}
                        >
                          {I18N.carbonFootprint.delete}
                        </Button>
                      )}
                    </Space>
                  ),
                }
              : {},
          ],
          dataSource: tableData,
          pagination: false,
        },
        children: history.location.pathname.indexOf('show') === -1 && (
          <div
            className='add-linkman'
            style={{ marginBottom: '30px' }}
            // eslint-disable-next-line consistent-return
            onClick={() => {
              if (tableData.some(item => item.isEdit === true))
                return Toast('error', I18N.carbonDataManagemen.dataFilledOut);
              if (tableData.length >= 50)
                return Toast('error', I18N.carbonDataManagemen.canAddAtMost);
              tableData.push({
                userName: '',
                exStatus: '',
                key: '',
                allotDischarge: '',
                isEdit: true,
              });
              changeTableData([...tableData]);
            }}
          >
            <Button
              type='link'
              disabled={tableData.some(item => item.isEdit === true)}
              icon={<PlusOutlined />}
            >
              {I18N.carbonFootprint.newAddition}
            </Button>
          </div>
        ),
      },
    ],
    [tableData, formData],
  );
  // 判断当前路由是否是目标设定
  const isAllocation = () =>
    history.location.pathname.indexOf('Allocation') >= 0;
  const returnFromFn = useMemo(
    () => (
      <ReturnFrom
        form={form}
        style={{ width: isAllocation() ? '100%' : '830px', margin: '0 auto' }}
        listArr={isAllocation() ? [...AllocationArr] : [...memoizedValue]}
      />
    ),
    [formData, tableData],
  );
  // 获取 部门下员工
  const ApiGetUserCompanyByDeptIdFn = async departmentId => {
    await ApiGetUserCompanyByDeptId(departmentId).then(({ data }) => {
      if (data.code === 200) {
        getDepartUser([...data.data]);
        getDeptId(departmentId);
      }
    });
  };
  return (
    <>
      <section style={{ marginBottom: '10px' }}>
        <Breadcrumb />
      </section>
      <div className='golalDetail' style={{ marginBottom: '60px', padding: 0 }}>
        <div className='computation_left' style={{ padding: '20px' }}>
          {!isAllocation() &&
            history.location.pathname.indexOf('show') === -1 && (
              <Row
                justify='end'
                align='middle'
                style={{ position: 'relative' }}
              >
                <Button
                  type='link'
                  onClick={() => {
                    changeIsShowAssistant(!isShowAssistant);
                  }}
                  style={{ color: isShowAssistant ? '#0CBF9F' : '#343A40' }}
                >
                  <IconFont
                    type='icon-icon-chenxiechushou'
                    style={{
                      marginRight: '10px',
                      color: isShowAssistant ? '#0CBF9F' : '#343A40',
                    }}
                  />
                  {I18N.ModelManagement.fillInAssistant}
                </Button>
                <Assistant
                  style={{
                    position: 'absolute',
                    top: '40px',
                    display: isShowAssistant ? 'block' : 'none',
                  }}
                  listArr={[
                    {
                      title: I18N.carbonDataManagemen.targetName,
                      content: I18N.carbonDataManagemen.usuallyUsedFor,
                    },
                    {
                      title: I18N.carbonDataManagemen.contentDescription,
                      content: I18N.carbonDataManagemen.detailedDescription,
                    },
                    {
                      title: I18N.carbonDataManagemen.targetValue,
                      content:
                        I18N.carbonDataManagemen.fillInTheCurrentPeriodsItems,
                    },
                    {
                      title: I18N.carbonDataManagemen.targetValidityPeriod,
                      content: I18N.carbonDataManagemen.currentlySupported,
                    },
                  ]}
                />
              </Row>
            )}
          {returnFromFn}

          <div className='bottom-box' style={{ justifyContent: 'center' }}>
            <Button
              onClick={() => {
                if (history.location.pathname.indexOf('editAllocation') >= 0) {
                  const culNumber = tableData.reduce(
                    (prev, curr) => Number(prev) + Number(curr.allotDischarge),
                    0,
                  );
                  if (Number(culNumber) !== Number(formData.discharge)) {
                    Modal.confirm({
                      title: I18N.carbonFootprint.prompt,
                      content: I18N.carbonDataManagemen.detectedYour,
                      okText: I18N.carbonFootprint.confirm,
                      cancelText: I18N.carbonFootprint.cancel,
                      closable: true,
                      onOk: () => {
                        history.go(-1);
                      },
                    });
                  } else {
                    history.go(-1);
                  }
                  return;
                }
                history.go(-1);
              }}
            >
              {/* {history.location.pathname.indexOf('show') >= 0 ? '返回' : '取消'} */}
              {['editAllocation', 'show'].some(
                item => history.location.pathname.indexOf(item) >= 0,
              )
                ? I18N.carbonFootprint.return
                : I18N.carbonFootprint.cancel}
            </Button>
            {!(history.location.pathname.indexOf('Allocation') >= 0) &&
              !isCulDisabled() && (
                <Button
                  type='primary'
                  onClick={async () => {
                    await form.validateFields().then(async value => {
                      const valueObj = {
                        ...value,
                        sublevel: value.sublevel[1]
                          ? `${value.sublevel[1]}`.split('-')[1]
                          : `0`,
                        subtype: `${value.sublevel[0]}`,
                      };
                      if (
                        ['edit', 'show'].some(
                          item => history.location.pathname.indexOf(item) >= 0,
                        )
                      ) {
                        await ApiTargetEdit({
                          ...valueObj,
                          targetId:
                            new URLSearchParams(window.location.search).get(
                              'targetId',
                            ) || '',
                        }).then(({ data }) => {
                          if (data.code === 200) {
                            history.go(-1);
                          }
                        });
                        return;
                      }
                      // 新增目标
                      await ApiTargetAdd({
                        ...valueObj,
                      }).then(({ data }) => {
                        if (data.code === 200) {
                          history.go(-1);
                        }
                      });
                    });
                  }}
                >
                  {I18N.components.submit}
                </Button>
              )}
          </div>
        </div>
        {isModalVisible && (
          <Modal
            title={I18N.carbonDataManagemen.addResponsiblePerson}
            open={isModalVisible}
            width={720}
            // eslint-disable-next-line consistent-return
            onOk={() => {
              if (!isChoose)
                return Toast(
                  'error',
                  I18N.carbonDataManagemen.pleaseSelectResponsible,
                );
              if (!executeAddData.userId) {
                Toast(
                  'error',
                  I18N.carbonDataManagemen.pleaseSelectResponsible,
                );
                // eslint-disable-next-line consistent-return
                return;
              }
              if (
                tableData.some(item => item.userId === executeAddData.userId)
              ) {
                Toast(
                  'error',
                  I18N.carbonDataManagemen.thePersonInChargeCannot,
                );
                // eslint-disable-next-line consistent-return
                return;
              }
              changeIsisModalVisible(false);
              tableData[executeAddIndex].userName =
                executeAddData.employName || '';
              changeTableData([...tableData]);
            }}
            onCancel={() => {
              changeIsisModalVisible(false);
            }}
          >
            <div className='addheader'>
              <div className='addhader_left'>
                <ComstomInput
                  className='comstonSearchInput'
                  addonAfter={<SearchOutlined />}
                  placeholder={I18N.carbonDataManagemen.searchDepartmentStaff}
                  onChange={async e => {
                    if (e.target.value) {
                      await APiQueryDepartmentTree({
                        name: e.target.value,
                      }).then(({ data }) => {
                        if (data.code === 200) {
                          getDepartmentData(data.data);
                        }
                      });
                      await apiQueryByPageUser({
                        employName: e.target.value,
                        page: 1,
                        size: 5000,
                      }).then(({ data }) => {
                        if (data.code === 200) {
                          // @ts-ignore
                          getDepartUser(data.data.rows);
                        }
                      });
                      return;
                    }
                    await apiDepartmentPageTypeFn();
                  }}
                />
                <p>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{I18N.carbonDataManagemen.responsiblePerson}</label>
                  <RightOutlined
                    style={{ marginLeft: '9px', marginRight: '9px' }}
                  />
                  <span>
                    {I18N.carbonDataManagemen.organizationalStructure}
                  </span>
                </p>
                <div>
                  {isModalVisible && (
                    <DepartMentOption
                      data={departmentData}
                      isModalVisible={isModalVisible}
                      ApiGetUserCompanyByDeptIdFn={ApiGetUserCompanyByDeptIdFn}
                    />
                  )}
                </div>
              </div>
              <div className='addhader_right'>
                <h2>
                  {I18N.carbonDataManagemen.selected}
                  {isChoose ? '1' : 0}
                  {I18N.greenMeeting.people}
                </h2>
                {departUser.length === 0 && (
                  <IconFont
                    type='icon-icon-zanmoneiyong'
                    style={{
                      fontSize: '300px',
                      width: '300px',
                      height: '300px',
                      margin: '0 auto',
                    }}
                  />
                )}
                {departUser.length > 0 && (
                  <Radio.Group
                    onChange={e => {
                      getExecuteAddData({ ...e.target.value });
                      if (e.target.value.departmentId) {
                        getDeptId(e.target.value.departmentId);
                      }

                      changeIsChoose(true);
                    }}
                  >
                    <Space direction='vertical'>
                      {/* <Radio value={1}>Option A</Radio>
                      <Radio value={2}>Option B</Radio>
                      <Radio value={3}>Option C</Radio> */}
                      {departUser.map(item => (
                        <Radio value={item}>{item.employName}</Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                )}
              </div>
            </div>
          </Modal>
        )}{' '}
      </div>
    </>
  );
};

export default AddActivity;
