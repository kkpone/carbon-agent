/*
 * @@description:新建排放数据
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:44
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:43:00
 */

import I18N from '@src/lang/I18N';
import {
  addEmissionSelectItem,
  deleteEmissionSelectItem,
  getEmissionInfo,
  addEmissionSourceIntCreateSerializersEmissionSourceIntCreateSerializers,
  addExhaustGasIntCreateSerializersExhaustGasIntCreateSerializers,
  addFacilityIntCreateSerializersFacilityIntCreateSerializers,
  createEmissionSourceData,
  delEmissionSourceIntCreateSerializersEmissionSourceIntCreateSerializers,
  delFacilityIntCreateSerializersFacilityIntCreateSerializers,
  getEmissionSourceDataRelySerializersEmissionSourceDataRelySerializers,
  getEmissionSourceIntListSerializersEmissionSourceIntListSerializers,
  getExhaustGasIntListSerializers,
  putEmissionSourceData,
  putExhaustGasIntCreateSerializersExhaustGasIntCreateSerializers,
} from '@api/carbon-international';
import {
  AddEmissionSelectItem,
  CreateEmissionSourceDataPayload,
  EmissionInfoValues,
  GasCheckedSubKey,
  EmissionSourceDataRelySerializersEmissionSourceDataRelySerializers,
  EmissionSourceIntListSerializersEmissionSourceIntListSerializersRes,
  ExhaustGasIntListSerializers,
} from '@api/carbon-international/types';
import { EmptyLoading } from '@components/EmptyLoading';
import IconFont from '@components/iconfont';
import { FormActions } from '@src/components/FormActions';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import { Toast } from '@utils/Toast';
import {
  antFormSrcoll2FirstErrorConfig,
  clearObject,
  combineClassName,
} from '@utils/index';
import { Form, Row, Col, Spin } from 'antd';
import BigNumber from 'bignumber.js';
import {
  assign,
  cloneDeep,
  differenceWith,
  noop,
  uniq,
  uniqBy,
} from 'lodash-es';
import { Fragment, memo, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import style from './addEmissionData.module.less';
import {
  Children,
  EmissionArr,
  EmissionFormType,
  FormValueTargetPath,
  SelectOptions,
} from './types';
import {
  CO2E,
  renderChildren,
  generateOrganizationOptions,
  EmissionDataEnum,
  translateGas,
  useUnitOptions,
  gasesOptions,
  hasChildGases,
  maxUnitRatio,
  minUnitRatio,
  minUnitRatioString,
  unitRatioFixedLength,
  addUserToOptions,
} from './utils';
import { checkList } from '../carbonManagement/Selector';
import { getEditionType } from '../utils';

const AddEmissionData = () => {
  const [editionTypeNum, editionTypeStr] = getEditionType();
  /** fix 字段被删除时，补充选项 */
  const [disabledFacility, setDisabledFacility] = useState<SelectOptions>([]);
  const [disabledEmissionSource, setDisabledEmissionSource] =
    useState<SelectOptions>([]);
  const isFirstLoad = useRef(true);
  const [form] = Form.useForm<CreateEmissionSourceDataPayload>();
  const { id, editId } = useParams<{ id?: string; editId?: string }>();

  const history = useHistory();

  /* 类别、基础属性 所有的关系数据 */
  const [source, setSource] =
    useState<EmissionSourceDataRelySerializersEmissionSourceDataRelySerializers>();

  /* 排放源、设施活动 list */
  const [emissions, setEmissions] =
    useState<
      EmissionSourceIntListSerializersEmissionSourceIntListSerializersRes[]
    >();

  /** 为了数据联动，保留一份部分字典和form相同的数据 */
  const [unionType, setUnionType] =
    useState<Partial<CreateEmissionSourceDataPayload>>();

  /** 设施活动-> 气体，单位数据 */
  const [checkedGas, setCheckedGas] =
    useState<ExhaustGasIntListSerializers[]>();

  /** 页面loading  */
  const [formPageLoading, setFormPageLoading] = useState(false);

  const clearFormData = () => {
    const formVal = form.getFieldsValue();
    form.resetFields();
    clearObject(formVal);
    form.setFieldsValue(formVal);
    setUnionType(undefined);
  };
  /* 获取类别、基础属性 所有的选项 */
  const getBaseDatas = () =>
    getEmissionSourceDataRelySerializersEmissionSourceDataRelySerializers(
      editionTypeNum,
    ).then(({ data }) => {
      const d = data?.data?.[0];
      if (d) setSource(d);
      return d;
    });

  /* 获取排放源、设施活动 */
  const getEmissions = (emission_subcategory?: number) => {
    if (!emission_subcategory) return Promise.resolve([]);
    setFormPageLoading(true);

    if (!emission_subcategory) {
      setEmissions([]);
      setFormPageLoading(false);
      return Promise.resolve([]);
    }
    return getEmissionSourceIntListSerializersEmissionSourceIntListSerializers({
      edition: editionTypeNum,
      emission_subcategory,
    })
      .then(({ data }) => {
        const r = data?.data || [];
        setEmissions(r);
        return r;
      })
      .finally(() => {
        setFormPageLoading(false);
      });
  };
  // 首次进入数据初始化
  useEffect(() => {
    const p1 = getBaseDatas();
    let p2: Promise<EmissionInfoValues | null> = Promise.resolve(null);
    if (editId) {
      p2 = getEmissionInfo(+editId).then(({ data }) => data?.data);
    }
    Promise.all([p1, p2])
      // eslint-disable-next-line consistent-return
      .then(([sources, editData]) => {
        if (editData && sources) {
          const rawData = editData.json_raw;
          if (rawData) {
            const r = JSON.parse(rawData) as EmissionInfoValues;
            setDisabledFacility([
              {
                label: editData.facility,
                value: editData.facility_n || r[EmissionDataEnum.facility],
                disabled: true,
              },
            ]);
            setDisabledEmissionSource([
              {
                label: editData[EmissionDataEnum.emission_source],
                value: (editData.emission_source_n ||
                  r[EmissionDataEnum.emission_source]) as number,
                disabled: true,
              },
            ]);
            const gwp = sources?.gwp_edition?.find(
              t =>
                t.gwp_edition_name ===
                editData.produce_gas_type_list[0]?.potential_energy_name,
            )?.id;
            // 老数据
            if (!(r.emission_category > 0 && r.emission_subcategory > 0)) {
              const targetCategory = sources.emissions_sub_category_list.find(
                cate => cate.label === r.emissions_subcategory,
              );
              const activeDataRecordMode =
                sources.activity_data_record_mode_list.find(
                  mode => mode.label === editData.active_data_record_mode,
                )?.value;
              const department = sources.emission_source_department_list.find(
                d => d.label === editData.department,
              )?.value;

              const targetUnit = sources.emission_source_unit_list.find(
                u => u.label === editData.unit,
              );
              // 改造成能兼容的格式
              const newData = {
                ...r,
                [EmissionDataEnum.emissions_category]:
                  targetCategory?.value_two,
                [EmissionDataEnum.emissions_subcategory]: targetCategory?.value,
                [EmissionDataEnum.unit_conversion_ratio]:
                  editData[EmissionDataEnum.unit_conversion_ratio],
                [EmissionDataEnum.active_data_record_mode]:
                  activeDataRecordMode,
                [EmissionDataEnum.department]: department,
                [GasCheckedSubKey.potential_energy_name]: gwp,
                [EmissionDataEnum.unit]: [
                  targetUnit?.label_two,
                  `${targetUnit?.value}`,
                ],
                [EmissionDataEnum.emission_source]: editData.emission_source_n,
                [EmissionDataEnum.facility]: editData.facility_n,
              };

              const gasList = editData.produce_gas_type_list;
              gasList?.forEach(targetInfo => {
                const gas = targetInfo[GasCheckedSubKey.prpduce_gas_name];
                newData[EmissionDataEnum.gas_type] = [
                  ...(newData[EmissionDataEnum.gas_type] || []),
                  gas,
                ];
                const unitArray = targetInfo?.prpduce_gas_unit?.split('/');
                if (unitArray?.length) {
                  const denominator = sources.emission_source_unit_list.find(
                    u => u.label === unitArray[1],
                  );
                  newData[gas] = {
                    ...targetInfo,
                    [GasCheckedSubKey.prpduce_gas_unit]: unitArray[0],
                    [GasCheckedSubKey.prpduce_gas_unit_denominator]: [
                      denominator?.label_two,
                      `${denominator?.value}`,
                    ],
                    [GasCheckedSubKey.potential_energy_name]: gwp,
                  };
                }
              });
              return getEmissions(targetCategory?.value).then(() => {
                setUnionType(
                  newData as unknown as CreateEmissionSourceDataPayload,
                );
              });
            }
            // 新数据才有
            return getEmissions(r[EmissionDataEnum.emissions_subcategory]).then(
              () => {
                setUnionType({
                  ...r,
                  [GasCheckedSubKey.potential_energy_name]: gwp,
                } as unknown as CreateEmissionSourceDataPayload);
              },
            );
          }
        }
      })
      .finally(() => {
        // 需要state设置成功再解除赋值限制
        setTimeout(() => {
          isFirstLoad.current = false;
        }, 1000);
      });
  }, []);

  /** 设置表单的值 */
  const setFormValue = (target: FormValueTargetPath, val: any) => {
    if (isFirstLoad.current) return;

    const r = assign({}, unionType, form.getFieldsValue());
    if (target instanceof Array) {
      target.forEach((key, index) => {
        r[key] = val?.[index];
      });
    } else if (target instanceof Object) {
      Object.keys(target).forEach((key, i) => {
        let gasVal = r[key];
        if (!gasVal) {
          // @ts-ignore
          r[key] = {};
          gasVal = r[key];
        }
        target[key].forEach((subKey, j) => {
          gasVal[subKey] = val[i + j];
        });
      });
    } else {
      r[target] = val;
    }

    setUnionType(state => assign({}, state, r));
    form.setFieldsValue({
      ...r,
    });
  };
  /** 主类别 -> 子类别 */
  const caculateCategorySubs = useMemo(() => {
    if (
      !unionType?.[EmissionDataEnum.emissions_category] ||
      !source?.emissions_sub_category_list?.length
    ) {
      return [];
    }
    const cates = source?.emissions_sub_category_list.filter(
      obj =>
        `${unionType[EmissionDataEnum.emissions_category]}` ===
        `${obj.value_two}`,
    );
    return cates?.map(s => s);
  }, [
    unionType?.[EmissionDataEnum.emissions_category],
    source?.emissions_sub_category_list,
  ]);

  const caculateEmissionSources = useMemo(() => {
    const result = checkList(
      generateOrganizationOptions('emission_source_name', emissions),
    );
    if (
      unionType?.[EmissionDataEnum.emission_source] &&
      !result?.some(
        f => f.value === unionType[EmissionDataEnum.emission_source],
      )
    ) {
      return [...(result || []), ...(disabledEmissionSource || [])];
    }
    return result;
  }, [emissions, unionType?.[EmissionDataEnum.emission_source]]);

  /** 设施活动 选项 */
  const computedFacility = useMemo(() => {
    const facilityList = emissions?.find(
      it => it.id === unionType?.[EmissionDataEnum.emission_source],
    )?.facility_name_list;
    const result = checkList(
      generateOrganizationOptions('facility_name', facilityList),
    );
    if (
      unionType?.[EmissionDataEnum.facility] &&
      !result?.some(f => f.value === unionType[EmissionDataEnum.facility])
    ) {
      return [...(result || []), ...(disabledFacility || [])];
    }
    return result;
  }, [
    unionType?.[EmissionDataEnum.emission_source],
    emissions,
    unionType?.[EmissionDataEnum.facility],
  ]);

  // 排放源或设施活动不是用户创建，就不让用户选择气体
  const isGasDisabled = useMemo(() => {
    const targetEmissionSource = emissions?.find(
      it => it.id === unionType?.[EmissionDataEnum.emission_source],
    );
    const isUserEmissionSource = targetEmissionSource?.organization_id !== 0;
    const isUserFacility =
      targetEmissionSource?.facility_name_list?.find(
        it => it.id === unionType?.[EmissionDataEnum.facility],
      )?.organization_id !== 0;

    return !(isUserEmissionSource || isUserFacility);
  }, [
    unionType?.[EmissionDataEnum.emission_source],
    unionType?.[EmissionDataEnum.facility],
    emissions,
  ]);

  /** 设施活动 -> 因子类别、气体等 */
  // eslint-disable-next-line consistent-return
  const getCheckedGas = (facility: number) => {
    const emissionSource = unionType?.[EmissionDataEnum.emission_source];
    const emissionCategory = unionType?.[EmissionDataEnum.emissions_category];
    if (emissionSource && emissionCategory) {
      setFormPageLoading(true);
      return getExhaustGasIntListSerializers({
        facility,
        emission_source: emissionSource,
        emission_category: emissionCategory,
      })
        .then(({ data }) => {
          const checked = data?.data;
          if (checked) {
            setCheckedGas(checked);
          }
        })
        .finally(() => {
          setFormPageLoading(false);
        });
    }
    Toast('info', I18N.carbonInternational.dataAbnormalityPlease);
  };

  /** 确定gwp信息选项 */
  const gwpSelects = useMemo(() => {
    const select = source?.gwp_edition?.map(gwp => ({
      ...gwp,
      label: gwp.gwp_edition_name,
      value: gwp.id,
    }));

    return select || [];
  }, [source?.gwp_potential_energy_int_list]);

  /**  获取选中的气体 */
  const checkedGasType = useMemo(() => {
    let checked = unionType?.[EmissionDataEnum.gas_type];
    if (isGasDisabled) {
      checked = checkedGas?.[0]?.gas_info?.gas_type;
    }
    return (uniq(checked) || []).filter(
      g => typeof g === 'string' && g.length,
    ) as string[];
  }, [isGasDisabled, checkedGas, unionType?.[EmissionDataEnum.gas_type]]);

  /** gwp 变化 => 当前 gwp 下所有气体的值 */
  const caculateGwpValues = useMemo(() => {
    const gwpValue = unionType?.[GasCheckedSubKey.potential_energy_name];
    const gwpKey = source?.gwp_edition?.find(
      g => g.id === gwpValue,
    )?.gwp_edition_name;
    if (gwpKey) {
      return source?.gwp_potential_energy_int_list?.find(it => it[gwpKey])?.[
        gwpKey
      ];
    }
    return undefined;
  }, [
    unionType?.[GasCheckedSubKey.potential_energy_name],
    source?.gwp_potential_energy_int_list,
    source?.gwp_edition,
  ]);

  /** TODO 待验证 编辑状态下（第一次获取数据触发） 选中的气体变化 -> 赋值 排放因子类别、得分、来源、气体信息 */
  useEffect(() => {
    const gasInfo = checkedGas?.[0]?.gas_info;
    const gases = gasInfo?.gas_type || [];
    const targetEmissionFactor =
      source?.emission_source_emission_factor_list?.find(
        ([k]) => checkedGas?.[0]?.emission_factor_type === k,
      );

    if (
      gasInfo &&
      source?.emission_source_emission_factor_list &&
      targetEmissionFactor &&
      unionType?.[EmissionDataEnum.facility]
    ) {
      setFormValue(
        [
          GasCheckedSubKey.potential_energy_name,
          EmissionDataEnum.gas_type,
          EmissionDataEnum.emission_factor,
          EmissionDataEnum.emission_factor_grade,
          EmissionDataEnum.emission_factor_source,
          EmissionDataEnum.unit_conversion_ratio,
          EmissionDataEnum.unit,
        ],
        [
          checkedGas[0].gwp_edition,
          gases,
          targetEmissionFactor[1],
          targetEmissionFactor[1],
          checkedGas[0]?.[EmissionDataEnum.emission_factor_source],
          checkedGas[0]?.[EmissionDataEnum.unit_conversion_ratio],
          // unionType?.unit && gases.
        ],
      );
      gases.forEach(gas => {
        const unit = gasInfo[gas]?.prpduce_gas_unit?.split('/');

        const targetDenominator = source.emission_source_unit_list.find(
          u => u.label === unit?.[1],
        );
        /** 新数据 分母单位为 prpduce_gas_unit_denominator */
        const newGasDenominator =
          gasInfo[gas]?.[GasCheckedSubKey.prpduce_gas_unit_denominator];

        const usedDenominator = targetDenominator
          ? [
              targetDenominator?.label_two,
              String(targetDenominator?.value || ''),
            ]
          : newGasDenominator;
        setFormValue(
          {
            [gas]: [
              GasCheckedSubKey.potential_energy_name,
              GasCheckedSubKey.prpduce_gas_emission_factor,
              GasCheckedSubKey.greenhouse_gases,
              GasCheckedSubKey.prpduce_gas_unit,
              GasCheckedSubKey.prpduce_gas_unit_denominator,
            ],
          },
          [
            gas,
            gasInfo[gas]?.prpduce_gas_emission_factor,
            gasInfo[gas]?.greenhouse_gases,
            unit?.[0],
            usedDenominator,
          ],
        );
      });
    } else {
      // 设施活动切换，清空之前选中的值
      setFormValue(
        [
          EmissionDataEnum.gas_type,
          EmissionDataEnum.unit_conversion_ratio,
          EmissionDataEnum.emission_factor,
          EmissionDataEnum.emission_factor_grade,
          EmissionDataEnum.emission_factor_source,
          EmissionDataEnum.unit,
        ],
        [[]],
      );
    }
  }, [
    checkedGas,
    source?.emission_source_emission_factor_list,
    unionType?.[EmissionDataEnum.facility],
  ]);

  // 设施活动 -> 气体
  useEffect(() => {
    if (unionType?.[EmissionDataEnum.facility]) {
      getCheckedGas(unionType[EmissionDataEnum.facility] as number);
    }
  }, [unionType?.[EmissionDataEnum.facility]]);

  /** 活动数据单位 */
  const caculatedEmissionUnits = useUnitOptions(
    source?.emission_source_unit_list,
    isGasDisabled,
    checkedGas,
  );

  // 根据选中的气体判断渲染的组件
  const gasComponentsRender = (gasItem: { label: string }): Children[] => {
    const { label: gas } = gasItem;
    const greenHouseGas = unionType?.[gas]?.[GasCheckedSubKey.greenhouse_gases];
    // 根据物种得到的精确数据、单位、gwp数值
    const targetGwp = caculateGwpValues?.find(
      it => it.greenhouse_gases_name === greenHouseGas,
    );

    const formValue = assign({}, unionType, form.getFieldsValue());
    // eslint-disable-next-line
    formValue[gas] = {
      ...formValue[gas],
      // @ts-ignore
      [GasCheckedSubKey.potential_energy_numeric]:
        Number(targetGwp?.gwp_num) || '',
    };
    form.setFieldsValue({ ...formValue });

    const unitStarts = ['kg', 't'];

    const baseComponentType: Children[] = [
      {
        type: EmissionFormType.selectAndCascader,
        props: {
          first: {
            label: I18N.carbonFootprint3.emissionFactorSheet,
            // @ts-ignore
            value: unionType?.[gas]?.[GasCheckedSubKey.prpduce_gas_unit],
            disabled: isGasDisabled,
            name: [gas, GasCheckedSubKey.prpduce_gas_unit],
            rules: [{ required: true, message: I18N.carbonInternational.molecularUnitNot }],
            options: unitStarts.map(s => ({
              label: `${s}${gas}`,
              value: `${s}${gas}`,
            })),
          },
          second: {
            label: '',
            value:
              unionType?.[gas]?.[GasCheckedSubKey.prpduce_gas_unit_denominator],
            disabled: isGasDisabled,
            name: [gas, GasCheckedSubKey.prpduce_gas_unit_denominator],
            rules: [{ required: true, message: I18N.carbonInternational.theDenominatorUnitIsNot }],
            options: caculatedEmissionUnits,
          },
        },
      },
      gas !== CO2E
        ? {
            type: EmissionFormType.input,
            props: {
              label: I18N.template(I18N.carbonInternational.gOfGas, { val1: gas }),
              disabled: true,
              name: [gas, GasCheckedSubKey.potential_energy_numeric],
              placeholder: I18N.carbonInternational.gAppearsByDefault,
              value: targetGwp?.gwp_num,
              rules: [{ required: true, message: I18N.carbonInternational.gwpValue }],
              onChange: noop,
            },
          }
        : {
            type: EmissionFormType.empty,
          },
    ];

    const label = I18N.template(I18N.carbonInternational.gasEmissions, { val1: gas });

    const caculateType: Children =
      //  根据排放源 依赖关系渲染选择框，如果是用户输入的排放源这里可以手动修改排放因子
      // 和 富城 确认，这里要写死
      hasChildGases.includes(gas)
        ? {
            type: EmissionFormType.selectAndMsgBox,
            props: {
              label,
              placeholder: I18N.carbonInternational.speciesSelection,
              disabled: isGasDisabled,
              numberMin: 0,
              editAble: !isGasDisabled,
              name: [gas, GasCheckedSubKey.greenhouse_gases],
              name2: [gas, GasCheckedSubKey.prpduce_gas_emission_factor],
              value: unionType?.[gas]?.[GasCheckedSubKey.greenhouse_gases],
              secondValue:
                unionType?.[gas]?.[
                  GasCheckedSubKey.prpduce_gas_emission_factor
                ],
              onSecondValueChange: val => {
                setFormValue(
                  { [gas]: [GasCheckedSubKey.prpduce_gas_emission_factor] },
                  // 当输入框全部删除是，值为 ''
                  [val ?? undefined],
                );
              },
              rules: [{ required: true, message: I18N.carbonInternational.speciesNotEmpty }],
              rules2: [
                {
                  required: true,
                  message: I18N.carbonInternational.highEmissionFactor,
                  min: 0,
                  transform: (val: string) => +val,
                  type: 'number',
                },
              ],
              onChange: val => {
                setFormValue(
                  {
                    [gas]: [GasCheckedSubKey.greenhouse_gases],
                  },
                  [val],
                );
              },
              options: caculateGwpValues
                ?.filter(it => it.gas_type === gas)
                ?.map(it => it.greenhouse_gases_name),
            },
          }
        : {
            type: EmissionFormType.input,
            props: {
              prop2: {
                name: [gas, GasCheckedSubKey.greenhouse_gases],
              },
              label,
              disabled: isGasDisabled,
              value:
                unionType?.[gas]?.[
                  GasCheckedSubKey.prpduce_gas_emission_factor
                ],
              name: [gas, GasCheckedSubKey.prpduce_gas_emission_factor],
              // type: 'number',
              rules: [
                {
                  message: I18N.carbonInternational.dataFormatIsIncorrect,
                  transform: (val: string) => {
                    if (Number.isNaN(+val)) return 'nan';
                    return +val;
                  },
                  type: 'number',
                },
                {
                  required: true,
                  message: I18N.carbonInternational.highEmissionFactor,
                  min: 0,
                  transform: (val: string) => +val,
                  type: 'number',
                },
              ],
              onChange: val => {
                setFormValue(
                  {
                    [gas]: [
                      GasCheckedSubKey.greenhouse_gases,
                      GasCheckedSubKey.prpduce_gas_emission_factor,
                    ],
                  },
                  // @ts-ignore
                  [gas, val > 0 ? val : undefined],
                );
              },
            },
          };
    return [caculateType, ...baseComponentType];
  };

  // 根据 checkbox 选中的气体渲染组件
  const computedChildren = (): Children[] => {
    let res = [] as Children[];
    res =
      checkedGasType
        ?.map((gas: string) =>
          gasComponentsRender({
            label: gas,
          }),
        )
        .flat() || [];
    if (res.length) {
      return [
        {
          type: EmissionFormType.select,
          props: {
            label: I18N.enterpriseCarbonAccount2.gwpInformation,
            disabled: isGasDisabled,
            name: GasCheckedSubKey.potential_energy_name,
            rules: [{ required: true, message: I18N.carbonInternational.gwpInformation2 }],
            onChange: val => {
              setFormValue(GasCheckedSubKey.potential_energy_name, val);
            },
            value: unionType?.[GasCheckedSubKey.potential_energy_name],
            options: gwpSelects,
          },
        },
        {
          type: EmissionFormType.input,
          props: {
            label: I18N.carbonInternational.unitConversionSystem,
            type: 'number',
            min: 0.0000000001,
            onChange(val) {
              if (val) {
                const newNum = new BigNumber(val);

                if (newNum.gt(maxUnitRatio)) {
                  setFormValue(
                    [EmissionDataEnum.unit_conversion_ratio],
                    [maxUnitRatio.toString()],
                  );
                  // @ts-ignore
                } else if (newNum.decimalPlaces() > unitRatioFixedLength) {
                  setFormValue(
                    [EmissionDataEnum.unit_conversion_ratio],
                    [newNum.toFixed(unitRatioFixedLength as number)],
                  );
                }
              }
            },
            disabled: isGasDisabled,
            name: EmissionDataEnum.unit_conversion_ratio,
            rules: [
              { required: true, message: '' },
              () => ({
                validator(_, value) {
                  if (value === '' || Number.isNaN(+value)) {
                    return Promise.reject(new Error(I18N.carbonInternational.unitConversionRatio2));
                  }
                  if (new BigNumber(value).lt(minUnitRatio)) {
                    return Promise.reject(
                      new Error(I18N.template(I18N.carbonInternational.unitConversionRatio, { val1: minUnitRatioString })),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ],
          },
        },
        ...res,
      ];
    }
    return res;
  };
  /** 逻辑修改，co2e 改为常显, co2e 与 其它其它互斥 */
  const caculatedGases = useMemo(() => {
    if (!checkedGasType?.length) {
      return gasesOptions;
    }
    const disableCo2e = checkedGasType.includes(CO2E);
    return gasesOptions.map(g => {
      if (g.value === CO2E) return { ...g, disabled: !disableCo2e };
      return { ...g, disabled: disableCo2e };
    });
  }, [gasesOptions, checkedGasType]);

  if (!source || (editId && !unionType)) return <EmptyLoading />;

  type AddSelectItem = {
    label: string;
    type: keyof AddEmissionSelectItem;
    parentId?: number;
  };
  // eslint-disable-next-line consistent-return
  const addItem = async ({ label, type }: AddSelectItem) => {
    // 不允许添加相同数据
    switch (type) {
      case 'activitydatarecord':
        if (source?.activity_data_list?.find(([l]) => l === label))
          return Toast('warn', I18N.template(I18N.carbonInternational.label, { val1: label }));
        break;
      case 'emissionsourcedepartment':
        if (
          source?.emission_source_department_list?.find(
            opt => opt.label === label,
          )
        )
          return Toast('warn', I18N.template(I18N.carbonInternational.label, { val1: label }));
        break;
      default:
    }
    await addEmissionSelectItem({
      rely_type: type,
      label,
      edition: editionTypeNum,
    }).then(({ data }) => {
      if (data?.code === 200 && data?.data?.label === label) {
        if (type === 'activitydatarecord') {
          const activity_data_record_mode_list = [
            data.data,
            ...(source?.activity_data_record_mode_list || []),
          ];
          // @ts-ignore
          setSource({ ...source, activity_data_record_mode_list });
        } else if (type === 'emissionsourcedepartment') {
          const emission_source_department_list = [
            data.data,
            ...(source?.emission_source_department_list || []),
          ];
          // @ts-ignore
          setSource({ ...source, emission_source_department_list });
        }
      } else {
        Toast('error', I18N.DomesticVersion.addFailed);
      }
    });
  };
  type DeleteItem = {
    item: number | string;
    type: keyof AddEmissionSelectItem;
  };
  const delItem = async ({ item, type }: DeleteItem) => {
    await deleteEmissionSelectItem(item, { rely_type: type }).then(() =>
      getBaseDatas(),
    );
  };

  const emissionArr: EmissionArr[] = [
    {
      title: I18N.carbonInternational.emissionSourceInformation,
      props: {},
      children: [
        {
          type: EmissionFormType.select,
          props: {
            label: I18N.carbonInternational.emissionMainCategory,
            name: EmissionDataEnum.emissions_category,
            rules: [{ required: true, message: I18N.carbonInternational.emissionCategoryNotApplicable }],
            placeholder: I18N.carbonInternational.emissionMainCategory,
            options: uniqBy(
              source?.emissions_sub_category_list?.map(
                ({ label_two, value_two }) => ({
                  label: label_two,
                  value: value_two,
                }),
              ),
              'value',
            ),
          },
        },
        {
          type: EmissionFormType.select,
          props: {
            label: I18N.carbonInternational.emissionSubcategories,
            name: EmissionDataEnum.emissions_subcategory,
            rules: [{ required: true, message: I18N.carbonInternational.emissionSubcategories2 }],
            placeholder: I18N.carbonInternational.emissionSubcategories,
            options: caculateCategorySubs,
          },
        },
        {
          type: EmissionFormType.select,
          props: {
            label: I18N.carbonFootprint.emissionSources,
            onAddItem: unionType?.[EmissionDataEnum.emissions_subcategory]
              ? async emission_source_name => {
                  const categorySub =
                    unionType[EmissionDataEnum.emissions_subcategory];
                  if (categorySub)
                    await addEmissionSourceIntCreateSerializersEmissionSourceIntCreateSerializers(
                      {
                        edition: editionTypeNum,
                        emission_source_name,
                        emission_subcategory: categorySub,
                      },
                    ).then(() => {
                      const v =
                        unionType[EmissionDataEnum.emissions_subcategory];
                      if (v) getEmissions(v);
                    });
                }
              : undefined,
            onDelItem: async e =>
              delEmissionSourceIntCreateSerializersEmissionSourceIntCreateSerializers(
                e,
              ).then(() => {
                if (unionType?.[EmissionDataEnum.emissions_subcategory])
                  getEmissions(
                    unionType[EmissionDataEnum.emissions_subcategory],
                  );
              }),

            name: EmissionDataEnum.emission_source,
            rules: [{ required: true, message: I18N.carbonInternational.theEmissionSourceIsNot }],
            options: caculateEmissionSources,
          },
        },
        {
          type: EmissionFormType.select,
          props: {
            label: I18N.enterpriseCarbonAccount2.facilityActivities,
            name: EmissionDataEnum.facility,
            rules: [{ required: true, message: I18N.carbonInternational.facilityActivitiesAreNotAvailable }],
            onAddItem: unionType?.[EmissionDataEnum.emission_source]
              ? async label => {
                  const subCate =
                    unionType?.[EmissionDataEnum.emissions_subcategory];
                  if (!subCate) return;
                  // eslint-disable-next-line consistent-return
                  return addFacilityIntCreateSerializersFacilityIntCreateSerializers(
                    {
                      edition: editionTypeNum,
                      facility_name: label,
                      emission_source_data: unionType?.[
                        EmissionDataEnum.emission_source
                      ] as number,
                      emission_subcategory: subCate,
                    },
                  ).then(() =>
                    getEmissions(
                      unionType[EmissionDataEnum.emissions_subcategory],
                    ),
                  );
                }
              : undefined,
            onDelItem: async e => {
              await delFacilityIntCreateSerializersFacilityIntCreateSerializers(
                e,
                // eslint-disable-next-line consistent-return
              ).then(() => {
                if (unionType?.[EmissionDataEnum.emissions_subcategory])
                  return getEmissions(
                    unionType[EmissionDataEnum.emissions_subcategory],
                  );
              });
            },
            options: uniqBy(computedFacility, val => val.value),
          },
        },
      ],
    },
    {
      title: I18N.carbonInternational.activityDataMessage,
      props: {},
      children: [
        {
          type: EmissionFormType.input,
          props: {
            label: I18N.carbonFootprint3.activityData,
            name: EmissionDataEnum.active_data,
            rules: [
              { required: true, message: '' },
              () => ({
                validator(_, value) {
                  if (!Number.isNaN(value) && value > 0) {
                    return Promise.resolve();
                  }
                  if (value < 0) {
                    return Promise.reject(new Error(I18N.carbonInternational.activityDataNotAvailable));
                  }
                  return Promise.reject(new Error(I18N.supplyChain2.pleaseEnterTheActivity));
                },
              }),
            ],
            onChange: noop,
          },
        },
        {
          type: EmissionFormType.cascader,
          props: {
            label: I18N.components.activityDataSheet3,
            name: EmissionDataEnum.unit,
            rules: [{ required: true, message: I18N.carbonInternational.unitIsNotEmpty }],
            onChange: noop,
            options: caculatedEmissionUnits,
          },
        },
        {
          type: EmissionFormType.select,
          props: {
            label: I18N.enterpriseCarbonAccount2.activityDataRecording,
            name: EmissionDataEnum.active_data_record_mode,
            rules: [{ required: true, message: I18N.carbonInternational.activityDataRecording }],
            onChange: () => {},
            onAddItem: async label =>
              addItem({ label, type: 'activitydatarecord' }),
            onDelItem: async e =>
              delItem({
                item: e,
                type: 'activitydatarecord',
              }),
            options: checkList(
              addUserToOptions(source?.activity_data_record_mode_list),
            ),
          },
        },
        {
          type: EmissionFormType.select,
          props: {
            label: I18N.enterpriseCarbonAccount2.activityDataClass,
            name: EmissionDataEnum.active_data_type,
            rules: [{ required: true, message: I18N.carbonInternational.activityDataClass }],
            options: checkList(
              source?.activity_data_list?.map(([label, value]) => ({
                label,
                value,
              })),
            ),
          },
        },
        {
          type: EmissionFormType.select,
          props: {
            label: I18N.carbonInternational.activityDataAcquisition2,
            name: EmissionDataEnum.active_data_grade,
            placeholder: I18N.carbonInternational.activityData,
            rules: [{ required: true, message: I18N.carbonInternational.activityDataAcquisition }],
            options: checkList(
              // eslint-disable-next-line
              source?.activity_data_list?.map(([label, value]) => ({
                value,
                label: value,
              })),
            ),
          },
        },
        {
          type: EmissionFormType.select,
          props: {
            label: I18N.enterpriseCarbonAccount2.saveDepartment,
            name: EmissionDataEnum.department,
            rules: [{ required: true, message: I18N.carbonInternational.saveDepartmentNot }],
            onChange: () => {},
            onAddItem: async label =>
              addItem({ label, type: 'emissionsourcedepartment' }),
            onDelItem: async e =>
              delItem({
                item: e,
                type: 'emissionsourcedepartment',
              }),
            options: checkList(
              addUserToOptions(source?.emission_source_department_list),
            ),
          },
        },
      ],
    },
    {
      title: I18N.carbonInternational.greenhouseGasInformation,
      props: {
        childrenColSpan: [24, 16],
      },
      children: [
        {
          type: EmissionFormType.checkboxGroup,
          props: {
            showCheckAll: false,
            // 当排放源下的CheckBox字段有关联的值时，disabled
            disabled: isGasDisabled,
            value: checkedGasType,
            options: caculatedGases,
            label: I18N.carbonInternational.gasType,
            name: EmissionDataEnum.gas_type,
            rules: [{ required: true, message: I18N.carbonInternational.gasTypeNotApplicable }],
            onChange: gasType => {
              const translatedGas = translateGas(gasType as string[], true);
              const newGas = differenceWith(
                translatedGas,
                checkedGasType || [],
              );

              if (newGas.length) {
                // 生成新气体的空数据
                newGas.forEach(gas => {
                  const targetGwp = caculateGwpValues?.find(
                    g => g.greenhouse_gases_name === gas,
                  );
                  setFormValue(
                    {
                      [gas]: [
                        GasCheckedSubKey.greenhouse_gases,
                        GasCheckedSubKey.potential_energy_name,
                        GasCheckedSubKey.potential_energy_numeric,
                        GasCheckedSubKey.prpduce_gas_emission_factor,
                        GasCheckedSubKey.prpduce_gas_unit,
                        GasCheckedSubKey.prpduce_gas_unit_denominator,
                      ],
                    },
                    [
                      !hasChildGases.includes(gas) ? gas : undefined,
                      targetGwp?.gwp_edition__gwp_edition_name,
                      targetGwp?.gwp_num,
                    ],
                  );
                });
              }
              setFormValue(EmissionDataEnum.gas_type, translatedGas);
            },
          },
        },
        ...computedChildren(),
      ],
    },
    {
      title: I18N.carbonInternational.emissionFactors5,
      props: {},
      children: [
        {
          type: EmissionFormType.select,
          props: {
            label: I18N.enterpriseCarbonAccount2.emissionFactors,
            disabled: isGasDisabled,
            name: EmissionDataEnum.emission_factor,
            rules: [{ required: true, message: I18N.carbonInternational.emissionFactors4 }],
            options: checkList(
              source?.emission_source_emission_factor_list?.map(
                ([label, value]) => ({ label, value }),
              ),
            ),
          },
        },
        {
          type: EmissionFormType.select,
          props: {
            label: I18N.carbonInternational.emissionFactors3,
            name: EmissionDataEnum.emission_factor_grade,
            placeholder: I18N.carbonInternational.relatedToEmissionFactors,
            disabled: isGasDisabled,
            rules: [{ required: true, message: I18N.carbonInternational.emissionFactors2 }],
            options: checkList(
              source?.emission_source_emission_factor_list?.map(
                // eslint-disable-next-line
                ([label, value]) => ({
                  value,
                  label: value,
                }),
              ),
            ),
          },
        },
        {
          type: EmissionFormType.input,
          props: {
            label: I18N.carbonFootprint.emissionFactors2,
            name: EmissionDataEnum.emission_factor_source,
            disabled: isGasDisabled,
            rules: [{ required: true, message: I18N.carbonInternational.emissionFactors }],
            onChange: noop,
          },
        },
      ],
    },
  ];
  const save = async (next?: boolean) => {
    const finishFn = async () => {
      if (next) {
        clearFormData();

        history.replace(
          virtualLinkTransform(
            RouteMaps.internationalAddEmissions,
            [':edition', ':id', ':editId?'],
            [editionTypeStr, id],
          ),
        );
      } else {
        history.goBack();
      }
    };

    await form
      .validateFields()
      .then(res => {
        const targetEmissionCategorySub =
          source?.emissions_sub_category_list?.find(
            c => c.value === res[EmissionDataEnum.emissions_subcategory],
          );
        const facility = computedFacility?.find(
          f => f.id === res[EmissionDataEnum.facility],
        )?.label;
        const unit = source?.emission_source_unit_list?.find(
          u => `${u.value}` === `${res[EmissionDataEnum.unit][1]}`,
        )?.label;
        const emissionFactorType =
          source?.emission_source_emission_factor_list?.find(
            // eslint-disable-next-line
            ([key, v]) => v === res[EmissionDataEnum.emission_factor_grade],
          )?.[0];

        const gwpId = res[GasCheckedSubKey.potential_energy_name];
        const gwpName = source.gwp_edition.find(
          g => g.id === gwpId,
        )?.gwp_edition_name;

        if (!gwpName) return Toast('error', I18N.carbonInternational.gwpInformation);
        if (!facility) return Toast('error', I18N.carbonInternational.pleaseReselect);
        if (!targetEmissionCategorySub || !unit || !emissionFactorType)
          return Toast('error', I18N.carbonInternational.dataAbnormalityPlease);
        /** 保存原格式数据，待编辑时复用 */
        const originData = cloneDeep(res);

        res[EmissionDataEnum.gas_type] = uniq(res[EmissionDataEnum.gas_type]);
        /* eslint-disable */
        // @ts-ignore
        res.facility = facility;
        res.gas_info = { ...res };
        // @ts-ignore
        res.unit_int = res.unit[1];
        // @ts-ignore
        res.unit_n = res.unit[1];
        // @ts-ignore
        res.activity_data_unit = res.unit[1];
        res.unit = unit;
        // @ts-ignore
        res.emissions_category = targetEmissionCategorySub.label_two;
        // @ts-ignore
        res.emissions_subcategory = targetEmissionCategorySub.label;
        // @ts-ignore
        res.gwp_edition = res[GasCheckedSubKey.potential_energy_name];
        res.emission_source_int = res[EmissionDataEnum.emission_source];
        // @ts-ignore
        res.emission_factor_type = emissionFactorType;
        // @ts-ignore
        res[EmissionDataEnum.active_data_type] = source.activity_data_list.find(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([k, v]) => v === res[EmissionDataEnum.active_data_type],
        )?.[0];
        /* eslint-enable */

        // 自定义气体不保存关联关系
        if (!isGasDisabled) {
          // 保存关联关系
          if (editId && checkedGas?.[0]?.id) {
            putExhaustGasIntCreateSerializersExhaustGasIntCreateSerializers(
              checkedGas?.[0].id,
              { ...res, facility: res.facility_int },
            );
          } else {
            addExhaustGasIntCreateSerializersExhaustGasIntCreateSerializers({
              ...res,
              facility: res.facility_int,
            });
          }
        }
        const addDatas = {
          ...res,
          carbon_emission_info: id,
          produce_gas_type_list: [],
        };

        addDatas[EmissionDataEnum.gas_type]?.forEach((gas: string) => {
          /** 固定数据分母返回的就是直接可用的字符串 */
          let denominator =
            typeof addDatas[gas].prpduce_gas_unit_denominator === 'string'
              ? addDatas[gas].prpduce_gas_unit_denominator
              : '';
          /** 用户手动选择时，这个值时 array */
          if (typeof addDatas[gas].prpduce_gas_unit_denominator === 'object') {
            denominator = source.emission_source_unit_list.find(
              u =>
                `${u.value}` === addDatas[gas].prpduce_gas_unit_denominator[1],
            )?.label;
          }
          const unitString = `${addDatas[gas].prpduce_gas_unit}/${denominator}`;
          const gasId = unionType?.produce_gas_type_list?.find(
            ({ prpduce_gas_name }) => prpduce_gas_name === gas,
          )?.id;
          if (!gasId) {
            delete addDatas[gas].prpduce_gas_id;
          } else {
            addDatas[gas].prpduce_gas_id = gasId;
          }

          delete addDatas[gas].prpduce_gas_unit_denominator;
          // @ts-ignore
          addDatas.produce_gas_type_list.push({
            ...addDatas[gas],
            // @ts-ignore
            prpduce_gas_unit: unitString,
            // @ts-ignore
            potential_energy_name: gwpName,
            // @ts-ignore
            prpduce_gas_name: gas,
            // @ts-ignore
            potential_energy_numeric:
              // eslint-disable-next-line no-unsafe-optional-chaining, @typescript-eslint/no-unsafe-member-access
              +addDatas[gas]?.potential_energy_numeric || 1,
            // @ts-ignore
            potential_energy_name_n_id:
              res[GasCheckedSubKey.potential_energy_name],
          });
        });

        const emissionSource = emissions?.find(
          t => t.id === addDatas[EmissionDataEnum.emission_source],
        );

        const newData = {
          ...addDatas,
          [EmissionDataEnum.department]:
            source.emission_source_department_list.find(
              t => t.value === addDatas[EmissionDataEnum.department],
            )?.label,
          [EmissionDataEnum.active_data_record_mode]:
            source?.activity_data_record_mode_list.find(
              t =>
                t.value === addDatas[EmissionDataEnum.active_data_record_mode],
            )?.label,

          [EmissionDataEnum.emission_source]:
            emissionSource?.emission_source_name,
          [EmissionDataEnum.facility]: emissionSource?.facility_name_list?.find(
            t => t.id === addDatas[EmissionDataEnum.facility],
          )?.facility_name,
          json_raw: JSON.stringify(originData),
        };
        // 保存数据
        if (editId) {
          // @ts-ignore
          return putEmissionSourceData(editId, { ...newData }).then(
            ({ data }) => {
              if (data.code !== 200) {
                return Toast('error', String(data?.msg) || I18N.carbonInternational.unknownError);
              }
              finishFn();
              return undefined;
            },
          );
        }
        // @ts-ignore
        return createEmissionSourceData({ ...newData }).then(({ data }) => {
          if (data.code !== 200) {
            return Toast('error', String(data?.msg) || I18N.carbonInternational.unknownError);
          }
          finishFn();
          return undefined;
        });
      })
      .catch(noop);
  };

  return (
    <div
      className={combineClassName('add_emission_data', style.addEmissionData)}
    >
      <div className={style.header}>
        <IconFont
          type='icon-icon-shangyibu'
          className={style.headerIcon}
          onClick={() => {
            history.goBack();
          }}
        />
        <div className='management_header_title'>
          {editId ? I18N.carbonFootprint.edit : I18N.carbonNeutral.new}{I18N.carbonFootprint3.emissionData}</div>
      </div>

      <Form
        className={style.mainForm}
        initialValues={unionType}
        layout='vertical'
        scrollToFirstError={antFormSrcoll2FirstErrorConfig}
        form={form}
        onValuesChange={changedValue => {
          const formValue = form.getFieldsValue();
          /** 赋值顺序，有关联关系，前一个变动，后面都清空 */
          const orderList = [
            EmissionDataEnum.emissions_category,
            EmissionDataEnum.emissions_subcategory,
            EmissionDataEnum.emission_source,
            EmissionDataEnum.facility,
          ];
          if (changedValue[EmissionDataEnum.emissions_category]) {
            setFormValue(orderList, [
              changedValue[EmissionDataEnum.emissions_category],
            ]);
          } else if (changedValue[EmissionDataEnum.emissions_subcategory]) {
            setFormValue(orderList.slice(1), [
              changedValue[EmissionDataEnum.emissions_subcategory],
            ]);
            getEmissions(changedValue[EmissionDataEnum.emissions_subcategory]);
          } else if (changedValue[EmissionDataEnum.emission_source]) {
            setFormValue(orderList.slice(2), [
              changedValue[EmissionDataEnum.emission_source],
            ]);
          } else if (changedValue[EmissionDataEnum.facility]) {
            setFormValue(orderList.slice(3), [
              changedValue[EmissionDataEnum.facility],
            ]);
          } else if (
            changedValue[EmissionDataEnum.active_data_type] ||
            changedValue[EmissionDataEnum.active_data_grade]
          ) {
            /** 活动数据、得分 赋值 */
            const val =
              changedValue[EmissionDataEnum.active_data_type] ||
              changedValue[EmissionDataEnum.active_data_grade];
            const target = source?.activity_data_list?.find(
              // eslint-disable-next-line
              ([label, value]) => val === value,
            );
            if (target)
              setFormValue(
                [
                  EmissionDataEnum.active_data_type,
                  EmissionDataEnum.active_data_grade,
                ],
                [target[1], target[1]],
              );
          } else if (
            changedValue[EmissionDataEnum.emission_factor] ||
            changedValue[EmissionDataEnum.emission_factor_grade]
          ) {
            /** 排放因子类别、得分 */
            const val =
              changedValue[EmissionDataEnum.emission_factor] ||
              changedValue[EmissionDataEnum.emission_factor_grade];
            const targetEmissionFactor =
              source?.emission_source_emission_factor_list?.find(
                // eslint-disable-next-line
                ([k, value]) => val === value,
              );

            setFormValue(
              [
                EmissionDataEnum.emission_factor,
                EmissionDataEnum.emission_factor_grade,
              ],
              [targetEmissionFactor?.[1], targetEmissionFactor?.[1]],
            );
          } else if (changedValue[EmissionDataEnum.unit] && isGasDisabled) {
            // 默认配置数据，单位转换比例随活动数据单位变化而变化
            const unitRatio = checkedGas?.find(
              g =>
                `${g.activity_data_unit}` ===
                // cascader 返回的值 value是string
                I18N.template(I18N.carbonInternational.chang, { val1: changedValue[EmissionDataEnum.unit][1] }),
            )?.unit_conversion_ratio;
            setFormValue([EmissionDataEnum.unit_conversion_ratio], [unitRatio]);
          }

          const gasTypes = formValue.gas_type;
          const changedDenominatorGas = gasTypes?.find(
            g =>
              !!changedValue[g] &&
              !!changedValue[g]?.[
                GasCheckedSubKey.prpduce_gas_unit_denominator
              ],
          );
          /** 气体分母单位改变 -> 所有分母单位都改变  */
          if (changedDenominatorGas) {
            const newDenominator = changedValue[changedDenominatorGas][
              GasCheckedSubKey.prpduce_gas_unit_denominator
            ] as string[];
            gasTypes.forEach(g => {
              if (g !== changedDenominatorGas)
                setFormValue(
                  { [g]: [GasCheckedSubKey.prpduce_gas_unit_denominator] },
                  [newDenominator],
                );
            });
          }
        }}
        name='basic'
      >
        <Spin spinning={formPageLoading}>
          {emissionArr.map(({ title, children, props }) => (
            <Fragment key={title}>
              <div className={style.sectionTitle}>{title}</div>
              {children.length > 0 && (
                <Row className={style.mainRow} gutter={[30, 0]}>
                  {children.map((item, index) => (
                    <Col
                      key={`${item.type}${
                        // @ts-ignore
                        // eslint-disable-next-line no-unsafe-optional-chaining
                        item?.props?.label
                        // @ts-ignore
                        // eslint-disable-next-line no-unsafe-optional-chaining
                      }${item.props?.first?.name?.toString?.()}`}
                      span={props.childrenColSpan?.[index] ?? 8}
                    >
                      {renderChildren(item)}
                    </Col>
                  ))}
                </Row>
              )}
            </Fragment>
          ))}
        </Spin>
        <FormActions
          place='center'
          buttons={[
            {
              type: 'primary',
              title: I18N.carbonInternational.saveInput,
              onClick: async () => save(true),
            },
            {
              title: I18N.carbonInternational.saveAndReturn,
              onClick: async () => save(),
            },
          ]}
        />
      </Form>
    </div>
  );
};

export default memo(AddEmissionData);
