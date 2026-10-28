import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Spin,
} from 'antd';
import QRCode from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { PaymentPeriods, TeamPayment } from './TeamPayment';
import { teamApi } from './api';
import managementIcon from './assets/management.svg';
import pointsIcon from './assets/points.svg';
import seatMinusIcon from './assets/seat-minus.svg';
import seatPlusIcon from './assets/seat-plus.svg';
import securityIcon from './assets/security.svg';
import { errorCode, errorText } from './errors';
import {
  isQuoteValid,
  quoteMatches,
  createOrRecoverTeamOrder,
  shouldPollPointOrder,
  money,
  requestKey,
  TEAM_PATH,
} from './helpers';
import { teamText } from './i18n';
import style from './team.module.less';
import type {
  PointOrder,
  PurchaseAction,
  Quote,
  TeamOrder,
  PriceLine,
} from './types';
import { PageTitle, QueryState, Status } from './ui';
import { useWorkspace } from './workspace';

export const Purchase = () => {
  const location = useLocation();
  // A fresh purchase navigation always starts from configuration, even when
  // navigating between OPEN, RENEW and EXPAND on the same route component.
  return <PurchaseConfiguration key={location.key || location.search} />;
};
const PurchaseConfiguration = () => {
  const { key, personal, switchSpace } = useWorkspace();
  const history = useHistory();
  const location = useLocation();
  const requestedAction = new URLSearchParams(location.search).get('action');
  const action: PurchaseAction =
    requestedAction === 'EXPAND' || requestedAction === 'RENEW'
      ? requestedAction
      : 'OPEN';
  const summary = useQuery([...key, 'summary'], teamApi.summary);
  const plans = useQuery([...key, 'plans'], () => teamApi.plans('membership'));
  const [quantity, setQuantity] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [quote, setQuote] = useState<Quote>();
  const [confirmed, setConfirmed] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<{
    order: TeamOrder;
    periods: PriceLine[];
  }>();
  const [attemptedQuoteId, setAttemptedQuoteId] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [retryQuote, setRetryQuote] = useState(0);
  const [, tick] = useState(0);
  const submitLock = useRef(false);
  const effectiveQuantity =
    action === 'RENEW' ? summary.data?.renewalSeats || 0 : quantity;
  const teamPlan = plans.data?.find(plan => plan.planCode === 'team');
  const maxQuantity =
    action === 'EXPAND'
      ? Math.min(1000, 10000 - (summary.data?.totalSeats || 0))
      : 1000;
  const updateQuantity = (value: number | null) => {
    if (submitLock.current || (value || 1) === quantity) return;
    setAttemptedQuoteId(undefined);
    setConfirmed(false);
    setQuote(undefined);
    setQuantity(value || 1);
  };
  const nameRequired = personal && action === 'OPEN';
  const boundTeam = personal ? summary.data?.boundTeamCompanyId : undefined;
  const summaryReady = !!summary.data;
  useEffect(() => {
    const timer = window.setInterval(() => tick(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    setQuote(undefined);
    setAttemptedQuoteId(undefined);
    setConfirmed(false);
    setError('');
    setQuoting(false);
    if (
      !summaryReady ||
      boundTeam ||
      !effectiveQuantity ||
      (nameRequired && (!companyName.trim() || companyName.trim().length > 100))
    )
      return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setQuoting(true);
      try {
        const result = await teamApi.quote(
          {
            action,
            quantity: effectiveQuantity,
            ...(nameRequired ? { companyName: companyName.trim() } : {}),
          },
          controller.signal,
        );
        if (!controller.signal.aborted) setQuote(result);
      } catch (failure) {
        if (!controller.signal.aborted) setError(errorText(failure));
      } finally {
        if (!controller.signal.aborted) setQuoting(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    action,
    effectiveQuantity,
    companyName,
    nameRequired,
    summaryReady,
    boundTeam,
    retryQuote,
  ]);
  const submit = async () => {
    if (
      submitLock.current ||
      !confirmed ||
      !quote ||
      !(
        attemptedQuoteId === quote.quoteId ||
        quoteMatches(
          quote,
          action,
          effectiveQuantity,
          nameRequired ? companyName : undefined,
        )
      )
    )
      return;
    submitLock.current = true;
    setSubmitting(true);
    setAttemptedQuoteId(quote.quoteId);
    setError('');
    try {
      const result = await createOrRecoverTeamOrder(quote.quoteId, teamApi);
      setPayment({ order: result, periods: quote.periods });
      setRetryQuote(value => value + 1);
    } catch (failure) {
      setError(errorText(failure));
      if (errorCode(failure) === 'AGENT_QUOTE_EXPIRED') {
        setQuote(undefined);
        setConfirmed(false);
        setRetryQuote(value => value + 1);
      }
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };
  if (boundTeam)
    return (
      <Alert
        type='info'
        message={teamText('youAlreadyHaveATeamEnterThe')}
        action={
          <Button
            onClick={() =>
              switchSpace(String(boundTeam), `${TEAM_PATH}/overview`)
            }
          >
            {teamText('enterTeam')}
          </Button>
        }
      />
    );
  return (
    <>
      <PageTitle
        title={
          action === 'OPEN'
            ? teamText('configureYourEnterprisePlan')
            : action === 'EXPAND'
            ? teamText('addSeats')
            : teamText('renewSubscription')
        }
        description={teamText('monthlySubscriptionFeesAndPointsGrantsAre')}
      />
      <QueryState query={summary}>
        <QueryState query={plans}>
          {error && (
            <Alert
              type='warning'
              showIcon
              message={error}
              style={{ marginBottom: 16 }}
            />
          )}
          <div className={style.purchase}>
            <section>
              <h3 className={style.sectionTitle}>{teamText('beforeYouBuy')}</h3>
              <div className={style.features}>
                {[
                  {
                    icon: managementIcon,
                    title: teamText('centralizedManagement'),
                    text: teamText(
                      'companyAdministratorsManageMembersSeatsAndPoints',
                    ),
                  },
                  {
                    icon: pointsIcon,
                    title: teamText('sharedPoints'),
                    text: teamText('teamMembersShareAPointsPoolThat'),
                  },
                  {
                    icon: securityIcon,
                    title: teamText('securityAndCompliance'),
                    text: teamText('allOperationsAreLoggedAndTraceableTo'),
                  },
                ].map(item => (
                  <div key={item.title}>
                    <img src={item.icon} alt='' />
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
              <h3 className={style.sectionTitle}>{teamText('chooseAPlan')}</h3>
              <div className={style.plan}>
                <h2>{teamText('carbonAgentEnterprise')}</h2>
                <p>
                  {teamText(
                    'forCompaniesThatNeedTeamworkCentralizedManagement',
                  )}
                </p>
                <strong>{money(teamPlan?.priceAmount)}</strong>{' '}
                {teamText('seatMonth')}
                <p className={style.planGift}>
                  {teamText('perSeatPerMonth')}
                  {teamPlan?.grantPoints ?? '—'} {teamText('points')}
                </p>
                <div className={style.planBenefits}>
                  {[
                    teamText('carbonKnowledgeQA'),
                    teamText('newsAndInformation'),
                    teamText('carbonEmissionsEstimates'),
                    teamText('endToEndModelingAndReporting'),
                    teamText('advancedEmissionFactorsIncludingEcoinvent'),
                    teamText('centralizedMemberAndSeatManagement'),
                    teamText('sharedPointsPoolAndUsageManagement'),
                    teamText('companySecurityAndAuditLogs'),
                  ].map(benefit => (
                    <span key={benefit}>✓ {benefit}</span>
                  ))}
                </div>
              </div>
              <h3 className={style.sectionTitle}>
                {teamText('companyInformation')}
              </h3>
              {nameRequired ? (
                <Form layout='vertical' className={style.purchaseCompanyForm}>
                  <Form.Item label={teamText('companyName')} required>
                    <Input
                      maxLength={100}
                      disabled={submitting}
                      value={companyName}
                      onChange={event => {
                        setAttemptedQuoteId(undefined);
                        setConfirmed(false);
                        setQuote(undefined);
                        setCompanyName(event.target.value);
                      }}
                      placeholder={teamText('enterANewTeamName')}
                    />
                  </Form.Item>
                </Form>
              ) : (
                <p>
                  {teamText('currentCompany')}
                  {summary.data?.companyName}
                </p>
              )}
            </section>
            <section className={style.purchaseSummary}>
              <h3>{teamText('configurationSummary')}</h3>
              <dl className={style.purchaseConfiguration}>
                <div>
                  <dt>{teamText('subscriptionPlan')}</dt>
                  <dd>{teamText('carbonAgentEnterprise')}</dd>
                </div>
                <div>
                  <dt>{teamText('pricePerSeat')}</dt>
                  <dd>
                    {money(teamPlan?.priceAmount)} {teamText('seatMonth')}
                  </dd>
                </div>
                <div>
                  <dt>
                    {action === 'EXPAND'
                      ? teamText('additionalSeats')
                      : teamText('numberOfSeats')}
                  </dt>
                  <dd className={style.seatQuantity}>
                    <div className={style.seatStepper}>
                      <Button
                        type='text'
                        aria-label={teamText('decreaseSeats')}
                        disabled={action === 'RENEW' || effectiveQuantity <= 1}
                        onClick={() => updateQuantity(effectiveQuantity - 1)}
                      >
                        <img src={seatMinusIcon} alt='' />
                      </Button>
                      <InputNumber
                        aria-label={teamText('numberOfSeats')}
                        min={1}
                        max={maxQuantity}
                        precision={0}
                        controls={false}
                        disabled={submitting || action === 'RENEW'}
                        value={effectiveQuantity}
                        onChange={updateQuantity}
                      />
                      <Button
                        type='text'
                        aria-label={teamText('increaseSeats')}
                        disabled={
                          action === 'RENEW' || effectiveQuantity >= maxQuantity
                        }
                        onClick={() => updateQuantity(effectiveQuantity + 1)}
                      >
                        <img src={seatPlusIcon} alt='' />
                      </Button>
                    </div>
                    <span>{teamText('seats2')}</span>
                  </dd>
                </div>
                <div>
                  <dt>{teamText('billingCycle')}</dt>
                  <dd>{teamText('monthly')}</dd>
                </div>
                <div>
                  <dt>
                    {action === 'EXPAND'
                      ? teamText('seatExpansionFee')
                      : teamText('subscriptionFee')}
                  </dt>
                  <dd aria-live='polite'>
                    {quoting ? <Spin size='small' /> : money(quote?.amount)}
                  </dd>
                </div>
              </dl>
              <div className={style.purchaseQuote}>
                <div className={style.quoteTotal}>
                  <span>{teamText('totalPrice')}</span>
                  <div className={style.quoteAmount} aria-live='polite'>
                    {quote ? (
                      <>
                        <span>¥</span>
                        <strong>{Number(quote.amount).toFixed(2)}</strong>
                      </>
                    ) : (
                      <strong>—</strong>
                    )}
                  </div>
                </div>
                <p className={style.quoteDescription}>
                  {quote
                    ? teamText('includesValuePointsValueSeatsAfterActivation', {
                        value0: quote.giftPoints.toLocaleString('zh-CN'),
                        value1: quote.resultingQuantity,
                      })
                    : nameRequired && !companyName.trim()
                    ? teamText('enterTheCompanyNameToGetA')
                    : quoting
                    ? teamText('gettingYourQuote')
                    : teamText('getAQuoteThenCheckYourPurchase')}
                </p>
                {quote && (
                  <Modal
                    title={teamText('feesAndPeriods')}
                    className={style.teamModal}
                    open={detailsOpen}
                    onCancel={() => setDetailsOpen(false)}
                    footer={null}
                    width={560}
                    centered
                  >
                    <PaymentPeriods periods={quote.periods} />
                  </Modal>
                )}
                {quote && !isQuoteValid(quote) && (
                  <Alert
                    type='warning'
                    message={
                      attemptedQuoteId === quote.quoteId
                        ? teamText('thisQuoteHasExpiredIfThePrevious')
                        : teamText('thisQuoteHasExpiredGetANew')
                    }
                  />
                )}
              </div>
              <div className={style.purchaseActions}>
                <Button
                  type='primary'
                  block
                  loading={submitting}
                  disabled={
                    !quote ||
                    !confirmed ||
                    (!isQuoteValid(quote) &&
                      attemptedQuoteId !== quote?.quoteId)
                  }
                  onClick={submit}
                >
                  {teamText('confirmPurchaseConfiguration')}
                </Button>
                <div className={style.purchaseConfirmation}>
                  <Checkbox
                    aria-label={teamText('iHaveCheckedTheFeesSeatsAnd')}
                    checked={confirmed}
                    disabled={
                      !quote ||
                      submitting ||
                      (!isQuoteValid(quote) &&
                        attemptedQuoteId !== quote?.quoteId)
                    }
                    onChange={event => setConfirmed(event.target.checked)}
                  >
                    {teamText('iHaveCheckedThePurchaseConfiguration')}
                  </Checkbox>
                  <a
                    href='/agreement?service'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {teamText('serviceAgreement')}
                  </a>
                </div>
                <div className={style.purchaseSecondaryActions}>
                  <Button
                    type='link'
                    size='small'
                    disabled={!quote}
                    onClick={() => setDetailsOpen(true)}
                  >
                    {teamText('feeBreakdown')}
                  </Button>
                  <Button
                    type='link'
                    size='small'
                    disabled={submitting}
                    onClick={() => setRetryQuote(value => value + 1)}
                  >
                    {teamText('getANewQuote')}
                  </Button>
                  <Button
                    type='link'
                    size='small'
                    onClick={() => history.push(`${TEAM_PATH}/overview`)}
                  >
                    {teamText('backToAdminConsole')}
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </QueryState>
      </QueryState>
      {payment && (
        <TeamPayment
          key={payment.order.orderNo}
          orderNo={payment.order.orderNo}
          initialOrder={payment.order}
          periods={payment.periods}
          onClose={() => setPayment(undefined)}
          onApplied={result => {
            if (personal)
              switchSpace(
                String(result.targetCompanyId),
                `${TEAM_PATH}/overview`,
              );
          }}
        />
      )}
    </>
  );
};

export const PointPurchase = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { key, refresh } = useWorkspace();
  const storageKey = `${key.join(':')}:point-purchase`;
  const plans = useQuery([...key, 'addons'], () => teamApi.plans('addon'), {
    enabled: open,
  });
  const [order, setOrder] = useState<PointOrder>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const orderNo = order?.orderNo;
  const orderStatus = order?.status;
  const attempt = useRef<{
    planCode: string;
    requestId: string;
    orderNo?: string;
  }>();
  const persist = () => {
    if (attempt.current)
      sessionStorage.setItem(storageKey, JSON.stringify(attempt.current));
  };
  useEffect(() => {
    if (!open) return;
    let active = true;
    setOrder(undefined);
    setError('');
    try {
      attempt.current =
        JSON.parse(sessionStorage.getItem(storageKey) || 'null') || undefined;
    } catch {
      attempt.current = undefined;
    }
    if (attempt.current?.orderNo) {
      setBusy(true);
      teamApi
        .pointResume(attempt.current.orderNo)
        .then(result => {
          if (!active) return;
          setOrder(result);
          if (result.status === 'paid') {
            sessionStorage.removeItem(storageKey);
            attempt.current = undefined;
            refresh();
          }
        })
        .catch(failure => {
          if (active) setError(errorText(failure));
        })
        .finally(() => {
          if (active) setBusy(false);
        });
    }
    return () => {
      active = false;
    };
  }, [open, storageKey, refresh]);
  useEffect(() => {
    if (!open || !orderNo || !shouldPollPointOrder(orderStatus)) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const result = await teamApi.pointStatus(orderNo, controller.signal);
        if (controller.signal.aborted) return;
        setOrder(result);
        setError('');
        if (result.status === 'paid') {
          sessionStorage.removeItem(storageKey);
          attempt.current = undefined;
          refresh();
          return;
        }
        if (result.status === 'closed') return;
      } catch {
        if (!controller.signal.aborted)
          setError(teamText('theStatusQueryFailedTemporarilyWeAre'));
      }
      if (!controller.signal.aborted) timer = setTimeout(poll, 3000);
    };
    timer = setTimeout(poll, 3000);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [open, orderNo, orderStatus, storageKey, refresh]);
  const buy = async (planCode: string) => {
    if (lock.current) return;
    if (attempt.current && attempt.current.planCode !== planCode) {
      setError(teamText('thePreviousOrderIsUnconfirmedResumeThe'));
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    attempt.current ||= { planCode, requestId: requestKey() };
    persist();
    try {
      const result = await teamApi.pointOrder(
        planCode,
        attempt.current.requestId,
      );
      attempt.current.orderNo = result.orderNo;
      persist();
      setOrder(result);
      if (result.status === 'paid') {
        refresh();
        sessionStorage.removeItem(storageKey);
        attempt.current = undefined;
      }
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <Modal
      centered
      className={style.teamModal}
      title={teamText('buyCompanyPoints')}
      open={open}
      onCancel={onClose}
      footer={null}
      width={650}
      destroyOnClose
    >
      {error && <Alert type='warning' message={error} />}
      {order ? (
        <div className={style.payment}>
          <Status value={order.status} />
          <p>
            {order.planName} · {money(order.amount)}
          </p>
          <p>
            {teamText('orderNumber2')}
            {order.orderNo}
          </p>
          {order.status === 'pending' && order.codeUrl && (
            <QRCode value={order.codeUrl} size={180} />
          )}
          {order.status === 'paid' && (
            <Alert
              type='success'
              message={teamText(
                'paymentSuccessfulCompanyPointsHaveBeenRefreshed',
              )}
            />
          )}
          {order.status === 'closed' && (
            <Button
              onClick={() => {
                setOrder(undefined);
                attempt.current = undefined;
                sessionStorage.removeItem(storageKey);
              }}
            >
              {teamText('chooseAnotherPointsPackage')}
            </Button>
          )}
        </div>
      ) : (
        <QueryState query={plans}>
          <Space direction='vertical' style={{ width: '100%' }}>
            {(plans.data || []).map(plan => (
              <div className={style.card} key={plan.planCode}>
                <strong>
                  {plan.planName} · {plan.grantPoints} {teamText('points2')}{' '}
                  {money(plan.priceAmount)}
                </strong>
                <p>
                  {teamText('validity')}
                  {plan.pointValidityDays
                    ? teamText('valueDays', { value0: plan.pointValidityDays })
                    : plan.pointValidityType ||
                      teamText('asSpecifiedByTheProduct')}
                </p>
                <Button
                  disabled={!plan.purchaseEnabled}
                  loading={busy}
                  onClick={() => buy(plan.planCode)}
                >
                  {teamText('buy')}
                </Button>
              </div>
            ))}
          </Space>
        </QueryState>
      )}
    </Modal>
  );
};
