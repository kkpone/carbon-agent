import I18N from '@src/lang/I18N';
import { Button, Form, Input, Modal } from 'antd';
import { FC, useState } from 'react';

import styles from './RoleModal.module.less';
import { translateText } from './service';

type RoleModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: (data: { role: string; roleEn: string }) => void;
};
const RoleModal: FC<RoleModalProps> = ({ open, onCancel, onConfirm }) => {
  const [form] = Form.useForm<{ role: string; roleEn: string }>();

  const [transLoading, setTransLoading] = useState(false);

  const submit = async () => {
    const val = await form.validateFields();
    onConfirm(val);
  };

  const translate = async () => {
    const text = (form.getFieldValue('role') as string)?.trim();
    try {
      setTransLoading(true);
      if (text) {
        const { data } = await translateText({
          fromLang: 'zh',
          toLang: 'en',
          text,
        });
        form.setFieldsValue({ roleEn: data.data });
      }
    } finally {
      setTransLoading(false);
    }
  };

  return (
    <Modal
      title={I18N.auth.addRole}
      width={460}
      open={open}
      onClose={onCancel}
      onCancel={onCancel}
      onOk={submit}
      afterClose={() => {
        form.resetFields();
      }}
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          name='role'
          label={<div className={styles.label}>{I18N.dashborad.roleName}</div>}
          rules={[{ required: true, message: I18N.auth.pleaseEnterTheRole }]}
        >
          <Input placeholder={I18N.auth.pleaseEnterTheRole} />
        </Form.Item>
        <Form.Item
          name='roleEn'
          className={styles.formItem}
          label={
            <div className={styles.label}>
              {I18N.esg.englishTranslation}
              <Button
                className={styles.transBtn}
                type='link'
                loading={transLoading}
                onClick={translate}
              >
                {I18N.esg.automaticTranslation}
              </Button>
            </div>
          }
          rules={[{ required: true, message: I18N.esg.pleaseEnterEnglish }]}
        >
          <Input placeholder={I18N.esg.pleaseEnterEnglish} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleModal;
