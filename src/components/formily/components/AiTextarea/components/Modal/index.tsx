import { streamFetch } from '@src/api/streamFetch';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { useMount } from 'ahooks';
import { Input, Tooltip } from 'antd';
import classNames from 'classnames';
import copyToClipboard from 'copy-to-clipboard';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import closeSvg from './close.svg';
import styles from './index.module.less';
import loadingGif from './loading.gif';
import sendSvg from './send.svg';
import aiLogoPng from '../../img/ailogo.png';
import expandSvg from '../../img/expand.svg';
import expandSvgColor from '../../img/expandColor.svg';
import polishSvg from '../../img/polish.svg';
import polishSvgColor from '../../img/polishColor.svg';
import summarySvg from '../../img/summary.svg';
import summarySvgColor from '../../img/summaryColor.svg';

interface AiModalProps {
  selectText?: string;
  insertText?: (text: string) => void;
  close?: () => void;
  type?: 'polish' | 'summary' | 'expand';
  modalType?: 'select' | 'tip';
}

const aiFuncs = [
  {
    icon: polishSvg,
    ColorIcon: polishSvgColor,
    title: I18N.components.polishing,
    type: 'polish',
  },
  {
    icon: summarySvg,
    ColorIcon: summarySvgColor,
    title: I18N.components.summary,
    type: 'summary',
  },
  {
    icon: expandSvg,
    ColorIcon: expandSvgColor,
    title: I18N.components.expansion,
    type: 'expand',
  },
] as const;

export const AiModal: React.FC<AiModalProps> = props => {
  // Use the props here
  const { selectText, insertText, close, type, modalType } = props;
  const [question, setQuestion] = React.useState(selectText);
  const [answer, setAnswer] = React.useState('');
  const [useType, setUseType] = useState(type);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  // const [language, setLanguage] = useState<'zh' | 'en'>('zh');

  const location = useLocation<{ reportId: string }>();

  const searchParams = new URLSearchParams(location.search);

  const reportId = Number(searchParams.get('reportId') || 0);

  const insertTextCb = () => {
    if (loading) {
      return;
    }
    insertText?.(answer);
  };

  const sendAi = async (query?: string, type?: string, promptinfo?: string) => {
    if (!query) return;
    setLoading(true);
    setAnswer('');
    try {
      await streamFetch({
        url: `${process.env.REACT_APP_API_URL}/enterprise/chat/aiChattingStream`,
        data: {
          query, // 用户问题
          reportId, // 用户报告id
          aiType: promptinfo ? '' : type ?? useType, // AI类型
          // language,
          promptinfo,
        },
        onMessage: e => {
          setAnswer(pre => `${pre}${e}`);
        },
        abortCtrl: new AbortController(),
      });
    } finally {
      setLoading(false);
    }
  };

  useMount(() => {
    sendAi(selectText);
  });

  const onCopy = () => {
    if (loading) {
      return;
    }
    const copySuccess = copyToClipboard(answer);
    if (copySuccess) {
      Toast('success', I18N.carbonFootprint3.copySuccessful);
    } else {
      Toast('error', I18N.dashborad.copyFailed);
    }
  };

  const send = () => {
    if (inputValue.length === 0) {
      return;
    }
    if (modalType === 'tip' && answer.length === 0) {
      setQuestion(inputValue);
      sendAi(inputValue, useType);
      setInputValue('');
    } else {
      setQuestion(inputValue);
      sendAi(answer, useType, inputValue);
      setInputValue('');
    }
  };

  const changeFuncType = (type: 'polish' | 'summary' | 'expand') => {
    sendAi(selectText, type);
    setUseType(type);
  };

  const showAnswer = modalType === 'select' || answer.length > 0;
  return (
    <div className={styles.wrapper}>
      <div className={styles.logo}>
        <img src={aiLogoPng} alt='' className={styles.logoImg} />
        <div
          className={styles.close}
          onClick={() => {
            setQuestion('');
            close?.();
          }}
        >
          <img src={closeSvg} alt='' />
        </div>
      </div>
      <div className={styles.question}>{question}</div>
      {showAnswer && (
        <div className={styles.answer}>
          <div className={styles.answerContent}>{answer}</div>
          {answer.length > 0 && (
            <div className={styles.operation}>
              <div className={styles.insert} onClick={insertTextCb}>
                {I18N.components.insert}
              </div>
              <div className={styles.copy} onClick={() => onCopy()}>
                {I18N.carbonFootprint.copy}
              </div>
            </div>
          )}
        </div>
      )}
      {loading && (
        <div className={styles.loadingWrapper}>
          <img className={styles.loading} src={loadingGif} alt='' />
        </div>
      )}
      {modalType === 'select' && (
        <div className={styles.types}>
          {aiFuncs.map(item => (
            <Tooltip
              key={item.type}
              title={item.title}
              getPopupContainer={node => node}
            >
              <div
                key={item.type}
                className={classNames(styles.type, {
                  [styles.selected]: useType === item.type,
                })}
                title={item.title}
                onClick={() => changeFuncType(item.type)}
              >
                <img
                  src={useType === item.type ? item.ColorIcon : item.icon}
                  alt=''
                />
                <div>{item.title}</div>
              </div>
            </Tooltip>
          ))}
        </div>
      )}
      <div className={styles.inputBox}>
        <div className={styles.input}>
          <Input
            value={inputValue}
            placeholder={
              modalType === 'tip'
                ? I18N.components.enterHere
                : I18N.components.canYouLetMeKnow
            }
            bordered={false}
            onChange={e => setInputValue(e.target.value)}
          />
        </div>
        <div
          className={classNames(styles.send, {
            [styles.canSend]: inputValue.length > 0,
          })}
          onClick={() => send()}
        >
          <img src={sendSvg} alt='' />
        </div>
      </div>
      <div className={styles.footer}>
        {/* <div className={styles.language}>
          <span>目标语言：</span>
          <Select
            defaultValue={language}
            style={{ width: 80 }}
            bordered={false}
            onChange={(value: 'zh' | 'en') => setLanguage(value)}
            options={[
              {
                value: 'en',
                label: I18N.enterpriseCarbonAccount2.english,
              },
              {
                value: 'zh',
                label: I18N.components.chinese,
              },
            ]}
          />
        </div> */}
        <div className={styles.tip}>
          {I18N.enterpriseCarbonAccount2.theAnswerIsProvidedBy}
        </div>
      </div>
    </div>
  );
};
