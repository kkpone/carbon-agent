import { Alert, Button, Collapse, Progress, Spin } from 'antd';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

import { completionGroupName, monitorStatus } from './labels';
import { monitorCardCopy, splitMonitorMaterial } from './materialAdvice';
import { monitorCardSnapshot } from './results';
import {
  downloadMonitorReport,
  readMonitorCard,
  readMonitorReportPreview,
} from './service';
import type { MonitorCardData, MonitorResult } from './types';
import type { AgentMonitorMaterialOrigin } from '../service';
import styles from './monitor.module.less';
import ReportResultCard from '../components/ReportResultCard';
import conversationStyle from '../index.module.less';

export type MonitorOpenTarget =
  | {
      type: 'cbamMonitor';
      planId: string;
      planName?: string;
      year?: string;
      refreshKey?: string;
    }
  | {
      type: 'report';
      reportId: string;
      reportName?: string;
      reportUrl: string;
      reportReadonly: true;
      reportKind: 'cbamMonitor';
      reportLabel: string;
      refreshKey?: string;
    };
export type MonitorCardProps = {
  result: MonitorResult;
  sessionId?: string;
  originMessageId?: string;
  disabled?: boolean;
  restricted?: boolean;
  onOpen?: (target: MonitorOpenTarget) => void;
  onFilesSelect?: (files: File[], origin?: AgentMonitorMaterialOrigin) => void;
};

/** 完整卡片按当前登录会话获取；分享页面不复用所有者资源接口。 */
export default function MonitorCard({
  result,
  sessionId,
  originMessageId,
  disabled,
  restricted,
  onOpen,
  onFilesSelect,
}: MonitorCardProps) {
  const uploadId = useId();
  const uploadContext = useRef(0);
  const [loadedData, setData] = useState<MonitorCardData>();
  const snapshot = monitorCardSnapshot(result);
  // 历史响应包含完整快照，首次渲染立即使用；实时事件仅含引用时保留原受控读取。
  const data = snapshot || (result.cardResolved ? undefined : loadedData);
  const copy = monitorCardCopy(data?.lang);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [openingReport, setOpeningReport] = useState(false);
  useEffect(() => {
    uploadContext.current += 1;
    let active = true;
    setData(undefined);
    setError('');
    setLoading(false);
    setOpeningReport(false);
    if (!sessionId || !result.cardId || restricted || result.cardResolved)
      return () => {
        active = false;
      };
    setLoading(true);
    readMonitorCard(sessionId, result.cardId)
      .then(value => {
        if (active) setData(value);
      })
      .catch(reason => {
        if (active)
          setError(
            reason instanceof Error ? reason.message : copy.agentLoadFailed,
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      uploadContext.current += 1;
      active = false;
    };
  }, [
    sessionId,
    result.cardId,
    result.fileId,
    result.cardResolved,
    restricted,
    retry,
  ]);
  const planId = data?.planId || result.planId;
  // 来源随文件提交，由服务端核验；不能用 activeIntake 推断无计划卡的目标。
  const upload = (files: File[]) => {
    if (!sessionId || !data || !onFilesSelect || disabled || restricted) return;
    if (!originMessageId || !result.cardId) {
      setError(copy.agentHistoricalHint);
      return;
    }
    onFilesSelect(files, {
      entry: 'monitor_material_advice_card',
      cardId: result.cardId,
      originMessageId,
      planId,
      intakeId: data.intakeId,
    });
  };
  const download = async () => {
    if (!sessionId || !result.fileId) return;
    setDownloading(true);
    setError('');
    try {
      await downloadMonitorReport(sessionId, result.fileId, result.fileName);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : copy.agentDownloadFailed,
      );
    } finally {
      setDownloading(false);
    }
  };
  const openReport = async () => {
    if (
      !sessionId ||
      !result.fileId ||
      !onOpen ||
      restricted ||
      disabled ||
      result.fileStatus !== 'READY'
    )
      return;
    const context = uploadContext.current;
    setOpeningReport(true);
    setError('');
    try {
      const report = await readMonitorReportPreview(sessionId, result.fileId);
      if (context !== uploadContext.current) return;
      onOpen({
        type: 'report',
        reportId: result.fileId,
        reportName: report.fileName,
        reportUrl: report.reportUrl,
        reportReadonly: true,
        reportKind: 'cbamMonitor',
        reportLabel:
          report.language === 'EN'
            ? copy.agentReportEnTab
            : copy.agentReportZhTab,
        refreshKey: `${result.fileId}:${report.sourceDataVersion ?? ''}`,
      });
    } catch (reason) {
      if (context === uploadContext.current)
        setError(
          reason instanceof Error ? reason.message : copy.agentLoadFailed,
        );
    } finally {
      if (context === uploadContext.current) setOpeningReport(false);
    }
  };
  // 报告与原 CBAM 报告复用同一个结果卡，禁止在结果卡上另建生成流程。
  if (result.fileId) {
    const ready = result.fileStatus === 'READY';
    return (
      <section data-screen-label='Monitor conversation result'>
        <ReportResultCard
          title={result.fileName || copy.agentReport}
          notice={ready ? copy.agentReportGenerated : copy.agentReportPending}
          hint={
            restricted
              ? copy.agentPrivateResource
              : `${
                  result.language === 'EN'
                    ? copy.agentEnglishReport
                    : copy.agentChineseReport
                } · ${copy.agentSourceVersion}: ${
                  result.sourceDataVersion ?? '—'
                }`
          }
          viewLabel={copy.agentViewReport}
          disabled={
            disabled ||
            restricted ||
            !sessionId ||
            !ready ||
            !onOpen ||
            openingReport
          }
          onOpen={openReport}
          extraActions={
            !restricted && (
              <button
                className={conversationStyle.reportBusinessCardButton}
                type='button'
                disabled={disabled || !sessionId || !ready || downloading}
                onClick={download}
              >
                {copy.agentDownload}
              </button>
            )
          }
        />
        {openingReport && <Spin aria-label={copy.agentLoading} />}
        {error && <Alert type='error' showIcon message={error} />}
      </section>
    );
  }
  return (
    <section
      className={styles.card}
      data-screen-label='Monitor conversation result'
      lang={data?.lang}
    >
      {!data?.completion && (
        <div className={styles.heading}>
          <strong>{data?.title || copy.monitoringPlan}</strong>
        </div>
      )}
      {restricted ? (
        <p className={styles.muted}>{copy.agentPrivateResource}</p>
      ) : (
        <>
          {loading && !result.cardResolved && (
            <Spin aria-label={copy.agentLoading} />
          )}
          {result.cardResolved && !snapshot && (
            <Alert
              type='error'
              showIcon
              message={copy.agentHistoryLoadFailed}
            />
          )}
          {error && (
            <Alert
              type='error'
              showIcon
              message={error}
              action={
                result.cardId ? (
                  <Button onClick={() => setRetry(value => value + 1)}>
                    {copy.agentRetry}
                  </Button>
                ) : undefined
              }
            />
          )}
          {(!loading || result.cardResolved) && data && (
            <MonitorCardContent
              key={result.cardId}
              data={data}
              uploadControl={
                data.groups && onFilesSelect ? (
                  <label
                    htmlFor={uploadId}
                    className={styles.upload}
                    aria-disabled={disabled}
                  >
                    <span>+ {copy.agentUpload}</span>
                    <input
                      id={uploadId}
                      type='file'
                      multiple
                      disabled={disabled}
                      aria-label={copy.agentUpload}
                      onChange={event => {
                        const files = Array.from(event.target.files || []);
                        if (files.length) upload(files);
                        event.target.value = '';
                      }}
                    />
                  </label>
                ) : undefined
              }
            />
          )}
          {!data && result.summary && <p>{result.summary}</p>}
          <div className={styles.actions}>
            {planId && onOpen && (
              <Button
                disabled={disabled}
                onClick={() =>
                  onOpen({
                    type: 'cbamMonitor',
                    planId,
                    planName: result.planName,
                    year: String(data?.year || result.year || ''),
                    refreshKey: String(
                      data?.dataVersion ?? result.dataVersion ?? '',
                    ),
                  })
                }
              >
                {copy.agentOpenPlan}
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

/** 直接展示服务端22组完成率及解释，不从前端表单重新计算保存快照的进度。 */
export function MonitorCardContent({
  data,
  uploadControl,
}: {
  data: MonitorCardData;
  uploadControl?: ReactNode;
}) {
  const copy = monitorCardCopy(data.lang);
  const gapGroups = data.gapGroups || [];
  const legacyGroups = Array.from(
    new Set((data.gaps || []).map(gap => gap.sectionCode)),
  );
  return (
    <>
      {data.introduction ? (
        <p>{data.introduction}</p>
      ) : (
        data.summary && <p>{data.summary}</p>
      )}
      {data.groups?.map((group, index) => (
        <section className={styles.adviceGroup} key={group.title}>
          <h4>
            {index + 1}. {group.title}
          </h4>
          {group.description && <p>{group.description}</p>}
          <ul className={styles.materialList}>
            {group.rows.map(row => {
              const content = splitMonitorMaterial(row.materials);
              return (
                <li key={row.name}>
                  <strong className={styles.materialTitle}>{row.name}</strong>
                  {content.information && (
                    <p>
                      <strong>{copy.agentMaterialInformation}</strong>{' '}
                      {content.information}
                    </p>
                  )}
                  <p>
                    {content.information && (
                      <>
                        <strong>{copy.agentMaterialSources}</strong>{' '}
                      </>
                    )}
                    {content.materials}
                  </p>
                </li>
              );
            })}
          </ul>
          {group.note && <p>{group.note}</p>}
        </section>
      ))}
      {data.groups && (
        <>
          <div className={styles.callout}>
            <h4>{copy.agentUploadTitle}</h4>
            {data.uploadText && <p>{data.uploadText}</p>}
            {uploadControl}
          </div>
          <section className={styles.adviceGroup}>
            <h4>{copy.agentConversationTitle}</h4>
            {data.conversationText && <p>{data.conversationText}</p>}
            {data.replyTemplate && <p>{data.replyTemplate}</p>}
          </section>
          <section className={styles.callout}>
            <h4>{copy.agentQuestionTitle}</h4>
            {data.questionText && <p>{data.questionText}</p>}
            <ul className={styles.examples}>
              {data.examples?.map(example => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </section>
        </>
      )}
      {!!data.receivedMaterials?.length && (
        <section className={styles.adviceGroup}>
          <h4>
            {copy.agentFileSummary} ({data.receivedMaterials.length})
          </h4>
          <ul className={styles.receivedList}>
            {data.receivedMaterials.map(source => (
              <li key={source.sourceId}>
                <strong>{source.name}</strong>
                {source.processingStatus && (
                  <span>
                    {' '}
                    &middot; {monitorStatus(source.processingStatus, data.lang)}
                  </span>
                )}
                {source.coverage && <p>{source.coverage}</p>}
                {source.unprocessed && <p>{source.unprocessed}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {data.completion && (
        <>
          <h4>{copy.agentGaps}</h4>
          {/* 完整保存快照没有缺项时，不再提示用户“以下信息仍需补充”。 */}
          {(gapGroups.length > 0 || legacyGroups.length > 0) && (
            <p>{copy.agentGapIntro}</p>
          )}
          {(gapGroups.length > 0 || legacyGroups.length > 0) && (
            <div className={styles.businessGaps}>
              {gapGroups.map((group, index) => (
                <section className={styles.gapGroup} key={group.code}>
                  <h4>
                    {String(index + 1).padStart(2, '0')} &middot; {group.title}
                  </h4>
                  {group.meaning && (
                    <p>
                      <strong>{copy.agentGapMeaning}: </strong>
                      {group.meaning}
                    </p>
                  )}
                  {!!group.suggestedMaterials?.length && (
                    <p>
                      <strong>{copy.agentGapMaterials}: </strong>
                      {group.suggestedMaterials.join(' / ')}
                    </p>
                  )}
                  <p className={styles.missingFields}>
                    <strong>{copy.agentMissingFields}: </strong>
                    {Array.from(
                      new Set(group.items.map(item => item.name)),
                    ).join(' / ')}
                  </p>
                </section>
              ))}
              {!gapGroups.length &&
                legacyGroups.map(code => (
                  <section className={styles.gapGroup} key={code}>
                    <h4>{completionGroupName(code, data.lang)}</h4>
                    <p>
                      {Array.from(
                        new Set(
                          (data.gaps || [])
                            .filter(gap => gap.sectionCode === code)
                            .map(gap =>
                              /[\u4e00-\u9fff]/.test(gap.name) ||
                              data.lang === 'en'
                                ? gap.name
                                : completionGroupName(code, data.lang),
                            ),
                        ),
                      ).join(' / ')}
                    </p>
                  </section>
                ))}
            </div>
          )}
          {!gapGroups.length && !legacyGroups.length && (
            <p>{copy.agentNoGaps}</p>
          )}
          <details className={styles.progressDetails}>
            <summary>
              {copy.agentProgressDetails} &middot;{' '}
              {data.completion.completedCount}/{data.completion.totalCount}
            </summary>
            <p>{copy.agentSavedProgress}</p>
            <Progress percent={Number(data.completion.completionRate)} />
            <p className={styles.muted}>
              {copy.agentSourceVersion}: {data.dataVersion ?? '—'}
            </p>
            {data.completion.groupStats && (
              <Collapse
                items={[
                  {
                    key: 'groups',
                    label: copy.agentGroupDetails,
                    children: (
                      <ul>
                        {data.completion.groupStats.map(group => (
                          <li key={group.sectionCode}>
                            {completionGroupName(group.sectionCode, data.lang)}{' '}
                            &middot; {group.filledRequiredCount}/
                            {group.requiredCount}
                          </li>
                        ))}
                      </ul>
                    ),
                  },
                ]}
              />
            )}
          </details>
        </>
      )}
    </>
  );
}
