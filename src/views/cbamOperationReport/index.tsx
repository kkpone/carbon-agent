import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Input,
  message,
  Modal,
  Pagination,
  Select,
  Space,
  Spin,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { saveAs } from 'file-saver';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import I18N from '@src/lang/I18N';

import { CBAMRouteMaps } from '@/router/utils/cbam';
import { showMonitorDeleteConfirm } from '@/views/cbamMonitor/deleteConfirm';

import completedIcon from './assets/completed.svg';
import fillingIcon from './assets/filling.svg';
import reportTaskIcon from './assets/report-task.svg';
import styles from './index.module.less';
import {
  deleteOperationReport,
  generateOperationReport,
  getOperationOverview,
  getOperationPage,
  OperationReportLanguage,
} from './service';
import {
  OperationOverview,
  OperationReportListItem,
  OperationReportQuery,
} from './types';

const EMPTY_OVERVIEW: OperationOverview = {
  totalCount: 0,
  completedCount: 0,
  fillingCount: 0,
};

const reportFileName = (contentDisposition?: string, fallback?: string) => {
  const encoded = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) return decodeURIComponent(encoded);
  const plain = contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1];
  return plain ? decodeURIComponent(plain) : fallback;
};

const OperationReportList = () => {
  const history = useHistory();
  const requestSequence = useRef(0);
  const [query, setQuery] = useState<OperationReportQuery>({
    pageNum: 1,
    pageSize: 20,
  });
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [records, setRecords] = useState<OperationReportListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reportRecord, setReportRecord] = useState<OperationReportListItem>();
  const [reportLanguages, setReportLanguages] = useState<
    OperationReportLanguage[]
  >(['EN']);
  const [generatingReport, setGeneratingReport] = useState(false);

  const load = useCallback(async () => {
    const sequence = ++requestSequence.current;
    setLoading(true);
    const filter = { ...query };
    delete (filter as Partial<OperationReportQuery>).pageNum;
    delete (filter as Partial<OperationReportQuery>).pageSize;
    const [overviewResult, pageResult] = await Promise.allSettled([
      getOperationOverview(filter),
      getOperationPage(query),
    ]);
    if (sequence !== requestSequence.current) return;
    if (overviewResult.status === 'fulfilled') {
      setOverview(overviewResult.value.data?.data || EMPTY_OVERVIEW);
    }
    if (pageResult.status === 'fulfilled') {
      const page = pageResult.value.data?.data;
      setRecords(page?.records || []);
      setTotal(page?.total || 0);
    }
    setLoading(false);
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = (record: OperationReportListItem) => {
    showMonitorDeleteConfirm({
      title: I18N.cbamOperationReport.deleteOperationReport,
      content: I18N.template(I18N.cbamOperationReport.confirmDeleteReport, {
        name: record.reportName || I18N.cbamOperationReport.unnamedReport,
      }),
      onOk: async () => {
        await deleteOperationReport(record.operationId);
        message.success(I18N.cbamOperationReport.deleteSuccess);
        if (records.length === 1 && query.pageNum > 1) {
          setQuery(current => ({ ...current, pageNum: current.pageNum - 1 }));
        } else {
          await load();
        }
      },
    });
  };

  const open = (operationId: number | string) => {
    history.push(
      `${CBAMRouteMaps.cbamOperationReportEdit}?operationId=${operationId}`,
    );
  };

  const generateReports = async () => {
    if (!reportRecord || reportLanguages.length === 0) return;
    setGeneratingReport(true);
    const results = await Promise.allSettled(
      reportLanguages.map(async language => {
        const response = await generateOperationReport(
          reportRecord.operationId,
          language,
        );
        const fallback = `${
          reportRecord.reportName || 'CBAM_Operator_Report'
        }_${language.toLowerCase()}.docx`;
        saveAs(
          response.data,
          reportFileName(response.headers['content-disposition'], fallback),
        );
      }),
    );
    setGeneratingReport(false);
    const successCount = results.filter(
      result => result.status === 'fulfilled',
    ).length;
    if (successCount === results.length)
      message.success(I18N.cbamOperationReport.reportGenerated);
    else if (successCount > 0)
      message.warning(I18N.cbamOperationReport.reportPartiallyGenerated);
    else message.error(I18N.cbamOperationReport.reportGenerateFailed);
    if (successCount > 0) setReportRecord(undefined);
  };

  const columns: ColumnsType<OperationReportListItem> = [
    {
      title: I18N.cbamOperationReport.reportName,
      dataIndex: 'reportName',
      width: 200,
      ellipsis: true,
      render: value => value || '-',
    },
    {
      title: I18N.cbamOperationReport.reportingPeriod,
      width: 220,
      render: (_, record) =>
        `${record.startDate || '-'} ~ ${record.endDate || '-'}`,
    },
    {
      title: I18N.cbamOperationReport.relatedFactory,
      dataIndex: 'factoryName',
      width: 160,
      ellipsis: true,
    },
    {
      title: I18N.cbamOperationReport.monitoringPlan,
      width: 260,
      ellipsis: true,
      render: (_, record) =>
        [record.planName, record.planVersionNo].filter(Boolean).join(' / ') ||
        '-',
    },
    {
      title: I18N.cbamOperationReport.status,
      dataIndex: 'status',
      width: 100,
      render: status =>
        status === 1 ? (
          <span className={`${styles.statusTag} ${styles.statusCompleted}`}>
            {I18N.cbamOperationReport.completed}
          </span>
        ) : (
          <span className={`${styles.statusTag} ${styles.statusFilling}`}>
            {I18N.cbamOperationReport.filling}
          </span>
        ),
    },
    {
      title: I18N.cbamOperationReport.completion,
      width: 210,
      render: (_, record) => {
        const rate = Math.max(
          0,
          Math.min(100, Number(record.completionRate || 0)),
        );
        return (
          <div className={styles.completionCell}>
            <span className={styles.completionTrack}>
              <span
                className={styles.completionValue}
                style={{ width: `${rate}%` }}
              />
            </span>
            <span>{rate.toFixed(0)}%</span>
          </div>
        );
      },
    },
    {
      title: I18N.cbamOperationReport.updatedBy,
      dataIndex: 'updateByName',
      width: 110,
      render: value => value || '-',
    },
    {
      title: I18N.cbamOperationReport.lastUpdated,
      dataIndex: 'updateTime',
      width: 180,
      render: value => (
        <span className={styles.updateTime}>{value || '-'}</span>
      ),
    },
    {
      title: I18N.cbamOperationReport.actions,
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <div className={styles.actionCell}>
          <button
            type='button'
            className={styles.linkAction}
            onClick={() => {
              setReportRecord(record);
              setReportLanguages(['EN']);
            }}
          >
            {I18N.cbamMonitor.generateFile}
          </button>
          <button
            type='button'
            className={styles.linkAction}
            onClick={() => open(record.operationId)}
          >
            {I18N.cbamOperationReport.view}
          </button>
          <button
            type='button'
            className={`${styles.linkAction} ${styles.deleteAction}`}
            onClick={() => remove(record)}
          >
            {I18N.cbamOperationReport.delete}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.pageHeader}>
        {I18N.cbamOperationReport.reportManagement}
      </h1>
      <main className={styles.content}>
        <div className={styles.statGrid}>
          <div className={`${styles.statCard} ${styles.reportTaskCard}`}>
            <div className={styles.statContent}>
              <span>{I18N.cbamOperationReport.reportTask}</span>
              <strong>{overview.totalCount}</strong>
            </div>
            <img className={styles.statIcon} src={reportTaskIcon} alt='' />
          </div>
          <div className={`${styles.statCard} ${styles.fillingCard}`}>
            <div className={styles.statContent}>
              <span>{I18N.cbamOperationReport.filling}</span>
              <strong>{overview.fillingCount}</strong>
            </div>
            <div className={styles.fillingIconWrap}>
              <img src={fillingIcon} alt='' />
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.completedCard}`}>
            <div className={styles.statContent}>
              <span>{I18N.cbamOperationReport.completed}</span>
              <strong>{overview.completedCount}</strong>
            </div>
            <img className={styles.statIcon} src={completedIcon} alt='' />
          </div>
        </div>
        <div className={styles.toolbar}>
          <Space size={16}>
            <Input.Search
              allowClear
              className={styles.search}
              onSearch={keyword =>
                setQuery(current => ({
                  ...current,
                  keyword: keyword || undefined,
                  pageNum: 1,
                }))
              }
            />
            <Select
              allowClear
              className={styles.filter}
              options={[
                { label: I18N.cbamOperationReport.filling, value: 0 },
                { label: I18N.cbamOperationReport.completed, value: 1 },
              ]}
              onChange={status =>
                setQuery(current => ({ ...current, status, pageNum: 1 }))
              }
            />
          </Space>
          <Button
            className={styles.addButton}
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => history.push(CBAMRouteMaps.cbamOperationReportAdd)}
          >
            {I18N.cbamOperationReport.addReportTask}
          </Button>
        </div>
        <Spin spinning={loading}>
          <Table<OperationReportListItem>
            className={styles.reportTable}
            rowKey='operationId'
            columns={columns}
            dataSource={records}
            pagination={false}
            scroll={{ x: 1700 }}
          />
        </Spin>
        <div className={styles.pagination}>
          <Pagination
            current={query.pageNum}
            pageSize={query.pageSize}
            total={total}
            showSizeChanger
            onChange={(pageNum, pageSize) =>
              setQuery(current => ({ ...current, pageNum, pageSize }))
            }
          />
        </div>
        <Modal
          open={Boolean(reportRecord)}
          centered
          width={444}
          title={I18N.cbamMonitor.generateFile}
          className={styles.reportModal}
          okText={I18N.cbamMonitor.confirm}
          cancelText={I18N.cbamMonitor.cancel}
          confirmLoading={generatingReport}
          okButtonProps={{ disabled: reportLanguages.length === 0 }}
          maskClosable={!generatingReport}
          closable={!generatingReport}
          onCancel={() => setReportRecord(undefined)}
          onOk={generateReports}
        >
          <div className={styles.reportModalHint}>
            {I18N.cbamOperationReport.selectReportLanguage}
          </div>
          <Checkbox.Group
            className={styles.reportLanguageGroup}
            value={reportLanguages}
            onChange={values =>
              setReportLanguages(values as OperationReportLanguage[])
            }
          >
            <Checkbox value='EN'>
              {I18N.cbamOperationReport.englishReport}
            </Checkbox>
            <Checkbox value='ZH'>
              {I18N.cbamOperationReport.chineseReport}
            </Checkbox>
          </Checkbox.Group>
        </Modal>
      </main>
    </div>
  );
};

export default OperationReportList;
