import I18N from '@src/lang/I18N';
import { Checkbox, Empty, Input, Modal } from 'antd';
import { useState } from 'react';

import { CompanyAvatar, stockCodes } from './FollowCompany';
import { ErrorState, Loading } from './components';
import { isComparisonCountAllowed } from './data';
import { useEnterpriseData } from './state';
import type { Company } from './types';
import style from './Pages.module.less';

export const CompareCompanyPicker = ({
  initial,
  onClose,
  onConfirm,
}: {
  initial: string[];
  onClose: () => void;
  onConfirm: (companies: Company[]) => void;
}) => {
  const state = useEnterpriseData();
  const [selected, setSelected] = useState(initial);
  const [keyword, setKeyword] = useState('');
  const t = I18N.enterpriseData;
  const limit = state.entitlement.data?.compareLimit ?? 0;
  const companies = (state.follows.data || []).flatMap(item =>
    item.company ? [item.company] : [],
  );
  const valid = selected.filter(id =>
    companies.some(company => company.companyId === id),
  );
  const filtered = companies.filter(company =>
    [
      company.name,
      company.shortName,
      company.unifiedSocialCreditCode,
      stockCodes(company),
    ].some(value =>
      value?.toLowerCase().includes(keyword.trim().toLowerCase()),
    ),
  );
  const available =
    state.enabled &&
    state.entitlement.isSuccess &&
    !state.entitlement.isError &&
    limit >= 2 &&
    state.follows.isSuccess &&
    !state.follows.isError;
  return (
    <Modal
      open
      centered
      title={t.selectCompanies}
      onCancel={onClose}
      onOk={() => {
        if (!available || !isComparisonCountAllowed(valid.length, limit))
          return;
        onConfirm(
          companies.filter(company => valid.includes(company.companyId)),
        );
      }}
      okText={t.startCompare}
      cancelText={t.cancel}
      okButtonProps={{
        disabled: !available || !isComparisonCountAllowed(valid.length, limit),
      }}
      className={style.picker}
      width={640}
    >
      <Input
        allowClear
        value={keyword}
        placeholder={t.search}
        aria-label={t.search}
        onChange={event => setKeyword(event.target.value)}
      />
      <p className={style.muted}>
        {t.selected} {valid.length}/{limit}
      </p>
      {state.follows.isError || state.entitlement.isError ? (
        <ErrorState error={t.limitsFailed} onRetry={() => state.refresh()} />
      ) : state.follows.isLoading ? (
        <Loading />
      ) : !filtered.length ? (
        <Empty description={t.noFollows} />
      ) : (
        <div className={style.pickerList}>
          {filtered.map(company => (
            <Checkbox
              key={company.companyId}
              checked={valid.includes(company.companyId)}
              disabled={
                !available ||
                (valid.length >= limit && !valid.includes(company.companyId))
              }
              onChange={event =>
                setSelected(current =>
                  event.target.checked
                    ? [...current, company.companyId]
                    : current.filter(id => id !== company.companyId),
                )
              }
            >
              <CompanyAvatar company={company} small />
              <span>
                <strong>{company.shortName || company.name}</strong>
                <small>{stockCodes(company)}</small>
              </span>
            </Checkbox>
          ))}
        </div>
      )}
    </Modal>
  );
};
