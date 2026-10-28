import {
  FormItem,
  Input,
  Select,
  DatePicker,
  ArrayTable,
  FormGrid,
} from '@formily/antd-v5';
import {
  createForm,
  Field,
  Form,
  onFieldChange,
  onFieldInputValueChange,
} from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Drawer } from 'antd';
import { isNil } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';

import FormilyCommon from '@/components/FormilyUtil/FormilyCommon';
import { checkPermissions } from '@/components/Permission/utils';
import { RadioGroup } from '@/components/formily/components/RadioGroup';
import { IconAlibaba } from '@/components/iconfont';
import { Toast } from '@/utils/Toast';

import OrgIndicator from './OrgIndicator';
import styles from './index.module.less';
import { ORG_DIMENSION_TYPE, ORG_DIMENSION_TYPE_LABEL } from '../constant';
import {
  getDataDetails,
  getDataYearList,
  getOperateIndicatorList,
  postOperateDataAdd,
  postOperateDataEdit,
} from '../service';
import { OperateIndicator } from '../type';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    DatePicker,
    ArrayTable,
    FormGrid,
    RadioGroup,
    OrgIndicator,
  },
});

type OperateDataDrawerProps = {
  open: boolean;
  dataId: number | null;
  indicator: OperateIndicator;
  onCancel: () => void;
  onSuccess: () => void;
};
const OperateDataDrawer: FC<OperateDataDrawerProps> = ({
  open,
  indicator,
  dataId,
  onCancel,
  onSuccess,
}) => {
  const form = useMemo(
    () =>
      createForm({
        readPretty: !checkPermissions(true, 'enterprise:operate:v2:edit'),
        effects: formIns => {
          onFieldChange('indicatorId', ['dataSource', 'value'], field => {
            const { value, dataSource } = field as unknown as Field;
            if (!isNil(value) && dataSource?.length > 0) {
              const orgIndicatorField = formIns
                .query('orgIndicator')
                .take() as Field;
              const selectedOption = dataSource.find(
                option => option.value === value,
              );

              orgIndicatorField?.setTitle(
                `${selectedOption?.label}（${selectedOption?.unitName}）`,
              );
            }
          });
          onFieldChange('companyType', ['value'], field => {
            const dimension = (field as unknown as { value: number }).value;
            if (!isNil(dimension)) {
              setTimeout(() => {
                form.query('orgIndicator').take()?.setComponentProps({
                  dimension,
                });
              });
            }
          });
          onFieldInputValueChange('companyType', () => {
            formIns.setValuesIn('orgIndicator', {});
          });
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );

  const [loading, setLoading] = useState(false);

  const onIndicatorChange = async ({
    indicatorId,
    form: formIns,
    setFirstYear = true,
  }: {
    indicatorId: number;
    form: Form;
    setFirstYear?: boolean;
  }) => {
    const { data } = await getDataYearList({ id: indicatorId });
    const yearField = formIns.query('year').take() as unknown as Field;
    yearField?.setDataSource(
      data.data.map(({ year, status }) => ({
        value: year,
        label: year,
        disabled: !status,
      })),
    );

    if (setFirstYear) {
      yearField?.setValue(data.data.find(({ status }) => !!status)?.year);
    }
  };

  const submit = async () => {
    try {
      setLoading(true);
      const val = await form.submit();

      if (isNil(dataId)) {
        await postOperateDataAdd(val);
      } else {
        await postOperateDataEdit({ id: dataId, ...(val || {}) });
      }

      Toast('success', I18N.carbonFootprint.operationSuccessful);
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      getOperateIndicatorList().then(({ data }) => {
        (form.query('indicatorId').take() as Field)?.setDataSource(
          (data.data || []).map(({ id, name, unitName }) => ({
            value: id,
            label: name,
            unitName,
          })),
        );
      });
    }
  }, [form, open]);

  useEffect(() => {
    if (open) {
      if (isNil(dataId)) {
        form.setValues({
          indicatorId: indicator.id,
          companyType: ORG_DIMENSION_TYPE.ENTERPRISE,
        });
        onIndicatorChange({ indicatorId: indicator.id, form });
      } else {
        getDataDetails({ id: dataId }).then(({ data }) => {
          const { indicatorNewId, orgIndicator, companyType, year } = data.data;
          form.setValues({
            indicatorId: indicatorNewId,
            year,
            companyType,
            orgIndicator,
          });
          onIndicatorChange({
            indicatorId: indicatorNewId,
            form,
            setFirstYear: false,
          });
        });
      }
    }
  }, [form, indicator, open, dataId]);

  return (
    <Drawer
      className={styles.drawer}
      title={
        isNil(dataId)
          ? I18N.carbonNeutral.newDataAdded
          : I18N.enterpriseCarbonAccount2.editData
      }
      width={704}
      open={open}
      destroyOnClose
      footer={
        <>
          <Button onClick={onCancel}>{I18N.carbonFootprint.cancel}</Button>
          {checkPermissions(
            <Button type='primary' loading={loading} onClick={submit}>
              {I18N.carbonFootprint.confirm2}
            </Button>,
            'enterprise:operate:v2:edit',
          )}
        </>
      }
      onClose={onCancel}
    >
      <div className={styles.tip}>
        <IconAlibaba className={styles.tipIcon} type='icon-icon_info1' />
        <div className={styles.tipText}>
          {I18N.enterpriseCarbonAccount2.refineTheNumberOfOperations}
        </div>
      </div>
      <FormilyCommon form={form}>
        <SchemaField
          schema={{
            type: 'object',
            properties: {
              baseGrid: {
                type: 'void',
                'x-component': 'FormGrid',
                'x-component-props': {
                  minColumns: 2,
                  columnGap: 24,
                },
                properties: {
                  indicatorId: {
                    type: 'string',
                    title: I18N.enterpriseCarbonAccount2.dataIndicators,
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      colon: false,
                    },
                    'x-component': 'Select',
                    'x-component-props': {
                      onChange: indicatorId =>
                        onIndicatorChange({ indicatorId, form }),
                    },
                  },
                  year: {
                    type: 'string',
                    title: I18N.carbonFootprint.year,
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Select',
                    'x-decorator-props': {
                      colon: false,
                    },
                    'x-component-props': {
                      placeholder: I18N.DomesticVersion.pleaseSelectTheYear,
                    },
                  },
                },
              },
              companyType: {
                type: 'string',
                title: I18N.enterpriseCarbonAccount2.organizationalDimension,
                required: true,
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  colon: false,
                },
                'x-component': 'RadioGroup',
                'x-component-props': {
                  options: Object.values(ORG_DIMENSION_TYPE).map(type => ({
                    value: type,
                    label: ORG_DIMENSION_TYPE_LABEL[type],
                  })),
                },
              },
              orgIndicator: {
                type: 'string',
                default: {},
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  colon: false,
                },
                'x-component': 'OrgIndicator',
              },
            },
          }}
        />
      </FormilyCommon>
    </Drawer>
  );
};

export default OperateDataDrawer;
