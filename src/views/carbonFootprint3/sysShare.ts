import I18N from '@src/lang/I18N';
import moment from 'moment';

import { SysShareRecord } from './FootprintAccount/type';

/** 是否支持编辑及数据同步文案 */
export const getSysShareEditTypeText = (editType?: number | null) => {
  if (Number(editType) === 1) {
    return I18N.carbonFootprint3.shareEditSupported;
  }
  return I18N.carbonFootprint3.shareEditNotSupported;
};

/** 编辑权限配置文案 */
export const getSysShareEditPermitText = (
  editType?: number | null,
  editPermit?: number | null,
) => {
  if (Number(editType) !== 1) return '-';
  return Number(editPermit) === 1
    ? I18N.carbonFootprint3.editableWithinValidity
    : I18N.carbonFootprint3.firstCompletionInvalid;
};

/** 分享链接是否在有效期内 */
export const isSysShareLinkValid = (record: SysShareRecord) => {
  if (record.expireValue === -1) return true;
  const expireAt = record.expireTime || record.validityTime;
  if (!expireAt) return true;
  const parsed = moment(expireAt);
  return parsed.isValid() && parsed.isAfter(moment());
};

/** 分享有效期展示 */
export const getSysShareValidityText = (record: SysShareRecord) => {
  if (record.expireValue === -1) {
    return I18N.carbonFootprint3.permanentValidity;
  }
  const expireAt = record.expireTime || record.validityTime;
  if (!expireAt) return '-';
  const parsed = moment(expireAt);
  return parsed.isValid() ? parsed.format('YYYY/M/D HH:mm:ss') : expireAt;
};

/** 分享记录变更时间展示 */
export const formatSysShareUpdateTime = (time?: string) => {
  if (!time) return '-';
  const parsed = moment(time);
  return parsed.isValid() ? parsed.format('YYYY/M/D HH:mm:ss') : time;
};

const getShareRecordUrl = (record: SysShareRecord) =>
  record.shareUrl || record.url || '';

/** 同步模型 / 新建模型是否可用：editType=1 且 accountStatus=2（完成建模） */
export const isSysShareSyncActionAvailable = (record: SysShareRecord) => {
  if (Number(record.editType) !== 1 || !record.supplyAccountId) {
    return false;
  }
  return Number(record.accountStatus) === 2;
};

export const getSysShareSyncDisabledTip = () =>
  I18N.carbonFootprint3.sysShareSyncDisabledTip;

export const getSysShareCopyExpiredTip = () =>
  I18N.carbonFootprint3.sysShareCopyExpiredTip;

/** 复制分享链接及密码文案 */
export const buildSysShareCopyText = (record: SysShareRecord) => {
  const url = getShareRecordUrl(record);
  if (!url) return '';
  if (record.type === 1 && record.password) {
    return I18N.template(I18N.carbonFootprint3.carbonCloudLinkCarbon2, {
      val1: url,
      val2: record.password,
    });
  }
  return I18N.template(I18N.carbonFootprint3.carbonCloudLinkCarbon, {
    val1: url,
  });
};
