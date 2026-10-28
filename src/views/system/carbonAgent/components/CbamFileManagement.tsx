import cbamFileIcon from '@src/assets/images/carbonAgent/icons/cbam-file.svg';
import searchIcon from '@src/assets/images/carbonAgent/icons/search.svg';
import mobileFileIcon from '@src/assets/images/carbonAgent/file-management/file.svg';
import mobileSearchIcon from '@src/assets/images/carbonAgent/file-management/search.svg';
import mobileChevronIcon from '@src/assets/images/carbonAgent/file-management/chevron-down.svg';
import I18N from '@src/lang/I18N';
import { Empty, Pagination, Spin, message } from 'antd';
import { useEffect, useState } from 'react';

import style from './CbamFileManagement.module.less';
import { AGENT_ACCOUNT_SEARCH_MAX_LENGTH } from '../constants';
import { getCbamFileBusinessType } from '../cbamFileBusiness';
import type { AgentConversation } from '../constants';
import {
  fetchAgentCbamFiles,
  fetchLatestAgentSessionByBusiness,
  type AgentCbamFile,
} from '../service';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const downloadFile = (file: AgentCbamFile) => {
  if (!file.path || file.status !== '1') {
    message.warning(I18N.carbonAgent.cbamFileUnavailable);
    return;
  }

  const link = document.createElement('a');
  link.href = file.path;
  link.download = file.fileName;
  link.rel = 'noopener noreferrer';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const getFileType = (file: AgentCbamFile) =>
  file.moduleDesc || file.module || I18N.carbonAgent.cbam;

const formatMobileFileTime = (value?: string | null) =>
  value?.replace(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?$/,
    '$1/$2/$3 $4',
  ) || '--';

type CbamFileManagementProps = {
  isMobile?: boolean;
  onOpenConversation: (conversation: AgentConversation) => void;
};

const CbamFileManagement = ({
  isMobile = false,
  onOpenConversation,
}: CbamFileManagementProps) => {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AgentCbamFile[]>([]);
  const [total, setTotal] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [openingConversationId, setOpeningConversationId] = useState('');
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setKeyword(searchValue.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    setLoading(true);
    setError(false);
    fetchAgentCbamFiles(
      { keyword: keyword || undefined, page, size: PAGE_SIZE },
      abortController.signal,
    )
      .then(result => {
        if (!cancelled) {
          setRows(result.rows);
          setTotal(result.total);
        }
      })
      .catch(() => {
        if (!cancelled && !abortController.signal.aborted) {
          setRows([]);
          setTotal(0);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [keyword, page, retryKey]);

  const openConversation = async (file: AgentCbamFile) => {
    if (file.reportId === undefined || file.reportId === null) {
      message.warning(I18N.carbonAgent.cbamConversationNotFound);
      return;
    }

    if (openingConversationId) {
      return;
    }

    setOpeningConversationId(String(file.id));

    try {
      const conversation = await fetchLatestAgentSessionByBusiness({
        bizId: file.reportId,
        bizType: getCbamFileBusinessType(file),
        module: 'cbam2',
      });

      if (!conversation) {
        message.warning(I18N.carbonAgent.cbamConversationNotFound);
        return;
      }

      onOpenConversation(conversation);
    } catch {
      message.error(I18N.carbonAgent.openConversationFailed);
    } finally {
      setOpeningConversationId('');
    }
  };

  return (
    <section
      className={`${style.page} ${isMobile ? style.mobilePage : ''}`}
      aria-label={isMobile ? I18N.carbonAgent.fileManagement : undefined}
      aria-labelledby={isMobile ? undefined : 'cbam-file-title'}
    >
      <header className={style.header}>
        {!isMobile ? (
          <h1 id='cbam-file-title'>{I18N.carbonAgent.fileManagement}</h1>
        ) : null}
        <label className={style.search} htmlFor='carbon-agent-cbam-file-search'>
          <img
            src={isMobile ? mobileSearchIcon : searchIcon}
            alt=''
            aria-hidden='true'
          />
          <input
            id='carbon-agent-cbam-file-search'
            aria-label={I18N.carbonAgent.searchPlaceholder}
            placeholder={I18N.carbonAgent.searchPlaceholder}
            type='search'
            maxLength={isMobile ? AGENT_ACCOUNT_SEARCH_MAX_LENGTH : undefined}
            value={searchValue}
            onChange={event => setSearchValue(event.target.value)}
          />
        </label>
      </header>

      <div className={style.tableWrap}>
        {!isMobile ? (
          <div className={style.tableHeader} role='row'>
            <span>{I18N.carbonAgent.cbamFileName}</span>
            <span>{I18N.carbonAgent.cbamFileId}</span>
            <span>{I18N.carbonAgent.cbamFileType}</span>
            <span>{I18N.carbonAgent.operation}</span>
          </div>
        ) : null}

        <Spin spinning={loading}>
          {error && (
            <div className={style.state}>
              <span>{I18N.carbonAgent.cbamFileLoadFailed}</span>
              <button type='button' onClick={() => setRetryKey(key => key + 1)}>
                {I18N.carbonAgent.reload}
              </button>
            </div>
          )}
          {!error && Boolean(rows.length) && (
            <div
              className={isMobile ? style.mobileList : undefined}
              role={isMobile ? undefined : 'rowgroup'}
            >
              {rows.map(file => {
                const ready = file.status === '1' && Boolean(file.path);
                const opening = openingConversationId === String(file.id);
                const conversationDisabled =
                  Boolean(openingConversationId) ||
                  file.reportId === undefined ||
                  file.reportId === null;
                const conversationLabel = opening
                  ? I18N.carbonAgent.opening
                  : I18N.carbonAgent.view;
                const fileStatusLabel =
                  file.status === '0'
                    ? I18N.carbonAgent.cbamFileGenerating
                    : I18N.carbonAgent.cbamFileFailed;

                if (isMobile) {
                  return (
                    <article className={style.fileCard} key={file.id}>
                      <div className={style.cardHeader}>
                        <div className={style.cardIdentity}>
                          <span className={style.cardIcon} aria-hidden='true'>
                            <img src={mobileFileIcon} alt='' />
                          </span>
                          <div className={style.cardTitle}>
                            <strong title={file.fileName}>
                              {file.fileName}
                            </strong>
                            <time>{formatMobileFileTime(file.createTime)}</time>
                          </div>
                        </div>
                        <button
                          className={style.conversationButton}
                          type='button'
                          aria-label={`${
                            opening
                              ? I18N.carbonAgent.opening
                              : I18N.carbonAgent.cbamViewConversation
                          }: ${file.fileName}`}
                          aria-busy={opening}
                          disabled={conversationDisabled}
                          onClick={() => openConversation(file)}
                        >
                          <img
                            src={mobileChevronIcon}
                            alt=''
                            aria-hidden='true'
                          />
                        </button>
                      </div>
                      <dl className={style.cardDetails}>
                        <div>
                          <dt>{I18N.carbonAgent.cbamFileId}</dt>
                          <dd>{file.reportId ?? '--'}</dd>
                        </div>
                        <div>
                          <dt>{I18N.carbonAgent.cbamFileType}</dt>
                          <dd>
                            <span className={style.fileType}>
                              {getFileType(file)}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt>{I18N.carbonAgent.mdDownloadFile}</dt>
                          <dd className={style.downloadActions}>
                            {!ready ? (
                              <span className={style.status} role='status'>
                                {fileStatusLabel}
                              </span>
                            ) : null}
                            <button
                              className={style.downloadButton}
                              type='button'
                              disabled={!ready}
                              aria-label={I18N.template(
                                I18N.carbonAgent.downloadAttachment,
                                {
                                  val1: file.fileName,
                                },
                              )}
                              onClick={() => downloadFile(file)}
                            >
                              {I18N.carbonAgent.download}
                            </button>
                          </dd>
                        </div>
                      </dl>
                    </article>
                  );
                }

                return (
                  <div className={style.tableRow} role='row' key={file.id}>
                    <div className={style.fileCell} role='cell'>
                      <img src={cbamFileIcon} alt='' aria-hidden='true' />
                      <span>
                        <strong title={file.fileName}>{file.fileName}</strong>
                        <small>{file.createTime || '--'}</small>
                      </span>
                    </div>
                    <span className={style.textCell} role='cell'>
                      {file.reportId ?? '--'}
                    </span>
                    <span className={style.textCell} role='cell'>
                      <em>{getFileType(file)}</em>
                    </span>
                    <div className={style.actions} role='cell'>
                      <button
                        type='button'
                        disabled={conversationDisabled}
                        onClick={() => openConversation(file)}
                      >
                        {conversationLabel}
                      </button>
                      <button
                        type='button'
                        disabled={!ready}
                        onClick={() => downloadFile(file)}
                      >
                        {I18N.carbonAgent.download}
                      </button>
                      {!ready && (
                        <span className={style.status}>{fileStatusLabel}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!error && loading && !rows.length ? (
            <div className={style.empty} />
          ) : null}
          {!error && !loading && !rows.length && (
            <div className={style.empty}>
              <Empty description={I18N.carbonAgent.cbamFileEmpty} />
            </div>
          )}
        </Spin>
      </div>

      {total > PAGE_SIZE ? (
        <Pagination
          className={style.pagination}
          current={page}
          pageSize={PAGE_SIZE}
          showSizeChanger={false}
          total={total}
          simple={isMobile}
          onChange={setPage}
        />
      ) : null}
    </section>
  );
};

export default CbamFileManagement;
