import { CloseOutlined } from '@ant-design/icons';
import { SwitchoverCompanyData } from '@src/api/types';
import { LocaleContext } from '@src/components/LocaleProvider';
import { serviceLangMap } from '@src/lang/I18N';
import { SET_COMPANY_USER_INFO } from '@src/store/actionTypes';
import { CompanyUserInfoAction } from '@src/store/module/user';
import { mapChildren, sleep } from '@src/utils';
import { COMPANY_ID } from '@src/utils/consts';
import VerifyUtils from '@src/utils/verifty';
import classNames from 'classnames';
import { omit } from 'lodash-es';
import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import I18N from 'src/lang/I18N';

import { apiQuideList, switchoverCompany } from '@/api/api';
import logoIconDark from '@/assets/images/carbonAgent/icons/agent-logo.svg';
import store from '@/store';
import { getAgentInviteCode } from '@/utils/ccdbReferral';
import { GRT_NAV } from '@/store/module/nav';
import { apiCompanyList } from '@/views/system/account/service';
import {
  CompanyType,
  ProductSource,
} from '@/views/system/login/component/Login';
import { setUserInfo } from '@/views/system/login/loginRes';
import {
  apiAgentWebLogin,
  apiSendSMS,
  LoginClientType,
  LoginType,
} from '@/views/system/login/service';

import {
  getAgentBrowserId,
  getAgentAcquisitionContext,
  trackAgentAuthModalView,
  trackAgentAuthSubmit,
  type AgentLoginTriggerEntry,
} from '../acquisition';
import style from '../index.module.less';

type MobileLoginSheetProps = {
  companyType: CompanyType;
  onClose?: () => void;
  onSuccess?: () => void;
  open: boolean;
  productSource?: ProductSource;
  skipCompanyBootstrap?: boolean;
  triggerEntry?: AgentLoginTriggerEntry;
};

const AREA_CODE_CN = '86';
const PHONE_MAX_LENGTH = 11;
const VERIFY_CODE_MAX_LENGTH = 6;
const AGREEMENT_CHECKBOX_ID = 'carbon-agent-mobile-login-agreement';
const LOGIN_SHEET_EXIT_DURATION = 220;

const normalizeDigits = (value: string, maxLength: number) =>
  value.replace(/\D/g, '').slice(0, maxLength);

const isValidMainlandPhone = (value: string) => /^1\d{10}$/.test(value);

const MobileLoginSheet = ({
  companyType,
  onClose,
  onSuccess,
  open,
  productSource,
  skipCompanyBootstrap = false,
  triggerEntry = 'other',
}: MobileLoginSheetProps) => {
  const dispatch = useDispatch();
  const { locale } = useContext(LocaleContext);
  const lang = serviceLangMap[locale];
  const agentInviteCode = getAgentInviteCode();
  const [phone, setPhone] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [checked, setChecked] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [rendered, setRendered] = useState(open);
  const [leaving, setLeaving] = useState(false);
  const exitTimerRef = useRef<number>();
  const modalViewOpenRef = useRef(false);

  const resetFormState = useCallback(() => {
    setPhone('');
    setVerifyCode('');
    setChecked(false);
    setCountdown(0);
    setSendingCode(false);
    setLoggingIn(false);
  }, []);

  useEffect(
    () => () => {
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (exitTimerRef.current) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = undefined;
    }

    if (open) {
      setRendered(true);
      setLeaving(false);
      return undefined;
    }

    if (!rendered) {
      return undefined;
    }

    setLeaving(true);
    exitTimerRef.current = window.setTimeout(() => {
      setRendered(false);
      setLeaving(false);
      resetFormState();
      exitTimerRef.current = undefined;
    }, LOGIN_SHEET_EXIT_DURATION);

    return undefined;
  }, [open, rendered, resetFormState]);

  useEffect(() => {
    if (!countdown) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCountdown(prevCountdown => Math.max(prevCountdown - 1, 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [countdown]);

  useEffect(() => {
    if (open && !modalViewOpenRef.current) {
      modalViewOpenRef.current = true;
      trackAgentAuthModalView(triggerEntry);
    }
    if (!open) {
      modalViewOpenRef.current = false;
    }
  }, [open, triggerEntry]);

  const completeLogin = useCallback(
    async (token: SwitchoverCompanyData) => {
      const userId = token.userInfo?.userId || '';

      store.dispatch({
        type: skipCompanyBootstrap
          ? 'agent/replaceWorkspaceLogin'
          : SET_COMPANY_USER_INFO,
        payload: skipCompanyBootstrap
          ? token
          : omit(token, ['productId', 'companyId']),
      });

      if (skipCompanyBootstrap) {
        const companyId = token.userInfo?.companyId || token.companyId;

        if (companyId) {
          localStorage.setItem(COMPANY_ID, `${companyId}`);
        }

        onSuccess?.();
        return;
      }

      const companyList = await apiCompanyList({
        userId,
        page: '1',
        size: '10000',
      });
      const firstCompanyId = companyList?.data?.rows?.[0]?.companyId;
      const companyId =
        firstCompanyId ||
        token.userInfo?.companyVoList?.[0]?.companyId ||
        token.companyId;

      if (companyId) {
        localStorage.setItem(COMPANY_ID, `${companyId}`);

        const switchRes = await switchoverCompany({
          companyId: `${companyId}`,
          userId: userId || '',
        });
        const userData = switchRes?.data?.data;

        if (switchRes.data.code === 200 && userData) {
          dispatch<CompanyUserInfoAction>({
            type: SET_COMPANY_USER_INFO,
            payload: userData,
          });

          window.setTimeout(() => {
            apiQuideList().then(({ data }) => {
              if (data.code === 200) {
                const navList = data.data.map(item => ({
                  id: item.id,
                  name: item.guideName,
                  isFloat: `${item.isFloat}`,
                  web_path: '',
                  children: mapChildren(item?.categoryList || []),
                  checkid: item.id,
                }));

                dispatch({
                  type: GRT_NAV,
                  payload: navList,
                });
              }
            });
          });

          await sleep(300);
          onSuccess?.();
        }

        return;
      }

      await setUserInfo(token);
      onSuccess?.();
    },
    [dispatch, onSuccess, skipCompanyBootstrap],
  );

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhone(normalizeDigits(event.target.value, PHONE_MAX_LENGTH));
  };

  const handleVerifyCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVerifyCode(normalizeDigits(event.target.value, VERIFY_CODE_MAX_LENGTH));
  };

  const handleSendCode = async () => {
    if (!isValidMainlandPhone(phone)) {
      VerifyUtils.Toast(400, I18N.system.pleaseEnterYourPhoneNumber2);
      return;
    }

    if (sendingCode || countdown) {
      return;
    }

    setSendingCode(true);

    try {
      await apiSendSMS({
        areaCode: AREA_CODE_CN,
        lang,
        number: phone,
      });
      setCountdown(60);
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!checked) {
      VerifyUtils.Toast(400, I18N.system.pleaseReadAndAgreeWith);
      return;
    }

    if (!isValidMainlandPhone(phone)) {
      VerifyUtils.Toast(400, I18N.system.pleaseEnterYourPhoneNumber2);
      return;
    }

    if (!verifyCode) {
      VerifyUtils.Toast(400, I18N.system.verificationCodeCannotBeUsed);
      return;
    }

    if (loggingIn) {
      return;
    }

    setLoggingIn(true);
    trackAgentAuthSubmit('phone_otp', triggerEntry);

    try {
      const context = getAgentAcquisitionContext();
      const res = await apiAgentWebLogin({
        agentChannel: context.agentChannel,
        agentInviteCode,
        browserId: getAgentBrowserId(),
        areaCode: AREA_CODE_CN,
        companyType,
        identify: verifyCode,
        lang,
        loginType: LoginType.phone,
        password: null,
        productSource,
        clientType: LoginClientType.agentWeb,
        username: phone,
      });

      if (res.data.code === 200 && res.data.data) {
        await sleep(1000);
        await completeLogin(res.data.data as SwitchoverCompanyData);
      }
    } finally {
      setLoggingIn(false);
    }
  };

  if (!rendered) {
    return null;
  }

  let sendCodeText = I18N.system.obtainVerificationCode;

  if (countdown > 0) {
    sendCodeText = `${countdown}${I18N.system.second}`;
  } else if (sendingCode) {
    sendCodeText = I18N.carbonAgent.sendingCode;
  }

  return (
    <div
      className={classNames(style.mobileLoginLayer, {
        [style.mobileLoginLayerLeaving]: leaving,
      })}
      role='dialog'
      aria-modal='true'
      aria-label={I18N.carbonAgent.loginCarbonCloud}
    >
      <button
        className={style.mobileLoginBackdrop}
        type='button'
        aria-label={I18N.carbonAgent.closeLoginDialog}
        onClick={onClose}
      />
      <form className={style.mobileLoginSheet} onSubmit={handleSubmit}>
        <div className={style.mobileLoginTitle}>
          <img src={logoIconDark} alt='' />
          <span>{I18N.carbonAgent.loginCarbonCloud}</span>
          <button
            className={style.mobileLoginClose}
            type='button'
            aria-label={I18N.carbonAgent.closeLoginDialog}
            onClick={onClose}
          >
            <CloseOutlined />
          </button>
        </div>

        <div className={style.mobileLoginFields}>
          <input
            value={phone}
            inputMode='numeric'
            autoComplete='tel'
            maxLength={PHONE_MAX_LENGTH}
            placeholder={I18N.carbonAgent.phonePlaceholder}
            aria-label={I18N.carbonAgent.phonePlaceholder}
            className={style.mobileLoginInput}
            onChange={handlePhoneChange}
          />
          <div className={style.mobileLoginCodeField}>
            <input
              value={verifyCode}
              inputMode='numeric'
              autoComplete='one-time-code'
              maxLength={VERIFY_CODE_MAX_LENGTH}
              placeholder={I18N.carbonAgent.verifyCodePlaceholder}
              aria-label={I18N.carbonAgent.verifyCodePlaceholder}
              onChange={handleVerifyCodeChange}
            />
            <button
              type='button'
              disabled={sendingCode || Boolean(countdown)}
              onClick={handleSendCode}
            >
              {sendCodeText}
            </button>
          </div>

          <button
            className={classNames(style.mobileLoginSubmit, {
              [style.mobileLoginSubmitLoading]: loggingIn,
            })}
            type='submit'
            disabled={loggingIn}
          >
            {loggingIn ? I18N.carbonAgent.loggingIn : I18N.carbonAgent.loginNow}
          </button>
        </div>

        <label
          className={style.mobileLoginAgreement}
          htmlFor={AGREEMENT_CHECKBOX_ID}
        >
          <input
            id={AGREEMENT_CHECKBOX_ID}
            type='checkbox'
            checked={checked}
            onChange={event => setChecked(event.target.checked)}
          />
          <span>
            {I18N.carbonAgent.agreementPrefix}
            <a href='/agreement?service' target='_blank' rel='noreferrer'>
              {I18N.carbonAgent.serviceAgreement}
            </a>
            {I18N.carbonAgent.andText}
            <a href='/agreement' target='_blank' rel='noreferrer'>
              {I18N.carbonAgent.privacyPolicy}
            </a>
          </span>
        </label>
      </form>
    </div>
  );
};

export default MobileLoginSheet;
