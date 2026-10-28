import I18N from '@src/lang/I18N';
import { Alert, Button, Empty, Radio, Space } from 'antd';
import { useRef, useState } from 'react';

import {
  BasicInformation,
  CompanySummary,
  ErrorState,
  FollowButton,
  MetricsTable,
  // ReportList,
} from './components';
import { getEnterpriseCard, isCarbonData, isCompany } from './data';
import style from './index.module.less';
import { enterpriseError } from './service';
import { useEnterpriseData } from './state';
import type { AgentMessageCard } from '../service';

export const EnterpriseDataCard = ({
  card,
  sessionId = '',
  disabled = false,
  readonly = false,
}: {
  card: AgentMessageCard;
  sessionId?: string;
  disabled?: boolean;
  readonly?: boolean;
}) => {
  const state = useEnterpriseData();
  const parsed = getEnterpriseCard(card.card);
  const [selected, setSelected] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const t = I18N.enterpriseData;
  if (!parsed) return null;
  const readOnly = readonly || !state.enabled;
  const candidates = Array.isArray(parsed.data.records)
    ? parsed.data.records.filter(isCompany)
    : [];
  const confirm = async () => {
    const company = candidates.find(item => item.companyId === selected);
    const originSession = parsed.sessionId || sessionId;
    if (
      !company ||
      !originSession ||
      !parsed.resultId ||
      lock.current ||
      readOnly ||
      disabled
    )
      return;
    lock.current = true;
    setSubmitting(true);
    setError('');
    try {
      await state.onConfirm({
        sessionId: originSession,
        company,
        resultId: parsed.resultId,
      });
    } catch (reason) {
      setError(enterpriseError(reason));
    } finally {
      lock.current = false;
      setSubmitting(false);
    }
  };
  const carbon = { years: [], metrics: [], sources: [], ...parsed.data };
  return (
    <section
      className={style.chatCard}
      data-enterprise-result-id={parsed.resultId}
    >
      {parsed.type === 'enterprise_candidates' ? (
        <>
          <h3>{t.confirm}</h3>
          {!Array.isArray(parsed.data.records) ? (
            <ErrorState error={t.invalidResponse} />
          ) : !candidates.length ? (
            <Empty description={t.noResults} />
          ) : (
            <>
              <Radio.Group
                className={style.fullWidth}
                value={selected}
                disabled={readOnly || disabled || submitting}
                onChange={event => setSelected(event.target.value)}
              >
                {candidates.map(company => (
                  <div className={style.candidate} key={company.companyId}>
                    <Radio value={company.companyId}>
                      <CompanySummary company={company} />
                    </Radio>
                  </div>
                ))}
              </Radio.Group>
              {Number(parsed.data.total) > candidates.length ? (
                <Alert type='info' message={t.refineSearch} />
              ) : null}
              <div className={style.cardActions}>
                <Button
                  type='primary'
                  loading={submitting}
                  disabled={
                    readOnly ||
                    disabled ||
                    !selected ||
                    !parsed.resultId ||
                    submitting
                  }
                  onClick={confirm}
                >
                  {t.confirm}
                </Button>
              </div>
            </>
          )}
        </>
      ) : !isCarbonData(carbon) ? (
        <ErrorState error={t.invalidResponse} />
      ) : (
        <>
          <div className={style.header}>
            <h3>{carbon.company.name}</h3>
            <Space wrap>
              {!readOnly ? (
                <Button onClick={() => state.onOpen(carbon.company.companyId)}>
                  {t.latest}
                </Button>
              ) : null}
              <FollowButton
                companyId={carbon.company.companyId}
                disabled={readOnly || disabled}
              />
            </Space>
          </div>
          <BasicInformation company={carbon.company} />
          <section className={style.section}>
            <h3>{t.emissions}</h3>
            <MetricsTable data={carbon} />
          </section>
          {/* <ReportList
            companyId={carbon.company.companyId}
            sources={carbon.sources}
            snapshot
            readonly={readOnly}
          /> */}
        </>
      )}
      {error ? <ErrorState error={error} /> : null}
      {!readOnly && (state.follows.isError || state.entitlement.isError) ? (
        <ErrorState error={t.limitsFailed} onRetry={() => state.refresh()} />
      ) : null}
    </section>
  );
};
