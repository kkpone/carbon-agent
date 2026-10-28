/**
 * @description 新建评价方案弹窗
 */

import { Form, FormItem, FormLayout, Input, Select } from '@formily/antd-v5';
import { createForm, onFieldValueChange } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { compact } from 'lodash-es';
import { FC, useEffect, useMemo } from 'react';

import { FormilySelectableTable } from '@/components/formily/SelectableTable';
import { useAllEnumsBatch } from '@/hooks';
import { handleAssessmentProposalOptions } from '@/utils';

import styles from './index.module.less';
import { impactAssessmentSchema, assessmentTargetSchema } from './schema';
import { ImpactAssessmentPlanRequest } from '../../type';

type ImpactAssessmentModalProps = {
  /** 控制弹窗显隐 */
  open: boolean;
  /** 关闭弹窗的方法 */
  onCancel: () => void;
  /** 弹窗确定按钮的方法 */
  onOk: (values: ImpactAssessmentPlanRequest) => void;
  /** 确定按钮的loading */
  confirmLoading?: boolean;
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    FormLayout,
    Select,
    FormilySelectableTable,
  },
});

export const ImpactAssessmentModal: FC<ImpactAssessmentModalProps> = ({
  open,
  onCancel,
  onOk,
  confirmLoading = false,
}) => {
  const enumOptions = useAllEnumsBatch('AssessmentProposal');

  /** lca评价方案 */
  const assessmentMethodOptions = enumOptions?.AssessmentProposal;

  const form = useMemo(
    () =>
      createForm({
        effects: () => {
          /** 切换评价方法处理评价指标 */
          onFieldValueChange('assessmentMethod', field => {
            /** 切换评价方法时清空评价指标的值 */
            form.reset('assessmentTargetList');

            const { value, dataSource } = field;

            /** 评价指标 */
            const targetOption =
              dataSource?.filter(d => d.value === value)?.[0]?.children || [];

            /** 全部评价指标的key */
            const allTargetOptionKey = compact(
              targetOption?.map(item => item.value),
            );

            /** 重新赋dataSource */
            form.setFieldState('assessmentTargetList', {
              dataSource: targetOption,
            });

            /** 评价指标默认全选 */
            form.setValuesIn('assessmentTargetList', allTargetOptionKey);
          });
        },
      }),
    [open],
  );

  useEffect(() => {
    /** 评价方法 */
    if (assessmentMethodOptions) {
      form.setFieldState('assessmentMethod', {
        dataSource: handleAssessmentProposalOptions(
          enumOptions?.AssessmentProposal,
        ),
      });
    }
  }, [assessmentMethodOptions, open]);

  return (
    <Modal
      title={I18N.carbonFootPrintLCA.newScheme}
      open={open}
      confirmLoading={confirmLoading}
      maskClosable={false}
      width={440}
      onOk={async () => {
        const values = await form.submit<ImpactAssessmentPlanRequest>();
        onOk(values);
      }}
      onCancel={onCancel}
      okText={I18N.base.confirm}
      cancelText={I18N.Factors.cancel}
    >
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField schema={impactAssessmentSchema()} />
        <div className={styles.tip}>
          {I18N.carbonFootPrintLCA.impactAssessmentModalTip}
        </div>
        <SchemaField schema={assessmentTargetSchema()} />
      </Form>
    </Modal>
  );
};
