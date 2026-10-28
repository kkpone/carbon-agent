import I18N from '@src/lang/I18N';
import { useQuery } from '@tanstack/react-query';
import { useSessionStorageState } from 'ahooks';
import { Spin } from 'antd';
import { isUndefined } from 'lodash-es';
import { FC, useMemo, useState } from 'react';

import { EmissionsChart, dataType } from './components/EmissionsChart';
import { InfoDetail } from './components/InfoDetail';
import { MultiSelect } from './components/MultiSelect';
import styles from './index.module.less';
import { EBenchMarkDataType, GetIndustryDataOverview } from './service';

export interface IIndustryBenchmarkingProps {}

export const IndustryBenchmarking: FC<IIndustryBenchmarkingProps> = () => {
  const [industry, setIndustry] = useSessionStorageState<
    { label: string; value: string; year?: number }[]
  >('IndustryBenchmarking', {
    defaultValue: [],
  });

  const [companyYear, setCompanyYear] = useState<string>();

  const [benchMarkYear, setBenchMarkYear] = useState<string>();

  const [benchMarkItem, setBenchMarkItem] = useState<'avg' | 'median'>('avg');

  const [unitType, setUnitType] = useState<string>(dataType.amount);

  const { data, isLoading } = useQuery(
    ['overview', industry, unitType, companyYear, benchMarkYear],
    async () =>
      GetIndustryDataOverview({
        benchMarkType: benchMarkItem === 'avg' ? '1' : '2',
        dataType: unitType,
        companyYear,
        benchMarkYear,
        industryList: industry.map(item => ({
          industryId: Number(item.value),
          year: item.year,
        })),
      }),
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  const benchMarkDetailComparison = useMemo(
    () => data?.data.data.benchMarkDetailComparison,
    [data],
  );

  const chartValue = useMemo(() => {
    const yAxis: string[] = [];
    const scopeOne: number[] = [];
    const scopeTwo: number[] = [];
    const scopeThree: number[] = [];
    const isAvg = benchMarkItem === 'avg';
    data?.data.data.emissionsComparison?.forEach(item => {
      if (item.benchMarkDataType === '1' && !isAvg) {
        yAxis.unshift(I18N.enterpriseCarbonAccount2.industryMedian3);
        scopeOne.unshift(item.scope1EmissionsMedian);
        scopeTwo.unshift(Number(item.scope2EmissionsMedian));
        scopeThree.unshift(Number(item.scope3EmissionsMedian));
      } else {
        yAxis.unshift(item.benchMarkName);
        scopeOne.unshift(item.scope1EmissionsAvg);
        scopeTwo.unshift(Number(item.scope2EmissionsAvg));
        scopeThree.unshift(Number(item.scope3EmissionsAvg));
      }
    });
    return {
      yAxis,
      scopeOne,
      scopeTwo,
      scopeThree,
    };
  }, [data?.data.data.emissionsComparison, benchMarkItem]);

  const updateYear = (value: {
    benchMarkYear: string;
    benchMarkDataType: string;
    industryId: string;
    targetYear: string;
    index?: number;
  }) => {
    if (value.benchMarkDataType === EBenchMarkDataType.BenchMark) {
      setBenchMarkYear(value.targetYear);
    } else if (value.benchMarkDataType === EBenchMarkDataType.Company) {
      setCompanyYear(value.targetYear);
    } else if (!isUndefined(value.index)) {
      setIndustry(pre => {
        const targetIndex = (value?.index || 1) - 1;
        const clonePre = [...pre];
        clonePre[targetIndex].year = Number(value.targetYear);
        return clonePre;
      });
    }
  };

  return (
    <div className={styles.wrapper}>
      <Spin spinning={isLoading}>
        <div className={styles.header}>
          <div className={styles.title}>
            {I18N.carbonFootprint.industryBenchmarking}
          </div>
          <div className={styles.subTitle}>
            {data?.data.data.industryName
              ? I18N.template(I18N.enterpriseCarbonAccount2.datad, {
                  val1: data?.data.data.industryName,
                })
              : ''}
          </div>
        </div>
        <MultiSelect value={industry} onChange={setIndustry} />
        <EmissionsChart
          value={unitType}
          setValue={setUnitType}
          chartValue={chartValue}
        />
        <InfoDetail
          benchMarkDetailComparison={benchMarkDetailComparison}
          benchMarkItem={benchMarkItem}
          setBenchMarkItem={setBenchMarkItem}
          updateYear={updateYear}
          unitType={unitType}
        />
      </Spin>
    </div>
  );
};

export default IndustryBenchmarking;
