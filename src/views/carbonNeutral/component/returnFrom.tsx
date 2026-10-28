import { FC, CSSProperties } from 'react';
import { Form, FormInstance } from 'antd';
import { FormJson, ItemType } from '../type';
import {
  ComstomInput,
  ComstomInputNumber,
  ComstomDatePicker,
  ComstomRadio,
  ComstomSelect,
  ComstomCheckBox,
  ComstomAddTable,
  ComstomCascader,
  ComstomSuffixInput,
} from './From/FromList';

interface ReturnFromProps {
  form: FormInstance;
  listArr: FormJson[];
  layout?: 'vertical' | 'horizontal' | 'inline' | undefined;
  style?: CSSProperties;
  fromClassName?: string;
  changeDataValue?: (value: { [x: string]: any }) => void;
  dataValue?: { [x: string]: any };
}

const ReturnFrom: FC<ReturnFromProps> = ({
  form,
  layout = 'vertical',
  style,
  listArr,
  fromClassName,
  dataValue,
  changeDataValue,
}) => {
  // eslint-disable-next-line consistent-return
  const returnChildren = (item: ItemType) => {
    if (item.type === 'Input') {
      const { type, ...p } = item;
      return (
        <ComstomInput
          key={`${item.name}`}
          item={p}
          onChange={e => {
            if (changeDataValue) {
              changeDataValue({
                ...dataValue,
                [item.name]: e.target.value,
              });
            }
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              [item.name]: e.target.value,
            });
          }}
        />
      );
    }
    if (item.type === 'SuffixInput') {
      const { type, ...p } = item;
      return (
        <ComstomSuffixInput
          key={`${item.name}`}
          item={p}
          onChange={e => {
            if (changeDataValue) {
              changeDataValue({
                ...dataValue,
                [item.name]: e,
              });
            }
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              [item.name]: e,
            });
          }}
        />
      );
    }
    if (item.type === 'InputNumber') {
      return (
        <ComstomInputNumber
          item={item}
          key={`${item.name}`}
          onChange={e => {
            if (changeDataValue) {
              changeDataValue({
                ...dataValue,
                [item.name]: e,
              });
            }
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              [item.name]: e,
            });
          }}
        />
      );
    }
    if (item.type === 'DatePicker') {
      return <ComstomDatePicker key={`${item.name}`} item={item} />;
    }
    if (item.type === 'RadioGroup') {
      return (
        <ComstomRadio
          item={item}
          key={`RadioGroup-${item.name}`}
          onChange={e => {
            if (changeDataValue) {
              changeDataValue({
                ...dataValue,
                [item.name]: e.target.value,
              });
            }
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              [item.name]: e.target.value,
            });
          }}
        />
      );
    }
    if (item.type === 'Select') {
      return (
        <ComstomSelect
          item={item}
          key={`Select-${item.name}`}
          onChange={e => {
            if (['heatingWayFormat', 'coolWay'].indexOf(item.name) >= 0) {
              // 找出 option
              const objArr = item.options.filter(item => item.dictValue === e);
              if (changeDataValue) {
                changeDataValue({
                  ...dataValue,
                  [item.name === 'heatingWayFormat' ? 'heatingCop' : 'coolCop']:
                    objArr[0]?.relatedValue ? objArr[0]?.relatedValue : '',
                  [item.name]: e,
                });
              }
              form.setFieldsValue({
                ...form.getFieldsValue(true),
                [item.name === 'heatingWayFormat' ? 'heatingCop' : 'coolCop']:
                  objArr[0]?.relatedValue ? objArr[0]?.relatedValue : '',
                [item.name]: e,
              });
              return;
              // heatingCop
            }
            if (changeDataValue) {
              changeDataValue({
                ...dataValue,
                [item.name]: e,
              });
            }
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              [item.name]: e,
            });
          }}
        />
      );
    }
    if (item.type === 'Cascader') {
      return (
        <ComstomCascader
          item={item}
          onChange={(e, options) => {
            if (['heatingWayFormat'].indexOf(item.name) >= 0) {
              // 找出 option
              if (changeDataValue) {
                changeDataValue({
                  ...dataValue,
                  [item.name === 'heatingWayFormat' ? 'heatingCop' : 'coolCop']:
                    options[1]?.relatedValue ? options[1]?.relatedValue : '',
                  [item.name]: e,
                });
              }
              form.setFieldsValue({
                ...form.getFieldsValue(true),
                [item.name === 'heatingWayFormat' ? 'heatingCop' : 'coolCop']:
                  options[1]?.relatedValue ? options[1]?.relatedValue : '',
                [item.name]: e,
              });

              // heatingCop
            }
          }}
        />
      );
    }
    // if (item.type === 'TextArea') {
    //   return <ComstomTextArea item={item} />;
    // }
    if (item.type === 'CheckBox') {
      return <ComstomCheckBox key={`${item.name}`} item={item} />;
    }
    if (item.type === 'addTable') {
      return <ComstomAddTable key={`${item.name}`} item={item} />;
    }
  };
  const returnFromList = (item: FormJson, index: number) => {
    switch (item.type) {
      case 'addTable':
        return (
          <div key={index} className={item.className}>
            {returnChildren(item)}
          </div>
        );
      default:
        return (
          <Form.Item
            colon={false}
            name={item.name}
            label={item.label}
            labelAlign='right'
            rules={item.require}
            className={item.className}
            tooltip={item.tooltip}
            key={`${index}`}
            style={{ width: '100%' }}
          >
            {returnChildren(item)}
          </Form.Item>
        );
    }
  };
  const returnListArr = () =>
    listArr.map((item: FormJson, index) => returnFromList(item, index));
  return (
    <Form className={fromClassName} form={form} layout={layout} style={style}>
      {returnListArr()}
    </Form>
  );
};

export default ReturnFrom;
