/**
 * @file 碳数据 api
 */

import { request } from '../request';
import { JavaPageResponse } from '../types';
import { ListForBusiness } from './types';

export const getExecuteTargets = () =>
  request<JavaPageResponse<ListForBusiness>>({
    url: 'data/execute/listForBusiness',
  });
