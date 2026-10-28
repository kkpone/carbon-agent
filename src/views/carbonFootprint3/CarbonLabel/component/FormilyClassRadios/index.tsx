/**
 * 碳标签 - 碳排放类别
 */
import { connect, mapProps } from '@formily/react';
import { Checkbox } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import type { ReactNode } from 'react';

type DataSourceItem = {
  code?: CheckboxValueType;
  disabled?: boolean;
  label?: ReactNode;
  name?: ReactNode;
  value?: CheckboxValueType;
};

type Props = {
  value: string[];
  dataSource?: DataSourceItem[];
  readPretty?: boolean;
  onChange: (val: CheckboxValueType[]) => void;
};
const FormilyClassRadios = ({
  value,
  dataSource,
  readPretty,
  onChange,
}: Props) => {
  const changeValue = (val: CheckboxValueType[]) => {
    if (val.length <= 3) {
      onChange(val);
    }
  };
  const options = (Array.isArray(dataSource) ? dataSource : []).flatMap(
    item => {
      const label = item.label ?? item.name;
      const optionValue = item.value ?? item.code;
      return label != null && optionValue != null
        ? [{ ...item, label, value: optionValue }]
        : [];
    },
  );

  return (
    <Checkbox.Group
      disabled={readPretty}
      options={options}
      value={value}
      onChange={changeValue}
    />
  );
};

export default connect(
  FormilyClassRadios,
  mapProps(
    {
      value: true,
      disabled: true,
      readPretty: true,
      dataSource: true,
    },
    props => ({
      ...props,
    }),
  ),
);
