import { FormItem, Input, Cascader } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import useFiledUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Modal } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import styles from './index.module.less';
import { genIndicatorSchema } from './schema';
import { postOperateIndicatorAdd, putOperateIndicatorEdit } from '../service';
import { OperateIndicator } from '../type';

type IndicatorModalProps = {
  visible: boolean;
  indicator: OperateIndicator | null;
  onCancel: () => void;
  onSuccess: () => void;
};

const SchemaField = createSchemaField({
  components: { FormItem, Input, Cascader },
});

const IndicatorModal: React.FC<IndicatorModalProps> = ({
  visible,
  indicator,
  onCancel,
  onSuccess,
}) => {
  const [submitLoading, setSubmitLoading] = useState(false);

  const form = useMemo(() => createForm(), [visible]);

  const isAdd = useMemo(() => indicator === null, [indicator]);

  const onSubmit = async () => {
    const { name, unit } = await form.submit<{
      name: string;
      unit: string[];
    }>();
    const submitData = { name, unit: unit.join(',') };

    try {
      setSubmitLoading(true);

      if (isAdd) {
        await postOperateIndicatorAdd(submitData);
      } else {
        await putOperateIndicatorEdit({
          id: indicator!.id,
          ...submitData,
        });
      }

      Toast(
        'success',
        isAdd
          ? I18N.carbonFootprint.successfullyAdded
          : I18N.carbonFootprint.editSuccessful,
      );
      onSuccess();
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (indicator) {
      form.setInitialValues({
        name: indicator.name,
        unit: indicator.unit.split(','),
      });
    }
  }, [indicator, form]);

  return (
    <Modal
      className={styles.indicatorModal}
      title={
        isAdd
          ? I18N.enterpriseCarbonAccount2.newOperationalIndicators
          : I18N.enterpriseCarbonAccount2.detailedOperationalIndicators
      }
      centered
      open={visible}
      okText={
        isAdd ? I18N.carbonFootprint.confirm : I18N.carbonFootprint.preserve
      }
      okButtonProps={{
        loading: submitLoading,
        className: styles.modalConfirmBtn,
      }}
      onOk={onSubmit}
      onCancel={onCancel}
    >
      <FormilyCommon form={form}>
        <SchemaField
          scope={{ useFiledUnitDictSource }}
          schema={genIndicatorSchema()}
        />
      </FormilyCommon>
    </Modal>
  );
};

export default IndicatorModal;
