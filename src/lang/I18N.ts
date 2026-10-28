import type { Locale } from 'antd/es/locale';
import Ant_en_US from 'antd/es/locale/en_US';
import Ant_zh_CN from 'antd/es/locale/zh_CN';
import Ant_zh_TW from 'antd/es/locale/zh_TW';
import KiwiIntl from 'kiwi-intl';

import { getLocaleCodeFromPathname } from '../router/localePath';
import enUS from './en-US/index';
import zhCN from './zh-CN/index';
import zhTW from './zh-TW';

export enum LocaleType {
  'zhCN' = 'zh-CN',
  'zhTW' = 'zh-TW',
  'enUS' = 'en-US',
}

export const serviceLangMap = {
  [LocaleType.zhCN]: 'zh',
  [LocaleType.zhTW]: 'zt',
  [LocaleType.enUS]: 'en',
} as const;

export const serviceLangMapReverse = {
  zh: LocaleType.zhCN,
  zt: LocaleType.zhTW,
  en: LocaleType.enUS,
} as const;

function getInitLocale() {
  const localeCode = getLocaleCodeFromPathname();

  if (localeCode === 'en') {
    return LocaleType.enUS;
  }
  if (localeCode === 'zt') {
    return LocaleType.zhTW;
  }
  return LocaleType.zhCN;
}

export const initLocale = getInitLocale();
// 项目内国际化资源
const kiwiIntl = KiwiIntl.init(initLocale, {
  [LocaleType.zhCN]: zhCN,
  [LocaleType.zhTW]: zhTW,
  [LocaleType.enUS]: enUS,
});

// 组件库国际化资源
export const AntdLocale: {
  [key in LocaleType]: Locale;
} = {
  [LocaleType.zhCN]: Ant_zh_CN,
  [LocaleType.zhTW]: Ant_zh_TW,
  [LocaleType.enUS]: Ant_en_US,
};

export default kiwiIntl as typeof kiwiIntl & {
  template: (str: string, args: object) => string;
};
