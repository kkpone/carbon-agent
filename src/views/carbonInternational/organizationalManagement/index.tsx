/**
 * @file 碳排放信息管理 ghg iso
 * @author qifeng
 */
import I18N from '@src/lang/I18N';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Spin,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {
  copyCarbonInfo,
  createCarbonInfoRelations,
  delCarbonInfo,
  delCarbonInfoRealtion,
  downloadCarbonEmissionInfo,
  getAllCarbonInfoRealtions,
  getCarbonInfos,
  reportData,
  updateReportData,
} from '@api/carbon-international';
import {
  AllCarbonInfoRealtions,
  BackendResponse,
  CarbonEmissionInfoResponse,
  CarbonInfos,
  CarbonInfosPayload,
  CarbonInfosResponse,
  CarbonInfosSearchParams,
  ReportDataResponse,
} from '@api/carbon-international/types';
import './organizationalManagement.less';
import { getExecuteTargets } from '@src/api/carbonData';
import { ListForBusiness } from '@src/api/carbonData/types';
import Permission from '@src/components/Permission';
import { Table as CommonTable } from '@src/components/Table';
import { TableRef } from '@src/components/TableUtil/types/common';
import { ModalBase } from '@src/components/UI/Modal';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import { Toast } from '@utils/Toast';
import { PickerProps } from 'antd/es/date-picker/generatePicker';
import { useForm } from 'antd/es/form/Form';
import { AxiosResponse } from 'axios';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import styles from './organizationManagement.module.less';
import { getReportTimerOptions, getYear, ReportDataType } from './utils';
import { DownType, useCarbonInfoColumn } from './utils/columns';
import { EditionType, getEditionType } from '../utils';

const { RangePicker } = DatePicker;
const defaultSearchParams = {
  g_time: '',
  l_time: '',
  year: '',
  // 报告id
  id: '',
  organization_info_name: '',
  // edition: editionTypeNum,
};

const InternationalOrganizationalManagement = () => {
  const history = useHistory();
  // 判断归属哪个标准
  const [editionTypeNum, editionTypeStr] = getEditionType();
  const [searchParams, setSearchParams] = useState<CarbonInfosSearchParams>({
    ...defaultSearchParams,
    edition: editionTypeNum,
  });
  useEffect(() => {
    setSearchParams(() => ({
      ...defaultSearchParams,
      edition: editionTypeNum,
    }));
    tableRef.current?.reset({ page: 1 });
  }, [editionTypeNum]);
  // 搜索用报告主体信息
  const [inputValue, setInputValue] = useState('');
  // 搜索用 id
  const [id, setId] = useState('');
  const tableRef = useRef<TableRef>();
  // 下载地址保存
  const [downInfo, setdownInfo] = useState({ title: '', path: '' });

  // 可选的关联关系列表
  const [selectRelations, setSelectRelations] =
    useState<AllCarbonInfoRealtions[]>();
  const [showRelationSelect, setShowRelationSelect] = useState<number>();
  // 删除或创建关联
  const toggleRelations = async (record: CarbonInfos) => {
    if (record.relation) {
      await delCarbonInfoRealtion(+record.relation);
      tableRef.current?.reset();
      Toast('success', I18N.carbonInternational.disassociated);
    } else {
      setShowRelationSelect(record.id);
      await getAllCarbonInfoRealtions({
        carbon_emission_info_id: record.id,
        edition: editionTypeNum,
      }).then(({ data }) => {
        setSelectRelations(data?.data);
      });
    }
  };
  useEffect(() => {
    const listener = () => {
      if (showRelationSelect) {
        setShowRelationSelect(undefined);
      }
    };
    document.body.addEventListener('click', listener);
    return () => {
      document.body.removeEventListener('click', listener);
    };
  }, [showRelationSelect]);

  const renderRelations = (record: CarbonInfos) => (
    <div>
      {showRelationSelect === record.id ? (
        <Select
          onClick={ev => {
            ev.stopPropagation();
          }}
          className={styles.dropDown}
          onChange={async val => {
            if (val) {
              await createCarbonInfoRelations({
                master_carbon_emission: record.id,
                slave_carbon_emission: +val,
              }).then(({ data }) => {
                if (data.code === 200) {
                  Toast('success', I18N.carbonInternational.dataAssociation);
                  setShowRelationSelect(undefined);
                  tableRef.current?.reset();
                }
              });
            }
          }}
          options={selectRelations?.map(({ id, year, version_num }) => ({
            value: id,
            label: `${year} - V${version_num}`,
          }))}
          // eslint-disable-next-line react/no-unstable-nested-components
          dropdownRender={menu =>
            selectRelations ? (
              menu
            ) : (
              <span className={styles.noValues}>
                {I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
              </span>
            )
          }
        />
      ) : (
        <div className='text-14 text-green text-cursor'>
          <Permission
            flag={
              EditionType.GHG === editionTypeNum ? 'IW6ADLHhu5' : 'sCYTjZJUQv'
            }
          >
            {!record.relation ? (
              <span onClick={async () => toggleRelations(record)}>
                {I18N.ModelManagement.disassociation}
              </span>
            ) : (
              <Popconfirm
                title={I18N.carbonproduct.doYouWantToCancelTheShutdown}
                onConfirm={async () => toggleRelations(record)}
                okText={I18N.carbonFootprint.confirm}
                cancelText={I18N.carbonFootprint.cancel}
              >
                <span className='text-14 text-orange text-cursor'>
                  {I18N.ModelManagement.disassociate}
                </span>
              </Popconfirm>
            )}
          </Permission>
        </div>
      )}
    </div>
  );

  const [status, setStatus] = useState(true);

  const [reportForm] = useForm();
  const [reportFormRecord, setreportFormRecord] = useState<CarbonInfos>();
  /** 关联目标列表 */
  const [reportTarget, setReportTarget] = useState<ListForBusiness[]>([]);
  const columns = useCarbonInfoColumn({
    onCopy: async id => {
      await copyCarbonInfo(id).then(({ data }) => {
        if (data.code === 200) {
          Toast('success', I18N.carbonFootprint3.copySuccessful);
          tableRef.current?.reset();
        } else {
          Toast('warn', data.msg);
        }
      });
    },
    onDel: async id => {
      await delCarbonInfo(id);
      Toast('success', I18N.carbonFootprint.deleteSuccessful);
      tableRef.current?.reset();
    },
    /**
     * TYPE:代表下载报告类型 1代表下载报告
     * * */
    onDownload: async (id, type) => {
      if (status) {
        setStatus(false);
        const dealDownload = ({
          data,
        }: AxiosResponse<CarbonEmissionInfoResponse>) => {
          if (data?.code === 200) {
            const path = data?.data?.file_url_path;
            if (path) {
              setTimeout(() => {
                window.open(path);
                setdownInfo(downInfo => ({ ...downInfo, path }));
                setStatus(true);
              }, 5000);
            }
          } else {
            Toast('warn', data?.msg);
            setStatus(true);
          }
        };
        switch (type) {
          case DownType.list:
            setdownInfo(downInfo => ({
              ...downInfo,
              title: I18N.carbonInternational.inventory,
            }));
            downloadCarbonEmissionInfo(id, 'excel').then(d => {
              const timestamp = new Date().getTime();
              sessionStorage.setItem(
                'docs',
                JSON.stringify({
                  id,
                  type,
                  timestamp,
                }),
              );
              dealDownload(d);
            });
            break;
          case DownType.report:
            setdownInfo(downInfo => ({
              ...downInfo,
              title: I18N.carbonNeutral.report,
            }));
            downloadCarbonEmissionInfo(id, 'docx').then(d => {
              const timestamp = new Date().getTime();
              sessionStorage.setItem(
                'docs',
                JSON.stringify({
                  id,
                  type,
                  timestamp,
                }),
              );
              dealDownload(d);
            });
            break;
          default:
        }
      }
    },
    renderRelations,
    /** 数据提报 */
    onReport: record => {
      setreportFormRecord(record);
      getExecuteTargets().then(({ data }) => {
        setReportTarget(data?.rows || []);
        const formdata = record?.submit_data?.[0];
        if (formdata) {
          const dataType =
            formdata.period.length > 4
              ? ReportDataType[I18N.carbonInternational.monthlyData]
              : ReportDataType[I18N.carbonInternational.annualData];
          if (
            dataType === ReportDataType[I18N.carbonInternational.monthlyData]
          ) {
            setPeriodTimer('month');
          } else {
            setPeriodTimer('year');
          }

          reportForm.setFieldsValue({
            ...formdata,
            data_type: dataType,
            period: moment(formdata.period),
          });
        }
      });
    },
    editionType: editionTypeStr,
  });
  const hideModal = () => {
    setreportFormRecord(undefined);
    reportForm.resetFields();
    tableRef.current?.reset();
  };
  const [periodTimer, setPeriodTimer] =
    useState<PickerProps<any>['picker']>('year');
  const dateFormat = periodTimer === 'year' ? 'YYYY' : 'YYYY-MM';
  const yearList = getYear();

  const riskModalShow = (risk: number, id: number) => {
    const text =
      risk > 1
        ? I18N.carbonInternational.beyondManager
        : I18N.carbonInternational.belowManager;

    Modal.confirm({
      title: I18N.carbonInternational.riskReminder,
      wrapClassName: styles.riskModal,
      closable: false,
      keyboard: false,
      maskClosable: false,
      content: I18N.template(
        I18N.carbonInternational.detectedThatYouMentioned,
        { val1: text },
      ),
      icon: null,
      okText: I18N.carbonInternational.returnInspection,
      cancelText: I18N.carbonInternational.continueToFillOutTheForm,
      onCancel() {
        updateReportData(id, { proceed: 1 }).then(({ data }) => {
          if (data?.code === 200) {
            hideModal();
            Toast('success', I18N.carbonInternational.dataSubmissionRate);
          }
        });
      },
      onOk() {
        hideModal();
      },
    });
  };
  const doSearch = (params: Partial<CarbonInfosPayload>) => {
    setSearchParams({
      ...searchParams,
      id,
      organization_info_name: inputValue,
      ...params,
    });
    tableRef.current?.reset({ page: 1 });
  };
  return (
    <div className={styles.organization_content}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.searchWrapper}>
            <div className={styles.searchItem}>
              <Input
                placeholder={I18N.carbonInternational.pleaseEnterTheReport2}
                className='input'
                onChange={e => {
                  setInputValue(e.target.value);
                }}
                onPressEnter={e => {
                  // @ts-ignore
                  doSearch({ organization_info_name: e.target.value });
                }}
                suffix={
                  <SearchOutlined
                    style={{ color: 'rgba(0,0,0,.45)' }}
                    onClick={() => {
                      doSearch({});
                    }}
                  />
                }
              />
            </div>
            <div className={styles.searchItem}>
              <Input
                placeholder={I18N.carbonInternational.pleaseEnterTheReport}
                className='input'
                onChange={e => {
                  setId(e.target.value);
                }}
                onPressEnter={e => {
                  doSearch({
                    // @ts-ignore
                    id: e.target.value,
                  });
                }}
                suffix={
                  <SearchOutlined
                    style={{ color: 'rgba(0,0,0,.45)' }}
                    onClick={() => {
                      doSearch({});
                    }}
                  />
                }
              />
            </div>
            <div className={styles.searchItem}>
              <Select
                placeholder={I18N.enterpriseCarbonAccount2.reportYear}
                listItemHeight={10}
                listHeight={160}
                onChange={year => {
                  doSearch({ year });
                }}
                options={[
                  { label: I18N.emission.allYears, value: '' },
                  ...yearList.map(y => ({ label: y.value, value: y.value })),
                ]}
              />
            </div>
            <div className={styles.searchItem}>
              <RangePicker
                showTime={{ format: 'HH:mm' }}
                format='YYYY-MM-DD HH:mm'
                onChange={(m, [g_time, l_time]) => {
                  doSearch({ g_time, l_time });
                }}
                ranges={{
                  最近一周: [moment().startOf('week'), moment().endOf('week')],
                  最近一个月: [
                    moment().startOf('month'),
                    moment().endOf('month'),
                  ],
                  最近三个月: [
                    moment().subtract(3, 'month'),
                    moment().endOf('day'),
                  ],
                }}
              />
            </div>
          </div>
          <Permission
            flag={
              EditionType.GHG === editionTypeNum
                ? 'I7k4V9fn0y'
                : 'newEmissionData'
            }
          >
            <Button
              type='primary'
              onClick={() => {
                history.push(
                  virtualLinkTransform(
                    RouteMaps.internationaladdCarbonReport,
                    [':edition', ':step', ':id?'],
                    [editionTypeStr, 0],
                  ),
                );
              }}
            >
              {I18N.carbonFootprint.newAddition}
            </Button>
          </Permission>
        </div>
      </div>
      <div className={styles.organizationa_management_table}>
        <Row>
          <Col span={24}>
            <CommonTable<
              CarbonInfos,
              CarbonInfosResponse,
              CarbonInfosSearchParams
            >
              columns={columns}
              searchParams={searchParams}
              cRef={tableRef}
              returnFetchApi={({ data }) => ({
                count: data.count,
                data: data.results,
              })}
              bordered={false}
              scroll={{ x: 'auto' }}
              fetchApi={params =>
                getCarbonInfos({
                  ...params,
                  page_size: params.size,
                })
              }
            />
          </Col>
        </Row>
      </div>
      {/* 下载弹窗 */}
      <Modal
        width={400}
        maskClosable={false}
        open={!!downInfo.title}
        title={I18N.template(I18N.carbonInternational.downI, {
          val1: downInfo.title || '',
        })}
        onCancel={() => setdownInfo({ ...downInfo, path: '', title: '' })}
        footer={null}
      >
        <div className={styles.downloadWrapper}>
          {!downInfo.path ? (
            <Spin />
          ) : (
            <div>
              <h3>
                {I18N.carbonInternational.ifTheDownloadIsNotSuccessful}
                <a
                  href={downInfo.path}
                  target='_blank'
                  download={downInfo.title || I18N.carbonFootprint.download}
                  rel='noreferrer'
                >
                  {I18N.dashborad.downloadHere}
                </a>
              </h3>
            </div>
          )}
        </div>
      </Modal>
      {/* 数据提报 modal 只有 GHG有 */}
      <ModalBase
        title={I18N.carbonInternational.dataSubmission}
        width={768}
        wrapClassName={styles.reportModalWrapper}
        visible={!!reportFormRecord}
        onCancel={() => hideModal()}
        onOk={() => {
          if (!reportFormRecord?.id) return;
          // target_id	integer (关联目标ID) 如果选择关联目标，那么这3个字段必有
          // execution_id	integer (目标执行ID)
          // associated_target	string (关联目标)
          // eslint-disable-next-line consistent-return
          return reportForm
            .validateFields()
            .then(values => {
              const targetReport = reportTarget.find(
                r => r.targetId === values.target_id,
              );
              const period = values.period.format(dateFormat);
              const reportId = reportFormRecord?.submit_data?.[0]?.id;

              const successFn = (
                data: BackendResponse<ReportDataResponse>,
                recordId?: number,
              ) => {
                if (data?.code === 200) {
                  /** 1 低于下限 2高于上限 */
                  const risk = data?.data?.risk;
                  const id = data?.data?.id || recordId;
                  if (risk > 0 && id) {
                    riskModalShow(risk, id);
                  } else {
                    hideModal();
                    Toast(
                      'success',
                      I18N.carbonInternational.dataSubmissionRate,
                    );
                  }
                }
              };
              const targetInfos = {
                execution_id: targetReport?.executeId,
                associated_target: targetReport?.targetName,
              };
              if (values.target_id && !targetReport)
                return Toast('error', I18N.carbonInternational.targe);

              if (reportId) {
                return updateReportData(reportId, {
                  ...targetInfos,
                  ...values,
                  period,
                  status: 0,
                  carbon_emission_info: reportFormRecord.id,
                }).then(({ data }) => {
                  successFn(data, reportId);
                });
              }
              return reportData({
                ...targetInfos,
                ...values,
                period,
                carbon_emission_info: reportFormRecord.id,
              }).then(({ data }) => {
                successFn(data);
              });
            })
            .catch();
        }}
        content={
          <div className={styles.mainContent}>
            <header>
              <div>
                <div className='key'>
                  {I18N.carbonInternational.reportSubject}
                </div>
                <div className='value'>
                  {reportFormRecord?.organization_info_name}
                </div>
              </div>
              <div>
                <div className='key'>
                  {I18N.Certification.whenTheReportCovers}
                </div>
                <div className='value'> {reportFormRecord?.year}</div>
              </div>
              <div>
                <div className='key'>{I18N.Certification.versionNumber}</div>
                <div className='value'>{reportFormRecord?.version_num}</div>
              </div>
            </header>
            <Form
              form={reportForm}
              className={styles.reportForm}
              initialValues={{ data_type: 1 }}
              layout='vertical'
              onValuesChange={changedValue => {
                const dataType = changedValue?.data_type;
                if (dataType) {
                  if (dataType === 1) {
                    setPeriodTimer('year');
                  } else {
                    setPeriodTimer('month');
                  }
                }
              }}
            >
              <Form.Item
                label={I18N.carbonInternational.dataName}
                name='data_name'
                rules={[
                  {
                    required: true,
                    message: I18N.carbonInternational.dataNameNotAvailable,
                  },
                ]}
              >
                <Input
                  placeholder={I18N.carbonFootprint.pleaseEnter}
                  maxLength={50}
                />
              </Form.Item>
              <Form.Item
                label={I18N.carbonFootprint3.dataType}
                name='data_type'
                rules={[
                  { required: true, message: I18N.emission.pleaseSelectData },
                ]}
              >
                <Select
                  placeholder={I18N.carbonFootprint.pleaseSelect}
                  options={getReportTimerOptions()}
                />
              </Form.Item>
              <Form.Item
                label={I18N.carbonInternational.period}
                name='period'
                rules={[
                  {
                    required: true,
                    message:
                      I18N.carbonInternational.pleaseSelectTheAffiliation,
                  },
                ]}
              >
                <DatePicker
                  placeholder={I18N.carbonFootprint.pleaseSelect}
                  picker={periodTimer}
                  format={dateFormat}
                  disabledDate={current =>
                    current.isBefore(new Date('2000/01/01')) ||
                    current.isAfter(Date.now())
                  }
                />
              </Form.Item>

              <Form.Item
                label={I18N.carbonInternational.associatedTargets}
                name='target_id'
                className={styles.selectTarget}
              >
                <Select
                  placeholder={I18N.carbonFootprint.pleaseSelect}
                  options={reportTarget.map(r => ({
                    label: r.targetName,
                    value: r.targetId,
                  }))}
                />
              </Form.Item>
            </Form>
          </div>
        }
      />
    </div>
  );
};
export default InternationalOrganizationalManagement;
