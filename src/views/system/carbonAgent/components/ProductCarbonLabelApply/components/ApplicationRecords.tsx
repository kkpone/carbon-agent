import I18N from '@src/lang/I18N';
import { AuditList } from '@src/views/carbonFootprint3/CarbonLabel/component/AuditList';
import type { AuditListData } from '@src/views/carbonFootprint3/CarbonLabel/component/AuditList/type';
import { Empty } from 'antd';

import { getApplicationEmissionUnit } from '../data';
import style from '../index.module.less';
import type { ApplicationInfo } from '../types';

function SubmittedInfo({ info }: { info: ApplicationInfo }) {
  const items = [
    [I18N.carbonFootprint.productName, info.productName],
    [I18N.carbonFootprint3.functionalUnits, info.accountName],
    [
      I18N.carbonFootprint.accountingCycle,
      info.startTime && info.endTime
        ? `${info.startTime} ${I18N.carbonAgent.labelApplication.to} ${info.endTime}`
        : '-',
    ],
    [
      I18N.carbonFootprint3.unitEmissions,
      `${info.accountObj?.perEmission ?? '-'} ${getApplicationEmissionUnit(
        info,
      )}`,
    ],
    [
      I18N.carbonAgent.labelApplication.labelTypeTitle,
      I18N.carbonAgent.labelApplication.labelType,
    ],
  ];
  return (
    <div className={style.submittedInfo}>
      <h4>{I18N.carbonAgent.labelApplication.latestInfo}</h4>
      <dl>
        {items.map(([label, value]) => (
          <div key={label}>
            <dt>{label}：</dt>
            <dd>
              {label === I18N.carbonAgent.labelApplication.labelTypeTitle ? (
                <span className={style.labelTypeTag}>{value}</span>
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
  auditRecords,
  showHeading,
}: {
  info?: ApplicationInfo;
  auditRecords: AuditListData[];
  showHeading: boolean;
}) {
  const text = I18N.carbonAgent.labelApplication;
  return (
    <section className={style.recordSection}>
      {showHeading && (
        <div className={style.recordHeading}>
          <h3>{I18N.carbonFootprint3.applicationRecord}</h3>
          <span>
            {I18N.template(text.recordCount, { val1: auditRecords.length })}
          </span>
        </div>
      )}
      {auditRecords.length ? (
        <AuditList embedded auditLists={auditRecords} />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      {info && <SubmittedInfo info={info} />}
    </section>
  );
}
