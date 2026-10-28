import {
  ExclamationCircleFilled,
  FileTextOutlined,
  KeyOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import { message as antdMessage } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import Icon from './Icon';
import { icons } from '../constants';
import style from '../index.module.less';
import I18N, { LocaleType } from '@src/lang/I18N';
import { LocaleContext } from '@src/components/LocaleProvider';

type PlanTone = 'personal' | 'team' | 'trial';

const mobilePlanBadgeToneClassMap: Record<PlanTone, string> = {
  personal: style.mobilePersonalPlanBadgePersonal,
  team: style.mobilePersonalPlanBadgeTeam,
  trial: style.mobilePersonalPlanBadgeTrial,
};

const mobileLanguageOptions = [LocaleType.zhCN, LocaleType.enUS];

const normalizeMobileLanguageValue = (languageValue: LocaleType) =>
  mobileLanguageOptions.includes(languageValue)
    ? languageValue
    : LocaleType.zhCN;

const getMobileLanguageLabel = (languageValue: LocaleType) => {
  if (languageValue === LocaleType.zhCN) {
    return I18N.carbonAgent.languageSimplifiedChinese;
  }

  return I18N.carbonAgent.languageEnglish;
};

type MobilePersonalCenterProps = {
  account: string;
  open: boolean;
  personalWorkspace?: boolean;
  planName: string;
  planTone?: PlanTone;
  pointsWarningActionLabel?: string;
  pointsWarningMessage?: string;
  userName: string;
  onBack: () => void;
  onApiKeys: () => void;
  onAuthorizations: () => void;
  onInvite: () => void;
  onIssueFeedback: () => void;
  onLogout: () => void;
  onInvoices: () => void;
  onNewChat: () => void;
  onOpenGuide: () => void;
  onOpenManual: () => void;
  onOrders: () => void;
  onPointsRecords: () => void;
  onSettings: () => void;
  onSubscribe: () => void;
  onPointsWarningAction: () => void;
};

const MobilePersonalCenter = ({
  account,
  open,
  personalWorkspace = true,
  planName,
  userName,
  onApiKeys,
  onAuthorizations,
  onBack,
  onInvite,
  onIssueFeedback,
  onInvoices,
  onLogout,
  onNewChat,
  onOpenGuide,
  onOpenManual,
  onOrders,
  onPointsRecords,
  onSettings,
  planTone = 'trial',
  pointsWarningActionLabel,
  pointsWarningMessage,
  onSubscribe,
  onPointsWarningAction,
}: MobilePersonalCenterProps) => {
  const { changeLocale, locale } = useContext(LocaleContext);
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);
  const mobileLocale = normalizeMobileLanguageValue(locale);

  useEffect(() => {
    if (!open) {
      setLanguageSheetOpen(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleLanguageChange = async (nextLocale: LocaleType) => {
    setLanguageSheetOpen(false);

    if (nextLocale === locale) {
      return;
    }

    try {
      await changeLocale({
        currentLocale: nextLocale,
        syncUrl: true,
      });
    } catch {
      antdMessage.error(I18N.carbonAgent.executionFailed);
    }
  };

  return createPortal(
    <section
      id='carbon-agent-mobile-personal-center'
      className={style.mobilePersonalCenterPage}
      aria-label={I18N.carbonAgent.personalCenter}
    >
      <header className={style.mobilePersonalCenterHeader}>
        <button
          className={style.mobilePersonalCenterNavButton}
          type='button'
          aria-label={I18N.carbonAgent.back}
          onClick={onBack}
        >
          <Icon
            className={style.mobilePersonalCenterBackIcon}
            src={icons.chevronIcon}
          />
        </button>
        <h1>{I18N.carbonAgent.personalCenter}</h1>
        <button
          className={style.mobilePersonalCenterNavButton}
          type='button'
          aria-label={I18N.carbonAgent.newChat}
          onClick={onNewChat}
        >
          <Icon
            className={style.mobilePersonalCenterNewIcon}
            src={icons.newChatIcon}
          />
        </button>
      </header>

      <div className={style.mobilePersonalCenterContent}>
        <section className={style.mobilePersonalProfile}>
          <div className={style.mobilePersonalProfileMain}>
            <img
              className={style.mobilePersonalAvatar}
              src={icons.avatarIcon}
              alt=''
            />
            <div className={style.mobilePersonalProfileText}>
              <strong>{userName}</strong>
              <span>{account}</span>
            </div>
          </div>
          <span
            className={classNames(
              style.mobilePersonalPlanBadge,
              mobilePlanBadgeToneClassMap[planTone],
            )}
          >
            {planName}
          </span>
        </section>

        {personalWorkspace &&
        pointsWarningMessage &&
        pointsWarningActionLabel ? (
          <aside className={style.mobilePointsWarning} role='status'>
            <ExclamationCircleFilled aria-hidden='true' />
            <span>{pointsWarningMessage}</span>
            <button type='button' onClick={onPointsWarningAction}>
              {pointsWarningActionLabel}
            </button>
          </aside>
        ) : null}

        <div className={style.mobilePersonalGroups}>
          {personalWorkspace && (
            <section className={style.mobilePersonalGroup}>
              <h2 className={style.mobilePersonalGroupTitle}>
                {I18N.carbonAgent.mall}
              </h2>
              <div className={style.mobilePersonalActionCard}>
                <button
                  className={style.mobilePersonalAction}
                  type='button'
                  onClick={onSubscribe}
                >
                  <span className={style.mobilePersonalActionIcon}>
                    <Icon
                      className={classNames(
                        style.mobilePersonalActionImageIcon,
                        style.navPlanImageIcon,
                      )}
                      src={icons.navPlanIcon}
                    />
                  </span>
                  <span>{I18N.carbonAgent.planSubscription}</span>
                </button>
                <button
                  className={style.mobilePersonalAction}
                  type='button'
                  onClick={onPointsRecords}
                >
                  <span className={style.mobilePersonalActionIcon}>
                    <Icon
                      className={classNames(
                        style.mobilePersonalActionImageIcon,
                        style.navPointsImageIcon,
                      )}
                      src={icons.navPointsIcon}
                    />
                  </span>
                  <span>{I18N.carbonAgent.profilePoints}</span>
                </button>
                <button
                  className={style.mobilePersonalAction}
                  type='button'
                  onClick={onInvite}
                >
                  <span className={style.mobilePersonalActionIcon}>
                    <UserAddOutlined />
                  </span>
                  <span>{I18N.carbonAgent.inviteFriends}</span>
                </button>
              </div>
            </section>
          )}
          <section className={style.mobilePersonalGroup}>
            <h2 className={style.mobilePersonalGroupTitle}>
              {I18N.carbonAgent.bills}
            </h2>
            <div className={style.mobilePersonalActionCard}>
              <button
                className={style.mobilePersonalAction}
                type='button'
                onClick={onOpenGuide}
              >
                <span className={style.mobilePersonalActionIcon}>
                  <QuestionCircleOutlined />
                </span>
                <span className={style.mobilePersonalActionText}>
                  {I18N.carbonAgent.guideEntry}
                </span>
              </button>
              <button
                className={style.mobilePersonalAction}
                type='button'
                onClick={onOpenManual}
              >
                <span className={style.mobilePersonalActionIcon}>
                  <FileTextOutlined />
                </span>
                <span className={style.mobilePersonalActionText}>
                  {I18N.carbonAgent.operationManual}
                </span>
              </button>
              <button
                className={style.mobilePersonalAction}
                type='button'
                onClick={onIssueFeedback}
              >
                <span className={style.mobilePersonalActionIcon}>
                  <Icon
                    className={style.mobilePersonalActionImageIcon}
                    src={icons.issueFeedbackIcon}
                  />
                </span>
                <span>{I18N.carbonAgent.issueFeedbackCenter}</span>
              </button>
              {personalWorkspace && (
                <>
                  <button
                    className={style.mobilePersonalAction}
                    type='button'
                    onClick={onOrders}
                  >
                    <span className={style.mobilePersonalActionIcon}>
                      <Icon
                        className={classNames(
                          style.mobilePersonalActionImageIcon,
                          style.navOrderImageIcon,
                        )}
                        src={icons.navOrderIcon}
                      />
                    </span>
                    <span>{I18N.carbonAgent.profileOrders}</span>
                  </button>
                  <button
                    className={style.mobilePersonalAction}
                    type='button'
                    onClick={onInvoices}
                  >
                    <span className={style.mobilePersonalActionIcon}>
                      <Icon
                        className={classNames(
                          style.mobilePersonalActionImageIcon,
                          style.navInvoiceImageIcon,
                        )}
                        src={icons.navInvoiceIcon}
                      />
                    </span>
                    <span>{I18N.carbonAgent.profileInvoices}</span>
                  </button>
                </>
              )}
            </div>
          </section>
          <section className={style.mobilePersonalGroup}>
            <h2 className={style.mobilePersonalGroupTitle}>
              {I18N.carbonAgent.settings}
            </h2>
            <div className={style.mobilePersonalActionCard}>
              <button
                className={style.mobilePersonalAction}
                type='button'
                onClick={onSettings}
              >
                <span className={style.mobilePersonalActionIcon}>
                  <Icon
                    className={classNames(
                      style.mobilePersonalActionImageIcon,
                      style.navSettingsImageIcon,
                    )}
                    src={icons.navSettingsIcon}
                  />
                </span>
                <span className={style.mobilePersonalActionText}>
                  {I18N.carbonAgent.profileSettings}
                </span>
              </button>
              <button
                className={classNames(
                  style.mobilePersonalAction,
                  style.mobilePersonalLanguageAction,
                )}
                type='button'
                aria-haspopup='dialog'
                aria-expanded={languageSheetOpen}
                onClick={() => setLanguageSheetOpen(true)}
              >
                <span className={style.mobilePersonalActionIcon}>
                  <Icon
                    className={classNames(
                      style.mobilePersonalActionImageIcon,
                      style.navLanguageImageIcon,
                    )}
                    src={icons.profileLanguageIcon}
                  />
                </span>
                <span className={style.mobilePersonalActionText}>
                  {I18N.carbonAgent.profileLanguage}
                </span>
                <span className={style.mobilePersonalActionMeta}>
                  <span>{getMobileLanguageLabel(mobileLocale)}</span>
                  <Icon
                    className={style.mobilePersonalActionArrow}
                    src={icons.chevronIcon}
                  />
                </span>
              </button>
              {personalWorkspace && (
                <>
                  <button
                    className={style.mobilePersonalAction}
                    type='button'
                    onClick={onApiKeys}
                  >
                    <span className={style.mobilePersonalActionIcon}>
                      <KeyOutlined />
                    </span>
                    <span className={style.mobilePersonalActionText}>
                      {I18N.ccdb.apiKeyManagement}
                    </span>
                  </button>
                  <button
                    className={style.mobilePersonalAction}
                    type='button'
                    onClick={onAuthorizations}
                  >
                    <span className={style.mobilePersonalActionIcon}>
                      <SafetyCertificateOutlined />
                    </span>
                    <span className={style.mobilePersonalActionText}>
                      {I18N.ccdb.authorizationManagement}
                    </span>
                  </button>
                </>
              )}
            </div>
          </section>
          <section className={style.mobilePersonalGroup}>
            <div
              className={classNames(
                style.mobilePersonalActionCard,
                style.mobilePersonalSingleActionCard,
              )}
            >
              <button
                className={style.mobilePersonalAction}
                type='button'
                onClick={onLogout}
              >
                <span className={style.mobilePersonalActionIcon}>
                  <Icon
                    className={classNames(
                      style.mobilePersonalActionImageIcon,
                      style.navLogoutImageIcon,
                    )}
                    src={icons.navLogoutIcon}
                  />
                </span>
                <span>{I18N.carbonAgent.profileLogout}</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {languageSheetOpen ? (
        <div
          className={style.mobileLanguageSheetLayer}
          role='dialog'
          aria-modal='true'
          aria-labelledby='carbon-agent-mobile-language-title'
        >
          <button
            className={style.mobileLanguageSheetBackdrop}
            type='button'
            aria-label={I18N.carbonAgent.closeDialog}
            onClick={() => setLanguageSheetOpen(false)}
          />
          <section className={style.mobileLanguageSheet}>
            <header className={style.mobileLanguageSheetHeader}>
              <h2 id='carbon-agent-mobile-language-title'>
                {I18N.carbonAgent.profileLanguage}
              </h2>
              <button
                className={style.mobileLanguageSheetClose}
                type='button'
                aria-label={I18N.carbonAgent.closeDialog}
                onClick={() => setLanguageSheetOpen(false)}
              />
            </header>
            <div className={style.mobileLanguageSheetOptions} role='radiogroup'>
              {mobileLanguageOptions.map(item => (
                <button
                  className={classNames(style.mobileLanguageSheetOption, {
                    [style.mobileLanguageSheetOptionActive]:
                      item === mobileLocale,
                  })}
                  key={item}
                  type='button'
                  role='radio'
                  aria-checked={item === mobileLocale}
                  onClick={() => {
                    handleLanguageChange(item);
                  }}
                >
                  <span>{getMobileLanguageLabel(item)}</span>
                  {item === locale ? (
                    <span
                      className={style.mobileLanguageSheetCheck}
                      aria-hidden='true'
                    />
                  ) : null}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </section>,
    document.body,
  );
};

export default MobilePersonalCenter;
