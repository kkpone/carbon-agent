/**
 * @file 企业碳 Agent 第三方认证的 ID、页面状态、标签和提交后排序规则。
 */
import I18N from '@src/lang/I18N';

import {
  ENTERPRISE_CARBON_CERTIFICATION_EDITABLE_STATUSES,
  ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE,
} from './constants';
import type {
  EnterpriseCarbonCertificationPageType,
  EnterpriseCarbonCertificationRecord,
} from './types';

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && value !== '';

export const getEnterpriseCarbonCertificationProjectId = (
  detail?: EnterpriseCarbonCertificationRecord | null,
) => {
  if (!detail) {
    return undefined;
  }

  if (
    detail.certificationId !== undefined &&
    detail.certificationId !== null &&
    detail.certificationId !== ''
  ) {
    return detail.certificationId;
  }

  return undefined;
};

export const getEnterpriseCarbonCertificationRecordIdentity = (
  detail: EnterpriseCarbonCertificationRecord,
  index: number,
) => {
  let identity = '';

  if (hasValue(detail.certificationId)) {
    identity = String(detail.certificationId);
  } else if (detail.applyNo) {
    identity = detail.applyNo;
  } else if (detail.projectNo) {
    identity = detail.projectNo;
  } else {
    identity = String(index);
  }

  const { status } = detail;

  if (!hasValue(status)) {
    return identity;
  }

  return [identity, String(status)].join(':');
};

export const getEnterpriseCarbonCertificationPageType = (
  detail?: EnterpriseCarbonCertificationRecord | null,
  readonly = false,
): EnterpriseCarbonCertificationPageType => {
  if (readonly) {
    return ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE.SHOW;
  }

  if (!detail) {
    return ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE.ADD;
  }

  const certificationId = getEnterpriseCarbonCertificationProjectId(detail);

  if (!certificationId) {
    return ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE.ADD;
  }

  const status = String(detail.status ?? '');
  const editable = ENTERPRISE_CARBON_CERTIFICATION_EDITABLE_STATUSES.includes(
    status as (typeof ENTERPRISE_CARBON_CERTIFICATION_EDITABLE_STATUSES)[number],
  );

  if (editable) {
    return ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE.EDIT;
  }

  return ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE.SHOW;
};

export const getEnterpriseCarbonCertificationStatusName = (
  detail?: EnterpriseCarbonCertificationRecord | null,
) => {
  if (detail?.statusName?.trim()) {
    return detail.statusName.trim();
  }

  return undefined;
};

export const getEnterpriseCarbonCertificationTabTitle = (
  detail?: EnterpriseCarbonCertificationRecord | null,
) => {
  const title = I18N.carbonAgent.enterpriseCarbonCertificationTitle;
  const statusName = getEnterpriseCarbonCertificationStatusName(detail);

  if (statusName) {
    return `${title} - ${statusName}`;
  }

  return title;
};

export const getEnterpriseCarbonCertificationTabLabel = () =>
  I18N.carbonAgent.enterpriseCarbonCertificationTitle;

const getEnterpriseCarbonCertificationFocusId = (
  detail: EnterpriseCarbonCertificationRecord,
) => {
  if (hasValue(detail.certificationId)) {
    return detail.certificationId;
  }

  return undefined;
};

const getEnterpriseCarbonCertificationTimestamp = (
  detail: EnterpriseCarbonCertificationRecord,
) => {
  const source = detail.updateTime || detail.createTime;

  if (!source) {
    return 0;
  }

  const timestamp = new Date(source.replace(/-/g, '/')).getTime();

  if (Number.isFinite(timestamp)) {
    return timestamp;
  }

  return 0;
};

export const sortEnterpriseCarbonCertificationDetailsForFocus = (
  details: EnterpriseCarbonCertificationRecord[],
  preferredCertificationId?: number | string,
) => {
  let preferredId = '';

  if (hasValue(preferredCertificationId)) {
    preferredId = String(preferredCertificationId);
  }

  return [...details].sort((previous, next) => {
    const previousProjectId = getEnterpriseCarbonCertificationFocusId(previous);
    const nextProjectId = getEnterpriseCarbonCertificationFocusId(next);
    let previousMatched = false;
    let nextMatched = false;

    if (preferredId) {
      previousMatched = String(previousProjectId) === preferredId;
      nextMatched = String(nextProjectId) === preferredId;
    }

    if (previousMatched !== nextMatched) {
      if (nextMatched) {
        return 1;
      }

      return -1;
    }

    const timestampDifference =
      getEnterpriseCarbonCertificationTimestamp(next) -
      getEnterpriseCarbonCertificationTimestamp(previous);

    if (timestampDifference !== 0) {
      return timestampDifference;
    }

    const previousId = Number(previousProjectId);
    const nextId = Number(nextProjectId);

    if (Number.isFinite(previousId) && Number.isFinite(nextId)) {
      return nextId - previousId;
    }

    return 0;
  });
};
