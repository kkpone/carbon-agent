import wechatPay from '@src/assets/svg/wx_pay.svg';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Modal, Spin, Table } from 'antd';
import QRCode from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';

import { teamApi } from './api';
import { errorText, reasonText } from './errors';
import {
  dateText,
  money,
  paymentSecondsLeft,
  shouldPollTeamOrder,
} from './helpers';
import { teamText } from './i18n';
import style from './team.module.less';
import type { PriceLine, TeamOrder } from './types';
import { QueryState, Status } from './ui';
import { useWorkspace } from './workspace';

export const PaymentPeriods = ({ periods }: { periods: PriceLine[] }) => (
  <Table<PriceLine>
    className={style.quotePeriods}
    size='small'
    pagination={false}
    rowKey={row => `${row.startDate}-${row.endDateExclusive}`}
    dataSource={periods}
    columns={[
      {
        title: teamText('subscriptionPeriod2'),
        render: (_, row) => (
          <div className={style.periodDates}>
            <span>{row.startDate}</span>
            <span>
              {teamText('to3')}
              {dateText(row.endDateExclusive, true)}
            </span>
          </div>
        ),
      },
      { title: teamText('seats'), dataIndex: 'seatQuantity' },
      { title: teamText('fee'), dataIndex: 'amount', render: money },
      { title: teamText('grantedPoints'), dataIndex: 'giftPoints' },
    ]}
  />
);

// Mount only for an explicitly created or selected order. Closing stops polling,
// but never closes the server order or creates another payment.
export const TeamPayment = ({
  orderNo,
  initialOrder,
  periods,
  onClose,
  onApplied,
}: {
  orderNo: string;
  initialOrder?: TeamOrder;
  periods?: PriceLine[];
  onClose: () => void;
  onApplied?: (order: TeamOrder) => void;
}) => {
  const { key, refresh } = useWorkspace();
  const [order, setOrder] = useState(initialOrder);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [now, setNow] = useState(Date.now);
  const secondsLeft = paymentSecondsLeft(order?.expiresAt, now);
  useEffect(() => {
    if (order?.state !== 'PENDING' || !order.expiresAt) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [order?.state, order?.expiresAt]);
  const applied = useRef(false);
  const snapshot = useQuery(
    [...key, 'order-detail', orderNo],
    () => teamApi.orderDetail(orderNo),
    {
      enabled: !periods && !order?.periods,
    },
  );
  const priceLines = order?.periods ?? periods ?? snapshot.data?.periods;
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const result = await teamApi.orderStatus(orderNo, controller.signal);
        if (controller.signal.aborted) return;
        setOrder(result);
        setError('');
        if (!shouldPollTeamOrder(result.state)) return;
      } catch (failure) {
        if (controller.signal.aborted) return;
        setError(
          teamText('valueWeAreStillCheckingTheOriginal', {
            value0: errorText(failure),
          }),
        );
      }
      if (!controller.signal.aborted) timer = setTimeout(poll, 3000);
    };
    poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [orderNo, retry]);
  useEffect(() => {
    if (order?.state !== 'APPLIED' || applied.current) return;
    applied.current = true;
    refresh();
    onApplied?.(order);
  }, [order, refresh, onApplied]);
  return (
    <Modal
      centered
      className={`${style.teamModal} ${style.paymentModal}`}
      title={
        order?.state === 'PENDING'
          ? teamText('scanToPay')
          : teamText('orderPayment')
      }
      open
      onCancel={onClose}
      footer={null}
      width={440}
    >
      {error && <Alert showIcon type='warning' message={error} />}
      <div className={style.teamPaymentBody}>
        {order ? (
          <>
            {order.state === 'PENDING' && (
              <div className={style.paymentMethod}>
                <span aria-hidden='true' />
                <img src={wechatPay} alt='' />
                {teamText('wechatPay')}
              </div>
            )}
            <div className={style.paymentTotal}>
              <span>{teamText('orderTotal')}</span>
              <strong className={style.amount}>{money(order.amount)}</strong>
            </div>
            {order.state === 'PENDING' &&
              (order.codeUrl ? (
                <div className={style.paymentQr}>
                  <QRCode
                    value={order.codeUrl}
                    size={144}
                    level='H'
                    imageSettings={{
                      src: wechatPay,
                      width: 24,
                      height: 24,
                      excavate: true,
                    }}
                  />
                </div>
              ) : (
                <Alert
                  type='info'
                  message={teamText('thePaymentQrCodeIsTemporarilyUnavailable')}
                />
              ))}
            {order.state === 'PENDING' && (
              <>
                {secondsLeft !== undefined && (
                  <div className={style.paymentCountdown}>
                    {secondsLeft > 0
                      ? teamText('qrCodeExpiresInValueValue', {
                          value0: String(Math.floor(secondsLeft / 60)).padStart(
                            2,
                            '0',
                          ),
                          value1: String(secondsLeft % 60).padStart(2, '0'),
                        })
                      : teamText('theQrCodeHasExpiredCheckingThe')}
                  </div>
                )}
                <p className={style.paymentHint}>
                  {teamText('scanWithWechatToPay')}
                  <br />
                  {teamText('closingThisDialogDoesNotCancelThe')}
                </p>
              </>
            )}
            {order.state === 'PAID' && (
              <Alert
                type='info'
                message={teamText(
                  'paymentConfirmedEntitlementsAreBeingAppliedDo',
                )}
              />
            )}
            {order.state === 'APPLIED' && (
              <Alert
                type='success'
                message={teamText('entitlementsAreActiveCompanySeatsAndPoints')}
              />
            )}
            {order.state === 'REVIEW' && (
              <Alert
                type='warning'
                message={teamText('orderRequiresReviewValueKeepTheOrder', {
                  value0: reasonText(order.failureCode),
                })}
              />
            )}
            {order.state === 'CLOSED' && (
              <Alert
                type='info'
                message={teamText('thisOrderIsClosedToPurchaseReturn')}
              />
            )}
          </>
        ) : (
          <Spin tip={teamText('checkingTheOriginalOrder')}>
            <div style={{ minHeight: 80 }} />
          </Spin>
        )}
      </div>
      {order && (
        <div className={style.paymentOrderMeta}>
          <span>
            {teamText('orderNumber2')}
            {order.orderNo}
          </span>
          <Status value={order.state} />
        </div>
      )}
      <h3 className={style.paymentDetailsTitle}>
        {teamText('feesAndPeriods')}
      </h3>
      {priceLines ? (
        <PaymentPeriods periods={priceLines} />
      ) : (
        <QueryState query={snapshot}>
          <p>{teamText('noPeriodDetailsAvailable')}</p>
        </QueryState>
      )}
      {(error ||
        order?.state === 'REVIEW' ||
        (order?.state === 'PENDING' && !order.codeUrl)) && (
        <Button onClick={() => setRetry(value => value + 1)}>
          {teamText('checkOriginalOrderAgain')}
        </Button>
      )}
    </Modal>
  );
};
