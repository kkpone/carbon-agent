import historyEmptySearchIcon from '@src/assets/images/carbonAgent/icons/history-empty-search.png';
import I18N from '@src/lang/I18N';
import { Modal, Tooltip, message as antdMessage } from 'antd';
import classNames from 'classnames';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type SVGProps,
} from 'react';

import ProjectNameDialog from './ProjectNameDialog';
import type { AgentConversation } from '../constants';
import style from '../index.module.less';
import {
  batchDeleteAgentSessions,
  fetchAgentSessionHistoryList,
  renameAgentSession,
  type AgentHistoryConversation,
} from '../service';

type HistoryPageProps = {
  mobile?: boolean;
  refreshKey?: number;
  selectedSessionId?: string;
  onConversationsChanged?: () => void;
  onSelectConversation: (conversation: AgentConversation) => void;
};

type HistoryGroup = {
  items: AgentHistoryConversation[];
  label: string;
};

type HistoryIconProps = SVGProps<SVGSVGElement>;

const HISTORY_PAGE_SIZE = 20;
const HISTORY_SEARCH_DEBOUNCE_MS = 300;
const HISTORY_SEARCH_INPUT_ID = 'carbon-agent-history-search';
const HISTORY_SELECT_ALL_INPUT_ID = 'carbon-agent-history-select-all';
const HISTORY_MOBILE_SWIPE_THRESHOLD = 36;

const getStartOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const getHistoryCheckboxId = (conversationId: string) =>
  `carbon-agent-history-select-${conversationId.replace(
    /[^a-zA-Z0-9_-]/g,
    '-',
  )}`;

const FigmaSearchIcon = (props: HistoryIconProps) => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    viewBox='0 0 16 16'
    {...props}
  >
    <path
      d='M7.333 11.333a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12.667 12.667l-2.5-2.5'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.333'
    />
  </svg>
);

const FigmaEditIcon = (props: HistoryIconProps) => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    viewBox='0 0 24 24'
    {...props}
  >
    <path
      d='M5 19h4.2L19 9.2 14.8 5 5 14.8V19Z'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.25'
    />
    <path
      d='m13.8 6 4.2 4.2'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.25'
    />
  </svg>
);

const FigmaDeleteIcon = (props: HistoryIconProps) => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    viewBox='0 0 24 24'
    {...props}
  >
    <path
      d='M4 7h16M9 7V5.5C9 4.67 9.67 4 10.5 4h3c.83 0 1.5.67 1.5 1.5V7M7 7l.7 11c.05.56.52 1 1.08 1h6.44c.56 0 1.03-.44 1.08-1L17 7M10 10v6M14 10v6'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.25'
    />
  </svg>
);

const FigmaDeleteSmallIcon = (props: HistoryIconProps) => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    viewBox='0 0 16 16'
    {...props}
  >
    <path
      d='M2 4.667h12M6 4.667V3.333c0-.552.448-1 1-1h2c.552 0 1 .448 1 1v1.334M3.5 4.667l.55 8.533c.04.58.52 1.033 1.1 1.033h5.7c.58 0 1.06-.453 1.1-1.033l.55-8.533M6.667 7.167V11.5M9.333 7.167V11.5'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.1'
    />
  </svg>
);

const getHistoryDateGroupLabel = (conversation: AgentHistoryConversation) => {
  if (conversation.sessionDate) {
    return conversation.sessionDate;
  }

  const rawTime = conversation.updateTime || conversation.time;
  const date = new Date(rawTime);

  if (Number.isNaN(date.getTime())) {
    return I18N.carbonAgent.historyDateEarlier;
  }

  const now = new Date();
  const todayStart = getStartOfDay(now);
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const targetTime = date.getTime();

  if (targetTime >= todayStart) {
    return I18N.carbonAgent.historyDateToday;
  }

  if (targetTime >= yesterdayStart) {
    return I18N.carbonAgent.historyDateYesterday;
  }

  if (date.getFullYear() === now.getFullYear()) {
    return I18N.carbonAgent.historyDateThisYear;
  }

  if (date.getFullYear() === now.getFullYear() - 1) {
    return I18N.carbonAgent.historyDateLastYear;
  }

  return I18N.carbonAgent.historyDateEarlier;
};

const getGroupedHistory = (
  conversations: AgentHistoryConversation[],
): HistoryGroup[] => {
  const groupMap = new Map<string, AgentHistoryConversation[]>();

  conversations.forEach(conversation => {
    const label = getHistoryDateGroupLabel(conversation);
    const items = groupMap.get(label) || [];

    items.push(conversation);
    groupMap.set(label, items);
  });

  return [...groupMap.entries()].map(([label, items]) => ({
    items,
    label,
  }));
};

const HistoryPage = ({
  mobile = false,
  refreshKey = 0,
  selectedSessionId = '',
  onConversationsChanged,
  onSelectConversation,
}: HistoryPageProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<AgentHistoryConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openActionConversationId, setOpenActionConversationId] = useState('');
  const [renamingConversationId, setRenamingConversationId] = useState('');
  const [renameSubmitting, setRenameSubmitting] = useState(false);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const queryKeyRef = useRef('');
  const swipeHandledRef = useRef(false);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setKeyword(searchValue.trim());
      setPageNum(1);
      setLoadMoreError(false);
    }, HISTORY_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchValue]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();
    const queryKey = `${keyword}::${refreshKey}`;
    const isFirstPage = pageNum === 1;

    if (queryKeyRef.current !== queryKey) {
      queryKeyRef.current = queryKey;
      setSelectedIds(new Set());
      setOpenActionConversationId('');
      setLoadMoreError(false);

      if (!isFirstPage) {
        setPageNum(1);
        return () => {
          cancelled = true;
          abortController.abort();
        };
      }
    }

    if (isFirstPage) {
      setRows([]);
      setLoading(true);
      setError('');
    } else {
      setLoadingMore(true);
      setLoadMoreError(false);
    }

    fetchAgentSessionHistoryList(
      {
        keyword,
        pageNum,
        pageSize: HISTORY_PAGE_SIZE,
      },
      abortController.signal,
    )
      .then(result => {
        if (cancelled || abortController.signal.aborted) {
          return;
        }

        if (isFirstPage) {
          setRows(result.rows);
        } else {
          setRows(prevRows => {
            const prevRowIds = new Set(prevRows.map(row => row.id));

            return [
              ...prevRows,
              ...result.rows.filter(row => !prevRowIds.has(row.id)),
            ];
          });
        }

        setTotal(result.total);

        if (isFirstPage) {
          const nextRowIds = new Set(result.rows.map(row => row.id));

          setSelectedIds(prevSelectedIds => {
            const nextSelectedIds = new Set<string>();

            prevSelectedIds.forEach(id => {
              if (nextRowIds.has(id)) {
                nextSelectedIds.add(id);
              }
            });

            return nextSelectedIds;
          });
        }
      })
      .catch(() => {
        if (cancelled || abortController.signal.aborted) {
          return;
        }

        if (isFirstPage) {
          setRows([]);
          setTotal(0);
          setSelectedIds(new Set());
          setError(I18N.carbonAgent.historyLoadFailedRetry);
        } else {
          setLoadMoreError(true);
          antdMessage.error(I18N.carbonAgent.historyLoadFailedRetry);
        }
      })
      .finally(() => {
        if (!cancelled && !abortController.signal.aborted) {
          if (isFirstPage) {
            setLoading(false);
          } else {
            setLoadingMore(false);
          }
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [keyword, pageNum, refreshKey, retryKey]);

  const groupedHistory = useMemo(() => getGroupedHistory(rows), [rows]);
  const currentPageIds = useMemo(() => rows.map(row => row.id), [rows]);
  const allSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every(id => selectedIds.has(id));
  const selectedCount = selectedIds.size;
  const hasMore = rows.length < total;
  const renamingConversation = rows.find(
    conversation => conversation.id === renamingConversationId,
  );

  useEffect(() => {
    if (error || loading || loadingMore || loadMoreError || !hasMore) {
      return undefined;
    }

    const trigger = loadMoreTriggerRef.current;

    if (!trigger) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) {
          return;
        }

        observer.disconnect();
        setPageNum(prevPage => prevPage + 1);
      },
      { rootMargin: '160px 0px' },
    );

    observer.observe(trigger);

    return () => {
      observer.disconnect();
    };
  }, [error, hasMore, loadMoreError, loading, loadingMore, rows.length, total]);

  const handleSelectAllChange = (checked: boolean) => {
    setOpenActionConversationId('');
    setSelectedIds(() => {
      if (!checked) {
        return new Set();
      }

      return new Set(currentPageIds);
    });
  };

  const handleConversationSelectChange = (conversationId: string) => {
    setOpenActionConversationId('');
    setSelectedIds(prevSelectedIds => {
      const nextSelectedIds = new Set(prevSelectedIds);

      if (nextSelectedIds.has(conversationId)) {
        nextSelectedIds.delete(conversationId);
      } else {
        nextSelectedIds.add(conversationId);
      }

      return nextSelectedIds;
    });
  };

  const handleDeleteConversations = (conversationIds: string[]) => {
    if (!conversationIds.length) {
      return;
    }

    setOpenActionConversationId('');
    const isBatchDelete = conversationIds.length > 1;

    Modal.confirm({
      cancelText: I18N.carbonAgent.cancel,
      content: isBatchDelete
        ? I18N.template(I18N.carbonAgent.batchDeleteConversationConfirm, {
            val1: conversationIds.length,
          })
        : I18N.carbonAgent.deleteConversationConfirm,
      okText: I18N.carbonAgent.delete,
      okType: 'danger',
      title: isBatchDelete
        ? I18N.carbonAgent.batchDeleteConversationTitle
        : I18N.carbonAgent.deleteConversationTitle,
      onOk: async () => {
        try {
          await batchDeleteAgentSessions(conversationIds);
        } catch (deleteError) {
          antdMessage.error(I18N.carbonAgent.deleteFailed);
          throw deleteError;
        }

        const deleteIdSet = new Set(conversationIds);

        setRows(prevRows =>
          prevRows.filter(conversation => !deleteIdSet.has(conversation.id)),
        );
        setTotal(prevTotal => Math.max(0, prevTotal - conversationIds.length));
        setSelectedIds(prevSelectedIds => {
          const nextSelectedIds = new Set(prevSelectedIds);

          conversationIds.forEach(id => nextSelectedIds.delete(id));

          return nextSelectedIds;
        });
        onConversationsChanged?.();
      },
    });
  };

  const handleRenameConversation = async (name: string) => {
    if (!renamingConversationId || renameSubmitting) {
      return;
    }

    setRenameSubmitting(true);
    try {
      await renameAgentSession(renamingConversationId, name);
    } catch {
      antdMessage.error(I18N.carbonAgent.renameFailed);
      return;
    } finally {
      setRenameSubmitting(false);
    }

    setRows(prevRows =>
      prevRows.map(conversation =>
        conversation.id === renamingConversationId
          ? {
              ...conversation,
              title: name,
            }
          : conversation,
      ),
    );
    setRenamingConversationId('');
    onConversationsChanged?.();
  };

  const handleConversationPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    selected: boolean,
  ) => {
    swipeHandledRef.current = false;

    if (selected) {
      swipeStartRef.current = null;
      return;
    }

    swipeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleConversationPointerUp = (
    event: ReactPointerEvent<HTMLDivElement>,
    conversationId: string,
    selected: boolean,
  ) => {
    const swipeStart = swipeStartRef.current;

    swipeStartRef.current = null;

    if (!swipeStart || selected) {
      return;
    }

    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;

    if (
      Math.abs(deltaX) < HISTORY_MOBILE_SWIPE_THRESHOLD ||
      Math.abs(deltaX) <= Math.abs(deltaY)
    ) {
      return;
    }

    swipeHandledRef.current = true;
    setOpenActionConversationId(deltaX < 0 ? conversationId : '');
  };

  return (
    <>
      <section className={style.historyFullSurface}>
        <div
          className={classNames(style.historyPage, {
            [style.historyPageSelectionActive]: selectedCount > 0,
          })}
        >
          <header className={style.historyPageHeader}>
            <h1>{I18N.carbonAgent.historyConversations}</h1>
            <label
              className={style.historySearch}
              htmlFor={HISTORY_SEARCH_INPUT_ID}
              aria-label={I18N.carbonAgent.searchHistoryPlaceholder}
            >
              <FigmaSearchIcon className={style.historySearchIcon} />
              <input
                id={HISTORY_SEARCH_INPUT_ID}
                value={searchValue}
                placeholder={I18N.carbonAgent.searchHistoryPlaceholder}
                onChange={event => setSearchValue(event.target.value)}
              />
            </label>
          </header>

          {selectedCount > 0 ? (
            <div className={style.historySelectionBar}>
              <label
                className={style.historySelectAll}
                htmlFor={HISTORY_SELECT_ALL_INPUT_ID}
              >
                <input
                  id={HISTORY_SELECT_ALL_INPUT_ID}
                  type='checkbox'
                  checked={allSelected}
                  onChange={event =>
                    handleSelectAllChange(event.target.checked)
                  }
                />
                <span>{I18N.carbonAgent.selectAll}</span>
              </label>
              <span className={style.historySelectedText}>
                {I18N.template(I18N.carbonAgent.selectedConversationCount, {
                  val1: selectedCount,
                })}
              </span>
              <button
                className={style.historyBatchDelete}
                type='button'
                onClick={() => handleDeleteConversations([...selectedIds])}
              >
                <FigmaDeleteSmallIcon
                  className={style.historyBatchDeleteIcon}
                />
                {I18N.carbonAgent.batchDelete}
              </button>
            </div>
          ) : null}

          {loading ? (
            <div className={style.historyPageState}>
              {I18N.carbonAgent.loadingHistory}
            </div>
          ) : null}

          {!loading && error ? (
            <div className={style.historyPageState}>
              <span>{error}</span>
              <button
                type='button'
                onClick={() => {
                  setPageNum(1);
                  setRetryKey(prevKey => prevKey + 1);
                }}
              >
                {I18N.carbonAgent.reload}
              </button>
            </div>
          ) : null}

          {!loading && !error && rows.length ? (
            <div className={style.historyGroupList}>
              {groupedHistory.map(group => (
                <section className={style.historyGroup} key={group.label}>
                  <h2>{group.label}</h2>
                  <div className={style.historyConversationList}>
                    {group.items.map(conversation => {
                      const conversationId =
                        conversation.sessionId || conversation.id;
                      const selected = selectedIds.has(conversation.id);
                      const checkboxId = getHistoryCheckboxId(conversation.id);
                      const actionsOpen =
                        openActionConversationId === conversation.id;
                      const editButton = (
                        <button
                          type='button'
                          aria-label={I18N.carbonAgent.editTitle}
                          onClick={() => {
                            setOpenActionConversationId('');
                            setRenamingConversationId(conversation.id);
                          }}
                        >
                          <FigmaEditIcon
                            className={style.historyConversationEditIcon}
                          />
                          <span className={style.historyConversationActionText}>
                            {I18N.carbonAgent.editTitle}
                          </span>
                        </button>
                      );
                      const deleteButton = (
                        <button
                          className={style.historyConversationDeleteButton}
                          type='button'
                          aria-label={I18N.carbonAgent.delete}
                          onClick={() =>
                            handleDeleteConversations([conversation.id])
                          }
                        >
                          <FigmaDeleteIcon
                            className={style.historyConversationDeleteIcon}
                          />
                          <span className={style.historyConversationActionText}>
                            {I18N.carbonAgent.delete}
                          </span>
                        </button>
                      );

                      return (
                        <div
                          className={classNames(style.historyConversationRow, {
                            [style.historyConversationRowActionsOpen]:
                              actionsOpen,
                            [style.historyConversationRowActive]:
                              selectedSessionId === conversationId,
                            [style.historyConversationRowSelected]: selected,
                          })}
                          key={conversation.id}
                          onPointerDown={event =>
                            handleConversationPointerDown(event, selected)
                          }
                          onPointerUp={event =>
                            handleConversationPointerUp(
                              event,
                              conversation.id,
                              selected,
                            )
                          }
                          onPointerCancel={() => {
                            swipeStartRef.current = null;
                          }}
                        >
                          <label
                            className={style.historyConversationCheck}
                            htmlFor={checkboxId}
                          >
                            <input
                              id={checkboxId}
                              type='checkbox'
                              checked={selected}
                              aria-label={I18N.carbonAgent.selectConversation}
                              onChange={() =>
                                handleConversationSelectChange(conversation.id)
                              }
                            />
                          </label>
                          <article className={style.historyConversationCard}>
                            <button
                              className={style.historyConversationMain}
                              type='button'
                              onClick={() => {
                                if (swipeHandledRef.current) {
                                  swipeHandledRef.current = false;
                                  return;
                                }

                                if (actionsOpen) {
                                  setOpenActionConversationId('');
                                  return;
                                }

                                onSelectConversation(conversation);
                              }}
                            >
                              <span className={style.historyConversationTop}>
                                <span
                                  className={style.historyConversationTitle}
                                >
                                  {conversation.title}
                                </span>
                                {conversation.updateDate ? (
                                  <time
                                    className={style.historyConversationTime}
                                  >
                                    {conversation.updateDate}
                                  </time>
                                ) : null}
                              </span>
                              <span
                                className={style.historyConversationSummary}
                              >
                                {conversation.summary ||
                                  I18N.carbonAgent.historyEmptySummary}
                              </span>
                            </button>
                            {!selected ? (
                              <div className={style.historyConversationActions}>
                                {mobile ? (
                                  editButton
                                ) : (
                                  <Tooltip
                                    title={I18N.carbonAgent.editTitle}
                                    placement='top'
                                  >
                                    {editButton}
                                  </Tooltip>
                                )}
                                {mobile ? (
                                  deleteButton
                                ) : (
                                  <Tooltip
                                    title={I18N.carbonAgent.delete}
                                    placement='top'
                                  >
                                    {deleteButton}
                                  </Tooltip>
                                )}
                              </div>
                            ) : null}
                          </article>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {!loading && !error && !rows.length ? (
            <div className={style.historyEmpty}>
              {keyword ? (
                <img
                  alt=''
                  aria-hidden
                  className={style.historyEmptySearchIcon}
                  src={historyEmptySearchIcon}
                />
              ) : (
                <div className={style.historyEmptyIllustration} aria-hidden>
                  <span className={style.historyEmptyWindow} />
                  <span className={style.historyEmptyMagnifier} />
                  <span className={style.historyEmptyLineShort} />
                  <span className={style.historyEmptyLineLong} />
                </div>
              )}
              <p>
                {keyword
                  ? I18N.carbonAgent.historyNoSearchResults
                  : I18N.carbonAgent.historyNoConversations}
              </p>
            </div>
          ) : null}

          {!loading && !error && hasMore ? (
            <div
              ref={loadMoreTriggerRef}
              className={style.historyLoadMoreTrigger}
              aria-hidden
            />
          ) : null}

          {loadingMore ? (
            <div className={style.historyLoadMoreState}>
              {I18N.carbonAgent.loadingHistory}
            </div>
          ) : null}

          {!loading && !error && loadMoreError ? (
            <div className={style.historyLoadMoreState}>
              <button
                type='button'
                onClick={() => {
                  setRetryKey(prevKey => prevKey + 1);
                }}
              >
                {I18N.carbonAgent.reload}
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <ProjectNameDialog
        confirmText={I18N.carbonAgent.save}
        initialValue={renamingConversation?.title || ''}
        open={Boolean(renamingConversation)}
        placeholder={I18N.carbonAgent.conversationNamePlaceholder}
        submitting={renameSubmitting}
        title={I18N.carbonAgent.renameConversationTitle}
        onCancel={() => setRenamingConversationId('')}
        onSubmit={handleRenameConversation}
      />
    </>
  );
};

export default HistoryPage;
