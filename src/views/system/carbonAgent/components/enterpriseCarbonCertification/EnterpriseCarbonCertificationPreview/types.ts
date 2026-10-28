/**
 * @file 企业碳 Agent 第三方认证预览包装属性类型。
 */
import type { EnterpriseCarbonCertificationTarget } from '../types';

export type EnterpriseCarbonCertificationPreviewProps = {
  agentSessionId?: string;
  onSubmitted?: (certificationId?: number | string) => void;
  readonly?: boolean;
  target: EnterpriseCarbonCertificationTarget;
};
