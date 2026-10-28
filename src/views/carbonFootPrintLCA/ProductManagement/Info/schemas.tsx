import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderEmptySchema,
} from '@/components/formily/utils';

import { SOURCE_SYSTEM } from './constant';

/** 产品信息schemas */
export const schema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          productName: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.inTheProductName,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          productNameEn: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.productNameInEnglish,
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
          productCode: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.productCode,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 50,
            },
          }),
          materialNo: renderFormItemSchema({
            title: I18N.supplyChainCarbonManagement.materialNumber,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 50,
            },
          }),
          sourceSystem: renderFormItemSchema({
            title: I18N.supplyChainCarbonManagement.sourceSystem,
            required: false,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
            },
            default: SOURCE_SYSTEM.MANUAL_REPORT,
          }),
          productModel: renderFormItemSchema({
            title: I18N.productDigitalPassport.productModel,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          specification: renderFormItemSchema({
            title: I18N.productDigitalPassport.productSpecifications,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 200,
            },
          }),
          empty: renderEmptySchema(),
          description: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.productDescription,
            required: false,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 1000,
            },
          }),
          productImg: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.productPhotos,
            required: false,
            'x-component': 'FormilyPictureCardUpload',
            'x-component-props': {
              fileType: '.jpg,.JPG,.jpeg,.JPEG,.png,.PNG,.gif,.GIF',
              maxCount: 1,
              maxSize: 5,
            },
          }),
        },
      },
    },
  );
