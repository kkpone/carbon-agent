/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-05 16:53:20
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-16 21:47:59
 */
import { SerachCarbonFactorResult } from '@src/components/SearchFactor/type';
// import { SourceLabel } from '@src/sdks_v2/enterpriseV2ApiDocs';
import { CO2E } from '@src/views/carbonInternational/organizationalManagement/utils';
import { Dicts } from '@src/views/emission/Show/type';

import { DictSource, ManualFactorData } from '../types';

/** 系统因子数据转换 */
export const convertApi2Factor = (
  data: DictSource,
  factorUnitM: Dicts[],
  factorUnitZ: Dicts[],
): SerachCarbonFactorResult | undefined => {
  if (!data) return undefined;

  const co2eRow = data.gasList?.find(r => r.type === 'g12' || r.type === 'g9');

  return {
    ...data,
    name: data.factorName || '',
    factorType: data.factorScore || '',
    sourceLevel: data.factorSource || '',
    year: data.factorPublic || '',
    cValue: co2eRow?.factorValue || '',
    id: data.factorId || '',
    unit: `${
      factorUnitZ.find(d => d.dictValue === data?.factorUnit)?.dictLabel || ''
    }/${
      factorUnitM.find(
        d => d.dictValue === co2eRow?.factorUnitM?.split(',')?.[1],
      )?.dictLabel || ''
    }`,
  } as unknown as SerachCarbonFactorResult;
};

/** 手动输入因子数据转换 */
export const convertApi2ManaulFactor = (
  data: DictSource,
  factorUnitM: Dicts[],
  factorUnitZ: Dicts[],
  // source?: SourceLabel[],
): ManualFactorData | undefined => {
  if (!data) return undefined;
  const co2eRow = data.gasList?.find(r =>
    r.greenhouseGasesType?.includes(CO2E),
  );

  return {
    ...data,
    ...co2eRow,
    name: data.factorName || '',
    year: data.factorPublic || '',
    factorUnitM: co2eRow?.factorUnitM?.split(','),
    factorSource: String(data?.factorSource || ''),
    // factorSourceName:
    //   source?.find(s => String(s.sourceLabelId) === data.factorSource)
    //     ?.labelname || '',
    // factorSourceName: source?.[0]?.labelname || '',
    factorUnitName: `${
      factorUnitZ.find(d => d.dictValue === co2eRow?.factorUnit)?.dictLabel ||
      ''
    }/${
      factorUnitM.find(
        d => d.dictValue === co2eRow?.factorUnitM?.split(',')?.[1],
      )?.dictLabel || ''
    }`,
  } as unknown as ManualFactorData;
};
