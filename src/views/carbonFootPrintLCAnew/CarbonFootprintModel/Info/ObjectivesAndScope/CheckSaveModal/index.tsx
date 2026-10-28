/**
 * @description 目标与范围保存下一步校验弹窗
 */

import { Form, FormItem, FormLayout, Input, Select } from '@formily/antd-v5';
import { createForm, onFieldValueChange } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { Modal } from 'antd';
import { FC, useMemo, useState } from 'react';

import I18N from '@/lang/I18N';
import { modelFooterBtnStyle } from '@/utils';

import styles from './index.module.less';
import { systemSchema } from './schemas';

type CheckSaveProps = {
  /** 控制弹窗显隐 */
  open: boolean;
  /** 校验弹窗消息 */
  checkModalInfo: {
    funUnitChanged: boolean;
    systemChanged: boolean;
  };
  /** 关闭弹窗的方法 */
  onCancel: () => void;
  /** 弹窗确定按钮的方法 */
  onOk: () => void;
  /** 确定按钮的loading */
  confirmLoading?: boolean;
};

export const CheckSaveModal: FC<CheckSaveProps> = ({
  open,
  checkModalInfo,
  onCancel,
  onOk,
  confirmLoading = false,
}) => {
  const { funUnitChanged, systemChanged } = checkModalInfo;

  const SchemaField = createSchemaField({
    components: {
      FormItem,
      Input,
      FormLayout,
      Select,
    },
  });

  const checkForm = useMemo(
    () =>
      createForm({
        effects: () => {
          onFieldValueChange('inputText', field => {
            if (
              !field.value ||
              field.value === I18N.carbonFootPrintLCA.confirm1
            ) {
              checkForm.setFieldState('inputText', {
                selfErrors: undefined,
              });
            }
          });
        },
      }),
    [open],
  );

  /** 功能单位和系统边界都改变了的校验弹窗显隐 */
  const [openCheckModal, setOpenCheckModal] = useState(true);

  /** 功能单位和系统边界都改变了 则先弹系统边界的弹窗 */
  if (funUnitChanged && systemChanged) {
    return (
      <Modal
        title={I18N.Factors.prompt}
        open={open && openCheckModal}
        centered
        maskClosable={false}
        width={440}
        confirmLoading={confirmLoading}
        onOk={async () => {
          const values = await checkForm.submit<{ inputText: string }>();
          try {
            const { inputText } = values;
            if (inputText !== I18N.carbonFootPrintLCA.confirm1) {
              checkForm.setFieldState('inputText', {
                selfErrors: [I18N.carbonFootPrintLCA.incorrectInput],
              });
            } else {
              checkForm.setFieldState('inputText', {
                selfErrors: undefined,
              });
              /** 关闭系统校验弹窗 */
              setOpenCheckModal(false);
              /** 确认后再弹系统边界的弹窗 */
              Modal.confirm({
                title: I18N.Factors.prompt,
                icon: '',
                content: (
                  <span>
                    <span className='warnRed'>
                      {I18N.carbonFootPrintLCA.takeCare}
                    </span>
                    {I18N.carbonFootPrintLCA.modifyEachFunction}
                  </span>
                ),
                ...modelFooterBtnStyle,
                okText: I18N.base.confirm,
                cancelText: I18N.Factors.cancel,
                onCancel: () => {
                  onCancel();
                  /** 重置openCheckModal-防止第二个弹窗点击取消后 再点击保存无反应 */
                  setOpenCheckModal(true);
                },
                onOk,
              });
            }
          } catch (error) {
            //
          }
        }}
        onCancel={onCancel}
        okText={I18N.base.confirm}
        cancelText={I18N.Factors.cancel}
      >
        <div>
          <span className='warnRed'>{I18N.carbonFootPrintLCA.takeCare}</span>
          <span>{I18N.carbonFootPrintLCA.changeDetected}</span>
        </div>
        <div className={styles.input}>
          {I18N.carbonFootPrintLCA.pleaseEnterBelow}
          <span>“{I18N.carbonFootPrintLCA.confirm1}”</span>
        </div>
        <Form form={checkForm} previewTextPlaceholder='-'>
          <SchemaField schema={systemSchema()} />
        </Form>
      </Modal>
    );
  }

  /** 功能单位改变 系统边界不变 */
  if (funUnitChanged && !systemChanged) {
    return (
      <Modal
        title={I18N.Factors.prompt}
        open={open}
        centered
        maskClosable={false}
        width={440}
        confirmLoading={confirmLoading}
        onOk={onOk}
        onCancel={onCancel}
        okText={I18N.base.confirm}
        cancelText={I18N.Factors.cancel}
      >
        <span>
          <span className='warnRed'>{I18N.carbonFootPrintLCA.takeCare}</span>
          {I18N.carbonFootPrintLCA.modifyEachFunction}
        </span>
      </Modal>
    );
  }

  /** 功能单位不变 系统边界改变 */
  return (
    <Modal
      title={I18N.Factors.prompt}
      open={open}
      centered
      maskClosable={false}
      width={440}
      confirmLoading={confirmLoading}
      onOk={async () => {
        const values = await checkForm.submit<{ inputText: string }>();
        const { inputText } = values;
        if (inputText !== I18N.carbonFootPrintLCA.confirm1) {
          checkForm.setFieldState('inputText', {
            selfErrors: [I18N.carbonFootPrintLCA.incorrectInput],
          });
        } else {
          checkForm.setFieldState('inputText', {
            selfErrors: undefined,
          });
          onOk();
        }
      }}
      onCancel={onCancel}
      okText={I18N.base.confirm}
      cancelText={I18N.Factors.cancel}
    >
      <div>
        <span className='warnRed'>{I18N.carbonFootPrintLCA.takeCare}</span>
        <span>{I18N.carbonFootPrintLCA.changeDetected}</span>
      </div>
      <div className={styles.input}>
        {I18N.carbonFootPrintLCA.pleaseEnterBelow}
        <span>“{I18N.carbonFootPrintLCA.confirm1}”</span>
      </div>
      <Form form={checkForm} previewTextPlaceholder='-'>
        <SchemaField schema={systemSchema()} />
      </Form>
    </Modal>
  );
};
