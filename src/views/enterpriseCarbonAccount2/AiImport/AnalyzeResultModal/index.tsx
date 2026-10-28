import I18N from '@src/lang/I18N';
import { Button, Modal } from 'antd';
import { FC, useState } from 'react';

import { IconAlibabaNew } from '@/components/iconfont';
import { Toast } from '@/utils';

import CommonResult from './CommonResult';
import TravelResult from './TravelResult';
import styles from './index.module.less';
import {
  cancelAiModel,
  cancelTravelAiModel,
  submitCommon,
  submitTravel,
} from './service';
import { AI_IMPORT_TYPE, IMPORT_STATUS } from '../constant';

type AnalyzeResultModalProps = {
  open: boolean;
  computationId: string;
  computationPeriod: string;
  type?: string;
  importStatus?: number;
  onClose: () => void;
  onSuccess: () => void;
};

const AnalyzeResultModal: FC<AnalyzeResultModalProps> = ({
  open,
  computationId,
  computationPeriod,
  type = AI_IMPORT_TYPE.COMMON,
  importStatus = IMPORT_STATUS.PENDING,
  onClose,
  onSuccess,
}) => {
  const [submitLoading, setSubmitLoading] = useState(false);

  const [analyzing, setAnalyzing] = useState(true);

  const renderTitle = () => {
    let titleText = '';
    switch (type) {
      case AI_IMPORT_TYPE.COMMON:
        titleText = I18N.enterpriseCarbonAccount2.analysisResults;
        break;
      case AI_IMPORT_TYPE.TRAVEL:
        titleText = I18N.enterpriseCarbonAccount2.businessTravelExplanation;
        break;
      default:
        titleText = I18N.enterpriseCarbonAccount2.analysisResults;
        break;
    }
    return (
      <div className={styles.modalTitle}>
        <IconAlibabaNew className={styles.aiIcon} type='icon-icon-AI' />
        <span className={styles.modalTitleText}>{titleText}</span>
      </div>
    );
  };

  const cancel = () => {
    Modal.confirm({
      icon: null,
      title: I18N.base.confirm,
      content: I18N.enterpriseCarbonAccount2.confirmToCancelThis,
      onOk: async () => {
        if (type === AI_IMPORT_TYPE.COMMON) {
          await cancelAiModel({ computationId, computationPeriod });
        }

        if (type === AI_IMPORT_TYPE.TRAVEL) {
          await cancelTravelAiModel({ computationId, computationPeriod });
        }
        Toast('success', I18N.carbonFootprint.operationSuccessful);
        onClose();
      },
    });
  };

  const submit = async () => {
    try {
      setSubmitLoading(true);
      if (type === AI_IMPORT_TYPE.COMMON) {
        const { data } = await submitCommon({
          computationId,
          computationPeriod,
        });
        if (data.data.errorCode) {
          Toast(
            'error',
            data.data.errorMsg || I18N.enterpriseCarbonAccount2.operationFailed,
          );
          return;
        }
      } else if (type === AI_IMPORT_TYPE.TRAVEL) {
        const { data } = await submitTravel({
          computationId,
          computationPeriod,
        });
        if (data.data.errorCode) {
          Toast(
            'error',
            data.data.errorMsg || I18N.enterpriseCarbonAccount2.operationFailed,
          );
          return;
        }
      }
      Toast('success', I18N.carbonFootprint.operationSuccessful);
      onSuccess();
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal
      className={styles.analyzeModal}
      title={renderTitle()}
      open={open}
      width={1380}
      centered
      destroyOnClose
      footer={
        <div className={styles.footer}>
          <Button disabled={analyzing} onClick={cancel}>
            {I18N.enterpriseCarbonAccount2.cancelImport}
          </Button>
          <Button onClick={onClose}>
            {I18N.carbonFootprint3.temporarilyStore}
          </Button>
          <Button
            type='primary'
            loading={submitLoading}
            disabled={analyzing}
            onClick={submit}
          >
            {I18N.enterpriseCarbonAccount2.confirmToAdd}
          </Button>
        </div>
      }
      onCancel={onClose}
      onClose={onClose}
      afterClose={() => setAnalyzing(true)}
    >
      {type === AI_IMPORT_TYPE.COMMON && (
        <CommonResult
          computationId={computationId}
          computationPeriod={computationPeriod}
          importStatus={importStatus}
          onClose={onClose}
          setAnalyzing={setAnalyzing}
        />
      )}
      {type === AI_IMPORT_TYPE.TRAVEL && (
        <TravelResult
          computationId={computationId}
          computationPeriod={computationPeriod}
          importStatus={importStatus}
          onClose={onClose}
          setAnalyzing={setAnalyzing}
        />
      )}
    </Modal>
  );
};

export default AnalyzeResultModal;
