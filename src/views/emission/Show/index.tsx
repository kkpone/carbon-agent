/**
 * @file 因子详情、编辑、新增
 */
import { listALLByDictTypeData } from '@src/api/api';
import { apiFactorDataByBusiness, EmissionFactor } from '@src/api/factors';
import CheckTable from '@src/components/CheckTable';
import { FormActions } from '@src/components/FormActions';
import {
  CardTabsBaseProps,
  CardTabsBase,
} from '@src/components/Tabs/CardTabsBase';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Partial } from '@src/typings';
import { redirectFn } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { COMPANY_ID } from '@src/utils/consts';
import { SearchFormItem } from '@src/views/components/SearchForm';
import { FactorUse } from '@src/views/utils';
import useSyncCallback from '@utils/useSyncCallback';
import VerifyUtils from '@utils/verifty';
import EmissionModel from '@views/emission/component/modal';
import { Form, Table, Row, Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RcFile } from 'antd/lib/upload';
import {
  cloneDeep,
  compact,
  concat,
  head,
  initial,
  last,
  tail,
} from 'lodash-es';
import moment from 'moment';
import { FC, useEffect, useState, useMemo, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import {
  apiListALLByDictTypeData,
  apiMarkQuery,
  apiMnumListALLByDictTypeBatch,
  apiSourceList,
  ColUmsType,
  apiMarkAdd,
  apiMarkEdit,
} from './service';
import { Dicts } from './type';
import { useFormulaColumns } from './utils';
import Rating from '../component/Rating';
import style from '../index.module.scss';
import {
  checkSubmitFactorInfo,
  useBaseFormJson,
  useFactorDataFormJson,
  useIndexColumn,
  useNumberTypeColumn,
  useSourceFormJson,
} from '../utils';
import { renderFormItems } from '../utils/formItems';
import {
  EmissionFactorMenu,
  UploadFiles,
  FormJsonItemType,
  Factors,
  GasDatum,
  CarbonFactorFormula,
  FormulaData,
  FactorInfoForms,
} from '../utils/index-type';

const FactorFills: FC = () => {
  const [fileList, setFileList] = useState<UploadFiles[]>([]);
  const history = useHistory();
  // 排放因子信息
  const [dataValue, changeDataValue] = useState<Partial<Factors>>({});

  const [modelVisBle, changeModelVisBle] = useState<boolean>(false);
  const [currentLableIds, changeCurrentLableIds] = useState<string[]>();
  const [cascaderOptions, getCascaderOptions] = useState<Dicts[]>([]);
  // 判断当前的标签
  const [currentLabel, changeCurrentLabel] = useState<string>('');
  // 获取枚举值
  const [menuList, getMenuList] = useState<EmissionFactorMenu>({});

  // 数值类
  const [numberFactorDatas, setNumberFactorDatas] = useState<ColUmsType[]>([]);

  // 计算参数
  const [formulaFactorDatas, setFormulaFactorDatas] = useState<
    CarbonFactorFormula[]
  >([]);
  // 关联排放因子
  const [visible, setVisible] = useState<boolean>(false);
  // const [reportCountriesList, setReportCountriesList] = useState<any[]>([]);
  const [page, setPage] = useState<{
    page: number;
    size: number;
    dataTotal: number;
  }>({
    page: 1,
    size: 5,
    dataTotal: 0,
  });
  const [tableData, setTableData] = useState([]);
  const indexColumn = useIndexColumn<any>(
    ((page?.page || 1) - 1) * (page?.size || 0),
  );
  const [modalSearchParams, setModalSearchParams] = useState({
    name: '',
  });
  const [factorList, setFactorList] = useState<any[]>([]);
  // 计算结果
  const [formulaResult, setFormulaResult] = useState<GasDatum[]>([]);

  const { search } = window.location;
  const emissionId = useMemo(() => {
    const searchObj = new URLSearchParams(search);
    return searchObj.get('emissionId') || '';
  }, [search]);
  /**
   * @description 只有自己的排放因子才展示 网址资源、来源文件名称、源文件
   */
  const isOwner = useMemo(
    () =>
      // searchObj.get('factorUse') === FactorUse['收藏因子'];
      dataValue.factorUse === FactorUse.organization ||
      window.location.href.includes(RouteMaps.emissionOrganizationAdd),
    [dataValue.factorUse],
  );

  // factorType 1 数值类 2 公式类  formula 1 化石 2 林业
  const cacheFormula = useRef<{ factorType?: number; formula?: number }>({
    factorType: undefined,
    formula: undefined,
  });
  // 通用行业
  const [businessLableArr, getBussinessLabelArr] = useState<string[]>([]);
  const [factorLableArr, getFactorLabelArr] = useState<string[]>([]);

  const [form] = Form.useForm();
  const culDisAbled = () => history.location.pathname.includes('detail');

  // const getValues = () => numberFactorDatas;
  // 数值类型表头
  const columns = useNumberTypeColumn<ColUmsType>({
    isDisabled: culDisAbled(),
    menuList,
    setValues: setNumberFactorDatas,
    cascaderOptions,
  });
  // const getDocList = async () => {
  //   listALLByDictTypeBatch({ dictTypes: 'reportCountries' }).then(res => {
  //     const reportCountries = res.data.data.reportCountries?.map(
  //       (item: any) => {
  //         return {
  //           label: item.dictLabel,
  //           value: String(item.dictValue),
  //           prop: item.dictValue,
  //         };
  //       },
  //     );
  //     console.log(reportCountries);

  //     setReportCountriesList(reportCountries);
  //   });
  // };
  const getFactorList = async () =>
    apiFactorDataByBusiness({
      ...modalSearchParams,
      pageNum: page.page,
      pageSize: page.size,
      companyId: localStorage.getItem('COMPANY_ID') || '',
      id: emissionId,
    }).then(async ({ data }) => {
      setTableData(
        data.rows.map((item: any) => ({
          ...item,
          factorId: item.id,
        })),
      );
      setPage({ ...page, dataTotal: data.total });
    });
  const syncGetFactorList = useSyncCallback(getFactorList);
  // 计算表头
  const formulaColums = useFormulaColumns({
    dataValue,
    setValues: v => setFormulaFactorDatas(v),
    setValues2: v => setFormulaResult(v),
  });
  // 计算结果表头
  const ResultColums = useNumberTypeColumn<GasDatum>({
    type: 'result',
    isDisabled: culDisAbled(),
    dataValue,
    menuList,
    cascaderOptions,
    setValues2: v => setFormulaFactorDatas(v),
    setValues: v => setFormulaResult(v),
  });
  // 基本信息
  const basicMsg = useBaseFormJson();
  // 因子数量
  const rightFormList = useFactorDataFormJson({
    form,
    menuList,
    dataValue,
  });
  // 来源信息
  const sourceItemFn = useSourceFormJson({
    fileList,
    menuList,
    isOwner,
  });
  // 获取二级分类
  const getSecondDicts = (params: {
    dictType: string | number;
    labelValue: string | number;
  }) =>
    listALLByDictTypeData(params).then(({ data }) => {
      const d = data?.data;
      getMenuList({ ...menuList, secondClassify: d });
    });
  const renderFormItem = renderFormItems({
    onSelectChange(e, item) {
      if (item.title === 'factorType') {
        changeDataValue(s => ({
          ...s,
          ...form.getFieldsValue(),
          factorType: e,
          formula: s?.formula ?? '1',
        }));
        if (!dataValue?.formula) {
          form.setFieldsValue({ formula: '1' });
        }
      }
      if (item.title === 'secondClassify') {
        form.setFieldsValue({
          esecondClassify: menuList?.secondClassify?.find(
            l => l.dictValue === e,
          )?.relatedValue,
        });
      }
      // 一级分类 -> 一级分类英文 二级分类
      if (item.title === 'firstClassify') {
        form.setFieldsValue({
          secondClassify: undefined,
          esecondClassify: undefined,
          efirstClassify: menuList?.firstClassify?.find(l => l.dictValue === e)
            ?.relatedValue,
        });
        getSecondDicts({
          dictType: 'secondClassify',
          labelValue: e as unknown as string,
        });
      }
      if (item.title === 'formula') {
        changeDataValue(s => ({
          ...s,
          formula: e as unknown as string,
        }));
      }
    },
    renderCaculateTable: () =>
      form.getFieldValue('factorType') === '1' ? (
        // 数值类
        <Table
          bordered
          dataSource={numberFactorDatas}
          columns={columns}
          pagination={false}
        />
      ) : (
        <Table
          bordered
          dataSource={formulaFactorDatas}
          columns={formulaColums}
          pagination={false}
        />
      ),
    renderResultTable: () => (
      <Table
        bordered
        dataSource={formulaResult}
        columns={ResultColums}
        pagination={false}
      />
    ),

    // 关联因子
    renderRelevanceFectorTable: () => {
      const columsList = [
        ...indexColumn,
        {
          title: I18N.carbonFootprint.name,
          dataIndex: 'name',
          ellipsis: true,
        },
        {
          title: I18N.carbonFootprint.specificationAndModel,
          dataIndex: 'specification',
          render: (t: string) => t || '--',
        },
        {
          title: I18N.components.applicableScenarios,
          dataIndex: 'description',
          ellipsis: true,
          render: (t: string) => <p>{t || '--'}</p>,
        },
        {
          title: I18N.carbonFootprint.factorValue,
          dataIndex: 'cValue',
          ellipsis: true,
        },
        {
          title: I18N.carbonFootprint.unit,
          dataIndex: 'unit',
          ellipsis: true,
        },
        {
          title: I18N.carbonFootprint.yearOfPublication,
          dataIndex: 'year',
          ellipsis: true,
        },
        {
          title: I18N.emission.sourceFiles,
          dataIndex: 'source',
          ellipsis: true,
        },
        {
          title: I18N.carbonFootprint.publishingInstitution,
          dataIndex: 'institution',
        },
        {
          title: I18N.carbonFootprint.publishingCountryGroups,
          dataIndex: 'countries',
        },
      ];
      const formList: SearchFormItem[] = [
        {
          name: 'name',
          placeholder: I18N.carbonFootprint.factorName,
          label: I18N.carbonFootprint.factorName,
          type: 'Input',
        },
        {
          name: 'source',
          placeholder: I18N.emission.sourceFiles,
          label: I18N.emission.sourceFiles,
          type: 'Input',
        },
        {
          name: 'institution',
          placeholder: I18N.carbonFootprint.publishingInstitution,
          label: I18N.carbonFootprint.publishingInstitution,
          type: 'Input',
        },
      ];

      const onHandleOk = (list: []) => {
        setFactorList(list);
      };
      const tableOnChange = (page: any) => {
        setPage({
          page: page.current,
          size: page.pageSize,
          dataTotal: page.total,
        });
        syncGetFactorList();
      };
      const onSearch = (params: any) => {
        setPage({
          ...page,
          page: 1,
        });
        setModalSearchParams(params);
        syncGetFactorList();
      };
      const factorColumns: ColumnsType<EmissionFactor> = [
        {
          title: I18N.carbonFootprint.number,
          render: (_, __, index: number) => index + 1,
        },
        {
          title: I18N.carbonFootprint.name,
          dataIndex: 'name',
        },
        {
          title: I18N.carbonFootprint.specificationAndModel,
          dataIndex: 'specification',
        },
        {
          title: I18N.components.applicableScenarios,
          dataIndex: 'description',
        },

        {
          title: I18N.carbonFootprint.factorValue,
          dataIndex: 'cValue',
        },

        {
          title: I18N.carbonFootprint.unit,
          dataIndex: 'unit',
        },

        {
          title: I18N.carbonFootprint.yearOfPublication,
          dataIndex: 'year',
        },
        {
          title: I18N.carbonFootprint.publishingCountryGroups,
          dataIndex: 'institution',
        },
      ];
      if (
        !history.location.pathname.includes(
          RouteMaps.emissionOrganizationDetail,
        ) &&
        !history.location.pathname.includes(RouteMaps.emissionCarbonStopDetail)
      ) {
        factorColumns.push({
          title: I18N.carbonFootprint.operation,
          dataIndex: 'opreation',
          render: (_, record) => (
            <Button
              type='link'
              onClick={() => {
                const index = factorList.findIndex(
                  item => item.factorId === record?.factorId || 0,
                );
                factorList.splice(index, 1);
                setFactorList([...factorList]);
              }}
            >
              {I18N.carbonFootprint.delete}
            </Button>
          ),
        });
      }

      return (
        <>
          <Row gutter={24} justify='end'>
            {history.location.pathname.includes(
              RouteMaps.emissionOrganizationDetail,
            ) ||
            history.location.pathname.includes(
              RouteMaps.emissionCarbonStopDetail,
            ) ? (
              ''
            ) : (
              <Button
                onClick={() => {
                  setVisible(true);
                }}
                style={{
                  position: 'relative',
                  top: '-32px',
                  right: '10px',
                }}
              >
                {I18N.carbonFootprint.newAddition}
              </Button>
            )}
          </Row>
          <Table
            bordered
            // @ts-ignore
            dataSource={factorList}
            columns={factorColumns}
            pagination={false}
          />
          <CheckTable
            columsData={columsList}
            dataSource={tableData}
            outList={factorList}
            page={page}
            closeModel={() => setVisible(false)}
            visible={visible}
            formList={formList}
            onHandleOk={onHandleOk}
            tableOnChange={tableOnChange}
            onSearch={onSearch}
          />
        </>
      );
    },
    showModal: (item: FormJsonItemType) => {
      if (item.modelLabel === 'business') {
        if (form.getFieldValue('business')) {
          changeCurrentLableIds(form.getFieldValue('business').split(','));
        } else {
          changeCurrentLableIds([]);
        }
      }
      if (item.modelLabel === 'factorLabel') {
        if (form.getFieldValue('labelFactor')) {
          changeCurrentLableIds(form.getFieldValue('labelFactor').split(','));
        } else {
          changeCurrentLableIds([]);
        }
      }
      changeModelVisBle(true);
      changeCurrentLabel(item.modelLabel || '-');
    },
    inputValues: (item: FormJsonItemType) =>
      item.modelLabel === 'business' ? businessLableArr : factorLableArr,
    isDisabled: culDisAbled(),
    fileList,
    onfileChange: (newArr: any[]) => {
      setFileList([...newArr]);
    },
    yearPickerValue: moment(form.getFieldValue('year')),
    datePickerValue: moment(form.getFieldValue('date')),
  });

  // 计算规则
  const [formulaData, setFormulaData] = useState<FormulaData>();
  // 获取数值类型、计算类型table数据
  const apiSourceListFn = async () =>
    apiSourceList().then(async ({ data }) => {
      if (Number(data.code) === 200) {
        setFormulaData(data.data?.formulaData);
        // 数值类
        const gasData = data.data?.gasData || [];
        setNumberFactorDatas(compact(concat(last(gasData), initial(gasData))));
      }
    });
  useEffect(() => {
    const { formula, factorType } = dataValue;
    if (!factorType || !formula) return;
    if (
      !emissionId ||
      (emissionId &&
        (cacheFormula.current.factorType !== +factorType ||
          cacheFormula.current.formula !== +formula))
    ) {
      cacheFormula.current.factorType = +factorType;
      cacheFormula.current.formula = +formula;

      if (+formula === 1) {
        // 化石
        setFormulaResult([
          ...cloneDeep(formulaData?.fossilFormulaData?.carbonFactorGas || []),
        ]);
        setFormulaFactorDatas(
          cloneDeep(formulaData?.fossilFormulaData?.carbonFactorFormula || []),
        );
      } else if (+formula === 2) {
        // 林业
        setFormulaResult([
          ...cloneDeep(formulaData?.forestryFormulaData?.carbonFactorGas || []),
        ]);
        setFormulaFactorDatas(
          cloneDeep(
            formulaData?.forestryFormulaData?.carbonFactorFormula || [],
          ),
        );
      } else if (+formula === 3) {
        // 公里
        setFormulaResult([
          ...cloneDeep(
            formulaData?.transportationKMFormulaData?.carbonFactorGas || [],
          ),
        ]);
        setFormulaFactorDatas(
          cloneDeep(
            formulaData?.transportationKMFormulaData?.carbonFactorFormula || [],
          ),
        );
      } else if (+formula === 4) {
        // 吨公里
        setFormulaResult([
          ...cloneDeep(
            formulaData?.transportationTKMFormulaData?.carbonFactorGas || [],
          ),
        ]);
        setFormulaFactorDatas(
          cloneDeep(
            formulaData?.transportationTKMFormulaData?.carbonFactorFormula ||
              [],
          ),
        );
      }
    }
    // getDocList();
  }, [dataValue?.formula, formulaData]);
  const factorType: FactorUse = history.location.pathname?.includes(
    RouteMaps.emissionCarbonStopDetail,
  )
    ? FactorUse.carbonstop
    : FactorUse.organization;
  // 获取排放因子信息
  // eslint-disable-next-line consistent-return
  const apiMarkQueryFn = async () => {
    if (emissionId)
      return apiMarkQuery(
        {
          id: emissionId,
          factorUse: 1,
        },
        factorType,
      ).then(async ({ data }) => {
        const resultData = data?.data;
        if (data.code === 200 && resultData) {
          const businessStr = `${resultData.business}`.split(',');
          const businessArr: string[] = [];
          // eslint-disable-next-line array-callback-return
          menuList.business?.map(item => {
            if (businessStr.indexOf(item.dictValue) >= 0) {
              businessArr.push(item.dictLabel);
            }
          });
          setFactorList(resultData?.relationFactorList);

          getBussinessLabelArr([...businessArr]);
          resultData.sourceFileList &&
            setFileList([...resultData.sourceFileList]);
          form.setFieldsValue({
            ...resultData,
            year: resultData?.year ? moment(resultData?.year, 'YYYY') : '',
            publishDate: resultData.publishDate
              ? moment(resultData.publishDate, 'YYYY-MM-DD')
              : '',
          });
          const gasData = resultData?.gasData || [];
          setNumberFactorDatas(
            compact(concat(last(gasData), initial(gasData))),
          );
          // 获取二级分类
          if (resultData?.firstClassify) {
            getSecondDicts({
              dictType: 'secondClassify',
              labelValue: resultData?.firstClassify,
            });
          }
          cacheFormula.current.factorType = +resultData.factorType;
          cacheFormula.current.formula = +resultData.formula;
          // 化石
          if (Number(resultData?.formula) === 1) {
            setFormulaResult([
              ...(resultData?.formulaData?.fossilFormulaData?.carbonFactorGas ||
                []),
            ]);
            // 计算参数
            setFormulaFactorDatas([
              ...(resultData?.formulaData?.fossilFormulaData
                ?.carbonFactorFormula || []),
            ]);
          }
          // 林业
          if (Number(resultData?.formula) === 2) {
            setFormulaResult([
              ...(resultData?.formulaData?.forestryFormulaData
                ?.carbonFactorGas || []),
            ]);
            // 计算参数
            setFormulaFactorDatas([
              ...(resultData?.formulaData?.forestryFormulaData
                ?.carbonFactorFormula || []),
            ]);
          } // 新增公式列表
          if (Number(resultData?.formula) === 3) {
            setFormulaResult([
              ...(resultData?.formulaData?.transportationKMFormulaData
                ?.carbonFactorGas || []),
            ]);
            // 计算参数
            setFormulaFactorDatas([
              ...(resultData?.formulaData?.transportationKMFormulaData
                ?.carbonFactorFormula || []),
            ]);
          }
          if (Number(resultData?.formula) === 4) {
            setFormulaResult([
              ...(resultData?.formulaData?.transportationTKMFormulaData
                ?.carbonFactorGas || []),
            ]);
            // 计算参数
            setFormulaFactorDatas([
              ...(resultData?.formulaData?.transportationTKMFormulaData
                ?.carbonFactorFormula || []),
            ]);
          }
          changeDataValue({
            ...resultData,
          });
        }
      });
  };

  const SyncCallApiMarkQueryFn = useSyncCallback(apiMarkQueryFn);
  const apiMnumListALLByDictTypeBatchFn = async () => {
    await apiMnumListALLByDictTypeBatch({
      dictTypes: `sourceLanguage,factorDataType,reportArea,sourceLevel,factorUnitM,factorUnitZ,PFCseNUM,HFCsEnum,business,factorLabel,reportCountries,methaneUnitZ,nitrousUnitZ,hydrofluorocarbonUnitZ,perfluorocarbonUnitZ,sulfurUnitZ,nitrogenUnitZ,cequivalentUnitZ,firstClassify,placeOfPublication,formulaChance,documentType,carrierTypes,formulaUnitZ,formulaUnitM,forestryUnitZ,forestryUnitM,co2eFormulaUnitZ,co2eForestryUnitZ,transportationKMZ,co2eTransportationKMZ,transportationKMM,transportationTKMZ,co2eTransportationTKMZ,transportationTKMM`,
    }).then(({ data }) => {
      getMenuList({ ...data.data });
      if (history.location.search) {
        SyncCallApiMarkQueryFn();
      } else {
        form.setFieldsValue({
          factorType: '1',
        });
        changeDataValue({
          ...form.getFieldsValue(true),
          factorType: '1',
        });
      }
    });
  };
  const apiListALLByDictTypeDataFn = async () => {
    await apiListALLByDictTypeData({ dictType: 'factorUnitM' }).then(
      ({ data }) => {
        getCascaderOptions(data?.data || []);
      },
    );
  };
  useEffect(() => {
    apiSourceListFn();
    apiMnumListALLByDictTypeBatchFn();
    apiListALLByDictTypeDataFn();
  }, []);
  // 弹窗取消的方法
  const modelCancelFn = () => {
    changeModelVisBle(false);
  };
  const modelConfirmeFn = (value: React.Key[]) => {
    if (currentLabel === 'factorLabel') {
      const factorLabelArr: string[] = [];
      if (menuList.factorLabel) {
        menuList.factorLabel.forEach(item => {
          if (value.indexOf(item.dictValue) >= 0) {
            factorLabelArr.push(item.dictLabel);
          }
        });
      }
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        labelFactor: value.toString(),
      });
      getFactorLabelArr([...factorLabelArr]);
    }
    if (currentLabel === 'business') {
      const businessArr: string[] = [];
      if (menuList.business) {
        menuList.business.forEach(item => {
          if (value.indexOf(item.dictValue) >= 0) {
            businessArr.push(item.dictLabel);
          }
        });
      }
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        business: value.toString(),
      });
      getBussinessLabelArr([...businessArr]);
    }
    changeModelVisBle(false);
    changeCurrentLableIds([]);
  };
  const onConfimeRowFn = (
    value: {
      id: string;
      sourceType?: string | number | undefined;
      sourceName?: string | undefined;
      dictValue?: string | undefined;
      dictLabel?: string | undefined;
      year?: string;
      sourceFileList?: {
        uid: string;
        name: string;
        status?: 'done' | 'error' | 'success' | 'uploading' | 'removed';
        url?: string;
        originFileObj?: RcFile;
      }[];
    }[],
  ) => {
    changeModelVisBle(false);
    changeCurrentLableIds([]);
    if (value[0].sourceFileList) {
      setFileList([...value[0].sourceFileList]);
    }
    form.setFieldsValue({
      ...form.getFieldsValue(),
      ...value[0],
      year: moment(value[0].year, 'YYYY'),
    });
  };

  enum TabTitle {
    'basicInformation' = '0',
    'factorData' = '1',
    'sourceInformation' = '2',
    'reviewInformation' = '3',
  }

  const TabTitleText = {
    [TabTitle.basicInformation]: I18N.carbonFootprint.basicInformation,
    [TabTitle.factorData]: I18N.components.factorData,
    [TabTitle.sourceInformation]: I18N.components.sourceInformation,
    [TabTitle.reviewInformation]: I18N.emission.reviewInformation,
  };

  const returnRating = () => {
    const auditStatus = new URLSearchParams(window.location.search).get(
      'auditStatus',
    );
    const isReturn = [
      '/emission/organization/detai',
      '/emission/organization/edit',
    ].some(item => history.location.pathname.indexOf(item) >= 0);
    return [0, 1, 2].indexOf(Number(auditStatus)) >= 0 && isReturn;
  };
  const tabs: CardTabsBaseProps['tabPane'] = compact([
    returnRating()
      ? {
          tab: TabTitleText[TabTitle.reviewInformation],
          key: TabTitle.reviewInformation,
        }
      : null,
    {
      tab: TabTitleText[TabTitle.basicInformation],
      key: TabTitle.basicInformation,
    },
    { tab: TabTitleText[TabTitle.factorData], key: TabTitle.factorData },
    {
      tab: TabTitleText[TabTitle.sourceInformation],
      key: TabTitle.sourceInformation,
    },
  ]);
  const [currentTab, setTabs] = useState(TabTitle.basicInformation);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [renderFormItemse, setRenderFormItemse] = useState(
    renderFormItem(basicMsg, currentTab),
  );
  // eslint-disable-next-line consistent-return
  const formObj = useMemo(() => {
    if (currentTab === TabTitle.basicInformation) {
      return renderFormItem(basicMsg, currentTab);
    }
    if (currentTab === TabTitle.factorData) {
      return renderFormItem(rightFormList, currentTab, 'two');
    }
    if (currentTab === TabTitle.sourceInformation) {
      return renderFormItem(sourceItemFn, currentTab);
    }
  }, [currentTab, rightFormList, renderFormItemse]);

  const renderForm = () => (
    <Form
      form={form}
      layout='vertical'
      size='middle'
      onValuesChange={(_, values) => {
        setRenderFormItemse(values.sourceLanguage);
      }}
    >
      {formObj}
    </Form>
  );
  return (
    <div className={style.emissionFactorWrapper}>
      <CardTabsBase
        tabPane={tabs}
        className={style.tabs}
        defaultActiveKey={currentTab}
        onChange={s => {
          changeDataValue(s => ({ ...s, ...form.getFieldsValue() }));
          setTabs(s as TabTitle);
        }}
      />
      <main className={style.main}>
        <div className={style.organization}>
          <div className={style.formContent}>
            <div className={style.content}>
              {currentTab === TabTitle.reviewInformation ? (
                <Rating />
              ) : (
                renderForm()
              )}
            </div>
          </div>
          <FormActions
            buttons={compact([
              !culDisAbled()
                ? {
                    type: 'primary',
                    title: I18N.components.submit,
                    onClick: async () =>
                      form.validateFields().then(async values => {
                        const allValues: FactorInfoForms = {
                          ...dataValue,
                          ...values,
                        };

                        if (!checkSubmitFactorInfo(allValues)) return;
                        let obj: Partial<FactorInfoForms> = {
                          ...allValues,
                          year: moment(allValues.year).format('YYYY'),
                          publishDate: allValues?.publishDate
                            ? moment(allValues.publishDate).format('YYYY-MM-DD')
                            : '',
                          multipartFileList: [],
                          relationFactorList: factorList,
                        };
                        if (allValues.factorType === '2') {
                          // 公式
                          obj = {
                            ...obj,
                            carbonFactorFormula: formulaFactorDatas,
                            carbonFactorGas: formulaResult,
                          };
                          const culContent = formulaResult.some(item => {
                            if (!item.activeUnit) {
                              return false;
                            }
                            if (!item.factorUnit) {
                              return false;
                            }
                            if (!item.factorUnitM) {
                              return false;
                            }
                            if (!(Number(item.factorValue) > 0)) {
                              return false;
                            }
                            return true;
                          });
                          if (!culContent) {
                            // eslint-disable-next-line consistent-return
                            return Toast(
                              'error',
                              I18N.emission.factorCalculationParameters,
                            );
                          }
                        } else {
                          // 数值
                          obj.carbonFactorGas = compact(
                            concat(
                              tail(numberFactorDatas),
                              head(numberFactorDatas),
                            ),
                          );
                          const mustChooseCarbonFactorGas =
                            obj.carbonFactorGas?.[7];
                          if (
                            mustChooseCarbonFactorGas &&
                            (!mustChooseCarbonFactorGas?.activeUnit ||
                              !mustChooseCarbonFactorGas?.factorUnit ||
                              !mustChooseCarbonFactorGas.factorUnitM ||
                              !mustChooseCarbonFactorGas.factorValue)
                          ) {
                            Toast('error', I18N.components.carbonDioxideWhen);
                            // eslint-disable-next-line consistent-return
                            return false;
                          }
                        }
                        if (history.location.pathname.includes('edit')) {
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                          await apiMarkEdit({
                            ...obj,
                            sourceFileList: fileList,
                            id: emissionId,
                          }).then(({ data }) => {
                            VerifyUtils.Toast(data.code as 200, data.msg);
                            if (data.code === 200) {
                              redirectFn({
                                addSearch: { refresh: 1 },
                                fallBackFn: () => history.go(-1),
                              });
                            }
                          });
                          return;
                        }
                        await apiMarkAdd({
                          ...obj,
                          sourceFileList: fileList,
                          companyId: Number(localStorage.getItem(COMPANY_ID))
                            ? Number(localStorage.getItem(COMPANY_ID))
                            : 0,
                        }).then(({ data }) => {
                          VerifyUtils.Toast(data.code as 200, data.msg);
                          if (data.code === 200) {
                            redirectFn({
                              addSearch: { refresh: 1 },
                              fallBackFn: () => history.go(-1),
                            });
                          }
                        });
                      }),
                  }
                : null,
              {
                title: I18N.carbonFootprint.return,
                onClick: async () => {
                  redirectFn({
                    addSearch: { refresh: 0 },
                    fallBackFn: () => history.go(-1),
                  });
                },
              },
            ])}
          />
        </div>
      </main>
      {/* 选择行业 */}
      <EmissionModel
        visible={modelVisBle}
        selectKeys={currentLableIds}
        onCancel={() => {
          modelCancelFn();
          changeCurrentLableIds([]);
        }}
        onConfime={(value: React.Key[]) => modelConfirmeFn(value)}
        onConfimeRow={value => onConfimeRowFn(value)}
        currentLabel={currentLabel}
      />
    </div>
  );
};

export default FactorFills;
