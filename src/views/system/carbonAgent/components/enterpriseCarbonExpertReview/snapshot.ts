/**
 * @file 企业碳专家复核核算查看地址生成；使用复核详情的报告 ID 打开企业碳只读核算预览。
 */
import { RouteMaps } from '@src/router/route-paths';
import store from '@src/store';

import type { EnterpriseCarbonExpertReviewDetail } from './types';
import { getExpertReviewSaasOrigin } from '../expertReviewSnapshotOrigin';
import type { EnterpriseCarbonAccountingContext } from '../enterpriseCarbonPreview/types';

const getSnapshotScalar = (value?: number | string | null) => {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
};

const getCurrentCompanyId = () =>
  getSnapshotScalar(store.getState().companyUserInfo.userInfo?.companyId);

export const getEnterpriseCarbonExpertReviewSnapshotContext = (
  detail: EnterpriseCarbonExpertReviewDetail,
): EnterpriseCarbonAccountingContext | undefined => {
  const reportId = getSnapshotScalar(detail.reportId);

  if (!reportId) {
    return undefined;
  }

  const year = getSnapshotScalar(detail.year);

  return {
    companyId: getCurrentCompanyId(),
    computationPeriod: year,
    orgId: getSnapshotScalar(detail.orgId),
    orgName: getSnapshotScalar(detail.accountName),
    reportId,
    year,
  };
};

export const getEnterpriseCarbonExpertReviewSnapshotUrl = (
  detail: EnterpriseCarbonExpertReviewDetail,
) => {
  const reportId = getSnapshotScalar(detail.reportId);

  if (!reportId) {
    return '';
  }

  const searchParams = new URLSearchParams();
  const companyId = getCurrentCompanyId();
  const orgId = getSnapshotScalar(detail.orgId);
  const year = getSnapshotScalar(detail.year);
  const saasOrigin = getExpertReviewSaasOrigin();

  if (!saasOrigin) {
    return '';
  }

  if (companyId) {
    searchParams.set('companyId', companyId);
  }

  searchParams.set('reportId', reportId);

  if (orgId) {
    searchParams.set('orgId', orgId);
  }

  if (year) {
    searchParams.set('year', year);
  }

  const shareUrl = new URL(
    RouteMaps.enterpriseCarbonAccountingcarbonDischargeShare,
    saasOrigin,
  );

  shareUrl.search = searchParams.toString();

  return shareUrl.toString();
};
