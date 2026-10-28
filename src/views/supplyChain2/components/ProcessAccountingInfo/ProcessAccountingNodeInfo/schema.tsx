import I18N from '@src/lang/I18N';
import { ISchema, SchemaReactions } from '@formily/react';
import {
  initFormilyCascader,
  initFormilyInput,
  initFormilyInputTextArea,
  initFormilyRadio,
  initFormilySelect,
} from '@src/components/FormilyUtil/util';
import IconFont from '@src/components/iconfont';
import { Tooltip } from 'antd';
import moment, { Moment } from 'moment';

import {
  PROCESS_IN_TYPE,
  PROCESS_IN_TYPE_LABEL,
  PROCESS_OUT_TYPE,
  PROCESS_OUT_TYPE_LABEL,
  MATCH_WAY,
  MATCH_WAY_LABEL,
  CALC_WAY,
  CALC_WAY_LABEL,
  SUPPLIER_EMISSION_DATA_TYPE,
  SUPPLIER_EMISSION_DATA_TYPE_LABEL,
  SUPPLIER_EMISSION_BORDER_TYPE,
  SUPPLIER_EMISSION_BORDER_TYPE_LABEL,
} from '../constant';

const { PRODUCT_WEIGHT, BEARING_RATIO, ENERGY_CONSUMPTION } = CALC_WAY;

const { FACTOR, FACTOR_CREATE, SUPPLIER } = MATCH_WAY;

export const genProcessBasicInfoSchema = (): ISchema => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 3,
        columnGap: 50,
      },
      properties: {
        name: {
          type: 'string',
          ...initFormilyInput(I18N.carbonFootprint3.processName, true),
        },
        boundary: {
          type: 'string',
          ...initFormilyInput(I18N.carbonFootprint3.boundaryDescription, false),
        },
      },
    },
  },
});

export const genProcessRepSchema = (): ISchema => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 3,
        columnGap: 50,
      },
      properties: {
        accountYear: {
          type: 'string',
          title: I18N.carbonFootprint3.accountingYear,
          'x-decorator': 'FormItem',
          'x-component': 'DatePicker',
          'x-component-props': {
            picker: 'year',
            disabledDate: (value: Moment) =>
              !(
                value.isSameOrAfter('1990') &&
                value.isSameOrBefore(String(moment().year() + 1))
              ),
          },
        },
        productErea: {
          type: 'string',
          ...initFormilyInput(I18N.carbonFootprint3.producingArea, false),
        },
        processEquipment: {
          type: 'string',
          ...initFormilyInput(I18N.carbonFootprint3.processEquipment, false),
        },
        productScale: {
          type: 'string',
          ...initFormilyInput(I18N.carbonFootprint3.productionScale, false),
        },
        mainMaterial: {
          type: 'string',
          ...initFormilyInput(I18N.carbonFootprint3.mainRawMaterials, false),
        },
        mainEnergy: {
          type: 'string',
          ...initFormilyInput(I18N.carbonFootprint3.mainEnergyConsumption, false),
        },
      },
    },
  },
});

export const genProcessInBasicInfoSchema = (): ISchema => {
  const typeExtraFieldReactions: SchemaReactions = {
    dependencies: ['type'],
    fulfill: {
      schema: {
        'x-visible': `{{$deps[0] == ${PROCESS_IN_TYPE.TRANSPORTATION}}}`,
      },
    },
  };

  const basicFieldReactions: SchemaReactions = {
    dependencies: ['type'],
    fulfill: {
      schema: {
        'x-visible': `{{$deps[0] != ${PROCESS_IN_TYPE.TRANSPORTATION}}}`,
      },
    },
  };

  const distanceFieldReactions: SchemaReactions = {
    dependencies: ['typeExtra.way'],
    fulfill: {
      schema: {
        'x-visible': `{{$deps[0] != ${CALC_WAY.ENERGY_CONSUMPTION}}}`,
      },
    },
  };

  const typeExtraUnitFieldReactions: SchemaReactions = {
    dependencies: ['typeExtra.way'],
    fulfill: {
      schema: {
        'x-visible': `{{$deps[0] == ${CALC_WAY.ENERGY_CONSUMPTION}}}`,
      },
    },
  };

  const typeExtraWeightUnitFieldReactions: SchemaReactions = {
    dependencies: ['typeExtra.way'],
    fulfill: {
      schema: {
        'x-visible': `{{$deps[0] == ${CALC_WAY.PRODUCT_WEIGHT}}}`,
      },
    },
  };

  return {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 3,
          columnGap: 50,
        },
        properties: {
          type: {
            type: 'string',
            ...initFormilySelect(I18N.carbonFootprint3.inputType, true),
            enum: Object.values(PROCESS_IN_TYPE).map(typeValue => ({
              value: typeValue,
              label: PROCESS_IN_TYPE_LABEL[typeValue],
            })),
          },
          name: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.enterName, true),
            'x-reactions': basicFieldReactions,
          },
          amountColumn: {
            type: 'void',
            title: I18N.carbonFootprint.quantity,
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              asterisk: false,
            },
            'x-component': 'FormGrid',
            'x-reactions': [basicFieldReactions],
            properties: {
              amount: {
                type: 'number',
                ...initFormilyInput(I18N.carbonFootprint.quantity, true),
                title: false,
              },
              unitCode: {
                type: 'string',
                ...initFormilyCascader(I18N.carbonFootprint.unit, true, {
                  displayRender: (labels: string[]) => labels?.[1],
                }),
                title: false,
                'x-reactions': [
                  '{{useFieldUnitDictSource ("factorUnitM")}}',
                  '{{useFieldSetValueByLabel}}',
                ],
              },
            },
          },
          typeExtra: {
            type: 'object',
            'x-reactions': typeExtraFieldReactions,
            properties: {
              way: {
                type: 'number',
                enum: [
                  {
                    value: PRODUCT_WEIGHT,
                    label: CALC_WAY_LABEL[PRODUCT_WEIGHT],
                  },
                  {
                    value: BEARING_RATIO,
                    label: CALC_WAY_LABEL[BEARING_RATIO],
                  },
                  {
                    value: ENERGY_CONSUMPTION,
                    label: CALC_WAY_LABEL[ENERGY_CONSUMPTION],
                  },
                ],
                ...initFormilyRadio(I18N.carbonFootprint3.calculationMethod, true),
                default: PRODUCT_WEIGHT,
              },
              name: {
                type: 'string',
                ...initFormilyInput(I18N.carbonFootprint3.enterName, true),
              },
              amountColumn: {
                type: 'void',
                title: I18N.carbonFootprint3.productWeight,
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  asterisk: false,
                },
                'x-component': 'FormGrid',
                properties: {
                  amount: {
                    type: 'number',
                    ...initFormilyInput(I18N.carbonFootprint3.productWeight, true),
                    title: false,
                    'x-decorator-props': {
                      addonAfter: '/',
                    },
                  },
                  weightUnitCode: {
                    type: 'string',
                    ...initFormilySelect(I18N.carbonFootprint.unit, true),
                    title: false,
                    enum: [
                      { label: 't', value: 't' },
                      { label: 'kg', value: 'kg' },
                      { label: 'g', value: 'g' },
                    ],
                    'x-reactions': [typeExtraWeightUnitFieldReactions],
                  },
                  unitCode: {
                    type: 'string',
                    ...initFormilyCascader(I18N.carbonFootprint.unit, true, {
                      displayRender: (labels: string[]) => labels?.[1],
                    }),
                    title: false,
                    'x-reactions': [
                      '{{useFieldUnitDictSource ("factorUnitM")}}',
                      '{{useFieldSetValueByLabel}}',
                      typeExtraUnitFieldReactions,
                    ],
                  },
                },
              },
              distance: {
                type: 'string',
                ...initFormilyInput(I18N.carbonFootprint3.transportationDistancePublic, true),
                'x-reactions': distanceFieldReactions,
              },
            },
          },
        },
      },
    },
  };
};

export const genProcessOutBasicInfoSchema: () => ISchema = () => {
  const typeExtraFieldReactions: SchemaReactions = {
    dependencies: ['type'],
    fulfill: {
      schema: {
        'x-visible': `{{$deps[0] == ${PROCESS_OUT_TYPE.RECYCLED_WASTE}}}`,
      },
    },
  };
  return {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 3,
          columnGap: 50,
        },
        properties: {
          type: {
            type: 'number',
            ...initFormilyRadio(I18N.carbonFootprint3.typeOfOutput, true),
            enum: Object.values(PROCESS_OUT_TYPE).map(type => ({
              value: type,
              label: PROCESS_OUT_TYPE_LABEL[type],
            })),
            default: PROCESS_OUT_TYPE.GAS_WASTE,
          },
          name: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.outputName, true),
          },
          amountColumn: {
            type: 'void',
            title: I18N.carbonFootprint.quantity,
            required: true,
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              asterisk: false,
            },
            'x-component': 'FormGrid',
            properties: {
              amount: {
                type: 'number',
                ...initFormilyInput(I18N.carbonFootprint.quantity, true),
                title: false,
              },
              unitCode: {
                type: 'string',
                ...initFormilyCascader(I18N.carbonFootprint.unit, true, {
                  displayRender: (labels: string[]) => labels?.[1],
                }),
                title: false,
                'x-reactions': [
                  '{{useFieldUnitDictSource ("factorUnitM")}}',
                  '{{useFieldSetValueByLabel}}',
                ],
              },
            },
          },
          typeExtra: {
            type: 'object',
            'x-reactions': typeExtraFieldReactions,
            properties: {
              recycleRate: {
                type: 'string',
                ...initFormilyInput(I18N.carbonFootprint3.regenerationRecoveryRate2, true),
              },
              correctRate: {
                type: 'string',
                ...initFormilyInput(I18N.carbonFootprint3.recycledItemQuality, true),
              },
            },
          },
        },
      },
    },
  };
};

export const genMatchWaySchema: () => ISchema = () => ({
  type: 'void',
  properties: {
    matchWay: {
      type: 'number',
      enum: [
        {
          value: FACTOR,
          label: MATCH_WAY_LABEL[FACTOR],
        },
        {
          value: FACTOR_CREATE,
          label: MATCH_WAY_LABEL[FACTOR_CREATE],
        },
        {
          value: SUPPLIER,
          label: MATCH_WAY_LABEL[SUPPLIER],
        },
      ],
      default: FACTOR,
      'x-reactions': [
        {
          target:
            'factorObj.*(name,factor,numeratorUnit,denominatorUnit,institution,year)',
          fulfill: {
            state: {
              componentProps: {
                disabled: `{{$self.value == ${FACTOR}}}`,
              },
            },
          },
        },
        {
          target: 'factorObj',
          fulfill: {
            schema: {
              'x-visible': `{{$self.value != ${SUPPLIER}}}`,
            },
          },
        },
        {
          target: 'supplierObj',
          fulfill: {
            schema: {
              'x-visible': `{{$self.value == ${SUPPLIER}}}`,
            },
          },
        },
      ],
      'x-component': 'FormilyButtonSelect',
    },
  },
});

export const genFactorSchema: () => ISchema = () => {
  const factorFieldDisabledReactions = {
    dependencies: ['matchWay'],
    fulfill: {
      schema: {
        'x-component-props': {
          disabled: `{{$deps[0] == ${FACTOR}}}`,
        },
      },
    },
  };

  return {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 3,
          columnGap: 20,
        },
        properties: {
          factorObj: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                ...initFormilyInput(I18N.carbonFootprint3.emissionFactorName, true),
                'x-reactions': factorFieldDisabledReactions,
              },
              factor: {
                type: 'string',
                ...initFormilyInput(I18N.carbonFootprint3.numberOfEmissionFactors, true),
                'x-reactions': factorFieldDisabledReactions,
              },
              unitColumn: {
                type: 'void',
                title: I18N.carbonFootprint3.emissionFactorSheet,
                required: true,
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  asterisk: false,
                },
                'x-component': 'FormGrid',
                'x-reactions': [factorFieldDisabledReactions],
                properties: {
                  numeratorUnit: {
                    type: 'string',
                    ...initFormilySelect(I18N.carbonFootprint3.molecularUnit, true),
                    title: false,
                    'x-component-props': {
                      placeholder: I18N.carbonFootprint3.molecularUnit,
                    },
                    'x-decorator-props': {
                      addonAfter: '/',
                    },
                    enum: [
                      { label: 'gCO₂e', value: 'gCO₂e' },
                      { label: 'kgCO₂e', value: 'kgCO₂e' },
                      { label: 'tCO₂e', value: 'tCO₂e' },
                    ],
                    'x-reactions': [factorFieldDisabledReactions],
                  },
                  denominatorUnit: {
                    type: 'string',
                    ...initFormilyCascader(I18N.carbonFootprint3.denominatorUnit, true, {
                      displayRender: (labels: string[]) => labels?.[1],
                    }),
                    title: false,
                    'x-reactions': [
                      '{{useFieldUnitDictSource ("factorUnitM")}}',
                      '{{useFieldSetValueByLabel}}',
                      factorFieldDisabledReactions,
                    ],
                  },
                },
              },
              rate: {
                type: 'string',
                title: (
                  <span>
                    {I18N.carbonFootprint.unitConversionRatio4}<Tooltip overlay={I18N.supplyChain2.quantityUnitRow}>
                      <IconFont
                        style={{ cursor: 'pointer' }}
                        className='m-l-10'
                        type='icon-icon-bangchuzhongxin'
                        aria-label='bangchuzhongxin'
                      />
                    </Tooltip>
                  </span>
                ),
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  placeholder: I18N.carbonFootprint.unitConversionRatio4,
                },
              },
              institution: {
                type: 'string',
                ...initFormilyInput(I18N.carbonFootprint.emissionFactors2, true),
                'x-reactions': factorFieldDisabledReactions,
              },
              year: {
                type: 'string',
                title: I18N.carbonFootprint.yearOfPublication,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'DatePicker',
                'x-component-props': {
                  picker: 'year',
                  disabledDate: (value: Moment) =>
                    !(
                      value.isSameOrAfter('1990') &&
                      value.isSameOrBefore(String(moment().year() + 1))
                    ),
                },
                'x-reactions': factorFieldDisabledReactions,
              },
            },
          },
        },
      },
    },
  };
};

export const genSupplierSchema: () => ISchema = () => {
  const supplierDataIdReaction: SchemaReactions = {
    dependencies: ['supplierObj.id'],
    fulfill: {
      state: {
        componentProps: {
          disabled: `{{$deps[0] != void 0}}`,
        },
      },
    },
  };
  const supplierExpireTimeReaction: SchemaReactions = {
    dependencies: ['supplierObj.id'],
    fulfill: {
      schema: {
        required: `{{$deps[0] == void 0}}`,
      },
      state: {
        componentProps: {
          placeholder: I18N.carbonFootprint3.depsv,
        },
      },
    },
  };
  return {
    type: 'void',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          columnGap: 50,
        },
        properties: {
          supplierObj: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              factor: {
                type: 'string',
                ...initFormilyInput(I18N.carbonFootprint.unitProductScheduling, false, {
                  disabled: true,
                }),
              },
              unitColumn: {
                type: 'void',
                title: I18N.carbonFootprint.unit,
                'x-decorator': 'FormItem',
                'x-component': 'FormGrid',
                properties: {
                  numeratorUnit: {
                    type: 'number',
                    ...initFormilySelect(
                      I18N.carbonFootprint3.molecularUnit,
                      false,
                      { disabled: true },
                      true,
                    ),
                    'x-decorator-props': {
                      addonAfter: '/',
                    },
                    'x-reactions': `{{useFieldFlattenUnitDictSource('factorUnitZ')}}`,
                  },
                  denominatorUnit: {
                    type: 'string',
                    ...initFormilyCascader(I18N.carbonFootprint3.denominatorUnit, false, {
                      disabled: true,
                      displayRender: (label: string[]) => {
                        if (!label) return '';
                        if (label.length === 2) {
                          return [label[1]];
                        }
                        return label;
                      },
                    }),
                    title: false,
                    'x-reactions': [
                      '{{useFieldUnitDictSource("factorUnitM")}}',
                      '{{useFieldSetValueByLabel}}',
                    ],
                  },
                },
              },
              year: {
                type: 'string',
                title: I18N.carbonFootprint3.accountingYear2,
                'x-decorator': 'FormItem',
                'x-component': 'DatePicker',
                'x-component-props': {
                  disabled: true,
                  picker: 'year',
                },
              },
              supplierId: {
                type: 'string',
                ...initFormilySelect(I18N.carbonFootprint3.supplierName, true),
                'x-reactions': ['{{useFieldSupplierSource({status: 1})}}'],
              },
              email: {
                type: 'string',
                ...initFormilyInput(I18N.carbonFootprint3.eMail, true),
              },
              expireTime: {
                type: 'string',
                title: I18N.carbonFootprint3.deadline,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'DatePicker',
                'x-component-props': {
                  disabledDate: (date: Moment) =>
                    !moment(date.format('YYYY-MM-DD')).isSameOrAfter(
                      moment(moment().format('YYYY-MM-DD')),
                    ),
                },
                'x-reactions': [
                  supplierDataIdReaction,
                  supplierExpireTimeReaction,
                ],
              },
              dataType: {
                type: 'number',
                ...initFormilyRadio(I18N.carbonFootprint3.requestDataClass, true),
                'x-decorator-props': {
                  gridSpan: 3,
                },
                default: SUPPLIER_EMISSION_DATA_TYPE.RESULT,
                enum: [
                  {
                    value: SUPPLIER_EMISSION_DATA_TYPE.RESULT,
                    label:
                      SUPPLIER_EMISSION_DATA_TYPE_LABEL[
                        SUPPLIER_EMISSION_DATA_TYPE.RESULT
                      ],
                  },
                  {
                    value: SUPPLIER_EMISSION_DATA_TYPE.PROCESS,
                    label:
                      SUPPLIER_EMISSION_DATA_TYPE_LABEL[
                        SUPPLIER_EMISSION_DATA_TYPE.PROCESS
                      ],
                  },
                ],
                'x-reactions': supplierDataIdReaction,
              },
              footBorderType: {
                type: 'number',
                ...initFormilyRadio(I18N.carbonFootprint3.theSystemBoundaryNeedsTo, true),
                'x-decorator-props': {
                  gridSpan: 3,
                },
                default: SUPPLIER_EMISSION_BORDER_TYPE.HALF,
                enum: [
                  {
                    value: SUPPLIER_EMISSION_BORDER_TYPE.HALF,
                    label:
                      SUPPLIER_EMISSION_BORDER_TYPE_LABEL[
                        SUPPLIER_EMISSION_BORDER_TYPE.HALF
                      ],
                  },
                  {
                    value: SUPPLIER_EMISSION_BORDER_TYPE.WHOLE,
                    label:
                      SUPPLIER_EMISSION_BORDER_TYPE_LABEL[
                        SUPPLIER_EMISSION_BORDER_TYPE.WHOLE
                      ],
                  },
                ],
                'x-reactions': supplierDataIdReaction,
              },
              descr: {
                type: 'string',
                ...initFormilyInputTextArea(I18N.carbonFootprint3.dataRequirementDescription, false),
                'x-decorator-props': {
                  gridSpan: 3,
                },
                'x-reactions': supplierDataIdReaction,
              },
            },
          },
        },
      },
    },
  };
};

export const genFileSchema: () => ISchema = () => ({
  type: 'void',
  'x-component': 'FormGrid.GridColumn',
  'x-component-props': {
    gridSpan: 2,
  },
  properties: {
    files: {
      type: 'Array',
      'x-component': 'FormilyFileUpload',
      'x-component-props': {
        isDetail: true,
      },
    },
  },
});
