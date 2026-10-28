import { request, type ResponseData } from '@src/api/request';
import type {
  SavedCustomFactor,
  SavedFactorPage,
  SavedFactorService,
} from './types';

export const savedFactorService: SavedFactorService = {
  async query(params) {
    const { data } = await request<ResponseData<SavedFactorPage>>({
      url: '/footprint3/customFactor/list',
      method: 'GET',
      params,
    });
    return data.data;
  },
  async detail(id) {
    const { data } = await request<ResponseData<SavedCustomFactor>>({
      url: `/footprint3/customFactor/${encodeURIComponent(id)}`,
      method: 'GET',
    });
    return data.data;
  },
  async remove(id) {
    await request<ResponseData<null>>({
      url: `/footprint3/customFactor/${encodeURIComponent(id)}`,
      method: 'DELETE',
    });
  },
};
