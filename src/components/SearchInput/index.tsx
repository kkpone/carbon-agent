import type { SelectProps } from 'antd';
import { AutoComplete } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import { throttle } from 'lodash-es';
import React, { useState } from 'react';

export interface SearchInputProps extends SelectProps<string> {
  placeholder: string;
  onChange: (value: string) => void;
  handleSelect?: (value?: DefaultOptionType) => void;
  style: React.CSSProperties;
  fetch: (value: string, callback: (data: any[]) => void) => void;
}

export const SearchInput: React.FC<SearchInputProps> = props => {
  const { fetch, onChange, value, handleSelect } = props;
  const [data, setData] = useState<SelectProps['options']>([]);

  const handleSearch = throttle((newValue: string) => {
    if (newValue) {
      fetch(newValue, setData);
    } else {
      setData([]);
    }
  }, 500);

  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <AutoComplete
      value={value}
      allowClear
      placeholder={props.placeholder}
      aria-placeholder={props.placeholder}
      style={props.style}
      onSelect={e => {
        if (data?.find(d => d.value === e)) {
          handleSelect?.(data?.find(d => d.value === e));
        }
      }}
      onSearch={e => handleSearch(e)}
      onChange={handleChange}
      options={(data || []).map(d => ({
        value: d.value,
        label: d.text,
      }))}
    />
  );
};
