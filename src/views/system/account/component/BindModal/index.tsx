import I18N from '@src/lang/I18N';
import CountdownButton from '@src/components/CountdownButton/Index';
import { getProductPermission } from '@src/components/LayoutNavBar/utils';
import store from '@src/store';
import { UPDATE_INFO } from '@src/store/actionTypes';
import { CompanyUserInfoAction } from '@src/store/module/user';
import { checkEmail, checkPhone } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { Input, Modal } from 'antd';
import type { ModalProps } from 'antd';
import classNames from 'classnames';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import styles from './index.module.less';
import { sendBinding, checkBinding, BindType } from '../../service';

interface BindModalProps {
  bindType: BindType;
  getContainer?: ModalProps['getContainer'];
  rootClassName?: string;
  onSuccess: () => void;
  wrapClassName?: string;
  zIndex?: number;
}
const bindTypeNames = {
  [BindType.email]: I18N.carbonFootprint.mailbox,
  [BindType.phone]: I18N.dashborad.mobilePhoneNumber,
};
export const BindModal = forwardRef((props: BindModalProps, ref) => {
  const {
    bindType,
    getContainer,
    onSuccess,
    rootClassName,
    wrapClassName,
    zIndex,
  } = props;
  const [visible, setVisible] = useState(false);
  const [phoneValue, setPhoneValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [validValue, setValidValue] = useState('');

  useEffect(() => {
    if (visible) {
      setPhoneValue('');
      setEmailValue('');
      setValidValue('');
    }
  }, [visible]);

  const sendCode = async () => {
    if (bindType === BindType.email) {
      if (!checkEmail(emailValue)) {
        return Promise.reject();
      }
      await sendBinding({ bindContent: emailValue, bindType: BindType.email });
    } else if (bindType === BindType.phone) {
      if (!checkPhone(phoneValue)) {
        return Promise.reject();
      }
      await sendBinding({ bindContent: phoneValue, bindType: BindType.phone });
    }
    return Promise.resolve();
  };
  useImperativeHandle(ref, () => ({
    showBindModal: () => setVisible(true),
  }));
  const checkCanSubmit = () => {
    if (bindType === BindType.email) {
      return checkEmail(emailValue);
    }
    if (bindType === BindType.phone) {
      return checkPhone(phoneValue);
    }
    return true;
  };
  return (
    <div>
      <Modal
        open={visible}
        destroyOnClose
        getContainer={getContainer}
        rootClassName={rootClassName}
        width={432}
        wrapClassName={classNames(styles.bindModal, wrapClassName)}
        zIndex={zIndex}
        title={I18N.template(I18N.system.bindBin, {
          val1: bindTypeNames[bindType],
        })}
        onCancel={() => setVisible(false)}
        onOk={async () => {
          const res = checkCanSubmit();
          if (!res || !validValue) {
            Toast('info', I18N.system.pleaseInputCorrectly2);
            return;
          }
          await checkBinding({
            bindContent: bindType === BindType.phone ? phoneValue : emailValue,
            code: validValue,
            bindType,
          });
          try {
            const product = localStorage.getItem('PRODUCT_KEY') || '{}';
            const { productId } = JSON.parse(product);
            const [, info] = await getProductPermission(productId);
            if (info) {
              store.dispatch<CompanyUserInfoAction>({
                type: UPDATE_INFO,
                payload: info,
              });
            }
          } finally {
            setVisible(false);
            onSuccess?.();
          }
        }}
      >
        <div className={styles.info}>
          {I18N.system.afterBindingItCanBeConnected}
          {bindTypeNames[bindType]}
          {I18N.system.login}
        </div>
        {bindType === BindType.phone && (
          <>
            <div className={styles.label}>
              <span className={styles.red}>*</span>
              {I18N.dashborad.mobilePhoneNumber}
            </div>
            <Input
              placeholder={I18N.system.pleaseEnterYourPhoneNumber}
              maxLength={11}
              onChange={e => setPhoneValue(e.target.value)}
            />
          </>
        )}
        {bindType === BindType.email && (
          <>
            <div className={styles.label}>
              <span className={styles.red}>*</span>
              {I18N.carbonFootprint.mailbox}
            </div>
            <Input
              placeholder={I18N.dashborad.pleaseEnterYourEmailAddress}
              onChange={e => setEmailValue(e.target.value)}
            />
          </>
        )}
        <div className={classNames(styles.label, styles.validator)}>
          <span className={styles.red}>*</span>
          {I18N.system.verificationCode}
        </div>
        <div className={styles.inputWrapper}>
          <Input
            maxLength={6}
            style={{ marginRight: '6px' }}
            onChange={e => setValidValue(e.target.value)}
            placeholder={I18N.system.verificationCode}
          />
          <CountdownButton
            checkCanSubmit={() => {
              const canSubmit = checkCanSubmit();
              if (!canSubmit) {
                Toast(
                  'info',
                  I18N.template(I18N.system.pleaseInputCorrectly, {
                    val1: bindTypeNames[bindType],
                  }),
                );
              }
              return canSubmit;
            }}
            text={I18N.system.sendVerificationCode}
            onClick={() => sendCode()}
            initCount={60}
          />
        </div>
      </Modal>
    </div>
  );
});
