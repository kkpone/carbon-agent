import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';

import { teamText } from './i18n';

const reasons: Record<string, string> = createI18nLabelMap({
  AGENT_DATE_RANGE_INVALID: () => teamText('selectUpTo90CalendarDaysEnding'),
  AGENT_COMPANY_NAME_INVALID: () => teamText('enterACompanyNameOf1100'),
  AGENT_COMPANY_EMAIL_INVALID: () => teamText('enterAValidContactEmail'),
  AGENT_OWNER_CANNOT_BE_DISABLED: () =>
    teamText('theOwnerCannotBeDisabledOrRemoved'),
  AGENT_MEMBER_NAME_INVALID: () => teamText('checkTheMemberSName'),
  AGENT_MEMBER_EMAIL_INVALID: () => teamText('enterAValidEmailAddress'),
  AGENT_MEMBER_PHONE_INVALID: () => teamText('enterAValidPhoneNumber'),
  AGENT_MEMBER_USERNAME_INVALID: () =>
    teamText('theLoginUsernameMustStartWithA'),
  AGENT_MEMBER_ALREADY_EXISTS: () => teamText('thisMemberIsAlreadyInTheTeam'),
  AGENT_MEMBER_CONTACT_EXISTS: () =>
    teamText('theseContactDetailsAreAlreadyInUse'),
  AGENT_MEMBER_IDENTITY_CONFLICT: () =>
    teamText('theAccountDetailsMatchDifferentMembersCheck'),
  AGENT_MEMBER_NOT_FOUND: () => teamText('theMemberHasChangedRefreshTheList'),
  AGENT_MEMBER_DEPARTMENT_FORBIDDEN: () =>
    teamText('theSelectedDepartmentIsUnavailableRefreshThe'),
  AGENT_MEMBER_ROLE_FORBIDDEN: () =>
    teamText('theSelectedRoleIsUnavailableRefreshThe'),
  AGENT_MEMBER_LOGIN_REQUIRED: () => teamText('theMemberMustSignInAgainFor'),
  AGENT_MEMBER_ACCOUNT_UNAVAILABLE: () =>
    teamText('theMemberAccountIsUnavailable'),
  AGENT_IMPORT_FILE_TOO_LARGE: () => teamText('theCsvExceeds1MbOr1'),
  AGENT_IMPORT_CSV_INVALID: () => teamText('invalidCsvFormatUseTheTemplateAnd'),
  AGENT_IMPORT_TEMPLATE_INVALID: () => teamText('csvHeadersDoNotMatchUseThe'),
  AGENT_IMPORT_COLUMN_INVALID: () =>
    teamText('invalidCsvColumnFormatCheckThisRow'),
  AGENT_IMPORT_PREVIEW_EXPIRED: () =>
    teamText('theImportPreviewHasExpiredUploadAgain'),
  AGENT_IMPORT_BATCH_NOT_FOUND: () =>
    teamText('theImportBatchDoesNotExistUpload'),
  AGENT_IMPORT_RESULT_CONFLICT: () =>
    teamText('theImportStatusHasChangedQueryThe'),
  AGENT_IMPORT_IDENTITY_READ_ONLY: () =>
    teamText('namesAndLoginUsernamesCannotBeChanged'),
  AGENT_IMPORT_DEPARTMENT_ROLE_REQUIRED: () =>
    teamText('provideValidDepartmentAndRoleIds'),
  AGENT_IMPORT_NEW_MEMBER_STATUS_INVALID: () =>
    teamText('invalidStatusForANewMemberFollow'),
  AGENT_PAYMENT_CREATE_RETRY_SAME_ORDER: () =>
    teamText('paymentCreationIsUnconfirmedRestoreTheOriginal'),
  AGENT_PAYMENT_QUERY_FAILED: () =>
    teamText('orderLookupFailedTemporarilyCheckTheOriginal'),
  AGENT_TEAM_PRODUCT_CONFIG_MISSING: () =>
    teamText('teamProductsAreNotConfiguredYetContact'),
  AGENT_TEAM_PRODUCT_CONFIG_INVALID: () =>
    teamText('theTeamProductConfigurationIsInvalidContact'),
  AGENT_TEAM_INITIALIZATION_FAILED: () =>
    teamText('teamEntitlementsHaveNotFinishedInitializingKeep'),
  AGENT_BILLING_ACCOUNT_NOT_READY: () =>
    teamText('theCompanyBillingAccountIsInitializingTry'),
  AGENT_SEARCH_TOO_BROAD: () => teamText('theQueryIsTooBroadNarrowYour'),

  AGENT_LOGIN_REQUIRED: () => teamText('yourLoginHasExpiredSignInAgain'),
  AGENT_TEAM_MANAGEMENT_FORBIDDEN: () =>
    teamText('youDoNotHavePermissionToManage'),
  AGENT_TEAM_NOT_ENABLED: () =>
    teamText('theCurrentOrganizationHasNotActivatedThe'),
  AGENT_TEAM_EXPIRED: () => teamText('theTeamSubscriptionHasExpiredContactAn'),
  AGENT_SEAT_REQUIRED: () => teamText('noSeatHasBeenAssignedToYou'),
  AGENT_MEMBER_DISABLED: () => teamText('thisMemberIsDisabled'),
  AGENT_TEAM_REVOKED: () => teamText('thisTeamIsUnavailable'),
  AGENT_TEAM_INITIALIZING: () =>
    teamText('teamEntitlementsAreInitializingRefreshLater'),
  AGENT_MEMBER_LIMIT_REACHED: () =>
    teamText('yourMonthlyLimitHasBeenReachedContact'),
  AGENT_POINT_INSUFFICIENT: () =>
    teamText('insufficientCompanyPointsContactAnAdministratorTo'),
  AGENT_POINTS_INSUFFICIENT: () =>
    teamText('insufficientCompanyPointsContactAnAdministratorTo'),
  AGENT_QUOTE_EXPIRED: () => teamText('theQuoteHasExpiredGetANew'),
  AGENT_TEAM_ALREADY_BOUND: () => teamText('aTeamIsAlreadyLinkedEnterThe'),
  AGENT_USE_RENEWAL: () => teamText('useTheSubscriptionRenewalEntry'),
  AGENT_RENEWAL_QUANTITY_MISMATCH: () =>
    teamText('theRenewalSeatCountHasChangedRefresh'),
  AGENT_SEAT_CAPACITY_EXCEEDED: () =>
    teamText('insufficientSeatsOrSeatLimitExceededRefresh'),
  AGENT_CONTEXT_CONFLICT: () => teamText('theDataHasChangedRefreshAndConfirm'),
  AGENT_LIMIT_BELOW_USAGE: () => teamText('theLimitCannotBeBelowAMember'),
  AGENT_IDEMPOTENCY_CONFLICT: () =>
    teamText('thisRequestDiffersFromTheOriginalOperation'),
  AGENT_POINT_ORDER_REQUEST_CONFLICT: () =>
    teamText('thisOrderRequestDiffersFromTheOriginal'),
  AGENT_ORDER_NOT_INVOICEABLE: () =>
    teamText('thisOrderCannotBeInvoicedRefreshEligible'),
  AGENT_INVOICE_INVALID: () => teamText('checkTheInvoiceInformation'),
  AGENT_OBJECT_FORBIDDEN: () => teamText('youDoNotHaveAccessToThis'),
  AGENT_FILE_FORBIDDEN: () => teamText('youDoNotHaveAccessToThis2'),
  AGENT_SESSION_CHANNEL_FORBIDDEN: () =>
    teamText('conversationsFromOtherChannelsCannotBeAccessed'),
  AGENT_EXPORT_LIMIT_EXCEEDED: () =>
    teamText('theExportExceeds10000RecordsNarrow'),
  AGENT_EXPORT_DATA_CHANGED: () =>
    teamText('theDataChangedDuringExportRefreshAnd'),
});
export const reasonText = (code?: string) =>
  (code && reasons[code]) ||
  teamText('thisActionIsTemporarilyUnavailableRefreshAnd');
type ErrorBody = {
  reasonCode?: string;
  code?: number | string;
  msg?: string;
  requestId?: string;
  data?: { reasonCode?: string; requestId?: string };
};
const bodyOf = (error: unknown): ErrorBody => {
  const value = error as { response?: { data?: ErrorBody }; data?: ErrorBody };
  return value?.response?.data || value?.data || (error as ErrorBody) || {};
};
export const errorCode = (error: unknown): string => {
  const body = bodyOf(error);
  const text =
    body.data?.reasonCode ||
    body.reasonCode ||
    (typeof body.code === 'string' ? body.code : '') ||
    body.msg ||
    (error as Error)?.message ||
    '';
  return text.match(/AGENT_[A-Z0-9_]+/)?.[0] || '';
};
export const errorText = (error: unknown) => {
  const body = bodyOf(error);
  const id = body.data?.requestId || body.requestId;
  const safeId = typeof id === 'string' && /^[\w:-]{1,100}$/.test(id) ? id : '';
  return `${reasonText(errorCode(error))}${
    safeId ? teamText('requestIdValue', { value0: safeId }) : ''
  }`;
};
export const isAgentBusinessDenial = (data: ErrorBody) => {
  // Successful access responses carry reasons for individual capabilities.
  // Let the page apply canEnter, canManage and canUseAi independently.
  if (data?.code === 200) return false;
  const code = errorCode(data);
  return !!code && code !== 'AGENT_LOGIN_REQUIRED';
};
