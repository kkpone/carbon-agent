import { Field } from '@formily/core';
import { useField } from '@formily/react';
import { InputAdornment, TextField } from '@mui/material';
import { LocaleContext } from '@src/components/LocaleProvider';
import { serviceLangMap } from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import { omit } from 'lodash-es';
import React, { useContext, useMemo, useEffect, useState } from 'react';
import I18N from 'src/lang/I18N';

import { getAreaCode } from '@/views/system/login/service';

import { AreaCode } from './AreaCode';
// import { getAreaCode } from '../../service';

interface LoginWrapperProps {
  value: {
    areaCode: string; // 区号
    phoneNumber: string; // 手机号
  };
  onChange: (value: any) => void;
}

export const MaterialPhoneNumber: React.FC<LoginWrapperProps> = props => {
  const { value, onChange } = props;

  const field = useField() as Field;

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
        ...value,
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

  const [focus, setFocus] = useState(false);

  const shrink = focus || value?.phoneNumber?.length > 0;

  return (
    <TextField
      {...omit(props, ['value', 'onChange'])}
      value={value?.phoneNumber || ''}
      id='input-with-icon-textfield'
      style={{
        height: 48,
      }}
      label={I18N.dashborad.mobilePhoneNumber}
      fullWidth
      InputLabelProps={{
        shrink, // 只有有内容时，label 才上移
        sx: {
          // 动态调整位置以防止遮挡，同时保持上移时动画效果
          transform: shrink ? 'translate(20, -6px)' : 'translate(90px, 14px)',
          transition: 'transform 200ms ease-in-out', // 保持动画效果
        },
      }}
      autoFocus
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onChange={e => {
        if (e.target.value) {
          field?.setFeedback({
            type: 'error',
            messages: [],
          });
        }
        onChange({
          ...value,
          phoneNumber: e.target.value,
        });
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position='start'>
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
            </InputAdornment>
          ),
        },
      }}
      variant='outlined'
    />
  );
};
