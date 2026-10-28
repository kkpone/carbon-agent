import { TextField } from '@mui/material';
import { Button } from 'antd';
import React, { useState } from 'react';
import I18N from 'src/lang/I18N';

interface IVerifyCodeProps {
  value?: any;
  onChange?: (value: any) => void;
  readyPost?: boolean;
  phoneNumber?: any;
  style?: React.CSSProperties;
  sendVerifyCode?: (value: any) => Promise<any>;
}

export const VerifyCode: React.FC<
  React.PropsWithChildren<IVerifyCodeProps>
> = ({ value, onChange, readyPost, phoneNumber, sendVerifyCode, ...props }) => {
  const [lastTime, setLastTime] = useState(0);

  const counting = (time = 20) => {
    if (time < 0) return;
    setLastTime(time);
    setTimeout(() => {
      counting(time - 1);
    }, 1000);
  };

  return (
    <div
      style={{ display: 'inline-flex', width: '100%', alignItems: 'center' }}
    >
      <TextField
        {...props}
        fullWidth
        style={{ marginRight: 12, ...props.style, lineHeight: '30px' }}
        value={value}
        inputProps={{
          maxLength: 6, // 设置最大字符长度为 10
        }}
        onChange={onChange}
      />
      <div
        style={{
          flexShrink: 0,
          color: '#999',
          width: 100,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {lastTime === 0 && (
          <Button
            disabled={!readyPost}
            size='large'
            style={{
              height: 48,
              borderRadius: 8,
            }}
            block
            onClick={async () => {
              // if (
              //   isUndefined(phoneNumber.phoneNumber) ||
              //   isNull(phoneNumber.phoneNumber)
              // ) {
              //   VerifyUtils.Toast(
              //     'warn',
              //     I18N.system.pleaseEnterYourPhoneNumber,
              //   );
              //   return;
              // }
              await sendVerifyCode?.(phoneNumber);
              counting(60);
            }}
          >
            {I18N.system.sendVerificationCode}
          </Button>
        )}
        {lastTime > 0 && (
          <Button
            disabled
            size='large'
            style={{
              height: 48,
              borderRadius: 8,
            }}
            block
          >
            {lastTime}
            {I18N.system.second}
          </Button>
        )}
      </div>
    </div>
  );
};
