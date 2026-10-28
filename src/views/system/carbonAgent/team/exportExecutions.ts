import type { Execution, Executions } from './types';

/** Fail closed if pagination changes; never download a silently truncated or duplicated report. */
export const collectExecutions = async (
  loadPage: (pageNum: number) => Promise<Executions>,
): Promise<Execution[]> => {
  const first = await loadPage(1);
  if (first.total > 10000) throw new Error('AGENT_EXPORT_LIMIT_EXCEEDED');
  const rows = [...first.rows];
  for (let pageNum = 2; rows.length < first.total; pageNum += 1) {
    // Sequential reads allow stopping as soon as the snapshot becomes inconsistent.
    // eslint-disable-next-line no-await-in-loop
    const page = await loadPage(pageNum);
    if (page.total !== first.total || !page.rows.length)
      throw new Error('AGENT_EXPORT_DATA_CHANGED');
    rows.push(...page.rows);
  }
  const verify = await loadPage(1);
  if (
    verify.total !== first.total ||
    rows.length !== first.total ||
    new Set(rows.map(row => row.runId)).size !== rows.length ||
    verify.rows.map(row => row.runId).join(',') !==
      first.rows.map(row => row.runId).join(',')
  )
    throw new Error('AGENT_EXPORT_DATA_CHANGED');
  return rows;
};
