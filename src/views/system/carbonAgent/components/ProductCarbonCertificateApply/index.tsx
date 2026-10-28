import I18N from '@src/lang/I18N';
import { Alert, Button, Form, Spin } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

import certificateHeaderIcon from './assets/certificate-header-icon.svg';
import certificatePointsIcon from './assets/certificate-points-icon.svg';
import { ApplicationForm } from './components/ApplicationForm';
import { ApplicationRecords } from './components/ApplicationRecords';
import { CertificatePreview } from './components/CertificatePreview';
import { PaymentConfirmModal } from './components/PaymentConfirmModal';
import style from './index.module.less';
import { getProductCarbonCertificatePageState } from './pageState';
import type {
  ProductCarbonCertificateApplyProps,
  ProductCarbonCertificateFormValues,
} from './types';
import { useProductCarbonCertificateApplication } from './useProductCarbonCertificateApplication';

const STATUS_CLASS_NAMES: Record<string, string> = {
  approved: style.statusApproved,
  consult_rejected: style.statusRejected,
  pending_review: style.statusPending,
  rejected: style.statusRejected,
};

export default function ProductCarbonCertificateApply(
  props: ProductCarbonCertificateApplyProps,
) {
  const text = I18N.carbonAgent.certificateApplication;
  const [form] = Form.useForm<ProductCarbonCertificateFormValues>();
  const application = useProductCarbonCertificateApplication(props);
  const {
    approved,
    cancelConfirmation,
    confirmOpen,
    confirmSubmit,
    editable,
    info,
    initialValues,
    loading,
    notSubmitted,
    pointCost,
    prepareSubmit,
    rejected,
    status,
    statusName: applicationStatusName,
    submissionLocked,
    submitError,
    submitting,
  } = application;
  const [previewValues, setPreviewValues] =
    useState<ProductCarbonCertificateFormValues>(initialValues);

  useEffect(() => {
    form.setFieldsValue(initialValues);
    setPreviewValues(initialValues);
  }, [form, initialValues]);

  const submitCurrentForm = async () => {
    try {
      const values = await form.validateFields();
      prepareSubmit(values, rejected);
    } catch {
      // Ant Design Form 在字段旁展示校验结果，不发送请求。
    }
  };

  const statusName =
    applicationStatusName ||
    (status === 'approved'
      ? text.statusApproved
      : status === 'not_submitted'
      ? text.statusNotSubmitted
      : rejected
      ? text.statusRejected
      : status || '-');
  const pageState = getProductCarbonCertificatePageState(
    status,
    !props.applicationId,
  );
  const statusHint = pageState.approved
    ? text.approvedHint
    : pageState.rejected
    ? text.rejectedHint
    : pageState.pendingReview
    ? text.pendingHint
    : text.notSubmittedHint;
  const { showForm } = pageState;
  const showRecords = Boolean(
    info && (pageState.showRecords || info.auditRecords?.length),
  );
  const showSubmitButton =
    editable && (pageState.showPaymentSubmit || pageState.showResubmit);
  const submitFooter = showSubmitButton ? (
    <footer
      className={classNames(
        style.submitFooter,
        rejected && style.resubmitFooter,
      )}
    >
      {notSubmitted ? (
        <div className={style.pointCost}>
          <div>
            <img alt='' aria-hidden='true' src={certificatePointsIcon} />
            <strong>{pointCost ?? '-'}</strong>
          </div>
          <p>{text.feeHint}</p>
        </div>
      ) : null}
      <div className={style.submitAction}>
        <Button
          disabled={submitting || submissionLocked}
          loading={submitting}
          type='primary'
          onClick={submitCurrentForm}
        >
          {rejected ? text.resubmit : text.pay}
        </Button>
      </div>
    </footer>
  ) : null;

  return (
    <div className={style.page}>
      <header className={style.header}>
        <img
          alt=''
          aria-hidden='true'
          className={style.headerIcon}
          src={certificateHeaderIcon}
        />
        <div>
          <div className={style.heading}>
            <h2>{text.title}</h2>
            <span>{text.service}</span>
          </div>
          <p>{text.description}</p>
        </div>
      </header>

      <div
        className={classNames(
          style.statusBar,
          rejected && style.statusBarRejected,
        )}
      >
        <span>{text.applicationStatus}</span>
        <strong
          className={
            STATUS_CLASS_NAMES[status || ''] ||
            (pageState.pendingReview ? style.statusPending : undefined)
          }
        >
          {statusName}
        </strong>
        <p>{statusHint}</p>
      </div>

      {submitError ? (
        <Alert
          className={style.pageAlert}
          message={submitError}
          showIcon
          type='warning'
        />
      ) : null}

      <Spin spinning={loading} wrapperClassName={style.pageSpin}>
        <div className={style.columns}>
          <div
            className={classNames(style.leftColumn, {
              [style.rejectedColumn]: rejected,
            })}
          >
            <div className={style.applicationCards}>
              {showForm ? (
                <section className={style.applicationCard}>
                  <div className={style.cardHeader}>
                    <div>
                      <h3>{text.confirmInfo}</h3>
                      <p>{text.formHint}</p>
                    </div>
                  </div>
                  <div className={style.formScroll}>
                    <ApplicationForm
                      disabled={loading || submitting || submissionLocked}
                      form={form}
                      onValuesChange={setPreviewValues}
                    />
                  </div>
                  {!rejected ? submitFooter : null}
                </section>
              ) : null}

              {showRecords && info ? (
                <section className={style.applicationCard}>
                  <ApplicationRecords info={info} />
                </section>
              ) : null}
            </div>
            {rejected ? submitFooter : null}
          </div>

          <CertificatePreview
            approved={approved}
            info={info}
            values={previewValues}
          />
        </div>
      </Spin>

      <PaymentConfirmModal
        open={confirmOpen}
        pointCost={pointCost}
        submitting={submitting}
        onCancel={cancelConfirmation}
        onConfirm={confirmSubmit}
      />
    </div>
  );
}
