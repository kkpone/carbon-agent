import {
  isProductCarbonCertificateApproved,
  prepareProductCarbonCertificateApplication,
} from './data';
import type { ProductCarbonCertificateApplication } from './types';

export type ProductCarbonCertificateEntryResolution =
  | {
      application: ProductCarbonCertificateApplication;
      kind: 'existing';
    }
  | {
      application: ProductCarbonCertificateApplication;
      kind: 'new';
    };

/** 新建页只保留 prepare 回填的表单数据，不继承历史申请身份或结果。 */
export function toNewProductCarbonCertificateApplication(
  application: ProductCarbonCertificateApplication,
): ProductCarbonCertificateApplication {
  return {
    ...application,
    auditRecords: [],
    certificateNo: undefined,
    id: undefined,
    issueDate: undefined,
    rejectReason: undefined,
    resultFileName: undefined,
    resultImageUrl: undefined,
    status: application.status || 'not_submitted',
    statusName: application.statusName,
    validUntil: undefined,
  };
}

/**
 * 证书入口与碳标签采用同一状态机，但只调用证书接口：
 * 未完成申请定位原申请；已通过申请使用 prepare(true) 新建；无 ID 直接新建。
 */
export async function resolveProductCarbonCertificateEntry(
  accountId: string,
): Promise<ProductCarbonCertificateEntryResolution> {
  const current = await prepareProductCarbonCertificateApplication(
    accountId,
    false,
  );

  if (current.id != null && !isProductCarbonCertificateApproved(current)) {
    return { application: current, kind: 'existing' };
  }

  const forceNew =
    current.id != null && isProductCarbonCertificateApproved(current);
  const prepared = forceNew
    ? await prepareProductCarbonCertificateApplication(accountId, true)
    : current;

  return {
    application: toNewProductCarbonCertificateApplication(prepared),
    kind: 'new',
  };
}
