/*
 * @@description:排放源 新增 复制 编辑 详情  核算排放源  核算模型排放源
 * @Author: lixingchen qifeng@carbonstop.net
 * @Date: 2022-11-07 10:51:29
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-18 15:33:32
 */
import { InfoCircleOutlined } from '@ant-design/icons';
import tabSelectImg from '@assets/images/icon_radio_selected.svg';
import referenceActiveImg from '@assets/svg/icon-new-product-model-active.svg';
import referenceDefaultImg from '@assets/svg/icon-new-product-model.svg';
import { Text } from '@components/formily/components/Text';
import {
  FormLayout,
  FormGrid,
  FormItem,
  Radio,
  Input,
  Cascader,
  Select,
  DatePicker,
  NumberPicker,
} from '@formily/antd-v5';
import {
  createForm,
  Field as FieldType,
  onFieldInputValueChange,
  onFieldValueChange,
} from '@formily/core';
import { createSchemaField, Field } from '@formily/react';
import { toJS } from '@formily/reactive';
import { listALLByDictTypeBatch } from '@src/api/api';
import { FormActions } from '@src/components/FormActions';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import SearchFactorDetail from '@src/components/SearchFactor/FactorDetail';
import SearchModalFactor from '@src/components/SearchFactor/ModalFactor';
import { SerachCarbonFactorResult } from '@src/components/SearchFactor/type';
import useFiledUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { PageInfoType, PathParamsType } from '@src/router/type';
import {
  GET9f98ab73509d2186fc4d4ad1876a7223,
  POSTc457e5a2a7b767c9ce0e2ceac8c32f67,
} from '@src/sdks_v2/enterpriseV2ApiDocs';
import { Toast } from '@src/utils/Toast';
import { CO2E } from '@src/views/carbonInternational/organizationalManagement/utils';
import {
  ColUmsType,
  apiListALLByDictTypeData,
  apiMnumListALLByDictTypeBatch,
} from '@src/views/emission/Show/service';
import { Dicts } from '@src/views/emission/Show/type';
import {
  ISOSecondSelect,
  GHGSecondSelect,
} from '@src/views/enterpriseCarbonAccount2/listInfo/util';
import {
  apiUnitExchange,
  apiSourceDefaultValue,
  apiModelSourceQueryInfo,
  isBuySupplier,
} from '@src/views/enterpriseCarbonAccount2/service';
import '../style.less';
import { titleTip } from '@src/views/enterpriseCarbonAccount2/utils';
import { apiSupplierList } from '@src/views/supplyChain2/SupplierManage/service';
import { useMount } from 'ahooks';
import { Button, Form, FormProps, Modal, Tooltip } from 'antd';
import classNames from 'classnames';
import { compact, isNil, isUndefined, last, omit } from 'lodash-es';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState, FC } from 'react';
import { useParams } from 'react-router-dom';

import FormilyMethodSelect from '@/components/FormilyMethodSelect';
import { sleep } from '@/utils';
import { PARAM_TYPE } from '@/views/enterpriseCarbonAccount2/FormulaSetting/constant';
import { EVersionType } from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';
import ProductFootprintAccountSelector, {
  getFactorUnitDenominator,
  ProductFootprintAccountSelection,
} from '@/views/enterpriseCarbonAccount2/components/ProductFootprintAccountSelector';
import { canAssociateProductFootprint } from '@/views/enterpriseCarbonAccount2/productFootprintAssociation/condition';
import { openProductFootprintSnapshotDetail } from '@/views/enterpriseCarbonAccount2/productFootprintAssociation/navigation';
import { createProductFootprintSnapshot } from '@/views/enterpriseCarbonAccount2/productFootprintAssociation/service';
import { RegFActorObjRate } from '@/views/carbonFootprint3/util';

import {
  ACCOUNT_REFERENCE_WAY,
  ACTIVITY_TYPE,
  ACTIVITY_TYPE_LABEL,
} from './constant';
import AccountingReferencePanel, {
  AccountingReferenceValue,
} from './components/AccountingReferencePanel';
import style from './index.module.less';
import {
  baseInfoSchema,
  activitySchema,
  supplierDataFormItems,
} from './schema';
import {
  getFormulaList,
  getMatchEmissionCount,
  getMatchEmissionList,
} from './service';
import { DictSource, FdType, ManualFactorData } from './types';
import { convertApi2Factor, convertApi2ManaulFactor } from './utils';
import { SupplierOptions } from '../../emissionAccount/emissionManage/emissionFormPage';
import {
  apiSourceAdd,
  apiSourceInfo,
  apiSourceInfoByShare,
  apiSourceSteptwoEdit,
  checkEmissionDataConsistency,
  editTempSource,
  getTempSourceInfo,
} from '../../emissionAccount/service';
import { activityUnitCovers } from '../../emissionAccount/utils';
import { AddFactorModal } from '../AddFactorModal';
import { defaultFactorData } from '../AddFactorModal/utils';
import FactorCard from '../FactorCard';
import MatchEmissionListModal from '../MatchEmissionListModal';
import { SelectFormily } from '../Selector';

const selectTab: {
  label: string;
  key: string;
  defalutIcon: string;
  actIcon: string;
}[] = [
  {
    label: I18N.carbonFootprint3.factorInformation,
    key: 'fill',
    defalutIcon:
      'https://carbonstop-saas.oss-cn-beijing.aliyuncs.com/saas-product/product-icon/icon_factor-default.svg',
    actIcon:
      'https://carbonstop-saas.oss-cn-beijing.aliyuncs.com/saas-product/product-icon/icon_factor-act.svg',
  },
  {
    label: I18N.carbonFootprint3.initiateCollection,
    key: 'supplier',
    defalutIcon:
      'https://carbonstop-saas.oss-cn-beijing.aliyuncs.com/saas-product/product-icon/icon_shoushu-default.svg',
    actIcon:
      'https://carbonstop-saas.oss-cn-beijing.aliyuncs.com/saas-product/product-icon/icon_shoushu-act.svg',
  },
  {
    label: I18N.enterpriseCarbonAccount2.accountingReference,
    key: 'reference',
    defalutIcon: referenceDefaultImg,
    actIcon: referenceActiveImg,
  },
];

const resolveReferenceUnitRate = async (unitOne?: string, unitTwo?: string) => {
  if (!unitOne || !unitTwo) return '';
  const { data } = await apiUnitExchange({ unitOne, unitTwo });
  return data.data.unitValue || '';
};

type AccountAddEmissionProps = {
  pageInfoType?: PageInfoType;
  fromType?: string;
  computationId?: string;
  computationPeriod?: string;
  id?: string;
  modelId?: string;
  hide?: () => void;
  addSuccess?: () => void;
  fromSource?: 'accounting' | 'model';
  dictSourceId?: string;
  readPretty?: boolean;
  initGhgCategory?: string;
  initGhgClassify?: string;
  isShare?: boolean;
  isTemp?: boolean;
  groupId?: number;
  versionType?: EVersionType;
  agentPreviewLayout?: boolean;
  sessionId?: string;
  shareId?: string;
  enableProductFootprintAssociation?: boolean;
};

type SelectedAccountingReference = ProductFootprintAccountSelection & {
  snapshotAccountId: string | number;
};

const AccountAddEmission: FC<AccountAddEmissionProps> = props => {
  const {
    initGhgCategory,
    initGhgClassify,
    groupId,
    versionType,
    enableProductFootprintAssociation = false,
  } = props;
  const isAdd = props.pageInfoType === PageInfoType.add;

  const search = new URLSearchParams(location.search?.slice(1));
  const [matchEmissionListModalVisible, setMatchEmissionListModalVisible] =
    useState(false);
  const freezeCalcUnitRatio = useRef(false);
  const skipReferenceRateCalculation = useRef(false);
  const [matchEmissionName, setMatchEmissionName] = useState('');
  const modelId = search.get('modelId') || props.modelId;
  const {
    hide,
    addSuccess,
    fromSource = 'accounting',
    dictSourceId,
    isShare,
    isTemp,
    readPretty = false,
    agentPreviewLayout = false,
    sessionId,
    shareId,
  } = props;
  const {
    id = props.id,
    pageInfoTypeName = props.pageInfoType,
    fromType = props.fromType,
    computationId = props.computationId,
  } = useParams<
    { id: string; fromType: string; computationId: string } & PathParamsType
  >();
  const sourceId = useRef<string | undefined>(id);
  const [cascaderOptions, getCascaderOptions] = useState<any[]>([]);
  const [supplierList, setSupplierList] = useState<SupplierOptions[]>([
    { label: '', value: '', parmasId: '', email: '' },
  ]);

  const activityTypeOptions = useMemo(
    () =>
      Object.values(ACTIVITY_TYPE)
        .filter(value => !agentPreviewLayout || value !== ACTIVITY_TYPE.FORMULA)
        .map(value => ({
          value,
          label: ACTIVITY_TYPE_LABEL[value],
        })),
    [agentPreviewLayout],
  );
  const [showModalFactor, setShowModalFactor] = useState(false);
  const [showIsDic, setShowIsDic] = useState(false);
  const [showFillFactor, setShowFillFactor] = useState(false);
  const [showFactorDetail, setShowFactorDetail] = useState(false);
  const [activityUnitCode, setActivityUnitCode] = useState('');
  const [supplierId, setSupplierId] = useState<any>();

  const [fillType, setFillType] = useState('fill');
  const [activeDetailTab, setActiveDetailTab] = useState('fill');
  const [currentGhgCategory, setCurrentGhgCategory] = useState(initGhgCategory);
  const [currentGhgClassify, setCurrentGhgClassify] = useState(initGhgClassify);
  const [detailReference, setDetailReference] =
    useState<AccountingReferenceValue>();
  const [selectedAccounting, setSelectedAccounting] =
    useState<SelectedAccountingReference>();
  const [unitConverError, setUnitConverError] = useState('');
  const [referenceSelectorOpen, setReferenceSelectorOpen] = useState(false);

  const showAccountingReference =
    enableProductFootprintAssociation &&
    canAssociateProductFootprint({
      versionType,
      ghgCategory: currentGhgCategory,
      ghgClassify: currentGhgClassify,
    });
  // 因子气体信息
  const [factorType, setFactorType] = useState<FdType>(FdType.autoMatch);

  const [prevFactorType, setPrevFactorType] = useState<FdType>();

  // 因子单位 分母
  const [factorUnitM, setFactorUnitM] = useState<Dicts[]>();
  /** 搜索的因子数据 */
  const [factorData, setFactorData] = useState<SerachCarbonFactorResult>();
  // 手动录入的因子
  const [manualFactorData, setManualFactorData] = useState<ManualFactorData>();
  const currentFactorData =
    factorType === FdType.manual || factorType === FdType.importFactor
      ? manualFactorData
      : factorType === FdType.select
      ? factorData
      : undefined;
  const [activityUnitList, setActivityUnitList] = useState<Dicts[]>([]);
  // 因子单位 分子
  const [factorUnitZ, setFactorUnitZ] = useState<Dicts[]>();
  const activityUnit =
    activityUnitCovers(activityUnitCode, activityUnitList) || '';

  const selectedReference: AccountingReferenceValue | undefined =
    selectedAccounting
      ? {
          accountId: selectedAccounting.snapshotAccountId,
          factorName: selectedAccounting.accountName,
          productName: selectedAccounting.productName,
          factorValue: selectedAccounting.factor,
          factorUnit: selectedAccounting.factorUnit,
          factorUnitM: selectedAccounting.unitCode,
          activityData: selectedAccounting.activityData,
          referWay: ACCOUNT_REFERENCE_WAY.RESULT,
        }
      : undefined;
  const displayReference = selectedReference ?? detailReference;
  const hasDisplayReference = Boolean(displayReference);
  const referenceDetailAccountId =
    selectedAccounting?.snapshotAccountId ?? detailReference?.supplyAccountId;
  const detailFactorUnitCode = detailReference?.factorUnitM?.split(',')?.[1];
  const detailFactorUnitZName =
    factorUnitZ?.find(item => item.dictValue === detailReference?.factorUnit)
      ?.dictLabel || '';
  const detailFactorUnitMName =
    factorUnitM?.find(item => item.dictValue === detailFactorUnitCode)
      ?.dictLabel || '';
  const displayFactorUnitName = selectedAccounting
    ? selectedAccounting.factorUnit || ''
    : [detailFactorUnitZName, detailFactorUnitMName].filter(Boolean).join('/');
  const displayFunctionalUnitName = selectedAccounting
    ? getFactorUnitDenominator(selectedAccounting.factorUnit)
    : detailFactorUnitMName;

  const [showSupplier, setShowSupplier] = useState(false);

  useMount(async () => {
    if (isShare || agentPreviewLayout) {
      return;
    }
    const bayedSupplier = await isBuySupplier();
    setShowSupplier(bayedSupplier?.data?.data);
  });
  const supplierItem = useRef<SupplierOptions>({
    label: '',
    value: '',
    parmasId: '',
    email: '',
  });
  const FormaliyForm = useMemo(
    () =>
      createForm({
        readPretty,
        initialValues: {
          groupId: isNaN(Number(groupId)) ? undefined : Number(groupId),
        },
        effects() {
          const syncActivityUnit = (unitCode?: string) => {
            setActivityUnitCode(unitCode || '');
          };
          onFieldValueChange('activityUnit', field => {
            syncActivityUnit(field.value?.[1]);
          });
          onFieldInputValueChange('methodObj', field => {
            syncActivityUnit(field.value?.unit?.[1]);
          });
          onFieldInputValueChange('activityType', field => {
            setTimeout(() => {
              let unit = '';
              if (field.value === ACTIVITY_TYPE.EMISSION_FACTOR) {
                unit = FormaliyForm.values.activityUnit?.[1];
              } else if (field.value === ACTIVITY_TYPE.FORMULA) {
                unit = FormaliyForm.values.methodObj?.unit?.[1];
              }
              syncActivityUnit(unit);
            });
          });
        },
      }),
    [groupId],
  );

  const [supplierForm] = Form.useForm();
  const basicsFormProps: FormProps = {
    ...formPropsInit(),
    form: supplierForm,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
    preserve: true,
  };
  const supplierFormItems: any = supplierDataFormItems({
    form: supplierForm,
    cequivalentUnitZ: factorUnitZ,
    cascaderOptions,
    pageType: !isNil(id) && factorType === FdType.importFactor ? 'detail' : '',
    supplierItem,
    supplierList,
    setSupplierList,
  });

  const SchemaField = createSchemaField({
    // 组件列表
    components: {
      FormLayout,
      FormGrid,
      FormItem,
      Radio,
      Input,
      Cascader,
      Select,
      DatePicker,
      SelectFormily,
      Text,
      NumberPicker,
    },
  });

  useEffect(() => {
    if (!showAccountingReference && activeDetailTab === 'reference') {
      setActiveDetailTab('fill');
    }
  }, [activeDetailTab, showAccountingReference]);

  useEffect(() => {
    if (!showAccountingReference || !hasDisplayReference) return undefined;
    if (!activityUnit || !displayFunctionalUnitName) return undefined;
    if (skipReferenceRateCalculation.current) {
      skipReferenceRateCalculation.current = false;
      return undefined;
    }
    let cancelled = false;
    resolveReferenceUnitRate(activityUnit, displayFunctionalUnitName)
      .then(value => {
        if (!cancelled) {
          setUnitConver(value);
          setUnitConverError('');
        }
      })
      .catch(() => {
        if (!cancelled) setUnitConver('');
      });
    return () => {
      cancelled = true;
    };
  }, [activityUnit, displayFactorUnitName, hasDisplayReference]);

  const validateAccountingReference = () => {
    if (!showAccountingReference || activeDetailTab !== 'reference')
      return true;
    if (!displayReference) {
      Toast(
        'warn',
        I18N.enterpriseCarbonAccount2.pleaseSelectAccountingReference,
      );
      return false;
    }
    if (unitConver === undefined || unitConver === null || unitConver === '') {
      setUnitConverError(
        I18N.enterpriseCarbonAccount2.pleaseEnterUnitConversionRatio,
      );
      setActiveDetailTab('reference');
      return false;
    }
    const error = RegFActorObjRate(String(unitConver));
    setUnitConverError(error);
    if (error) setActiveDetailTab('reference');
    return !error;
  };

  const validateFactorInformation = () => {
    if (!showAccountingReference || activeDetailTab !== 'fill') return true;
    if (currentFactorData) return true;
    Toast('warn', I18N.components.notMatchedDueTo2);
    return false;
  };

  const getAccountingReferenceSubmitData = () =>
    showAccountingReference &&
    activeDetailTab === 'reference' &&
    selectedAccounting
      ? {
          fdType: FdType.accountReference,
          supplyAccountId: selectedAccounting.snapshotAccountId,
          factorName: selectedAccounting.accountName,
          productName: selectedAccounting.productName,
          factorValue: selectedAccounting.factor,
          factorUnitM: selectedAccounting.unitCode,
          activityData: selectedAccounting.activityData ?? null,
          referWay: ACCOUNT_REFERENCE_WAY.RESULT,
          unitConver,
        }
      : {};
  const closeEmissionDetail = () => {
    setSelectedAccounting(undefined);
    setReferenceSelectorOpen(false);
    hide?.();
  };
  const isoEffectId = 'iso-effect';
  const ghgEffectId = 'ghg-effect';
  const getFactorSource =
    /** 活动数据记录方式 0   活动数据保存部门 1  排放因子来源 2 */
    () =>
      GET9f98ab73509d2186fc4d4ad1876a7223({ type: 2 }).then(({ data }) => {
        if (data?.length) {
          return data;
        }
        return undefined;
      });
  const removeEffect = (id: typeof isoEffectId | typeof ghgEffectId) => {
    FormaliyForm.removeEffects(id);
  };
  const addIsoEffect = () => {
    FormaliyForm.addEffects(isoEffectId, () => {
      onFieldValueChange('.iso', field => {
        const { value } = field;
        const targetIso = ISOSecondSelect.find(c => c.id === value[1]);

        // 当前 ghg 选项值
        const currentGhgVal = FormaliyForm.values.ghg;
        // 当前 ghg 选项
        const currentGhg = GHGSecondSelect.find(
          c => c.commId === currentGhgVal?.[1],
        );
        // commid 不相等时向下执行
        if (targetIso && targetIso.commId !== currentGhg?.commId) {
          const targetGhg = GHGSecondSelect.find(
            c => c.commId === targetIso.commId,
          );
          if (targetGhg) {
            removeEffect(ghgEffectId);
            FormaliyForm.setValues({ ghg: [targetGhg.pid, targetGhg.id] });
            setTimeout(() => {
              addGhgEffect();
            });
          }
        }
      });
    });
  };
  const addGhgEffect = () => {
    FormaliyForm.addEffects(ghgEffectId, () => {
      onFieldValueChange('.ghg', field => {
        const { value } = field;
        setCurrentGhgCategory(value?.[0]);
        setCurrentGhgClassify(value?.[1]);
        const targetGhg = GHGSecondSelect.find(c => c.id === value[1]);
        // 当前 iso 选项值
        const currentIsoVal = FormaliyForm.values.iso;
        // 当前 iso 选项
        const currentIso = ISOSecondSelect.find(
          c => c.commId === currentIsoVal?.[1],
        );
        // commid 不相等时向下执行
        if (targetGhg && currentIso?.commId !== targetGhg.commId) {
          const targetIso = ISOSecondSelect.find(
            c => c.commId === targetGhg.commId,
          );
          if (targetIso) {
            removeEffect(isoEffectId);
            FormaliyForm.setValues({ iso: [targetIso.pid, targetIso.id] });
            FormaliyForm.clearErrors(['iso']);
            setTimeout(() => {
              addIsoEffect();
            });
          }
        }
      });
    });
  };
  // 单位换算比例
  const [unitConver, setUnitConver] = useState('');
  // 暂存的接口返回的因子数据，等待单位返回之后写入到因子state 中
  const [cachedFactor, setCachedFactor] = useState<DictSource>();
  // 转换因子数据 api 数据 => 正常因子数据
  const transUnit = (unitMListRes, unitMTreeRes, data) => {
    const unitMList = unitMListRes.data.data.factorUnitM;

    setActivityUnitList(unitMList);

    const unitMTree = unitMTreeRes.data.data;
    const sourceObj = unitMList.find(
      item => item.dictValue === data.activityUnit,
    );
    const sourceName = sourceObj?.sourceName;
    const dictValue = unitMTree.find(
      item => item.dictLabel === sourceName,
    )?.dictValue;
    return dictValue ? [dictValue, data.activityUnit] : undefined;
  };
  /** 保存时获取供应商名称 */
  const generaterSupplierName = () => {
    const supplierName = supplierForm.getFieldValue('supplierName');
    if (!supplierName) return null;
    // parmasId  供应商id
    const hasItem = supplierList.find(item => item.value === supplierName);

    return {
      label: hasItem?.label || supplierName,
      // 自定义供应商 不传id
      value: Number.isNaN(hasItem?.parmasId) ? '' : hasItem?.value,
    };
  };
  const saveData = async (syncDictFlag: number) => {
    await FormaliyForm.submit(async values => {
      await supplierForm.validateFields();
      const supplierSubData = supplierForm.getFieldsValue(true);
      if (!unitConver && fillType === 'fill') {
        return Toast('warn', I18N.enterpriseCarbonAccount2.pleaseFillInTheUnit);
      }
      let sourceId = '';
      if (pageInfoTypeName === PageInfoType.edit) {
        sourceId = values.sourceId;
      } else {
        // @ts-ignore
        sourceId = (await apiSourceDefaultValue()).data.data?.sourceId;
      }
      let result: DictSource = {
        ...values,
        fdType: fillType === 'supplier' ? FdType.importFactor : factorType,
        ghgCategory: values.ghg[0],
        ghgClassify: values.ghg[1],
        isoCategory: values.iso[0],
        isoClassify: values.iso[1],
        activityUnit: values.activityUnit?.[1],
        factorType: factorData?.factorType,
        unitConver,
        modelId,
        fromType: fromType === ':fromType' ? '' : fromType,
        computationId,
        computationPeriod: props.computationPeriod,
        syncDictFlag,
        sourceId,
        status: 1,
        ...supplierSubData,
        unitmSupplier: supplierSubData.unitmSupplier?.join(','),
        supplierData: fillType === 'fill' ? 0 : 1,
        unitCodeArr: values.activityUnit?.join(','),
      };
      // * 1 因子库选择 2 手动新建 4智能匹配
      // 手动选择

      if (
        (result.methodObj?.paramItem || []).some(
          param => param.paramType !== PARAM_TYPE.PERCENT && !param.defaultUnit,
        )
      ) {
        return Toast(
          'warn',
          I18N.enterpriseCarbonAccount2.pleaseFillInTheFormula,
        );
      }
      if (
        (factorType === FdType.manual || factorType === FdType.importFactor) &&
        manualFactorData
      ) {
        // 更改手动填写的逻辑。供应商收数暂时维持原逻辑，不敢动
        const originGasList =
          factorType === FdType.manual
            ? manualFactorData?.gasList
            : values?.gasList || manualFactorData?.gasList;
        const gasList = (originGasList as ColUmsType[])?.map(g => {
          if (g.type === 'g9') {
            return {
              ...g,
              factorValue: manualFactorData?.factorValue,
              factorUnit: manualFactorData.factorUnit,
              factorUnitM: manualFactorData?.factorUnitM?.join(','),
            };
          }
          return {
            ...g,
          };
        });

        result = {
          ...result,
          factorName:
            factorType === FdType.manual
              ? manualFactorData.name
              : manualFactorData.factorName || manualFactorData.name,
          factorScore:
            manualFactorData.factorScore || manualFactorData.factorType,
          factorPublic: manualFactorData.factorPublic,
          factorSource: manualFactorData.factorSource,
          factorType: manualFactorData.factorType,
          // @ts-ignore
          factorUnitM: manualFactorData.factorUnitM?.join(','),
          // @ts-ignore
          gasList,
          factorGasList: gasList,
        };
      } else if (factorData) {
        // 因子中返回的单位
        const unit = factorData?.unit?.split('/');
        // 翻译单位
        const factorUnit = factorUnitZ?.find(
          u => u.dictLabel === unit?.[0],
        )?.dictValue;
        const factorUnitMDict = factorUnitM?.find(
          u => u.dictLabel === unit?.[1],
        );
        const gasList = defaultFactorData().map(g => {
          if (g.greenhouseGasesType.includes(CO2E)) {
            return {
              ...g,
              factorValue: factorData?.cValue,
              factorUnit,
              factorUnitM: `${factorUnitMDict?.sourceType},${factorUnitMDict?.dictValue}`,
            };
          }
          return {
            ...g,
          };
        });

        result = {
          ...result,
          // @ts-ignore
          factorName: factorData?.name,
          factorScore: factorData?.factorType,
          factorSource: factorData?.sourceLevel,
          factorPublic: factorData?.year,
          // @ts-ignore
          factorId: factorData?.id,
          factorGasList: gasList,
          // @ts-ignore
          gasList,
        };
      }
      result = {
        ...result,
        ...getAccountingReferenceSubmitData(),
        submitType: fillType === 'fill' ? null : 2,
        supplierName: generaterSupplierName()?.label,
        supplierId: generaterSupplierName()?.value || supplierId,
      };
      if (pageInfoTypeName === PageInfoType.edit) {
        const editApi = isTemp ? editTempSource : apiSourceSteptwoEdit;
        return editApi(
          // @ts-ignore
          { ...result },
        ).then(({ data }) => {
          if (data.code === 200) {
            Toast('success', I18N.carbonFootprint.editSuccessful);
            addSuccess?.();
          }
        });
      }
      return apiSourceAdd({ ...result }).then(({ data }) => {
        if (data.code === 200) {
          Toast('success', I18N.carbonFootprint3.createdSuccessfully);
          addSuccess?.();
        }
      });
    });
  };

  const matchEmission = async (name: string) => {
    const field = FormaliyForm.query('name').take();
    if (pageInfoTypeName === PageInfoType.add && field) {
      let matchEmissionCount = 0;
      try {
        matchEmissionCount = (
          await getMatchEmissionCount({
            name,
            ghgClassify: initGhgClassify!,
            computationId: Number(computationId!),
          })
        ).data.data;
        if (matchEmissionCount > 0) {
          setMatchEmissionName(name);
        }
      } finally {
        field.setTitle(
          <div className={style.nameFieldTitle}>
            {titleTip(
              I18N.carbonFootprint3.emissionSourceName,
              I18N.enterpriseCarbonAccount2.generatingGreenhouseGas,
            )}
            {matchEmissionCount > 0 && (
              <div className={style.emissionTip}>
                {I18N.enterpriseCarbonAccount2.detectedSimilarity}
                <span
                  className={style.emissionViewBtn}
                  onClick={() => setMatchEmissionListModalVisible(true)}
                >
                  {I18N.carbonFootprint.check}
                </span>
              </div>
            )}
          </div>,
        );
      }
    }
  };

  const checkEmissionDataEdited = async () => {
    // 用原先的提交时data的取值逻辑
    try {
      const values = await FormaliyForm.submit<any>();
      await supplierForm.validateFields();
      const supplierSubData = supplierForm.getFieldsValue(true);
      if (!unitConver && fillType === 'fill') {
        return await Toast(
          'warn',
          I18N.enterpriseCarbonAccount2.pleaseFillInTheUnit,
        );
      }
      let sourceId = '';
      if (pageInfoTypeName === PageInfoType.edit) {
        sourceId = values.sourceId;
      } else {
        // @ts-ignore
        sourceId = (await apiSourceDefaultValue()).data.data?.sourceId;
      }
      let result: DictSource = {
        ...values,
        fdType: factorType,
        ghgCategory: values.ghg[0],
        ghgClassify: values.ghg[1],
        isoCategory: values.iso[0],
        isoClassify: values.iso[1],
        activityUnit: values.activityUnit?.[1],
        factorType: factorData?.factorType,
        unitConver,
        modelId,
        fromType: fromType === ':fromType' ? '' : fromType,
        computationId,
        sourceId,
        status: 1,
        ...supplierSubData,
        unitmSupplier: supplierSubData.unitmSupplier?.join(','),
        supplierData: fillType === 'fill' ? 0 : 1,
      };
      // * 1 因子库选择 2 手动新建 4智能匹配
      // 手动选择

      if (
        (factorType === FdType.manual || factorType === FdType.importFactor) &&
        manualFactorData
      ) {
        // 更改手动填写的逻辑。供应商收数暂时维持原逻辑，不敢动
        const originGasList =
          factorType === FdType.manual
            ? manualFactorData?.gasList
            : values?.gasList || manualFactorData?.gasList;
        const gasList = (originGasList as ColUmsType[])?.map(g => {
          if (g.type === 'g9') {
            return {
              ...g,
              factorValue: manualFactorData?.factorValue,
              factorUnit: manualFactorData.factorUnit,
              factorUnitM: manualFactorData?.factorUnitM?.join(','),
            };
          }
          return {
            ...g,
          };
        });

        result = {
          ...result,
          factorName:
            factorType === FdType.manual
              ? manualFactorData.name
              : manualFactorData.factorName || manualFactorData.name,
          factorScore:
            manualFactorData.factorScore || manualFactorData.factorType,
          factorPublic: manualFactorData.factorPublic,
          factorSource: manualFactorData.factorSource,
          factorType: manualFactorData.factorType,
          // @ts-ignore
          factorUnitM: manualFactorData.factorUnitM?.join(','),
          // @ts-ignore
          gasList,
          factorGasList: gasList,
        };
      } else if (factorData) {
        // 因子中返回的单位
        const unit = factorData?.unit?.split('/');
        // 翻译单位
        const factorUnit = factorUnitZ?.find(
          u => u.dictLabel === unit?.[0],
        )?.dictValue;
        const factorUnitMDict = factorUnitM?.find(
          u => u.dictLabel === unit?.[1],
        );
        const gasList = defaultFactorData().map(g => {
          if (g.greenhouseGasesType.includes(CO2E)) {
            return {
              ...g,
              factorValue: factorData?.cValue,
              factorUnit,
              factorUnitM: `${factorUnitMDict?.sourceType},${factorUnitMDict?.dictValue}`,
            };
          }
          return {
            ...g,
          };
        });

        result = {
          ...result,
          // @ts-ignore
          factorName: factorData?.name,
          factorScore: factorData?.factorType,
          factorSource: factorData?.sourceLevel,
          factorPublic: factorData?.year,
          // @ts-ignore
          factorId: factorData?.id,
          factorGasList: gasList,
          // @ts-ignore
          gasList,
        };
      }
      result = {
        ...result,
        ...getAccountingReferenceSubmitData(),
        submitType: fillType === 'fill' ? null : 2,
        supplierName: generaterSupplierName()?.label,
        supplierId: generaterSupplierName()?.value || supplierId,
      };
      const checkResult = await checkEmissionDataConsistency(result);
      return checkResult.data.data;
    } catch {
      return false;
    }
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
  useEffect(() => {
    if (cachedFactor && factorUnitZ?.length && factorUnitM?.length) {
      if (factorType === FdType.accountReference) return;
      if (factorType === FdType.manual || factorType === FdType.importFactor) {
        getFactorSource().then(() => {
          setManualFactorData(
            convertApi2ManaulFactor(cachedFactor, factorUnitM, factorUnitZ),
          );
        });
      } else {
        setFactorData(
          convertApi2Factor(cachedFactor, factorUnitM, factorUnitZ),
        );
      }
    }
  }, [cachedFactor, factorUnitM, factorUnitZ]);

  /** * 编辑、复制、详情获取数据 */
  useEffect(() => {
    getSupplierListData();
    const dealApiData = (result: DictSource, unitMListRes, unitMTreeRes) => {
      if (result) {
        const isAccountingReference = result.fdType === FdType.accountReference;
        skipReferenceRateCalculation.current = isAccountingReference;
        setCurrentGhgCategory(result.ghgCategory);
        setCurrentGhgClassify(result.ghgClassify);
        setActivityUnitCode(
          result.activityType === ACTIVITY_TYPE.FORMULA
            ? result.methodObj?.unit?.[1] || ''
            : result.activityUnit || '',
        );
        setDetailReference(isAccountingReference ? result : undefined);
        setSelectedAccounting(undefined);
        if (isAccountingReference) setActiveDetailTab('reference');
        const preserveApiGhgClassify = String(result.ghgClassify) === '10';

        if (preserveApiGhgClassify) {
          removeEffect(isoEffectId);
          removeEffect(ghgEffectId);
        }
        FormaliyForm.setValues({
          ...result,
          activityUnit: transUnit(unitMListRes, unitMTreeRes, result),
          iso: [result.isoCategory, result.isoClassify],
          ghg: [result.ghgCategory, result.ghgClassify],
        });
        if (preserveApiGhgClassify) {
          setTimeout(() => {
            addGhgEffect();
            addIsoEffect();
          });
        }
        setUnitConver(result.unitConver);
        setFactorType(result.fdType);
        setPrevFactorType(result.fdType);
        setCachedFactor(isAccountingReference ? undefined : result);
      }
    };
    if (pageInfoTypeName === PageInfoType.edit) {
      Promise.all([
        apiMnumListALLByDictTypeBatch({ dictTypes: 'factorUnitM' }),
        apiListALLByDictTypeData({ dictType: 'factorUnitM' }),
        fromSource === 'accounting'
          ? isTemp
            ? getTempSourceInfo(id)
            : isShare && !agentPreviewLayout
            ? apiSourceInfoByShare({
                id,
                computationId,
                companyId: search.get('companyId') || undefined,
              })
            : apiSourceInfo({
                fromType,
                id,
                computationId,
                sessionId,
                shareId,
              })
          : apiModelSourceQueryInfo({ dictSourceId, modelId }),
      ])
        .then(([unitMListRes, unitMTreeRes, data]) => {
          getCascaderOptions(unitMTreeRes?.data?.data || []);
          const result = data?.data?.data;

          supplierForm.setFieldsValue({
            expireTime: result?.expireTime && moment(result.expireTime),
            year: result?.year && moment(result?.year),
            unitmSupplier: result.unitmSupplier?.split(','),
            dataType: result.dataType || 1,
            borderType: result.borderType || 1,
            unitDischarge: result.unitDischarge,
            unitSupplier: result.unitSupplier,
            factorType: result.factorType,
            factorScore: result.factorScore,
            supplierName: result.supplierName,
            email: result.email,
            descr: result.descr,
          });

          if (!isNil(id) && result.fdType === FdType.importFactor) {
            FormaliyForm.query('activityUnit')
              .take()
              ?.setComponentProps({ disabled: true });
          }
          if (!isNil(result.supplierData) && !agentPreviewLayout) {
            const nextFillType =
              result.supplierData === 0 ? 'fill' : 'supplier';
            setFillType(nextFillType);
            setActiveDetailTab(nextFillType);
          }
          // @ts-ignore
          dealApiData(
            {
              ...result,
              gasList: result?.gasList || result?.factorGasList,
            },
            unitMListRes,
            unitMTreeRes,
          );
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
            list?.find(
              item => item.label === supplierForm.getFieldValue('supplierName'),
            )?.value,
          );
          const supplierNameInput = supplierForm.getFieldValue('supplierName');
          const isInList = list.find(item => item.label === supplierNameInput);
          if (!isInList && supplierNameInput) {
            list.push({
              value: supplierNameInput,
              label: supplierNameInput,
              parmasId: NaN,
              email: supplierForm.getFieldValue('email'),
            });
          }
          setSupplierList(list);
        });
    } else {
      apiMnumListALLByDictTypeBatch({ dictTypes: 'factorUnitM' }).then(res => {
        setActivityUnitList(res.data.data.factorUnitM);
      });
    }
    // // 因子分子、分母单位
    listALLByDictTypeBatch({
      dictTypes: 'factorUnitM,cequivalentUnitZ',
    }).then(data => {
      const result = data.data?.data;
      setFactorUnitM(result?.factorUnitM || []);
      setFactorUnitZ(result?.cequivalentUnitZ || []);
    });
  }, [pageInfoTypeName, id]);
  useEffect(() => {
    addGhgEffect();
    addIsoEffect();
    if (pageInfoTypeName === PageInfoType.add) {
      supplierForm.setFieldsValue({
        ...supplierForm.getFieldsValue(true),
        dataType: 1,
        borderType: 1,
      });
    }
    if (!sourceId.current) {
      apiSourceDefaultValue().then((res: any) => {
        // @ts-ignore
        sourceId.current = res.data?.data?.sourceId || '';
        FormaliyForm.setValues({
          sourceId: sourceId.current,
        });
      });
    }
    // 兼容原有逻辑，需要在联动生效后设置 ghg 初始值。
    setTimeout(() => {
      if (
        isAdd &&
        !isUndefined(initGhgCategory) &&
        !isUndefined(initGhgClassify)
      ) {
        if (versionType === EVersionType.ghg) {
          FormaliyForm.setValuesIn('.ghg', [initGhgCategory, initGhgClassify]);
        } else {
          FormaliyForm.setValuesIn('.iso', [initGhgCategory, initGhgClassify]);
        }
      }
    });
  }, []);
  const matchFactor = value => {
    if (
      value &&
      factorType === FdType.autoMatch &&
      pageInfoTypeName === PageInfoType.add
    ) {
      POSTc457e5a2a7b767c9ce0e2ceac8c32f67({
        factor: {
          name: value,
          emissionClassify:
            toJS(FormaliyForm.getValuesIn('ghg'))?.[1] || undefined,
        },
      }).then(({ data }) => {
        const result = data?.data as SerachCarbonFactorResult;
        if (result) {
          setFactorData(result);
          setPrevFactorType(FdType.autoMatch);
        }
      });
    }
  };

  // 选择匹配到的排放源，表单值回填走原先编辑，详情初始化的逻辑
  const onMatchEmissionSelect = (emission: DictSource) => {
    Promise.all([
      apiMnumListALLByDictTypeBatch({ dictTypes: 'factorUnitM' }),
      apiListALLByDictTypeData({ dictType: 'factorUnitM' }),
      apiSourceInfo({
        id: emission.id,
        sessionId,
        shareId,
      }),
    ])
      .then(([unitMListRes, unitMTreeRes, data]) => {
        freezeCalcUnitRatio.current = true;
        let result = (data?.data?.data as DictSource) || {};
        result = {
          ...result,
          gasList: result.factorGasList,
        };
        const matchedSourceFormValues = omit(result, [
          'dictSourceId',
          'id',
          'sourceId',
        ]);
        const currentSourceIdentity =
          pageInfoTypeName === PageInfoType.edit && !isUndefined(id)
            ? { id }
            : {};

        if (result) {
          FormaliyForm.setValues({
            ...matchedSourceFormValues,
            ...currentSourceIdentity,
            activityUnit: transUnit(unitMListRes, unitMTreeRes, result),
            iso: [result.isoCategory, result.isoClassify],
            ghg: [result.ghgCategory, result.ghgClassify],
          });
          setUnitConver(result.unitConver);
          setFactorType(result.fdType);
          setPrevFactorType(result.fdType);
          setCachedFactor(result);
        }
        setActivityUnitCode(
          result.activityType === ACTIVITY_TYPE.FORMULA
            ? result.methodObj?.unit?.[1] || ''
            : result.activityUnit || '',
        );
      })
      .finally(() => {
        // 为了兼容原先逻辑，用setTimeout hack
        setTimeout(() => {
          freezeCalcUnitRatio.current = false;
        }, 50);
      });
  };

  const canSelectFactorOrSupplier =
    fromType === '1' ||
    fromType === '3' ||
    pageInfoTypeName === PageInfoType.add;

  const visibleDetailTabs = selectTab.filter(item => {
    if (item.key === 'reference') return showAccountingReference;
    if (!canSelectFactorOrSupplier && !showAccountingReference) return false;
    return item.key !== 'supplier' || (!agentPreviewLayout && showSupplier);
  });

  return (
    <div className={classNames('enterprise-carbon-account-v222', style.box)}>
      <MatchEmissionListModal
        rowKey='id'
        getMatchEmission={params =>
          getMatchEmissionList({
            ...params,
            computationId: Number(computationId!),
            ghgClassify: Number(initGhgClassify!),
          })
        }
        visible={matchEmissionListModalVisible}
        name={matchEmissionName}
        onCancel={() => setMatchEmissionListModalVisible(false)}
        onConfirm={emission => {
          onMatchEmissionSelect(emission);
          setMatchEmissionListModalVisible(false);
        }}
      />
      <div className={style.formBox}>
        <span className='title-name'>
          {I18N.carbonFootprint.basicInformation}
        </span>
        <FormilyCommon form={FormaliyForm}>
          <SchemaField
            schema={baseInfoSchema(
              matchFactor,
              matchEmission,
              computationId,
              agentPreviewLayout,
            )}
          />
        </FormilyCommon>
      </div>
      <div className='form-box'>
        <span className='title-name'>
          {I18N.carbonFootprint3.activityData}
          <Tooltip
            placement='top'
            title={I18N.enterpriseCarbonAccount2.theActivityCaused}
          >
            <InfoCircleOutlined className='cur-p color-B5B8BB margin-l-4' />
          </Tooltip>
        </span>

        <FormilyCommon form={FormaliyForm}>
          <>
            <Field
              title={I18N.enterpriseCarbonAccount2.emissionsCalculation}
              name='activityType'
              required
              decorator={[FormItem]}
              initialValue={ACTIVITY_TYPE.EMISSION_FACTOR}
              component={[
                Radio.Group,
                {
                  options: activityTypeOptions,
                },
              ]}
            />
            <Field
              title={I18N.eca.computingMethod}
              name='methodObj'
              required
              decorator={[FormItem]}
              component={[
                FormilyMethodSelect,
                {
                  placeholder: I18N.eca.pleaseSelectCalculation,
                  fieldNames: { label: 'name', value: 'id' },
                  onChange: () => {
                    FormaliyForm.setValues({ changed: 0 });
                  },
                },
              ]}
              reactions={[
                field => {
                  if (!isShare && !agentPreviewLayout) {
                    getFormulaList().then(({ data }) => {
                      field.setComponentProps({
                        options: data.data,
                      });
                    });
                  }
                },
                field => {
                  const { changed, methodObj, activityType } =
                    FormaliyForm.values;

                  field.setState({
                    visible:
                      !agentPreviewLayout &&
                      activityType === ACTIVITY_TYPE.FORMULA,
                  });
                  if (changed && !field.readPretty) {
                    field.setTitle(
                      <div className={style.methodFieldTitle}>
                        <span>{I18N.eca.computingMethod}</span>
                        <div
                          className={style.methodUpdateBtn}
                          onClick={async () => {
                            const { data } = await getFormulaList();
                            const newMethod = data.data?.find(
                              item =>
                                item.id === (methodObj as { id: number }).id,
                            );
                            if (newMethod) {
                              FormaliyForm.setValues({
                                changed: 0,
                              });
                              (
                                FormaliyForm.query(
                                  'methodObj',
                                ).take() as FieldType
                              )?.onInput(newMethod);
                              field.setTitle(I18N.eca.computingMethod);
                            }
                          }}
                        >
                          {I18N.becomeSupplierOrPurchasing.update}
                        </div>
                      </div>,
                    );
                  }
                },
              ]}
            />
          </>
        </FormilyCommon>
        <FormilyCommon form={FormaliyForm}>
          <SchemaField
            schema={activitySchema(isShare, agentPreviewLayout)}
            scope={{
              useFiledUnitDictSource,
            }}
          />
        </FormilyCommon>
      </div>
      <div
        className={classNames('form-box', {
          [style.isAdd]: isAdd,
        })}
      >
        {/* // fixme what? */}
        {/*  eslint-disable-next-line no-nested-ternary */}
        {fromType === 'model' ? (
          <span className='title-name'>
            {I18N.carbonFootprint3.factorInformation}
            <Tooltip
              placement='top'
              title={I18N.enterpriseCarbonAccount2.factorBasedOnSorting}
            >
              <InfoCircleOutlined className='cur-p color-B5B8BB' />
            </Tooltip>
          </span>
        ) : canSelectFactorOrSupplier || showAccountingReference ? (
          // 因子信息 & 发起收数
          <>
            <div
              className={classNames('select-box flex-a-c', style.detailTabs)}
              role='tablist'
            >
              {visibleDetailTabs.map(item => (
                <button
                  key={item.key}
                  type='button'
                  role='tab'
                  aria-selected={activeDetailTab === item.key}
                  className={classNames(
                    'item flex-a-c flex-j-c',
                    style.detailTabItem,
                    {
                      true: activeDetailTab === item.key,
                      [style.detailTabItemActive]: activeDetailTab === item.key,
                    },
                  )}
                  onClick={() => {
                    setActiveDetailTab(item.key);
                    if (item.key !== 'reference') setFillType(item.key);
                  }}
                >
                  <img
                    className={activeDetailTab === item.key ? 'act' : 'none'}
                    src={tabSelectImg}
                    alt=''
                  />
                  <img
                    className={style.detailTabIcon}
                    src={
                      activeDetailTab === item.key
                        ? item.actIcon
                        : item.defalutIcon
                    }
                    width={16}
                    height={16}
                    alt=''
                  />
                  <span
                    className={classNames('label', style.detailTabLabel)}
                    title={item.label}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            {activeDetailTab === 'fill' && (
              <span className='font-s-12 color-999EA4'>
                {I18N.components.accordingToTheEmissionSource}
              </span>
            )}
          </>
        ) : (
          <div className={style.addEmissionTop}>
            <div className='title-name'>
              {I18N.carbonFootprint3.factorInformation}
            </div>
            <div className={classNames('font-s-12 color-999EA4', style.tips)}>
              {I18N.components.accordingToTheEmissionSource}
            </div>
          </div>
        )}
        {/* 因子信息卡片 */}
        {activeDetailTab === 'reference' ? (
          <AccountingReferencePanel
            value={displayReference}
            readPretty={readPretty}
            unitConver={unitConver}
            unitConverError={unitConverError}
            activityUnitName={activityUnit}
            factorUnitName={displayFactorUnitName}
            functionalUnitName={displayFunctionalUnitName}
            onViewDetail={
              referenceDetailAccountId === undefined ||
              referenceDetailAccountId === null
                ? undefined
                : () =>
                    openProductFootprintSnapshotDetail(referenceDetailAccountId)
            }
            onUnitConverChange={value => {
              setUnitConver(value === null ? '' : String(value));
              setUnitConverError(value ? RegFActorObjRate(String(value)) : '');
            }}
            onSelect={() => setReferenceSelectorOpen(true)}
          />
        ) : fillType === 'fill' ? (
          <FactorCard
            pageInfoTypeName={pageInfoTypeName}
            factorUseType={factorType}
            activityUnit={activityUnit}
            freezeCalcUnit={freezeCalcUnitRatio.current}
            factorData={currentFactorData}
            readonly={readPretty}
            onConversionRatioChange={val => {
              if (val.toString() === 'NaN') {
                setUnitConver('');
              } else {
                setUnitConver(val.toString());
              }
            }}
            conversionRatio={unitConver}
            showModel={type => {
              if (type === 'detail') {
                setShowFactorDetail(true);
              } else if (type === 'fill') {
                setShowFillFactor(true);
              } else if (type === 'reSelect') {
                setShowModalFactor(true);
              }
            }}
          />
        ) : (
          <FormItemUtil
            antdFormProps={basicsFormProps}
            formItems={supplierFormItems}
            paddRight={32}
          />
        )}
        {/* 选择排放因子 */}
        <Modal
          title={I18N.carbonFootprint3.chooseEmissionFactors}
          width={1200}
          destroyOnClose
          maskClosable={false}
          open={showModalFactor}
          centered
          footer={null}
          onCancel={() => {
            setShowModalFactor(false);
            if (prevFactorType) {
              setFactorType(prevFactorType);
            }
          }}
        >
          <SearchModalFactor
            isEnterprise
            factorName={(() => {
              switch (prevFactorType) {
                case FdType.manual:
                  return manualFactorData?.name;
                case FdType.select:
                  return factorData?.name;
                default:
                  return (FormaliyForm.values as { name: string | undefined })
                    .name;
              }
            })()}
            emissionClassify={
              toJS(FormaliyForm.getValuesIn('ghg'))?.[1] || undefined
            }
            subClick={factor => {
              setPrevFactorType(FdType.select);
              setFactorType(FdType.select);
              setFactorData(factor);
              setManualFactorData(undefined);
              // 显示
              setShowModalFactor(false);
            }}
            onCancel={async () => {
              setShowModalFactor(false);
              if (prevFactorType) {
                setFactorType(prevFactorType);
              }
            }}
          />
        </Modal>
        {/* 选择排放因子end */}
        {/* 排放因子详情 选择的因子和自动匹配的因子 */}
        <Modal
          destroyOnClose
          title={I18N.components.emissionFactorsDetailed}
          width={1200}
          maskClosable={false}
          centered
          getContainer={false}
          open={
            showFactorDetail &&
            factorType !== FdType.manual &&
            factorType !== FdType.importFactor
          }
          cancelText={I18N.carbonFootprint3.close}
          okButtonProps={{
            style: {
              display: 'none',
            },
          }}
          onCancel={() => setShowFactorDetail(false)}
        >
          {/* 手动选择的因子 */}
          {factorData?.id && <SearchFactorDetail id={factorData.id} />}
        </Modal>
        {/* 排放因子详情end */}
        {/* 手动填写因子 & 因子详情 手动输入的因子 */}
        {(showFillFactor ||
          (showFactorDetail &&
            (factorType === FdType.manual ||
              factorType === FdType.importFactor) &&
            !!manualFactorData)) && (
          <AddFactorModal
            visible
            isShow={
              showFactorDetail &&
              (factorType === FdType.manual ||
                factorType === FdType.importFactor) &&
              !!manualFactorData
            }
            factorData={manualFactorData}
            onCancel={() => {
              setShowFillFactor(false);
              setShowFactorDetail(false);
              if (prevFactorType) {
                setFactorType(prevFactorType);
              }
            }}
            onOk={({ form, tableData }) => {
              form.submit(values => {
                const co2eRow = defaultFactorData().find(r =>
                  r.greenhouseGasesType?.includes(CO2E),
                );
                if (!co2eRow)
                  throw new Error(
                    I18N.enterpriseCarbonAccount2.coeColumnNotAvailable,
                  );
                getFactorSource().then(sources => {
                  setFactorType(FdType.manual);
                  setFactorData(undefined);
                  setManualFactorData({
                    ...values,
                    factorUnitName: `${
                      factorUnitZ?.find(d => d.dictValue === values?.factorUnit)
                        ?.dictLabel || ''
                    }/${
                      factorUnitM?.find(
                        d => d.dictValue === values?.factorUnitM?.[1],
                      )?.dictLabel || ''
                    }`,
                    factorSourceName:
                      sources?.find(
                        s => String(s.sourceLabelId) === values.factorSource,
                      )?.labelname || '',
                    // 补充co2e 数据到表格数据中
                    gasList: tableData.concat({
                      ...co2eRow,
                      factorUnit: values.factorUnit,
                      factorUnitM: values.factorUnitM.join(','),
                      factorValue: values.factorValue,
                      dictSourceFactorGasId: (
                        last(values?.gasList || []) as any
                      )?.dictSourceFactorGasId,
                    }),
                  });
                });
                setShowFillFactor(false);
                setShowFactorDetail(false);
                setPrevFactorType(FdType.manual);
              });
            }}
          />
        )}
      </div>
      {/* 是否保存到库 */}
      <Modal
        title={I18N.carbonFootprint.prompt}
        width={400}
        maskClosable={false}
        centered
        getContainer={false}
        open={showIsDic}
        cancelText={I18N.carbonNeutral.no}
        okText={I18N.carbonNeutral.yes}
        onCancel={() => setShowIsDic(false)}
        footer={
          <>
            <Button onClick={() => saveData(0)}>{I18N.carbonNeutral.no}</Button>
            <Button type='primary' onClick={() => saveData(1)}>
              {I18N.carbonNeutral.yes}
            </Button>
            {/* <Button onClick={() => setShowIsDic(false)}>取消</Button> */}
          </>
        }
      >
        <br />
        <p>{I18N.enterpriseCarbonAccount2.doYouWantToSynchronizeAndUpdate}</p>
      </Modal>
      {/* 是否保存到库 */}
      {showAccountingReference && (
        <ProductFootprintAccountSelector
          open={referenceSelectorOpen}
          selectionMode='single'
          onCancel={() => setReferenceSelectorOpen(false)}
          onConfirm={async (
            selectedRows: ProductFootprintAccountSelection[],
          ) => {
            const selected = selectedRows[0];
            if (!selected) return;
            if (!selected.id) return;
            const { data } = await createProductFootprintSnapshot(selected.id);
            const snapshotAccountId = data.data;
            if (!snapshotAccountId) return;
            setSelectedAccounting({ ...selected, snapshotAccountId });
            setFactorType(FdType.accountReference);
            setPrevFactorType(FdType.accountReference);
            setFactorData(undefined);
            setManualFactorData(undefined);
            setCachedFactor(undefined);
            FormaliyForm.setValues({
              activityData: selected.activityData ?? null,
            });
            setUnitConverError('');
          }}
        />
      )}
      <FormActions
        className={classNames({
          [style.agentPreviewFormActions]: agentPreviewLayout,
        })}
        place='center'
        width={688}
        buttons={compact([
          !readPretty
            ? {
                title: I18N.carbonFootprint.confirm2,
                type: 'primary',
                onClick: async () => {
                  if (!validateAccountingReference()) return;
                  if (!validateFactorInformation()) return;
                  try {
                    await FormaliyForm.submit();
                    await supplierForm.validateFields();
                  } catch (error: any) {
                    Toast('error', error?.[0].messages?.[0]);
                    return;
                  }
                  if (fillType === 'fill') {
                    if (!unitConver) {
                      Toast(
                        'warn',
                        I18N.enterpriseCarbonAccount2.pleaseFillInTheUnit,
                      );
                      return;
                    }
                    if (
                      pageInfoTypeName === PageInfoType.edit &&
                      fillType === 'fill'
                    ) {
                      const consistency = await checkEmissionDataEdited();
                      if (consistency) {
                        closeEmissionDetail();
                        return;
                      }
                    }
                    await saveData(0);
                  } else {
                    await saveData(0);
                  }

                  await sleep(300);
                },
              }
            : null,
          {
            title: readPretty
              ? agentPreviewLayout
                ? I18N.carbonFootprint3.close
                : I18N.carbonFootprint.return
              : `${I18N.carbonFootprint.cancel}`,
            onClick: async () => {
              closeEmissionDetail();
            },
          },
        ])}
      />
    </div>
  );
};
export default AccountAddEmission;
