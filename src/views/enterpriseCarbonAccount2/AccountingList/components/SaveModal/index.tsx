/* eslint-disable @typescript-eslint/no-unused-vars */
import { QuestionCircleOutlined } from '@ant-design/icons';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import I18N from '@src/lang/I18N';
import { GWPinfo } from '@src/views/enterpriseCarbonAccount2/listInfo/util';
import { Modal, Tooltip, Form } from 'antd';
import { FC, useEffect, useState } from 'react';

import { OrgAccount } from '../../type';

type SaveModalProps = {
  visible: boolean;
  accountTask?: OrgAccount | null;
  onCancel: () => void;
  onConfirm: (data: Record<string, any>) => Promise<void> | void;
};
const SaveModal: FC<SaveModalProps> = ({
  visible,
  accountTask,
  onCancel,
  onConfirm,
}) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && accountTask) {
      const { name, gwp } = accountTask;
      form.setFieldsValue({
        name,
        gwp,
        quantization: ['0'],
      });
    }
  }, [visible, accountTask, form]);

  return (
    <Modal
      open={visible}
      width={600}
      title={I18N.carbonFootprint3.saveAsAccounting}
      okButtonProps={{ loading }}
      onCancel={onCancel}
      onOk={async () => {
        if (accountTask) {
          setLoading(true);
          try {
            const values = await form.validateFields();
            const { name, gwp, description, quantization } = values;
            const { computationId, computationPeriod } = accountTask;
            await onConfirm({
              computationId,
              name,
              gwp,
              description,
              period: computationPeriod,
              quantization: (quantization as string[]).join(','),
            });
          } finally {
            setLoading(false);
          }
        }
      }}
    >
      <FormItemUtil
        antdFormProps={{
          ...formPropsInit(),
          form,
          layout: 'vertical',
          labelCol: { span: 24 },
          wrapperCol: { span: 24 },
        }}
        formItems={[
          {
            label: I18N.carbonFootprint.modelName,
            name: 'name',
            type: 'input',
            rules: true,
            padding: '0',
            placeholder: I18N.carbonFootprint.pleaseEnter,
            col: 24,
            props: {
              maxLength: 50,
            },
          },
          {
            label: I18N.enterpriseCarbonAccount2.quantitativeMethods,
            name: 'quantization',
            type: 'checkbox',
            rules: true,
            placeholder: I18N.carbonFootprint.pleaseEnter,
            col: 24,
            padding: '0',
            props: {
              disabled: true,
              options: [
                {
                  value: '0',
                  label: I18N.enterpriseCarbonAccount2.emissionFactorMethod,
                },
                {
                  value: '1',
                  label: I18N.enterpriseCarbonAccount2.materialBalanceMethod,
                },
              ],
            },
          },
          // {
          //   label: (
          //     <div>
          //       <Tooltip title={I18N.enterpriseCarbonAccount2.gwpRefersTo}>
          //         {I18N.enterpriseCarbonAccount2.gwpInformation}
          //         <QuestionCircleOutlined />
          //       </Tooltip>
          //     </div>
          //   ),
          //   name: 'gwp',
          //   type: 'select',
          //   padding: '0',
          //   rules: true,
          //   placeholder: I18N.carbonFootprint.pleaseEnter,
          //   col: 24,
          //   props: {
          //     options: GWPinfo,
          //   },
          //   rulesCustom: [
          //     {
          //       required: true,
          //       message: I18N.enterpriseCarbonAccount2.pleaseSelectGw,
          //     },
          //   ],
          // },
          {
            label: I18N.enterpriseCarbonAccount2.modelIntroduction,
            name: 'description',
            type: 'textArea',
            padding: '0',
            rules: false,
            placeholder: I18N.carbonFootprint.pleaseEnter,
            col: 24,
            props: {
              rows: 4,
              style: { maxHeight: 200 },
            },
          },
        ]}
        paddRight={30}
      />
    </Modal>
  );
};

export default SaveModal;
