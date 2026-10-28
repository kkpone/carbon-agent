/**
 * @file 企业碳专属专家复核申请弹窗，承载企业核算快照、复核目标和提交限制。
 */
import I18N from '@src/lang/I18N';
import { Input, Modal } from 'antd';

import style from './index.module.less';
import type { EnterpriseCarbonExpertReviewModalProps } from './types';
import { MAX_ENTERPRISE_CARBON_EXPERT_REVIEW_PURPOSE_LENGTH } from '../constants';
import type { EnterpriseCarbonExpertReviewSnapshot } from '../types';

const getDisplayText = (value?: number | string | null) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return '-';
  }

  return String(value).trim();
};

const getPointCostText = (value?: number | string | null) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return I18N.carbonAgent.expertReviewPointsCostAmount;
  }

  return String(value).trim();
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.replace(/-/g, '.');
  }

  const pad = (timeValue: number) => String(timeValue).padStart(2, '0');

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
};

const getSnapshot = (
  props: EnterpriseCarbonExpertReviewModalProps,
): EnterpriseCarbonExpertReviewSnapshot => {
  const snapshot: EnterpriseCarbonExpertReviewSnapshot = {
    ...props.context?.snapshot,
  };
  const { prepareInfo } = props;

  if (!prepareInfo) {
    return snapshot;
  }

  /*
   * prepare 返回的是企业接口平铺字段。
   * 弹窗在展示层将这些字段放入对应位置，不改写接口返回对象。
   */
  if (prepareInfo.accountName) {
    snapshot.title = prepareInfo.accountName;
  }

  if (prepareInfo.accountScope) {
    snapshot.accountingScope = prepareInfo.accountScope;
  }

  if (prepareInfo.periodName) {
    snapshot.accountingPeriod = prepareInfo.periodName;
  }

  if (prepareInfo.standardName) {
    snapshot.accountingStandard = prepareInfo.standardName;
  }

  if (prepareInfo.emissionUnit) {
    snapshot.emissionUnit = prepareInfo.emissionUnit;
  }

  if (
    prepareInfo.totalEmission !== undefined &&
    prepareInfo.totalEmission !== null
  ) {
    snapshot.totalEmission = prepareInfo.totalEmission;
  }

  if (prepareInfo.modelUpdateTime) {
    snapshot.updateTime = prepareInfo.modelUpdateTime;
  }

  return snapshot;
};

const getSnapshotTitle = (
  snapshot: EnterpriseCarbonExpertReviewSnapshot,
  year?: string,
) => {
  if (snapshot.title) {
    return snapshot.title;
  }

  if (year) {
    return I18N.template(I18N.carbonAgent.enterpriseCarbonAccountingYearTitle, {
      val1: year,
    });
  }

  return I18N.carbonAgent.enterpriseCarbonExpertReviewCurrentAccounting;
};

const EnterpriseCarbonExpertReviewModal = (
  props: EnterpriseCarbonExpertReviewModalProps,
) => {
  const {
    context,
    open,
    prepareInfo,
    purpose,
    submitting,
    onCancel,
    onPurposeChange,
    onSubmit,
  } = props;
  const snapshot = getSnapshot(props);
  const disabledReason = prepareInfo?.disabledReason?.trim();
  const submitDisabled = submitting || prepareInfo?.canApply === false;
  const pointCost = getPointCostText(prepareInfo?.pointCost);
  const snapshotTitle = getSnapshotTitle(snapshot, context?.year);
  const totalEmission = [
    getDisplayText(snapshot.totalEmission),
    snapshot.emissionUnit,
  ]
    .filter(value => value && value !== '-')
    .join(' ');
  let submitLabel = I18N.carbonAgent.expertReviewConfirm;

  if (submitting) {
    submitLabel = I18N.carbonAgent.expertReviewSubmitting;
  }

  return (
    <Modal
      centered
      className={style.modal}
      closable={false}
      destroyOnClose
      footer={null}
      keyboard={!submitting}
      maskClosable={!submitting}
      open={open}
      rootClassName={style.modalRoot}
      width={560}
      onCancel={onCancel}
    >
      <div className={style.layout}>
        <div className={style.main}>
          <header className={style.header}>
            <h2>{I18N.carbonAgent.expertReviewModalTitle}</h2>
            <button
              aria-label={I18N.carbonAgent.closeDialog}
              className={style.closeButton}
              disabled={submitting}
              type='button'
              onClick={onCancel}
            />
          </header>

          <div className={style.content}>
            <p className={style.intro}>
              {I18N.carbonAgent.enterpriseCarbonExpertReviewIntro}
            </p>

            <div className={style.snapshotCard}>
              <section className={style.snapshotCardInner}>
                <div className={style.snapshotMeta}>
                  <span>{I18N.carbonAgent.expertReviewSnapshot}</span>
                  <span className={style.snapshotTime}>
                    {I18N.carbonAgent.enterpriseCarbonExpertReviewUpdatedAt}
                    <strong>{formatDateTime(snapshot.updateTime)}</strong>
                  </span>
                </div>
                <strong className={style.snapshotTitle}>{snapshotTitle}</strong>
                <div className={style.snapshotMetrics}>
                  <span className={style.snapshotScope}>
                    {I18N.template(
                      I18N.carbonAgent.enterpriseCarbonAccountingScopeDisplay,
                      { val1: getDisplayText(snapshot.accountingScope) },
                    )}
                  </span>
                  <span>
                    {I18N.template(
                      I18N.carbonAgent.enterpriseCarbonAccountingPeriodDisplay,
                      { val1: getDisplayText(snapshot.accountingPeriod) },
                    )}
                  </span>
                  <span>
                    {I18N.template(
                      I18N.carbonAgent
                        .enterpriseCarbonAccountingStandardDisplay,
                      { val1: getDisplayText(snapshot.accountingStandard) },
                    )}
                  </span>
                  <div className={style.totalEmission}>
                    <span>
                      {I18N.template(
                        I18N.carbonAgent.enterpriseCarbonTotalEmissionDisplay,
                        { val1: '' },
                      ).trim()}
                    </span>
                    <strong>{totalEmission || '-'}</strong>
                  </div>
                </div>
                <p className={style.snapshotHint}>
                  {I18N.carbonAgent.enterpriseCarbonExpertReviewSnapshotHint}
                </p>
              </section>
            </div>

            <section className={style.goalSection}>
              <h3>{I18N.carbonAgent.expertReviewGoal}</h3>
              <Input.TextArea
                className={style.goalInput}
                disabled={submitDisabled}
                maxLength={MAX_ENTERPRISE_CARBON_EXPERT_REVIEW_PURPOSE_LENGTH}
                placeholder={
                  I18N.carbonAgent.enterpriseCarbonExpertReviewGoalPlaceholder
                }
                rows={4}
                value={purpose}
                onChange={event => onPurposeChange(event.target.value)}
              />
              {prepareInfo?.canApply === false && disabledReason && (
                <p className={style.disabledReason}>{disabledReason}</p>
              )}
            </section>
          </div>
        </div>

        <footer className={style.footer}>
          <div className={style.cost}>
            <span>{I18N.carbonAgent.expertReviewPointsCostLabel}</span>
            <span className={style.pointsIcon} aria-hidden='true' />
            <strong>{pointCost}</strong>
          </div>
          <button
            className={style.submitButton}
            disabled={submitDisabled}
            type='button'
            onClick={onSubmit}
          >
            {submitLabel}
          </button>
        </footer>
      </div>
    </Modal>
  );
};

export default EnterpriseCarbonExpertReviewModal;
