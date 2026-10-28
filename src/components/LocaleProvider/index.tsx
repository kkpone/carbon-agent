import { setValidateLanguage } from '@formily/core';
import { apiQuideList as getGuideList } from '@src/api/api';
import kiwiIntl, {
  LocaleType,
  initLocale,
  serviceLangMap,
} from '@src/lang/I18N';
import { buildLocaleSwitchPath, LocaleRouteCode } from '@src/router/localePath';
import { SET_COMPANY_USER_INFO } from '@src/store/actionTypes';
import { USER_KEY } from '@src/store/module/nav';
import { mapChildren } from '@src/utils';
import { getLoginStorage } from '@src/utils/feishuSession';
import {
  getLanguage,
  switchLanguage,
  switchLanguageByTicket,
} from '@src/views/system/login/service';
import { useTitle } from 'ahooks';
import { noop } from 'lodash-es';
import {
  createContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  FC,
} from 'react';

import { getProductPermission } from '../LayoutNavBar/utils';

type ChangeLocaleParams = {
  currentLocale: LocaleType;
  onlyFeSwitch?: boolean;
  syncUrl?: boolean;
  ticket?: string;
};

const titleMap = {
  [LocaleType.zhCN]: 'Carbon Agent',
  [LocaleType.zhTW]: 'Carbon Agent',
  [LocaleType.enUS]: 'Carbon Agent',
};

const localeRouteCodeMap: Partial<Record<LocaleType, LocaleRouteCode>> = {
  [LocaleType.zhCN]: 'zh',
  [LocaleType.zhTW]: 'zt',
  [LocaleType.enUS]: 'en',
};

function getStoredCompanyUserInfo() {
  try {
    return JSON.parse(getLoginStorage().getItem(SET_COMPANY_USER_INFO) || '{}');
  } catch {
    return {};
  }
}

export const LocaleContext = createContext<{
  locale: LocaleType;
  changeLocale: (params: ChangeLocaleParams) => Promise<void> | void;
}>({
  locale: LocaleType.zhCN,
  changeLocale: noop,
});

/**
 * 脏代码，兼容原来的权限逻辑
 * @todo 重构登录和路由逻辑
 * GRT_NAV 为导航栏存储的信息
 * SET_COMPANY_USER_INFO 为用户信息和左侧 menu 信息
 * 切换中英文后，需要重新获取导航栏和用户信息
 */
async function updateGuideAndNav() {
  const productId = sessionStorage.getItem('productId') || '';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [res, info] = await getProductPermission(productId);
  const { data } = await getGuideList();
  getLoginStorage().removeItem(USER_KEY);
  const newArr = data.data.map(item => ({
    id: item.id,
    name: item.guideName,
    isFloat: item.isFloat.toString(),
    web_path: '',
    children: mapChildren(item?.categoryList || []),
    checkid: item.id,
  }));
  getLoginStorage().setItem(USER_KEY, JSON.stringify(newArr));
  if (info) {
    const preInfo = JSON.parse(
      getLoginStorage().getItem(SET_COMPANY_USER_INFO) || '',
    );
    getLoginStorage().setItem(
      SET_COMPANY_USER_INFO,
      JSON.stringify({
        ...preInfo,
        userInfo: info,
      }),
    );
  }
}

export const LocaleProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocale] = useState(initLocale);

  useTitle(titleMap[locale]);

  useEffect(() => {
    setValidateLanguage(locale);
  }, [locale]);

  const syncLocaleUrl = useCallback((currentLocale: LocaleType) => {
    const localeRouteCode = localeRouteCodeMap[currentLocale];

    if (!localeRouteCode || typeof window === 'undefined') {
      return false;
    }

    const nextPath = buildLocaleSwitchPath(localeRouteCode);
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextPath === currentPath) {
      return false;
    }

    window.location.href = nextPath;
    return true;
  }, []);

  const syncBackendLanguageWithUrl = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const companyUserInfo = getStoredCompanyUserInfo();

    if (!companyUserInfo?.access_token) {
      return;
    }

    const urlLang = serviceLangMap[initLocale];
    const backendLanguage = await getLanguage();

    if (backendLanguage?.lang !== urlLang) {
      await switchLanguage({ lang: urlLang });
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    syncBackendLanguageWithUrl().catch(noop);
  }, [syncBackendLanguageWithUrl]);

  const changeLocale = useCallback(
    async ({
      currentLocale,
      onlyFeSwitch,
      syncUrl,
      ticket,
    }: ChangeLocaleParams) => {
      if (onlyFeSwitch) {
        setLocale(currentLocale);
        kiwiIntl?.setLang?.(currentLocale);
        setValidateLanguage(currentLocale);

        if (syncUrl && syncLocaleUrl(currentLocale)) {
          return;
        }

        return;
      }

      if (ticket) {
        await switchLanguageByTicket({
          lang: serviceLangMap[currentLocale],
          ticket,
        });
      } else {
        await switchLanguage({ lang: serviceLangMap[currentLocale] });
        await updateGuideAndNav();
      }

      if (syncUrl && syncLocaleUrl(currentLocale)) {
        return;
      }

      window.location.reload();
    },
    [syncLocaleUrl],
  );

  const contextValue = useMemo(
    () => ({
      locale,
      changeLocale,
    }),
    [locale, changeLocale],
  );

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
};
