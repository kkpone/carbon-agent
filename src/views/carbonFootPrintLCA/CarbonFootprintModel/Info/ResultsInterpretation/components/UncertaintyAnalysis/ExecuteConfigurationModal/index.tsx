/**
 * @description 执行配置弹窗
 */

import { Form, FormItem, FormLayout, NumberPicker } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { FC, useMemo } from 'react';

import { FormilySelectableTable } from '@/components/formily/SelectableTable';

import { executeConfigurationSchema } from './schema';

type ExecuteConfigurationModalProps = {
  /** 控制弹窗显隐 */
  open: boolean;
  /** 关闭弹窗的方法 */
  onCancel: () => void;
  /** 弹窗确定按钮的方法 */
  onOk: (values: { countNum: number }) => void;
  /** 确定按钮的loading */
  confirmLoading?: boolean;
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    NumberPicker,
    FormLayout,
    FormilySelectableTable,
  },
});

export const ExecuteConfigurationModal: FC<ExecuteConfigurationModalProps> = ({
  open,
  onCancel,
  onOk,
  confirmLoading = false,
}) => {
  const form = useMemo(() => createForm(), [open]);

  return (
    <Modal
      title={I18N.carbonFootPrintLCA.executeConfiguration}
      open={open}
      confirmLoading={confirmLoading}
      maskClosable={false}
      width={440}
      onOk={async () => {
        const values = await form.submit<{ countNum: number }>();
        onOk(values);
      }}
      onCancel={onCancel}
      okText={I18N.base.confirm}
      cancelText={I18N.Factors.cancel}
    >
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField schema={executeConfigurationSchema()} />
      </Form>
    </Modal>
  );
};
