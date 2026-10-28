/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  FormLayout,
  FormGrid,
  FormItem,
  Input,
  Select,
  Cascader,
  Radio,
  DatePicker,
} from '@formily/antd-v5';
import { Field, createForm, onFieldChange } from '@formily/core';
import { connect, createSchemaField, mapProps } from '@formily/react';
import FormilyButtonSelect from '@src/components/FormilyUtil/FormilyButtonSelect';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import useFieldFlattenUnitDictSource from '@src/hooks/useFieldFlattenUnitDataSource';
import useFieldSetValueByLabel from '@src/hooks/useFieldSetValueByLabel';
import useFieldSupplierSource from '@src/hooks/useFieldSupplierSource';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import FormilyFileUpload from '@src/views/carbonFootprint3/component/FormilyFileUpload';
import { Spin } from 'antd';
import classNames from 'classnames';
import { VFC, useEffect, useMemo, useState } from 'react';

import styles from './index.module.less';
import {
  genFactorSchema,
  genSupplierSchema,
  genMatchWaySchema,
  genProcessInBasicInfoSchema,
  genProcessOutBasicInfoSchema,
  genFileSchema,
} from './schema';
import {
  CALC_WAY,
  MATCH_WAY,
  PROCESS_IN_TYPE,
  PROCESS_TYPE,
} from '../constant';
import { getEmissionInfo, getOutInfo } from '../service';
import { ProcessAccounting } from '../type';

const SchemaField = createSchemaField({
  // 组件列表
  components: {
    FormilyButtonSelect,
    FormLayout,
    FormGrid,
    FormItem,
    Input,
    Select,
    Cascader,
    Radio,
    DatePicker,
    FormilyFileUpload: connect(
      FormilyFileUpload,
      mapProps({ value: true }, props => ({ ...props })),
    ),
  },
});

type EmissionInfoProps = {
  emission: ProcessAccounting;
  flag?: boolean;
};

const EmissionInfo: VFC<EmissionInfoProps> = ({ emission, flag }) => {
  const [loading, setLoading] = useState(false);

  const form = useMemo(
    () =>
      createForm({
        readPretty: true,
        effects: () => {
          onFieldChange(
            'supplierObj.supplierId',
            ['value', 'dataSource'],
            generalField => {
              const field = generalField as Field;
              if (!field.value) {
                return;
              }
              const selectedSupplier = (field.dataSource || []).find(
                ({ value }) => field.value === value,
              );

              if (!selectedSupplier) {
                field.setDataSource([
                  ...(field.dataSource || []),
                  { value: field.value, label: field.value, isAdd: true },
                ]);
              }
            },
          );
        },
      }),
    [emission],
  );

  useEffect(() => {
    const isEmission = emission.processType === PROCESS_TYPE.IN;
    const reqFunc = isEmission ? getEmissionInfo : getOutInfo;
    setLoading(true);
    reqFunc({ id: emission.dataId, flag })
      .then(({ data }) => {
        const {
          id,
          name,
          type,
          amount,
          unitCode,
          matchWay,
          factorObj,
          supplierObj,
          rate,
          typeExtra,
          files,
        } = (data.data as Record<string, any>) || {};

        form.setValues({
          id,
          name,
          type,
          matchWay,
          typeExtra,
          files,
        });

        if (type !== PROCESS_IN_TYPE.TRANSPORTATION) {
          form.setValues({
            amount,
          });
          form.setFieldState('unitCode', {
            data: {
              value: unitCode,
            },
          });
        } else {
          const {
            way,
            amount: typeExtraAmount,
            distance,
            unitCode: typeExtraUnitCode,
            unitName,
          } = typeExtra || {};
          form.setValues({
            typeExtra: {
              name,
              way,
            },
          });

          if (typeExtraAmount !== undefined) {
            form.setValues({
              typeExtra: {
                amount: typeExtraAmount,
              },
            });
          }

          if (way === CALC_WAY.ENERGY_CONSUMPTION) {
            form.setFieldState('typeExtra.unitCode', {
              data: {
                value: typeExtraUnitCode,
              },
            });
          }

          if (way === CALC_WAY.PRODUCT_WEIGHT) {
            form.setValues({
              typeExtra: {
                weightUnitCode: unitName,
              },
            });
          }

          if (distance !== undefined) {
            form.setValues({
              typeExtra: {
                distance,
              },
            });
          }
        }

        if (factorObj) {
          form.setValues({
            factorObj: {
              id: factorObj.id,
              name: factorObj.name,
              factor: factorObj.factor,
              numeratorUnit: (factorObj.unit || '').split('/')[0] || undefined,
              rate,
              institution: factorObj.institution,
              year: factorObj.year,
            },
          });
          form.setFieldState('factorObj.denominatorUnit', {
            data: {
              label: (factorObj.unit || '').split('/')[1],
            },
          });
        }

        if (matchWay === MATCH_WAY.SUPPLIER && supplierObj) {
          if (supplierObj.unit) {
            const [numeratorUnit, denominatorUnit] = (
              supplierObj.unit || ''
            ).split('/');
            supplierObj.numeratorUnit = numeratorUnit;
            supplierObj.denominatorUnit = (denominatorUnit || '').split(',');
            supplierObj.unit = undefined;
          }

          if (supplierObj.supplierId === null) {
            supplierObj.supplierId = supplierObj.computeCompanyName;
          }
          form.setValues({ rate, supplierObj });
        }
      })
      .finally(() => setLoading(false));
  }, [emission, flag, form]);

  return (
    <div>
      <Spin spinning={loading}>
        <FormilyCommon form={form}>
          <>
            <div className={styles.formTitle}>
              {I18N.carbonFootprint.basicInformation}
            </div>
            <SchemaField
              schema={
                emission.processType === PROCESS_TYPE.IN
                  ? genProcessInBasicInfoSchema()
                  : genProcessOutBasicInfoSchema()
              }
              scope={{
                useFieldUnitDictSource,
                useFieldSetValueByLabel,
              }}
            />
            <div className={styles.formTitle}>
              {I18N.carbonFootprint3.emissionData}
            </div>
            <div className='m-b-16'>
              <SchemaField schema={genMatchWaySchema()} />
            </div>
            <SchemaField
              schema={genFactorSchema()}
              scope={{
                useFieldUnitDictSource,
                useFieldSetValueByLabel,
              }}
            />
            <SchemaField
              schema={genSupplierSchema()}
              scope={{
                useFieldUnitDictSource,
                useFieldSetValueByLabel,
                useFieldSupplierSource,
                useFieldFlattenUnitDictSource,
              }}
            />
            <div className={classNames(styles.formTitle, 'm-t-16')}>
              {I18N.carbonFootprint3.supportingMaterials}
            </div>
            <SchemaField schema={genFileSchema()} />
          </>
        </FormilyCommon>
      </Spin>
    </div>
  );
};

export default EmissionInfo;
