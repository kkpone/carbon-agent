/**
 * @file 搜索因子
 */
import { CaretDownOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { modelMaterialsqueryFactor } from '@src/api/api';
import { SerachCarbonFactor } from '@src/api/foot-print';
import {
  PlasticSearchFactor,
  SerachCarbonFactorResult,
} from '@src/api/foot-print/api-types';
import {
  AddFactorModal,
  ShowType,
} from '@src/components/Factor/AddFactorModal';
import { ProductType } from '@src/components/Factor/utils';
import { FormActions } from '@src/components/FormActions';
import { SearchTable, SearchTableRef } from '@src/components/SearchTable';
import I18N from '@src/lang/I18N';
import { RootState } from '@src/store';
import { Options } from '@src/typings/utils';
import { redirectFn } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { COMPANY_ID } from '@src/utils/consts';
import VerifyUtils from '@src/utils/verifty';
import {
  factorPublishYear,
  setFactorSearchResult,
} from '@src/views/carbonproduct/lifecomponents/utils';
import { EmissionCategory } from '@src/views/carbonproduct/utils/types';
import { FactorUse, searchFactorColumns } from '@src/views/utils';
import {
  Button,
  Checkbox,
  Divider,
  Dropdown,
  Form,
  FormInstance,
  Menu,
  Select,
} from 'antd';
import { useForm } from 'antd/es/form/Form';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import style from './index.module.less';
import { searchItems, useCacheQueryKey } from './utils';
import { apiMnumListALLByDictTypeBatch } from '../Show/service';
import {
  apiCompanyAddCollect,
  apiCompanyRemove,
} from '../organization/service';
import { EmissionFactorType } from '../utils/constant';

/**
 * @description 转换标题字段
 */
export const changeFactorDataIndex: Record<string, string> = {
  因子名称: 'name',
  年份: 'year',
  排放因子: 'cValue',
  单位: 'unit',
  发布机构: 'institution',
  国家: 'countries',
  场景描述: 'description',
};

const changeFactorSource: Record<string, string> = {
  [EmissionCategory.carbonstop]: '1',
  [EmissionCategory.my]: '2',
  '1': EmissionCategory.carbonstop,
  '2': EmissionCategory.my,
};

type MoreSearchParams = {
  source: EmissionCategory[];
  year?: string;
  country?: string;
};
const allCountries = I18N.emission.allRegions;
const allYear = I18N.emission.allYears;
const defaultTopFormValues = {
  source: [EmissionCategory.carbonstop, EmissionCategory.my],
  year: allYear,
  country: allCountries,
};

const SearchFactors = () => {
  const history = useHistory();
  const [addFactorModalVisible, setAddFactorModalVisible] =
    useState<ShowType>();
  const tableRef = useRef<SearchTableRef<any>>();
  const areaSelectOpt = { value: '', label: allCountries };
  const [areaOptions, setAreaOptions] = useState<Options>([areaSelectOpt]);
  // 国家、来源、年份
  const [moreSearchParams, setMoreSearchParams] =
    useState<MoreSearchParams>(defaultTopFormValues);
  const params = useParams<{ productType: string }>();
  const productType = Number(params?.productType) as unknown as ProductType;
  // 行业选择
  const [industry, setIndustry] = useState<Options>([]);
  const [selectRows, setSelectRows] = useState<Record<any, any>>([]);

  const selector = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );

  const searchParams = new URLSearchParams(window.location.search);
  const searchRef = useRef<FormInstance<any>>();
  const [extraSearchForm] = useForm();

  // 设置搜索带过来的参数
  useEffect(() => {
    const searchVal = searchParams.get('searchVal');
    if (searchVal) {
      searchRef.current?.setFieldsValue({ name: searchVal });
    }

    const country = searchParams.get('country') || allCountries;
    const year = searchParams.get('year') || allYear;
    const moreSearchVal = {
      country,
      year,
    };
    extraSearchForm.setFieldsValue(moreSearchVal);
    setMoreSearchParams({ ...moreSearchParams, ...moreSearchVal });

    setTimeout(() => {
      tableRef.current?.reload();
    }, 200);
  }, []);
  const [getQueryKey, setQueryKey] = useCacheQueryKey();
  useEffect(() => {
    // 字典项获取
    apiMnumListALLByDictTypeBatch({
      dictTypes: 'reportCountries,business',
    }).then(({ data }) => {
      const areas = data?.data?.reportCountries || [];
      setAreaOptions([
        areaSelectOpt,
        ...areas.map(t => ({ value: t.dictValue, label: t.dictLabel })),
      ]);
      setIndustry(
        data?.data?.business?.map(t => ({
          label: t.dictLabel,
          value: t.dictValue,
        })),
      );
    });
  }, []);
  useEffect(() => {
    extraSearchForm.validateFields().then(() => {
      tableRef.current?.setPage({ current: 1, pageSize: 10, total: 0 });
      tableRef.current?.reload();
    });
  }, [moreSearchParams]);

  const changeCollect = (factorId: string) =>
    apiCompanyAddCollect({
      factorId,
      companyId: Number(localStorage.getItem(COMPANY_ID)) || 0,
    }).then(({ data }) => {
      tableRef.current?.reload();
      VerifyUtils.Toast(data.code as 200, data.msg);
    });

  return (
    <div className={style.wrapper}>
      <SearchTable
        ref={tableRef}
        tableTopNode={
          <Form
            form={extraSearchForm}
            className={style.tableTop}
            initialValues={moreSearchParams}
            onValuesChange={(c, values) => {
              setMoreSearchParams(s => ({ ...s, ...values }));
            }}
          >
            <Divider className={style.divider} />
            <div className={style.source}>
              <Form.Item
                name='source'
                label={I18N.emission.source}
                aria-label='source'
                rules={[
                  {
                    required: true,
                    message: I18N.emission.pleaseSelectTheSource,
                  },
                ]}
              >
                <Checkbox.Group>
                  <Checkbox value={EmissionCategory.carbonstop}>
                    {I18N.emission.carbonHindranceData}
                  </Checkbox>
                  <Checkbox value={EmissionCategory.my}>
                    {I18N.emission.organizationalDatabase}
                  </Checkbox>
                </Checkbox.Group>
              </Form.Item>
              <Button
                type='default'
                aria-label='add-factor'
                onClick={() => {
                  setAddFactorModalVisible({ type: 'add' });
                }}
              >
                <PlusCircleOutlined />
                {I18N.emission.addOrganizationalArrangement}
              </Button>
            </div>
            <div className={style.moreSearch}>
              <Form.Item
                label={I18N.carbonFootprint.publishingCountryGroups}
                name='country'
              >
                <Select
                  allowClear
                  aria-label='country'
                  placeholder={I18N.carbonFootprint.pleaseSelect}
                  options={areaOptions}
                />
              </Form.Item>
              <Form.Item label={I18N.carbonFootprint.year} name='year'>
                <Select
                  aria-label='year'
                  placeholder={I18N.carbonFootprint.pleaseSelect}
                  options={[
                    { label: allYear, value: '' },
                    ...factorPublishYear().map(y => ({
                      label: y,
                      value: y,
                    })),
                  ]}
                />
              </Form.Item>
            </div>
          </Form>
        }
        tableProps={{
          pagination: {},
          rowKey: 'id',
          rowSelection: {
            fixed: true,
            type: 'radio',
            onChange: (s, rows) => {
              setSelectRows(rows);
            },
          },
          getDateSource: async ({ setDataSource, search, page, setTotal }) => {
            extraSearchForm.validateFields().then(moreSearches => {
              const { source } = moreSearches;
              // eslint-disable-next-line consistent-return
              searchRef.current?.validateFields().then(() => {
                if (!source.length)
                  return Toast('error', I18N.emission.pleaseSelectAFactor2);
                const name =
                  search?.name || searchRef.current?.getFieldValue('name');

                const year =
                  (moreSearches.year === allYear ? '' : moreSearches.year) ||
                  '';
                const country =
                  (moreSearches.country === allCountries
                    ? ''
                    : moreSearches.country) || '';
                if (productType === ProductType.footprint) {
                  const searchSource = source.length === 1 ? source[0] : 'all';
                  SerachCarbonFactor({
                    year,
                    country,
                    search_type: searchSource,
                    page: page.current,
                    page_size: page.pageSize,
                    search: name,
                    ...search,
                    queryKey: getQueryKey({
                      ...search,
                      year: moreSearches.year,
                      countries: moreSearches.country,
                      source: searchSource,
                      name,
                    }),
                  }).then(({ data }) => {
                    setDataSource(data?.results);
                    setTotal(data?.count || 0);
                    setQueryKey({ queryKey: data?.queryKey });
                  });
                } else {
                  const hrefSearch = new URLSearchParams(
                    window.location.search,
                  );
                  const factorType =
                    source.length > 1 ? '3' : changeFactorSource[source[0]];
                  modelMaterialsqueryFactor({
                    productId: hrefSearch.get('productId') as string,
                    companyId: selector.userInfo.companyId,
                    pageNum: page.current,
                    pageSize: page.pageSize,
                    year,
                    countries: country,
                    name,
                    factorType,
                    ...search,
                    queryKey: getQueryKey({
                      ...search,
                      year: moreSearches.year,
                      countries: moreSearches.country,
                      source: factorType,
                      name,
                    }),
                  }).then(({ data }) => {
                    const r = data?.data;
                    setTotal(r?.total);
                    setDataSource(r?.rows);
                    setQueryKey({ queryKey: r.queryKey });
                  });
                }
              });
            });
          },
          isUseIndex: true,
          columns: [
            // @ts-ignore
            ...(productType === ProductType.footprint
              ? searchFactorColumns<SerachCarbonFactorResult>()
              : searchFactorColumns<SerachCarbonFactorResult>().map(c => ({
                  ...c,
                  dataIndex: changeFactorDataIndex[c.title as string],
                }))),
            {
              title: I18N.carbonFootprint.operation,
              width: 160,
              dataIndex: 'actions',
              // @ts-ignore
              render(
                text: string,
                record: SerachCarbonFactorResult,
                index: number,
              ) {
                return (
                  <>
                    {record.factorType === EmissionFactorType.number && (
                      <Button
                        aria-label={`table-detail-${index}`}
                        type='link'
                        onClick={() => {
                          setAddFactorModalVisible({
                            id: record.id,
                            type: 'show',
                            factorType:
                              record.factorUse === '1'
                                ? FactorUse.organization
                                : FactorUse.carbonstop,
                          });
                        }}
                      >
                        {I18N.carbonFootprint3.details}
                      </Button>
                    )}
                    <Dropdown
                      className={classNames({
                        [style.noDetail]:
                          record.factorType !== EmissionFactorType.number,
                      })}
                      aria-label={`table-action-more-${index}`}
                      overlay={
                        <Menu>
                          {
                            // 0 未收藏 1 已收藏
                            record?.isCollectFactor === '0' &&
                              // 1 自有因子 2 收藏因子 3 碳因子
                              record?.factorUse === '3' && (
                                <Menu.Item
                                  aria-label={`table-action-more-Collection-${index}`}
                                  onClick={() => {
                                    changeCollect(record.id);
                                  }}
                                >
                                  {I18N.carbonFootprint.collection}
                                </Menu.Item>
                              )
                          }
                          {
                            // 0 未收藏 1 已收藏
                            (record?.isCollectFactor === '1' ||
                              // 1 自有因子 2 收藏因子 3 碳因子
                              record?.factorUse === '2') && (
                              <Menu.Item
                                aria-label={`table-action-more-cancelCollection-${index}`}
                                onClick={() => {
                                  changeCollect(record.id);
                                }}
                              >
                                {I18N.carbonFootprint.cancelFavorite}
                              </Menu.Item>
                            )
                          }
                          {record?.factorUse === '1' && (
                            <>
                              {record.factorType ===
                                EmissionFactorType.number && (
                                <Menu.Item
                                  aria-label={`table-action-more-edit-${index}`}
                                  onClick={() => {
                                    setAddFactorModalVisible({
                                      id: record.id,
                                      type: 'edit',
                                      factorType:
                                        record.factorUse === '1'
                                          ? FactorUse.organization
                                          : FactorUse.carbonstop,
                                    });
                                  }}
                                >
                                  {I18N.carbonFootprint.edit}
                                </Menu.Item>
                              )}
                              <Menu.Item
                                aria-label={`table-action-more-delete-${index}`}
                                onClick={() => {
                                  apiCompanyRemove({
                                    id: record.id,
                                  }).then(({ data }) => {
                                    if (data.code === 200) {
                                      setQueryKey({ queryKey: '' });
                                      tableRef.current?.reload();
                                      Toast(
                                        'success',
                                        I18N.carbonFootprint.deleteSuccessful,
                                      );
                                    }
                                  });
                                }}
                              >
                                {I18N.carbonFootprint.delete}
                              </Menu.Item>
                            </>
                          )}
                        </Menu>
                      }
                    >
                      {/*  eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                      <a href='#'>
                        {I18N.Certification.more}
                        <CaretDownOutlined />
                      </a>
                    </Dropdown>
                  </>
                );
              },
            },
          ],
        }}
        search={searchItems(industry, () => f => {
          searchRef.current = f;
        })}
      />
      <FormActions
        buttons={[
          {
            type: 'primary',
            title: I18N.carbonFootprint.confirm2,
            onClick: async () => {
              if (!selectRows?.length) {
                Toast('error', I18N.emission.pleaseSelectAFactor);
              } else {
                let factorId = '';
                let factorName = '';
                const factor = selectRows[0];
                if (+productType === ProductType.footprint) {
                  const footPrintFactor = factor as SerachCarbonFactorResult;
                  factorId = footPrintFactor?.id;
                  factorName = footPrintFactor?.emission_factor_name || '';
                } else {
                  const plasticFactor = factor as PlasticSearchFactor;
                  factorName = plasticFactor.name || '';
                  factorId = plasticFactor.id;
                }
                // 选中的值存储到 sessionstorage
                setFactorSearchResult({
                  factor: selectRows[0],
                  factorSource: productType as ProductType,
                  factorId,
                  factorName,
                });
                redirectFn({ fallBackFn: () => history.go(-1) });
              }
            },
          },
          {
            title: I18N.carbonFootprint.cancel,
            onClick: async () =>
              redirectFn({ fallBackFn: () => history.go(-1) }),
          },
        ]}
      />
      {/* 添加排放因子modal */}
      <AddFactorModal
        visible={!!addFactorModalVisible}
        showType={addFactorModalVisible}
        onCancel={() => setAddFactorModalVisible(undefined)}
        onOk={() => {
          if (searchRef.current?.getFieldValue('name')) {
            tableRef.current?.reload();
          }
          setAddFactorModalVisible(undefined);
        }}
      />
    </div>
  );
};

export default SearchFactors;
