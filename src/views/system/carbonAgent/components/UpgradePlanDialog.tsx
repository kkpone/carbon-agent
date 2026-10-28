import {
  KeyOutlined,
  SafetyCertificateOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import wechatPayIcon from '@src/assets/svg/wx_pay.svg';
import I18N from '@src/lang/I18N';
import { message as antdMessage } from 'antd';
import classNames from 'classnames';
import QRCode from 'qrcode.react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import planCheckIcon from '@/assets/images/carbonAgent/plans/check.svg';
import planPointsIcon from '@/assets/images/carbonAgent/plans/points.svg';
import CustomerServicePopover from '@/components/CustomerServicePopover';
import { withCurrentLocalePrefix } from '@/router/localePath';

import CcdbApiKeyPanel from './CcdbApiKeyPanel';
import CcdbAuthorizationPanel from './CcdbAuthorizationPanel';
import Icon from './Icon';
import InviteFriendPanel from './InviteFriendPanel';
import InvoiceManagementPanel from './InvoiceManagementPanel';
import OrderManagementPanel from './OrderManagementPanel';
import PersonalSettingsPanel from './PersonalSettingsPanel';
import PointsRecordPanel from './PointsRecordPanel';
import planStyle from './SubscriptionPlans.module.less';
import { icons } from '../constants';
import style from '../index.module.less';
import { queryAgentPointOrder, type AgentPointOrder } from '../service';
import { TEAM_PATH } from '../team/helpers';
import { teamText } from '../team/i18n';

export type UpgradeDialogTab =
  | 'addons'
  | 'apiKeys'
  | 'authorizations'
  | 'invite'
  | 'invoices'
  | 'orders'
  | 'plans'
  | 'points'
  | 'settings';

type UpgradePlanDialogProps = {
  personalWorkspace?: boolean;
  addonLoading?: boolean;
  addonPlans?: UpgradePlan[];
  currentPlanCode?: string;
  initialTab?: UpgradeDialogTab;
  loading?: boolean;
  open: boolean;
  plans?: UpgradePlan[];
  onClose: () => void;
  onMobileBackToPersonalCenter?: () => void;
  onPaymentSuccess?: (order: AgentPointOrder) => void;
  onUpgrade: (plan: UpgradePlan) => Promise<AgentPointOrder | void> | void;
};

export type UpgradePlan = {
  allowance: string;
  badgeText?: string;
  buttonText: string;
  current?: boolean;
  defaultFlag?: boolean;
  description: string;
  featureTitle?: string;
  features: string[];
  grantPoints?: number;
  grantType?: string;
  highlightFlag?: boolean;
  key: string;
  name: string;
  planKind?: string;
  pointLabel: string;
  price: string;
  priceSuffix?: string;
  purchaseEnabled?: boolean;
  quotaLabel?: string;
  recommendFlag?: boolean;
  sortNo?: number;
  tone: 'trial' | 'personal' | 'team';
  validityType?: string;
};

const mobilePlanToneClassMap: Record<UpgradePlan['tone'], string> = {
  personal: style.mobileUpgradePlanPersonal,
  team: style.mobileUpgradePlanTeam,
  trial: style.mobileUpgradePlanTrial,
};

const planTitleToneClassMap: Record<UpgradePlan['tone'], string> = {
  personal: style.planTitleBadgePersonal,
  team: style.planTitleBadgeTeam,
  trial: style.planTitleBadgeTrial,
};

const EMPTY_UPGRADE_PLANS: UpgradePlan[] = [];
const PAYMENT_POLL_INTERVAL_MS = 3000;
const DEFAULT_PAYMENT_EXPIRE_MS = 30 * 60 * 1000;
const PAYMENT_SUCCESS_STATUS = new Set([
  'PAID',
  'PAY_SUCCESS',
  'SUCCESS',
  'TRADE_SUCCESS',
]);

type PaymentStep = 'idle' | 'qr' | 'success';

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

const getPaymentAmount = (order?: AgentPointOrder) =>
  getOptionalNumber(order?.amount) ??
  getOptionalNumber(order?.payParams?.payMoney) ??
  getOptionalNumber(order?.payParams?.amount) ??
  0;

const formatPaymentAmount = (amount: unknown) => {
  const numberAmount = getOptionalNumber(amount);

  if (numberAmount === undefined) {
    return '0';
  }

  return numberAmount.toLocaleString('zh-CN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
};

const normalizePayStatus = (status?: string | null) =>
  String(status || '')
    .trim()
    .toUpperCase();

const isPaymentSuccess = (order?: AgentPointOrder) => {
  if (!order) {
    return false;
  }

  const payStatus = normalizePayStatus(
    order.payStatus || order.payParams?.payStatus,
  );
  const orderStatus = normalizePayStatus(order.status);

  return (
    Boolean(order.payTime) ||
    PAYMENT_SUCCESS_STATUS.has(payStatus) ||
    PAYMENT_SUCCESS_STATUS.has(orderStatus)
  );
};

const getQrCodeValue = (order?: AgentPointOrder) =>
  order?.codeUrl || order?.payParams?.code_url || '';

const parseDateTimeMs = (dateTime?: string | null) => {
  if (!dateTime) {
    return undefined;
  }

  const match = dateTime.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/,
  );

  if (match) {
    const [, year, month, day, hour, minute, second] = match;
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ).getTime();

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  const parsed = new Date(dateTime).getTime();

  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeTimestampMs = (timestamp?: number) => {
  if (!timestamp || !Number.isFinite(timestamp)) {
    return undefined;
  }

  return timestamp < 100000000000 ? timestamp * 1000 : timestamp;
};

const getPaymentExpireAt = (order?: AgentPointOrder) => {
  const closeTimeMs = parseDateTimeMs(order?.closeTime);

  if (closeTimeMs) {
    return closeTimeMs;
  }

  const orderTimeMs = normalizeTimestampMs(order?.payParams?.orderTime);

  if (orderTimeMs) {
    return orderTimeMs + DEFAULT_PAYMENT_EXPIRE_MS;
  }

  const createTimeMs = parseDateTimeMs(order?.createTime);

  return createTimeMs ? createTimeMs + DEFAULT_PAYMENT_EXPIRE_MS : undefined;
};

const formatCountdownParts = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

const getDefaultPlanKey = (plans: UpgradePlan[], currentPlanCode?: string) => {
  if (!plans.length) {
    return '';
  }

  return (
    plans.find(plan => plan.recommendFlag)?.key ||
    plans.find(plan => plan.current)?.key ||
    plans.find(plan => plan.defaultFlag)?.key ||
    plans.find(plan => plan.tone === 'team')?.key ||
    plans.find(plan => plan.key === currentPlanCode)?.key ||
    plans[0].key
  );
};

function getPointLabelParts(pointLabel: string) {
  const match = pointLabel.match(/^(每日|每月)\s*([\d,]+)\s*(积分.*)$/);

  if (!match) {
    return null;
  }

  const [, period, points, suffix] = match;

  if (!period || !points || !suffix) {
    return null;
  }

  return {
    period,
    points,
    suffix,
  };
}

const getAllowanceValue = (plan?: UpgradePlan) => {
  if (!plan) {
    return I18N.carbonAgent.pointLabelByPlan;
  }

  const parts = getPointLabelParts(plan.pointLabel || plan.allowance);

  if (parts) {
    return `${parts.points} ${parts.suffix}`;
  }

  if (typeof plan.grantPoints === 'number') {
    let validity = I18N.carbonAgent.validityByPlan;

    if (plan.grantType === 'daily' || plan.validityType === 'day') {
      validity = I18N.carbonAgent.validToday;
    }

    if (plan.grantType === 'monthly' || plan.validityType === 'month') {
      validity = I18N.carbonAgent.validThisMonth;
    }

    return I18N.template(I18N.carbonAgent.pointsWithValidity, {
      val1: plan.grantPoints.toLocaleString(),
      val2: validity,
    });
  }

  const pointMatch = (plan.pointLabel || plan.allowance).match(
    /([\d,]+)\s*积分/,
  );

  return pointMatch
    ? I18N.template(I18N.carbonAgent.pointsAmount, { val1: pointMatch[1] })
    : plan.pointLabel;
};

const getReportValue = (features: string[] = []) =>
  features.find(feature => /份.*碳足迹报告/.test(feature)) ||
  I18N.carbonAgent.byPlanConfig;

const getFeatureItems = (features: string[]) => {
  const occurrenceMap = new Map<string, number>();

  return features.map(feature => {
    const occurrence = (occurrenceMap.get(feature) || 0) + 1;

    occurrenceMap.set(feature, occurrence);

    return {
      feature,
      key: `${feature}-${occurrence}`,
    };
  });
};

const getPointPeriodLabel = (plan?: UpgradePlan) => {
  if (!plan) {
    return I18N.carbonAgent.pointsDetail;
  }

  const parts = getPointLabelParts(plan.pointLabel || plan.allowance);

  if (parts) {
    return I18N.template(I18N.carbonAgent.periodPoints, { val1: parts.period });
  }

  if (plan.grantType === 'daily' || plan.validityType === 'day') {
    return I18N.carbonAgent.dailyPoints;
  }

  if (plan.grantType === 'monthly' || plan.validityType === 'month') {
    return I18N.carbonAgent.monthlyPoints;
  }

  return I18N.carbonAgent.pointsDetail;
};

const getFeatureTextParts = (feature: string) => {
  const match = feature.match(/^(\d[\d,]*)\s*(.+)$/);

  if (!match) {
    return null;
  }

  const [, count, text] = match;

  if (!count || !text) {
    return null;
  }

  return {
    count,
    text,
  };
};

const renderPlanPointLabel = (plan: UpgradePlan) => {
  const parts = getPointLabelParts(plan.pointLabel);

  if (!parts) {
    return <span>{plan.pointLabel}</span>;
  }

  return (
    <>
      <span>{parts.period}</span>
      <strong>{parts.points}</strong>
      <span>{parts.suffix}</span>
    </>
  );
};

const isTeamConsultPlan = (plan?: UpgradePlan) => plan?.tone === 'team';

const renderFeatureText = (feature: string) => {
  const parts = getFeatureTextParts(feature);

  if (!parts) {
    return <span>{feature}</span>;
  }

  return (
    <>
      <strong>{parts.count}</strong>
      <span>{parts.text}</span>
    </>
  );
};

const getFormattedPoints = (points: number) =>
  points.toLocaleString('zh-CN', {
    maximumFractionDigits: 0,
  });

const getAddonPointAmount = (plan?: UpgradePlan) => {
  if (!plan) {
    return '';
  }

  if (typeof plan.grantPoints === 'number') {
    return getFormattedPoints(plan.grantPoints);
  }

  const candidates = [plan.pointLabel, plan.allowance, plan.name];
  const matchedAmount = candidates
    .map(candidate => candidate.match(/([\d,]+)\s*积分/)?.[1])
    .find(Boolean);

  if (matchedAmount) {
    return matchedAmount;
  }

  return plan.name;
};

const isPointAddonPlan = (plan: UpgradePlan) => {
  const text = `${plan.key} ${plan.name} ${plan.pointLabel} ${plan.allowance}`;

  return (
    typeof plan.grantPoints === 'number' || /积分|points?|credit/i.test(text)
  );
};

const getAddonPrimaryInfo = (plan?: UpgradePlan) => {
  if (!plan) {
    return {
      label: I18N.carbonAgent.pointsQuantity,
      value: I18N.carbonAgent.byPurchaseConfig,
    };
  }

  if (isPointAddonPlan(plan)) {
    return {
      label: I18N.carbonAgent.pointsQuantity,
      value: I18N.template(I18N.carbonAgent.pointsAmount, {
        val1: getAddonPointAmount(plan),
      }),
    };
  }

  return {
    label: I18N.carbonAgent.serviceContent,
    value: plan.name,
  };
};

const getCommerceButtonText = (
  plan: UpgradePlan | undefined,
  isAddon: boolean,
) => {
  const fallback = isAddon
    ? I18N.carbonAgent.buyPointsPackage
    : I18N.carbonAgent.upgradePlan;
  const buttonText = plan?.buttonText?.trim();

  if (!buttonText || (isAddon && buttonText === I18N.carbonAgent.upgradePlan)) {
    return fallback;
  }

  return buttonText;
};

const UpgradePlanDialog = ({
  personalWorkspace = true,
  addonLoading = false,
  addonPlans,
  currentPlanCode,
  initialTab = 'plans',
  loading = false,
  open,
  plans,
  onClose,
  onMobileBackToPersonalCenter,
  onPaymentSuccess,
  onUpgrade,
}: UpgradePlanDialogProps) => {
  const displayPlans = plans || EMPTY_UPGRADE_PLANS;
  const displayAddonPlans = addonPlans || EMPTY_UPGRADE_PLANS;
  const [planEdition, setPlanEdition] = useState<'personal' | 'team'>(
    'personal',
  );
  const editionTabs = useRef<Array<HTMLButtonElement | null>>([]);
  const personalPlans = useMemo(
    () => displayPlans.filter(plan => plan.tone !== 'team'),
    [displayPlans],
  );
  const editionPlans =
    planEdition === 'team'
      ? displayPlans.filter(plan => plan.tone === 'team')
      : personalPlans;
  const [selectedTab, setActiveTab] = useState<UpgradeDialogTab>(initialTab);
  const activeTab = personalWorkspace ? selectedTab : 'settings';
  const [selectedPlanKey, setSelectedPlanKey] = useState('');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [creatingPlanKey, setCreatingPlanKey] = useState('');
  // const [paymentAgreementChecked, setPaymentAgreementChecked] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<AgentPointOrder>();
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle');
  const [paymentCountdown, setPaymentCountdown] = useState(
    formatCountdownParts(0),
  );
  const mobilePlanListRef = useRef<HTMLDivElement>(null);
  const mobilePlanScrollFrameRef = useRef(0);
  const mobilePlanSelectionSourceRef = useRef<'auto' | 'click' | 'scroll'>(
    'auto',
  );
  const successNotifiedOrderNoRef = useRef('');
  const plansActive = activeTab === 'plans';
  const addonsActive = activeTab === 'addons';
  const invoicesActive = activeTab === 'invoices';
  const inviteActive = activeTab === 'invite';
  const ordersActive = activeTab === 'orders';
  const pointsActive = activeTab === 'points';
  const settingsActive = activeTab === 'settings';
  const apiKeysActive = activeTab === 'apiKeys';
  const authorizationsActive = activeTab === 'authorizations';
  const commerceActive = plansActive || addonsActive;
  const recordsActive = ordersActive || invoicesActive || pointsActive;
  const accessActive = apiKeysActive || authorizationsActive;
  const panelActive =
    recordsActive || settingsActive || inviteActive || accessActive;
  const activeCommercePlans = addonsActive ? displayAddonPlans : personalPlans;
  const activeCommerceLoading = addonsActive ? addonLoading : loading;
  const activeCommerceCurrentPlanCode = addonsActive
    ? undefined
    : currentPlanCode;
  const activeCommerceEmptyText = addonsActive
    ? I18N.carbonAgent.noPurchasableAddon
    : I18N.carbonAgent.noSubscribablePlan;
  const addonPointPlans = displayAddonPlans.filter(isPointAddonPlan);
  const addonServicePlans = displayAddonPlans.filter(
    plan => !isPointAddonPlan(plan),
  );
  const selectedPlan = useMemo(
    () =>
      activeCommercePlans.find(plan => plan.key === selectedPlanKey) ||
      activeCommercePlans.find(plan => plan.recommendFlag) ||
      activeCommercePlans.find(plan => plan.current) ||
      activeCommercePlans.find(plan => plan.defaultFlag) ||
      activeCommercePlans.find(plan => plan.tone === 'team') ||
      activeCommercePlans.find(
        plan => plan.key === activeCommerceCurrentPlanCode,
      ) ||
      activeCommercePlans[0],
    [activeCommerceCurrentPlanCode, activeCommercePlans, selectedPlanKey],
  );
  const selectedPlanCurrent = selectedPlan
    ? !addonsActive &&
      (Boolean(selectedPlan.current) ||
        Boolean(
          activeCommerceCurrentPlanCode &&
            selectedPlan.key === activeCommerceCurrentPlanCode,
        ))
    : false;
  const selectedPlanTeamConsult =
    plansActive && isTeamConsultPlan(selectedPlan);
  const selectedPlanDisabled = selectedPlan
    ? !selectedPlanTeamConsult &&
      (selectedPlanCurrent || selectedPlan.purchaseEnabled === false)
    : true;
  const selectedPlanCreating = Boolean(
    selectedPlan && creatingPlanKey === selectedPlan.key,
  );
  const selectedPlanFeatures = selectedPlan?.features || [];
  const mobileAgreementId = 'carbon-agent-mobile-upgrade-agreement';
  const paymentAmount = getPaymentAmount(paymentOrder);
  const paymentQrCodeValue = getQrCodeValue(paymentOrder);
  const selectedAddonPrimaryInfo = getAddonPrimaryInfo(selectedPlan);
  let dialogTitleId = 'carbon-agent-order-title';

  if (plansActive) {
    dialogTitleId = 'carbon-agent-upgrade-title';
  } else if (addonsActive) {
    dialogTitleId = 'carbon-agent-addon-title';
  } else if (inviteActive) {
    dialogTitleId = 'carbon-agent-invite-title';
  } else if (invoicesActive) {
    dialogTitleId = 'carbon-agent-invoice-record-title';
  } else if (pointsActive) {
    dialogTitleId = 'carbon-agent-points-record-title';
  } else if (settingsActive) {
    dialogTitleId = 'carbon-agent-personal-settings-title';
  } else if (apiKeysActive) {
    dialogTitleId = 'ccdb-api-key-title';
  } else if (authorizationsActive) {
    dialogTitleId = 'ccdb-grant-title';
  }

  let mobileDialogTitle = I18N.carbonAgent.upgradePlan;

  if (pointsActive) {
    mobileDialogTitle = I18N.carbonAgent.profilePoints;
  } else if (inviteActive) {
    mobileDialogTitle = I18N.carbonAgent.inviteFriends;
  } else if (invoicesActive) {
    mobileDialogTitle = I18N.carbonAgent.invoiceManagement;
  } else if (ordersActive) {
    mobileDialogTitle = I18N.carbonAgent.profileOrders;
  } else if (addonsActive) {
    mobileDialogTitle = I18N.carbonAgent.pointsRecharge;
  } else if (settingsActive) {
    mobileDialogTitle = I18N.carbonAgent.profileSettings;
  } else if (apiKeysActive) {
    mobileDialogTitle = I18N.ccdb.apiKeyManagement;
  } else if (authorizationsActive) {
    mobileDialogTitle = I18N.ccdb.authorizationManagement;
  }

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      setPlanEdition('personal');
    }
  }, [initialTab, open]);

  useEffect(() => {
    if (!open || !commerceActive) {
      return;
    }

    if (
      selectedPlanKey &&
      activeCommercePlans.some(plan => plan.key === selectedPlanKey)
    ) {
      return;
    }

    mobilePlanSelectionSourceRef.current = 'auto';
    setSelectedPlanKey(
      getDefaultPlanKey(activeCommercePlans, activeCommerceCurrentPlanCode),
    );
  }, [
    activeCommerceCurrentPlanCode,
    activeCommercePlans,
    commerceActive,
    open,
    selectedPlanKey,
  ]);

  useEffect(
    () => () => {
      if (mobilePlanScrollFrameRef.current) {
        window.cancelAnimationFrame(mobilePlanScrollFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (
      !open ||
      !commerceActive ||
      !selectedPlanKey ||
      mobilePlanSelectionSourceRef.current === 'scroll'
    ) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      const selectedCard = Array.from(
        mobilePlanListRef.current?.querySelectorAll<HTMLElement>(
          '[data-plan-key]',
        ) || [],
      ).find(card => card.dataset.planKey === selectedPlanKey);

      selectedCard?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      mobilePlanSelectionSourceRef.current = 'auto';
    });

    return () => window.cancelAnimationFrame(frame);
  }, [commerceActive, open, selectedPlanKey]);

  useEffect(() => {
    if (open) {
      return;
    }

    setCreatingPlanKey('');
    // setPaymentAgreementChecked(false);
    setPaymentOrder(undefined);
    setPaymentStep('idle');
    setPaymentCountdown(formatCountdownParts(0));
    successNotifiedOrderNoRef.current = '';
  }, [open]);

  useEffect(() => {
    if (paymentStep !== 'qr' || !paymentOrder?.orderNo) {
      return undefined;
    }

    let cancelled = false;

    const pollPaymentStatus = () => {
      queryAgentPointOrder(paymentOrder.orderNo)
        .then(response => {
          if (cancelled) {
            return;
          }

          const nextOrder = response.data.data;

          if (!nextOrder) {
            return;
          }

          setPaymentOrder(nextOrder);

          if (!isPaymentSuccess(nextOrder)) {
            return;
          }

          setPaymentStep('success');

          if (successNotifiedOrderNoRef.current !== nextOrder.orderNo) {
            successNotifiedOrderNoRef.current = nextOrder.orderNo;
            onPaymentSuccess?.(nextOrder);
          }
        })
        .catch(() => {
          // 轮询偶发失败时保留二维码，下一轮继续查询。
        });
    };

    const pollTimer = window.setInterval(
      pollPaymentStatus,
      PAYMENT_POLL_INTERVAL_MS,
    );

    pollPaymentStatus();

    return () => {
      cancelled = true;
      window.clearInterval(pollTimer);
    };
  }, [onPaymentSuccess, paymentOrder?.orderNo, paymentStep]);

  useEffect(() => {
    if (paymentStep !== 'qr' || !paymentOrder) {
      setPaymentCountdown(formatCountdownParts(0));
      return undefined;
    }

    const expireAt = getPaymentExpireAt(paymentOrder);

    if (!expireAt) {
      setPaymentCountdown(formatCountdownParts(0));
      return undefined;
    }

    const updateCountdown = () => {
      setPaymentCountdown(formatCountdownParts(expireAt - Date.now()));
    };

    updateCountdown();
    const countdownTimer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(countdownTimer);
  }, [
    paymentOrder?.closeTime,
    paymentOrder?.createTime,
    paymentOrder?.payParams?.orderTime,
    paymentStep,
  ]);

  const handlePaymentClose = () => {
    // setPaymentAgreementChecked(false);
    setPaymentOrder(undefined);
    setPaymentStep('idle');
    setPaymentCountdown(formatCountdownParts(0));
    successNotifiedOrderNoRef.current = '';
  };

  const handlePlanUpgrade = async (plan: UpgradePlan) => {
    if (creatingPlanKey) {
      return;
    }

    setCreatingPlanKey(plan.key);

    try {
      const nextOrder = await onUpgrade(plan);

      if (nextOrder?.orderNo) {
        // setPaymentAgreementChecked(false);
        setPaymentOrder(nextOrder);
        setPaymentStep(isPaymentSuccess(nextOrder) ? 'success' : 'qr');
        successNotifiedOrderNoRef.current = '';

        if (isPaymentSuccess(nextOrder)) {
          successNotifiedOrderNoRef.current = nextOrder.orderNo;
          onPaymentSuccess?.(nextOrder);
        }
      }
    } catch {
      antdMessage.error(I18N.carbonAgent.createOrderFailed);
    } finally {
      setCreatingPlanKey('');
    }
  };

  const handleMobilePlanSelect = (planKey: string) => {
    mobilePlanSelectionSourceRef.current = 'click';
    setSelectedPlanKey(planKey);
  };

  const handleMobilePlanScroll = () => {
    if (mobilePlanScrollFrameRef.current) {
      window.cancelAnimationFrame(mobilePlanScrollFrameRef.current);
    }

    mobilePlanScrollFrameRef.current = window.requestAnimationFrame(() => {
      const planList = mobilePlanListRef.current;

      if (!planList) {
        return;
      }

      const planCards = Array.from(
        planList.querySelectorAll<HTMLElement>('[data-plan-key]'),
      );
      const listBounds = planList.getBoundingClientRect();
      const listCenter = listBounds.left + listBounds.width / 2;
      const nearestPlan = planCards.reduce<{
        distance: number;
        key: string;
      } | null>((nearest, card) => {
        const cardBounds = card.getBoundingClientRect();
        const cardCenter = cardBounds.left + cardBounds.width / 2;
        const distance = Math.abs(cardCenter - listCenter);
        const key = card.dataset.planKey || '';

        if (!key || (nearest && nearest.distance <= distance)) {
          return nearest;
        }

        return {
          distance,
          key,
        };
      }, null);

      if (nearestPlan?.key) {
        mobilePlanSelectionSourceRef.current = 'scroll';
        setSelectedPlanKey(prevKey =>
          prevKey === nearestPlan.key ? prevKey : nearestPlan.key,
        );
      }
    });
  };

  const mobileUpgradeButton = (
    <button
      className={style.mobileUpgradeButton}
      type='button'
      disabled={
        !selectedPlanTeamConsult &&
        (selectedPlanDisabled || Boolean(creatingPlanKey))
      }
      onClick={() => {
        if (selectedPlan && !selectedPlanDisabled && !selectedPlanTeamConsult) {
          if (
            addonsActive &&
            isPointAddonPlan(selectedPlan) &&
            !agreementChecked
          ) {
            antdMessage.warning(I18N.components.pleaseReadFirstAnd);
            return;
          }

          handlePlanUpgrade(selectedPlan);
        }
      }}
    >
      {selectedPlanTeamConsult
        ? I18N.components.consultNow
        : selectedPlanCreating
        ? I18N.carbonAgent.creatingOrder
        : selectedPlanCurrent
        ? I18N.carbonAgent.currentPlan
        : getCommerceButtonText(selectedPlan, addonsActive)}
    </button>
  );

  const renderMembershipPlanGrid = () => (
    <div
      className={classNames(planStyle.grid, {
        [planStyle.enterpriseGrid]: planEdition === 'team',
      })}
      role='tabpanel'
      id={`agent-plans-panel-${planEdition}`}
      aria-labelledby={`agent-plans-tab-${planEdition}`}
    >
      {editionPlans.map(plan => {
        const enterprise = plan.tone === 'team';
        const current = Boolean(plan.current) || plan.key === currentPlanCode;
        const disabled = current || plan.purchaseEnabled === false;
        const creating = creatingPlanKey === plan.key;
        const primaryFeature = enterprise ? undefined : plan.features[0];
        const features = getFeatureItems(
          enterprise
            ? [
                teamText('professionalCarbonFootprintModelingAndReports'),
                teamText('centralizedMemberAndSeatManagement'),
                teamText('companyPointsPoolAndMonthlyLimits'),
                teamText('companyAdminConsole'),
                teamText('companySecurityAndAuditLogs'),
              ]
            : plan.features.slice(1),
        );

        return (
          <article
            className={classNames(planStyle.card, {
              [planStyle.personal]: plan.tone === 'personal',
              [planStyle.enterprise]: enterprise,
            })}
            key={plan.key}
          >
            <div className={planStyle.intro}>
              <header className={planStyle.header}>
                <h3>{enterprise ? teamText('enterprise') : plan.name}</h3>
                <p>
                  {enterprise
                    ? teamText(
                        'forCompaniesThatNeedTeamworkCentralizedManagement2',
                      )
                    : plan.description}
                </p>
              </header>
              <div className={planStyle.price}>
                <span className={planStyle.currency}>¥</span>
                <strong>{plan.price}</strong>
                {enterprise ? (
                  <span>{teamText('seatMonth2')}</span>
                ) : plan.priceSuffix ? (
                  <span>{plan.priceSuffix}</span>
                ) : null}
                {enterprise && <small>{teamText('startingFrom1Seat')}</small>}
              </div>
            </div>
            {enterprise ? (
              <a
                className={classNames(
                  planStyle.button,
                  planStyle.enterpriseButton,
                )}
                href={withCurrentLocalePrefix(
                  `${TEAM_PATH}/purchase?action=OPEN`,
                )}
                target='_blank'
                rel='noopener noreferrer'
              >
                {teamText('buyNow')}
              </a>
            ) : (
              <button
                className={classNames(planStyle.button, {
                  [planStyle.currentButton]: disabled,
                })}
                type='button'
                disabled={disabled || Boolean(creatingPlanKey)}
                onClick={() => handlePlanUpgrade(plan)}
              >
                {creating
                  ? I18N.carbonAgent.creatingOrder
                  : current
                  ? I18N.carbonAgent.currentPlan
                  : plan.buttonText}
              </button>
            )}
            <div className={planStyle.details}>
              <div className={planStyle.allowance}>
                <img src={planPointsIcon} alt='' />
                <span>
                  {enterprise && typeof plan.grantPoints === 'number' ? (
                    <>
                      {teamText('perSeatPerMonth')}{' '}
                      <strong>{getFormattedPoints(plan.grantPoints)}</strong>{' '}
                      {teamText('pointsValidForTheCurrentMonth')}
                    </>
                  ) : (
                    renderPlanPointLabel(plan)
                  )}
                </span>
              </div>
              {primaryFeature && (
                <div className={planStyle.summary}>
                  <p>
                    {plan.featureTitle ||
                      plan.quotaLabel ||
                      I18N.carbonAgent.atMost}
                  </p>
                  <div className={planStyle.feature}>
                    <img src={planCheckIcon} alt='' />
                    <span>{renderFeatureText(primaryFeature)}</span>
                  </div>
                </div>
              )}
              <ul className={planStyle.features}>
                {features.map(({ feature, key }) => (
                  <li className={planStyle.feature} key={key}>
                    <img src={planCheckIcon} alt='' />
                    <span>{renderFeatureText(feature)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        );
      })}
      {!editionPlans.length && (
        <div className={style.upgradeEmpty}>
          {I18N.carbonAgent.noSubscribablePlan}
        </div>
      )}
      {planEdition === 'team' && editionPlans.length > 0 && (
        <p className={planStyle.purchaseHint}>
          {teamText('enterprisePurchaseConfigurationOpensInANew')}
        </p>
      )}
    </div>
  );

  const renderAddonCard = (plan: UpgradePlan) => {
    const creating = creatingPlanKey === plan.key;
    const disabled = plan.purchaseEnabled === false;
    const pointAddon = isPointAddonPlan(plan);
    const title = pointAddon ? getAddonPointAmount(plan) : plan.name;
    const features = getFeatureItems(plan.features);

    return (
      <article className={style.addonCard} key={plan.key}>
        <div className={style.addonCardMain}>
          <div className={style.addonCardHeader}>
            <span
              className={classNames(style.addonCardIcon, {
                [style.addonCardIconService]: !pointAddon,
              })}
              aria-hidden='true'
            />
            <h3>{title}</h3>
          </div>
          <p>{plan.description}</p>
        </div>

        {features.length ? (
          <ul className={style.addonFeatureList}>
            {features.map(({ feature, key }) => (
              <li className={style.planFeatureItem} key={key}>
                {renderFeatureText(feature)}
              </li>
            ))}
          </ul>
        ) : null}

        <div className={style.addonPrice}>
          <span className={style.planCurrency}>¥</span>
          <strong>{plan.price}</strong>
          {plan.priceSuffix ? <span>{plan.priceSuffix}</span> : null}
        </div>

        <button
          className={style.addonButton}
          type='button'
          disabled={disabled || Boolean(creatingPlanKey)}
          onClick={() => handlePlanUpgrade(plan)}
        >
          {creating
            ? I18N.carbonAgent.creatingOrder
            : getCommerceButtonText(plan, true)}
        </button>
      </article>
    );
  };

  const renderAddonSection = ({
    plans: sectionPlans,
    subtitle,
    title,
    wide = false,
  }: {
    plans: UpgradePlan[];
    subtitle: string;
    title: string;
    wide?: boolean;
  }) =>
    sectionPlans.length ? (
      <section className={style.addonSection}>
        <div className={style.addonSectionHeader}>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div
          className={classNames(style.addonGrid, {
            [style.addonGridWide]: wide,
          })}
        >
          {sectionPlans.map(renderAddonCard)}
        </div>
      </section>
    ) : null;

  if (!open) {
    return null;
  }

  // The animated mobile sidebar creates a containing block for fixed children.
  // Mount this overlay outside it so the dialog covers the viewport.
  return createPortal(
    <div className={style.upgradeDialogBackdrop}>
      <button
        className={style.upgradeDialogScrim}
        type='button'
        aria-label={I18N.carbonAgent.closeUpgradeDialog}
        onClick={onClose}
      />
      <section
        className={classNames(style.upgradeDialog, {
          [planStyle.dialog]: plansActive,
          [style.upgradeDialogInvite]: inviteActive,
        })}
        role='dialog'
        aria-modal='true'
        aria-labelledby={dialogTitleId}
      >
        <button
          className={style.upgradeClose}
          type='button'
          aria-label={I18N.carbonAgent.closeUpgradeDialog}
          onClick={onClose}
        />
        <aside className={style.upgradeNav}>
          <div className={style.upgradeNavGroups}>
            {personalWorkspace && (
              <>
                <div className={style.upgradeNavGroup}>
                  <div className={style.upgradeNavTitle}>
                    {I18N.carbonAgent.mall}
                  </div>
                  <button
                    className={classNames(style.upgradeNavItem, {
                      [style.upgradeNavItemActive]: plansActive,
                    })}
                    type='button'
                    onClick={() => setActiveTab('plans')}
                  >
                    <span className={style.upgradeNavIcon}>
                      <Icon
                        className={classNames(
                          style.upgradeNavImageIcon,
                          style.navPlanImageIcon,
                        )}
                        src={icons.navPlanIcon}
                      />
                    </span>
                    <span>{I18N.carbonAgent.planSubscription}</span>
                  </button>
                  <button
                    className={classNames(style.upgradeNavItem, {
                      [style.upgradeNavItemActive]: addonsActive,
                    })}
                    type='button'
                    onClick={() => setActiveTab('addons')}
                  >
                    <span className={style.upgradeNavIcon}>
                      <Icon
                        className={classNames(
                          style.upgradeNavImageIcon,
                          style.navAddonImageIcon,
                        )}
                        src={icons.navAddonIcon}
                      />
                    </span>
                    <span>{I18N.carbonAgent.pointsRecharge}</span>
                  </button>
                  <button
                    className={classNames(style.upgradeNavItem, {
                      [style.upgradeNavItemActive]: inviteActive,
                    })}
                    type='button'
                    onClick={() => setActiveTab('invite')}
                  >
                    <span className={style.upgradeNavIcon}>
                      <UserAddOutlined />
                    </span>
                    <span>{I18N.carbonAgent.inviteFriends}</span>
                  </button>
                </div>
                <div className={style.upgradeNavGroup}>
                  <div className={style.upgradeNavTitle}>
                    {I18N.carbonAgent.bills}
                  </div>
                  <button
                    className={classNames(style.upgradeNavItem, {
                      [style.upgradeNavItemActive]: ordersActive,
                    })}
                    type='button'
                    onClick={() => setActiveTab('orders')}
                  >
                    <span className={style.upgradeNavIcon}>
                      <Icon
                        className={classNames(
                          style.upgradeNavImageIcon,
                          style.navOrderImageIcon,
                        )}
                        src={icons.navOrderIcon}
                      />
                    </span>
                    <span>{I18N.carbonAgent.profileOrders}</span>
                  </button>
                  <button
                    className={classNames(style.upgradeNavItem, {
                      [style.upgradeNavItemActive]: invoicesActive,
                    })}
                    type='button'
                    onClick={() => setActiveTab('invoices')}
                  >
                    <span className={style.upgradeNavIcon}>
                      <Icon
                        className={classNames(
                          style.upgradeNavImageIcon,
                          style.navInvoiceImageIcon,
                        )}
                        src={icons.navInvoiceIcon}
                      />
                    </span>
                    <span>{I18N.carbonAgent.profileInvoices}</span>
                  </button>
                  <button
                    className={classNames(style.upgradeNavItem, {
                      [style.upgradeNavItemActive]: pointsActive,
                    })}
                    type='button'
                    onClick={() => setActiveTab('points')}
                  >
                    <span className={style.upgradeNavIcon}>
                      <Icon
                        className={classNames(
                          style.upgradeNavImageIcon,
                          style.navPointsImageIcon,
                        )}
                        src={icons.navPointsIcon}
                      />
                    </span>
                    <span>{I18N.carbonAgent.profilePoints}</span>
                  </button>
                </div>
              </>
            )}
            <div className={style.upgradeNavGroup}>
              <div className={style.upgradeNavTitle}>
                {I18N.carbonAgent.settings}
              </div>
              <button
                className={classNames(style.upgradeNavItem, {
                  [style.upgradeNavItemActive]: settingsActive,
                })}
                type='button'
                onClick={() => setActiveTab('settings')}
              >
                <span className={style.upgradeNavIcon}>
                  <Icon
                    className={classNames(
                      style.upgradeNavImageIcon,
                      style.navSettingsImageIcon,
                    )}
                    src={icons.navSettingsIcon}
                  />
                </span>
                <span>{I18N.carbonAgent.profileSettings}</span>
              </button>
              {personalWorkspace && (
                <>
                  <button
                    className={classNames(style.upgradeNavItem, {
                      [style.upgradeNavItemActive]: apiKeysActive,
                    })}
                    type='button'
                    onClick={() => setActiveTab('apiKeys')}
                  >
                    <span className={style.upgradeNavIcon}>
                      <KeyOutlined />
                    </span>
                    <span>{I18N.ccdb.apiKeyManagement}</span>
                  </button>
                  <button
                    className={classNames(style.upgradeNavItem, {
                      [style.upgradeNavItemActive]: authorizationsActive,
                    })}
                    type='button'
                    onClick={() => setActiveTab('authorizations')}
                  >
                    <span className={style.upgradeNavIcon}>
                      <SafetyCertificateOutlined />
                    </span>
                    <span>{I18N.ccdb.authorizationManagement}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>

        <main
          className={classNames(style.upgradeContent, {
            [planStyle.content]: plansActive,
            [style.upgradeContentAddons]: addonsActive,
            [style.upgradeContentInvite]: inviteActive,
            [style.upgradeContentOrders]: panelActive,
            [style.upgradeContentSettings]: settingsActive || accessActive,
            [style.upgradeContentAccess]: accessActive,
          })}
        >
          {commerceActive ? (
            <>
              <h2
                className={classNames(style.upgradeTitle, {
                  [planStyle.title]: plansActive,
                })}
                id={
                  plansActive
                    ? 'carbon-agent-upgrade-title'
                    : 'carbon-agent-addon-title'
                }
              >
                {I18N.carbonAgent.upgradeYourPlan}
              </h2>
              {plansActive && (
                <div
                  className={planStyle.tabs}
                  role='tablist'
                  aria-label={teamText('planType')}
                >
                  {(['personal', 'team'] as const).map((edition, index) => (
                    <button
                      key={edition}
                      ref={node => {
                        editionTabs.current[index] = node;
                      }}
                      type='button'
                      role='tab'
                      id={`agent-plans-tab-${edition}`}
                      aria-selected={planEdition === edition}
                      aria-controls={`agent-plans-panel-${edition}`}
                      tabIndex={planEdition === edition ? 0 : -1}
                      onClick={() => setPlanEdition(edition)}
                      onKeyDown={event => {
                        if (
                          !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(
                            event.key,
                          )
                        )
                          return;
                        event.preventDefault();
                        const next =
                          event.key === 'Home'
                            ? 0
                            : event.key === 'End'
                            ? 1
                            : 1 - index;
                        setPlanEdition(next === 0 ? 'personal' : 'team');
                        editionTabs.current[next]?.focus();
                      }}
                    >
                      {edition === 'personal'
                        ? teamText('personal2')
                        : teamText('enterprise')}
                    </button>
                  ))}
                </div>
              )}
              {activeCommerceLoading ? (
                <div className={style.upgradeLoading} role='status'>
                  {I18N.carbonAgent.loadingPlanInfo}
                </div>
              ) : plansActive && displayPlans.length ? (
                renderMembershipPlanGrid()
              ) : addonsActive && displayAddonPlans.length ? (
                <div className={style.addonContent}>
                  {renderAddonSection({
                    plans: addonPointPlans,
                    subtitle: I18N.carbonAgent.addonPointsSubtitle,
                    title: I18N.carbonAgent.pointsPackage,
                  })}
                  {renderAddonSection({
                    plans: addonServicePlans,
                    subtitle: I18N.carbonAgent.expertServiceSubtitle,
                    title: I18N.carbonAgent.expertService,
                    wide: true,
                  })}
                </div>
              ) : (
                <div className={style.upgradeEmpty}>
                  {activeCommerceEmptyText}
                </div>
              )}
            </>
          ) : (
            <>
              {ordersActive ? (
                <OrderManagementPanel active={open && ordersActive} />
              ) : null}
              {inviteActive ? (
                <InviteFriendPanel
                  active={open && inviteActive}
                  source='agent_web'
                />
              ) : null}
              {invoicesActive ? (
                <InvoiceManagementPanel active={open && invoicesActive} />
              ) : null}
              {pointsActive ? (
                <PointsRecordPanel active={open && pointsActive} />
              ) : null}
              {settingsActive ? (
                <PersonalSettingsPanel active={open && settingsActive} />
              ) : null}
              {apiKeysActive ? (
                <CcdbApiKeyPanel active={open && apiKeysActive} />
              ) : null}
              {authorizationsActive ? (
                <CcdbAuthorizationPanel active={open && authorizationsActive} />
              ) : null}
            </>
          )}
        </main>
        <main
          className={style.mobileUpgradeContent}
          aria-labelledby='carbon-agent-mobile-upgrade-title'
        >
          <header className={style.mobileUpgradeHeader}>
            <button
              className={style.mobileUpgradeNavButton}
              type='button'
              aria-label={
                ordersActive ? I18N.carbonAgent.back : I18N.carbonAgent.openMenu
              }
              onClick={
                ordersActive ? onMobileBackToPersonalCenter || onClose : onClose
              }
            >
              {ordersActive ? (
                <Icon
                  className={style.mobileUpgradeBackIcon}
                  src={icons.chevronIcon}
                />
              ) : (
                <span
                  className={style.mobileHeaderMenuIcon}
                  aria-hidden='true'
                />
              )}
            </button>
            <h2 id='carbon-agent-mobile-upgrade-title'>{mobileDialogTitle}</h2>
            <span className={style.mobileUpgradeHeaderSpacer} />
          </header>

          {commerceActive ? (
            <nav
              className={style.mobileUpgradeTabs}
              aria-label={I18N.carbonAgent.personalCenter}
            >
              <button
                className={classNames(style.mobileUpgradeTab, {
                  [style.mobileUpgradeTabActive]: plansActive,
                })}
                type='button'
                onClick={() => setActiveTab('plans')}
              >
                {I18N.carbonAgent.planSubscription}
              </button>
              <button
                className={classNames(style.mobileUpgradeTab, {
                  [style.mobileUpgradeTabActive]: addonsActive,
                })}
                type='button'
                onClick={() => setActiveTab('addons')}
              >
                {I18N.carbonAgent.pointsRecharge}
              </button>
            </nav>
          ) : null}

          <div
            className={classNames(style.mobileUpgradeBody, {
              [style.mobileUpgradeBodyOrders]: panelActive,
            })}
          >
            {commerceActive ? (
              <>
                {plansActive &&
                  displayPlans.some(plan => plan.tone === 'team') && (
                    <p className={planStyle.mobileEnterpriseHint}>
                      {teamText('useADesktopBrowserToPurchaseThe')}
                    </p>
                  )}
                {activeCommerceLoading && !activeCommercePlans.length ? (
                  <div className={style.mobileUpgradeState} role='status'>
                    {I18N.carbonAgent.loadingPlanInfo}
                  </div>
                ) : null}

                {!activeCommerceLoading && !activeCommercePlans.length ? (
                  <div className={style.mobileUpgradeState}>
                    {activeCommerceEmptyText}
                  </div>
                ) : null}

                {activeCommercePlans.length ? (
                  <>
                    <div
                      className={style.mobileUpgradePlanList}
                      ref={mobilePlanListRef}
                      aria-label={
                        addonsActive
                          ? I18N.carbonAgent.addonListLabel
                          : I18N.carbonAgent.planListLabel
                      }
                      onScroll={handleMobilePlanScroll}
                    >
                      {activeCommercePlans.map(plan => {
                        const selected = plan.key === selectedPlan?.key;
                        const mobilePlanClass = addonsActive
                          ? style.mobileUpgradePlanAddon
                          : mobilePlanToneClassMap[plan.tone];

                        return (
                          <button
                            className={classNames(
                              style.mobileUpgradePlanCard,
                              mobilePlanClass,
                              {
                                [style.mobileUpgradePlanSelected]: selected,
                              },
                            )}
                            key={plan.key}
                            type='button'
                            data-plan-key={plan.key}
                            aria-pressed={selected}
                            onClick={() => handleMobilePlanSelect(plan.key)}
                          >
                            {plan.badgeText ? (
                              <span className={style.mobileUpgradeRecommend}>
                                {plan.badgeText}
                              </span>
                            ) : null}
                            <div className={style.mobileUpgradePlanTitle}>
                              <span
                                className={style.mobileUpgradeSparkle}
                                aria-hidden='true'
                              />
                              <h3
                                className={
                                  !addonsActive
                                    ? classNames(
                                        style.planTitleBadge,
                                        planTitleToneClassMap[plan.tone],
                                      )
                                    : undefined
                                }
                              >
                                {addonsActive && isPointAddonPlan(plan)
                                  ? getAddonPointAmount(plan)
                                  : plan.name}
                              </h3>
                            </div>
                            <p>{plan.description}</p>
                            <div
                              className={classNames(style.mobileUpgradePrice, {
                                [style.mobileUpgradePriceCustom]:
                                  plansActive && isTeamConsultPlan(plan),
                              })}
                            >
                              {plansActive && isTeamConsultPlan(plan) ? (
                                <strong>{I18N.carbonAgent.customOption}</strong>
                              ) : (
                                <>
                                  <span>¥</span>
                                  <strong>{plan.price}</strong>
                                  {plan.price !== '0' && plan.priceSuffix ? (
                                    <span>{plan.priceSuffix}</span>
                                  ) : null}
                                </>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <section
                      className={style.mobileUpgradeBenefits}
                      aria-label={
                        addonsActive
                          ? I18N.carbonAgent.purchaseContent
                          : I18N.carbonAgent.memberBenefits
                      }
                    >
                      <div className={style.mobileUpgradeBenefitsTitle}>
                        <span />
                        <h3>
                          {addonsActive
                            ? I18N.carbonAgent.purchaseContent
                            : I18N.carbonAgent.memberBenefits}
                        </h3>
                        <span />
                      </div>

                      <div className={style.mobileUpgradeStats}>
                        <div className={style.mobileUpgradeStatCard}>
                          <span>
                            {addonsActive
                              ? selectedAddonPrimaryInfo.label
                              : getPointPeriodLabel(selectedPlan)}
                          </span>
                          <strong>
                            {addonsActive
                              ? selectedAddonPrimaryInfo.value
                              : getAllowanceValue(selectedPlan)}
                          </strong>
                        </div>
                        <div className={style.mobileUpgradeStatCard}>
                          <span>
                            {addonsActive
                              ? I18N.carbonAgent.applicableScene
                              : selectedPlan?.featureTitle ||
                                selectedPlan?.quotaLabel ||
                                I18N.carbonAgent.atMost}
                          </span>
                          <strong>
                            {addonsActive
                              ? selectedPlan?.description ||
                                I18N.carbonAgent.byPurchaseConfig
                              : getReportValue(selectedPlanFeatures)}
                          </strong>
                        </div>
                      </div>

                      <ul className={style.mobileUpgradeFeatureList}>
                        {getFeatureItems(selectedPlanFeatures).map(
                          ({ feature, key }) => (
                            <li key={key}>
                              <span aria-hidden='true' />
                              <span className={style.mobileUpgradeFeatureText}>
                                {renderFeatureText(feature)}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </section>

                    <footer className={style.mobileUpgradeFooter}>
                      {selectedPlanTeamConsult ? (
                        <CustomerServicePopover
                          placement='top'
                          trigger={['click']}
                        >
                          {mobileUpgradeButton}
                        </CustomerServicePopover>
                      ) : (
                        mobileUpgradeButton
                      )}
                      <label
                        className={style.mobileUpgradeAgreement}
                        htmlFor={mobileAgreementId}
                      >
                        <input
                          id={mobileAgreementId}
                          type='checkbox'
                          checked={agreementChecked}
                          onChange={event =>
                            setAgreementChecked(event.target.checked)
                          }
                        />
                        <span>{I18N.carbonAgent.agreementPrefix}</span>
                        <a
                          href='/agreement?service'
                          target='_blank'
                          rel='noreferrer'
                        >
                          {I18N.carbonAgent.serviceAgreement}
                        </a>
                      </label>
                    </footer>
                  </>
                ) : null}
              </>
            ) : (
              <>
                {ordersActive ? (
                  <OrderManagementPanel
                    active={open && ordersActive}
                    mobile
                    showTitle={false}
                  />
                ) : null}
                {inviteActive ? (
                  <InviteFriendPanel
                    active={open && inviteActive}
                    showTitle={false}
                    source='agent_h5'
                  />
                ) : null}
                {invoicesActive ? (
                  <InvoiceManagementPanel
                    active={open && invoicesActive}
                    mobile
                    showTitle={false}
                  />
                ) : null}
                {pointsActive ? (
                  <PointsRecordPanel
                    active={open && pointsActive}
                    mobile
                    showTitle={false}
                  />
                ) : null}
                {settingsActive ? (
                  <PersonalSettingsPanel
                    active={open && settingsActive}
                    showTitle={false}
                  />
                ) : null}
                {apiKeysActive ? (
                  <CcdbApiKeyPanel
                    active={open && apiKeysActive}
                    showTitle={false}
                  />
                ) : null}
                {authorizationsActive ? (
                  <CcdbAuthorizationPanel
                    active={open && authorizationsActive}
                    showTitle={false}
                  />
                ) : null}
              </>
            )}
          </div>
        </main>
      </section>
      {paymentStep !== 'idle' && paymentOrder ? (
        <div className={style.paymentLayer}>
          <section
            className={classNames(style.paymentDialog, {
              [style.paymentSuccessDialog]: paymentStep === 'success',
            })}
            role='dialog'
            aria-modal='true'
            aria-labelledby='carbon-agent-payment-title'
          >
            <header className={style.paymentHeader}>
              <h3
                className={style.paymentTitle}
                id='carbon-agent-payment-title'
              >
                {paymentStep === 'success'
                  ? I18N.carbonAgent.paymentComplete
                  : I18N.carbonAgent.scanToPay}
              </h3>
              <button
                className={style.paymentClose}
                type='button'
                aria-label={I18N.carbonAgent.closePaymentDialog}
                onClick={handlePaymentClose}
              />
            </header>

            {paymentStep === 'qr' ? (
              <div className={style.paymentBody}>
                <div className={style.paymentMethodRow}>
                  <span className={style.paymentMethodLabel}>
                    {I18N.carbonAgent.paymentMethod}
                  </span>
                  <div className={style.paymentMethodOptions}>
                    <label
                      className={style.paymentMethodOption}
                      htmlFor='agent-plan-payment-method-wechat'
                    >
                      <input
                        id='agent-plan-payment-method-wechat'
                        type='radio'
                        name='agent-plan-payment-method'
                        checked
                        readOnly
                      />
                      <span className={style.paymentRadioMark} />
                      <span>{I18N.carbonAgent.wechatPay}</span>
                    </label>
                    {/* <label
                      className={classNames(
                        style.paymentMethodOption,
                        style.paymentMethodOptionDisabled,
                      )}
                      htmlFor='agent-plan-payment-method-transfer'
                    >
                      <input
                        id='agent-plan-payment-method-transfer'
                        type='radio'
                        name='agent-plan-payment-method'
                        disabled
                      />
                      <span className={style.paymentRadioMark} />
                      <span>对公转账</span>
                    </label> */}
                  </div>
                </div>

                <div className={style.paymentAmountSection}>
                  <div className={style.paymentAmount}>
                    <span>¥</span>
                    <strong>{formatPaymentAmount(paymentAmount)}</strong>
                  </div>
                  <div className={style.paymentCountdown}>
                    <span>{I18N.carbonAgent.paymentTimeLeft}</span>
                    <b>{paymentCountdown.hours}</b>
                    <i>:</i>
                    <b>{paymentCountdown.minutes}</b>
                    <i>:</i>
                    <b>{paymentCountdown.seconds}</b>
                  </div>
                </div>

                <div className={style.paymentQrSection}>
                  <div className={style.paymentQrBox}>
                    {paymentQrCodeValue ? (
                      <QRCode
                        value={paymentQrCodeValue}
                        size={130}
                        level='H'
                        fgColor='#000000'
                        imageSettings={{
                          src: wechatPayIcon,
                          height: 24,
                          width: 24,
                          excavate: true,
                        }}
                      />
                    ) : (
                      <span className={style.paymentQrEmpty}>
                        {I18N.carbonAgent.generatingQrCode}
                      </span>
                    )}
                  </div>
                  {/* <label
                    className={style.paymentAgreement}
                    htmlFor='agent-plan-payment-agreement'
                  >
                    <input
                      id='agent-plan-payment-agreement'
                      type='checkbox'
                      checked={paymentAgreementChecked}
                      onChange={event =>
                        setPaymentAgreementChecked(event.target.checked)
                      }
                    />
                    <span>
                      我已阅读并同意
                      <a
                        href='/agreement?service'
                        target='_blank'
                        rel='noreferrer'
                      >
                        《服务协议》
                      </a>
                    </span>
                  </label> */}
                </div>
              </div>
            ) : (
              <div className={style.paymentSuccessBody}>
                <div className={style.paymentSuccessSummary}>
                  <img
                    className={style.paymentSuccessIcon}
                    src={icons.successIcon}
                    alt=''
                  />
                  <strong>{I18N.carbonAgent.paymentSuccess}</strong>
                </div>
                <div className={style.paymentSuccessDetails}>
                  <div>
                    <span>{I18N.carbonAgent.paymentAmountLabel}</span>
                    <strong>
                      {I18N.template(I18N.carbonAgent.amountYuan, {
                        val1: formatPaymentAmount(paymentAmount),
                      })}
                    </strong>
                  </div>
                  <div>
                    <span>{I18N.carbonAgent.paymentTime}</span>
                    <strong>{paymentOrder.payTime || '--'}</strong>
                  </div>
                </div>
                <div className={style.paymentSuccessActions}>
                  <button
                    className={style.paymentPrimaryButton}
                    type='button'
                    onClick={() => {
                      handlePaymentClose();
                      setActiveTab('orders');
                    }}
                  >
                    {I18N.carbonAgent.viewOrder}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>,
    document.body,
  );
};

export default UpgradePlanDialog;
