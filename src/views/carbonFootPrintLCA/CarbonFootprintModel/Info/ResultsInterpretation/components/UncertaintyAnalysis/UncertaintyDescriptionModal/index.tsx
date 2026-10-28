/**
 * @description 不确定性描述弹窗
 */

import { Form, FormItem, FormLayout } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { FC, useEffect, useMemo } from 'react';

import { getAssessmentInfo } from '@/api/compution';
import { TextArea } from '@/components/formily/TextArea';

import { uncertaintyDescriptionSchema } from './schema';

type UncertaintyDescriptionModalProps = {
  /** 方案id */
  id?: number;
  /** 确定按钮的loading */
  confirmLoading?: boolean;
  /** 控制弹窗显隐 */
  open: boolean;
  /** 关闭弹窗的方法 */
  onCancel: () => void;
  /** 弹窗确定按钮的方法 */
  onOk: (values: { uncertaintyDesc: string }) => void;
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormLayout,
    TextArea,
  },
});

export const UncertaintyDescriptionModal: FC<
  UncertaintyDescriptionModalProps
> = ({ id, open, onCancel, onOk, confirmLoading = false }) => {
  const form = useMemo(() => createForm(), [open]);

  useEffect(() => {
    if (id && open) {
      getAssessmentInfo({ id }).then(({ data }) => {
        form.setValues({
          ...data?.data,
        });
      });
    }
  }, [id, open]);

  return (
    <Modal
      title={I18N.carbonFootPrintLCA.uncertaintyDescription}
      open={open}
      confirmLoading={confirmLoading}
      maskClosable={false}
      width={440}
      onOk={async () => {
        const values = await form.submit<{ uncertaintyDesc: string }>();
        onOk(values);
      }}
      onCancel={onCancel}
      okText={I18N.base.confirm}
      cancelText={I18N.Factors.cancel}
    >
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField schema={uncertaintyDescriptionSchema()} />
      </Form>
    </Modal>
  );
};
