import {
  FormItem,
  FormGrid,
  Input,
  Cascader,
  DatePicker,
  ArrayTable,
  NumberPicker,
} from '@formily/antd-v5';
import { Form } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import { genCarbonDataResultSchema } from '@src/views/supplyChain/schema';
import { CarbonData } from '@src/views/supplyChain/type';
import { FC, useEffect } from 'react';

import styles from './index.module.less';
import { CARBON_DATA_DATA_TYPE, CARBON_DATA_FILL_TYPE } from '../../constant';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    Input,
    Cascader,
    DatePicker,
    ArrayTable,
    NumberPicker,
  },
});

type ResultCarbonDataProps = {
  form: Form;
  carbonData: CarbonData;
};

const ResultCarbonData: FC<ResultCarbonDataProps> = ({ carbonData, form }) => {
  useEffect(() => {
    const { year, result, name, computeUnit } = carbonData;

    const {
      emission,
      rawMaterial,
      manufacturing,
      distribution,
      employ,
      abandon,
    } = result;

    form.setValues({
      name,
      computeUnit: computeUnit.split(','),
      emission,
      year,
      lifeCycle: [
        { rawMaterial, manufacturing, distribution, employ, abandon },
      ],
    });
    // 只在第一次进行表单赋值，后续carbonData变更不再赋值字段，依赖项为空数组
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 核算结果时切换手动填写和自动匹配时相应字段改为启用/禁用状态
    Promise.resolve().then(() => {
      if (carbonData.dataType === CARBON_DATA_DATA_TYPE.RESULT) {
        const disabled =
          carbonData.fillType === CARBON_DATA_FILL_TYPE.MATCH ||
          carbonData.fillType === CARBON_DATA_FILL_TYPE.MODEL_SHARE;
        const fieldPathList = [
          'year',
          'emission',
          'lifeCycle.0.rawMaterial',
          'lifeCycle.0.manufacturing',
          'lifeCycle.0.distribution',
          'lifeCycle.0.employ',
          'lifeCycle.0.abandon',
        ];

        fieldPathList.forEach(path => {
          form.query(path).take()?.setComponentProps({ disabled });
        });
      }
    });
  }, [carbonData, form]);

  return (
    <div className={styles.resultCarbonData}>
      <FormilyCommon form={form}>
        <SchemaField
          schema={genCarbonDataResultSchema({
            lifeCycle: carbonData.footBorderType,
          })}
          scope={{ useFieldUnitDictSource }}
        />
      </FormilyCommon>
    </div>
  );
};

export default ResultCarbonData;
