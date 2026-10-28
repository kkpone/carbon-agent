/**
 * @description 过程删除弹窗
 */

import { Form, FormItem, FormLayout, Input, Select } from '@formily/antd-v5';
import { createForm, onFieldValueChange } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { Modal } from 'antd';
import { FC, useMemo } from 'react';

import I18N from '@/lang/I18N';

import styles from './index.module.less';
import { processDelSchema } from './schema';

type ProcessDeleteProps = {
  /** 控制弹窗显隐 */
  open: boolean;
  /** 关闭弹窗的方法 */
  onCancel: () => void;
  /** 弹窗确定按钮的方法 */
  onOk: (values: { inputText: string }) => void;
  /** 过程名称 */
  processName?: string;
  /** 确定按钮的loading */
  confirmLoading?: boolean;
};

export const ProcessDeleteModal: FC<ProcessDeleteProps> = ({
  open,
  onCancel,
  onOk,
  processName,
  confirmLoading = false,
}) => {
  const SchemaField = createSchemaField({
    components: {
      FormItem,
      Input,
      FormLayout,
      Select,
    },
  });

  const form = useMemo(
    () =>
      createForm({
        effects: () => {
          onFieldValueChange('inputText', field => {
            if (
              !field.value ||
              field.value === I18N.carbonFootPrintLCA.confirmDeletion
            ) {
              form.setFieldState('inputText', {
                selfErrors: undefined,
              });
            }
          });
        },
      }),
    [open],
  );

  return (
    <Modal
      title={I18N.Factors.prompt}
      open={open}
      maskClosable={false}
      width={440}
      confirmLoading={confirmLoading}
      onOk={async () => {
        const values = await form.submit<{ inputText: string }>();
        const { inputText } = values;
        if (inputText !== I18N.carbonFootPrintLCA.confirmDeletion) {
          form.setFieldState('inputText', {
            selfErrors: [I18N.carbonFootPrintLCA.incorrectInput],
          });
        } else {
          form.setFieldState('inputText', {
            selfErrors: undefined,
          });
          onOk(values);
        }
      }}
      onCancel={onCancel}
      okText={I18N.base.confirm}
      cancelText={I18N.Factors.cancel}
    >
      <div>
        {I18N.carbonFootPrintLCA.deleteProcess}
        {processName} ？
        <span className='warnRed'>
          {I18N.carbonFootPrintLCA.afterDeletionAll}
        </span>
      </div>
      <div className={styles.input}>
        {I18N.carbonFootPrintLCA.pleaseEnterBelow}
        <span>“{I18N.carbonFootPrintLCA.confirmDeletion}”</span>
      </div>
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField schema={processDelSchema()} />
      </Form>
    </Modal>
  );
};
