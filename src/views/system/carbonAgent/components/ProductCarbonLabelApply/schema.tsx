import type { Form } from '@formily/core';
import { observer, type ISchema } from '@formily/react';
import {
  initFormilyDatePicker,
  initFormilyInput,
} from '@src/components/FormilyUtil/util';
import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import {
  carbonLabelBrandField,
  carbonLabelProductImageField,
} from '@src/views/carbonFootprint3/CarbonLabel/formFields';

import hiddenIcon from './assets/hidden.svg';
import uploadIcon from './assets/upload.svg';
import type { ApplicationValues } from './types';
import style from './index.module.less';

const VisibilityTitle = observer(
  ({
    form,
    name,
    title,
  }: {
    form: Form<ApplicationValues>;
    name: 'specsShow' | 'contrastShow';
    title: string;
  }) => {
    const shown = form.getValuesIn(name) === 1;
    return (
      <span className={style.visibilityTitle}>
        {title}
        <button
          type='button'
          aria-label={`${I18N.carbonAgent.labelApplication.show}${title}`}
          aria-pressed={shown}
          onClick={() => form.setValuesIn(name, shown ? 0 : 1)}
        >
          {shown ? (
            <IconFont type='icon-icon-xianzhi' />
          ) : (
            <img src={hiddenIcon} width={16} height={16} alt='' />
          )}
        </button>
      </span>
    );
  },
);

const CategoryTitle = observer(
  ({ form }: { form: Form<ApplicationValues> }) => (
    <span className={style.categoryTitle}>
      <VisibilityTitle
        form={form}
        name='contrastShow'
        title={I18N.carbonAgent.labelApplication.categoryLabel}
      />
      <span className={style.categoryCount}>
        {I18N.template(I18N.carbonAgent.labelApplication.selectedCount, {
          val1: form.values.contrastValuesArr?.length || 0,
        })}
      </span>
    </span>
  ),
);

export function createApplicationSchema(
  form: Form<ApplicationValues>,
): ISchema {
  // 共享字段定义，不依赖旧页面的 grid 布局；上传和裁剪规则保持不变。
  const productImageField = carbonLabelProductImageField();
  const periodField = initFormilyDatePicker(
    I18N.carbonFootprint.accountingCycle,
    true,
  );
  return {
    type: 'object',
    properties: {
      productName: {
        type: 'string',
        ...initFormilyInput(I18N.carbonFootprint.productName, true),
      },
      accountName: {
        type: 'string',
        ...initFormilyInput(I18N.carbonFootprint3.functionalUnits, true),
      },
      period: {
        ...periodField,
        'x-component': 'ApplicationPeriod',
        'x-validator': [
          periodField['x-validator'],
          (value: string[]) =>
            !value?.length ||
            (value.length === 2 && value.every(Boolean) && value[0] <= value[1])
              ? ''
              : I18N.carbonAgent.labelApplication.invalidPeriod,
        ],
      },
      perEmission: {
        type: 'string',
        title: I18N.carbonFootprint3.unitEmissions,
        'x-decorator': 'FormItem',
        'x-component': 'EmissionInput',
      },
      labelType: {
        type: 'void',
        title: I18N.carbonAgent.labelApplication.labelTypeTitle,
        'x-decorator': 'FormItem',
        'x-component': 'LabelType',
      },
      brand: carbonLabelBrandField(),
      specs: {
        type: 'string',
        ...initFormilyInput(I18N.carbonFootprint.specificationAndModel, true),
        title: (
          <VisibilityTitle
            form={form}
            name='specsShow'
            title={I18N.carbonFootprint.specificationAndModel}
          />
        ),
        'x-reactions': {
          dependencies: ['specsShow'],
          fulfill: {
            state: {
              required: '{{$deps[0] === 1}}',
              decoratorProps: {
                className: `{{$deps[0] === 1 ? '' : '${style.fieldHidden}'}}`,
              },
            },
          },
        },
      },
      productPic: {
        ...productImageField,
        'x-decorator-props': { className: style.uploadField },
        'x-component-props': {
          ...productImageField['x-component-props'],
          descriptionPosition: 'before',
          maxCount: 1,
          replaceOnExceed: true,
          uploadIcon: <img src={uploadIcon} width={16} height={16} alt='' />,
        },
        type: 'array',
        'x-validator': [
          {
            required: true,
            message: I18N.template(I18N.carbonAccount.pleaseUploadIt, {
              val1: I18N.carbonFootprint3.productImages,
            }),
          },
          (value: ApplicationValues['productPic']) =>
            !value?.length || value[0]?.url
              ? ''
              : I18N.carbonAgent.labelApplication.uploadedRequired,
        ],
        required: true,
      },
      contrastValuesArr: {
        type: 'array',
        title: <CategoryTitle form={form} />,
        'x-decorator': 'FormItem',
        'x-decorator-props': { className: style.categoryField },
        'x-component': 'FormilyClassRadios',
        required: true,
        'x-reactions': {
          dependencies: ['contrastShow'],
          fulfill: { state: { required: '{{$deps[0] === 1}}' } },
        },
        'x-validator': [
          {
            required: true,
            message:
              I18N.carbonFootprint.pleaseSelect +
              I18N.carbonAgent.labelApplication.categoryLabel,
          },
          (value: number[]) =>
            value?.length > 3
              ? I18N.carbonAgent.labelApplication.categoryRequired
              : '',
        ],
      },
      specsShow: { type: 'number', 'x-hidden': true },
      contrastShow: { type: 'number', 'x-hidden': true },
      perEmissionUnit: { type: 'string', 'x-hidden': true },
      productUnitName: { type: 'string', 'x-hidden': true },
    },
  };
}
