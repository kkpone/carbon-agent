import I18N from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { Button, InputNumber, Table } from 'antd';
import { isNil } from 'lodash-es';
import { FC, useEffect, useRef, useState } from 'react';

import { CustomDrawer } from '@/components/CustomDrawer';
import { FullscreenModal } from '@/components/FullscreenModal';
import { IconAlibabaNew } from '@/components/iconfont';
import { Toast } from '@/utils';
import { Questionnaire } from '@/views/Questionnaire/type';

import styles from './index.module.less';
import {
  getEmissionSourceDetails,
  questionnaireImport,
  submitImportResult,
} from './service';

const EmissionSourceDetails: FC<{
  emissionSource: Record<string, any> | null;
  questionnaire: Questionnaire;
}> = ({ questionnaire, emissionSource }) => {
  const [list, setList] = useState<Record<string, any>[]>([]);

  const [pager, setPager] = useState({ pageNum: 1, pageSize: 10 });

  const [total, setTotal] = useState(0);

  const getDetails = async (params: {
    pageNum: number;
    pageSize: number;
    transType: number;
    questionId: number;
  }) => {
    const { data } = await getEmissionSourceDetails(params);
    setTotal(data.data.total);
    setList(data.data.rows);
  };

  useEffect(() => {
    if (emissionSource) {
      getDetails({
        ...pager,
        transType: emissionSource.transType,
        questionId: questionnaire.id,
      });
    }
  }, [pager, questionnaire, emissionSource]);

  return (
    <Table
      rowKey='id'
      dataSource={list}
      columns={[
        {
          title: I18N.carbonFootprint.number,
          dataIndex: 'allIndex',
          width: 94,
        },
        {
          title: I18N.system.name,
          dataIndex: 'employeeName',
          width: 162,
          ellipsis: true,
        },
        {
          title: I18N.enterpriseCarbonAccount2.annualCumulativeTravel,
          dataIndex: 'distance',
          width: 200,
          ellipsis: true,
        },
      ]}
      pagination={{ current: pager.pageNum, pageSize: pager.pageSize, total }}
      onChange={({ current, pageSize }) => {
        setPager({ pageNum: current ?? 1, pageSize: pageSize ?? 10 });
      }}
    />
  );
};

const CommuteImportResult: FC<{
  questionnaire: Questionnaire;
  computationId: string;
  computationPeriod?: string;
  onResultClose: () => void;
  onImportSuccess: () => void;
}> = ({
  questionnaire,
  computationId,
  computationPeriod,
  onImportSuccess,
  onResultClose,
}) => {
  const [loading, setLoading] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [emissionSource, setEmissionSource] = useState<Record<
    string,
    any
  > | null>(null);

  const [editStatus, setEditStatus] = useState(false);

  const [importResult, setImportResult] = useState<{
    employeeCount: number;
    submitCount: number;
    sourceList: Record<string, any>[];
  }>();

  const employeeCountRef = useRef<number>();

  const getImportResult = async (params: {
    questionId: number;
    employeeCount?: number;
  }) => {
    try {
      setLoading(true);
      const { data } = await questionnaireImport(params);
      setImportResult(data.data);
    } finally {
      setLoading(false);
    }
  };

  const editCount = () => {
    setTimeout(async () => {
      if (questionnaire) {
        await getImportResult({
          questionId: questionnaire.id,
          employeeCount: employeeCountRef.current,
        });
        setEditStatus(false);
      }
    });
  };

  const submitImport = async () => {
    if (isNil(importResult)) {
      return;
    }

    try {
      setSubmitLoading(true);
      await submitImportResult({
        computationId,
        computationPeriod,
        sourceList: importResult.sourceList,
      });
      Toast('success', I18N.carbonFootprint.operationSuccessful);
      onResultClose();
      onImportSuccess();
    } finally {
      setSubmitLoading(false);
    }
  };

  useMount(() => getImportResult({ questionId: questionnaire.id }));

  useEffect(() => {
    employeeCountRef.current = importResult?.employeeCount;
  }, [importResult]);

  return (
    <FullscreenModal>
      <CustomDrawer
        open={drawerOpen}
        title={I18N.template(I18N.enterpriseCarbonAccount2.emiss, {
          val1: emissionSource?.name,
        })}
        width={546}
        destroyOnClose
        onClose={() => setDrawerOpen(false)}
        afterOpenChange={open => {
          if (!open) {
            setEmissionSource(null);
          }
        }}
      >
        <EmissionSourceDetails
          questionnaire={questionnaire}
          emissionSource={emissionSource}
        />
      </CustomDrawer>
      <div className={styles.importResult}>
        <div className={styles.resultContent}>
          <div className={styles.resultTitle}>
            {I18N.enterpriseCarbonAccount2.employeeCommutingRemittance}
          </div>
          <div className={styles.resultInfo}>
            <div className={styles.infoItem}>
              <div className={styles.infoDescContent}>
                <span className={styles.infoDesc}>
                  {
                    I18N.enterpriseCarbonAccount2
                      .numberOfQuestionnairesCollected
                  }
                </span>
                <span className={styles.infoUnit}>
                  {I18N.carbonDataManagemen.share}
                </span>
              </div>
              <div className={styles.infoValue}>
                {importResult?.submitCount}
              </div>
            </div>
            <div className={styles.infoItem}>
              <div>
                <span className={styles.infoDesc}>
                  {I18N.questionnaire.employees}
                </span>
                <span className={styles.infoUnit}>
                  {I18N.questionnaire.people}
                </span>
                <IconAlibabaNew
                  className={styles.editIcon}
                  type='icon-a-icon_edit'
                  onClick={() => setEditStatus(!editStatus)}
                />
              </div>
              {editStatus ? (
                <InputNumber
                  className={styles.employeeCountInput}
                  defaultValue={employeeCountRef.current}
                  min={0}
                  controls={false}
                  precision={0}
                  onChange={val => {
                    if (!isNil(val)) {
                      employeeCountRef.current = val;
                    }
                  }}
                  onBlur={editCount}
                />
              ) : (
                <div className={styles.infoValue}>
                  {importResult?.employeeCount}
                </div>
              )}
            </div>
          </div>
          <Table
            rowKey='sourceId'
            loading={loading}
            dataSource={importResult?.sourceList}
            pagination={false}
            scroll={{ x: 1360 }}
            columns={[
              {
                title: I18N.carbonFootprint3.emissionSourceName,
                dataIndex: 'name',
                width: 304,
                ellipsis: true,
                fixed: 'left',
              },
              {
                title: I18N.enterpriseCarbonAccount2.facilityScene,
                dataIndex: 'facility',
                width: 256,
                ellipsis: true,
              },
              {
                title: I18N.enterpriseCarbonAccount2.annualCumulativeTravel,
                dataIndex: 'activityData',
                width: 340,
                ellipsis: true,
                render: (_, record) => {
                  const { activityData } = record;

                  return (
                    <InputNumber
                      className={styles.distanceInput}
                      value={activityData}
                      min={0}
                      controls={false}
                      onChange={val => {
                        if (isNil(val)) {
                          return;
                        }
                        Object.assign(record, {
                          activityData: val,
                        });
                        if (importResult) {
                          setImportResult({ ...importResult });
                        }
                      }}
                    />
                  );
                },
              },
              {
                title:
                  I18N.enterpriseCarbonAccount2.relatedQuestionnaireQuantity,
                dataIndex: 'count',
                width: 256,
                ellipsis: true,
              },
              {
                title: I18N.carbonFootprint.operation,
                dataIndex: '__operate__',
                width: 204,
                fixed: 'right',
                render: (_, record) => (
                  <Button
                    className={styles.operateBtn}
                    type='link'
                    onClick={() => {
                      setDrawerOpen(true);
                      setEmissionSource(record);
                    }}
                  >
                    {I18N.carbonFootprint3.viewDetails}
                  </Button>
                ),
              },
            ]}
          />
        </div>
        <div className={styles.resultFooter}>
          <Button onClick={onResultClose}>{I18N.carbonFootprint.cancel}</Button>
          <Button loading={submitLoading} type='primary' onClick={submitImport}>
            {I18N.base.confirm}
          </Button>
        </div>
      </div>
    </FullscreenModal>
  );
};

export default CommuteImportResult;
