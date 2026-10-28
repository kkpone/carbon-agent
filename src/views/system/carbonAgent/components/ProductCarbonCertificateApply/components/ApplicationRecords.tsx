import avatarIcon from '@src/assets/svg/icon_avatar.svg';
import I18N from '@src/lang/I18N';
import { Empty } from 'antd';
import classNames from 'classnames';

import approvedIcon from '../assets/certificate-record-approved.svg';
import rejectedIcon from '../assets/certificate-record-rejected.svg';
import submittedIcon from '../assets/certificate-record-submitted.svg';
import { isProductCarbonCertificateRejected } from '../data';
import style from '../index.module.less';
import type {
  ProductCarbonCertificateApplication,
  ProductCarbonCertificateAuditRecord,
} from '../types';

function getAuditRecordState(record: ProductCarbonCertificateAuditRecord) {
  const actionCode = String(record.actionCode || '').toUpperCase();
  const rejected =
    isProductCarbonCertificateRejected(record.toStatus) ||
    actionCode.includes('REJECT') ||
    actionCode.includes('FAIL');
  const approved =
    record.toStatus === 'approved' ||
    actionCode.includes('APPROVE') ||
    actionCode.includes('PASS');

  return {
    approved,
    icon: rejected ? rejectedIcon : approved ? approvedIcon : submittedIcon,
    rejected,
    submitted: !approved && !rejected,
  };
}

function AuditRecordItem({
  record,
}: {
  record: ProductCarbonCertificateAuditRecord;
}) {
  const text = I18N.carbonAgent.certificateApplication;
  const state = getAuditRecordState(record);
  const title =
    record.actionName ||
    (state.approved
      ? text.auditApproved
      : state.rejected
      ? text.auditRejected
      : text.auditSubmitted);
  const time = record.operateTime || '-';
  const { operatorName } = record;
  const comment = record.remark;
  const version =
    record.version == null
      ? undefined
      : I18N.template(text.version, { val1: record.version });

  return (
    <div className={style.auditRecordItem}>
      <div className={style.auditRecordContent}>
        <div
          className={classNames(style.auditRecordTitle, {
            [style.auditRecordTitleApproved]: state.approved,
            [style.auditRecordTitleRejected]: state.rejected,
          })}
        >
          <img alt='' aria-hidden='true' src={state.icon} />
          <strong>{title}</strong>
        </div>
        <div className={style.auditRecordMeta}>
          <time>{time}</time>
          {operatorName ? (
            <span className={style.auditRecordOperator}>
              <img alt='' aria-hidden='true' src={avatarIcon} />
              <span>
                {state.submitted ? text.applicant : text.reviewer}
                {operatorName}
              </span>
            </span>
          ) : null}
        </div>
        {comment ? (
          <p
            className={classNames(style.auditRecordComment, {
              [style.auditRecordCommentRejected]: state.rejected,
            })}
          >
            {state.rejected ? [text.rejectReason, '：'].join('') : null}
            {comment}
          </p>
        ) : null}
      </div>
      {state.submitted && version ? (
        <span className={style.auditRecordVersion}>{version}</span>
      ) : null}
    </div>
  );
}

function LatestSubmittedInfo({
  info,
}: {
  info: ProductCarbonCertificateApplication;
}) {
  const text = I18N.carbonAgent.certificateApplication;
  const rows = [
    [text.productName, info.productName],
    [text.functionalUnit, info.functionalUnit],
    [
      text.accountingPeriod,
      [info.accountingStartDate || '-', text.to, info.accountingEndDate || '-']
        .join(' ')
        .trim(),
    ],
    [text.unitEmission, info.unitEmission],
    [text.accountingStandard, info.accountingStandard],
    [text.certificateType, text.certificateTypeValue],
    [text.accountingBoundary, info.accountingBoundary],
  ];

  return (
    <div className={style.latestInfo}>
      <h4>{text.latestInfo}</h4>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}：</dt>
            <dd>
              {label === text.certificateType ? (
                <span className={style.certificateTypeTag}>{value || '-'}</span>
              ) : (
                value || '-'
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ApplicationRecords({
  info,
}: {
  info: ProductCarbonCertificateApplication;
}) {
  const text = I18N.carbonAgent.certificateApplication;
  const auditRecords = info.auditRecords || [];

  return (
    <section className={style.records}>
      <div className={style.recordsHeading}>
        <div>
          <h3>{text.records}</h3>
          <p>{text.recordsHint}</p>
        </div>
        <span>
          {I18N.template(text.recordCount, { val1: auditRecords.length })}
        </span>
      </div>
      {auditRecords.length ? (
        <div className={style.auditRecordList}>
          {auditRecords.map((record, index) => (
            <AuditRecordItem
              key={[
                record.id ?? record.version ?? index,
                record.operateTime || index,
              ].join(':')}
              record={record}
            />
          ))}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      <LatestSubmittedInfo info={info} />
    </section>
  );
}
