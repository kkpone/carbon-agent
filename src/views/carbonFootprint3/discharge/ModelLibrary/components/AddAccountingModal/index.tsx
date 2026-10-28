import I18N from '@src/lang/I18N';
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Upload,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { CreateAccountingForm, ModelItem } from '../../type';

const { RangePicker } = DatePicker;

interface AddAccountingModalProps {
  open: boolean;
  model?: ModelItem;
  onOk: (values: CreateAccountingForm & { modelId: number }) => void;
  onCancel: () => void;
}

const AddAccountingModal: React.FC<AddAccountingModalProps> = ({
  open,
  model,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    const { accountingPeriod, ...rest } = values;
    if (model) {
      onOk({
        ...rest,
        modelId: model.id,
        startDate: accountingPeriod?.[0]?.format('YYYY-MM-DD'),
        endDate: accountingPeriod?.[1]?.format('YYYY-MM-DD'),
      });
    }
  };

  return (
    <Modal
      title={I18N.carbonFootprint3.addAccounting}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout='vertical' preserve={false}>
        <Form.Item
          name='productId'
          label={I18N.carbonFootprint.productName}
          rules={[
            {
              required: true,
              message: I18N.carbonFootprint3.pleaseSelectAProduct,
            },
          ]}
        >
          <Select
            showSearch
            placeholder={I18N.carbonFootprint3.pleaseSelectAProduct}
            filterOption={(input, option) =>
              (option?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            options={[]}
          />
        </Form.Item>
        <Form.Item
          name='quantity'
          label={I18N.carbonFootprint.accountingQuantity}
          rules={[
            {
              required: true,
              message: I18N.carbonFootprint.pleaseEnterTheAccounting,
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            placeholder={I18N.carbonFootprint.pleaseEnterTheAccounting}
            addonAfter={
              <Form.Item name='unitCode' noStyle>
                <Select
                  style={{ width: 80 }}
                  placeholder={I18N.carbonFootprint.unit}
                  options={[]}
                />
              </Form.Item>
            }
          />
        </Form.Item>
        <Form.Item
          name='functionalUnit'
          label={I18N.carbonFootprint3.functionalUnits}
          rules={[
            {
              required: true,
              message: I18N.carbonFootprint3.pleaseEnterTheFunction,
            },
          ]}
        >
          <Input placeholder={I18N.carbonFootprint3.pleaseEnterTheFunction} />
        </Form.Item>
        <Form.Item
          name='accountingPeriod'
          label={I18N.carbonFootprint.accountingCycle}
          rules={[
            {
              required: true,
              message: I18N.enterpriseCarbonAccount2.pleaseSelectAccounting3,
            },
          ]}
        >
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label={I18N.carbonFootprint3.accountingMethod}>
          <Input value={model?.accountingMethodName} disabled />
        </Form.Item>
        <Form.Item label={I18N.carbonFootprint.systemBoundary}>
          <Input value={model?.systemBoundaryName} disabled />
        </Form.Item>
        <Form.Item
          name='flowChartFiles'
          label={I18N.carbonFootprint3.systemBoundaryWorker}
        >
          <Upload
            listType='picture-card'
            maxCount={5}
            accept='.png,.jpg,.jpeg'
            beforeUpload={() => false}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>{I18N.auth.upload}</div>
            </div>
          </Upload>
          <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
            {I18N.carbonFootprint3.supportPng10}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddAccountingModal;
