import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderFormilyTableAction,
  renderEmptySchema,
} from '@/components/formily/utils';
import I18N from '@/lang/I18N';

const inputMaxLength100 = 100;

export const schema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          defaultNameEn: renderFormItemSchema({
            title: I18N.cbam.productCategoryName2,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: inputMaxLength100,
            },
          }),
          categoryName: renderFormItemSchema({
            title: I18N.cbam.productCategoryName,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: inputMaxLength100,
            },
          }),
          unit: renderFormItemSchema({
            title: I18N.Factors.unit,
            'x-component': 'Cascader',
            'x-component-props': {
              displayRender: (label: string[]) => {
                if (!label) return '';
                return label.slice(-1);
              },
              showSearch: true,
            },
          }),
          empty: renderEmptySchema(),
          isExists: renderFormItemSchema({
            title: I18N.cbam.doesItIncludeARoom,
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Radio.Group',
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          defaultProcessList: {
            type: 'array',
            title: I18N.cbam.configureProductionWorkers,
            'x-component': 'ArrayTable',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              pagination: false,
            },
            default: [{}],
            required: false,
            items: {
              type: 'object',
              properties: {
                columns1: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.duringTheProductionProcess,
                  },
                  properties: {
                    defaultNameEn: renderFormItemSchema({
                      validateTitle: I18N.cbam.duringTheProductionProcess,
                      'x-component': 'Input',
                      'x-component-props': {
                        maxLength: inputMaxLength100,
                      },
                    }),
                  },
                },
                columns11: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.productionProcessEnglish,
                  },
                  properties: {
                    defaultName: renderFormItemSchema({
                      validateTitle: I18N.cbam.productionProcessEnglish,
                      'x-component': 'Input',
                      'x-component-props': {
                        maxLength: inputMaxLength100,
                      },
                    }),
                  },
                },
                columns2: renderFormilyTableAction({
                  width: 68,
                  actionBtns: ({ index, array }) => [
                    {
                      label: I18N.Factors.delete,
                      key: 'del',
                      disabled: index === 0,
                      onClick: () => {
                        array.field.remove(index);
                      },
                    },
                  ],
                }),
              },
            },
            properties: {
              add: {
                type: 'void',
                'x-component': 'ArrayTable.Addition',
                title: I18N.carbonFootprint3.add,
              },
            },
          },
          defaultPrecursorList: {
            type: 'array',
            title: I18N.cbam.priorToConfiguration,
            'x-component': 'ArrayTable',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              pagination: false,
            },
            default: [{}],
            required: false,
            items: {
              type: 'object',
              properties: {
                columns1: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.relatedPrecursors2,
                  },
                  properties: {
                    defaultNameEn: renderFormItemSchema({
                      validateTitle: I18N.cbam.relatedPrecursors2,
                      'x-component': 'Input',
                      'x-component-props': {
                        maxLength: inputMaxLength100,
                      },
                    }),
                  },
                },
                columns11: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.relatedPrecursors,
                  },
                  properties: {
                    defaultName: renderFormItemSchema({
                      validateTitle: I18N.cbam.relatedPrecursors,
                      'x-component': 'Input',
                      'x-component-props': {
                        maxLength: inputMaxLength100,
                      },
                    }),
                  },
                },
                columns2: renderFormilyTableAction({
                  width: 68,
                  actionBtns: ({ index, array }) => [
                    {
                      label: I18N.Factors.delete,
                      key: 'del',
                      disabled: index === 0,
                      onClick: () => {
                        array.field.remove(index);
                      },
                    },
                  ],
                }),
              },
            },
            properties: {
              add: {
                type: 'void',
                'x-component': 'ArrayTable.Addition',
                title: I18N.carbonFootprint3.add,
              },
            },
          },
          defaultProductList: {
            type: 'array',
            title: I18N.cbam.configurationIncludesProduction,
            'x-component': 'ArrayTable',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              pagination: false,
            },
            default: [{}],
            required: false,
            items: {
              type: 'object',
              properties: {
                columns1: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.includeInTheProduct,
                  },
                  properties: {
                    defaultNameEn: renderFormItemSchema({
                      validateTitle: I18N.cbam.includeInTheProduct,
                      'x-component': 'Input',
                      'x-component-props': {
                        maxLength: inputMaxLength100,
                      },
                    }),
                  },
                },
                columns12: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.includingProductsInEnglish,
                  },
                  properties: {
                    defaultName: renderFormItemSchema({
                      validateTitle: I18N.cbam.includingProductsInEnglish,
                      'x-component': 'Input',
                      'x-component-props': {
                        maxLength: inputMaxLength100,
                      },
                    }),
                  },
                },
                columns2: renderFormilyTableAction({
                  width: 68,
                  actionBtns: ({ index, array }) => [
                    {
                      label: I18N.Factors.delete,
                      key: 'del',
                      disabled: index === 0,
                      onClick: () => {
                        array.field.remove(index);
                      },
                    },
                  ],
                }),
              },
            },
            properties: {
              add: {
                type: 'void',
                'x-component': 'ArrayTable.Addition',
                title: I18N.carbonFootprint3.add,
              },
            },
          },
          defaultCnList: {
            type: 'array',
            title: I18N.cbam.configureCnCode,
            'x-component': 'ArrayTable',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              pagination: false,
            },
            default: [{}],
            required: false,
            items: {
              type: 'object',
              properties: {
                columns1: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.cnCode,
                  },
                  properties: {
                    defaultCode: renderFormItemSchema({
                      validateTitle: I18N.cbam.cnCode,
                      'x-component': 'Input',
                      'x-component-props': {
                        maxLength: inputMaxLength100,
                      },
                    }),
                  },
                },
                columns2: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.cnName,
                  },
                  properties: {
                    defaultNameEn: renderFormItemSchema({
                      validateTitle: I18N.cbam.cnName,
                      'x-component': 'Input',
                      'x-component-props': {
                        maxLength: inputMaxLength100,
                      },
                    }),
                  },
                },
                columns21: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.cnNameEnglish,
                  },
                  properties: {
                    defaultName: renderFormItemSchema({
                      validateTitle: I18N.cbam.cnNameEnglish,
                      'x-component': 'Input',
                      'x-component-props': {
                        maxLength: inputMaxLength100,
                      },
                    }),
                  },
                },
                columns4: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.defaultDirectArrangement,
                  },
                  properties: {
                    defaultPer: renderFormItemSchema({
                      validateTitle: I18N.cbam.defaultDirectArrangement,
                      'x-component': 'NumberPicker',
                    }),
                  },
                },
                columns3: renderFormilyTableAction({
                  width: 68,
                  actionBtns: ({ index, array }) => [
                    {
                      label: I18N.Factors.delete,
                      key: 'del',
                      disabled: index === 0,
                      onClick: () => {
                        array.field.remove(index);
                      },
                    },
                  ],
                }),
              },
            },
            properties: {
              add: {
                type: 'void',
                'x-component': 'ArrayTable.Addition',
                title: I18N.carbonFootprint3.add,
              },
            },
          },
          defaultSaleList: {
            type: 'array',
            title: I18N.cbam.fillInForProductsSoldExternally,
            'x-component': 'ArrayTable',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              pagination: false,
            },
            default: [{}],
            required: false,
            items: {
              type: 'object',
              properties: {
                columns1: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.fillInTheContent,
                  },
                  properties: {
                    defaultName: renderFormItemSchema({
                      validateTitle: I18N.cbam.fillInTheContent,
                      'x-component': 'PreviewText',
                    }),
                  },
                },
                columns2: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.isItDisplayed,
                  },
                  properties: {
                    isShow: renderFormItemSchema({
                      validateTitle: I18N.cbam.isItDisplayed,
                      'x-component': 'Checkbox',
                    }),
                  },
                },
                columns3: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.isItMandatory,
                  },
                  properties: {
                    isRequired: renderFormItemSchema({
                      validateTitle: I18N.cbam.isItMandatory,
                      'x-component': 'Checkbox',
                    }),
                  },
                },
              },
            },
          },
        },
      },
    },
  );
