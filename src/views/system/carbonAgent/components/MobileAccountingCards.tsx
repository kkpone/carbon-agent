import defaultProductImage from '@src/assets/svg/accountProductImg.svg';

import I18N from '@src/lang/I18N';
import style from '../index.module.less';
import type { AgentAccountItem } from '../service';

type MobileAccountingCardsProps = {
  error: string;
  hasMore: boolean;
  loading: boolean;
  rows: AgentAccountItem[];
  total: number;
  viewingAccountId: string;
  onLoadMore: () => void;
  onRetry: () => void;
  onViewAccount: (account: AgentAccountItem) => void;
};

const formatAccountTime = (value?: string) => {
  if (!value) {
    return '-';
  }

  const matched = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(.*)$/);

  if (!matched) {
    return value.replace(/-/g, '/');
  }

  return `${matched[1]}/${Number(matched[2])}/${Number(matched[3])}${
    matched[4]
  }`;
};

const formatEmission = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return String(value);
  }

  return numberValue.toLocaleString('zh-CN', {
    maximumFractionDigits: 6,
  });
};

const getStatusTone = (status?: string | null) => {
  const normalizedStatus = (status || '').trim().toLowerCase();

  if (!normalizedStatus || normalizedStatus === 'not_submitted') {
    return 'muted';
  }

  if (
    /completed|success|approved|certified|passed|finish|done/.test(
      normalizedStatus,
    )
  ) {
    return 'success';
  }

  if (
    /pending|reviewing|submitted|applying|processing|waiting|audit|progress/.test(
      normalizedStatus,
    )
  ) {
    return 'pending';
  }

  if (/fail|reject|cancel|retract|error|invalid/.test(normalizedStatus)) {
    return 'danger';
  }

  return 'muted';
};

const getStatusBadgeClassName = (status?: string | null) => {
  const statusTone = getStatusTone(status);

  if (statusTone === 'success') {
    return style.accountingStatusBadgeSuccess;
  }

  if (statusTone === 'pending') {
    return style.accountingStatusBadgePending;
  }

  if (statusTone === 'danger') {
    return style.accountingStatusBadgeDanger;
  }

  return style.accountingStatusBadgeMuted;
};

const getStatusText = (statusName?: string | null) => statusName?.trim() || '-';

const getAccountTitle = (account: AgentAccountItem) =>
  account.accountName ||
  account.productName ||
  I18N.template(I18N.carbonAgent.accountWithId, { val1: account.id });

const getFunctionalUnit = (account: AgentAccountItem) =>
  account.accountName || account.productName || '-';

const MobileAccountingCards = ({
  error,
  hasMore,
  loading,
  rows,
  total,
  viewingAccountId,
  onLoadMore,
  onRetry,
  onViewAccount,
}: MobileAccountingCardsProps) => (
  <section
    className={style.mobileAccountingList}
    aria-label={I18N.carbonAgent.accountingList}
  >
    {error ? (
      <div className={style.mobileAccountingState} role='alert'>
        <span>{error}</span>
        <button type='button' onClick={onRetry}>
          {I18N.carbonAgent.reload}
        </button>
      </div>
    ) : null}

    {!error && !rows.length && loading ? (
      <div className={style.mobileAccountingState}>
        {I18N.carbonAgent.loadingModels}
      </div>
    ) : null}

    {!error && !rows.length && !loading ? (
      <div className={style.mobileAccountingState}>
        {I18N.carbonAgent.noModelData}
      </div>
    ) : null}

    {!error
      ? rows.map(account => {
          const accountViewing = viewingAccountId === String(account.id);

          return (
            <button
              className={style.mobileAccountingCard}
              key={account.id}
              type='button'
              aria-busy={accountViewing}
              disabled={loading || Boolean(viewingAccountId)}
              onClick={() => onViewAccount(account)}
            >
              <div className={style.mobileAccountingCardHead}>
                <img
                  src={account.productPic || defaultProductImage}
                  alt=''
                  onError={event => {
                    event.currentTarget.src = defaultProductImage;
                  }}
                />
                <div className={style.mobileAccountingCardTitle}>
                  <strong title={getAccountTitle(account)}>
                    {getAccountTitle(account)}
                  </strong>
                  <span>
                    {formatAccountTime(
                      account.updateTime || account.createTime,
                    )}
                  </span>
                </div>
              </div>
              <div className={style.mobileAccountingMetaGrid}>
                <div>
                  <span>{I18N.carbonAgent.functionalUnit}</span>
                  <strong>{getFunctionalUnit(account)}</strong>
                </div>
                <div>
                  <span>{I18N.carbonAgent.accountingLifeCycle}</span>
                  <strong>{account.scopeName || '-'}</strong>
                </div>
                <div>
                  <span>{I18N.carbonAgent.emissionAmount}</span>
                  <strong>
                    {formatEmission(account.emissionTotal)} {account.unit || ''}
                  </strong>
                </div>
                <div>
                  <span>{I18N.carbonAgent.expertReview}</span>
                  <strong
                    className={getStatusBadgeClassName(
                      account.expertReviewStatus,
                    )}
                  >
                    {getStatusText(account.expertReviewStatusName)}
                  </strong>
                </div>
                <div>
                  <span>{I18N.carbonAgent.thirdPartyCertification}</span>
                  <strong
                    className={getStatusBadgeClassName(
                      account.certificationStatus,
                    )}
                  >
                    {getStatusText(account.certificationStatusName)}
                  </strong>
                </div>
              </div>
            </button>
          );
        })
      : null}

    {!error && rows.length ? (
      <div className={style.mobileAccountingFooter}>
        <span>
          {I18N.template(I18N.carbonAgent.totalModels, { val1: total })}
        </span>
        {hasMore ? (
          <button type='button' disabled={loading} onClick={onLoadMore}>
            {loading ? I18N.carbonAgent.loadingMore : I18N.carbonAgent.loadMore}
          </button>
        ) : null}
      </div>
    ) : null}
  </section>
);

export default MobileAccountingCards;
