import { ISchema } from '@formily/react';
import I18N from '@src/lang/I18N';

import {
  renderEmptySchema,
  renderFormItemSchema,
  renderFromGridSchema,
} from '@/components/formily/utils';
import { changeTableColumnsNoText } from '@/utils';

export const processSetDrawerSchema: ISchema = {
  type: 'object',
  properties: {
    layout: {
      type: 'void',
      'x-component': 'FormLayout',
      'x-component-props': {
        layout: 'vertical',
      },
      properties: {
        grid: {
          ...renderFromGridSchema({ columns: 2 }),
          properties: {
            processLibName: renderFormItemSchema({
              type: 'string',
              title: I18N.carbonFootPrintLCA.processSetName,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                maxLength: 100,
                style: { maxWidth: 400 },
              },
            }),
            // orgId: renderFormItemSchema({
            //   type: 'string',
            //   title: I18N.carbonData.affiliatedOrganization,
            //   'x-decorator': 'FormItem',
            //   'x-component': 'Select',
            //   'x-component-props': {
            //     showSearch: true,
            //     optionFilterProp: 'label',
            //     allowClear: true,
            //   },
            // }),
            empty: renderEmptySchema(),
            lifeCycleList: renderFormItemSchema({
              type: 'string',
              title: I18N.carbonFootPrintLCA.lifeCycleStage,
              'x-decorator-props': {
                gridSpan: 2,
              },
              'x-decorator': 'FormItem',
              'x-component': 'Checkbox.Group',
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
                scroll: { y: '266px' },
                bordered: true,
              },
            }),
          },
        },
      },
    },
  },
};
