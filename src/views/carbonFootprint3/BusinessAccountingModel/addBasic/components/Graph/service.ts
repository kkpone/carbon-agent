import { request } from '@src/api/request';

/** 快速核算 - 核算管理 - 保存到库 */
export function postProcessBusinessAccountingEmissionInStore(data: {
  id: string | number;
}) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3//accountProcessIn/inStore`,
    data,
  });
}
