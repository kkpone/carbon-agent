import I18N from '@src/lang/I18N';
import classNames from 'classnames';
import { useState } from 'react';

import style from '../index.module.less';
import IssueFeedbackPage from './IssueFeedbackPage';
import type { IssueFeedbackView } from './IssueFeedbackPage';
import MobileAgentHeader from './MobileAgentHeader';

type IssueFeedbackSectionProps = {
  initialSessionId?: string;
  initialSessionTitle?: string;
  mobile: boolean;
  refreshKey?: number;
  sourcePath?: string;
  onClose: () => void;
};

const IssueFeedbackSection = ({
  initialSessionId,
  initialSessionTitle,
  mobile,
  refreshKey,
  sourcePath,
  onClose,
}: IssueFeedbackSectionProps) => {
  const [view, setView] = useState<IssueFeedbackView>('create');

  return (
    <>
      {mobile ? (
        <MobileAgentHeader
          leftAction='back'
          rightAction='none'
          title={I18N.carbonAgent.issueFeedback}
          centerContent={
            <div
              className={style.mobileFeedbackTabs}
              role='tablist'
              aria-label={I18N.carbonAgent.issueFeedbackCenter}
            >
              <button
                className={classNames(style.mobileFeedbackTab, {
                  [style.mobileFeedbackTabActive]: view === 'create',
                })}
                type='button'
                role='tab'
                aria-selected={view === 'create'}
                onClick={() => setView('create')}
              >
                {I18N.carbonAgent.issueFeedback}
              </button>
              <button
                className={classNames(style.mobileFeedbackTab, {
                  [style.mobileFeedbackTabActive]: view === 'records',
                })}
                type='button'
                role='tab'
                aria-selected={view === 'records'}
                onClick={() => setView('records')}
              >
                {I18N.carbonAgent.feedbackListTab}
              </button>
            </div>
          }
          onBack={onClose}
        />
      ) : null}
      <IssueFeedbackPage
        initialSessionId={initialSessionId}
        initialSessionTitle={initialSessionTitle}
        mobile={mobile}
        refreshKey={refreshKey}
        sourcePath={sourcePath}
        view={view}
        onClose={onClose}
        onViewChange={setView}
      />
    </>
  );
};

export default IssueFeedbackSection;
