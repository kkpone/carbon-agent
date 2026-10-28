/*
 * @@description: 排放数据库 - 新增排放源库
 */
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
} from '@formily/antd-v5';
import {
  createForm,
  Form,
  onFieldChange,
  onFieldInputValueChange,
  onFormInit,
  onFormUnmount,
} from '@formily/core';
import { createSchemaField, FormConsumer } from '@formily/react';
import { listALLByDictTypeBatch } from '@src/api/api';
import { FormActions } from '@src/components/FormActions';
import FormilyButtonSelect from '@src/components/FormilyUtil/FormilyButtonSelect';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import FormilyFactor from '@src/components/FormilyUtil/FormilyFactor';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import {
  MODEL_EMISSION_MATCH_WAY,
  URL_QUICK_MODEL_KEY,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { AddQuickEmissionSourceFormData } from '@src/views/carbonFootprint3/BusinessAccountingModel/type';
import { postQuickBusinessAccountingEmissionUnitRate } from '@src/views/carbonFootprint3/QuickBusinessAccounting/service';
import {
  ALL_EMISSION,
  ALL_EMISSION_LABEL,
  ECOINVENT_TEXT,
} from '@src/views/carbonFootprint3/constant';
import { getDicChildLabel } from '@src/views/carbonFootprint3/util';
import { Dicts, DictsAndChildren } from '@src/views/emission/Show/type';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { FactorPatternType } from '@src/views/emission/utils/index-type';
import { changeDicts2Options } from '@src/views/utils';
import { Button } from 'antd';
import { throttle, uniqBy } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import useFieldSetValueByLabel from '@/hooks/useFieldSetValueByLabel';
import {
  GwpRecordScope,
  GwpScopeContext,
} from '@/components/EmissionGwp/context';
import { gwpFieldSchema } from '@/components/EmissionGwp/FormField';
import EmissionDescriptionSection from '../../../components/EmissionDescriptionSection';
import { postAutoMatchFactor } from '../../../component/AccessoryDrawer/EmissionDrawer/service';
import { CustomHeaderIndex } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/components/CustomHeader';
import { ArrayRemove } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/components/Remove';
import { libTransportSchema } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/libTransportSchema';
import {
  AdditionalFormItemMaps,
  getNewEmissionFactorSchema,
  useFactorObjReaction,
  useFactorObjUnitStringReaction,
  useFieldDataSourceReaction,
  useNeedTransportReaction,
  useUnitDataSourceReaction,
} from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportSchema';

import {
  emissionSoureLibraryBasicSchema,
  // getNewEmissionFactorSchema,
  getemissionSoureLibrarySchema,
} from './model';
import businessAccount from '../../../businessAccount.module.less';
import styleCarbonFootprint3 from '../../../index.module.less';
import styles from './index.module.less';
import {
  getEmissionSoureTypeDataSource,
  posEmissionSoureLibraryAdd,
  posEmissionSoureLibraryEdit,
} from '../service';
import { EmissionSoureLibraryAddForm } from '../type';

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
    DatePicker,
    Radio,
    FormilyFactor,
    CustomHeaderIndex,
    ArrayRemove,
    ArrayCollapse,
  },
});

const CarbonFootprint3EmissionSoureLibraryAdd = (props: {
  formVal: string;
  findDetail: boolean;
  enableGwp?: boolean;
}) => {
  /** '1'-普通因子 '2'-ecoinvent因子 */
  const [ecoinventFactorPattern, setEcoinventFactorPattern] =
    useState<FactorPatternType>();

  /** 储存因子数值 */
  const [fealFactor, setFealFactor] = useState<string | number>();

  const { id } = useParams<{ id: string }>();

  const { formVal, findDetail, enableGwp = false } = props;
  const basicSchema = useMemo(() => {
    const schema = emissionSoureLibraryBasicSchema();
    const grid = schema.properties?.grid;
    if (enableGwp && findDetail && grid && typeof grid !== 'string') {
      grid.properties = { ...grid.properties, gwpFields: gwpFieldSchema };
    }
    return schema;
  }, [enableGwp, findDetail]);

  const paramsQuery = new URLSearchParams(location.search);

  let formValuesString = paramsQuery.get(URL_QUICK_MODEL_KEY.FORM_VALUES);
  if (props.findDetail) formValuesString = formVal;
  const deFormValues = formValuesString ?? undefined;

  const history = useHistory();

  const { pathname } = history.location;
  /** 是否是查看状态 */
  const isDetail = pathname.includes('detail');
  /** 是否是编辑状态 */
  const isEdit = pathname.includes('edit');

  const [descriptionMatching, setDescriptionMatching] = useState(false);

  /** 单位的字典值 */
  const [cascaderOptions, setCascaderOptions] = useState<Dicts[]>([]);

  /**
   * @description: 被节流的函数
   */
  const throttleFunc = throttle(
    async (form: Form<any>, specificationWay2Numerator?: string) => {
      const autoStatus = localStorage.getItem('RateAutoStatus');

      if (autoStatus === 'true') {
        const typeExtraWay = form.getFieldState('typeExtraWay').value;
        const unitDataVal = form.getFieldState('unitData')
          ? (form.getFieldState('unitData').value as string[])
          : [];
        let unitName = '';

        const denominatorUnitDataVal = form.getFieldState(
          'factorObj.denominatorUnit',
        ).value as string[];

        const unitOptions = form.getFieldState('unitData')
          ? (form.getFieldState('unitData').dataSource as DictsAndChildren[])
          : [];

        // 通过标识找到对应的label
        const unitDataLabel = getDicChildLabel(unitOptions, unitDataVal);
        const denominatorUnitLabel = getDicChildLabel(
          unitOptions,
          denominatorUnitDataVal,
        );

        unitName = unitDataLabel || '';

        // 如果是产品重量的话需要单独处理
        if (
          specificationWay2Numerator ||
          (form.getFieldState('specificationWay2Numerator') &&
            form.getFieldState('specificationWay2Numerator').value)
        ) {
          const specificationWay2NumeratorVal = form.getFieldState(
            'specificationWay2Numerator',
          ).value as string;
          unitName = `${specificationWay2NumeratorVal}km`;
        }

        if (typeExtraWay === 2) {
          unitName = 'km';
        }

        if (unitName && denominatorUnitLabel) {
          form.setFieldState('factorObj.rate', {
            loading: true,
          });
          const back = await postQuickBusinessAccountingEmissionUnitRate({
            unitName,
            factorUnit: `/${denominatorUnitLabel}`,
            name: form.getValuesIn('name'),
          });
          if (back.data.code === 200) {
            form.setFieldState('factorObj.rate', {
              value: back.data.data || '',
              loading: false,
            });
          }
        }
      }

      localStorage.setItem('RateAutoStatus', 'true');
    },
    1000,
    {
      leading: true,
      trailing: false,
    },
  );

  /**
   * @description: 设置排放源库下拉类型的筛选
   */
  const setFormTypeDataSource = async (setForm: Form) => {
    const { data } = await getEmissionSoureTypeDataSource();

    setForm.setFieldState('type', {
      dataSource: data.data,
    });
  };

  // 用来创建表单核心领域模型，它是作为MVVM设计模式的标准 ViewModel
  const form = useMemo(() => {
    const formValues: Record<string, any> = deFormValues
      ? JSON.parse(deFormValues)
      : {};

    if (deFormValues) {
      const { factorObj, matchWay } = formValues;
      const { factor, factorPattern } = factorObj;
      setFealFactor(factor);
      setEcoinventFactorPattern(factorPattern);

      if (shouldHideEcoinventValue(factorObj)) {
        factorObj.factor = ECOINVENT_TEXT;
      }
      const unitData = factorObj.unit ? factorObj.unit.split('/') : undefined;
      if (unitData) {
        [
          formValues.factorObj.numeratorUnit,
          formValues.factorObj.denominatorUnit,
        ] = unitData;
      }
      formValues.factorObj.matchWay = matchWay;
    }

    return createForm({
      initialValues: formValues,
      effects() {
        onFormInit(async form => {
          // 设置类型的下拉框值
          await setFormTypeDataSource(form);

          const dic = await listALLByDictTypeBatch<{ factorUnitM: Dicts[] }>({
            dictTypes: 'factorUnitM',
          });
          const dictArr = dic.data.data.factorUnitM;
          setCascaderOptions(dictArr);
          const unitOptions: Dicts[] = uniqBy(
            dictArr.map(u => ({
              ...u,
              label: u.sourceName,
              value: u.sourceType,
              sourceType: u.sourceType,
              children: changeDicts2Options(
                dictArr.filter(d => d.sourceType === u.sourceType),
              ) as Dicts[] | undefined,
            })),
            'value',
          );
          form.setFieldState('unitData', {
            dataSource: unitOptions,
          });

          if (findDetail || isDetail) {
            return;
          }
          form.addEffects('factorObjRate', form => {
            onFieldChange('unitData', ['value'], () => {
              throttleFunc(form);
            });

            // 处理计算方式是产品重量，将公里转换为km
            onFieldChange('specificationWay2Numerator', ['value'], () => {
              throttleFunc(form, 'specificationWay2Numerator');
            });

            onFieldChange('factorObj.denominatorUnit', ['value'], () => {
              throttleFunc(form);
            });
          });
        });

        onFormUnmount(form => {
          form.removeEffects('factorObjRate');
        });

        // 切换排放因子-新建因子
        onFieldInputValueChange('matchWay', () => {
          setEcoinventFactorPattern(FactorPatternType.ordinaryFactor);
        });
      },
    });
  }, [formValuesString]);

  /** 使用当前排放源描述智能匹配，沿用排放源库的因子回填规则。 */
  const matchDescription = async () => {
    if (findDetail || isDetail || form.values.type === ALL_EMISSION.TRANS)
      return;
    if (descriptionMatching) return;

    setDescriptionMatching(true);
    try {
      await form.validate('emissionSourceDescription');
    } catch {
      setDescriptionMatching(false);
      return;
    }

    try {
      const { data } = await postAutoMatchFactor({
        name: form.values.name,
        emissionSourceDescription:
          form.values.emissionSourceDescription || undefined,
        factorType: '3',
        emissionType: ALL_EMISSION_LABEL()[form.values.type],
      });
      if (data.data) {
        const factorObj = data.data;
        const [numeratorUnit, denominatorUnit] = (factorObj.unit || '').split(
          '/',
        );
        setFealFactor(factorObj.factor);
        setEcoinventFactorPattern(factorObj.factorPattern);
        form.setValuesIn('factorObj', {
          ...factorObj,
          factor: shouldHideEcoinventValue(factorObj)
            ? ECOINVENT_TEXT
            : factorObj.factor,
          numeratorUnit,
          denominatorUnit,
          matchWay: MODEL_EMISSION_MATCH_WAY.FACTOR,
        });
        form.setValuesIn('matchWay', MODEL_EMISSION_MATCH_WAY.FACTOR);
      } else {
        form.setValuesIn('factorObj', undefined);
      }
    } catch {
      form.setValuesIn('factorObj', undefined);
    } finally {
      setDescriptionMatching(false);
    }
  };

  /**
   * @description: 单独处理运输的数据格式
   * @param {AddQuickEmissionSource} data
   * @return {AddQuickEmissionSource}
   */
  const transportationData = (
    data: AddQuickEmissionSourceFormData & EmissionSoureLibraryAddForm,
  ) => {
    const { typeExtraWay } = data;
    const backData = data;

    // 按里程 - 产品重量
    if (typeExtraWay === 1) {
      backData.typeExtra = {
        way: typeExtraWay,
        unitName: data.specificationWay2Numerator || '',
        distUnitName: data.specificationWay2Denominator || '',
      };
    }

    // 按里程 - 载重比
    if (typeExtraWay === 2) {
      backData.typeExtra = {
        way: typeExtraWay,
        unitName: data.specificationWay3Numerator || '',
        distUnitName: data.specificationWay3Denominator || '',
      };
    }

    // 按里程 - 能耗
    if (typeExtraWay === 3) {
      const dicData = cascaderOptions.find(
        op => op.dictValue === `${data.unitData[1]}`,
      );
      backData.typeExtra = {
        way: typeExtraWay,
        unitName: dicData?.dictLabel || '',
        unitCode: dicData?.dictValue || '',
      };
    }
    return backData;
  };

  /**
   * @description: 提交表单
   */
  const subForm = async () => {
    let bakcData: AddQuickEmissionSourceFormData & EmissionSoureLibraryAddForm =
      await form.submit();

    // 单独处理运输格式数据
    if (bakcData.type === ALL_EMISSION.TRANS) {
      bakcData = transportationData(bakcData);
    } else {
      const dicData = cascaderOptions.find(
        op => op.dictValue === `${bakcData.unitData[1]}`,
      );
      bakcData.unitCode = dicData?.dictValue;
      bakcData.unitName = dicData?.dictLabel;
    }
    // 运输排放源不提交本次新增的描述字段。
    if (bakcData.type === ALL_EMISSION.TRANS) {
      bakcData.emissionSourceDescription = undefined;
    }
    // 排放因子
    if (
      bakcData.matchWay === 1 &&
      ecoinventFactorPattern === FactorPatternType.eCoinVent
    ) {
      bakcData.factorObj.factor = fealFactor;
    }

    // 如果是新建因子
    if (bakcData.matchWay === 2) {
      const dicData = cascaderOptions.find(
        op =>
          op.dictValue ===
          `${
            bakcData.factorObj.denominatorUnit
              ? bakcData.factorObj.denominatorUnit[1]
              : ''
          }`,
      );
      bakcData.factorObj.unit = `${bakcData.factorObj.numeratorUnit}/${dicData?.dictLabel}`;
    }

    const back = isEdit
      ? await posEmissionSoureLibraryEdit({
          ...bakcData,
          rate: bakcData.factorObj.rate,
          id,
        })
      : await posEmissionSoureLibraryAdd({
          ...bakcData,
          rate: bakcData.factorObj.rate,
        });
    if (back.data.code === 200) {
      Toast(
        'success',
        isEdit
          ? I18N.carbonFootprint.editSuccessful
          : I18N.carbonFootprint.newSuccessfullyAdded2,
      );
      history.push(
        RouteMapsCorbonFootprint3.carbonFootprint3EmissionSoureLibrary,
      );
    }
  };

  /**
   * @description: 初始化详情页面
   */
  const initDetail = () => {
    form.setState({
      readPretty: true,
    });
  };

  useEffect(() => {
    if (formValuesString) {
      if (isDetail || findDetail) {
        initDetail();
      }
    }
  }, [form, formValuesString]);
  return (
    <div
      className={`${styleCarbonFootprint3.carbonFootprint3} ${businessAccount.businessAccountTingMain}`}
      style={{
        maxHeight: '80vh',
        overflow: 'auto !important',
      }}
    >
      <FormilyCommon<any> form={form}>
        <>
          <div style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>
              {I18N.carbonFootprint.basicInformation}
            </div>
            <GwpScopeContext.Provider value={enableGwp && findDetail}>
              <GwpRecordScope
                recordKey={`library-preview:${form.values.id ?? 'new'}`}
                readOnly
              >
                <SchemaField
                  schema={basicSchema}
                  scope={{ useFieldUnitDictSource }}
                />
              </GwpRecordScope>
            </GwpScopeContext.Provider>
            <EmissionDescriptionSection
              readPretty={findDetail || isDetail}
              loading={descriptionMatching}
              onMatch={matchDescription}
            />
          </div>
          <div className={styleCarbonFootprint3.customHr} />
          <div style={{ padding: '16px 26px 16px 16px' }}>
            <FormConsumer>
              {productForm => {
                const type = productForm.getValuesIn('type');
                // type === 7 为运输
                if (type === 7) {
                  return '';
                }
                return (
                  <div style={{ fontWeight: 600, marginBottom: 16 }}>
                    {I18N.carbonFootprint3.emissionData}
                  </div>
                );
              }}
            </FormConsumer>

            <div className={styleCarbonFootprint3.btnContainer}>
              <SchemaField schema={getemissionSoureLibrarySchema()} />
              <FormConsumer>
                {productForm => {
                  const productMatchWay = productForm.getValuesIn('matchWay');
                  const matchName = productForm.getValuesIn('name');
                  const type = productForm.getValuesIn('type');
                  // type === 7 为运输
                  if (isDetail || findDetail || type === 7) {
                    return '';
                  }

                  if (
                    productMatchWay === MODEL_EMISSION_MATCH_WAY.FACTOR_CREATE
                  ) {
                    return '';
                  }
                  return (
                    <Button
                      type='primary'
                      onClick={() => {
                        if (
                          productMatchWay === MODEL_EMISSION_MATCH_WAY.FACTOR
                        ) {
                          const urlParamsData = `?pageData=null&search=${JSON.stringify(
                            {
                              name: matchName,
                            },
                          )}`;
                          const baseUrl = isEdit
                            ? `${RouteMapsCorbonFootprint3.carbonFootprint3EmissionSoureLibraryEditSelectFactor}/${id}`
                            : RouteMapsCorbonFootprint3.carbonFootprint3EmissionSoureLibraryAddSelectFactor;

                          history.push(
                            `${baseUrl}${urlParamsData}&${
                              URL_QUICK_MODEL_KEY.FORM_VALUES
                            }=${JSON.stringify(form.values)}`,
                          );
                        }
                      }}
                    >
                      {productMatchWay === MODEL_EMISSION_MATCH_WAY.FACTOR
                        ? I18N.carbonFootprint3.chooseEmissionFactors
                        : I18N.carbonFootprint3.selectProcessLibrary2}
                    </Button>
                  );
                }}
              </FormConsumer>
            </div>
            <SchemaField schema={getNewEmissionFactorSchema()} />
            <div style={{ fontWeight: 600, marginBottom: 16 }}>
              {I18N.carbonFootprint3.transportationInformation}
            </div>
            <div className={styles.wrapper}>
              <SchemaField
                schema={libTransportSchema(true)}
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
          </div>
        </>
      </FormilyCommon>
      {!findDetail && (
        <FormActions
          place='center'
          buttons={
            isDetail
              ? [
                  {
                    title: I18N.carbonFootprint.return,
                    onClick: async () => {
                      history.push(
                        RouteMapsCorbonFootprint3.carbonFootprint3EmissionSoureLibrary,
                      );
                    },
                  },
                ]
              : [
                  {
                    type: 'primary',
                    title: I18N.carbonFootprint.preserve,
                    onClick: subForm,
                  },
                  {
                    title: I18N.carbonFootprint.return,
                    onClick: async () => {
                      history.push(
                        RouteMapsCorbonFootprint3.carbonFootprint3EmissionSoureLibrary,
                      );
                    },
                  },
                ]
          }
        />
      )}
    </div>
  );
};

export default CarbonFootprint3EmissionSoureLibraryAdd;
