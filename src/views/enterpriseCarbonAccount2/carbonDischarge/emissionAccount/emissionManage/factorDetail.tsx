/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-10-18 14:21:08
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-27 16:44:05
 */
/**
 * @file 因子详情
 * @author lixingchen
 * */
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Form, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../../../style.less';
import { FormActions } from '@src/components/FormActions';
import { Page } from '@src/components/Page';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import { FormProps } from 'antd/es/form/Form';
import {
  CarbonFactorFormula,
  Factors,
  GasDatum,
} from '@src/views/emission/utils/index-type';
import { getFactors } from '@src/api/factors';
import {
  apiListALLByDictTypeData,
  apiMnumListALLByDictTypeBatch,
} from '@src/views/emission/Show/service';
import { Dicts } from '@src/views/emission/Show/type';
import { useFormulaColumns } from '@src/views/emission/Show/utils';
import { useNumberTypeColumn } from '@src/views/emission/utils';
import { getPageInfo } from './factorData';

const SupplierDashboardFactorDetailPage = () => {
  const [tabName, setTabName] = useState('baseInfo');
  const [dataValue, changeDataValue] = useState<Partial<Factors>>({});
  const [menuList, setMenuList] = useState({});
  const [form] = Form.useForm();
  const [cascaderOptions, getCascaderOptions] = useState<Dicts[]>([]);
  /** 是否不显示面包屑 */
  const [noBread, setNoBread] = useState<boolean>(false);
  const [factorType, setFactorType] = useState<string>('1');
  const [formulaFactorDatas, setFormulaFactorDatas] = useState<
    CarbonFactorFormula[]
  >([]);
  const [formulaResult, setFormulaResult] = useState<GasDatum[]>([]);
  const history = useHistory();
  const basicsFormProps: FormProps = {
    ...formPropsInit(),
    form,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  const onTabChange = (key: string) => {
    setTabName(key);
  };
  const apiMnumListALLByDictTypeBatchFn = async () => {
    await apiMnumListALLByDictTypeBatch({
      dictTypes: `sourceLanguage,factorDataType,reportArea,sourceLevel,factorUnitM,factorUnitZ,PFCseNUM,HFCsEnum,business,factorLabel,reportCountries,methaneUnitZ,nitrousUnitZ,hydrofluorocarbonUnitZ,perfluorocarbonUnitZ,sulfurUnitZ,nitrogenUnitZ,cequivalentUnitZ,firstClassify,placeOfPublication,formulaChance,documentType,carrierTypes,formulaUnitZ,formulaUnitM,forestryUnitZ,forestryUnitM,co2eFormulaUnitZ,co2eForestryUnitZ,transportationKMZ,co2eTransportationKMZ,transportationKMM,transportationTKMZ,co2eTransportationTKMZ,transportationTKMM`,
    }).then(({ data }) => {
      setMenuList({ ...data.data });
    });
  };
  const tabList = [
    { key: 'baseInfo', tab: I18N.carbonFootprint.basicInformation },
    { key: 'factorData', tab: I18N.components.factorData },
    { key: 'sourceInfo', tab: I18N.components.sourceInformation },
    { key: 'relevanceFactor', tab: I18N.components.correlationFactor },
  ];
  const apiListALLByDictTypeDataFn = async () => {
    await apiListALLByDictTypeData({ dictType: 'factorUnitM' }).then(
      ({ data }) => {
        getCascaderOptions(data?.data || []);
      },
    );
  };

  const showComponent = key => (
    <div style={{ overflow: 'scroll', height: '79vh' }}>
      <FormItemUtil
        antdFormProps={basicsFormProps}
        formItems={getPageInfo(
          key,
          form,
          menuList,
          factorType,
          cascaderOptions,
          formulaFactorDatas,
          formulaColums,
          formulaResult,
          ResultColums,
          dataValue,
        )}
        paddRight={30}
      />
    </div>
  );
  // 计算表头
  const formulaColums = useFormulaColumns({
    dataValue,
    setValues: v => setFormulaFactorDatas(v),
    setValues2: v => setFormulaResult(v),
  });
  // 计算结果表头
  const ResultColums = useNumberTypeColumn<GasDatum>({
    type: 'result',
    isDisabled: true,
    dataValue,
    menuList,
    cascaderOptions,
    setValues2: v => setFormulaFactorDatas(v),
    setValues: v => setFormulaResult(v),
  });
  const getData = () => {
    const id = new URLSearchParams(location.search).get('id') || '';
    const noBread = new URLSearchParams(location.search).get('noBread') || '';
    if (noBread) {
      setNoBread(true);
    } else {
      setNoBread(false);
    }
    getFactors(id).then((res: any) => {
      if (!Object.keys(res.data.data).length) return;
      setFactorType(res?.data?.data?.factorType);
      const resultData = res?.data?.data;
      form.setFieldsValue({
        ...resultData,
        business: resultData.business?.split(','),
      });

      changeDataValue({
        ...resultData,
      });
      // 化石
      if (Number(resultData?.formula) === 1) {
        setFormulaResult([
          ...(resultData?.formulaData?.fossilFormulaData?.carbonFactorGas ||
            []),
        ]);
        // 计算参数
        setFormulaFactorDatas([
          ...(resultData?.formulaData?.fossilFormulaData?.carbonFactorFormula ||
            []),
        ]);
      }
      // 林业
      if (Number(resultData?.formula) === 2) {
        setFormulaResult([
          ...(resultData?.formulaData?.forestryFormulaData?.carbonFactorGas ||
            []),
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
    });
  };
  useEffect(() => {
    getData();
    apiMnumListALLByDictTypeBatchFn();
    apiListALLByDictTypeDataFn();
    getPageInfo(
      'baseInfo',
      form,
      menuList,
      factorType,
      cascaderOptions,
      formulaFactorDatas,
      formulaColums,
      formulaResult,
      ResultColums,
      dataValue,
    );
  }, []);
  return (
    <div className='enterprise-carbon-account2'>
      <Page
        styles={
          noBread ? { margin: '0', paddingLeft: 16 } : { paddingLeft: 16 }
        }
        breadCrumbs={
          !noBread
            ? [
                {
                  title: I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
                  key: I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
                  href: RouteMaps.enterpriseCarbonAccountingcarbonDischarge,
                },
                {
                  title: I18N.enterpriseCarbonAccount2.emissionSourceManagement,
                  key: I18N.enterpriseCarbonAccount2.emissionSourceManagement,
                  href: `${
                    RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionManage
                  }?computationId=${sessionStorage.getItem('computationId')}`,
                },
                {
                  title: I18N.carbonFootprint.newEmissionSourcesAdded,
                  key: I18N.carbonFootprint.newEmissionSourcesAdded,
                  href: RouteMaps.enterpriseCarbonAccountingcarbonDischargeAddEmission,
                },

                {
                  title: I18N.carbonFootprint3.chooseEmissionFactors,
                  key: I18N.carbonFootprint3.chooseEmissionFactors,
                  href: RouteMaps.enterpriseCarbonAccountingcarbonDischargeSelectFactor,
                },
                {
                  title: I18N.components.emissionFactorsDetailed,
                  key: I18N.components.emissionFactorsDetailed,
                },
              ]
            : []
        }
      >
        {tabName ? (
          <Tabs
            className='tab-box'
            defaultActiveKey={tabName}
            onChange={onTabChange}
          >
            {tabList.map(item => (
              <Tabs.TabPane {...item}>{showComponent(item.key)}</Tabs.TabPane>
            ))}
          </Tabs>
        ) : (
          ''
        )}

        <FormActions
          place='center'
          buttons={[
            {
              type: 'default',
              title: I18N.carbonFootprint.return,
              onClick: async () => {
                history.goBack();
              },
            },
          ]}
        />
      </Page>
    </div>
  );
};
export default SupplierDashboardFactorDetailPage;
