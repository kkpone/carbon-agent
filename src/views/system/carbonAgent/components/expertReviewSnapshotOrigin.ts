/**
 * @file 专家复核快照跳转使用的碳云前端域名。
 */

import { API_EXTRA_PARAMS_SNAPFLAG } from '@src/components/CarbonFootprintAccount/BuildModelMainData/constant';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';

export const getExpertReviewSaasOrigin = () => {
  const configuredOrigin = process.env.REACT_APP_SAAS_URL?.trim();

  if (!configuredOrigin) {
    return undefined;
  }
  // test
  return configuredOrigin.replace(/\/+$/, '');
};

export const getExpertReviewSnapshotModelAccountId = (
  snapAccountId?: number | string | null,
) => {
  if (
    snapAccountId === undefined ||
    snapAccountId === null ||
    String(snapAccountId).trim() === ''
  ) {
    return undefined;
  }

  return String(snapAccountId).trim();
};

export const getExpertReviewSnapshotModelUrl = (
  snapAccountId?: number | string | null,
) => {
  const accountId = getExpertReviewSnapshotModelAccountId(snapAccountId);
  const saasOrigin = getExpertReviewSaasOrigin();

  if (!accountId || !saasOrigin) {
    return undefined;
  }

  const searchParams = new URLSearchParams({
    accountId,
    listOrGraph: '0',
    snapFlag: String(API_EXTRA_PARAMS_SNAPFLAG.SHARE),
    status: '1',
    stepValue: '1',
  });
  const shareUrl = new URL(
    RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountShare,
    saasOrigin,
  );

  shareUrl.search = searchParams.toString();

  return shareUrl.toString();
};
