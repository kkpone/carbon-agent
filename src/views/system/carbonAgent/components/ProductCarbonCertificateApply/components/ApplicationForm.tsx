import I18N from '@src/lang/I18N';
import { DatePicker, Form, Input } from 'antd';
import type { FormInstance } from 'antd';
// eslint-disable-next-line import/no-extraneous-dependencies
import dayjs from 'dayjs';

import certificateCalendarIcon from '../assets/certificate-calendar-icon.svg';
import style from '../index.module.less';
import type { ProductCarbonCertificateFormValues } from '../types';

function FieldLabel({
  children,
  required = false,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <div className={style.fieldLabel}>
      {required ? <b aria-hidden='true'>*</b> : null}
      <span>{children}</span>
    </div>
  );
}

export function ApplicationForm({
  disabled,
  form,
  onValuesChange,
}: {
  disabled: boolean;
  form: FormInstance<ProductCarbonCertificateFormValues>;
  onValuesChange: (values: ProductCarbonCertificateFormValues) => void;
}) {
  const text = I18N.carbonAgent.certificateApplication;
  const accountingStartDate = Form.useWatch('accountingStartDate', form);
  const accountingEndDate = Form.useWatch('accountingEndDate', form);
  const requiredRule = (label: string) => ({
    message: I18N.template(text.requiredInput, { val1: label }),
    required: true,
    whitespace: true,
  });
  const requiredDateRule = (label: string) => ({
    message: I18N.template(text.requiredSelect, { val1: label }),
    required: true,
  });

  const updatePeriod = (
    field: 'accountingStartDate' | 'accountingEndDate',
    value: string,
  ) => {
    const nextValues = {
      ...form.getFieldsValue(),
      [field]: value,
    };

    form.setFieldValue(field, value);
    onValuesChange(nextValues);
  };

  return (
    <Form<ProductCarbonCertificateFormValues>
      className={style.form}
      disabled={disabled}
      form={form}
      layout='vertical'
      onValuesChange={(_, values) => onValuesChange(values)}
    >
      <Form.Item
        hidden
        name='accountingStartDate'
        rules={[requiredDateRule(text.accountingStartDate)]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        hidden
        name='accountingEndDate'
        rules={[requiredDateRule(text.accountingEndDate)]}
      >
        <Input />
      </Form.Item>

      <div className={style.fieldGroup}>
        <FieldLabel required>{text.productName}</FieldLabel>
        <div className={style.fieldPair}>
          <Form.Item
            name='productName'
            rules={[requiredRule(text.productName)]}
          >
            <Input placeholder={text.productName} />
          </Form.Item>
          <Form.Item
            name='productNameEn'
            rules={[requiredRule(text.productNameEn)]}
          >
            <Input placeholder={text.productNameEn} />
          </Form.Item>
        </div>
      </div>

      <div className={style.fieldGroup}>
        <FieldLabel required>{text.specification}</FieldLabel>
        <div className={style.fieldPair}>
          <Form.Item
            name='specification'
            rules={[requiredRule(text.specification)]}
          >
            <Input placeholder={text.specification} />
          </Form.Item>
          <Form.Item
            name='specificationEn'
            rules={[requiredRule(text.specificationEn)]}
          >
            <Input placeholder={text.specificationEn} />
          </Form.Item>
        </div>
      </div>

      <div className={style.fieldGroup}>
        <FieldLabel required>{text.applicantCompanyName}</FieldLabel>
        <div className={style.fieldPair}>
          <Form.Item
            name='applicantCompanyName'
            rules={[requiredRule(text.applicantCompanyName)]}
          >
            <Input placeholder={text.applicantCompanyName} />
          </Form.Item>
          <Form.Item
            name='companyNameEn'
            rules={[requiredRule(text.companyNameEn)]}
          >
            <Input placeholder={text.companyNameEn} />
          </Form.Item>
        </div>
      </div>

      <div className={style.fieldGroup}>
        <FieldLabel required>{text.companyAddress}</FieldLabel>
        <div className={style.fieldPair}>
          <Form.Item
            name='companyAddress'
            rules={[requiredRule(text.companyAddress)]}
          >
            <Input placeholder={text.companyAddress} />
          </Form.Item>
          <Form.Item
            name='companyAddressEn'
            rules={[requiredRule(text.companyAddressEn)]}
          >
            <Input placeholder={text.companyAddressEn} />
          </Form.Item>
        </div>
      </div>

      <div className={style.fieldGroup}>
        <FieldLabel required>{text.functionalUnit}</FieldLabel>
        <Form.Item
          name='functionalUnit'
          rules={[requiredRule(text.functionalUnit)]}
        >
          <Input placeholder={text.functionalUnit} />
        </Form.Item>
      </div>

      <div className={style.fieldGroup}>
        <FieldLabel required>{text.accountingPeriod}</FieldLabel>
        <div className={style.period}>
          <DatePicker
            allowClear={false}
            aria-label={text.accountingStartDate}
            disabled={disabled}
            disabledDate={date =>
              Boolean(
                accountingEndDate &&
                  date.format('YYYY-MM-DD') > accountingEndDate,
              )
            }
            format='YYYY-MM-DD'
            suffixIcon={
              <img
                alt=''
                aria-hidden='true'
                height={16}
                src={certificateCalendarIcon}
                width={16}
              />
            }
            value={accountingStartDate ? dayjs(accountingStartDate) : null}
            onChange={(_, dateString) =>
              updatePeriod('accountingStartDate', dateString as string)
            }
          />
          <span>{text.to}</span>
          <DatePicker
            allowClear={false}
            aria-label={text.accountingEndDate}
            disabled={disabled}
            disabledDate={date =>
              Boolean(
                accountingStartDate &&
                  date.format('YYYY-MM-DD') < accountingStartDate,
              )
            }
            format='YYYY-MM-DD'
            suffixIcon={
              <img
                alt=''
                aria-hidden='true'
                height={16}
                src={certificateCalendarIcon}
                width={16}
              />
            }
            value={accountingEndDate ? dayjs(accountingEndDate) : null}
            onChange={(_, dateString) =>
              updatePeriod('accountingEndDate', dateString as string)
            }
          />
        </div>
      </div>

      <div className={style.fieldGroup}>
        <FieldLabel>{text.unitEmission}</FieldLabel>
        <Form.Item className={style.modelFormItem} name='unitEmission'>
          <Input readOnly variant='borderless' />
        </Form.Item>
      </div>

      <div className={style.fieldGroup}>
        <FieldLabel>{text.accountingStandard}</FieldLabel>
        <Form.Item className={style.modelFormItem} name='accountingStandard'>
          <Input readOnly variant='borderless' />
        </Form.Item>
      </div>

      <div className={style.fieldGroup}>
        <FieldLabel>{text.certificateType}</FieldLabel>
        <Form.Item className={style.modelFormItem}>
          <Input
            readOnly
            value={text.certificateTypeValue}
            variant='borderless'
          />
        </Form.Item>
      </div>

      <div className={style.fieldGroup}>
        <FieldLabel>{text.accountingBoundary}</FieldLabel>
        <Form.Item className={style.modelFormItem} name='accountingBoundary'>
          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 3 }}
            readOnly
            variant='borderless'
          />
        </Form.Item>
      </div>
    </Form>
  );
}
