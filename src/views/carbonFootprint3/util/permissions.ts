import { checkPermissions } from '@src/components/Permission/utils';

/** 是否有编辑全选 */
export const checkProductLibraryEditPermissions = () =>
  !!checkPermissions(true, 'footprint3:product:edit');

/** 是否能查看详情 */
export const checkProductLibraryInfoPermissions = () =>
  !!checkPermissions(true, 'footprint3:product:info');

/** 排放源库 */
/** 是否有编辑全选 */
export const checkEmissionSoureLibraryEditPermissions = () =>
  !!checkPermissions(true, 'footprint3:libEmission:edit');

/** 是否能查看详情 */
export const checkEmissionSoureLibraryInfoPermissions = () =>
  !!checkPermissions(true, 'footprint3:libEmission:info');

/** 过程库 */
/** 是否有编辑全选 */
export const checkEmissionSoureProcessEditPermissions = () =>
  !!checkPermissions(true, 'footprint3:libProcess:edit');

/** 是否能查看详情 */
export const checkEmissionSoureProcessInfoPermissions = () =>
  !!checkPermissions(true, 'footprint3:libProcess:info');
