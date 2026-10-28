import I18N from '@src/lang/I18N';
import { FC, CSSProperties, ReactNode } from 'react';
import {
  Form,
  FormInstance,
  FormItemProps,
  InputProps,
  InputNumberProps,
  SelectProps,
  RadioGroupProps,
  CheckboxProps,
  DatePickerProps,
  UploadProps,
  TableProps,
  TreeSelectProps,
  CascaderProps,
} from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import { CheckboxGroupProps } from 'antd/lib/checkbox';
import {
  ComstomInput,
  ComstomInputNumber,
  ComstomRadioGroup,
  ComstomSelect,
  ComstomDatePicker,
  ComstomCheckboxGroup,
  ComstomTextArea,
  ComstomUploada,
  ComstomTable,
  ComstomTreeSelect,
  ComstomCascader,
} from './Basic';

export type ListArrType =
  | (FormItemProps & { childrenArr?: ListArrType[] } & {
      basetype: 'Input';
      baseitem: InputProps;
    })
  | (FormItemProps & { childrenArr?: ListArrType[] } & {
      basetype: 'InputNumber';
      baseitem: InputNumberProps;
    })
  | (FormItemProps & { childrenArr?: ListArrType[] } & {
      basetype: 'Select';
      baseitem: SelectProps;
    })
  | (FormItemProps & { childrenArr?: ListArrType[] } & {
      basetype: 'RadioGroup';
      baseitem: RadioGroupProps;
    })
  | (FormItemProps & { childrenArr?: ListArrType[] } & {
      basetype: 'CheckBox';
      baseitem: CheckboxProps;
    })
  | (FormItemProps & { childrenArr?: ListArrType[] } & {
      basetype: 'DatePicker';
      baseitem: DatePickerProps;
    })
  | (FormItemProps & { childrenArr?: ListArrType[] } & {
      basetype: 'ComstomCheckboxGroup';
      baseitem: CheckboxGroupProps;
    })
  | (FormItemProps & { childrenArr?: ListArrType[] } & {
      basetype: 'TextArea';
      baseitem: TextAreaProps;
    })
  | (FormItemProps & { childrenArr?: ListArrType[] } & {
      basetype: 'Upload';
      baseitem: UploadProps & { children?: ReactNode };
    })
  | (FormItemProps & { childrenArr?: ListArrType[] } & {
      basetype: 'Table';
      baseitem: TableProps<any> & { children?: ReactNode };
    })
  | (FormItemProps & { childrenArr?: ListArrType[] } & {
      basetype: 'TreeSelect';
      baseitem: TreeSelectProps & { children?: ReactNode };
    })
  | (FormItemProps & { childrenArr?: ListArrType[] } & {
      basetype: 'Cascader';
      baseitem: CascaderProps<
        | { dictValue: string; dictLabel: string }
        | {
            label: string;
            value: string;
            children?: { label: string; value: string }[];
          }
      > & {
        children?: ReactNode;
      };
    });

interface ComstomFromProps {
  form: FormInstance;
  layout?: 'vertical' | 'horizontal' | 'inline' | undefined;
  style?: CSSProperties;
  fromClassName?: string;
  changeDataValue?: (value: { [x: string]: any }) => void;
  dataValue?: { [x: string]: any };
  tableData?: { [x: string]: any };
  listArr: ListArrType[];
}
/**
 * ComstomFrom
 * 集合成需要的表单
 * @params form：formInstance
 * @params layout 布局方向
 * @params style 表单控制的样式
 * @
 * ***/
const ComstomFrom: FC<ComstomFromProps> = ({
  form,
  layout = 'vertical',
  style,
  fromClassName,
  listArr,
  children,
  ...props
}) => {
  const returnBase = (item: ListArrType) => {
    if (item.childrenArr) {
      const { childrenArr } = item;
      return returnListArr(childrenArr);
    }
    if (item.basetype === 'Input') {
      const { baseitem } = item;
      return <ComstomInput {...baseitem} />;
    }
    if (item.basetype === 'InputNumber') {
      const { baseitem } = item;
      return <ComstomInputNumber {...baseitem} />;
    }
    if (item.basetype === 'Select') {
      const { baseitem } = item;
      return <ComstomSelect {...baseitem} />;
    }
    if (item.basetype === 'TreeSelect') {
      const { baseitem } = item;
      return <ComstomTreeSelect {...baseitem} />;
    }
    if (item.basetype === 'RadioGroup') {
      const { baseitem } = item;
      return <ComstomRadioGroup {...baseitem} />;
    }
    if (item.basetype === 'ComstomCheckboxGroup') {
      const { baseitem } = item;
      return <ComstomCheckboxGroup {...baseitem} />;
    }
    if (item.basetype === 'DatePicker') {
      const { baseitem } = item;
      return <ComstomDatePicker {...baseitem} />;
    }
    if (item.basetype === 'TextArea') {
      const { baseitem } = item;
      return <ComstomTextArea {...baseitem} />;
    }
    if (item.basetype === 'Upload') {
      const { baseitem } = item;
      return <ComstomUploada {...baseitem} />;
    }
    if (item.basetype === 'Table') {
      const { baseitem, children } = item;
      return (
        <>
          <ComstomTable {...baseitem} />
          {children}
        </>
      );
    }
    if (item.basetype === 'Cascader') {
      const { baseitem } = item;
      return <ComstomCascader {...baseitem} />;
    }

    return I18N.carbonDataManagemen.yourGenuineLeather;
  };
  const returnFromList = (item: ListArrType, index: number) =>
    item.basetype === 'Table' ? (
      returnBase(item)
    ) : (
      <Form.Item key={index} {...item}>
        {returnBase(item)}
      </Form.Item>
    );
  const returnListArr = (arr: ListArrType[]) =>
    arr.map((item, index) => returnFromList(item, index));
  return (
    <Form
      className={fromClassName}
      form={form}
      layout={layout}
      style={style}
      {...props}
    >
      {returnListArr(listArr)}
    </Form>
  );
};

export default ComstomFrom;
