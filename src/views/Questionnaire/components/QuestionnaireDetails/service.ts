import { request } from '@/api/request';

import { Questionnaire } from '../../type';

const normalizeQuestionnaire = (data?: Questionnaire | Record<string, any>) =>
  data
    ? ({
        ...data,
        submitCount:
          data.submitCount !== undefined ? Number(data.submitCount) : undefined,
        employeeInfos: Array.isArray(data.employeeInfos)
          ? data.employeeInfos.map((item: unknown) => Number(item))
          : data.employeeInfos,
        workdayType:
          data.workdayType ?? data.workDayWay ?? (data as any).statisticsType,
      } as Questionnaire)
    : (data as Questionnaire);

export const addQuestionnaire = data =>
  request({
    method: 'post',
    url: '/management/question/add',
    data,
  });

export const editQuestionnaire = data =>
  request({
    method: 'post',
    url: '/management/question/edit',
    data,
  });

export const getQuestionnaire = params =>
  request<{ data: Questionnaire }>({
    url: '/management/question/info',
    params,
  }).then(response => ({
    ...response,
    data: {
      ...response.data,
      data: normalizeQuestionnaire(response.data.data),
    },
  }));

export const getWorkdayTotalPreview = params =>
  request<{ data: number }>({
    method: 'get',
    url: '/management/question/workdayTotal',
    params,
  });
