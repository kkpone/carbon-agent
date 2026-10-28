import { connect } from '@formily/react';
import { Button } from 'antd';
import React from 'react';
import I18N from 'src/lang/I18N';

import styles from './index.module.less';

interface ToggleVerifyTypeProps {
  // 组件 props 类型声明
  value?: boolean;
  onChange?: (value: boolean) => void;
  toggle?: () => void;
}

const ToggleVerifyType: React.FC<ToggleVerifyTypeProps> = props => {
  const { value, onChange, toggle } = props;
  // 组件函数
  return (
    <div className={styles.wrapper}>
      <Button
        type='link'
        className={styles.green}
        onClick={() => onChange?.(!value)}
      >
        {value ? I18N.system.passwordLogin : I18N.system.verificationCodeLogin}
      </Button>
      <Button type='link' className={styles.green} onClick={() => toggle?.()}>
        {value ? '' : I18N.system.forgotPassword1}
      </Button>
    </div>
  );
};

export const ToggleVerifyTypeWrapper = connect(ToggleVerifyType);
