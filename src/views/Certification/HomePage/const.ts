import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';

export enum PAGETAYPE {
  EDIT = 'edit',
  SHOW = 'show',
  ADD = 'add',
}

export enum CERTIFYPROJECTTYPE {
  // 产品碳足迹报告
  CARBONPRINT_REPORT = 0,
  // 产品对比报告
  COMPARE_REPORT = 1,
  // 企业碳核算
  CERTIFY_PROJECT = 2,
  CARBON_LABEL = 3,
}

export const CERTIFYPROJECTTYPE_LABEL = createI18nLabelMap({
  [CERTIFYPROJECTTYPE.CARBONPRINT_REPORT]: () =>
    I18N.Certification.carbonFootprintVerification4,
  [CERTIFYPROJECTTYPE.COMPARE_REPORT]: () =>
    I18N.carbonFootprint3.productComparisonReport,
  [CERTIFYPROJECTTYPE.CERTIFY_PROJECT]: () =>
    I18N.Certification.corporateCarbonAccounting,
  [CERTIFYPROJECTTYPE.CARBON_LABEL]: () =>
    I18N.Certification.productCarbonLabeling,
});

/**
 * //状态：0待提交，1待审核，2审核通过，3审核未通过 4 已撤销 5 提交失败 6 待现场审核 7 初审未通过 8 现场审核未通过 9 待出证 10 待确认 11 待上传确认文件 12 确认文件待修改
 */
export enum CERTIFYPROJECTSTATUS {
  // 待提交
  AWAIT_AUDIT = 0,
  /**
   * 待审核
   */
  IN_AUDIT = 1,
  // 审核通过
  SUCCESS = 2,
  // 审核不通过
  FAIL = 3,
  // 已撤回
  RETRACT = 4,
  /**
   * 提交失败
   */
  FAILURE = 5,
  /**
   * 待现场审核
   */
  WAIT_ON_SITE_AUDIT = 6,
  /**
   * 初审未通过
   */
  INITIAL_AUDIT_FAIL = 7,
  /**
   * 现场审核未通过
   */
  ON_SITE_AUDIT_FAIL = 8,
  /**
   * 待出证
   */
  WAIT_CERTIFICATE = 9,
  /**
   * 待确认
   */
  WAIT_CONFIRM = 10,
  /**
   * 待上传确认文件
   */
  WAIT_UPLOAD_CONFIRM_FILE = 11,
  /**
   * 确认文件待修改
   */
  CONFIRM_FILE_WAIT_MODIFY = 12,
  NOT_ACCEPT = 13,
}

export const CERTIFYPROJECTSTATUS_LABEL = createI18nLabelMap({
  [CERTIFYPROJECTSTATUS.AWAIT_AUDIT]: () => I18N.carbonFootprint3.toBeSubmitted,
  [CERTIFYPROJECTSTATUS.IN_AUDIT]: () => I18N.carbonFootprint3.pendingReview,
  [CERTIFYPROJECTSTATUS.SUCCESS]: () => I18N.carbonFootprint3.approved,
  [CERTIFYPROJECTSTATUS.FAIL]: () => I18N.carbonFootprint3.reviewFailed,
  [CERTIFYPROJECTSTATUS.RETRACT]: () => I18N.carbonAccount.rescinded,
  [CERTIFYPROJECTSTATUS.FAILURE]: () => I18N.carbonFootprint.submissionFailed,
  [CERTIFYPROJECTSTATUS.WAIT_ON_SITE_AUDIT]: () =>
    I18N.subModules.pendingOnSiteAudit,
  [CERTIFYPROJECTSTATUS.INITIAL_AUDIT_FAIL]: () =>
    I18N.subModules.initialReviewFailed,
  [CERTIFYPROJECTSTATUS.ON_SITE_AUDIT_FAIL]: () =>
    I18N.subModules.onSiteAuditNotConducted,
  [CERTIFYPROJECTSTATUS.WAIT_CERTIFICATE]: () =>
    I18N.subModules.pendingCertification,
  [CERTIFYPROJECTSTATUS.WAIT_CONFIRM]: () =>
    I18N.carbonDataManagemen.toBeConfirmed,
  [CERTIFYPROJECTSTATUS.WAIT_UPLOAD_CONFIRM_FILE]: () =>
    I18N.subModules.pendingUploadConfirmation,
  [CERTIFYPROJECTSTATUS.CONFIRM_FILE_WAIT_MODIFY]: () =>
    I18N.subModules.confirmationFilePending,
  [CERTIFYPROJECTSTATUS.NOT_ACCEPT]: () => I18N.Certification.notAccepted,
});

export const CERTIFYPROJECTSTATUS_COLOR = {
  [CERTIFYPROJECTSTATUS.AWAIT_AUDIT]: '#E5E5FB',
  [CERTIFYPROJECTSTATUS.IN_AUDIT]: '#E8F6FF',
  [CERTIFYPROJECTSTATUS.SUCCESS]: '#DDF4F2',
  [CERTIFYPROJECTSTATUS.FAIL]: '#FFE3E1',
  [CERTIFYPROJECTSTATUS.RETRACT]: '#F3F3F3',
  [CERTIFYPROJECTSTATUS.FAILURE]: '#FFE3E1',
  [CERTIFYPROJECTSTATUS.WAIT_ON_SITE_AUDIT]: '#E8F6FF',
  [CERTIFYPROJECTSTATUS.INITIAL_AUDIT_FAIL]: '#FFE3E1',
  [CERTIFYPROJECTSTATUS.ON_SITE_AUDIT_FAIL]: '#FFE3E1',
  [CERTIFYPROJECTSTATUS.WAIT_CERTIFICATE]: '#FCEEDF',
  [CERTIFYPROJECTSTATUS.WAIT_CONFIRM]: '#FCEEDF',
  [CERTIFYPROJECTSTATUS.WAIT_UPLOAD_CONFIRM_FILE]: '#FCEEDF',
  [CERTIFYPROJECTSTATUS.CONFIRM_FILE_WAIT_MODIFY]: '#FCEEDF',
  [CERTIFYPROJECTSTATUS.NOT_ACCEPT]: '#F3F3F3',
};
