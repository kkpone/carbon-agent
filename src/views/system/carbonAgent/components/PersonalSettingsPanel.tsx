import { LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import type { RootState } from '@src/store';
import { SET_COMPANY_USER_INFO } from '@src/store/actionTypes';
import type { CompanyUserInfoAction } from '@src/store/module/user';
import { getUserInfo } from '@src/utils';
import { Button, Cascader, Input, message as antdMessage } from 'antd';
import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useCityInfo } from '@/hooks/useCityInfo';
import AccountNumber from '@/views/system/account/component/AccountNumber';
import { BindModal } from '@/views/system/account/component/BindModal';
import { CheckModal } from '@/views/system/account/component/CheckModal';
import {
  BindType,
  editUserDetail,
  getUserInfoByUserName,
  type Info,
} from '@/views/system/account/service';
import { apiListALLByDictTypeData } from '@/views/emission/Show/service';
import type { Dicts } from '@/views/emission/Show/type';

import { icons } from '../constants';
import style from '../index.module.less';
import I18N from '@src/lang/I18N';
import {
  editAgentCompanyInfo,
  fetchAgentCompanyInfo,
  type AgentCompanyInfo,
} from '../service';

type PersonalSettingsPanelProps = {
  active: boolean;
  showTitle?: boolean;
};

type BindModalHandle = {
  showBindModal: () => void;
};

type CheckModalHandle = {
  showCheckModal: (bindType: BindType) => void;
};

type PersonalCompanyDraft = {
  area: string[];
  industry: string[];
};

type PersonalSettingsCompanyField = keyof PersonalCompanyDraft;

type PersonalSettingsCascaderOption = {
  children?: PersonalSettingsCascaderOption[];
  label: string;
  value: string;
};

const fetchPersonalInfo = (userName: string) =>
  getUserInfoByUserName({ userName });

const PERSONAL_SETTINGS_MODAL_ROOT_CLASS =
  'carbon-agent-personal-settings-modal-root';
const PERSONAL_SETTINGS_MODAL_WRAP_CLASS =
  'carbon-agent-personal-settings-modal-wrap';
const PERSONAL_SETTINGS_CASCADER_POPUP_CLASS =
  'carbon-agent-personal-settings-cascader-popup';
const PERSONAL_SETTINGS_MODAL_Z_INDEX = 3000;
const getPersonalSettingsModalContainer = () => document.body;

const getTextValue = (value: unknown, fallback = '--') => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return fallback;
};

const getCascaderStringValue = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (value && typeof value === 'object') {
    const valueRecord = value as Record<string, unknown>;
    const matchedValue =
      valueRecord.value ??
      valueRecord.code ??
      valueRecord.dictValue ??
      valueRecord.id;

    return getCascaderStringValue(matchedValue);
  }

  return '';
};

const parseAreaValue = (area: unknown): string[] => {
  if (Array.isArray(area)) {
    return area.map(getCascaderStringValue).filter(Boolean);
  }

  if (typeof area !== 'string' || !area.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(area);

    if (Array.isArray(parsed)) {
      return parsed.map(getCascaderStringValue).filter(Boolean);
    }
  } catch {
    return [area.trim()];
  }

  return [];
};

const parseIndustryValue = (industry: unknown): string[] => {
  if (Array.isArray(industry)) {
    return industry.map(getCascaderStringValue).filter(Boolean);
  }

  if (typeof industry !== 'string' || !industry.trim()) {
    return [];
  }

  return industry
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

const getCompanyDraft = (
  company?: Partial<AgentCompanyInfo> | null,
): PersonalCompanyDraft => ({
  area: parseAreaValue(company?.area),
  industry: parseIndustryValue(company?.industry),
});

const normalizeCascaderValue = (value: unknown) =>
  Array.isArray(value) ? value.map(getCascaderStringValue).filter(Boolean) : [];

const transformBusinessData = (
  data: Dicts[] = [],
): PersonalSettingsCascaderOption[] =>
  data.map(item => ({
    children: item.enumList ? transformBusinessData(item.enumList) : undefined,
    label: item.dictLabel,
    value: item.dictValue,
  }));

const getInitialInfo = (): Info | undefined => {
  const userInfo = getUserInfo()?.userInfo;

  if (!userInfo?.username) {
    return undefined;
  }

  return {
    email: getTextValue(userInfo.email, ''),
    mobile: getTextValue(userInfo.mobile, ''),
    nickName:
      getTextValue(userInfo.user?.nickName, '') ||
      getTextValue(userInfo.nickName, ''),
    password: getTextValue(userInfo.password, ''),
    userName: userInfo.username,
  };
};

const PersonalSettingsPanel = ({
  active,
  showTitle = true,
}: PersonalSettingsPanelProps) => {
  const dispatch = useDispatch();
  const userState = useSelector<RootState, RootState['companyUserInfo']>(
    state => state.companyUserInfo,
  );
  const userInfo = userState.userInfo || getUserInfo()?.userInfo;
  const userName = userInfo?.username || '';
  const currentCompany = useMemo(
    () =>
      userInfo?.companyVoList?.find(
        company => String(company.companyId) === String(userInfo.companyId),
      ) || userInfo?.companyVoList?.[0],
    [userInfo?.companyId, userInfo?.companyVoList],
  );
  const fallbackCompanyInfo = useMemo<Partial<AgentCompanyInfo>>(
    () => ({
      area: currentCompany?.area,
      companyId: currentCompany?.companyId,
      companyName: currentCompany?.companyName,
      companyNum: currentCompany?.companyNum,
      industry: currentCompany?.industry,
    }),
    [
      currentCompany?.area,
      currentCompany?.companyId,
      currentCompany?.companyName,
      currentCompany?.companyNum,
      currentCompany?.industry,
    ],
  );
  const cityOptions = useCityInfo();
  const [info, setInfo] = useState<Info | undefined>(() => getInitialInfo());
  const [nameInput, setNameInput] = useState(getInitialInfo()?.nickName || '');
  const [companyInfo, setCompanyInfo] = useState<
    Partial<AgentCompanyInfo> | undefined
  >(() => fallbackCompanyInfo);
  const [companyDraft, setCompanyDraft] = useState<PersonalCompanyDraft>(() =>
    getCompanyDraft(fallbackCompanyInfo),
  );
  const [industryOptions, setIndustryOptions] = useState<
    PersonalSettingsCascaderOption[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingCompanyField, setSavingCompanyField] =
    useState<PersonalSettingsCompanyField | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bindPhoneModalRef = useRef<BindModalHandle>(null);
  const bindEmailModalRef = useRef<BindModalHandle>(null);
  const checkModalRef = useRef<CheckModalHandle>(null);

  const updateCompanyInfoInStore = (
    nextCompanyInfo: Partial<AgentCompanyInfo>,
  ) => {
    if (!userState.userInfo) {
      return;
    }

    const nextCompanyId =
      nextCompanyInfo.companyId ?? userState.userInfo.companyId;
    const nextCompanyVoList = (userState.userInfo.companyVoList || []).map(
      company =>
        String(company.companyId) === String(nextCompanyId)
          ? ({
              ...company,
              ...nextCompanyInfo,
            } as typeof company)
          : company,
    );

    dispatch<CompanyUserInfoAction>({
      type: SET_COMPANY_USER_INFO,
      payload: {
        ...userState,
        userInfo: {
          ...userState.userInfo,
          companyVoList: nextCompanyVoList,
        },
      },
    });
  };

  useEffect(() => {
    if (!active || !userName) {
      return undefined;
    }

    let cancelled = false;

    setLoading(true);
    fetchPersonalInfo(userName)
      .then(response => {
        if (cancelled) {
          return;
        }

        const nextInfo = response.data.data;
        setInfo(nextInfo);
        setNameInput(nextInfo.nickName || '');
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = getInitialInfo();
          setInfo(fallback);
          setNameInput(fallback?.nickName || '');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [active, refreshKey, userName]);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    let cancelled = false;

    apiListALLByDictTypeData({
      dictType: 'business',
    })
      .then(response => {
        if (!cancelled) {
          setIndustryOptions(transformBusinessData(response.data.data || []));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIndustryOptions([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [active]);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    let cancelled = false;

    setCompanyLoading(true);
    fetchAgentCompanyInfo()
      .then(response => {
        if (cancelled) {
          return;
        }

        const nextCompanyInfo = response.data.data || fallbackCompanyInfo;
        setCompanyInfo(nextCompanyInfo);
        setCompanyDraft(getCompanyDraft(nextCompanyInfo));
        updateCompanyInfoInStore(nextCompanyInfo);
      })
      .catch(() => {
        if (!cancelled) {
          setCompanyInfo(fallbackCompanyInfo);
          setCompanyDraft(getCompanyDraft(fallbackCompanyInfo));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCompanyLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, fallbackCompanyInfo]);

  const showBindModal = (bindType: BindType) => {
    if (bindType === BindType.phone) {
      bindPhoneModalRef.current?.showBindModal();
      return;
    }

    bindEmailModalRef.current?.showBindModal();
  };

  const refreshInfo = () => setRefreshKey(key => key + 1);

  const handleNameSave = async () => {
    const nextName = nameInput.trim();
    const currentName = (info?.nickName || '').trim();

    if (!nextName || nextName === currentName || savingName) {
      setNameInput(currentName || nextName);
      return;
    }

    if (nextName.length < 2 || nextName.length > 100) {
      antdMessage.warning(I18N.carbonAgent.nicknameLengthLimit);
      setNameInput(currentName);
      return;
    }

    setSavingName(true);
    try {
      await editUserDetail({ nickName: nextName });
      setInfo(prevInfo =>
        prevInfo ? { ...prevInfo, nickName: nextName } : prevInfo,
      );
      if (userState.userInfo?.user) {
        dispatch<CompanyUserInfoAction>({
          type: SET_COMPANY_USER_INFO,
          payload: {
            ...userState,
            userInfo: {
              ...userState.userInfo,
              nickName: nextName,
              user: {
                ...userState.userInfo.user,
                nickName: nextName,
              },
            },
          },
        });
      } else {
        dispatch<CompanyUserInfoAction>({
          type: SET_COMPANY_USER_INFO,
          payload: {
            ...userState,
            userInfo: {
              ...userState.userInfo,
              nickName: nextName,
            },
          },
        });
      }
      antdMessage.success(I18N.carbonAgent.userNameUpdated);
    } catch {
      antdMessage.error(I18N.carbonAgent.userNameSaveFailed);
      setNameInput(currentName);
    } finally {
      setSavingName(false);
    }
  };

  const handleCompanyDraftChange = async (
    field: PersonalSettingsCompanyField,
    value: string[],
  ) => {
    const nextDraft = {
      ...companyDraft,
      [field]: value,
    };

    setCompanyDraft(nextDraft);

    const currentDraft = getCompanyDraft(companyInfo || fallbackCompanyInfo);

    if (
      currentDraft.area.join(',') === nextDraft.area.join(',') &&
      currentDraft.industry.join(',') === nextDraft.industry.join(',')
    ) {
      return;
    }

    setSavingCompanyField(field);
    try {
      const nextCompanyInfo: Partial<AgentCompanyInfo> = {
        ...fallbackCompanyInfo,
        ...companyInfo,
        area: JSON.stringify(nextDraft.area),
        industry: nextDraft.industry.join(','),
      };

      await editAgentCompanyInfo({
        area: nextCompanyInfo.area || '[]',
        industry: nextCompanyInfo.industry || '',
      });
      setCompanyInfo(nextCompanyInfo);
      updateCompanyInfoInStore(nextCompanyInfo);
      antdMessage.success(I18N.carbonAgent.companyInfoUpdated);
    } catch {
      const rollbackDraft = getCompanyDraft(companyInfo || fallbackCompanyInfo);

      setCompanyDraft(rollbackDraft);
      antdMessage.error(I18N.carbonAgent.companyInfoSaveFailed);
    } finally {
      setSavingCompanyField(null);
    }
  };

  const displayName =
    info?.nickName ||
    userInfo?.user?.nickName ||
    userInfo?.nickName ||
    userInfo?.username ||
    I18N.carbonAgent.defaultUserName;
  const displayAccount =
    info?.mobile || info?.email || userInfo?.mobile || '--';
  const companyFieldsDisabled =
    companyLoading || Boolean(savingCompanyField) || loading;

  return (
    <section
      className={style.personalSettingsPanel}
      aria-labelledby='carbon-agent-personal-settings-title'
    >
      {showTitle ? (
        <h2
          className={style.personalSettingsTitle}
          id='carbon-agent-personal-settings-title'
        >
          {I18N.carbonAgent.profileSettings}
        </h2>
      ) : null}

      <div className={style.personalSettingsBody}>
        <div className={style.personalSettingsProfile}>
          <div className={style.personalSettingsProfileMain}>
            <img
              className={style.personalSettingsAvatar}
              src={icons.avatarIcon}
              alt=''
            />
            <div className={style.personalSettingsProfileText}>
              <strong>{displayName}</strong>
              <span>{displayAccount}</span>
            </div>
          </div>
        </div>

        <div className={style.personalSettingsFields}>
          <div className={style.personalSettingsField}>
            <span>{I18N.carbonAgent.userNameLabel}</span>
            <Input
              aria-label={I18N.carbonAgent.userNameLabel}
              id='carbon-agent-personal-settings-name'
              value={nameInput}
              disabled={loading || savingName}
              onBlur={() => {
                handleNameSave().catch(() => undefined);
              }}
              onChange={event => setNameInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.currentTarget.blur();
                }
              }}
            />
          </div>
          <div className={style.personalSettingsField}>
            <span>{I18N.carbonAgent.countryRegion}</span>
            <Cascader
              aria-label={I18N.carbonAgent.countryRegion}
              allowClear={false}
              className={style.personalSettingsCascader}
              disabled={companyFieldsDisabled}
              getPopupContainer={getPersonalSettingsModalContainer}
              options={cityOptions}
              placeholder={I18N.carbonAgent.selectCountryRegion}
              popupClassName={PERSONAL_SETTINGS_CASCADER_POPUP_CLASS}
              showSearch
              value={companyDraft.area}
              onChange={value => {
                handleCompanyDraftChange(
                  'area',
                  normalizeCascaderValue(value),
                ).catch(() => undefined);
              }}
            />
          </div>
          <div className={style.personalSettingsField}>
            <span>{I18N.carbonAgent.industry}</span>
            <Cascader
              aria-label={I18N.carbonAgent.industry}
              allowClear={false}
              className={style.personalSettingsCascader}
              disabled={companyFieldsDisabled}
              getPopupContainer={getPersonalSettingsModalContainer}
              options={industryOptions}
              placeholder={I18N.carbonAgent.selectIndustry}
              popupClassName={PERSONAL_SETTINGS_CASCADER_POPUP_CLASS}
              showSearch
              value={companyDraft.industry}
              onChange={value => {
                handleCompanyDraftChange(
                  'industry',
                  normalizeCascaderValue(value),
                ).catch(() => undefined);
              }}
            />
          </div>
        </div>

        <section className={style.personalSettingsLogin}>
          <h3>{I18N.carbonAgent.loginMethod}</h3>
          <div className={style.personalSettingsLoginList}>
            <div className={style.personalSettingsLoginItem}>
              <span className={style.personalSettingsLoginIcon}>
                <PhoneOutlined />
              </span>
              <div className={style.personalSettingsLoginText}>
                <strong>{I18N.carbonAgent.phoneNumber}</strong>
                <span>
                  {info?.mobile || I18N.carbonAgent.afterBinding}
                  {I18N.carbonAgent.canLoginViaPhone}
                </span>
              </div>
              <Button
                className={classNames(style.personalSettingsActionButton, {
                  [style.personalSettingsPrimaryAction]: !info?.mobile,
                })}
                onClick={() =>
                  info?.mobile
                    ? checkModalRef.current?.showCheckModal(BindType.phone)
                    : showBindModal(BindType.phone)
                }
              >
                {info?.mobile
                  ? I18N.carbonAgent.changePhone
                  : I18N.carbonAgent.bindPhone}
              </Button>
            </div>

            <div className={style.personalSettingsLoginItem}>
              <span className={style.personalSettingsLoginIcon}>
                <MailOutlined />
              </span>
              <div className={style.personalSettingsLoginText}>
                <strong>{I18N.carbonAgent.email}</strong>
                <span>
                  {info?.email || I18N.carbonAgent.afterBinding}
                  {I18N.carbonAgent.canLoginViaEmail}
                </span>
              </div>
              <Button
                className={classNames(style.personalSettingsActionButton, {
                  [style.personalSettingsPrimaryAction]: !info?.email,
                })}
                onClick={() =>
                  info?.email
                    ? checkModalRef.current?.showCheckModal(BindType.email)
                    : showBindModal(BindType.email)
                }
              >
                {info?.email
                  ? I18N.carbonAgent.changeEmail
                  : I18N.carbonAgent.bindEmail}
              </Button>
            </div>

            <div className={style.personalSettingsLoginItem}>
              <span className={style.personalSettingsLoginIcon}>
                <LockOutlined />
              </span>
              <div className={style.personalSettingsLoginText}>
                <strong>{I18N.carbonAgent.loginPassword}</strong>
                <span>
                  {info?.password || I18N.carbonAgent.afterSetting}
                  {I18N.carbonAgent.canLoginViaPassword}
                </span>
              </div>
              <div className={style.personalSettingsPasswordAction}>
                <AccountNumber
                  modalGetContainer={getPersonalSettingsModalContainer}
                  modalRootClassName={PERSONAL_SETTINGS_MODAL_ROOT_CLASS}
                  modalWrapClassName={PERSONAL_SETTINGS_MODAL_WRAP_CLASS}
                  modalZIndex={PERSONAL_SETTINGS_MODAL_Z_INDEX}
                  password={info?.password}
                  onSuccess={refreshInfo}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <BindModal
        bindType={BindType.phone}
        getContainer={getPersonalSettingsModalContainer}
        ref={bindPhoneModalRef}
        rootClassName={PERSONAL_SETTINGS_MODAL_ROOT_CLASS}
        wrapClassName={PERSONAL_SETTINGS_MODAL_WRAP_CLASS}
        zIndex={PERSONAL_SETTINGS_MODAL_Z_INDEX}
        onSuccess={refreshInfo}
      />
      <BindModal
        bindType={BindType.email}
        getContainer={getPersonalSettingsModalContainer}
        ref={bindEmailModalRef}
        rootClassName={PERSONAL_SETTINGS_MODAL_ROOT_CLASS}
        wrapClassName={PERSONAL_SETTINGS_MODAL_WRAP_CLASS}
        zIndex={PERSONAL_SETTINGS_MODAL_Z_INDEX}
        onSuccess={refreshInfo}
      />
      <CheckModal
        email={info?.email}
        getContainer={getPersonalSettingsModalContainer}
        initBindType={BindType.email}
        mobile={info?.mobile}
        ref={checkModalRef}
        rootClassName={PERSONAL_SETTINGS_MODAL_ROOT_CLASS}
        wrapClassName={PERSONAL_SETTINGS_MODAL_WRAP_CLASS}
        zIndex={PERSONAL_SETTINGS_MODAL_Z_INDEX}
        onSuccess={showBindModal}
      />
    </section>
  );
};

export default PersonalSettingsPanel;
