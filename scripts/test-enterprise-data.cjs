// node --test scripts/test-enterprise-data.cjs
// 使用真实转换、接口适配和卡片归并函数；网络与登录态在测试边界隔离。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

const root = path.resolve(__dirname, '../src/views/system/carbonAgent');
const locale = loadLocale();
function loadLocale() {
  const source = fs.readFileSync(
    path.resolve(root, '../../../lang/zh-CN/enterpriseData.ts'),
    'utf8',
  );
  const module = { exports: {} };
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  new Function('exports', js)(module.exports);
  return module.exports.default;
}
function createLoader(request = async () => undefined, overrides = {}) {
  const cache = new Map();
  function load(filename) {
    filename = path.resolve(root, filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = new Module(filename);
    cache.set(filename, module);
    const native = Module.createRequire(filename);
    module.require = name => {
      if (name in overrides) return overrides[name];
      if (name === '@/hooks/use-mobile')
        return load('../../../hooks/use-mobile.ts');
      if (/\.(svg|png|jpg)$/.test(name))
        return { __esModule: true, default: name };
      if (name.endsWith('.less'))
        return {
          __esModule: true,
          default: new Proxy({}, { get: (_, key) => key }),
        };
      if (name === '@src/api/request' || name === '@api/request')
        return { request };
      if (name === '@src/lang/I18N')
        return {
          __esModule: true,
          default: {
            enterpriseData: locale,
            carbonAgent: new Proxy({}, { get: (_, key) => String(key) }),
            template: (text, params) =>
              String(text).replace(/\{(\w+)\}/g, (_, key) => params[key] ?? ''),
          },
        };
      if (name === '@src/utils/cookie') return { getToken: () => '' };
      if (name === '@src/lang/createI18nLabelMap')
        return load('../../../lang/createI18nLabelMap.ts');
      if (name === './acquisition')
        return { getAgentBrowserId: () => 'browser' };
      if (name === '@fortaine/fetch-event-source')
        return { EventStreamContentType: 'text/event-stream' };
      if (name.startsWith('.')) {
        for (const ext of ['.ts', '.tsx']) {
          const target = path.resolve(path.dirname(filename), `${name}${ext}`);
          if (fs.existsSync(target)) return load(target);
        }
      }
      return native(name);
    };
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
      },
    });
    module._compile(compiled.outputText, filename);
    return module.exports;
  }
  return load;
}
const load = createLoader();
const data = load('enterpriseData/data.ts');
const { mergeAgentAnswerCards } = load('answerCardState.ts');
const company = (id = '+/公司==') => ({
  companyId: id,
  name: '示例企业',
  securities: [{ code: '00375', marketCode: 'HK' }],
});
const metric = (overrides = {}) => ({
  indicatorCode: 'scope2',
  name: '范围二',
  statisticalPeriod: '2025',
  marketCode: 'location',
  unit: '吨CO2e',
  currency: null,
  valueNumeric: '0.000000',
  ...overrides,
});
const carbon = (id, years) => ({
  company: company(id),
  availableYears: years,
  years,
  metrics: [metric()],
  sources: [],
});
const card = (resultId, type = 'enterprise_carbon_data', messageId = 'm1') => ({
  messageId,
  cardType: 'business_card',
  orderNo: 20,
  card: {
    eventType: 'business_card',
    blockId: `enterprise_data_${resultId}`,
    sessionId: 'session-original',
    card: {
      cardType: type,
      module: 'enterprise_data',
      bizRef: { resultId },
      data: { ...carbon('a', ['2025']), resultId },
    },
  },
});

test('曾用名兼容普通名称、对象、数组及单引号序列化数据', () => {
  const name = '宁德时代新能源科技有限公司';
  assert.equal(data.formatFormerNames(name), name);
  assert.equal(data.formatFormerNames({ formerName: name }), name);
  assert.equal(data.formatFormerNames(JSON.stringify({ formerName: name })), name);
  assert.equal(data.formatFormerNames("{'formerName': '宁德时代新能源科技有限公司'}"), name);
  assert.equal(
    data.formatFormerNames("[{'formerName': '旧名称一'}, {'formerName': '旧名称二'}]"),
    '旧名称一 / 旧名称二',
  );
  assert.equal(data.formatFormerNames([name, { formerName: name }, '  旧名称二  ']), `${name} / 旧名称二`);
  assert.equal(data.formatFormerNames("O'Reilly Limited"), "O'Reilly Limited");
  assert.equal(data.formatFormerNames('{"formerName":"旧名\\n企业"}'), '旧名\n企业');
  for (const value of [null, undefined, '', '  ', [], {}, 123, '{broken', '{"other":"内部字段"}']) {
    assert.equal(data.formatFormerNames(value), '—');
  }
});

test('曾用名兼容真实接口用中文顿号拼接的多个对象，保留名称内部标点', () => {
  const actual = "{'formerName': '神华国能集团有限公司'}、{'formerName': '国家能源集团国源电力有限公司'}";
  assert.equal(data.formatFormerNames(actual), '神华国能集团有限公司 / 国家能源集团国源电力有限公司');
  for (const separator of ['、', '，', '；']) {
    assert.equal(
      data.formatFormerNames(`{'formerName': '甲、乙，丙；有限公司'}${separator}{'formerName': '另一家公司'}`),
      '甲、乙，丙；有限公司 / 另一家公司',
    );
  }
  assert.equal(data.formatFormerNames('甲、乙有限公司'), '甲、乙有限公司');
  assert.equal(
    data.formatFormerNames(`{"formerName":"名称}、{仍在名称中"}、{"formerName":"另一家公司"}`),
    '名称}、{仍在名称中 / 另一家公司',
  );
});

test('十进制格式化不经过浮点转换，真实零与未披露不同', () => {
  assert.equal(
    data.formatDecimal('900719925474099312345.670000'),
    '900,719,925,474,099,312,345.67',
  );
  assert.equal(
    data.formatDecimal('0.000000000000000001'),
    '0.000000000000000001',
  );
  assert.equal(data.metricValue(metric()), '0');
  assert.equal(data.metricValue({ valueNumeric: '', valueText: '查看' }), '—');
  assert.equal(
    data.metricValue({ valueNumeric: null, valueText: '未开展' }),
    '未开展',
  );
  assert.equal(data.metricValue(undefined), '—');
  assert.equal(data.displayUnit('吨CO2e/百万元'), 'tCO₂e/百万元');
});

test('指标口径、原始单位、币种分别参与行键；同指标年度合并', () => {
  const rows = data.metricRows([
    [
      metric(),
      metric({ statisticalPeriod: '2024' }),
      metric({ marketCode: 'market' }),
      metric({ marketCode: null }),
      metric({ unit: 'tCO2e' }),
      metric({ currency: 'CNY' }),
    ],
  ]);
  assert.equal(rows.length, 5);
  assert.notEqual(
    data.metricKey(metric({ marketCode: 'a|b', unit: 'c' })),
    data.metricKey(metric({ marketCode: 'a', unit: 'b|c' })),
  );
});

test('默认年度选共同最新年度，无交集选并集最新，无数据不虚构年份', () => {
  assert.deepEqual(
    data.comparisonYears([
      carbon('a', ['2025', '2024']),
      carbon('b', ['2024', '2023']),
    ]),
    {
      years: ['2025', '2024', '2023'],
      defaultYear: '2024',
    },
  );
  assert.equal(
    data.comparisonYears([carbon('a', ['2025']), carbon('b', ['2023'])])
      .defaultYear,
    '2025',
  );
  assert.deepEqual(data.comparisonYears([carbon('a', []), carbon('b', [])]), {
    years: [],
    defaultYear: '',
  });
});

test('特殊字符企业 ID 在导航中无损，切换页面清除原会话与结果', () => {
  const query = data.enterpriseSearch(
    '?sessionId=old&resultId=old-result&agentChannel=web',
    'enterpriseDetail',
    { companyId: '+/公司==' },
  );
  const params = new URLSearchParams(query);
  assert.equal(params.get('companyId'), '+/公司==');
  assert.equal(params.get('sessionId'), null);
  assert.equal(params.get('resultId'), null);
  assert.equal(params.get('agentChannel'), 'web');
  assert.match(query, /%2B%2F/);
  // 离开独立详情/对比页时不把公开企业 ID 留在 Agent 会话 URL。
  data.clearEnterpriseNavigationParams(params);
  assert.equal(params.get('companyId'), null);
  assert.equal(params.get('agentChannel'), 'web');
});

test('候选确认属于普通消息，使用原候选结果 ID，不包含审批动作', () => {
  const confirmation = {
    sessionId: 'original',
    company: company(),
    resultId: 'ed_candidates',
  };
  assert.deepEqual(data.confirmationPayload(confirmation, '已确认企业', 'zh'), {
    message: '已确认企业',
    lang: 'zh',
    formData: {
      enterpriseCompanyId: '+/公司==',
      enterpriseResultId: 'ed_candidates',
    },
  });
});

test('结构化卡片识别 data 优先、snapshot 回放，其他企业核算卡不误判', () => {
  const item = card('r1');
  item.card.card.snapshot = { ...carbon('snapshot', []), resultId: 'old' };
  assert.equal(data.getEnterpriseCard(item.card).data.company.companyId, 'a');
  delete item.card.card.data;
  assert.equal(data.getEnterpriseCard(item.card).resultId, 'old');
  assert.equal(
    data.getEnterpriseCard({ cardType: 'enterprise_carbon_computation' }),
    undefined,
  );
});

test('实时、最终、历史卡片按消息与结果去重，不合并不同查询或不同消息', () => {
  const live = card('r1');
  const final = { ...live, orderNo: 80, card: live.card.card };
  const merged = mergeAgentAnswerCards(
    [live],
    [final, card('r2'), card('r1', 'enterprise_carbon_data', 'm2')],
  );
  assert.equal(merged.length, 3);
  assert.equal(merged[0].orderNo, 80);
});

test('最终卡片覆盖实时快照，并保留原会话和流顺序', () => {
  const { normalizeFinalCards } = load('agentFinalResponseState.ts');
  const live = { ...card('r1'), streamOrderNo: 30 };
  const before = JSON.stringify(live);
  const finalData = {
    ...live.card.card.data,
    company: { ...company('a'), name: '最终企业名称' },
    metrics: [metric({ valueNumeric: '123.4500' })],
  };
  for (const payloadKey of ['data', 'snapshot']) {
    const finalCard = {
      cardType: 'enterprise_carbon_data',
      bizRef: { resultId: 'r1' },
      [payloadKey]: finalData,
    };
    const final = normalizeFinalCards({
      messageId: 'm1',
      cards: [{ card: finalCard, orderNo: 80 }],
    });
    const merged = mergeAgentAnswerCards([live], final);
    assert.equal(merged.length, 1);
    assert.deepEqual(data.getEnterpriseCard(merged[0].card).data, finalData);
    assert.equal(
      data.getEnterpriseCard(merged[0].card).sessionId,
      'session-original',
    );
    assert.equal(merged[0].streamOrderNo, 30);
    assert.equal(merged[0].orderNo, 80);
    // 解包快照在前、包装事件在后时，也应以新事件为准。
    const replay = mergeAgentAnswerCards(final, [live]);
    assert.equal(replay.length, 1);
    assert.deepEqual(
      data.getEnterpriseCard(replay[0].card).data,
      live.card.card.data,
    );
  }
  assert.equal(JSON.stringify(live), before);
});

test('更换对比企业失败后，加载、错误展示和重试均保留新企业及年度', async t => {
  for (const failureStage of ['years', 'compare']) {
    await t.test(failureStage, async () => {
      const React = require('react');
      // 在组件边界隔离 hooks 和请求，直接执行页面的选择及重试处理器。
      const slots = [];
      let cursor = 0;
      const react = {
        ...React,
        useState(initial) {
          const index = cursor++;
          if (!(index in slots))
            slots[index] = typeof initial === 'function' ? initial() : initial;
          return [
            slots[index],
            next => {
              slots[index] =
                typeof next === 'function' ? next(slots[index]) : next;
            },
          ];
        },
        useRef(initial) {
          const index = cursor++;
          return (slots[index] ||= { current: initial });
        },
        useEffect() {},
      };
      const result = {
        success: true,
        resultId: 'old-result',
        resultType: 'enterprise_comparison',
        data: {
          companies: [carbon('a', ['2025']), carbon('b', ['2025'])],
          year: '2025',
          sameIndustry: false,
          medians: [],
        },
      };
      const state = {
        enabled: true,
        scope: 's',
        entitlement: { data: { compareLimit: 2 }, isSuccess: true },
        follows: {
          data: ['a', 'b', 'c', 'd'].map(id => ({
            enterpriseId: id,
            company: company(id),
          })),
          isSuccess: true,
        },
        selectedCompanyIds: ['a', 'b'],
        setSelectedCompanyIds(ids) {
          state.selectedCompanyIds = ids;
        },
        refresh: async () => true,
      };
      const yearRequests = [];
      const comparisons = [];
      let failing = true;
      const ui = createLoader(undefined, {
        react,
        '@tanstack/react-query': {
          useQuery: () => ({ data: result }),
          useQueryClient: () => ({ setQueryData() {} }),
        },
        './state': { useEnterpriseData: () => state },
        './service': {
          fetchCarbonData: async id => {
            yearRequests.push(id);
            if (failing && failureStage === 'years')
              throw new Error('年度查询失败');
            return carbon(id, ['2024']);
          },
          createComparison: async (ids, year) => {
            comparisons.push({ ids, year });
            if (failing) throw new Error('对比查询失败');
            return { ...result, resultId: 'new-result' };
          },
          enterpriseError: error => error.message,
        },
      })('enterpriseData/ComparePage.tsx');
      const completed = [];
      const render = () => {
        cursor = 0;
        return ui.ComparePage({
          resultId: result.resultId,
          onResult: id => completed.push(id),
          onSelect() {},
          onBack() {},
        });
      };
      const find = (node, name) => {
        if (!node || typeof node !== 'object') return undefined;
        if (node.type?.name === name) return node;
        for (const child of [node.props?.children].flat(Infinity)) {
          const found = find(child, name);
          if (found) return found;
        }
        return undefined;
      };
      find(render(), 'ComparisonResultView').props.onChoose();
      find(render(), 'CompareCompanyPicker').props.onConfirm([
        company('c'),
        company('d'),
      ]);
      const displayedIds = () =>
        find(render(), 'ComparisonCompanies').props.companies.map(
          item => item.companyId,
        );
      assert.deepEqual(displayedIds(), ['c', 'd']);
      await new Promise(resolve => setImmediate(resolve));
      assert.deepEqual(displayedIds(), ['c', 'd']);
      failing = false;
      await find(render(), 'ErrorState').props.onRetry();
      assert.deepEqual(completed, ['new-result']);
      assert.deepEqual(
        yearRequests,
        failureStage === 'years' ? ['c', 'd', 'c', 'd'] : ['c', 'd'],
      );
      assert.deepEqual(
        comparisons,
        Array(failureStage === 'compare' ? 2 : 1).fill({
          ids: ['c', 'd'],
          year: '2024',
        }),
      );
    });
  }
});

test('只接受 code=200，不把空响应、非 JSON 或空列表替代业务失败', () => {
  const api = load('enterpriseData/service.ts');
  for (const value of [
    undefined,
    null,
    '<html>login</html>',
    {},
    { code: 1, data: [] },
    { code: 500, data: [] },
  ]) {
    assert.throws(() => api.unwrapEnterpriseResponse(value, Array.isArray));
  }
  assert.equal(
    api.unwrapEnterpriseResponse(
      { code: 200, data: null },
      value => value === null,
    ),
    null,
  );
  assert.throws(() =>
    api.unwrapEnterpriseResponse({ code: 200, data: null }, Array.isArray),
  );
});

test('十个接口发送准确参数，关注 data=null 成功，分析 180 秒且无登录企业 ID', async () => {
  const calls = [];
  const comparison = {
    success: true,
    resultId: 'ed_compare',
    resultType: 'enterprise_comparison',
    data: {
      companies: [carbon('a', ['2025']), carbon('b', ['2025'])],
      year: '2025',
      sameIndustry: false,
      medians: [],
    },
  };
  const values = {
    entitlement: { followLimit: 5, compareLimit: 2 },
    follows: [
      { enterpriseId: '+/公司==', companyJson: JSON.stringify(company()) },
    ],
    follow: null,
    unfollow: null,
    candidates: { records: [company()], total: 1, pageNum: 1, pageSize: 20 },
    data: carbon('a', ['2025']),
    reports: {
      records: [{ reportId: 'rep' }],
      total: 1,
      pageNum: 1,
      pageSize: 20,
    },
    compare: comparison,
    result: comparison,
    analyze: {
      emissionScale: '规模',
      emissionEfficiency: '效率',
      keyFindings: '关注',
    },
  };
  const api = createLoader(async options => {
    calls.push(options);
    return { data: { code: 200, data: values[options.url.split('/').pop()] } };
  })('enterpriseData/service.ts');
  const abort = new AbortController();
  await api.fetchEntitlement();
  const follows = await api.fetchFollows();
  assert.equal(follows[0].company.securities[0].code, '00375');
  await api.setFollow('+/公司==', true);
  await api.setFollow('+/公司==', false);
  await api.fetchCandidates('宁德', 2, abort.signal);
  await api.fetchCarbonData('+/公司==', ['2025'], abort.signal);
  await api.fetchReports('+/公司==', 2);
  await api.createComparison(['a', 'b'], '2025', abort.signal);
  await api.fetchResult('ed_compare');
  await api.analyzeComparison('ed_compare', abort.signal);
  assert.equal(calls.length, 10);
  assert.deepEqual(calls[4].data, {
    keyword: '宁德',
    pageNum: 2,
    pageSize: 20,
  });
  assert.equal(calls[4].signal, abort.signal);
  assert.deepEqual(calls[6].params, { companyId: '+/公司==', pageNum: 2 });
  assert.deepEqual(calls[7].data, { companyIds: ['a', 'b'], years: ['2025'] });
  assert.deepEqual(calls[9].data, { resultId: 'ed_compare' });
  assert.equal(calls[9].timeout, 180000);
  assert.equal(calls[9].signal, abort.signal);
  const requestSource = fs.readFileSync(
    path.resolve(root, '../../../api/request.ts'),
    'utf8',
  );
  assert.match(requestSource, /['"]\/ai\/agent\/enterprise-data\/['"]/);
});

test('关注列表 JSON 损坏保留原记录和取消标识，不默默减少数量', async () => {
  const api = createLoader(async () => ({
    data: {
      code: 200,
      data: [
        { enterpriseId: 'broken', companyJson: '{' },
        {
          enterpriseId: 'valid',
          companyJson: JSON.stringify(company('old-id')),
        },
      ],
    },
  }))('enterpriseData/service.ts');
  const follows = await api.fetchFollows();
  assert.equal(follows.length, 2);
  assert.equal(follows[0].company, undefined);
  assert.equal(follows[1].company.companyId, 'valid');
});

test('过期报告逐页匹配原 reportId，找不到不代用其他报告', async () => {
  const pages = [];
  const api = createLoader(async options => {
    const page = options.params.pageNum;
    pages.push(page);
    return {
      data: {
        code: 200,
        data: {
          pageNum: page,
          pageSize: 20,
          total: 22,
          records:
            page === 1
              ? [{ reportId: 'wrong', linkUrl: 'https://example.com/wrong' }]
              : [{ reportId: 'target', linkUrl: 'https://example.com/target' }],
        },
      },
    };
  })('enterpriseData/service.ts');
  assert.equal(
    (await api.refreshReport('a', 'target')).linkUrl,
    'https://example.com/target',
  );
  assert.deepEqual(pages, [1, 2]);
  assert.equal(await api.refreshReport('a', 'missing'), undefined);
  assert.equal(data.safeReportUrl('javascript:alert(1)'), undefined);
  assert.equal(data.safeReportUrl('/internal/file'), undefined);
  assert.equal(
    data.safeReportUrl('https://example.com/report'),
    'https://example.com/report',
  );
});

test('接口不完整的分析与错误结果类型明确失败', async () => {
  const api = createLoader(async () => ({
    data: { code: 200, data: { emissionScale: '只有一段' } },
  }))('enterpriseData/service.ts');
  await assert.rejects(api.analyzeComparison('r1'));
  await assert.rejects(api.createComparison(['a', 'b'], '2025'));
});

test('拒绝会让表格崩溃的错误数组、数值类型与中位数结构', () => {
  const api = load('enterpriseData/service.ts');
  assert.equal(data.isCompany({ ...company(), labels: 'A股' }), false);
  assert.equal(
    data.isCompany({ ...company(), securities: [{ code: 375 }] }),
    false,
  );
  for (const override of [
    { availableYears: '2025' },
    { metrics: [metric({ valueNumeric: 0 })] },
    { metrics: [metric({ path: '范围二' })] },
    { sources: [null] },
  ])
    assert.equal(
      data.isCarbonData({ ...carbon('a', ['2025']), ...override }),
      false,
    );
  assert.equal(
    api.isEnterpriseResult({
      success: true,
      resultId: 'invalid',
      resultType: 'enterprise_comparison',
      data: {
        companies: [carbon('a', []), carbon('b', [])],
        year: '2025',
        sameIndustry: true,
        medians: [null],
      },
    }),
    false,
  );
});

test('范围二未披露口径从源指标名称判断，不从证券市场或 marketCode 猜测', () => {
  assert.equal(
    data.hasUndisclosedScopeTwoBasis(metric({ marketCode: 'CN' })),
    true,
  );
  assert.equal(
    data.hasUndisclosedScopeTwoBasis(metric({ name: '范围二市场法' })),
    false,
  );
  assert.equal(
    data.hasUndisclosedScopeTwoBasis(
      metric({ name: 'Scope 2 location based' }),
    ),
    false,
  );
  assert.equal(
    data.hasUndisclosedScopeTwoBasis(metric({ name: '范围一' })),
    false,
  );
});

test('历史 blocks、cards 与 timeline 的同一企业卡片只保留一份，保留快照', async t => {
  let redirects = 0;
  global.window = {
    location: {
      replace: () => {
        redirects += 1;
      },
    },
  };
  t.after(() => {
    delete global.window;
  });
  const item = card('ed_history');
  const trace = {
    session: { sessionId: 'session-original', status: 'COMPLETED' },
    turns: [
      {
        messageId: 'm1',
        role: 'assistant',
        content: '查询完成',
        createTime: '2026-10-20 10:00:00',
        payload: {
          cards: [item.card.card],
          blocks: [{ ...item.card, blockType: 'business_card' }],
        },
      },
    ],
    events: [
      {
        eventId: 'evt1',
        messageId: 'm1',
        eventType: 'business_card',
        visible: 1,
        sequenceNo: 1,
        status: 'SUCCESS',
        payloadJson: JSON.stringify(item.card),
      },
    ],
  };
  const api = createLoader(async () => ({ data: { data: trace } }))(
    'service.ts',
  );
  const history = await api.fetchAgentSessionHistory('session-original');
  assert.equal(redirects, 0);
  const answer = history.messages.find(message => message.role === 'assistant');
  assert.ok(answer);
  assert.equal(
    answer.cards.filter(card => data.getEnterpriseCard(card.card)).length,
    1,
  );
  assert.equal(
    data.getEnterpriseCard(answer.cards[0].card).resultId,
    'ed_history',
  );
});

test('企业 business_card 通过真实续流解析及时送达，数字游标去重且先于最终文本', async t => {
  const api = createLoader()('service.ts');
  const calls = [];
  const frame = (id, eventType, fields) =>
    `id: ${id}\nevent: ${eventType}\ndata: ${JSON.stringify({
      eventType,
      sessionId: 'session-original',
      messageId: 'm1',
      ...fields,
    })}\n\n`;
  const item = card('ed_stream');
  const stream =
    frame(10, 'business_card', item.card) +
    frame(10, 'business_card', item.card) +
    frame(11, 'message_delta', { delta: '说明文本' }) +
    frame(12, 'final_response', { reply: '查询完成', status: 'COMPLETED' }) +
    frame(13, 'completed', {});
  t.mock.method(globalThis, 'fetch', async url => {
    assert.match(String(url), /afterStreamEventId=9$/);
    assert.doesNotMatch(String(url), /enterprise_data_ed_stream/);
    return new Response(stream, {
      headers: { 'content-type': 'text/event-stream' },
    });
  });
  await api.resumeAgentChatMessage({
    state: { sessionId: 'session-original', messageId: 'm1', lastEventId: 9 },
    onCard: card =>
      calls.push(['card', data.getEnterpriseCard(card.card).resultId]),
    onDelta: delta => calls.push(['text', delta.delta]),
  });
  assert.deepEqual(calls, [
    ['card', 'ed_stream'],
    ['text', '说明文本'],
  ]);
});

test('真实表格渲染展示零、长小数与缺失，中位数样本不足或跨行业不误显示', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const components = createLoader()('enterpriseData/components.tsx');
  const companies = [carbon('a', ['2025']), carbon('b', ['2025'])];
  companies[1].metrics = [metric({ valueNumeric: '9007199254740993.123400' })];
  const comparison = {
    companies,
    year: '2025',
    sameIndustry: true,
    medians: [{ ...metric(), sampleCount: 1, value: '987654321' }],
  };
  const html = renderToStaticMarkup(
    React.createElement(components.ComparisonTable, {
      comparison,
      showMedian: true,
    }),
  );
  assert.match(html, /9,007,199,254,740,993.1234/);
  assert.match(html, />0<\/td>/);
  assert.match(html, /行业中位数/);
  assert.doesNotMatch(html, /987,654,321/);
  const crossIndustry = renderToStaticMarkup(
    React.createElement(components.ComparisonTable, {
      comparison: { ...comparison, sameIndustry: false },
      showMedian: true,
    }),
  );
  assert.doesNotMatch(crossIndustry, /行业中位数/);
  const empty = renderToStaticMarkup(
    React.createElement(components.MetricsTable, {
      data: { ...companies[0], years: ['2024'] },
    }),
  );
  assert.match(empty, /所选年度暂无披露数据/);
});

test('分享卡片保留快照，候选确认和关注按钮禁用，不显示读取最新数据入口', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
  const state = {
    scope: 'readonly',
    enabled: false,
    pending: [],
    follows: { data: [], isSuccess: false },
    entitlement: { data: { followLimit: 0, compareLimit: 0 } },
  };
  const ui = createLoader(undefined, {
    './state': { useEnterpriseData: () => state },
  })('enterpriseData/EnterpriseDataCard.tsx');
  const client = new QueryClient();
  const render = item =>
    renderToStaticMarkup(
      React.createElement(
        QueryClientProvider,
        { client },
        React.createElement(ui.EnterpriseDataCard, {
          card: item,
          readonly: true,
          sessionId: 'session-original',
        }),
      ),
    );
  const html = render(card('readonly'));
  assert.match(html, /企业基础信息/);
  assert.match(html, /disabled=""[^>]*>.*?关注企业/s);
  assert.doesNotMatch(html, /查看最新数据/);
  const candidate = card('candidate', 'enterprise_candidates');
  candidate.card.card.data = {
    resultId: 'candidate',
    records: [company()],
    total: 1,
    pageNum: 1,
    pageSize: 20,
  };
  assert.match(render(candidate), /disabled=""[^>]*>.*?确认企业/s);
  client.clear();
});

test('关注页对比选择在取消关注、损坏记录和额度降级时清理，正常刷新保持选择', () => {
  const follows = ['a', 'b', 'c'].map(id => ({
    enterpriseId: id,
    company: company(id),
  }));
  const selected = ['b', 'a'];
  assert.equal(data.retainSelectedCompanies(selected, follows, 2), selected);
  assert.deepEqual(
    data.retainSelectedCompanies(selected, follows.slice(1), 2),
    ['b'],
  );
  assert.deepEqual(
    data.retainSelectedCompanies(
      selected,
      [{ enterpriseId: 'a' }, follows[1]],
      2,
    ),
    ['b'],
  );
  assert.deepEqual(data.retainSelectedCompanies(selected, follows, 0), []);
  assert.deepEqual(data.retainSelectedCompanies(['b', 'a', 'c'], follows, 2), [
    'b',
    'a',
  ]);
});

test('设计稿关注按钮保留取消入口，添加弹窗禁用已添加项，证券代码保留前导零', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const state = {
    enabled: true,
    pending: [],
    follows: { data: [{ enterpriseId: 'a' }], isSuccess: true },
    entitlement: { data: { followLimit: 5, compareLimit: 2 }, isSuccess: true },
  };
  const load = createLoader(undefined, {
    './state': { useEnterpriseData: () => state },
  });
  const { FollowButton } = load('enterpriseData/components.tsx');
  const { stockCodes, stockTypes } = load('enterpriseData/FollowCompany.tsx');
  const render = appearance =>
    renderToStaticMarkup(
      React.createElement(FollowButton, { companyId: 'a', appearance }),
    );
  assert.match(render('add'), /disabled=""/);
  assert.match(render('add'), /已添加/);
  assert.doesNotMatch(render('star'), /disabled=""/);
  assert.match(render('star'), /aria-label="取消关注"/);
  assert.equal(
    stockCodes({ securities: [{ code: '00370', marketCode: 'HK' }] }),
    '00370',
  );
  assert.equal(
    stockTypes({ securities: [{ code: '00370', marketCode: 'HK' }] }),
    '—',
  );
});

test('页面分组按范围展示，保留完整指标键、不同口径、单位和年度值', () => {
  const source = [
    metric({ indicatorCode: 'total', name: '碳排放总量(范围一、二、三)' }),
    metric({ name: '碳排放量(范围二)-位置法', marketCode: 'location' }),
    metric({ name: '碳排放量(范围二)-市场法', marketCode: 'market' }),
    metric({
      name: '碳排放量(范围二)-位置法',
      marketCode: 'location',
      unit: 'kgCO2e',
    }),
    metric({ indicatorCode: 'scope1', name: '碳排放量(范围一)' }),
    metric({
      indicatorCode: 'intensity',
      name: '单位营收碳排放量(范围一)',
      unit: 'tCO2e/百万元',
      currency: 'CNY',
    }),
    metric({
      indicatorCode: 'policy',
      name: '温室气体管理政策',
      categoryName: '温室气体管理',
    }),
  ];
  const before = JSON.stringify(source);
  const rows = data.groupedMetricRows([
    source,
    [
      metric({
        indicatorCode: 'scope1',
        name: '碳排放量(范围一)',
        statisticalPeriod: '2024',
      }),
    ],
  ]);
  assert.deepEqual(
    rows.filter(row => row.kind === 'group').map(row => row.group),
    ['emissions', 'intensity', 'other:温室气体管理'],
  );
  const metrics = rows.filter(row => row.kind === 'metric');
  assert.equal(metrics.length, 7);
  assert.equal(metrics[0].metric.indicatorCode, 'scope1');
  assert.equal(metrics[4].metric.indicatorCode, 'total');
  assert.equal(new Set(metrics.map(row => row.key)).size, 7);
  assert.equal(JSON.stringify(source), before);
});

test('新版详情和对比表格保留零与长小数，跨行业不显示中位数，样本不足不显示数值', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const ui = createLoader()('enterpriseData/CarbonTables.tsx');
  const first = {
    ...carbon('a', ['2025', '2024']),
    metrics: [
      metric({ name: '碳排放量(范围二)' }),
      metric({
        name: '碳排放量(范围二)',
        statisticalPeriod: '2024',
        valueNumeric: '9007199254740993.123400',
      }),
    ],
  };
  const html = renderToStaticMarkup(
    React.createElement(ui.DetailMetricsTable, { data: first }),
  );
  assert.match(html, /9,007,199,254,740,993.1234/);
  assert.match(html, />0<\/td>/);
  assert.match(html, /碳排放量<\/td>/);
  const comparison = {
    companies: [first, { ...carbon('b', ['2025']), metrics: [] }],
    year: '2025',
    sameIndustry: true,
    medians: [{ ...metric(), sampleCount: 1, value: '987654321' }],
  };
  const render = sameIndustry =>
    renderToStaticMarkup(
      React.createElement(ui.PageComparisonTable, {
        comparison: { ...comparison, sameIndustry },
        showMedian: true,
      }),
    );
  assert.match(render(true), /行业中位数/);
  assert.match(render(true), /该企业在所选年度暂无披露数据/);
  assert.doesNotMatch(render(true), /987,654,321/);
  assert.doesNotMatch(render(false), /行业中位数/);
});

test('对比权益接受服务端非负整数上限，拒绝非法配置', async () => {
  for (const limit of [0, 1, 2, 3, 4, 10]) {
    const api = createLoader(async () => ({
      data: { code: 200, data: { followLimit: 10, compareLimit: limit } },
    }))('enterpriseData/service.ts');
    assert.equal((await api.fetchEntitlement()).compareLimit, limit);
  }
  for (const limit of [-1, 2.5, '4', null, undefined]) {
    const api = createLoader(async () => ({
      data: { code: 200, data: { followLimit: 10, compareLimit: limit } },
    }))('enterpriseData/service.ts');
    await assert.rejects(api.fetchEntitlement());
  }
  for (const [count, limit, expected] of [
    [1, 4, false],
    [2, 4, true],
    [3, 4, true],
    [4, 4, true],
    [5, 4, false],
    [3, 2, false],
    [2, 0, false],
  ]) {
    assert.equal(data.isComparisonCountAllowed(count, limit), expected);
  }
});

test('多企业快照完整提交与恢复，年度交集覆盖全部企业，降级只裁减选择', async () => {
  const ids = ['a', 'b', 'c', 'd'];
  const companies = ids.map((id, i) =>
    carbon(id, i === 3 ? ['2024'] : ['2025', '2024']),
  );
  const snapshot = {
    success: true,
    resultId: 'multi',
    resultType: 'enterprise_comparison',
    data: { companies, year: '2024', sameIndustry: false, medians: [] },
  };
  const calls = [];
  const api = createLoader(async options => {
    calls.push(options);
    return { data: { code: 200, data: snapshot } };
  })('enterpriseData/service.ts');
  assert.deepEqual(
    (await api.createComparison(ids, '2024')).data.companies,
    companies,
  );
  assert.deepEqual(calls[0].data.companyIds, ids);
  assert.deepEqual((await api.fetchResult('multi')).data.companies, companies);
  assert.equal(
    api.isEnterpriseResult({
      ...snapshot,
      data: { ...snapshot.data, companies: companies.slice(0, 1) },
    }),
    false,
  );
  assert.deepEqual(data.comparisonYears(companies), {
    years: ['2025', '2024'],
    defaultYear: '2024',
  });
  const follows = ids.map(id => ({ enterpriseId: id, company: company(id) }));
  assert.equal(data.retainSelectedCompanies(ids, follows, 4), ids);
  assert.deepEqual(data.retainSelectedCompanies(ids, follows, 2), ['a', 'b']);
});

test('企业选择弹窗按权益上限允许三家、四家，超限禁用确认且允许取消勾选', () => {
  const React = require('react');
  const Checkbox = () => null;
  const Modal = () => null;
  const state = {
    enabled: true,
    entitlement: { data: { compareLimit: 4 }, isSuccess: true },
    follows: {
      data: ['a', 'b', 'c', 'd', 'e'].map(id => ({
        enterpriseId: id,
        company: company(id),
      })),
      isSuccess: true,
    },
  };
  const picker = createLoader(undefined, {
    react: { ...React, useState: initial => [initial, () => {}] },
    antd: { Checkbox, Modal, Input: () => null, Empty: () => null },
    './state': { useEnterpriseData: () => state },
  })('enterpriseData/CompareCompanyPicker.tsx');
  const findAll = (node, type) => {
    if (!node || typeof node !== 'object') return [];
    return [
      ...(node.type === type ? [node] : []),
      ...[node.props?.children]
        .flat(Infinity)
        .flatMap(child => findAll(child, type)),
    ];
  };
  for (const [ids, limit, disabled] of [
    [['a'], 4, true],
    [['a', 'b', 'c'], 4, false],
    [['a', 'b', 'c', 'd'], 4, false],
    [['a', 'b', 'c'], 2, true],
    [['a', 'b'], 0, true],
  ]) {
    state.entitlement.data.compareLimit = limit;
    let confirmed;
    const tree = picker.CompareCompanyPicker({
      initial: ids,
      onClose() {},
      onConfirm: items => {
        confirmed = items;
      },
    });
    assert.equal(tree.props.okButtonProps.disabled, disabled);
    tree.props.onOk();
    assert.deepEqual(
      confirmed?.map(item => item.companyId),
      disabled ? undefined : ids,
    );
    const checks = findAll(tree, Checkbox);
    assert.equal(
      checks.find(item => item.key === 'e').props.disabled,
      limit < 2 || ids.length >= limit,
    );
    if (limit >= 2)
      assert.equal(checks.find(item => item.key === 'a').props.disabled, false);
  }
});

test('多企业对比表保留所有公司列并按列数横向滚动', () => {
  const React = require('react');
  const Table = () => null;
  const ui = createLoader(undefined, {
    antd: { Table, Alert: () => null, Tooltip: () => null, Empty: require('antd').Empty },
  })('enterpriseData/CarbonTables.tsx');
  const companies = ['a', 'b', 'c', 'd'].map(id => carbon(id, ['2025']));
  for (const showMedian of [true, false]) {
    const tree = ui.PageComparisonTable({
      comparison: { companies, year: '2025', sameIndustry: true, medians: [] },
      showMedian,
    });
    const table = React.Children.toArray(tree.props.children).find(
      child => child.type === Table,
    );
    assert.equal(table.props.columns.length, showMedian ? 6 : 5);
    assert.equal(table.props.scroll.x, 340 + 250 * 4 + (showMedian ? 220 : 0));
    assert.equal(table.props.scroll.y, '100%');
  }
});

test('移动端对比只横向滚动，固定指标列且分组行不遮挡数据列', () => {
  const React = require('react');
  const Table = () => null;
  const ui = createLoader(undefined, {
    antd: { Table, Alert: () => null, Tooltip: () => null, Empty: require('antd').Empty },
  })('enterpriseData/CarbonTables.tsx');
  for (const count of [2, 4]) {
    const companies = Array.from({ length: count }, (_, index) => ({
      ...carbon(String(index), ['2025']),
      metrics: [metric({ name: '碳排放量(范围二)' })],
    }));
    const tree = ui.PageComparisonTable({
      comparison: { companies, year: '2025', sameIndustry: true, medians: [] },
      showMedian: true,
      mobile: true,
    });
    const table = React.Children.toArray(tree.props.children).find(
      child => child.type === Table,
    );
    assert.equal(table.props.scroll.x, 160 + 200 * count + 180);
    assert.equal('y' in table.props.scroll, false);
    const columns = table.props.columns;
    assert.equal(columns[0].fixed, 'left');
    assert.equal(columns[0].width, 160);
    const group = table.props.dataSource.find(row => row.kind === 'group');
    assert.equal(columns[0].onCell(group).colSpan, 1);
    assert.equal(columns[1].onCell(group).colSpan, columns.length - 1);
    assert.equal(columns[2].onCell(group).colSpan, 0);
  }
});

test('低高度 PC 表格随页面滚动，仍保持桌面列宽和固定指标列', () => {
  const React = require('react');
  const Table = () => null;
  const ui = createLoader(undefined, {
    antd: { Table, Alert: () => null, Tooltip: () => null, Empty: require('antd').Empty },
  })('enterpriseData/CarbonTables.tsx');
  const tree = ui.PageComparisonTable({
    comparison: {
      companies: ['a', 'b', 'c', 'd'].map(id => carbon(id, ['2025'])),
      year: '2025',
      sameIndustry: false,
      medians: [],
    },
    showMedian: false,
    mobile: false,
    pageScroll: true,
  });
  const table = React.Children.toArray(tree.props.children).find(
    child => child.type === Table,
  );
  assert.equal(table.props.columns[0].width, 340);
  assert.equal(table.props.columns[0].fixed, 'left');
  assert.equal(table.props.columns[1].width, 250);
  assert.equal(table.props.scroll.x, 1340);
  assert.equal('y' in table.props.scroll, false);
});

test('PC 和移动端详情展示可读曾用名，均不渲染 ESG 报告入口或内容', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const detail = carbon('a', ['2025']);
  detail.company.companyFormerName = "{'formerName': '神华国能集团有限公司'}、{'formerName': '国家能源集团国源电力有限公司'}";
  detail.sources = [{ reportId: 'report-1', title: '不应展示的 ESG 报告' }];
  for (const compact of [false, true]) {
    const ui = createLoader(undefined, {
      '@/hooks/use-mobile': { useMobile: () => compact },
      '@tanstack/react-query': {
        ...require('@tanstack/react-query'),
        useQuery: () => ({ data: detail, isLoading: false, isError: false }),
      },
      './state': {
        useEnterpriseData: () => ({
          enabled: true,
          scope: 'test',
          pending: [],
          follows: { data: [], isSuccess: true },
          entitlement: { data: { followLimit: 5 }, isSuccess: true },
        }),
      },
    })('enterpriseData/DetailPage.tsx');
    const html = renderToStaticMarkup(
      React.createElement(ui.DetailPage, { companyId: 'a', onBack: () => {} }),
    );
    assert.match(html, /神华国能集团有限公司 \/ 国家能源集团国源电力有限公司/);
    assert.doesNotMatch(html, /formerName|ESG|report-1/);
    assert.match(html, /碳排放/);
    assert.match(html, /2025/);
  }
});


test('进入对比配置不查询年度，点击确认后才显示无年度错误', async () => {
  const React = require('react');
  const { Button } = require('antd');
  const slots = [];
  const effects = [];
  let cursor = 0;
  const requests = [];
  const state = {
    enabled: true, scope: 'test', comparisonRequested: true,
    entitlement: { data: { compareLimit: 2 }, isSuccess: true },
    follows: { data: ['a', 'b'].map(id => ({ enterpriseId: id, company: company(id) })), isSuccess: true },
    selectedCompanyIds: ['a', 'b'],
    setComparisonRequested() {}, refresh: async () => true,
  };
  const ui = createLoader(undefined, {
    react: {
      ...React,
      useState(initial) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = initial;
        return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
      },
      useRef(initial) { const index = cursor++; return (slots[index] ||= { current: initial }); },
      useEffect(effect) { effects.push(effect); },
    },
    '@tanstack/react-query': { useQuery: () => ({}), useQueryClient: () => ({}) },
    './state': { useEnterpriseData: () => state },
    './service': {
      fetchCarbonData: async id => { requests.push(id); return carbon(id, []); },
      createComparison: async () => assert.fail('无可用年度不得创建对比'),
      enterpriseError: error => error.message,
    },
  })('enterpriseData/ComparePage.tsx');
  const render = () => {
    cursor = 0;
    return ui.ComparePage({ resultId: '', onResult() {}, onSelect() {}, onBack() {} });
  };
  const find = (node, predicate) => {
    if (!node || typeof node !== 'object') return undefined;
    if (predicate(node)) return node;
    return [node.props?.children].flat(Infinity).map(child => find(child, predicate)).find(Boolean);
  };
  const initial = render();
  effects.splice(0).forEach(effect => effect());
  assert.deepEqual(requests, []);
  assert.equal(find(initial, node => node.type?.name === 'ErrorState'), undefined);
  const confirm = find(initial, node => node.type === Button && node.props.children === locale.startCompare);
  assert.equal(confirm.props.disabled, false);
  await confirm.props.onClick();
  assert.deepEqual(requests, ['a', 'b']);
  assert.equal(find(render(), node => node.type?.name === 'ErrorState').props.error, locale.noYears);
});
