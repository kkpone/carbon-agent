export type ProductCarbonCertificateStatus = string;

export type ProductCarbonCertificateFormValues = {
  accountingBoundary: string;
  accountingEndDate: string;
  accountingStandard: string;
  accountingStartDate: string;
  applicantCompanyName: string;
  companyAddress: string;
  companyAddressEn: string;
  companyNameEn: string;
  functionalUnit: string;
  productName: string;
  productNameEn: string;
  specification: string;
  specificationEn: string;
  unitEmission: string;
};

export type ProductCarbonCertificateAuditRecord = {
  actionCode?: string | null;
  actionName?: string | null;
  applicationId?: number | string | null;
  fromStatus?: string | null;
  id?: number | string | null;
  operateTime?: string | null;
  operatorId?: number | string | null;
  operatorName?: string | null;
  remark?: string | null;
  toStatus?: string | null;
  version?: number | string | null;
};

export type ProductCarbonCertificateApplication =
  ProductCarbonCertificateFormValues & {
    accountingBoundaryEn?: string | null;
    accountId: number | string;
    auditRecords?: ProductCarbonCertificateAuditRecord[] | null;
    certificateNo?: string | null;
    id?: number | string | null;
    issueDate?: string | null;
    rejectReason?: string | null;
    resultFileName?: string | null;
    resultImageUrl?: string | null;
    status?: ProductCarbonCertificateStatus | string | null;
    statusName?: string | null;
    unitEmissionEn?: string | null;
    validUntil?: string | null;
  };

export type ProductCarbonCertificateContext = {
  messageId?: number | string | null;
  projectId?: number | string | null;
  sessionId?: string | null;
};

export type ProductCarbonCertificateSubmitPayload =
  ProductCarbonCertificateFormValues &
    ProductCarbonCertificateContext & {
      accountId: number | string;
      applicationId?: number | string;
    };

export type ProductCarbonCertificateTargetFields = {
  productCarbonCertificateApplicationId?: string;
  productCarbonCertificateInitializing?: boolean;
  productCarbonCertificatePrepared?: ProductCarbonCertificateApplication;
  productCarbonCertificateStatus?: ProductCarbonCertificateStatus | string;
  productCarbonCertificateStatusName?: string;
  productCarbonCertificateTemporaryKey?: string;
};

export type ProductCarbonCertificateApplyProps =
  ProductCarbonCertificateContext & {
    accountId: string;
    applicationId?: string;
    initializing?: boolean;
    preparedApplication?: ProductCarbonCertificateApplication;
    temporaryKey?: string;
    onDetailLoaded?: (application: ProductCarbonCertificateApplication) => void;
    onSubmitted?: (temporaryKey: string, id: string) => void;
  };
