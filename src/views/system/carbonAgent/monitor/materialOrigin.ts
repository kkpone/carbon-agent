import type {
  AgentComposerAttachment,
  AgentMonitorMaterialOrigin,
} from '../service';

/** 来源跟随附件，删除附件后不残留；一次提交不能混入不同卡片/会话的材料。 */
export const resolveMonitorMaterialOrigin = (
  attachments: AgentComposerAttachment[],
  sessionId?: string,
): AgentMonitorMaterialOrigin | undefined =>
  resolveAttachmentOrigins(
    attachments.filter(item => item.status === 'done' && item.fileId),
    sessionId,
  );

/** 通用追加入口沿用本轮唯一来源；上传中/失败附件也保留来源，避免时序改变目标。 */
export const resolveAddedMaterialOrigin = (
  attachments: AgentComposerAttachment[],
  sessionId?: string,
  explicitOrigin?: AgentMonitorMaterialOrigin,
): AgentMonitorMaterialOrigin | undefined => {
  if (explicitOrigin) return explicitOrigin;
  const origin = resolveAttachmentOrigins(attachments, sessionId);
  return origin?.entry === 'composer' ? undefined : origin;
};

const resolveAttachmentOrigins = (
  attachments: AgentComposerAttachment[],
  sessionId?: string,
): AgentMonitorMaterialOrigin | undefined => {
  if (!attachments.length) return undefined;
  const origins = attachments.map(item => {
    const origin = item.materialOrigin || { entry: 'composer' as const };
    if (
      origin.entry !== 'composer' &&
      (!origin.cardId ||
        !origin.originMessageId ||
        !sessionId ||
        item.materialOriginSessionId !== sessionId)
    ) {
      throw new Error('INVALID_MATERIAL_ORIGIN');
    }
    if (
      origin.entry === 'operation_material_advice_card' &&
      (!origin.taskId || origin.planId || origin.intakeId)
    ) {
      throw new Error('INVALID_MATERIAL_ORIGIN');
    }
    return origin;
  });
  const key = (origin: AgentMonitorMaterialOrigin) =>
    JSON.stringify([
      origin.entry,
      origin.cardId,
      origin.originMessageId,
      origin.planId,
      origin.intakeId,
      origin.operationId,
      origin.taskId,
    ]);
  if (origins.some(origin => key(origin) !== key(origins[0]))) {
    throw new Error('CONFLICTING_MATERIAL_ORIGINS');
  }
  return origins[0];
};
