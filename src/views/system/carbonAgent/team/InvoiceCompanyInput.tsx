import { AutoComplete, Input, Spin } from 'antd';
import { useEffect, useState } from 'react';

import { teamText } from './i18n';
import style from './team.module.less';
import {
  searchAgentInvoiceCompanies,
  type AgentInvoiceCompany,
} from '../service';

/** Use the same company lookup as personal invoices, while allowing manual entry. */
export const InvoiceCompanyInput = ({
  value = '',
  onChange,
  onCompanySelect,
  active,
  id,
}: {
  value?: string;
  onChange?: (value: string) => void;
  onCompanySelect: (company: AgentInvoiceCompany) => void;
  active: boolean;
  id?: string;
}) => {
  const [companies, setCompanies] = useState<AgentInvoiceCompany[]>([]);
  const [selectedName, setSelectedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const keyword = value.trim();
  const tooShort = Array.from(keyword).length === 1;
  useEffect(() => {
    setCompanies([]);
    setLoading(false);
    setError('');
    setSearched(false);
    if (!active || Array.from(keyword).length < 2 || keyword === selectedName)
      return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchAgentInvoiceCompanies(
          keyword,
          controller.signal,
        );
        if (controller.signal.aborted) return;
        if (![1, 200].includes(response.data.code))
          throw new Error('Company lookup failed');
        const items = response.data.data?.items;
        setSearched(true);
        setCompanies(
          Array.isArray(items)
            ? items.filter(item => item.companyName && item.resultId)
            : [],
        );
      } catch {
        if (!controller.signal.aborted)
          setError(teamText('companySearchIsTemporarilyUnavailableYouCan'));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 650);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [active, keyword, selectedName]);
  return (
    <>
      <AutoComplete
        id={id}
        value={value}
        className={style.invoiceCompanyInput}
        options={companies.map(company => ({
          value: company.companyName,
          label: (
            <div className={style.invoiceCompanyOption}>
              <span>{company.companyName}</span>
              <small>
                {company.creditCode || teamText('taxpayerIdNotProvided')}
              </small>
            </div>
          ),
          company,
        }))}
        onChange={next => {
          setSelectedName('');
          onChange?.(next);
        }}
        onSelect={(_, option) => {
          setSelectedName(option.company.companyName.trim());
          setCompanies([]);
          onCompanySelect(option.company);
        }}
      >
        <Input
          placeholder={teamText('enterAtLeast2CharactersToSearch')}
          // Keep the affix wrapper mounted: changing suffix from null to an
          // element replaces Ant Input's native input and loses focus mid-search.
          suffix={
            <span aria-hidden='true'>
              {loading ? <Spin size='small' /> : null}
            </span>
          }
        />
      </AutoComplete>
      {(tooShort || error || (searched && !companies.length)) && (
        <div className={style.invoiceLookupHint} role='status'>
          {tooShort
            ? teamText('enterAtLeast1MoreCharacterTo')
            : error || teamText('noMatchingCompanyFoundEnterTheFull')}
        </div>
      )}
    </>
  );
};
