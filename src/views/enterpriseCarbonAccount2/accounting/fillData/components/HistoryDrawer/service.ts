import { request } from '@src/api/request';

import { EmissionHistoryRecords, MatchSource } from './type';

export const getHistoryRecords = (params: {
  computationId: string;
  computationPeriod?: string;
  beginTime?: string;
  endTime?: string;
  userList?: string;
  id?: number;
  type?: number;
}) =>
  request<{ data: EmissionHistoryRecords }>({
    method: 'get',
    url: '/enterprise/source/history-record',
    params,
  });

export const getEditorList = (params: {
  computationId: string;
  computationPeriod?: string;
}) =>
  request<{ data: string[] }>({
    method: 'get',
    url: '/enterprise/source/record-userList',
    params,
  });

export const getMatchSourceList = params =>
  request<{ data: MatchSource[] }>({
    url: '/enterprise/source/match/name',
    params,
  });
