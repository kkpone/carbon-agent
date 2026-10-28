/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  CloseOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  createForm,
  Field,
  ObjectField,
  onFieldChange,
  onFieldInputValueChange,
  onFieldValueChange,
} from '@formily/core';
import { FormConsumer, FormProvider } from '@formily/react';
import {
  GwpRecordScope,
  GwpScopeContext,
} from '@/components/EmissionGwp/context';
import { SchemaField } from './schemaField';
import {
  footerStyle,
  useAsyncProductDataSource,
  toModelEmissionSubmitPayload,
  ACCOUNT_REFER_WAY,
  AccountRefer,
  openRouteInNewTab,
  resolveEmissionUnitLabel,
  resolveSupplierSubmitRate,
  normalizeEmissionMatchWay,
  resolveAccountReferUnitLabel,
} from './emissionSourceFormUtils';
import CheckModelIcon from '@src/assets/images/carbonFootprint3.6.6/checkModelIcon.png';
import { API_EXTRA_PARAMS_SNAPFLAG } from '@src/components/CarbonFootprintAccount/BuildModelMainData/constant';
import {
  filterShareEditMatchWayOptions,
  isShareLinkEditableContext,
} from '@src/components/CarbonFootprintAccount/BuildModelMainData/shareSnapFlag';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import useFieldFlattenUnitDictSource from '@src/hooks/useFieldFlattenUnitDataSource';
import useFieldSetValueByLabel from '@src/hooks/useFieldSetValueByLabel';
import useFieldSupplierSource from '@src/hooks/useFieldSupplierSource';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { GetLocalStorageProductId } from '@src/utils/store';
import { getFullNum } from '@src/views/carbonFootprint/utils';
import { FactorPatternType } from '@src/views/emission/utils/index-type';
import { Drawer, Button, Modal, Spin, App, InputNumber, Tooltip } from 'antd';
import classNames from 'classnames';
import { has } from 'lodash-es';
import { useContext, useEffect, useMemo, useState, useRef, FC } from 'react';

import { MeasurementPrecisionContext } from '@/components/CarbonFootprintAccount/BuildModelMainData/measurementPrecisionContext';
import { TransportReuseEnabledContext } from '@/components/CarbonFootprintAccount/BuildModelMainData/transportReuseContext';
import { IconAlibaba } from '@/components/iconfont';
import EmissionDescriptionSection from '../../components/EmissionDescriptionSection';

import styles from './index.module.less';
import './index.less';
import emptyImg from '@/assets/svg/empty.svg';
import SelectAccount from '../../FootprintAccount/SelectAccount';
import { SelectAccountListData } from '../../FootprintAccount/SelectAccount/type';
import {
  genEmissionBasicSchema,
  genEmissionMatchWaySchema,
  genSupplierSchema,
} from './schema';
import { EmissionSourceDrawerProps } from './type';
import { FactorAndTransportSections } from './components/FactorAndTransportSections';
import {
  MODEL_EMISSION_BORDER_TYPE,
  MODEL_EMISSION_DATA_TYPE,
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_MATCH_WAY_ICON,
  MODEL_EMISSION_MATCH_WAY_LABEL,
  MODEL_EMISSION_REQUEST_STATE,
} from '../../BusinessAccountingModel/constant';
import {
  getBusinessAccountingModelEmissionInfo,
  postBusinessAccountingQuickModelEmissionAdd,
  postBusinessAccountingQuickModelEmissionEdit,
} from '../../BusinessAccountingModel/service';
import {
  getAiQuickBusinessAccountingEmissionInfo,
  getQuickBusinessAccountingEmissionInfo,
  postAiQuickBusinessAccountingEmissionEdit,
  postAiSupplierEditAndRequest,
  postQuickBusinessAccountingEmissionAdd,
  postQuickBusinessAccountingEmissionEdit,
  postQuickBusinessAccountingEmissionSupplierAddAndRequest,
  postQuickBusinessAccountingEmissionSupplierEditAndRequest,
} from '../../QuickBusinessAccounting/service';
import { QuickBusinessAccountingSource } from '../../QuickBusinessAccounting/type';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import {
  ALL_EMISSION_LABEL,
  ECOINVENT_TEXT,
  QUICK_ACCOUNT_EMISSION,
  // TRANS_EMISSION_UNIT_LABEL,
} from '../../constant';
import { CALC_WAY } from '../../discharge/process/constant';
import { OptionsTypesData } from '../../type';
import { RegFActorObjRate } from '../../util';
import {
  getQuickEmissionType,
  postAccountingEmissionCopy,
  postAutoMatchFactor,
} from '../AccessoryDrawer/EmissionDrawer/service';
import { getUnitRate } from '../AccessoryDrawer/service';
import {
  calcSupplierResultUnitRate,
  getEmissionUnitCodeFromForm,
  getSupplierSaveFooterMode,
  isSupplierRequestReadOnly,
  parseSupplierResultUnitCode,
} from '../AccessoryDrawer/utils';
import ModalEmissionSourceTable from '../EmissionSourceTable/ModalEmissionSource';
import SupplierCarbonDataModal from '../SupplierCarbonDataModal';
import { SupplierCarbonData } from '../SupplierCarbonDataModal/type';
import { FootprintAccountInfoUrlStatus } from '../../FootprintAccount/constant';
import { BuildModelDescribeSet } from '../../FootprintAccount/component/AccountInfoBuildModel/constant';
import { STEP_OPTION_VALUE } from '../../util/constant';

import {
  serviceToForm,
  TransportListTransToService,
} from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportUtil';

import { toJS } from '@formily/reactive';

import { hasFactorObj } from '@/views/subModules/CarbonFootprintModel/util';

export type { EmissionSourceDrawerProps } from './type';

const { FACTOR, FACTOR_CREATE, SUPPLIER, MODEL_REFER } =
  MODEL_EMISSION_MATCH_WAY;

const { FACTOR_ICON, SUPPLIER_ICON, MODEL_REFER_ICON } =
  MODEL_EMISSION_MATCH_WAY_ICON;

const EmissionSourceDrawer: FC<EmissionSourceDrawerProps> = ({
  emissionAiFlag,
  copyStatus,
  initValues,
  checkModelData,
  quickDrawerMatchWayBtns,
  quickDrawerMatchWayBtnValue,
  noSelectEmissionBtn,
  showSupplier,
  visible,
  accountId,
  emissionSourceId,
  stage,
  onlyCreateFactor,
  apiExtraParams,
  readPretty,
  useModelEmissionApi = false,
  showFactorEvaluationCard = true,
  enableFactorSourceRange,
  factorPrefId,
  onClose,
  onSuccess,
  onTransportReuseSuccess,
}) => {
  const enableGwp = useContext(GwpScopeContext);
  const { amountDecimalPlace, productWeightDecimalPlace } = useContext(
    MeasurementPrecisionContext,
  );
  /** 分享/快照上下文：与建模画布 QuickBuildVisual 一致，避免抽屉与画布对「是否分享」认定不一致 */
  const isShareLinkEditable = isShareLinkEditableContext(apiExtraParams);
  const isShare =
    [
      API_EXTRA_PARAMS_SNAPFLAG.SHARE,
      API_EXTRA_PARAMS_SNAPFLAG.SAASSHARE,
    ].includes(apiExtraParams?.snapFlag) ||
    (has(apiExtraParams, 'snapFlag') && !isShareLinkEditable);

  /** 共享编辑下：发起收数、核算引用区块只读 */
  const isShareMatchWayReadOnly = isShareLinkEditable && !readPretty;

  const showFactorEvalInSchema =
    showFactorEvaluationCard &&
    !isShare &&
    !isShareLinkEditable &&
    !useModelEmissionApi;

  const defaultApiExtraParams = apiExtraParams || {};
  const formNameUseRef = useRef('');

  let matchWayBtns;
  if (quickDrawerMatchWayBtns) {
    matchWayBtns = quickDrawerMatchWayBtns;
  } else {
    matchWayBtns = [
      {
        value: FACTOR,
        label: MODEL_EMISSION_MATCH_WAY_LABEL()[FACTOR],
        icon: FACTOR_ICON,
      },
    ];

    // 如果显示发起收数按钮
    if (showSupplier) {
      matchWayBtns.push({
        value: SUPPLIER,
        label: MODEL_EMISSION_MATCH_WAY_LABEL()[SUPPLIER],
        icon: SUPPLIER_ICON,
      });
    }

    matchWayBtns.push({
      value: MODEL_REFER,
      label: MODEL_EMISSION_MATCH_WAY_LABEL()[MODEL_REFER],
      icon: MODEL_REFER_ICON,
    });
  }

  /** 判断是否显示选择排放源按钮 */
  const isShowSelectBtn = () => {
    if (noSelectEmissionBtn || isShareLinkEditable) return false;
    return !effectiveReadPretty;
  };

  /** 根据名称自动匹配因子loading */
  const [autoMatchFactorLoading, setAutoMatchFactorLoading] = useState(false);

  /** '1'-普通因子 '2'-ecoinvent因子 */
  const [factorPattern, setFactorPattern] = useState<FactorPatternType>();

  const [formLoading, setFormLoading] = useState(false);

  /** 储存因子数值 */
  const [fealFactor, setFealFactor] = useState<string | number>();

  const [supplierCarbonDataModalVisible, setSupplierCarbonDataModalVisible] =
    useState(false);
  const [referenceModelModalVisible, setReferenceModelModalVisible] =
    useState(false);
  /** 核算引用 - 单位换算比例校验提示 */
  const [accountReferRateError, setAccountReferRateError] = useState('');
  /** footer 按钮区：匹配方式（FormConsumer 在 Drawer footer 内对 matchWay 变更可能不触发重渲染） */
  const [footerMatchWay, setFooterMatchWay] = useState<number>(
    quickDrawerMatchWayBtnValue || FACTOR,
  );
  const [emissionRequestState, setEmissionRequestState] = useState(
    MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT,
  );
  const [supplierFormReadOnly, setSupplierFormReadOnly] = useState(false);
  const effectiveReadPretty = !!readPretty || supplierFormReadOnly;
  const transportReuseEnabled =
    useContext(TransportReuseEnabledContext) &&
    !effectiveReadPretty &&
    !useModelEmissionApi;
  /** 供 form effects 读取最新的换算比例计算函数，避免 useMemo 闭包过期 */
  const accountReferRateHelpersRef = useRef<{
    calcAccountReferRate: (
      accountUnitCode?: string,
    ) => Promise<string | undefined>;
    getAccountReferUnitCode: () => string | undefined;
  }>({
    calcAccountReferRate: async () => undefined,
    getAccountReferUnitCode: () => undefined,
  });
  const form = useMemo(
    () =>
      createForm({
        initialValues: initValues,
        readPretty: effectiveReadPretty,
        validateFirst: true,
        effects(form) {
          onFieldValueChange('files', field => {
            form.query('files').take()?.setComponentProps({
              fileListBack: field.value,
            });
          });
          onFieldValueChange('matchWay', field => {
            // form.setValues 回显时不走 input 事件，需同步 footer 按钮区
            setFooterMatchWay(normalizeEmissionMatchWay(field.value));
          });
          onFieldInputValueChange('matchWay', field => {
            setFooterMatchWay(normalizeEmissionMatchWay(field.value));
            (form.query('supplierObj').take() as ObjectField)?.reset();
            (form.query('supplierObj.dataType').take() as Field)?.setValue(
              MODEL_EMISSION_DATA_TYPE.RESULT,
            );
            (
              form.query('supplierObj.footBorderType').take() as Field
            )?.setValue(MODEL_EMISSION_BORDER_TYPE.HALF);
            if (field.value !== MODEL_REFER) {
              setAccountReferRateError('');
              form.setValues({
                matchId: undefined,
                referWay: undefined,
                accountRefer: undefined,
                referRate: undefined,
                modelId: undefined,
                referenceModelObj: undefined,
              });
            }
            setFactorPattern(FactorPatternType.ordinaryFactor);
            // 共享编辑：发起收数字段只读
            if (isShareMatchWayReadOnly) {
              const locked = field.value === SUPPLIER;
              form.query('supplierObj.*').forEach(supplierField => {
                supplierField.setPattern(locked ? 'readPretty' : 'editable');
              });
            }
          });
          onFieldInputValueChange('unitCode', field => {
            const inputLabel = (
              field.inputValues as { label: string }[][] | undefined
            )?.[1]?.[1]?.label;
            if (inputLabel) {
              field.setData({ ...(field.data || {}), label: inputLabel });
            }
            const matchWay = form.getValuesIn('matchWay');
            if (matchWay === MODEL_REFER) {
              const { calcAccountReferRate, getAccountReferUnitCode } =
                accountReferRateHelpersRef.current;
              calcAccountReferRate(getAccountReferUnitCode()).catch(() => {
                // calcAccountReferRate 内部已处理异常，这里兜底避免未捕获 Promise。
              });
              return;
            }
            // 已选供应商碳数据：消耗数量单位变更时同步重算换算比例（仅写入 rate，不影响 referRate）
            if (matchWay === SUPPLIER) {
              const supplierObj = form.getValuesIn('supplierObj') as
                | Record<string, any>
                | undefined;
              if (supplierObj?.id != null) {
                calcSupplierDataRate(supplierObj)
                  .then(supplierRate => {
                    form.setValuesIn('rate', supplierRate);
                  })
                  .catch(() => {
                    form.setValuesIn('rate', '1');
                  });
              }
            }
          });
          onFieldInputValueChange('supplierObj.supplierId', field => {
            field.setData({ modified: true });
            form.setValues({
              supplierObj: {
                id: undefined,
                factor: undefined,
                numeratorUnit: undefined,
                denominatorUnit: undefined,
                year: undefined,
              },
            });
          });
          onFieldChange(
            'supplierObj.supplierId',
            ['value', 'dataSource'],
            generalField => {
              const field = generalField as Field;
              if (!field.value) {
                return;
              }
              const selectedSupplier = (field.dataSource || []).find(
                ({ value }) => field.value === value,
              );

              if (!selectedSupplier) {
                field.setDataSource([
                  ...(field.dataSource || []),
                  { value: field.value, label: field.value, isAdd: true },
                ]);
              } else {
                const supplierEmailField = form
                  .query('supplierObj.email')
                  .take();
                (supplierEmailField as Field)?.setComponentProps({
                  disabled: !!selectedSupplier.email,
                });
                if (field.data?.modified) {
                  form.setValues({
                    supplierObj: {
                      computeCompanyName: selectedSupplier.label,
                      email: selectedSupplier.email,
                    },
                  });
                }
              }
            },
          );
        },
      }),
    [
      visible,
      accountId,
      emissionSourceId,
      copyStatus,
      effectiveReadPretty,
      isShareMatchWayReadOnly,
    ],
  );

  const changeAccountReferRate = (value?: string) => {
    const errorText = value ? RegFActorObjRate(value) : '';
    setAccountReferRateError(errorText);
    form.setValuesIn('referRate', value || '');
  };

  const getCurrentEmissionUnitCode = () => getEmissionUnitCodeFromForm(form);

  /** 发起收数-已选供应商碳数据：计算消耗数量单位与结果数据单位的换算比例，失败时默认 1 */
  const calcSupplierDataRate = async (supplierObj?: Record<string, any>) => {
    const resultUnitCode = parseSupplierResultUnitCode(supplierObj);
    return calcSupplierResultUnitRate(
      getCurrentEmissionUnitCode(),
      resultUnitCode,
    );
  };

  const getAccountReferUnitCode = () => {
    const accountRefer = form.getValuesIn('accountRefer') as
      | AccountRefer
      | undefined;
    const referenceModelObj = form.getValuesIn('referenceModelObj') as
      | Record<string, any>
      | undefined;

    return accountRefer?.unitCode || referenceModelObj?.unitCode;
  };

  const calcAccountReferRate = async (accountUnitCode?: string) => {
    const currentUnitCode = getCurrentEmissionUnitCode();
    if (!currentUnitCode || !accountUnitCode) {
      // 消耗数量单位或核算单位未选全时，换算比例不应有默认值
      changeAccountReferRate('');
      return undefined;
    }

    // 活动数据单位与核算单位一致时，直接默认为 1
    if (currentUnitCode === accountUnitCode) {
      changeAccountReferRate('1');
      return '1';
    }

    try {
      const {
        data: {
          data: { unitValue },
        },
      } = await getUnitRate({
        unitOne: currentUnitCode,
        unitTwo: accountUnitCode,
      });
      // 单位变更场景下，接口返回空字符串表示不可换算，需清空输入框
      changeAccountReferRate(unitValue);
      return unitValue;
    } catch {
      changeAccountReferRate('');
      return undefined;
    }
  };

  accountReferRateHelpersRef.current = {
    calcAccountReferRate,
    getAccountReferUnitCode,
  };

  /** 选择核算后写入 referRate：左右单位不全或无法计算时保持为空，接口返回空字符串表示不可换算 */
  const resolveReferRateOnSelect = (rate?: string) => rate ?? '';

  const selectReferenceAccount = async (account: SelectAccountListData) => {
    setAccountReferRateError('');
    const accountRefer: AccountRefer = {
      referWay: account.referWay || ACCOUNT_REFER_WAY.MODEL,
      accountId: account.id,
      accountName: account.accountName,
      productId: account.productId,
      productName: account.productName || account.modelName,
      factor: account.factor,
      factorUnit: account.factorUnit,
      unitCode: account.unitCode,
      unitName: account.unitName,
    };
    const rate = await calcAccountReferRate(account.unitCode);

    form.setValues({
      matchId: account.id,
      referWay: accountRefer.referWay,
      accountRefer,
      referRate: resolveReferRateOnSelect(rate),
      factorObj: {
        rate: form.getValuesIn('factorObj.rate') || 1,
      },
      modelId: undefined,
      referenceModelObj: undefined,
    });
    setReferenceModelModalVisible(false);
  };

  /** 点击核算引用功能单位名称/查看详情图标，打开被引用核算详情（仅模型引用） */
  const openReferenceAccountDetail = (account?: AccountRefer) => {
    const productId = account?.productId;
    const accountId = account?.accountId;

    if (!productId || !accountId) {
      Toast('warn', '核算详情信息缺失，无法打开详情');
      return;
    }

    openRouteInNewTab(
      `${RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail}?productId=${productId}&status=${FootprintAccountInfoUrlStatus.EDIT}&accountId=${accountId}&stepValue=${STEP_OPTION_VALUE.MODEL}&listOrGraph=${BuildModelDescribeSet.VISUAL}`,
    );
  };

  const [submitLoading, setSubmitLoading] = useState(false);

  const [emissionSourceModalVisible, setEmissionSourceModalVisible] =
    useState(false);

  /** 排放源中的搜索类别 */
  const [emissionOptions, setEmissionOptions] = useState<OptionsTypesData[]>(
    [],
  );

  /**
   * 选择排放源
   * @param emission
   */
  const selectEmissionSource = async (emission: Record<string, any>) => {
    const {
      name,
      type,
      emissionSourceDescription,
      matchWay,
      matchObject,
      unitCode,
      unitName,
      typeExtra,
      rate,
      accountEmissionTransportList,
      id: emissionId,
    } = emission;

    const {
      factor,
      institution,
      name: factorName,
      unit,
      year,
      id,
    } = matchObject || {};

    setFactorPattern(
      emission.factorPattern || emission.factorObj?.factorPattern,
    );
    setFealFactor(factor);
    const normalizedMatchWay = normalizeEmissionMatchWay(matchWay);
    const matchWayVal =
      normalizedMatchWay === FACTOR ||
      normalizedMatchWay === FACTOR_CREATE ||
      normalizedMatchWay === MODEL_REFER
        ? normalizedMatchWay
        : FACTOR;

    const initialValues: Record<string, any> = {
      type,
      emissionId,
      ...(enableGwp
        ? {
            greenhouseGas: emission.greenhouseGas ?? 'CO2',
            gwpValue: emission.gwpValue ?? '1',
          }
        : {}),
      emissionSourceDescription: emissionSourceDescription ?? '',
      matchWay: matchWayVal,
      needTransport: accountEmissionTransportList?.length > 0 ? 2 : 1,
      accountEmissionTransportList: serviceToForm(accountEmissionTransportList),
      factorObj: {
        factorPattern: emission.factorObj?.factorPattern,
        ecoinventValueVisible:
          emission.factorObj?.ecoinventValueVisible ??
          emission.ecoinventValueVisible,
        id,
        matchWay: matchWayVal,
        factor: shouldHideEcoinventValue({
          factorPattern:
            emission.factorPattern || emission.factorObj?.factorPattern,
          ecoinventValueVisible:
            emission.factorObj?.ecoinventValueVisible ??
            emission.ecoinventValueVisible,
        })
          ? ECOINVENT_TEXT
          : factor,
        institution,
        name: factorName,
        year,
        rate,
        numeratorUnit: (unit || '').split('/')[0] || undefined,
        denominatorUnit: (unit || '').split('/')[1] || undefined,
        unit,
      },
    };
    initialValues.name = name;
    // if (type !== QUICK_ACCOUNT_EMISSION.TRANS) {
    form.setFieldState('unitCode', {
      data: { value: unitCode, label: unitName },
    });
    if (typeExtra) {
      // switch (typeExtra.way) {
      //   case CALC_WAY.PRODUCT_WEIGHT:
      //     initialValues.typeExtra = {
      //       way: typeExtra.way,
      //       unitCode: typeExtra.unitCode,
      //       amount: undefined,
      //       distance: undefined,
      //     };
      //     break;
      //   case CALC_WAY.BEARING_RATIO:
      //     initialValues.typeExtra = {
      //       way: typeExtra.way,
      //       bearingAmount: undefined,
      //       bearingDistance: undefined,
      //     };
      //     break;
      //   case CALC_WAY.ENERGY_CONSUMPTION:
      //     initialValues.typeExtra = {
      //       way: typeExtra.way,
      //       energyAmount: undefined,
      //     };
      //     form.setFieldState('typeExtra.energyUnitCode', {
      //       data: { value: typeExtra.unitCode, label: typeExtra.unitName },
      //     });
      //     break;
      //   default:
      // }
    }
    form.setValues({
      accountEmissionTransportList: [],
    });
    form.setValues({
      ...initialValues,
      amount: undefined,
    });
    setFooterMatchWay(matchWayVal);
    setEmissionSourceModalVisible(false);
  };

  const selectSupplierCarbonData = async (data: SupplierCarbonData) => {
    const supplierIdField = form.query('supplierObj.supplierId').take();
    const {
      id,
      factor,
      unitCode,
      computeUnit,
      year,
      supplierId,
      computeCompanyName,
      email,
      dataType,
      footBorderType,
      descr,
    } = data;

    const supplierObj = {
      id,
      factor,
      numeratorUnit: unitCode,
      denominatorUnit: (computeUnit || '').split(','),
      year,
      supplierId,
      computeCompanyName,
      email,
      dataType,
      footBorderType,
      descr,
      expireTime: undefined,
    };

    supplierIdField?.setData({ modified: false });
    const supplierRate = await calcSupplierDataRate(supplierObj);
    form.setValues({
      supplierObj,
      rate: supplierRate,
    });
    form.validate('supplierObj');
    setSupplierFormReadOnly(false);
    setSupplierCarbonDataModalVisible(false);
  };

  /**
   * 提交
   */
  const onSubmit = async (options?: { requestSupplier?: boolean }) => {
    if (formLoading) return;
    const formValues = await form.submit<Record<string, any>>();
    const { factorObj, ...restValues } = formValues;
    const { rate } = factorObj || {};

    if (
      restValues.matchWay === MODEL_EMISSION_MATCH_WAY.MODEL_REFER &&
      !restValues.matchId
    ) {
      Toast('error', I18N.Factors.pleaseSelectAccounting);
      return;
    }

    if (
      restValues.matchWay === MODEL_EMISSION_MATCH_WAY.MODEL_REFER &&
      (restValues.referRate === undefined ||
        restValues.referRate === null ||
        restValues.referRate === '')
    ) {
      Toast('error', I18N.enterpriseCarbonAccount2.pleaseFillInTheUnit);
      return;
    }

    if (restValues.matchWay === MODEL_EMISSION_MATCH_WAY.MODEL_REFER) {
      const rateError = RegFActorObjRate(String(restValues.referRate || ''));
      if (rateError) {
        setAccountReferRateError(rateError);
        Toast('error', rateError);
        return;
      }
    }

    let factorInfo = {};
    if (restValues.type === QUICK_ACCOUNT_EMISSION.TRANS) {
      factorInfo = {
        matchWay: factorObj?.matchWay || restValues.matchWay,
        rate,
        factorObj,
      };
    } else {
      factorInfo = {
        rate,
        factorObj,
      };
    }
    const submitData: QuickBusinessAccountingSource = {
      ...restValues,
      accountId: String(accountId),
      stage: String(stage),
      name: restValues.name || restValues.selectName,
      type: restValues.type,
      // 运输排放源不提交本次新增的描述字段。
      emissionSourceDescription:
        restValues.type === QUICK_ACCOUNT_EMISSION.TRANS
          ? undefined
          : restValues.emissionSourceDescription,
      ...factorInfo,
    };
    // 如果因子信息携带了来源  以因子信息的来源为准
    if (
      factorObj?.factorPattern &&
      factorObj?.factorPattern === FactorPatternType.eCoinVent
    ) {
      if (submitData.factorObj) {
        submitData.factorObj.factor = fealFactor;
      }
    } else if (
      !factorObj?.factorPattern &&
      factorPattern === FactorPatternType.eCoinVent
    ) {
      if (submitData.factorObj) {
        submitData.factorObj.factor = fealFactor;
      }
    }

    // if (restValues.type !== QUICK_ACCOUNT_EMISSION.TRANS) {
    submitData.unitCodeArr = restValues?.unitCode?.join(',');
    submitData.unitCode = (restValues.unitCode as unknown as string[])?.[1];
    submitData.unitName =
      (
        form.getFieldState('unitCode')?.inputValues as {
          label: string;
        }[][]
      )?.[1]?.[1]?.label || form.getFieldState('unitCode').data?.label;
    // } else {
    // 运输类型排放源特殊处理
    // switch (typeExtra.way) {
    //   case CALC_WAY.PRODUCT_WEIGHT:
    //     typeExtra.unitName = TRANS_EMISSION_UNIT_LABEL[typeExtra.unitCode];
    //     typeExtra.distUnitName = I18N.carbonFootprint3.kilometre;
    //     typeExtra.distUnitCode = typeExtra.unitCode;
    //     break;
    //   case CALC_WAY.BEARING_RATIO:
    //     typeExtra.amount = typeExtra.bearingAmount;
    //     typeExtra.distance = typeExtra.bearingDistance;
    //     typeExtra.distUnitName = I18N.carbonFootprint3.kilometre;
    //     typeExtra.bearingAmount = undefined;
    //     typeExtra.bearingDistance = undefined;
    //     break;
    //   case CALC_WAY.ENERGY_CONSUMPTION:
    //     typeExtra.amount = typeExtra.energyAmount;
    //     typeExtra.unitCode = typeExtra.energyUnitCode?.[1];
    //     typeExtra.unitName =
    //       (
    //         form.getFieldState('typeExtra.energyUnitCode').inputValues as {
    //           label: string;
    //         }[][]
    //       )?.[1]?.[1]?.label ||
    //       form.getFieldState('typeExtra.energyUnitCode')?.data?.label;
    //     typeExtra.energyAmount = undefined;
    //     typeExtra.energyUnitCode = undefined;
    //     submitData.unitCodeArr = form
    //       .getFieldState('typeExtra.energyUnitCode')
    //       ?.inputValues?.[0]?.join(',');
    //     break;
    //   default:
    // }
    // submitData.typeExtra = typeExtra;
    // }

    submitData.accountEmissionTransportList = TransportListTransToService(
      restValues.accountEmissionTransportList,
      restValues.name,
    );

    // 匹配方式是发起收数，单位换算比例默认给1
    if (
      restValues.matchWay === MODEL_EMISSION_MATCH_WAY.SUPPLIER &&
      restValues.supplierObj
    ) {
      const selectedSupplier = (
        (form.query('supplierObj.supplierId').take() as Field)?.dataSource || []
      ).find(({ value }) => restValues.supplierObj.supplierId === value);
      if (selectedSupplier?.isAdd) {
        restValues.supplierObj.computeCompanyName =
          restValues.supplierObj.supplierId;
        restValues.supplierObj.supplierId = null;
      }
      if (
        restValues.supplierObj.numeratorUnit &&
        restValues.supplierObj.denominatorUnit
      ) {
        restValues.supplierObj.unit = `${
          restValues.supplierObj.numeratorUnit
        }/${(restValues.supplierObj.denominatorUnit || []).join(',')}`;
        restValues.supplierObj.numeratorUnit = undefined;
        restValues.supplierObj.denominatorUnit = undefined;
      }
      const supplierRate = resolveSupplierSubmitRate(
        restValues.supplierObj,
        restValues.rate,
      );
      Object.assign(submitData, {
        factorObj: undefined,
        rate: supplierRate,
      });
    }

    if (restValues.matchWay === MODEL_EMISSION_MATCH_WAY.MODEL_REFER) {
      Object.assign(submitData, {
        factorObj: undefined,
        supplierObj: undefined,
        matchId: restValues.matchId,
        referWay: restValues.referWay,
        accountRefer: restValues.accountRefer,
        rate: restValues.referRate,
        referRate: undefined,
        modelId: undefined,
        referenceModelObj: undefined,
      });
    }

    // 补充复制逻辑
    if (copyStatus) {
      try {
        setSubmitLoading(true);
        if (useModelEmissionApi) {
          await postBusinessAccountingQuickModelEmissionAdd(
            toModelEmissionSubmitPayload(submitData, String(accountId)) as any,
          );
        } else if (options?.requestSupplier) {
          // 保存并获取供应商数据
          await postQuickBusinessAccountingEmissionSupplierAddAndRequest({
            ...defaultApiExtraParams,
            ...submitData,
          });
        } else {
          await postAccountingEmissionCopy({
            ...defaultApiExtraParams,
            ...submitData,
          });
        }
        Toast('success', I18N.carbonFootprint3.copySuccessful);
        onSuccess();
        setFactorPattern(FactorPatternType.ordinaryFactor);
      } finally {
        setSubmitLoading(false);
      }
      return;
    }

    try {
      setSubmitLoading(true);
      if (emissionSourceId !== undefined) {
        // 编辑排放源
        if (useModelEmissionApi) {
          await postBusinessAccountingQuickModelEmissionEdit({
            ...(toModelEmissionSubmitPayload(
              submitData,
              String(accountId),
            ) as any),
            id: emissionSourceId,
          });
        } else if (options?.requestSupplier) {
          // 保存并请求供应商数据
          emissionAiFlag === 1
            ? await postAiSupplierEditAndRequest({
                ...defaultApiExtraParams,
                ...submitData,
                id: emissionSourceId,
              })
            : await postQuickBusinessAccountingEmissionSupplierEditAndRequest({
                ...defaultApiExtraParams,
                ...submitData,
                id: emissionSourceId,
              });
        } else {
          emissionAiFlag === 1
            ? await postAiQuickBusinessAccountingEmissionEdit({
                ...defaultApiExtraParams,
                ...submitData,
                id: emissionSourceId,
              })
            : await postQuickBusinessAccountingEmissionEdit({
                ...defaultApiExtraParams,
                ...submitData,
                id: emissionSourceId,
              });
        }
        Toast('success', I18N.carbonFootprint.editSuccessful);
      } else {
        // 新增排放源
        if (useModelEmissionApi) {
          await postBusinessAccountingQuickModelEmissionAdd(
            toModelEmissionSubmitPayload(submitData, String(accountId)) as any,
          );
        } else if (options?.requestSupplier) {
          // 保存并获取供应商数据
          await postQuickBusinessAccountingEmissionSupplierAddAndRequest({
            ...defaultApiExtraParams,
            ...submitData,
          });
        } else {
          await postQuickBusinessAccountingEmissionAdd({
            ...defaultApiExtraParams,
            ...submitData,
          });
        }
        Toast('success', I18N.carbonFootprint.successfullyAdded);
      }
      onSuccess();
      setFactorPattern(FactorPatternType.ordinaryFactor);
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * @description: 设置从接口拿到的输入和排放源类型
   */
  const getOptionTypeData = async () => {
    if (emissionOptions.length > 0) return emissionOptions;
    // 设置输出类型
    const typeData = await getQuickEmissionType({
      ...defaultApiExtraParams,
      stage,
    });
    setEmissionOptions(typeData.data.data);
    return typeData.data.data;
  };

  /**
   * 基本信息 名称输入框输入后动态获取因子信息
   * @param newName 名称
   */
  /** 名称触发及主动重新匹配均读取当前排放源描述，needNew仅保护已有因子。 */
  const onBasicNameChange = async (needNew: boolean = false) => {
    if (effectiveReadPretty || onlyCreateFactor || autoMatchFactorLoading)
      return;
    if (needNew) {
      if (hasFactorObj(toJS(form.getValuesIn('factorObj')))) {
        return;
      }
    }
    // if (!form.modified && !fireImmediately) return;

    // if (needOrgName) {
    //   newName = form.getValuesIn('name');
    // }
    const newName = form.getValuesIn('name');
    // 名称相同不出发
    // if (formNameUseRef.current === newName) return;

    // 如果因子为手动填写也返回 - 手动填写的因子更改名称不自动匹配因子
    if (
      form.getValuesIn('factorObj.matchWay') === FACTOR_CREATE ||
      form.getValuesIn('matchWay') === FACTOR_CREATE ||
      form.getValuesIn('type') === QUICK_ACCOUNT_EMISSION.TRANS ||
      form.getValuesIn('matchWay') === MODEL_EMISSION_MATCH_WAY.SUPPLIER ||
      form.getValuesIn('matchWay') === MODEL_EMISSION_MATCH_WAY.MODEL_REFER
    )
      return;

    // formNameUseRef.current = newName;

    const formType = form.getValuesIn('type');
    /**
     * 运输类不回填此处逻辑
     */
    if (formType === QUICK_ACCOUNT_EMISSION.TRANS) {
      return;
    }

    try {
      await form.validate('emissionSourceDescription');
    } catch {
      return;
    }
    try {
      // 只有排放源名称更改后才会自动匹配 不论是否已经存在因子 - 3.5.5测试用例评审更改需求 10-08
      // 当前口径：名称触发和主动匹配使用当前描述，独立透传，不拼接名称。
      setAutoMatchFactorLoading(true);
      const { data } = await postAutoMatchFactor({
        name: newName,
        emissionSourceDescription:
          form.getValuesIn('emissionSourceDescription') || undefined,
        factorType: '3',
        productId: GetLocalStorageProductId(),
        emissionType: formType ? ALL_EMISSION_LABEL()[formType] : undefined,
        emissionClassify: formType || undefined,
      });
      if (data.data) {
        const [numeratorUnit, denominatorUnit] = (data.data.unit || '').split(
          '/',
        );
        const formFactorObjValue = form.getValuesIn('factorObj');
        form.setValuesIn('factorObj', {
          ...formFactorObjValue,
          ...data.data,
          numeratorUnit,
          denominatorUnit,
          matchWay: FACTOR,
        });
        form.setValuesIn('matchWay', FACTOR);
      } else {
        form.setValuesIn('factorObj', undefined);
      }
    } catch (e) {
      form.setValuesIn('factorObj', undefined);
    } finally {
      setAutoMatchFactorLoading(false);
    }
  };

  useEffect(() => {
    if (visible && emissionSourceId === undefined) {
      setFooterMatchWay(quickDrawerMatchWayBtnValue || FACTOR);
    }
  }, [visible, emissionSourceId, quickDrawerMatchWayBtnValue]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFormLoading(true);
      const typeData = await getOptionTypeData();
      if (cancelled) return;
      if (!visible) {
        formNameUseRef.current = '';
      }
      // 动态添加下拉类型
      form.setFieldState('type', {
        dataSource: typeData,
      });
      // 新增 - 如果有菜单的选中类型，在新增的时候要赋值
      // if (visible && !emissionSourceId) {
      //   form.setValuesIn('type', menuInitType);
      // }

      // 编辑
      if (visible && emissionSourceId !== undefined) {
        form.setValuesIn('factorObj', undefined);
        const resp = useModelEmissionApi
          ? await getBusinessAccountingModelEmissionInfo({
              id: String(emissionSourceId),
            })
          : emissionAiFlag === 1
          ? await getAiQuickBusinessAccountingEmissionInfo({
              ...defaultApiExtraParams,
              id: String(emissionSourceId),
            })
          : await getQuickBusinessAccountingEmissionInfo({
              ...defaultApiExtraParams,
              id: String(emissionSourceId),
            });

        if (cancelled) return;
        const {
          name,
          amount,
          type,
          matchWay: rawMatchWay,
          rate,
          unitCode,
          files,
          unitName,
          accountEmissionTransportList,
          matchId,
          referWay,
          accountRefer,
          modelId,
          referenceModelObj,
          modelObj,
          matchObject,
          requestState,
          emissionSourceDescription,
        } = resp.data.data as unknown as Record<string, any>;

        const matchWay = normalizeEmissionMatchWay(rawMatchWay);

        setEmissionRequestState(
          requestState ?? MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT,
        );

        let { factorObj, typeExtra, supplierObj } = resp.data
          .data as unknown as Record<string, any>;

        factorObj = factorObj || {};
        typeExtra = typeExtra || {};
        supplierObj = supplierObj || {};
        factorObj.rate = rate;

        const { factorPattern, factor } = factorObj;
        setFealFactor(factor);
        setFactorPattern(factorPattern);

        if (supplierObj.unit) {
          const [numeratorUnit, denominatorUnit] = (
            supplierObj.unit || ''
          ).split('/');
          supplierObj.numeratorUnit = numeratorUnit;
          supplierObj.denominatorUnit = (denominatorUnit || '').split(',');
          supplierObj.unit = undefined;
        }

        if (supplierObj.supplierId === null) {
          supplierObj.supplierId = supplierObj.computeCompanyName;
        }

        // 分享页面详情展示
        if (isShare) {
          supplierObj.supplierId = supplierObj.computeCompanyName;
        }

        // 复制，发起收数的数据不展示
        if (copyStatus) {
          supplierObj = undefined;
        }

        // 兼容历史详情接口：核算引用早期也会放在 matchObject 中返回。
        // 只有 matchWay 为 MODEL_REFER 时才能使用 matchObject，避免把因子/供应商信息误当成核算引用。
        const accountReferSource =
          accountRefer ||
          referenceModelObj ||
          modelObj ||
          (matchWay === MODEL_REFER ? matchObject : undefined);

        const normalizedAccountRefer = accountReferSource
          ? {
              referWay:
                accountReferSource.referWay ||
                referWay ||
                ACCOUNT_REFER_WAY.MODEL,
              accountId:
                accountReferSource.accountId ||
                accountReferSource.modelId ||
                accountReferSource.id,
              accountName: accountReferSource.accountName,
              productId: accountReferSource.productId,
              productName:
                accountReferSource.productName || accountReferSource.modelName,
              factor: accountReferSource.factor,
              factorUnit: accountReferSource.factorUnit,
              unitCode: accountReferSource.unitCode,
              unitName: accountReferSource.unitName,
            }
          : undefined;

        const initialValues: Record<string, any> = {
          type,
          ...(enableGwp
            ? {
                greenhouseGas: resp.data.data.greenhouseGas ?? 'CO2',
                gwpValue: resp.data.data.gwpValue ?? '1',
              }
            : {}),
          emissionSourceDescription: emissionSourceDescription ?? '',
          needTransport:
            accountEmissionTransportList?.length ||
            type === QUICK_ACCOUNT_EMISSION.TRANS
              ? 2
              : 1,
          accountEmissionTransportList: serviceToForm(
            accountEmissionTransportList,
          ),
          matchWay,
          files,
          factorObj: {
            ...factorObj,
            matchWay,
            numeratorUnit: (factorObj?.unit || '').split('/')[0] || undefined,
            denominatorUnit: (factorObj?.unit || '').split('/')[1] || undefined,
            factor: shouldHideEcoinventValue(factorObj)
              ? ECOINVENT_TEXT
              : factor,
          },
          supplierObj,
          matchId:
            matchId ||
            normalizedAccountRefer?.accountId ||
            modelId ||
            referenceModelObj?.modelId ||
            referenceModelObj?.id ||
            modelObj?.modelId ||
            modelObj?.id,
          referWay:
            referWay ||
            normalizedAccountRefer?.referWay ||
            referenceModelObj?.referWay ||
            modelObj?.referWay,
          accountRefer: normalizedAccountRefer,
          referRate:
            matchWay === MODEL_REFER ? rate || factorObj?.rate : undefined,
          rate:
            matchWay === SUPPLIER && supplierObj?.id != null ? rate : undefined,
          modelId:
            modelId ||
            normalizedAccountRefer?.accountId ||
            referenceModelObj?.modelId ||
            referenceModelObj?.id ||
            modelObj?.modelId ||
            modelObj?.id,
          referenceModelObj: referenceModelObj || modelObj,
        };

        // 复制补充逻辑 - 名称增加副本
        initialValues.name = copyStatus
          ? I18N.template(I18N.carbonFootprint3.names2, { val1: name })
          : name;

        // if (type !== QUICK_ACCOUNT_EMISSION.TRANS) {
        form.setFieldState('unitCode', {
          data: { value: unitCode, label: unitName },
        });
        initialValues.amount = amount;
        if (typeExtra) {
          switch (typeExtra.way) {
            case CALC_WAY.PRODUCT_WEIGHT:
              initialValues.typeExtra = {
                way: typeExtra.way,
                amount: typeExtra.amount,
                distance: typeExtra.distance,
                unitCode: typeExtra.unitCode,
                unitName: typeExtra.unitName,
              };
              break;
            case CALC_WAY.BEARING_RATIO:
              initialValues.typeExtra = {
                way: typeExtra.way,
                bearingAmount: typeExtra.amount,
                bearingDistance: typeExtra.distance,
              };
              break;
            case CALC_WAY.ENERGY_CONSUMPTION:
              initialValues.typeExtra = {
                way: typeExtra.way,
                energyAmount: typeExtra.amount,
              };
              form.setFieldState('typeExtra.energyUnitCode', {
                data: { value: typeExtra.unitCode, label: typeExtra.unitName },
              });
              break;
            default:
          }
        }
        form.setFieldState('factorObj.denominatorUnit', {
          data: { label: (factorObj.unit || '').split('/')[1] },
        });

        if (
          effectiveReadPretty &&
          initialValues?.supplierObj?.computeCompanyName
        ) {
          initialValues.supplierObj.supplierId =
            initialValues.supplierObj.computeCompanyName;
        }

        form.setValues(initialValues);
        setFooterMatchWay(matchWay);
        setSupplierFormReadOnly(
          isSupplierRequestReadOnly({
            matchWay,
            supplierObjId: supplierObj?.id,
            requestState:
              requestState ?? MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT,
          }),
        );

        // 共享编辑：回显后锁定发起收数字段为只读
        if (isShareMatchWayReadOnly) {
          const locked = matchWay === SUPPLIER;
          form.query('supplierObj.*').forEach(supplierField => {
            supplierField.setPattern(locked ? 'readPretty' : 'editable');
          });
        }

        // 编辑回显：已关联核算但未带回换算比例时，自动触发一次计算
        if (matchWay === MODEL_REFER && !initialValues.referRate) {
          const accountUnitCode =
            initialValues.accountRefer?.unitCode ||
            initialValues.referenceModelObj?.unitCode;
          if (accountUnitCode) {
            calcAccountReferRate(accountUnitCode).catch(() => {
              // calcAccountReferRate 内部已处理异常，这里兜底避免未捕获 Promise。
            });
          }
        }

        // 编辑回显：已选供应商碳数据但未带回换算比例时，自动计算（算不出默认 1，仅写入 rate）
        if (
          matchWay === SUPPLIER &&
          initialValues.supplierObj?.id &&
          !initialValues.rate
        ) {
          calcSupplierDataRate(initialValues.supplierObj)
            .then(supplierRate => {
              form.setValuesIn('rate', supplierRate);
            })
            .catch(() => {
              form.setValuesIn('rate', '1');
            });
        }
      } else if (visible) {
        setEmissionRequestState(MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT);
        setSupplierFormReadOnly(false);
      }
      setFormLoading(false);
    })().catch(() => {
      if (!cancelled) setFormLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [
    visible,
    emissionSourceId,
    form,
    emissionAiFlag,
    useModelEmissionApi,
    isShareMatchWayReadOnly,
  ]);

  /** 获取标题 */
  const getTitle = () => {
    if (copyStatus) {
      return I18N.carbonFootprint3.copyingEmissionSources;
    }

    if (effectiveReadPretty) {
      return I18N.carbonFootprint3.viewEmissionSources;
    }

    if (emissionSourceId) {
      return I18N.carbonFootprint.editEmissionSources2;
    }

    return I18N.carbonFootprint.newEmissionSourcesAdded;
  };

  const { modal } = App.useApp();

  return (
    <Drawer
      open={visible}
      width={728}
      destroyOnClose
      maskClosable
      closable={false}
      rootClassName='quickVisualizationDrawer'
      title={getTitle()}
      extra={
        <CloseOutlined
          className={styles.closeIcon}
          onClick={() => {
            if (effectiveReadPretty || !form.getFormState().modified) {
              onClose();
              return;
            }
            modal.confirm({
              title: I18N.carbonFootprint3.confirmToGiveUpWhen,
              onOk: () => {
                onClose?.();
              },
            });
          }}
        />
      }
      footerStyle={footerStyle}
      bodyStyle={{
        padding: 16,
      }}
      footer={
        <FormProvider form={form}>
          <FormConsumer>
            {_form => {
              const supplierObjId = (
                _form.values as { supplierObj?: { id?: number } }
              )?.supplierObj?.id;
              const supplierSaveMode = getSupplierSaveFooterMode({
                matchWay: Number(footerMatchWay),
                supplierObjId,
                requestState: emissionRequestState,
              });
              const isFormReadOnly =
                effectiveReadPretty || supplierSaveMode === 'readOnly';

              if (isFormReadOnly) {
                return (
                  <Button
                    onClick={() => {
                      if (
                        effectiveReadPretty ||
                        !form.getFormState().modified
                      ) {
                        onClose();
                        return;
                      }
                      modal.confirm({
                        title: I18N.carbonFootprint3.confirmToGiveUpWhen,
                        onOk: () => {
                          onClose?.();
                        },
                      });
                    }}
                    rootClassName={styles.btns}
                  >
                    {I18N.carbonFootprint3.close}
                  </Button>
                );
              }

              return (
                <div>
                  <Button
                    rootClassName={styles.btns}
                    onClick={() => {
                      if (
                        effectiveReadPretty ||
                        !form.getFormState().modified
                      ) {
                        onClose();
                        return;
                      }
                      modal.confirm({
                        title: I18N.carbonFootprint3.confirmToGiveUpWhen,
                        onOk: () => {
                          onClose?.();
                        },
                      });
                    }}
                  >
                    {I18N.carbonFootprint.cancel}
                  </Button>
                  {supplierSaveMode === 'dualSave' && !isShareLinkEditable ? (
                    <>
                      <Button
                        rootClassName={classNames(styles.btns, 'm-l-10')}
                        loading={submitLoading}
                        type='default'
                        onClick={() => onSubmit()}
                      >
                        {I18N.carbonFootprint3.saveOnly}
                      </Button>
                      <Button
                        rootClassName={classNames(styles.btns, 'm-l-10')}
                        type='primary'
                        loading={submitLoading}
                        onClick={() => onSubmit({ requestSupplier: true })}
                      >
                        {I18N.carbonFootprint3.saveAndGet}
                      </Button>
                    </>
                  ) : (
                    <Button
                      rootClassName={classNames(styles.btns, 'm-l-10')}
                      type='primary'
                      loading={submitLoading}
                      onClick={() => onSubmit()}
                    >
                      {checkModelData &&
                      checkModelData.total - 1 > checkModelData.current
                        ? I18N.carbonFootprint3.confirmNext
                        : supplierSaveMode === 'singleSave'
                        ? I18N.carbonFootprint.preserve
                        : I18N.carbonFootprint.confirm}
                    </Button>
                  )}
                </div>
              );
            }}
          </FormConsumer>
        </FormProvider>
      }
      onClose={() => {
        if (effectiveReadPretty || !form.getFormState().modified) {
          onClose();
          return;
        }
        modal.confirm({
          title: I18N.carbonFootprint3.confirmToGiveUpWhen,
          onOk: () => {
            onClose?.();
          },
        });
      }}
    >
      {checkModelData && visible && (
        <div className={`${styles.checkModelMain} checkModelMain`}>
          <div className={styles.checkTitle}>
            <img
              className={styles.checkModelIcon}
              src={CheckModelIcon}
              alt={I18N.carbonFootprint3.checkTheModel}
            />
            <span>{I18N.carbonFootprint3.modelCheck}</span>
          </div>
          <div className={styles.checkModelText}>
            {I18N.carbonFootprint3.aTotalOfDiscoveriesWereMadeThisTime}
            {checkModelData.total}
            {I18N.carbonFootprint3.modelsExist}
          </div>
          <div className={styles.checkModelPage}>
            <span className={styles.pageText}>
              {checkModelData.current + 1}/{checkModelData.total}
            </span>
            <Button
              icon={<LeftOutlined />}
              className='m-r-8'
              disabled={checkModelData.current === 0}
              onClick={() => {
                if (checkModelData.current === 0) return;
                checkModelData.onChangeCheck(checkModelData.current - 1);
                form.modified = false;
              }}
            />
            <Button
              icon={<RightOutlined />}
              disabled={checkModelData.current === checkModelData.total - 1}
              onClick={() => {
                if (checkModelData.current === checkModelData.total - 1) return;
                checkModelData.onChangeCheck(checkModelData.current + 1);
                form.modified = false;
              }}
            />
          </div>
        </div>
      )}
      <FormilyCommon form={form}>
        <Spin spinning={formLoading}>
          <div className={styles.titleContainer}>
            <div className={styles.title}>
              {I18N.carbonFootprint.basicInformation}
            </div>
            {isShowSelectBtn() && (
              <Button
                type='primary'
                onClick={() => setEmissionSourceModalVisible(true)}
              >
                {I18N.carbonFootprint3.selectingEmissionSources}
              </Button>
            )}
          </div>
          <GwpRecordScope
            recordKey={`${visible}:${accountId}:${stage}:${
              emissionSourceId ?? 'new'
            }:${!!copyStatus}`}
            readOnly={effectiveReadPretty}
          >
            <SchemaField
              schema={genEmissionBasicSchema(
                () => onBasicNameChange(true),
                amountDecimalPlace,
              )}
              scope={{
                useFieldUnitDictSource,
                useAsyncProductDataSource,
                useFieldSetValueByLabel,
                useFieldFlattenUnitDictSource,
                useModelEmissionApi,
              }}
            />
          </GwpRecordScope>
          <EmissionDescriptionSection
            readPretty={effectiveReadPretty}
            onlyCreateFactor={onlyCreateFactor}
            loading={autoMatchFactorLoading}
            onMatch={() => onBasicNameChange()}
          />
          <div className={styles.matchWayContainer}>
            <FormConsumer>
              {() => (
                <SchemaField
                  schema={genEmissionMatchWaySchema(
                    filterShareEditMatchWayOptions(matchWayBtns),
                    quickDrawerMatchWayBtnValue,
                    isShareLinkEditable,
                  )}
                  scope={{ useModelEmissionApi }}
                />
              )}
            </FormConsumer>
            <FormConsumer>
              {_form => {
                const matchWay = _form.getValuesIn('matchWay');
                const type = _form.getValuesIn('type');
                if (
                  matchWay === MODEL_EMISSION_MATCH_WAY.SUPPLIER &&
                  !effectiveReadPretty &&
                  !isShareLinkEditable &&
                  type !== QUICK_ACCOUNT_EMISSION.TRANS
                ) {
                  return (
                    <Button
                      type='primary'
                      onClick={() => setSupplierCarbonDataModalVisible(true)}
                    >
                      {I18N.carbonFootprint3.selectSupplier}
                    </Button>
                  );
                }
                return '';
              }}
            </FormConsumer>
          </div>
          <SchemaField
            schema={genSupplierSchema(isShare, useModelEmissionApi)}
            scope={{
              useFieldUnitDictSource,
              useFieldSetValueByLabel,
              useFieldSupplierSource,
              useFieldFlattenUnitDictSource,
              useModelEmissionApi,
            }}
          />
          <FormConsumer>
            {_form => {
              const matchWay = _form.getValuesIn('matchWay');
              if (matchWay !== MODEL_EMISSION_MATCH_WAY.MODEL_REFER) {
                return '';
              }

              const accountRefer = _form.getValuesIn('accountRefer') as
                | AccountRefer
                | undefined;
              const referenceModelObj = _form.getValuesIn(
                'referenceModelObj',
              ) as Record<string, any> | undefined;
              const selectedAccountRefer =
                accountRefer ||
                (referenceModelObj
                  ? ({
                      referWay:
                        referenceModelObj.referWay || ACCOUNT_REFER_WAY.MODEL,
                      accountId:
                        referenceModelObj.modelId || referenceModelObj.id,
                      accountName: referenceModelObj.accountName,
                      productId: referenceModelObj.productId,
                      productName:
                        referenceModelObj.productName ||
                        referenceModelObj.modelName,
                      factor: referenceModelObj.factor,
                      factorUnit: referenceModelObj.factorUnit,
                      unitCode: referenceModelObj.unitCode,
                      unitName: referenceModelObj.unitName,
                    } as AccountRefer)
                  : undefined);

              if (
                selectedAccountRefer?.productName ||
                selectedAccountRefer?.accountName ||
                selectedAccountRefer?.factor
              ) {
                return (
                  <>
                    <div className={styles.referenceModelTip}>
                      {I18N.carbonFootprint3.accountingReferenceTip}
                    </div>
                    <div className={styles.referenceModelCardBorder}>
                      <div className={styles.referenceModelCard}>
                        <div className={styles.referenceModelCardHeader}>
                          {selectedAccountRefer.referWay ===
                          ACCOUNT_REFER_WAY.RESULT ? (
                            <span
                              className={styles.referenceModelName}
                              title={
                                selectedAccountRefer.accountName ||
                                selectedAccountRefer.productName ||
                                '-'
                              }
                            >
                              {selectedAccountRefer.accountName ||
                                selectedAccountRefer.productName ||
                                '-'}
                            </span>
                          ) : (
                            <button
                              className={styles.referenceModelDetailTrigger}
                              type='button'
                              onClick={() =>
                                openReferenceAccountDetail(selectedAccountRefer)
                              }
                            >
                              <span
                                className={styles.referenceModelName}
                                title={
                                  selectedAccountRefer.accountName ||
                                  selectedAccountRefer.productName ||
                                  '-'
                                }
                              >
                                {selectedAccountRefer.accountName ||
                                  selectedAccountRefer.productName ||
                                  '-'}
                              </span>
                              <Tooltip
                                placement='top'
                                title={I18N.carbonFootprint3.viewDetails}
                              >
                                <IconAlibaba
                                  className={styles.referenceModelDetailIcon}
                                  type='icon-icon_chakanxiangqing'
                                />
                              </Tooltip>
                            </button>
                          )}
                          {!effectiveReadPretty && !isShareLinkEditable && (
                            <Button
                              className={styles.referenceModelChangeBtn}
                              type='link'
                              onClick={() =>
                                setReferenceModelModalVisible(true)
                              }
                            >
                              <IconAlibaba
                                className={styles.referenceModelChangeIcon}
                                type='icon-icon-tongzhi-1'
                              />
                              {I18N.carbonFootprint3.selectAccounting}
                            </Button>
                          )}
                        </div>
                        <div className={styles.referenceModelData}>
                          <div className={styles.referenceModelDataItem}>
                            <div className={styles.referenceModelDataValue}>
                              {selectedAccountRefer.referWay ===
                              ACCOUNT_REFER_WAY.RESULT
                                ? I18N.carbonFootprint3.referenceResult
                                : I18N.carbonFootprint3.referenceModel}
                            </div>
                            <div className={styles.referenceModelDataLabel}>
                              {I18N.carbonFootprint3.referenceWay}
                            </div>
                          </div>
                          <div className={styles.referenceModelDataItem}>
                            <div className={styles.referenceModelDataValue}>
                              {selectedAccountRefer.productName || '-'}
                            </div>
                            <div className={styles.referenceModelDataLabel}>
                              {I18N.carbonFootprint.productName}
                            </div>
                          </div>
                          <div className={styles.referenceModelDataItem}>
                            <div className={styles.referenceModelDataValue}>
                              {selectedAccountRefer.factor || '-'}
                              {selectedAccountRefer.factorUnit
                                ? ` ${selectedAccountRefer.factorUnit}`
                                : ''}
                            </div>
                            <div className={styles.referenceModelDataLabel}>
                              {I18N.carbonFootprint3.unitEmissions}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.referenceModelRate}>
                        <div className={styles.referenceModelRateTitle}>
                          <span className={styles.referenceModelRateRequired}>
                            *
                          </span>
                          <span>
                            {I18N.carbonFootprint.unitConversionRatio4}
                          </span>
                          <Tooltip
                            placement='top'
                            title={I18N.components.activityDataSheet2}
                          >
                            <InfoCircleOutlined className='m-l-6 color-B5B8BB' />
                          </Tooltip>
                        </div>
                        <div className={styles.referenceModelRateBody}>
                          <div className={styles.referenceModelRateContent}>
                            <span className={styles.referenceModelRateUnit}>
                              1 {resolveEmissionUnitLabel(_form)}
                            </span>
                            <span className={styles.referenceModelRateEqual}>
                              {I18N.components.equalTo}
                            </span>
                            {effectiveReadPretty || isShareLinkEditable ? (
                              <span className={styles.referenceModelRateValue}>
                                {_form.getValuesIn('referRate')}
                              </span>
                            ) : (
                              <InputNumber
                                stringMode
                                controls={false}
                                className={classNames(
                                  styles.referenceModelRateInput,
                                  {
                                    [styles.referenceModelRateInputError]:
                                      accountReferRateError,
                                  },
                                )}
                                value={_form.getValuesIn('referRate')}
                                onChange={val => {
                                  if (!val) {
                                    changeAccountReferRate('');
                                    return;
                                  }
                                  changeAccountReferRate(
                                    getFullNum(val) as string,
                                  );
                                }}
                                // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
                                max={99999999999.9999999999999}
                              />
                            )}
                            <span className={styles.referenceModelRateUnit}>
                              {resolveAccountReferUnitLabel(
                                selectedAccountRefer,
                              )}
                            </span>
                          </div>
                          <div className={styles.referenceModelRateTipInfo}>
                            <span className={styles.referenceModelRateTipText}>
                              {I18N.components.activityDataSheet}
                            </span>
                          </div>
                        </div>
                        {accountReferRateError ? (
                          <div className={styles.referenceModelRateErrorText}>
                            {accountReferRateError}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </>
                );
              }

              return (
                <>
                  <div className={styles.referenceModelTip}>
                    {I18N.carbonFootprint3.accountingReferenceTip}
                  </div>
                  <div className={styles.referenceModelEmpty}>
                    <img
                      className={styles.referenceModelEmptyIcon}
                      src={emptyImg}
                      alt=''
                    />
                    <div className={styles.referenceModelEmptyText}>
                      {I18N.carbonFootprint3.notAssociatedAccountingModel}
                    </div>
                    {!effectiveReadPretty && !isShareLinkEditable && (
                      <Button
                        type='link'
                        className={styles.referenceModelSelectBtn}
                        onClick={() => setReferenceModelModalVisible(true)}
                      >
                        {I18N.carbonFootprint3.selectAccounting}
                      </Button>
                    )}
                  </div>
                </>
              );
            }}
          </FormConsumer>
          <FactorAndTransportSections
            accountId={accountId}
            apiExtraParams={apiExtraParams}
            autoMatchFactorLoading={autoMatchFactorLoading}
            effectiveReadPretty={effectiveReadPretty}
            emissionAiFlag={emissionAiFlag}
            emissionSourceId={emissionSourceId}
            enableFactorSourceRange={enableFactorSourceRange}
            factorPrefId={factorPrefId}
            onlyCreateFactor={onlyCreateFactor}
            productWeightDecimalPlace={productWeightDecimalPlace}
            showFactorEvaluationCard={showFactorEvalInSchema}
            transportReuseEnabled={transportReuseEnabled}
            useModelEmissionApi={useModelEmissionApi}
            visible={visible}
            onBasicNameChange={onBasicNameChange}
            onTransportReuseSuccess={onTransportReuseSuccess}
          />
        </Spin>
      </FormilyCommon>
      {!isShare && (
        <>
          <SupplierCarbonDataModal
            visible={supplierCarbonDataModalVisible}
            name={
              form.values.name ||
              (form.values.typeExtra && form.values.typeExtra.name) ||
              ''
            }
            onCancel={() => setSupplierCarbonDataModalVisible(false)}
            onConfirm={selectSupplierCarbonData}
          />
          <SelectAccount
            visible={referenceModelModalVisible}
            accountId={accountId}
            onCancel={() => setReferenceModelModalVisible(false)}
            onAccountUse={selectReferenceAccount}
          />
          <Modal
            title={I18N.carbonFootprint3.selectingEmissionSources}
            width={1200}
            maskClosable={false}
            getContainer={false}
            open={emissionSourceModalVisible}
            footer={null}
            style={{
              top: 50,
            }}
            bodyStyle={{
              paddingBottom: 0,
              paddingTop: 0,
            }}
            onCancel={() => setEmissionSourceModalVisible(false)}
          >
            <ModalEmissionSourceTable
              enableGwp={enableGwp}
              emissionName={form.values?.name || form.values?.selectName}
              onCancel={async () => setEmissionSourceModalVisible(false)}
              onConfirm={selectEmissionSource}
              options={emissionOptions}
            />
          </Modal>
        </>
      )}
    </Drawer>
  );
};

export default EmissionSourceDrawer;
