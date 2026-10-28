/**
 * @file 企业碳 Agent 第三方认证表单路由，只注入年度和当前会话上下文。
 */
import { RouteMaps } from '@src/router/route-paths';

import {
  ENTERPRISE_CARBON_CERTIFICATION_AUTH_TYPE,
  ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE,
} from '../constants';
import type { EnterpriseCarbonCertificationTarget } from '../types';

type EnterpriseCarbonCertificationUrlOptions = {
  agentSessionId?: string;
  readonly?: boolean;
};

export const getEnterpriseCarbonCertificationUrl = (
  target: EnterpriseCarbonCertificationTarget,
  options: EnterpriseCarbonCertificationUrlOptions = {},
) => {
  let pageType = target.enterpriseCarbonCertificationPageType;

  if (!pageType) {
    pageType = ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE.ADD;
  }

  if (options.readonly) {
    pageType = ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE.SHOW;
  }

  const searchParams = new URLSearchParams({
    authType: ENTERPRISE_CARBON_CERTIFICATION_AUTH_TYPE,
    pageType,
  });

  if (target.certificationId !== undefined && target.certificationId !== null) {
    searchParams.set('id', String(target.certificationId));
  }

  if (target.applyNo) {
    searchParams.set('applyNo', target.applyNo);
  }

  if (target.year) {
    searchParams.set('period', target.year);
  }

  if (target.orgId) {
    searchParams.set('orgId', target.orgId);
  }

  if (options.agentSessionId) {
    searchParams.set('agentSessionId', options.agentSessionId);
  }

  return `${
    RouteMaps.CarbonFootprintCertificationProjectApplay
  }?${searchParams.toString()}`;
};
