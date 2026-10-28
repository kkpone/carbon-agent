/**
 * @description 保存过程集到库弹窗
 */

import { Form, FormItem, FormLayout, Input, Radio } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { FC, useEffect, useMemo } from 'react';

import { useLcaEnums } from '@/views/carbonFootPrintLCA/hook';

import styles from './index.module.less';
import { saveProcessLibrarySchema } from './schema';
import { SaveProcessToLibRequest } from '../../type';

type SaveProcessToLibraryProps = {
  /** 控制弹窗显隐 */
  open: boolean;
  /** 关闭弹窗的方法 */
  onCancel: () => void;
  /** 弹窗确定按钮的方法 */
  onOk: (values: SaveProcessToLibRequest) => void;
  /** 确定按钮的loading */
  confirmLoading?: boolean;
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    FormLayout,
    Radio,
  },
});

export const SaveProcessToLibraryModal: FC<SaveProcessToLibraryProps> = ({
  open,
  onCancel,
  onOk,
  confirmLoading = false,
}) => {
  const processLibTypeOptions = useLcaEnums('ProcessLibType');

  const form = useMemo(() => createForm(), [open]);

  useEffect(() => {
    /** 保存过程集方式 */
    if (processLibTypeOptions) {
      form.setFieldState('processLibType', {
        dataSource: processLibTypeOptions?.map(libType => ({
          label: libType.name,
          value: libType.code,
        })),
      });
    }
  }, [processLibTypeOptions, open]);

  return (
    <Modal
      title={I18N.carbonFootPrintLCA.saveProcessSet}
      open={open}
      confirmLoading={confirmLoading}
      maskClosable={false}
      width={440}
      onOk={async () => {
        const values = await form.submit<SaveProcessToLibRequest>();
        onOk(values);
      }}
      onCancel={onCancel}
      okText={I18N.base.confirm}
      cancelText={I18N.Factors.cancel}
    >
      <div>{I18N.carbonFootPrintLCA.canSaveCurrent}</div>
      <div className={styles.mainTips}>
        <div>
          <span className={styles.tipTitle}>
            {I18N.carbonFootPrintLCA.interceptUpstreamPassage}
          </span>
          {I18N.carbonFootPrintLCA.theCurrentProcessTakes}
          <span className='warnRed'>{I18N.carbonFootPrintLCA.downstream}</span>
          {I18N.carbonFootPrintLCA.correlation}
        </div>
        <div>
          <span className={styles.tipTitle}>
            {I18N.carbonFootPrintLCA.downstreamProcessSet}
          </span>
          {I18N.carbonFootPrintLCA.theCurrentProcessTakes}
          <span className='warnRed'>{I18N.carbonFootPrintLCA.upstream}</span>
          {I18N.carbonFootPrintLCA.correlation}
        </div>
        <div>
          <span className={styles.tipTitle}>
            {I18N.carbonFootPrintLCA.unitProcess}
          </span>
          {I18N.carbonFootPrintLCA.theCurrentProcessTakes}
          <span className='warnRed'>
            {I18N.carbonFootPrintLCA.upstreamAndDownstream}
          </span>
          {I18N.carbonFootPrintLCA.correlation}
        </div>
      </div>
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField schema={saveProcessLibrarySchema()} />
      </Form>
    </Modal>
  );
};
