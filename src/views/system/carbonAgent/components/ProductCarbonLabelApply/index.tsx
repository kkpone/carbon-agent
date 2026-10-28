import I18N from '@src/lang/I18N';
import {
  ApplyForAccountStatus,
  ApplyForAccountStatusLabel,
} from '@src/views/carbonFootprint3/CarbonLabel/constant';
import { Alert, Button, Spin } from 'antd';
import classNames from 'classnames';

import applicationIcon from './assets/application.svg';
import pointsIcon from './assets/points.svg';
import { ApplicationForm } from './components/ApplicationForm';
import { ApplicationPreview } from './components/ApplicationPreview';
import { ApplicationRecords } from './components/ApplicationRecords';
import { PaymentConfirmModal } from './components/PaymentConfirmModal';
import { isApplicationEditable } from './data';
import style from './index.module.less';
import type { ProductCarbonLabelApplyProps } from './types';
import { useLabelApplication } from './useLabelApplication';

const { TO_BE_SUB, REVIEWED_ERR } = ApplyForAccountStatus;

/** 产品碳 Agent 的独立申请页；父级只传入来源 ID 和提交完成回调。 */
export default function ProductCarbonLabelApply(
  props: ProductCarbonLabelApplyProps,
) {
  const text = I18N.carbonAgent.labelApplication;
  const {
    applicationId,
    info,
    preview,
    pointCost,
    auditRecords,
    form,
    loading,
    confirmOpen,
    submitting,
    submitError,
    status,
    rejected,
    approved,
    editable,
    canSubmit,
    statusHint,
    prepareSubmit,
    confirmSubmit,
    cancelConfirmation,
  } = useLabelApplication(props);
  const showEditableApplication =
    isApplicationEditable(status) && !(applicationId && !info);

  const recordHeader = (
    <div className={style.cardHeader}>
      <div className={style.recordHeading}>
        <h3>{I18N.carbonFootprint3.applicationRecord}</h3>
        <span>
          {I18N.template(text.recordCount, { val1: auditRecords.length })}
        </span>
      </div>
      <p>{text.recordHint}</p>
    </div>
  );
  const submitFooter = showEditableApplication ? (
    <footer
      className={classNames(style.footer, {
        [style.resubmitFooter]: rejected,
      })}
    >
      {!rejected && (
        <div>
          <strong
            className={style.price}
            aria-label={`${pointCost ?? '-'} ${text.points}`}
          >
            <img src={pointsIcon} width={20} height={20} alt='' />
            {pointCost ?? '-'}
          </strong>
          <p>{text.feeHint}</p>
        </div>
      )}
      <Button
        type='primary'
        loading={submitting}
        disabled={!editable || !canSubmit}
        onClick={prepareSubmit}
      >
        {rejected ? text.resubmit : text.pay}
      </Button>
    </footer>
  ) : null;

  return (
    <div className={style.page}>
      <header className={style.header}>
        <img className={style.headerIcon} src={applicationIcon} alt='' />
        <div className={style.headerContent}>
          <div className={style.heading}>
            <h2>{text.title}</h2>
            <span className={style.serviceTag}>{text.service}</span>
          </div>
          <p>{text.description}</p>
        </div>
      </header>
      <div className={style.statusBar}>
        <div className={style.statusLabel}>
          <span>{I18N.carbonFootprint3.applicationStatus}：</span>
          <span
            className={classNames(style.statusTag, {
              [style.statusApproved]: approved,
              [style.statusRejected]: rejected || status === REVIEWED_ERR,
            })}
          >
            {info
              ? ApplyForAccountStatusLabel[status ?? TO_BE_SUB] || '-'
              : '-'}
          </span>
        </div>
        <span className={style.statusHint}>{statusHint}</span>
      </div>
      {submitError && <Alert showIcon type='error' message={submitError} />}
      <Spin spinning={loading}>
        <div className={style.columns}>
          <div
            className={classNames(style.applicationColumn, {
              [style.rejectedColumn]: rejected,
            })}
          >
            <div className={style.applicationCards}>
              <div className={style.applicationCard}>
                {showEditableApplication ? (
                  <div className={style.cardHeader}>
                    <h3>{text.confirmInfo}</h3>
                    <p>{text.formHint}</p>
                  </div>
                ) : (
                  recordHeader
                )}
                <div className={style.applicationContent}>
                  {info?.errorCode ? (
                    <Alert type='error' message={text.sourceDeleted} />
                  ) : null}
                  {showEditableApplication ? (
                    <div className={style.formArea}>
                      <ApplicationForm
                        form={form}
                        disabled={submitting || !editable}
                      />
                    </div>
                  ) : null}
                  {!rejected && applicationId && (
                    <ApplicationRecords
                      info={info}
                      auditRecords={auditRecords}
                      showHeading={showEditableApplication}
                    />
                  )}
                </div>
                {!rejected && submitFooter}
              </div>
              {rejected && applicationId && (
                <div className={style.applicationCard}>
                  {recordHeader}
                  <ApplicationRecords
                    info={info}
                    auditRecords={auditRecords}
                    showHeading={false}
                  />
                </div>
              )}
            </div>
            {rejected && submitFooter}
          </div>
          <ApplicationPreview
            preview={preview}
            approved={approved}
            canDownload={approved && Boolean(info?.applyNum)}
          />
        </div>
      </Spin>
      <PaymentConfirmModal
        pointCost={pointCost}
        open={confirmOpen}
        submitting={submitting}
        onCancel={cancelConfirmation}
        onConfirm={confirmSubmit}
      />
    </div>
  );
}
