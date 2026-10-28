/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-04 14:56:59
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-30 22:36:29
 * @Date: 2023-01-08 10:38:34
 * @@description: 核算管理 - 新增排放源
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
  Field,
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
import useFieldFlattenUnitDictSource from '@src/hooks/useFieldFlattenUnitDataSource';
import useFieldSetValueByLabel from '@src/hooks/useFieldSetValueByLabel';
import useFieldSupplierSource from '@src/hooks/useFieldSupplierSource';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import {
  MODEL_EMISSION_MATCH_WAY,
  QUICK_MODEL_MENUS_CODE_NAME,
  URL_QUICK_MODEL_KEY,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import {
  genEmissionMatchWaySchema,
  genSupplierSchema,
} from '@src/views/carbonFootprint3/component/EmissionSourceDrawer/schema';
import CarbonFootprint3UploadFile from '@src/views/carbonFootprint3/component/uploadFile';
import { getEmissionSoureListData } from '@src/views/carbonFootprint3/discharge/emissionSoureLibrary/service';
import { EmissionSoureListData } from '@src/views/carbonFootprint3/discharge/emissionSoureLibrary/type';
import {
  AddFileData,
  AddFileDataAndUid,
} from '@src/views/carbonFootprint3/type';
import {
  getDicChildLabel,
  getDicChildValue,
} from '@src/views/carbonFootprint3/util';
import { Dicts, DictsAndChildren } from '@src/views/emission/Show/type';
import { changeDicts2Options } from '@src/views/utils';
import { Button, Tooltip } from 'antd';
import { debounce, uniqBy } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import {
  addEmissionSourceSchema,
  getAccountEmissionFactorSchema,
} from './model';
import businessAccount from '../../../businessAccount.module.less';
import styleCarbonFootprint3 from '../../../index.module.less';
import {
  getQuickBusinessAccountingInfo,
  postQuickBusinessAccountingEmissionAdd,
  postQuickBusinessAccountingEmissionEdit,
  postQuickBusinessAccountingEmissionUnitRate,
} from '../../service';
import {
  QuickBusinessAccountingInfo,
  QuickBusinessAccountingSource,
  QuickBusinessAccountingSourceFormData,
} from '../../type';

const QuickBusinessAccountingBasicManagementAddSource = (props: {
  formValuesString?: string;
  isComponent?: boolean;
  stage?: string | number;
}) => {
  const { id, stage } = useParams<{ id: string; stage: string }>();

  const childRef = useRef<{ subFilesData: () => AddFileData[] }>(null);

  const paramsQuery = new URLSearchParams(location.search);

  const formValuesString =
    paramsQuery.get(URL_QUICK_MODEL_KEY.FORM_VALUES) || props.formValuesString;

  const isChain = paramsQuery.get('isChain');

  const urlMenuActive = paramsQuery.get(URL_QUICK_MODEL_KEY.MENU_ACTIVE);

  const detailId = paramsQuery.get(URL_QUICK_MODEL_KEY.DETAIL_ID);

  const history = useHistory();
  const { pathname } = history.location;
  /** 是否是编辑状态 */
  const isEdit = pathname.includes('edit');
  /** 是否是查看状态 */
  const isDetail = pathname.includes('detail');
  /** 是否是核算详情 */
  const isModelDetail = pathname.includes('Detail');

  /** 快速核算的信息 */
  const [accountInfo, setAccountInfo] = useState<QuickBusinessAccountingInfo>();

  /** 产品列表 */
  const [, setProductLibraryList] = useState<EmissionSoureListData[]>([]);

  /** 上传的文件列表 */
  const [fileListBack, setFileListBack] = useState<AddFileData[]>([]);

  /** 单位的字典值 */
  const [cascaderOptions, setCascaderOptions] = useState<Dicts[]>([]);

  /**
   * @description: 被节流的函数
   */
  const throttleFunc = debounce(
    async (form: Form<any>, specificationWay2Numerator?: string) => {
      const autoStatus = localStorage.getItem('RateAutoStatus');

      if (autoStatus === 'true') {
        const formUnitDataField = form.getFieldState('unitData');
        const unitDataVal = formUnitDataField
          ? (formUnitDataField.value as string[])
          : [];
        let unitName = '';

        const denominatorUnitDataVal = form.getFieldState(
          'factorObj.denominatorUnit',
        ).value as string[];

        const unitOptions = form.getFieldState('factorObj.denominatorUnit')
          ? (form.getFieldState('factorObj.denominatorUnit')
              .dataSource as DictsAndChildren[])
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
          unitName = specificationWay2NumeratorVal;
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
      ? JSON.parse(formValuesString.replace(/ƒ/g, '&'))
      : {};
    if (formValuesString) {
      const { factorObj, files } = formValues;

      if (formValues.matchWay === 5) {
        const supplierObj = formValues.matchObject || {};
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
        formValues.supplierObj = supplierObj;
      }

      // 设置支撑材料
      if (files) {
        const getFilesBack: AddFileData[] = files.map(
          (backFile: AddFileDataAndUid) => {
            const fileSuffx = backFile.name.split('.');
            return {
              ...backFile,
              suffix: fileSuffx[fileSuffx.length - 1],
            };
          },
        );
        setFileListBack(getFilesBack);
      }

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

        // onFormMount(form => {});
        onFormUnmount(form => {
          form.removeEffects('factorObjRate');
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
            }
          },
        );
      },
    });
  }, []);
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
    },
  });

  /**
   * @description: 获取模型的详情信息
   */
  const getAccountInfo = async () => {
    if (props.isComponent) {
      return;
    }
    const backInfo = await getQuickBusinessAccountingInfo(
      { id },
      isChain === '1',
    );
    setAccountInfo(backInfo.data.data);
  };

  /**
   * @description: 异步获取产品数据源
   * @param {Field} field
   */
  const useAsyncProductDataSource = () => (field: Field) => {
    field.loading = true;
    getEmissionSoureListData().then(back => {
      const enumData = back.data.rows;
      setProductLibraryList(enumData);
      field.dataSource = enumData.map(data => ({
        label: data.name,
        value: data.name,
      }));
      field.loading = false;
    });
  };

  /**
   * @description: 单独处理运输的数据格式
   * @param {QuickBusinessAccountingSource} data
   * @return {QuickBusinessAccountingSourceFormData}
   */
  const transportationData = (
    data: QuickBusinessAccountingSource & QuickBusinessAccountingSourceFormData,
  ) => {
    const { typeExtraWay } = data;
    const backData = data;

    // 按里程 - 产品重量
    if (typeExtraWay === 1) {
      backData.typeExtra = {
        way: typeExtraWay,
        amount: data.amount2,
        unitName: data.specificationWay2Numerator || '',
        distance: data.distance || '',
        distUnitName: I18N.carbonFootprint3.kilometre,
      };
    }

    // 按里程 - 载重比
    if (typeExtraWay === 2) {
      backData.typeExtra = {
        way: typeExtraWay,
        amount: data.carryingCapacity,
        distance: data.distance || '',
        unitName: '',
        distUnitName: I18N.carbonFootprint3.kilometre,
      };
    }

    // 按里程 - 能耗
    if (typeExtraWay === 3) {
      backData.typeExtra = {
        way: typeExtraWay,
        amount: data.amount,
        unitName: data.unitName || '',
        unitCode: data.unitCode || '',
      };
    }
    return backData;
  };

  /**
   * @description: 提交表单
   */
  const subData = async () => {
    // 获取要上传的支撑文件信息
    const files = childRef.current?.subFilesData();

    const formData: QuickBusinessAccountingSourceFormData = await form.submit();
    let subData: QuickBusinessAccountingSource &
      QuickBusinessAccountingSourceFormData = {
      stage,
      accountId: id,
      ...formData,
    };

    // 按能耗  不需要单位信息
    if (subData.typeExtraWay === 3) {
      const dicData = cascaderOptions.find(
        op => op.dictValue === `${subData.unitData[1]}`,
      );
      subData.unitCode = dicData?.dictValue;
      subData.unitName = dicData?.dictLabel;
    }

    // 单独处理运输格式数据
    if (subData.type === 7) {
      subData = transportationData(subData);
    } else {
      const dicData = cascaderOptions.find(
        op => op.dictValue === `${subData.unitData[1]}`,
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
            subData.factorObj.denominatorUnit
              ? subData.factorObj.denominatorUnit[1]
              : ''
          }`,
      );
      subData.factorObj.unit = `${subData.factorObj.numeratorUnit}/${dicData?.dictLabel}`;
    }

    subData.name = subData.selectName || subData.name || '';

    const back =
      isEdit && detailId
        ? await postQuickBusinessAccountingEmissionEdit({
            ...subData,
            rate: subData.factorObj.rate,
            files,
            id: detailId,
          })
        : await postQuickBusinessAccountingEmissionAdd({
            ...subData,
            rate: subData.factorObj.rate,
            files,
          });
    if (back.data.code === 200) {
      Toast(
        'success',
        isEdit
          ? I18N.carbonFootprint.editSuccessful
          : I18N.carbonFootprint.newSuccessfullyAdded2,
      );
      history.push(
        `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagement}/${id}?${URL_QUICK_MODEL_KEY.MENU_ACTIVE}=${urlMenuActive}`,
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
    await getAccountInfo();
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (formValuesString) {
      // 查看详情
      if (isDetail || props.isComponent) {
        initDetail();
      }
    }
  }, [form, formValuesString]);

  return (
    <div
      className={`${styleCarbonFootprint3.carbonFootprint3} ${businessAccount.businessAccountTingMain} m-b-60`}
    >
      {!props.isComponent && (
        <div className={styleCarbonFootprint3.sourceNnfoTitle}>
          <span>{I18N.carbonFootprint3.functionalUnits2}</span>
          {accountInfo?.accountName && accountInfo.accountName.length > 30 ? (
            <Tooltip title={accountInfo?.accountName}>
              <span
                style={{
                  width: '300px',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  display: 'inline-block',
                  alignItems: 'center',
                }}
                className='font-weight600'
              >
                {accountInfo?.accountName}
              </span>
            </Tooltip>
          ) : (
            <span className='font-weight600'>{accountInfo?.accountName}</span>
          )}
          <span className='m-l-30'>
            {I18N.carbonFootprint.accountingCycle2}
          </span>
          <span className='font-weight600'>
            {accountInfo?.startTime
              ? I18N.template(I18N.carbonFootprint3.accou5, {
                  val1: accountInfo?.startTime,
                  val2: accountInfo?.endTime,
                })
              : accountInfo?.year}
          </span>
          <span className='m-l-30'>{I18N.carbonFootprint3.lifeCycleStage}</span>
          <span className='font-weight600'>
            {QUICK_MODEL_MENUS_CODE_NAME[Number(stage)]}
          </span>
        </div>
      )}
      {!props.isComponent && <div className={styleCarbonFootprint3.customHr} />}
      <FormilyCommon<any> form={form}>
        <>
          <div style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>
              {I18N.carbonFootprint.basicInformation}
            </div>
            <SchemaField
              schema={addEmissionSourceSchema(stage || String(props.stage))}
              scope={{ useFieldUnitDictSource, useAsyncProductDataSource }}
            />
          </div>
          <div className={styleCarbonFootprint3.customHr} />
          <div style={{ padding: '16px 26px 16px 16px' }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>
              {I18N.carbonFootprint3.emissionData}
            </div>
            <div className={styleCarbonFootprint3.btnContainer}>
              <SchemaField
                schema={genEmissionMatchWaySchema([])}
                scope={{ useFieldUnitDictSource }}
              />
              <FormConsumer>
                {productForm => {
                  const productMatchWay = productForm.getValuesIn('matchWay');
                  const matchName =
                    productForm.getValuesIn('name') ||
                    productForm.getValuesIn('selectName');

                  if (isDetail || props.isComponent) return '';

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
                            ? RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingFactorSelectEdit
                            : RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingFactorSelect;

                          // 选择因子要携带上单位信息
                          let unitValue = '';
                          if (form.getFieldState('unitData')) {
                            const unitDataValue = form.getFieldState('unitData')
                              .value as string[];
                            unitValue =
                              getDicChildValue(
                                cascaderOptions,
                                unitDataValue,
                              ) || '';
                          }

                          history.push(
                            `${baseUrl}/${id}/${stage}${urlParamsData}&${
                              URL_QUICK_MODEL_KEY.FORM_VALUES
                            }=${JSON.stringify(form.values)}&${
                              URL_QUICK_MODEL_KEY.MENU_ACTIVE
                            }=${urlMenuActive}&${
                              URL_QUICK_MODEL_KEY.FACTOR_UNIT_M
                            }=${unitValue || ''}&${
                              URL_QUICK_MODEL_KEY.DETAIL_ID
                            }=${detailId}`,
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
              schema={getAccountEmissionFactorSchema()}
              scope={{
                useFieldUnitDictSource,
                useFieldSetValueByLabel,
              }}
            />
            <SchemaField
              schema={genSupplierSchema()}
              scope={{
                useFieldUnitDictSource,
                useFieldSetValueByLabel,
                useFieldSupplierSource,
                useFieldFlattenUnitDictSource,
              }}
            />
          </div>
        </>
      </FormilyCommon>
      <div className={styleCarbonFootprint3.customHr} />
      <div style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          {I18N.carbonFootprint3.supportingMaterials}
        </div>
        <div style={{ color: '#999EA4', fontSize: 12, marginBottom: 8 }}>
          {I18N.carbonFootprint3.supportPdf}
        </div>
        <CarbonFootprint3UploadFile
          cRef={childRef}
          isDetail={isDetail || !!props.isComponent}
          fileListBack={fileListBack}
        />
      </div>
      {!props.isComponent && (
        <FormActions
          place='center'
          buttons={
            isDetail
              ? [
                  {
                    title: I18N.carbonFootprint.return,
                    onClick: async () => {
                      if (isChain) {
                        history.goBack();
                      } else {
                        const baseUrl = isModelDetail
                          ? RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagementDetail
                          : RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagement;
                        history.push(
                          `${baseUrl}/${id}?${URL_QUICK_MODEL_KEY.MENU_ACTIVE}=${urlMenuActive}`,
                        );
                      }
                    },
                  },
                ]
              : [
                  {
                    type: 'primary',
                    title: I18N.carbonFootprint.preserve,
                    onClick: subData,
                  },
                  {
                    title: I18N.carbonFootprint.return,
                    onClick: async () => {
                      history.push(
                        `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagement}/${id}?${URL_QUICK_MODEL_KEY.MENU_ACTIVE}=${urlMenuActive}`,
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

export default QuickBusinessAccountingBasicManagementAddSource;
