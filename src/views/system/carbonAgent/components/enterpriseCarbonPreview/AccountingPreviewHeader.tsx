import { IconAlibabaNew } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Select } from 'antd';
import classNames from 'classnames';
import type { ReactNode } from 'react';

import { EVersionType } from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';
import {
  COMPUTATION_STATUS,
  COMPUTATION_STATUS_LABEL,
} from '@/views/enterpriseCarbonAccount2/constant';

import styles from './index.module.less';

type AccountingPreviewHeaderProps = {
  actions?: ReactNode;
  computationStatus?: number | string;
  onVersionTypeChange?: (value: EVersionType) => void;
  organizationName?: string;
  periodName?: string;
  versionType?: EVersionType | string;
};

const getVersionType = (value?: EVersionType | string) =>
  value === EVersionType.iso ? EVersionType.iso : EVersionType.ghg;

const getVersionLabel = (versionType?: EVersionType | string) =>
  getVersionType(versionType) === EVersionType.iso
    ? I18N.enterpriseCarbonAccount2.isoStandard3
    : I18N.enterpriseCarbonAccount2.ghgPr2;

const getComputationStatus = (status?: number | string) => {
  if (status === undefined || status === '') {
    return undefined;
  }

  const statusValue = Number(status);

  if (Number.isNaN(statusValue)) {
    return undefined;
  }

  return statusValue as keyof typeof COMPUTATION_STATUS_LABEL;
};

const AccountingPreviewHeader = ({
  actions,
  computationStatus,
  onVersionTypeChange,
  organizationName,
  periodName,
  versionType,
}: AccountingPreviewHeaderProps) => {
  const normalizedVersionType = getVersionType(versionType);
  const normalizedStatus = getComputationStatus(computationStatus);

  return (
    <div className={styles.canvasHeader}>
      <div className={styles.canvasHeaderInfo}>
        <div className={styles.canvasHeaderIdentity}>
          {organizationName ? (
            <span
              className={classNames(
                styles.canvasHeaderPeriod,
                styles.canvasHeaderOrganization,
              )}
              title={organizationName}
            >
              {organizationName}
            </span>
          ) : null}
          {organizationName ? (
            <span className={styles.canvasHeaderSplit} />
          ) : null}
          <span className={styles.canvasHeaderPeriod}>{periodName || '-'}</span>
        </div>
        <span className={styles.canvasHeaderSplit} />
        {onVersionTypeChange ? (
          <Select
            className={styles.canvasHeaderVersionSelect}
            variant='borderless'
            value={normalizedVersionType}
            popupMatchSelectWidth={false}
            onChange={onVersionTypeChange}
            suffixIcon={
              <IconAlibabaNew
                className={styles.canvasHeaderVersionArrow}
                type='icon-chevron-down'
              />
            }
            options={[
              {
                value: EVersionType.ghg,
                label: I18N.enterpriseCarbonAccount2.ghgPr2,
              },
              {
                value: EVersionType.iso,
                label: I18N.enterpriseCarbonAccount2.isoStandard3,
              },
            ]}
          />
        ) : (
          <span
            className={styles.canvasHeaderVersion}
            title={getVersionLabel(normalizedVersionType)}
          >
            {getVersionLabel(normalizedVersionType)}
            <IconAlibabaNew
              className={styles.canvasHeaderVersionArrow}
              type='icon-chevron-down'
            />
          </span>
        )}
        {normalizedStatus !== undefined ? (
          <span
            className={classNames(styles.canvasStatusTag, {
              [styles.canvasStatusTagFilling]:
                normalizedStatus === COMPUTATION_STATUS.FILLING,
              [styles.canvasStatusTagBeFilled]:
                normalizedStatus === COMPUTATION_STATUS.BE_FILLED,
              [styles.canvasStatusTagCompleted]:
                normalizedStatus === COMPUTATION_STATUS.COMPLETE,
            })}
          >
            {COMPUTATION_STATUS_LABEL[normalizedStatus]}
          </span>
        ) : null}
      </div>
      {actions ? (
        <div className={styles.canvasHeaderExtra}>{actions}</div>
      ) : null}
    </div>
  );
};

export default AccountingPreviewHeader;
