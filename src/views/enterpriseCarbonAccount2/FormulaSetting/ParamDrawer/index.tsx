/* eslint-disable no-nested-ternary */
import {
  FormItem,
  Input,
  Radio,
  NumberPicker,
  Cascader,
  Select,
} from '@formily/antd-v5';
import { createForm, Form as FormType } from '@formily/core';
import { Field } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Spin } from 'antd';
import { isNil, omit } from 'lodash-es';
import {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { CustomDrawer } from '@/components/CustomDrawer';
import FormilyCommon from '@/components/FormilyUtil/FormilyCommon';
import useFieldUnitDictSource from '@/hooks/useFieldUnitDictSource';

import styles from './index.module.less';
import {
  EMISSION_TYPE,
  EMISSION_TYPE_LABEL,
  NEED_DEFAULT,
  NEED_DEFAULT_LABEL,
  PARAM_TYPE,
  PARAM_TYPE_LABEL,
  USER_SIDE_DISPLAY,
  USER_SIDE_DISPLAY_LABEL,
} from '../constant';
import { getParamDetail } from '../service';

type ParamDrawerProps = {
  open: boolean;
  id?: number;
  isCopy?: boolean;
  readPretty?: boolean;
  onClose: () => void;
  onConfirm: (data: Record<string, any>) => void | Promise<void>;
};

const Param = forwardRef<
  FormType,
  Omit<ParamDrawerProps, 'open' | 'onClose' | 'onConfirm'>
>(({ id, isCopy, readPretty }, ref) => {
  const form = useMemo(
    () =>
      createForm({
        readPretty,
      }),
    [readPretty],
  );

  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => form, [form]);

  useEffect(() => {
    if (isNil(id)) return;

    setLoading(true);
    getParamDetail({ id })
      .then(({ data }) => {
        form.setInitialValues({
          ...data.data,
          name: isCopy ? `${data.data.name}-copy` : data.data.name,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [form, id, isCopy]);

  return (
    <Spin spinning={loading}>
      <FormilyCommon form={form} colon={false}>
        <Field
          name='name'
          title={I18N.emission.parameterName}
          required
          decorator={[FormItem]}
          component={[
            Input,
            {
              placeholder: I18N.enterpriseCarbonAccount2.pleaseEnterParameters2,
              maxLength: 50,
            },
          ]}
        />
        <Field
          name='emissionType'
          title={I18N.carbonFootprint.emissionType}
          required
          decorator={[FormItem]}
          component={[
            Select,
            {
              placeholder: I18N.enterpriseCarbonAccount2.pleaseSelectEmissions2,
              options: Object.values(EMISSION_TYPE).map(emissionType => ({
                value: emissionType,
                label: EMISSION_TYPE_LABEL[emissionType],
              })),
            },
          ]}
        />
        <Field
          name='description'
          title={I18N.enterpriseCarbonAccount2.parameterDescription}
          decorator={[FormItem]}
          component={[
            Input.TextArea,
            {
              placeholder: I18N.enterpriseCarbonAccount2.pleaseEnterParameters,
              maxLength: 100,
            },
          ]}
        />
        <Field
          name='paramType'
          title={I18N.enterpriseCarbonAccount2.parameterType}
          required
          initialValue={PARAM_TYPE.NUMERIC}
          decorator={[FormItem]}
          component={[
            Radio.Group,
            {
              options: Object.values(PARAM_TYPE).map(paramType => ({
                value: paramType,
                label: PARAM_TYPE_LABEL[paramType],
              })),
            },
          ]}
        />
        <Field
          name='hasValue'
          title={I18N.enterpriseCarbonAccount2.doYouWantToSetDefault}
          required
          initialValue={NEED_DEFAULT.NOT_NEED}
          decorator={[FormItem]}
          component={[
            Radio.Group,
            {
              options: Object.values(NEED_DEFAULT).map(value => ({
                value,
                label: NEED_DEFAULT_LABEL[value],
              })),
            },
          ]}
          reactions={field => {
            field.setDecoratorProps({
              className:
                field.value === NEED_DEFAULT.NEED
                  ? styles.needDefaultDecorator
                  : undefined,
            });
          }}
        />
        <Field
          name='defaultValue'
          title={I18N.enterpriseCarbonAccount2.defaultValue}
          required
          decorator={[FormItem, { className: styles.defaultValueDecorator }]}
          component={[
            NumberPicker,
            {
              className: styles.defaultValueInput,
              placeholder: I18N.enterpriseCarbonAccount2.pleaseEnterDefault,
              controls: false,
              precision: 4,
              stringMode: true,
            },
          ]}
          reactions={field => {
            const { hasValue, paramType } = form.values;
            field.setState({
              visible: hasValue === NEED_DEFAULT.NEED,
            });
            field.setComponentProps({
              addonAfter: paramType === PARAM_TYPE.PERCENT ? '%' : undefined,
            });
          }}
        />
        <Field
          name='hasUnit'
          title={I18N.enterpriseCarbonAccount2.isItAConfigurationForm}
          required
          initialValue={NEED_DEFAULT.NOT_NEED}
          decorator={[FormItem]}
          component={[
            Radio.Group,
            {
              options: Object.values(NEED_DEFAULT).map(value => ({
                value,
                label: NEED_DEFAULT_LABEL[value],
              })),
            },
          ]}
          reactions={field => {
            const { paramType } = form.values;
            const isPercent = paramType === PARAM_TYPE.PERCENT;

            if (isPercent) {
              field.setValue(NEED_DEFAULT.NOT_NEED);
            }
            field.setState({
              disabled: isPercent || field.readPretty,
            });
            field.setDecoratorProps({
              className:
                field.value === NEED_DEFAULT.NEED
                  ? styles.needDefaultDecorator
                  : undefined,
            });
          }}
        />
        <Field
          name='defaultUnit'
          title={I18N.carbonFootprint.unit}
          required
          decorator={[FormItem, { className: styles.defaultValueDecorator }]}
          component={[
            Cascader,
            { placeholder: I18N.carbonFootprint.pleaseSelectAUnit },
          ]}
          reactions={[
            field => {
              const { hasUnit } = form.values;
              field.setState({
                visible: hasUnit === NEED_DEFAULT.NEED,
              });
            },
            useFieldUnitDictSource('factorUnitM'),
          ]}
        />
        <Field
          name='show'
          title={I18N.enterpriseCarbonAccount2.userSideDisplay}
          required
          initialValue={USER_SIDE_DISPLAY.SHOW}
          decorator={[
            FormItem,
            {
              extra: I18N.enterpriseCarbonAccount2.userSideDisplayHint,
            },
          ]}
          component={[
            Radio.Group,
            {
              options: Object.values(USER_SIDE_DISPLAY).map(value => ({
                value,
                label: USER_SIDE_DISPLAY_LABEL[value],
              })),
            },
          ]}
          reactions={field => {
            const { hasValue } = form.values;
            field.setState({
              visible: hasValue === NEED_DEFAULT.NEED,
            });
            if (hasValue !== NEED_DEFAULT.NEED) {
              field.setValue(USER_SIDE_DISPLAY.SHOW);
            }
          }}
        />
      </FormilyCommon>
    </Spin>
  );
});

const ParamDrawer: FC<ParamDrawerProps> = ({
  id,
  open,
  isCopy,
  readPretty,
  onClose,
  onConfirm,
}) => {
  const formRef = useRef<FormType>(null);

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const form = formRef.current;
    if (!form) return;

    setLoading(true);
    try {
      const data = await form.submit<Record<string, any>>();
      await onConfirm(isCopy ? omit(data, ['id']) : data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDrawer
      title={
        isCopy
          ? I18N.enterpriseCarbonAccount2.copyParameters
          : isNil(id)
          ? I18N.enterpriseCarbonAccount2.newParameter
          : readPretty
          ? I18N.enterpriseCarbonAccount2.parameterDetails
          : I18N.enterpriseCarbonAccount2.editParameters
      }
      width={560}
      destroyOnClose
      open={open}
      footer={
        <div className={styles.drawerFooter}>
          <Button onClick={onClose}>
            {readPretty
              ? I18N.carbonFootprint3.close
              : I18N.carbonFootprint.cancel}
          </Button>
          {!readPretty && (
            <Button type='primary' loading={loading} onClick={submit}>
              {I18N.carbonFootprint.preserve}
            </Button>
          )}
        </div>
      }
      onClose={onClose}
    >
      <Param ref={formRef} id={id} isCopy={isCopy} readPretty={readPretty} />
    </CustomDrawer>
  );
};

export default ParamDrawer;
