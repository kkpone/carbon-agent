import I18N from '@src/lang/I18N';
import { SearchTableProps } from '@src/components/SearchTable';
import { Options } from '@src/typings/utils';
import { SearchFormProps } from '@src/views/components/SearchForm';
import { useRef } from 'react';
import style from '../index.module.less';

// 搜索因子字段
export const searchItems = (
  searchOptionData: Options,
  getForm: SearchFormProps<any>['getForm'],
): SearchTableProps<any, any>['search'] => ({
  formList: [
    {
      type: 'Input',
      name: 'name',
      label: I18N.carbonFootprint3.emissionFactorName,
      rules: [{ required: true }],
    },
    {
      type: 'Input',
      name: 'description',
      label: I18N.carbonFootprint.scenarioDescription,
    },
    {
      type: 'Select',
      name: 'business',
      label: I18N.carbonFootprint.applicableIndustries,
      className: style.select,
      searchOptionData,
    },
  ],
  getForm,
  className: style.searchForm,
});

type QueryKeyParams = {
  queryKey?: string;
} & Record<string, any>;
/**
 * @description 保存上搜索的关键字，判断是否复用 queryKey
 */
export const useCacheQueryKey = (params?: QueryKeyParams) => {
  const cacheRef = useRef<QueryKeyParams>(params || {});
  const getCacheKey = (p: QueryKeyParams): string => {
    if (
      !p ||
      Object.entries(cacheRef.current).length - 1 !== Object.keys(p).length ||
      Object.entries(cacheRef.current)?.some(
        ([k, v]) => k !== 'queryKey' && v !== p[k],
      )
    ) {
      cacheRef.current = { ...cacheRef.current, ...p };
      return '';
    }
    cacheRef.current = { ...cacheRef.current, ...p };
    return cacheRef.current.queryKey || '';
  };
  const setQueryKey = (p2: QueryKeyParams) => {
    cacheRef.current = { ...cacheRef.current, ...p2 };
  };
  return [getCacheKey, setQueryKey] as const;
};
