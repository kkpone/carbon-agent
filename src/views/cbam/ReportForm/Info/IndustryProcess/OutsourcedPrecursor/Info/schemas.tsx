import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
} from '@/components/formily/utils';

import {
  FILL_WAY_ENUM,
  FILL_WAY_OPTIONS,
  PRECURSOR_SET_STATUS,
} from '../../../constant';

const { MANUAL, SUPPLY_FILL } = FILL_WAY_ENUM;

const { FILLING, PENDING_APPROVAL, COLLECTED } = PRECURSOR_SET_STATUS;

export const precursorSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          preName: renderFormItemSchema({
            title: I18N.cbam.nameOfPrecursor,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          productCategoryId: renderFormItemSchema({
            title: I18N.cbam.outsourcedPrecursorProducts,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-reactions': {
              dependencies: ['fillStatus'],
              fulfill: {
                state: {
                  disabled: `{{ $form.readPretty || $deps[0] === ${FILLING} || $deps[0] === ${PENDING_APPROVAL} || $deps[0] === ${COLLECTED} }}`,
                },
              },
            },
          }),
          productRoute: renderFormItemSchema({
            title: I18N.cbam.productionRoute,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
              mode: 'multiple',
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-reactions': [
              `{{ useAsyncRouterDataSource() }}`,
              {
                fulfill: {
                  state: {
                    required: `{{ $self?.dataSource?.length && !$form.readPretty }}`,
                    disabled: `{{ !$self?.dataSource?.length || $form.readPretty }}`,
                  },
                },
              },
            ],
          }),
        },
      },
    },
  );

export const supplySchema = (hideSupplyFill = true) => {
  const fillWayOptions = hideSupplyFill
    ? FILL_WAY_OPTIONS.filter(option => option.value !== SUPPLY_FILL)
    : FILL_WAY_OPTIONS;

  return renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          manual: renderFormItemSchema({
            default: MANUAL,
            enum: fillWayOptions,
            'x-component': 'Radio.Group',
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          supplierName: renderFormItemSchema({
            title: I18N.carbonFootprint3.supplierName,
            required: false,
            'x-disabled': true,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
              placeholder: '-',
            },
            'x-reactions': {
              dependencies: ['manual'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${SUPPLY_FILL} }}`,
                },
              },
            },
          }),
          fillStatus: renderFormItemSchema({
            title: I18N.cbam.fillInStatus,
            required: false,
            'x-disabled': true,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
              placeholder: '-',
            },
            'x-reactions': {
              dependencies: ['manual'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${SUPPLY_FILL} }}`,
                },
              },
            },
          }),
          countryCode: renderFormItemSchema({
            title: I18N.cbam.sourceCountryName,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
            'x-reactions': {
              dependencies: ['manual'],
              when: `{{ $deps[0] === ${MANUAL} }}`,
              fulfill: {
                schema: {
                  required: true,
                  'x-disabled': `{{ $form.readPretty }}`,
                  'x-component-props': {
                    placeholder: I18N.utils.pleaseSelect,
                  },
                },
              },
              otherwise: {
                schema: {
                  required: false,
                  'x-disabled': true,
                  'x-component-props': {
                    placeholder: '-',
                  },
                },
              },
            },
          }),
          linkId: renderFormItemSchema({
            title: I18N.cbam.relatedSupply,
            required: false,
            'x-component': 'Input',
            'x-hidden': true,
          }),
        },
      },
    },
  );
};
