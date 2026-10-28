import I18N, { LocaleType } from '@src/lang/I18N';
import type { UIEvent } from 'react';

import style from '../index.module.less';
import type { AgentEnterpriseComputationItem } from '../service';

type MobileEnterpriseAccountingCardsProps = {
  hasMore: boolean;
  loading: boolean;
  locale: LocaleType;
  rows: AgentEnterpriseComputationItem[];
  viewingYear: number | null;
  onLoadMore: () => void;
  onView: (row: AgentEnterpriseComputationItem) => void;
};

export const formatEnterpriseAccountingYear = (
  year: number,
  locale: LocaleType,
) => (locale === LocaleType.enUS ? String(year) : `${year}年`);

export const formatEnterpriseAccountingEmission = ({
  totalEmission,
  unitName,
}: AgentEnterpriseComputationItem) => {
  if (
    totalEmission === undefined ||
    totalEmission === null ||
    String(totalEmission).trim() === ''
  ) {
    return '-';
  }

  return unitName?.trim()
    ? `${String(totalEmission)} ${unitName.trim()}`
    : String(totalEmission);
};

const MobileEnterpriseAccountingCards = ({
  hasMore,
  loading,
  locale,
  rows,
  viewingYear,
  onLoadMore,
  onView,
}: MobileEnterpriseAccountingCardsProps) => {
  const handleScroll = (event: UIEvent<HTMLElement>) => {
    if (!hasMore || loading) {
      return;
    }

    const scrollContainer = event.currentTarget;
    const distanceToBottom =
      scrollContainer.scrollHeight -
      scrollContainer.scrollTop -
      scrollContainer.clientHeight;

    if (distanceToBottom <= 80) {
      onLoadMore();
    }
  };

  return (
    <section
      className={style.mobileEnterpriseAccountingList}
      aria-label={I18N.carbonAgent.accountingManagement}
      onScroll={handleScroll}
    >
      {!rows.length && loading ? (
        <div className={style.mobileAccountingState}>
          {I18N.carbonAgent.loadingEnterpriseCarbonData}
        </div>
      ) : null}

      {!rows.length && !loading ? (
        <div className={style.mobileAccountingState}>
          {I18N.carbonAgent.noEnterpriseCarbonData}
        </div>
      ) : null}

      {rows.map(row => {
        const rowViewing = viewingYear === row.year;
        const formattedYear = formatEnterpriseAccountingYear(row.year, locale);
        const emission = formatEnterpriseAccountingEmission(row);

        return (
          <article
            className={style.mobileEnterpriseAccountingCard}
            key={row.year}
          >
            <header className={style.mobileEnterpriseAccountingCardHeader}>
              <span title={formattedYear}>{formattedYear}</span>
              <button
                type='button'
                aria-busy={rowViewing}
                disabled={loading || viewingYear !== null}
                title={I18N.carbonAgent.view}
                onClick={() => onView(row)}
              >
                {rowViewing ? I18N.carbonAgent.opening : I18N.carbonAgent.view}
              </button>
            </header>
            <dl className={style.mobileEnterpriseAccountingDetails}>
              <div>
                <dt title={I18N.carbonAgent.enterpriseProjectAccountingPeriod}>
                  {I18N.carbonAgent.enterpriseProjectAccountingPeriod}
                </dt>
                <dd title={row.timeTypeName || '-'}>
                  {row.timeTypeName || '-'}
                </dd>
              </div>
              <div>
                <dt title={I18N.carbonAgent.enterpriseTaskAccountingSubject}>
                  {I18N.carbonAgent.enterpriseTaskAccountingSubject}
                </dt>
                <dd title={row.orgNames || '-'}>{row.orgNames || '-'}</dd>
              </div>
              <div>
                <dt title={I18N.carbonAgent.totalEmission}>
                  {I18N.carbonAgent.totalEmission}
                </dt>
                <dd title={emission}>{emission}</dd>
              </div>
            </dl>
          </article>
        );
      })}

      {rows.length && loading ? (
        <div className={style.mobileEnterpriseAccountingFooter} role='status'>
          {I18N.carbonAgent.loadingMore}
        </div>
      ) : null}
    </section>
  );
};

export default MobileEnterpriseAccountingCards;
