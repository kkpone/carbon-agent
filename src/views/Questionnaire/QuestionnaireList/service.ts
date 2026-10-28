import { request } from '@/api/request';

import { Questionnaire } from '../type';

export const getQuestionnaireList = params =>
  request<{ data: { rows: Questionnaire[]; total: number } }>({
    url: '/management/question/list',
    params,
  });

export const publishQuestionnaire = data =>
  request({
    method: 'post',
    url: '/management/question/updateStatus',
    data,
  });
