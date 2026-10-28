import { request } from '@/api/request';

export const downloadTemplate = (params: { dictTypes: string }) =>
  request<{
    data: {
      [TempType: string]: {
        relatedValue: string;
        dictLabel: string;
      }[];
    };
  }>({
    method: 'get',
    url: '/management/system/enum/listALLByDictTypeBatch',
    params,
  });

export const importFactorFile = (data: FormData) =>
  request({
    method: 'post',
    url: '/management/system/company/import/factor',
    data,
  });

export const getRecordList = params =>
  request<{ total: number; rows: Record<string, any>[] }>({
    url: '/management/system/company/excel/list',
    params,
  });
