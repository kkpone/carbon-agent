import { createContext } from 'react';

/** 由需要区分因子来源的页面入口显式开启。 */
export const ShowFactorTypeContext = createContext(false);

/** 自定义因子复用仅在指定业务入口开启，不改变字段原有编辑权限。 */
export const CustomFactorReuseContext = createContext(false);

/** 分享页面强制关闭复用，内层业务开启开关也不能覆盖。 */
export const CustomFactorReuseExcludedContext = createContext(false);
