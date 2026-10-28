import { QuestionCircleOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Tooltip } from 'antd';
import moment, { Moment } from 'moment';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderEmptySchema,
} from '@/components/formily/utils';
import { changeTableColumnsNoText } from '@/utils';

import style from './index.module.less';

/** 高精度25位小数 */
const stringMode25 = {
  stringMode: true,
  formatter: (v: string | number) => `${v}`,
  precision: 25,
  min: '0.0000000000000000000000001',
  max: '99999999999.9999999999999999999999999',
};

/** 目标与范围的schemas */
export const objectScopeSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 3,
        }),
        properties: {
          modelName: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.modelName,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          // orgId: renderFormItemSchema({
          //   title: I18N.carbonData.affiliatedOrganization,
          //   'x-component': 'Select',
          //   'x-component-props': {
          //     showSearch: true,
          //     optionFilterProp: 'label',
          //     allowClear: true,
          //   },
          // }),
          productId: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.product,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
          }),
          modelCode: renderFormItemSchema({
            title: I18N.certificationReviewCenter.modelCoding,
            'x-component': 'Input',
            'x-disabled': true,
          }),
          funcUnit: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.functionalUnits,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
              placeholder: I18N.supplyChainCarbonManagement.pleaseEnterText,
            },
          }),
          basicStream: {
            type: 'void',
            title: (
              <span>
                {I18N.carbonFootPrintLCA.perFunctionalUnit}
                <Tooltip title={I18N.carbonFootPrintLCA.forFunctionalUnits}>
                  <QuestionCircleOutlined className={style.basicStreamTip} />
                </Tooltip>
              </span>
            ),
            'x-decorator': 'FormItem',
            'x-component': 'FormGrid',
            'x-component-props': {
              className: style.gridWrapper,
            },
            'x-reactions': [
              {
                fulfill: {
                  schema: {
                    'x-decorator-props': {
                      asterisk: `{{!$form.readPretty}}`,
                    },
                  },
                },
              },
            ],
            properties: {
              baselineNum: renderFormItemSchema({
                validateTitle: I18N.carbonFootPrintLCA.quantity,
                type: 'number',
                'x-component': 'NumberPicker',
                'x-component-props': {
                  placeholder: I18N.carbonFootPrintLCA.pleaseEnterTheQuantity,
                  ...stringMode25,
                },
              }),
              baselineUnit: renderFormItemSchema({
                validateTitle: I18N.carbonFootPrintLCA.quantityUnit,
                'x-component': 'Cascader',
                'x-component-props': {
                  placeholder: I18N.carbonFootprint.pleaseSelectAUnit,
                  displayRender: (label: string[]) => {
                    if (!label) return '';
                    return label.slice(-1);
                  },
                  showSearch: true,
                },
              }),
            },
          },
          '[startTime, endTime]': renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.productionCycle,
            'x-component': 'DatePicker.RangePicker',
            'x-component-props': {
              placeholder: [
                I18N.carbonFootPrintLCA.startDate,
                I18N.carbonFootPrintLCA.endDate,
              ],
              className: style.datePicker,
              disabledDate: (current: Moment) =>
                (current && current < moment('1990')) ||
                (current && current > moment()),
            },
          }),
          productOriginInfo: {
            required: false,
            type: 'void',
            title: I18N.carbonFootPrintLCA.productOrigin,
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'FormGrid',
            'x-component-props': {
              className: style.gridWrapper,
            },
            'x-reactions': [
              {
                fulfill: {
                  schema: {
                    'x-decorator-props': {
                      asterisk: `{{!$form.readPretty}}`,
                    },
                  },
                },
              },
            ],
            properties: {
              productOrigin: renderFormItemSchema({
                validateTitle: I18N.carbonFootPrintLCA.productOrigin,
                'x-component': 'Select',
                'x-component-props': {
                  showSearch: true,
                  optionFilterProp: 'label',
                  allowClear: true,
                },
              }),
              productOriginDetail: renderFormItemSchema({
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: 100,
                  placeholder: I18N.carbonFootPrintLCA.detailedAddress,
                },
              }),
            },
          },
          productSalesInfo: {
            required: false,
            type: 'void',
            title: I18N.carbonFootPrintLCA.marketingPlaceOfProducts,
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'FormGrid',
            'x-component-props': {
              className: style.gridWrapper,
            },
            properties: {
              salesArea: renderFormItemSchema({
                required: false,
                validateTitle: I18N.carbonFootPrintLCA.productOrigin,
                'x-component': 'Select',
                'x-component-props': {
                  showSearch: true,
                  optionFilterProp: 'label',
                  allowClear: true,
                },
              }),
              salesAreaDetail: renderFormItemSchema({
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: 100,
                  placeholder: I18N.carbonFootPrintLCA.detailedAddress,
                },
              }),
            },
          },
          // empty: renderEmptySchema(),
          productTech: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.productionTechnology,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 1000,
            },
          }),
          emptyOne: renderEmptySchema(),
          researchTarget: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.researchObjectives,
            required: false,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 1000,
            },
          }),
          emptyTwo: renderEmptySchema(),
          systemBoundaryType: renderFormItemSchema({
            title: I18N.Factors.systemBoundary,
            'x-decorator-props': {
              gridSpan: 3,
            },
            'x-component': 'FormilySystemBoundaryRadio',
          }),
          lifeCycleList: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.lifeCycleStage,
            required: false,
            'x-component': 'Input',
            'x-hidden': true,
          }),
          selectedDb: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.selectedDatabase,
            type: 'array',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'FormilySelectableTable',
            'x-component-props': {
              columns: changeTableColumnsNoText(
                [
                  {
                    title: I18N.carbonFootPrintLCA.number,
                    dataIndex: 'index',
                    width: '68px',
                    render: (_v, _r, index: number) => index + 1,
                  },
                  {
                    title: I18N.carbonFootPrintLCA.databaseName,
                    dataIndex: 'dbName',
                  },
                ],
                '-',
              ),
              pagination: false,
              scroll: { y: '160px' },
              bordered: true,
            },
          }),
        },
      },
    },
  );

export const EnInputMaxLength1000 = 1000;

/** 目标与范围-报告用信息schemas */
export const objectScopeReportSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 3,
        }),
        properties: {
          expectedUse: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.intendedUse,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          expectedUseEn: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.intendedUseInEnglish,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: EnInputMaxLength1000,
            },
          }),
          funcUnitEn: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.functionalUnitsInEnglish,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: EnInputMaxLength1000,
              placeholder: I18N.supplyChainCarbonManagement.pleaseEnterText,
            },
            required: false,
          }),
          manufacturer: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.manufacturerChinese,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          manufacturerEn: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.manufacturerEnglish,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: EnInputMaxLength1000,
            },
          }),
          factoryAddr: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.inTheFactoryAddress,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          factoryAddrEn: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.factoryAddressInEnglish,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: EnInputMaxLength1000,
            },
          }),
          factoryContactName: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.factoryContact2,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          factoryContactNameEn: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.factoryContact,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: EnInputMaxLength1000,
            },
          }),
          productFlowDiagram: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.productProcessFlow,
            required: false,
            'x-component': 'FormilyPictureCardUpload',
            'x-component-props': {
              fileType: '.jpg,.JPG,.jpeg,.JPEG,.png,.PNG,.gif,.GIF',
              maxCount: 1,
              maxSize: 5,
            },
          }),
          systemBoundaryImg: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.systemBoundaryDiagram,
            required: false,
            'x-component': 'FormilyPictureCardUpload',
            'x-component-props': {
              fileType: '.jpg,.JPG,.jpeg,.JPEG,.png,.PNG,.gif,.GIF',
              maxCount: 1,
              maxSize: 5,
            },
          }),
          emptyFour: renderEmptySchema(),
          systemBoundaryDesc: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.systemBoundaryDescription3,
            required: false,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 1000,
            },
          }),
          emptyOne: renderEmptySchema(),
          systemBoundaryDescEn: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.systemBoundaryDescription2,
            required: false,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 1000,
            },
          }),
          emptyTwo: renderEmptySchema(),
          cutoffRule: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.deadlineRules,
            required: false,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 1000,
            },
          }),
          emptyThree: renderEmptySchema(),
          assumptionsAndConstraints: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.assumptionsAndLimitations,
            required: false,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 1000,
            },
          }),
          emptyFive: renderEmptySchema(),
          allocScene: renderFormItemSchema({
            required: false,
            title: '分配场景',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 1000,
            },
          }),
        },
      },
    },
  );
