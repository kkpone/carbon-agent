import { Alert, Form, Input } from 'antd';

import I18N from '@src/lang/I18N';

interface JsonSectionEditorProps {
  name: string;
  label: string;
  description: string;
  disabled?: boolean;
}

const JsonSectionEditor = ({
  name,
  label,
  description,
  disabled,
}: JsonSectionEditorProps) => (
  <div>
    <Alert message={description} type='info' showIcon />
    <Form.Item
      name={name}
      label={label}
      rules={[
        {
          required: true,
          message: I18N.template(I18N.cbamOperationReport.requiredField, {
            field: label,
          }),
        },
        {
          validator: async (_, value?: string) => {
            if (!value?.trim()) return;
            try {
              const parsed: unknown = JSON.parse(value);
              if (
                !parsed ||
                Array.isArray(parsed) ||
                typeof parsed !== 'object'
              ) {
                throw new Error();
              }
            } catch {
              throw new Error(
                I18N.template(I18N.cbamOperationReport.invalidJsonObject, {
                  field: label,
                }),
              );
            }
          },
        },
      ]}
    >
      <Input.TextArea
        disabled={disabled}
        autoSize={{ minRows: 8, maxRows: 24 }}
      />
    </Form.Item>
  </div>
);

export default JsonSectionEditor;
