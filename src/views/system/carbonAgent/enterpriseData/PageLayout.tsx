import I18N from '@src/lang/I18N';
import { Button } from 'antd';
import type { ReactNode } from 'react';

import aiBackground from './assets/ai-button-bg.svg';
import aiFold from './assets/ai-button-fold.svg';
import aiMark from './assets/ai-button-mark.svg';
import aiRibbon from './assets/ai-button-ribbon.svg';
import style from './Pages.module.less';

export const PageHeader = ({
  title,
  onBack,
  actions,
}: {
  title: string;
  onBack: () => void;
  actions?: ReactNode;
}) => (
  <header className={style.pageHeader}>
    <nav
      aria-label={I18N.enterpriseData.breadcrumb}
      className={style.breadcrumb}
    >
      <Button type='text' onClick={onBack}>
        {I18N.enterpriseData.title}
      </Button>
      <span aria-hidden='true'>/</span>
      <h1 title={title}>{title}</h1>
    </nav>
    {actions}
  </header>
);

export const AnalysisButton = ({
  disabled,
  busy,
  onClick,
}: {
  disabled: boolean;
  busy: boolean;
  onClick: () => void;
}) => (
  <button
    type='button'
    className={style.aiButton}
    disabled={disabled}
    aria-busy={busy}
    aria-label={I18N.enterpriseData.analyze}
    onClick={onClick}
  >
    <img className={style.aiBackground} src={aiBackground} alt='' />
    <img className={style.aiRibbon} src={aiRibbon} alt='' />
    <img className={style.aiFold} src={aiFold} alt='' />
    <img className={style.aiMark} src={aiMark} alt='' />
    <span>
      {busy
        ? I18N.enterpriseData.analysisBusyShort
        : I18N.enterpriseData.analysisResult}
    </span>
  </button>
);
