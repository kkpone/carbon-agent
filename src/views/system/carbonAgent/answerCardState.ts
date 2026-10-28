import type { AgentMessageCard } from './service';
import {
  getEnterpriseCard,
  normalizeEnterpriseCardPayload,
} from './enterpriseData/data';

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const getScalarValue = (value: unknown) => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return '';
};

const NESTED_CARD_RECORD_KEYS = [
  'bizRef',
  'cancel',
  'card',
  'data',
  'extra',
  'rawInterrupt',
  'resumeRequest',
  'safePayload',
  'snapshot',
  'submit',
  'summary',
  'value',
];

const getCardRecords = (card: AgentMessageCard) => {
  const root = asRecord(card.card);
  const records: Record<string, unknown>[] = [];
  const pendingRecords = [root];
  const visitedRecords = new Set<Record<string, unknown>>();

  while (pendingRecords.length) {
    const record = pendingRecords.shift();

    if (record && Object.keys(record).length && !visitedRecords.has(record)) {
      visitedRecords.add(record);
      records.push(record);

      NESTED_CARD_RECORD_KEYS.forEach(key => {
        const nestedRecord = asRecord(record[key]);

        if (Object.keys(nestedRecord).length) {
          pendingRecords.push(nestedRecord);
        }
      });

      if (Array.isArray(record.interrupts)) {
        record.interrupts.forEach(interrupt => {
          const interruptRecord = asRecord(interrupt);

          if (Object.keys(interruptRecord).length) {
            pendingRecords.push(interruptRecord);
          }
        });
      }
    }
  }

  return records;
};

const getFirstCardValue = (
  records: Record<string, unknown>[],
  keys: string[],
) =>
  records
    .flatMap(record => keys.map(key => getScalarValue(record[key])))
    .find(Boolean);

const getAnswerCardMergeKeys = (card: AgentMessageCard) => {
  const enterprise = getEnterpriseCard(card.card);
  if (enterprise?.blockId) {
    return [`enterprise:${card.messageId}:${enterprise.blockId}`];
  }
  const records = getCardRecords(card);
  const reportId = getFirstCardValue(records, [
    'reportId',
    'report_id',
    'reportFileRecordId',
    'report_file_record_id',
  ]);
  const businessId = getFirstCardValue(records, [
    'bizId',
    'biz_id',
    'accountId',
    'account_id',
    'productId',
    'product_id',
  ]);
  const reportUrl = getFirstCardValue(records, [
    'reportUrl',
    'report_url',
    'fileUrl',
    'file_url',
    'downloadUrl',
    'download_url',
    'url',
  ]);
  const businessKeys = [reportId, businessId, reportUrl]
    .filter(Boolean)
    .map(value => `business:${value}`);

  if (businessKeys.length) {
    return businessKeys;
  }

  const identity = getFirstCardValue(records, [
    'resumeEventId',
    'resume_event_id',
    'interruptId',
    'interrupt_id',
    'eventId',
    'event_id',
    'toolCallId',
    'tool_call_id',
    'blockId',
    'block_id',
    'cardId',
    'card_id',
    'id',
  ]);
  const cardType =
    getScalarValue(card.cardType) ||
    getFirstCardValue(records, [
      'cardType',
      'card_type',
      'eventType',
      'event_type',
      'type',
    ]) ||
    'card';
  const normalizedCardType = cardType.toLowerCase();
  const blockType = getFirstCardValue(records, [
    'blockType',
    'block_type',
  ])?.toLowerCase();
  const isFormRequest =
    normalizedCardType === 'form_request' || blockType === 'form';
  const messageId = getScalarValue(card.messageId);
  const mergeKeys = identity ? [`${cardType}:${identity}`] : [];

  // A form request interrupts the current message, so there can only be one
  // active form per message. Keep this fallback even when one event has an
  // interrupt ID because final_response may omit that ID.
  if (isFormRequest && messageId) {
    mergeKeys.push(`form_request:${messageId}`);
  }

  return mergeKeys.length
    ? mergeKeys
    : [[card.messageId, cardType, card.orderNo].join(':')];
};

export const mergeAgentAnswerCards = (
  currentCards: AgentMessageCard[],
  incomingCards: AgentMessageCard[],
) => {
  if (!incomingCards.length) {
    return currentCards;
  }

  const mergedCards = [...currentCards];
  const cardIndexByKey = new Map<string, number>();

  mergedCards.forEach((card, index) => {
    getAnswerCardMergeKeys(card).forEach(key => cardIndexByKey.set(key, index));
  });

  incomingCards.forEach(card => {
    const cardKeys = getAnswerCardMergeKeys(card);
    const currentIndex = cardKeys
      .map(key => cardIndexByKey.get(key))
      .find(index => index !== undefined);

    if (currentIndex === undefined) {
      cardKeys.forEach(key => cardIndexByKey.set(key, mergedCards.length));
      mergedCards.push(card);
      return;
    }

    const currentCard = mergedCards[currentIndex];
    const enterprisePayload = normalizeEnterpriseCardPayload(card.card);

    mergedCards[currentIndex] = {
      ...currentCard,
      ...card,
      card: enterprisePayload
        ? {
            ...(normalizeEnterpriseCardPayload(currentCard.card) ||
              currentCard.card),
            ...enterprisePayload,
          }
        : {
            ...currentCard.card,
            ...card.card,
          },
      streamOrderNo: currentCard.streamOrderNo ?? card.streamOrderNo,
    };
    cardKeys.forEach(key => cardIndexByKey.set(key, currentIndex));
  });

  return mergedCards;
};
