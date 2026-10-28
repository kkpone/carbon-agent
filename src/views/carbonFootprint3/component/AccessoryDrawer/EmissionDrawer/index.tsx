/*
 * @@description:
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-shadow */
import {
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Select,
  Cascader,
  Radio,
  DatePicker,
  ArrayCollapse,
  NumberPicker,
} from '@formily/antd-v5';
import {
  createForm,
  Field,
  Form,
  ObjectField,
  onFieldChange,
  onFieldInputValueChange,
  onFormMount,
  onFormUnmount,
} from '@formily/core';
import { createSchemaField, FormConsumer, FormProvider } from '@formily/react';
import { API_EXTRA_PARAMS_SNAPFLAG } from '@src/components/CarbonFootprintAccount/BuildModelMainData/constant';
import {
  filterShareEditMatchWayOptions,
  isShareLinkEditableContext,
} from '@src/components/CarbonFootprintAccount/BuildModelMainData/shareSnapFlag';
import { ApiExtraParams } from '@src/components/CarbonFootprintAccount/BuildModelMainData/type';
import FormilyButtonSelect from '@src/components/FormilyUtil/FormilyButtonSelect';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import FormilyFactor from '@src/components/FormilyUtil/FormilyFactor';
import useFieldFlattenUnitDictSource from '@src/hooks/useFieldFlattenUnitDataSource';
import useFieldSetValueByLabel from '@src/hooks/useFieldSetValueByLabel';
import useFieldSupplierSource from '@src/hooks/useFieldSupplierSource';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { GetLocalStorageProductId } from '@src/utils/store';
import {
  MODEL_EMISSION_BORDER_TYPE,
  MODEL_EMISSION_DATA_TYPE,
  MODEL_EMISSION_REQUEST_STATE,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import ProcessVisualizationFooterDrawer from '@src/views/carbonFootprint3/ProcessBusinessAccounting/VisualizationDrawer/FooterDrawer';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import ModalEmissionSourceTable from '@src/views/carbonFootprint3/component/EmissionSourceTable/ModalEmissionSource';
import FormilyFileUpload from '@src/views/carbonFootprint3/component/FormilyFileUpload';
import {
  ALL_EMISSION_LABEL,
  ECOINVENT_TEXT,
  EMISSION_TYPE_OPTIONS,
  QUICK_ACCOUNT_EMISSION,
  // TRANS_EMISSION_UNIT_LABEL,
} from '@src/views/carbonFootprint3/constant';
import {
  AMOUNT,
  CALC_WAY,
  MATCH_WAY,
  MAX_DECIMAL_PLACE,
} from '@src/views/carbonFootprint3/discharge/process/constant';
import { CalcWay } from '@src/views/carbonFootprint3/discharge/process/type';
import { genRequiredValidator } from '@src/views/carbonFootprint3/discharge/process/utils';
import { OptionsTypesData } from '@src/views/carbonFootprint3/type';
import { genNumberValidator } from '@src/views/carbonFootprint3/util';
import { FactorPatternType } from '@src/views/emission/utils/index-type';
import { useUnmount } from 'ahooks';
import { Drawer, Button, Modal, Spin, App } from 'antd';
import classNames from 'classnames';
import { debounce, has } from 'lodash-es';
import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';

import { MeasurementPrecisionContext } from '@/components/CarbonFootprintAccount/BuildModelMainData/measurementPrecisionContext';
import { CustomHeaderIndex } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/components/CustomHeader';
import { ArrayRemove } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/components/Remove';
import {
  AdditionalFormItemMaps,
  getNewEmissionFactorSchema,
  genEmissionFileSchema,
  transportSchema,
  useFactorObjReaction,
  useFactorObjUnitStringReaction,
  useFieldDataSourceReaction,
  useNeedTransportReaction,
  useUnitDataSourceReaction,
} from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportSchema';

import {
  calcSupplierResultUnitRate,
  getEmissionUnitCodeFromForm,
  getSupplierSaveFooterMode,
  isSupplierRequestReadOnly,
  parseSupplierResultUnitCode,
} from '../utils';

import styles from './index.module.less';
import {
  genEmissionBasicSchema,
  genMatchWaySchema,
  genSupplierSchema,
} from './schema';
import { getEmissionType, postAutoMatchFactor } from './service';
import { Emission } from './type';
import SupplierCarbonDataModal from '../../SupplierCarbonDataModal';
import { SupplierCarbonData } from '../../SupplierCarbonDataModal/type';

import '../index.less';
import {
  serviceToForm,
  TransportListTransToService,
} from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportUtil';

import { toJS } from '@formily/reactive';

import { hasFactorObj } from '@/views/subModules/CarbonFootprintModel/util';

const { MAX } = AMOUNT;

const { FACTOR, FACTOR_CREATE, SUPPLIER } = MATCH_WAY;

const SchemaField = createSchemaField({
  // 组件列表
  components: {
    FormLayout,
    FormGrid,
    FormItem,
    Input,
    Select,
    Cascader,
    DatePicker,
    FormilyButtonSelect,
    FormilyFileUpload,
    FormilyFactor,
    Radio,
    ArrayCollapse,
    CustomHeaderIndex,
    NumberPicker,
    ArrayRemove,
  },
});

type EmissionDrawerProps = {
  visible: boolean;
  title?: string;
  copyStatus?: boolean;
  isProcess?: boolean;
  processName?: string;
  readPretty?: boolean;
  isOnlyDetail?: boolean;
  initialValues?: Emission;
  loading?: boolean;
  stage?: number;
  matchWayOptions?: { value: number; label: string }[];
  defaultMatchWay?: number;
  onChangeMatchWayBack?: (way: number) => void;
  setFormMounted?: (mounted: boolean) => void;
  onOk?: (values: Emission, requestSupplier?: boolean) => void;
  selectSupplierCallback?: () => void;
  onCancel: () => void;
  apiExtraParams?: ApiExtraParams;
  /** 因子选用评价卡片；默认展示，可由上层关闭（与排放源抽屉一致） */
  showFactorEvaluationCard?: boolean;
  /** 是否展示排放因子库的数据源范围筛选 */
  enableFactorSourceRange?: boolean;
  /** 当前核算选择的全局因子偏好方案 */
  factorPrefId?: number | string;
};

// TODO: sunguangbiao
const EmissionDrawer = forwardRef<
  {
    form: Form<Record<string, any>>;
    getFormatterFormValues: () => Promise<Emission>;
  },
  EmissionDrawerProps
>(
  (
    {
      visible,
      isProcess,
      copyStatus,
      title,
      readPretty,
      isOnlyDetail,
      initialValues,
      loading,
      stage,
      matchWayOptions,
      defaultMatchWay,
      onChangeMatchWayBack,
      setFormMounted,
      onOk,
      onCancel,
      selectSupplierCallback,
      apiExtraParams,
      showFactorEvaluationCard = true,
      enableFactorSourceRange,
      factorPrefId,
    },
    ref,
  ) => {
    const { amountDecimalPlace, productWeightDecimalPlace } = useContext(
      MeasurementPrecisionContext,
    );
    /** 分享/快照上下文：与建模画布 QuickBuildVisual、排放源抽屉一致 */
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
    const formStatusRef = useRef({ dataInitializing: false });

    const [submitLoading, setSubmitLoading] = useState(false);

    const [supplierFormReadOnly, setSupplierFormReadOnly] = useState(() =>
      isSupplierRequestReadOnly({
        matchWay: initialValues?.matchWay ?? defaultMatchWay,
        supplierObjId: initialValues?.supplierObj?.id,
        requestState: initialValues?.requestState,
      }),
    );

    const isDetailStatus = readPretty || isOnlyDetail || supplierFormReadOnly;
    /** 共享编辑：发起收数区块只读 */
    const isShareMatchWayReadOnly = isShareLinkEditable && !isDetailStatus;
    const [autoMatchFactorLoading, setAutoMatchFactorLoading] = useState(false);

    const [emissionModalVisible, setEmissionModalVisible] = useState(false);

    /** '1'-普通因子 '2'-ecoinvent因子 */
    const [factorPattern, setFactorPattern] = useState<FactorPatternType>();

    /** 储存因子数值 */
    const [fealFactor, setFealFactor] = useState<string | number>();

    const [supplierCarbonDataModalVisible, setSupplierCarbonDataModalVisible] =
      useState(false);
    /** 排放源中的搜索类别 */
    const [emissionOptions, setEmissionOptions] = useState<OptionsTypesData[]>(
      [],
    );

    const form = useMemo(
      () =>
        createForm<Record<string, any>>({
          readPretty: isDetailStatus,
          effects(form) {
            onFieldInputValueChange('matchWay', field => {
              (form.query('supplierObj').take() as ObjectField)?.reset();
              (form.query('supplierObj.dataType').take() as Field)?.setValue(
                MODEL_EMISSION_DATA_TYPE.RESULT,
              );
              (
                form.query('supplierObj.footBorderType').take() as Field
              )?.setValue(MODEL_EMISSION_BORDER_TYPE.HALF);
              setFactorPattern(FactorPatternType.ordinaryFactor);

              // 共享编辑：发起收数字段只读
              if (isShareMatchWayReadOnly) {
                const locked = field.value === MATCH_WAY.SUPPLIER;
                form.query('supplierObj.*').forEach(supplierField => {
                  supplierField.setPattern(locked ? 'readPretty' : 'editable');
                });
              }

              // 当前切换的matchWay方式返回出去 - 主要是为了不影响其他引用，改变供应商的底部按钮
              if (onChangeMatchWayBack) {
                onChangeMatchWayBack(field.value);
              }
            });

            onFieldChange('typeExtra.way', ['value'], field => {
              const calcWay = (field as Field).value as CalcWay;
              // form.reset(
              //   FormPath.parse('typeExtra.*(amount,unitCode,weightUnitCode)'),
              // );
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
            onFormMount(() => {
              setFormMounted?.(true);
            });
            onFormUnmount(() => {
              setFormMounted?.(false);
            });
          },
        }),
      [visible, isDetailStatus, matchWayOptions, isShareMatchWayReadOnly],
    );

    const getFormatterFormValues = async () => {
      const formVal = await form.submit<Record<string, any>>();
      const {
        name,
        shareRate,
        amount,
        files,
        factorObj,
        processProduct,
        matchWay,
        unitCode,
        typeExtra,
        type,
        supplierObj,
        accountEmissionTransportList,
      } = formVal;

      let rate: number | string = '';

      if (factorObj) {
        rate = (factorObj as unknown as { rate: string }).rate;
        Object.assign(factorObj || {}, {
          ...factorObj,
          numeratorUnit: undefined,
          denominatorUnit: undefined,
          rate: undefined,
        });
      }

      // 匹配方式是发起收数：已选供应商碳数据时使用换算比例，算不出时默认 1
      if (matchWay === MATCH_WAY.SUPPLIER && supplierObj) {
        rate = supplierObj.id != null ? formVal.rate ?? 1 : 1;
        const selectedSupplier = (
          (form.query('supplierObj.supplierId').take() as Field)?.dataSource ||
          []
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

      const submitData = {
        name,
        shareRate,
        amount,
        accountEmissionTransportList: TransportListTransToService(
          accountEmissionTransportList,
          name,
        ),
        unitCode: unitCode ? (unitCode as unknown as string[])[1] : '',
        unitName:
          (
            form.getFieldState('unitCode')?.inputValues as {
              label: string;
            }[][]
          )?.[1]?.[1]?.label || form.getFieldState('unitCode')?.data?.label,
        rate,
        factorObj,
        processProduct,
        files,
        typeExtra,
        type,
        matchWay: factorObj?.matchWay || matchWay,
        supplierObj,
        processId: initialValues?.processId,
      };

      // if (typeExtra) {
      //   const { typeExtra } = submitData;

      //   if (typeExtra.unitCode) {
      //     typeExtra.unitCode = (typeExtra.unitCode as unknown as string[])?.[1];
      //     typeExtra.unitName =
      //       (
      //         form.getFieldState('typeExtra.unitCode').inputValues as {
      //           label: string;
      //         }[][]
      //       )?.[1]?.[1]?.label ||
      //       form.getFieldState('typeExtra.unitCode')?.data?.label;
      //   }

      //   if (typeExtra.way === 1) {
      //     typeExtra.unitName = TRANS_EMISSION_UNIT_LABEL[typeExtra.unitCode];
      //   }

      //   if (typeExtra.weightUnitCode) {
      //     typeExtra.unitCode = typeExtra.weightUnitCode;
      //     typeExtra.unitName =
      //       TRANS_EMISSION_UNIT_LABEL[typeExtra.weightUnitCode];
      //     typeExtra.weightUnitCode = undefined;
      //   }
      // }

      return submitData;
    };

    /**
     * 防抖方法 - 管理
     */
    const debounceClick = async (requestSupplier?: boolean) => {
      const submitData = await getFormatterFormValues();
      if (
        !submitData.factorObj?.factorPattern &&
        factorPattern === FactorPatternType.eCoinVent
      ) {
        submitData.factorObj.factor = fealFactor;
      }
      if (onOk) {
        await onOk(submitData, requestSupplier);
      }
      setFactorPattern(
        submitData.factorObj?.factorPattern || FactorPatternType.ordinaryFactor,
      );
    };

    const onConfirm = debounce(debounceClick, 500);

    /**
     * 选择排放源
     * @param emission 排放源信息
     */
    const selectEmission = async (emission: Record<string, any>) => {
      const {
        name,
        type,
        matchWay,
        matchObject,
        unitCode,
        unitName,
        typeExtra,
        rate,
        factorUnit,
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

      const initialValues: Record<string, any> = {
        emissionId,
        type,
        matchWay,
        needTransport: accountEmissionTransportList?.length > 0 ? 2 : 1,
        accountEmissionTransportList: serviceToForm(
          accountEmissionTransportList,
        ),
        factorObj: {
          factorPattern: emission.factorObj?.factorPattern,
          ecoinventValueVisible:
            emission.factorObj?.ecoinventValueVisible ??
            emission.ecoinventValueVisible,
          id,
          matchWay,
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
          unit: factorUnit,
        },
      };
      initialValues.name = name;
      form.setFieldState('unitCode', {
        data: { value: unitCode, label: unitName },
      });
      if (typeExtra) {
        switch (typeExtra.way) {
          case CALC_WAY.PRODUCT_WEIGHT:
            initialValues.typeExtra = {
              way: typeExtra.way,
              unitCode: typeExtra.unitCode,
              weightUnitCode: typeExtra.unitCode,
              amount: undefined,
              distance: undefined,
              name,
            };
            break;
          case CALC_WAY.BEARING_RATIO:
            initialValues.typeExtra = {
              way: typeExtra.way,
              name,
              amount: undefined,
              distance: undefined,
            };
            break;
          case CALC_WAY.ENERGY_CONSUMPTION:
            initialValues.name = name;
            initialValues.typeExtra = {
              way: typeExtra.way,
              // unitCode: typeExtra.unitCode,
              name,
              amount: undefined,
              distance: undefined,
            };
            form.setFieldState('typeExtra.unitCode', {
              data: { label: typeExtra.unitName },
            });
            break;
          default:
        }
      }

      if (form.values.matchWay === MATCH_WAY.SUPPLIER) {
        delete initialValues.matchWay;
      }
      // 先设置因子信息  因为上面的单位换算比例采用的是监听unitCode  先设置unitCOde会导致表单上因子单位还是旧的
      // form.setValues({
      //   factorObj: initialValues.factorObj,
      // });

      form.setValues({
        accountEmissionTransportList: [],
      });
      setTimeout(() => {
        form.setValues({
          ...initialValues,
          amount: undefined,
        });
        setEmissionModalVisible(false);
        setTimeout(() => {
          form.validate();
        }, 200);
      }, 32);
    };

    /**
     * 选择供应商
     * @param data 供应商信息
     */
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
      setSupplierFormReadOnly(false);
      // 选择完供应商 需要修改底部按钮， 底部按钮是外部传递过来
      if (selectSupplierCallback) {
        selectSupplierCallback();
      }
      form.validate('supplierObj');
      setSupplierCarbonDataModalVisible(false);
    };

    /**
     * 基本信息 名称输入框输入后动态获取因子信息
     * @param needNew 需要是空白的时候才触发自动匹配因子
     */
    const onBasicNameChange = async (needNew: boolean = false) => {
      // 没有更改表单直接返回
      // if (!form.modified) return;
      if (needNew) {
        if (hasFactorObj(toJS(form.getValuesIn('factorObj')))) {
          return;
        }
      }

      // 如果因子为手动填写也返回 - 手动填写的因子更改名称不自动匹配因子
      if (
        form.getValuesIn('factorObj.matchWay') === FACTOR_CREATE ||
        form.getValuesIn('matchWay') === FACTOR_CREATE ||
        form.getValuesIn('type') === QUICK_ACCOUNT_EMISSION.TRANS ||
        form.getValuesIn('matchWay') === SUPPLIER
      )
        return;

      const newName = form.getValuesIn('name');

      // 名称相同不出发
      // if (formNameUseRef.current === newName) return;

      // formNameUseRef.current = newName;
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
            matchWay: FACTOR,
            numeratorUnit,
            denominatorUnit,
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

    useImperativeHandle(ref, () => ({
      form,
      getFormatterFormValues,
    }));

    useEffect(() => {
      (async () => {
        if (initialValues) {
          formStatusRef.current.dataInitializing = true;
          const {
            name,
            type,
            amount,
            unitCode,
            matchWay,
            factorObj,
            supplierObj,
            processProduct,
            rate,
            typeExtra,
            files,
            unitName,
            accountEmissionTransportList,
            id: emissionId,
            requestState,
          } = initialValues;

          setSupplierFormReadOnly(
            isSupplierRequestReadOnly({
              matchWay: defaultMatchWay ?? matchWay,
              supplierObjId: supplierObj?.id,
              requestState,
            }),
          );

          form.setValues({
            emissionId,
            needTransport: accountEmissionTransportList?.length > 0 ? 2 : 1,
            accountEmissionTransportList: serviceToForm(
              accountEmissionTransportList,
            ),
          });

          form.setValues({
            name: copyStatus
              ? I18N.template(I18N.carbonFootprint3.names, { val1: name })
              : name,
            type,
            matchWay: defaultMatchWay ?? matchWay,
            files,
          });
          form.setValues({
            amount,
          });
          form.setFieldState('unitCode', {
            data: {
              value: unitCode,
              label: unitName,
            },
          });

          if (type !== EMISSION_TYPE_OPTIONS.TRANS) {
            // if (typeExtra) {
            //   form.setValues(typeExtra);
            // }
          } else {
            const {
              way,
              amount: typeExtraAmount,
              distance,
              unitCode: typeExtraUnitCode,
              unitName,
            } = typeExtra || {};
            form.setValues({
              typeExtra: {
                name,
                way,
              },
            });

            if (typeExtraAmount !== undefined) {
              form.setValues({
                typeExtra: {
                  amount: typeExtraAmount,
                },
              });
            }

            if (way === CALC_WAY.ENERGY_CONSUMPTION) {
              form.setFieldState('typeExtra.unitCode', {
                data: {
                  value: typeExtraUnitCode,
                  label: unitName,
                },
              });
            }

            if (way === CALC_WAY.PRODUCT_WEIGHT) {
              form.setValues({
                typeExtra: {
                  weightUnitCode: typeExtraUnitCode,
                },
              });
            }

            if (distance !== undefined) {
              form.setValues({
                typeExtra: {
                  distance,
                },
              });
            }
          }

          if (factorObj) {
            const { factorPattern, factor } = factorObj;
            setFealFactor(factor);
            setFactorPattern(factorPattern);

            form.setValues({
              ...form.getValuesIn('factorObj'),
              factorObj: {
                id: factorObj.id,
                name: factorObj.name,
                factorPattern: factorObj.factorPattern,
                ecoinventValueVisible: factorObj.ecoinventValueVisible,
                factor: shouldHideEcoinventValue(factorObj)
                  ? ECOINVENT_TEXT
                  : factorObj.factor,
                numeratorUnit:
                  (factorObj.unit || '').split('/')[0] || undefined,
                denominatorUnit:
                  (factorObj.unit || '').split('/')[1] || undefined,
                rate,
                matchWay,
                institution: factorObj.institution,
                year: factorObj.year,
                unit: factorObj.unit,
              },
            });
          }

          if (processProduct) {
            form.setValues({
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

          // 只有非复制状态才触发
          if (supplierObj && !copyStatus) {
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
            if (
              isShare ||
              (isDetailStatus && supplierObj?.computeCompanyName)
            ) {
              supplierObj.supplierId = supplierObj.computeCompanyName;
            }

            form.setValues({ rate, supplierObj });

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

          if (isShareMatchWayReadOnly) {
            const currentMatchWay = defaultMatchWay ?? matchWay;
            const locked = currentMatchWay === MATCH_WAY.SUPPLIER;
            form.query('supplierObj.*').forEach(supplierField => {
              supplierField.setPattern(locked ? 'readPretty' : 'editable');
            });
          }

          setTimeout(() => {
            formStatusRef.current.dataInitializing = false;
          }, 1000);
        }
      })();
    }, [
      form,
      initialValues,
      isShareMatchWayReadOnly,
      defaultMatchWay,
      copyStatus,
    ]);

    useEffect(() => {
      getEmissionType({ ...apiExtraParams, stage }).then(({ data }) => {
        setEmissionOptions(data.data);
        (form.query('type').take() as Field)?.setDataSource(data.data || []);
      });
    }, [form, stage]);

    useUnmount(() => {
      formNameUseRef.current = '';
    });

    const { modal } = App.useApp();

    return (
      <Drawer
        width={700}
        closable={false}
        open={visible}
        placement='right'
        destroyOnClose
        rootClassName='processAccessoryDrawer'
        title={
          title ??
          (() => {
            if (copyStatus) {
              return I18N.carbonFootprint3.copyingEmissionSources;
            }
            if (isDetailStatus) {
              return I18N.carbonFootprint3.emissionSourceDetails;
            }
            if (initialValues) {
              return `${I18N.carbonFootprint.editEmissionSources2}`;
            }
            return I18N.carbonFootprint.newEmissionSourcesAdded;
          })()
        }
        bodyStyle={{
          padding: 0,
        }}
        footerStyle={{
          boxShadow: '0 -4px 8px 0 rgba(0,0,0,0.04)',
          height: 52,
          textAlign: 'center',
        }}
        footer={
          <FormProvider form={form}>
            <FormConsumer>
              {_form => {
                const supplierCarbonDataId = (
                  _form.values as { supplierObj: Record<string, any> }
                )?.supplierObj?.id;
                const matchWay = _form.getValuesIn('matchWay');
                const supplierSaveMode = getSupplierSaveFooterMode({
                  matchWay,
                  supplierObjId: supplierCarbonDataId,
                  requestState:
                    initialValues?.requestState ??
                    MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT,
                });

                if (isDetailStatus || supplierSaveMode === 'readOnly') {
                  return (
                    <ProcessVisualizationFooterDrawer
                      loading={loading}
                      isOnlyDetail={isDetailStatus}
                      onCancelClick={() => {
                        if (readPretty || !form.getFormState().modified) {
                          onCancel();
                          return;
                        }
                        modal.confirm({
                          title: I18N.carbonFootprint3.confirmToGiveUpWhen,
                          onOk: () => {
                            onCancel?.();
                          },
                        });
                      }}
                      onSubClick={async () => {
                        await onConfirm();
                      }}
                    />
                  );
                }

                return (supplierSaveMode === 'dualSave' ||
                  supplierSaveMode === 'singleSave') &&
                  !isShareLinkEditable ? (
                  <div className={styles.matchWayBtns}>
                    <Button
                      style={{ padding: '0 20px' }}
                      rootClassName={styles.btns}
                      onClick={() => {
                        if (readPretty || !form.getFormState().modified) {
                          onCancel();
                          return;
                        }
                        modal.confirm({
                          title: I18N.carbonFootprint3.confirmToGiveUpWhen,
                          onOk: () => {
                            onCancel?.();
                          },
                        });
                      }}
                    >
                      {I18N.carbonFootprint.cancel}
                    </Button>
                    <Button
                      style={{ padding: '0 20px' }}
                      rootClassName={classNames(styles.btns, 'm-l-16')}
                      loading={submitLoading}
                      type={
                        supplierSaveMode === 'singleSave'
                          ? 'primary'
                          : 'default'
                      }
                      onClick={async () => {
                        setSubmitLoading(true);
                        await onConfirm();
                        setTimeout(() => {
                          setSubmitLoading(false);
                        }, 1000);
                      }}
                    >
                      {supplierSaveMode === 'singleSave'
                        ? I18N.carbonFootprint.preserve
                        : I18N.carbonFootprint3.saveOnly}
                    </Button>
                    {supplierSaveMode === 'dualSave' && (
                      <Button
                        style={{ padding: '0 20px' }}
                        rootClassName={classNames(styles.btns, 'm-l-16')}
                        type='primary'
                        loading={submitLoading}
                        onClick={async () => {
                          setSubmitLoading(true);
                          await onConfirm(true);
                          setTimeout(() => {
                            setSubmitLoading(false);
                          }, 1000);
                        }}
                      >
                        {I18N.carbonFootprint3.saveAndGet}
                      </Button>
                    )}
                  </div>
                ) : (
                  <ProcessVisualizationFooterDrawer
                    loading={loading}
                    isOnlyDetail={isDetailStatus}
                    onCancelClick={() => {
                      if (readPretty || !form.getFormState().modified) {
                        onCancel();
                        return;
                      }
                      modal.confirm({
                        title: I18N.carbonFootprint3.confirmToGiveUpWhen,
                        onOk: () => {
                          onCancel?.();
                        },
                      });
                    }}
                    onSubClick={async () => {
                      await onConfirm();
                    }}
                  />
                );
              }}
            </FormConsumer>
          </FormProvider>
        }
        onClose={() => {
          if (readPretty || !form.getFormState().modified) {
            onCancel();
            return;
          }
          modal.confirm({
            title: I18N.carbonFootprint3.confirmToGiveUpWhen,
            onOk: () => {
              onCancel?.();
            },
          });
        }}
      >
        <Spin spinning={loading}>
          <div className={styles.processVisualizationDrawer}>
            <div className={styles.paddingMain}>
              <div
                className={`${styles.titleMain} m-b-20`}
                style={{ marginTop: 0 }}
              >
                <div className={styles.titleStyle}>
                  {I18N.carbonFootprint.basicInformation}
                </div>
                {!isDetailStatus && !isShareLinkEditable && (
                  <Button
                    type='primary'
                    onClick={() => {
                      setEmissionModalVisible(true);
                    }}
                  >
                    {I18N.carbonFootprint3.selectingEmissionSources}
                  </Button>
                )}
              </div>

              <FormilyCommon form={form}>
                <>
                  <SchemaField
                    schema={genEmissionBasicSchema(
                      () => onBasicNameChange(true),
                      amountDecimalPlace,
                    )}
                    scope={{
                      useFieldUnitDictSource,
                      useFieldSetValueByLabel,
                    }}
                  />
                  <FormConsumer>
                    {_form => {
                      const type = _form.getValuesIn('type');
                      if (type !== 7) {
                        return (
                          <div className={styles.titleMain}>
                            <div className={styles.titleStyle}>
                              {I18N.carbonFootprint3.emissionData}
                            </div>
                          </div>
                        );
                      }
                      return '';
                    }}
                  </FormConsumer>
                  <div className={`${styles.matchWayContainer} p-t-16`}>
                    <FormConsumer>
                      {() => {
                        const baseMatchWayOptions =
                          matchWayOptions && matchWayOptions.length > 0
                            ? matchWayOptions
                            : undefined;
                        const resolvedMatchWayOptions = isShareLinkEditable
                          ? filterShareEditMatchWayOptions(
                              baseMatchWayOptions ?? [
                                {
                                  value: MATCH_WAY.FACTOR,
                                  label: I18N.carbonFootprint.emissionFactors1,
                                },
                                {
                                  value: MATCH_WAY.SUPPLIER,
                                  label:
                                    I18N.carbonFootprint3.initiateCollection,
                                },
                              ],
                            )
                          : baseMatchWayOptions;
                        return (
                          <SchemaField
                            schema={genMatchWaySchema({
                              matchWayOptions: resolvedMatchWayOptions,
                              defaultMatchWay,
                            })}
                          />
                        );
                      }}
                    </FormConsumer>
                    <FormConsumer>
                      {_form => {
                        const matchWay = _form.getValuesIn('matchWay');
                        const type = _form.getValuesIn('type');
                        if (
                          matchWay === MATCH_WAY.SUPPLIER &&
                          !isDetailStatus &&
                          !isShareLinkEditable &&
                          type !== QUICK_ACCOUNT_EMISSION.TRANS
                        ) {
                          return (
                            <Button
                              type='primary'
                              onClick={() =>
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
                  {/* <SchemaField
                    schema={genFactorSchema({
                      onDenominatorUnitChange: () => {
                        const { type, typeExtra } = form.values;
                        let unitFieldPattern: FormPathPattern | undefined;
                        if (type === EMISSION_TYPE_OPTIONS.TRANS) {
                          if (typeExtra?.way === CALC_WAY.ENERGY_CONSUMPTION) {
                            unitFieldPattern = 'typeExtra.unitCode';
                          } else if (
                            typeExtra?.way === CALC_WAY.PRODUCT_WEIGHT
                          ) {
                            unitFieldPattern = 'typeExtra.weightUnitCode';
                          } else if (
                            typeExtra?.way === CALC_WAY.BEARING_RATIO
                          ) {
                            calcUnitRate(form, undefined, 'km');
                          }
                        }
                        calcUnitRate(form, unitFieldPattern);
                      },
                    })}
                    scope={{
                      useFieldUnitDictSource,
                      useFieldSetValueByLabel,
                    }}
                  /> */}
                  <div
                    style={{
                      marginTop: '16px',
                    }}
                  >
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
                  </div>

                  <SchemaField
                    schema={genSupplierSchema(isShare)}
                    scope={{
                      useFieldUnitDictSource,
                      useFieldSetValueByLabel,
                      useFieldSupplierSource,
                      useFieldFlattenUnitDictSource,
                    }}
                  />
                  {!isProcess && (
                    <>
                      <div className={styles.titleContainer}>
                        <div className={styles.title}>
                          {I18N.carbonFootprint3.supportingMaterials}
                        </div>
                      </div>
                      <div className={styles.fileContainer}>
                        <SchemaField
                          schema={genEmissionFileSchema(isDetailStatus)}
                        />
                      </div>
                    </>
                  )}
                  {/* TODO: sunguangbiao 过程核算抽屉 */}
                  <div className={styles.titleContainer}>
                    <div className={styles.title}>
                      {I18N.carbonFootprint3.transportationInformation}
                    </div>
                  </div>
                  <div className={styles.fileContainer}>
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
            </div>
          </div>
        </Spin>
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
            <Modal
              title={I18N.carbonFootprint3.selectingEmissionSources}
              width={1200}
              maskClosable={false}
              getContainer={false}
              open={emissionModalVisible}
              footer={null}
              style={{
                top: 50,
              }}
              bodyStyle={{
                padding: '0 16px',
              }}
              onCancel={() => setEmissionModalVisible(false)}
            >
              <ModalEmissionSourceTable
                emissionName={
                  form.values.name ||
                  (form.values.typeExtra && form.values.typeExtra.name) ||
                  ''
                }
                tableScrollOptions={{ y: 320 }}
                onCancel={async () => setEmissionModalVisible(false)}
                onConfirm={selectEmission}
                options={emissionOptions}
              />
            </Modal>
          </>
        )}
      </Drawer>
    );
  },
);
export default EmissionDrawer;
