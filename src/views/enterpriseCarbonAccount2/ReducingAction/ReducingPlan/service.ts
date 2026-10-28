import { request } from '@/api/request';

import { ReducingPlan } from './type';

export const addReducingPlan = (data: ReducingPlan) =>
  request<{ data: number }>({
    method: 'post',
    url: '/enterprise/reduction/plan/add/target',
    data,
  });

export const editReducingPlan = (data: ReducingPlan) =>
  request<{ data: number }>({
    method: 'post',
    url: '/enterprise/reduction/plan/edit/target',
    data,
  });
export const getReducingPlanList = () =>
  request<{ data: ReducingPlan[] }>({
    method: 'get',
    url: '/enterprise/reduction/plan/list/target',
  });

export const deleteReducingPlan = (data: { id: number }) =>
  request({
    method: 'post',
    url: '/enterprise/reduction/plan/delete/target',
    data,
  });

export const getPlanDetails = (params: { id: number }) =>
  request<{ data: ReducingPlan }>({
    method: 'get',
    url: '/enterprise/reduction/plan/info/target',
    params,
  });
