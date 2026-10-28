/* eslint-disable no-restricted-syntax */
import { CloseOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Spin, Tag, Tooltip } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';

import { CustomDrawer } from '@/components/CustomDrawer';

import iconAvatar from './icon_avatar.svg';
import styles from './index.module.less';
import { getAuditRecordList } from '../service';

interface AuditRecordDrawerProps {
  taskId: number | null;
  ticket?: string;
  open: boolean;
  onClose: () => void;
}

/** recordAuditStatus: 1 通过 2 驳回 3 提交 4 修改 */
const AUDIT_STATUS_MAP: Record<number, { text: string; styleKey: string }> = {
  1: { text: I18N.carbonAccount.adopt, styleKey: 'statusPass' },
  2: { text: I18N.carbonAccount.reject, styleKey: 'statusReject' },
  3: { text: I18N.components.submit, styleKey: 'statusSubmit' },
  4: { text: I18N.dashborad.modify, styleKey: 'statusModify' },
};

const AuditRecordDrawer: FC<AuditRecordDrawerProps> = ({
  taskId,
  ticket,
  open,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    id: number;
    sourceId: number;
    name: string;
    initiate: string;
    updateTime: string;
    appoint: string;
    /** 当前审批人 */
    approvers?: string;
    auditRecordList: {
      recordId: number;
      nodeName: string;
      instanceAuditStatus: number;
      actionTime: string;
      instanceId: number;
      dataId: number;
      modifiedFields: string | null;
      /** 修改的活动数据，修改节点时从该字段取值 */
      modifiedActivityData?: string | null;
      attachmentIds: string | null;
      modifiedAttachment: string | null;
      originalData: string | null;
      /** 活动数据，提交/结束节点从该字段取值 */
      activityData?: string | null;
      recordAuditStatus: number;
      operatorName: string;
      opinion: string | null;
    }[];
  } | null>(null);

  useEffect(() => {
    if (open && taskId) {
      setLoading(true);
      getAuditRecordList({ id: taskId, ticket })
        .then(res => {
          setData(res.data.data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, taskId, ticket]);

  const parseModifiedFields = (modifiedFields: string | null) => {
    if (!modifiedFields) return null;
    try {
      return JSON.parse(modifiedFields);
    } catch {
      return null;
    }
  };

  /** 将修改记录转为可渲染的字符串，避免直接渲染对象报错 */
  const formatModifiedFieldsDisplay = (
    value: string | object | null | undefined,
  ): string => {
    if (value == null) return '--';
    if (typeof value === 'string') return value || '--';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  /** 活动数据展示：无数据 --，有数据格式化为「参数名-数据及单位」等形式 */
  const formatActivityDataDisplay = (
    activityData: string | null | undefined,
    modifiedFields: string | null,
    modifiedActivityData: string | null | undefined,
  ): string => {
    if (modifiedActivityData != null && modifiedActivityData !== '') {
      const parsed = parseModifiedFields(modifiedActivityData);
      return formatModifiedFieldsDisplay(parsed ?? modifiedActivityData);
    }
    if (modifiedFields != null && modifiedFields !== '') {
      const parsed = parseModifiedFields(modifiedFields);
      return formatModifiedFieldsDisplay(parsed ?? modifiedFields);
    }
    if (activityData == null || activityData === '') return '--';
    const parsed = parseModifiedFields(activityData);
    return formatModifiedFieldsDisplay(parsed ?? activityData);
  };

  const parseAttachmentIds = (attachmentIds: string | null) => {
    if (!attachmentIds) return [];
    try {
      return JSON.parse(attachmentIds);
    } catch {
      return [];
    }
  };

  type ParsedAttachment = { name: string; url?: string; supportImgId?: number };

  /** 解析 modifiedAttachment 字符串，支持 JSON 或 Java toString 风格 */
  const parseModifiedAttachment = (str: string | null): ParsedAttachment[] => {
    if (!str || !str.trim()) return [];
    const s = str.trim();
    try {
      const parsed = JSON.parse(s);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      return list.map((item: any) => ({
        name: item.name ?? item.fileName ?? '-',
        url: item.url,
        supportImgId: item.supportImgId,
      }));
    } catch {
      // Java toString 风格: "[{supportImgId=194977, name=_天然气-6月.pdf, url=...}]"
      const list: ParsedAttachment[] = [];
      const inner = s.replace(/^\[\s*\{?\s*/, '').replace(/\s*\}?\s*\]$/, '');
      const objects = inner.split(/\}\s*,\s*\{/);
      /** eslint-disable-next-line no-restricted-syntax */
      for (const objStr of objects) {
        const entry: Record<string, string | number> = {};
        const pairs = objStr.split(/,\s*/);
        for (const pair of pairs) {
          const idx = pair.indexOf('=');
          if (idx === -1) continue; // eslint-disable-line no-continue
          const key = pair.slice(0, idx).trim();
          const value = pair.slice(idx + 1).trim();
          const num = Number(value);
          entry[key] = Number.isNaN(num) ? value : num;
        }
        list.push({
          name: String(entry.name ?? entry.fileName ?? '-'),
          url: entry.url as string | undefined,
          supportImgId: entry.supportImgId as number | undefined,
        });
      }
      return list;
    }
  };

  return (
    <CustomDrawer
      title={I18N.supplyChainCarbonManagement.approvalRecords}
      placement='right'
      width={560}
      open={open}
      onClose={onClose}
      closeIcon={<CloseOutlined />}
      className={styles.auditRecordDrawer}
    >
      <Spin spinning={loading}>
        {data && (
          <div className={styles.drawerContent}>
            <div className={styles.taskName}>{data.name}</div>

            <div className={styles.infoRow}>
              <div className={styles.infoItem}>
                <span className={styles.label}>
                  {I18N.enterpriseCarbonAccount2.initiator2}
                </span>
                <div className={styles.userWrapper}>
                  <img
                    src={iconAvatar}
                    alt='avatar'
                    style={{ width: 24, height: 24 }}
                  />
                  {/* <Avatar size={24} icon={<UserOutlined />} /> */}
                  <span className={styles.value}>{data.initiate}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>
                  {I18N.greenMeeting.atTheFinalUpdate}
                </span>
                <div className={styles.timeWrapper}>
                  <span className={styles.value}>
                    {moment(data.updateTime).format('YYYY-MM-DD HH:mm:ss')}
                  </span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>
                  {I18N.enterpriseCarbonAccount2.reportedBy}
                </span>
                <div className={styles.userWrapper}>
                  <img
                    src={iconAvatar}
                    alt='avatar'
                    style={{ width: 24, height: 24 }}
                  />
                  <span className={styles.value}>{data.appoint}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>
                  {I18N.enterpriseCarbonAccount2.currentApprover}
                </span>
                <div className={styles.userWrapper}>
                  <img
                    src={iconAvatar}
                    alt='avatar'
                    style={{ width: 24, height: 24 }}
                  />
                  {(() => {
                    const names = (data.approvers || '')
                      .split(',')
                      .map(s => s.trim())
                      .filter(Boolean);
                    const displayText =
                      names.length === 0
                        ? '-'
                        : names.length > 3
                        ? I18N.template(I18N.enterpriseCarbonAccount2.names2, {
                            val1: names.slice(0, 3).join('、'),
                          })
                        : names.join('、');
                    const content = (
                      <span className={styles.value}>{displayText}</span>
                    );
                    return names.length > 3 ? (
                      <Tooltip title={names.join('、')}>{content}</Tooltip>
                    ) : (
                      content
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className={styles.recordList}>
              {[...data.auditRecordList]
                .sort(
                  (a, b) =>
                    new Date(b.actionTime).getTime() -
                    new Date(a.actionTime).getTime(),
                )
                .map((record, index, sortedList) => {
                  const status = record.recordAuditStatus;
                  const statusInfo = AUDIT_STATUS_MAP[status];
                  // const modifiedFields = parseModifiedFields(
                  //   record.modifiedFields,
                  // );
                  const attachmentIds = parseAttachmentIds(
                    record.attachmentIds,
                  );
                  const modifiedAttachments = parseModifiedAttachment(
                    record.modifiedAttachment,
                  );
                  const isEndNode =
                    status === 1 &&
                    (record.nodeName ===
                      I18N.enterpriseCarbonAccount2.endNode ||
                      String(record.nodeName).includes(
                        I18N.carbonFootprint.finish,
                      ));
                  const isSubmitNode = status === 3;
                  const isModifyNode = status === 4;
                  const isApprovalNode =
                    (status === 1 || status === 2) && !isEndNode;

                  const displayNodeName = isEndNode
                    ? I18N.enterpriseCarbonAccount2.endNode
                    : isSubmitNode || isModifyNode
                    ? I18N.enterpriseCarbonAccount2.submissionNode
                    : record.nodeName;
                  const subtitle = isEndNode
                    ? I18N.DomesticVersion.complete
                    : statusInfo?.text ?? '';

                  // 提交、结束节点展示 activityData，修改节点展示 modifiedActivityData
                  const activityDataText = isModifyNode
                    ? formatActivityDataDisplay(
                        null,
                        null,
                        record.modifiedActivityData,
                      )
                    : formatActivityDataDisplay(
                        record.activityData,
                        null,
                        null,
                      );
                  const attachmentDisplay: { name: string; url?: string }[] =
                    isModifyNode ? modifiedAttachments : attachmentIds;
                  const isLast = index === sortedList.length - 1;

                  return (
                    <div key={record.recordId} className={styles.recordItem}>
                      <div className={styles.recordLeft}>
                        <div className={styles.recordDate}>
                          {moment(record.actionTime).format('YYYY')}
                        </div>
                        <div className={styles.recordDay}>
                          {moment(record.actionTime).format('MM-DD')}
                        </div>
                      </div>

                      <div className={styles.timelineWrapper}>
                        <div className={styles.timelineDot} />
                        {!isLast && <div className={styles.timelineLine} />}
                      </div>

                      <div className={styles.recordRight}>
                        <div className={styles.recordHeader}>
                          <span className={styles.nodeName}>
                            <span className={styles.nodeNameLabel}>
                              {I18N.enterpriseCarbonAccount2.nodeName}
                            </span>
                            <span className={styles.nodeNameValue}>
                              {displayNodeName}
                            </span>
                          </span>
                          <Tag
                            className={classNames(
                              styles.statusTag,
                              statusInfo &&
                                styles[
                                  statusInfo.styleKey as keyof typeof styles
                                ],
                            )}
                          >
                            {subtitle}
                          </Tag>
                          <span className={styles.recordTime}>
                            {moment(record.actionTime).format('HH:mm:ss')}
                          </span>
                        </div>

                        <div className={styles.recordBody}>
                          {/* 提交节点：填报人、活动数据、附件 */}
                          {(isSubmitNode || isModifyNode) && (
                            <>
                              <div className={styles.recordRow}>
                                <span className={styles.recordLabel}>
                                  {I18N.enterpriseCarbonAccount2.applicant}
                                </span>
                                <span className={styles.recordValue}>
                                  {record.operatorName}
                                </span>
                              </div>
                              <div className={styles.recordRow}>
                                <span className={styles.recordLabel}>
                                  {I18N.supplyChain2.activityData}
                                </span>
                                <span className={styles.recordValue}>
                                  {activityDataText}
                                </span>
                              </div>
                              {isModifyNode &&
                                (record.originalData != null ||
                                  record.modifiedFields != null) && (
                                  <div className={styles.recordRow}>
                                    <span className={styles.recordLabel}>
                                      {
                                        I18N.enterpriseCarbonAccount2
                                          .revisionRecord
                                      }
                                    </span>
                                    <span
                                      className={`${styles.recordValue} ${styles.recordValuePreLine}`}
                                    >
                                      <span className={styles.revisionItem}>
                                        <span
                                          className={styles.revisionSubLabel}
                                        >
                                          {
                                            I18N.enterpriseCarbonAccount2
                                              .originalValue
                                          }
                                          ：
                                        </span>
                                        {record.originalData}
                                      </span>
                                      <span
                                        className={`${styles.revisionItem} ${styles.recordValueNew}`}
                                      >
                                        <span
                                          className={styles.revisionSubLabel}
                                        >
                                          {
                                            I18N.enterpriseCarbonAccount2
                                              .newValue
                                          }
                                          ：
                                        </span>
                                        {record.modifiedFields}
                                      </span>
                                    </span>
                                  </div>
                                )}
                              <div className={styles.recordRow}>
                                <span className={styles.recordLabel}>
                                  {I18N.enterpriseCarbonAccount2.attachment}
                                </span>
                                <span className={styles.recordValue}>
                                  {attachmentDisplay.length > 0 ? (
                                    <span className={styles.attachmentList}>
                                      {attachmentDisplay.map(att =>
                                        att.url ? (
                                          <a
                                            key={att.name}
                                            href={att.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className={styles.attachmentTag}
                                          >
                                            {att.name}
                                          </a>
                                        ) : (
                                          <span
                                            key={att.name}
                                            className={styles.attachmentTag}
                                          >
                                            {att.name}
                                          </span>
                                        ),
                                      )}
                                    </span>
                                  ) : (
                                    '--'
                                  )}
                                </span>
                              </div>
                            </>
                          )}

                          {/* 审批节点：审批人、审批意见(仅驳回时) */}
                          {isApprovalNode && (
                            <>
                              <div className={styles.recordRow}>
                                <span className={styles.recordLabel}>
                                  {I18N.enterpriseCarbonAccount2.approver2}
                                </span>
                                <span className={styles.recordValue}>
                                  {record.operatorName}
                                </span>
                              </div>
                              {record.opinion && (
                                <div className={styles.recordRow}>
                                  <span className={styles.recordLabel}>
                                    {
                                      I18N.enterpriseCarbonAccount2
                                        .approvalComments
                                    }
                                  </span>
                                  <span className={styles.recordValue}>
                                    {record.opinion}
                                  </span>
                                </div>
                              )}
                            </>
                          )}

                          {/* 结束节点：活动数据、附件 */}
                          {isEndNode && (
                            <>
                              <div className={styles.recordRow}>
                                <span className={styles.recordLabel}>
                                  {I18N.supplyChain2.activityData}
                                </span>
                                <span className={styles.recordValue}>
                                  {activityDataText}
                                </span>
                              </div>
                              <div className={styles.recordRow}>
                                <span className={styles.recordLabel}>
                                  {I18N.enterpriseCarbonAccount2.attachment}
                                </span>
                                <span className={styles.recordValue}>
                                  {attachmentDisplay.length > 0 ? (
                                    <span className={styles.attachmentList}>
                                      {attachmentDisplay.map(att =>
                                        att.url ? (
                                          <a
                                            key={att.name}
                                            href={att.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className={styles.attachmentTag}
                                          >
                                            {att.name}
                                          </a>
                                        ) : (
                                          <span
                                            key={att.name}
                                            className={styles.attachmentTag}
                                          >
                                            {att.name}
                                          </span>
                                        ),
                                      )}
                                    </span>
                                  ) : (
                                    '--'
                                  )}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </Spin>
    </CustomDrawer>
  );
};

export default AuditRecordDrawer;
