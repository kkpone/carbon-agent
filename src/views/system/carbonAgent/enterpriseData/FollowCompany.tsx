import I18N from '@src/lang/I18N';
import { Button, Checkbox, Popover, Tag, Tooltip } from 'antd';

import bydLogo from './assets/byd.jpg';
import catlLogo from './assets/catl.png';
import divider from './assets/divider.svg';
import { FollowButton } from './components';
import style from './FollowPage.module.less';
import type { Company } from './types';

// 仅对明确匹配的企业使用设计稿标识，不按关键词给其他企业套用 Logo。
const companyLogos: Record<string, string> = {
  比亚迪股份有限公司: bydLogo,
  宁德时代新能源科技股份有限公司: catlLogo,
};

export const stockTypes = (company: Company) =>
  company.labels?.filter(label => /股|上市/.test(label)).join(' / ') || '—';

export const stockCodes = (company: Company) =>
  company.securities
    ?.map(item => item.code)
    .filter(Boolean)
    .join(' / ') || '—';

export const CompanyAvatar = ({
  company,
  small = false,
  className = '',
}: {
  company: Company;
  small?: boolean;
  className?: string;
}) => {
  const logo = companyLogos[company.name];
  return (
    <span
      className={`${style.avatar} ${
        small ? style.avatarSmall : ''
      } ${className}`}
      aria-hidden='true'
    >
      {logo ? (
        <img src={logo} alt='' />
      ) : (
        (company.shortName || company.name).slice(0, 1)
      )}
    </span>
  );
};

export const CompanyTags = ({
  company,
  className = '',
  compact = false,
}: {
  company: Company;
  className?: string;
  compact?: boolean;
}) => {
  const labels = company.labels || [];
  const visibleLabels = compact ? labels.slice(0, 2) : labels;
  const hiddenCount = labels.length - visibleLabels.length;
  const renderTag = (label: string) => (
    <Tag
      key={label}
      title={label}
      className={
        /鉴证|鑒證|认证|認證/.test(label)
          ? style.assuranceTag
          : /股|上市/.test(label)
          ? style.stockTag
          : style.companyTag
      }
    >
      {label}
    </Tag>
  );
  if (!labels.length) return <span className={style.emptyTags}>—</span>;
  return (
    <div
      className={`${style.tags} ${
        compact ? style.compactTags : ''
      } ${className}`}
      title={compact ? undefined : labels.join('、')}
    >
      {visibleLabels.map(renderTag)}
      {hiddenCount > 0 ? (
        <Popover
          title={I18N.enterpriseData.labels}
          content={
            <div className={`${style.tags} ${style.tagsPopup}`}>
              {labels.map(renderTag)}
            </div>
          }
          trigger={['hover', 'click']}
          placement='top'
        >
          <Button
            type='text'
            className={style.moreTags}
            aria-label={`${I18N.enterpriseData.labels}（+${hiddenCount}）`}
          >
            +{hiddenCount}
          </Button>
        </Popover>
      ) : null}
    </div>
  );
};

export const FollowCompanyCard = ({
  company,
  selected,
  disabled,
  onSelect,
  onOpen,
}: {
  company: Company;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) => {
  const t = I18N.enterpriseData;
  return (
    <article
      className={`${style.companyCard} ${
        selected ? style.companyCardSelected : ''
      }`}
    >
      <div className={style.companyHeading}>
        <CompanyAvatar company={company} />
        <div className={style.companyIdentity}>
          <div className={style.companyTitle}>
            <button type='button' onClick={onOpen} title={company.name}>
              {company.shortName || company.name}
            </button>
            <FollowButton
              companyId={company.companyId}
              appearance='star'
              className={style.followAction}
            />
          </div>
          <CompanyTags company={company} compact />
        </div>
      </div>
      <div
        className={style.credit}
        title={`${t.creditCode} ${company.unifiedSocialCreditCode || '—'}`}
      >
        <span>{t.creditCode}</span>
        <strong>{company.unifiedSocialCreditCode || '—'}</strong>
      </div>
      <div className={style.facts}>
        <div>
          <span>{t.industry}</span>
          <Tooltip title={company.industryCategory}>
            <strong>{company.industryCategory || '—'}</strong>
          </Tooltip>
        </div>
        <img src={divider} alt='' />
        <div>
          <span>{t.stockType}</span>
          <Tooltip title={stockTypes(company)}>
            <strong>{stockTypes(company)}</strong>
          </Tooltip>
        </div>
        <img src={divider} alt='' />
        <div>
          <span>{t.stockCode}</span>
          <Tooltip title={stockCodes(company)}>
            <strong>{stockCodes(company)}</strong>
          </Tooltip>
        </div>
      </div>
      <div className={style.cardButtons}>
        <Button onClick={onOpen}>{t.view}</Button>
        <Checkbox
          checked={selected}
          disabled={disabled}
          onChange={onSelect}
          className={`${style.compareChoice} ${
            disabled ? style.choiceDisabled : ''
          }`}
        >
          {t.addToCompare}
        </Checkbox>
      </div>
    </article>
  );
};
