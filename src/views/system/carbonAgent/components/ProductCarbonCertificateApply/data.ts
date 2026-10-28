import I18N from '@src/lang/I18N';

import {
  getProductCarbonCertificateDetail,
  getProductCarbonCertificateList,
  getProductCarbonCertificatePointCost,
  postProductCarbonCertificatePrepare,
} from './service';
import type {
  ProductCarbonCertificateApplication,
  ProductCarbonCertificateContext,
  ProductCarbonCertificateFormValues,
  ProductCarbonCertificateSubmitPayload,
} from './types';

const FORM_FIELDS: Array<keyof ProductCarbonCertificateFormValues> = [
  'productName',
  'productNameEn',
  'functionalUnit',
  'accountingStartDate',
  'accountingEndDate',
  'unitEmission',
  'accountingStandard',
  'accountingBoundary',
  'specification',
  'specificationEn',
  'applicantCompanyName',
  'companyNameEn',
  'companyAddress',
  'companyAddressEn',
];

export const EMPTY_PRODUCT_CARBON_CERTIFICATE_FORM = FORM_FIELDS.reduce(
  (values, field) => ({ ...values, [field]: '' }),
  {} as ProductCarbonCertificateFormValues,
);

export function normalizeProductCarbonCertificateApplication(
  source: ProductCarbonCertificateApplication,
): ProductCarbonCertificateApplication {
  const normalized: ProductCarbonCertificateApplication = {
    ...EMPTY_PRODUCT_CARBON_CERTIFICATE_FORM,
    accountingBoundaryEn: source.accountingBoundaryEn,
    accountId: source.accountId,
    auditRecords: Array.isArray(source.auditRecords)
      ? source.auditRecords.map(record => ({
          actionCode: record.actionCode,
          actionName: record.actionName,
          applicationId: record.applicationId,
          fromStatus: record.fromStatus,
          id: record.id,
          operateTime: record.operateTime,
          operatorId: record.operatorId,
          operatorName: record.operatorName,
          remark: record.remark,
          toStatus: record.toStatus,
          version: record.version,
        }))
      : [],
    certificateNo: source.certificateNo,
    id: source.id,
    issueDate: source.issueDate,
    rejectReason: source.rejectReason,
    resultFileName: source.resultFileName,
    resultImageUrl: source.resultImageUrl,
    status: source.status,
    statusName: source.statusName,
    unitEmissionEn: source.unitEmissionEn,
    validUntil: source.validUntil,
  };

  FORM_FIELDS.forEach(field => {
    normalized[field] = String(source[field] ?? '');
  });

  return normalized;
}

export function toProductCarbonCertificateFormValues(
  source?: ProductCarbonCertificateApplication,
): ProductCarbonCertificateFormValues {
  if (!source) {
    return { ...EMPTY_PRODUCT_CARBON_CERTIFICATE_FORM };
  }

  return FORM_FIELDS.reduce(
    (values, field) => ({ ...values, [field]: String(source[field] ?? '') }),
    {} as ProductCarbonCertificateFormValues,
  );
}

export async function loadProductCarbonCertificateApplications(
  accountId: string,
  signal?: AbortSignal,
) {
  const { data } = await getProductCarbonCertificateList(accountId, signal);
  const rows = data.data;

  if (
    !Array.isArray(rows) ||
    rows.some(
      row => row?.id == null || String(row.accountId) !== String(accountId),
    )
  ) {
    throw new Error(I18N.carbonAgent.certificateApplication.loadError);
  }

  // 后端已按业务版本排序；这里只做字段归一化，禁止 sort/reverse。
  return rows.map(normalizeProductCarbonCertificateApplication);
}

export async function prepareProductCarbonCertificateApplication(
  accountId: string,
  forceNew = false,
  signal?: AbortSignal,
) {
  const { data } = await postProductCarbonCertificatePrepare(
    accountId,
    forceNew,
    signal,
  );
  const prepared = data.data;

  if (!prepared || String(prepared.accountId) !== String(accountId)) {
    throw new Error(I18N.carbonAgent.certificateApplication.sourceMissing);
  }

  return normalizeProductCarbonCertificateApplication(prepared);
}

export async function loadProductCarbonCertificatePointCost(
  accountId: string,
  signal?: AbortSignal,
) {
  const { data } = await getProductCarbonCertificatePointCost(
    accountId,
    signal,
  );
  const cost = data.data?.pointCost;

  return typeof cost === 'number' ? cost : undefined;
}

export async function loadProductCarbonCertificateDetail(
  accountId: string,
  applicationId: string,
  signal?: AbortSignal,
) {
  const { data } = await getProductCarbonCertificateDetail(
    applicationId,
    signal,
  );
  const detail = data.data;

  if (
    !detail ||
    String(detail.id) !== String(applicationId) ||
    String(detail.accountId) !== String(accountId)
  ) {
    throw new Error(I18N.carbonAgent.certificateApplication.loadError);
  }

  return normalizeProductCarbonCertificateApplication(detail);
}

export function isProductCarbonCertificateApproved(
  application?: ProductCarbonCertificateApplication,
) {
  return application?.status === 'approved';
}

export function isProductCarbonCertificateRejected(status?: string | null) {
  return status === 'consult_rejected' || status === 'rejected';
}

export function toProductCarbonCertificateSubmitPayload(
  values: ProductCarbonCertificateFormValues,
  accountId: string,
  context: ProductCarbonCertificateContext,
  applicationId?: string,
): ProductCarbonCertificateSubmitPayload {
  return {
    ...values,
    accountId,
    messageId: context.messageId ?? null,
    projectId: context.projectId ?? null,
    sessionId: context.sessionId ?? null,
    ...(applicationId ? { applicationId } : {}),
  };
}
