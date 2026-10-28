import aiSvg from '@src/assets/icon/esg/aiW.svg';
import I18N from '@src/lang/I18N';
import { useMount, useRequest, useThrottle } from 'ahooks';
import { Spin } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { streamFetch } from '@/api/streamFetch';
import { checkPermissions } from '@/components/Permission/utils';
import { IconAlibaba } from '@/components/iconfont';
import { RouteMaps } from '@/router/route-paths';

import NestedSortableList from './components/Sortable';
import styles from './index.module.less';
import {
  getFileStatus,
  getReportInfo,
  postEsgAnalyzeFilesExtractImages,
} from './service';

export interface IAiGenerateOutlineProps {}

let preScrollTop = 0;

export const AiGenerateOutline: FC<IAiGenerateOutlineProps> = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id');
  const [reportName, setReportName] = useState('');
  const [outline, setOutline] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const enable = checkPermissions(true, 'esg:frameReport:edit');

  const throttledOutline = useThrottle(outline, { wait: 50 });

  const abortCtrl = useRef<AbortController>();

  const canScroll = useRef(false);

  const {
    data: fileStatus,
    run: fileStatusRun,
    cancel: fileStatusCancel,
  } = useRequest(() => getFileStatus({ reportId: Number(id) }), {
    pollingInterval: 1000,
    pollingWhenHidden: false,
    manual: true,
  });

  const createOutline = async () => {
    setOutline('');
    setLoading(true);
    canScroll.current = true;
    abortCtrl.current = new AbortController();
    await streamFetch({
      url: `${process.env.REACT_APP_API_URL}/esg/frameReport/aiEsgOutlineCreate`,
      data: {
        reportId: Number(id),
      },
      onMessage: e => {
        setOutline(pre => `${pre}${e}`);
        if (canScroll.current) {
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 32 * 4);
        }
      },
      abortCtrl: abortCtrl.current,
    }).finally(() => {
      setLoading(false);
      fileStatusRun();
    });
  };

  useEffect(() => {
    if (fileStatus?.data.data.status === 1) {
      fileStatusCancel();
    }
  }, [fileStatus?.data.data.status]);

  useMount(() => {
    abortCtrl.current?.abort();
  });

  useMount(async () => {
    if (id) {
      const result = await getReportInfo({
        id: Number(id),
      });
      setReportName(result.data.data.reportName);
      if (result.data.data.outline.length === 0) {
        createOutline();
        postEsgAnalyzeFilesExtractImages({
          reportId: Number(id),
        });
      } else {
        setOutline(result.data.data.outline);
      }
    }
  });

  const history = useHistory();

  const generate = () => {
    history.replace(`${RouteMaps.ESGAiGenerateDetail}?id=${id}`);
  };

  return (
    <div className={styles.wrapper}>
      {/* AiGenerateOutline */}
      <div className={styles.header}>
        <div
          className={styles.icon}
          onClick={() => {
            history.push(RouteMaps.ESGAiGenerateHome);
          }}
        >
          <IconAlibaba type='icon-a-icon_return' />
        </div>
        <span>{reportName}</span>
      </div>
      {/* <Dnd />
    <SortableTree removable /> */}
      <div
        className={styles.content}
        onScroll={e => {
          const target = e.target as HTMLElement;
          if (preScrollTop && target.scrollTop < preScrollTop) {
            canScroll.current = false;
          }
          preScrollTop = target.scrollTop;
        }}
      >
        <NestedSortableList
          outline={throttledOutline}
          id={Number(id)}
          disabled={!enable}
          loading={loading}
          stopAutoScroll={() => {
            canScroll.current = false;
          }}
        />
        <div ref={bottomRef} />
      </div>
      {!loading && enable && (
        <div className={styles.footer}>
          <div className={styles.footerContent}>
            <div
              className={styles.reGenerateOutline}
              onClick={() => createOutline()}
            >
              {I18N.esg.regenerateLarge}
            </div>
            <Spin spinning={fileStatus?.data.data.status === 0}>
              <div className={styles.generateReport} onClick={() => generate()}>
                <img src={aiSvg} alt='' /> {I18N.esg.basedOnTheOutlineStudents}
              </div>
            </Spin>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiGenerateOutline;
