import * as ICONS from '@ant-design/icons';
import { Form, FormItem, Submit, Switch } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { SwitchoverCompanyData } from '@src/api/types';
import { LocaleContext } from '@src/components/LocaleProvider';
import { LocaleType, serviceLangMap } from '@src/lang/I18N';
import { SET_COMPANY_USER_INFO } from '@src/store/actionTypes';
import { CompanyUserInfoAction } from '@src/store/module/user';
import { mapChildren, sleep } from '@src/utils';
import { COMPANY_ID } from '@src/utils/consts';
import VerifyUtils from '@src/utils/verifty';
import { GRT_NAV } from '@store/module/nav';
import { Checkbox, Typography } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import axios from 'axios';
import classNames from 'classnames';
import { omit } from 'lodash-es';
import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { useDispatch } from 'react-redux';
import I18N from 'src/lang/I18N';

import { apiQuideList, switchoverCompany } from '@/api/api';
import logo_icon_dark from '@/assets/icon/logo_icon_dark.svg';
import MaterialPassword from '@/components/FormilyMaterial/MaterialPassword';
import { MaterialPhoneNumber } from '@/components/FormilyMaterial/PhoneNumber';
import FormilyMaterialTextField from '@/components/FormilyMaterial/TextField';
import {
  SUPPLY_LOGIN_IDENTIFIER,
  SUPPLY_REGISTER_MOBILE_IDENTIFIER,
} from '@/config';
import store from '@/store';
import { getAgentInviteCode } from '@/utils/ccdbReferral';
import { apiCompanyList } from '@/views/system/account/service';
import {
  getAgentBrowserId,
  trackAgentAuthSubmit,
  type AgentLoginTriggerEntry,
} from '@/views/system/carbonAgent/acquisition';

import { ToggleVerifyTypeWrapper } from './components/ToggleVerifyType';
import agentLoginLogo from './image/agent-login-logo.svg';
import emailSvg from './image/email.svg';
import phoneSvg from './image/phone.svg';
import styles from './index.module.less';
import { setUserInfo } from '../../loginRes';
import {
  apiCheckWechatLogin,
  apiAgentWebLogin,
  apiGetWechatQRCode,
  apiLogin,
  apiLoginStep,
  apiSendEmailSMS,
  apiSendSMS,
  LoginClientType,
  LoginType,
} from '../../service';
import { ModuleType } from '../LoginWrapper/type';
import { PhoneNumber } from '../PhoneNumber';
import { VerifyCode } from '../VerifyCode';

/** 防止 loginStep 因组件 remount（如登录页 ScreenKey 变化）被重复调用，同一 code 只请求一次 */
let loginStepRequestedForCode: string | null = null;

enum ELoginType {
  phone,
  email,
  wechat,
}

const phoneSchema = (
  toggleModuleType: (params: ModuleType) => void,
  lang?: string,
  channelSource?: string,
) => ({
  type: 'object',
  properties: {
    phone: {
      type: 'object',
      title: '',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'MaterialPhoneNumber',
      'x-component-props': {
        prefix: "{{icon('PhoneOutlined')}}",
        autoComplete: 'one-time-code',
        InputProps: {
          inputProps: {
            autoComplete: 'one-time-code',
          },
        },
      },
      'x-validator': {
        triggerType: 'onBlur',
        validator: (value: { phoneNumber: string }) => {
          if (!value.phoneNumber) {
            return I18N.dashborad.pleaseEnterMobilePhoneNumber;
          }
          return '';
        },
      },
    },
    password: {
      type: 'string',
      title: '',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'MaterialPassword',
      'x-component-props': {
        label: I18N.system.loginPassword,
        fullWidth: true,
      },
      'x-reactions': [
        {
          dependencies: ['.useVerifyCode'],
          fulfill: {
            schema: {
              'x-hidden': '{{$deps[0]}}',
            },
          },
        },
      ],
    },
    verifyCode: {
      type: 'string',
      title: '',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'VerifyCode',
      'x-component-props': {
        label: I18N.system.verificationCode,
        placeholder: I18N.system.pleaseEnterVerification,
        sendVerifyCode: async (value: {
          areaCode: string;
          phoneNumber: string;
        }) => {
          await apiSendSMS({
            areaCode: value.areaCode?.match(/\d+/g)?.[0],
            number: value.phoneNumber,
            lang,
          });
        },
      },
      'x-reactions': [
        {
          dependencies: ['.phone#value', '.phone#valid'],
          fulfill: {
            state: {
              'component[1].readyPost': '{{$deps[0] && $deps[1]}}',
              'component[1].phoneNumber': '{{$deps[0]}}',
            },
          },
        },
        {
          dependencies: ['.useVerifyCode'],
          fulfill: {
            schema: {
              'x-hidden': '{{!$deps[0]}}',
            },
          },
        },
      ],
    },
    useVerifyCode: channelSource
      ? {}
      : {
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'ToggleVerifyTypeWrapper',
          'x-component-props': {
            toggle: () => {
              toggleModuleType(ModuleType.resetPassWord);
            },
          },
        },
  },
});

const emailSchema = (
  toggleModuleType: (params: ModuleType) => void,
  lang: string,
) => ({
  type: 'object',
  properties: {
    email: {
      type: 'string',
      title: '',
      required: true,
      'x-decorator': 'FormItem',
      'x-validator': 'email',
      'x-component': 'FormilyMaterialTextField',
      'x-component-props': {
        placeholder: I18N.dashborad.pleaseEnterYourEmailAddress,
        fullWidth: true,
        label: I18N.carbonFootprint.mailbox,
        autoComplete: 'one-time-code',
        type: 'email',
        InputProps: {
          inputProps: {
            autoComplete: 'one-time-code',
          },
        },
      },
    },
    password: {
      type: 'string',
      title: '',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'MaterialPassword',
      'x-component-props': {
        placeholder: I18N.system.pleaseEnterLogin,
        fullWidth: true,
        label: I18N.system.loginPassword,
      },
      'x-reactions': [
        {
          dependencies: ['.useVerifyCode'],
          fulfill: {
            schema: {
              'x-hidden': '{{$deps[0]}}',
            },
          },
        },
      ],
    },
    verifyCode: {
      type: 'string',
      title: '',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'VerifyCode',
      'x-component-props': {
        label: I18N.system.verificationCode,
        placeholder: I18N.system.pleaseEnterVerification,
        sendVerifyCode: async (value: string) => {
          await apiSendEmailSMS({
            number: value,
            lang,
          });
        },
      },
      'x-reactions': [
        {
          dependencies: ['.email#value', '.email#valid'],
          fulfill: {
            state: {
              'component[1].readyPost': true,
              'component[1].phoneNumber': '{{$deps[0]}}',
            },
          },
        },
        {
          dependencies: ['.useVerifyCode'],
          fulfill: {
            schema: {
              'x-hidden': '{{!$deps[0]}}',
            },
          },
        },
      ],
    },
    useVerifyCode: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'ToggleVerifyTypeWrapper',
      'x-component-props': {
        toggle: () => {
          toggleModuleType(ModuleType.resetPassWord);
        },
      },
    },
  },
});

const SchemaField = createSchemaField({
  components: {
    FormItem,
    MaterialPassword,
    VerifyCode,
    Switch,
    ToggleVerifyTypeWrapper,
    PhoneNumber,
    FormilyMaterialTextField,
    MaterialPhoneNumber,
  },
  scope: {
    icon(name) {
      return React.createElement(ICONS[name]);
    },
  },
});

export enum CompanyType {
  company = '1',
  person = '2',
  agent = '3',
}

export enum ProductSource {
  product = '1',
  enterprise = '2',
}

interface LoginProps {
  toggleModuleType: (type: ModuleType) => void;
  companyType: CompanyType;
  logoSrc?: string;
  title?: React.ReactNode;
  productSource?: ProductSource;
  showWechatLogin?: boolean;
  skipCompanyBootstrap?: boolean;
  agentLoginTriggerEntry?: AgentLoginTriggerEntry;
  hideLogo?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  isLoginPage?: boolean;
}

export const Login: FC<LoginProps> = props => {
  const {
    toggleModuleType,
    companyType,
    logoSrc = logo_icon_dark,
    title,
    productSource,
    showWechatLogin,
    skipCompanyBootstrap = false,
    agentLoginTriggerEntry,
    hideLogo = false,
    onSuccess,
    isLoginPage = false,
  } = props;
  // onCancel 由 GlobalLoginModal 的 closeLoginModal 处理，不需要在这里使用
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onCancel } = props;
  const { locale } = useContext(LocaleContext);
  const dispatch = useDispatch();
  const [checked, setChecked] = useState(false);
  const isAgentLoginModal = !isLoginPage && companyType === CompanyType.agent;
  const isEnglishAgentLoginModal =
    isAgentLoginModal && locale === LocaleType.enUS;

  const useAgentWebLogin = isAgentLoginModal;
  const [loginType, setLoginType] = useState(
    showWechatLogin && !isLoginPage && !isAgentLoginModal
      ? ELoginType.wechat
      : ELoginType.phone,
  );
  const [qrCode, setQrCode] = useState<string>('');
  const [loadingQRCode, setLoadingQRCode] = useState(false);
  const [qrCodeNeedRefresh, setQrCodeNeedRefresh] = useState(false);
  const [qrRefreshToken, setQrRefreshToken] = useState(0);
  const qrCodeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const checkLoginTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sceneRef = useRef<string | null>(null);
  const qrAuthSubmitTrackedRef = useRef(false);
  const checkWechatLoginStatusRef = useRef<(() => Promise<void>) | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const lang = serviceLangMap[locale];

  const supplyTicket = new URLSearchParams(location.search).get(
    SUPPLY_LOGIN_IDENTIFIER,
  );

  const registerPhone = new URLSearchParams(location.search).get(
    SUPPLY_REGISTER_MOBILE_IDENTIFIER,
  );

  /** URL 的 code 参数（链接带的参数），登录/获取二维码时若存在则传给后端 */
  const urlCode = new URLSearchParams(location.search).get('code');
  const agentChannel =
    new URLSearchParams(location.search).get('agentChannel') ?? undefined;
  const agentInviteCode = getAgentInviteCode(location.search);
  const channelSource =
    new URLSearchParams(location.search).get('channel') ?? undefined;
  /** channel 有值且不为 6 时隐藏邮箱登录；无 channel 或 channel=6 时展示 */
  const showEmailLogin = !channelSource || channelSource === 'ciecc';
  const showAgentRewardTitle =
    showWechatLogin &&
    companyType === CompanyType.agent &&
    channelSource !== '1';
  const shouldShowWechatQRCode =
    showWechatLogin &&
    (isLoginPage || isAgentLoginModal || loginType === ELoginType.wechat);

  // isLoginPage 且 URL 带 code 时，用 code 调 loginStep 完成登录，成功后走 setUserInfo 流程
  // 防重：登录页 useEffect 会令 ScreenKey+1 导致 LoginWrapper remount，同一 code 只请求一次
  useEffect(() => {
    if (!isLoginPage) return;
    const code = new URLSearchParams(location.search).get('code');
    if (!code) return;
    if (loginStepRequestedForCode === code) return;
    loginStepRequestedForCode = code;

    apiLoginStep({
      channelSource: channelSource ?? '1',
      thirdCode: code,
      agentInviteCode,
    })
      .then(res => {
        if (res.data.code === 200 && res.data.data) {
          setUserInfo(res.data.data);
        } else {
          // const msg = (res.data as { msg?: string })?.msg ?? '登录失败';
          // VerifyUtils.Toast(400, msg);
        }
      })
      .catch(() => {
        // if (!cancelled) {
        //   VerifyUtils.Toast(400, '登录失败');
        // }
      })
      .finally(() => {
        loginStepRequestedForCode = null;
      });
    return () => {};
  }, [isLoginPage, channelSource, agentInviteCode]);

  const emailForm = useMemo(
    () =>
      createForm({
        validateFirst: true,
      }),
    [locale, loginType],
  );

  const phoneForm = useMemo(
    () =>
      createForm({
        validateFirst: true,
        initialValues: {
          useVerifyCode: !!channelSource,
        },
      }),
    [channelSource, locale, loginType],
  );

  /**
   * 处理登录成功后的通用逻辑
   * @param token 登录返回的 token 数据
   */
  const handleLoginSuccess = useCallback(
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

        if (!onSuccess) {
          window.location.reload();
        }

        return;
      }

      const data = await apiCompanyList({
        userId,
        page: '1',
        size: '10000',
      });

      const companyId =
        String(data?.data?.rows?.[0]?.companyId) ||
        token.userInfo?.companyVoList?.[0]?.companyId ||
        token.companyId;

      if (companyId) {
        // 存储companyId
        localStorage.setItem(COMPANY_ID, `${companyId}`);

        // 切换企业 获取首页的权限点
        await switchoverCompany({
          companyId: `${companyId}`,
          userId: userId || '',
        }).then(async switchRes => {
          const userData = switchRes?.data?.data;
          if (switchRes.data.code === 200 && userData) {
            dispatch<CompanyUserInfoAction>({
              type: SET_COMPANY_USER_INFO,
              payload: userData,
            });

            setTimeout(() => {
              // 切换企业 获取 所有的导航 (使用新token)
              apiQuideList().then(({ data }) => {
                if (data.code === 200) {
                  const newArr = data.data.map(item => ({
                    id: item.id,
                    name: item.guideName,
                    isFloat: `${item.isFloat}`,
                    web_path: '',
                    children: mapChildren(item?.categoryList || []),
                    checkid: item.id,
                  }));
                  dispatch({
                    type: GRT_NAV,
                    payload: newArr,
                  });
                }
              });
            });

            // 保证dispatch完成后再调整页面，防止出现异常退出（workIndex 会检测 SET_COMPANY_USER_INFO 数据，如果没有会退出）
            await sleep(300);

            // 调用 onSuccess 回调，由调用方处理 accountId 绑定逻辑
            onSuccess?.();

            // 如果没有 onSuccess 回调，执行默认的刷新逻辑
            if (!onSuccess) {
              window.location.reload();
            }
          }
        });
      } else {
        // 如果没有 companyId，使用原有的登录逻辑
        await setUserInfo(token);
        onSuccess?.();
      }
    },
    [onSuccess, dispatch, skipCompanyBootstrap],
  );

  const phoneSubmit = async value => {
    if (!checked) {
      VerifyUtils.Toast(400, I18N.system.pleaseReadAndAgreeWith);
      return;
    }
    const { phone, password, useVerifyCode, verifyCode } = value;
    const authMethod = useVerifyCode ? 'phone_otp' : 'password';
    if (agentLoginTriggerEntry) {
      trackAgentAuthSubmit(authMethod, agentLoginTriggerEntry);
    }
    const browserId = getAgentBrowserId();
    const res = await (useAgentWebLogin ? apiAgentWebLogin : apiLogin)({
      agentChannel,
      agentInviteCode,
      username: phone.phoneNumber,
      password: useVerifyCode ? null : password,
      identify: useVerifyCode ? verifyCode : null,
      areaCode: phone.areaCode?.match(/\d+/g)?.[0],
      lang,
      loginType: LoginType.phone,
      supplyTicket: supplyTicket || undefined,
      channelSource: channelSource || undefined,
      thirdCode: urlCode || undefined,
      companyType,
      productSource,
      browserId,
      clientType: useAgentWebLogin
        ? LoginClientType.agentWeb
        : LoginClientType.carbonWeb,
    });
    if (res.data.code === 200 && res.data.data) {
      if (isLoginPage) {
        setUserInfo(res.data.data);
      } else {
        await sleep(1000);
        await handleLoginSuccess(res.data.data);
      }
    }
  };

  const emailSubmit = async value => {
    if (!checked) {
      VerifyUtils.Toast(400, I18N.system.pleaseReadAndAgreeWith);
      return;
    }

    const { email, password, useVerifyCode, verifyCode } = value;
    const authMethod = useVerifyCode ? 'email_otp' : 'password';
    if (agentLoginTriggerEntry) {
      trackAgentAuthSubmit(authMethod, agentLoginTriggerEntry);
    }
    const browserId = getAgentBrowserId();
    const res = await (useAgentWebLogin ? apiAgentWebLogin : apiLogin)({
      agentChannel,
      agentInviteCode,
      username: email,
      password: useVerifyCode ? null : password,
      identify: useVerifyCode ? verifyCode : null,
      lang,
      loginType: LoginType.email,
      supplyTicket: supplyTicket || undefined,
      channelSource: channelSource || undefined,
      thirdCode: urlCode || undefined,
      companyType,
      productSource,
      browserId,
      clientType: useAgentWebLogin
        ? LoginClientType.agentWeb
        : LoginClientType.carbonWeb,
    });
    if (res.data.code === 200 && res.data.data) {
      if (isLoginPage) {
        setUserInfo(res.data.data);
      } else {
        await sleep(1000);
        await handleLoginSuccess(res.data.data);
      }
    }
  };

  const items = [
    ...(showWechatLogin && !isLoginPage && !isAgentLoginModal
      ? [
          {
            key: ELoginType.wechat,
            icon: phoneSvg,
            label: I18N.system.weChatLogin,
          },
        ]
      : []),
    {
      key: ELoginType.phone,
      icon: phoneSvg,
      label: I18N.system.loginWithPhoneNumber,
    },
    ...(showEmailLogin
      ? [
          {
            key: ELoginType.email,
            icon: emailSvg,
            label: I18N.system.emailLogin,
          },
        ]
      : []),
  ];

  // 检查微信登录状态
  const checkWechatLoginStatus = useCallback(async () => {
    const scene = sceneRef.current;
    if (!scene) return;

    try {
      const res = await apiCheckWechatLogin({ scene });
      if (res.data.code === 200 && res.data.data) {
        const { loginStatus, token, loginCode } = res.data.data as {
          loginStatus: string;
          token: SwitchoverCompanyData;
          loginCode?: number;
        };
        if (loginCode === 20713) {
          if (checkLoginTimerRef.current) {
            clearInterval(checkLoginTimerRef.current);
            checkLoginTimerRef.current = null;
          }
          sceneRef.current = null;
          setQrCodeNeedRefresh(true);
          return;
        }
        if (loginStatus === '1' && token) {
          // 停止轮询
          if (checkLoginTimerRef.current) {
            clearInterval(checkLoginTimerRef.current);
            checkLoginTimerRef.current = null;
          }
          if (agentLoginTriggerEntry && !qrAuthSubmitTrackedRef.current) {
            qrAuthSubmitTrackedRef.current = true;
            trackAgentAuthSubmit('wechat_qr', agentLoginTriggerEntry);
          }
          // 执行登录成功逻辑
          await handleLoginSuccess(token);
        }
      }
    } catch (error) {
      // 检查登录状态失败，继续轮询
    }
  }, [agentLoginTriggerEntry, handleLoginSuccess]);

  // 更新 ref 以存储最新的 checkWechatLoginStatus 函数
  useEffect(() => {
    checkWechatLoginStatusRef.current = checkWechatLoginStatus;
  }, [checkWechatLoginStatus]);
  // const { openSubscriptionModal } = useSubscriptionServiceModal();

  // 二维码与登录方式切换解耦：切换到手机号/邮箱登录时保留已加载的二维码，切回微信登录无需重新请求。
  useEffect(() => {
    if (!showWechatLogin) {
      return undefined;
    }

    // 立即清理之前的定时器，避免重复创建
    if (checkLoginTimerRef.current) {
      clearInterval(checkLoginTimerRef.current);
      checkLoginTimerRef.current = null;
    }
    if (qrCodeTimerRef.current) {
      clearInterval(qrCodeTimerRef.current);
      qrCodeTimerRef.current = null;
    }

    setQrCodeNeedRefresh(false);
    setQrCode('');
    qrAuthSubmitTrackedRef.current = false;
    setLoadingQRCode(true);

    let isCancelled = false;
    // 创建 AbortController 用于取消请求
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const fetchWechatQRCode = async () => {
      try {
        setLoadingQRCode(true);
        const browserId = getAgentBrowserId();
        if (isCancelled) return;
        const res = await apiGetWechatQRCode(
          {
            ...(useAgentWebLogin
              ? {
                  agentChannel,
                }
              : {}),
            agentInviteCode,
            lang,
            env_version: 'develop',
            productSource,
            companyType,
            browserId,
            clientType: useAgentWebLogin
              ? LoginClientType.agentWeb
              : LoginClientType.carbonWeb,
            thirdCode: urlCode || undefined,
            channelSource: channelSource || undefined,
          },
          abortController.signal,
        );

        // 如果组件已卸载或条件已改变，取消操作
        if (isCancelled) return;

        if (res.data.code === 200 && res.data.data) {
          const { qrCode: code, scene } = res.data.data;
          setQrCode(code);

          // 开始轮询检查登录状态
          if (scene && !isCancelled) {
            // 再次确认没有其他定时器在运行
            if (checkLoginTimerRef.current) {
              clearInterval(checkLoginTimerRef.current);
              checkLoginTimerRef.current = null;
            }

            // 存储 scene 到 ref
            sceneRef.current = scene;

            // 立即检查一次
            if (checkWechatLoginStatusRef.current) {
              checkWechatLoginStatusRef.current();
            }

            // 每2秒轮询一次
            checkLoginTimerRef.current = setInterval(() => {
              if (checkWechatLoginStatusRef.current) {
                checkWechatLoginStatusRef.current();
              }
            }, 2000);
          }
        }
      } catch (error) {
        // 获取微信登录二维码失败
        // 如果是取消请求，不需要处理错误
        if (axios.isCancel && axios.isCancel(error)) {
          return;
        }
      } finally {
        if (!isCancelled) {
          setLoadingQRCode(false);
        }
      }
    };

    fetchWechatQRCode();

    return () => {
      isCancelled = true;
      sceneRef.current = null;
      // 取消正在进行的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (qrCodeTimerRef.current) {
        clearInterval(qrCodeTimerRef.current);
        qrCodeTimerRef.current = null;
      }
      if (checkLoginTimerRef.current) {
        clearInterval(checkLoginTimerRef.current);
        checkLoginTimerRef.current = null;
      }
    };
  }, [
    showWechatLogin,
    agentChannel,
    agentInviteCode,
    isLoginPage,
    lang,
    companyType,
    productSource,
    urlCode,
    channelSource,
    qrRefreshToken,
    useAgentWebLogin,
  ]);

  useEffect(() => {
    if (registerPhone) {
      phoneForm.setValues({
        phone: {
          phoneNumber: registerPhone,
        },
      });
    }
  }, [registerPhone, phoneForm]);

  const wechatQRCode = useMemo(
    () => (
      <div className={styles.wechatQRCode}>
        {(() => {
          if (loadingQRCode) {
            return (
              <div className={styles.qrCodeLoading}>
                {I18N.components.loading}
              </div>
            );
          }
          if (qrCode) {
            return (
              <div className={styles.qrCodeWrapper}>
                <div className={styles.qrCodeFrame}>
                  <img
                    src={qrCode}
                    alt={I18N.system.weChatLogin2}
                    className={styles.qrCodeImage}
                  />
                </div>
                <div className={styles.qrCodeTip}>
                  {I18N.system.scanWithWeChat}
                </div>
                {qrCodeNeedRefresh && (
                  <div
                    className={styles.qrCodeMask}
                    onClick={() => {
                      setQrRefreshToken(prev => prev + 1);
                    }}
                  >
                    <ICONS.ReloadOutlined className={styles.refreshIcon} />
                    <span>{I18N.system.qrCodeLost}</span>
                  </div>
                )}
              </div>
            );
          }
          return (
            <div className={styles.qrCodeError}>
              {I18N.system.qrCodeLoading}
            </div>
          );
        })()}
      </div>
    ),
    [loadingQRCode, qrCode, qrCodeNeedRefresh, locale],
  );

  const loginForm = (
    <>
      {!showWechatLogin && (
        <div className={styles.title}>{I18N.system.welcomeToCarbon}</div>
      )}
      {showWechatLogin && (
        <div
          className={classNames(styles.title, {
            [styles.agentRewardTitle]: showAgentRewardTitle,
          })}
        >
          {showAgentRewardTitle ? (
            <>
              <div className={styles.agentRewardTitleLine}>
                <span className={styles.agentRewardPrefix}>
                  {I18N.carbonAgent.loginRewardPrefix}
                </span>
                <span className={styles.agentRewardPoints}>
                  {I18N.carbonAgent.loginRewardPoints}
                </span>
              </div>
              <div className={styles.agentRewardSubtitle}>
                {I18N.carbonAgent.loginRewardSubtitle}
              </div>
            </>
          ) : (
            <>
              {!hideLogo && <img src={logoSrc} alt='logo' />}
              {channelSource === '1'
                ? '登录绑定'
                : title || I18N.system.logInToCarbonCloud}
            </>
          )}
        </div>
      )}

      <div className={styles.tabWrapper}>
        {items.map(item => (
          <button
            key={item.key}
            type='button'
            aria-pressed={loginType === item.key}
            onClick={() => {
              setLoginType(item.key);
            }}
            className={classNames(styles.normal, {
              [styles.checked]: loginType === item.key,
            })}
          >
            {!showWechatLogin && (
              <img className={styles.icon} src={item.icon} alt='' />
            )}
            {item.label}
          </button>
        ))}
      </div>
      {loginType === ELoginType.phone && (
        <Form
          key={`${locale}-${loginType}-phone`}
          form={phoneForm}
          layout='vertical'
          size='large'
          onAutoSubmit={async value => {
            await phoneSubmit(value);
            toggleModuleType(ModuleType.login);
          }}
        >
          <SchemaField
            schema={phoneSchema(
              toggleModuleType,
              lang,
              channelSource || undefined,
            )}
          />
          <Submit block style={{ height: 48 }}>
            {I18N.system.login}
          </Submit>
        </Form>
      )}
      {loginType === ELoginType.email && (
        <Form
          key={`${locale}-${loginType}-email`}
          form={emailForm}
          layout='vertical'
          size='large'
          onAutoSubmit={async value => {
            await emailSubmit(value);
            toggleModuleType(ModuleType.login);
          }}
        >
          <SchemaField schema={emailSchema(toggleModuleType, lang)} />
          <Submit block style={{ height: 48 }}>
            {I18N.system.login}
          </Submit>
        </Form>
      )}
      {loginType !== ELoginType.wechat && (
        <Checkbox
          className={styles.checkbox}
          checked={checked}
          onChange={(e: CheckboxChangeEvent) => {
            setChecked(e.target.checked);
          }}
        >
          <span className={styles.read}>{I18N.carbonNeutral.iHaveReadAnd}</span>
          <Typography.Link
            href='/agreement?service'
            target='_blank'
            className={styles.link}
          >
            {I18N.system.serviceAgreement2}
          </Typography.Link>
          {locale === LocaleType.enUS ? ', ' : '和'}
          <Typography.Link
            href='/agreement'
            target='_blank'
            className={styles.link}
          >
            {I18N.system.privacyPolicy}
          </Typography.Link>
        </Checkbox>
      )}
    </>
  );

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.agentLoginModal]: isAgentLoginModal,
        [styles.agentLoginModalEnglish]: isEnglishAgentLoginModal,
        [styles.loginPage]: isLoginPage,
      })}
    >
      {isAgentLoginModal && (
        <div className={styles.agentWechatPanel}>
          <img
            src={agentLoginLogo}
            alt='Carbon Agent'
            className={styles.agentLoginLogo}
          />
          {wechatQRCode}
        </div>
      )}
      {isLoginPage && shouldShowWechatQRCode && (
        <div className={styles.wechatPanel}>
          <div className={styles.wechatSlogan}>
            <div className={styles.wechatTitle}>
              {I18N.system.makeEveryProduct}
            </div>
            {locale === LocaleType.zhCN && (
              <p>TO MAKE CARBON FOOTPRINT VISIBLE ON EVERY PRODUCT</p>
            )}
          </div>
          {wechatQRCode}
        </div>
      )}
      <div
        className={classNames({
          [styles.agentFormPanel]: isAgentLoginModal,
          [styles.formPanel]: isLoginPage,
        })}
      >
        {loginForm}
        {!isLoginPage &&
          !isAgentLoginModal &&
          shouldShowWechatQRCode &&
          wechatQRCode}
      </div>
    </div>
  );
};
