import { useMemo } from 'react';

import I18N from '@src/lang/I18N';
import style from '../../index.module.less';
import {
  asRecord,
  getOptionalArray,
  getOptionalScalarString,
  getOptionalString,
} from './utils';

type FetchUrlItem = {
  content?: string;
  imageCount?: number;
  title?: string;
  url?: string;
};

type FetchUrlResultData = {
  failedCount: number;
  provider?: string;
  requestId?: string;
  responseTime?: number;
  results: FetchUrlItem[];
  sourceUrl?: string;
};

const MAX_SNIPPET_LENGTH = 320;

const normalizeWhitespace = (value: string) =>
  value.replace(/\s+/g, ' ').trim();

const truncateText = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const normalizedValue = normalizeWhitespace(value);

  return normalizedValue.length > MAX_SNIPPET_LENGTH
    ? `${normalizedValue.slice(0, MAX_SNIPPET_LENGTH)}...`
    : normalizedValue;
};

const parseJsonRecord = (result: string) => {
  try {
    return asRecord(JSON.parse(result));
  } catch {
    return {};
  }
};

const parseNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
};

const normalizeFetchUrlItem = (item: unknown): FetchUrlItem | undefined => {
  const itemRecord = asRecord(item);
  const content = truncateText(
    getOptionalString(itemRecord.raw_content) ||
      getOptionalString(itemRecord.rawContent) ||
      getOptionalString(itemRecord.content) ||
      getOptionalString(itemRecord.text),
  );
  const title =
    getOptionalString(itemRecord.title) ||
    getOptionalString(itemRecord.name) ||
    getOptionalString(itemRecord.url);
  const url = getOptionalString(itemRecord.url);
  const imageCount = getOptionalArray(itemRecord.images).length;

  return title || url || content
    ? {
        content,
        imageCount,
        title,
        url,
      }
    : undefined;
};

export const parseFetchUrlResult = (
  result: string,
): FetchUrlResultData | null => {
  const root = parseJsonRecord(result);

  if (!Object.keys(root).length) {
    return null;
  }

  const content = asRecord(root.content);
  const resultRoot = Array.isArray(root.results) ? root : content;
  const results = getOptionalArray(resultRoot.results)
    .map(normalizeFetchUrlItem)
    .filter(Boolean) as FetchUrlItem[];
  const failedResults = getOptionalArray(
    resultRoot.failed_results || resultRoot.failedResults,
  );

  if (!results.length && !failedResults.length) {
    return null;
  }

  return {
    failedCount: failedResults.length,
    provider:
      getOptionalScalarString(root.provider) ||
      getOptionalScalarString(resultRoot.provider),
    requestId:
      getOptionalString(root.request_id) ||
      getOptionalString(root.requestId) ||
      getOptionalString(resultRoot.request_id) ||
      getOptionalString(resultRoot.requestId),
    responseTime:
      parseNumber(root.response_time) ||
      parseNumber(root.responseTime) ||
      parseNumber(resultRoot.response_time) ||
      parseNumber(resultRoot.responseTime),
    results,
    sourceUrl:
      getOptionalString(root.url) ||
      getOptionalString(resultRoot.url) ||
      results[0]?.url,
  };
};

const getUrlHost = (url?: string) => {
  if (!url) {
    return '';
  }

  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const getFetchUrlItemKey = (item: FetchUrlItem, index: number) =>
  [item.url, item.title, index].filter(Boolean).join('-');

const FetchUrlResult = ({ result }: { result: string }) => {
  const fetchResult = useMemo(() => parseFetchUrlResult(result), [result]);

  if (!fetchResult) {
    return <pre className={style.toolProcessResult}>{result}</pre>;
  }

  const host = getUrlHost(fetchResult.sourceUrl);

  return (
    <div className={style.fetchUrlResult}>
      <div className={style.fetchUrlHead}>
        <div className={style.fetchUrlTitleBlock}>
          <span>{I18N.carbonAgent.webContentReading}</span>
          {host ? <strong>{host}</strong> : null}
        </div>
        <div className={style.fetchUrlStats}>
          {fetchResult.provider ? <b>{fetchResult.provider}</b> : null}
          <span>
            {I18N.template(I18N.carbonAgent.countItems, {
              val1: fetchResult.results.length,
            })}
          </span>
          {typeof fetchResult.responseTime === 'number' ? (
            <time>{fetchResult.responseTime.toFixed(2)}s</time>
          ) : null}
        </div>
      </div>

      <div className={style.fetchUrlList}>
        {fetchResult.results.map((item, index) => {
          const itemHost = getUrlHost(item.url);
          const title =
            item.title ||
            itemHost ||
            I18N.template(I18N.carbonAgent.readResultN, { val1: index + 1 });

          return (
            <article
              className={style.fetchUrlItem}
              key={getFetchUrlItemKey(item, index)}
            >
              <div className={style.fetchUrlItemHead}>
                <div className={style.fetchUrlItemTitleBlock}>
                  {item.url ? (
                    <a
                      className={style.fetchUrlItemTitle}
                      href={item.url}
                      target='_blank'
                      rel='noreferrer'
                    >
                      {title}
                    </a>
                  ) : (
                    <h4 className={style.fetchUrlItemTitle}>{title}</h4>
                  )}
                  {itemHost ? (
                    <span className={style.fetchUrlHost}>{itemHost}</span>
                  ) : null}
                </div>
                {item.imageCount ? (
                  <span className={style.fetchUrlBadge}>
                    {I18N.template(I18N.carbonAgent.imageCountLabel, {
                      val1: item.imageCount,
                    })}
                  </span>
                ) : null}
              </div>
              {item.content ? (
                <p className={style.fetchUrlContent}>{item.content}</p>
              ) : null}
            </article>
          );
        })}
      </div>

      {fetchResult.failedCount || fetchResult.requestId ? (
        <div className={style.fetchUrlFooter}>
          {fetchResult.failedCount ? (
            <span>
              {I18N.template(I18N.carbonAgent.failedReadCount, {
                val1: fetchResult.failedCount,
              })}
            </span>
          ) : null}
          {fetchResult.requestId ? (
            <span>
              {I18N.carbonAgent.requestIdLabel}
              {fetchResult.requestId}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default FetchUrlResult;
