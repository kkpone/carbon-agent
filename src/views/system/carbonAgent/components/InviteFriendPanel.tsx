import {
  CopyOutlined,
  GiftOutlined,
  InfoCircleFilled,
  LeftOutlined,
  LinkOutlined,
  RightOutlined,
  SendOutlined,
} from '@ant-design/icons';
import inviteRewardGift from '@src/assets/images/carbonAgent/invite-reward-gift.png';
import inviteeAvatar from '@src/assets/images/carbonAgent/icons/project-member-avatar.svg';
import I18N from '@src/lang/I18N';
import { ClipboardCopyError, copyToClipboard } from '@src/utils/clipboard';
import { message as antdMessage } from 'antd';
import type { FormEvent } from 'react';
import { useEffect, useId, useMemo, useState } from 'react';

import style from '../index.module.less';
import inviteStyle from './InviteFriendPanel.module.less';
import {
  createOrCopyAgentInviteLink,
  fetchAgentInviteOverview,
  fetchAgentInviteRecordsPage,
  fetchAgentInviteConfig,
  sendAgentInvite,
  type AgentInviteConfig,
  type AgentInviteOverview,
  type AgentInviteRecord,
  type AgentInviteSource,
  type AgentInviteTargetType,
} from '../service';

type InviteFriendPanelProps = {
  active: boolean;
  showTitle?: boolean;
  source: AgentInviteSource;
};

type NormalizedInviteConfig = {
  inviteExpireDays: number;
  inviteUrlBase: string;
  rewardPoints: number;
  rewardValidityDays: number;
  smsEnabled: boolean;
};

type InviteTargetValidation = {
  error?: string;
  target?: string;
  targetType?: AgentInviteTargetType;
};

type PaginationItem = { key: string; type: 'ellipsis' } | number;

const DEFAULT_INVITE_CONFIG: NormalizedInviteConfig = {
  inviteExpireDays: 30,
  inviteUrlBase: '',
  rewardPoints: 200,
  rewardValidityDays: 365,
  smsEnabled: true,
};

const INVITE_RECORD_WEB_PAGE_SIZE = 6;
const INVITE_RECORD_H5_PAGE_SIZE = 3;
const USE_INVITE_FEATURE_V2 = true;

const DEFAULT_INVITE_OVERVIEW: AgentInviteOverview = {
  invitedCount: 0,
  inviteUrl: '',
  linkCreated: false,
  rewardPoints: 200,
  rewardValidityDays: 365,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAINLAND_PHONE_PATTERN = /^1[3-9]\d{9}$/;

const getOptionalNumber = (data: unknown) => {
  if (typeof data === 'number' && Number.isFinite(data)) {
    return data;
  }

  if (typeof data === 'string' && data.trim()) {
    const parsed = Number(data);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const getOptionalBoolean = (data: unknown) => {
  if (typeof data === 'boolean') {
    return data;
  }

  if (typeof data === 'number' && Number.isFinite(data)) {
    return data !== 0;
  }

  if (typeof data === 'string') {
    const normalized = data.trim().toLowerCase();

    if (['1', 'true', 'yes', 'y'].includes(normalized)) {
      return true;
    }

    if (['0', 'false', 'no', 'n'].includes(normalized)) {
      return false;
    }
  }

  return undefined;
};

const normalizeInviteConfig = (
  config?: AgentInviteConfig,
): NormalizedInviteConfig => ({
  inviteExpireDays:
    getOptionalNumber(config?.inviteExpireDays) ??
    DEFAULT_INVITE_CONFIG.inviteExpireDays,
  inviteUrlBase:
    typeof config?.inviteUrlBase === 'string'
      ? config.inviteUrlBase
      : DEFAULT_INVITE_CONFIG.inviteUrlBase,
  rewardPoints:
    getOptionalNumber(config?.rewardPoints) ??
    DEFAULT_INVITE_CONFIG.rewardPoints,
  rewardValidityDays:
    getOptionalNumber(config?.rewardValidityDays) ??
    DEFAULT_INVITE_CONFIG.rewardValidityDays,
  smsEnabled:
    getOptionalBoolean(config?.smsEnabled) ?? DEFAULT_INVITE_CONFIG.smsEnabled,
});

const isRequestCancelled = (error: unknown) => {
  const maybeError = error as { code?: string; name?: string } | undefined;

  return (
    maybeError?.code === 'ERR_CANCELED' || maybeError?.name === 'CanceledError'
  );
};

const formatNumber = (value: number) =>
  value.toLocaleString('zh-CN', {
    maximumFractionDigits: 0,
  });

const formatDuration = (days: number) => {
  if (days > 0 && days % 365 === 0) {
    return I18N.template(
      days === 365 ? I18N.carbonAgent.inviteYear : I18N.carbonAgent.inviteYears,
      {
        val1: formatNumber(days / 365),
      },
    );
  }

  if (days > 0 && days % 30 === 0) {
    return I18N.template(
      days === 30
        ? I18N.carbonAgent.inviteMonth
        : I18N.carbonAgent.inviteMonths,
      {
        val1: formatNumber(days / 30),
      },
    );
  }

  return I18N.template(
    days === 1 ? I18N.carbonAgent.inviteDay : I18N.carbonAgent.inviteDays,
    {
      val1: formatNumber(days),
    },
  );
};

const formatDurationParts = (days: number) => {
  let value = formatNumber(days);

  if (days > 0 && days % 365 === 0) {
    value = formatNumber(days / 365);
  } else if (days > 0 && days % 30 === 0) {
    value = formatNumber(days / 30);
  }

  const label = formatDuration(days);

  return {
    unit: label.replace(value, '').trim(),
    value,
  };
};

const getNormalizedPhone = (target: string) => {
  const compactTarget = target.replace(/[()\s-]/g, '');
  const targetWithoutCountryCode = compactTarget.replace(/^\+?86/, '');

  return MAINLAND_PHONE_PATTERN.test(targetWithoutCountryCode)
    ? targetWithoutCountryCode
    : '';
};

const isPhoneLikeTarget = (target: string) => /^[+\d()\s-]+$/.test(target);

const validateInviteTarget = (
  rawTarget: string,
  smsEnabled: boolean,
): InviteTargetValidation => {
  const trimmedTarget = rawTarget.trim();

  if (!trimmedTarget) {
    return {
      error: smsEnabled
        ? I18N.carbonAgent.inviteEnterTarget
        : I18N.carbonAgent.inviteEnterEmail,
    };
  }

  if (EMAIL_PATTERN.test(trimmedTarget)) {
    return {
      target: trimmedTarget,
      targetType: 'email',
    };
  }

  const normalizedPhone = getNormalizedPhone(trimmedTarget);

  if (normalizedPhone) {
    if (!smsEnabled) {
      return {
        error: I18N.carbonAgent.inviteSmsDisabled,
      };
    }

    return {
      target: normalizedPhone,
      targetType: 'phone',
    };
  }

  if (smsEnabled && isPhoneLikeTarget(trimmedTarget)) {
    return {
      error: I18N.carbonAgent.inviteInvalidPhone,
    };
  }

  return {
    error: smsEnabled
      ? I18N.carbonAgent.inviteInvalidTarget
      : I18N.carbonAgent.inviteInvalidEmail,
  };
};

const getPaginationItems = (
  currentPage: number,
  totalPages: number,
): PaginationItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = new Set<number>([
    1,
    2,
    totalPages - 1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const sortedItems = [...items]
    .filter(item => item >= 1 && item <= totalPages)
    .sort((previous, next) => previous - next);

  return sortedItems.reduce<PaginationItem[]>((result, item, index) => {
    const previousItem = sortedItems[index - 1];

    if (previousItem && item - previousItem > 1) {
      result.push({
        key: `ellipsis-${previousItem}-${item}`,
        type: 'ellipsis',
      });
    }

    result.push(item);

    return result;
  }, []);
};

const normalizeInviteOverview = (
  overview?: AgentInviteOverview,
): AgentInviteOverview => ({
  invitedCount:
    getOptionalNumber(overview?.invitedCount) ??
    DEFAULT_INVITE_OVERVIEW.invitedCount,
  inviteUrl:
    typeof overview?.inviteUrl === 'string'
      ? overview.inviteUrl
      : DEFAULT_INVITE_OVERVIEW.inviteUrl,
  linkCreated: Boolean(overview?.linkCreated),
  rewardPoints:
    getOptionalNumber(overview?.rewardPoints) ??
    DEFAULT_INVITE_OVERVIEW.rewardPoints,
  rewardValidityDays:
    getOptionalNumber(overview?.rewardValidityDays) ??
    DEFAULT_INVITE_OVERVIEW.rewardValidityDays,
});

const InviteFriendPanelLegacy = ({
  active,
  showTitle = true,
  source,
}: InviteFriendPanelProps) => {
  const [config, setConfig] = useState(DEFAULT_INVITE_CONFIG);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [target, setTarget] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const consentInputId = useId();
  const rewardPointsLabel = formatNumber(config.rewardPoints);
  const rewardValidityLabel = formatDuration(config.rewardValidityDays);
  const inviteExpireDaysLabel = formatNumber(config.inviteExpireDays);
  const targetPlaceholder = config.smsEnabled
    ? I18N.carbonAgent.inviteTargetPlaceholder
    : I18N.carbonAgent.inviteTargetEmailPlaceholder;
  const targetValidation = validateInviteTarget(target, config.smsEnabled);
  const targetReady =
    Boolean(target.trim()) &&
    !targetValidation.error &&
    Boolean(targetValidation.target) &&
    Boolean(targetValidation.targetType);
  const sendButtonDisabled =
    loadFailed || loading || submitting || !target.trim();

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setLoadFailed(false);

    fetchAgentInviteConfig(controller.signal)
      .then(response => {
        if (cancelled) {
          return;
        }

        if (response.data.code !== 200) {
          throw new Error(
            response.data.msg || I18N.carbonAgent.inviteConfigLoadFailed,
          );
        }

        setConfig(normalizeInviteConfig(response.data.data));
      })
      .catch(error => {
        if (cancelled || isRequestCancelled(error)) {
          return;
        }

        setConfig(DEFAULT_INVITE_CONFIG);
        setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [active, retryKey]);

  useEffect(() => {
    if (!active) {
      setTarget('');
      setConsentChecked(false);
      setSubmitting(false);
    }
  }, [active]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loadFailed || loading || submitting) {
      return;
    }

    const validation = validateInviteTarget(target, config.smsEnabled);

    if (validation.error || !validation.target || !validation.targetType) {
      antdMessage.warning(
        validation.error || I18N.carbonAgent.inviteInvalidTarget,
      );
      return;
    }

    if (!consentChecked) {
      antdMessage.warning(I18N.carbonAgent.inviteConsentRequired);
      return;
    }

    setSubmitting(true);

    try {
      const response = await sendAgentInvite({
        source,
        target: validation.target,
        targetType: validation.targetType,
      });

      if (response.data.code !== 200) {
        antdMessage.error(
          response.data.msg || I18N.carbonAgent.inviteSendFailed,
        );
        return;
      }

      antdMessage.success(
        response.data.msg || I18N.carbonAgent.inviteSendSuccess,
      );
      setTarget('');
      setConsentChecked(false);
    } catch {
      // antdMessage.error(I18N.carbonAgent.inviteSendFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className={style.invitePanel}
      aria-label={!showTitle ? I18N.carbonAgent.inviteFriends : undefined}
      aria-labelledby={showTitle ? 'carbon-agent-invite-title' : undefined}
    >
      {showTitle ? (
        <h2 className={style.invitePanelTitle} id='carbon-agent-invite-title'>
          {I18N.carbonAgent.inviteFriends}
        </h2>
      ) : null}

      {loadFailed ? (
        <div className={style.inviteConfigError} role='status'>
          <span>{I18N.carbonAgent.inviteConfigLoadFailed}</span>
          <button type='button' onClick={() => setRetryKey(key => key + 1)}>
            {I18N.carbonAgent.inviteRetry}
          </button>
        </div>
      ) : null}

      <div className={style.invitePanelBody} aria-busy={loading}>
        <section className={style.inviteHero}>
          <div className={style.inviteHeroIllustration} aria-hidden='true'>
            <img src={inviteRewardGift} alt='' />
          </div>
          <div className={style.inviteHeroContent}>
            <span className={style.inviteHeroBadge}>
              {I18N.carbonAgent.inviteRewardBadge}
            </span>
            <h3>
              <span>{I18N.carbonAgent.inviteHeroPrefix}</span>
              <strong>
                {I18N.template(I18N.carbonAgent.inviteRewardPoints, {
                  val1: rewardPointsLabel,
                })}
              </strong>
            </h3>
            <p>
              {I18N.template(I18N.carbonAgent.inviteHeroDesc, {
                val1: rewardPointsLabel,
                val2: rewardValidityLabel,
              })}
            </p>
          </div>
        </section>

        <div className={style.inviteStats}>
          <article className={style.inviteStatCard}>
            <span>{I18N.carbonAgent.inviteRewardBoth}</span>
            <strong>
              {I18N.template(I18N.carbonAgent.inviteRewardEachPoints, {
                val1: rewardPointsLabel,
              })}
            </strong>
          </article>
          <article className={style.inviteStatCard}>
            <span>{I18N.carbonAgent.inviteArrivalCondition}</span>
            <strong>
              {I18N.carbonAgent.inviteArrivalSend}
              <b>{I18N.carbonAgent.inviteArrivalFirstMessage}</b>
              {I18N.carbonAgent.inviteArrivalMessage}
            </strong>
          </article>
          <article className={style.inviteStatCard}>
            <span>{I18N.carbonAgent.inviteValidity}</span>
            <strong>{rewardValidityLabel}</strong>
          </article>
        </div>

        <form className={style.inviteSendCard} onSubmit={handleSubmit}>
          <header className={style.inviteSectionHeader}>
            <h3>{I18N.carbonAgent.inviteSendTitle}</h3>
            <p>{I18N.carbonAgent.inviteNewUserOnly}</p>
          </header>
          <div className={style.inviteSendRow}>
            <input
              type='text'
              value={target}
              placeholder={targetPlaceholder}
              autoComplete='off'
              onChange={event => setTarget(event.target.value)}
            />
            <button
              className={targetReady ? style.inviteSendButtonReady : undefined}
              type='submit'
              disabled={sendButtonDisabled}
            >
              <SendOutlined />
              <span>
                {submitting
                  ? I18N.carbonAgent.inviteSubmitting
                  : I18N.carbonAgent.inviteSendButton}
              </span>
            </button>
          </div>
          <label className={style.inviteConsent} htmlFor={consentInputId}>
            <input
              id={consentInputId}
              type='checkbox'
              checked={consentChecked}
              onChange={event => setConsentChecked(event.target.checked)}
            />
            <span>{I18N.carbonAgent.inviteConsent}</span>
          </label>
        </form>

        <section className={style.inviteRulesCard}>
          <header className={style.inviteSectionHeader}>
            <h3>{I18N.carbonAgent.inviteRulesTitle}</h3>
          </header>
          <ol>
            <li>{I18N.carbonAgent.inviteRuleNewUser}</li>
            <li>
              {I18N.template(I18N.carbonAgent.inviteRuleFirstMessage, {
                val1: inviteExpireDaysLabel,
              })}
            </li>
            <li>{I18N.carbonAgent.inviteRuleNoSelf}</li>
            <li>{I18N.carbonAgent.inviteRuleSingleInviter}</li>
            <li>{I18N.carbonAgent.inviteRuleCheat}</li>
            <li>
              {config.smsEnabled
                ? I18N.carbonAgent.inviteRuleTargetTypeSms
                : I18N.carbonAgent.inviteRuleTargetTypeEmailOnly}
            </li>
          </ol>
          <p className={style.inviteFinalNote}>
            <span aria-hidden='true'>!</span>
            {I18N.carbonAgent.inviteFinalNote}
          </p>
        </section>

        {loading ? (
          <div className={style.inviteLoading} role='status'>
            {I18N.carbonAgent.inviteConfigLoading}
          </div>
        ) : null}
      </div>
    </section>
  );
};

const InviteFriendPanelV2 = ({
  active,
  showTitle = true,
  source,
}: InviteFriendPanelProps) => {
  const [overview, setOverview] = useState(DEFAULT_INVITE_OVERVIEW);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState('');
  const [overviewRetryKey, setOverviewRetryKey] = useState(0);
  const [records, setRecords] = useState<AgentInviteRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');
  const [recordsRetryKey, setRecordsRetryKey] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);
  const [linkCreating, setLinkCreating] = useState(false);

  const recordsPageSize =
    source === 'agent_h5'
      ? INVITE_RECORD_H5_PAGE_SIZE
      : INVITE_RECORD_WEB_PAGE_SIZE;
  const rewardPointsLabel = formatNumber(overview.rewardPoints);
  const rewardValidityParts = formatDurationParts(overview.rewardValidityDays);
  const totalPages = Math.max(1, Math.ceil(total / recordsPageSize));
  const paginationItems = useMemo(
    () => getPaginationItems(pageNum, totalPages),
    [pageNum, totalPages],
  );
  const displayedInviteUrl =
    overview.linkCreated && overview.inviteUrl
      ? overview.inviteUrl
      : I18N.carbonAgent.inviteLinkNotCreated;
  const invitedCount = overview.invitedCount || total;

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    let cancelled = false;
    const controller = new AbortController();

    setOverviewLoading(true);
    setOverviewError('');

    fetchAgentInviteOverview(controller.signal)
      .then(response => {
        if (cancelled) {
          return;
        }

        if (response.data.code !== 200) {
          throw new Error(
            response.data.msg || I18N.carbonAgent.inviteOverviewLoadFailed,
          );
        }

        setOverview(normalizeInviteOverview(response.data.data));
      })
      .catch(error => {
        if (cancelled || isRequestCancelled(error)) {
          return;
        }

        setOverviewError(
          error instanceof Error
            ? error.message
            : I18N.carbonAgent.inviteOverviewLoadFailed,
        );
      })
      .finally(() => {
        if (!cancelled) {
          setOverviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [active, overviewRetryKey]);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    let cancelled = false;
    const controller = new AbortController();

    setRecordsLoading(true);
    setRecordsError('');

    fetchAgentInviteRecordsPage(
      {
        keyword: '',
        pageNum: String(pageNum),
        pageSize: String(recordsPageSize),
      },
      controller.signal,
    )
      .then(response => {
        if (cancelled) {
          return;
        }

        if (response.data.code !== 200) {
          throw new Error(
            response.data.msg || I18N.carbonAgent.inviteRecordsLoadFailed,
          );
        }

        const pageData = response.data.data;
        const nextRows = Array.isArray(pageData?.rows) ? pageData.rows : [];
        const nextTotal = getOptionalNumber(pageData?.total) ?? 0;
        const responsePageNum = getOptionalNumber(pageData?.pageNum) ?? pageNum;

        setRecords(nextRows);
        setTotal(nextTotal);

        if (responsePageNum > 0 && responsePageNum !== pageNum) {
          setPageNum(responsePageNum);
        }
      })
      .catch(error => {
        if (cancelled || isRequestCancelled(error)) {
          return;
        }

        setRecords([]);
        setTotal(0);
        setRecordsError(
          error instanceof Error
            ? error.message
            : I18N.carbonAgent.inviteRecordsLoadFailed,
        );
      })
      .finally(() => {
        if (!cancelled) {
          setRecordsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [active, pageNum, recordsPageSize, recordsRetryKey]);

  const handleCopyInviteLink = async () => {
    if (linkCreating) {
      return;
    }

    setLinkCreating(true);

    try {
      const invitePayloadPromise = createOrCopyAgentInviteLink().then(
        response => {
          const linkData = response.data.data;

          if (response.data.code !== 200 || !linkData?.inviteUrl) {
            throw new Error(
              response.data.msg || I18N.carbonAgent.inviteLinkCreateFailedV2,
            );
          }

          const copiedRewardPointsLabel = formatNumber(
            getOptionalNumber(linkData.rewardPoints) ?? overview.rewardPoints,
          );
          const shareContent = I18N.template(
            I18N.carbonAgent.inviteShareCopyText,
            {
              val1: copiedRewardPointsLabel,
              val2: linkData.inviteUrl,
            },
          );

          return { linkData, shareContent };
        },
      );
      const copyPromise = copyToClipboard(
        invitePayloadPromise.then(payload => payload.shareContent),
      );
      const [{ linkData }] = await Promise.all([
        invitePayloadPromise,
        copyPromise,
      ]);

      setOverview(previousOverview => ({
        ...previousOverview,
        inviteUrl: linkData.inviteUrl,
        linkCreated: true,
        rewardPoints:
          getOptionalNumber(linkData.rewardPoints) ??
          previousOverview.rewardPoints,
        rewardValidityDays:
          getOptionalNumber(linkData.rewardValidityDays) ??
          previousOverview.rewardValidityDays,
      }));
      antdMessage.success(I18N.carbonAgent.inviteLinkCopiedV2);
    } catch (error) {
      antdMessage.error(
        error instanceof ClipboardCopyError
          ? I18N.carbonAgent.inviteLinkCopyFailedV2
          : error instanceof Error
          ? error.message
          : I18N.carbonAgent.inviteLinkCreateFailedV2,
      );
    } finally {
      setLinkCreating(false);
    }
  };

  const renderRecordsState = () => {
    if (recordsLoading) {
      return (
        <div className={inviteStyle.inviteV2RecordsState} role='status'>
          {I18N.carbonAgent.inviteRecordsLoading}
        </div>
      );
    }

    if (recordsError) {
      return (
        <div className={inviteStyle.inviteV2RecordsState} role='status'>
          <span>{recordsError}</span>
          <button
            type='button'
            onClick={() => setRecordsRetryKey(key => key + 1)}
          >
            {I18N.carbonAgent.inviteRetry}
          </button>
        </div>
      );
    }

    if (!records.length) {
      return (
        <div className={inviteStyle.inviteV2RecordsState}>
          {I18N.carbonAgent.inviteRecordsEmpty}
        </div>
      );
    }

    return null;
  };

  const recordsState = renderRecordsState();

  return (
    <section
      className={`${style.invitePanel} ${inviteStyle.invitePanelV2} ${
        source === 'agent_h5' ? inviteStyle.invitePanelMobile : ''
      }`}
      aria-label={!showTitle ? I18N.carbonAgent.inviteFriends : undefined}
      aria-labelledby={showTitle ? 'carbon-agent-invite-title' : undefined}
    >
      {showTitle ? (
        <h2 className={style.invitePanelTitle} id='carbon-agent-invite-title'>
          {I18N.carbonAgent.inviteFriends}
        </h2>
      ) : null}

      {overviewError ? (
        <div className={style.inviteConfigError} role='status'>
          <span>{overviewError}</span>
          <button
            type='button'
            onClick={() => setOverviewRetryKey(key => key + 1)}
          >
            {I18N.carbonAgent.inviteRetry}
          </button>
        </div>
      ) : null}

      <div
        className={`${style.invitePanelBody} ${inviteStyle.inviteV2Body}`}
        aria-busy={overviewLoading}
      >
        <section className={`${style.inviteHero} ${inviteStyle.inviteV2Hero}`}>
          <div
            className={`${style.inviteHeroIllustration} ${inviteStyle.inviteV2HeroIllustration}`}
            aria-hidden='true'
          >
            <img src={inviteRewardGift} alt='' />
          </div>
          <div
            className={`${style.inviteHeroContent} ${inviteStyle.inviteV2HeroContent}`}
          >
            <span className={style.inviteHeroBadge}>
              {I18N.carbonAgent.inviteRewardBadge}
            </span>
            <h3>
              <span>{I18N.carbonAgent.inviteHeroPrefix}</span>
              <strong>
                {I18N.template(I18N.carbonAgent.inviteRewardPoints, {
                  val1: rewardPointsLabel,
                })}
              </strong>
            </h3>
          </div>
        </section>

        <div className={`${style.inviteStats} ${inviteStyle.inviteV2Stats}`}>
          <article
            className={`${style.inviteStatCard} ${inviteStyle.inviteV2StatCard}`}
          >
            <span>{I18N.carbonAgent.inviteRewardBoth}</span>
            <strong>
              {source === 'agent_h5' ? (
                <>
                  <b>{rewardPointsLabel}</b>
                  <small>{I18N.carbonAgent.invitePointsPerPerson}</small>
                </>
              ) : (
                <>
                  <small>{I18N.carbonAgent.inviteRewardEach}</small>
                  <b>{rewardPointsLabel}</b>
                  <small>{I18N.carbonAgent.pointsUnit}</small>
                </>
              )}
            </strong>
          </article>
          <article
            className={`${style.inviteStatCard} ${inviteStyle.inviteV2StatCard}`}
          >
            <span>{I18N.carbonAgent.inviteArrivalCondition}</span>
            <strong>
              <b>{I18N.carbonAgent.inviteNewUser}</b>
              <small>{I18N.carbonAgent.register}</small>
            </strong>
          </article>
          <article
            className={`${style.inviteStatCard} ${inviteStyle.inviteV2StatCard}`}
          >
            <span>{I18N.carbonAgent.inviteValidity}</span>
            <strong>
              <b>{rewardValidityParts.value}</b>
              <small>{rewardValidityParts.unit}</small>
            </strong>
          </article>
        </div>

        <section className={inviteStyle.inviteV2Card}>
          <header className={inviteStyle.inviteV2SectionHeader}>
            <h3>{I18N.carbonAgent.inviteShareTitle}</h3>
            <p>{I18N.carbonAgent.inviteShareDescription}</p>
          </header>
          <div className={inviteStyle.inviteV2ShareRow}>
            <div
              className={`${inviteStyle.inviteV2LinkField} ${
                overview.linkCreated ? '' : inviteStyle.inviteV2LinkPlaceholder
              }`}
              title={displayedInviteUrl}
            >
              <LinkOutlined />
              <span>{displayedInviteUrl}</span>
            </div>
            <button
              className={inviteStyle.inviteV2CopyButton}
              type='button'
              disabled={linkCreating}
              aria-busy={linkCreating}
              onClick={handleCopyInviteLink}
            >
              <CopyOutlined />
              <span>
                {linkCreating
                  ? I18N.carbonAgent.inviteLinkCreatingV2
                  : I18N.carbonAgent.inviteCopyLink}
              </span>
            </button>
          </div>
          <p className={inviteStyle.inviteV2ShareNote}>
            <GiftOutlined />
            <span>{I18N.carbonAgent.inviteShareNote}</span>
          </p>
        </section>

        <section
          className={`${inviteStyle.inviteV2Card} ${inviteStyle.inviteV2Records}`}
        >
          <header className={inviteStyle.inviteV2RecordsHeader}>
            <h3>{I18N.carbonAgent.inviteDetailsTitle}</h3>
            <p>
              {I18N.template(I18N.carbonAgent.inviteTotalPeople, {
                val1: formatNumber(invitedCount),
              })}
            </p>
          </header>

          {recordsState ?? (
            <>
              <div className={inviteStyle.inviteV2DesktopTable}>
                <table>
                  <thead>
                    <tr>
                      <th>{I18N.carbonAgent.inviteInvitee}</th>
                      <th>{I18N.carbonAgent.inviteRegistrationTime}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(record => (
                      <tr key={String(record.invitedUserId)}>
                        <td>
                          <span className={inviteStyle.inviteV2Invitee}>
                            <img src={inviteeAvatar} alt='' />
                            <span>{record.invitedUserName || '--'}</span>
                          </span>
                        </td>
                        <td>{record.agentCreateTime || '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={inviteStyle.inviteV2MobileList}>
                {records.map(record => (
                  <div
                    className={inviteStyle.inviteV2MobileRecord}
                    key={String(record.invitedUserId)}
                  >
                    <img src={inviteeAvatar} alt='' />
                    <div>
                      <strong>{record.invitedUserName || '--'}</strong>
                      <span>{record.agentCreateTime || '--'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {totalPages > 1 ? (
            <nav
              className={inviteStyle.inviteV2Pagination}
              aria-label={I18N.carbonAgent.inviteRecordsPagination}
            >
              <button
                type='button'
                aria-label={I18N.carbonAgent.prevPage}
                disabled={pageNum <= 1 || recordsLoading}
                onClick={() => setPageNum(currentPage => currentPage - 1)}
              >
                <LeftOutlined />
              </button>
              {paginationItems.map(item => {
                if (typeof item !== 'number') {
                  return <span key={item.key}>...</span>;
                }

                return (
                  <button
                    className={
                      item === pageNum
                        ? inviteStyle.inviteV2PaginationButtonActive
                        : undefined
                    }
                    key={item}
                    type='button'
                    aria-current={item === pageNum ? 'page' : undefined}
                    disabled={recordsLoading}
                    onClick={() => setPageNum(item)}
                  >
                    {item}
                  </button>
                );
              })}
              <button
                type='button'
                aria-label={I18N.carbonAgent.nextPage}
                disabled={pageNum >= totalPages || recordsLoading}
                onClick={() => setPageNum(currentPage => currentPage + 1)}
              >
                <RightOutlined />
              </button>
            </nav>
          ) : null}
        </section>

        <section
          className={`${inviteStyle.inviteV2Card} ${inviteStyle.inviteV2RulesCard}`}
        >
          <h3>{I18N.carbonAgent.inviteRulesTitle}</h3>
          <ol>
            <li>{I18N.carbonAgent.inviteV2RuleNewUser}</li>
            <li>{I18N.carbonAgent.inviteV2RuleReward}</li>
            <li>{I18N.carbonAgent.inviteV2RuleNoRepeat}</li>
            <li>{I18N.carbonAgent.inviteRuleSingleInviter}</li>
            <li>{I18N.carbonAgent.inviteRuleCheat}</li>
          </ol>
          <p className={inviteStyle.inviteV2FinalNote}>
            <InfoCircleFilled />
            <span>{I18N.carbonAgent.inviteFinalNote}</span>
          </p>
        </section>
      </div>
    </section>
  );
};

const InviteFriendPanel = (props: InviteFriendPanelProps) =>
  USE_INVITE_FEATURE_V2 ? (
    <InviteFriendPanelV2 {...props} />
  ) : (
    <InviteFriendPanelLegacy {...props} />
  );

export default InviteFriendPanel;
