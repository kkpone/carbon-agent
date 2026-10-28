import { CloseOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import {
  Form,
  Radio,
  DatePicker,
  Input,
  Row,
  Col,
  InputNumber,
  Select,
  Table,
  Button,
  Upload,
  UploadFile,
  FormInstance,
  Spin,
} from 'antd';
import { isNil, omit } from 'lodash-es';
import moment, { Moment } from 'moment';
import { FC, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { AsyncReturnType } from 'type-fest';

import { checkPermissions } from '@/components/Permission/utils';
import IconFont, { IconAlibabaNew } from '@/components/iconfont';
import { RouteMapsSupplyChain2 } from '@/router/route-paths/supplyChain2';
import { downloadFile, Toast } from '@/utils';
import { getToken } from '@/utils/cookie';
import { submitSharedModel } from '@src/views/carbonFootprint3/shareSubmit';

import OrgModal from './OrgModal';
import styles from './index.module.less';
import { getOrgAccountYearList } from './service';
import AccountProductModal from '../components/CarbonData/AccountProductModal';
import ModelShareBadge from '../components/ModelShareBadge';
import ProcessCarbonData from '../components/ProcessCarbonData';
import RecordDrawer from '../components/RecordDrawer';
import SnapInfo from '../components/SnapInfo';
import {
  CARBON_DATA_BORDER_TYPE,
  CARBON_DATA_BORDER_TYPE_LABEL,
  CARBON_DATA_DATA_TYPE,
  CARBON_DATA_FILL_TYPE,
  CARBON_DATA_REQ_DATA_TYPE,
  CARBON_DATA_REQ_TYPE,
  CARBON_DATA_REQ_TYPE_LABEL,
  CARBON_DATA_STATUS,
  CARBON_DATA_SUBMIT_TYPE,
} from '../constant';
import {
  enterpriseAddReportSupply,
  enterpriseGetReport,
  footprintAddReportSupply,
  footprintGetReport,
  getAccountInfoData,
  getAuditRecordList,
  getCarbonData,
  submitCarbonData,
} from '../service';
import {
  AccountInfo,
  CarbonData,
  EnterpriseSnap,
  FootprintSnap,
} from '../type';
import {
  isModelShareFillType,
  isModelShareSupplierTask,
  openSharedModelAccountingInNewTab,
} from '../utils/modelShare';

const TaskInfo: FC = () => {
  const params = useParams<{ id: string }>();

  const id = Number(params.id);

  const history = useHistory();

  const [yearList, setYearList] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  const [accountProductModalVisible, setAccountProductModalVisible] =
    useState(false);

  const [orgModalOpen, setOrgModalOpen] = useState(false);

  const [carbonData, setCarbonData] = useState<CarbonData | null>(null);

  const [auditList, setAuditList] = useState<Record<string, any>[]>([]);

  const [recordDrawerOpen, setRecordDrawerOpen] = useState(false);

  const [snap, setSnap] = useState<FootprintSnap | EnterpriseSnap | null>(null);

  const accountInfoRef = useRef<{ accountInfo: AccountInfo | null }>(null);

  const [form] = Form.useForm();

  const [submitLoading, setSubmitLoading] = useState(false);

  /** 模型共享：共享副本核算信息 */
  const [sharedAccountInfo, setSharedAccountInfo] =
    useState<AccountInfo | null>(null);

  const getCarbonDataInfo = (
    carbonDataId: number,
    formInstance: FormInstance<any>,
  ) => {
    setLoading(true);
    getCarbonData({ id: carbonDataId })
      .then(async ({ data }) => {
        const originCarbonData = data.data;
        const { snapshootAccountId, reqType, fillType, modelShareFlag } =
          originCarbonData;

        const resolvedFillType =
          Number(fillType) === CARBON_DATA_FILL_TYPE.MODEL_SHARE ||
          modelShareFlag === 1
            ? CARBON_DATA_FILL_TYPE.MODEL_SHARE
            : fillType ??
              CARBON_DATA_FILL_TYPE[
                originCarbonData.mappingTapShow ? 'MATCH' : 'FILL'
              ];

        setCarbonData({
          ...originCarbonData,
          fillType: resolvedFillType,
        });

        setLoading(false);

        formInstance.setFieldsValue({
          ...originCarbonData.result,
          footBorderType: originCarbonData.footBorderType,
          period: [
            originCarbonData.result.startTime
              ? moment(originCarbonData.result.startTime)
              : undefined,
            originCarbonData.result.endTime
              ? moment(originCarbonData.result.endTime)
              : undefined,
          ],
          extraInfo: originCarbonData.result.extraInfo,
        });

        let currSnap: FootprintSnap | EnterpriseSnap | null = null;
        if (
          snapshootAccountId &&
          (resolvedFillType === CARBON_DATA_FILL_TYPE.MATCH ||
            resolvedFillType === CARBON_DATA_FILL_TYPE.MODEL_SHARE)
        ) {
          if (reqType === CARBON_DATA_REQ_TYPE.FOOTPRINT) {
            const resp = await footprintGetReport({
              snapCode: snapshootAccountId,
            });
            currSnap = resp.data.data;
          } else if (reqType === CARBON_DATA_REQ_TYPE.ENTERPRISE) {
            const resp = await enterpriseGetReport({
              snapCode: snapshootAccountId,
            });
            currSnap = resp.data.data;
          }
        }
        setSnap(currSnap);
      })
      .finally(() => {
        setLoading(false);
      });

    getAuditRecordList({ pageNum: 1, pageSize: 1000, id: carbonDataId }).then(
      ({ data }) => {
        setAuditList(
          (data.rows || []).map(record => {
            let type = 'initiate';
            if (record.result === CARBON_DATA_STATUS.PENDING) {
              type = 'pending';
            } else if (record.result === CARBON_DATA_STATUS.DISAPPROVED) {
              type = 'fail';
            } else if (record.result === CARBON_DATA_STATUS.APPROVED) {
              type = 'success';
            }
            return {
              type,
              name: record.createBy,
              time: record.createTime,
              operateDesc: record.resultDesc,
              remark: record.content,
            };
          }),
        );
      },
    );
  };

  const onAccountProductSelect = async (
    accountProduct: {
      accountId: number;
      year: string;
      // 0 快速核算 1 过程核算
      accountType: number;
      startTime: string;
      endTime: string;
      footBorderType: number;
    } & CarbonData['result'],
  ) => {
    if (!carbonData) {
      return;
    }
    const { accountId, accountType, startTime, endTime, footBorderType } =
      accountProduct;

    const { data } = await footprintAddReportSupply({
      // 报告类型:0-碳足迹报告;1-产品对比报告
      type: 0,
      reportAccountList: [
        {
          accountId,
        },
      ],
      accountType,
    });
    const { snapCode } = data.data;
    const resp = await footprintGetReport({ snapCode });
    const footprintSnap = resp.data.data;
    form.setFieldsValue({
      period: [moment(startTime), moment(endTime)],
      footBorderType,
      ...footprintSnap.result,
    });

    setSnap(footprintSnap);
    setCarbonData({
      ...carbonData,
      accountId,
      footBorderType,
      snapshootAccountId: snapCode,
      isSelectAccount: true,
    });
    setAccountProductModalVisible(false);
  };

  const onAccountOrgSelect = async (accountOrg: {
    orgId: number;
    calculatePeriod: string;
  }) => {
    if (!carbonData) {
      return;
    }

    const { data } = await enterpriseAddReportSupply({
      ...accountOrg,
      timeType: 0,
    });
    const { snapCode } = data.data;
    const resp = await enterpriseGetReport({ snapCode });
    const enterpriseSnap = resp.data.data;

    form.setFieldsValue({
      year: enterpriseSnap.period,
      ...enterpriseSnap.result,
    });

    setSnap(enterpriseSnap);
    setCarbonData({
      ...carbonData,
      snapshootAccountId: snapCode,
      isSelectAccount: true,
    });
    setOrgModalOpen(false);
  };

  const onFillTypeChange = (fillType: number) => {
    if (!carbonData) {
      return;
    }

    setSnap(null);
    setCarbonData({
      ...carbonData,
      fillType,
      footBorderType:
        carbonData.reqDataType === CARBON_DATA_REQ_DATA_TYPE.SUPPLIER
          ? undefined
          : carbonData.footBorderType,
      accountId:
        carbonData.dataType === CARBON_DATA_DATA_TYPE.RESULT
          ? null
          : carbonData.accountId,
      snapshootAccountId:
        carbonData.dataType === CARBON_DATA_DATA_TYPE.RESULT
          ? undefined
          : carbonData.snapshootAccountId,
      report: [],
    });

    // 核算结果切换填报方式时清空表单字段及错误;
    form.resetFields();
    form.setFieldsValue({
      footBorderType:
        carbonData.reqDataType === CARBON_DATA_REQ_DATA_TYPE.SUPPLIER
          ? undefined
          : carbonData.footBorderType,
    });
  };

  const submit = async (submitType: number) => {
    if (!carbonData) {
      return;
    }

    try {
      setSubmitLoading(true);
      const {
        dataType,
        fillType,
        report,
        accountId,
        snapshootAccountId,
        snapFillId,
      } = carbonData;
      const basicSubmitData = { id, submitType, fillType, report };

      // 核算方式为核算结果
      const isResultDataType = dataType === CARBON_DATA_DATA_TYPE.RESULT;

      // 填报方式为选择核算产品 / 模型共享
      const isMatchType = fillType === CARBON_DATA_FILL_TYPE.MATCH;
      const isModelShareType = fillType === CARBON_DATA_FILL_TYPE.MODEL_SHARE;

      if (isModelShareType) {
        if (isNil(accountId)) {
          Toast('error', I18N.carbonFootprint3.modelSharePendingTip);
          return;
        }

        await submitSharedModel({
          accountId,
          onSuccess: () => {
            history.push({
              pathname: RouteMapsSupplyChain2.supplyChainCarbonDataTaskList,
            });
          },
        });
        return;
      }

      if (isMatchType) {
        if (isNil(snapshootAccountId)) {
          Toast('warn', I18N.supplyChain2.pleaseSelectAccounting2);
          return;
        }

        const { data } = await submitCarbonData({
          accountId,
          snapshootAccountId,
          ...omit(basicSubmitData, 'report'),
        });
        const { code, msg } = data.data;

        if (code === 200) {
          Toast('success', I18N.carbonFootprint.operationSuccessful);
          history.push({
            pathname: RouteMapsSupplyChain2.supplyChainCarbonDataTaskList,
          });
        } else {
          Toast('error', msg || I18N.enterpriseCarbonAccount2.operationFailed);
        }
        return;
      }

      let submitResponse: AsyncReturnType<typeof submitCarbonData>;

      if (isResultDataType) {
        const formValues = await form.validateFields();

        const { year, period, ...rest } = formValues as {
          year?: string;
          emission: string;
          abandon?: number | string;
          distribution?: number | string;
          employ?: number | string;
          manufacturing?: number | string;
          rawMaterial?: number | string;
          scopeOne?: number | string;
          scopeTwo?: number | string;
          scopeThree?: number | string;
          period?: [Moment, Moment];
        };

        // 手动填写核算结果
        submitResponse = await submitCarbonData({
          year,
          startTime: period?.[0]?.format('YYYY-MM-DD'),
          endTime: period?.[1]?.format('YYYY-MM-DD'),
          ...rest,
          ...basicSubmitData,
        });
      } else {
        const accountEndTime = accountInfoRef.current?.accountInfo?.endTime;
        if (isNil(accountEndTime) || accountEndTime === '') {
          Toast('warn', I18N.supplyChain.pleaseFillInTheAccountingForm);
          return;
        }
        // 手动填写核算过程
        submitResponse = await submitCarbonData({
          snapshootAccountId: snapFillId,
          ...basicSubmitData,
        });
      }

      const { code, msg } = submitResponse?.data?.data || {};

      if (code === 200) {
        Toast('success', I18N.carbonFootprint.operationSuccessful);
        history.push({
          pathname: RouteMapsSupplyChain2.supplyChainCarbonDataTaskList,
        });
      } else {
        Toast('error', msg || I18N.enterpriseCarbonAccount2.operationFailed);
      }
      setSubmitLoading(false);
    } catch (e) {
      setSubmitLoading(false);
      throw e;
    } finally {
      setSubmitLoading(false);
    }
  };

  const addReport = (file: UploadFile<{ data: string }>) => {
    if (!carbonData) {
      return;
    }
    if (file.response && file.status === 'done') {
      setCarbonData({
        ...carbonData,
        report: [...carbonData.report, file.response.data],
      });
    }
  };

  const deleteReport = (reportFile: string) => {
    if (!carbonData) {
      return;
    }

    setCarbonData({
      ...carbonData,
      report: carbonData.report.filter(report => report !== reportFile),
    });
  };
  const downloadReport = (reportFile: string) => {
    downloadFile(reportFile, reportFile);
  };

  useEffect(() => {
    getCarbonDataInfo(id, form);
  }, [id, form]);

  useEffect(() => {
    getOrgAccountYearList().then(({ data }) => {
      setYearList(data.data.yearList.map(({ year }) => year));
    });
  }, []);

  useEffect(() => {
    if (!carbonData || !isModelShareSupplierTask(carbonData)) {
      setSharedAccountInfo(null);
      return;
    }
    if (!carbonData.accountId) return;

    getAccountInfoData({ id: carbonData.accountId })
      .then(({ data }) => {
        setSharedAccountInfo(data.data);
      })
      .catch(() => {
        // 获取共享模型核算信息失败时静默降级
        setSharedAccountInfo(null);
      });
  }, [carbonData]);

  useEffect(() => {
    if (!carbonData || !isModelShareFillType(carbonData.fillType)) {
      return;
    }
    if (!sharedAccountInfo) {
      return;
    }

    form.setFieldsValue({
      footBorderType:
        carbonData.footBorderType ?? Number(sharedAccountInfo.scope),
      period: [
        carbonData.result.startTime || sharedAccountInfo.startTime
          ? moment(carbonData.result.startTime || sharedAccountInfo.startTime)
          : undefined,
        carbonData.result.endTime || sharedAccountInfo.endTime
          ? moment(carbonData.result.endTime || sharedAccountInfo.endTime)
          : undefined,
      ],
    });
  }, [carbonData, sharedAccountInfo, form]);

  const submitPermission = !!checkPermissions(true, 'supplier:data:submit');

  return (
    <div className={styles.taskInfo}>
      <Spin rootClassName={styles.spin} spinning={loading}>
        {carbonData &&
          (() => {
            const carbonDataDisabled =
              !submitPermission ||
              CARBON_DATA_STATUS.APPROVED === carbonData.status ||
              CARBON_DATA_STATUS.PENDING === carbonData.status;

            const isModelShareFill = isModelShareFillType(carbonData.fillType);
            const isModelShare = isModelShareSupplierTask(carbonData);

            const fieldDisabled =
              carbonDataDisabled ||
              carbonData.fillType === CARBON_DATA_FILL_TYPE.MATCH ||
              isModelShareFill;

            const isOrgCollection =
              carbonData.reqDataType === CARBON_DATA_REQ_DATA_TYPE.SUPPLIER &&
              carbonData.reqType === CARBON_DATA_REQ_TYPE.ENTERPRISE;

            const goToSharedModelInNewTab = () => {
              if (!carbonData.accountId) {
                Toast('error', I18N.carbonFootprint3.modelSharePendingTip);
                return;
              }
              const opened = openSharedModelAccountingInNewTab({
                accountId: carbonData.accountId,
                productId: sharedAccountInfo?.productId,
                delFlag: sharedAccountInfo?.delFlag,
              });
              if (!opened) {
                Toast('error', I18N.carbonFootprint3.modelSharePendingTip);
              }
            };

            const fillTypeRadioOptions = [
              ...(carbonData.mappingTapShow || isModelShareFill
                ? [
                    {
                      value: CARBON_DATA_FILL_TYPE.MATCH,
                      label: I18N.supplyChain.systemMatching,
                    },
                  ]
                : []),
              {
                value: CARBON_DATA_FILL_TYPE.FILL,
                label: I18N.supplyChain.manuallyFillIn,
              },
              ...(isModelShareFill
                ? [
                    {
                      value: CARBON_DATA_FILL_TYPE.MODEL_SHARE,
                      label: I18N.supplyChain.modelShareFillType,
                    },
                  ]
                : []),
            ];

            const displayFootBorderType =
              carbonData.footBorderType ??
              (sharedAccountInfo?.scope != null
                ? Number(sharedAccountInfo.scope)
                : undefined);

            /** 模型共享：填报中隐藏预览/下载；已提交或审核通过后展示 */
            const showSnapInfo =
              !isModelShareFill ||
              carbonData.status === CARBON_DATA_STATUS.PENDING ||
              carbonData.status === CARBON_DATA_STATUS.APPROVED;

            return (
              <>
                <AccountProductModal
                  visible={accountProductModalVisible}
                  unitCode={carbonData.unitCode as string}
                  unitDesc={carbonData.computeUnitDesc}
                  scope={
                    carbonData.reqDataType ===
                    CARBON_DATA_REQ_DATA_TYPE.SUPPLIER
                      ? undefined
                      : (carbonData.footBorderType as number)
                  }
                  footBorderTypeDisabled={
                    carbonData.reqDataType !==
                    CARBON_DATA_REQ_DATA_TYPE.SUPPLIER
                  }
                  onCancel={() => setAccountProductModalVisible(false)}
                  onConfirm={onAccountProductSelect}
                />
                <OrgModal
                  open={orgModalOpen}
                  yearList={yearList}
                  onCancel={() => setOrgModalOpen(false)}
                  onConfirm={onAccountOrgSelect}
                />
                <RecordDrawer
                  title={I18N.supplyChain.fillInTheAuditRecord}
                  open={recordDrawerOpen}
                  recordList={auditList}
                  onClose={() => setRecordDrawerOpen(false)}
                />
                <div className={styles.header}>
                  {I18N.supplyChain.fillInDetails}
                  <div
                    className={styles.opeBtn}
                    onClick={() => setRecordDrawerOpen(true)}
                  >
                    <IconAlibabaNew type='icon-icon-tianbaoshenhejilu' />
                    <span>{I18N.supplyChain.fillInTheAuditRecord}</span>
                  </div>
                </div>
                <div className={styles.infoBlock}>
                  <div className={styles.secondaryTitle}>
                    {I18N.supplyChain.basicRequirementsLetter}
                  </div>
                  <Row gutter={24}>
                    <Col span={8}>
                      <Form.Item
                        label={I18N.supplyChain.fillInTheName}
                        layout='vertical'
                        colon={false}
                      >
                        <Input disabled value={carbonData.name || '-'} />
                      </Form.Item>
                    </Col>
                    {!isOrgCollection && (
                      <>
                        <Col span={8}>
                          <Form.Item
                            label={I18N.supplyChain.fillInTheProduct}
                            layout='vertical'
                            colon={false}
                          >
                            <Input
                              disabled
                              value={carbonData.productName || '-'}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            label={I18N.carbonFootprint.unit}
                            layout='vertical'
                            colon={false}
                          >
                            <Input
                              disabled
                              value={carbonData.computeUnitDesc || '-'}
                            />
                          </Form.Item>
                        </Col>
                      </>
                    )}
                    <Col span={8}>
                      <Form.Item
                        label={I18N.supplyChain.typeOfFilling}
                        layout='vertical'
                        colon={false}
                      >
                        <Input
                          disabled
                          value={
                            CARBON_DATA_REQ_TYPE_LABEL[carbonData.reqType] ||
                            '-'
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={I18N.becomeSupplierOrPurchasing.customerName}
                        layout='vertical'
                        colon={false}
                      >
                        <Input
                          disabled
                          value={carbonData.applyCompanyName || '-'}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    label={I18N.supplyChainCarbonManagement.fillingRequirements}
                    layout='vertical'
                    colon={false}
                  >
                    <Input.TextArea disabled value={carbonData.descr || '-'} />
                  </Form.Item>
                </div>
                <div className={styles.infoBlock}>
                  <div className={styles.sectionTitleRow}>
                    <div className={styles.secondaryTitle}>
                      {I18N.supplyChain.carbonDataInformation}
                    </div>
                    {isModelShare ? <ModelShareBadge /> : null}
                  </div>
                  <div className={styles.selectContent}>
                    <Radio.Group
                      value={carbonData.fillType}
                      disabled={carbonDataDisabled || isModelShareFill}
                      options={fillTypeRadioOptions}
                      onChange={e => {
                        onFillTypeChange(e.target.value);
                      }}
                    />
                    {carbonData.fillType === CARBON_DATA_FILL_TYPE.MATCH &&
                      carbonData.mappingTapShow &&
                      !carbonDataDisabled && (
                        <Button
                          type='primary'
                          onClick={() => {
                            if (isOrgCollection) {
                              setOrgModalOpen(true);
                            } else {
                              setAccountProductModalVisible(true);
                            }
                          }}
                        >
                          {I18N.router.selectAccountingAssets}
                        </Button>
                      )}
                    {isModelShareFill ? (
                      <Button type='primary' onClick={goToSharedModelInNewTab}>
                        {I18N.carbonFootprint3.viewSharedAccountingModel}
                      </Button>
                    ) : null}
                  </div>
                  {(carbonData.dataType === CARBON_DATA_DATA_TYPE.RESULT ||
                    carbonData.fillType === CARBON_DATA_FILL_TYPE.MATCH ||
                    isModelShareFill) && (
                    <Form form={form} layout='vertical' colon={false}>
                      {(carbonData.reqDataType !==
                        CARBON_DATA_REQ_DATA_TYPE.SUPPLIER ||
                        carbonData.reqType ===
                          CARBON_DATA_REQ_TYPE.FOOTPRINT) && (
                        <>
                          <Row gutter={24}>
                            <Col span={8}>
                              <Form.Item
                                name='footBorderType'
                                label={I18N.supplyChain.productBoundary}
                                rules={[
                                  {
                                    required: true,
                                    message: I18N.carbonFootprint.pleaseSelect,
                                  },
                                ]}
                              >
                                <Select
                                  placeholder={
                                    I18N.carbonFootprint.pleaseSelect
                                  }
                                  disabled={
                                    fieldDisabled ||
                                    carbonData.reqDataType !==
                                      CARBON_DATA_REQ_DATA_TYPE.SUPPLIER
                                  }
                                  options={Object.values(
                                    CARBON_DATA_BORDER_TYPE,
                                  ).map(value => ({
                                    value,
                                    label: CARBON_DATA_BORDER_TYPE_LABEL[value],
                                  }))}
                                  onChange={footBorderType => {
                                    setCarbonData({
                                      ...carbonData,
                                      footBorderType,
                                    });
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                name='period'
                                label={I18N.carbonFootprint.accountingCycle}
                                rules={[
                                  {
                                    required: true,
                                    message: I18N.carbonFootprint.pleaseSelect,
                                  },
                                ]}
                              >
                                <DatePicker.RangePicker
                                  style={{ width: '100%' }}
                                  disabled={fieldDisabled}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                name='emission'
                                label={I18N.supplyChain.emissionIntensityK2}
                                rules={[
                                  {
                                    required: true,
                                    message: I18N.base.pleaseEnter,
                                  },
                                ]}
                              >
                                <InputNumber
                                  placeholder={I18N.base.pleaseEnter}
                                  style={{ width: '100%' }}
                                  disabled={fieldDisabled}
                                  controls={false}
                                  min={0}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          <div>
                            {I18N.supplyChain.emissionIntensityIsClear2}
                          </div>
                          <Table
                            className={styles.table}
                            dataSource={[{}]}
                            pagination={false}
                            columns={[
                              {
                                title:
                                  I18N.carbonFootprint.rawMaterialAcquisition,
                                dataIndex: 'rawMaterial',

                                render: () => (
                                  <Form.Item name='rawMaterial' noStyle>
                                    <InputNumber
                                      placeholder={
                                        fieldDisabled
                                          ? ''
                                          : I18N.base.pleaseEnter
                                      }
                                      style={{ width: '100%' }}
                                      disabled={fieldDisabled}
                                      controls={false}
                                      min={0}
                                    />
                                  </Form.Item>
                                ),
                              },
                              {
                                title:
                                  I18N.carbonFootprint
                                    .productionAndManufacturing,
                                dataIndex: 'manufacturing',
                                render: () => (
                                  <Form.Item name='manufacturing' noStyle>
                                    <InputNumber
                                      placeholder={
                                        fieldDisabled
                                          ? ''
                                          : I18N.base.pleaseEnter
                                      }
                                      style={{ width: '100%' }}
                                      disabled={fieldDisabled}
                                      controls={false}
                                      min={0}
                                    />
                                  </Form.Item>
                                ),
                              },
                              {
                                title:
                                  I18N.carbonFootprint3.distributionStorage,
                                dataIndex: 'distribution',
                                render: () => (
                                  <Form.Item name='distribution' noStyle>
                                    <InputNumber
                                      placeholder={
                                        fieldDisabled
                                          ? ''
                                          : I18N.base.pleaseEnter
                                      }
                                      style={{ width: '100%' }}
                                      disabled={fieldDisabled}
                                      controls={false}
                                      min={0}
                                    />
                                  </Form.Item>
                                ),
                              },
                              ...(displayFootBorderType !==
                              CARBON_DATA_BORDER_TYPE.HALF
                                ? [
                                    {
                                      title: I18N.carbonFootprint.productUsage,
                                      dataIndex: 'employ',
                                      render: () => (
                                        <Form.Item name='employ' noStyle>
                                          <InputNumber
                                            placeholder={
                                              fieldDisabled
                                                ? ''
                                                : I18N.base.pleaseEnter
                                            }
                                            style={{ width: '100%' }}
                                            disabled={fieldDisabled}
                                            controls={false}
                                            min={0}
                                          />
                                        </Form.Item>
                                      ),
                                    },
                                    {
                                      title:
                                        I18N.carbonFootprint.abandonedDisposal,
                                      dataIndex: 'abandon',
                                      render: () => (
                                        <Form.Item name='abandon' noStyle>
                                          <InputNumber
                                            placeholder={
                                              fieldDisabled
                                                ? ''
                                                : I18N.base.pleaseEnter
                                            }
                                            style={{ width: '100%' }}
                                            disabled={fieldDisabled}
                                            controls={false}
                                            min={0}
                                          />
                                        </Form.Item>
                                      ),
                                    },
                                  ]
                                : []),
                            ]}
                          />
                        </>
                      )}
                      {carbonData.reqDataType ===
                        CARBON_DATA_REQ_DATA_TYPE.SUPPLIER &&
                        carbonData.reqType ===
                          CARBON_DATA_REQ_TYPE.ENTERPRISE && (
                          <>
                            <Row gutter={24}>
                              <Col span={8}>
                                <Form.Item
                                  name='year'
                                  label={I18N.carbonFootprint3.accountingYear2}
                                  rules={[{ required: true }]}
                                >
                                  <Select
                                    placeholder={
                                      I18N.carbonFootprint.pleaseSelect
                                    }
                                    disabled={fieldDisabled}
                                    options={yearList.map(value => ({
                                      value,
                                      label: value,
                                    }))}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item
                                  name='emission'
                                  label={I18N.supplyChain.totalEmissionsT2}
                                  rules={[{ required: true }]}
                                >
                                  <InputNumber
                                    placeholder={I18N.base.pleaseEnter}
                                    style={{ width: '100%' }}
                                    disabled={fieldDisabled}
                                    controls={false}
                                    min={0}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                            <div>{I18N.supplyChain.emissionDetails2}</div>
                            <Table
                              className={styles.enterpriseTable}
                              style={{ marginBottom: 16 }}
                              dataSource={[{}]}
                              pagination={false}
                              columns={[
                                {
                                  title: I18N.eca.scopeOne,
                                  dataIndex: 'scopeOne',

                                  render: () => (
                                    <Form.Item name='scopeOne' noStyle>
                                      <InputNumber
                                        placeholder={
                                          fieldDisabled
                                            ? ''
                                            : I18N.base.pleaseEnter
                                        }
                                        style={{ width: '100%' }}
                                        disabled={fieldDisabled}
                                        controls={false}
                                        min={0}
                                      />
                                    </Form.Item>
                                  ),
                                },
                                {
                                  title: I18N.eca.scope2,
                                  dataIndex: 'scopeTwo',
                                  render: () => (
                                    <Form.Item name='scopeTwo' noStyle>
                                      <InputNumber
                                        placeholder={
                                          fieldDisabled
                                            ? ''
                                            : I18N.base.pleaseEnter
                                        }
                                        style={{ width: '100%' }}
                                        disabled={fieldDisabled}
                                        controls={false}
                                        min={0}
                                      />
                                    </Form.Item>
                                  ),
                                },
                                {
                                  title: I18N.eca.fanWeisan,
                                  dataIndex: 'scopeThree',
                                  render: () => (
                                    <Form.Item name='scopeThree' noStyle>
                                      <InputNumber
                                        placeholder={
                                          fieldDisabled
                                            ? ''
                                            : I18N.base.pleaseEnter
                                        }
                                        style={{ width: '100%' }}
                                        disabled={fieldDisabled}
                                        controls={false}
                                        min={0}
                                      />
                                    </Form.Item>
                                  ),
                                },
                              ]}
                            />
                            {carbonData.fillType ===
                              CARBON_DATA_FILL_TYPE.FILL && (
                              <Form.Item
                                name='extraInfo'
                                label={I18N.dashborad.supplementaryInformation}
                              >
                                <Input.TextArea
                                  placeholder={
                                    I18N.dashborad.supplementaryInformation
                                  }
                                  disabled={fieldDisabled}
                                  maxLength={2000}
                                />
                              </Form.Item>
                            )}
                          </>
                        )}
                      {showSnapInfo ? (
                        <SnapInfo
                          snap={snap}
                          isOrgCollection={isOrgCollection}
                        />
                      ) : null}
                    </Form>
                  )}
                  {!isModelShareFill &&
                    carbonData.reqDataType !==
                      CARBON_DATA_REQ_DATA_TYPE.SUPPLIER &&
                    carbonData.dataType === CARBON_DATA_DATA_TYPE.PROCESS &&
                    carbonData.fillType === CARBON_DATA_FILL_TYPE.FILL && (
                      <ProcessCarbonData
                        ref={accountInfoRef}
                        readOnly={fieldDisabled}
                        carbonData={carbonData}
                      />
                    )}
                </div>
                {!isModelShareFill &&
                  carbonData.fillType === CARBON_DATA_FILL_TYPE.FILL && (
                    <div className={styles.infoBlock}>
                      {!fieldDisabled && (
                        <>
                          <div className={styles.caption}>
                            {I18N.carbonFootprint3.supportPdf}
                          </div>
                          <Upload
                            accept='.xls, .xlsx, .pdf, .jpg, .png, .doc, .docx, .rar, .zip, .XLS, .XLSX, .PDF, .JPG, .PNG, .DOC,.DOCX, .RAR, .ZIP'
                            action={`${
                              process.env.REACT_APP_API_URL || ''
                            }/file/file/uploadImg`}
                            headers={{
                              Authorization: getToken(),
                            }}
                            name='file'
                            showUploadList={false}
                            beforeUpload={file => {
                              const { name } = file;
                              const fileType = name.split('.').pop();
                              const fileTypeList = [
                                'xls',
                                'xlsx',
                                'pdf',
                                'jpg',
                                'jpeg',
                                'png',
                                'doc',
                                'docx',
                                'rar',
                                'zip',
                              ];
                              if (
                                !fileTypeList.includes(
                                  (fileType ?? '').toLowerCase(),
                                )
                              ) {
                                Toast(
                                  'error',
                                  I18N.template(
                                    I18N.supplyChain.onlySupportsFi,
                                    {
                                      val1: fileTypeList.join(','),
                                    },
                                  ),
                                );
                                return Upload.LIST_IGNORE;
                              }

                              if (file.size > 10 * 1024 * 1024) {
                                Toast(
                                  'error',
                                  I18N.carbonFootprint3.fileMaximumNot,
                                );
                                return Upload.LIST_IGNORE;
                              }

                              if (
                                carbonData &&
                                carbonData.report.length >= 10
                              ) {
                                Toast('error', I18N.supplyChain.uploadUpTo);
                                return Upload.LIST_IGNORE;
                              }

                              return true;
                            }}
                            onChange={({ file }) => {
                              addReport(file);
                            }}
                          >
                            <Button
                              className={styles.uploadBtn}
                              icon={<IconFont type='icon-icon-shangzhuan-3' />}
                            >
                              {I18N.carbonFootprint.uploadFiles}
                            </Button>
                          </Upload>
                        </>
                      )}
                      {carbonData.report.length === 0 ? (
                        <div className={styles.noReport}>
                          {I18N.supplyChain2.unsubmittedReport}
                        </div>
                      ) : (
                        carbonData.report.map(reportFile => (
                          <div
                            className={styles.reportFileItem}
                            key={reportFile}
                          >
                            <div
                              className={styles.reportFileName}
                              title={reportFile}
                            >
                              {reportFile.split('/').pop()}
                            </div>
                            <div>
                              <VerticalAlignBottomOutlined
                                className={styles.reportBtn}
                                onClick={() => downloadReport(reportFile)}
                              />
                              {!fieldDisabled && (
                                <CloseOutlined
                                  className={styles.reportBtn}
                                  onClick={() => deleteReport(reportFile)}
                                />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                <div className={styles.footer}>
                  {submitPermission &&
                    carbonData.status !== CARBON_DATA_STATUS.APPROVED &&
                    carbonData.status !== CARBON_DATA_STATUS.PENDING && (
                      <>
                        <Button
                          type='primary'
                          loading={submitLoading}
                          onClick={() =>
                            submit(CARBON_DATA_SUBMIT_TYPE.SAVE_SUBMIT)
                          }
                        >
                          {I18N.components.submit}
                        </Button>
                        {!isModelShareFill ? (
                          <Button
                            loading={submitLoading}
                            onClick={() => submit(CARBON_DATA_SUBMIT_TYPE.SAVE)}
                          >
                            {I18N.carbonFootprint.preserve}
                          </Button>
                        ) : null}
                      </>
                    )}
                  <Button
                    onClick={() =>
                      history.push(
                        RouteMapsSupplyChain2.supplyChainCarbonDataTaskList,
                      )
                    }
                  >
                    {I18N.carbonFootprint.return}
                  </Button>
                </div>
              </>
            );
          })()}
      </Spin>
    </div>
  );
};

export default TaskInfo;
