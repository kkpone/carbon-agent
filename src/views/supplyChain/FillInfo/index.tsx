import { VerticalAlignBottomOutlined } from '@ant-design/icons';
import emptyImg from '@src/assets/svg/enterprise_empty.svg';
import I18N from '@src/lang/I18N';
import { Button, Col, Form, Input, Row, Spin, Table } from 'antd';
import { FC, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { checkPermissions } from '@/components/Permission/utils';
import { IconAlibabaNew } from '@/components/iconfont';
import { RouteMapsSupplyChain2 } from '@/router/route-paths/supplyChain2';
import { downloadFile, Toast } from '@/utils';

import AuditModal from './AuditModal';
import styles from './index.module.less';
import { carbonDataAudit } from './service';
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
} from '../constant';
import {
  enterpriseGetReport,
  footprintGetReport,
  getAccountInfoData,
  getAuditRecordList,
  getSupplierCarbonData,
} from '../service';
import {
  AccountInfo,
  CarbonData,
  EnterpriseSnap,
  FootprintSnap,
} from '../type';
import {
  isMatchLikeFillType,
  isModelShareSupplierTask,
} from '../utils/modelShare';

const FillInfo: FC = () => {
  const { id } = useParams<{ id: string }>();

  const history = useHistory();

  const carbonDataId = Number(id);

  const [carbonData, setCarbonData] = useState<CarbonData | null>(null);

  const [auditList, setAuditList] = useState<Record<string, any>[]>([]);

  const [recordDrawerOpen, setRecordDrawerOpen] = useState(false);

  const [snap, setSnap] = useState<FootprintSnap | EnterpriseSnap | null>(null);

  const [auditModalOpen, setAuditModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  /** 模型共享任务：共享副本核算信息（产品边界、核算周期） */
  const [sharedAccountInfo, setSharedAccountInfo] =
    useState<AccountInfo | null>(null);

  const downloadReport = (reportFile: string) => {
    downloadFile(reportFile, reportFile);
  };

  const audit = async (data: { result: number; content?: string }) => {
    await carbonDataAudit({ id: carbonDataId, ...data });
    Toast('success', I18N.carbonFootprint.operationSuccessful);
    setAuditModalOpen(false);
    history.push({
      pathname: RouteMapsSupplyChain2.supplyChainCarbonDataFillList,
    });
  };

  useEffect(() => {
    setLoading(true);
    getSupplierCarbonData({
      id: carbonDataId,
    })
      .then(async ({ data }) => {
        const originCarbonData = data.data;

        const { snapshootAccountId, reqType, fillType, modelShareFlag } =
          originCarbonData;

        const resolvedFillType =
          Number(fillType) === CARBON_DATA_FILL_TYPE.MODEL_SHARE ||
          modelShareFlag === 1
            ? CARBON_DATA_FILL_TYPE.MODEL_SHARE
            : fillType;

        setCarbonData({
          ...originCarbonData,
          fillType: resolvedFillType,
        });
        setLoading(false);

        let currSnap: FootprintSnap | EnterpriseSnap | null = null;
        if (snapshootAccountId && isMatchLikeFillType(resolvedFillType)) {
          if (reqType === CARBON_DATA_REQ_TYPE.FOOTPRINT) {
            const resp = await footprintGetReport({
              snapCode: snapshootAccountId,
            });
            currSnap = resp.data.data;
          } else if (reqType === CARBON_DATA_REQ_TYPE.ENTERPRISE) {
            const resp = await enterpriseGetReport({
              snapCode: snapshootAccountId,
              companyId: originCarbonData.replyCompanyId,
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
  }, [carbonDataId]);

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

  return (
    <div className={styles.fillInfo}>
      <Spin rootClassName={styles.spin} spinning={loading}>
        {carbonData &&
          (() => {
            const isOrgCollection =
              carbonData.reqDataType === CARBON_DATA_REQ_DATA_TYPE.SUPPLIER &&
              carbonData.reqType === CARBON_DATA_REQ_TYPE.ENTERPRISE;

            const isModelShare = isModelShareSupplierTask(carbonData);
            const showCarbonDataBody =
              carbonData.status > CARBON_DATA_STATUS.FILLING;

            const displayFootBorderType =
              carbonData.footBorderType ??
              (sharedAccountInfo?.scope != null
                ? Number(sharedAccountInfo.scope)
                : undefined);

            const displayPeriodStart =
              carbonData.result.startTime ||
              (sharedAccountInfo?.startTime as string | undefined) ||
              '';
            const displayPeriodEnd =
              carbonData.result.endTime ||
              (sharedAccountInfo?.endTime as string | undefined) ||
              '';

            return (
              <>
                <AuditModal
                  open={auditModalOpen}
                  onCancel={() => setAuditModalOpen(false)}
                  onConfirm={audit}
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
                        label={I18N.carbonFootprint3.supplier}
                        layout='vertical'
                        colon={false}
                      >
                        <Input
                          disabled
                          value={carbonData.replyCompanyName || '-'}
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
                  {showCarbonDataBody ? (
                    <>
                      {(carbonData.dataType === CARBON_DATA_DATA_TYPE.RESULT ||
                        isMatchLikeFillType(carbonData.fillType)) && (
                        <>
                          {(carbonData.reqDataType !==
                            CARBON_DATA_REQ_DATA_TYPE.SUPPLIER ||
                            carbonData.reqType ===
                              CARBON_DATA_REQ_TYPE.FOOTPRINT) && (
                            <>
                              <Row gutter={24}>
                                <Col span={8}>
                                  <Form.Item
                                    label={I18N.supplyChain.productBoundary}
                                    layout='vertical'
                                    colon={false}
                                  >
                                    <Input
                                      disabled
                                      title={
                                        CARBON_DATA_BORDER_TYPE_LABEL[
                                          displayFootBorderType!
                                        ] || '-'
                                      }
                                      value={
                                        CARBON_DATA_BORDER_TYPE_LABEL[
                                          displayFootBorderType!
                                        ] || '-'
                                      }
                                    />
                                  </Form.Item>
                                </Col>
                                <Col span={8}>
                                  <Form.Item
                                    label={I18N.carbonFootprint.accountingCycle}
                                    layout='vertical'
                                    colon={false}
                                  >
                                    <Input
                                      disabled
                                      value={`${displayPeriodStart} - ${displayPeriodEnd}`}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col span={8}>
                                  <Form.Item
                                    label={I18N.supplyChain.emissionIntensityK}
                                    layout='vertical'
                                    colon={false}
                                  >
                                    <Input
                                      disabled
                                      value={carbonData.result.emission || '-'}
                                    />
                                  </Form.Item>
                                </Col>
                              </Row>
                              <>
                                <div>
                                  {I18N.supplyChain.emissionIntensityIsClear}
                                </div>
                                <Table
                                  className={styles.table}
                                  dataSource={[{}]}
                                  pagination={false}
                                  columns={[
                                    {
                                      title:
                                        I18N.carbonFootprint
                                          .rawMaterialAcquisition,
                                      dataIndex: 'rawMaterial',
                                      render: () => (
                                        <Input
                                          disabled
                                          value={carbonData.result.rawMaterial}
                                        />
                                      ),
                                    },
                                    {
                                      title:
                                        I18N.carbonFootprint
                                          .productionAndManufacturing,
                                      dataIndex: 'manufacturing',
                                      render: () => (
                                        <Input
                                          disabled
                                          value={
                                            carbonData.result.manufacturing
                                          }
                                        />
                                      ),
                                    },
                                    {
                                      title:
                                        I18N.carbonFootprint3
                                          .distributionStorage,
                                      dataIndex: 'distribution',
                                      render: () => (
                                        <Input
                                          disabled
                                          value={carbonData.result.distribution}
                                        />
                                      ),
                                    },
                                    ...(displayFootBorderType !==
                                    CARBON_DATA_BORDER_TYPE.HALF
                                      ? [
                                          {
                                            title:
                                              I18N.carbonFootprint
                                                .rawMaterialAcquisition,
                                            dataIndex: 'employ',
                                            render: () => (
                                              <Input
                                                disabled
                                                value={carbonData.result.employ}
                                              />
                                            ),
                                          },
                                          {
                                            title:
                                              I18N.carbonFootprint
                                                .abandonedDisposal,
                                            dataIndex: 'abandon',
                                            render: () => (
                                              <Input
                                                disabled
                                                value={
                                                  carbonData.result.abandon
                                                }
                                              />
                                            ),
                                          },
                                        ]
                                      : []),
                                  ]}
                                />
                              </>
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
                                      label={
                                        I18N.carbonFootprint3.accountingYear2
                                      }
                                      layout='vertical'
                                      colon={false}
                                    >
                                      <Input
                                        disabled
                                        value={carbonData.result.year}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={8}>
                                    <Form.Item
                                      label={I18N.supplyChain.totalEmissionsT}
                                      layout='vertical'
                                      colon={false}
                                    >
                                      <Input
                                        disabled
                                        value={carbonData.result.emission}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <div>{I18N.supplyChain.emissionDetails}</div>
                                <Table
                                  className={styles.enterpriseTable}
                                  dataSource={[{}]}
                                  pagination={false}
                                  columns={[
                                    {
                                      title: I18N.eca.scopeOne,
                                      dataIndex: 'scopeOne',
                                      render: () => (
                                        <Input
                                          disabled
                                          value={carbonData.result.scopeOne}
                                        />
                                      ),
                                    },
                                    {
                                      title: I18N.eca.scope2,
                                      dataIndex: 'scopeTwo',
                                      render: () => (
                                        <Input
                                          disabled
                                          value={carbonData.result.scopeTwo}
                                        />
                                      ),
                                    },
                                    {
                                      title: I18N.eca.fanWeisan,
                                      dataIndex: 'scopeThree',
                                      render: () => (
                                        <Input
                                          disabled
                                          value={carbonData.result.scopeThree}
                                        />
                                      ),
                                    },
                                  ]}
                                />
                                {carbonData.fillType ===
                                  CARBON_DATA_FILL_TYPE.FILL && (
                                  <Form.Item
                                    label={
                                      I18N.dashborad.supplementaryInformation
                                    }
                                    layout='vertical'
                                    colon={false}
                                  >
                                    <Input.TextArea
                                      disabled
                                      value={carbonData.result.extraInfo || '-'}
                                    />
                                  </Form.Item>
                                )}
                              </>
                            )}
                          <SnapInfo
                            snap={snap}
                            isOrgCollection={isOrgCollection}
                            companyId={carbonData.replyCompanyId}
                          />
                        </>
                      )}
                      {carbonData.reqDataType !==
                        CARBON_DATA_REQ_DATA_TYPE.SUPPLIER &&
                        carbonData.dataType === CARBON_DATA_DATA_TYPE.PROCESS &&
                        carbonData.fillType === CARBON_DATA_FILL_TYPE.FILL && (
                          <ProcessCarbonData readOnly carbonData={carbonData} />
                        )}
                    </>
                  ) : (
                    <div className={styles.notFillContent}>
                      <img
                        className={styles.notFillImg}
                        alt=''
                        src={emptyImg}
                      />
                      <div className={styles.notFillText}>
                        {I18N.supplyChain.notYetFilledIn}
                      </div>
                    </div>
                  )}
                </div>
                {showCarbonDataBody &&
                  carbonData.fillType === CARBON_DATA_FILL_TYPE.FILL && (
                    <div className={styles.infoBlock}>
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
                            <VerticalAlignBottomOutlined
                              className={styles.reportBtn}
                              onClick={() => {
                                downloadReport(reportFile);
                              }}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                <div className={styles.footer}>
                  <Button
                    onClick={() => {
                      history.push({
                        pathname:
                          RouteMapsSupplyChain2.supplyChainCarbonDataFillList,
                      });
                    }}
                  >
                    {I18N.carbonFootprint.return}
                  </Button>
                  {carbonData.status === CARBON_DATA_STATUS.PENDING &&
                    checkPermissions(
                      <Button
                        type='primary'
                        onClick={() => setAuditModalOpen(true)}
                      >
                        {I18N.carbonFootprint3.auditing}
                      </Button>,
                      'supplier:data:audit',
                    )}
                </div>
              </>
            );
          })()}
      </Spin>
    </div>
  );
};

export default FillInfo;
