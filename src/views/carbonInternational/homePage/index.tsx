/**
 * @file 国际版碳盘查 首页
 */
import I18N from '@src/lang/I18N';
import './homePage.less';
import { Divider, Select, Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import IconFont from '@components/iconfont';
// @ts-ignore
import { getAlldata, getHomePageOption } from '@api/carbon-international';
import { useDispatch, useSelector } from 'react-redux';
import { CHANGE_ORGANIZATION } from '@store/actionTypes';
import { combineClassName } from '@utils/index';
import {
  CarbonEmissionInfoIndex,
  HomePageOptionResponse,
} from '@api/carbon-international/types';
import { uniqBy } from 'lodash-es';
import { twoDecimal } from '../organizationalManagement/utils';
import PathMapChart from './pathmapchart';
import PathPieChart from './pathpiechart';
import rise from '../../../assets/icon/sy/rise.png';
import decline from '../../../assets/icon/sy/decline.svg';
import styles from './homePage.module.less';

const CarbonInternationalHomePage = () => {
  const title = I18N.Certification.reportSubject;
  const [isLoading, setIsLoading] = useState(false);
  const [organizationOption, setOrganizationOption] = useState<
    HomePageOptionResponse[]
  >([]);
  const [selectOptions, setSelectOptions] = useState<
    Omit<CarbonEmissionInfoIndex, 'edition_status'>
  >({
    version_num: '',
    edition: '',
    year: '',
    organization_info_name: '',
  });
  const [checkedYearId, setCheckedYearId] = useState('');
  const defaultData = {
    emissions_load_sum: '',
    emission_reductions_sum: '',
    comparison_emission_reductions_sum: null,
    comparison_emissions_load_sums: null,
    emissions_category_sum: [],
    data: [],
  };
  const [chartData, setchartData] = useState({ ...defaultData });

  const selector = useSelector(
    (state: any) => state.carbonInternational,
  ) as CarbonEmissionInfoIndex;
  const dispatch = useDispatch();

  // 选择组织 -> 渲染默认数据
  const changeOrganizationoption = async (
    value: string,
    organizitions?: HomePageOptionResponse[],
    selectOptions?: Omit<CarbonEmissionInfoIndex, 'edition_status'>,
  ) => {
    const organization = organizitions || organizationOption;
    const infos = organization.find(
      ({ organization_name }) => organization_name === value,
    )?.carbon_emission_info_list;
    const baseConfig =
      selectOptions ??
      ({
        organization_info_name: value,
        year: infos?.[0]?.year,
        edition: String(infos?.[0]?.edition || ''),
        version_num: infos?.[0]?.version_num,
      } as CarbonEmissionInfoIndex);
    setSelectOptions(baseConfig);
    const yearId = infos?.find(
      it =>
        it.year === baseConfig.year &&
        it.version_num === baseConfig.version_num,
    )?.id;
    setCheckedYearId(String(yearId || ''));
    if (
      baseConfig.organization_info_name &&
      baseConfig.edition &&
      baseConfig.year
    ) {
      await getData(baseConfig);
    }
  };
  // 页面初始化赋值
  const getTable = async () => {
    await getHomePageOption().then(async ({ data }) => {
      if (data?.data?.length > 0) {
        const r = data.data;
        setOrganizationOption(r);
        if (
          selector?.organization_info_name &&
          selector?.version_num &&
          selector?.year &&
          selector?.edition &&
          r?.some(
            ({ organization_name }) =>
              organization_name === selector?.organization_info_name,
          )
        ) {
          await changeOrganizationoption(selector.organization_info_name, r, {
            ...selector,
          });
        } else {
          const firstMsg = r?.[0];
          if (firstMsg) {
            setOrganizationOption(r);
            await changeOrganizationoption(firstMsg?.organization_name, r);
          }
        }
      } else {
        setOrganizationOption([]);
      }
    });
  };
  useEffect(() => {
    getTable();
  }, []);
  // 获取页面全部数据
  const getData = async ({
    version_num,
    year,
    organization_info_name,
    edition,
  }: CarbonEmissionInfoIndex) => {
    if (version_num && year && organization_info_name && edition) {
      setIsLoading(true);
      await getAlldata({
        version_num,
        year,
        organization_info_name,
        edition,
      })
        .then(({ data }) => {
          dispatch({
            type: CHANGE_ORGANIZATION,
            payload: {
              version_num,
              edition,
              year,
              organization_info_name,
            } as CarbonEmissionInfoIndex,
          });
          if (data?.data?.[0]) {
            setchartData(data.data[0]);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };
  const computedOrganitionSubs = useMemo(
    () =>
      organizationOption?.find(
        ({ organization_name }) =>
          organization_name === selectOptions.organization_info_name,
      )?.carbon_emission_info_list || [],
    [selectOptions?.organization_info_name],
  );

  const changeEditions = async (val: string) => {
    const infos = computedOrganitionSubs.find(
      ({ edition }) => String(edition) === val,
    );
    const baseSelect = {
      ...selectOptions,
      edition: val,
      year: infos?.year,
      version_num: infos?.version_num,
    } as CarbonEmissionInfoIndex;
    setSelectOptions(baseSelect);
    setCheckedYearId(String(infos?.id || ''));
    await getData(baseSelect);
  };

  type YearOptions = {
    value: string;
    label: string;
    version: string;
    year: string;
  };
  const changeYearoption = (value: string, options: YearOptions) => {
    const baseOptions = {
      ...selectOptions,
      year: options?.year,
      version_num: options.version,
    } as CarbonEmissionInfoIndex;
    setSelectOptions(baseOptions);
    setCheckedYearId(value);
    getData(baseOptions);
  };

  // 组织选项
  const [organizationSelectOptions, selectedOption] = useMemo(() => {
    const organizations = organizationOption?.map(it => ({
      value: it.organization_name,
      label: it.organization_name,
      key: it.id,
    }));
    const selected = organizations?.find(
      ({ value }) => value === selectOptions?.organization_info_name,
    )?.value;
    return [organizations, selected];
  }, [organizationOption, selectOptions?.organization_info_name]);

  // 标准文件
  const [editionOptions, checkedEdition] = useMemo(() => {
    const editions = uniqBy(
      computedOrganitionSubs.map(({ edition, edition_status }) => ({
        label: edition_status,
        value: `${edition}`,
      })),
      'value',
    );
    const selected = editions.find(
      ({ value }) => value === selectOptions?.edition,
    )?.value;
    return [editions, selected];
  }, [computedOrganitionSubs, selectOptions?.edition]);

  // 报告选项
  const [versionOptions, selectedVersion] = useMemo(() => {
    const versions = computedOrganitionSubs
      ?.filter(it => selectOptions?.edition === `${it.edition}`)
      ?.map(item => ({
        value: String(item.id),
        version: item.version_num,
        year: item.year,
        label: `${item.year} V${item.version_num}`,
      }));
    const selected = versions?.find(
      ({ value }) => value === checkedYearId,
    )?.value;
    return [versions, selected];
  }, [checkedYearId, computedOrganitionSubs]);

  const topSelect = [
    {
      placeholder: I18N.template(I18N.carbonInternational.pleaseSelectTi, { val1: title }),
      onChange: (val: string) => changeOrganizationoption(val),
      value: selectedOption,
      options: organizationSelectOptions,
    },
    {
      placeholder: I18N.carbonInternational.pleaseSelectTheStandard,
      onChange: changeEditions,
      value: checkedEdition,
      options: editionOptions,
    },
    {
      placeholder: I18N.carbonInternational.pleaseSelectSpecific,
      onChange: (val: string, options: YearOptions) =>
        changeYearoption(val, options),
      value: selectedVersion,
      options: versionOptions,
    },
  ];
  // 如果没有选择版本，清空数据
  useEffect(() => {
    if (!selectOptions.version_num) {
      setchartData({ ...defaultData });
    }
  }, [selectOptions.version_num]);

  return isLoading ? (
    <Spin />
  ) : (
    <div
      className={combineClassName(
        'homepage_content',
        styles.carbonInternationalHomePage,
      )}
    >
      <div className={styles.homepage_header}>
        <div className={styles.homepage_title}>{I18N.DomesticVersion.carbonEmissionData}</div>
        <div className={styles.topSelect}>
          {topSelect.map(item => (
            <div className={styles.topSelectItem}>
              <Select
                showSearch
                placeholder={item.placeholder}
                // @ts-ignore
                onChange={item.onChange}
                optionFilterProp='children'
                value={item.value}
                filterOption={(input, option) =>
                  !!(option?.label as string | undefined)
                    ?.toLowerCase()
                    ?.includes(input)
                }
                // @ts-ignore
                options={item.options}
              />
            </div>
          ))}
        </div>
      </div>
      <div
        className={combineClassName(
          styles.mainContentWrapper,
          'homepage_overview',
        )}
      >
        <div className='data_exhibition'>
          <div className='homepage_card'>
            <div className='bg-white card_details'>
              <div className='loop'>
                <div className='card_title'>
                  {I18N.DomesticVersion.totalCarbonEmissions}<span className='kgSpan'>(tCO₂e)</span>
                </div>
                <div className='card_num'>
                  {parseFloat(
                    Number(chartData?.emissions_load_sum).toFixed(2),
                  ) || '-'}
                </div>
                <IconFont type='icon-icon-mukuai1' />
                <Divider />
                <div className='detailstage'>
                  <span>{I18N.carbonInternational.comparedToAssociation}</span>
                  {chartData.comparison_emissions_load_sums === null ? (
                    <span>-</span>
                  ) : (
                    <span>
                      {`${twoDecimal(
                        chartData?.comparison_emissions_load_sums,
                      )}%`}
                      {Number(chartData?.comparison_emissions_load_sums) > 0 ? (
                        <img src={decline} alt='' />
                      ) : (
                        <img src={rise} alt='' />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className='bg-white card_details'>
              <div className='loop'>
                <div className='card_title'>
                  {I18N.enterpriseCarbonAccount2.reducedDisplacement}<span className='kgSpan'>(tCO₂e)</span>
                </div>
                <div className='card_num'>
                  {parseFloat(
                    Number(chartData?.emission_reductions_sum).toFixed(2),
                  ) || '-'}
                </div>
                <IconFont type='icon-icon-mukuai2' />
                <Divider />
                <div className='detailstage'>
                  <span>{I18N.carbonproduct.comparedToTheBenchmark}</span>
                  {chartData.comparison_emission_reductions_sum === '-' ||
                  !chartData.comparison_emission_reductions_sum ? (
                    <span>-</span>
                  ) : (
                    <span>
                      {`${twoDecimal(
                        chartData?.comparison_emission_reductions_sum,
                      )}%`}
                      {Number(chartData?.comparison_emission_reductions_sum) >
                      0 ? (
                        <img src={decline} alt='' />
                      ) : (
                        <img src={rise} alt='' />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* 图表 */}
          <div className={styles.pieChart}>
            <p>{I18N.carbonInternational.emissionCategoriesDetailed}</p>
            {/* @ts-ignore */}
            <PathPieChart data={chartData?.emissions_category_sum} />
          </div>
        </div>
        <div className={styles.chart_exhibition}>
          <p>{I18N.enterpriseCarbonAccount2.greenhouseGasProduction}</p>
          {/* @ts-ignore */}
          {chartData?.data?.length > 0 && chartData?.emissions_load_sum > 0 ? (
            <PathMapChart datas={chartData?.data} />
          ) : (
            <div className={styles.chartWrapper}>{I18N.enterpriseCarbonAccount2.thereIsCurrentlyNoDataExhibitionAvailable}</div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CarbonInternationalHomePage;
