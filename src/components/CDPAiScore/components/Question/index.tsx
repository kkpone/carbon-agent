import { Tooltip } from 'antd';
import classNames from 'classnames';
import copyToClipboard from 'copy-to-clipboard';
import { FC, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { checkPermissions } from '@/components/Permission/utils';
import { ReadOnlyTiptap } from '@/components/ReadOnlyTiptap';
import I18N from '@/lang/I18N';
import { Toast } from '@/views/subModules/CarbonFootprintModel/components/Toast/verifty';

import copy from './copy.svg';
import disableCopySvg from './disableCopy.svg';
import errorSvg from './error.svg';
import expandSvg from './expand.svg';
import finishSvg from './finish.svg';
import styles from './index.module.less';
import replace from './replace.svg';
import unFinishSvg from './unFinish.svg';
import {
  postScoreBySingle,
  QuestionData,
  postScoreBySingleByOnline,
} from '../../service';
import copySvg from '../ModulesCard/copy.svg';

function trimMatchedBoldMarkers(str: string) {
  return str
    .replace(/^(\*\*|\\\*\\\*)/, '') // 去掉开头的 ** 或 \*\*
    .replace(/(\*\*|\\\*\\\*)$/, ''); // 去掉结尾的 ** 或 \*\*
}

export interface IQuestionProps {
  question?: QuestionData;
  replaceContent?: (targetHeader: string, content: string) => void;
  getContentByHeader?: (targetHeader: string) => string;
  refresh?: () => void;
  loading?: boolean;
  userAnswerLoading?: boolean;
  setUserAnswerLoading?: (loading: boolean) => void;
  isOnline?: boolean;
  /** 1 完整版 2 中小版 */
  reportVersion?: string;
}

export const Question: FC<IQuestionProps> = props => {
  const {
    replaceContent,
    getContentByHeader,
    question,
    refresh,
    loading,
    userAnswerLoading,
    setUserAnswerLoading,
    isOnline,
    reportVersion = '1',
  } = props;

  const [open, setOpen] = useState(false);

  const location = useLocation<{ reportId: string }>();

  const searchParams = new URLSearchParams(location.search);

  const reportId = Number(searchParams.get('reportId') || 0);

  const onCopy = () => {
    const copySuccess = copyToClipboard(question?.highAnswer || '');
    if (copySuccess) {
      Toast('success', I18N.carbonFootprint3.copySuccessful);
    } else {
      Toast('error', I18N.dashborad.copyFailed);
    }
  };

  const status = useMemo(() => {
    if (question?.scoreType === 2 || question?.scoreType === 3) {
      return 'failed';
    }
    if (question?.scoreAll) {
      return 'finish';
    }
    return 'unFinish';
  }, [question?.scoreAll, question?.scoreType]);

  const title = useMemo(() => {
    if (status === 'failed') {
      return I18N.components.pleaseIdentifyTheError;
    }
    if (status === 'unFinish') {
      return I18N.components.theAnswerNeedsToBeOptimized;
    }
    return '';
  }, [status]);

  const hasScorePermission = checkPermissions(
    true,
    '/enterpriseCarbonAccounting/cdp/aiScore',
  );

  const titleIcon = useMemo(() => {
    if (status === 'failed') {
      return <img style={{ width: 16, height: 16 }} src={errorSvg} alt='' />;
    }
    return <img src={question?.scoreAll ? finishSvg : unFinishSvg} alt='' />;
  }, [status, question?.scoreAll]);

  return (
    <div
      className={classNames(styles.question, {
        [styles.open]: open,
      })}
    >
      <div className={styles.header}>
        <div
          className={styles.expand}
          onClick={() => {
            if (!open) {
              const els = document.querySelectorAll(`h1, h2, h3, h4, h5, h6`);
              let targetEl: HTMLElement | undefined;

              // eslint-disable-next-line no-restricted-syntax
              for (const el of els) {
                if (
                  el instanceof HTMLElement &&
                  (el.innerText === question?.questionTitle ||
                    (question?.questionTitle.includes(
                      trimMatchedBoldMarkers(el.innerText),
                    ) &&
                      el.innerText.length > 0))
                ) {
                  targetEl = el;
                  break; // 找到就退出
                }
              }
              if (!targetEl) {
                const titleEl = document.getElementById(
                  `${question?.questionCode} ${question?.questionTitle}` || '',
                );
                if (titleEl) {
                  targetEl = titleEl;
                }
              }
              setTimeout(() => {
                targetEl?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }, 32);
            }
            setOpen(pre => !pre);
          }}
        >
          <img
            className={classNames(styles.expandIcon, {
              [styles.active]: open,
            })}
            src={expandSvg}
            alt=''
          />
          <span>{question?.questionCode}</span>
        </div>
        <div className={styles.finish}>
          <Tooltip title={title}>{titleIcon}</Tooltip>
        </div>
        <div className={styles.infos}>
          <div className={styles.info}>
            <div className={styles.title}>{I18N.esg.disclose}</div>
            <div className={styles.bold}>
              {question?.disclosure}/{question?.disclosureTotal}
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.title}>{I18N.components.cognition}</div>
            <div className={styles.bold}>
              {question?.cognition}/{question?.cognitionTotal}
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.title}>
              {I18N.carbonFootprint.administration}
            </div>
            <div className={styles.bold}>
              {question?.manage}/{question?.manageTotal}
            </div>
          </div>
          {reportVersion === '1' && (
            <div className={styles.info}>
              <div className={styles.title}>{I18N.components.leader}</div>
              <div className={styles.bold}>
                {question?.leader}/{question?.leaderTotal}
              </div>
            </div>
          )}
        </div>
        {hasScorePermission && (
          <div
            className={styles.score}
            onClick={async () => {
              if (loading || userAnswerLoading) {
                return;
              }
              setUserAnswerLoading?.(true);
              if (isOnline) {
                await postScoreBySingleByOnline({
                  id: question?.id || 0,
                  reportId: reportId || 0,
                }).finally(() => {
                  setUserAnswerLoading?.(false);
                });
              } else {
                await postScoreBySingle({
                  id: question?.id || 0,
                  userAnswer:
                    getContentByHeader?.(question?.questionTitle || '') || '',
                }).finally(() => {
                  setUserAnswerLoading?.(false);
                });
              }

              refresh?.();
            }}
          >
            <Tooltip
              title={
                userAnswerLoading
                  ? I18N.components.reRatingInProgress
                  : I18N.components.remark
              }
            >
              <img
                src={userAnswerLoading ? disableCopySvg : copySvg}
                style={{
                  cursor: userAnswerLoading ? 'not-allowed' : 'pointer',
                }}
                alt=''
              />
            </Tooltip>
          </div>
        )}
      </div>
      {open && (
        <div className={styles.content}>
          <div className={styles.title}>
            {I18N.components.suggestedConclusion}
          </div>
          <div className={styles.description}>
            <ReadOnlyTiptap
              content={question?.suggestions || ''}
              showPlaceholder={!question?.suggestions}
              placeholder={I18N.components.noSuggestionsAtTheMoment}
            />
          </div>
          <div className={styles.title}>{I18N.components.canBeModifiedTo}</div>
          <ReadOnlyTiptap
            content={question?.highAnswer || ''}
            className={styles.target}
            showPlaceholder={!question?.highAnswer}
            placeholder={I18N.components.noSuggestionsAtTheMoment}
          />
          {status !== 'failed' && hasScorePermission && (
            <div className={styles.operation}>
              {!isOnline && (
                <div
                  className={styles.replace}
                  onClick={() =>
                    replaceContent?.(
                      question?.questionTitle || '',
                      question?.highAnswer || '',
                    )
                  }
                >
                  <img src={replace} alt='' />
                  {I18N.components.replace}
                </div>
              )}
              {isOnline && <div />}
              <div className={styles.right}>
                <div className={styles.item} onClick={() => onCopy()}>
                  <img src={copy} alt='' />
                </div>
                {/* <div className={styles.item}>
                <img src={refreshSvg} alt='' />
              </div> */}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
