/*
 * @@description:排放源 新增 复制 编辑 详情
 * @Author: qifeng qifeng@carbonstop.net  lixingchen
 * @Date: 2022-11-07 10:51:29
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-04-11 17:08:01
 */

import tabSelectImg from '@assets/images/tabSelect.png';
import { FormActions } from '@src/components/FormActions';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import { Page } from '@src/components/Page';
import { JavaUpload } from '@src/components/Upload/JavaUpload';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Toast } from '@src/utils/Toast';
import { setFactorRecordData } from '@src/utils/addFactorRecord';
import {
  apiListALLByDictTypeData,
  apiMnumListALLByDictTypeBatch,
  ColUmsType,
} from '@src/views/emission/Show/service';
import { FormProps } from 'antd/lib/form';
import '../../../style.less';
import { EmissionFactorMenu } from '@src/views/emission/utils/index-type';
import {
  GHGFirstSelect,
  GHGSecondSelect,
  ISOFirstSelect,
  ISOSecondSelect,
} from '@src/views/enterpriseCarbonAccount2/listInfo/util';
import { apiSupplierList } from '@src/views/supplyChain2/SupplierManage/service';
import { Button, Form } from 'antd';
import { RcFile } from 'antd/es/upload/interface';
import { cloneDeep } from 'lodash-es';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { FactorGasTableColumns } from './columns';
import { getEmmissionPageInfo, radioSelect } from './emissionForm';
import {
  apiFactorDetail,
  apiLabelList,
  apiSourceAdd,
  apiSourceDefaultValue,
  apiSourceEdit,
  apiSourceListGas,
  apiSourceQueryChianInfo,
  apiSourceQueryCopy,
  apiSourceQueryInfo,
  apiSourceSupplierAdd,
  apiSourceSupplierEdit,
  apiUnitExchange,
} from '../../../service';

import { listALLByDictTypeBatch } from '@src/api/api';

export interface SupplierOptions {
  label: string;
  value: string;
  parmasId: number | string;
  email: string;
}
const EmissionFormPage = () => {
  const GHGFirstSelects = cloneDeep(GHGFirstSelect);
  const ISOFirstSelects = cloneDeep(ISOFirstSelect);
  const history = useHistory();
  const [form] = Form.useForm();
  const [pageType, setPageType] = useState('');
  const [numberFactorDatas, setNumberFactorDatas] = useState<ColUmsType[]>([]);
  const [cascaderOptions, getCascaderOptions] = useState<any[]>([]);
  const [ghgSecondSelect, setGhgSecondSelect] = useState<any>([]);
  const [isoSecondSelect, setIsoSecondSelect] = useState<any>([]);
  const [gHGFirstSelect, setGHGFirstSelect] = useState<any[]>([]);
  const [isoFirstSelect, setIsoFirstSelect] = useState<any>();
  const [saveLoading, setSaveLoading] = useState(false);
  const [activityRecordWayList, setActivityRecordWayList] = useState<any[]>([]);
  const [activityDeptList, setActivityDeptList] = useState<any[]>([]);
  const [supplierId, setSupplierId] = useState<any>();
  const [cequivalentUnitZ, setCequivalentUnitZ] = useState<
    { label: string; value: string }[]
  >([]);
  // const [editFactor, setEditFactor] = useState<boolean>(false);
  const [fillType, setFillType] = useState<string>('emissionFactor');
  const [supplierList, setSupplierList] = useState<SupplierOptions[]>([
    { label: '', value: '', parmasId: '', email: '' },
  ]);
  const supplierItem = useRef<SupplierOptions>({
    label: '',
    value: '',
    parmasId: '',
    email: '',
  });
  // 支撑材料
  const [supportMaterialsList, setSupportMaterialsList] = useState<any[]>([]);
  // const [loading, setLoading] = useState<boolean>(false);
  const search = new URLSearchParams(location.search);
  // 排放源id
  const id = search.get('id') || '';
  const isChaniApi = search.get('isChaniApi') || '';

  /** 因子白盒需要的来源名 */
  const categoryName = search.get('categoryName') || '';
  // 两种分类 字典排放源，排放源
  const categoryId = new URLSearchParams(location.search).get('categoryId');
  const classifyType = new URLSearchParams(location.search).get('classifyType');
  const computationObj = JSON.parse(
    sessionStorage.getItem('computationObj') || '{}',
  );

  // 单位换算比例
  const [actUnit, setActUnit] = useState('');
  const [factorUnit, setFactorUnit] = useState('');
  const [factorId, setFactorId] = useState(
    sessionStorage.getItem('factorId') || '',
  );

  const navText = {
    add: I18N.carbonFootprint.newAddition,
    edit: I18N.carbonFootprint.edit,
    draf: I18N.carbonFootprint.edit,
    copy: I18N.carbonFootprint.copy,
    detail: I18N.carbonFootprint3.details,
  };
  // 获取枚举值
  const [menuList, getMenuList] = useState<EmissionFactorMenu>({});
  const culDisAbled = () => {
    if (history.location.pathname.includes('Add')) {
      setPageType('add');
    }
    if (history.location.pathname.includes('Edit')) {
      // 正式编辑
      setPageType('edit');
    }
    if (history.location.pathname.includes('Copy')) {
      setPageType('copy');
    }
    if (history.location.pathname.includes('Draf')) {
      // 草稿编辑
      setPageType('draf');
    }
    if (history.location.pathname.includes('Detail')) {
      setPageType('detail');
      return true;
    }
    return false;
  };
  const transUnit = (unitMListRes, unitMTreeRes, data) => {
    const unitMList = unitMListRes.data.data.factorUnitM;
    const unitMTree = unitMTreeRes.data.data;
    const sourceObj = unitMList.find(
      item => item.dictValue === data.data.data.activityUnit,
    );
    const sourceName = sourceObj?.sourceName;
    const sourceLabel = sourceObj?.dictLabel;
    const dictValue = unitMTree.find(
      item => item.dictLabel === sourceName,
    )?.dictValue;
    setActUnit(sourceLabel);

    return [dictValue, data.data.data.activityUnit];
  };
  const transFactorUnit = (unitMTreeRes, data) => {
    if (data.data.data.factorGasList?.length) {
      let factorUnitM;

      for (let i = 0; data.data.data.factorGasList.length > 1; i++) {
        const element = data.data.data.factorGasList[i];
        factorUnitM = element.factorUnitM;
        if (factorUnitM) {
          break;
        }
      }
      factorUnitM = factorUnitM?.split(',');

      const enumList = unitMTreeRes.data.data?.find(
        item => item.dictValue === factorUnitM[0],
      )?.enumList;
      const unitM = enumList?.find(
        item => item.dictValue === factorUnitM[1],
      )?.dictLabel;

      setFactorUnit(unitM);
    }
  };
  const apiMnumListALLByDictTypeBatchFn = async () => {
    const { data } = await apiMnumListALLByDictTypeBatch({
      dictTypes: `sourceLanguage,factorDataType,reportArea,sourceLevel,factorUnitM,factorUnitZ,PFCseNUM,HFCsEnum,business,factorLabel,reportCountries,methaneUnitZ,nitrousUnitZ,hydrofluorocarbonUnitZ,perfluorocarbonUnitZ,sulfurUnitZ,nitrogenUnitZ,cequivalentUnitZ,firstClassify,placeOfPublication,formulaChance,documentType,carrierTypes,formulaUnitZ,formulaUnitM,forestryUnitZ,forestryUnitM,co2eFormulaUnitZ,co2eForestryUnitZ,transportationKMZ,co2eTransportationKMZ,transportationKMM,transportationTKMZ,co2eTransportationTKMZ,transportationTKMM`,
    });
    getMenuList({ ...data.data });
  };
  const apiListALLByDictTypeDataFn = async () => {
    await apiListALLByDictTypeData({ dictType: 'factorUnitM' }).then(
      ({ data }: { data: any }) => {
        getCascaderOptions(data?.data || []);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        factorId &&
          factorId !== 'emissionFactor' &&
          apiFactorDetail({
            id: factorId,
            computationId: sessionStorage.getItem('computationId'),
          }).then((res: any) => {
            const resultData = res?.data?.data;
            // 获取因子后转换单位
            const { activityUnit } = form.getFieldsValue(true);
            const { unit } = res.data.data;
            const factorUnit = unit?.split('/')[1];
            setFactorUnit(factorUnit);
            if (activityUnit?.length) {
              const parentClassify = data.data?.find(
                (item: any) => item.dictValue === activityUnit[0],
              );
              const actUnit = parentClassify?.enumList?.find(
                item => item.dictValue === activityUnit[1],
              )?.dictLabel;
              setActUnit(actUnit || '');
              changUnitApi(actUnit, factorUnit);
            }
            const gasTemplate = JSON.parse(
              sessionStorage.getItem('gasTemplate') || '[]',
            );
            const { gasList } = JSON.parse(
              sessionStorage.getItem('emssionInfo') || '[]',
            );
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              factorSource: resultData.institution,
              factorType: resultData.factorType,
              factorPublic: resultData.year && moment(resultData.year),
              factorScore: resultData.factorType,
            });
            const factorGas = resultData.gasData;
            if (gasList?.length) {
              gasList?.forEach((item, index) => {
                factorGas?.forEach(ite => {
                  if (item.type === ite.type) {
                    gasList[index] = {
                      ...ite,
                      sourceFactorGasId: gasList[index]?.sourceFactorGasId,
                    };
                  }
                });
              });
            } else {
              gasTemplate?.forEach((item, index) => {
                factorGas?.forEach(ite => {
                  if (item.type === ite.type) {
                    gasTemplate[index] = {
                      ...ite,
                      sourceFactorGasId: gasTemplate[index]?.sourceFactorGasId,
                    };
                  }
                });
              });
            }

            setNumberFactorDatas(gasList?.length ? gasList : gasTemplate);
          });
      },
    );
  };
  const changeDenominator = option => {
    let item;
    if (Array.isArray(option)) {
      item = option[option.length - 1];
    } else {
      item = option;
    }
    const { dictLabel } = item;
    setFactorUnit(dictLabel);
    changUnitApi(actUnit, dictLabel);
  };
  const getGasList = async () => {
    const res: any = await apiSourceListGas({
      sourceCategoryId: categoryId,
    });
    sessionStorage.setItem(
      'gasTemplate',
      JSON.stringify(res.data.data.gasList),
    );
    !factorId && setNumberFactorDatas(res.data.data.gasList || []);

    form.setFieldsValue({
      ...form.getFieldsValue(true),
      gwp: res.data.data.gwp,
      ghgCategory: res.data.data.ghgCategory,
      isoCategory: res.data.data.isoCategory,
    });

    const ghgSeconde = GHGSecondSelect.filter(
      item => item.pid === res.data.data.ghgCategory,
    );
    const isoSecend = ISOSecondSelect.filter(
      item => item.pid === res.data.data.isoCategory,
    );
    if (classifyType !== '2') {
      ghgSeconde.forEach((item: any) => {
        if (res.data.data.ghgClassifyList?.includes(item.id)) {
          item.disabled = false;
        } else {
          item.disabled = true;
        }
      });
      isoSecend.forEach((item: any) => {
        if (res.data.data.isoClassifyList?.includes(item.id)) {
          item.disabled = false;
        } else {
          item.disabled = true;
        }
      });
      ISOFirstSelects.forEach((item: any) => {
        if (res.data.data.isoCategory === item.id) {
          item.disabled = false;
        } else {
          item.disabled = true;
        }
      });
      GHGFirstSelects.forEach((item: any) => {
        if (res.data.data.ghgCategory === item.id) {
          item.disabled = false;
        } else {
          item.disabled = true;
        }
      });
    }
    setGHGFirstSelect(GHGFirstSelects);
    setGhgSecondSelect(ghgSeconde);

    setIsoFirstSelect(ISOFirstSelects);
    setIsoSecondSelect(isoSecend);
  };

  const getSupplierListData = () => {
    apiSupplierList({ status: 1 }).then(({ data }) => {
      const result =
        data.rows.map(item => ({
          label: item.companyName,
          value: String(item.supplierId),
          parmasId: item.supplierId,
          email: item.email,
        })) || [];

      setSupplierList(result);
    });
  };
  const columns: any = FactorGasTableColumns({
    isDisabled: pageType,
    factorId,
    menuList,
    cascaderOptions,
    setFactorDatas: setNumberFactorDatas,
    changeDenominator,
    fillType,
  });

  // const columns = [];
  /** 基础信息表单 */
  const basicsFormProps: FormProps = {
    ...formPropsInit(),
    form,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
    preserve: true,
  };
  const getDetailData = async () => {
    if (!history.location.pathname.includes('Detail')) {
      await getGasList();
    }
    let api;
    if (history.location.pathname.includes('Copy')) {
      api = apiSourceQueryCopy;
    } else {
      api =
        isChaniApi === 'true' ? apiSourceQueryChianInfo : apiSourceQueryInfo;
    }
    Promise.all([
      apiMnumListALLByDictTypeBatch({ dictTypes: 'factorUnitM' }),
      apiListALLByDictTypeData({ dictType: 'factorUnitM' }),
      api(id),
    ])
      .then(([unitMListRes, unitMTreeRes, data]) => {
        // setEditFactor(true);

        form.setFieldsValue({
          ...data.data.data,
          factorPublic:
            data.data.data.factorPublic && moment(data.data.data.factorPublic),
          activityUnit: transUnit(unitMListRes, unitMTreeRes, data),
          expireTime:
            data.data.data.expireTime && moment(data.data.data.expireTime),
          year: data.data.data.year && moment(data.data.data.year),
          unitmSupplier: data.data.data.unitmSupplier?.split(','),
          dataType: data.data.data.dataType || 1,
          borderType: data.data.data.borderType || 1,
        });
        const fillObj = {
          1: 'emissionFactor',
          2: 'newFactor',
          3: 'supplierData',
        };
        setFillType(fillObj[data.data.data.fdType || 1]);
        const ghgSeconde = GHGSecondSelect.filter(
          item => item.pid === data.data.data.ghgCategory,
        );
        const isoSecend = ISOSecondSelect.filter(
          item => item.pid === data.data.data.isoCategory,
        );
        setGhgSecondSelect(ghgSeconde);
        setIsoSecondSelect(isoSecend);
        setSupportMaterialsList(data.data.data.supportImg || []);

        !factorId && setNumberFactorDatas(data.data.data?.factorGasList || []);
        transFactorUnit(unitMTreeRes, data);
        if (isChaniApi === 'true') {
          GHGFirstSelects.forEach((item: any) => {
            if (data.data.data.ghgCategory === item.id) {
              item.disabled = false;
            } else {
              item.disabled = true;
            }
          });
          setGHGFirstSelect(GHGFirstSelects);
          ISOFirstSelects.forEach((item: any) => {
            if (data.data.data.isoCategory === item.id) {
              item.disabled = false;
            } else {
              item.disabled = true;
            }
          });
          setIsoFirstSelect(ISOFirstSelects);
        }

        return apiSupplierList({ status: 1 });
      })
      .then(({ data }) => {
        const list =
          data?.rows?.map(item => ({
            label: item.companyName,
            value: String(item.supplierId),
            parmasId: item.supplierId,
            email: item.email,
          })) || [];
        setSupplierId(
          list?.find(item => item.label === form.getFieldValue('supplierName'))
            ?.value,
        );
        const supplierNameInput = form.getFieldValue('supplierName');
        const isInList = list.find(item => item.label === supplierNameInput);
        if (!isInList && supplierNameInput) {
          list.push({
            value: supplierNameInput,
            label: supplierNameInput,
            parmasId: NaN,
            email: form.getFieldValue('email'),
          });
        }
        setSupplierList(list);
      });
  };
  const getLableList = type => {
    apiLabelList({ type }).then(({ data }: { data: any }) => {
      const optionData = data.map((item, index) => ({
        ...item,
        label: item.labelname,
        value: index,
        user: item.flag,
      }));
      if (type === 0) {
        setActivityRecordWayList(optionData);
      } else {
        setActivityDeptList(optionData);
      }
    });
  };
  useEffect(() => {
    culDisAbled();
    listALLByDictTypeBatch({ dictTypes: 'cequivalentUnitZ' }).then(
      ({ data }) => {
        const list = data.data.cequivalentUnitZ.map(item => ({
          label: item.dictLabel,
          value: item.dictValue,
        }));
        setCequivalentUnitZ(list);
      },
    );
    getLableList(0);
    getLableList(1);
    apiMnumListALLByDictTypeBatchFn();
    apiListALLByDictTypeDataFn();
    // 跳转选择因子后返回本页面的反显处理
    const emsInfo = JSON.parse(sessionStorage.getItem('emssionInfo') || '{}');

    const keys = Object.keys(emsInfo);
    if (keys.length) {
      keys.forEach(key => {
        if (key === 'isoCategory') {
          if (classifyType !== '2') {
            const isoFirst = ISOFirstSelects.map(item => ({
              ...item,
              disabled: emsInfo[key] !== item.id,
            }));
            setIsoFirstSelect(isoFirst);
          }
          setIsoFirstSelect(ISOFirstSelects);
        }
        if (key === 'ghgCategory') {
          if (classifyType !== '2') {
            const ghgFirst = GHGFirstSelect.map(item => ({
              ...item,
              disabled: emsInfo[key] !== item.id,
            }));
            setGHGFirstSelect(ghgFirst);
          }
          setGHGFirstSelect(GHGFirstSelect);
        }
        if (key === 'isoClassify') {
          const secondSelect = ISOSecondSelect.filter(
            item => item.pid === emsInfo.isoCategory,
          );

          setIsoSecondSelect(secondSelect);
        }
        if (key === 'ghgClassify') {
          const secondSelect = GHGSecondSelect.filter(
            item => item.pid === emsInfo.ghgCategory,
          );
          setGhgSecondSelect(secondSelect);
        }
        if (key === 'supportImg') {
          setSupportMaterialsList(emsInfo[key]);
        }
        if (key === 'gasList') {
          setNumberFactorDatas(emsInfo[key]);
        }
      });
      setTimeout(() => {
        form.setFieldsValue({
          ...form.getFieldsValue(true),
          ...emsInfo,
          factorPublic: emsInfo.factorPublic && moment(emsInfo.factorPublic),
        });
      }, 200);
    } else if (id) {
      setTimeout(() => {
        getDetailData();
        isChaniApi !== 'true' && getGasList();
      }, 400);
    }
    if (!id) {
      getSupplierListData();
      apiSourceDefaultValue().then((res: any) => {
        form.setFieldsValue({
          ...form.getFieldsValue(true),
          sourceId: res.data.data.sourceId,
          dataType: 1,
          borderType: 1,
        });
      });
      getGasList();
    }
  }, []);
  const changUnitApi = (unitOne, unitTwo) => {
    if (unitOne && unitTwo) {
      apiUnitExchange({ unitOne, unitTwo }).then((res: any) => {
        form.setFieldsValue({
          ...form.getFieldsValue(true),
          unitConver: res.data.data.unitValue,
        });
      });
    }
  };

  const {
    baseFormItems,
    activeFormItems,
    evaluateFormItems,
    gasEmissionFormItems,
    supplierDataFormItems,
    GWPInfo,
  } = getEmmissionPageInfo({
    pageType,
    form,
    cascaderOptions,
    classifyType,
    gHGFirstSelect,
    ghgSecondSelect,
    isoFirstSelect,
    isoSecondSelect,
    factorId,
    numberFactorDatas,
    columns,
    setActUnit,
    changUnitApi,
    factorUnit,
    activityRecordWayList,
    setGhgSecondSelect,
    setIsoSecondSelect,
    getLableList,
    activityDeptList,
    pathname: history.location.pathname,
    // editFactor,
    setSupplierList,
    supplierList,
    supplierItem,
    fillType,
    showSourceId: !!Object.keys(computationObj).length,
    cequivalentUnitZ,
    isDict: false,
  });
  gasEmissionFormItems.push(GWPInfo);
  activeFormItems.unshift({
    label: I18N.carbonFootprint3.activityData,
    name: 'activityData',
    type: 'inputNumber',
    rules: pageType !== 'detail',
    placeholder: I18N.carbonFootprint.pleaseEnter,
    props: {
      disabled: pageType === 'detail',
    },
  });
  const uploadItem: any = [
    {
      label: '',
      name: 'supportImg',
      type: 'render',
      rules: false,
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 12,
      render() {
        return (
          <JavaUpload
            useMoreType
            aria-label='emission_to_upload'
            fileList={supportMaterialsList}
            onFileCountChange={(flie: RcFile) => {
              const { name } = flie;
              const typeFile = name.split('.');
              const fileType = [
                'xls',
                'xlsx',
                'pdf',
                'jpg',
                'png',
                'doc',
                'docx',
                'jpeg',
                'rar',
                'zip',
              ];

              if (
                !fileType.includes(typeFile[typeFile.length - 1].toLowerCase())
              ) {
                Toast(
                  'error',
                  I18N.template(I18N.enterpriseCarbonAccount2.onlySupportsFi4, {
                    val1: fileType.join(','),
                  }),
                );
                return true;
              }

              if (supportMaterialsList.length >= 10) {
                Toast('warn', I18N.carbonFootprint3.maximumNumberOfFiles);
                return true;
              }
              return false;
            }}
            onChange={(file: any) => {
              const newArr = file?.fileList?.map((item, index) => {
                if (item.status === 'done' && item.originFileObj) {
                  if (item.response.code === 200) {
                    return {
                      url: item.response.data,
                      uid: index,
                      name: item.name,
                    };
                  }
                }
                return item;
              });

              setSupportMaterialsList([...newArr]);
            }}
            onRemove={(e: any) => {
              supportMaterialsList.forEach(
                (item: { uid: string }, index: number) => {
                  if (item.uid === e.uid) {
                    supportMaterialsList.splice(index, 1);
                  }
                },
              );
              setSupportMaterialsList([...supportMaterialsList]);
            }}
            maxCount={10}
            disabled={pageType === 'detail'}
            maxSize={10 * 1024 * 1024}
          />
        );
      },
    },
  ];
  /** 保存时获取供应商名称 */
  const generaterSupplierName = () => {
    const supplierName = form.getFieldValue('supplierName');
    if (!supplierName) return null;
    // parmasId  供应商id
    const hasItem = supplierList.find(item => item.value === supplierName);

    return {
      label: hasItem?.label || supplierName,
      // 自定义供应商 不传id
      value: Number.isNaN(hasItem?.parmasId) ? '' : hasItem?.value,
    };
  };

  const saveSupplierData = ({ status, submitType }) =>
    form.validateFields().then(values => {
      setSaveLoading(true);
      values = {
        ...values,
        supportImg: supportMaterialsList,
        supplierName: generaterSupplierName()?.label,
        supplierId: generaterSupplierName()?.value || supplierId,
        id: id || null,
        unitmSupplier: values.unitmSupplier?.join(','),
        activityUnit: values.activityUnit.length && values.activityUnit[1],
        expireTime: moment(values.expireTime).format('YYYY-MM-DD'),
        year: values?.year ? moment(values.year).format('YYYY') : '',
        categoryId,
        submitType,
        status,
        fdType:
          fillType === 'emissionFactor' ? 1 : fillType === 'newFactor' ? 2 : 3,
        activityDept:
          typeof form.getFieldValue('activityDept') === 'number'
            ? activityDeptList.find(
                item => form.getFieldValue('activityDept') === item.value,
              )?.label
            : form.getFieldValue('activityDept'),
        activityRecordWay:
          typeof form.getFieldValue('activityRecordWay') === 'number'
            ? activityRecordWayList.find(
                item => form.getFieldValue('activityRecordWay') === item.value,
              )?.label
            : form.getFieldValue('activityRecordWay'),
      };
      if (pageType === 'add' || pageType === 'copy') {
        apiSourceSupplierAdd(values).then(({ data }: { data: any }) => {
          if (data.code === 200) {
            Toast(
              'success',
              pageType === 'add'
                ? I18N.carbonFootprint.newSuccessfullyAdded2
                : I18N.carbonFootprint3.copySuccessful,
            );
            sessionStorage.removeItem('factorId');
            sessionStorage.removeItem('emssionInfo');
            history.goBack();
            setSaveLoading(false);
          }
        });
      } else if (['edit', 'draf'].includes(pageType)) {
        apiSourceSupplierEdit(values).then(({ data }: { data: any }) => {
          if (data.code === 200) {
            Toast('success', I18N.carbonFootprint.editSuccessful);
            sessionStorage.removeItem('factorId');
            sessionStorage.removeItem('emssionInfo');
            history.goBack();
            setSaveLoading(false);
          }
        });
      }
    });

  const renturnBtnArr = () => {
    const draft = {
      type: 'default',
      key: 1,
      title: I18N.carbonFootprint3.saveAsDraft,
      onClick: async () => {
        const values = form.getFieldsValue(true);
        if (!values.name) {
          Toast('warn', I18N.enterpriseCarbonAccount2.pleaseFillInEmissions);
          return;
        }
        const data = {
          ...values,
          fdType:
            fillType === 'emissionFactor'
              ? 1
              : fillType === 'newFactor'
              ? 2
              : 3,
          supportImg: supportMaterialsList,
          factorPublic: moment(values.factorPublic).format('YYYY'),
          factorGasList: numberFactorDatas,
          categoryId,
          status: 0,
          supplierName: generaterSupplierName()?.label,
          factorId: factorId || form.getFieldValue('factorId'),
          id: id || null,
          activityUnit: values.activityUnit?.length && values.activityUnit[1],
        };
        const api = id && pageType !== 'copy' ? apiSourceEdit : apiSourceAdd;
        api(data).then((res: any) => {
          if (res.data.code === 200) {
            Toast('success', I18N.carbonFootprint.operationSuccessful);
            sessionStorage.removeItem('factorId');
            sessionStorage.removeItem('emssionInfo');
            setTimeout(() => {
              history.goBack();
            }, 500);
          }
        });
      },
    };
    const cancel = {
      type: 'default',
      key: 2,
      title:
        pageType === 'detail'
          ? I18N.carbonFootprint.return
          : I18N.carbonFootprint.cancel,
      onClick: async () => {
        history.goBack();
        sessionStorage.removeItem('factorId');
        sessionStorage.removeItem('emssionInfo');
      },
    };
    const save = {
      type: 'primary',
      title: I18N.carbonFootprint.preserve,
      key: 3,
      onClick: async () => {
        form.validateFields().then(() => {
          const values = form.getFieldsValue();
          const data = {
            ...values,
            supplierName: generaterSupplierName()?.label,
            supportImg: supportMaterialsList,
            factorPublic: moment(values.factorPublic).format('YYYY'),
            expireTime: moment(values.expireTime).format('YYYY'),
            year: moment(values.year).format('YYYY'),
            factorGasList: numberFactorDatas,
            categoryId,
            status: 1,
            fdType:
              fillType === 'emissionFactor'
                ? 1
                : fillType === 'newFactor'
                ? 2
                : 3,
            factorId: factorId || form.getFieldValue('factorId'),
            id: id || null,
            activityUnit: values.activityUnit.length && values.activityUnit[1],
            activityDept:
              typeof form.getFieldValue('activityDept') === 'number'
                ? activityDeptList.find(
                    item => form.getFieldValue('activityDept') === item.value,
                  )?.label
                : form.getFieldValue('activityDept'),
            activityRecordWay:
              typeof form.getFieldValue('activityRecordWay') === 'number'
                ? activityRecordWayList.find(
                    item =>
                      form.getFieldValue('activityRecordWay') === item.value,
                  )?.label
                : form.getFieldValue('activityRecordWay'),
            unitmSupplier: values.unitmSupplier?.join(','),
          };

          const api = id && pageType !== 'copy' ? apiSourceEdit : apiSourceAdd;
          api(data).then((res: any) => {
            if (res.data.code === 200) {
              Toast('success', I18N.carbonFootprint.operationSuccessful);
              sessionStorage.removeItem('factorId');
              sessionStorage.removeItem('emssionInfo');
              setTimeout(() => {
                history.goBack();
              }, 500);
            }
          });
        });
      },
    };

    const saveGetSupplierData = {
      type: 'primary',
      key: 4,
      title: I18N.carbonFootprint3.saveAndGet,
      loading: saveLoading,
      onClick: async () => saveSupplierData({ status: 1, submitType: 2 }),
    };
    const saveSupplier = {
      type: 'primary',
      key: 5,
      title: I18N.carbonFootprint.preserve,
      loading: saveLoading,
      onClick: async () => saveSupplierData({ status: 1, submitType: 1 }),
    };
    const saveSupplierDraft = {
      type: 'default',
      key: 6,
      title: I18N.carbonFootprint3.saveAsDraft,
      onClick: async () => saveSupplierData({ status: 0, submitType: null }),
    };
    if (pageType === 'add' || pageType === 'copy' || pageType === 'draf') {
      if (fillType === 'supplierData') {
        return [saveGetSupplierData, saveSupplier, saveSupplierDraft, cancel];
      }
      return [save, draft, cancel];
    }
    if (pageType === 'edit') {
      if (fillType === 'supplierData') {
        return [saveGetSupplierData, saveSupplier, cancel];
      }

      return [save, cancel];
    }
    if (pageType === 'detail') {
      return [cancel];
    }
    return [cancel];
  };
  const clearFactor = () => {
    setFactorId('');
    sessionStorage.removeItem('factorId');
    apiSourceListGas({
      sourceCategoryId: categoryId,
    }).then((res: any) => {
      sessionStorage.setItem(
        'gasTemplate',
        JSON.stringify(res.data.data.gasList),
      );
      // setEditFactor(false);
      setNumberFactorDatas(res.data.data.gasList || []);
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        factorType: '',
        factorScore: '',
        factorSource: '',
        factorPublic: '',
      });
    });
  };
  return (
    <div className='emission-box enterprise-carbon-account2'>
      <Page
        breadCrumbs={
          !Object.keys(computationObj).length
            ? []
            : [
                {
                  title: I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
                  key: I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
                  href: `${RouteMaps.enterpriseCarbonAccountingcarbonDischarge} `,
                },
                {
                  title:
                    pageType === 'detail'
                      ? I18N.template(
                          I18N.enterpriseCarbonAccount2.accountingForNav,
                          { val1: navText[pageType] },
                        )
                      : I18N.enterpriseCarbonAccount2.emissionSourceManagement,
                  key: I18N.enterpriseCarbonAccount2.emissionSourceManagement,
                  href: `${RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionManage}?computationId=${computationObj?.computationId}&classifyType=${classifyType}&period=${computationObj?.period}&name=${computationObj?.name}`,
                },
                {
                  title:
                    pageType === 'detail'
                      ? I18N.template(
                          I18N.enterpriseCarbonAccount2.emissionSourceNa,
                          { val1: navText[pageType] },
                        )
                      : I18N.template(I18N.enterpriseCarbonAccount2.navTe, {
                          val1: navText[pageType],
                        }),
                  key:
                    pageType === 'detail'
                      ? I18N.template(
                          I18N.enterpriseCarbonAccount2.emissionSourceNa,
                          { val1: navText[pageType] },
                        )
                      : I18N.template(I18N.enterpriseCarbonAccount2.navTe, {
                          val1: navText[pageType],
                        }),
                },
              ]
        }
      >
        <div className='form-box'>
          <span className='title'>{I18N.carbonFootprint.basicInformation}</span>

          <FormItemUtil
            antdFormProps={basicsFormProps}
            formItems={baseFormItems}
            paddRight={30}
          />
        </div>
        <div className='form-box'>
          <span className='title'>{I18N.carbonFootprint3.activityData}</span>
          <FormItemUtil
            antdFormProps={basicsFormProps}
            formItems={activeFormItems}
            paddRight={30}
          />
        </div>
        <div className='form-box'>
          <span className='title'>
            {I18N.enterpriseCarbonAccount2.greenhouseGasEmissions}
          </span>
          <div className='radio-select flex-a-c'>
            {pageType === 'detail'
              ? radioSelect?.map(item => {
                  if (item.value === fillType) {
                    return (
                      <div className='item flex-a-c flex-j-c true'>
                        {item.label}
                      </div>
                    );
                  }
                  return '';
                })
              : radioSelect?.map(item => (
                  <div
                    className={`item flex-a-c flex-j-c ${
                      fillType === item.value
                    }`}
                    onClick={() => {
                      setFillType(item.value);

                      if (item.value === 'emissionFactor') {
                        setFactorId('emissionFactor');
                      } else if (item.value === 'newFactor') {
                        clearFactor();
                      }
                    }}
                  >
                    <img
                      className={fillType === item.value ? 'act' : 'none'}
                      src={tabSelectImg}
                      alt=''
                    />
                    {item.label}
                  </div>
                ))}
          </div>
          <div className='flex-d-c'>
            {pageType === 'detail' || fillType === 'supplierData' ? (
              ''
            ) : (
              <div className='flex-j-b flex-a-c height-32'>
                <span>{I18N.enterpriseCarbonAccount2.emissionFactors2}</span>
                <div>
                  {/* {factorId ? (
                    <Button
                      type='default'
                      style={{ marginRight: 20 }}
                      onClick={clearFactor}
                    >
                      取消选择
                    </Button>
                  ) : (
                    ''
                  )} */}
                  <Button
                    type='primary'
                    onClick={() => {
                      sessionStorage.setItem(
                        'emssionInfo',
                        JSON.stringify({
                          ...form.getFieldsValue(true),
                          supportImg: supportMaterialsList,
                          gasList: numberFactorDatas,
                        }),
                      );
                      const name = form.getFieldValue('name') || '';
                      setFactorRecordData({
                        getFactorDataFrom: I18N.template(
                          I18N.enterpriseCarbonAccount2
                            .carbonEmissionAccounting5,
                          { val1: categoryName },
                        ),
                      });
                      const factorM =
                        form.getFieldValue('activityUnit')?.[1] || '';

                      history.push(
                        `${RouteMaps.enterpriseCarbonAccountingcarbonDischargeSelectFactor}?name=${name}&factorUnitM=${factorM}`,
                      );
                    }}
                  >
                    {I18N.carbonFootprint3.chooseEmissionFactors}
                  </Button>
                </div>
              </div>
            )}
            {fillType === 'emissionFactor' || fillType === 'newFactor' ? (
              <FormItemUtil
                antdFormProps={basicsFormProps}
                formItems={gasEmissionFormItems}
                paddRight={30}
              />
            ) : (
              <FormItemUtil
                antdFormProps={basicsFormProps}
                formItems={supplierDataFormItems}
                paddRight={30}
              />
            )}
          </div>
        </div>
        {(fillType === 'emissionFactor' || fillType === 'newFactor') && (
          <div className='form-box'>
            <span className='title'>
              {I18N.enterpriseCarbonAccount2.emissionFactorAssessment2}
            </span>

            <FormItemUtil
              antdFormProps={basicsFormProps}
              formItems={evaluateFormItems}
              paddRight={30}
            />
          </div>
        )}
        <div className='form-box'>
          <span className='title'>
            {I18N.carbonFootprint3.supportingMaterials}
          </span>
          {pageType === 'detail' ? (
            ''
          ) : (
            <span className='tip'>
              {I18N.enterpriseCarbonAccount2.supportPdf3}
            </span>
          )}
          <FormItemUtil
            antdFormProps={basicsFormProps}
            formItems={uploadItem}
            paddRight={30}
          />
        </div>
      </Page>
      {/* @ts-ignore */}
      <FormActions place='center' buttons={renturnBtnArr()} />
    </div>
  );
};
export default EmissionFormPage;
