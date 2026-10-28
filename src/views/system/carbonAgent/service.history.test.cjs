const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

// Exercise the real history API adapter and card extraction without browser/network dependencies.
let responseData;
let requestError;
let requestPaths = [];
const cache = new Map();
function loadSource(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const loaded = new Module(filename, module);
  cache.set(filename, loaded);
  const nativeRequire = Module.createRequire(filename);
  loaded.require = name => {
    if (name === '@api/request') {
      return { request: async options => {
        requestPaths.push(options.url);
        if (requestError) throw requestError;
        return { data: { data: responseData } };
      } };
    }
    if (name === '@src/utils/cookie') return { getToken: () => '' };
    if (name === './acquisition') return { getAgentBrowserId: () => 'browser' };
    if (name === '@fortaine/fetch-event-source') {
      return { EventStreamContentType: 'text/event-stream' };
    }
    if (name === '@src/lang/I18N') {
      return {
        __esModule: true,
        default: {
          carbonAgent: new Proxy(
            {},
            {
              get: (_, key) => String(key),
            },
          ),
        },
      };
    }
    if (name === '@src/lang/createI18nLabelMap') {
      return loadSource(
        path.resolve(__dirname, '../../../lang/createI18nLabelMap.ts'),
      );
    }
    if (name.startsWith('.')) {
      const target = path.resolve(path.dirname(filename), `${name}.ts`);
      if (fs.existsSync(target)) return loadSource(target);
    }
    return nativeRequire(name);
  };
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  loaded._compile(compiled.outputText, filename);
  return loaded.exports;
}

const { fetchAgentSessionHistory, resumeAgentChatMessage } = loadSource(
  path.join(__dirname, 'service.ts'),
);
const { monitorCards, monitorCardSnapshot } = loadSource(
  path.join(__dirname, 'monitor/results.ts'),
);
const { operationReportCards, OPERATION_DOWNLOAD_PATH } = loadSource(
  path.join(__dirname, 'operation/reportDownload.ts'),
);
const turn = (messageId, role, createTime) => ({
  messageId,
  role,
  createTime,
  content: 'message',
  payload: { cards: [] },
});
const event = (messageId, toolName, cardId, sequenceNo) => ({
  messageId,
  toolName,
  eventId: `event-${sequenceNo}`,
  eventType: 'tool_call_success',
  status: 'SUCCESS',
  sequenceNo,
  visible: 1,
  createTime: `2026-09-18 13:0${sequenceNo}:00`,
  safePayloadJson: JSON.stringify({
    safePayload: {
      success: true,
      toolCallId: `call-${sequenceNo}`,
      cardId,
      display: { cardId, cardType: 'cbam_monitor_material_advice' },
      cardResolved: true,
      resolvedCard: {
        cardId,
        cardType: 'cbam_monitor_material_advice',
        groups: [],
      },
    },
  }),
});
const fixture = () => ({
  session: {
    sessionId: 'session',
    sessionTitle: 'Monitoring',
    status: 'EXECUTING',
  },
  turns: [
    turn('first', 'user', '2026-09-18 13:00:00'),
    turn('first', 'assistant', '2026-09-18 13:01:00'),
    turn('second', 'user', '2026-09-18 13:02:00'),
  ],
  events: [
    event('first', 'agent_cbam_monitor_material_advice', 'advice', 1),
    event('second', 'agent_cbam_monitor_material_advice', 'current', 3),
  ],
});

test('refresh during upload preserves earlier advice and does not attach active tools to the previous answer', async () => {
  responseData = fixture();
  const history = await fetchAgentSessionHistory('session');
  const answer = history.messages.find(m => m.role === 'assistant');
  const cards = monitorCards(answer.cards, answer.toolCalls);
  assert.deepEqual(
    cards.map(c => c.card.cardId),
    ['advice'],
  );
  assert.equal(monitorCardSnapshot(cards[0].card).cardId, 'advice');
  assert.ok(answer.toolCalls.every(t => t.messageId === 'first'));
  assert.equal(history.latestMessageId, 'second');
  assert.equal(history.messages.filter(m => m.role === 'assistant').length, 1);
});

test('a partially persisted active answer is left to replay while earlier results remain', async () => {
  responseData = fixture();
  responseData.turns.push(turn('second', 'assistant', '2026-09-18 13:03:00'));
  const history = await fetchAgentSessionHistory('session');
  assert.ok(
    !history.messages.some(m => m.role === 'assistant' && m.id === 'second'),
  );
  const first = history.messages.find(
    m => m.role === 'assistant' && m.id === 'first',
  );
  assert.equal(monitorCards(first.cards, first.toolCalls).length, 1);
});

test('events without a matching historical answer cannot fall back to the previous turn', async () => {
  responseData = fixture();
  responseData.turns.splice(
    2,
    0,
    turn('user-only', 'user', '2026-09-18 13:01:30'),
  );
  responseData.events.push(
    event(
      'not-yet-in-turns',
      'agent_cbam_monitor_material_advice',
      'unknown',
      4,
    ),
    event('user-only', 'agent_cbam_monitor_material_advice', 'no-answer', 5),
    event(undefined, 'agent_cbam_monitor_material_advice', 'no-message-id', 6),
  );
  const history = await fetchAgentSessionHistory('session');
  const answers = history.messages.filter(m => m.role === 'assistant');
  assert.equal(answers.length, 1);
  assert.deepEqual(
    monitorCards(answers[0].cards, answers[0].toolCalls).map(
      c => c.card.cardId,
    ),
    ['advice'],
  );
  assert.ok(answers[0].toolCalls.every(t => t.messageId === 'first'));
});

test('completed sessions retain trace results from both turns', async () => {
  responseData = fixture();
  responseData.session.status = 'COMPLETED';
  responseData.turns.push(turn('second', 'assistant', '2026-09-18 13:03:00'));
  const history = await fetchAgentSessionHistory('session');
  const answers = history.messages.filter(m => m.role === 'assistant');
  assert.deepEqual(
    answers.flatMap(m =>
      monitorCards(m.cards, m.toolCalls).map(c => c.card.cardId),
    ),
    ['advice', 'current'],
  );
});

test('other business and error cards stay on the historical turn; active, unknown and hidden events are excluded', async () => {
  responseData = fixture();
  responseData.events = [
    'first',
    'second',
    'not-yet-in-turns',
    undefined,
  ].flatMap((messageId, index) =>
    ['business_card', 'error'].map((eventType, offset) => ({
      messageId,
      eventId: `${messageId}-${eventType}`,
      eventType,
      visible: 1,
      sequenceNo: index * 2 + offset + 1,
      message: eventType,
      safePayloadJson: JSON.stringify({ safePayload: { title: messageId } }),
    })),
  );
  responseData.events.push({
    ...responseData.events[0],
    eventId: 'hidden',
    visible: 0,
    sequenceNo: 9,
  });
  const history = await fetchAgentSessionHistory('session');
  const answer = history.messages.find(m => m.role === 'assistant');
  assert.deepEqual(answer.cards.map(c => c.cardType).sort(), [
    'business_card',
    'error',
  ]);
  assert.ok(answer.cards.every(c => c.messageId === 'first'));
  assert.ok(answer.cards.every(c => c.card.eventId !== 'hidden'));
});

test('published operation report cards and download access survive another turn running', async () => {
  responseData = fixture();
  const fileId = '9007199254740993';
  responseData.events[0] = {
    ...responseData.events[0],
    toolName: 'agent_cbam_operation_report_generate',
    safePayloadJson: JSON.stringify({
      safePayload: {
        success: true,
        toolCallId: 'published-report',
        fileId,
        fileName: 'operation.docx',
        sourceDataVersion: 16,
        fileStatus: 'READY',
        downloadRegistered: true,
        access: {
          method: 'POST',
          path: OPERATION_DOWNLOAD_PATH,
          body: { sessionId: 'session', resourceId: fileId },
        },
      },
    }),
  };
  const history = await fetchAgentSessionHistory('session');
  const answer = history.messages.find(m => m.role === 'assistant');
  const cards = operationReportCards(answer.cards, answer.toolCalls, 'session');
  assert.equal(cards.length, 1);
  assert.equal(cards[0].card.fileId, fileId);
  assert.equal(cards[0].card.access.body.resourceId, fileId);
});

test(
  'active-turn replay and cursor resume use the same message and deduplicate stream events',
  { timeout: 5000 },
  async t => {
    responseData = fixture();
    const history = await fetchAgentSessionHistory('session');
    const frame = (id, type, fields) =>
      `id: ${id}\nevent: ${type}\ndata: ${JSON.stringify({
        sessionId: 'session',
        messageId: history.latestMessageId,
        ...fields,
      })}\n\n`;
    const stream =
      frame(10, 'message_delta', { delta: 'earlier' }) +
      frame(11, 'message_delta', { delta: 'new' }) +
      frame(11, 'message_delta', { delta: 'duplicate' }) +
      frame(12, 'final_response', { reply: 'done', status: 'COMPLETED' }) +
      frame(13, 'completed', {});
    const requests = [];
    t.mock.method(globalThis, 'fetch', async url => {
      requests.push(String(url));
      return new Response(stream, {
        headers: { 'content-type': 'text/event-stream' },
      });
    });
    for (const cursor of [0, 10]) {
      const deltas = [];
      const result = await resumeAgentChatMessage({
        state: {
          sessionId: 'session',
          messageId: history.latestMessageId,
          lastEventId: cursor,
        },
        onDelta: delta => deltas.push(delta.delta),
      });
      assert.equal(result.reply, 'done');
      assert.deepEqual(deltas, cursor === 0 ? ['earlier', 'new'] : ['new']);
    }
    assert.equal(requests.length, 2);
    assert.ok(
      requests[0].endsWith(
        '/sessions/session/messages/second/stream?afterStreamEventId=0',
      ),
    );
    assert.ok(
      requests[1].endsWith(
        '/sessions/session/messages/second/stream?afterStreamEventId=10',
      ),
    );
  },
);

if (process.env.CBAM_HISTORY_TRACE_FIXTURE) {
  test('supplied incident trace restores the original resolved material card', async () => {
    responseData = JSON.parse(
      fs.readFileSync(process.env.CBAM_HISTORY_TRACE_FIXTURE, 'utf8'),
    ).data;
    const original = responseData.events.find(
      e =>
        e.toolName === 'agent_cbam_monitor_material_advice' &&
        e.status === 'SUCCESS',
    );
    const expected = JSON.parse(original.safePayloadJson).safePayload.cardId;
    const history = await fetchAgentSessionHistory(
      responseData.session.sessionId,
    );
    const answer = history.messages.find(
      m => m.role === 'assistant' && m.id === original.messageId,
    );
    const cards = monitorCards(answer.cards, answer.toolCalls);
    assert.ok(
      cards.some(
        c => c.card.cardId === expected && monitorCardSnapshot(c.card),
      ),
    );
    assert.ok(answer.toolCalls.every(t => t.messageId === answer.id));
  });
}


test('trace failure remains recoverable without basic-history fallback', async () => {
  requestError = new Error('trace temporarily unavailable');
  requestPaths = [];
  try {
    await assert.rejects(fetchAgentSessionHistory('original-session'), /temporarily unavailable/);
    assert.equal(requestPaths.length, 1);
    assert.ok(requestPaths[0].includes('original-session'));
    assert.ok(requestPaths[0].endsWith('/trace'));
  } finally { requestError = undefined; }
});

test('a hidden trace event cannot be made visible by its payload', async () => {
  responseData = fixture();
  responseData.session.status = 'COMPLETED';
  responseData.events[0].visible = false;
  responseData.events[0].payloadJson = JSON.stringify({ visible: true });
  const history = await fetchAgentSessionHistory('session');
  const answer = history.messages.find(m => m.role === 'assistant');
  assert.equal(answer.toolCalls.length, 0);
});


test('hidden live tools and business cards advance the cursor without rendering', async t => {
  const frames = [
    { id: 1, type: 'tool_call_start', payload: { toolCallId: 'hidden-call', visible: false } },
    { id: 2, type: 'business_card', payload: { safePayload: { display: { visible: false } } } },
    { id: 3, type: 'completed', payload: {} },
  ].map(({ id, type, payload }) => `id: ${id}\nevent: ${type}\ndata: ${JSON.stringify({ ...payload, messageId: 'm', sessionId: 's' })}\n\n`).join('');
  responseData = { status: 'COMPLETED', terminal: true, lastStreamEventId: 3 };
  const urls = [];
  const parts = frames.split('id: 3');
  t.mock.method(globalThis, 'fetch', async url => {
    urls.push(String(url));
    return new Response(urls.length === 1 ? parts[0] : 'id: 3' + parts[1], { headers: { 'content-type': 'text/event-stream' } });
  });
  const rendered = [];
  await resumeAgentChatMessage({
    state: { sessionId: 's', messageId: 'm', lastEventId: 0 },
    onToolCall: item => { rendered.push(item); },
    onCard: item => { rendered.push(item); },
  });
  assert.deepEqual(rendered, []);
  assert.equal(urls.length, 2);
  assert.ok(urls[1].endsWith('afterStreamEventId=2'));
});
