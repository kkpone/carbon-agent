import { useMobile } from '@/hooks/use-mobile';
import I18N from '@src/lang/I18N';
import { useQuery } from '@tanstack/react-query';
import { message, Select, Tabs } from 'antd';
import { useState } from 'react';

import chevron from './assets/chevron-down.svg';
import { DetailMetricsTable } from './CarbonTables';
import { CompanyAvatar, CompanyTags } from './FollowCompany';
import followStyle from './FollowPage.module.less';
import { ErrorState, FollowButton, Loading } from './components';
import { formatDecimal, formatFormerNames } from './data';
import { PageHeader } from './PageLayout';
import { fetchCarbonData } from './service';
import { useEnterpriseData } from './state';
import type { Company } from './types';
import style from './Pages.module.less';

export const CompanyProfile = ({ company }: { company: Company }) => {
  const t = I18N.enterpriseData;
  const fields = [
    [t.company, company.name],
    [t.creditCode, company.unifiedSocialCreditCode],
    [
      t.contact,
      company.phoneNumbers?.join(' / ') || company.emailAddresses?.join(' / '),
    ],
    [t.representative, company.legalRepresentative],
    [t.state, company.companyState],
    [t.foundationDate, company.foundationDate],
    [t.companyType, company.companyType],
    [
      t.capital,
      company.registeredCapital == null
        ? undefined
        : `${formatDecimal(company.registeredCapital)} ${
            company.registeredCapitalUnit || ''
          }`,
    ],
    [
      t.businessTerm,
      company.businessTermStartDate || company.businessTermEndDate
        ? `${company.businessTermStartDate || '—'} — ${
            company.businessTermEndDate || '—'
          }`
        : undefined,
    ],
    [t.formerName, formatFormerNames(company.companyFormerName)],
    [t.industry, company.industryCategory],
    [t.region, company.registeredRegion],
  ];
  return (
    <section className={style.companyProfile} aria-label={t.basic}>
      <div className={style.profileHeading}>
        <CompanyAvatar company={company} className={style.profileAvatar} />
        <div className={style.profileIdentity}>
          <div className={style.profileTitle}>
            <h2>{company.name}</h2>
            <FollowButton
              companyId={company.companyId}
              appearance='star'
              className={followStyle.followAction}
            />
          </div>
          <CompanyTags company={company} className={style.profileTags} />
        </div>
      </div>
      <dl className={style.profileFields}>
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value || '—'}</dd>
          </div>
        ))}
        <div className={style.wideField}>
          <dt>{t.address}</dt>
          <dd>{company.registeredAddress || '—'}</dd>
        </div>
        <div className={style.wideField}>
          <dt>{t.scope}</dt>
          <dd>{company.businessScope || '—'}</dd>
        </div>
      </dl>
    </section>
  );
};

export const DetailPage = ({
  companyId,
  onBack,
}: {
  companyId: string;
  onBack: () => void;
}) => {
  const state = useEnterpriseData();
  const compact = useMobile();
  const [years, setYears] = useState<string[]>();
  const query = useQuery({
    queryKey: ['enterpriseData', state.scope, 'data', companyId, years],
    queryFn: ({ signal }) => fetchCarbonData(companyId, years, signal),
    enabled: state.enabled && Boolean(companyId),
    retry: false,
  });
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [company, setCompany] = useState<Company>();
  const options = query.data?.availableYears || availableYears;
  const currentCompany = query.data?.company || company;
  const t = I18N.enterpriseData;
  const yearPicker = (
    <Select
      aria-label={t.year}
      mode='multiple'
      maxTagCount='responsive'
      className={style.detailYear}
      suffixIcon={<img src={chevron} alt='' />}
      placeholder={t.selectYear}
      value={years || query.data?.years || []}
      options={options.map(year => ({ label: year, value: year }))}
      onChange={(value: string[]) => {
        if (value.length > 10) {
          message.warning(t.yearsLimit);
          return;
        }
        setAvailableYears([...options]);
        setCompany(currentCompany);
        setYears(value.length ? [...value].sort().reverse() : undefined);
      }}
    />
  );
  if (!companyId) return <ErrorState error={t.detailsUnavailable} />;
  return (
    <div className={style.page}>
      <PageHeader title={currentCompany?.name || t.basic} onBack={onBack} />
      {state.follows.isError || state.entitlement.isError ? (
        <div className={style.notice}>
          <ErrorState error={t.limitsFailed} onRetry={() => state.refresh()} />
        </div>
      ) : null}
      {currentCompany ? <CompanyProfile company={currentCompany} /> : null}
      <div className={style.detailBody}>
        <section className={style.detailPanel}>
          <Tabs
            activeKey='carbon'
            className={style.detailTabs}
            items={[
              {
                key: 'carbon',
                label: t.carbonTab,
                children: (
                  <>
                    {compact ? (
                      <div className={style.mobileYear}>{yearPicker}</div>
                    ) : null}
                    {query.isError ? (
                      <ErrorState
                        error={query.error}
                        onRetry={() => query.refetch()}
                      />
                    ) : query.isLoading ? (
                      <Loading />
                    ) : query.data ? (
                      <DetailMetricsTable data={query.data} />
                    ) : null}
                  </>
                ),
              },
            ]}
            tabBarExtraContent={!compact ? yearPicker : undefined}
          />
        </section>
      </div>
    </div>
  );
};
