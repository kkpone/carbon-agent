// import classNames from 'classnames';
// import { CloseOutlined } from '@ant-design/icons';
import { CloseOutlined } from '@ant-design/icons';
import { FullscreenModal } from '@src/components/FullscreenModal';
import I18N from '@src/lang/I18N';
import { sleep } from '@src/utils';
import { useInterval, useMount, useRequest } from 'ahooks';
import { App, Spin } from 'antd';
// import classNames from 'classnames';
import classNames from 'classnames';
import { saveAs } from 'file-saver';
import { debounce } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import climateSvg from 'src/components/CDPAiScore/components/ModulesCard/climate.svg';
// import waterSvg from 'src/components/CDPAiScore/components/ModulesCard/copy.svg';
// import forestSvg from 'src/components/CDPAiScore/components/ModulesCard/forest.svg';

// import { ModulesCard } from '@/components/CDPAiScore/components/ModulesCard';

import { ModulesCard } from '@/components/CDPAiScore/components/ModulesCard';
import { getDownloadScoreExcel } from '@/components/CDPAiScore/service';
import { Toast } from '@/views/subModules/CarbonFootprintModel/components/Toast/verifty';

import { InfoForm } from './components/InfoForm';
import ReportHeader from './components/ReportHeader';
// import { ReportInfo } from './components/ReportInfo';
import { FormItemStatus } from './components/type';
import { CdpAiAssistantProvider } from './context';
import styles from './index.module.less';
import {
  IReport,
  getReportDetail,
  getAiScoreDataOnline,
  postScoreByModelType,
  postScoreByQuestionCode,
  getReportRuleData,
  ScoreData,
} from './service';
import { useReportId } from '../hooks/useReportId';

interface CdpAiAssistantProps {
  // define your props here
}

const CdpAiAssistant: React.FC<CdpAiAssistantProps> = () => {
  const [reportInfo, setReportInfo] = useState<IReport>();
  const [infoRefreshKey, setInfoRefreshKey] = useState(0);
  const [filter, setFilter] = useState<FormItemStatus[]>([
    FormItemStatus.filled,
    FormItemStatus.unfilled,
    FormItemStatus.generating,
    FormItemStatus.toBeConfirmed,
  ]);

  const [reportId] = useReportId();

  const { data, run, loading } = useRequest(async () =>
    getAiScoreDataOnline({ reportId: reportId || 0 }),
  );

  const { data: ruleData } = useRequest(async () =>
    getReportRuleData({ reportId: reportId || 0 }),
  );

  useMount(async () => {
    const result = await getReportDetail({ id: reportId });
    setReportInfo(result.data.data);
  });

  const refresh = async () => {
    const result = await getReportDetail({ id: reportId });
    setReportInfo(result.data.data);
    setInfoRefreshKey(pre => pre + 1);
    run();
  };

  const refreshHeader = useCallback(
    debounce(async () => {
      const result = await getReportDetail({ id: reportId });
      setReportInfo(result.data.data);
    }, 500),
    [reportId],
  );

  /** 是否在重新打分中 */
  const [userAnswerLoading, setUserAnswerLoading] = useState(false);

  const result = data;

  const scoring = useMemo(
    () =>
      result?.data.data.scoreDataList.some(
        item => item.scoreStatus !== 1 && item.scoreStatus !== 0,
      ),
    [data?.data.data.scoreDataList],
  );

  // const notScored = useMemo(
  //   () => result?.data.data.scoreDataList.every(item => item.scoreStatus === 0),
  //   [result?.data.data.scoreDataList],
  // );

  const [interval, setInterval] = useState<number | undefined>(1000);

  // useEffect(() => {
  //   const getScore = async () => {
  //     if (notScored) {
  //       setInterval(1000 * 60 * 5);
  //       setOpen?.(true);
  //       await postStartScore({ reportId: Number(reportId || '0') });
  //       setInterval(1000);
  //     }
  //   };
  //   getScore();
  // }, [notScored, reportId]);

  useInterval(() => {
    if (!loading) {
      run();
    }
  }, interval);

  useEffect(() => {
    if (scoring) {
      setInterval(1000);
    } else {
      setInterval(1000 * 60 * 5);
    }
  }, [scoring]);

  const showScoreDataList = useMemo(() => {
    const list = result?.data.data.scoreDataList.slice(0, 4) || [];
    // if (list)
    if (list.some(item => item.ruleType !== 4)) {
      if (list.every(item => item.ruleType !== 1)) {
        list.push({
          ruleType: 1,
          scores: 'A',
          questionDataList: [],
          disclosurePercent: 0,
          cognitionPercent: 0,
          managePercent: 0,
          leaderPercent: 0,
          disable: true,
        } as unknown as ScoreData);
      }
      if (reportInfo?.reportVersion === '2') {
        return list;
      }
      if (list.every(item => item.ruleType !== 3)) {
        list.push({
          ruleType: 3,
          scores: 'A',
          questionDataList: [],
          disclosurePercent: 0,
          cognitionPercent: 0,
          managePercent: 0,
          leaderPercent: 0,
          disable: true,
        } as unknown as ScoreData);
      }
      if (list.every(item => item.ruleType !== 2)) {
        list.push({
          ruleType: 2,
          scores: 'A',
          questionDataList: [],
          disclosurePercent: 0,
          cognitionPercent: 0,
          managePercent: 0,
          leaderPercent: 0,
          disable: true,
        } as unknown as ScoreData);
      }
    }

    const index = list.findIndex(item => item.ruleType === 2);
    const target = list[index];
    const removedList = list.filter(item => item.ruleType !== 2);
    if (target) {
      removedList.push(target);
    }
    return removedList;
  }, [result]);

  const [drawOpen, setDrawOpen] = useState(false);

  const reScoreByModelType = async (modelType: '1' | '2' | '3' | '4') => {
    setUserAnswerLoading(true);
    try {
      // await submitReportMarkdown?.();
      setInterval(1000);
      await postScoreByModelType({
        reportId: Number(reportId || '0'),
        modelType,
      }).catch(
        (error: {
          data: {
            code: number;
          };
        }) => {
          /** 这个接口超时不算失败 */
          if (error.data.code !== 504) {
            setTimeout(() => {
              setUserAnswerLoading(false);
              setInterval(1000 * 60 * 5);
            }, 1000);
          }
        },
      );
      setTimeout(() => {
        setUserAnswerLoading(false);
        setInterval(1000 * 60 * 5);
      }, 1000);
    } catch (error) {
      setUserAnswerLoading(false);
    }
  };

  const rescore = useCallback(
    async (questionCode: string) => {
      setUserAnswerLoading(true);
      setDrawOpen(true);
      await sleep(300);
      try {
        // await submitReportMarkdown?.();
        setInterval(1000);
        await postScoreByQuestionCode({
          reportId: Number(reportId || '0'),
          questionCode,
        }).catch(
          (error: {
            data: {
              code: number;
            };
          }) => {
            /** 这个接口超时不算失败 */
            if (error.data.code !== 504) {
              setTimeout(() => {
                setUserAnswerLoading(false);
                setInterval(1000 * 60 * 5);
              }, 1000);
            }
          },
        );
        setTimeout(() => {
          setUserAnswerLoading(false);
          setInterval(1000 * 60 * 5);
        }, 1000);
      } catch (error) {
        setUserAnswerLoading(false);
      }
    },
    [reportId],
  );

  const [downloading, setDownloading] = useState(false);

  const handleDownloadScoreExcel = async () => {
    setDownloading(true);
    try {
      const excelResult = await getDownloadScoreExcel({
        reportId: Number(reportId || '0'),
      });
      if (excelResult.data.code === 200) {
        // 获取文件数据后再使用 saveAs
        const response = await fetch(excelResult.data.data.url);
        const blob = await response.blob();
        saveAs(blob, excelResult.data.data.name);
      } else {
        Toast('error', I18N.carbonData.downloadFailed);
      }
    } catch (error) {
      Toast('error', I18N.carbonData.downloadFailed);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <FullscreenModal>
      <CdpAiAssistantProvider
        rescore={rescore}
        ruleData={ruleData?.data.data}
        drawOpen={drawOpen}
      >
        <div className={styles.full}>
          <div className={styles.header}>
            <App>
              <ReportHeader
                filter={filter}
                reportInfo={reportInfo}
                userAnswerLoading={userAnswerLoading}
                setFilter={setFilter}
                refresh={refresh}
                setDrawOpen={() => setDrawOpen(pre => !pre)}
              />
            </App>
          </div>
          <div className={styles.wrapper}>
            {/* 整体重渲染 */}
            <InfoForm
              filter={filter}
              drawOpen
              refreshHeader={refreshHeader}
              key={`${filter.join(',')}${infoRefreshKey}`}
            />
            <div
              className={classNames(styles.draw, {
                [styles.drawOpen]: drawOpen,
              })}
            >
              <div className={styles.header}>
                <div className={styles.title}>
                  {I18N.enterpriseCarbonAccount2.aiRatingOnly}
                </div>
                <div className={styles.closeWrapper}>
                  <Spin spinning={downloading}>
                    <div
                      className={styles.downloadIcon}
                      onClick={() => handleDownloadScoreExcel()}
                    >
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
                    className={styles.close}
                    onClick={() => setDrawOpen(false)}
                  >
                    <CloseOutlined />
                  </div>
                </div>
              </div>
              <div className={styles.content}>
                {showScoreDataList.map(module => (
                  <ModulesCard
                    getContentByHeader={() => ''}
                    info={module}
                    isOnline
                    loading={loading}
                    reScoreByModelType={reScoreByModelType}
                    refresh={() => {
                      run();
                    }}
                    disable={module.disable}
                    userAnswerLoading={userAnswerLoading || scoring}
                    setUserAnswerLoading={setUserAnswerLoading}
                    reportVersion={reportInfo?.reportVersion}
                    replaceContent={() => ''}
                  />
                ))}
              </div>
              {(userAnswerLoading || scoring) && (
                <div className={styles.loading}>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='16'
                    height='16'
                    viewBox='0 0 16 16'
                    fill='none'
                  >
                    <path
                      d='M7.57331 2.41339C7.69331 1.98673 8.30665 1.98673 8.42665 2.41339L9.01331 4.52006C9.34665 5.70673 10.28 6.64006 11.48 6.97339L13.5866 7.57339C14.0133 7.69339 14.0133 8.30673 13.5866 8.42673L11.48 9.01339C10.28 9.36006 9.34665 10.2801 9.01331 11.4801L8.42665 13.5867C8.30665 14.0134 7.69331 14.0134 7.57331 13.5867L6.97331 11.4801C6.63998 10.2934 5.70665 9.36006 4.51998 9.01339L2.41331 8.42673C2.31829 8.40279 2.23399 8.34781 2.17375 8.27052C2.11352 8.19323 2.08081 8.09805 2.08081 8.00006C2.08081 7.90207 2.11352 7.80689 2.17375 7.7296C2.23399 7.65231 2.31829 7.59733 2.41331 7.57339L4.51998 6.97339C5.70665 6.64006 6.63998 5.70673 6.97331 4.52006L7.57331 2.41339ZM13.2 0.453394C13.24 0.32006 13.4133 0.32006 13.4533 0.453394L13.6933 1.28006C13.8266 1.77339 14.2133 2.16006 14.7066 2.29339L15.5333 2.53339C15.6666 2.57339 15.6666 2.74673 15.5333 2.78673L14.7066 3.02673C14.2133 3.16006 13.8266 3.54673 13.6933 4.04006L13.4533 4.86673C13.4133 5.00006 13.24 5.00006 13.2 4.86673L12.96 4.04006C12.8266 3.54673 12.44 3.16006 11.9466 3.02673L11.12 2.78673C10.9866 2.74673 10.9866 2.57339 11.12 2.53339L11.9466 2.29339C12.44 2.16006 12.8266 1.77339 12.96 1.28006L13.2 0.453394Z'
                      fill='#026961'
                    />
                  </svg>
                  {I18N.components.aiRating}
                </div>
              )}
            </div>
            {/* <ReportInfo refresh={refresh} /> */}
          </div>
        </div>
      </CdpAiAssistantProvider>
    </FullscreenModal>
  );
};
export default CdpAiAssistant;
