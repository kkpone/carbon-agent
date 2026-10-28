/* eslint-disable consistent-return */
import {
  HocuspocusProvider,
  HocuspocusProviderWebsocket,
} from '@hocuspocus/provider';
import aiSvg from '@src/assets/icon/esg/ai.svg';
import I18N from '@src/lang/I18N';
import { useMount, useUnmount } from 'ahooks';
// import { getReportInfo } from '../AiGenerateOutline/service';
import { Spin } from 'antd';
import classNames from 'classnames';
import { saveAs } from 'file-saver';
import { FC, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { FullscreenModal } from '@/components/FullscreenModal';
import { IconAlibaba } from '@/components/iconfont';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { RouteMaps } from '@/router/route-paths';

import styles from './index.module.less';
import { getReportInfo, postDownloadReport, postEditReport } from './service';

const hocuspocusId = (id: string) => `cdpReportScore${id}`;

export interface IAiGenerateDetailProps {}

export const AiGenerateDetail: FC<IAiGenerateDetailProps> = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id');

  const [reportName, setReportName] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [reportInfo, setReportInfo] = useState<any>();
  const [syncToHocuspocus] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [socket, setSocket] = useState<HocuspocusProviderWebsocket | null>(
    null,
  );

  const editorRef = useRef<{
    submitReport: () => Promise<void>;
    openDraw: () => void;
  }>();

  const history = useHistory();

  const cancelRequest = useRef<AbortController>();

  const canScroll = useRef(false);

  const generateReport = async (content: string) => {
    // setSyncToHocuspocus(true);
    cancelRequest.current = new AbortController();
    canScroll.current = true;
    // setSyncToHocuspocus(false);
    setReportContent(content);
  };

  useUnmount(() => {
    cancelRequest.current?.abort();
  });

  const [userAnswerLoading, setUserAnswerLoading] = useState(false);

  useMount(async () => {
    if (id) {
      setUserAnswerLoading(true);
      const result = await getReportInfo({
        id: Number(id),
      }).finally(() => {
        setUserAnswerLoading(false);
      });
      setReportInfo(result.data.data);
      generateReport(result.data.data.cdpContent);
      setReportName(
        I18N.template(I18N.enterpriseCarbonAccount2.resul, {
          val1: result.data.data.corporateName,
          val2: result.data.data.year,
        }),
      );
    }
  });

  const [connect, setConnect] = useState(false);

  useEffect(() => {
    const newlyCreatedSocket = new HocuspocusProviderWebsocket({
      url: `${process.env.REACT_APP_API_HOCUSPOCUS_WSS}`,
      onDisconnect: () => setConnect(false),
      onConnect: () => setConnect(true),
    });

    setSocket(newlyCreatedSocket);

    return () => {
      newlyCreatedSocket?.destroy();
    };
  }, []);

  const [provider, setProvider] = useState<HocuspocusProvider>();

  useEffect(() => {
    if (socket && provider && !!reportContent && editorRef.current) {
      setTimeout(() => {
        editorRef.current?.openDraw();
      }, 100);
    }
  }, [socket, provider, reportContent]);

  useEffect(() => {
    if (!socket || !id) return;

    const p = new HocuspocusProvider({
      websocketProvider: socket,
      name: hocuspocusId(id),
    });

    setProvider(p);

    return () => {
      p.detach();
    };
  }, [socket]);

  if (!provider) {
    return false;
  }

  provider?.attach();

  const editReport = async (reportStr: string) => {
    if (!id) return;
    await postEditReport({
      reportId: Number(id),
      reportContent: reportStr,
    });
  };

  const downloadReport = async () => {
    setDownloading(true);
    await editorRef.current?.submitReport?.();
    const result = await postDownloadReport({
      reportId: Number(id),
    }).finally(() => setDownloading(false));

    saveAs(result.data.data.reportUrl);
  };

  return (
    <FullscreenModal>
      <div className={styles.AiGenerateDetail}>
        <div className={styles.header}>
          <div className={styles.title}>
            <div
              className={classNames(styles.back, {
                [styles.notAllow]: syncToHocuspocus,
              })}
              onClick={() => {
                if (syncToHocuspocus) {
                  return;
                }
                history.push(
                  RouteMaps.enterpriseCarbonAccountingCdpAiReportList,
                );
              }}
            >
              <IconAlibaba type='icon-a-icon_return' />
            </div>
            <div>{I18N.enterpriseCarbonAccount2.aiRating}</div>
            <div className={styles.line} />
            <div>{reportName}</div>
          </div>
          <div className={styles.rightBtns}>
            <Spin spinning={downloading}>
              <div onClick={downloadReport} className={styles.downloadBtn}>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='none'
                >
                  <path
                    d='M14.0002 9.33337C14.1635 9.3334 14.3211 9.39335 14.4431 9.50185C14.5651 9.61036 14.6431 9.75987 14.6622 9.92204L14.6668 10V11.3334C14.6669 11.8435 14.4719 12.3344 14.122 12.7055C13.772 13.0767 13.2934 13.3001 12.7842 13.33L12.6668 13.3334H3.3335C2.82336 13.3334 2.33249 13.1385 1.96132 12.7885C1.59016 12.4385 1.36676 11.96 1.33683 11.4507L1.3335 11.3334V10C1.33368 9.83012 1.39875 9.66669 1.51539 9.54313C1.63204 9.41957 1.79146 9.34522 1.96109 9.33526C2.13072 9.3253 2.29775 9.38049 2.42805 9.48955C2.55835 9.59861 2.64209 9.75331 2.66216 9.92204L2.66683 10V11.3334C2.66685 11.4967 2.7268 11.6543 2.83531 11.7763C2.94381 11.8983 3.09333 11.9763 3.2555 11.9954L3.3335 12H12.6668C12.8301 12 12.9877 11.9401 13.1097 11.8316C13.2318 11.7231 13.3097 11.5735 13.3288 11.4114L13.3335 11.3334V10C13.3335 9.82323 13.4037 9.65366 13.5288 9.52864C13.6538 9.40361 13.8234 9.33337 14.0002 9.33337ZM7.99283 2.00004C8.15615 1.99821 8.31445 2.05639 8.43771 2.16355C8.56097 2.27071 8.6406 2.41939 8.6615 2.58138L8.66683 2.66004L8.7255 7.98338L10.9168 6.23004C11.0436 6.12863 11.203 6.07694 11.3651 6.08467C11.5272 6.09241 11.681 6.15903 11.7975 6.27204L11.8542 6.33404C11.9556 6.46078 12.0073 6.62017 11.9995 6.78231C11.9918 6.94445 11.9252 7.09819 11.8122 7.21471L11.7502 7.27138L8.41683 9.93804C8.30978 10.0237 8.17892 10.0743 8.04208 10.0829C7.90524 10.0915 7.76909 10.0576 7.65216 9.98604L7.5835 9.93804L4.25016 7.27138C4.11724 7.1656 4.0297 7.01306 4.00544 6.84493C3.98118 6.67679 4.02202 6.50573 4.11962 6.36669C4.21722 6.22765 4.36422 6.13111 4.5306 6.0968C4.69697 6.06248 4.87018 6.09297 5.01483 6.18204L5.0835 6.23004L7.39283 8.07871L7.3335 2.67338L7.3375 2.59538C7.35495 2.43314 7.43129 2.28293 7.55207 2.17321C7.67284 2.06349 7.82967 2.00188 7.99283 2.00004Z'
                    fill='#525357'
                  />
                </svg>
              </div>
            </Spin>
            <div
              className={styles.create}
              onClick={() => editorRef.current?.openDraw()}
            >
              <div className={styles.aiReport}>
                <svg
                  width='22'
                  height='22'
                  viewBox='0 0 22 22'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M9.95867 6.5C10.2692 6.5 10.5476 6.6915 10.6589 6.98145L13.8464 15.2959C13.884 15.3941 13.8118 15.4999 13.7067 15.5H11.1696C10.8167 15.5 10.5111 15.254 10.4362 14.9092L10.2389 14H7.53874L6.99285 15.0869C6.8655 15.3402 6.60541 15.5 6.32195 15.5H3.67839C3.5643 15.5 3.49158 15.3773 3.54656 15.2773L8.16081 6.88867C8.29263 6.64901 8.54452 6.5 8.81804 6.5H9.95867ZM17.9548 9.5C18.0449 9.50008 18.1144 9.57946 18.1032 9.66895L17.4567 14.8428C17.4098 15.2181 17.0908 15.4999 16.7126 15.5H14.8444C14.7542 15.5 14.6848 15.4206 14.696 15.3311L15.3425 10.1572C15.3894 9.78192 15.7084 9.50002 16.0866 9.5H17.9548ZM9.51433 10.665C9.48433 10.5269 9.29762 10.5026 9.23406 10.6289L8.29265 12.5H9.91277L9.51433 10.665ZM18.3229 6.5C18.4154 6.50027 18.4856 6.58352 18.4704 6.6748L18.2292 8.12305C18.1689 8.48469 17.8556 8.75 17.4889 8.75H15.6012C15.5087 8.74978 15.4386 8.6665 15.4538 8.5752L15.695 7.12695C15.7553 6.76531 16.0686 6.5 16.4352 6.5H18.3229Z'
                    fill='url(#paint0_linear_40_3953)'
                  />
                  <defs>
                    <linearGradient
                      id='paint0_linear_40_3953'
                      x1='5.54742'
                      y1='0.499997'
                      x2='19.0588'
                      y2='15.6501'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='#19E0BD' />
                      <stop offset='1' stopColor='#0CBF9F' />
                    </linearGradient>
                  </defs>
                </svg>
                {I18N.enterpriseCarbonAccount2.score}
              </div>
            </div>
          </div>
        </div>
        {userAnswerLoading && (
          <div className={styles.aiGenerating}>
            <img src={aiSvg} alt='' />
            {I18N.components.loading}
          </div>
        )}
        {socket && provider && !!reportContent && (
          <SimpleEditor
            connectStatus={connect}
            showToolbar={false}
            syncToHocuspocus={syncToHocuspocus}
            provider={provider}
            slug='slug'
            ref={editorRef}
            canEditHeader={false}
            stopAutoScroll={() => {
              canScroll.current = false;
            }}
            editReport={editReport}
            reportContent={reportContent}
            showAiWrite={false}
            reportVersion={reportInfo?.reportVersion}
          />
        )}
      </div>
    </FullscreenModal>
  );
};

export default AiGenerateDetail;
