/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-06 18:48:44
 * @Date: 2023-04-06 18:46:09
 * @@description:
 */
import { checkPermissions } from '@src/components/Permission/utils';

export const checkProcessAccountEditPermissions = () =>
  !!(
    checkPermissions(true, 'footprint3:account:saveAndView:process') ||
    checkPermissions(true, 'footprint3:account:save:process')
  );
