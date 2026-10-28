import I18N from '@src/lang/I18N';

import { TAGSSTATUS } from '../component/Tags';

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
  /**
   * 企业碳核算报告
   */
  CARBON_ACCOUNT_REPORT = 2,
  CARBON_LABEL = 3,
}
export const CERTIFYPROJECTTYPE_CLASS = {
  [CERTIFYPROJECTTYPE.CARBONPRINT_REPORT]: TAGSSTATUS.COMPLETE,
  [CERTIFYPROJECTTYPE.COMPARE_REPORT]: TAGSSTATUS.FILLING,
};

export const CERTIFYPROJECTTYPE_LABEL = {
  [CERTIFYPROJECTTYPE.CARBONPRINT_REPORT]:
    I18N.Certification.carbonFootprintVerification4,
  [CERTIFYPROJECTTYPE.COMPARE_REPORT]:
    I18N.carbonFootprint3.productComparisonReport,
  [CERTIFYPROJECTTYPE.CARBON_ACCOUNT_REPORT]:
    I18N.Certification.corporateCarbonAccounting,
  [CERTIFYPROJECTTYPE.CARBON_LABEL]:
    I18N.Certification.carbonLabelingCertification,
};
export enum CERTIFYPROJECTSTATUS {
  // 待提交
  AWAIT_AUDIT = 0,
  // 审核中
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
}

export const CERTIFYPROJECTSTATUS_LABEL = {
  [CERTIFYPROJECTSTATUS.AWAIT_AUDIT]: I18N.carbonFootprint3.toBeSubmitted,
  [CERTIFYPROJECTSTATUS.IN_AUDIT]: I18N.carbonFootprint3.underReview,
  [CERTIFYPROJECTSTATUS.SUCCESS]: I18N.carbonFootprint3.approved,
  [CERTIFYPROJECTSTATUS.FAIL]: I18N.carbonFootprint3.reviewFailed2,
  [CERTIFYPROJECTSTATUS.RETRACT]: I18N.Certification.withdrawn,
  [CERTIFYPROJECTSTATUS.FAILURE]: I18N.carbonFootprint.submissionFailed,
};
export const CERTIFYPROJECTSTATUS_COLOR = {
  [CERTIFYPROJECTSTATUS.AWAIT_AUDIT]: '#6c757d',
  [CERTIFYPROJECTSTATUS.IN_AUDIT]: '#fba93e',
  [CERTIFYPROJECTSTATUS.SUCCESS]: '#0cbf9f',
  [CERTIFYPROJECTSTATUS.FAIL]: '#ED5555',
  [CERTIFYPROJECTSTATUS.RETRACT]: '#FBA93E',
  [CERTIFYPROJECTSTATUS.FAILURE]: '#ED5555',
};
