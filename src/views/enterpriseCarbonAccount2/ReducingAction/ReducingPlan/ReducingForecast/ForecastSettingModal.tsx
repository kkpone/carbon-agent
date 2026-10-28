import { FormItem, FormLayout, NumberPicker, Radio } from '@formily/antd-v5';
import { createForm, onFieldInputValueChange } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCardSelect from '@src/components/FormilyUtil/FormilyCardSelect';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Modal } from 'antd';
import { useMemo, useState } from 'react';

import styles from './index.module.less';
import { genForecastSettingSchema } from './schema';
import { editReducingForecastSetting } from './service';
import { ReducingForecastSetting } from './type';
import { HISTORY_DATA_RANGE } from '../constant';
import { ReducingPlan } from '../type';

type ForecastSettingModalProps = {
  visible: boolean;
  reducingPlan: ReducingPlan;
  forecastSetting: ReducingForecastSetting | null;
  onCancel: () => void;
  onSuccess?: () => void;
};

const SchemaField = createSchemaField({
  components: {
    FormLayout,
    FormItem,
    NumberPicker,
    Radio,
    FormilyCardSelect,
  },
});

const ForecastSettingModal: React.VFC<ForecastSettingModalProps> = ({
  visible,
  forecastSetting,
  reducingPlan,
  onCancel,
  onSuccess,
}) => {
  const [confirmBtnLoading, setConfirmBtnLoading] = useState(false);

  const form = useMemo(
    () =>
      createForm<ReducingForecastSetting>({
        initialValues: forecastSetting || undefined,
        effects(_form) {
          onFieldInputValueChange('type', () => {
            _form.clearErrors();
            _form.setValues({
              dataScope: HISTORY_DATA_RANGE.RECENT_THREE_YEAR,
              marketRatio: null,
              productRatio: null,
              employeeRatio: null,
              placeRatio: null,
            });
          });
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible, forecastSetting],
  );

  const onConfirm = async () => {
    const forecastSettingValue = await form.submit<ReducingForecastSetting>();
    setConfirmBtnLoading(true);
    try {
      await editReducingForecastSetting({
        ...forecastSettingValue,
        id: reducingPlan.id,
      });
      Toast('success', I18N.carbonFootprint.editSuccessful);
      onSuccess?.();
    } finally {
      setConfirmBtnLoading(false);
    }
  };

  return (
    <Modal
      className={styles.forecastModal}
      title={
        forecastSetting
          ? I18N.enterpriseCarbonAccount2.switchPredictor
          : I18N.enterpriseCarbonAccount2.selectPredictor
      }
      open={visible}
      width={748}
      centered
      okButtonProps={{
        loading: confirmBtnLoading,
      }}
      onCancel={onCancel}
      onOk={onConfirm}
    >
      <FormilyCommon form={form}>
        <SchemaField schema={genForecastSettingSchema()} />
      </FormilyCommon>
    </Modal>
  );
};

export default ForecastSettingModal;
