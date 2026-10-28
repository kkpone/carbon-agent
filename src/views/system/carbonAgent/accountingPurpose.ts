import type { AgentMessageCard } from './service';

export const ACCOUNTING_PURPOSE_FORM = 'enterprise_accounting_purpose';

export const purposeRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export const isAccountingPurposeCard = (card: AgentMessageCard) => {
  const payload = { ...purposeRecord(card.card.safePayload), ...card.card };
  return payload.formName === ACCOUNTING_PURPOSE_FORM;
};

/** 只使用服务端回执更新对应表单，不能根据后续聊天或客户端点击推断已确认。 */
export const applyAccountingPurposeReceipt = (
  cards: AgentMessageCard[],
  receipt: Record<string, unknown>,
) =>
  cards.map(card => {
    const payload = { ...purposeRecord(card.card.safePayload), ...card.card };
    if (
      !isAccountingPurposeCard(card) ||
      !receipt.resumeEventId ||
      receipt.resumeEventId !== payload.resumeEventId ||
      !['CONFIRMED', 'CANCELLED'].includes(String(receipt.status))
    ) {
      return card;
    }
    return {
      ...card,
      card: { ...payload, accountingPurposeConfirmation: receipt },
    };
  });

/** 提交期间卡片会移入历史列表，携带草稿以便失败后继续编辑。 */
export const applyAccountingPurposeDraft = (
  cards: AgentMessageCard[],
  request?: Record<string, unknown>,
) => {
  if (request?.action !== 'form_submit') return cards;
  const eventId = String(request.resumeEventId || '');
  if (!eventId) return cards;
  const eventData = purposeRecord(purposeRecord(request.resumeData)[eventId]);
  const value = purposeRecord(eventData.form_submission);
  return cards.map(card => {
    const payload = { ...purposeRecord(card.card.safePayload), ...card.card };
    return isAccountingPurposeCard(card) && payload.resumeEventId === eventId
      ? { ...card, card: { ...card.card, accountingPurposeDraft: value } }
      : card;
  });
};
