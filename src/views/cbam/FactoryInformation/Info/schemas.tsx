import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
} from '@/components/formily/utils';

export const schema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          factorName: renderFormItemSchema({
            title: I18N.cbam.factoryName,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          orgId: renderFormItemSchema({
            title: I18N.carbonData.affiliatedOrganization,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
          }),
          factoryCode: renderFormItemSchema({
            title: I18N.cbam.factoryCode,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 50,
            },
          }),
          factoryNameEn: renderFormItemSchema({
            title: I18N.cbam.factoryNameInEnglish,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          country: renderFormItemSchema({
            title: I18N.cbam.country,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
          }),
          locationCode: renderFormItemSchema({
            title: I18N.cbam.locationCode,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 50,
            },
          }),
          city: renderFormItemSchema({
            title: I18N.cbam.city,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 50,
            },
          }),
          detailedAddress: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.detailedAddress,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          economicActivity: renderFormItemSchema({
            title: I18N.cbam.economicActivity,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          postalCode: renderFormItemSchema({
            title: I18N.cbam.postalCode,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 50,
            },
          }),
          postOfficeBox: renderFormItemSchema({
            title: I18N.cbam.postOfficeBox,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          longitude: renderFormItemSchema({
            title: I18N.cbam.longitude,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 50,
            },
          }),
          latitude: renderFormItemSchema({
            title: I18N.cbam.latitude,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 50,
            },
          }),
          authorizedRepresentative: renderFormItemSchema({
            title: I18N.cbam.authorizedRepresentativeSurname,
            'x-component': 'Input',
            required: false,
            'x-component-props': {
              maxLength: 100,
            },
          }),
          email: renderFormItemSchema({
            title: I18N.cbam.eMail,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          mobile: renderFormItemSchema({
            title: I18N.cbam.telephone,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
        },
      },
    },
  );
