import { LocaleType } from '@src/lang/I18N';
import { Dropdown, Menu } from 'antd';
import { useContext } from 'react';
import I18N from 'src/lang/I18N';

import style from './index.module.less';
import { LocaleContext } from '../LocaleProvider';

export const languageMap = [
  {
    value: LocaleType.zhCN,
    text: I18N.components.simplifiedChinese,
  },
  // 暂时隐藏繁体中文入口，保留资源与枚举，后续恢复时取消注释即可。
  // {
  //   value: LocaleType.zhTW,
  //   text: I18N.components.traditionalChinese,
  // },
  {
    value: LocaleType.enUS,
    text: 'English',
  },
];

export const SelectLanguage = ({
  onlyFeSwitch = false,
  ticket,
  compact = false,
}: {
  onlyFeSwitch?: boolean;
  ticket?: string;
  compact?: boolean;
}) => {
  const { changeLocale, locale } = useContext(LocaleContext);
  const localeText = languageMap.find(item => item.value === locale)?.text;
  const displayLocaleText =
    compact && locale === LocaleType.zhCN ? '中文' : localeText;
  const menu = (
    <Menu>
      {languageMap.map(item => (
        <Menu.Item
          key={item.value}
          onClick={() =>
            changeLocale({
              currentLocale: item.value,
              onlyFeSwitch,
              syncUrl: true,
              ticket,
            })
          }
        >
          {item.text}
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <div className={style.dropWrapper}>
      <Dropdown overlay={menu} placement='bottom'>
        <div className={style.box}>
          <div className={style.vector} />
          <span>{displayLocaleText}</span>
          <div className={style.caretDown} />
        </div>
      </Dropdown>
    </div>
  );
};
