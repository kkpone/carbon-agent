import { LocaleContext } from '@src/components/LocaleProvider';
import { serviceLangMap } from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import { Input } from 'antd';
import React, { useContext, useMemo, useEffect } from 'react';
import I18N from 'src/lang/I18N';

import { AreaCode } from './AreaCode';
import { getAreaCode } from '../../service';

interface LoginWrapperProps {
  value: {
    areaCode: string; // 区号
    phoneNumber: string; // 手机号
  };
  onChange: (value: any) => void;
}

export const PhoneNumber: React.FC<LoginWrapperProps> = props => {
  const { value, onChange } = props;

  const { locale } = useContext(LocaleContext);

  const { data = [] } = useRequest(
    () =>
      getAreaCode({
        lang: serviceLangMap[locale],
      }),
    {
      cacheKey: locale,
      // 30 分钟
      staleTime: 30 * 1000 * 60,
      refreshDeps: [locale],
    },
  );

  useEffect(() => {
    if (data.length > 0) {
      onChange({
        value,
        areaCode: data[0]?.areaContent,
      });
    }
  }, [data]);

  // 这里不用 areaCode 作为 key，是因为不同 option 的 areaCode 可能会相同。例如美国加拿大区号都是 1 。
  const options = useMemo(
    () =>
      data.map(item => ({
        label: item.areaContent,
        value: item.areaContent,
      })),
    [data],
  );

  return (
    <Input
      maxLength={11}
      value={value?.phoneNumber}
      onInput={(e: any) => {
        onChange({
          ...value,
          phoneNumber: e.target.value,
        });
      }}
      placeholder={I18N.system.pleaseEnterYourPhoneNumber2}
      prefix={
        <AreaCode
          value={value?.areaCode}
          options={options}
          onChange={areaCode =>
            onChange({
              ...value,
              areaCode,
            })
          }
        />
      }
    />
  );
};
