/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-30 15:03:36
 */
import { request } from '@api/request';

import { OpreationBack } from '../type';

/** 产品碳足迹更新数量 */
export function getOuterFootComputeEmission(data: {
  id: number | string;
  amount: string;
  typeExtra: { amount: string };
  distance?: string;
}) {
  return request<OpreationBack>({
    method: 'POST',
    url: `chain/data/outer/foot/compute/emission`,
    data,
  });
}
