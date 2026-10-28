import I18N from '@src/lang/I18N';
import { Input, Modal } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

import style from '../index.module.less';

type ThirdPartyCertificationType = 'footprint' | 'label';

type ReviewCertificationModalsProps = {
  expertReviewCanApply?: boolean | null;
  expertReviewDisabledReason?: string | null;
  expertReviewOpen: boolean;
  expertReviewPointCost?: number | string | null;
  reviewPurpose: string;
  reviewSubmitting: boolean;
  snapshotUpdateTime: string;
  snapshotVersion: string;
  thirdPartyCertificationOpen: boolean;
  onCloseExpertReview: () => void;
  onCloseThirdPartyCertification: () => void;
  onExpertReviewSubmit: () => void;
  onReviewPurposeChange: (value: string) => void;
  onThirdPartyCertificationSubmit: (type: ThirdPartyCertificationType) => void;
};

const DEFAULT_THIRD_PARTY_CERTIFICATION_TYPE: ThirdPartyCertificationType =
  'footprint';
const MAX_EXPERT_REVIEW_PURPOSE_LENGTH = 300;

const ReviewCertificationModals = ({
  expertReviewCanApply,
  expertReviewDisabledReason,
  expertReviewOpen,
  expertReviewPointCost,
  reviewPurpose,
  reviewSubmitting,
  snapshotUpdateTime,
  snapshotVersion,
  thirdPartyCertificationOpen,
  onCloseExpertReview,
  onCloseThirdPartyCertification,
  onExpertReviewSubmit,
  onReviewPurposeChange,
  onThirdPartyCertificationSubmit,
}: ReviewCertificationModalsProps) => {
  const [thirdPartyCertificationType, setThirdPartyCertificationType] =
    useState<ThirdPartyCertificationType>(
      DEFAULT_THIRD_PARTY_CERTIFICATION_TYPE,
    );
  const isFootprintCertification = thirdPartyCertificationType === 'footprint';
  const isLabelCertification = thirdPartyCertificationType === 'label';
  const expertReviewSubmitDisabled =
    reviewSubmitting || expertReviewCanApply === false;
  const pointCostText =
    expertReviewPointCost === undefined ||
    expertReviewPointCost === null ||
    String(expertReviewPointCost).trim() === ''
      ? I18N.carbonAgent.expertReviewPointsCostAmount
      : String(expertReviewPointCost).trim();
  const disabledReason = expertReviewDisabledReason?.trim();
  const handleThirdPartyCertificationSubmit = () => {
    onThirdPartyCertificationSubmit(thirdPartyCertificationType);
  };

  useEffect(() => {
    if (thirdPartyCertificationOpen) {
      setThirdPartyCertificationType(DEFAULT_THIRD_PARTY_CERTIFICATION_TYPE);
    }
  }, [thirdPartyCertificationOpen]);

  return (
    <>
      <Modal
        centered
        className={style.expertReviewModal}
        closable={false}
        destroyOnClose
        footer={null}
        keyboard={!reviewSubmitting}
        maskClosable={!reviewSubmitting}
        open={expertReviewOpen}
        rootClassName={style.expertReviewModalRoot}
        width={560}
        onCancel={onCloseExpertReview}
      >
        <div className={style.expertReviewLayout}>
          <div className={style.expertReviewHeader}>
            <h2>{I18N.carbonAgent.expertReviewModalTitle}</h2>
            <button
              aria-label={I18N.carbonAgent.closeDialog}
              className={style.expertReviewCloseButton}
              disabled={reviewSubmitting}
              type='button'
              onClick={onCloseExpertReview}
            >
              ×
            </button>
          </div>
          <div className={style.expertReviewContent}>
            <p className={style.expertReviewIntro}>
              {I18N.carbonAgent.expertReviewIntro}
            </p>

            <div className={style.expertReviewSnapshot}>
              <div className={style.expertReviewSnapshotMeta}>
                <span>{I18N.carbonAgent.expertReviewSnapshot}</span>
                <span className={style.expertReviewSnapshotTime}>
                  <span>
                    {I18N.carbonAgent.expertReviewSnapshotUpdatedAtLabel}
                  </span>
                  <strong>{snapshotUpdateTime}</strong>
                </span>
              </div>
              <strong>{I18N.carbonAgent.expertReviewCurrentModel}</strong>
              <p>
                {I18N.template(I18N.carbonAgent.expertReviewSnapshotModalHint, {
                  val1: snapshotVersion,
                })}
              </p>
            </div>

            <div className={style.expertReviewSection}>
              <div className={style.expertReviewSectionTitle}>
                {I18N.carbonAgent.expertReviewGoal}
              </div>
              <div className={style.expertReviewRemarkBox}>
                <Input.TextArea
                  className={style.expertReviewRemarkInput}
                  disabled={expertReviewSubmitDisabled}
                  maxLength={MAX_EXPERT_REVIEW_PURPOSE_LENGTH}
                  placeholder={I18N.carbonAgent.expertReviewGoalPlaceholder}
                  rows={4}
                  value={reviewPurpose}
                  onChange={event => onReviewPurposeChange(event.target.value)}
                />
              </div>
              {expertReviewCanApply === false && disabledReason ? (
                <div className={style.expertReviewDisabledReason}>
                  {disabledReason}
                </div>
              ) : null}
            </div>
          </div>
          <div className={style.expertReviewFooter}>
            <div className={style.expertReviewCost}>
              <span>{I18N.carbonAgent.expertReviewPointsCostLabel}</span>
              <span
                className={style.expertReviewPointsIcon}
                aria-hidden='true'
              />
              <strong>{pointCostText}</strong>
            </div>
            <button
              className={style.expertReviewSubmitButton}
              disabled={expertReviewSubmitDisabled}
              type='button'
              onClick={onExpertReviewSubmit}
            >
              {reviewSubmitting
                ? I18N.carbonAgent.expertReviewSubmitting
                : I18N.carbonAgent.expertReviewConfirm}
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        centered
        className={style.expertReviewModal}
        closable={false}
        destroyOnClose
        footer={null}
        open={thirdPartyCertificationOpen}
        rootClassName={style.expertReviewModalRoot}
        width={560}
        onCancel={onCloseThirdPartyCertification}
      >
        <div className={style.thirdPartyCertificationLayout}>
          <div className={style.thirdPartyCertificationMain}>
            <div className={style.thirdPartyCertificationHeader}>
              <h2>{I18N.carbonAgent.thirdPartyCertificationModalTitle}</h2>
              <button
                aria-label={I18N.carbonAgent.closeDialog}
                className={style.expertReviewCloseButton}
                type='button'
                onClick={onCloseThirdPartyCertification}
              >
                ×
              </button>
            </div>
            <div className={style.thirdPartyCertificationContent}>
              <p className={style.thirdPartyCertificationIntro}>
                {I18N.carbonAgent.thirdPartyCertificationIntro}
              </p>

              <div className={style.thirdPartyCertificationTypeSection}>
                <div className={style.thirdPartyCertificationSectionTitle}>
                  {I18N.carbonAgent.thirdPartyCertificationType}
                </div>
                <div className={style.thirdPartyCertificationOptionList}>
                  <button
                    aria-pressed={isFootprintCertification}
                    className={classNames(
                      style.thirdPartyCertificationOption,
                      isFootprintCertification &&
                        style.thirdPartyCertificationOptionActive,
                    )}
                    type='button'
                    onClick={() => setThirdPartyCertificationType('footprint')}
                  >
                    <strong>
                      {I18N.carbonAgent.thirdPartyCertificationFootprintTitle}
                    </strong>
                    <span>
                      {
                        I18N.carbonAgent
                          .thirdPartyCertificationFootprintDescription
                      }
                    </span>
                  </button>
                  <button
                    aria-pressed={isLabelCertification}
                    className={classNames(
                      style.thirdPartyCertificationOption,
                      isLabelCertification &&
                        style.thirdPartyCertificationOptionActive,
                    )}
                    type='button'
                    onClick={() => setThirdPartyCertificationType('label')}
                  >
                    <strong>
                      {I18N.carbonAgent.thirdPartyCertificationLabelTitle}
                    </strong>
                    <span>
                      {I18N.carbonAgent.thirdPartyCertificationLabelDescription}
                    </span>
                  </button>
                </div>
              </div>

              <div className={style.thirdPartyCertificationInfo}>
                <div className={style.thirdPartyCertificationInfoItem}>
                  <span>
                    {I18N.carbonAgent.thirdPartyCertificationReferencePrice}
                  </span>
                  <strong>
                    {
                      I18N.carbonAgent
                        .thirdPartyCertificationReferencePriceValue
                    }
                  </strong>
                </div>
                <div className={style.thirdPartyCertificationInfoItem}>
                  <span>
                    {I18N.carbonAgent.thirdPartyCertificationActualQuote}
                  </span>
                  <strong>
                    {I18N.carbonAgent.thirdPartyCertificationActualQuoteValue}
                  </strong>
                </div>
                <div className={style.thirdPartyCertificationInfoItem}>
                  <span>
                    {I18N.carbonAgent.thirdPartyCertificationPaymentMethod}
                  </span>
                  <strong>
                    {I18N.carbonAgent.thirdPartyCertificationPaymentMethodValue}
                  </strong>
                </div>
              </div>
            </div>
          </div>
          <div
            className={classNames(
              style.expertReviewFooter,
              style.thirdPartyCertificationFooter,
            )}
          >
            <div className={style.thirdPartyCertificationFooterActions}>
              <button
                className={style.thirdPartyCertificationSecondaryButton}
                type='button'
                onClick={onCloseThirdPartyCertification}
              >
                {I18N.carbonAgent.cancel}
              </button>
              <button
                className={classNames(
                  style.expertReviewSubmitButton,
                  style.thirdPartyCertificationPrimaryButton,
                )}
                type='button'
                onClick={handleThirdPartyCertificationSubmit}
              >
                {I18N.carbonAgent.thirdPartyCertificationConfirm}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export type { ThirdPartyCertificationType };
export default ReviewCertificationModals;
