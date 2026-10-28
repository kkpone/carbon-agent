import I18N from '@src/lang/I18N';
import { uuid } from '@src/utils';
import { useInterval, useMount, useWebSocket } from 'ahooks';
import { Button, Input } from 'antd';
import axios from 'axios';
import classNames from 'classnames';
import { reverse } from 'lodash-es';
import React, { useEffect, useState } from 'react';

import styles from './index.module.less';
import netError from './netError.png';
import resetIcon from './reset2.svg';
import stopIcon from './stop.png';
import {
  chatReport,
  getMoreList,
  getNewTopicId,
  getTopicChat,
} from '../../../../service';
import aiTitle from '../../aiTitle.svg';
import { useScrollToBottom } from '../../hooks';
import sendIcon from '../../send.png';
import { IMessage } from '../../type';
import { Answer } from '../Answer';
import { Question } from '../Question';

enum ReadyState {
  Connecting = 0,
  Open = 1,
  Closing = 2,
  Closed = 3,
}

let CancelTokenSource = axios.CancelToken.source();

enum MessageType {
  'question' = 'question',
  'answer' = 'answer',
}

const { TextArea } = Input;

interface ContentProps {
  // Add any props you need for your component here
  reportId: string;
}

export const Content: React.FC<ContentProps> = props => {
  const { reportId } = props;

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [topicId, setTopicId] = useState<number | undefined>();

  const [loading, setLoading] = useState(false);

  const { scrollRef, setAutoScroll } = useScrollToBottom();

  const [quickQuestions, setQuickQuestions] = useState<
    { id: number; userContent: string }[]
  >([]);

  useMount(async () => {
    const result = await getMoreList();
    setQuickQuestions(result.data.data);
  });

  useMount(async () => {
    const data = await getTopicChat({ reportId });
    const newMessage: IMessage[] = [];

    reverse(data.data.data).forEach(item => {
      newMessage.push({
        ...item,
        type: MessageType.question,
        content: item.userContent,
        id: item.id.toString(),
        netError: false,
        time: item.createTime,
      });
      newMessage.push({
        ...item,
        type: MessageType.answer,
        content: item.aiContent,
        id: item.id.toString(),
        netError: false,
        time: item.createTime,
      });
    });
    if (data.data.data.length > 0) {
      setTopicId(data.data.data[0].topicId);
    }
    if (newMessage.length === 0) {
      const result = await getNewTopicId();
      setTopicId(result.data.data.sid);
    }
    setMessages(newMessage);
  });

  const [error, setError] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [responding, setResponding] = useState(false);

  const { readyState, sendMessage, latestMessage, connect, disconnect } =
    useWebSocket(
      `${process.env.REACT_APP_API_URL_WSS}/enterprise/websocket/chat/${topicId}`,
      {
        manual: true,
        onError: () => {
          setError(true);
          setReconnecting(false);
        },
        onOpen: () => {
          setError(false);
          setReconnecting(false);
        },
      },
    );

  useEffect(() => {
    if (topicId) {
      connect?.();
    }
  }, [topicId, connect]);

  useEffect(() => {
    if (latestMessage?.data) {
      if (latestMessage?.data === 'isOnlineSucc') {
        return;
      }
      if (!responding) {
        return;
      }
      setLoading(false);
      let content = '';
      try {
        content = JSON.parse(latestMessage.data).content;
      } catch (error) {
        content = '';
      }
      setMessages(pre => {
        if (pre[pre.length - 1]?.type === MessageType.question) {
          return [
            ...pre,
            {
              type: MessageType.answer,
              content,
              id: uuid(),
              netError: false,
              time: Date.now().toString(),
            },
          ];
        }
        const last = pre[pre.length - 1];
        const test = pre.slice(0, pre.length - 1);
        return [
          ...test,
          {
            ...last,
            content: `${last.content}${content}`,
          },
        ];
      });
    }
  }, [latestMessage]);

  // 分钟心跳，避免 websocket 断联
  useInterval(() => {
    if (readyState === ReadyState.Open) {
      sendMessage?.('ping');
    }
  }, 1000 * 60);

  const send = async (value?: string) => {
    if ((inputValue || value || '').length === 0) {
      return;
    }
    setLoading(true);
    const message = {
      type: MessageType.question,
      content: inputValue || value || '',
      id: uuid(),
      netError: false,
      time: Date.now().toString(),
    };
    setMessages(pre => [...pre, message]);
    setAutoScroll(true);
    setTimeout(() => {
      setInputValue('');
    }, 0);
    CancelTokenSource = axios.CancelToken.source();
    setResponding(true);
    await chatReport({
      reportId: Number(reportId),
      query: inputValue || value || '',
      topicId: topicId?.toString() || '',
      CancelToken: CancelTokenSource.token,
    }).finally(() => {
      setLoading(false);
      setAutoScroll(false);
      setResponding(false);
    });
  };

  const reset = async () => {
    setMessages([]);
    disconnect?.();
    const result = await getNewTopicId();
    setTopicId(result.data.data.sid);
  };

  const cancel = () => {
    setResponding(false);
    CancelTokenSource.cancel();
  };

  return (
    // Add your JSX code here
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.text}>
          <img src={aiTitle} alt='' />
        </span>
        <span className={styles.reset} onClick={() => reset()}>
          <img src={resetIcon} alt='' />
          {I18N.enterpriseCarbonAccount2.resetConversation}
        </span>
      </div>
      <div
        className={styles.content}
        ref={scrollRef}
        onTouchStart={() => setAutoScroll(false)}
      >
        {error && (
          <div className={styles.error}>
            <img src={netError} alt='' />
            {I18N.enterpriseCarbonAccount2.theNetworkIsNotAwesome}
            <Button
              type='primary'
              loading={reconnecting}
              disabled={reconnecting}
              onClick={() => {
                setReconnecting(true);
                connect?.();
              }}
            >
              {I18N.enterpriseCarbonAccount2.retry}
            </Button>
          </div>
        )}
        {!error && (
          <div className={styles.msgWrapper}>
            <Answer
              message={{
                id: 'ans',
                content: I18N.enterpriseCarbonAccount2.helloImXiao,
                time: 'time',
                type: MessageType.answer,
                netError: false,
              }}
              key='ans=answer'
            />
            <div className={styles.quickWrapper}>
              {quickQuestions.map(item => (
                <span
                  className={styles.quickQuestions}
                  key={item.id}
                  onClick={() => {
                    send(item.userContent);
                  }}
                >
                  {item.userContent}
                </span>
              ))}
            </div>
            {messages.map(item =>
              item.type === MessageType.question ? (
                <Question message={item} key={`${item.id}question`} />
              ) : (
                <Answer message={item} key={`${item.id}answer`} />
              ),
            )}
            {loading && (
              <div className={styles.box}>
                {I18N.enterpriseCarbonAccount2.inReportAnalysis}
                <img
                  src='https://oss-saas.carbonstop.com/carbonAI/loading.gif'
                  className={styles.loading}
                  alt=''
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className={styles.footer}>
        <div className={styles.inputWrapper}>
          <TextArea
            className={styles.textarea}
            placeholder={I18N.enterpriseCarbonAccount2.toTheAiAssistant}
            autoSize={{ minRows: 1, maxRows: 6 }}
            value={inputValue}
            onPressEnter={e => {
              if (!(e.altKey || e.ctrlKey || e.shiftKey) && !responding) {
                send();
              } else if (e.altKey || e.ctrlKey) {
                setInputValue(`${inputValue}\n`);
              }
            }}
            onChange={e => {
              setInputValue(e.target.value);
            }}
          />
          {!responding && (
            <div
              className={classNames(styles.submit, {
                [styles.canSubmit]: inputValue.length > 0 && !loading,
              })}
              onClick={() => {
                if (responding) {
                  cancel();
                } else {
                  send();
                }
              }}
            >
              <img src={sendIcon} alt='' />
            </div>
          )}
          {responding && (
            <div
              className={styles.stop}
              onClick={() => {
                if (responding) {
                  cancel();
                } else {
                  send();
                }
              }}
            >
              <img src={stopIcon} alt='' />
            </div>
          )}
        </div>
        <div className={styles.tip}>
          {I18N.enterpriseCarbonAccount2.theAnswerIsProvidedBy}
        </div>
      </div>
    </div>
  );
};
