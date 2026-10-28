import I18N from '@src/lang/I18N';
import { Cascader, Form, Modal, Select } from 'antd';
import { FC, useEffect, useState } from 'react';

import { getOrgList } from './service';
import { Org } from '../type';

const OrgModal: FC<{
  open: boolean;
  yearList: string[];
  onConfirm: (val: {
    calculatePeriod: string;
    orgId: number;
  }) => void | Promise<void>;
  onCancel: () => void;
}> = ({ open, yearList, onConfirm, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [orgList, setOrgList] = useState<Org[]>([]);

  const onYearChange = async (cYear: string) => {
    const { data } = await getOrgList({ cYear });
    form.setFieldsValue({ orgId: undefined });
    setOrgList(data.data);
  };

  const submit = async () => {
    try {
      setLoading(true);
      const val = await form.validateFields();
      await onConfirm({
        ...val,
        orgId: [
          ...((val as { calculatePeriod: string; orgId: number[] }).orgId ||
            []),
        ].pop(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.resetFields();
  }, [open, form]);

  useEffect(() => {
    setOrgList([]);
  }, [open]);

  return (
    <Modal
      title={I18N.supplyChain.chooseAccounting}
      width={460}
      open={open}
      okButtonProps={{ loading }}
      onCancel={onCancel}
      onOk={submit}
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          name='calculatePeriod'
          label={I18N.carbonFootprint3.accountingYear2}
          rules={[{ required: true }]}
        >
          <Select
            style={{ width: '100%' }}
            placeholder={I18N.carbonFootprint.pleaseSelect}
            options={yearList.map(year => ({ value: year, label: year }))}
            onChange={onYearChange}
          />
        </Form.Item>
        <Form.Item
          name='orgId'
          label={I18N.eca.accountingOrganization}
          rules={[{ required: true }]}
        >
          <Cascader
            style={{ width: '100%' }}
            placeholder={I18N.carbonFootprint.pleaseSelect}
            options={orgList}
            fieldNames={{ value: 'id', label: 'name' }}
            changeOnSelect
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrgModal;
