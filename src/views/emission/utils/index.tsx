/*
 * @@description:
 */
import I18N from '@src/lang/I18N';
import { addEllipsisToColumn } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { ECOINVENT_TEXT } from '@src/views/carbonFootprint3/constant';
import { Options } from '@src/views/carbonInternational/carbonManagement/Selector';
import { Cascader, Col, FormInstance, InputNumber, Row, Select } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import BigInteger from 'bignumber.js';
import { compact } from 'lodash-es';
import { useMemo } from 'react';

import {
  CarbonFactorFormula,
  EmissionFactorMenu,
  FactorInfoForms,
  FormJsonItemType,
  GasDatum,
  UploadFiles,
} from './index-type';
import { ColUmsType } from '../Show/service';
import { Dicts } from '../Show/type';
import style from '../index.module.scss';

/**
 * @description table 表头 序号
 * @param start number 起始值
 */
export const useIndexColumn = <T,>(
  start: number,
  ellipsis?: boolean,
): ColumnsType<T> =>
  useMemo(
    () => [
      {
        title: I18N.carbonFootprint.number,
        dataIndex: 'pk',
        fixed: 'left',
        width: 70,
        ellipsis,
        render: (t: any, _: unknown, index: number) => start + index + 1,
      },
    ],
    [start],
  );

/**
 * @description 因子表头
 */
export const getEmissionFactorColumns = <
  T extends { factorPattern: string; ecoinventValueVisible?: boolean },
>(): ColumnsType<T> =>
  addEllipsisToColumn<T>([
    {
      title: I18N.carbonFootprint.name,
      dataIndex: 'name',
      fixed: 'left',
      width: 180,
    },
    {
      title: I18N.carbonFootprint.specificationAndModel,
      dataIndex: 'specification',
      width: 100,
      ellipsis: true,
    },
    {
      title: I18N.components.applicableScenarios,
      dataIndex: 'description',
      width: 100,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.factorValue,
      dataIndex: 'cValue',
      width: 100,
      ellipsis: true,
      render: (v, record) =>
        shouldHideEcoinventValue(record)
          ? I18N.emission.notDisplayedTemporarily
          : v,
    },
    {
      title: I18N.carbonFootprint.unit,
      dataIndex: 'unit',
      width: 100,
      ellipsis: true,
    },
    // {
    //   title: '一级分类',
    //   dataIndex: 'firstClassify',
    //   width: 100,
    //   ellipsis: true,
    // },
    // {
    //   title: '二级分类',
    //   dataIndex: 'secondClassify',
    //   width: 100,
    //   ellipsis: true,
    // },
    // {
    //   title: '设施/活动',
    //   dataIndex: 'facilities',
    //   width: 180,
    // },
    // {
    //   title: '因子类型',
    //   dataIndex: 'factorUse',
    //   width: 180,
    //   render: value => {
    //     return value === '1' ? '自有因子' : '收藏因子';
    //   },
    // },
    {
      title: I18N.carbonFootprint.yearOfPublication,
      dataIndex: 'year',
      width: 180,
    },
    {
      title: I18N.carbonFootprint.publishingInstitution,
      dataIndex: 'institution',
      width: 180,
    },
    {
      title: I18N.carbonFootprint.publishingCountryGroups,
      dataIndex: 'countries',
      width: 180,
    },
    // {
    //   title: '发布地区',
    //   dataIndex: 'area',
    //   width: 180,
    // },
    {
      title: I18N.components.sourceCategory,
      dataIndex: 'sourceLevel',
      width: 180,
    },
  ]);

type SourceFormJson = {
  fileList: UploadFiles[];
  menuList: EmissionFactorMenu;
  isOwner: boolean;
};
const culDisAbled = () => {
  if (window.location.pathname.indexOf('detail') >= 0) {
    return true;
  }
  return false;
};
/**
 * @description 因子来源表单字段
 */
export const useSourceFormJson = ({
  fileList,
  menuList,
  isOwner,
}: SourceFormJson) =>
  useMemo<FormJsonItemType[]>(
    () => [
      {
        name: I18N.components.literatureType,
        type: 'select',
        title: 'documentType',
        disabled: culDisAbled(),
        select_list: menuList.documentType,
        require: [
          { required: true, message: I18N.emission.pleaseSelectLiterature },
        ],
      },
      {
        name: I18N.components.sourceCategory,
        type: 'select',
        title: 'sourceLevel',
        disabled: culDisAbled(),
        select_list: menuList.sourceLevel,
        require: [
          { required: true, message: I18N.emission.pleaseSelectTheSource2 },
        ],
      },
      {
        name: I18N.components.publishingInstitutionOr,
        type: 'input',
        title: 'institution',
        maxLength: 100,
        disabled: culDisAbled(),
        require: [
          { required: true, message: I18N.emission.publishingInstitutionOr },
          { max: 50, message: I18N.emission.upToInput2 },
        ],
      },
      {
        name: `${I18N.components.publishingInstitutionOr2}`,
        type: 'input',
        maxLength: 50,
        title: 'institutionShort',
        disabled: culDisAbled(),
      },
      {
        name: I18N.carbonFootprint.yearOfPublication,
        type: 'year',
        title: 'year',
        disabled: culDisAbled(),
        require: [
          {
            required: true,
            message: I18N.carbonFootprint3.pleaseSelectPublish,
          },
        ],
      },
      {
        name: I18N.components.releaseDate,
        type: 'date',
        title: 'publishDate',
        disabled: culDisAbled(),
      },
      {
        name: I18N.carbonFootprint.publishingCountryGroups,
        type: 'select',
        title: 'countries',
        select_list: menuList.reportCountries,
        disabled: culDisAbled(),
        require: [
          { required: true, message: I18N.emission.pleaseSelectPublish },
        ],
      },
      isOwner
        ? {
            name: I18N.components.sourceFileName,
            placeholder: !culDisAbled() ? I18N.components.pleaseFillIn : '-',
            title: 'source',
            type: 'oneInput1',
            maxLength: 100,
            disabled: culDisAbled(),
            class: 'oneRow',
            isNeedButton: true,
            require: [{ max: 500, message: I18N.emission.upToInput }],
          }
        : {},
      isOwner
        ? {
            name: I18N.emission.websiteResources,
            placeholder: !culDisAbled() ? I18N.components.pleaseFillIn : '-',
            title: 'url',
            type: 'oneInput1',
            disabled: culDisAbled(),
            maxLength: 500,
            class: 'oneRow1',
            isNeedButton: true,
            require: [{ max: 500, message: I18N.emission.upToInput }],
          }
        : {},
      isOwner
        ? {
            name: I18N.carbonFootprint.sourceFile,
            placeholder: !culDisAbled() ? I18N.emission.commaInterval : '-',
            title: 'multipartFileList',
            disabled: culDisAbled(),
            type: 'upload',
            class: 'oneRow2',
            require: [],
          }
        : {},
    ],
    [fileList, menuList],
  );
type BaseFormJsonProps<T> = Omit<SourceFormJson, 'fileList' | 'isOwner'> & {
  form: FormInstance<T>;
  dataValue?: Partial<FactorInfoForms>;
};
/**
 * @description 基本信息表单字段
 */
export const useBaseFormJson = (): FormJsonItemType[] => [
  {
    name: I18N.components.nameInSimplifiedChinese,
    type: 'input',
    title: 'name',
    disabled: culDisAbled(),
    require: [
      { required: true, message: I18N.emission.nameSimplifiedNot },
      {
        type: 'string',
        max: 100,
        message: I18N.emission.cannotExceed2,
      },
    ],
  },
  {
    name: I18N.carbonFootprint.specificationAndModel,
    type: 'input',
    disabled: culDisAbled(),
    title: 'specification',
    placeholder: !culDisAbled()
      ? I18N.emission.multipleSpecificationTypes
      : '-',
    require: [
      {
        type: 'string',
        max: 100,
        message: I18N.emission.cannotExceed2,
      },
    ],
  },
  {
    name: I18N.emission.nameSourceLanguage,
    type: 'input',
    disabled: culDisAbled(),
    title: 'sourceLanguageName',
    require: [
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (getFieldValue('sourceLanguageName')?.length > 100) {
            return Promise.reject(new Error(I18N.emission.cannotExceed2));
          }
          if (getFieldValue('sourceLanguage') && !value) {
            return Promise.reject(new Error(I18N.emission.pleaseEnterAName2));
          }
          return Promise.resolve('');
        },
      }),
    ],
  },
  {
    name: I18N.carbonFootprint.applicableIndustries,
    placeholder: !culDisAbled() ? I18N.emission.betweenChineseCommas : '-',
    title: 'business',
    type: 'oneInput',
    class: 'oneRow2',
    disabled: culDisAbled(),
    buttontext: I18N.emission.selectIndustry,
    modelLabel: 'business',
    require: [
      { required: true, message: I18N.emission.pleaseSelectApplicable },
    ],
  },
  {
    name: I18N.carbonFootprint.scenarioDescription,
    placeholder: !culDisAbled() ? I18N.emission.pleaseDescribeTheReason : '-',
    title: 'description',
    type: 'oneTextarea',
    disabled: culDisAbled(),
    class: 'oneRow4',
    maxLength: 1000,
    require: [
      {
        type: 'string',
        max: 1000,
        message: I18N.emission.cannotExceed,
      },
    ],
  },
  {
    name: I18N.carbonFootprint.remarks,
    placeholder: !culDisAbled() ? I18N.carbonFootprint.pleaseEnter : '-',
    title: 'remake',
    type: 'oneTextarea',
    disabled: culDisAbled(),
    class: 'oneRow10',
    maxLength: 1000,
    require: [
      {
        type: 'string',
        max: 1000,
        message: I18N.emission.cannotExceed,
      },
    ],
  },
];
export const FormulaTips = {
  0: I18N.emission.carbonDioxideEmissions,
  1: I18N.emission.forestryCarbonSequestration,
  2: I18N.emission.carbonEmissionsPerKilometer,
  3: I18N.emission.tonKilometerCarbonEmissions,
};
/**
 * @description 因子数据 表单字段
 */
export const useFactorDataFormJson = <T,>({
  menuList,
  form,
}: BaseFormJsonProps<T>) => [
  {
    // 1 数值类 2 公式类
    name: I18N.carbonFootprint3.dataType,
    type: 'select',
    title: 'factorType',
    disabled: culDisAbled(),
    select_list: menuList.factorDataType,
    class: 'oneRow4',
    require: !culDisAbled()
      ? [{ required: true, message: I18N.emission.theDataTypeIs }]
      : [],
  },
  form.getFieldValue('factorType') === '2'
    ? {
        name: I18N.emission.selectFormula,
        type: 'select',
        title: 'formula',
        class: 'oneRow7',
        disabled: culDisAbled(),
        desc: FormulaTips[form.getFieldValue('formula') - 1],
        select_list: menuList?.formulaChance,
        require: [{ required: true, message: I18N.emission.theDataTypeIs }],
      }
    : {},
  form.getFieldValue('factorType') === '2'
    ? {
        name: I18N.components.calculationResults,
        type: 'oneResultTable',
        title: 'linkmanName',
        placeholder: !culDisAbled() ? I18N.carbonFootprint.pleaseEnter : '-',
        class: 'oneRow5',
        disabled: culDisAbled(),
      }
    : {
        name: (
          <span className={style.mustCheck}>{I18N.emission.factorList}</span>
        ),
        type: 'oneTable',
        title: 'linkmanName',
        placeholder: !culDisAbled() ? I18N.carbonFootprint.pleaseEnter : '-',
        class: 'oneRow5',
        disabled: culDisAbled(),
      },
  form.getFieldValue('factorType') === '2'
    ? {
        name: I18N.components.calculateParameters,
        type: 'oneTable',
        title: 'result',
        placeholder: !culDisAbled() ? I18N.carbonFootprint.pleaseEnter : '-',
        class: 'oneRow6',
        disabled: culDisAbled(),
      }
    : {},
  {
    name: I18N.components.correlationFactor,
    placeholder: !culDisAbled() ? I18N.carbonFootprint.pleaseAdd : '-',
    title: 'relevanceFector',
    type: 'relevanceFector',
    disabled: culDisAbled(),
    class: 'oneRow10',
  },
];

/**
 * @description 因子单位选项
 */
export const selectOptionMap: {
  [k: string]: keyof EmissionFactorMenu;
} = {
  // CO₂e
  'CO₂e': 'cequivalentUnitZ',
  // 二氧化碳（CO₂）
  'CO₂': 'factorUnitZ',
  // 甲烷
  'CH₄': 'methaneUnitZ',
  // 氧化亚氮（N₂O）
  'N₂O': 'nitrousUnitZ',
  // 氢氟碳化物（HFCs）
  HFCs: 'hydrofluorocarbonUnitZ',
  // 全氢氟碳化物（PFCs）
  PFCs: 'perfluorocarbonUnitZ',
  // 六氟化硫（SF₆）
  'SF₆': 'sulfurUnitZ',
  // 三氟化氮（NF₃）
  'NF₃': 'nitrogenUnitZ',
};

/**
 * @description 必选字段检查
 */
export const checkSubmitFactorInfo = (
  value: FactorInfoForms,
  step?: 1 | 2 | 3,
): boolean => {
  switch (true) {
    case !value.name && (!step || step === 1):
      Toast('error', I18N.emission.pleaseEnterAName);
      return false;
    case !value.business && (!step || step === 1):
      Toast('error', I18N.emission.pleaseSelectApplicable);
      return false;
    // case !value.labelFactor && (!step || step === 1):
    //   Toast('error', '因子标签');
    //   return false;
    // 因子数据
    case !value.factorType && (!step || step === 2):
      Toast('error', I18N.emission.pleaseSelectData);
      return false;
    // 来源信息
    case !value.documentType && (!step || step === 3):
      Toast('error', I18N.emission.pleaseSelectLiterature);
      return false;
    case !value.sourceLevel && (!step || step === 3):
      Toast('error', I18N.emission.pleaseSelectTheSource2);
      return false;
    case !value.institution && (!step || step === 3):
      Toast('error', I18N.emission.pleaseSelectPublish2);
      return false;
    case !value.year && (!step || step === 3):
      Toast('error', I18N.carbonFootprint3.pleaseSelectPublish);
      return false;
    case !value.countries && (!step || step === 3):
      Toast('error', I18N.emission.pleaseSelectPublish);
      return false;
    default:
      return true;
  }
};
/**
 * @description 化石、林业单位表
 * 1 化石、
 *  分母 formulaUnitM  分子 formulaUnitZ  co2e co2eFormulaUnitZ
 * 2林业
 * 分母 forestryUnitM  分子  forestryUnitZ  co2e co2eForestryUnitZ
 */
export const fossilAndForestryUnits: {
  [k in FactorInfoForms['formula']]: (keyof EmissionFactorMenu)[];
} = {
  1: ['formulaUnitZ', 'formulaUnitM', 'co2eFormulaUnitZ'],
  2: ['forestryUnitZ', 'forestryUnitM', 'co2eForestryUnitZ'],
  3: ['transportationKMZ', 'transportationKMM', 'co2eTransportationKMZ'],
  4: ['transportationTKMZ', 'transportationTKMM', 'co2eTransportationTKMZ'],
};

type FactorTypeColumnProps<T extends GasDatum | ColUmsType> = {
  isDisabled: boolean;
  menuList: EmissionFactorMenu;
  setValues?: (v: T[]) => void;
  type?: 'number' | 'result';
  cascaderOptions: Dicts[];
};
type NumberTypeColumnProps = FactorTypeColumnProps<ColUmsType> & {
  type?: 'number' | 'result';
};
type ResultColumsProps = FactorTypeColumnProps<GasDatum> & {
  type: 'result';
  setValues2: (v: CarbonFactorFormula[]) => void;
  dataValue: Partial<FactorInfoForms> | undefined;
};
/**
 * @description 数值类型表头 技算结果表头
 */
export const useNumberTypeColumn = <T extends GasDatum | ColUmsType>({
  type = 'number',
  isDisabled,
  menuList,
  setValues,
  // @ts-ignore
  dataValue,
  // @ts-ignore
  setValues2,
  cascaderOptions,
}: NumberTypeColumnProps | ResultColumsProps): ColumnsType<T> => {
  // co2 & co2e // factorType 1 数值类 2 公式类  formula 1 化石 2 林业
  let co2Z = menuList[fossilAndForestryUnits[dataValue?.formula || 1][0]];
  let co2M = menuList[fossilAndForestryUnits[dataValue?.formula || 1][1]];
  let co2eZ = menuList[fossilAndForestryUnits[dataValue?.formula || 1][2]];
  const factorType = Number(dataValue?.factorType) || 1;
  const formula = Number(dataValue?.formula) || 1;
  if (factorType === 2) {
    if (+formula === 1) {
      co2Z = menuList[fossilAndForestryUnits[formula][0]];
      co2M = menuList[fossilAndForestryUnits[formula][1]];
      co2eZ = menuList[fossilAndForestryUnits[formula][2]];
    } else if (+formula === 2) {
      co2Z = menuList[fossilAndForestryUnits[formula][0]];
      co2eZ = menuList[fossilAndForestryUnits[formula][2]];
      co2M = menuList[fossilAndForestryUnits[formula][1]];
    } else if (+formula === 3) {
      co2Z = menuList[fossilAndForestryUnits[formula][0]];
      co2eZ = menuList[fossilAndForestryUnits[formula][2]];
      co2M = menuList[fossilAndForestryUnits[formula][1]];
    } else if (+formula === 4) {
      co2Z = menuList[fossilAndForestryUnits[formula][0]];
      co2eZ = menuList[fossilAndForestryUnits[formula][2]];
      co2M = menuList[fossilAndForestryUnits[formula][1]];
    }
  }
  // 气体选项框
  const selectGas = ['HFCs', 'PFCs'];
  const menuKey = Object.keys(menuList).filter(k =>
    selectGas?.some(g => k.includes(g)),
  );
  return addEllipsisToColumn(
    compact([
      type === 'number' && {
        title: I18N.components.greenhouseGasCategory,
        dataIndex: 'greenhouseGasesType',
        render(t: string) {
          if (t?.includes(I18N.emission.carbonDioxideWhen)) {
            return <span className={style.mustCheck}>{t}</span>;
          }
          return t;
        },
      },
      {
        title: I18N.components.greenhouseGases,
        dataIndex: 'greenhouseGases',
        render: (value: string, record, index: number) => {
          const matchKey = selectGas?.find(g =>
            record?.greenhouseGasesType?.includes?.(g),
          );

          if (matchKey) {
            return (
              <Select
                value={`${value}`?.length > 0 ? value : undefined}
                placeholder={
                  isDisabled ? '-' : I18N.carbonFootprint.pleaseSelect
                }
                onChange={e => {
                  // @ts-ignore
                  setValues(arr => {
                    // eslint-disable-next-line
                    arr[index].greenhouseGases = e;
                    return [...arr];
                  });
                }}
                disabled={isDisabled}
                options={menuList[
                  menuKey?.find(k =>
                    k.includes(matchKey),
                  ) as keyof EmissionFactorMenu
                ]?.map(d => ({ label: d.dictLabel, value: d.dictValue }))}
              />
            );
          }
          return record.greenhouseGases;
        },
      },
      {
        title: I18N.carbonFootprint.factorValue,
        dataIndex: 'factorValue',
        render: (value: number, record, index: number) => {
          if (type === 'number') {
            // TODO:
            if (
              shouldHideEcoinventValue({
                factorPattern: record.factorPattern,
                ecoinventValueVisible: dataValue?.ecoinventValueVisible,
              })
            ) {
              return (
                <InputNumber
                  style={{ width: '100%' }}
                  value={ECOINVENT_TEXT}
                  disabled
                  type='number'
                />
              );
            }
            return (
              <InputNumber
                style={{ width: '100%' }}
                placeholder={
                  isDisabled ? '-' : I18N.carbonFootprint.pleaseEnter
                }
                value={value}
                disabled={isDisabled}
                type='number'
                min={0}
                max={99999.99999}
                onChange={e => {
                  // @ts-ignore
                  setValues(arr => {
                    // eslint-disable-next-line no-param-reassign
                    arr[index].factorValue = e
                      ? new BigInteger(Number(e)).toFixed(9)
                      : '';
                    return [...arr];
                  });
                }}
              />
            );
          }
          return value;
        },
      },
      {
        title: I18N.components.factorUnit,
        dataIndex: 'nuit',
        width: 300,
        render: (value, record, index: number) => {
          // debugger;
          const gasType =
            record?.greenhouseGasesType || record?.greenhouseGases;
          const numberTypeZ =
            menuList[
              (Object.entries(selectOptionMap).find(t =>
                gasType.includes(t[0]),
              )?.[1] || selectOptionMap['CO₂e']) as keyof EmissionFactorMenu
            ];
          const formulaNumerator = gasType.includes('CO₂e') ? co2eZ : co2Z;
          return (
            <Row gutter={24}>
              <Col span='11'>
                <Select
                  disabled={isDisabled}
                  placeholder={
                    isDisabled ? '-' : I18N.carbonFootprint.pleaseSelect
                  }
                  // @ts-ignore
                  value={record?.factorUnit || undefined}
                  onChange={e => {
                    // @ts-ignore
                    setValues(arr => {
                      // eslint-disable-next-line no-param-reassign
                      arr[index].factorUnit = e;
                      return [...arr];
                    });
                  }}
                  options={(factorType === 1
                    ? numberTypeZ
                    : formulaNumerator
                  )?.map(t => ({
                    value: t.dictValue,
                    label: t.dictLabel,
                  }))}
                />
              </Col>
              /
              <Col span='11'>
                {type === 'number' ? (
                  <Cascader
                    fieldNames={{
                      label: 'dictLabel',
                      value: 'dictValue',
                      children: 'enumList',
                    }}
                    displayRender={label => label[label.length - 1]}
                    // @ts-ignore
                    options={cascaderOptions}
                    placeholder={
                      isDisabled ? '-' : I18N.carbonFootprint.pleaseSelect
                    }
                    allowClear={false}
                    value={record?.factorUnitM?.split(',')}
                    disabled={isDisabled}
                    onChange={(value: any, option: any) => {
                      // @ts-ignore
                      setValues(arr => {
                        const factorUnitMItem = option[1].dictLabel;
                        if (factorUnitMItem) {
                          // @ts-ignore
                          arr.forEach(item => {
                            // eslint-disable-next-line no-param-reassign
                            item.factorUnitM = value.join(',');
                            // eslint-disable-next-line no-param-reassign
                            item.activeUnit = factorUnitMItem;
                          });
                        }
                        return [...arr];
                      });
                    }}
                  />
                ) : (
                  <Select<string>
                    placeholder={I18N.carbonFootprint.pleaseSelect}
                    value={record.factorUnitM || undefined}
                    disabled={isDisabled}
                    onChange={(e, option) => {
                      const v = option as Options;
                      if (v.label) {
                        // 计算参数
                        setTimeout(() => {
                          if (
                            record.activeUnit === 't'
                            // ||
                            // record.activeUnit === I18N.emission.10000Nm
                          ) {
                            setValues2((arr: CarbonFactorFormula[]) => {
                              // eslint-disable-next-line
                              arr[0].activeUnit = v.label;
                              // eslint-disable-next-line
                              arr[0].paraUnit = `${
                                arr[0]?.paraUnit?.split('/')?.[0] || 'kg'
                              }/${v.label}`;
                              return [...arr];
                            });
                          }
                        }, 100);
                        // @ts-ignore
                        setValues((formulaArr: ColUmsType[]) => {
                          formulaArr.forEach(reco => {
                            // eslint-disable-next-line no-param-reassign
                            reco.factorUnitM = e;
                            // eslint-disable-next-line no-param-reassign
                            reco.activeUnit = v.label;
                          });
                          return [...formulaArr];
                        });
                      }
                    }}
                    // @ts-ignore
                    options={co2M?.map(t => ({
                      value: t.dictValue,
                      label: t.dictLabel,
                    }))}
                  />
                )}
              </Col>
            </Row>
          );
        },
      },
      {
        title: I18N.components.activityDataSheet3,
        dataIndex: 'activeUnit',
        render: (t: string) => t,
      },
    ]),
  );
};
