import I18N from '@src/lang/I18N';
import { useQuery } from '@tanstack/react-query';
import { useRequest } from 'ahooks';
import { uniqBy } from 'lodash-es';

import { request } from '@/api/request';
import { changeDicts2Options } from '@/views/utils';

export const useScope = () => {
  const { data = [] } = useQuery({
    queryKey: ['scopeDict'],
    queryFn: () =>
      request<{
        data: {
          value: string;
          name: string;
          classifyList: { value: string; name: string }[];
        }[];
      }>({
        url: '/enterprise/reduce/measure/category/list',
      }).then(resp => resp.data.data),
    cacheTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  return data;
};

export type Dicts = {
  label: string;
  value: string;
  dictLabel: string;
  dictValue: string;
  sourceType: string;
  dictSort: number;
  id: number;
  sourceName: string;
  dictType: string;
  children: Dicts[];
  relatedValue?: string;
  enumList?: Dicts[];
};

export const useUnit = (opt?: { appendDefault?: boolean }) => {
  const { data = [] } = useRequest(
    () =>
      request<{ data: { factorUnitM: Dicts[] } }>({
        url: '/management/system/enum/listALLByDictTypeBatch',
        params: { dictTypes: 'factorUnitM' },
      }).then(async resp => {
        const unitDicts = resp.data.data.factorUnitM;

        let unitOptions = uniqBy(
          unitDicts.map(u => ({
            dictLabel: u.sourceName,
            dictValue: u.sourceType,
            label: u.sourceName,
            value: u.sourceType,
            sourceType: u.sourceType,
            children: (changeDicts2Options(
              unitDicts.filter(d => d.sourceType === u.sourceType),
            ) || []) as Dicts[],
          })),
          'value',
        );

        if (opt?.appendDefault) {
          const recentUnitResp = await request<{
            data: { factorUnitM: Dicts[] };
          }>({
            url: '/management/system/enum/getUnitDefault',
          });
          unitOptions = [
            {
              value: '0',
              dictValue: '0',
              label: I18N.components.inCommonUse,
              dictLabel: I18N.components.inCommonUse,
              sourceType: '0',
              children: recentUnitResp.data.data.factorUnitM.map(u => ({
                ...u,
                label: u.dictLabel,
                value: u.dictValue,
                sourceType: u.sourceType,
              })),
            },
            ...unitOptions,
          ];
        }
        return unitOptions as unknown as Dicts[];
      }),
    {
      cacheKey: 'unitDict',
      refreshDeps: [],
      cacheTime: 1000 * 60 * 60,
    },
  );

  return data;
};

export const useEnum = (dictTypes: string) => {
  const { data = [] } = useRequest(
    () =>
      request<{ data: { [P: string]: Dicts[] } }>({
        url: '/management/system/enum/listALLByDictTypeBatch',
        params: { dictTypes },
      }).then(resp =>
        resp.data.data[dictTypes].map(dict => ({
          ...dict,
          value: dict.dictValue,
          label: dict.dictLabel,
        })),
      ),
    {
      cacheKey: `${dictTypes}-dict`,
      refreshDeps: [],
      cacheTime: 1000 * 60 * 60,
    },
  );

  return data;
};

export const useCountries = (opt?: { appendDefault?: boolean }) => {
  const { data = [] } = useRequest(
    () =>
      request<{ data: { contryList: { groupName: string; data: Dicts[] }[] } }>(
        {
          url: '/management/system/enum/getCountriesData',
        },
      ).then(async resp => {
        let countries = (resp.data.data.contryList || []).map(countryGroup => ({
          value: countryGroup.groupName,
          label: countryGroup.groupName,
          dictValue: countryGroup.groupName,
          dictLabel: countryGroup.groupName,
          sourceType: countryGroup.groupName,
          children: countryGroup.data,
        }));

        if (opt?.appendDefault) {
          const recentResp = await request<{
            data: { reportCountries: Dicts[] };
          }>({
            url: '/management/system/enum/getCountriesDefault',
          });

          countries = [
            {
              value: '0',
              dictValue: '0',
              label: I18N.components.inCommonUse,
              dictLabel: I18N.components.inCommonUse,
              sourceType: '0',
              children: recentResp.data.data.reportCountries,
            },
            ...countries,
          ];
        }
        return countries as unknown as Dicts[];
      }),
    {
      cacheKey: 'countries',
      refreshDeps: [],
      cacheTime: 1000 * 60 * 60,
    },
  );

  return data;
};

type GHGOption = {
  id: string;
  name: string;
  value: string;
  text: string;
  label: string;
  children: GHGOption[];
};

export const useGHGList = () => {
  const transformOptions = (options: GHGOption[]) =>
    options.map(option => ({
      ...option,
      value: option.id,
      label: option.name,
      text: option.name,
      children: option.children ? transformOptions(option.children) : undefined,
    }));

  const { data = [] as GHGOption[] } = useRequest(
    () =>
      request<{
        data: GHGOption[];
      }>({
        url: '/enterprise/category/list/category',
      }).then(resp => transformOptions(resp.data.data)),
    { cacheKey: 'ghgList', refreshDeps: [], cacheTime: 1000 * 60 * 60 },
  );

  return data;
};

export const useCompanyUsers = (params?: {
  searchName?: string;
  orgId?: string;
  returnEmpty?: boolean;
}) => {
  const { searchName, orgId, returnEmpty } = params || {};
  const {
    data = [] as {
      userId: number;
      employName: string;
      employEmail: string;
      employPhone: string;
    }[],
  } = useRequest(
    () =>
      !returnEmpty
        ? request<{
            data: {
              userId: number;
              employName: string;
              employEmail: string;
              employPhone: string;
            }[];
          }>({
            url: '/management/companyOrg/getUserListByCompanyId',
            params,
          }).then(resp => resp.data.data)
        : Promise.resolve([]),
    {
      cacheKey: 'companyUser',
      refreshDeps: [orgId, searchName, returnEmpty],
      cacheTime: 1000 * 60 * 60,
    },
  );

  return data;
};
