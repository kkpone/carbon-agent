import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import useSyncCallback from '@utils/useSyncCallback';
import { Modal, Form, Button } from 'antd';
import monent from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import TargetAllow, { DataType } from './component/TargetAllow/inedx';
import { creatColumns } from './component/columns';
import ReturnFrom from './component/returnFrom';
import SearchContract from './component/search';
import SearchTableList from './component/tableList';
import {
  ApiExecuteEdit,
  ApiExecutelist,
  ApiTargetArchive,
  ApiTargetDelete,
  ApiTargetList,
  ApisubmissionList,
  ApiExecutelistEvaluate,
  ApiTargetArchiveQuery,
  Apistandard,
  ApiIndicatorList,
  ApiIndicatorAdd,
  ApiIndicatorDisAble,
  ApiOperateList,
  ApiSubRisk,
  ApiOperateDel,
} from './service';
import './style.less';
import { apiListALLByDictTypeData } from '../emission/Show/service';
import { Dicts } from '../emission/Show/type';

// RouteMaps.NoOnline;
export const AppContact: any = React.createContext({});
const GreenMeeting: FC = () => {
  const [form] = Form.useForm();
  const history = useHistory();
  const path = history.location.pathname;
  const [state, setState] = useState<{
    TablePage: { current: number; pageSize: number; total: number };
    pageName: string;
    addWord: string;
    tablList: [];
  }>({
    pageName:
      path === '/carbonDataManagemen/goalSetting'
        ? I18N.carbonDataManagemen.goalSetting
        : path === '/carbonDataManagemen/goalObjective'
        ? I18N.carbonDataManagemen.targetExecution
        : path === '/carbonDataManagemen/dataToSubmit'
        ? I18N.carbonDataManagemen.submitData
        : path === '/carbonDataManagemen/performanceManagement'
        ? I18N.carbonDataManagemen.performanceManagement
        : path === '/carbonDataManagemen/downLoadManagement'
        ? I18N.carbonFootprint.downloadManagement
        : path === '/carbonDataManagemen/enterPriceBasicData/baseYearSet'
        ? I18N.carbonDataManagemen.benchmarkYearSetting
        : path ===
          '/carbonDataManagemen/enterPriceBasicData/productionAndOperationIndex'
        ? I18N.carbonDataManagemen.productionAndOperationReferTo
        : path ===
          '/carbonDataManagemen/enterPriceBasicData/productionOperationData'
        ? I18N.carbonDataManagemen.productionOperations
        : '',
    addWord:
      path === '/carbonDataManagemen/goalSetting'
        ? I18N.carbonDataManagemen.setting
        : path ===
          '/carbonDataManagemen/enterPriceBasicData/productionAndOperationIndex'
        ? I18N.carbonDataManagemen.index
        : path === '/carbonDataManagemen/enterPriceBasicData/baseYearSet'
        ? I18N.enterpriseCarbonAccount2.baseYear
        : path ===
          '/carbonDataManagemen/enterPriceBasicData/productionOperationData'
        ? I18N.carbonDataManagemen.operations
        : '',
    TablePage: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    tablList: [],
  });
  // const [IndexPage, setIndexPage] = useState(1);
  const [showLoading, setshowLoading] = useState(true);
  // 控制新建建筑弹窗
  const [parmas, setParmas] = useState({
    pageNum: '1',
    pageSize: '10',
  });
  // 控制目标余量弹窗
  const [isVisable, changeIisVisable] = useState(false);
  // 存储 目标余量 数据
  const [targetAllowData, getTargetAllowData] = useState<Partial<DataType>>({});
  // 报送
  const [showImg, changeShowImg] = useState(false);
  // 获取城市列表
  const returnPromise = async () => {
    if (
      history.location.pathname.indexOf('carbonDataManagemen/goalObjective') >=
      0
    ) {
      return ApiExecutelist(parmas);
    }
    if (
      history.location.pathname.indexOf('carbonDataManagemen/dataToSubmit') >= 0
    ) {
      return ApisubmissionList(parmas);
    }
    if (
      history.location.pathname.indexOf(
        '/carbonDataManagemen/performanceManagement',
      ) >= 0
    ) {
      return ApiExecutelistEvaluate({
        ...parmas,
      });
    }
    // 基准年设定
    if (
      history.location.pathname.indexOf(
        '/carbonDataManagemen/enterPriceBasicData/baseYearSet',
      ) >= 0
    ) {
      return Apistandard({
        ...parmas,
      });
    }
    //  生产经营运营指标
    if (
      history.location.pathname.indexOf(
        '/carbonDataManagemen/enterPriceBasicData/productionAndOperationIndex',
      ) >= 0
    ) {
      return ApiIndicatorList({
        ...parmas,
        status: '0',
      });
    }

    // 生产经营数据
    if (
      history.location.pathname.indexOf(
        '/carbonDataManagemen/enterPriceBasicData/productionOperationData',
      ) >= 0
    ) {
      return ApiOperateList({
        ...parmas,
      });
    }

    return ApiTargetList(parmas);
  };
  // 控制生产运营指标弹窗
  const [isShowOptionIndex, changeIsShowOptionIndex] = useState(false);
  // 用于存储单位的数据
  const [unitData, changeUnitData] = useState<{
    unitLabel: null;
    unitType: string;
    unitValue: string;
    indicatorId?: string | number;
  }>({
    unitLabel: null,
    unitType: '',
    unitValue: '',
    indicatorId: -1,
  });
  // 控制 风险弹窗
  const [isVisableRisk, changeisVisableRisk] = useState(false);
  // 用于存储  风险数据
  const [riskData, getRiskData] = useState<{
    submissionId?: string;
    discharge: string;
    risk: string;
    thresholdDown: number;
    thresholdUp: number;
    thresholdDownValue: number;
    thresholdUpValue: number;
  }>({
    submissionId: '',
    discharge: '',
    risk: '',
    thresholdDown: 0,
    thresholdUp: 0,
    thresholdDownValue: 0,
    thresholdUpValue: 0,
  });
  const [isDataToSumbit, changeIsDataToSubmit] = useState(false);
  // 判断 是否是编辑
  const getlist = async () => {
    returnPromise().then(({ data }) => {
      setState({
        ...state,
        tablList: data.rows,
        TablePage: {
          ...state.TablePage,
          total: Number(data.total),
        },
      });
    });

    setshowLoading(false);
  };

  const syncCallbackFn = useSyncCallback(getlist);
  // 获取分母单位
  // 单位字典项
  const [cascaderOptions, getCascaderOptions] = useState<Dicts[]>([]);
  const apiListALLByDictTypeDataFn = async () =>
    apiListALLByDictTypeData({ dictType: 'factorUnitM' }).then(({ data }) => {
      getCascaderOptions(data?.data || []);
    });
  useEffect(() => {
    syncCallbackFn();
    apiListALLByDictTypeDataFn();
  }, []);

  const ShowInterger = record => {
    changeShowImg(true);
    getTargetAllowData(record);
  };
  // 归档
  const TargetArchive = async record => {
    await ApiTargetArchiveQuery(record.targetId).then(({ data }) => {
      if (data.code === 200) {
        if (Number(data.data) === 1) {
          Modal.confirm({
            title: I18N.carbonDataManagemen.systemPrompt,
            content: I18N.carbonDataManagemen.theTargetIsStoredBelow,
            okText: I18N.carbonDataManagemen.goForReview,
            cancelText: I18N.carbonFootprint.return,
            onOk() {
              history.push(`/carbonDataManagemen/dataToSubmit`);
            },
          });
        } else {
          Modal.confirm({
            title: I18N.carbonDataManagemen.file,
            // icon: <ExclamationCircleOutlined />,
            content: I18N.carbonDataManagemen.afterArchivingTheTarget,
            wrapClassName: 'cumstomModal_confirm',
            okText: I18N.carbonFootprint.confirm,
            cancelText: I18N.carbonFootprint.cancel,
            closable: true,
            onOk: async () => {
              await ApiTargetArchive(record.targetId).then(({ data }) => {
                if (data.code === 200) {
                  syncCallbackFn();
                }
              });
            },
          });
        }
      }
    });
  };
  // 删除接口
  const TargetDeleteFn = async record => {
    await ApiTargetDelete(record.targetId).then(({ data }) => {
      if (data.code === 200) {
        syncCallbackFn();
        Toast('success', data.msg);
      }
    });
  };
  // 查看目标余量
  const TargetAllowFn = record => {
    changeIisVisable(true);
    getTargetAllowData(record);
  };
  const comfireFn = async record => {
    await ApiExecuteEdit({
      executeId: record.executeId,
      targetId: record.targetId,
      exStatus: '1',
    }).then(() => {
      syncCallbackFn();
    });
  };
  const rejectFn = async record => {
    await ApiExecuteEdit({
      executeId: record.executeId,
      targetId: record.targetId,
      exStatus: '2',
    }).then(() => {
      syncCallbackFn();
    });
  };

  const scoreFn = async record => {
    // 打开报送弹窗
    changeShowImg(true);
    getTargetAllowData(record);
  };
  // 生产经营指标 编辑
  const editOperationIndex = record => {
    changeIsShowOptionIndex(true);
    form.setFieldsValue({
      ...record,
      isAdd: `${record.isAdd}`,
      unitLabel: record?.unitLabel ? `${record?.unitLabel}`?.split(',') : [],
    });
    changeUnitData({
      // @ts-ignore
      unitLabel: record?.unitLabel,
      unitType: record.unitType,
      unitValue: record.unitValue,
      indicatorId: record.indicatorId,
    });
  };
  const editOperationShow = record => {
    changeIsShowOptionIndex(true);
    form.setFieldsValue({
      ...record,
      isAdd: `${record.isAdd}`,
      unitLabel: record?.unitLabel ? `${record?.unitLabel}`?.split(',') : [],
    });
    changeUnitData({
      // @ts-ignore
      unitLabel: record?.unitLabel,
      unitType: record.unitType,
      unitValue: record.unitValue,
      indicatorId: 0,
    });
  };
  // 禁用
  const disableOperationIndex = async record => {
    await ApiIndicatorDisAble({
      id: record.indicatorId,
    }).then(({ data }) => {
      if (data.code === 200) {
        syncCallbackFn();
      }
    });
  };
  const riskFn = async record => {
    await ApiSubRisk({
      targetId: record.targetId,
      submissionId: record.submissionId,
    }).then(({ data }) => {
      if (data.code === 200) {
        changeIsDataToSubmit(false);
        changeisVisableRisk(true);
        getRiskData({
          risk: record.risk,
          discharge: record.discharge,
          thresholdDown: data.data.thresholdDown,
          thresholdUp: data.data.thresholdUp,
          thresholdDownValue: data.data.thresholdDownValue,
          thresholdUpValue: data.data.thresholdUpValue,
        });
      }
    });
  };
  // 去审核
  const dataToSubmitFn = async record => {
    if (Number(record.risk) === 0) {
      history.push(
        // @ts-ignore
        `/carbonDataManagemen/dataToSubmit/audit?submissionId=${record.submissionId}`,
      );
      return;
    }
    await ApiSubRisk({
      targetId: record.targetId,
      submissionId: record.submissionId,
    }).then(({ data }) => {
      if (data.code === 200) {
        changeIsDataToSubmit(true);
        changeisVisableRisk(true);
        getRiskData({
          submissionId: record.submissionId,
          risk: record.risk,
          discharge: record.discharge,
          thresholdDown: data.data.thresholdDown,
          thresholdUp: data.data.thresholdUp,
          thresholdDownValue: data.data.thresholdDownValue,
          thresholdUpValue: data.data.thresholdUpValue,
        });
      }
    });
  };
  const operateDel = async record => {
    await ApiOperateDel({
      id: record.operateId,
    }).then(({ data }) => {
      if (data.code === 200) {
        syncCallbackFn();
      }
    });
  };
  const columns = creatColumns(state.pageName, {
    disableOperationIndex,
    editOperationIndex,
    editOperationShow,
    ShowInterger,
    TargetArchive,
    TargetDeleteFn,
    TargetAllowFn,
    comfireFn,
    rejectFn,
    scoreFn,
    riskFn,
    dataToSubmitFn,
    operateDel,
    TablePage: state.TablePage,
  });
  return (
    <>
      <AppContact.Provider
        // eslint-disable-next-line react/jsx-no-constructed-context-values
        value={{
          state,
          setState,
        }}
      >
        <SearchContract
          onSearch={e => {
            const obj: { beginTime: string; endTime: string } = {
              beginTime: '',
              endTime: '',
            };
            if (e.beginTime) {
              obj.beginTime = e.beginTime[0].format('YYYY-MM-DD') || null;
              obj.endTime = e.beginTime[1].format('YYYY-MM-DD') || null;
            }
            const { pageNum, pageSize } = parmas;
            setParmas({ ...e, ...obj, pageSize, pageNum });
            syncCallbackFn();
          }}
          onClick={() => {
            changeIsShowOptionIndex(true);
            form.setFieldsValue({
              isAdd: '0',
            });
            changeUnitData({
              unitLabel: null,
              unitType: '',
              unitValue: '',
              indicatorId: -1,
            });
          }}
        />
        <SearchTableList
          dataSource={state.tablList}
          page={
            history.location.pathname.indexOf('baseYearSet') >= 0
              ? undefined
              : state.TablePage
          }
          showLoading={showLoading}
          onchanage={e => {
            setState({ ...state, TablePage: e });
            setParmas({ ...parmas, pageSize: e.pageSize, pageNum: e.current });
            syncCallbackFn();
          }}
          columns={columns || []}
          rowKey='id'
          bordered={false}
        />
      </AppContact.Provider>
      <Modal
        open={showImg}
        title={I18N.carbonDataManagemen.performanceAppraisal}
        okText={I18N.carbonFootprint.confirm2}
        cancelText={I18N.carbonFootprint.cancel}
        onCancel={() => {
          changeShowImg(false);
          form.resetFields();
        }}
        onOk={() => {
          form.validateFields().then(async value => {
            await ApiExecuteEdit({
              ...value,
              executeId: targetAllowData.executeId || '',
              isScored: 1,
              evaluateTime: monent().format('YYYY-MM-DD HH:mm:ss'),
            }).then(() => {
              changeShowImg(false);
              syncCallbackFn();
              form.resetFields();
            });
          });
        }}
      >
        <ReturnFrom
          form={form}
          listArr={[
            {
              label: I18N.carbonDataManagemen.fullMarks,
              name: 'score',
              rules: [
                {
                  required: true,
                  message: I18N.carbonDataManagemen.scoringCannotBeGivenFor,
                },
              ],
              basetype: 'InputNumber',
              baseitem: {
                disabled: false,
                placeholder: !false ? I18N.carbonFootprint.pleaseEnter : '',
                style: { width: '100%' },
                min: 0,
                max: 100,
                onChange: e => {
                  form.setFieldsValue({
                    ...form.getFieldsValue(true),
                    score: e,
                  });
                },
              },
            },
            {
              label: I18N.carbonDataManagemen.evaluationDescription,
              name: 'evaluate',
              basetype: 'TextArea',
              baseitem: {
                disabled: false,
                placeholder: !false ? I18N.carbonFootprint.pleaseEnter : '',
                style: { width: '100%' },
                onChange: e => {
                  form.setFieldsValue({
                    ...form.getFieldsValue(true),
                    evaluate: e.target.value,
                  });
                },
                maxLength: 500,
              },
            },
          ]}
        />
      </Modal>
      <Modal
        open={isShowOptionIndex}
        title={
          Number(unitData.indicatorId) === 0
            ? I18N.carbonFootprint.check
            : Number(unitData.indicatorId) > 0
            ? I18N.carbonDataManagemen.editProductionOperations
            : I18N.carbonDataManagemen.newProductionOperations
        }
        onCancel={() => {
          changeIsShowOptionIndex(false);
          form.resetFields();
        }}
        width={420}
        footer={
          Number(unitData.indicatorId) === 0
            ? [
                <Button
                  onClick={() => {
                    changeIsShowOptionIndex(false);
                    form.resetFields();
                  }}
                >
                  {I18N.carbonFootprint.cancel}
                </Button>,
              ]
            : [
                <Button
                  onClick={() => {
                    changeIsShowOptionIndex(false);
                    form.resetFields();
                  }}
                >
                  {I18N.carbonFootprint.cancel}
                </Button>,
                <Button
                  type='primary'
                  onClick={() => {
                    // return;
                    form.validateFields().then(async value => {
                      const obj = {
                        ...value,
                        ...unitData,
                      };
                      if (Number(unitData.indicatorId) > 0) {
                        obj.indicatorId = unitData.indicatorId;
                      }

                      await ApiIndicatorAdd(
                        {
                          ...obj,
                        },
                        Number(unitData.indicatorId) > 0 ? 'put' : 'post',
                      ).then(({ data }) => {
                        if (data.code === 200) {
                          changeIsShowOptionIndex(false);
                          syncCallbackFn();
                          form.resetFields();
                        }
                      });
                    });
                  }}
                >
                  {I18N.carbonFootprint.confirm2}
                </Button>,
              ]
        }
      >
        <ReturnFrom
          form={form}
          listArr={[
            {
              label: I18N.enterpriseCarbonAccount2.indicatorName,
              name: 'indicatorName',
              rules: [
                {
                  required: true,
                  message: I18N.carbonDataManagemen.indicatorNameNotApplicable,
                },
              ],
              basetype: 'Input',
              baseitem: {
                disabled: Number(unitData.indicatorId) === 0,
                placeholder: !false ? I18N.carbonFootprint.pleaseEnter : '',
                style: { width: '100%' },
                maxLength: 50,
              },
            },
            {
              label: I18N.carbonFootprint.unit,
              name: 'unitLabel',
              basetype: 'Cascader',
              rules: [
                {
                  required: true,
                  message: I18N.carbonDataManagemen.unitCannotBe,
                },
              ],
              baseitem: {
                disabled: Number(unitData.indicatorId) === 0,
                fieldNames: {
                  label: 'dictLabel',
                  value: 'dictValue',
                  children: 'enumList',
                },
                placeholder: I18N.carbonFootprint.pleaseSelect,
                options: cascaderOptions,
                style: { width: ' 100%' },
                displayRender: label => label[label.length - 1],
                onChange: (e, options) => {
                  // @ts-ignore
                  const unitType: string = options[0]?.dictLabel || '';
                  // @ts-ignore
                  const unitValue: string = options[1]?.dictLabel || '';
                  changeUnitData({
                    ...unitData,
                    // @ts-ignore
                    unitLabel: e.join(','),
                    unitType: unitType || '',
                    unitValue: unitValue || '',
                  });
                },
              },
            },
            {
              label: I18N.carbonFootprint3.sort,
              name: 'orderNum',
              rules: [
                {
                  required: true,
                  message: I18N.carbonDataManagemen.sortingCannotBeFor,
                },
              ],
              basetype: 'InputNumber',
              baseitem: {
                disabled: Number(unitData.indicatorId) === 0,
                placeholder: !false ? I18N.carbonFootprint.pleaseEnter : '',
                style: { width: '100%' },
                min: 0,
                max: 100,
              },
            },
            {
              label: I18N.carbonDataManagemen.canItBeAccumulated,
              name: 'isAdd',
              rules: [
                {
                  required: true,
                  message: I18N.carbonDataManagemen.canItBeAccumulated2,
                },
              ],
              style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'baseline',
              },
              labelCol: { span: 6 },
              basetype: 'RadioGroup',
              baseitem: {
                disabled: Number(unitData.indicatorId) === 0,
                style: { width: '100%' },
                options: [
                  {
                    label: I18N.carbonNeutral.yes,
                    value: '0',
                  },
                  {
                    label: I18N.carbonNeutral.no,
                    value: '1',
                  },
                ],
              },
            },
          ]}
        />
        <div className='model_content'>
          <p>{I18N.carbonDataManagemen.accumulatableNumber}</p>
          <p>{I18N.carbonDataManagemen.nonCumulative}</p>
          <p>{I18N.carbonDataManagemen.forTheseNumbers}</p>
        </div>
      </Modal>
      {/* 风险 查看 */}
      <Modal
        open={isVisableRisk}
        title={
          isDataToSumbit
            ? I18N.carbonDataManagemen.riskStatement
            : I18N.carbonDataManagemen.riskReview
        }
        onCancel={() => {
          changeisVisableRisk(false);
        }}
        footer={
          isDataToSumbit
            ? [
                <Button
                  onClick={() => {
                    changeisVisableRisk(false);
                  }}
                >
                  {I18N.carbonFootprint.cancel}
                </Button>,
                <Button
                  type='primary'
                  onClick={() => {
                    history.push(
                      // @ts-ignore
                      `/carbonDataManagemen/dataToSubmit/audit?submissionId=${riskData.submissionId}`,
                    );
                    changeisVisableRisk(false);
                  }}
                >
                  {I18N.carbonDataManagemen.continueReview}
                </Button>,
              ]
            : [
                <Button
                  type='primary'
                  onClick={() => {
                    changeisVisableRisk(false);
                  }}
                >
                  {I18N.carbonFootprint.return}
                </Button>,
              ]
        }
      >
        <p>
          {I18N.template(I18N.carbonDataManagemen.numberOfUserReports, {
            val1: riskData.discharge,
            val2:
              Number(riskData.risk) === 1
                ? I18N.carbonDataManagemen.lowerLimit
                : I18N.carbonDataManagemen.upperLimit,
            val3:
              Number(riskData.risk) === 1
                ? Number(riskData.thresholdDown) * 100
                : Number(riskData.thresholdUp) * 100,
            val4:
              Number(riskData.risk) === 1
                ? Number(riskData.thresholdDownValue)
                : Number(riskData.thresholdUpValue),
            val5:
              Number(riskData.risk) === 1
                ? I18N.carbonDataManagemen.belowThreshold
                : I18N.carbonDataManagemen.aboveThreshold,
          })}
        </p>
      </Modal>
      <TargetAllow
        isVisable={isVisable}
        targetAllowData={targetAllowData}
        changeIisVisable={changeIisVisable}
      />
    </>
  );
};

export default GreenMeeting;
