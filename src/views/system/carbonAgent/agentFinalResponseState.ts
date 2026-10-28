import type {
  AgentFinalResponse,
  AgentMessageBlock,
  AgentMessageCard,
} from './service';

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getOptionalString = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const getOrderNo = (value: unknown, fallback: number) => {
  const orderNo = Number(value);

  return Number.isFinite(orderNo) && orderNo > 0 ? orderNo : fallback;
};

const getResponseBlocks = (response: AgentFinalResponse) =>
  Array.isArray(response.blocks) ? response.blocks : [];

const getResponseCards = (response: AgentFinalResponse) =>
  Array.isArray(response.cards) ? response.cards : [];

const getBlockType = (block: Record<string, unknown>) =>
  getOptionalString(block.blockType) ||
  getOptionalString(asRecord(block.extra).blockType) ||
  'markdown';

const getResponseItemMessageId = (
  item: Record<string, unknown>,
  response: AgentFinalResponse,
  fallback: string,
) =>
  getOptionalString(item.messageId) ||
  getOptionalString(asRecord(item.extra).messageId) ||
  getOptionalString(response.messageId) ||
  fallback;

export const normalizeFinalBlocks = (
  response: AgentFinalResponse,
): AgentMessageBlock[] =>
  getResponseBlocks(response)
    .filter(block => getBlockType(block) !== 'form')
    .map((block, index) => ({
      blockId: String(block.blockId || block.id || `final_block_${index}`),
      blockType: getBlockType(block),
      content: String(block.content || block.markdown || block.text || ''),
      messageId: getResponseItemMessageId(block, response, 'final_response'),
      orderNo: getOrderNo(block.orderNo, index * 10 + 10),
    }))
    .filter(block => block.content);

export const normalizeFinalCards = (
  response: AgentFinalResponse,
): AgentMessageCard[] => {
  const cards = getResponseCards(response).map((card, index) => {
    const cardRecord = asRecord(card);
    const nestedCard = asRecord(cardRecord.card);

    return {
      card: Object.keys(nestedCard).length ? nestedCard : cardRecord,
      cardType: getOptionalString(cardRecord.cardType),
      messageId: getResponseItemMessageId(cardRecord, response, ''),
      orderNo: getOrderNo(cardRecord.orderNo, index * 10 + 20),
    };
  });
  const formCards = getResponseBlocks(response)
    .filter(block => getBlockType(block) === 'form')
    .map((block, index) => {
      const extra = asRecord(block.extra);

      return {
        // Session snapshots keep the complete form_request event in `extra`.
        // It must override nullable block fields such as messageId.
        card: {
          ...block,
          ...extra,
          extra,
          formTitle: extra.formTitle || response.formTitle,
        },
        cardType: 'form_request',
        messageId: getResponseItemMessageId(block, response, 'final_response'),
        orderNo: getOrderNo(block.orderNo, index * 10 + 20),
      };
    });

  return [...cards, ...formCards];
};
