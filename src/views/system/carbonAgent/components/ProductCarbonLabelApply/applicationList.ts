import I18N from '@src/lang/I18N';
import type { CarbonLabelListData } from '@src/views/carbonFootprint3/CarbonLabel/type';

import { getAgentCarbonLabelList } from './service';

/** Agent 接口一次返回当前核算的全部申请，保持后端顺序。 */
export async function loadCarbonLabelApplications(
  accountId: string,
  signal?: AbortSignal,
): Promise<CarbonLabelListData[]> {
  if (!accountId) return [];
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const { data } = await getAgentCarbonLabelList({ accountId }, signal);
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const rows = data.data;
  if (!Array.isArray(rows) || rows.some(row => row?.id == null))
    throw new Error(I18N.carbonAgent.labelApplication.loadError);
  if (rows.some(row => String(row.accountId) !== accountId))
    throw new Error(I18N.carbonAgent.labelApplication.recordScopeError);
  return rows;
}
