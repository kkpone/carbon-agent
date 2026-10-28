/**
 * @file 企业碳 Agent 第三方认证领域类型，与产品碳认证类型完全隔离。
 */
import { ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE } from './constants';

export type EnterpriseCarbonCertificationBusinessType = 'account' | 'report';

export type EnterpriseCarbonCertificationPageType =
  (typeof ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE)[keyof typeof ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE];

export type EnterpriseCarbonCertificationContext = {
  agentSessionId?: string;
  enterpriseCarbonBizId?: string;
  enterpriseCarbonBizType: EnterpriseCarbonCertificationBusinessType;
  orgId?: string;
  year?: string;
};

export type EnterpriseCarbonCertificationTarget =
  EnterpriseCarbonCertificationContext & {
    applyNo?: string;
    certificationId?: number | string;
    enterpriseCarbonCertificationDetails?: EnterpriseCarbonCertificationRecord[];
    enterpriseCarbonCertificationDraft?: boolean;
    enterpriseCarbonCertificationPageType?: EnterpriseCarbonCertificationPageType;
    type: 'enterpriseCarbonCertification';
  };

export type EnterpriseCarbonCertificationRecord = {
  accountId?: number | string | null;
  applyNo?: string | null;
  authType?: number | string | null;
  certificationId?: number | string | null;
  createTime?: string | null;
  projectName?: string | null;
  projectNo?: string | null;
  reportId?: number | string | null;
  reportName?: string | null;
  status?: number | string | null;
  statusName?: string | null;
  updateTime?: string | null;
};

export type EnterpriseCarbonCertificationListParams = {
  year: number | string;
};
