import I18N from '@src/lang/I18N';
import { FC, memo, useEffect, useRef, useState } from 'react';
import styles from './index.module.less';
import { CloseOutlined } from '@ant-design/icons';
import aiSvg from '@src/assets/icon/esg/ai.svg';
import upArrowSvg from '@src/assets/icon/esg/upArrow.svg';
import classNames from 'classnames';
import { Dropdown, MenuProps, Tooltip } from 'antd';
import { AppendixText } from '@/components/Appendix/Text';
import { AppendixLink } from '@/components/Appendix/Link';
import { AppendixFile } from '@/components/Appendix/File';
import { getFileIcon, uuid } from '@/utils';
import { AppendixItem, AppendixList } from '@/components/Appendix/ShowList';
import { Question } from '../Question/index';
import { Answer } from '../Answer/index';
import { useLocation } from 'react-router-dom';
import {
  BusinessRequest,
  getChatMessages,
  getDataList,
  getSid,
} from './service';
import { streamFetch } from '@/api/streamFetch';
import linkSvg from './link.svg';
import polishSvg from '@src/assets/icon/esg/polish.svg';
import extensionSvg from '@src/assets/icon/esg/extension.svg';
import abbSvg from '@src/assets/icon/esg/abb.svg';
import { useRequest } from 'ahooks';
import TextWidthOverflow from '@/views/subModules/CarbonFootprintModel/components/byWidth';
import { IconAlibabaNew } from '@/components/iconfont';
// import { getFileIcon } from '@/views/subModules/CarbonFootprintModel/util/index';
import linkIcon from '@src/assets/icon/esg/link.svg';
import textIcon from '@src/assets/icon/esg/text.svg';

export interface IAiDrawerContentProps {
  selectText: string;
  selectTextType: 'polish' | 'summary' | 'expand' | '' | 'continuation';
  setSelectTextType: (
    type: 'polish' | 'summary' | 'expand' | '' | 'continuation',
  ) => void;
  onClose: () => void;
  insertText?: (text: string) => void;
  open: boolean;
  selected?: boolean;
  setSelectNone?: () => void;
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
  polish: I18N.components.pleasePolishAndSelect,
  expand: I18N.components.pleaseExpandTheSelection,
  summary: I18N.components.pleaseSummarizeTheSelection,
  continuation: I18N.components.pleaseContinueWritingTheSelection,
};

type MessageType = {
  role: 'user' | 'assistant';
  content: string;
  time: string;
  uuid: string;
  appendix?: AppendixItem[];
  referContent?: string;
};

export const AiDrawerContent: FC<IAiDrawerContentProps> = memo(props => {
  const {
    selectText,
    selectTextType,
    setSelectTextType,
    onClose,
    insertText,
    open,
    selected,
    setSelectNone,
  } = props;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id') || '0';

  const [actItem, setActItem] = useState<string>('');

  const [innerSelectText, setInnerSelectText] = useState<string>('');
  const [topicId, setTopicId] = useState<number>();

  const [messages, setMessages] = useState<MessageType[]>([]);

  const appendixFileRef = useRef<{
    delFile: (uid: string) => void;
    delAllFiles: () => void;
  }>(null);

  const { data: dataListResult, run } = useRequest(
    () =>
      getDataList({
        reportId: id,
      }),
    {
      refreshDeps: [id, open],
    },
  );

  const dataList = dataListResult?.data?.data || [];

  useEffect(() => {
    if (actItem) {
      setInputValue(actPrompt[actItem]);
    }
  }, [actItem]);

  const createTopicId = async () => {
    if (!id) {
      return;
    }
    const result = await getSid({ reportId: id });
    setTopicId(result.data.data?.sid);
  };
  const getMsg = async () => {
    if (id && open) {
      const result = await getChatMessages({
        reportId: id,
      });
      if (!result.data?.data?.length) {
        createTopicId();
      } else {
        setTopicId(result.data.data[0].topicId);
      }
      const messages: MessageType[] = [];
      result.data.data.reverse().forEach(item => {
        messages.push({
          role: 'user',
          content: item.userContent,
          time: item.createTime,
          uuid: `user${item.id}`,
          appendix: [
            ...(item.referLink || []).map(link => ({
              type: 'link' as const,
              uuid: uuid(),
              value: { showName: link.content, id: link.id },
            })),
            ...(item.referText || []).map(text => ({
              type: 'text' as const,
              uuid: uuid(),
              value: { showName: text.content, id: text.id },
            })),
            ...(item.referFiles || []).map(file => ({
              type: 'file' as const,
              uuid: uuid(),
              value: { showName: file.name, fileUrl: file.url, id: file.id },
            })),
          ],
          referContent: item.referContent,
        });
        messages.push({
          role: 'assistant',
          content: item.aiContent,
          time: item.createTime,
          uuid: `assistant${item.id}`,
        });
      });
      setMessages(messages);
      // setTimeout(() => {
      //   bottomDiv.current?.scrollIntoView({
      //     behavior: 'smooth',
      //   });
      // }, 32 * 4);
    }
  };

  useEffect(() => {
    getMsg();
  }, [id, open]);

  useEffect(() => {
    setInnerSelectText(selectText);
  }, [selectText]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [inputValue, setInputValue] = useState<string>('');

  const handleInput = e => {
    const value = e.target.value;
    setInputValue(value);
    const el = textareaRef.current;

    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  const enable = inputValue.length > 0;

  const [appendix, setAppendix] = useState<AppendixItem[]>([]);

  const bottomDiv = useRef<HTMLDivElement>(null);

  const typeMap = {
    1: 'file',
    2: 'file',
    3: 'link',
    4: 'text',
  } as const;

  const items: MenuProps['items'] = [
    {
      key: '0',
      label: (
        <div
          style={{
            maxHeight: '180px',
            maxWidth: '240px',
            overflowY: 'scroll',
            paddingLeft: '8px',
            borderBottom: '1px solid #E5E7EB',
          }}
          onMouseOver={e => e.stopPropagation()}
        >
          {dataList.map(item => (
            <div
              key={item.id}
              className={styles.menuItem}
              onClick={() => {
                setAppendix(prev => {
                  return [
                    ...prev,
                    {
                      value: {
                        showName: item.name,
                        fileUrl: item.url,
                      },
                      type: typeMap[item.type],
                      uuid: uuid(),
                      id: item.id.toString(),
                    },
                  ];
                });
              }}
            >
              <div className={styles.icon}>
                {typeMap[item.type] === 'text' && (
                  <span className={styles.textIcon}>
                    <img src={textIcon} alt='' />
                  </span>
                )}
                {typeMap[item.type] === 'link' && (
                  <span className={styles.linkIcon}>
                    <img src={linkIcon} alt='' />
                  </span>
                )}
                {typeMap[item.type] === 'file' && (
                  <span className={styles.fileIcon}>
                    <IconAlibabaNew
                      style={{
                        fontSize: 22,
                      }}
                      type={getFileIcon(item.url)}
                    />
                  </span>
                )}
              </div>
              <TextWidthOverflow width={200} value={item.name} />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: '1',
      label: (
        <AppendixText
          submit={(value: string) => {
            setAppendix(prev => {
              return [
                ...prev,
                {
                  value: {
                    showName: value,
                  },
                  type: 'text',
                  uuid: uuid(),
                },
              ];
            });
          }}
        />
      ),
    },
    {
      key: '2',
      label: (
        <AppendixLink
          submit={(value: string) => {
            setAppendix(prev => {
              return [
                ...prev,
                {
                  value: {
                    showName: value,
                  },
                  type: 'link',
                  uuid: uuid(),
                },
              ];
            });
          }}
        />
      ),
    },
    {
      key: '3',
      label: (
        <AppendixFile
          ref={appendixFileRef}
          maxCount={10 - appendix.length}
          submit={(
            value: {
              showName: string;
              fileSize: string;
              fileUrl: string;
              fileUid: string;
              status?: string;
            }[],
          ) => {
            setAppendix(prev => {
              // 创建一个 uid 到 value 的映射
              const valueMap = new Map(value.map(item => [item.fileUid, item]));

              // 存储新增的项
              const newItems: any[] = [];

              // 更新已有项，保持原顺序
              const updatedPrev = prev.map(existingItem => {
                if (
                  existingItem.fileUid &&
                  valueMap.has(existingItem.fileUid)
                ) {
                  const item = valueMap.get(existingItem.fileUid)!;
                  valueMap.delete(existingItem.fileUid); // 标记为已处理
                  return {
                    ...existingItem,
                    value: {
                      showName: item.showName,
                      fileSize: item.fileSize,
                      fileUrl: item.fileUrl,
                      status: item.status,
                    },
                  };
                }
                return existingItem;
              });

              // 将未处理的新项添加到末尾
              valueMap.forEach(item => {
                newItems.push({
                  value: {
                    showName: item.showName,
                    fileSize: item.fileSize,
                    fileUrl: item.fileUrl,
                    status: item.status,
                  },
                  type: 'file',
                  fileUid: item.fileUid,
                  uuid: uuid(),
                });
              });

              return [...updatedPrev, ...newItems];
            });
          }}
        />
      ),
    },
  ];

  const insert = (item: {
    role: 'assistant' | 'user';
    content: string;
    time: string;
    uuid: string;
  }) => {
    insertText?.(item.content);
  };

  const [loading, setLoading] = useState(false);

  const sendMsg = async (preSendData?: BusinessRequest) => {
    if (!topicId || !id || loading || (!inputValue && !preSendData)) {
      return;
    }
    const sendData: BusinessRequest = {
      query: inputValue,
      topicId: `${topicId}`,
      reportId: Number(id),
      referContent: preSendData?.referContent ?? innerSelectText,
      referFiles: appendix
        .filter(item => item.type === 'file')
        .map(item => ({
          name: item.value.showName,
          url: item.value.fileUrl || '',
          id: item.id,
        })),
      referLink: appendix
        .filter(item => item.type === 'link')
        .map(item => ({
          id: item.id,
          content: item.value.showName,
        })),
      referText: appendix
        .filter(item => item.type === 'text')
        .map(item => ({
          id: item.id,
          content: item.value.showName,
        })),
    };
    setMessages(pre => [
      ...pre,
      {
        role: 'user',
        content: preSendData?.query ?? inputValue,
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
      setAppendix([]);
      setInnerSelectText('');
      appendixFileRef.current?.delAllFiles();
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
    await streamFetch({
      url: `${process.env.REACT_APP_API_URL}/esg/frameReport/aiEsgDataChatting`,
      data: preSendData ?? sendData,
      onMessage: e => {
        setMessages(pre => {
          const last = pre[pre.length - 1];
          if (last?.role === 'user') {
            return [
              ...pre,
              {
                role: 'assistant',
                content: '',
                uuid: uuid(),
                time: new Date().toLocaleDateString(),
              },
            ];
          } else {
            return [
              ...pre.slice(0, pre.length - 1),
              {
                ...last,
                content: `${last.content}${e}`,
              },
            ];
          }
        });
        setTimeout(() => {
          bottomDiv.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 32 * 4);
      },
      abortCtrl: new AbortController(),
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    if (selectTextType && open && innerSelectText && inputValue && topicId) {
      sendMsg();
      setSelectTextType('');
    }
  }, [selectTextType, open, innerSelectText, inputValue, topicId]);

  useEffect(() => {
    console.log(selectTextType);
    setInputValue(actPrompt[selectTextType] ?? '');
  }, [selectTextType]);

  const resend = (uuid: string) => {
    const answerIndex = messages.findIndex(item => item.uuid === uuid);
    const question = messages[answerIndex - 1];
    sendMsg({
      referContent: question.referContent,
      query: question.content,
      topicId: `${topicId}`,
      reportId: Number(id),
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
          .map(item => ({
            id: item.id,
            content: item.value.showName,
          })) || [],
      referText:
        question?.appendix
          ?.filter(item => item.type === 'text')
          .map(item => ({
            id: item.id,
            content: item.value.showName,
          })) || [],
      appendix: question?.appendix,
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>
          <IconAlibabaNew type='icon-icon-AI' />
          {I18N.components.writing}
        </div>
        <div className={styles.headerRight}>
          <div
            className={styles.clear}
            onClick={() => {
              setMessages([]);
              createTopicId();
            }}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
            >
              <g clip-path='url(#clip0_1_6129)'>
                <path
                  d='M3.88473 2.9091H5.09164C5.49564 2.9091 5.81818 3.23455 5.81818 3.63637C5.81818 3.73215 5.79926 3.82699 5.76251 3.91544C5.72576 4.00389 5.67189 4.08421 5.60401 4.15179C5.53613 4.21936 5.45557 4.27287 5.36696 4.30922C5.27834 4.34558 5.18342 4.36407 5.08764 4.36364H2.18545C1.99167 4.36364 1.80581 4.28668 1.66875 4.14969C1.53169 4.0127 1.45464 3.82688 1.45455 3.6331V0.730914C1.45455 0.328005 1.78 4.9802e-06 2.18182 4.9802e-06C2.58618 4.9802e-06 2.90909 0.325459 2.90909 0.72655V1.828C4.34142 0.644444 6.14194 -0.00207021 8 4.9802e-06C12.4182 4.9802e-06 16 3.58182 16 8C16 12.4182 12.4182 16 8 16C3.58182 16 0 12.4182 0 8C2.87421e-09 7.80712 0.0766231 7.62213 0.213013 7.48574C0.349403 7.34935 0.534388 7.27273 0.727273 7.27273C0.920157 7.27273 1.10514 7.34935 1.24153 7.48574C1.37792 7.62213 1.45455 7.80712 1.45455 8C1.45455 11.6149 4.38509 14.5455 8 14.5455C11.6149 14.5455 14.5455 11.6149 14.5455 8C14.5455 4.38509 11.6149 1.45455 8 1.45455C6.50194 1.45259 5.04883 1.96619 3.88473 2.9091Z'
                  fill='#9099B0'
                />
              </g>
              <defs>
                <clipPath id='clip0_1_6129'>
                  <rect width='16' height='16' fill='white' />
                </clipPath>
              </defs>
            </svg>
            <span>{I18N.components.clearTheConversation}</span>
          </div>
          <div className={styles.close} onClick={() => onClose()}>
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
          } else {
            return (
              <Answer
                key={item.uuid}
                selected={selected}
                content={item.content}
                loading={loading && index === messages.length - 1}
                insert={() => insert(item)}
                resend={() => resend(item.uuid)}
              />
            );
          }
        })}
        <div ref={bottomDiv}></div>
      </div>
      <div className={styles.footer}>
        <div className={styles.inputWrapper}>
          {innerSelectText && (
            <div>
              <div className={styles.selectText}>
                <div className={styles.text}>{innerSelectText}</div>
                <div
                  className={styles.close}
                  onClick={() => {
                    setInnerSelectText('');
                    setActItem('');
                  }}
                >
                  <CloseOutlined />
                </div>
              </div>
              {/* <div className={styles.actItems}>
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
                    <img src={item.icon} className={styles.svg} />
                    {item.label}
                  </div>
                ))}
              </div> */}
            </div>
          )}
          <div className={styles.inputContainer}>
            <img src={aiSvg} className={styles.svg} />
            <textarea
              ref={textareaRef}
              value={inputValue}
              className={styles.input}
              placeholder={I18N.components.inputOptimizedText}
              rows={1}
              onInput={handleInput}
            />
          </div>
          <AppendixList
            items={appendix}
            canDelete
            del={uuid => {
              const item = appendix.find(item => item.uuid === uuid);
              if (item?.type === 'file') {
                appendixFileRef.current?.delFile(item.fileUid || '');
              }
              setAppendix(prev => prev.filter(item => item.uuid !== uuid));
            }}
          />
          <div className={styles.footerRight}>
            <Dropdown
              trigger={['click']}
              onOpenChange={e => {
                if (e) {
                  run();
                }
              }}
              menu={{ items }}
              disabled={appendix.length >= 10}
              placement='topLeft'
              getPopupContainer={(e: HTMLElement) =>
                e.parentElement as HTMLElement
              }
            >
              {/* <Tooltip title={I18N.esg.otherCanBeAdded} placement='bottom'> */}
              <div className={styles.add}>
                <img src={linkSvg} alt='' />
                <span>{I18N.components.addAttachment}</span>
              </div>
              {/* </Tooltip> */}
            </Dropdown>
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
