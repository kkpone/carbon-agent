import I18N from '@src/lang/I18N';
import { Button, Form, Input, Modal } from 'antd';
import { FC, useState } from 'react';

import styles from './QuestionModal.module.less';
import { translateText } from './service';

type QuestionModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: (data: { question: string; questionEn: string }) => void;
};
const QuestionModal: FC<QuestionModalProps> = ({
  open,
  onCancel,
  onConfirm,
}) => {
  const [form] = Form.useForm<{ question: string; questionEn: string }>();

  const [transLoading, setTransLoading] = useState(false);

  const submit = async () => {
    const val = await form.validateFields();
    onConfirm(val);
  };

  const translate = async () => {
    const text = (form.getFieldValue('question') as string)?.trim();
    try {
      setTransLoading(true);
      if (text) {
        const { data } = await translateText({
          fromLang: 'zh',
          toLang: 'en',
          text,
        });
        form.setFieldsValue({ questionEn: data.data });
      }
    } finally {
      setTransLoading(false);
    }
  };

  return (
    <Modal
      title={I18N.esg.addQuestion}
      width={660}
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
          name='question'
          label={<div className={styles.label}>{I18N.esg.problem}</div>}
          rules={[{ required: true, message: I18N.esg.pleaseEnterTheQuestion }]}
        >
          <Input placeholder={I18N.esg.pleaseEnterTheQuestion} />
        </Form.Item>
        <Form.Item
          name='questionEn'
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

export default QuestionModal;
