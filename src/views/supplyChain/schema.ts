import { ISchema } from '@formily/react';
import I18N from '@src/lang/I18N';
import { checkEmail, checkSubmit as checkPhoneNumber } from '@src/utils';
import { regexpDecimalsNum } from '@src/utils/regs';
import { isNil } from 'lodash-es';
import moment, { Moment } from 'moment';
import { ValueOf } from 'type-fest';

import { CARBON_DATA_BORDER_TYPE, INVITE_STATUS } from './constant';
import styles from './index.module.less';

export const genPurchaseProductSchema: (options?: {
  columns?: number;
  columnGap?: number;
  showPriceField?: boolean;
}) => ISchema = options => ({
  type: 'void',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: options?.columns ?? 3,
        columnGap: options?.columnGap ?? 24,
      },
      properties: {
        name: {
          type: 'string',
          title: I18N.carbonFootprint.productName,
          required: true,
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          'x-component-props': {
            placeholder: I18N.carbonFootprint3.pleaseEnterTheProduct2,
          },
          'x-validator': {
            required: true,
            message: I18N.carbonFootprint3.pleaseEnterTheProduct2,
          },
        },
        specification: {
          type: 'string',
          title: I18N.carbonFootprint.specificationAndModel,
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          'x-component-props': {
            placeholder: I18N.supplyChain.pleaseEnterTheSpecifications,
          },
        },
        computationUnit: {
          type: 'string',
          title: I18N.carbonFootprint3.accountingUnit,
          required: true,
          'x-decorator': 'FormItem',
          'x-component': 'Cascader',
          'x-component-props': {
            placeholder: I18N.carbonFootprint.pleaseSelectAccounting4,
          },
          'x-reactions': ['{{useFieldUnitDictSource("factorUnitM")}}'],
          'x-validator': {
            required: true,
            message: I18N.carbonFootprint.pleaseSelectAccounting4,
          },
        },
        unitPrice: {
          type: 'string',
          title: I18N.supplyChain.singlePriceYuan,
          'x-decorator': 'FormItem',
          'x-component': 'NumberPicker',
          'x-component-props': {
            className: styles.inputNumber,
            placeholder: I18N.supplyChain.pleaseEnterTheUnitPrice,
            addonAfter: I18N.components.element,
            controls: false,
          },
          'x-visible': options?.showPriceField ?? true,
          'x-validator': (val: string) => {
            if (isNil(val) || val === '') {
              return '';
            }

            if (Number(val) < 0) {
              return I18N.enterpriseCarbonAccount2.pleaseEnterAValueGreaterThan;
            }

            if (!regexpDecimalsNum(2).test(`${val}`)) {
              return I18N.supplyChain.afterDecimalPoint2;
            }
            return '';
          },
        },
        descr: {
          type: 'string',
          title: I18N.carbonFootprint3.productDescription,
          'x-decorator': 'FormItem',
          'x-component': 'Input.TextArea',
          'x-decorator-props': {
            gridSpan: 2,
          },
          'x-component-props': {
            placeholder: I18N.supplyChain.pleaseEnterTheProduct,
            showCount: true,
            maxLength: 150,
          },
        },
      },
    },
  },
});

export const genSupplierSchema: (options?: {
  columns?: number;
  columnGap?: number;
  supplierResult?: number;
  isSelectSupplier?: boolean;
  showAreaField?: boolean;
}) => ISchema = options => {
  const invitedResult = options?.supplierResult;

  const isSelectSupplier = options?.isSelectSupplier ?? true;

  const allFieldsDisabled = false;

  const supplierIdNameFieldDisabled = invitedResult === INVITE_STATUS.COMPLETE;

  const showArea = options?.showAreaField ?? true;

  return {
    type: 'void',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: options?.columns ?? 3,
          columnGap: options?.columnGap ?? 24,
        },
        properties: {
          supplierIdName: {
            type: 'string',
            title: I18N.carbonFootprint3.supplierName,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'FormilySupplierSelect',
            'x-component-props': {
              placeholder: I18N.supplyChain.pleaseEnterTheSupply2,
              disabled: allFieldsDisabled || supplierIdNameFieldDisabled,
            },
            'x-validator': {
              required: true,
              message: I18N.supplyChain.pleaseSelectSupply,
            },
            'x-visible': isSelectSupplier,
          },
          companyName: {
            type: 'string',
            title: I18N.carbonFootprint3.supplierName,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              placeholder: I18N.carbonFootprint3.pleaseEnterTheSupply,
              disabled: allFieldsDisabled,
            },
            'x-validator': {
              required: true,
              message: I18N.carbonFootprint3.pleaseEnterTheSupply,
            },
            'x-visible': !isSelectSupplier,
          },
          companyNumber: {
            type: 'string',
            title: I18N.supplyChain2.supplierCode,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              placeholder: I18N.supplyChain.pleaseEnterTheSupply,
              disabled: allFieldsDisabled,
            },
            'x-validator': {
              required: true,
              message: I18N.supplyChain.pleaseEnterTheSupply,
            },
          },
          companyNum: {
            type: 'string',
            title: I18N.supplyChain.organizationalCode,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              placeholder: I18N.supplyChain.pleaseEnterTheOrganization,
              disabled: allFieldsDisabled,
            },
            'x-visible': !isSelectSupplier,
          },
          area: {
            type: 'string',
            title: I18N.supplyChain.area,
            'x-decorator': 'FormItem',
            'x-component': 'Cascader',
            'x-component-props': {
              placeholder: I18N.supplyChain.area,
              disabled: allFieldsDisabled,
              fieldNames: {
                value: 'code',
                label: 'name',
              },
            },
            'x-visible': showArea,
          },
          contacts: {
            type: 'string',
            title: I18N.carbonFootprint.contacts,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              placeholder: I18N.supplyChain.pleaseEnterContactInformation3,
              disabled: allFieldsDisabled,
            },
            'x-validator': {
              required: true,
              message: I18N.supplyChain.pleaseEnterContactInformation3,
            },
          },
          phone: {
            type: 'string',
            title: I18N.carbonFootprint3.cellPhone,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              placeholder: I18N.supplyChain.pleaseEnterContactInformation2,
              disabled: allFieldsDisabled,
            },
            'x-validator': [
              {
                required: true,
                message: I18N.supplyChain.pleaseEnterContactInformation2,
              },
              (value: string) =>
                checkPhoneNumber(value)
                  ? ''
                  : I18N.supplyChain.phoneNumberFormat,
            ],
          },
          email: {
            type: 'string',
            title: I18N.carbonFootprint3.contactEmail,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              placeholder: I18N.supplyChain.pleaseEnterContactInformation,
              disabled: allFieldsDisabled,
            },
            'x-validator': [
              {
                required: true,
                message: I18N.supplyChain.pleaseEnterContactInformation,
              },
              (value: string) =>
                checkEmail(value)
                  ? ''
                  : I18N.supplyChain.emailFormatIsIncorrect,
            ],
          },
          remark: {
            type: 'string',
            title: I18N.carbonFootprint.remarks,
            'x-decorator': 'FormItem',
            'x-component': 'Input.TextArea',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              placeholder: I18N.supplyChain.pleaseEnterANote,
              showCount: true,
              maxLength: 150,
              disabled: allFieldsDisabled,
            },
          },
        },
      },
    },
  };
};

const emissionValidator = (value: string | number | null | undefined) => {
  if (isNil(value) || value === '') {
    return '';
  }

  if (!regexpDecimalsNum(6).test(`${value}`)) {
    return I18N.supplyChain.afterDecimalPoint;
  }

  return '';
};

export const genCarbonDataResultSchema: (options?: {
  lifeCycle?: ValueOf<typeof CARBON_DATA_BORDER_TYPE>;
}) => ISchema = options => {
  const showFullLifeCycle =
    options?.lifeCycle === CARBON_DATA_BORDER_TYPE.FULL ||
    options?.lifeCycle === CARBON_DATA_BORDER_TYPE.CUSTOM;
  return {
    type: 'void',
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
            title: I18N.carbonFootprint.productName,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              disabled: true,
            },
          },
          computeUnit: {
            type: 'string',
            title: I18N.carbonFootprint3.accountingUnit,
            'x-decorator': 'FormItem',
            'x-component': 'Cascader',
            'x-component-props': {
              disabled: true,
            },
            'x-reactions': ['{{useFieldUnitDictSource("factorUnitM")}}'],
          },
          year: {
            type: 'string',
            title: I18N.carbonFootprint3.accountingYear2,
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
          },
          emission: {
            type: 'string',
            title: showFullLifeCycle
              ? I18N.supplyChain.unitProductScheduling4
              : I18N.supplyChain.unitProductScheduling3,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker',
            'x-component-props': {
              placeholder: I18N.carbonFootprint.pleaseEnter,
              controls: false,
            },
            'x-validator': emissionValidator,
          },
          placeholder: {
            type: 'void',
            'x-decorator': 'FormItem',
          },
          placeholder2: {
            type: 'void',
            'x-decorator': 'FormItem',
          },
          lifeCycle: {
            type: 'array',
            title: I18N.supplyChain.unitProductScheduling,
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 3,
            },
            'x-component': 'ArrayTable',
            'x-component-props': {
              pagination: false,
            },
            items: {
              type: 'object',
              properties: {
                rawMaterialColumn: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.carbonproduct.rawMaterialAcquisition,
                    align: 'left',
                  },
                  properties: {
                    rawMaterial: {
                      type: 'string',
                      'x-decorator': 'FormItem',
                      'x-component': 'NumberPicker',
                      'x-component-props': {
                        placeholder: I18N.carbonFootprint.pleaseEnter,
                        controls: false,
                      },
                      'x-validator': emissionValidator,
                    },
                  },
                },
                manufacturingColumn: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.carbonproduct.productionAndManufacturingLevel,
                    align: 'left',
                  },
                  properties: {
                    manufacturing: {
                      type: 'string',
                      'x-component': 'NumberPicker',
                      'x-component-props': {
                        placeholder: I18N.carbonFootprint.pleaseEnter,
                        controls: false,
                      },
                      'x-validator': emissionValidator,
                    },
                  },
                },
                distributionColumn: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.supplyChain.distributionAndStorage,
                    align: 'left',
                  },
                  properties: {
                    distribution: {
                      type: 'string',
                      'x-component': 'NumberPicker',
                      'x-component-props': {
                        placeholder: I18N.carbonFootprint.pleaseEnter,
                        controls: false,
                      },
                      'x-validator': emissionValidator,
                    },
                  },
                },
                employColumn: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.supplyChain.productUsageLevel,
                    align: 'left',
                  },
                  'x-visible': showFullLifeCycle,
                  properties: {
                    employ: {
                      type: 'string',
                      'x-component': 'NumberPicker',
                      'x-component-props': {
                        placeholder: I18N.carbonFootprint.pleaseEnter,
                        controls: false,
                      },
                      'x-validator': emissionValidator,
                    },
                  },
                },
                abandonColumn: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.carbonproduct.wasteDisposalStage,
                    align: 'left',
                  },
                  'x-visible': showFullLifeCycle,
                  properties: {
                    abandon: {
                      type: 'string',
                      'x-component': 'NumberPicker',
                      'x-component-props': {
                        placeholder: I18N.carbonFootprint.pleaseEnter,
                        controls: false,
                      },
                      'x-validator': emissionValidator,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
};
