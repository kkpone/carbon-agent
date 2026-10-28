import { request } from '@/api/request';
import type { GreenhouseGasGroup } from './types';

export async function getGreenhouseGasOptions(
  lang: string,
  signal: AbortSignal,
) {
  const { data } = await request<{ data: GreenhouseGasGroup[] }>({
    method: 'get',
    url: '/footprint3/accountEmission/greenhouseGasOptions',
    params: { lang },
    signal,
  });
  return data.data;
}
