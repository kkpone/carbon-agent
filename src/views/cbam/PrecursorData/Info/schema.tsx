import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderEmptySchema,
} from '@/components/formily/utils';

/** 数据概览 */
export const dataOverviewSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(),
        properties: {
          supplyName: renderFormItemSchema({
            title: I18N.carbonFootprint3.supplierName,
            'x-component': 'PreviewText',
          }),
          submitTime: renderFormItemSchema({
            title: I18N.eca.submissionTime,
            'x-component': 'PreviewText',
          }),
          applyStatus_name: renderFormItemSchema({
            title: I18N.eca.reviewStatus,
            'x-component': 'PreviewText',
          }),
        },
      },
    },
  );

/** 数据要求 */
export const dataRequirementsSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(),
        properties: {
          companyName: renderFormItemSchema({
            title: I18N.supplyChainCarbonManagement.customerName,
            'x-component': 'PreviewText',
          }),
          deadline: renderFormItemSchema({
            title: I18N.supplyChainCarbonManagement.deadline,
            'x-component': 'PreviewText',
          }),
          precursorName: renderFormItemSchema({
            title: I18N.cbam.nameOfPrecursor2,
            'x-component': 'PreviewText',
          }),
          applyRealName: renderFormItemSchema({
            title: I18N.supplyChainCarbonManagement.applicant,
            'x-component': 'PreviewText',
          }),
          applyMobile: renderFormItemSchema({
            title: I18N.supplyChainCarbonManagement.applicantContact,
            'x-component': 'PreviewText',
          }),
          applyTime: renderFormItemSchema({
            title: I18N.supplyChainCarbonManagement.applicationTime,
            'x-component': 'PreviewText',
          }),
          remark: renderFormItemSchema({
            title: I18N.components.remark,
            'x-component': 'TextArea',
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          emptyTwo: renderEmptySchema(),
          supportFile: renderFormItemSchema({
            title: I18N.certificationReviewCenter.proofMaterials,
            type: 'array',
            'x-component': 'FormilyFileUpload',
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
        },
      },
    },
  );

/** 填报数据 */
export const filledDataSchema = (unit: string) =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(),
        properties: {
          titleOne: renderFormItemSchema({
            required: false,
            'x-component': 'InfoTitle',
            'x-component-props': {
              title: I18N.cbam.basicPrecursorBelief,
              isFormily: true,
            },
            'x-decorator-props': {
              gridSpan: 3,
            },
          }),
          precursorName: renderFormItemSchema({
            title: I18N.cbam.nameOfPrecursor,
            'x-component': 'PreviewText',
          }),
          countryName: renderFormItemSchema({
            title: I18N.cbam.sourceCountryName,
            'x-component': 'PreviewText',
          }),
          emptyOne: renderEmptySchema(),
          cnCode: renderFormItemSchema({
            title: I18N.cbam.cnCode2,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-reactions': `{{ useAsyncCnDataSource() }}`,
          }),
          emptyTwo: renderEmptySchema(),
          titleTwo: renderFormItemSchema({
            'x-component': 'InfoTitle',
            'x-component-props': {
              title: I18N.cbam.implicitProcessScheduling,
              isFormily: true,
            },
            'x-decorator-props': {
              gridSpan: 3,
            },
          }),
          supplyAttributionList: renderFormItemSchema({
            'x-component': 'FormilyPrecursorEmissionTable',
            'x-component-props': {
              unit,
            },
            'x-decorator-props': {
              gridSpan: 3,
            },
          }),
          titleThree: renderFormItemSchema({
            'x-component': 'InfoTitle',
            'x-component-props': {
              title: I18N.supplyChainCarbonManagement.evidenceMaterials,
              isFormily: true,
            },
            'x-decorator-props': {
              gridSpan: 3,
            },
          }),
          evidenceFile: renderFormItemSchema({
            type: 'array',
            'x-component': 'FormilyFileUpload',
            'x-component-props': {
              showUploadButton: false,
            },
            'x-decorator-props': {
              gridSpan: 3,
            },
          }),

          unitName: renderFormItemSchema({
            title: I18N.Factors.unit,
            required: false,
            default: I18N.Factors.unit,
            'x-component': 'Input',
            'x-disabled': false,
            'x-hidden': true,
          }),
          productCategoryId: renderFormItemSchema({
            title: I18N.cbam.productCategoryI,
            required: false,
            'x-component': 'NumberPicker',
            'x-component-props': {
              precision: 0,
            },
            'x-disabled': false,
            'x-hidden': true,
          }),
        },
      },
    },
  );
