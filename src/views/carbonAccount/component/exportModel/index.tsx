/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-12-08 10:10:51
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-08 18:37:04
 */
/**
 * @file 导出弹窗
 */
// import { memo, useEffect, useRef, useState } from 'react';
// import classNames from 'classnames';

import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { ButtonProps, Form, Input, Modal } from 'antd';
import moment from 'moment';
import { useEffect } from 'react';

import style from './index.module.less';

function ExportModel({
  showModel,
  exportDesc,
  okButtonProps,
  handelOk,
  handelCancel,
  title,
}: {
  showModel: boolean;
  okButtonProps?: ButtonProps;
  exportDesc?: React.ReactNode;
  handelOk: (value: string) => void;
  handelCancel: () => void;
  title: string;
}) {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({
      fileName: `${title} ${moment().format('YYYY-MM-DD HH:mm:ss')}.xlsx`,
    });
  }, [showModel]);
  return (
    <Modal
      width={480}
      className={style.modalBox}
      open={showModel}
      title={title}
      okButtonProps={okButtonProps}
      onOk={() => {
        form.validateFields().then(value => {
          if (
            !value.fileName?.includes('.xlsx') &&
            !value.fileName?.includes('.xls')
          ) {
            Toast('warn', I18N.carbonAccount.fillInExc);
            return;
          }
          handelOk(value);
        });
      }}
      onCancel={() => handelCancel()}
    >
      <Form form={form} layout='vertical'>
        {exportDesc}
        <Form.Item
          rules={[
            { required: true, message: I18N.carbonAccount.theNameCannotBe },
          ]}
          name='fileName'
          label={I18N.carbonFootprint.fileName}
          key={I18N.carbonFootprint.fileName}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ExportModel;
