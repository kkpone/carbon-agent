/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-05 15:31:45
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-01-11 09:39:02
 */

import { LocaleType } from '@/lang/I18N';
import { stripLocalePrefixFromPathname } from '@/router/localePath';
import { RouteMapsCorbonFootprint3 } from '@/router/route-paths/corbonFootprint3';
import { Field } from '@formily/core';
import { request } from '@src/api/request';
import { changeDicts2Options } from '@src/views/utils';
import { uniqBy } from 'lodash-es';

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
  children?: Dicts[];
  relatedValue?: string;
  enumList?: Dicts[];
};

const useFieldUnitDictSource = (dictTypes: string) => async (field: Field) => {
  try {
    field.setState({ loading: true });

    const addParams: {
      [key: string]: string;
    } = {};

    if (
      stripLocalePrefixFromPathname(document.location.pathname) ===
      RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountShareLogin
    ) {
      const paramsString = document.location.search;
      const searchParams = new URLSearchParams(paramsString);
      const lang = searchParams.get('lang');

      if (lang === LocaleType.enUS) {
        addParams.lang = 'en';
      }
      if (lang === LocaleType.zhCN) {
        addParams.lang = 'zh';
      }
    }

    const { data } = await request<{ data: { factorUnitM: Dicts[] } }>({
      url: `/management/system/enum/listALLByDictTypeBatch`,
      method: 'GET',
      params: { dictTypes, ...addParams },
      debounced: true,
    });

    const unitDicts = data.data[dictTypes] as Dicts[];

    const unitOptions: Dicts[] = uniqBy(
      unitDicts.map(u => ({
        ...u,
        label: u.sourceName,
        value: u.sourceType,
        sourceType: u.sourceType,
        children: changeDicts2Options(
          unitDicts.filter(d => d.sourceType === u.sourceType),
        ) as Dicts[] | undefined,
      })),
      'value',
    );

    if (dictTypes === 'factorUnitM') {
      localStorage.setItem('FactorUnitDict', JSON.stringify(unitDicts));
      localStorage.setItem(
        'FactorUnitOptionsDict',
        JSON.stringify(unitOptions),
      );
    }

    field.setDataSource(unitOptions);
  } catch (e) {
    field.setState({ loading: false });
  } finally {
    field.setState({ loading: false });
  }
};

export default useFieldUnitDictSource;
