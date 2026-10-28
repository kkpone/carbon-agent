/**
 * @description 热点联产
 */
import {
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  NumberPicker,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { Button } from 'antd';
import { compact } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import { FormActions } from '@/components/FormActions';
import { InfoTitle } from '@/components/InfoTitle';
import { useCbamPageInfo } from '@/views/cbam/ReportForm/Info/context';
import I18N from '@/lang/I18N';
import { omitInfoFn, Toast } from '@/utils';

import styles from './index.module.less';
import { schema } from './schemas';
import { getHeatPowerDetail, putHeatPowerEdit } from '../../service';
import { HeatPowerResp } from '../../type';

const SchemaField = createSchemaField({
  components: {
    InfoTitle,
    NumberPicker,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
  },
});

interface HeatPowerProps {
  /** 下一步方法 */
  onClickNextStep: ({ reportId }: { reportId?: number }) => void;
  /** 返回方法 */
  onClickBack: () => void;
  /** 是否是CBAM跳转 */
  isCbamInfo?: boolean;
}

const HeatPower = ({
  onClickNextStep,
  onClickBack,
  isCbamInfo,
}: HeatPowerProps) => {
  const { isDetail, id: cbamId } = useCbamPageInfo();

  /** 是否是编辑状态 */
  const [isEdit, setIsEdit] = useState(false);

  /** 保存按钮的loading */
  const [loading, setLoading] = useState(false);

  const form = useMemo(
    () =>
      createForm({
        readPretty: true,
      }),
    [],
  );

  useEffect(() => {
    /** 获取详情 */
    if (cbamId) {
      getHeatPowerDetail({ cbamId }).then(({ data }) => {
        const result = data?.data || {};
        const { outPower, outFactor } = result || {};
        form.setValues({
          editData: {
            ...result,
          },
          outPower,
          outFactor,
        });
      });
    }
  }, [cbamId]);

  return (
    <div>
      <Form form={form} previewTextPlaceholder='-'>
        <InfoTitle
          title={I18N.cbam.combinedHeatAndPowerGeneration}
          rightRender={
            !isDetail && (
              <Button
                loading={isEdit && loading}
                type='primary'
                key='save'
                onClick={async () => {
                  // 编辑保存按钮切换
                  if (isEdit) {
                    setLoading(true);
                    try {
                      const values = await form.submit<HeatPowerResp>();
                      const { editData } = values || {};
                      const result = omitInfoFn({ ...editData, cbamId });
                      const { data } = await putHeatPowerEdit(result);
                      const { outPower, outFactor } = data?.data || {};
                      form.setValues({
                        ...values,
                        outPower,
                        outFactor,
                      });
                      Toast(
                        'success',
                        I18N.carbonFootPrintLCA.calculationCompleted,
                      );
                    } finally {
                      setLoading(false);
                    }
                  }
                  form.setFieldState('*(editData)', state => {
                    state.editable = !isEdit;
                  });
                  setIsEdit(!isEdit);
                }}
              >
                {isEdit ? I18N.cbam.saveAndCalculate : I18N.Factors.edit}
              </Button>
            )
          }
          className={styles.infoWrapper}
        />
        <SchemaField schema={schema()} />
      </Form>
      <FormActions
        place='center'
        buttons={compact([
          !isDetail && {
            title: I18N.carbonFootPrintLCA.nextStep,
            type: 'primary',
            onClick: async () => {
              form.reset();
              onClickNextStep({ reportId: cbamId });
            },
          },
          (!isDetail || isCbamInfo) && {
            title: I18N.Factors.return,
            onClick: async () => {
              onClickBack();
            },
          },
        ])}
      />
    </div>
  );
};

export default HeatPower;
