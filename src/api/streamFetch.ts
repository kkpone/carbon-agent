// import { getErrText } from '@fastgpt/global/common/error/utils';
// import type { ChatHistoryItemResType } from '@fastgpt/global/core/chat/type.d';
// import { StartChatFnProps } from '@/components/ChatBox';

import {
  // refer to https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web
  EventStreamContentType,
  fetchEventSource,
} from '@fortaine/fetch-event-source';
import { isNull, isUndefined } from 'lodash-es';
import dayjs from 'moment';

import { getToken } from '../utils/cookie';

const getErrText = (err: any, def = '') => {
  const msg: string = typeof err === 'string' ? err : err?.message || def || '';
  return msg;
};

type ChatHistoryItemResType = {
  moduleType: string;
  moduleName: string;
};

enum ModuleOutputKeyEnum {
  // common
  userChatInput = 'userChatInput',
  finish = 'finish',
  responseData = 'responseData',
  history = 'history',
  answerText = 'answerText', //  answer module text key
  success = 'success',
  failed = 'failed',
  text = 'system_text',
  addOutputParam = 'system_addOutputParam',

  // dataset
  datasetIsEmpty = 'isEmpty',
  datasetUnEmpty = 'unEmpty',
  datasetQuoteQA = 'quoteQA',

  // context extract
  contextExtractFields = 'fields',

  // tf switch
  resultTrue = 'system_resultTrue',
  resultFalse = 'system_resultFalse',
}
enum sseResponseEventEnum {
  error = 'error',
  answer = 'answer',
  moduleStatus = 'moduleStatus',
  appStreamResponse = 'appStreamResponse', // sse response request
}

type StreamFetchProps = {
  url?: string;
  data: Record<string, any>;
  onMessage: (par: any) => void;
  abortCtrl: AbortController;
};
type StreamResponseType = {
  responseText: string;
  [ModuleOutputKeyEnum.responseData]: ChatHistoryItemResType[];
};
export const streamFetch = ({
  url = '/api/v1/chat/completions',
  data,
  onMessage,
  abortCtrl,
}: StreamFetchProps) =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise<StreamResponseType>(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      abortCtrl.abort('Time out');
    }, 60000);

    // response data
    let responseText = '';
    let remainText = '';
    let errMsg = '';
    let responseData: any[] = [];
    let finished = false;

    const finish = () => {
      if (errMsg) {
        return failedFinish();
      }
      return resolve({
        responseText,
        responseData,
      });
    };
    const failedFinish = (err?: any) => {
      finished = true;
      // eslint-disable-next-line prefer-promise-reject-errors
      reject({
        message: err,
        responseText,
      });
    };

    // animate response to make it looks smooth
    // eslint-disable-next-line consistent-return
    function animateResponseText() {
      // abort message
      if (abortCtrl.signal.aborted) {
        reject(abortCtrl.signal.reason);
      }

      if (remainText) {
        const fetchCount = Math.max(1, Math.round(remainText.length / 60));
        const fetchText = remainText.slice(0, fetchCount);

        onMessage({ text: fetchText });

        responseText += fetchText;
        remainText = remainText.slice(fetchCount);
      }

      if (finished && !remainText) {
        return finish();
      }

      requestAnimationFrame(animateResponseText);
    }
    // start animation
    animateResponseText();

    try {
      // auto complete variables
      const variables = data?.variables || {};
      variables.cTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

      const requestData = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getToken(),
        },
        signal: abortCtrl.signal,
        body: JSON.stringify({
          ...data,
          variables,
          detail: true,
          stream: true,
        }),
      };
      // send request
      await fetchEventSource(url, {
        ...requestData,
        // eslint-disable-next-line consistent-return
        async onopen(res) {
          clearTimeout(timeoutId);
          const contentType = res.headers.get('content-type');

          // not stream
          if (contentType?.startsWith('text/plain')) {
            return failedFinish(await res.clone().text());
          }

          // failed stream
          if (
            !res.ok ||
            !res.headers
              .get('content-type')
              ?.startsWith(EventStreamContentType) ||
            res.status !== 200
          ) {
            try {
              failedFinish(await res.clone().json());
            } catch {
              failedFinish(await res.clone().text());
            }
          }
        },
        onmessage({ event, data }) {
          if (data === '[DONE]') {
            return;
          }

          // parse text to json
          const parseJson = (() => {
            try {
              return JSON.parse(data);
            } catch (error) {
              return {};
            }
          })();

          if (event === sseResponseEventEnum.answer) {
            //   const answer: string = parseJson?.choices?.[0]?.delta?.content || '';
            //   remainText += answer;
            // } else if (
            //   event === sseResponseEventEnum.moduleStatus &&
            //   parseJson?.name &&
            //   parseJson?.status
            // ) {
            if (!isNull(parseJson.content) && !isUndefined(parseJson.content)) {
              onMessage(parseJson.content);
            } else {
              onMessage(data);
            }
          } else if (event === sseResponseEventEnum.appStreamResponse) {
            responseData = parseJson;
          } else if (event === sseResponseEventEnum.error) {
            errMsg = getErrText(parseJson, '流响应错误');
          }
        },
        onclose() {
          finished = true;
        },
        onerror(e) {
          clearTimeout(timeoutId);
          failedFinish(getErrText(e));
          throw e;
        },
        openWhenHidden: true,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (abortCtrl.signal.aborted) {
        finished = true;

        return;
      }

      failedFinish(err);
    }
  });
