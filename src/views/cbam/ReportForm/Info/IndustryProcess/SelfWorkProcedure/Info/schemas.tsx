import { QuestionCircleOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Tooltip } from 'antd';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
} from '@/components/formily/utils';

import { PRE_WAY_ENUM, PRE_WAY_OPTIONS } from './constant';

const { AUTO, MANUAL } = PRE_WAY_ENUM;

export const schema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 1,
        }),
        properties: {
          processName: renderFormItemSchema({
            title: I18N.cbam.processName,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          preId: renderFormItemSchema({
            title: (
              <span>
                {I18N.cbam.selfOwnedSuperiorWorker}
                <Tooltip title={I18N.cbam.noteThatIfThereIsNoSuperior}>
                  <QuestionCircleOutlined className='iconTip' />
                </Tooltip>
              </span>
            ),
            required: false,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
              mode: 'multiple',
            },
          }),
          preProcess: renderFormItemSchema({
            title: I18N.cbam.thisProcessIncludes,
            required: false,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
              mode: 'multiple',
            },
          }),
          productCategoryId: renderFormItemSchema({
            title: I18N.cbam.processProductCategory,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
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
          includeType: renderFormItemSchema({
            title: I18N.cbam.allFrontLineWorkers,
            default: AUTO,
            'x-component': 'Radio.Group',
            enum: PRE_WAY_OPTIONS,
          }),
          elseProduct: renderFormItemSchema({
            validateTitle: I18N.cbam.preProcess,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
              mode: 'multiple',
            },
            'x-reactions': [
              {
                dependencies: ['includeType'],
                fulfill: {
                  state: {
                    visible: `{{ $deps[0] === ${MANUAL} }}`,
                  },
                },
              },
              `{{ useAsyncElseProductDataSource() }}`,
            ],
          }),
        },
      },
    },
  );
