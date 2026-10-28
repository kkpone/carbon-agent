import I18N from '@src/lang/I18N';
import { Form, Input, Modal } from 'antd';
import { useEffect, useState } from 'react';

import { IndustryCategory, IndustryCategoryForm } from '../../type';

interface IndustryCategoryModalProps {
  open: boolean;
  editCategory?: IndustryCategory;
  onOk: (values: IndustryCategoryForm) => void | Promise<void>;
  onCancel: () => void;
}

const IndustryCategoryModal: React.FC<IndustryCategoryModalProps> = ({
  open,
  editCategory,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm<IndustryCategoryForm>();
  const isEdit = !!editCategory;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && editCategory) {
      form.setFieldsValue({ ...editCategory });
    } else if (open) {
      form.resetFields();
    }
  }, [open, editCategory, form]);

  const handleOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      await onOk(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        isEdit
          ? I18N.carbonFootprint3.editingIndustryCategory
          : I18N.carbonFootprint3.newIndustryCategory
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okButtonProps={{ loading }}
      destroyOnClose
    >
      <Form form={form} layout='vertical' preserve={false}>
        <Form.Item
          name='name'
          label={I18N.carbonFootprint3.industryCategoryName}
          rules={[
            {
              required: true,
              message: I18N.carbonFootprint3.pleaseEnterIndustry,
            },
          ]}
        >
          <Input
            maxLength={100}
            placeholder={I18N.carbonFootprint3.pleaseEnterIndustry}
          />
        </Form.Item>
        <Form.Item name='remark' label={I18N.carbonFootprint.remarks}>
          <Input.TextArea
            maxLength={200}
            rows={3}
            placeholder={I18N.eca.pleaseEnterANote}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default IndustryCategoryModal;
