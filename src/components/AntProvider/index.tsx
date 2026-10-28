/* eslint-disable react/no-unstable-nested-components */
/*
 * @Author: 张明尧
 * @Date: 2022-08-31 16:00:42
 */
/**
 * @file antd 全局变量注入
 */
import { customizeRenderEmpty } from '@src/index';
import { AntdLocale, LocaleType } from '@src/lang/I18N';
import { ConfigProvider, App } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'moment/locale/zh-tw';
import { useContext, useLayoutEffect, useMemo } from 'react';

import { themeConfig } from './theme';
import { LocaleContext } from '../LocaleProvider';

export const AntdProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { locale } = useContext(LocaleContext);

  const antdLocale = useMemo(() => AntdLocale[locale], [locale]);

  useLayoutEffect(() => {
    const momentLocaleMap: Record<LocaleType, string> = {
      [LocaleType.zhCN]: 'zh-cn',
      [LocaleType.zhTW]: 'zh-tw',
      [LocaleType.enUS]: 'en',
    };
    moment.locale(momentLocaleMap[locale]);

    ConfigProvider.config({
      holderRender: node => (
        <ConfigProvider locale={antdLocale} theme={themeConfig}>
          <App>{node}</App>
        </ConfigProvider>
      ),
    });
  }, [antdLocale, locale]);

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={themeConfig}
      renderEmpty={customizeRenderEmpty}
      button={{
        autoInsertSpace: false,
      }}
    >
      {children}
    </ConfigProvider>
  );
};
