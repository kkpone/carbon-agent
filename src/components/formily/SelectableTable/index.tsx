/**
 * @description formily 可选择的table
 */
import { connect, mapProps } from '@formily/react';
import { Table, TableProps } from 'antd';
import { FC, Key, useState } from 'react';

type SelectableTableProps = TableProps<Record<string, any>> & {
  /** 选中的行key数组 默认用id作key */
  value: Key[];
  onChange: (value: Key[]) => void;
  /** 阅读态拿不到dataSource 详情用disabled解决 */
  disabled: boolean;
};

const SelectableTable: FC<SelectableTableProps> = props => {
  const { value, onChange, rowSelection, disabled } = props;

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [preValue, setPreValue] = useState(value);
  if (value !== preValue) {
    setPreValue(value);
    setSelectedRowKeys(value);
  }

  const handleRowSelection = (selectedKeys: Key[]) => {
    onChange(selectedKeys);
    setSelectedRowKeys(selectedKeys);
  };

  return (
    <Table
      rowKey='id'
      {...props}
      onChange={() => {}}
      rowSelection={{
        type: 'checkbox',
        ...rowSelection,
        selectedRowKeys,
        onChange: handleRowSelection,
        getCheckboxProps: () => ({
          disabled,
        }),
      }}
    />
  );
};

export const FormilySelectableTable = connect(
  SelectableTable,
  mapProps({ dataSource: true }, props => ({
    ...props,
  })),
);
