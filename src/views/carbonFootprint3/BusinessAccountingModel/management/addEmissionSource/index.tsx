/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-14 15:22:26
 * @Date: 2023-01-13 09:46:18
 * @@description: 核算模型 - 新增排放源
 */
import {
  Cascader,
  DatePicker,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Radio,
  Select,
} from '@formily/antd-v5';
import {
  createForm,
  Form,
  onFieldChange,
  onFormInit,
  onFormUnmount,
} from '@formily/core';
import { createSchemaField, FormConsumer } from '@formily/react';
import { listALLByDictTypeBatch } from '@src/api/api';
import { FormActions } from '@src/components/FormActions';
import FormilyButtonSelect from '@src/components/FormilyUtil/FormilyButtonSelect';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import useFieldSetValueByLabel from '@src/hooks/useFieldSetValueByLabel';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { postQuickBusinessAccountingEmissionUnitRate } from '@src/views/carbonFootprint3/QuickBusinessAccounting/service';
import {
  getDicChildLabel,
  getDicChildValue,
} from '@src/views/carbonFootprint3/util';
import { Dicts, DictsAndChildren } from '@src/views/emission/Show/type';
import { changeDicts2Options } from '@src/views/utils';
import { Button } from 'antd';
import { throttle, uniqBy } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import {
  addEmissionSourceSchema,
  getModelEmissionFactorSchema,
  getModelEmissionTypeSchema,
} from './model';
import businessAccount from '../../../businessAccount.module.less';
import styleCarbonFootprint3 from '../../../index.module.less';
import {
  MODEL_EMISSION_MATCH_WAY,
  QUICK_MODEL_MENUS_CODE_NAME,
  URL_QUICK_MODEL_KEY,
} from '../../constant';
import {
  getQuickModelInfo,
  postBusinessAccountingQuickModelEmissionAdd,
  postBusinessAccountingQuickModelEmissionEdit,
} from '../../service';
import {
  AddQuickEmissionSource,
  AddQuickEmissionSourceFormData,
  BusinessAccountingModelInfo,
} from '../../type';

const BusinessAccountingQuickManagementAddSource = () => {
  const { id, stage } = useParams<{ id: string; stage: string }>();

  const paramsQuery = new URLSearchParams(location.search);

  const formValuesString = paramsQuery.get(URL_QUICK_MODEL_KEY.FORM_VALUES);

  const urlMenuActive = paramsQuery.get(URL_QUICK_MODEL_KEY.MENU_ACTIVE);

  const detailId = paramsQuery.get(URL_QUICK_MODEL_KEY.DETAIL_ID);

  const history = useHistory();

  const { pathname } = history.location;
  /** 是否是编辑状态 */
  const isEdit = pathname.includes('edit');
  /** 是否是查看状态 */
  const isDetail = pathname.includes('detail');
  /** 是否是模型详情的查看状态 */
  const isModelDetail = pathname.includes('Detail');

  /** 模型的信息 */
  const [modelInfo, setModelInfo] = useState<BusinessAccountingModelInfo>();

  /** 单位的字典值 */
  const [cascaderOptions, setCascaderOptions] = useState<Dicts[]>([]);

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
    },
  });

  /**
   * @description: 被节流的函数
   */
  const throttleFunc = throttle(
    async (form: Form<any>, specificationWay2Numerator?: string) => {
      const autoStatus = localStorage.getItem('RateAutoStatus');

      if (autoStatus === 'true') {
        const unitDataVal = form.getFieldState('unitData').value as string[];
        let unitName = '';

        const denominatorUnitDataVal = form.getFieldState(
          'factorObj.denominatorUnit',
        ).value as string[];

        const unitOptions = form.getFieldState('unitData')
          .dataSource as DictsAndChildren[];

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

  // 用来创建表单核心领域模型，它是作为MVVM设计模式的标准 ViewModel
  const form = useMemo(() => {
    const formValues: Record<string, any> = formValuesString
      ? JSON.parse(formValuesString)
      : {};
    if (formValuesString) {
      const { factorObj } = formValues;

      const unitData = factorObj.unit ? factorObj.unit.split('/') : undefined;
      if (unitData) {
        [
          formValues.factorObj.numeratorUnit,
          formValues.factorObj.denominatorUnit,
        ] = unitData;
      }
    }
    return createForm({
      initialValues: formValues,
      effects() {
        onFormInit(async form => {
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

          const formValueDenominatorUnit = form.getFieldState(
            'factorObj.denominatorUnit',
          ).value;

          form.setFieldState('unitData', {
            dataSource: unitOptions,
          });
          form.setFieldState('factorObj.denominatorUnit', {
            dataSource: unitOptions,
          });

          form.setFieldState('factorObj.denominatorUnit', {
            data: {
              label: formValueDenominatorUnit,
            },
          });
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
      },
    });
  }, []);

  /**
   * @description: 获取模型的详情信息
   */
  const getModelInfo = async () => {
    const backInfo = await getQuickModelInfo({ id });
    setModelInfo(backInfo.data.data);
  };

  /**
   * @description: 单独处理运输的数据格式
   * @param {AddQuickEmissionSource} data
   * @return {AddQuickEmissionSource}
   */
  const transportationData = (
    data: AddQuickEmissionSource & AddQuickEmissionSourceFormData,
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
    const bakcData: AddQuickEmissionSourceFormData = await form.submit();
    let subData: AddQuickEmissionSource & AddQuickEmissionSourceFormData = {
      stage,
      modelId: id,
      ...bakcData,
    };

    // 单独处理运输格式数据
    if (subData.type === 7) {
      subData = transportationData(subData);
    } else {
      const dicData = cascaderOptions.find(
        op => op.dictValue === `${bakcData.unitData[1]}`,
      );
      subData.unitCode = dicData?.dictValue;
      subData.unitName = dicData?.dictLabel;
    }

    // 如果是新建因子
    if (subData.matchWay === 2) {
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

    subData = {
      ...subData,
      rate: subData.factorObj.rate,
    };

    const back =
      isEdit && detailId
        ? await postBusinessAccountingQuickModelEmissionEdit({
            ...subData,
            id: detailId,
          })
        : await postBusinessAccountingQuickModelEmissionAdd(subData);
    if (back.data.code === 200) {
      Toast(
        'success',
        isEdit
          ? I18N.carbonFootprint.editSuccessful
          : I18N.carbonFootprint.newSuccessfullyAdded2,
      );
      history.push(
        `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelQuickManagement}/${id}?${URL_QUICK_MODEL_KEY.MENU_ACTIVE}=${urlMenuActive}`,
      );
    }
  };

  /**
   * @description: 初始化详情
   */
  const initDetail = () => {
    form.setState({
      readPretty: true,
    });
  };

  /**
   * @description: 初始化
   */
  const init = async () => {
    await getModelInfo();
  };
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (formValuesString) {
      // 查看详情
      if (isDetail) {
        initDetail();
      }
    }
  }, [form, formValuesString]);
  return (
    <div
      className={`${styleCarbonFootprint3.carbonFootprint3} ${businessAccount.businessAccountTingMain} m-b-60`}
    >
      <div className={styleCarbonFootprint3.sourceNnfoTitle}>
        <span>{I18N.carbonFootprint3.functionalUnits2}</span>
        <span className='font-weight600'>{modelInfo?.accountName}</span>
        <span className='m-l-30'>{I18N.carbonFootprint3.modelName}</span>
        <span className='font-weight600'>{modelInfo?.modelName}</span>
        <span className='m-l-30'>{I18N.carbonFootprint3.lifeCycleStage}</span>
        <span className='font-weight600'>
          {QUICK_MODEL_MENUS_CODE_NAME[Number(stage)]}
        </span>
      </div>
      <div className={styleCarbonFootprint3.customHr} />
      <FormilyCommon<any> form={form}>
        <>
          <div style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>
              {I18N.carbonFootprint.basicInformation}
            </div>
            <SchemaField
              schema={addEmissionSourceSchema(stage)}
              scope={{ useFieldUnitDictSource }}
            />
          </div>
          <div className={styleCarbonFootprint3.customHr} />
          <div style={{ padding: '16px 26px 16px 16px' }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>
              {I18N.carbonFootprint3.emissionData}
            </div>
            <div className={styleCarbonFootprint3.btnContainer}>
              <SchemaField
                schema={getModelEmissionTypeSchema(isDetail)}
                scope={{ useFieldUnitDictSource }}
              />
              <FormConsumer>
                {productForm => {
                  const productMatchWay = productForm.getValuesIn('matchWay');
                  const matchName = productForm.getValuesIn('name');

                  if (isDetail) return '';

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
                            ? RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuicEditkManagementSelectFactor
                            : RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementSelectFactor;

                          const unitDataValue = form.getFieldState('unitData')
                            .value as string[];
                          const unitValue = getDicChildValue(
                            cascaderOptions,
                            unitDataValue,
                          );

                          history.push(
                            `${baseUrl}/${id}/${stage}${urlParamsData}&${
                              URL_QUICK_MODEL_KEY.FORM_VALUES
                            }=${JSON.stringify(form.values)}&${
                              URL_QUICK_MODEL_KEY.MENU_ACTIVE
                            }=${urlMenuActive}&${
                              URL_QUICK_MODEL_KEY.DETAIL_ID
                            }=${detailId}&${
                              URL_QUICK_MODEL_KEY.FACTOR_UNIT_M
                            }=${unitValue || ''}`,
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
            <SchemaField
              schema={getModelEmissionFactorSchema()}
              scope={{ useFieldUnitDictSource, useFieldSetValueByLabel }}
            />
          </div>
        </>
      </FormilyCommon>

      <FormActions
        place='center'
        buttons={
          isDetail
            ? [
                {
                  title: I18N.carbonFootprint.return,
                  onClick: async () => {
                    const baseUrl = isModelDetail
                      ? RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelQuickManagementDetail
                      : RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelQuickManagement;

                    history.push(
                      `${baseUrl}/${id}?${URL_QUICK_MODEL_KEY.MENU_ACTIVE}=${urlMenuActive}`,
                    );
                  },
                },
              ]
            : [
                {
                  type: 'primary',
                  title: I18N.carbonFootprint.confirm2,
                  onClick: subForm,
                },
                {
                  title: I18N.carbonFootprint.return,
                  onClick: async () => {
                    history.push(
                      `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelQuickManagement}/${id}?${URL_QUICK_MODEL_KEY.MENU_ACTIVE}=${urlMenuActive}`,
                    );
                  },
                },
              ]
        }
      />
    </div>
  );
};

export default BusinessAccountingQuickManagementAddSource;
