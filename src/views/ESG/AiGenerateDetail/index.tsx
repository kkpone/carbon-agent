/* eslint-disable consistent-return */
import qrCodeImg from '@assets/svg/service_qr_code.png';
import {
  HocuspocusProvider,
  HocuspocusProviderWebsocket,
} from '@hocuspocus/provider';
import aiSvg from '@src/assets/icon/esg/ai.svg';
import I18N from '@src/lang/I18N';
import { useMount, useThrottleFn, useUnmount } from 'ahooks';
import { Button, Spin, theme, Tooltip } from 'antd';
import classNames from 'classnames';
import { saveAs } from 'file-saver';
import { FC, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { streamFetch } from '@/api/streamFetch';
import { FullscreenModal } from '@/components/FullscreenModal';
import { IconAlibaba } from '@/components/iconfont';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { RouteMaps } from '@/router/route-paths';

import styles from './index.module.less';
import { postDownloadReport, postEditReport } from './service';
import { getReportInfo } from '../AiGenerateOutline/service';
import { RatingModal } from '../MsciRatingList/components/RatingModal';

const { useToken } = theme;

const hocuspocusId = (id: string) => `esgReport${id}`;

export interface IAiGenerateDetailProps {}

export const AiGenerateDetail: FC<IAiGenerateDetailProps> = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id');
  const { token } = useToken();

  const [reportName, setReportName] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [syncToHocuspocus, setSyncToHocuspocus] = useState(false);

  const [socket, setSocket] = useState<HocuspocusProviderWebsocket | null>(
    null,
  );

  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  const [downloading, setDownloading] = useState(false);

  const editorRef = useRef<{ submitReport: () => Promise<void> }>();

  const downloadReport = async () => {
    setDownloading(true);
    await editorRef.current?.submitReport?.();
    const result = await postDownloadReport({ id: Number(id) });

    try {
      const { reportUrl } = result.data.data;
      // 通过 fetch 获取文件内容为 Blob
      const response = await fetch(reportUrl);
      const blob = await response.blob();
      // 使用 Blob 保存文件，确保文件名生效
      saveAs(blob, `${reportName}.docx`);
    } catch {
      // 下载失败，已通过 finally 设置 loading 状态
    } finally {
      setDownloading(false);
    }
  };

  const history = useHistory();

  // 判断来源页面并返回
  const handleBack = () => {
    // 使用 history 的 length 判断是否有历史记录
    if (history.length > 1) {
      // 如果有历史记录，直接返回上一页
      history.goBack();
    } else {
      // 如果没有历史记录（直接打开链接），跳转到首页
      history.push(RouteMaps.ESGAiGenerateHome);
    }
  };

  const cancelRequest = useRef<AbortController>();

  const canScroll = useRef(false);

  const { run } = useThrottleFn(
    () => {
      document.getElementById('editorContent')?.scrollIntoView({
        behavior: 'smooth',
      });
    },
    {
      wait: 50,
    },
  );

  const generateReport = async () => {
    setSyncToHocuspocus(true);
    cancelRequest.current = new AbortController();
    canScroll.current = true;
    await streamFetch({
      url: `${process.env.REACT_APP_API_URL}/esg/frameReport/aiEsgGenerate`,
      data: {
        reportId: Number(id),
      },
      onMessage: e => {
        setReportContent(pre => `${pre}${e}`);

        if (canScroll.current) {
          run();
        }
      },
      abortCtrl: cancelRequest.current,
    }).finally(() => {
      setSyncToHocuspocus(false);
    });
  };

  useUnmount(() => {
    cancelRequest.current?.abort();
  });

  useMount(async () => {
    if (id) {
      const result = await getReportInfo({
        id: Number(id),
      });
      setReportName(result.data.data.reportName);
      if (!result.data.data.reportContent) {
        generateReport();
      } else {
        setReportContent(result.data.data.reportContent);
      }
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
      id: Number(id),
      reportContent: reportStr,
    });
  };

  return (
    <FullscreenModal style={{ zIndex: 99 }}>
      <RatingModal
        open={ratingModalOpen}
        esgReportId={Number(id)}
        onCancel={() => setRatingModalOpen(false)}
      />
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
                handleBack();
              }}
            >
              <IconAlibaba type='icon-a-icon_return' />
            </div>
            {reportName}
          </div>
          <div className={styles.rightBtns}>
            <Button
              className={styles.ratingBtn}
              type='primary'
              onClick={() => {
                setRatingModalOpen(!syncToHocuspocus);
              }}
            >
              {I18N.esg.esgRating}
            </Button>
            <Tooltip
              trigger={['hover']}
              title={
                <div className={styles.contact}>
                  <div>{I18N.carbonFootprint3.contactExclusiveCustomers}</div>
                  <img src={qrCodeImg} style={{ width: '140px' }} alt='' />
                </div>
              }
              color={token.Menu?.itemBg}
              arrow={false}
              placement='bottom'
            >
              <div className={styles.tips}>{I18N.esg.contactUs}</div>
            </Tooltip>
            {!syncToHocuspocus && (
              <Spin spinning={downloading}>
                <div
                  className={styles.download}
                  onClick={() => {
                    downloadReport();
                  }}
                >
                  <IconAlibaba type='icon-icon_daoru' />
                </div>
              </Spin>
            )}
          </div>
        </div>
        {syncToHocuspocus && (
          <div className={styles.aiGenerating}>
            <img src={aiSvg} alt='' />
            {I18N.esg.inAiGeneration}
          </div>
        )}
        {socket && provider && !!reportContent && (
          <SimpleEditor
            connectStatus={connect}
            reportId={Number(id)}
            syncToHocuspocus={syncToHocuspocus}
            provider={provider}
            slug='slug'
            ref={editorRef}
            stopAutoScroll={() => {
              canScroll.current = false;
            }}
            editReport={editReport}
            reportContent={reportContent}
          />
        )}
      </div>
    </FullscreenModal>
  );
};

export default AiGenerateDetail;
