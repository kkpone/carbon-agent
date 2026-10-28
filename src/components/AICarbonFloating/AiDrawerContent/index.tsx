/* eslint-disable no-nested-ternary */
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import abbSvg from '@src/assets/icon/esg/abb.svg';
import aiSvg from '@src/assets/icon/esg/ai.svg';
import extensionSvg from '@src/assets/icon/esg/extension.svg';
import polishSvg from '@src/assets/icon/esg/polish.svg';
import upArrowSvg from '@src/assets/icon/esg/upArrow.svg';
import aiStarSvg from '@src/assets/svg/aiStar.svg';
import circleCloseSvg from '@src/assets/svg/circle_close.svg';
import I18N from '@src/lang/I18N';
import { useLatest, useMount } from 'ahooks';
import { Drawer, Dropdown, MenuProps, Tooltip, UploadFile } from 'antd';
import classNames from 'classnames';
import { isNil, omit } from 'lodash-es';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';

import { streamFetch } from '@/api/streamFetch';
// import { AppendixFile } from '@/components/Appendix/File';
// import { AppendixLink } from '@/components/Appendix/Link';
import { AppendixItem } from '@/components/Appendix/ShowList';
// import { AppendixText } from '@/components/Appendix/Text';
import FileUploadModal, { fileIconMap } from '@/components/FileUploadModal';
import { IconAlibaba, IconAlibabaNew } from '@/components/iconfont';
import { uuid } from '@/utils';

import styles from './index.module.less';
// import linkSvg from './link.svg';
import {
  BusinessRequest,
  deleteTopic,
  EnterpriseCarbonToolInfo,
  getFootprint3QuestionGuide,
  getHistoryTopic,
  getMessagesByTopicId,
  getNormalQuestionGuide,
  getQuestionGuideByMsg,
  // getQuestionGuide,
  getSid,
  getToolBar,
} from './service';
import { useAICarbonFloating } from '../AICarbonContext';
import { Answer } from '../Answer/index';
import { Question } from '../Question/index';
import { AI_HISTORY_STATUS, AI_INPUT_MENU_ITEMS_LABEL } from '../constant';
import defaultIcon from '../image/default.svg';
import historyIcon from '../image/history.svg';

export interface IAiDrawerContentProps {
  selectText: string;
  insertText?: (text: string) => void;
  selected?: boolean;
  setSelectNone?: () => void;
  needNewChat?: boolean;
  setNeedNewChat?: (newChat: boolean) => void;
  extra?: string;
  setExtra?: (extra: string) => void;
  ReferencesText: string;
  setReferencesText?: (referencesText: string) => void;
}

const actItems = [
  {
    key: '1',
    label: I18N.components.polishing,
    icon: polishSvg,
  },
  {
    key: '2',
    label: I18N.components.elaborateOn,
    icon: extensionSvg,
  },
  {
    key: '3',
    label: I18N.components.abbreviation,
    icon: abbSvg,
  },
];

const actPrompt = {
  '1': I18N.components.pleasePolishAndSelect,
  '2': I18N.components.pleaseExpandTheSelection,
  '3': I18N.components.pleaseSummarizeTheSelection,
} as const;

type MessageType = {
  role: 'user' | 'assistant';
  content: string;
  time: string;
  uuid: string;
  dataType?: 'json' | 'markdown';
  historyId?: number;
  jsonList?: Record<string, any>[] | null;
  status?: number;
  appendix?: AppendixItem[];
  referContent?: string;
};

export const AiDrawerContent: FC<IAiDrawerContentProps> = memo(props => {
  const { selectText, setSelectNone, ReferencesText, setReferencesText } =
    props;

  const {
    extra,
    setExtra,
    accountId,
    setAccountId,
    topicId,
    setTopicId,
    isExpanded,
    setExpanded,
    isOrgAiAssistant,
    setIsOrgAiAssistant,
    extraFunc,
    fromId,
    inputMenuItems = [],
    activeMenuKey,
    setActiveMenuKey,
  } = useAICarbonFloating();

  const [actItem, setActItem] = useState<string>('');

  const [innerSelectText, setInnerSelectText] = useState<string>('');
  const [historyTopic, setHistoryTopic] = useState<
    { id: number; topicTitle: string }[]
  >([]);

  const [messages, setMessages] = useState<MessageType[]>([]);

  const bottomDiv = useRef<HTMLDivElement>(null);

  const [toolBar, setToolBar] = useState<EnterpriseCarbonToolInfo[]>([]);

  const [questionGuide, setQuestionGuide] = useState<string[]>([]);

  const [historyPending, setHistoryPending] = useState(false);

  const loopHistoryTimer = useRef<NodeJS.Timeout>();

  const [inputMenuOpen, setInputMenuOpen] = useState(false);

  const [fileList, setFileList] = useState<
    UploadFile<{ data: { name: string; url: string } }>[]
  >([]);

  const [deepThink, setDeepThink] = useState(0);

  const [fileModalOpen, setFileModalOpen] = useState(false);

  const refreshQuestionGuideByMsg = async () => {
    if (!topicId) {
      return;
    }
    const result = await getQuestionGuideByMsg({
      topicId: topicId || 0,
    });
    setQuestionGuide(result.data.data);
    setTimeout(() => {
      bottomDiv.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 32 * 4);
  };

  const refreshQuestionGuideByNewAccount = async () => {
    const result = await getNormalQuestionGuide();
    setQuestionGuide(result.data.data.map(item => item.userContent));
  };

  const refreshQuestionGuide = async () => {
    if (!topicId) {
      return;
    }
    if (accountId) {
      const result = await getFootprint3QuestionGuide({
        accountId,
      });
      setQuestionGuide(result.data.data);
    } else if (isOrgAiAssistant) {
      const result = await getQuestionGuideByMsg({
        topicId: topicId || 0,
      });
      setQuestionGuide(result.data.data);
    } else {
      // const result = await getQuestionGuide({
      //   topicId: topicId || 0,
      // });
      // setQuestionGuide(result.data.data);
      // const result = await getNormalQuestionGuide();
      // setQuestionGuide(result.data.data.map(item => item.userContent));
    }
  };

  const activeMenu = inputMenuItems.find(item => item.key === activeMenuKey);

  useMount(() => {
    if (toolBar.length > 0) {
      return;
    }
    getToolBar({ type: 6 }).then(res => {
      setToolBar(res.data.data.choseFunction);
    });
  });

  useEffect(() => {
    if (actItem) {
      setInputValue(actPrompt[actItem]);
    }
  }, [actItem]);

  useEffect(() => {
    if (extra && isExpanded) {
      setInputValue(extra);
      setExtra?.('');
      const el = textareaRef.current;

      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
      setTimeout(() => {
        sendMsg();
      }, 500);
    }
  }, [extra, isExpanded]);

  const createTopicId = async () => {
    const result = await getSid();
    setTopicId(result.data.data?.sid);
  };

  // useEffect(() => {
  //   if (needNewChat) {
  //     setInputValue(extra || '');
  //     setExtra?.('');
  //     setMessages([]);
  //     setTopicId(undefined);
  //     setExtra?.('');
  //     setNeedNewChat?.(false);
  //     if (isExpanded) {
  //       if (askOrgAiAssistantId) {
  //         setTopicId(askOrgAiAssistantId);
  //         setAskOrgAiAssistantId(undefined);
  //         getMsg(askOrgAiAssistantId.toString()).then(() => {
  //           if (inputValue) {
  //             setTimeout(() => {
  //               sendMsg();
  //             }, 160);
  //           }
  //         });
  //       }
  //     }
  //   }
  // }, [needNewChat, extra]);

  const fetchHistoryTopic = async (onlyUpdate?: boolean) => {
    const result = await getHistoryTopic({ fromId });
    if (onlyUpdate) {
      setHistoryTopic(result.data.data);
      return;
    }
    if (result.data.data.length === 0) {
      createTopicId();
      refreshQuestionGuideByNewAccount();
    } else {
      setTopicId(result.data.data[0].id);
      setHistoryTopic(result.data.data);
      getMsg(result.data.data[0].id.toString());
    }
  };

  const getMsg = async (topicIdMsg: string) => {
    if (isExpanded) {
      clearInterval(loopHistoryTimer.current);
      const result = await getMessagesByTopicId({
        topicId: topicIdMsg,
      });
      const messagesResult: MessageType[] = [];
      result.data.data.reverse().forEach(item => {
        messagesResult.push({
          role: 'user',
          content: item.userContent,
          time: item.createTime,
          uuid: `user${item.id}`,
          status: item.status,
          dataType: item.dataType,
          historyId: item.id,
          appendix: [
            ...(item.referLink || []).map(link => ({
              type: 'link' as const,
              uuid: uuid(),
              value: { showName: link },
            })),
            ...(item.referText || []).map(text => ({
              type: 'text' as const,
              uuid: uuid(),
              value: { showName: text },
            })),
            ...(item.referFiles || []).map(file => ({
              type: 'file' as const,
              uuid: uuid(),
              value: { showName: file.name, fileUrl: file.url },
            })),
          ],
          referContent: item.referContent,
        });
        messagesResult.push({
          role: 'assistant',
          content: item.aiContent,
          time: item.createTime,
          uuid: `assistant${item.id}`,
          status: item.status,
          dataType: item.dataType,
          jsonList: item.jsonList,
          historyId: item.id,
        });
      });

      const lastJsonAnswer = messagesResult.findLast(
        item => item.role === 'assistant' && item.dataType === 'json',
      );

      const isPending = lastJsonAnswer?.status === AI_HISTORY_STATUS.PENDING;
      setHistoryPending(isPending);
      setMessages(messagesResult);
      setTimeout(() => {
        bottomDiv.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 32 * 4);

      if (isPending) {
        loopHistoryTimer.current = setTimeout(() => getMsg(topicIdMsg), 1000);
      }
    }
  };

  useEffect(() => {
    clearInterval(loopHistoryTimer.current);
    if (isExpanded) {
      if (topicId) {
        getMsg(topicId.toString());
        refreshQuestionGuide();
      } else {
        fetchHistoryTopic();
      }
      // if (askOrgAiAssistantId) {
      //   setTopicId(askOrgAiAssistantId);
      //   setAskOrgAiAssistantId(undefined);
      //   getMsg(askOrgAiAssistantId.toString()).then(() => {
      //     if (inputValue) {
      //       setTimeout(() => {
      //         sendMsg();
      //       }, 160);
      //     }
      //   });
      //   return;
      // }
      // if (needNewChat) {
      //   createTopicId();
      //   setNeedNewChat?.(false);
      //   setAccountId(undefined);
      // } else {
      //   fetchHistoryTopic();
      // }
    }
  }, [isExpanded, topicId]);

  useEffect(() => {
    setInnerSelectText(selectText);
  }, [selectText]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [inputValue, setInputValue] = useState<string>(extra || '');

  const handleInput = e => {
    const { value } = e.target;
    setInputValue(value);
    refreshInputHeight();

    const inputData = (e.nativeEvent as InputEvent).data;
    if (inputData === '/') {
      setInputMenuOpen(true);
    }
  };

  const refreshInputHeight = useCallback(() => {
    setTimeout(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }, 120);
  }, []);

  const enable =
    (inputValue.length > 0 || !isNil(activeMenuKey)) && !historyPending;

  const deepThinkDisabled = fileList.length > 0;

  const [appendix, setAppendix] = useState<AppendixItem[]>([]);

  // const items: MenuProps['items'] = [
  //   {
  //     key: '1',
  //     label: (
  //       <AppendixText
  //         submit={(value: string) => {
  //           setAppendix(prev => [
  //             ...prev,
  //             {
  //               value: {
  //                 showName: value,
  //               },
  //               type: 'text',
  //               uuid: uuid(),
  //             },
  //           ]);
  //         }}
  //       />
  //     ),
  //   },
  //   {
  //     key: '2',
  //     label: (
  //       <AppendixLink
  //         submit={(value: string) => {
  //           setAppendix(prev => [
  //             ...prev,
  //             {
  //               value: {
  //                 showName: value,
  //               },
  //               type: 'link',
  //               uuid: uuid(),
  //             },
  //           ]);
  //         }}
  //       />
  //     ),
  //   },
  //   {
  //     key: '3',
  //     label: (
  //       <AppendixFile
  //         submit={(
  //           value: {
  //             showName: string;
  //             fileSize: string;
  //             fileUrl: string;
  //           }[],
  //         ) => {
  //           setAppendix(prev =>
  //             prev.concat(
  //               value.map(item => ({
  //                 value: {
  //                   showName: item.showName,
  //                   fileSize: item.fileSize,
  //                   fileUrl: item.fileUrl,
  //                 },
  //                 type: 'file',
  //                 uuid: uuid(),
  //               })),
  //             ),
  //           );
  //         }}
  //       />
  //     ),
  //   },
  // ];

  /** loading 期间不能操作 */
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const sendQuery = useLatest(inputValue);

  const sendMsg = async (preSendData?: BusinessRequest) => {
    if (
      !topicId ||
      loading ||
      historyPending ||
      (!sendQuery.current && isNil(activeMenuKey) && !preSendData)
    ) {
      return;
    }
    const sendData: BusinessRequest = {
      query: sendQuery.current,
      referContent: preSendData?.referContent ?? ReferencesText,
      topicId: `${topicId}`,
      detail: true,
      stream: true,
      accountId,
      referFiles: appendix
        .filter(item => item.type === 'file')
        .map(item => ({
          name: item.value.showName,
          url: item.value.fileUrl || '',
        })),
      referLink: appendix
        .filter(item => item.type === 'link')
        .map(item => item.value.showName),
      referText: appendix
        .filter(item => item.type === 'text')
        .map(item => item.value.showName),
    };
    setMessages(pre => [
      ...pre,
      {
        role: 'user',
        content: preSendData?.query ?? sendQuery.current,
        referContent: sendData.referContent,
        uuid: uuid(),
        time: new Date().toLocaleString(),
        appendix: preSendData?.appendix ?? appendix,
      },
      {
        role: 'assistant',
        content: '',
        uuid: uuid(),
        time: new Date().toLocaleString(),
      },
    ]);
    if (!preSendData) {
      setInputValue('');
      setExtra?.('');
      setReferencesText?.('');
      setAppendix([]);
      setInnerSelectText('');
      refreshInputHeight();
    }
    setActItem('');
    setTimeout(() => {
      bottomDiv.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 32 * 4);
    setSelectNone?.();
    setLoading(true);
    setIsSending(true);
    setQuestionGuide([]);

    if (activeMenuKey) {
      const currentMenuKey = activeMenuKey;
      try {
        setFileList([]);
        setActiveMenuKey(undefined);
        setDeepThink(0);
        await inputMenuItems
          .find(item => item.key === currentMenuKey)
          ?.onExecute?.({
            topicId: `${topicId}`,
            accountId,
            deepThink,
            fileUrl: fileList.map(file => ({
              name: file.response?.data?.name || '',
              url: file.response?.data?.url || '',
            })),
            content: sendQuery.current,
          });
        getMsg(topicId.toString());
      } finally {
        setLoading(false);
        setIsSending(false);
      }
      return;
    }
    await streamFetch({
      url: `${process.env.REACT_APP_API_URL}/ai/chat/aiAssistantChatting`,
      data: preSendData ?? sendData,
      onMessage: e => {
        setIsSending(false);
        setMessages(pre => {
          const last = pre[pre.length - 1];
          if (last.role === 'user') {
            return [
              ...pre,
              {
                role: 'assistant',
                content: '',
                uuid: uuid(),
                time: new Date().toLocaleDateString(),
              },
            ];
          }
          return [
            ...pre.slice(0, pre.length - 1),
            {
              ...last,
              content: `${last.content}${e}`,
            },
          ];
        });
        setTimeout(() => {
          bottomDiv.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 32 * 4);
      },
      abortCtrl: new AbortController(),
    })
      .then(() => {
        refreshQuestionGuideByMsg();
      })
      .finally(() => {
        setLoading(false);
        setIsSending(false);
      });
  };

  const resend = (uuid: string) => {
    const answerIndex = messages.findIndex(item => item.uuid === uuid);
    const question = messages[answerIndex - 1];
    sendMsg({
      referContent: question.referContent,
      query: question.content,
      topicId: `${topicId}`,
      detail: true,
      stream: true,
      referFiles:
        question.appendix
          ?.filter(item => item.type === 'file')
          .map(item => ({
            name: item.value.showName,
            url: item.value.fileUrl || '',
          })) || [],
      referLink:
        question?.appendix
          ?.filter(item => item.type === 'link')
          .map(item => item.value.showName) || [],
      referText:
        question?.appendix
          ?.filter(item => item.type === 'text')
          .map(item => item.value.showName) || [],
      appendix: question?.appendix,
      accountId,
    });
  };

  const [historyOpen, setHistoryOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Backspace') {
      const input = e.target as HTMLTextAreaElement;
      const cursorStart = input.selectionStart;
      const cursorEnd = input.selectionEnd;
      const { value } = input;

      if (cursorStart === cursorEnd) {
        // 没有选中文本，直接按退格（删除光标前的一个字符）
        // cursorStart - 1 就是即将被删除的字符的索引
        if (cursorStart > 0 && value[cursorStart - 1] === '/') {
          setInputMenuOpen(false);
        }
      } else {
        // 选中了一段文本，然后按退格
        const selectedText = value.slice(cursorStart, cursorEnd);
        if (selectedText.includes('/')) {
          setInputMenuOpen(false);
        }
      }
    }
    if (e.key === 'Enter') {
      if (!e.ctrlKey && !e.metaKey) {
        // 只有普通的Enter键才发送消息
        e.preventDefault();
        if (enable) {
          sendMsg();
        }
      } else {
        // Ctrl+Enter 或 Cmd+Enter 手动插入换行符
        e.preventDefault();
        const textarea = e.target as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const { value } = textarea;
        const newValue = `${value.substring(0, start)}\n${value.substring(
          end,
        )}`;

        setInputValue(newValue);

        // 设置光标位置到换行符后
        setTimeout(() => {
          textarea.selectionStart = start + 1;
          textarea.selectionEnd = start + 1;
          refreshInputHeight();
        }, 0);
      }
    }
  };

  const sendQuestionGuide = (questionGuideInput: string) => {
    setInputValue(questionGuideInput);
    setTimeout(() => {
      sendMsg();
    }, 160);
  };

  const delTopic = async (id: number) => {
    await deleteTopic({
      topicId: id,
    });
    fetchHistoryTopic();
    // setTopicId(item.id);
    // getMsg(item.id.toString());
    // setHistoryOpen(false);
  };

  useEffect(() => {
    if (!activeMenuKey) {
      setDeepThink(0);
      setFileList([]);
    }
  }, [activeMenuKey]);
  return (
    <div className={styles.wrapper}>
      <Drawer
        title={null}
        placement='left'
        closable={false}
        width={346}
        onClose={() => setHistoryOpen(false)}
        open={historyOpen}
        styles={{
          body: {
            padding: '24px',
          },
        }}
        getContainer={false}
        mask={false}
      >
        <div className={styles.historyWrapper}>
          <div className={styles.historyHeader}>
            <div className={styles.historyHeaderTitle}>
              {I18N.components.historicalDialogue}
            </div>
            <div
              className={styles.historyHeaderClose}
              onClick={() => setHistoryOpen(false)}
            >
              <CloseOutlined />
            </div>
          </div>
          <div className={styles.historyList}>
            {historyTopic.map(item => (
              <div
                className={classNames(styles.historyItemWrapper, {
                  [styles.active]: item.id === topicId,
                })}
              >
                <Tooltip title={item.topicTitle} placement='top'>
                  <div
                    key={item.id}
                    className={classNames(styles.historyItem)}
                    onClick={() => {
                      setTopicId(item.id);
                      getMsg(item.id.toString());
                      setHistoryOpen(false);
                    }}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='14'
                      height='15'
                      viewBox='0 0 14 15'
                      fill='none'
                    >
                      <path
                        d='M5.4925 2.78339C5.6125 2.35672 6.22584 2.35672 6.34584 2.78339L6.9325 4.89006C7.26584 6.07672 8.19917 7.01006 9.39917 7.34339L11.5058 7.94339C11.9325 8.06339 11.9325 8.67672 11.5058 8.79672L9.39917 9.38339C8.19917 9.73005 7.26584 10.6501 6.9325 11.8501L6.34584 13.9567C6.22584 14.3834 5.6125 14.3834 5.4925 13.9567L4.8925 11.8501C4.55917 10.6634 3.62584 9.73005 2.43917 9.38339L0.332503 8.79672C0.237484 8.77278 0.153175 8.71781 0.092942 8.64052C0.0327093 8.56323 0 8.46804 0 8.37006C0 8.27207 0.0327093 8.17688 0.092942 8.09959C0.153175 8.0223 0.237484 7.96733 0.332503 7.94339L2.43917 7.34339C3.62584 7.01006 4.55917 6.07672 4.8925 4.89006L5.4925 2.78339ZM11.1192 0.823389C11.1592 0.690055 11.3325 0.690055 11.3725 0.823389L11.6125 1.65006C11.7458 2.14339 12.1325 2.53006 12.6258 2.66339L13.4525 2.90339C13.5858 2.94339 13.5858 3.11672 13.4525 3.15672L12.6258 3.39672C12.1325 3.53006 11.7458 3.91672 11.6125 4.41006L11.3725 5.23672C11.3325 5.37006 11.1592 5.37006 11.1192 5.23672L10.8792 4.41006C10.7458 3.91672 10.3592 3.53006 9.86584 3.39672L9.03917 3.15672C8.90584 3.11672 8.90584 2.94339 9.03917 2.90339L9.86584 2.66339C10.3592 2.53006 10.7458 2.14339 10.8792 1.65006L11.1192 0.823389Z'
                        fill='#026961'
                      />
                    </svg>
                    <span className={styles.historyItemTitle}>
                      {item.topicTitle}
                    </span>
                  </div>
                </Tooltip>
                <div
                  className={styles.delHistoryItem}
                  onClick={() => delTopic(item.id)}
                >
                  <IconAlibaba type='icon-icon_delete' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Drawer>
      <FileUploadModal
        title={I18N.esg.uploadData}
        open={fileModalOpen}
        files={fileList}
        maxCount={5}
        maxSize={20}
        zIndex={20000}
        templateDictType={activeMenu?.templateDictType}
        templateDictValue={activeMenu?.templateDictValue}
        onClose={() => setFileModalOpen(false)}
        onConfirm={files => {
          setFileList(files);
          setFileModalOpen(false);
          if (files.length > 0) {
            setDeepThink(0);
          }
        }}
      />
      <div className={styles.header}>
        <div className={styles.title}>
          <img src={defaultIcon} className={styles.icon} alt='' />
          <div className={styles.titleText}>
            {I18N.components.aiSmallCarbon2}
          </div>
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <img
            src={historyIcon}
            className={styles.historyIcon}
            onClick={() => {
              setHistoryOpen(true);
              fetchHistoryTopic(true);
            }}
            alt=''
          />
        </div>
        <div className={styles.headerRight}>
          <div
            className={styles.clear}
            onClick={async () => {
              setMessages([]);
              if (isNil(fromId)) {
                setAccountId(undefined);
              }
              setIsOrgAiAssistant(false);
              await createTopicId();
              refreshQuestionGuideByNewAccount();
            }}
          >
            <PlusOutlined />
            <span>{I18N.components.newDialogue}</span>
          </div>
          <div
            className={styles.close}
            onClick={() => {
              setExpanded(false);
              setReferencesText?.('');
            }}
          >
            <CloseOutlined />
          </div>
        </div>
      </div>
      <div className={styles.content}>
        {messages.map((item, index) => {
          if (item.role === 'user') {
            return (
              <Question
                key={item.uuid}
                content={item.content}
                appendix={item.appendix || []}
                referContent={item.referContent}
              />
            );
          }

          return (
            <Answer
              key={item.uuid}
              dataType={item.dataType}
              jsonList={item.jsonList}
              status={item.status}
              content={item.content}
              isLast={index === messages.length - 1}
              isLastJsonAnswer={
                item.dataType === 'json' &&
                messages
                  .slice(index + 1)
                  .every(answer => answer.dataType !== 'json')
              }
              questionGuide={questionGuide}
              loading={isSending && index === messages.length - 1}
              resend={() => resend(item.uuid)}
              sendQuestionGuide={sendQuestionGuide}
              onFailed={async () => {
                await extraFunc?.onHistoryFailed?.({
                  accountId,
                  id: item.historyId,
                });
                getMsg(topicId!.toString());
              }}
            />
          );
        })}
        {messages.length === 0 && (
          <div className={styles.empty}>
            {/* <img src={emptyIcon} alt='' /> */}
            <div className={styles.emptyTitle}>
              {I18N.components.helloIAmXiao}
            </div>
            <div className={styles.emptyText}>
              {I18N.components.yourExclusiveA}
            </div>
            <div className={styles.toolBar}>
              {questionGuide.map(item => (
                <div
                  key={item}
                  className={styles.toolBarItem}
                  onClick={() => {
                    setInputValue(item);
                    setTimeout(() => {
                      sendMsg();
                    }, 320);
                  }}
                >
                  {/* <img src={item.functionIcon} alt='' /> */}
                  <img src={aiStarSvg} alt='' />
                  <span className={styles.toolBarItemText}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomDiv} />
      </div>
      {inputMenuItems.length > 0 && (
        <Dropdown
          placement='topLeft'
          trigger={['click']}
          menu={{
            activeKey: activeMenuKey,
            items: inputMenuItems.map(menuItem =>
              omit(menuItem, 'onClick'),
            ) as MenuProps['items'],
            onClick: ({ key }) => {
              setActiveMenuKey(key);
              if (inputValue.endsWith('/') || inputValue.endsWith('、')) {
                setInputValue(inputValue.slice(0, -1));
              }
            },
          }}
          open={inputMenuOpen}
          overlayStyle={{
            zIndex: 20000,
          }}
          onOpenChange={setInputMenuOpen}
        >
          <div className={styles.inputMenuTrigger} />
        </Dropdown>
      )}
      <div className={styles.footer}>
        <div className={styles.inputWrapper}>
          {ReferencesText && (
            <div className={styles.referencesTextWrapper}>
              <div className={styles.referencesTextIcon}>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='10'
                  height='10'
                  viewBox='0 0 10 10'
                  fill='none'
                >
                  <path
                    d='M9.39853 6.62945C9.4307 6.59731 9.45621 6.55914 9.47363 6.51714C9.49104 6.47513 9.5 6.4301 9.5 6.38462C9.5 6.33915 9.49104 6.29412 9.47363 6.25211C9.45621 6.2101 9.4307 6.17193 9.39853 6.13979L6.62924 3.37063C6.59709 3.33848 6.55893 3.31299 6.51694 3.29559C6.47494 3.2782 6.42993 3.26924 6.38447 3.26924C6.33902 3.26924 6.294 3.2782 6.25201 3.29559C6.21001 3.31299 6.17185 3.33848 6.13971 3.37063C6.10756 3.40277 6.08207 3.44093 6.06467 3.48293C6.04728 3.52492 6.03832 3.56993 6.03832 3.61539C6.03832 3.66085 6.04728 3.70586 6.06467 3.74786C6.08207 3.78985 6.10756 3.82801 6.13971 3.86016L8.31807 6.03853L3.61538 6.03853C2.27707 6.03853 1.19232 4.95364 1.19232 3.61546L1.19232 0.846162C1.19232 0.754354 1.15585 0.666307 1.09093 0.601389C1.02602 0.536471 0.937969 0.5 0.846161 0.5C0.754354 0.5 0.666306 0.536471 0.601388 0.601389C0.53647 0.666307 0.5 0.754354 0.5 0.846162L0.5 3.61546C0.5 5.33586 1.89472 6.73072 3.61538 6.73072L8.31807 6.73072L6.13971 8.90909C6.07479 8.974 6.03832 9.06205 6.03832 9.15385C6.03832 9.24566 6.07479 9.3337 6.13971 9.39861C6.20462 9.46353 6.29267 9.5 6.38447 9.5C6.47628 9.5 6.56432 9.46353 6.62924 9.39861L9.39853 6.62945Z'
                    fill='#676D75'
                  />
                </svg>
              </div>
              <div className={styles.referencesText}>{ReferencesText}</div>
            </div>
          )}
          {innerSelectText && (
            <div>
              <div className={styles.selectText}>
                <div
                  className={styles.close}
                  onClick={() => {
                    setInnerSelectText('');
                    setActItem('');
                  }}
                >
                  <CloseOutlined />
                </div>
                <div className={styles.text}>{innerSelectText}</div>
              </div>
              <div className={styles.actItems}>
                {actItems.map(item => (
                  <div
                    className={classNames(styles.actItem, {
                      [styles.active]: item.key === actItem,
                    })}
                    onClick={() =>
                      setActItem(pre => (pre === item.key ? '' : item.key))
                    }
                    key={item.key}
                  >
                    <img src={item.icon} className={styles.svg} alt='' />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={styles.inputContainer}>
            <img src={aiSvg} className={styles.svg} alt='' />
            {activeMenuKey && (
              <>
                <div className={styles.inputMenuTag}>
                  {AI_INPUT_MENU_ITEMS_LABEL(activeMenuKey)}
                  <div
                    className={styles.closeIcon}
                    onClick={() => {
                      setActiveMenuKey(undefined);
                      setFileList([]);
                    }}
                  >
                    <img src={circleCloseSvg} alt='' />
                  </div>
                </div>
                <div className={styles.fileUploadTip}>
                  <span>{I18N.components.ifThereIsABuildingModule}</span>
                  <Tooltip
                    title={
                      fileList.length >= 5 ? I18N.components.upToUpload : ''
                    }
                    zIndex={20000}
                  >
                    <div
                      className={classNames(styles.fileUploadBtn, {
                        [styles.disabledFileUploadBtn]: fileList.length >= 5,
                      })}
                      onClick={() => {
                        setFileModalOpen(fileList.length < 5);
                      }}
                    >
                      <IconAlibabaNew type='icon-shangchuan' />
                      <span>{I18N.components.clickToUpload}</span>
                    </div>
                  </Tooltip>
                  <span>{I18N.components.emissionInventory}</span>
                </div>
              </>
            )}
            {fileList.length > 0 && (
              <div className={styles.fileList}>
                {fileList.map(file => (
                  <div className={styles.fileItem} key={file.uid}>
                    <IconAlibabaNew
                      className={styles.fileTypeIcon}
                      type={
                        fileIconMap[file.name.split('.').pop() || ''] ||
                        fileIconMap.xls
                      }
                    />
                    <div className={styles.fileName} title={file.name}>
                      {file.name}
                    </div>
                    <div
                      className={styles.closeIcon}
                      onClick={() =>
                        setFileList(fileList.filter(f => f.uid !== file.uid))
                      }
                    >
                      <img src={circleCloseSvg} alt='' />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={inputValue}
              className={styles.input}
              placeholder={
                inputMenuItems.length > 0
                  ? isNil(activeMenuKey)
                    ? I18N.components.sendAMessageOrInput
                    : I18N.components.pleaseEnterOther
                  : I18N.components.inputOptimizedText
              }
              rows={1}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
            />
          </div>
          {/* <AppendixList
            items={appendix}
            canDelete
            del={uuid => {
              setAppendix(prev => prev.filter(item => item.uuid !== uuid));
            }}
          /> */}
          <div className={styles.footerRight}>
            {activeMenuKey ? (
              <div
                className={classNames(styles.deepThinkBtn, {
                  [styles.activeDeepThinkBtn]: !!deepThink,
                  [styles.disabledDeepThinkBtn]: deepThinkDisabled,
                })}
                onClick={() => {
                  if (!deepThinkDisabled) {
                    setDeepThink(Number(!deepThink));
                  }
                }}
              >
                <IconAlibabaNew type='icon-icon-shendusikao' />
                <span>{I18N.carbonFootprint3.deepThinking}</span>
              </div>
            ) : (
              <div />
            )}
            {/* <Dropdown menu={{ items }} placement='topLeft'>
              <div className={styles.add}>
                <img src={linkSvg} alt='' />
                <span>{I18N.components.addAttachment}</span>
              </div>
            </Dropdown> */}
            <div
              className={classNames(styles.send, {
                [styles.enable]: enable,
              })}
              onClick={() => sendMsg()}
            >
              <img src={upArrowSvg} alt='' />
            </div>
          </div>
        </div>
        <div className={styles.tip}>{I18N.components.contentByAi}</div>
      </div>
    </div>
  );
});
