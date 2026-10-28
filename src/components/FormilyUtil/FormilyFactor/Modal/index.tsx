/**
 * 手动填写因子弹框
 */
import {
  Cascader,
  DatePicker,
  FormGrid,
  FormItem,
  NumberPicker,
  Input,
  Select,
} from '@formily/antd-v5';
import { FieldDataSource, createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import useFieldSetValueByLabel from '@src/hooks/useFieldSetValueByLabel';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { MODEL_EMISSION_MATCH_WAY } from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { Modal } from 'antd';
import { isArray } from 'lodash';
import { FC, useMemo } from 'react';

import './index.less';
import { FactorPatternType } from '@/views/subModules/CarbonFootprintModel/constant';

import { emissionFactorSchema } from './schema';
import { FactorObjType, FactorWriteObjType } from './type';
import FormilyCommon from '../../FormilyCommon';

type FactorWriteModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: FactorObjType) => void;
  initValues?: FactorObjType;
  readPretty?: boolean;
};

const { FACTOR } = MODEL_EMISSION_MATCH_WAY;

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    Input,
    Select,
    Cascader,
    DatePicker,
    NumberPicker,
  },
});
export const FactorWriteModal: FC<FactorWriteModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  initValues,
  readPretty,
}) => {
  const form = useMemo(
    () =>
      createForm<FactorObjType>({
        initialValues: {
          ...initValues,
          factor: shouldHideEcoinventValue(initValues)
            ? undefined
            : initValues?.factor,
        },
        readPretty,
      }),
    [visible],
  );

  /** 提交表单 */
  const subForm = async () => {
    const data: FactorWriteObjType = await form.submit();
    const { denominatorUnit } = data;
    let childUnitInfo;
    if (denominatorUnit && isArray(denominatorUnit)) {
      const unitDataSource = form.getFieldState('denominatorUnit')
        .dataSource as FieldDataSource;
      const parentUnits = unitDataSource.find(
        unitInfo => unitInfo.value === denominatorUnit[0],
      );
      childUnitInfo = parentUnits?.children?.find(
        unitInfo => unitInfo.value === denominatorUnit[1],
      );
    }

    onSubmit({
      ...data,
      factorPattern: FactorPatternType.ordinaryFactor,
      denominatorUnit: childUnitInfo ? childUnitInfo?.label : denominatorUnit,
      matchWay: FACTOR,
    });
  };

  return (
    <Modal
      className='FactorWriteModal'
      width={900}
      title={I18N.carbonFootprint.manualFilling}
      maskClosable={false}
      // getContainer={false}
      open={visible}
      cancelText={I18N.carbonFootprint3.close}
      okText={I18N.carbonFootprint.preserve}
      okButtonProps={{
        style: { display: `${readPretty ? 'none' : 'inline-block'}` },
      }}
      bodyStyle={{ padding: '0 24px' }}
      onCancel={onCancel}
      onOk={subForm}
    >
      <FormilyCommon form={form}>
        <SchemaField
          schema={emissionFactorSchema(readPretty)}
          scope={{
            useFieldUnitDictSource,
            useFieldSetValueByLabel,
          }}
        />
      </FormilyCommon>
    </Modal>
  );
};
