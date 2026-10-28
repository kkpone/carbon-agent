import { useId } from 'react';

import { parseMonitorJson } from '../monitor/json';
import {
  monitorCardCopy,
  splitMonitorMaterial,
} from '../monitor/materialAdvice';
import styles from '../monitor/monitor.module.less';
import type {
  AgentMessageCard,
  AgentMonitorMaterialOrigin,
  AgentToolCall,
} from '../service';

const type = 'cbam_operation_material_advice';
type Advice = Record<string, unknown> & {
  cardType: typeof type;
  cardId: string;
  taskId: string;
  operationId?: string;
  title: string;
  summary: string;
  groups: {
    moduleCode: string;
    itemCode?: string;
    category?: string;
    categoryAdvice?: string;
    title: string;
    advice: string;
  }[];
};

export function operationAdvice(value: unknown, depth = 0): Advice | undefined {
  if (!value || depth > 10) return undefined;
  if (typeof value === 'string') {
    try {
      return operationAdvice(parseMonitorJson(value), depth + 1);
    } catch {
      return undefined;
    }
  }
  if (Array.isArray(value))
    return value.map(v => operationAdvice(v, depth + 1)).find(Boolean);
  if (typeof value !== 'object') return undefined;
  const node = value as Record<string, unknown>;
  if (node.success === false || node.isError === true) return undefined;
  if (
    node.cardType === type &&
    typeof node.cardId === 'string' &&
    typeof node.taskId === 'string' &&
    typeof node.title === 'string' &&
    typeof node.summary === 'string' &&
    Array.isArray(node.groups) &&
    node.groups.every(
      (g: unknown) =>
        g &&
        typeof g === 'object' &&
        typeof (g as Record<string, unknown>).title === 'string' &&
        typeof (g as Record<string, unknown>).advice === 'string',
    ) &&
    (node.operationId === undefined || typeof node.operationId === 'string')
  )
    return node as Advice;
  return [
    'data',
    'result',
    'output',
    'payload',
    'safePayload',
    'content',
    'text',
    'card',
    'host_operations',
  ]
    .map(k => operationAdvice(node[k], depth + 1))
    .find(Boolean);
}

export function operationAdviceCards(
  cards: AgentMessageCard[],
  tools: AgentToolCall[],
) {
  const ids = new Set(
    cards.map(c => operationAdvice(c.card)?.cardId).filter(Boolean),
  );
  const extra: AgentMessageCard[] = [];
  tools.forEach(tool => {
    if (
      !/^(SUCCESS|SUCCEEDED|COMPLETED)$/i.test(tool.status || '') ||
      !/(cbam_operation_material_advice|prepareCbamOperationTask)$/.test(
        tool.toolName || '',
      )
    )
      return;
    const card = operationAdvice(tool.payload);
    if (!card || ids.has(card.cardId)) return;
    ids.add(card.cardId);
    extra.push({
      card,
      cardType: type,
      messageId: tool.messageId || '',
      orderNo: tool.orderNo ?? tool.sequenceNo ?? 0,
      streamOrderNo: tool.streamOrderNo,
    });
  });
  return [...cards, ...extra];
}

export function OperationAdviceCard({
  advice,
  messageId,
  disabled,
  onFilesSelect,
}: {
  advice: Advice;
  messageId?: string;
  disabled: boolean;
  onFilesSelect?: (files: File[], origin?: AgentMonitorMaterialOrigin) => void;
}) {
  const id = useId();
  const uploadId = useId();
  const copy = monitorCardCopy(
    typeof advice.lang === 'string' ? advice.lang : undefined,
  );
  const uploadDisabled = disabled || !messageId || !onFilesSelect;
  const groups: {
    title?: string;
    description?: string;
    rows: Advice['groups'];
  }[] = [];
  advice.groups.forEach(row => {
    const title = typeof row.category === 'string' ? row.category : undefined;
    let group = groups.find(item => item.title === title);
    if (!group) {
      group = { title, description: row.categoryAdvice, rows: [] };
      groups.push(group);
    }
    group.rows.push(row);
  });
  return (
    <section className={styles.card} aria-labelledby={id}>
      <div className={styles.heading}>
        <strong id={id}>{advice.title}</strong>
      </div>
      {advice.summary.split(/\n\s*\n/).map(paragraph => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {groups.map((group, index) => (
        <section
          className={styles.adviceGroup}
          key={group.title || 'materials'}
        >
          {group.title && (
            <h4>
              {index + 1}. {group.title}
            </h4>
          )}
          {group.description && <p>{group.description}</p>}
          <ul className={styles.materialList}>
            {group.rows.map((row, rowIndex) => {
              const content = splitMonitorMaterial(row.advice);
              return (
                <li key={row.itemCode || `${row.moduleCode}-${rowIndex}`}>
                  <strong className={styles.materialTitle}>{row.title}</strong>
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
        </section>
      ))}
      <div className={styles.callout}>
        <h4>{copy.agentUploadTitle}</h4>
        <label
          htmlFor={uploadId}
          className={styles.upload}
          aria-disabled={uploadDisabled}
        >
          <span>+ {copy.agentUpload}</span>
          <input
            id={uploadId}
            type='file'
            multiple
            aria-label={copy.agentUpload}
            disabled={uploadDisabled}
            onChange={event => {
              const input = event.target;
              const files = Array.from(input.files || []);
              input.value = '';
              if (!files.length || uploadDisabled || !messageId) return;
              onFilesSelect?.(files, {
                entry: 'operation_material_advice_card',
                cardId: advice.cardId,
                originMessageId: messageId,
                taskId: advice.taskId,
                operationId: advice.operationId,
              });
            }}
          />
        </label>
      </div>
    </section>
  );
}
