/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-14 17:09:38
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-03-15 10:01:49
 */
import { checkPermissions } from '@src/components/Permission/utils';

export const checkEmissionAccessPermissions = () =>
  !!(
    checkPermissions(true, 'footprint3:account:saveAndView:fast') ||
    checkPermissions(true, 'footprint3:account:addView:fast')
  );

export const checkQuickAccountEditPermissions = () =>
  !!(
    checkPermissions(true, 'footprint3:account:saveAndView:fast') ||
    checkPermissions(true, 'footprint3:account:save:fast')
  );
