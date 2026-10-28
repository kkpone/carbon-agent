import { checkPermissions } from '@src/components/Permission/utils';

// 核算相关 - 分享
export const haveAccountShareAddPermissions = () =>
  checkPermissions(true, 'footprint3:share:add');

// 核算相关 - AI功能相关
export const haveAccountAiPermissions = () =>
  checkPermissions(true, 'footprint3:account:ai');

// 核算相关 - 是否有编辑权限
export const haveAccountEditPermissions = () =>
  checkPermissions(true, 'footprint3:account:edit');

// 核算相关 - 是否有查看权限
export const haveAccountInfoPermissions = () =>
  checkPermissions(true, 'footprint3:account:info');

// 是否有复制权限
export const haveAccountCopyPermissions = () =>
  checkPermissions(true, 'footprint3:account:copy');

// 是否有删除权限
export const haveAccountDeletePermissions = () =>
  checkPermissions(true, 'footprint3:account:delete');

// 产品相关 - 新增
export const haveProductAddPermissions = () =>
  checkPermissions(true, 'footprint3:product:add');

// 产品相关 - 是否有编辑权限
export const haveProductEditPermissions = () =>
  checkPermissions(true, 'footprint3:product:edit');

// 产品相关 - 删除
export const haveProductDeletePermissions = () =>
  checkPermissions(true, 'footprint3:product:delete');

// 产品相关 - 导入
export const haveProductUploadPermissions = () =>
  checkPermissions(true, 'footprint3:product:upload');

// 碳标签 - 新增

// 碳标签 - 编辑
export const haveCarbonLabelEditPermissions = () =>
  checkPermissions(true, 'footprint3:label:edit');

// 碳标签 - 查看
export const haveCarbonLabelInfoPermissions = () =>
  checkPermissions(true, 'footprint3:label:info');

// 碳标签 - 删除
export const haveCarbonLabelDeletePermissions = () =>
  checkPermissions(true, 'footprint3:label:delete');

// AI 减排建议查看
export const haveAiEmissionAnalysisPermissions = () =>
  checkPermissions(true, 'footprint3:account:aiEmissionAnalysis');
