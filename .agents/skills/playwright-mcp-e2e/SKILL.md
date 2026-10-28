---
name: playwright-mcp-e2e
description: >-
  Runs browser E2E checks via Playwright MCP (navigate, snapshot, interact, assert)
  from written test cases (e.g. Excel: 测试名称/测试步骤/预期结果). Use when the user
  asks for automated UI testing, MCP browser testing, E2E validation, or executing
  test case rows against the local dev app.
---

# Playwright MCP 端到端测试

用 **user-playwright** MCP 按书面用例执行自动化时遵循本流程。

## 1. 前置检查

1. **本地 URL**：按以下顺序确认，**任一方式确认可用即可，不要重复启动**：
   - a. 用户直接给出地址 → 用 `lsof -i :端口` 或 `curl -sI` 验证端口是否有服务在监听，**有则直接使用**。若用户已明确给出且确认可用，可跳过端口检测。
   - b. 读取 `terminals/` 下的终端文件，查找 dev server 输出的 Local 地址。
   - c. 以上均未找到时，才执行项目的启动命令（如 `pnpm start` / `npm run dev`），等终端出现可访问地址。
   - **注意**：dev server 可能在 Cursor 外部终端启动，因此步骤 a 的端口检测必须执行。
2. **Shell 命令拆分**：需要额外权限的命令（如 `curl` 需 `network`）必须与无需权限的命令（如 Python 解析 Excel）**分开调用**，否则沙箱会对整条命令弹审批，用户跳过后全部取消。
3. **敏感信息**：账号、密码、Token 禁止写入代码、对话或 Git。
4. **后端依赖**：若接口不可用，只验证能到的 UI 步骤，注明阻塞原因。
5. **浏览器窗口**：MCP 配置中已设置 `--start-maximized` + `viewport: null`。若需临时调整，用 `browser_resize`。

## 2. 用例来源

### 2.1 Excel 用例格式

用例文件可含**多个 Sheet**，按 Sheet 分批执行。列名和列数可能因项目不同而变化，以下为常见结构，执行时以实际 Excel 表头为准：

| 常见列 | 用法 |
|--------|------|
| **用例编号** | 唯一标识 |
| **用例名称** | 展示在结果中 |
| **模块名称** | 按模块分组汇总 |
| **前置条件** | 不满足则标**阻塞** |
| **测试环境** | 「网络中断」等无法模拟的标**跳过** |
| **测试路径** | 非空则 `browser_navigate`（替换域名为本地地址）；空则从当前页继续 |
| **测试数据** | 解析出各字段值，填入对应输入框 |
| **测试步骤** | 按 `\n` + 序号拆成子步骤逐步执行 |
| **预期结果** | 按 `\n` + 序号拆成子预期逐条断言 |
| **优先级** | P1 优先；可按指令只跑 P1 |
| **测试类型** | 冒烟/功能，用于分类 |
| **结束路径** | 非空则校验当前 URL |
| **上传文件** | 非空需用 `browser_file_upload` |
| **是否执行** | 为「是」才执行 |

### 2.2 读取 xlsx

环境无 openpyxl 时，用 Python 标准库 `zipfile` + `xml.etree.ElementTree` 解析 `xl/sharedStrings.xml`、`xl/workbook.xml` 和各 sheet XML，提取多 Sheet 数据。核心逻辑：读取 shared strings → 遍历 workbook sheets → 按 relationship 找到 sheet 文件 → 解析 `<c>` 节点的 `r`（坐标）、`t`（类型）、`v`（值）。

### 2.3 非 Excel 用例

用户也可能直接在提示词中给出步骤和预期结果（不带 Excel）。此时按相同的执行流程处理，将提示词内容映射到等价的字段（步骤、预期、前置条件等）。

### 2.4 提示词四要素

Agent 在开始执行前应确认以下信息，缺失时主动询问用户：

| 要素 | 说明 | 必须？ |
|------|------|--------|
| **用例来源** | Excel 路径 + Sheet / 编号 / 优先级 / 或临时步骤 | 必须 |
| **本地地址** | `http://localhost:端口` | 必须（首次） |
| **账号密码** | 临时提供，不落盘 | 需要登录时必须 |
| **当前状态** | 已登录？在哪个页面？ | 可选，能省步骤 |

## 3. 核心概念：ref

`browser_snapshot` 返回无障碍树，每个可交互元素带 **ref**（如 `ref="e12"`）。所有后续交互工具的必填参数就是这个 ref。

- **每次页面变化后 ref 失效**，必须重新 `browser_snapshot`。
- `element` 参数写人类可读描述（如 `"登录按钮"`），方便日志。

## 4. 工具速查

| 目的 | 工具 | 关键参数 |
|------|------|----------|
| 打开/返回页面 | `browser_navigate` / `browser_navigate_back` | `url` |
| 获取页面结构 | `browser_snapshot` | 可选 `depth` |
| 点击 | `browser_click` | `ref`, `element`, `doubleClick`, `button`, `modifiers` |
| 输入文本 | `browser_type` | `ref`, `text`, `slowly`, `submit` |
| 批量填表单 | `browser_fill_form` | `fields: [{name, type, ref, value}]` |
| Hover | `browser_hover` | `ref` |
| 按键 | `browser_press_key` | `key`（如 `Escape`, `Enter`） |
| 原生 select | `browser_select_option` | `ref`, `values` |
| 等待 | `browser_wait_for` | `text` / `textGone` / `time` |
| 执行 Playwright 代码 | `browser_run_code` | `code`（`async (page) => { ... }`） |
| 执行页面 JS | `browser_evaluate` | `function`, 可选 `ref` |
| 调试 | `browser_console_messages` / `browser_network_requests` | `level` |
| 截图 | `browser_take_screenshot` | `type`, `ref`, `fullPage` |
| 标签页 | `browser_tabs` | `action`, `index` |
| 文件上传 | `browser_file_upload` | `paths` |
| 拖拽/调整窗口 | `browser_drag` / `browser_resize` | — |
| 对话框/关闭 | `browser_handle_dialog` / `browser_close` | — |

## 5. UI 组件库特殊处理（Ant Design 等）

当项目使用 Ant Design（或类似组件库，如 Element Plus、Arco Design）时，多数组件非原生 HTML，需要特殊处理。以下以 antd 为例，其他库的虚拟化下拉、级联、表格等组件有类似问题。

### 5.1 自定义 Select（重要）

antd Select 等组件库的下拉**不是**原生 `<select>`，`browser_select_option` 无效。

**标准流程（4 步）：**

1. `browser_click` 点击 Select 触发器
2. `browser_snapshot` 确认下拉面板已展开（combobox `[expanded]`）
3. `browser_type` 在 combobox ref 上输入关键词搜索过滤
4. `browser_snapshot` → `browser_click` 点击目标 option

**兜底方案优先级**（当搜索不生效时）：

| 优先级 | 方法 | 适用场景 |
|--------|------|----------|
| 1 | combobox 输入关键词搜索 | 开启了 showSearch（大多数情况） |
| 2 | `browser_run_code` + `scrollIntoViewIfNeeded` | 未开启搜索但 DOM 已渲染 |
| 3 | 键盘 ArrowDown/ArrowUp 导航 | 虚拟滚动且无搜索 |
| 4 | `browser_type` + `submit: true` | 部分 Select 支持输入后回车直接选中 |

**虚拟滚动处理**：antd Select 等使用虚拟列表（如 `rc-virtual-list`），仅渲染可视区域。目标不在视口时，用 `browser_run_code` 在滚动容器上调整 `scrollTop`（置 0 回顶部、或增减 `clientHeight` 翻页），再定位点击。

```js
async (page) => {
  const dd = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  const holder = dd.locator('.rc-virtual-list-holder').first();
  await holder.evaluate(el => { el.scrollTop = 0; });
  const target = dd.getByText('目标选项', { exact: true });
  await target.scrollIntoViewIfNeeded();
  await target.click({ timeout: 5000 });
}
```

### 5.2 级联选择 Cascader（重要）

两条核心规则：

**规则 1：用菜单层级索引区分层级**

同名选项跨级时 `.first()` 永远命中第一级，必须用 `nth(N)` 限定层级：

```js
const dd = page.locator('.ant-cascader-dropdown:not(.ant-select-dropdown-hidden)');
await dd.locator('.ant-cascader-menu').first().getByText('一级选项', { exact: true }).first().click();
await page.waitForTimeout(400);
await dd.locator('.ant-cascader-menu').nth(1).getByText('二级选项', { exact: true }).first().click();
```

**规则 2：多个 Cascader 之间必须 Escape 关闭面板**

操作完一个后 `Escape` 关闭，再操作下一个，否则 dropdown 状态互相干扰。

**完整模板：**

```js
async (page) => {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // Cascader 0
  await page.locator('.ant-cascader').nth(0).locator('.ant-select-selector').click();
  await page.waitForTimeout(500);
  const dd0 = page.locator('.ant-cascader-dropdown:not(.ant-select-dropdown-hidden)');
  await dd0.locator('.ant-cascader-menu').first().getByText('一级A').first().click();
  await page.waitForTimeout(400);
  await dd0.locator('.ant-cascader-menu').nth(1).getByText('二级A').first().click();
  await page.waitForTimeout(400);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // Cascader 1
  await page.locator('.ant-cascader').nth(1).locator('.ant-select-selector').click();
  await page.waitForTimeout(500);
  const dd1 = page.locator('.ant-cascader-dropdown:not(.ant-select-dropdown-hidden)');
  await dd1.locator('.ant-cascader-menu').first().getByText('一级B').click();
  await page.waitForTimeout(400);
  await dd1.locator('.ant-cascader-menu').nth(1).getByText('二级B').click();
  return 'done';
}
```

Cascader 每一列菜单可能有独立的虚拟滚动区域，需对该列的滚动容器单独处理 `scrollTop`。

### 5.3 Table 隐藏副本

antd Table 等组件为固定表头生成**隐藏的 `<table>` 副本**。用 `page.locator('table').nth(N)` 时必须使用**可见表格**索引。不确定时先探测：

```js
async (page) => {
  const tables = page.locator('table');
  for (let i = 0; i < await tables.count(); i++) {
    const visible = await tables.nth(i).isVisible().catch(() => false);
    const header = await tables.nth(i).locator('th').first().textContent().catch(() => '');
    console.log(`table[${i}] visible=${visible} header=${header}`);
  }
}
```

### 5.4 其他常见组件

- **Input/TextArea**：snapshot 中通常是 `textbox` role，用 `browser_type` 或 `fill()` 输入。
- **message / notification**：提交后用 `browser_wait_for({ text: '成功' })` 等待反馈文案。
- **Modal / Drawer**：弹出后**必须重新 snapshot** 才能拿到内部元素 ref。
- **侧边菜单 / SubMenu**：可能需先 click 父菜单展开子菜单，再 snapshot 获取子项 ref。

### 5.5 用例字段名与页面控件的映射

用例里的字段名是业务语义，页面不一定有同名输入框。以 **DOM 实际可编辑节点**为准：

| 映射关系 | 怎么做 |
|----------|--------|
| **一对一表单项**（Label/placeholder 与用例一致） | `getByRole('textbox', { name })` 或 `locator('[placeholder]')` |
| **仅为区块标题**（无对应输入框） | 不要对标题 `fill()`，在标题下方的表格/控件中填写 |
| **一对多/聚合** | 按子步骤拆成多次操作，先锁定表格/行再操作 |

若 `getByRole` 一直失败，优先怀疑：无障碍名称与用例不一致，或该名称只是标题不是输入框。可用 `browser_run_code` 枚举 `textarea`/`input` 的 placeholder 做对照。

### 5.6 提交前必填完整性

自动化**不能只做用例写到的前几步就点提交**。当前页面/Modal/Drawer 里仍有未满足的必填项时，须**先全部填完**再提交。

- 提交后若出现红框（如 `.ant-form-item-has-error`）、disabled 按钮、或必填提示，说明有遗漏。
- **填写顺序**：按从上到下、从主到次填完当前可见表单，再点击会触发校验或跳转的按钮。
- Modal/Drawer 内的子表单也须填完整（如 textarea、Table 行内控件、文件上传等），不能只选完顶部几个字段就关窗。

### 5.7 多文件上传

**默认用区块定位**：在包含该字段标题的表单项/卡片内查找 `input[type=file]`。若要用全局 `nth(i)` 批量上传，须先枚举每个 file input 与其邻近标题做对照确认顺序一致，不一致则改回区块定位。

## 6. 性能优化

### 6.1 核心原则

1. **合并优先**：能用一次 `browser_run_code` 完成的操作，不拆成多次 MCP 调用。
2. **按需快照**：只在页面结构不确定时 snapshot；已知结构直接操作。
3. **预记忆结构**：常用页面的表单结构、表格索引可记在 SKILL 或注释中，跳过探索。
4. **禁止无效刷新**：不用 `browser_navigate` 重新打开当前页"重置状态"（用 Escape / fill('') 局部修复）。
5. **严禁并行操作同一页面**：多个 MCP 调用必须串行，共享 `page` 实例会互相干扰。

### 6.2 snapshot 策略

| 场景 | 是否 snapshot |
|------|---------------|
| 导航到新页面后 | **是** |
| 填写文本/选择下拉后 | **否** |
| 点击按钮触发弹窗后 | **是** |
| 提交表单后 | **是** |
| 连续填同一表单多个字段 | **否**（合并到一个 `browser_run_code`） |

### 6.3 批量操作模板

**模板 A：批量填文本字段**

```js
async (page) => {
  await page.getByRole('textbox', { name: '字段A' }).fill('值A');
  await page.getByRole('textbox', { name: '字段B' }).fill('值B');
  await page.getByRole('textbox', { name: '字段C' }).fill('值C');
  return 'filled';
}
```

**模板 B：antd Select 搜索选择**

```js
async (page) => {
  const select = page.locator('.ant-select').nth(N);
  await select.click({ timeout: 5000 });
  await page.waitForTimeout(200);
  await select.locator('input').fill('关键词');
  await page.waitForTimeout(500);
  await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
    .filter({ hasText: '关键词' }).first().click({ timeout: 5000 });
  return 'selected';
}
```

**模板 C：表格批量操作下拉**

```js
async (page) => {
  const rows = page.locator('table').nth(TABLE_INDEX).locator('tbody tr.ant-table-row');
  const rowCount = await rows.count();
  for (let r = 0; r < rowCount; r++) {
    const row = rows.nth(r);
    await row.scrollIntoViewIfNeeded();
    const selects = row.locator('.ant-select');
    for (let s = 0; s < await selects.count(); s++) {
      await selects.nth(s).click({ timeout: 5000 });
      await page.waitForTimeout(300);
      const dd = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
      await dd.locator('.ant-select-item-option').first().click({ timeout: 5000 });
      await page.waitForTimeout(200);
    }
  }
  return 'done';
}
```

**模板 D：同 role 多个输入框按索引逐个填写**

```js
async (page) => {
  const textboxes = page.getByRole('textbox', { name: '描述' });
  const count = await textboxes.count();
  const values = ['值1', '值2', '值3', '值4', '值5'];
  for (let i = 0; i < count && i < values.length; i++) {
    await textboxes.nth(i).fill(values[i]);
  }
  return `filled ${count}`;
}
```

### 6.4 异步下拉与超时处理

1. **所有 locator 操作设 `{ timeout: 5000 }`**，禁止依赖默认 30s。
2. **联动导致 DOM 变化时**先 `count()` 再索引；结构固定时直接 `nth(N)`。
3. **联动后等新元素**用 `waitForFunction` 而非固定 `waitForTimeout`：

```js
await page.waitForFunction(() => {
  const row = document.querySelector('table tbody tr');
  return row && row.querySelectorAll('.ant-select').length >= 2;
}, { timeout: 5000 });
```

### 6.5 禁止不必要的整页刷新

执行用例过程中**禁止** `browser_navigate` 重新打开当前页。正确处理：

| 错误做法 | 正确做法 |
|----------|----------|
| 下拉面板残留 → 刷新 | `Escape` 关闭面板 |
| 大脚本中途失败 → 刷新重来 | 脚本开头加前置检查，或拆成多段 |
| 操作错了字段 → 刷新 | `fill('')` 清空或重新选择 |
| 假设 UI 结构 → 超时后刷新 | 先 snapshot 确认实际结构再写操作代码 |

**允许整页导航**：用例第一步的路径导航、下一条用例的导航、白屏/JS 崩溃等无法恢复的错误（先用 `browser_console_messages` 取证）。

### 6.6 `browser_run_code` 容错模板

每个 `browser_run_code` 脚本建议在开头加入防御性检查：

```js
async (page) => {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  const url = page.url();
  if (!url.includes('/expected-path')) throw new Error('不在预期页面');

  // 检查是否已有数据，避免重复操作
  const rows = page.locator('table').first().locator('tbody tr');
  const rc = await rows.count();
  if (rc === 0) {
    await page.getByRole('button', { name: /新增/ }).click();
    await page.waitForTimeout(800);
  }

  // ... 后续正常操作
}
```

## 7. 定位优先级

在 `browser_run_code` 中使用 Playwright 定位器时的优先级：

1. `page.getByRole('button', { name: '提交' })` — 最稳定
2. `page.getByLabel('字段名')` — 表单字段
3. `page.getByPlaceholder('请输入')` — 次选
4. `page.getByText('某文案', { exact: true })` — 兜底

避免仅凭 `nth` 序号或脆弱 CSS 选择器。

## 8. 每条用例执行步骤

```
1. 读取该行：编号、名称、前置条件、测试环境、路径、数据、步骤、预期、结束路径
2. 检查「是否执行」→ 非「是」则跳过
3. 检查「测试环境」→ 无法模拟则标跳过
4. 检查「前置条件」→ 不满足则标阻塞
5. 导航：「测试路径」非空 → 替换域名为本地地址后 browser_navigate
6. browser_snapshot → 确认页面结构（仅此一次探索性 snapshot）
7. 分析步骤，按操作类型分组合并为最少的 browser_run_code 调用：
   - 所有文本字段 → 一次 browser_run_code（模板 A/D）
   - 所有 Select → 一次 browser_run_code（模板 B）
   - 所有级联 → 一次 browser_run_code（5.2 模板）
   - 表格批量 → 一次 browser_run_code（模板 C）
   - 简单按钮 → browser_click
   ※ 仅在弹窗/页面跳转后做 snapshot
8. 预期结果逐条验证
9. 「结束路径」非空则校验 URL
10. 判定：通过 / 失败 / 阻塞 / 跳过，记录实际结果
```

## 9. URL 替换

用例中的「测试路径」可能是线上地址。执行时提取路径部分，拼接本地地址后 `browser_navigate`。

## 10. 多 Sheet 与多用例串行

- 按 Sheet 分批，用户可指定只跑某个 Sheet。
- 同 Sheet 内按行顺序执行，保持同一浏览器会话。
- 前置失败则后续依赖用例标**阻塞**。
- 支持按优先级过滤（只跑 P1 等）。

## 11. 断言

MCP 环境没有 `@playwright/test` 的 `expect`，用返回值判断：

```js
async (page) => {
  const visible = await page.getByText('预期文案').first().isVisible();
  return { pass: visible, url: page.url() };
}
```

等待元素出现用 `page.getByText('...').waitFor({ timeout: 5000 })`。

## 12. 输出格式

每条用例输出：**用例编号 + 名称**、**结果**（通过/失败/阻塞/跳过）、**证据**（关键步骤的可见文案或 URL）、**实际结果**（一句话描述）。

全部完成后输出汇总表：

```
Sheet: XXX
  通过: X 条  |  失败: X 条  |  阻塞: X 条  |  跳过: X 条
  失败用例: XXX-001, XXX-002 …
```

### 收尾清理

全部用例执行完毕后清理 `.playwright-mcp/` 文件夹（`rm -rf .playwright-mcp/*`）。若测试失败需排查，先保留文件取证后再清理。

## 13. 禁止事项

- 未 snapshot 就连续 click（ref 可能已失效）
- 对组件库的自定义 Select 使用 `browser_select_option`
- 密码/Token 写进 URL、代码块或对话
- 网络返回 401/500 仍判「前端 bug」而不注明接口问题
- 单步失败后不取证（console/network）就跳过
- 同一用例执行中用 `browser_navigate` 刷新当前页"重置状态"
- 假设 UI 结构不先 snapshot 就写操作代码
- 用 `page.evaluate` 修改组件库 DOM 属性（破坏组件内部状态）
- Cascader 中用 `getByText('X').first()` 跨级点击（须用菜单层级索引限定）
- 不加 `{ timeout: 5000 }` 就调用 click/fill/waitFor 等操作
- 联动后仍用旧的 `.nth(N)`（联动场景先 `count()` 再索引）
- 仅凭用例字段名就假定存在同名 textbox 控件（可能是区块标题，见 5.5）
- 需要额外权限的命令和不需要权限的命令放在同一个 Shell 调用里
- 并行发出多个操作同一页面的 MCP 调用
- 只做完用例前几步就点提交，而跳过页面上其他必填项（见 5.6）
- 未做 file input 与字段标题对照就用全局 `nth` 批量上传（见 5.7）
