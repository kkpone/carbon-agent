import { NumberPicker } from '@formily/antd-v5';
import I18N from '@src/lang/I18N';
import Animation from '@views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/BuildModelDescribe/components/AiModal/animations.json';
import { useMount, useUnmount } from 'ahooks';
import {
  Button,
  Modal,
  Progress,
  Table,
  TableColumnsType,
  Tooltip,
} from 'antd';
import { FC, useEffect, useRef, useState } from 'react';
import Lottie from 'react-lottie-player';

import AiImg from '@/assets/svg/ai.svg';
import { IconAlibabaNew } from '@/components/iconfont';
import { Toast } from '@/utils';
import { IMPORT_STATUS } from '@/views/enterpriseCarbonAccount2/AiImport/constant';

import TravelDetailsDrawer from './TravelDetailsDrawer';
import styles from './index.module.less';
import {
  cancelImportResult,
  editImportResult,
  getImportResult,
  submitImportResult,
} from './service';
import { getImportStatus } from '../TravelImport/service';

const ResultContent: FC<{
  importStatus: number;
  computationId: string;
  computationPeriod?: string;
  onClose: () => void;
  onImportSuccess: () => void;
}> = props => {
  const {
    importStatus: importStatusFromProps,
    computationId,
    computationPeriod,
    onClose,
    onImportSuccess,
  } = props;

  const [importStatus, setImportStatus] = useState(() => importStatusFromProps);

  const [progress, setProgress] = useState(0);

  const [importResult, setImportResult] = useState<{
    travel: Record<string, any>[];
    hotel: Record<string, any>[];
  }>({ travel: [], hotel: [] });

  const [loading, setLoading] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const timer = useRef<NodeJS.Timeout>();

  const loopImportStatus = async (arg: {
    prevProgress: number;
    computationId: string;
    computationPeriod?: string;
  }) => {
    const { data } = await getImportStatus({
      computationId: arg.computationId,
      computationPeriod: arg.computationPeriod,
    });
    const status = data.data;

    const newProgress = Number(
      Math.min(95, 0.5 + Math.random() + arg.prevProgress).toFixed(2),
    );
    setImportStatus(status);
    setProgress(newProgress);

    if (status === IMPORT_STATUS.NOT_EXIST_OR_FAIL) {
      Toast('error', I18N.enterpriseCarbonAccount2.analysisFailed);
      onClose();
    }

    if (status === IMPORT_STATUS.PENDING) {
      timer.current = setTimeout(
        () =>
          loopImportStatus({
            ...arg,
            prevProgress: newProgress,
          }),
        1000,
      );
    }
  };

  const getResult = async (params: {
    computationId: string;
    computationPeriod?: string;
  }) => {
    try {
      setLoading(true);
      const { data } = await getImportResult(params);
      setImportResult(data.data);
    } finally {
      setLoading(false);
    }
  };

  const editResult = async data => {
    await editImportResult(data);
    Toast('success', I18N.carbonFootprint.editSuccessful);
    getResult({ computationId, computationPeriod });
  };

  const cancelResult = () => {
    Modal.confirm({
      title: I18N.base.confirm,
      content: I18N.enterpriseCarbonAccount2.confirmToCancelThis,
      onOk: async () => {
        await cancelImportResult({ computationId, computationPeriod });
        Toast('success', I18N.carbonFootprint.operationSuccessful);
        onClose();
      },
    });
  };

  const submitResult = async () => {
    try {
      setSubmitLoading(true);
      await submitImportResult({ computationId, computationPeriod });
      Toast('success', I18N.carbonFootprint.operationSuccessful);
      onImportSuccess();
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns: (
    type: string,
  ) => TableColumnsType<Record<string, any>> = type => {
    const isTravel = type === 'travel';
    return [
      {
        title: I18N.carbonFootprint3.emissionSourceName,
        dataIndex: 'name',
        width: 228,
        ellipsis: true,
        fixed: 'left',
      },
      {
        title: I18N.enterpriseCarbonAccount2.facilityScene,
        dataIndex: 'facility',
        width: 286,
        ellipsis: true,
      },
      {
        title: isTravel
          ? I18N.enterpriseCarbonAccount2.travelDistanceP
          : I18N.enterpriseCarbonAccount2.accommodationDays,
        dataIndex: 'activityData',
        width: 286,
        ellipsis: true,
        render: (_, record) => (
          <NumberPicker
            className={styles.activityDataInput}
            value={record.activityData}
            min={0}
            controls={false}
            placeholder={
              isTravel
                ? I18N.enterpriseCarbonAccount2.travelDistance
                : I18N.enterpriseCarbonAccount2.accommodationDays
            }
            onChange={val => {
              Object.assign(record, { activityData: val });
              setImportResult({ ...importResult });
            }}
            onBlur={() => {
              setTimeout(() => {
                editResult({
                  id: record.id,
                  activityData: record.activityData,
                });
              });
            }}
          />
        ),
      },
      {
        title: I18N.enterpriseCarbonAccount2.relatedDataVolume,
        dataIndex: 'dataCount',
        width: 316,
        ellipsis: true,
        render: (text, data) => (
          <div className={styles.dataCount}>
            <span>{text}</span>
            {!!data.errorFlag && (
              <Tooltip title={I18N.enterpriseCarbonAccount2.missingData}>
                <IconAlibabaNew
                  className={styles.dataCountIcon}
                  type='icon-icon-tishi'
                />
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        title: I18N.carbonFootprint.operation,
        dataIndex: '__operate__',
        width: 174,
        fixed: 'right',
        render: (_, record) => (
          <TravelDetailsDrawer
            record={record}
            onClose={() => getResult({ computationId, computationPeriod })}
          >
            <Button className={styles.operateBtn} type='link'>
              {I18N.carbonFootprint3.viewDetails}
            </Button>
          </TravelDetailsDrawer>
        ),
      },
    ];
  };

  useMount(() => {
    if (importStatus === IMPORT_STATUS.PENDING) {
      loopImportStatus({
        prevProgress: progress,
        computationId,
        computationPeriod,
      });
    }
  });

  useUnmount(() => {
    clearInterval(timer.current);
  });

  useEffect(() => {
    if (importStatus === IMPORT_STATUS.DONE) {
      getResult({ computationId, computationPeriod });
    }
  }, [importStatus, computationId, computationPeriod]);

  return (
    <div className={styles.content}>
      {importStatus === IMPORT_STATUS.DONE ? (
        <>
          <div className={styles.importContent}>
            <div className={styles.header}>
              <div className={styles.title}>
                <img alt='' src={AiImg} />
                {I18N.enterpriseCarbonAccount2.businessTravelExplanation}
              </div>
            </div>
            <div>
              <div className={styles.tableTitle}>
                {I18N.enterpriseCarbonAccount2.travel}
              </div>
              <Table
                rowKey='id'
                loading={loading}
                scroll={{ x: 1290 }}
                pagination={false}
                dataSource={importResult.travel}
                columns={columns('travel')}
              />
            </div>
            <div>
              <div className={styles.tableTitle}>
                {I18N.enterpriseCarbonAccount2.stay}
              </div>
              <Table
                rowKey='id'
                loading={loading}
                scroll={{ x: 1290 }}
                pagination={false}
                dataSource={importResult.hotel}
                columns={columns('lodging')}
              />
            </div>
          </div>
          <div className={styles.footer}>
            <Button onClick={cancelResult}>
              {I18N.enterpriseCarbonAccount2.cancelImport}
            </Button>
            <Button onClick={onClose}>
              {I18N.carbonFootprint3.temporarilyStore}
            </Button>
            <Button
              type='primary'
              loading={submitLoading}
              onClick={submitResult}
            >
              {I18N.enterpriseCarbonAccount2.confirmToAdd}
            </Button>
          </div>
        </>
      ) : (
        <div className={styles.animationContent}>
          <div className={styles.closeIcon}>
            <IconAlibabaNew type='icon-icon-guanbi' onClick={onClose} />
          </div>
          <Lottie
            className={styles.lottie}
            animationData={Animation}
            loop
            play
          />
          <Progress
            className={styles.progress}
            percent={progress}
            status='active'
          />
          <div className={styles.pendingText}>
            {I18N.enterpriseCarbonAccount2.dataImportInProgress}
          </div>
        </div>
      )}
    </div>
  );
};

const TravelImportResult: FC<{
  open: boolean;
  importStatus: number;
  computationId: string;
  computationPeriod?: string;
  onClose: () => void;
  onImportSuccess: () => void;
}> = props => {
  const {
    open,
    importStatus,
    computationId,
    computationPeriod,
    onClose,
    onImportSuccess,
  } = props;

  return (
    <Modal
      className={styles.fullscreenModal}
      width='100%'
      open={open}
      title={null}
      footer={null}
      closeIcon={null}
      destroyOnClose
    >
      <ResultContent
        importStatus={importStatus}
        computationId={computationId}
        computationPeriod={computationPeriod}
        onImportSuccess={onImportSuccess}
        onClose={onClose}
      />
    </Modal>
  );
};

export default TravelImportResult;
