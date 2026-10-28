/* eslint-disable react/no-array-index-key */
import I18N from '@src/lang/I18N';
import {
  EnvironmentOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { FormItem } from '@formily/antd-v5';
import { ArrayField as ArrayFieldType } from '@formily/core';
import { Field, useField, observer } from '@formily/react';
import { Button } from 'antd';

import AddressSelect from '@/components/formily/components/AdressSelect';

import styles from './index.module.less';

const AddressList = observer(() => {
  const field = useField<ArrayFieldType>();
  const { value = [] } = field;

  return (
    <>
      <div>
        {field.value?.map((_, index) => (
          <div className={styles.addressContent} key={index}>
            <Field
              name={index}
              required
              decorator={[FormItem, { className: styles.addressFormItem }]}
              component={[
                AddressSelect,
                {
                  className: styles.address,
                  objectValue: true,
                  suffixIcon: <EnvironmentOutlined />,
                },
              ]}
              reactions={addrField => {
                addrField.setComponentProps({
                  prefix: (
                    <div className={styles.prefix}>
                      <span>{I18N.productDigitalPassport.address}</span>
                      <span>{addrField.index + 1}</span>
                    </div>
                  ),
                });
              }}
            />
            {value.length > 1 && (
              <MinusCircleOutlined
                className={styles.removeIcon}
                onClick={() => field.remove(index)}
              />
            )}
          </div>
        ))}
      </div>
      <Button
        size='small'
        icon={<PlusOutlined />}
        onClick={() => {
          field.push({});
        }}
      >
        {I18N.questionnaire.addAddress}
      </Button>
    </>
  );
});

export default AddressList;
