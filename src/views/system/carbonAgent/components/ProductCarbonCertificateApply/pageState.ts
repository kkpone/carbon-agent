import { isProductCarbonCertificateRejected } from './data';

export function getProductCarbonCertificatePageState(
  status?: string,
  draft = false,
) {
  const notSubmitted = status === 'not_submitted' || (draft && !status);
  const rejected = isProductCarbonCertificateRejected(status);
  const approved = status === 'approved';
  const pendingReview = Boolean(
    status && !notSubmitted && !rejected && !approved,
  );

  return {
    approved,
    notSubmitted,
    pendingReview,
    rejected,
    showDownload: approved,
    showForm: notSubmitted || rejected,
    showPaymentSubmit: notSubmitted,
    showRecords: pendingReview || rejected || approved,
    showResubmit: rejected,
  };
}
