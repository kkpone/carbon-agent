/* eslint-disable no-nested-ternary */
import { LoadingOutlined } from '@ant-design/icons';
import aiStarSvg from '@src/assets/svg/aiStar.svg';
import { Button, Spin, Tooltip } from 'antd';
import copyToClipboard from 'copy-to-clipboard';
import { FC } from 'react';

import { Markdown } from '@/components/Markdown';
import { IconAlibabaNew } from '@/components/iconfont';
import I18N from '@/lang/I18N';
import { Toast } from '@/utils';

import copySvg from './copy.svg';
import styles from './index.module.less';
// import insertSvg from './insert.svg';
import resendSvg from './resend.svg';
import { AI_HISTORY_STATUS, JSON_ANSWER_ICON_TYPE } from '../constant';

export interface IAnswerProps {
  content: string;
  status?: number;
  dataType?: 'json' | 'markdown';
  jsonList?: Record<string, any>[] | null;
  loading?: boolean;
  resend?: (id: number) => void;
  isLast?: boolean;
  isLastJsonAnswer?: boolean;
  questionGuide?: string[];
  sendQuestionGuide?: (questionGuide: string) => void;
  onFailed?: (data: Record<string, any>) => void;
}

export const Answer: FC<IAnswerProps> = props => {
  const {
    content,
    dataType,
    jsonList,
    status,
    loading,
    isLast,
    isLastJsonAnswer,
    questionGuide,
    sendQuestionGuide,
    onFailed,
  } = props;

  const onCopy = () => {
    if (loading) {
      return;
    }
    const copySuccess = copyToClipboard(content);
    if (copySuccess) {
      Toast('success', I18N.carbonFootprint3.copySuccessful);
    } else {
      Toast('error', I18N.dashborad.copyFailed);
    }
  };

  if (dataType === 'json') {
    return (
      <div>
        <div className={styles.jsonAnswerList}>
          {jsonList?.map(item => (
            <div className={styles.jsonItem} key={item.name}>
              {item.type === JSON_ANSWER_ICON_TYPE.HAS_ICON &&
                (item.status === AI_HISTORY_STATUS.SUCCESS ? (
                  <IconAlibabaNew type='icon-icon-tongguo' />
                ) : status === AI_HISTORY_STATUS.FAIL ? (
                  <IconAlibabaNew type='icon-icon-bohui' />
                ) : (
                  <LoadingOutlined />
                ))}
              <div className={styles.jsonText}>{item.name}</div>
            </div>
          ))}
        </div>
        {status === AI_HISTORY_STATUS.FAIL && isLastJsonAnswer && (
          <Button className={styles.retryBtn} type='primary' onClick={onFailed}>
            {I18N.enterpriseCarbonAccount2.retry}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.answer}>
      {/* <div className={styles.avatar}>
        <img src={ai} alt='' />
      </div> */}
      <div className={styles.answerContent}>
        <div className={styles.loading}>
          <Spin spinning={loading}>
            {loading && (
              <div
                style={{
                  height: '20px',
                  width: '20px',
                }}
              />
            )}
          </Spin>
        </div>
        <div className={styles.content}>
          <Markdown content={content} />
        </div>
        <div className={styles.btns}>
          <div />
          <div className={styles.right}>
            <Tooltip title={I18N.carbonFootprint.copy} placement='top'>
              <div className={styles.operation} onClick={onCopy}>
                <img src={copySvg} alt='' />
              </div>
            </Tooltip>
            <Tooltip title={I18N.components.reAnswer} placement='top'>
              <div
                className={styles.operation}
                onClick={() => props.resend?.()}
              >
                <img src={resendSvg} alt='' />
              </div>
            </Tooltip>
          </div>
        </div>
        {isLast && questionGuide && questionGuide.length > 0 && (
          <div className={styles.toolBar}>
            {questionGuide?.map(item => (
              <Tooltip title={item} placement='top'>
                <div
                  className={styles.toolBarItem}
                  onClick={() => sendQuestionGuide?.(item)}
                >
                  <img src={aiStarSvg} alt='' />
                  <span className={styles.toolBarItemText}>{item}</span>
                </div>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
