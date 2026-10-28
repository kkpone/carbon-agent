import I18N from '@src/lang/I18N';
import { FormItem, Input, Radio } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { Modal } from 'antd';
import { FC, useMemo, useState } from 'react';

import { CARBON_DATA_STATUS } from '../../constant';

type AuditModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (data: {
    result:
      | typeof CARBON_DATA_STATUS.APPROVED
      | typeof CARBON_DATA_STATUS.DISAPPROVED;
    content?: string;
  }) => Promise<void>;
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Radio,
  },
});

const AuditModal: FC<AuditModalProps> = ({ visible, onCancel, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const form = useMemo(() => createForm(), [visible]);

  const submit = async () => {
    const formData = await form.submit<{
      result:
        | typeof CARBON_DATA_STATUS.APPROVED
        | typeof CARBON_DATA_STATUS.DISAPPROVED;
      content?: string;
    }>();

    try {
      setLoading(true);
      await onConfirm(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={I18N.carbonFootprint3.auditing}
      open={visible}
      okButtonProps={{ loading }}
      onCancel={onCancel}
      onOk={submit}
    >
      <FormilyCommon form={form}>
        <SchemaField
          schema={{
            type: 'object',
            properties: {
              result: {
                type: 'string',
                title: I18N.carbonFootprint3.findingsOfAudit,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Radio.Group',
                default: CARBON_DATA_STATUS.APPROVED,
                enum: [
                  {
                    value: CARBON_DATA_STATUS.APPROVED,
                    label: I18N.carbonFootprint3.approved,
                  },
                  {
                    value: CARBON_DATA_STATUS.DISAPPROVED,
                    label: I18N.carbonFootprint3.reviewFailed2,
                  },
                ],
              },
              content: {
                type: 'string',
                title: I18N.carbonFootprint3.reviewRemarks,
                'x-decorator': 'FormItem',
                'x-component': 'Input.TextArea',
                'x-component-props': {
                  placeholder: I18N.supplyChain.pleaseEnterTheReview,
                },
              },
            },
          }}
        />
      </FormilyCommon>
    </Modal>
  );
};

export default AuditModal;
