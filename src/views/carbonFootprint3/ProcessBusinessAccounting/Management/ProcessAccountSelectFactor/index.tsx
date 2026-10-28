/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-01 11:40:59
 * @Date: 2023-03-06 14:59:23
 * @@description:
 */
import {
  ArrayCollapse,
  Cascader,
  DatePicker,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Radio,
  Select,
} from '@formily/antd-v5';
import {
  createForm,
  Field,
  FormPath,
  ObjectField,
  onFieldChange,
  onFieldInputValueChange,
  onFieldValueChange,
} from '@formily/core';
import { createSchemaField, FormConsumer, FormProvider } from '@formily/react';
import { toJS } from '@formily/reactive';
import { Button } from '@src/components/Button';
import { API_EXTRA_PARAMS_SNAPFLAG } from '@src/components/CarbonFootprintAccount/BuildModelMainData/constant';
import { isShareLinkEditableContext } from '@src/components/CarbonFootprintAccount/BuildModelMainData/shareSnapFlag';
import FormilyButtonSelect from '@src/components/FormilyUtil/FormilyButtonSelect';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import FormilyFactor from '@src/components/FormilyUtil/FormilyFactor';
import SearchModalFactor from '@src/components/SearchFactor/ModalFactor';
import { SerachCarbonFactorResult } from '@src/components/SearchFactor/type';
import useFieldFlattenUnitDictSource from '@src/hooks/useFieldFlattenUnitDataSource';
import useFieldSetValueByLabel from '@src/hooks/useFieldSetValueByLabel';
import useFieldSupplierSource from '@src/hooks/useFieldSupplierSource';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { GetLocalStorageProductId } from '@src/utils/store';
import {
  MODEL_EMISSION_MATCH_WAY_ICON,
  MODEL_EMISSION_REQUEST_STATE,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { genSupplierSchema } from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer/schema';
import { postAutoMatchFactor } from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer/service';
import {
  calcSupplierResultUnitRate,
  getEmissionUnitCodeFromForm,
  getSupplierSaveFooterMode,
  parseSupplierResultUnitCode,
} from '@src/views/carbonFootprint3/component/AccessoryDrawer/utils';
import SupplierCarbonDataModal from '@src/views/carbonFootprint3/component/SupplierCarbonDataModal';
import { SupplierCarbonData } from '@src/views/carbonFootprint3/component/SupplierCarbonDataModal/type';
import { CustomInput } from '@src/views/carbonFootprint3/component/formily/input';
import CarbonFootprint3UploadFile from '@src/views/carbonFootprint3/component/uploadFile';
import {
  ALL_EMISSION_LABEL,
  EMISSION_TYPE_OPTIONS,
  QUICK_ACCOUNT_EMISSION,
  TRANS_EMISSION_UNIT_LABEL,
} from '@src/views/carbonFootprint3/constant';
import { getEmissionSoureListData } from '@src/views/carbonFootprint3/discharge/emissionSoureLibrary/service';
import {
  AMOUNT,
  CALC_WAY,
  MATCH_WAY,
  MATCH_WAY_LABEL,
  MAX_DECIMAL_PLACE,
} from '@src/views/carbonFootprint3/discharge/process/constant';
import {
  CalcWay,
  ProcessLibIn,
} from '@src/views/carbonFootprint3/discharge/process/type';
import { genRequiredValidator } from '@src/views/carbonFootprint3/discharge/process/utils';
import { AddFileData } from '@src/views/carbonFootprint3/type';
import { genNumberValidator } from '@src/views/carbonFootprint3/util';
import { Modal, Spin } from 'antd';
import { has } from 'lodash-es';
import {
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  VFC,
} from 'react';

import { MeasurementPrecisionContext } from '@/components/CarbonFootprintAccount/BuildModelMainData/measurementPrecisionContext';
import { CustomHeaderIndex } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/components/CustomHeader';
import { ArrayRemove } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/components/Remove';
import {
  AdditionalFormItemMaps,
  transportSchema,
  getNewEmissionFactorSchema,
  useFactorObjReaction,
  useFactorObjUnitStringReaction,
  useFieldDataSourceReaction,
  useNeedTransportReaction,
  useUnitDataSourceReaction,
} from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportSchema';
import {
  serviceToForm,
  TransportListTransToService,
} from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportUtil';
import { hasFactorObj } from '@/views/subModules/CarbonFootprintModel/util';

import styles from './index.module.less';
import {
  getProcessAccountEmissionTypeSchema,
  processAccountEmissionSourceSchema,
} from './schema';
import {
  ProcessAccountMatchWay,
  ProcessAccountSelectFactorProps,
} from './type';
import {
  postProcessAccountInEdit,
  postProcessAccountInEditAndRequest,
  postProcessAccountingDetailsInfo,
  postProcessAccountOutInEdit,
  postProcessDetailsInfo,
  postProcessInEdit,
  postProcessOutEdit,
} from '../../service';

const { MAX } = AMOUNT;

const { FACTOR_ICON, SUPPLIER_ICON } = MODEL_EMISSION_MATCH_WAY_ICON;

const { FACTOR, FACTOR_CREATE, SUPPLIER } = MATCH_WAY;

// 创建一个 SchemaField 组件用于解析JSON-Schema动态渲染表单的组件
const SchemaField = createSchemaField({
  // 组件列表
  components: {
    FormilyButtonSelect,
    FormLayout,
    FormGrid,
    FormItem,
    Input,
    Select,
    Cascader,
    Radio,
    DatePicker,
    CustomInput,
    FormilyFactor,
    ArrayCollapse,
    CustomHeaderIndex,
    NumberPicker,
    ArrayRemove,
  },
});

const ProcessAccountSelectFactor: VFC<ProcessAccountSelectFactorProps> = ({
  treeNode,
  apiExtraParams,
  processAccountId,
  formValuesString,
  isProcess,
  onUpdateClick,
  isEdit = false,
  currentWidth,
  isOnlyDetail,
  showFactorEvaluationCard = true,
  enableFactorSourceRange,
  factorPrefId,
}) => {
  const { amountDecimalPlace, productWeightDecimalPlace } = useContext(
    MeasurementPrecisionContext,
  );
  /** 分享/快照上下文：与建模画布、排放源抽屉一致 */
  const isShareLinkEditable = isShareLinkEditableContext(apiExtraParams);
  const isShare =
    [
      API_EXTRA_PARAMS_SNAPFLAG.SHARE,
      API_EXTRA_PARAMS_SNAPFLAG.SAASSHARE,
    ].includes(apiExtraParams?.snapFlag) ||
    (has(apiExtraParams, 'snapFlag') && !isShareLinkEditable);

  const showFactorEvalInSchema =
    showFactorEvaluationCard && !isShare && !isShareLinkEditable;

  // 缓存当前的表单旧名称，判断是否改变
  const formNameUseRef = useRef('');
  const defaultApiExtraParams = apiExtraParams || {};

  const formStatusRef = useRef({ dataInitializing: true });

  const [btnStatus, setBtnStatus] = useState(isEdit);

  const [emissionRequestState, setEmissionRequestState] = useState(
    MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT,
  );

  const [showModalFactor, setShowModalFactor] = useState(false);

  const [supplierCarbonDataModalVisible, setSupplierCarbonDataModalVisible] =
    useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    if (formValuesString) return formValuesString;
    return undefined;
  });

  /** 根据名称自动匹配因子loading */
  const [autoMatchFactorLoading, setAutoMatchFactorLoading] = useState(false);

  const childRef = useRef<{ subFilesData: () => AddFileData[] }>(null);

  /** 上传的文件列表 */
  const [fileListBack, setFileListBack] = useState<AddFileData[]>([]);

  const form = useMemo(
    () =>
      createForm<ProcessLibIn>({
        validateFirst: true,
        readPretty: !btnStatus,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        effects(form) {
          onFieldInputValueChange('matchWay', () => {
            (form.query('processProduct').take() as ObjectField)?.reset();
          });
          onFieldChange('typeExtra.way', field => {
            const calcWay = (field as Field).value as CalcWay;
            if (form.modified) {
              form.reset(
                FormPath.parse('typeExtra.*(amount,unitCode,weightUnitCode)'),
              );
            }

            Promise.resolve().then(() => {
              const typeExtraAmountField = form
                .query('typeExtra.amount')
                .take();

              if (calcWay === CALC_WAY.BEARING_RATIO) {
                // 计算方式为载重比
                form.setFieldState('typeExtra.amountColumn', {
                  title: I18N.carbonFootprint3.loadRatio2,
                });
                typeExtraAmountField?.setDecoratorProps({ addonAfter: '' });
                typeExtraAmountField?.setComponentProps({
                  placeholder: I18N.carbonFootprint3.loadRatio,
                });
                (typeExtraAmountField as Field)?.setValidator([
                  genRequiredValidator({
                    title: I18N.carbonFootprint3.loadRatio,
                  }),
                  genNumberValidator({
                    max: MAX,
                    decimalPlace: MAX_DECIMAL_PLACE,
                  }),
                ]);
              } else {
                // 计算方式为产品重量或者能耗
                const title =
                  calcWay === CALC_WAY.PRODUCT_WEIGHT
                    ? I18N.carbonFootprint3.productWeight
                    : I18N.carbonFootprint3.consumptionQuantity;
                form.setFieldState('typeExtra.amountColumn', {
                  title,
                });
                typeExtraAmountField?.setDecoratorProps({ addonAfter: '/' });
                typeExtraAmountField?.setComponentProps({
                  placeholder: title,
                });
                (typeExtraAmountField as Field)?.setValidator([
                  genRequiredValidator({ title }),
                  genNumberValidator({
                    max: MAX,
                    decimalPlace: MAX_DECIMAL_PLACE,
                  }),
                ]);
              }
            });
          });
          onFieldInputValueChange('unitCode', () => {
            const matchWay = form.getValuesIn('matchWay');
            if (matchWay !== MATCH_WAY.SUPPLIER) {
              return;
            }
            const supplierObj = form.getValuesIn('supplierObj') as
              | Record<string, any>
              | undefined;
            if (supplierObj?.id == null) {
              return;
            }
            calcSupplierResultUnitRate(
              getEmissionUnitCodeFromForm(form),
              parseSupplierResultUnitCode(supplierObj),
            )
              .then(supplierRate => {
                form.setValuesIn('rate', supplierRate);
              })
              .catch(() => {
                form.setValuesIn('rate', '1');
              });
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
          onFieldValueChange('matchWay', field => {
            field.setDataSource(
              field.value === MATCH_WAY.SUPPLIER
                ? [
                    {
                      value: MATCH_WAY.SUPPLIER,
                      label: MATCH_WAY_LABEL[MATCH_WAY.SUPPLIER],
                      icon: SUPPLIER_ICON,
                    },
                  ]
                : [
                    {
                      value: MATCH_WAY.FACTOR,
                      label: MATCH_WAY_LABEL[MATCH_WAY.FACTOR],
                      icon: FACTOR_ICON,
                    },
                  ],
            );
          });
        },
      }),
    [btnStatus],
  );

  const submit = async (options?: { requestSupplier?: boolean }) => {
    const {
      processLibName: processLibNameValue,
      factorObj,
      processProduct,
      supplierObj,
      accountEmissionTransportList,
      ...formValues
    } = await form.submit<ProcessLibIn & { processLibName: string }>();

    let rate: number | string | undefined;

    // 获取要上传的支撑文件信息
    const files = childRef.current?.subFilesData();

    if (factorObj) {
      // 选择因子or新建因子
      rate = ((factorObj as unknown as { rate: string }) || {}).rate;
      Object.assign(factorObj || {}, {
        ...factorObj,
        numeratorUnit: undefined,
        denominatorUnit: undefined,
        rate: undefined,
      });
    }

    if (processProduct) {
      // 选择过程库产品
      rate = ((processProduct as unknown as { rate: string }) || {}).rate;
      Object.assign(processProduct || {}, {
        ...processProduct,
        unitCode: (processProduct.unitCode as unknown as string[])?.[1],
        rate: undefined,
      });
    }

    if (
      formValues.typeExtra &&
      formValues.type === EMISSION_TYPE_OPTIONS.TRANS
    ) {
      // 输入类型为运输
      const typeExtra = formValues.typeExtra as {
        weightUnitCode: string | undefined;
      } & ProcessLibIn['typeExtra'];

      if (typeExtra.unitCode) {
        typeExtra.unitCode = (typeExtra.unitCode as unknown as string[])?.[1];
        typeExtra.unitName =
          (
            form.getFieldState('typeExtra.unitCode').inputValues as {
              label: string;
            }[][]
          )?.[1]?.[1]?.label ||
          form.getFieldState('typeExtra.unitCode')?.data?.label;
      }

      if (typeExtra.weightUnitCode) {
        typeExtra.unitCode = typeExtra.weightUnitCode;
        typeExtra.unitName =
          TRANS_EMISSION_UNIT_LABEL[typeExtra.weightUnitCode];
        typeExtra.weightUnitCode = undefined;
      }
    }
    formValues.unitCode = (formValues.unitCode as unknown as string[])?.[1];
    formValues.unitName =
      (
        form.getFieldState('unitCode')?.inputValues as {
          label: string;
        }[][]
      )?.[1]?.[1]?.label || form.getFieldState('unitCode')?.data?.label;

    if (processProduct && formValues.unitName) {
      processProduct.unitName = formValues.unitName;
    }

    // 匹配方式是发起收数：已选供应商碳数据时使用换算比例，算不出时默认 1
    if (formValues.matchWay === MATCH_WAY.SUPPLIER && supplierObj) {
      rate = supplierObj.id != null ? formValues.rate ?? 1 : 1;
      const selectedSupplier = (
        (form.query('supplierObj.supplierId').take() as Field)?.dataSource || []
      ).find(({ value }) => supplierObj.supplierId === value);
      if (selectedSupplier?.isAdd) {
        supplierObj.computeCompanyName = supplierObj.supplierId;
        supplierObj.supplierId = null;
      }
      if (supplierObj.numeratorUnit && supplierObj.denominatorUnit) {
        supplierObj.unit = `${supplierObj.numeratorUnit}/${(
          supplierObj.denominatorUnit || []
        ).join(',')}`;
        supplierObj.numeratorUnit = undefined;
        supplierObj.denominatorUnit = undefined;
      }
    }

    const subData = {
      ...formValues,
      accountEmissionTransportList: TransportListTransToService(
        accountEmissionTransportList,
      ),
      rate,
      factorObj,
      processProduct,
      supplierObj,
    };

    try {
      /** 输入 */
      if (treeNode.processType === 1) {
        if (isProcess) {
          await postProcessInEdit({
            ...defaultApiExtraParams,
            ...subData,
            id: treeNode.dataId,
            files,
          });
        } else if (options?.requestSupplier) {
          await postProcessAccountInEditAndRequest({
            ...defaultApiExtraParams,
            ...subData,
            accountId: processAccountId,
            processId: treeNode.dataId,
            files,
          });
        } else {
          await postProcessAccountInEdit({
            ...defaultApiExtraParams,
            ...subData,
            accountId: processAccountId,
            processId: treeNode.dataId,
            files,
          });
        }
      }

      /** 输出 */
      if (treeNode.processType === 2) {
        if (isProcess) {
          await postProcessOutEdit({
            ...defaultApiExtraParams,
            ...subData,
            id: treeNode.dataId,
            files,
          });
        } else {
          await postProcessAccountOutInEdit({
            ...defaultApiExtraParams,
            ...subData,
            accountId: processAccountId,
            processId: treeNode.dataId,
            files,
          });
        }
      }

      Toast('success', I18N.carbonFootprint.editSuccessful);
      onUpdateClick();
      formStatusRef.current.dataInitializing = true;
      setBtnStatus(false);
    } catch {
      /* empty */
    }
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
    const supplierRate = await calcSupplierResultUnitRate(
      getEmissionUnitCodeFromForm(form),
      parseSupplierResultUnitCode(supplierObj),
    );
    form.setValues({
      supplierObj,
      rate: supplierRate,
    });
    form.validate('supplierObj');
    setEmissionRequestState(MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT);
    setSupplierCarbonDataModalVisible(false);
  };

  /**
   * @description: 选择因子的回调
   * @param {SerachCarbonFactorResult} data 选中的因子数据
   */
  const selectFactor = async (data: SerachCarbonFactorResult) => {
    const [numeratorUnit, denominatorUnit] = (data.unit || '').split('/');
    const formFactorObjValue = form.getValuesIn('factorObj');
    form.setValues({
      factorObj: {
        ...formFactorObjValue,
        ...data,
        numeratorUnit,
        denominatorUnit,
      },
    });

    setShowModalFactor(false);
  };

  /**
   * @description: 异步获取产品数据源
   * @param {Field} field
   */
  const useAsyncProductDataSource = () => (field: Field) => {
    field.loading = true;
    getEmissionSoureListData().then(back => {
      const enumData = back.data.rows;
      field.dataSource = enumData.map(data => ({
        label: data.name,
        value: data.name,
      }));
      field.loading = false;
    });
  };

  /**
   * @description: 获取因子或者过程的详细信息
   */
  const getFactorOrProcessInfo = async () => {
    await form.reset();
    const { data } = await (isProcess
      ? postProcessDetailsInfo
      : postProcessAccountingDetailsInfo)({
      ...treeNode,
      ...defaultApiExtraParams,
    });
    const processLibInInfo = data.data;

    const {
      id,
      name,
      type,
      amount,
      unitCode,
      unitName,
      matchWay,
      factorObj,
      processProduct,
      supplierObj,
      rate,
      typeExtra,
      files,
      requestState,
      accountEmissionTransportList,
    } = processLibInInfo || {};

    setEmissionRequestState(
      requestState ?? MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT,
    );
    if (
      getSupplierSaveFooterMode({
        matchWay,
        supplierObjId: supplierObj?.id,
        requestState: requestState ?? MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT,
      }) === 'readOnly'
    ) {
      setBtnStatus(false);
    }

    if (files) {
      setFileListBack(files);
    } else {
      setFileListBack([]);
    }

    // let unitFieldPattern = '';
    // if (type !== PROCESS_LIB_IN_TYPE.TRANSPORTATION) {
    //   unitFieldPattern = 'unitCode';
    // } else if (typeExtra.way === CALC_WAY.PRODUCT_WEIGHT) {
    //   unitFieldPattern = 'typeExtra.weightUnitCode';
    // } else if (typeExtra.way === CALC_WAY.ENERGY_CONSUMPTION) {
    //   unitFieldPattern = 'typeExtra.unitCode';
    // }

    const formSetValue: any = {
      id,
      name,
      type,
      matchWay,
      needTransport:
        accountEmissionTransportList?.length ||
        type === QUICK_ACCOUNT_EMISSION.TRANS
          ? 2
          : 1,
      accountEmissionTransportList: serviceToForm(accountEmissionTransportList),
    };

    formSetValue.amount = amount as number;
    formSetValue.typeExtra = undefined;
    form.setFieldState('unitCode', {
      data: {
        value: unitCode,
        label: unitName,
      },
    });
    const {
      way,
      amount: typeExtraAmount,
      distance,
      unitCode: typeExtraUnitCode,
      unitName: typeExtraUnitName,
    } = typeExtra || {};
    const typeExtraVal: any = {
      name,
      way,
    };

    if (typeExtraAmount !== undefined) {
      typeExtraVal.amount = typeExtraAmount;
    }

    if (way === CALC_WAY.ENERGY_CONSUMPTION) {
      form.setFieldState('typeExtra.unitCode', {
        data: {
          value: typeExtraUnitCode,
          label: typeExtraUnitName,
        },
      });
    }

    if (way === CALC_WAY.PRODUCT_WEIGHT) {
      typeExtraVal.weightUnitCode = typeExtraUnitCode;
    }

    if (distance !== undefined) {
      typeExtraVal.distance = distance;
    }

    formSetValue.typeExtra = typeExtraVal;

    if (factorObj) {
      form.setValues({
        ...formSetValue,
        factorObj: {
          id: factorObj.id,
          name: factorObj.name,
          factor: factorObj.factor,
          numeratorUnit: (factorObj.unit || '').split('/')[0] || undefined,
          denominatorUnit: (factorObj.unit || '').split('/')[1] || undefined,
          rate,
          matchWay,
          institution: factorObj.institution,
          year: factorObj.year,
          factorPattern: factorObj.factorPattern,
          ecoinventValueVisible: factorObj.ecoinventValueVisible,
          unit: factorObj.unit,
        },
      });
    }

    if (processProduct) {
      form.setValues({
        ...formSetValue,
        processProduct: {
          id: processProduct.id,
          processId: processProduct.processId,
          type: processProduct.type,
          processName: processProduct.processName,
          productName: processProduct.productName,
          rate,
          accountYear: processProduct.accountYear,
          unitName: processProduct.unitName,
        },
      });

      form.setFieldState('processProduct.unitCode', {
        data: {
          value: processProduct.unitCode,
        },
      });
    }

    if (matchWay === MATCH_WAY.SUPPLIER && supplierObj) {
      if (supplierObj.unit) {
        const [numeratorUnit, denominatorUnit] = (supplierObj.unit || '').split(
          '/',
        );
        supplierObj.numeratorUnit = numeratorUnit;
        supplierObj.denominatorUnit = (denominatorUnit || '').split(',');
        supplierObj.unit = undefined;
      }

      if (supplierObj.supplierId === null) {
        supplierObj.supplierId = supplierObj.computeCompanyName;
      }

      // 分享页面没有下拉列表，所以直接赋值
      if (isShare) {
        supplierObj.supplierId = supplierObj.computeCompanyName;
      }

      if (!btnStatus && supplierObj?.computeCompanyName) {
        supplierObj.supplierId = supplierObj.computeCompanyName;
      }

      form.setValues({ ...formSetValue, rate, supplierObj });

      if (supplierObj?.id && !rate) {
        calcSupplierResultUnitRate(
          getEmissionUnitCodeFromForm(form),
          parseSupplierResultUnitCode(supplierObj),
        )
          .then(supplierRate => {
            form.setValuesIn('rate', supplierRate);
          })
          .catch(() => {
            form.setValuesIn('rate', '1');
          });
      }
    }
    form.setValues({ ...formSetValue });
  };

  /**
   * 基本信息 名称输入框输入后动态获取因子信息
   * @param newName 名称
   */
  const onBasicNameChange = async (needNew: boolean = false) => {
    if (needNew) {
      if (hasFactorObj(toJS(form.getValuesIn('factorObj')))) {
        return;
      }
    }
    const newName = form.getValuesIn('name');
    // 没有更改表单直接返回
    // if (!form.modified) return;

    // 名称相同不出发
    // if (formNameUseRef.current === newName) return;

    // 如果因子为手动填写也返回 - 手动填写的因子更改名称不自动匹配因子
    if (
      form.getValuesIn('factorObj.matchWay') === FACTOR_CREATE ||
      form.getValuesIn('matchWay') === FACTOR_CREATE ||
      form.getValuesIn('type') === QUICK_ACCOUNT_EMISSION.TRANS ||
      form.getValuesIn('matchWay') === SUPPLIER
    )
      return;

    formNameUseRef.current = newName;

    const formType = form.getValuesIn('type');

    try {
      // 只有排放源名称更改后才会自动匹配 不论是否已经存在因子 - 3.5.5测试用例评审更改需求 10-08
      setAutoMatchFactorLoading(true);
      const { data } = await postAutoMatchFactor({
        name: newName,
        factorType: '3',
        productId: GetLocalStorageProductId(),
        emissionType: formType ? ALL_EMISSION_LABEL()[formType] : undefined,
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
    } catch (error) {
      form.setValuesIn('factorObj', undefined);
    } finally {
      setAutoMatchFactorLoading(false);
    }
  };

  useEffect(() => {
    getFactorOrProcessInfo();
  }, [form, btnStatus, treeNode]);

  useEffect(() => {
    /** 每次切换树形菜单后  都需要更新右侧编辑装填 */
    setBtnStatus(false);
    formNameUseRef.current = '';
  }, [treeNode]);

  /** 因为菜单侧边栏滑动能触发字段valueChange问题所以监听侧边栏移动 */
  useEffect(() => {
    formStatusRef.current.dataInitializing = true;
    form.setFormState({
      readPretty: true,
    });
    setBtnStatus(false);
  }, [currentWidth]);

  // TODO: sunguangbiao 过程核算列表表格逻辑
  return (
    <div className={styles.processAccountSelectFactor}>
      <div className={styles.titleBtn}>
        <FormProvider form={form}>
          <FormConsumer>
            {_form => {
              // 选择的供应商碳数据的id
              const supplierCarbonDataId = (
                _form.values as { supplierObj: Record<string, any> }
              )?.supplierObj?.id;

              const supplierSaveMode = getSupplierSaveFooterMode({
                matchWay: form.values?.matchWay,
                supplierObjId: supplierCarbonDataId,
                requestState: emissionRequestState,
              });

              if (isOnlyDetail || supplierSaveMode === 'readOnly') {
                return '';
              }

              if (!btnStatus) {
                return (
                  <Button
                    type='primary'
                    onClick={async () => {
                      formStatusRef.current.dataInitializing = true;
                      setTimeout(() => {
                        formStatusRef.current.dataInitializing = false;
                      }, 1000);
                      setBtnStatus(true);
                    }}
                  >
                    {I18N.carbonFootprint.edit}
                  </Button>
                );
              }
              return (
                <>
                  <Button
                    onClick={async () => {
                      setBtnStatus(false);
                      formStatusRef.current.dataInitializing = true;
                    }}
                  >
                    {I18N.carbonFootprint.cancel}
                  </Button>
                  <Button
                    onClick={() => submit()}
                    type={
                      supplierSaveMode === 'dualSave' ? 'default' : 'primary'
                    }
                    className='m-l-10'
                  >
                    {supplierSaveMode === 'dualSave'
                      ? I18N.carbonFootprint3.saveOnly
                      : I18N.carbonFootprint.preserve}
                  </Button>
                  {supplierSaveMode === 'dualSave' && (
                    <Button
                      type='primary'
                      className='m-l-10'
                      onClick={() => submit({ requestSupplier: true })}
                    >
                      {I18N.carbonFootprint3.saveAndGet}
                    </Button>
                  )}
                </>
              );
            }}
          </FormConsumer>
        </FormProvider>
      </div>
      <FormilyCommon<any> form={form}>
        <>
          <div style={{ padding: '16px 26px 16px 16px' }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>
              {I18N.carbonFootprint.basicInformation}
            </div>
            <SchemaField
              schema={processAccountEmissionSourceSchema(
                () => onBasicNameChange(true),
                amountDecimalPlace,
              )}
              scope={{
                useFieldUnitDictSource,
                useAsyncProductDataSource,
                useFieldSetValueByLabel,
              }}
            />
          </div>
          {/* <div className={styleCarbonFootprint3.customHr} /> */}
          <div style={{ padding: '16px 26px 16px 16px' }}>
            <FormConsumer>
              {_form => {
                const type = _form.getValuesIn('type');
                if (type !== 7) {
                  return (
                    <div style={{ fontWeight: 600, marginBottom: 16 }}>
                      {I18N.carbonFootprint3.emissionData}
                    </div>
                  );
                }
                return '';
              }}
            </FormConsumer>

            <div className={styles.btnContainer}>
              <SchemaField
                schema={getProcessAccountEmissionTypeSchema(!btnStatus)}
              />
              <FormConsumer>
                {_form => {
                  const matchWay = _form.getValuesIn(
                    'matchWay',
                  ) as ProcessAccountMatchWay;
                  const type = _form.getValuesIn('type');

                  if (
                    matchWay === MATCH_WAY.SUPPLIER &&
                    btnStatus &&
                    type !== QUICK_ACCOUNT_EMISSION.TRANS
                  ) {
                    return (
                      <Button
                        type='primary'
                        onClick={async () =>
                          setSupplierCarbonDataModalVisible(true)
                        }
                      >
                        {I18N.carbonFootprint3.selectSupplier}
                      </Button>
                    );
                  }
                  return '';
                }}
              </FormConsumer>
            </div>
            <Spin spinning={autoMatchFactorLoading}>
              <SchemaField
                schema={getNewEmissionFactorSchema(
                  undefined,
                  undefined,
                  onBasicNameChange,
                  undefined,
                  undefined,
                  showFactorEvalInSchema,
                  enableFactorSourceRange,
                  factorPrefId,
                )}
                scope={{ AdditionalFormItemMaps }}
              />
            </Spin>

            <SchemaField
              schema={genSupplierSchema(isShare)}
              scope={{
                useFieldUnitDictSource,
                useFieldSetValueByLabel,
                useFieldSupplierSource,
                useFieldFlattenUnitDictSource,
              }}
            />
          </div>
          {!isProcess && (
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {I18N.carbonFootprint3.supportingMaterials}
              </div>
              <div style={{ color: '#999EA4', fontSize: 12, marginBottom: 8 }}>
                {I18N.carbonFootprint3.supportPdf}
              </div>
              <CarbonFootprint3UploadFile
                cRef={childRef}
                maxWidth={300}
                isDetail={!btnStatus}
                fileListBack={fileListBack}
              />
            </div>
          )}
          <div className={styles.titleContainer}>
            <div className={styles.title}>
              {I18N.carbonFootprint3.transportationInformation}
            </div>
          </div>
          <div className={styles.collWrapper}>
            <SchemaField
              schema={transportSchema({
                showFactorEvaluationCard: showFactorEvalInSchema,
                enableFactorSourceRange,
                factorPrefId,
                productWeightDecimalPlace,
              })}
              scope={{
                useNeedTransportReaction,
                AdditionalFormItemMaps,
                useFieldUnitDictSource,
                useFieldSetValueByLabel,
                useFactorObjReaction,
                useFactorObjUnitStringReaction,
                useFieldDataSourceReaction,
                useUnitDataSourceReaction,
              }}
            />
          </div>
        </>
      </FormilyCommon>
      {!isShare && (
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
      )}
      {!isShare && (
        <Modal
          title={I18N.carbonFootprint3.chooseEmissionFactors}
          width={1200}
          maskClosable={false}
          getContainer={false}
          open={showModalFactor}
          footer={null}
          style={{
            top: 50,
          }}
          bodyStyle={{
            padding: '0 16px',
          }}
          onCancel={() => setShowModalFactor(false)}
        >
          <SearchModalFactor
            subClick={selectFactor}
            factorName={form.values?.name}
            enableFactorSourceRange={enableFactorSourceRange}
            factorPrefId={factorPrefId}
            onCancel={async () => {
              setShowModalFactor(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default memo(ProcessAccountSelectFactor);
