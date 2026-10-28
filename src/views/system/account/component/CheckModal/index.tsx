import CountdownButton from '@src/components/CountdownButton/Index';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Input, Modal } from 'antd';
import type { ModalProps } from 'antd';
import classNames from 'classnames';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import styles from './index.module.less';
import { BindType, sendUnBinding, checkUnBinding } from '../../service';

interface CheckModalProps {
  initBindType: BindType;
  getContainer?: ModalProps['getContainer'];
  mobile?: string;
  email?: string;
  onSuccess: (bindType: BindType) => void;
  rootClassName?: string;
  wrapClassName?: string;
  zIndex?: number;
}

export const CheckModal = forwardRef((props: CheckModalProps, ref) => {
  const {
    email,
    getContainer,
    initBindType,
    mobile,
    onSuccess,
    rootClassName,
    wrapClassName,
    zIndex,
  } = props;
  const [visible, setVisible] = useState(false);
  const [bindType, setBindType] = useState<BindType>(initBindType);
  const [code, setCode] = useState('');
  const [resourceBindType, setResourceBindType] =
    useState<BindType>(initBindType);

  useEffect(() => {
    if (visible) {
      setCode('');
    }
  }, [visible]);

  const sendCode = async () => {
    await sendUnBinding({ bindType });
  };
  useImperativeHandle(ref, () => ({
    showCheckModal: (checkBindType: BindType) => {
      setBindType(checkBindType);
      setResourceBindType(checkBindType);
      setVisible(true);
    },
  }));

  const canNotChangeBindType = !(email && mobile);
  return (
    <div>
      <Modal
        open={visible}
        getContainer={getContainer}
        rootClassName={rootClassName}
        wrapClassName={classNames(styles.checkModal, wrapClassName)}
        zIndex={zIndex}
        width={432}
        centered
        title={I18N.system.toEnsureAccountSecurity}
        onCancel={() => setVisible(false)}
        destroyOnClose
        onOk={async () => {
          if (!code) {
            Toast('info', I18N.system.pleaseEnterVerification);
            return;
          }
          await checkUnBinding({ bindType, code });
          setVisible(false);
          onSuccess(resourceBindType);
        }}
      >
        {bindType === BindType.email && (
          <div className={styles.info}>
            {I18N.system.pleaseUse}
            <span className={styles.font}>{props.email}</span>{' '}
            {I18N.system.emailFor}
          </div>
        )}
        {bindType === BindType.phone && (
          <div className={styles.info}>
            {I18N.system.pleaseUse}
            <span className={styles.font}>{props.mobile} </span>{' '}
            {I18N.system.usingMobilePhones}
          </div>
        )}
        <span
          className={classNames(styles.change, {
            [styles.disabled]: canNotChangeBindType,
          })}
          onClick={() => {
            if (canNotChangeBindType) return;
            setBindType(pre =>
              pre === BindType.email ? BindType.phone : BindType.email,
            );
          }}
        >
          {I18N.carbonFootprint3.apply}
          {bindType === BindType.email
            ? I18N.dashborad.mobilePhoneNumber
            : I18N.carbonFootprint.mailbox}
          {I18N.system.validate}
        </span>
        <div className={styles.label}>
          <span className={styles.red}>*</span>
          {I18N.system.verificationCode}
        </div>
        <div className={styles.inputWrapper}>
          <Input
            style={{ marginRight: '6px' }}
            placeholder={I18N.system.pleaseEnterVerification}
            maxLength={6}
            onChange={e => setCode(e.target.value)}
          />
          <CountdownButton
            text={I18N.system.sendVerificationCode}
            onClick={() => sendCode()}
            initCount={60}
          />
        </div>
        <div className={styles.notUsed}>
          {I18N.system.mobilePhoneNumberAndEmail}
        </div>
      </Modal>
    </div>
  );
});
